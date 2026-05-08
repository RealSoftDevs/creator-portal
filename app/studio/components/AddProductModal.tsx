// app/studio/components/AddProductModal.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Tag, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PRODUCT_CATEGORIES, detectCategoryFromUrl, getCategoryById } from '@/lib/categories';

interface ProductPreview {
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  platform: string;
  url: string;
}

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: any) => void;
}

type ImageSourceType = 'upload' | 'url' | 'auto';

// Platform detection function
const detectPlatformFromUrl = (url: string): string => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('amazon') || urlLower.includes('amzn')) {
    return 'amazon';
  }
  if (urlLower.includes('myntra')) {
    return 'myntra';
  }
  if (urlLower.includes('flipkart')) {
    return 'flipkart';
  }
  if (urlLower.includes('etsy')) {
    return 'etsy';
  }
  if (urlLower.includes('shopify')) {
    return 'shopify';
  }
  if (urlLower.includes('walmart')) {
    return 'walmart';
  }
  if (urlLower.includes('bestbuy')) {
    return 'bestbuy';
  }
  if (urlLower.includes('target')) {
    return 'target';
  }
  if (urlLower.includes('aliexpress')) {
    return 'aliexpress';
  }
  if (urlLower.includes('ebay')) {
    return 'ebay';
  }

  return 'custom';
};

