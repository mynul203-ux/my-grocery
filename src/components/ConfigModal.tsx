import React, { useState } from 'react';
import { X, Settings, RotateCcw, Check, Sparkles, Code2, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';

export const ConfigModal: React.FC = () => {
  const {
    config,
    updateConfig,
    resetConfig,
    isConfigModalOpen,
    setIsConfigModalOpen,
  } = useApp();

  const [appName, setAppName] = useState(config.appName);
  const [currency, setCurrency] = useState(config.currency);
  const [deliveryCharge, setDeliveryCharge] = useState(config.deliveryCharge);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(config.freeDeliveryThreshold);

  if (!isConfigModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      appName: appName.trim() || 'My Grocery',
      currency: currency.trim() || '৳',
      deliveryCharge: Number(deliveryCharge) || 0,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) || 500,
    });
    setIsConfigModalOpen(false);
  };

  const applyPreset = (presetName: string, presetCurrency = '৳', presetCharge = 30) => {
    setAppName(presetName);
    setCurrency(presetCurrency);
    setDeliveryCharge(presetCharge);
    updateConfig({
      appName: presetName,
      currency: presetCurrency,
      deliveryCharge: presetCharge,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Store Settings & Global App Config
              </h2>
              <p className="text-xs text-slate-500">
                Inspect and live-test the dynamic <code className="text-emerald-700 font-mono font-bold">APP_CONFIG</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {/* Explanation notice */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dynamic Config Propagation:</span>
            </div>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              Changing <strong className="font-mono">APP_CONFIG.appName</strong> automatically updates the
              website <code className="bg-emerald-100 px-1 rounded">&lt;title&gt;</code>, the top navigation logo,
              hero banner, checkout confirmation, receipt printout, and footer without code alterations!
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('My Grocery', '৳', 30)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                &ldquo;My Grocery&rdquo; (Default)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Dhaka Fresh Mart', '৳', 35)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                &ldquo;Dhaka Fresh Mart&rdquo;
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Bengal Organic Co.', '৳', 40)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                &ldquo;Bengal Organic Co.&rdquo;
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                App Name (APP_CONFIG.appName)
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. My Grocery"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Will dynamically update everywhere: header, title tag, checkout & order receipts.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="৳"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Delivery Charge ({currency})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Free Delivery Spend Threshold ({currency})
              </label>
              <input
                type="number"
                required
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                resetConfig();
                setAppName(APP_CONFIG.appName);
                setCurrency(APP_CONFIG.currency);
                setDeliveryCharge(APP_CONFIG.deliveryCharge);
                setFreeDeliveryThreshold(APP_CONFIG.freeDeliveryThreshold);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
