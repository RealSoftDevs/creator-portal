// app/studio/hooks/useStudioData.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  buyLink: string;
  price?: string | null;
  platform?: string;
  category?: string;
  isDummy?: boolean;
  order?: number;
  createdAt?: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
  clicks: number;
  imageUrl?: string;
  wrappedUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useStudioData() {
  const [links, setLinks] = useState<Link[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalSlug, setPortalSlug] = useState('');
  const router = useRouter();

  const fetchPortalInfo = async () => {
    const res = await fetch('/api/portal/info');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    if (data.slug) setPortalSlug(data.slug);
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/portal/links');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/portal/products');
      const data = await res.json();
      // Ensure price is properly handled
      const productsWithTypedPrice = (data.products || []).map((p: any) => ({
        ...p,
        price: p.price || null,
        category: p.category || 'misc'
      }));
      setProducts(productsWithTypedPrice);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addLink = async (linkData: any) => {
    const res = await fetch('/api/portal/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: linkData.title,
        url: linkData.url,
        order: links.length,
        iconUrl: linkData.iconUrl
      })
    });
    if (res.ok) {
      await fetchLinks();
      return true;
    }
    return false;
  };

  const addProduct = async (product: any) => {
    const res = await fetch('/api/portal/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        price: product.price || null,
        category: product.category || 'misc'
      })
    });
    if (res.ok) {
      await fetchProducts();
      return true;
    }
    return false;
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return false;
    await fetch(`/api/portal/links?id=${id}`, { method: 'DELETE' });
    await fetchLinks();
    return true;
  };
 // In app/studio/hooks/useStudioData.ts, ensure these functions return boolean:

 const updateProduct = async (id: string, updates: any): Promise<boolean> => {
   try {
     const res = await fetch(`/api/portal/products/${id}`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         ...updates,
         price: updates.price || null,
         category: updates.category || 'misc'
       })
     });
     if (res.ok) {
       await fetchProducts();
       return true;
     }
     return false;
   } catch (error) {
     console.error('Update product error:', error);
     return false;
   }
 };

 const deleteProduct = async (id: string): Promise<boolean> => {
   try {
     const res = await fetch(`/api/portal/products/${id}`, {
       method: 'DELETE',
     });
     if (res.ok) {
       await fetchProducts();
       return true;
     }
     return false;
   } catch (error) {
     console.error('Delete product error:', error);
     return false;
   }
 };
  const loadData = async () => {
    await fetchPortalInfo();
    await fetchLinks();
    await fetchProducts();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    links,
    products,
    loading,
    portalSlug,
    addLink,
    addProduct,
    deleteLink,
    updateProduct,
    deleteProduct,
    fetchLinks,
    fetchProducts,
    setLoading
  };
}