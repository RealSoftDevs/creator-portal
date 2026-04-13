'use client';

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !buyLink) return;
    setLoading(true);
    const platform = buyLink.includes('amazon') ? 'amazon' : buyLink.includes('myntra') ? 'myntra' : buyLink.includes('flipkart') ? 'flipkart' : 'custom';
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
                <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Image</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Title" className="w-full px-4 py-3 border rounded-xl" required />
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="Buy Link" className="w-full px-4 py-3 border rounded-xl" required />
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional)" className="w-full px-4 py-3 border rounded-xl" />
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}