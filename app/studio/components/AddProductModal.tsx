'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: any) => void;
}

export default function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);  // Add this line

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setUploading(true);

     const formData = new FormData();
     formData.append('file', file);

     try {
       const res = await fetch('/api/upload', {
         method: 'POST',
         body: formData,
       });

       const data = await res.json();
       if (data.success) {
         setImageUrl(data.url);
         // Show compression stats
         console.log(`✅ Image optimized: ${data.compressionRatio} saved`);
       } else {
         alert(data.error || 'Upload failed');
       }
     } catch (error) {
       console.error('Upload error:', error);
       alert('Upload failed');
     } finally {
       setUploading(false);
     }
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !buyLink) return;
    setLoading(true);
    const platform = buyLink.includes('amazon') ? 'amazon' :
                     buyLink.includes('myntra') ? 'myntra' :
                     buyLink.includes('flipkart') ? 'flipkart' : 'custom';
    await onSave({ title, imageUrl, buyLink, price, platform });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Product</h3>
          <button onClick={onClose} className="p-1 text-gray-500"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="border-2 border-dashed rounded-xl p-4 text-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
            ) : (
              <label className="cursor-pointer block">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-2" />
                    <span className="text-sm text-gray-500">Optimizing image...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Title" className="w-full px-4 py-3 border rounded-xl" required />
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="Buy Link (Amazon/Myntra/Flipkart)" className="w-full px-4 py-3 border rounded-xl" required />
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional)" className="w-full px-4 py-3 border rounded-xl" />
          <button type="submit" disabled={loading || uploading} className="w-full bg-black text-white py-3 rounded-xl">
            {loading ? 'Adding...' : uploading ? 'Uploading...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}