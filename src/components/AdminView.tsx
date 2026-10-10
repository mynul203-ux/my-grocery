import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Save,
  Search,
  AlertCircle,
  Download,
  PlusCircle,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  SlidersHorizontal,
  Phone,
  MapPin,
  Calendar,
  Banknote,
  Smartphone,
  TrendingUp,
  X,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/products';
import { Order, Product } from '../types';

const ADMIN_SESSION_KEY = 'my_grocery_admin_session_auth_v1';

export const AdminView: React.FC = () => {
  const {
    config,
    products,
    updateProductPriceAndStock,
    resetProductsToDefault,
    orders,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    seedSampleOrders,
    addToast,
  } = useApp();

  // 1. Session Storage Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Admin Tab: 'products' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');

  // --- Product Management State ---
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productDrafts, setProductDrafts] = useState<Record<string, { price: number; inStock: boolean }>>({});

  // --- Orders State ---
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'processing' | 'delivered'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync authentication state changes to sessionStorage
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const configuredPassword = config.adminPassword || 'admin123';

    // Verify entered password
    if (passwordInput.trim() === configuredPassword) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setPasswordInput('');
      setLoginError(null);
      addToast('Welcome back, Administrator!', 'success');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
    setLoginError(null);
    addToast('Logged out of Admin Portal', 'info');
  };

  const handleExitToStorefront = () => {
    // Navigate away from admin hash/route
    window.location.hash = '';
    // If on /admin path, push state or redirect to root
    if (window.location.pathname.endsWith('/admin') || window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Helper to get current draft value or fallback to product value
  const getDraft = (p: Product) => {
    return productDrafts[p.id] || { price: p.price, inStock: p.inStock };
  };

  const handlePriceChange = (productId: string, val: string, currentStock: boolean) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setProductDrafts((prev) => ({
      ...prev,
      [productId]: {
        price: num,
        inStock: prev[productId] ? prev[productId].inStock : currentStock,
      },
    }));
  };

  const handleStockToggle = (productId: string, currentPrice: number, newStock: boolean) => {
    setProductDrafts((prev) => ({
      ...prev,
      [productId]: {
        price: prev[productId] ? prev[productId].price : currentPrice,
        inStock: newStock,
      },
    }));

    // Auto-save stock toggle immediately for snappy management
    updateProductPriceAndStock(
      productId,
      productDrafts[productId]?.price ?? currentPrice,
      newStock
    );
  };

  const handleSaveProduct = (product: Product) => {
    const draft = getDraft(product);
    updateProductPriceAndStock(product.id, draft.price, draft.inStock);

    setProductDrafts((prev) => {
      const copy = { ...prev };
      delete copy[product.id];
      return copy;
    });
  };

  const handleSaveAllModified = () => {
    const draftKeys = Object.keys(productDrafts);
    if (draftKeys.length === 0) {
      addToast('No pending price or stock changes to save', 'info');
      return;
    }

    draftKeys.forEach((pId) => {
      const draft = productDrafts[pId];
      if (draft) {
        updateProductPriceAndStock(pId, draft.price, draft.inStock);
      }
    });

    setProductDrafts({});
    addToast(`Saved changes for ${draftKeys.length} products!`, 'success');
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) {
      return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBangla = p.banglaName?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchName && !matchBangla && !matchId) return false;
    }
    return true;
  });

  // Product Counts & Stats
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const inStockCount = products.length - outOfStockCount;
  const pendingOrdersCount = orders.filter((o) => o.status !== 'delivered').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter === 'processing' && order.status === 'delivered') return false;
    if (orderStatusFilter === 'delivered' && order.status !== 'delivered') return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.phone.toLowerCase().includes(q) ||
        (order.customer.address || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopySummary = (order: Order) => {
    if (order.orderSummaryText) {
      navigator.clipboard.writeText(order.orderSummaryText);
      setCopiedId(order.id);
      addToast(`Order #${order.id} summary copied!`, 'success');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `grocery_orders_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Orders exported to JSON file', 'info');
  };

  // =========================================================================
  // VIEW 1: PASSWORD LOGIN SCREEN (When Not Authenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
        {/* Top minimal header */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              {config.appName}
            </span>
          </div>

          <button
            onClick={handleExitToStorefront}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
          </button>
        </div>

        {/* Centered Login Gate Card */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Subtle top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

            {/* Shield & Lock Header */}
            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner shadow-emerald-500/20">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restricted Access</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Login
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter your store management password to access inventory and orders.
                </p>
              </div>
            </div>

            {/* Error Message if wrong password */}
            {loginError && (
              <div className="mb-5 bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{loginError}</p>
                  <p className="text-[11px] text-rose-400/80 mt-0.5">
                    Default access password is <code className="bg-rose-950/80 px-1 py-0.2 rounded font-mono font-bold text-rose-200">admin123</code>.
                  </p>
                </div>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    placeholder="Enter admin password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono tracking-wide transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passwordInput.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Admin Dashboard</span>
              </button>
            </form>

            {/* Info Callout */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Security Notice:</strong> Authentication state is protected via browser <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 font-mono">sessionStorage</code> and clears when you logout or close your browser tab.
              </p>
            </div>
          </div>

          {/* Quick Return link */}
          <div className="text-center mt-5">
            <button
              onClick={handleExitToStorefront}
              className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>&larr; Return to public shop</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} {config.appName} · Dedicated Admin Portal</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">
                  {config.appName}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Session Active · Authenticated</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls: Storefront & Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExitToStorefront}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-colors shadow-2xs"
              title="Return to Customer Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Storefront</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              title="End session and lock admin panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-800/80 pt-2 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product &amp; Price Management</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Customer Orders Dashboard</span>
            {pendingOrdersCount > 0 ? (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {pendingOrdersCount} Pending
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {orders.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl sm:text-2xl font-black text-slate-900">{products.length}</strong>
              <span className="text-xs text-slate-500 font-semibold">Products</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">In Stock</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl sm:text-2xl font-black text-emerald-700">{inStockCount}</strong>
              <span className="text-xs text-emerald-600 font-semibold">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Out of Stock</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl sm:text-2xl font-black text-rose-700">{outOfStockCount}</strong>
              <span className="text-xs text-rose-500 font-semibold">Disabled</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Pending Orders</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl sm:text-2xl font-black text-amber-700">{pendingOrdersCount}</strong>
              <span className="text-xs text-amber-600 font-semibold">Processing</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl sm:text-2xl font-black text-slate-900">
                {config.currency}{totalRevenue.toLocaleString()}
              </strong>
              <span className="text-xs text-slate-500 font-semibold">{orders.length} orders</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: PRODUCT & STOCK MANAGEMENT                              */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Control Bar: Search, Category Filter, Save All */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Left: Category filter & counter */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                >
                  <option value="all">All Aisles ({products.length})</option>
                  {CATEGORIES.slice(1).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-slate-500">
                  Showing <strong>{filteredProducts.length}</strong> products
                </span>
              </div>

              {/* Right: Search box & Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search product name or code..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Save All Modified Button */}
                {Object.keys(productDrafts).length > 0 && (
                  <button
                    onClick={handleSaveAllModified}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes ({Object.keys(productDrafts).length})</span>
                  </button>
                )}

                {/* Reset to Catalog Defaults */}
                <button
                  onClick={resetProductsToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                  title="Reset all prices and stock status to catalog defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Product Management Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Product Details</th>
                    <th className="py-3.5 px-3">Category &amp; Unit</th>
                    <th className="py-3.5 px-3 w-44">Price (BDT {config.currency})</th>
                    <th className="py-3.5 px-4 w-44">Stock Status</th>
                    <th className="py-3.5 px-4 sm:px-6 w-28 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredProducts.map((p) => {
                    const draft = getDraft(p);
                    const isPriceModified = draft.price !== p.price;
                    const isStockModified = draft.inStock !== p.inStock;
                    const hasUnsavedChanges = isPriceModified || isStockModified;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !draft.inStock ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        {/* 1. Thumbnail, Name & ID */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {p.name}
                              </div>
                              {p.banglaName && (
                                <div className="text-[11px] text-slate-400 font-medium">
                                  {p.banglaName}
                                </div>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {p.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category & Unit */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-700 capitalize">
                            {p.category.replace('-', ' ')}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {p.unit}
                          </div>
                        </td>

                        {/* 3. Real-Time Price Input Field */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                                {config.currency}
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={draft.price}
                                onChange={(e) =>
                                  handlePriceChange(p.id, e.target.value, draft.inStock)
                                }
                                className={`w-full pl-6 pr-2 py-1.5 text-xs font-black rounded-lg border focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                  isPriceModified
                                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                                    : 'border-slate-300 bg-slate-50 text-slate-900'
                                }`}
                              />
                            </div>
                            {isPriceModified && (
                              <span className="text-[10px] text-amber-600 font-bold" title="Unsaved price modification">
                                • Modified
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Out of Stock Toggle Switch */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={draft.inStock}
                                onChange={(e) =>
                                  handleStockToggle(p.id, draft.price, e.target.checked)
                                }
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>

                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                draft.inStock
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {draft.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Save Changes Button */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleSaveProduct(p)}
                            disabled={!hasUnsavedChanges}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              hasUnsavedChanges
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                            }`}
                            title={hasUnsavedChanges ? 'Save changes to localStorage' : 'No pending changes'}
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom info banner */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All changes are saved in browser <strong>localStorage</strong>. Out of stock products display an &ldquo;Out of Stock&rdquo; badge on the shop view, and the &ldquo;Add to Cart&rdquo; button is automatically disabled.
                </span>
              </div>
              <button
                onClick={handleExitToStorefront}
                className="text-emerald-700 hover:underline font-bold whitespace-nowrap"
              >
                View Customer Storefront &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CUSTOMER ORDERS MANAGEMENT                             */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Filter toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({orders.length})
                </button>

                <button
                  onClick={() => setOrderStatusFilter('processing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === 'processing'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Processing ({pendingOrdersCount})
                </button>

                <button
                  onClick={() => setOrderStatusFilter('delivered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Delivered ({deliveredOrdersCount})
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search customer name, phone, order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={handleExportJSON}
                  disabled={orders.length === 0}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 flex items-center gap-1 shadow-2xs"
                  title="Export orders JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Orders list container */}
            <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {orders.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-white rounded-2xl border border-slate-200/80 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">No customer orders recorded yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Customer orders placed via the checkout form will show up here in real time.
                    </p>
                  </div>
                  <button
                    onClick={seedSampleOrders}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Load 2 Simulated Sample Orders</span>
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No orders matched query &ldquo;{orderSearch || orderStatusFilter}&rdquo;.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isDelivered = order.status === 'delivered';
                  const cleanPhone = order.customer.phone.replace(/[\s-]/g, '');

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 hover:border-emerald-300 transition-all"
                    >
                      {/* Order top bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {order.status}
                          </span>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors"
                            title="Delete this order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Customer Details Box */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-400 font-medium">Customer: </span>
                            <strong className="text-slate-900">{order.customer.fullName}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Phone: </span>
                            <strong className="text-slate-900">{order.customer.phone}</strong>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="text-emerald-700 hover:text-emerald-800 font-bold underline text-[11px]"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#25D366] hover:underline font-bold text-[11px]"
                            >
                              WhatsApp
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Payment: </span>
                            <strong className="text-slate-900">
                              {order.customer.paymentMethod === 'bkash' ? 'bKash Mobile Banking' : 'Cash on Delivery'}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 font-medium">Delivery Address: </span>
                          <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                            {order.customer.address}
                          </p>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="text-xs space-y-1 py-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                          Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)} items):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50/60 px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <span className="font-medium line-clamp-1">
                                {item.product.name} ({item.product.unit})
                              </span>
                              <span className="font-bold text-slate-900 shrink-0 ml-2">
                                {item.quantity} &times; {config.currency}{item.product.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Footer: Total and Status Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-slate-500 font-semibold">Grand Total:</span>
                          <span className="font-black text-base sm:text-lg text-emerald-700">
                            {order.currencyAtOrderTime || config.currency}{order.total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy WhatsApp / Text Summary */}
                          <button
                            onClick={() => handleCopySummary(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
                            title="Copy formatted WhatsApp order summary"
                          >
                            {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === order.id ? 'Copied' : 'Copy Summary'}</span>
                          </button>

                          {/* Toggle Status */}
                          {!isDelivered ? (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Mark Processing</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom bar for orders */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={seedSampleOrders}
                  className="text-slate-600 hover:text-emerald-700 font-semibold"
                >
                  + Load 2 Sample Orders
                </button>
                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all order history?')) {
                        clearOrders();
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 font-semibold"
                  >
                    Clear Order History
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExitToStorefront}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Admin Bottom Sticky Session Bar */}
      <footer className="bg-slate-900 text-slate-400 py-3 px-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Store: <strong className="text-white">{config.appName}</strong> · Password-Protected Admin Gateway
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExitToStorefront}
              className="text-slate-300 hover:text-white font-semibold underline"
            >
              Public Storefront
            </button>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
