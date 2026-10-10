export type CategoryId =
  | 'all'
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat-fish'
  | 'rice-dal'
  | 'bakery-snacks'
  | 'beverages';

export interface Category {
  id: CategoryId;
  name: string;
  banglaName?: string;
  icon: string;
  count?: number;
}

export interface Product {
  id: string;
  name: string;
  banglaName?: string;
  category: CategoryId;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. "1 kg", "500 g", "12 pcs", "1 L"
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: 'Organic' | 'Farm Fresh' | 'Best Value' | 'Trending' | 'Imported';
  inStock: boolean;
  stockCount: number;
  description: string;
  origin: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  storageTips?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  area: string; // Municipality area
  roadOrPara: string; // Road / Para name
  houseDetails: string; // House details (holding/flat/building)
  address?: string; // Full composite address
  deliverySlot?: string;
  notes?: string;
  paymentMethod: 'cash_on_delivery' | 'bkash';
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customer: OrderCustomer;
  status: 'confirmed' | 'processing' | 'on_the_way' | 'delivered';
  appNameAtOrderTime: string;
  currencyAtOrderTime: string;
  whatsappUrl?: string;
  orderSummaryText?: string;
}

export interface FilterState {
  category: CategoryId;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
  onlyInStock: boolean;
  onlyDiscounted: boolean;
  onlyOrganic: boolean;
  maxPrice: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  description: string;
}
