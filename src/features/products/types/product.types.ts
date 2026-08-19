export interface ProductVariantOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  available: boolean;
  options: ProductVariantOption[];
  image?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface SellingPlan {
  id: string;
  name: string;
  description?: string;
  discountPercentage?: number;
  frequencyMonths?: number;
}

export interface SellingPlanGroup {
  id?: string;
  name: string;
  sellingPlans: SellingPlan[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  featuredImage: string;
  tags: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  available: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
  detailsHtml?: string;
  sellingPlanGroups?: SellingPlanGroup[];
}


export interface ProductFilter {
  collection?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'title-asc' | 'newest';
  searchQuery?: string;
}
