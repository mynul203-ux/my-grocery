import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/products';

export const Footer: React.FC = () => {
  const { config, setFilters, setIsConfigModalOpen } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      {/* Value props bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express {config.estimatedDeliveryMinutes}-Min Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cold-chain packed right to your kitchen</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Quality Guaranteed</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct sourcing from verified local growers</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Replacement</h4>
              <p className="text-xs text-slate-400 mt-0.5">No questions asked instant return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              {config.appName}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {config.appName} brings the fresh bazaar experience online. We bridge local farmers, dairy producers, and artisan bakers directly with your household pantry.
          </p>

          <div className="space-y-2 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{config.supportPhone} (7 AM - 11 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>{config.supportEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gulshan &amp; Banani Fulfillment Centers, Dhaka</span>
            </div>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Popular Aisles
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            {CATEGORIES.slice(1, 6).map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: cat.id }));
                    const el = document.getElementById('product-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Customer Support
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><span className="hover:text-white cursor-pointer">Delivery Areas &amp; Slots</span></li>
            <li><span className="hover:text-white cursor-pointer">Quality Guarantee Policy</span></li>
            <li><span className="hover:text-white cursor-pointer">Corporate Orders</span></li>
            <li><span className="hover:text-white cursor-pointer">Help &amp; FAQ</span></li>
            <li>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                App Settings &amp; Config
              </button>
            </li>
          </ul>
        </div>

        {/* Payment & Security */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Payment Methods
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Cash on Delivery, bKash, Nagad, Visa, and Mastercard accepted with end-to-end encryption.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-semibold text-slate-300">
              Cash on Delivery
            </span>
            <span className="px-2 py-1 bg-pink-950 text-pink-300 rounded text-[11px] font-semibold">
              bKash
            </span>
            <span className="px-2 py-1 bg-orange-950 text-orange-300 rounded text-[11px] font-semibold">
              Nagad
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-semibold text-slate-300">
              Visa / Card
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-slate-300">{config.appName}</strong>. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            Delivering farm-fresh grocery items daily with love.
          </p>
        </div>
      </div>
    </footer>
  );
};
