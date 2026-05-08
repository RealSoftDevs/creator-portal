// app/studio/components/EditProductModal.tsx
'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Loader2, ExternalLink, Trash2, Tag, Check, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PRODUCT_CATEGORIES, getCategoryById } from '@/lib/categories';

interface EditProductModalProps {
  product: {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    buyLink: string;
    price?: string | null;
    platform: string;
    category?: string;
  };
  onClose: () => void;
  onSave: (id: string, updates: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function EditProductModal({ product, onClose, onSave, onDelete }: EditProductModalProps) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || '');
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [buyLink, setBuyLink] = useState(product.buyLink);
  const [price, setPrice] = useState(product.price || '');
  const [platform, setPlatform] = useState(product.platform);
  const [category, setCategory] = useState(product.category || 'misc');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // Fetch product details from API
  const fetchProductDetails = async () => {
    if (!buyLink) {
      alert('Please enter a product link first');
      return;
    }

    setFetching(true);
    try {
      const res = await fetch(`/api/product-preview?url=${encodeURIComponent(buyLink)}`);
      const data = await res.json();

      if (data) {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.price) setPrice(data.price);
        if (data.imageUrl) setImageUrl(data.imageUrl);
        if (data.platform) setPlatform(data.platform);

        alert('Product details fetched successfully!');
      } else {
        alert('Could not fetch product details');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to fetch product details');
    } finally {
      setFetching(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !buyLink) {
      alert('Please fill all required fields (Title, Image, and Link)');
      return;
    }

    setLoading(true);
    const success = await onSave(product.id, { title, description, imageUrl, buyLink, price, platform, category });
    setLoading(false);
    if (success) {
      onClose();
    } else {
      alert('Failed to save product');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const success = await onDelete(product.id);
      if (success) {
        onClose();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Link Input with Fetch Button */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Link *</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={buyLink}
                onChange={(e) => setBuyLink(e.target.value)}
                placeholder="https://amazon.in/dp/..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                required
              />
              <button
                type="button"
                onClick={fetchProductDetails}
                disabled={fetching}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Fetch
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Click "Fetch" to auto-fill product details from the link
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category *
            </label>
            <button
              type="button"
              onClick={() => setShowCategorySelect(!showCategorySelect)}
              className="w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between hover:border-gray-400 transition bg-white"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <span>{getCategoryName(category)}</span>
              </div>
              <span className="text-gray-400">▼</span>
            </button>

            {showCategorySelect && (
              <div className="mt-2 border rounded-xl overflow-hidden bg-white shadow-lg max-h-64 overflow-y-auto">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setShowCategorySelect(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition ${
                      category === cat.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{cat.name}</p>
                    </div>
                    {category === cat.id && <Check className="w-4 h-4 text-purple-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Image Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Product Image *</label>

            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={title}
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
            ) : loading ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-sm text-gray-500 mt-2 block">
                  {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                </span>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
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
          </div>

          {/* Product Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹49,999"
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

          {/* Final Preview */}
          {title && imageUrl && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{title}</p>
                  {price && <p className="text-xs text-green-600">{price}</p>}
                  {description && <p className="text-xs text-gray-500 line-clamp-1">{description}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs">{getCategoryIcon(category)}</span>
                    <span className="text-xs text-gray-500">{getCategoryName(category)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !title || !imageUrl || !buyLink}
              className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5">
            <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}