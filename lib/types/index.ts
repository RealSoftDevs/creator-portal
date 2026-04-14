export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  buyLink: string;
  price?: string;
  platform?: string;
  isDummy?: boolean;
  order?: number;
  createdAt?: string;
}

export interface Link {
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

export interface Portal {
  id: string;
  slug: string;
  title: string;
  bio?: string;
  avatar?: string;
  templateId: string;
  primaryColor: string;
  userId: string;
}