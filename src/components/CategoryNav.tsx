import React from 'react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';

export const CategoryNav: React.FC = () => {
  const { filters, setFilters, products } = useApp();

  const getCount = (catId: CategoryId) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hand-picked selections categorized for your daily meal prep
          </p>
        </div>

        {filters.category !== 'all' && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Show All Aisles ({PRODUCTS.length})
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroller */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {count} items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
