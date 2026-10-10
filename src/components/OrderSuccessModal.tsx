import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  Bike,
  Home,
  Printer,
  ShoppingBag,
  Clock,
  X,
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderSuccessModal: React.FC = () => {
  const {
    config,
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    lastPlacedOrder,
    addToast,
  } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    if (isOrderSuccessOpen) {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#fbbf24', '#f59e0b', '#25D366'],
      });

      // Simulate tracking progression
      const t1 = setTimeout(() => setActiveStep(2), 2500);
      const t2 = setTimeout(() => setActiveStep(3), 5500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOrderSuccessOpen]);

  if (!isOrderSuccessOpen || !lastPlacedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (lastPlacedOrder.orderSummaryText) {
      navigator.clipboard.writeText(lastPlacedOrder.orderSummaryText);
      setCopied(true);
      addToast('Order summary copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOrderSuccessOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-9 h-9 text-amber-300 stroke-[2.5]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Order Successfully Placed!
          </h2>

          {/* Prominent success message using config.appName */}
          <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
            Thank you for shopping with <strong className="text-white underline decoration-amber-300 decoration-2">{config.appName}</strong>! Your cart has been emptied and the order details have been formatted.
          </p>

          <div className="inline-block bg-white/15 px-3.5 py-1 rounded-full text-xs font-mono font-bold mt-3 text-emerald-100 border border-white/20">
            Order Reference: #{lastPlacedOrder.id}
          </div>
        </div>

        {/* WhatsApp Redirection & Status Card */}
        <div className="p-4 sm:p-5 bg-[#25D366]/10 border-b border-[#25D366]/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  WhatsApp Order Dispatched
                </h3>
                <p className="text-[11px] text-slate-600">
                  Pre-filled summary prepared for +{config.whatsappNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Copy order message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {lastPlacedOrder.whatsappUrl && (
                <a
                  href={lastPlacedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg transition-all shadow-xs"
                >
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>If WhatsApp didn&apos;t open automatically, click <strong>Open WhatsApp</strong> above.</span>
            <button
              onClick={() => setShowSummaryPreview(!showSummaryPreview)}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline"
            >
              {showSummaryPreview ? 'Hide message' : 'View message'}
            </button>
          </div>

          {/* Formatted Text Preview */}
          {showSummaryPreview && lastPlacedOrder.orderSummaryText && (
            <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[10px] sm:text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed mt-2 border border-slate-800">
              {lastPlacedOrder.orderSummaryText}
            </pre>
          )}
        </div>

        {/* Live Tracking Progress */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
            <span>Fulfillment Pipeline</span>
            <span className="text-emerald-700 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Est. Arrival in {config.estimatedDeliveryMinutes} mins
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 relative">
            <div className={`text-center space-y-1 ${activeStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                activeStep >= 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] block leading-tight">Order Received</span>
            </div>

            <div className={`text-center space-y-1 ${activeStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                activeStep >= 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}>
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[10px] block leading-tight">Packed at Hub</span>
            </div>

            <div className={`text-center space-y-1 ${activeStep >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                activeStep >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}>
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-[10px] block leading-tight">Out for Delivery</span>
            </div>

            <div className={`text-center space-y-1 ${activeStep >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                activeStep >= 4 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px] block leading-tight">Delivered</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-60 overflow-y-auto">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient:</span>
              <strong className="text-slate-900">{lastPlacedOrder.customer.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mobile Phone:</span>
              <span className="font-mono font-semibold text-slate-800">{lastPlacedOrder.customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{lastPlacedOrder.customer.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-emerald-800">
                {lastPlacedOrder.customer.paymentMethod === 'bkash' ? 'bKash Mobile Banking' : 'Cash on Delivery (COD)'}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Purchased Products ({lastPlacedOrder.items.length})
            </span>
            {lastPlacedOrder.items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.quantity}x</span>
                  <span className="text-slate-800">{item.product.name}</span>
                  <span className="text-slate-400 text-[11px]">({item.product.unit})</span>
                </div>
                <span className="font-bold text-slate-900">
                  {config.currency}{(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{config.currency}{lastPlacedOrder.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{lastPlacedOrder.deliveryFee === 0 ? 'FREE' : `${config.currency}${lastPlacedOrder.deliveryFee}`}</span>
            </div>
            {lastPlacedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Voucher Savings</span>
                <span>-{config.currency}{lastPlacedOrder.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-emerald-700">{config.currency}{lastPlacedOrder.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping at {config.appName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
