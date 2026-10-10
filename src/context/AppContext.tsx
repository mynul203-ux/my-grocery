import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_CONFIG, AppConfig } from '../config';
import { AVAILABLE_COUPONS, PRODUCTS } from '../data/products';
import { CartItem, Coupon, FilterState, Order, Product } from '../types';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // App Config
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  deliveryCharge: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountAmount: number;
  grandTotal: number;
  freeDeliveryRemaining: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Products Catalog (Admin Managed)
  products: Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateProductPriceAndStock: (productId: string, price: number, inStock: boolean) => void;
  resetProductsToDefault: () => void;

  // Filter & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProducts: Product[];

  // Delivery Location
  deliveryArea: string;
  setDeliveryArea: (area: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'appNameAtOrderTime' | 'currencyAtOrderTime'>) => Order;
  lastPlacedOrder: Order | null;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  clearOrders: () => void;
  seedSampleOrders: () => void;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderSuccessOpen: boolean;
  setIsOrderSuccessOpen: (open: boolean) => void;
  isOrdersModalOpen: boolean;
  setIsOrdersModalOpen: (open: boolean) => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'my_grocery_cart_v1';
const WISHLIST_STORAGE_KEY = 'my_grocery_wishlist_v1';
const ORDERS_STORAGE_KEY = 'my_grocery_orders_v1';
const CONFIG_STORAGE_KEY = 'my_grocery_custom_config_v1';
const PRODUCTS_STORAGE_KEY = 'my_grocery_products_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config state initialized with APP_CONFIG
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...APP_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return APP_CONFIG;
  });

  // Products catalog state managed via localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  // Sync products updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Keep document title synced dynamically with APP_CONFIG.appName
  useEffect(() => {
    document.title = `${config.appName} - Fresh Groceries Delivered Fast`;
  }, [config.appName]);

  const updateConfig = (newSettings: Partial<AppConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    addToast(`Store config updated. App name is now "${newSettings.appName || config.appName}"`, 'info');
  };

  const resetConfig = () => {
    setConfig(APP_CONFIG);
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {
      // ignore
    }
    addToast(`Restored default config for ${APP_CONFIG.appName}`, 'info');
  };

  // Delivery Area
  const [deliveryArea, setDeliveryArea] = useState<string>(config.defaultDeliveryArea);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['f-1', 'd-1', 'm-2'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filter state
  const initialFilters: FilterState = {
    category: 'all',
    searchQuery: '',
    sortBy: 'featured',
    onlyInStock: false,
    onlyDiscounted: false,
    onlyOrganic: false,
    maxPrice: 1500,
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, openDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
    addToast(`Added "${product.name}" to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      addToast(`Removed "${item.product.name}" from cart`, 'info');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery charge is free if subtotal >= freeDeliveryThreshold
  const deliveryCharge =
    cartSubtotal === 0
      ? 0
      : cartSubtotal >= config.freeDeliveryThreshold
      ? 0
      : config.deliveryCharge;

  const freeDeliveryRemaining =
    cartSubtotal >= config.freeDeliveryThreshold
      ? 0
      : config.freeDeliveryThreshold - cartSubtotal;

  // Coupon calculations
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: `Invalid coupon code "${cleanCode}". Try FRESH10` };
    }
    if (cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Coupon requires minimum spend of ${config.currency}${found.minSpend}`,
      };
    }
    setAppliedCoupon(found);
    addToast(`Coupon "${found.code}" applied successfully!`, 'success');
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const product = products.find((p) => p.id === productId);
      if (exists) {
        addToast(`Removed ${product?.name || 'item'} from favorites`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast(`Saved ${product?.name || 'item'} to favorites`, 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Product Updates for Admin
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, ...updates } }
          : item
      )
    );
  };

  const updateProductPriceAndStock = (productId: string, price: number, inStock: boolean) => {
    const targetProduct = products.find((p) => p.id === productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price, inStock } : p))
    );
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, price, inStock } }
          : item
      )
    );
    addToast(
      `Updated "${targetProduct?.name || 'Product'}": ${config.currency}${price} · ${inStock ? 'In Stock' : 'Out of Stock'}`,
      'success'
    );
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    } catch {}
    addToast('Restored all product prices and stock to defaults', 'info');
  };

  // Filter logic
  const filteredProducts = products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBangla = product.banglaName?.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchOrigin = product.origin.toLowerCase().includes(q);
      if (!matchName && !matchBangla && !matchCategory && !matchOrigin) {
        return false;
      }
    }
    if (filters.onlyInStock && !product.inStock) {
      return false;
    }
    if (filters.onlyDiscounted && (!product.originalPrice || product.originalPrice <= product.price)) {
      return false;
    }
    if (filters.onlyOrganic && product.badge !== 'Organic') {
      return false;
    }
    if (product.price > filters.maxPrice) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'discount') {
      const discA = a.originalPrice ? a.originalPrice - a.price : 0;
      const discB = b.originalPrice ? b.originalPrice - b.price : 0;
      return discB - discA;
    }
    // 'featured'
    return 0;
  });

  // Create order
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'appNameAtOrderTime' | 'currencyAtOrderTime'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `MG-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      appNameAtOrderTime: config.appName,
      currencyAtOrderTime: config.currency,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
    return newOrder;
  };

  // Order management for Admin
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    addToast(`Order #${orderId} marked as ${status.toUpperCase()}`, 'info');
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    addToast(`Order #${orderId} deleted`, 'info');
  };

  const clearOrders = () => {
    setOrders([]);
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
    } catch {}
    addToast('All order records have been cleared', 'info');
  };

  const seedSampleOrders = () => {
    const sample1: Order = {
      id: `MG-592184`,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      items: [
        { product: PRODUCTS[0], quantity: 2 },
        { product: PRODUCTS[4], quantity: 1 },
      ],
      subtotal: PRODUCTS[0].price * 2 + PRODUCTS[4].price,
      deliveryFee: config.deliveryCharge,
      discount: 0,
      total: PRODUCTS[0].price * 2 + PRODUCTS[4].price + config.deliveryCharge,
      customer: {
        fullName: 'Farhan Kabir',
        phone: '01711-223344',
        area: 'Banani, Dhaka',
        roadOrPara: 'Road 11, Block C',
        houseDetails: 'House 42, Flat 3A',
        address: 'House 42, Flat 3A, Road 11, Block C, Banani, Dhaka',
        paymentMethod: 'cash_on_delivery',
      },
      status: 'processing',
      appNameAtOrderTime: config.appName,
      currencyAtOrderTime: config.currency,
      orderSummaryText: `Sample order from Farhan Kabir`,
    };

    const sample2: Order = {
      id: `MG-839201`,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      items: [
        { product: PRODUCTS[8], quantity: 2 },
        { product: PRODUCTS[1], quantity: 1 },
      ],
      subtotal: PRODUCTS[8].price * 2 + PRODUCTS[1].price,
      deliveryFee: 0,
      discount: 50,
      total: PRODUCTS[8].price * 2 + PRODUCTS[1].price - 50,
      customer: {
        fullName: 'Nusrat Jahan',
        phone: '01819-998877',
        area: 'Dhanmondi, Dhaka',
        roadOrPara: 'Road 27 (Old)',
        houseDetails: 'Apt 5B, Holding 19',
        address: 'Apt 5B, Holding 19, Road 27, Dhanmondi, Dhaka',
        paymentMethod: 'bkash',
      },
      status: 'delivered',
      appNameAtOrderTime: config.appName,
      currencyAtOrderTime: config.currency,
      orderSummaryText: `Sample order from Nusrat Jahan`,
    };

    setOrders([sample1, sample2]);
    addToast('Loaded 2 simulated sample orders into Admin View', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        deliveryCharge,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        grandTotal,
        freeDeliveryRemaining,
        wishlist,
        toggleWishlist,
        isInWishlist,
        products,
        updateProduct,
        updateProductPriceAndStock,
        resetProductsToDefault,
        filters,
        setFilters,
        resetFilters,
        filteredProducts,
        deliveryArea,
        setDeliveryArea,
        orders,
        createOrder,
        lastPlacedOrder,
        updateOrderStatus,
        deleteOrder,
        clearOrders,
        seedSampleOrders,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        isOrdersModalOpen,
        setIsOrdersModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        selectedProduct,
        setSelectedProduct,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
