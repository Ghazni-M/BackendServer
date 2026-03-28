export interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'Residential' | 'Commercial' | 'Land';
  status: 'Available' | 'Sold' | 'Pending';
  imageUrl: string;
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  description: string;
  features: string[];
  acreage?: number;
  zoning?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  author_email?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}
