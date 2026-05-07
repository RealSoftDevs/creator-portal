// app/studio/components/AddProductModal.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Globe, Edit2, Check, ExternalLink, RefreshCw, Image as ImageIcon, Link as LinkIcon, Camera, Download, Shield } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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

export default function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ image: string; details: string }>({ image: 'pending', details: 'pending' });
  const [editMode, setEditMode] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSourceType>('auto');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showManualImageInput, setShowManualImageInput] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Proxy services
  const proxyServices = [
    { name: 'All Origins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'CORS Proxy', url: 'https://cors-anywhere.herokuapp.com/' },
  ];

  // Main fetch function - tries everything automatically
  const fetchEverything = useCallback(async (url: string) => {
    setIsFetching(true);
    setFetchStatus({ image: 'fetching', details: 'fetching' });

    let result = { title: '', description: '', price: '', imageUrl: '' };

    // Try multiple methods in parallel
    const fetchPromises = [
      fetchViaApi(url),
      fetchViaProxy(url),
    ];

    const results = await Promise.allSettled(fetchPromises);

    // Combine results from all methods
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

    // Update state with fetched data
    if (result.title && !title) setTitle(result.title);
    if (result.description && !description) setDescription(result.description);
    if (result.price && !price) setPrice(result.price);
    if (result.imageUrl && !imageUrl) {
      setImageUrl(result.imageUrl);
      setFetchStatus(prev => ({ ...prev, image: 'success' }));
    } else if (!result.imageUrl) {
      setFetchStatus(prev => ({ ...prev, image: 'failed' }));
    }

    setFetchStatus(prev => ({ ...prev, details: result.title ? 'success' : 'failed' }));
    setIsFetching(false);
  }, [title, description, price, imageUrl]);

  // Method 1: Fetch via your API
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

  // Method 2: Fetch via proxy (for images and data)
  const fetchViaProxy = async (url: string): Promise<Partial<ProductPreview>> => {
    for (const proxy of proxyServices) {
      try {
        const proxyUrl = `${proxy.url}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (response.ok) {
          const html = await response.text();

          // Extract title
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

          // Extract description
          let description = '';
          const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
          if (descMatch) {
            description = descMatch[1];
            if (description.length > 500) description = description.substring(0, 497) + '...';
          }

          // Extract image URL
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

          // Extract price
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

  // Auto-fetch when link is pasted (debounced)
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

  // Handle file upload
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
    await onSave({ title, description, imageUrl, buyLink, price, platform });
    setLoading(false);
    onClose();
  };

  const retryFetch = () => {
    if (buyLink) {
      fetchEverything(buyLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
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
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Paste any product link. Title, description, price, and image will be auto-fetched.
            </p>
          </div>

          {/* Fetching Status */}
          {isFetching && (
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">Fetching product information...</span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-blue-500">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${fetchStatus.details === 'fetching' ? 'bg-blue-500 animate-pulse' : fetchStatus.details === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Product details (title, description, price)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${fetchStatus.image === 'fetching' ? 'bg-blue-500 animate-pulse' : fetchStatus.image === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Product image (trying multiple methods)</span>
                </div>
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

          {/* Product Details Section */}
          {(title || description || price) && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <span className="text-xs font-medium text-gray-600">Product Details</span>
              </div>
              <div className="p-3 space-y-3">
                {/* Title */}
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

                {/* Description */}
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

                {/* Price & Platform */}
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
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="amazon">Amazon</option>
                      <option value="myntra">Myntra</option>
                      <option value="flipkart">Flipkart</option>
                      <option value="etsy">Etsy</option>
                      <option value="custom">Other</option>
                    </select>
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
              {/* Auto-fetched image or uploaded image */}
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
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {imageSource === 'auto' ? '✓ Auto-fetched' : imageSource === 'upload' ? '✓ Uploaded' : '✓ Manual entry'}
                  </p>
                </div>
              ) : isFetching && fetchStatus.image === 'fetching' ? (
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Fetching image...</p>
                  <p className="text-xs text-gray-400 mt-1">Trying multiple methods</p>
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
              ) : !imageUrl && fetchStatus.image === 'failed' ? (
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No image fetched</p>
                  <button
                    type="button"
                    onClick={() => setShowManualImageInput(true)}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                  >
                    Add image manually
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Final Preview (only if all fields filled) */}
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
                  <a
                    href={buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View on {platform} <ExternalLink className="w-3 h-3" />
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
    </div>
  );
}