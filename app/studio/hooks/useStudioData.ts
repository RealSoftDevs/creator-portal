import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
  clicks: number;
  imageUrl?: string;
}

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  buyLink: string;
  price: string;
  platform: string;
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
      setProducts(data.products || []);
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
      body: JSON.stringify(product)
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

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return false;
    await fetch(`/api/portal/products?id=${id}`, { method: 'DELETE' });
    await fetchProducts();
    return true;
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
    deleteProduct,
    fetchLinks,
    fetchProducts,
    setLoading
  };
}