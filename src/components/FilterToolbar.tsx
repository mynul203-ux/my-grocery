import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Check, X, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FilterToolbar: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredProducts } = useApp();

  const isAnyFilterActive =
    filters.category !== 'all' ||
    filters.searchQuery.trim() !== '' ||
    filters.onlyInStock ||
    filters.onlyDiscounted ||
    filters.onlyOrganic ||
    filters.sortBy !== 'featured';

  return (
    <div id="product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
        {/* Results summary & Active tag */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
          <span className="font-bold text-slate-900">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
          </span>
          {filters.searchQuery && (
            <span className="text-slate-500">
              for &ldquo;<strong className="text-slate-800">{filters.searchQuery}</strong>&rdquo;
            </span>
          )}

          {isAnyFilterActive && (
            <button
              onClick={resetFilters}
              className="ml-2 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick filter checkboxes / buttons */}
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyDiscounted: !prev.onlyDiscounted }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.onlyDiscounted
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🔥 On Sale
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyOrganic: !prev.onlyOrganic }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.onlyOrganic
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🌱 Organic
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyInStock: !prev.onlyInStock }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.onlyInStock
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            📦 In Stock
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as typeof filters.sortBy,
                }))
              }
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
