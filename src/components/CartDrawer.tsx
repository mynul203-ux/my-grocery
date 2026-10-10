import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBasket,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_COUPONS } from '../data/products';

export const CartDrawer: React.FC = () => {
  const {
    config,
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
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
    setIsCheckoutOpen,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((cartSubtotal / config.freeDeliveryThreshold) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-12">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 id="slide-over-title" className="font-bold text-slate-900 text-base sm:text-lg">
                  Shopping Cart
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'} in your basket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Free Delivery Status Progress Bar */}
          <div className="bg-emerald-50/80 border-b border-emerald-100 p-3.5 px-5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                {freeDeliveryRemaining > 0 ? (
                  <span>
                    Add <strong className="text-emerald-800">{config.currency}{freeDeliveryRemaining}</strong> more for <strong className="text-emerald-800">FREE Delivery</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    FREE Delivery unlocked! (Saved {config.currency}{config.deliveryCharge})
                  </span>
                )}
              </span>
              <span className="text-emerald-700 font-bold text-[11px]">{freeDeliveryProgress}%</span>
            </div>
            
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-emerald-800/80 mt-1">
              <span>Standard delivery: {config.currency}{config.deliveryCharge} fixed</span>
              <span>Free over {config.currency}{config.freeDeliveryThreshold}</span>
            </div>
          </div>

          {/* Product Items List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBasket className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Look through farm-fresh groceries, vegetables, and daily essentials from {config.appName} to start adding items.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-3.5 flex items-start gap-3 group">
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition-colors shrink-0"
                        title="Remove item from cart"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                      <span>{item.product.unit}</span>
                      <span>·</span>
                      <span className="text-slate-600 font-semibold">
                        {config.currency}{item.product.price} each
                      </span>
                    </div>

                    {/* Quantity Stepper & Line Item Subtotal */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors active:scale-95"
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-7 text-center text-xs font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors active:scale-95"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900">
                          {config.currency}{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Bill Calculations */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3.5">
              
              {/* Promo Voucher Section */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Promo <strong>{appliedCoupon.code}</strong> applied (-{config.currency}{discountAmount})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Discount code (e.g. FRESH10)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {couponError}
                      </p>
                    )}

                    {/* Quick coupon chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                      <span>Try codes:</span>
                      {AVAILABLE_COUPONS.slice(0, 2).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleApplyCoupon(c.code)}
                          className="font-mono font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {config.currency}{cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Delivery Charge</span>
                    {deliveryCharge === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        &gt; {config.currency}{config.freeDeliveryThreshold}
                      </span>
                    )}
                  </span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <strong className="text-emerald-700 font-bold uppercase tracking-wider">FREE</strong>
                    ) : (
                      <span className="font-bold text-slate-900">
                        {config.currency}{deliveryCharge}
                      </span>
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Voucher Discount</span>
                    <span>-{config.currency}{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-emerald-700">
                    {config.currency}{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-700/25 flex items-center justify-between text-sm cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black">{config.currency}{grandTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold py-1 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
