import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Receipt, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Utensils, 
  User, 
  Phone,
  CreditCard,
  Percent,
  Calendar
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const BillDetailsModal: React.FC = () => {
  const { 
    activeDetailsBill, 
    isBillDetailsModalOpen, 
    closeBillDetailsModal, 
    openReceiptModal,
    showToast 
  } = useApp();

  if (!isBillDetailsModalOpen || !activeDetailsBill) return null;

  const branchObj = BRANCHES.find(b => b.id === activeDetailsBill.branchId) || BRANCHES[0];
  const cgst = (activeDetailsBill.gstAmount / 2).toFixed(2);
  const sgst = (activeDetailsBill.gstAmount / 2).toFixed(2);

  const handleViewBill = () => {
    const billToView = activeDetailsBill;
    closeBillDetailsModal();
    openReceiptModal(billToView);
  };

  const handleReprint = () => {
    const billToPrint = activeDetailsBill;
    closeBillDetailsModal();
    openReceiptModal(billToPrint);
    // Small delay to allow thermal modal to mount before print dialog opens
    setTimeout(() => {
      try {
        window.print();
      } catch {
        // Safe fallback
      }
    }, 250);
    showToast('Printing Receipt', `Thermal receipt triggered for Bill #${billToPrint.billNumber}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold tracking-tight text-white">
                  {activeDetailsBill.billNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                  {activeDetailsBill.status === 'paid' ? 'SETTLED & PAID' : activeDetailsBill.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Tax Invoice Details • Zaffran Flavours
              </p>
            </div>
          </div>

          <button
            onClick={closeBillDetailsModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          
          {/* Metadata Grid (Date, Branch, Order Type, Table, Guest) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Date & Time</span>
              </span>
              <div className="font-bold text-slate-800 mt-0.5 text-[11px]">
                {activeDetailsBill.date}
              </div>
              <div className="text-[10px] text-slate-500">
                {activeDetailsBill.time}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Branch</span>
              </span>
              <div className="font-bold text-slate-800 mt-0.5 text-[11px] truncate" title={branchObj.name}>
                {branchObj.name}
              </div>
              <div className="text-[10px] text-slate-500">
                GSTIN: {branchObj.gstin}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Utensils className="w-3 h-3 text-slate-400" />
                <span>Order Type</span>
              </span>
              <div className="font-bold text-slate-800 mt-0.5 text-[11px] uppercase">
                {activeDetailsBill.orderType.replace('_', ' ')}
              </div>
              {activeDetailsBill.orderType === 'dine_in' && activeDetailsBill.tableNumber && (
                <div className="text-[10px] text-emerald-700 font-bold">
                  {activeDetailsBill.tableNumber}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Customer</span>
              </span>
              <div className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">
                {activeDetailsBill.customerName || 'Walk-in Guest'}
              </div>
              {activeDetailsBill.customerMobile && (
                <div className="text-[10px] text-slate-500">
                  {activeDetailsBill.customerMobile}
                </div>
              )}
            </div>
          </div>

          {/* Associated KOT Numbers */}
          {(activeDetailsBill.kotNumbers || activeDetailsBill.kotNumber) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px]">
              <span className="font-bold uppercase text-[10px] text-amber-800">Kitchen Tickets:</span>
              <span className="font-semibold">
                {activeDetailsBill.kotNumbers ? activeDetailsBill.kotNumbers.join(', ') : activeDetailsBill.kotNumber}
              </span>
            </div>
          )}

          {/* Items Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-3 py-2 font-bold text-[10px] uppercase text-slate-600 grid grid-cols-12 border-b border-slate-200">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {activeDetailsBill.items.map((it, idx) => (
                <div key={idx} className="px-3 py-2 grid grid-cols-12 text-slate-800 items-center">
                  <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="font-semibold text-slate-900 truncate">
                      {it.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-tight ${
                      it.serveType === 'PARCEL'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {it.serveType === 'PARCEL' ? 'Parcel' : 'Dine-In'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center text-slate-600 font-bold">
                    ×{it.quantity}
                  </span>
                  <span className="col-span-2 text-right text-slate-500">
                    ₹{it.rate.toFixed(2)}
                  </span>
                  <span className="col-span-2 text-right font-bold text-slate-900">
                    ₹{it.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Totals & Tax Calculation Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{activeDetailsBill.subtotal.toFixed(2)}</span>
            </div>

            {activeDetailsBill.discountAmount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Discount {activeDetailsBill.discountPercent ? `(${activeDetailsBill.discountPercent}%)` : ''}</span>
                </span>
                <span className="font-bold">- ₹{activeDetailsBill.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>CGST (2.5%)</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>SGST (2.5%)</span>
              <span>₹{sgst}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm text-slate-900">
              <span className="uppercase text-xs tracking-wider">Grand Total</span>
              <span className="text-lg text-emerald-700 font-black">
                ₹{activeDetailsBill.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method & Settlement Details */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                Payment Method & Details
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-black text-xs uppercase text-emerald-900">
                  {activeDetailsBill.paymentMethod}
                </span>
              </div>

              {activeDetailsBill.paymentMethod === 'split' && activeDetailsBill.splitDetails && (
                <div className="text-[11px] text-emerald-800 mt-1 flex flex-wrap gap-2 font-mono">
                  {activeDetailsBill.splitDetails.cash > 0 && <span>Cash: ₹{activeDetailsBill.splitDetails.cash}</span>}
                  {activeDetailsBill.splitDetails.upi > 0 && <span>UPI: ₹{activeDetailsBill.splitDetails.upi}</span>}
                  {activeDetailsBill.splitDetails.card > 0 && <span>Card: ₹{activeDetailsBill.splitDetails.card}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">
                Cashier: <strong className="text-slate-700">{activeDetailsBill.cashierName || 'Counter'}</strong>
              </span>
              <div className="px-2.5 py-1 rounded bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider shadow-2xs">
                PAID
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons: [ Close ] [ View Bill ] [ Reprint Receipt ] */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 font-mono">
          <button
            onClick={closeBillDetailsModal}
            className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleViewBill}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Open full 80mm thermal receipt preview"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>View Bill</span>
            </button>

            <button
              onClick={handleReprint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              title="Reprint thermal receipt slip"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Reprint Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
