import React, { useState } from 'react';
import { X, Heart, Plus, Minus, Star, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductModal: React.FC = () => {
  const {
    config,
    selectedProduct,
    setSelectedProduct,
    cart,
    addToCart,
    updateQuantity,
    toggleWishlist,
    isInWishlist,
  } = useApp();

  const [qty, setQty] = useState(1);

  if (!selectedProduct) return null;

  const cartItem = cart.find((item) => item.product.id === selectedProduct.id);
  const isFavorite = isInWishlist(selectedProduct.id);

  const discountPercent =
    selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
      ? Math.round(
          ((selectedProduct.originalPrice - selectedProduct.price) /
            selectedProduct.originalPrice) *
            100
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-800 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm border border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image */}
        <div className="relative md:w-1/2 aspect-square md:aspect-auto bg-slate-100 shrink-0">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
          {discountPercent && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="p-6 md:w-1/2 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">
                {selectedProduct.badge || 'Fresh Harvest'}
              </span>
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {selectedProduct.name}
            </h2>

            {selectedProduct.banglaName && (
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {selectedProduct.banglaName}
              </p>
            )}

            {/* Rating & Stock */}
            <div className="flex items-center gap-3 my-3 text-xs">
              <div className="flex items-center gap-1 text-slate-800 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating.toFixed(1)}</span>
                <span className="text-slate-400">({selectedProduct.reviewsCount} reviews)</span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-semibold">
                {selectedProduct.stockCount} in stock
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 pb-3 mb-3 border-b border-slate-100">
              <span className="text-2xl font-black text-slate-900">
                {config.currency}{selectedProduct.price}
              </span>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <span className="text-sm text-slate-400 line-through">
                  {config.currency}{selectedProduct.originalPrice}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">/ {selectedProduct.unit}</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {selectedProduct.description}
            </p>

            {/* Origin & Info */}
            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Origin:</strong> {selectedProduct.origin}</span>
              </div>
              {selectedProduct.storageTips && (
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span><strong>Storage:</strong> {selectedProduct.storageTips}</span>
                </div>
              )}
            </div>

            {/* Nutrition info if available */}
            {selectedProduct.nutrition && (
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nutrition per 100g
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Cal</span>
                    <strong className="text-slate-800">{selectedProduct.nutrition.calories?.split(' ')[0]}</strong>
                  </div>
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Protein</span>
                    <strong className="text-slate-800">{selectedProduct.nutrition.protein}</strong>
                  </div>
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Carbs</span>
                    <strong className="text-slate-800">{selectedProduct.nutrition.carbs}</strong>
                  </div>
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Fat</span>
                    <strong className="text-slate-800">{selectedProduct.nutrition.fat}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-900">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                addToCart(selectedProduct, qty, true);
                setSelectedProduct(null);
              }}
              disabled={!selectedProduct.inStock}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-700/20 text-sm flex items-center justify-center gap-2"
            >
              <span>
                {selectedProduct.inStock
                  ? `Add to Basket · ${config.currency}${(selectedProduct.price * qty).toLocaleString()}`
                  : 'Out of Stock'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
