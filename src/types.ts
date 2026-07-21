export interface Property {
  id: string;
  title: string;
  price: number;
  description: string;
  type: 'sale' | 'rent';
  propertyType: 'House' | 'Apartment' | 'Villa' | 'Townhouse' | 'Condo' | 'Commercial';
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // square feet
  imageUrl: string;
  additionalImages?: string[]; // array of image URLs or base64s
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentPhoto?: string;
  status: 'available' | 'pending' | 'sold';
  amenities: string[];
  featured?: boolean;
  createdAt: string;
}

export interface PropertyFilters {
  search: string;
  type: 'all' | 'sale' | 'rent';
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
}
