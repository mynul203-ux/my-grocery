/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from './config';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { FilterToolbar } from './components/FilterToolbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrdersModal } from './components/OrdersModal';
import { AdminView } from './components/AdminView';
import { ConfigModal } from './components/ConfigModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ShoppingBag, ArrowRight, Sparkles, SearchX } from 'lucide-react';

// Main customer shopping storefront
const GroceryStoreContent: React.FC = () => {
  const {
    config,
    filteredProducts,
    resetFilters,
    cartTotalCount,
    cartSubtotal,
    setIsCartOpen,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Header */}
      <Header />

      {/* Hero Announcement & Offers */}
      <HeroBanner />

      {/* Category Segmented Navigation */}
      <CategoryNav />

      {/* Search & Filter Toolbar */}
      <FilterToolbar />

      {/* Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full" id="product-catalog">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No matching groceries found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any items matching your selected filters or search terms.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Informational Farm Banner */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl border border-emerald-100 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Direct From Bangladesh Farmers</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fresh produce harvested daily, packed with cold care
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              By shopping at <strong className="text-slate-900">{config.appName}</strong>, you support local growers and cooperative farmers while ensuring pesticide-safe nutrition for your loved ones.
            </p>
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Floating Cart Indicator on Mobile */}
      {cartTotalCount > 0 && (
        <aside aria-label="Mobile Cart Bar" className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>
                {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>View Basket · {config.currency}{cartSubtotal.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </aside>
      )}

      {/* Footer (No public admin buttons) */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrdersModal />
      <ConfigModal />
      <ToastContainer />
    </div>
  );
};

// Route controller that evaluates hash/pathname and blocks Alt+A shortcut
const RootAppRouter: React.FC = () => {
  const checkIsAdminRoute = () => {
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    return hash === '#admin' || hash.startsWith('#admin') || path.endsWith('/admin') || path === '/admin';
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    // Disable & block Alt + A keyboard shortcut so regular customers cannot see or access admin
    const preventAltA = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', preventAltA, true);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('keydown', preventAltA, true);
    };
  }, []);

  // When visiting #admin or /admin, show the dedicated password-protected Admin View
  if (isAdminRoute) {
    return (
      <>
        <AdminView />
        <ToastContainer />
      </>
    );
  }

  // Otherwise, display customer storefront
  return <GroceryStoreContent />;
};

export default function App() {
  return (
    <AppProvider>
      <RootAppRouter />
    </AppProvider>
  );
}
