import React from 'react';
import { Truck, ShieldCheck, Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroBanner: React.FC = () => {
  const { config, setFilters, applyCoupon } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl mx-4 sm:mx-6 mt-4 sm:mt-6 shadow-xl">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading and Value Proposition */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm Harvested Every Morning · 100% Quality Checked</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Daily Fresh Groceries, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200">
              Delivered in {config.estimatedDeliveryMinutes} Mins.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl font-normal leading-relaxed">
            Welcome to <span className="font-semibold text-white">{config.appName}</span>. Enjoy farm-fresh vegetables, organic seasonal fruits, cuts of meat, dairy, and household essentials at wholesale prices.
          </p>

          {/* Quick coupon cards */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-xs">
              <Tag className="w-4 h-4 text-amber-300" />
              <span className="text-emerald-100">Use code:</span>
              <button
                onClick={() => applyCoupon('FRESH10')}
                className="font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30 hover:bg-amber-400/30 transition-colors"
                title="Click to apply coupon"
              >
                FRESH10
              </button>
              <span className="text-emerald-300 text-[11px]">(10% OFF)</span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-xs">
              <Tag className="w-4 h-4 text-teal-300" />
              <span className="text-emerald-100">Orders &gt; {config.currency}600:</span>
              <button
                onClick={() => applyCoupon('GROCERY50')}
                className="font-mono font-bold text-teal-300 bg-teal-400/20 px-2 py-0.5 rounded border border-teal-300/30 hover:bg-teal-400/30 transition-colors"
                title="Click to apply coupon"
              >
                GROCERY50
              </button>
              <span className="text-emerald-300 text-[11px]">(Flat {config.currency}50 OFF)</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('product-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-amber-400/20"
            >
              <span>Explore Aisles</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, onlyDiscounted: true }));
                const el = document.getElementById('product-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-xl border border-white/15 transition-colors"
            >
              <span>Today&apos;s Special Deals</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual highlights & guarantees */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">{config.estimatedDeliveryMinutes} Mins</div>
              <p className="text-xs text-emerald-100/80 mt-1">Superfast delivery right to your kitchen</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">Free Delivery</div>
              <p className="text-xs text-emerald-100/80 mt-1">On all orders above {config.currency}{config.freeDeliveryThreshold}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">100% Fresh</div>
              <p className="text-xs text-emerald-100/80 mt-1">Hassle-free instant return if not satisfied</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3">
              <span className="text-lg font-black">{config.currency}</span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">Best Prices</div>
              <p className="text-xs text-emerald-100/80 mt-1">Direct from local growers with zero middleman</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