export default function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState('custom');
  const [category, setCategory] = useState('misc');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ image: string; details: string }>({ image: 'pending', details: 'pending' });
  const [editMode, setEditMode] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSourceType>('auto');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showManualImageInput, setShowManualImageInput] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Proxy services
  const proxyServices = [
    { name: 'All Origins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'CORS Proxy', url: 'https://cors-anywhere.herokuapp.com/' },
  ];

  // Main fetch function
  const fetchEverything = useCallback(async (url: string) => {
    setIsFetching(true);
    setFetchStatus({ image: 'fetching', details: 'fetching' });

    // Auto-detect platform from URL
    const detectedPlatformFromUrl = detectPlatformFromUrl(url);
    if (detectedPlatformFromUrl !== 'custom') {
      setPlatform(detectedPlatformFromUrl);
      setDetectedPlatform(detectedPlatformFromUrl);
    }

    let result = { title: '', description: '', price: '', imageUrl: '' };

    const fetchPromises = [
      fetchViaApi(url),
      fetchViaProxy(url),
    ];

    const results = await Promise.allSettled(fetchPromises);

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        result = {
          title: result.title || (res.value.title || ''),
          description: result.description || (res.value.description || ''),
          price: result.price || (res.value.price || ''),
          imageUrl: result.imageUrl || (res.value.imageUrl || ''),
        };
      }
    }

    if (result.title && !title) setTitle(result.title);
    if (result.description && !description) setDescription(result.description);
    if (result.price && !price) setPrice(result.price);
    if (result.imageUrl && !imageUrl) {
      setImageUrl(result.imageUrl);
      setFetchStatus(prev => ({ ...prev, image: 'success' }));
    } else if (!result.imageUrl) {
      setFetchStatus(prev => ({ ...prev, image: 'failed' }));
    }

    // Auto-detect category
    const detectedCat = detectCategoryFromUrl(url, result.title);
    if (detectedCat !== 'misc') {
      setCategory(detectedCat);
      setDetectedCategory(detectedCat);
    }

    setFetchStatus(prev => ({ ...prev, details: result.title ? 'success' : 'failed' }));
    setIsFetching(false);
  }, [title, description, price, imageUrl]);

  const fetchViaApi = async (url: string): Promise<Partial<ProductPreview>> => {
    try {
      const res = await fetch(`/api/product-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return {
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        imageUrl: data.imageUrl || '',
      };
    } catch (error) {
      console.error('API fetch error:', error);
      return {};
    }
  };

  const fetchViaProxy = async (url: string): Promise<Partial<ProductPreview>> => {
    for (const proxy of proxyServices) {
      try {
        const proxyUrl = `${proxy.url}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (response.ok) {
          const html = await response.text();

          let title = '';
          const titleMatch = html.match(/<title>([^<]*)<\/title>/);
          if (titleMatch) {
            title = titleMatch[1]
              .replace(/ : Amazon\.in.*$/, '')
              .replace(/ \| Amazon\.in.*$/, '')
              .replace(/ - Amazon\.in.*$/, '')
              .trim();
            if (title.length > 120) title = title.substring(0, 117) + '...';
          }

          let description = '';
          const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
          if (descMatch) {
            description = descMatch[1];
            if (description.length > 500) description = description.substring(0, 497) + '...';
          }

          let imageUrl = '';
          const imagePatterns = [
            /"hiRes":"([^"]+)"/,
            /"large":"([^"]+)"/,
            /<meta property="og:image" content="([^"]+)"/,
            /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/,
          ];

          for (const pattern of imagePatterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
              imageUrl = match[1].replace(/\\/g, '');
              if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
              break;
            }
          }

          let price = '';
          const priceMatch = html.match(/<span class="a-price-whole">([^<]+)<\/span>/);
          if (priceMatch) {
            price = `₹${priceMatch[1].replace(/[^0-9]/g, '')}`;
          }

          if (title || description || imageUrl || price) {
            return { title, description, imageUrl, price };
          }
        }
      } catch (error) {
        console.error(`Proxy ${proxy.name} failed:`, error);
      }
    }
    return {};
  };

  useEffect(() => {
    if (!buyLink || !buyLink.startsWith('http')) {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchEverything(buyLink);
    }, 800);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [buyLink, fetchEverything]);

  useEffect(() => {
    if (title || buyLink) {
      const detected = detectCategoryFromUrl(buyLink, title);
      setDetectedCategory(detected);
      if (category === 'misc' && detected !== 'misc') {
        setCategory(detected);
      }
    }
  }, [title, buyLink]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success) {
        let finalImageUrl = data.url;
        if (finalImageUrl.startsWith('//')) finalImageUrl = 'https:' + finalImageUrl;
        setImageUrl(finalImageUrl);
        setUploadProgress(100);
        setImageSource('upload');
        setShowManualImageInput(false);
      } else {
        alert(data.error || 'Upload failed');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
      setUploadProgress(0);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleManualImageUrl = () => {
    if (!manualImageUrl) return;
    setImageUrl(manualImageUrl);
    setImageSource('url');
    setManualImageUrl('');
    setShowManualImageInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !buyLink) {
      alert('Please fill all required fields (Title, Image, and Link)');
      return;
    }

    setLoading(true);
    await onSave({ title, description, imageUrl, buyLink, price, platform, category });
    setLoading(false);
    onClose();
  };

  const retryFetch = () => {
    if (buyLink) {
      fetchEverything(buyLink);
    }
  };

  const getCategoryIcon = (catId: string) => {
    const cat = getCategoryById(catId);
    return cat?.icon || '📦';
  };

  const getCategoryName = (catId: string) => {
    const cat = getCategoryById(catId);
    return cat?.name || 'Miscellaneous';
  };

  const getPlatformDisplayName = (platformId: string) => {
    const platforms: Record<string, string> = {
      amazon: 'Amazon',
      myntra: 'Myntra',
      flipkart: 'Flipkart',
      etsy: 'Etsy',
      shopify: 'Shopify',
      walmart: 'Walmart',
      bestbuy: 'Best Buy',
      target: 'Target',
      aliexpress: 'AliExpress',
      ebay: 'eBay',
      custom: 'Other'
    };
    return platforms[platformId] || 'Other';
  };

  // Category Selection Modal
  const CategorySelectionModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowCategorySelect(false)}
      />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] sm:max-h-[70vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Select Category</h3>
          <button
            onClick={() => setShowCategorySelect(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setShowCategorySelect(false);
              }}
              className={`
                w-full p-4 text-left flex items-center gap-3 rounded-xl transition-all
                ${category === cat.id
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
                }
              `}
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${category === cat.id ? 'text-purple-700' : 'text-gray-900'}`}>
                    {cat.name}
                  </p>
                  {category === cat.id && <Check className="w-5 h-5 text-purple-600" />}
                </div>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {cat.subcategories.slice(0, 4).map(sub => sub.name).join(' • ')}
                    {cat.subcategories.length > 4 && ` +${cat.subcategories.length - 4}`}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={() => setShowCategorySelect(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto relative">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold">Add Product</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Link Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Link *</label>
            <input
              type="url"
              value={buyLink}
              onChange={(e) => {
                setBuyLink(e.target.value);
                setEditMode(true);
              }}
              placeholder="https://amazon.in/dp/... or https://amzn.to/..."
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none text-sm"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Paste any product link. Title, description, price, image, platform, and category will be auto-detected.
            </p>
          </div>

          {/* Fetching Status */}
          {isFetching && (
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-blue-600">Fetching product information...</span>
              </div>
            </div>
          )}

          {/* Retry button if fetching failed */}
          {!isFetching && buyLink && !title && !imageUrl && (
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-sm text-yellow-700 mb-2">Could not fetch product info automatically</p>
              <button
                type="button"
                onClick={retryFetch}
                className="text-sm text-yellow-700 underline hover:text-yellow-800"
              >
                Try again
              </button>
            </div>
          )}

          {/* Detected Platform Info */}
          {detectedPlatform && detectedPlatform !== 'custom' && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {detectedPlatform === 'amazon' && '🛒'}
                  {detectedPlatform === 'myntra' && '👗'}
                  {detectedPlatform === 'flipkart' && '📦'}
                  {detectedPlatform === 'etsy' && '🎨'}
                </span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Platform Detected: {getPlatformDisplayName(detectedPlatform)}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Auto-detected from product link
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detected Category Info */}
          {detectedCategory && detectedCategory !== 'misc' && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(detectedCategory)}</span>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Category Detected: {getCategoryName(detectedCategory)}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Auto-detected from product link and title
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
            >
              <option value="amazon">Amazon</option>
              <option value="myntra">Myntra</option>
              <option value="flipkart">Flipkart</option>
              <option value="etsy">Etsy</option>
              <option value="shopify">Shopify</option>
              <option value="walmart">Walmart</option>
              <option value="bestbuy">Best Buy</option>
              <option value="target">Target</option>
              <option value="aliexpress">AliExpress</option>
              <option value="ebay">eBay</option>
              <option value="custom">Other</option>
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category *
            </label>

            <button
              type="button"
              onClick={() => setShowCategorySelect(true)}
              className="w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between hover:border-gray-400 transition bg-white"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <span className="text-sm">{getCategoryName(category)}</span>
              </div>
              <span className="text-gray-400">▼</span>
            </button>

            <p className="text-xs text-gray-400 mt-1">
              Select the appropriate category for better organization
            </p>
          </div>

          {/* Product Details Section */}
          {(title || description || price) && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <span className="text-xs font-medium text-gray-600">Product Details</span>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    placeholder="Product title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none"
                    placeholder="Product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                      placeholder="₹49,999"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Image Section */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Product Image *</span>
              {!imageUrl && !isFetching && (
                <button
                  type="button"
                  onClick={() => setShowManualImageInput(!showManualImageInput)}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {showManualImageInput ? 'Cancel' : 'Add manually'}
                </button>
              )}
            </div>
            <div className="p-3">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={title || 'Product'}
                    className="w-full h-40 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : showManualImageInput ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleManualImageUrl}
                      disabled={!manualImageUrl}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition hover:border-gray-400"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Or drag & drop an image file</p>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition hover:border-gray-400"
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Final Preview */}
          {title && imageUrl && buyLink && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Final Preview:</p>
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{title}</p>
                  {price && <p className="text-xs text-green-600">{price}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Platform: {getPlatformDisplayName(platform)}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getCategoryIcon(category)}</span>
                      <span className="text-xs text-gray-500">{getCategoryName(category)}</span>
                    </div>
                  </div>
                  <a
                    href={buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                  >
                    View Product <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title || !imageUrl || !buyLink}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Category Selection Modal */}
      {showCategorySelect && <CategorySelectionModal />}
    </div>
  );
}