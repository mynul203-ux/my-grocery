import React from 'react';
import { X, ReceiptText, Calendar, PackageCheck, Repeat, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrdersModal: React.FC = () => {
  const {
    config,
    orders,
    isOrdersModalOpen,
    setIsOrdersModalOpen,
    addToCart,
    setIsCartOpen,
  } = useApp();

  if (!isOrdersModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ReceiptText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Order History
              </h2>
              <p className="text-xs text-slate-500">
                All purchases placed on <strong className="text-slate-800">{config.appName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrdersModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <ReceiptText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No previous orders found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t placed any orders yet. Add fresh produce or kitchen staples to your cart to experience fast delivery.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{order.id}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    <PackageCheck className="w-3 h-3 text-emerald-600" />
                    Confirmed
                  </span>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>{item.quantity}x {item.product.name} ({item.product.unit})</span>
                      <span className="font-semibold text-slate-800">
                        {order.currencyAtOrderTime || config.currency}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer of card */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Paid</span>
                    <span className="text-sm font-black text-slate-900">
                      {order.currencyAtOrderTime || config.currency}{order.total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      order.items.forEach((item) => {
                        addToCart(item.product, item.quantity);
                      });
                      setIsOrdersModalOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Re-order all</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
