import React, { useState } from 'react';
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
  Calendar,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const BillDetailsModal: React.FC = () => {
  const { 
    activeDetailsBill, 
    isBillDetailsModalOpen, 
    closeBillDetailsModal, 
    openReceiptModal,
    voidBill,
    currentUser,
    showToast 
  } = useApp();

  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState('Customer Request');
  const [supervisorPin, setSupervisorPin] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isBillDetailsModalOpen || !activeDetailsBill) return null;

  const isManagerOrOwner = currentUser?.role === 'manager' || currentUser?.role === 'owner';
  const isVoided = activeDetailsBill.status === 'cancelled';
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

  const handleConfirmVoid = () => {
    if (!isManagerOrOwner) {
      if (supervisorPin.trim() !== '1234') {
        setPinError(true);
        showToast('Invalid PIN', 'Supervisor authorization PIN is incorrect (Hint: 1234).', 'error');
        return;
      }
    }

    const authorizedName = isManagerOrOwner ? (currentUser?.name || 'Vikram Sharma (Manager)') : 'Vikram Sharma (Manager Authorizer)';
    voidBill(activeDetailsBill, voidReason, authorizedName);
    setShowVoidDialog(false);
    setSupervisorPin('');
    setPinError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-800 animate-in zoom-in-95 duration-200 text-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs ${isVoided ? 'bg-rose-600' : 'bg-emerald-600'}`}>
              {isVoided ? <Ban className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold tracking-tight text-white">
                  {activeDetailsBill.billNumber}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border uppercase ${
                  isVoided 
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800' 
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                }`}>
                  {isVoided ? 'VOIDED / CANCELLED' : (activeDetailsBill.status === 'paid' ? 'SETTLED & PAID' : activeDetailsBill.status.toUpperCase())}
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
          
          {/* Voided Notification Banner */}
          {isVoided && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 flex items-start gap-3">
              <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-extrabold text-sm text-rose-200">INVOICE VOIDED / CANCELLED</div>
                <div className="text-[11px] text-rose-300/90 mt-0.5">
                  Cancelled By: <strong className="text-white">{activeDetailsBill.cancelledBy || 'Supervisor'}</strong> • Reason: <span className="italic">{activeDetailsBill.cancelReason || 'Supervisor void'}</span>
                </div>
                {activeDetailsBill.voidedAt && (
                  <div className="text-[10px] text-rose-400 mt-0.5 font-mono">
                    Void timestamp: {activeDetailsBill.voidedAt}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supervisor Void Action Dialog */}
          {showVoidDialog && (
            <div className="p-4 bg-slate-900 border-2 border-rose-700/80 rounded-xl text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-bold text-white text-sm">Void Invoice #{activeDetailsBill.billNumber}</span>
                </div>
                {isManagerOrOwner ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                    MANAGER DIRECT PERMISSION
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                    SUPERVISOR PIN REQUIRED
                  </span>
                )}
              </div>

              {isManagerOrOwner ? (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Logged in as <strong>{currentUser?.name || 'Vikram Sharma (Manager)'}</strong>. You have direct supervisor authorization to void bills without a PIN.</span>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                    Supervisor Authorization PIN (Branch Manager: Vikram Sharma):
                  </label>
                  <input 
                    type="password"
                    maxLength={6}
                    value={supervisorPin}
                    onChange={e => { setSupervisorPin(e.target.value); setPinError(false); }}
                    placeholder="Enter 4-digit PIN (Hint: 1234)"
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white font-mono text-xs ${pinError ? 'border-rose-500' : 'border-slate-700'}`}
                  />
                  {pinError && <p className="text-[10px] text-rose-400 mt-1 font-sans">Incorrect PIN. Branch Manager PIN is 1234.</p>}
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-semibold">Reason for Cancellation:</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Customer Dispute', 'Wrong Order Punched', 'Accidental Duplicate', 'Quality/Delay Issue', 'Goodwill / Manager Override'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setVoidReason(r)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${voidReason === r ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="Custom cancellation notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoidDialog(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoid}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Void & Notify KDS</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Metadata Grid (Date, Branch, Order Type, Table, Guest) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Date & Time</span>
              </span>
              <div className="font-bold text-white mt-0.5 text-[11px]">
                {activeDetailsBill.date}
              </div>
              <div className="text-[10px] text-slate-400">
                {activeDetailsBill.time}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Branch</span>
              </span>
              <div className="font-bold text-white mt-0.5 text-[11px] truncate" title={branchObj.name}>
                {branchObj.name}
              </div>
              <div className="text-[10px] text-slate-400">
                GSTIN: {branchObj.gstin}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <Utensils className="w-3 h-3 text-slate-400" />
                <span>Order Type</span>
              </span>
              <div className="font-bold text-white mt-0.5 text-[11px] uppercase">
                {activeDetailsBill.orderType.replace('_', ' ')}
              </div>
              {activeDetailsBill.orderType === 'dine_in' && activeDetailsBill.tableNumber && (
                <div className="text-[10px] text-emerald-400 font-bold">
                  {activeDetailsBill.tableNumber}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Customer</span>
              </span>
              <div className="font-bold text-white mt-0.5 text-[11px] truncate">
                {activeDetailsBill.customerName || 'Walk-in Guest'}
              </div>
              {activeDetailsBill.customerMobile && (
                <div className="text-[10px] text-slate-400">
                  {activeDetailsBill.customerMobile}
                </div>
              )}
            </div>
          </div>

          {/* Associated KOT Numbers */}
          {(activeDetailsBill.kotNumbers || activeDetailsBill.kotNumber) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px]">
              <span className="font-bold uppercase text-[10px] text-amber-400">Kitchen Tickets:</span>
              <span className="font-semibold">
                {activeDetailsBill.kotNumbers ? activeDetailsBill.kotNumbers.join(', ') : activeDetailsBill.kotNumber}
              </span>
            </div>
          )}

          {/* Items Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-900 px-3 py-2 font-bold text-[10px] uppercase text-slate-400 grid grid-cols-12 border-b border-slate-800">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-800 bg-[#0f172a]">
              {activeDetailsBill.items.map((it, idx) => (
                <div key={idx} className="px-3 py-2 grid grid-cols-12 text-slate-200 items-center">
                  <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="font-semibold text-white truncate">
                      {it.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-tight ${
                      it.serveType === 'PARCEL'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {it.serveType === 'PARCEL' ? 'Parcel' : 'Dine-In'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center text-slate-400 font-bold">
                    ×{it.quantity}
                  </span>
                  <span className="col-span-2 text-right text-slate-400">
                    ₹{it.rate.toFixed(2)}
                  </span>
                  <span className="col-span-2 text-right font-bold text-emerald-400">
                    ₹{it.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Totals & Tax Calculation Breakdown */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">₹{activeDetailsBill.subtotal.toFixed(2)}</span>
            </div>

            {activeDetailsBill.discountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Discount {activeDetailsBill.discountPercent ? `(${activeDetailsBill.discountPercent}%)` : ''}</span>
                </span>
                <span className="font-bold">- ₹{activeDetailsBill.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>CGST (2.5%)</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>SGST (2.5%)</span>
              <span>₹{sgst}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-sm text-white">
              <span className="uppercase text-xs tracking-wider">Grand Total</span>
              <span className="text-lg text-emerald-400 font-black">
                ₹{activeDetailsBill.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method & Settlement Details */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                Payment Method & Details
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-black text-xs uppercase text-emerald-300">
                  {activeDetailsBill.paymentMethod}
                </span>
              </div>

              {activeDetailsBill.paymentMethod === 'split' && activeDetailsBill.splitDetails && (
                <div className="text-[11px] text-emerald-300 mt-1 flex flex-wrap gap-2 font-mono">
                  {activeDetailsBill.splitDetails.cash > 0 && <span>Cash: ₹{activeDetailsBill.splitDetails.cash}</span>}
                  {activeDetailsBill.splitDetails.upi > 0 && <span>UPI: ₹{activeDetailsBill.splitDetails.upi}</span>}
                  {activeDetailsBill.splitDetails.card > 0 && <span>Card: ₹{activeDetailsBill.splitDetails.card}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                Cashier: <strong className="text-slate-200">{activeDetailsBill.cashierName || 'Counter'}</strong>
              </span>
              <div className="px-2.5 py-1 rounded bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider shadow-2xs">
                PAID
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons: [ Close ] [ Void Bill ] [ View Bill ] [ Reprint Receipt ] */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={closeBillDetailsModal}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              Close
            </button>

            {!isVoided && !showVoidDialog && (
              <button
                type="button"
                onClick={() => setShowVoidDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 hover:text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                title="Supervisor Void / Cancel Invoice"
              >
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span>Void Bill</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleViewBill}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Open full 80mm thermal receipt preview"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Bill</span>
            </button>

            <button
              onClick={handleReprint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
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
