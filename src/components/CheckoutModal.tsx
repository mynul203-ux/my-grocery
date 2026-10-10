import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  Banknote,
  Smartphone,
  ArrowRight,
  Home,
  Navigation,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DELIVERY_AREAS } from '../data/products';
import { OrderCustomer } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    config,
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    deliveryCharge,
    discountAmount,
    grandTotal,
    deliveryArea,
    setDeliveryArea,
    createOrder,
    addToast,
  } = useApp();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [municipalityArea, setMunicipalityArea] = useState(deliveryArea || DELIVERY_AREAS[0]);
  const [roadOrPara, setRoadOrPara] = useState('');
  const [houseDetails, setHouseDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bkash'>('cash_on_delivery');
  const [bkashNumber, setBkashNumber] = useState('');

  // Field Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  // Validation function
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      errs.phone = 'Mobile Number is required';
    } else {
      // Basic check for Bangladesh or international mobile numbers
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!/^(\+?88)?01[3-9]\d{8}$/.test(cleanPhone) && cleanPhone.length < 10) {
        errs.phone = 'Please enter a valid mobile number (e.g. 01712-345678)';
      }
    }

    if (!municipalityArea.trim()) {
      errs.municipalityArea = 'Municipality / Area name is required';
    }

    if (!roadOrPara.trim()) {
      errs.roadOrPara = 'Road name or Para/Sector is required';
    }

    if (!houseDetails.trim()) {
      errs.houseDetails = 'House/Holding/Flat details are required';
    }

    if (paymentMethod === 'bkash' && bkashNumber.trim()) {
      const cleanBkash = bkashNumber.replace(/[\s-]/g, '');
      if (cleanBkash.length < 10) {
        errs.bkashNumber = 'Please enter a valid bKash wallet number';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to build WhatsApp formatted summary
  const generateOrderSummary = (orderId: string, customerData: OrderCustomer) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsSummary = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.product.name}* (${item.product.unit})\n   └ ${item.quantity}x @ ${config.currency}${item.product.price} = *${config.currency}${item.product.price * item.quantity}*`
      )
      .join('\n');

    const paymentText =
      customerData.paymentMethod === 'bkash'
        ? `bKash Mobile Banking ${bkashNumber ? `(${bkashNumber})` : ''}`
        : 'Cash on Delivery (COD)';

    const deliveryFeeText =
      deliveryCharge === 0 ? 'FREE (Special Offer)' : `${config.currency}${deliveryCharge}`;

    return `🛒 *NEW GROCERY ORDER - ${config.appName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* #${orderId}
📅 *Date:* ${formattedDate}

👤 *Customer Details:*
• *Name:* ${customerData.fullName}
• *Mobile:* ${customerData.phone}
• *Municipality/Area:* ${customerData.area}
• *Road / Para:* ${customerData.roadOrPara}
• *House / Flat Details:* ${customerData.houseDetails}
• *Payment Method:* ${paymentText}

📦 *Ordered Items (${cart.length} unique products):*
${itemsSummary}

━━━━━━━━━━━━━━━━━━━━━
💰 *Bill Summary:*
• Items Subtotal: ${config.currency}${cartSubtotal.toLocaleString()}
• Delivery Fee: ${deliveryFeeText}
${discountAmount > 0 ? `• Voucher Discount: -${config.currency}${discountAmount.toLocaleString()}\n` : ''}• *GRAND TOTAL:* *${config.currency}${grandTotal.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━━
⚡ *Requested Delivery:* Within ${config.estimatedDeliveryMinutes} mins
💬 Please confirm availability and dispatch our delivery rider. Thank you!`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please correct the highlighted fields before proceeding.', 'error');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `MG-${Math.floor(100000 + Math.random() * 900000)}`;

    const customerData: OrderCustomer = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      area: municipalityArea.trim(),
      roadOrPara: roadOrPara.trim(),
      houseDetails: houseDetails.trim(),
      address: `${houseDetails.trim()}, ${roadOrPara.trim()}, ${municipalityArea.trim()}`,
      paymentMethod,
    };

    // 1. Generate text summary
    const orderSummaryText = generateOrderSummary(generatedOrderId, customerData);

    // 2. Prepare WhatsApp URL with pre-filled message
    const placeholderPhone = config.whatsappNumber || '8801712345678';
    const encodedMessage = encodeURIComponent(orderSummaryText);
    const whatsappUrl = `https://wa.me/${placeholderPhone}?text=${encodedMessage}`;

    // 3. Automatically trigger WhatsApp redirect / open
    try {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Could not launch WhatsApp anchor tag', err);
    }

    // 4. Save order to persistent history & clear cart
    setTimeout(() => {
      createOrder({
        items: [...cart],
        subtotal: cartSubtotal,
        deliveryFee: deliveryCharge,
        discount: discountAmount,
        total: grandTotal,
        customer: customerData,
        whatsappUrl,
        orderSummaryText,
      });

      setIsSubmitting(false);
      addToast(`Order #${generatedOrderId} placed with ${config.appName}!`, 'success');
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Checkout &amp; Delivery Details
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Complete your details to place order via WhatsApp with <strong className="text-emerald-700">{config.appName}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Customer Personal Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
                Customer Contact
              </h3>
              <span className="text-[11px] text-slate-400">* Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Mynul Islam"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-colors ${
                      errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="01712-345678"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-colors ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address Section */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
              Delivery Address Details
            </h3>

            <div className="space-y-3">
              {/* Municipality Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Municipality / Area <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="municipality-options"
                    value={municipalityArea}
                    onChange={(e) => {
                      setMunicipalityArea(e.target.value);
                      setDeliveryArea(e.target.value);
                      if (errors.municipalityArea) setErrors((prev) => ({ ...prev, municipalityArea: '' }));
                    }}
                    placeholder="e.g. Banani Municipality, Dhaka North"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-colors ${
                      errors.municipalityArea ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <Navigation className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <datalist id="municipality-options">
                    {DELIVERY_AREAS.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
                {errors.municipalityArea && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.municipalityArea}
                  </p>
                )}
              </div>

              {/* Road / Para Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Road Name / Para / Sector <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={roadOrPara}
                    onChange={(e) => {
                      setRoadOrPara(e.target.value);
                      if (errors.roadOrPara) setErrors((prev) => ({ ...prev, roadOrPara: '' }));
                    }}
                    placeholder="e.g. Road 11, Block D / Mollah Para"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-colors ${
                      errors.roadOrPara ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.roadOrPara && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.roadOrPara}
                  </p>
                )}
              </div>

              {/* House Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  House Details (Building, Holding, Flat/Floor) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={houseDetails}
                    onChange={(e) => {
                      setHouseDetails(e.target.value);
                      if (errors.houseDetails) setErrors((prev) => ({ ...prev, houseDetails: '' }));
                    }}
                    placeholder="e.g. House 28, Flat 4B, 3rd Floor, Holding #15"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-colors ${
                      errors.houseDetails ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {errors.houseDetails && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.houseDetails}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">3</span>
              Payment Method <span className="text-rose-500">*</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-600/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="sr-only"
                />
                <Banknote className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span className="text-xs font-bold">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">Pay cash to rider upon receipt</span>
              </label>

              {/* bKash Mobile Payment */}
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50/80 text-pink-950 font-bold ring-2 ring-pink-600/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="sr-only"
                />
                <Smartphone className="w-5 h-5 mb-1.5 text-pink-600" />
                <span className="text-xs font-bold">bKash Payment</span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">Send money / Merchant payment</span>
              </label>
            </div>

            {/* bKash Optional Number Prompt */}
            {paymentMethod === 'bkash' && (
              <div className="mt-2.5 p-3 bg-pink-50/60 border border-pink-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
                <span className="font-bold text-pink-900 block">
                  bKash Payment Instructions
                </span>
                <p className="text-[11px] text-pink-800 leading-relaxed">
                  Our bKash Merchant Number will be shared in WhatsApp. You can also provide your bKash wallet number below for verification:
                </p>
                <input
                  type="tel"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="Your bKash Wallet Number (Optional)"
                  className="w-full px-3 py-1.5 bg-white border border-pink-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            )}
          </div>

          {/* Quick Bill Breakdown Preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.length} items)</span>
              <span className="font-semibold text-slate-900">{config.currency}{cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span>
                {deliveryCharge === 0 ? (
                  <strong className="text-emerald-700 font-bold uppercase">FREE</strong>
                ) : (
                  <span className="font-semibold text-slate-900">{config.currency}{deliveryCharge}</span>
                )}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Voucher Savings</span>
                <span>-{config.currency}{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-emerald-700 font-black">{config.currency}{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* WhatsApp Submit Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Submitting this order will automatically launch <strong>WhatsApp</strong> with your pre-formatted order summary addressed to our fulfillment hub (+{config.whatsappNumber}).
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>Preparing WhatsApp Order...</span>
            ) : (
              <>
                <span>Confirm &amp; Send Order via WhatsApp ({config.currency}{grandTotal.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
