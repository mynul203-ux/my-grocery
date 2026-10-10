import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ReceiptText,
  Settings2,
  ChevronDown,
  X,
  DownloadCloud,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DELIVERY_AREAS } from '../data/products';

export const Header: React.FC = () => {
  const {
    config,
    cartTotalCount,
    cartSubtotal,
    setIsCartOpen,
    wishlist,
    filters,
    setFilters,
    deliveryArea,
    setDeliveryArea,
    setIsOrdersModalOpen,
    setIsConfigModalOpen,
    orders,
  } = useApp();

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top micro-announcement bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Express Delivery in {config.estimatedDeliveryMinutes} mins to your doorstep across Dhaka
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-emerald-200">
            <span>Free delivery on orders over {config.currency}{config.freeDeliveryThreshold}</span>
            <span>·</span>
            <span>Helpline: {config.supportPhone}</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '' }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none"
              title={`${config.appName} - Home`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {config.appName}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 -mt-0.5">
                  Fresh Groceries
                </span>
              </div>
            </button>

            {/* Delivery Location Selector */}
            <div className="relative hidden lg:block ml-2 pl-3 border-l border-slate-200">
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center gap-1.5 text-left text-xs text-slate-700 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                aria-expanded={isLocationDropdownOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">Deliver to</span>
                  <span className="font-semibold text-slate-800 line-clamp-1 max-w-[140px]">
                    {deliveryArea}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Delivery Zone
                  </div>
                  {DELIVERY_AREAS.map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        setDeliveryArea(area);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-800 transition-colors ${
                        deliveryArea === area ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{area}</span>
                      {deliveryArea === area && <span className="text-emerald-600 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fresh vegetables, fruits, rice, milk, fish..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install PWA App Button */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Install Grocery App as PWA"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Live App Config editor */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="p-2 sm:px-2.5 sm:py-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-slate-200"
              title="Store Settings & App Config"
            >
              <Settings2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline text-slate-700 font-semibold">Settings</span>
            </button>

            {/* Orders History */}
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className="relative p-2 sm:px-2.5 sm:py-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-slate-200"
              title="My Orders"
            >
              <ReceiptText className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="hidden md:inline text-slate-700 font-medium">Orders</span>
              {orders.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  searchQuery: '',
                  category: 'all',
                }));
                // smooth scroll down to products
                const el = document.getElementById('product-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors hidden sm:flex items-center justify-center"
              title="Wishlist / Saved Items"
            >
              <Heart className="w-5 h-5 text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-medium">
                  {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  {config.currency}{cartSubtotal.toLocaleString()}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Delivery zone display */}
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Delivering to:</span>
            <span className="font-semibold text-slate-800">{deliveryArea}</span>
          </div>
          <button
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="text-emerald-700 font-semibold hover:underline text-[11px]"
          >
            Change
          </button>
        </div>
      </div>
    </header>
  );
};
