import React from 'react';
import { Heart, Plus, Minus, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    config,
    cart,
    addToCart,
    updateQuantity,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
  } = useApp();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isFavorite = isInWishlist(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Media Area */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Discount tag (top left) */}
        {discountPercent && (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-lg shadow-xs">
            {discountPercent}% OFF
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Quick Details
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Origin & Unit (Zero-pill clean text) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
            <span>{product.unit}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="truncate">{product.origin.split(',')[0]}</span>
            {product.badge && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-700 font-semibold">{product.badge}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Bengali localized subtitle */}
          {product.banglaName && (
            <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
              {product.banglaName}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Prices */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {config.currency}{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {config.currency}{product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">VAT inclusive</span>
          </div>

          {/* Add to Cart or Stepper */}
          {!product.inStock ? (
            <button
              disabled
              className="inline-flex items-center gap-1.5 bg-slate-200 text-slate-400 font-bold text-xs px-3 py-2 rounded-xl cursor-not-allowed shadow-none select-none"
              title="This product is currently out of stock"
            >
              <span>Out of Stock</span>
            </button>
          ) : inCartQty === 0 ? (
            <button
              onClick={() => addToCart(product, 1, true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
              <button
                onClick={() => updateQuantity(product.id, inCartQty - 1)}
                className="w-7 h-7 flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors font-bold shadow-2xs"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="w-6 text-center text-xs font-extrabold text-emerald-900">
                {inCartQty}
              </span>
              <button
                onClick={() => updateQuantity(product.id, inCartQty + 1)}
                className="w-7 h-7 flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors font-bold shadow-2xs"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
