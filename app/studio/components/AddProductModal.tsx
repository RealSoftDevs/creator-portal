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

type ImageSourceType = 'upload' | 'url' | 'fetch' | 'proxy';

export default function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ProductPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [imageSource, setImageSource] = useState<ImageSourceType>('upload');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState('');
  const [proxyAttempts, setProxyAttempts] = useState<string[]>([]);

  const [originalFetchedData, setOriginalFetchedData] = useState<ProductPreview | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Proxy services to try (free CORS proxies)
  const proxyServices = [
    { name: 'All Origins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'CORS Proxy', url: 'https://cors-anywhere.herokuapp.com/' },
    { name: 'Proxy.sh', url: 'https://proxy.sh/api/fetch?url=' },
  ];

  // Debounced URL fetching for product info (title, description, price only)
  useEffect(() => {
    if (!buyLink || !buyLink.startsWith('http')) {
      setShowPreview(false);
      setPreviewData(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchProductPreview();
    }, 800);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [buyLink]);

  const fetchProductPreview = async () => {
    if (!buyLink || !buyLink.startsWith('http')) return;

    setFetchingPreview(true);
    setFetchError('');

    try {
      const res = await fetch(`/api/product-preview?url=${encodeURIComponent(buyLink)}`);
      const data = await res.json();

      if (data.error) {
        setFetchError(data.error);
      } else {
        setOriginalFetchedData(data);
        setPreviewData(data);
        setPlatform(data.platform || 'custom');

        if (!editMode) {
          if (data.title && !title) setTitle(data.title);
          if (data.price && !price) setPrice(data.price);
          if (data.description && !description) setDescription(data.description);
        }
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Preview fetch error:', error);
      setFetchError('Could not fetch product info. You can manually enter details below.');
    } finally {
      setFetchingPreview(false);
    }
  };

  // Handle file upload from device
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);
    setImageLoadError('');

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

  // Handle manual image URL
  const handleManualImageUrl = () => {
    if (!manualImageUrl) return;

    setIsImageLoading(true);
    setImageLoadError('');

    const img = new Image();
    img.onload = () => {
      setImageUrl(manualImageUrl);
      setImageSource('url');
      setIsImageLoading(false);
      setManualImageUrl('');
    };
    img.onerror = () => {
      setImageLoadError('Invalid image URL. Please check the link or try uploading a file.');
      setIsImageLoading(false);
    };
    img.src = manualImageUrl;
  };

  // Fetch image through proxy services
  const fetchImageViaProxy = async (imageUrl: string, proxyIndex: number = 0): Promise<string | null> => {
    if (proxyIndex >= proxyServices.length) return null;

    const proxy = proxyServices[proxyIndex];
    setProxyAttempts(prev => [...prev, `${proxy.name}...`]);

    try {
      const proxyUrl = `${proxy.url}${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
      }
    } catch (error) {
      console.error(`Proxy ${proxy.name} failed:`, error);
    }

    // Try next proxy
    return fetchImageViaProxy(imageUrl, proxyIndex + 1);
  };

  // Fetch image from product link with multiple methods
  const fetchImageFromLink = async () => {
    if (!buyLink) {
      alert('Please enter a product link first');
      return;
    }

    setIsImageLoading(true);
    setImageLoadError('');
    setProxyAttempts([]);

    try {
      // Method 1: Try to get image from product page API
      const res = await fetch(`/api/product-preview?url=${encodeURIComponent(buyLink)}`);
      const data = await res.json();

      if (data.imageUrl && data.imageUrl !== '') {
        // Test if image loads directly
        const testImg = new Image();
        testImg.onload = () => {
          setImageUrl(data.imageUrl);
          setImageSource('fetch');
          setIsImageLoading(false);
        };
        testImg.onerror = async () => {
          // Method 2: Try through proxy if direct fails
          console.log('Direct image failed, trying proxies...');
          const proxiedImage = await fetchImageViaProxy(data.imageUrl, 0);
          if (proxiedImage) {
            setImageUrl(proxiedImage);
            setImageSource('proxy');
            setIsImageLoading(false);
          } else {
            setImageLoadError('Could not fetch image. Please upload manually or paste image URL.');
            setIsImageLoading(false);
          }
        };
        testImg.src = data.imageUrl;
      } else {
        setImageLoadError('No image found on product page. You can upload manually or paste image URL.');
        setIsImageLoading(false);
      }
    } catch (error) {
      console.error('Image fetch error:', error);
      setImageLoadError('Failed to fetch image. Please upload manually or paste image URL.');
      setIsImageLoading(false);
    }
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

  const handleUsePreviewData = () => {
    if (originalFetchedData) {
      setTitle(originalFetchedData.title);
      setPrice(originalFetchedData.price || '');
      if (originalFetchedData.description) setDescription(originalFetchedData.description);
      setEditMode(true);
    }
  };

  const handleResetToFetchedData = () => {
    if (originalFetchedData) {
      setTitle(originalFetchedData.title);
      setPrice(originalFetchedData.price || '');
      if (originalFetchedData.description) setDescription(originalFetchedData.description);
      setPlatform(originalFetchedData.platform || 'custom');
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
            <div className="flex gap-2">
              <input
                type="url"
                value={buyLink}
                onChange={(e) => {
                  setBuyLink(e.target.value);
                  setEditMode(false);
                  setShowPreview(false);
                }}
                placeholder="https://amazon.in/dp/... or https://amzn.to/..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                required
              />
              <button
                type="button"
                onClick={fetchProductPreview}
                disabled={fetchingPreview || !buyLink}
                className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
              >
                {fetchingPreview ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              </button>
            </div>
            {fetchError && <p className="text-xs text-red-500 mt-1">{fetchError}</p>}
            <p className="text-xs text-gray-400 mt-1">
              💡 Paste any product link. Title and description will be auto-filled if possible.
            </p>
          </div>

          {/* Product Preview Card */}
          {showPreview && previewData && !editMode && (
            <div className="border rounded-xl overflow-hidden bg-gray-50">
              <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Preview from {previewData.platform || 'web'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUsePreviewData}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Use this
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-2">{previewData.title}</p>
                {previewData.price && <p className="text-sm text-green-600 mt-1">{previewData.price}</p>}
                <p className="text-xs text-gray-500 mt-1 line-clamp-3">{previewData.description}</p>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {(editMode || !showPreview) && (
            <div className="space-y-4">
              {editMode && originalFetchedData && (
                <button
                  type="button"
                  onClick={handleResetToFetchedData}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to fetched data
                </button>
              )}

              {/* Product Details */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description"
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="$49.99"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="myntra">Myntra</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="etsy">Etsy</option>
                    <option value="custom">Other</option>
                  </select>
                </div>
              </div>

              {/* Image Source Options */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Image *</label>

                {/* Image source tabs */}
                <div className="flex gap-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageSource('upload')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      imageSource === 'upload' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSource('url')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      imageSource === 'url' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3 inline mr-1" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSource('fetch')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      imageSource === 'fetch' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Camera className="w-3 h-3 inline mr-1" /> Fetch
                  </button>
                </div>

                {/* Upload from device */}
                {imageSource === 'upload' && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                )}

                {/* Paste image URL */}
                {imageSource === 'url' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleManualImageUrl}
                        disabled={isImageLoading || !manualImageUrl}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        {isImageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                      </button>
                    </div>
                    {imageLoadError && <p className="text-xs text-red-500">{imageLoadError}</p>}
                    <p className="text-xs text-gray-400">
                      💡 Tip: Right-click on any image and select "Copy image URL"
                    </p>
                  </div>
                )}

                {/* Fetch from product link with proxy support */}
                {imageSource === 'fetch' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={fetchImageFromLink}
                      disabled={isImageLoading || !buyLink}
                      className="w-full py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isImageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      {isImageLoading ? 'Fetching via proxies...' : 'Fetch Image from Product Link'}
                    </button>

                    {/* Show proxy attempts */}
                    {proxyAttempts.length > 0 && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium">Trying proxies:</p>
                        {proxyAttempts.map((attempt, i) => (
                          <p key={i} className="ml-2">• {attempt}</p>
                        ))}
                      </div>
                    )}

                    {imageLoadError && <p className="text-xs text-red-500">{imageLoadError}</p>}
                    <p className="text-xs text-gray-400">
                      💡 Uses multiple proxy services to fetch images. If it fails, please upload manually.
                    </p>
                  </div>
                )}

                {/* Image preview */}
                {imageUrl && (
                  <div className="mt-3">
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Preview"
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Preview */}
          {title && imageUrl && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Final Preview:</p>
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-12 h-12 rounded-lg object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+Image';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{title}</p>
                  {price && <p className="text-xs text-green-600">{price}</p>}
                  <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
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