// app/components/shared/EditProductModal.tsx - Only fetch on button click
'use client';

import { useState } from 'react';
import { X, Upload, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function EditProductModal({ product, onClose, onSave, onDelete }: {
  product: any;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || '');
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [buyLink, setBuyLink] = useState(product.buyLink);
  const [price, setPrice] = useState(product.price || '');
  const [platform, setPlatform] = useState(product.platform || 'custom');
  const [category, setCategory] = useState(product.category || 'misc');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch product details - ONLY when user clicks the fetch button
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

  // Image upload
  const onDrop = async (acceptedFiles: File[]) => {
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
  };

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
    if (success) onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const success = await onDelete(product.id);
    setDeleting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-white">Edit Product</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Link Input with Fetch Button */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Product Link *</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={buyLink}
                onChange={(e) => setBuyLink(e.target.value)}
                placeholder="https://amazon.in/dp/..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white"
                required
              />
              <button
                type="button"
                onClick={fetchProductDetails}
                disabled={fetching}
                className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition disabled:opacity-50 flex items-center gap-2"
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
              💡 Click "Fetch" to auto-fill product details from the link (title, description, price, image)
            </p>
          </div>

          {/* Product Image Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Product Image *</label>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-40 object-cover rounded-lg border border-white/20"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+Image';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : loading ? (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                <div className="w-full bg-white/10 rounded-full h-2 mx-auto">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-sm text-gray-400 mt-2 block">
                  {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                </span>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">{isDragActive ? 'Drop image here' : 'Click or drag to upload'}</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Product Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white resize-none"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹49,999"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white"
              >
                <option value="amazon">Amazon</option>
                <option value="myntra">Myntra</option>
                <option value="flipkart">Flipkart</option>
                <option value="etsy">Etsy</option>
                <option value="custom">Other</option>
              </select>
            </div>
          </div>

          {/* Preview Section - No link shown, just product info */}
          {title && imageUrl && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/20">
              <p className="text-xs font-medium text-gray-400 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <img src={imageUrl} alt={title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1">{title}</p>
                  {price && <p className="text-xs text-green-400">{price}</p>}
                  {description && <p className="text-xs text-gray-400 line-clamp-1">{description}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !title || !imageUrl || !buyLink}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-sm w-full p-5 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-white/5 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}