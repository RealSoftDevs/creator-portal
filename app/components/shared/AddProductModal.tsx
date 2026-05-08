// app/components/shared/AddProductModal.tsx - Fix TypeScript error
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Tag, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PRODUCT_CATEGORIES, detectCategoryFromUrl, getCategoryById } from '@/lib/categories';

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: any) => Promise<boolean>;
}

type FetchStep = 'idle' | 'title' | 'description' | 'image' | 'price' | 'complete';

// Platform detection function
const detectPlatformFromUrl = (url: string): string => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('amazon') || urlLower.includes('amzn')) return 'amazon';
  if (urlLower.includes('myntra')) return 'myntra';
  if (urlLower.includes('flipkart')) return 'flipkart';
  if (urlLower.includes('etsy')) return 'etsy';
  if (urlLower.includes('shopify')) return 'shopify';
  if (urlLower.includes('walmart')) return 'walmart';
  if (urlLower.includes('bestbuy')) return 'bestbuy';
  if (urlLower.includes('target')) return 'target';
  if (urlLower.includes('aliexpress')) return 'aliexpress';
  if (urlLower.includes('ebay')) return 'ebay';
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
  const [fetchStep, setFetchStep] = useState<FetchStep>('idle');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showManualImageInput, setShowManualImageInput] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const proxyServices = [
    { name: 'All Origins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'CORS Proxy', url: 'https://cors-anywhere.herokuapp.com/' },
  ];

  const fetchEverything = useCallback(async (url: string) => {
    if (!url || !url.startsWith('http')) return;

    setIsFetching(true);
    setFetchError(null);
    setFetchStep('title');

    const detectedPlatformFromUrl = detectPlatformFromUrl(url);
    if (detectedPlatformFromUrl !== 'custom') {
      setPlatform(detectedPlatformFromUrl);
      setDetectedPlatform(detectedPlatformFromUrl);
    }

    let fetchedTitle = '';
    let fetchedDescription = '';
    let fetchedPrice = '';
    let fetchedImageUrl = '';

    try {
      const apiRes = await fetch(`/api/product-preview?url=${encodeURIComponent(url)}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        fetchedTitle = apiData.title || '';
        fetchedDescription = apiData.description || '';
        fetchedPrice = apiData.price || '';
        fetchedImageUrl = apiData.imageUrl || '';
      }

      if (!fetchedImageUrl) {
        setFetchStep('image');
        for (const proxy of proxyServices) {
          try {
            const proxyUrl = `${proxy.url}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
              const html = await response.text();

              if (!fetchedTitle) {
                setFetchStep('title');
                const titleMatch = html.match(/<title>([^<]*)<\/title>/);
                if (titleMatch) {
                  fetchedTitle = titleMatch[1]
                    .replace(/ : Amazon\.in.*$/, '')
                    .replace(/ \| Amazon\.in.*$/, '')
                    .replace(/ - Amazon\.in.*$/, '')
                    .trim();
                  if (fetchedTitle.length > 120) fetchedTitle = fetchedTitle.substring(0, 117) + '...';
                }
              }

              if (!fetchedDescription) {
                setFetchStep('description');
                const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
                if (descMatch) {
                  fetchedDescription = descMatch[1];
                  if (fetchedDescription.length > 500) fetchedDescription = fetchedDescription.substring(0, 497) + '...';
                }
                const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
                if (ogDescMatch && !fetchedDescription) fetchedDescription = ogDescMatch[1];
              }

              if (!fetchedImageUrl) {
                setFetchStep('image');
                const imagePatterns = [
                  /"hiRes":"([^"]+)"/, /"large":"([^"]+)"/,
                  /<meta property="og:image" content="([^"]+)"/,
                  /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/,
                  /<img[^>]*class="a-dynamic-image"[^>]*src="([^"]+)"/,
                ];
                for (const pattern of imagePatterns) {
                  const match = html.match(pattern);
                  if (match && match[1] && !fetchedImageUrl) {
                    let imgUrl = match[1].replace(/\\/g, '');
                    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
                    fetchedImageUrl = imgUrl;
                    break;
                  }
                }
              }

              if (!fetchedPrice) {
                setFetchStep('price');
                const pricePatterns = [
                  /"price":\s*"([\d,]+)"/,
                  /<span class="a-price-whole">([^<]+)<\/span>/,
                  /₹([\d,]+)(?:\.\d{2})?/,
                ];
                for (const pattern of pricePatterns) {
                  const match = html.match(pattern);
                  if (match) {
                    fetchedPrice = `₹${match[1].replace(/[^0-9]/g, '')}`;
                    break;
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Proxy ${proxy.name} failed:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError('Failed to fetch product details. Please enter manually.');
    }

    if (fetchedTitle && !title) setTitle(fetchedTitle);
    if (fetchedDescription && !description) setDescription(fetchedDescription);
    if (fetchedPrice && !price) setPrice(fetchedPrice);
    if (fetchedImageUrl && !imageUrl) setImageUrl(fetchedImageUrl);

    setFetchStep('complete');

    if (fetchedTitle || url) {
      const detectedCat = detectCategoryFromUrl(url, fetchedTitle);
      if (detectedCat !== 'misc') {
        setCategory(detectedCat);
        setDetectedCategory(detectedCat);
      }
    }

    setIsFetching(false);
    setTimeout(() => setFetchStep('idle'), 1500);
  }, [title, description, price, imageUrl]);

  useEffect(() => {
    if (!buyLink || !buyLink.startsWith('http')) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchEverything(buyLink), 800);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [buyLink, fetchEverything]);

  useEffect(() => {
    if (title || buyLink) {
      const detected = detectCategoryFromUrl(buyLink, title);
      setDetectedCategory(detected);
      if (category === 'misc' && detected !== 'misc') setCategory(detected);
    }
  }, [title, buyLink]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    const interval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      clearInterval(interval);
      const data = await res.json();
      if (data.success) {
        let finalImageUrl = data.url;
        if (finalImageUrl.startsWith('//')) finalImageUrl = 'https:' + finalImageUrl;
        setImageUrl(finalImageUrl);
        setUploadProgress(100);
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
    setManualImageUrl('');
    setShowManualImageInput(false);
  };

  const retryFetch = () => { if (buyLink) fetchEverything(buyLink); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !buyLink) {
      alert('Please fill all required fields (Title, Image, and Link)');
      return;
    }
    setLoading(true);
    const success = await onSave({ title, description, imageUrl, buyLink, price, platform, category });
    setLoading(false);
    if (success) onClose();
  };

  const getCategoryIcon = (catId: string) => {
    const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
    return cat?.icon || '📦';
  };

  const getCategoryName = (catId: string) => {
    const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
    return cat?.name || 'Miscellaneous';
  };

  const getPlatformDisplayName = (platformId: string) => {
    const platforms: Record<string, string> = {
      amazon: 'Amazon', myntra: 'Myntra', flipkart: 'Flipkart', etsy: 'Etsy',
      shopify: 'Shopify', walmart: 'Walmart', bestbuy: 'Best Buy', target: 'Target',
      aliexpress: 'AliExpress', ebay: 'eBay', custom: 'Other'
    };
    return platforms[platformId] || 'Other';
  };

  const getFetchStepMessage = () => {
    switch (fetchStep) {
      case 'title': return 'Fetching product title...';
      case 'description': return 'Fetching product description...';
      case 'image': return 'Looking for product image...';
      case 'price': return 'Getting price information...';
      case 'complete': return '✓ Complete!';
      default: return 'Fetching product information...';
    }
  };

  const isStepComplete = (step: FetchStep, hasValue: boolean) => {
    if (fetchStep === 'complete') return true;
    if (fetchStep === step) return false;
    return hasValue;
  };

  const CategorySelectionModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowCategorySelect(false)} />
      <div className="relative bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] sm:max-h-[70vh] overflow-hidden">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-white text-lg">Select Category</h3>
          <button onClick={() => setShowCategorySelect(false)} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setShowCategorySelect(false); }}
              className={`w-full p-4 text-left flex items-center gap-3 rounded-xl transition-all ${
                category === cat.id ? 'bg-purple-500/20 border-2 border-purple-500' : 'hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${category === cat.id ? 'text-purple-400' : 'text-white'}`}>{cat.name}</p>
                  {category === cat.id && <Check className="w-5 h-5 text-purple-400" />}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4">
          <button onClick={() => setShowCategorySelect(false)} className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition">Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto relative" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-white">Add Product</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Product Link *</label>
            <div className="flex gap-2">
              <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="https://amazon.in/dp/..." className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white placeholder:text-white/40" required />
              <button type="button" onClick={retryFetch} disabled={isFetching || !buyLink} className="px-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition disabled:opacity-50"><RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} /></button>
            </div>
            <p className="text-xs text-gray-400 mt-1">💡 Paste any product link. Title, description, price, image, platform, and category will be auto-detected.</p>
          </div>

          {isFetching && (
            <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div><span className="text-sm text-purple-300">{getFetchStepMessage()}</span></div>
              <div className="space-y-1 text-xs text-purple-300/70">
                <div className={`flex items-center gap-2 ${isStepComplete('title', !!title) ? 'text-green-400' : fetchStep === 'title' ? 'text-purple-300' : 'text-purple-300/50'}`}><span>{isStepComplete('title', !!title) ? '✓' : fetchStep === 'title' ? '⏳' : '○'}</span><span>Title</span></div>
                <div className={`flex items-center gap-2 ${isStepComplete('description', !!description) ? 'text-green-400' : fetchStep === 'description' ? 'text-purple-300' : 'text-purple-300/50'}`}><span>{isStepComplete('description', !!description) ? '✓' : fetchStep === 'description' ? '⏳' : '○'}</span><span>Description</span></div>
                <div className={`flex items-center gap-2 ${isStepComplete('image', !!imageUrl) ? 'text-green-400' : fetchStep === 'image' ? 'text-purple-300' : 'text-purple-300/50'}`}><span>{isStepComplete('image', !!imageUrl) ? '✓' : fetchStep === 'image' ? '⏳' : '○'}</span><span>Image</span></div>
                <div className={`flex items-center gap-2 ${isStepComplete('price', !!price) ? 'text-green-400' : fetchStep === 'price' ? 'text-purple-300' : 'text-purple-300/50'}`}><span>{isStepComplete('price', !!price) ? '✓' : fetchStep === 'price' ? '⏳' : '○'}</span><span>Price</span></div>
              </div>
            </div>
          )}

          {fetchError && !isFetching && <div className="bg-red-500/20 rounded-xl p-3 border border-red-500/30"><p className="text-sm text-red-400">{fetchError}</p><button type="button" onClick={retryFetch} className="mt-2 text-sm text-red-400 underline">Try again</button></div>}

          {detectedPlatform && detectedPlatform !== 'custom' && !isFetching && (
            <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-500/30">
              <div className="flex items-center gap-2"><span className="text-lg">{detectedPlatform === 'amazon' && '🛒'}{detectedPlatform === 'myntra' && '👗'}{detectedPlatform === 'flipkart' && '📦'}</span><div><p className="text-sm font-medium text-blue-300">Platform Detected: {getPlatformDisplayName(detectedPlatform)}</p><p className="text-xs text-blue-300/70 mt-0.5">Auto-detected from product link</p></div></div>
            </div>
          )}

          {detectedCategory && detectedCategory !== 'misc' && !isFetching && (
            <div className="bg-green-500/20 rounded-xl p-3 border border-green-500/30">
              <div className="flex items-center gap-2"><span className="text-lg">{getCategoryIcon(detectedCategory)}</span><div><p className="text-sm font-medium text-green-300">Category Detected: {getCategoryName(detectedCategory)}</p><p className="text-xs text-green-300/70 mt-0.5">Auto-detected from product link and title</p></div></div>
            </div>
          )}

          <div><label className="block text-sm font-medium text-white/80 mb-1">Platform</label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white"><option value="amazon">Amazon</option><option value="myntra">Myntra</option><option value="flipkart">Flipkart</option><option value="etsy">Etsy</option><option value="shopify">Shopify</option><option value="walmart">Walmart</option><option value="bestbuy">Best Buy</option><option value="target">Target</option><option value="aliexpress">AliExpress</option><option value="ebay">eBay</option><option value="custom">Other</option></select></div>

          <div><label className="block text-sm font-medium text-white/80 mb-1 flex items-center gap-2"><Tag className="w-4 h-4" />Category *</label><button type="button" onClick={() => setShowCategorySelect(true)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-left flex items-center justify-between hover:border-purple-500 transition"><div className="flex items-center gap-2"><span className="text-xl">{getCategoryIcon(category)}</span><span className="text-white">{getCategoryName(category)}</span></div><span className="text-gray-400">▼</span></button></div>

          <div className="border border-white/20 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-3 py-2 border-b border-white/20"><span className="text-xs font-medium text-gray-400">Product Details</span></div>
            <div className="p-3 space-y-3">
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" placeholder="Product title" required /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none" placeholder="Product description" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Price</label><input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" placeholder="₹49,999" /></div>
            </div>
          </div>

          <div className="border border-white/20 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-3 py-2 border-b border-white/20 flex items-center justify-between"><span className="text-xs font-medium text-gray-400">Product Image *</span>{!imageUrl && !isFetching && <button type="button" onClick={() => setShowManualImageInput(!showManualImageInput)} className="text-xs text-purple-400 hover:text-purple-300 transition">{showManualImageInput ? 'Cancel' : 'Add manually'}</button>}</div>
            <div className="p-3">
              {imageUrl ? (
                <div className="relative"><img src={imageUrl} alt={title || 'Product'} className="w-full h-40 object-cover rounded-lg border border-white/20" onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+Image'; }} /><button type="button" onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"><X className="w-4 h-4" /></button></div>
              ) : showManualImageInput ? (
                <div className="space-y-2"><div className="flex gap-2"><input type="url" value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" /><button type="button" onClick={handleManualImageUrl} disabled={!manualImageUrl} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50">Add</button></div><div {...getRootProps()} className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer transition hover:border-purple-500"><input {...getInputProps()} /><Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" /><p className="text-xs text-gray-400">Or drag & drop an image file</p></div></div>
              ) : (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500'}`}><input {...getInputProps()} /><Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-400">Click or drag to upload</p><p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>{uploadProgress > 0 && uploadProgress < 100 && <div className="mt-3 w-full bg-white/10 rounded-full h-1"><div className="bg-purple-500 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}</div>
              )}
            </div>
          </div>

          {title && imageUrl && buyLink && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/20"><p className="text-xs font-medium text-gray-400 mb-2">Final Preview:</p><div className="flex items-center gap-3"><img src={imageUrl} alt={title} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white line-clamp-1">{title}</p>{price && <p className="text-xs text-green-400">{price}</p>}{description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{description}</p>}<div className="flex items-center gap-2 mt-1"><span className="text-xs text-gray-400">Platform: {getPlatformDisplayName(platform)}</span><span className="text-xs text-gray-600">•</span><div className="flex items-center gap-1"><span className="text-xs">{getCategoryIcon(category)}</span><span className="text-xs text-gray-400">{getCategoryName(category)}</span></div></div></div></div></div>
          )}

          <button type="submit" disabled={loading || !title || !imageUrl || !buyLink} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Adding Product...' : 'Add Product'}</button>
        </form>
      </div>
      {showCategorySelect && <CategorySelectionModal />}
    </div>
  );
}