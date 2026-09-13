import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, SplitPaymentDetail, ItemServeType } from '../types';
import { 
  X, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Split, 
  Receipt, 
  Check, 
  Percent,
  Building2,
  Calendar,
  Clock,
  UtensilsCrossed,
  ArrowRight,
  AlertCircle,
  Coins
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiscountPercent?: number;
  initialCustomDiscount?: number;
}

export const BillModal: React.FC<BillModalProps> = ({ 
  isOpen, 
  onClose,
  initialDiscountPercent = 0,
  initialCustomDiscount = 0
}) => {
  const { 
    cart, 
    cartTableNumber, 
    cartOrderType, 
    cartCustomerName, 
    cartCustomerMobile,
    currentBranch, 
    kots, 
    getActiveUnbilledKots,
    generateBill,
    billSequence,
    setTableStatusByNumber,
    currentUser,
    requestBill
  } = useApp();

  const isWaiter = currentUser?.role === 'waiter';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountPercent, setDiscountPercent] = useState<number>(initialDiscountPercent);
  const [customDiscount, setCustomDiscount] = useState<number>(initialCustomDiscount);

  // Cash payment state
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  // Split payment state
  const [splitDetails, setSplitDetails] = useState<SplitPaymentDetail>({
    cash: 0,
    upi: 0,
    card: 0
  });

  const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
  const branchObj = BRANCHES.find(b => b.id === effectiveBranch) || BRANCHES[0];

  // Retrieve all active unbilled KOTs for the selected dining session / order
  const activeSessionKots = useMemo(() => {
    return getActiveUnbilledKots(cartTableNumber, cartOrderType, cartCustomerMobile);
  }, [getActiveUnbilledKots, cartTableNumber, cartOrderType, cartCustomerMobile]);

  // Combine items from ALL active unbilled KOTs belonging to this session + any cart items
  const billItems = useMemo(() => {
    const itemsList: { id: string; name: string; quantity: number; rate: number; amount: number; serveType: ItemServeType }[] = [];

    const addOrMerge = (id: string, name: string, quantity: number, rate: number, serveType: ItemServeType) => {
      const existing = itemsList.find(
        i => i.name.toLowerCase() === name.toLowerCase() && i.rate === rate && i.serveType === serveType
      );
      if (existing) {
        existing.quantity += quantity;
        existing.amount = existing.quantity * existing.rate;
      } else {
        itemsList.push({
          id,
          name,
          quantity,
          rate,
          amount: rate * quantity,
          serveType
        });
      }
    };

    // 1. Gather all items from active unbilled KOTs
    if (activeSessionKots.length > 0) {
      activeSessionKots.forEach((kot) => {
        kot.items.forEach((it, idx) => {
          if (it.status === 'voided') return; // Exclude voided items from bill
          addOrMerge(
            it.menuItemId || `${kot.id}_item_${idx}`,
            it.name,
            it.quantity,
            it.rate,
            it.serveType || 'DINE_IN'
          );
        });
      });

      // Also append any unsent items currently in the cart
      if (cart.length > 0) {
        cart.forEach((c) => {
          addOrMerge(
            c.item.id,
            c.item.name,
            c.quantity,
            c.item.price,
            c.serveType || 'DINE_IN'
          );
        });
      }

      return itemsList;
    }

    // 2. If no active unbilled KOTs exist, fallback to current cart
    if (cart.length > 0) {
      cart.forEach(c => {
        addOrMerge(
          c.item.id,
          c.item.name,
          c.quantity,
          c.item.price,
          c.serveType || 'DINE_IN'
        );
      });
      return itemsList;
    }

    return [];
  }, [activeSessionKots, cart]);

  const subtotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  }, [billItems]);

  const gstAmount = Math.round((subtotal * 5) / 100);
  const calculatedDiscount = discountPercent > 0 
    ? Math.round((subtotal * discountPercent) / 100) 
    : customDiscount;
  const grandTotal = Math.max(0, subtotal + gstAmount - calculatedDiscount);

  // When modal opens, initialize cash received to grandTotal and mark table as billing
  useEffect(() => {
    if (isOpen) {
      if (initialDiscountPercent !== undefined) setDiscountPercent(initialDiscountPercent);
      if (initialCustomDiscount !== undefined) setCustomDiscount(initialCustomDiscount);
      setCashReceived(grandTotal);
      if (cartOrderType === 'dine_in' && cartTableNumber) {
        setTableStatusByNumber(cartTableNumber, 'billing');
      }
    }
    // Only run when the modal is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cash change calculation
  const cashChange = Math.max(0, cashReceived - grandTotal);
  const isCashSufficient = cashReceived >= grandTotal;

  // Split calculation
  const totalPaidInSplit = (splitDetails.cash || 0) + (splitDetails.upi || 0) + (splitDetails.card || 0);
  const remainingInSplit = Math.max(0, grandTotal - totalPaidInSplit);
  const isSplitValid = paymentMethod === 'split' ? remainingInSplit === 0 && totalPaidInSplit === grandTotal : true;

  // Initialize split values when switching to split
  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'split') {
      const half = Math.floor(grandTotal / 2);
      setSplitDetails({
        cash: half,
        upi: grandTotal - half,
        card: 0
      });
    } else if (method === 'cash') {
      if (cashReceived < grandTotal) {
        setCashReceived(grandTotal);
      }
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && !isCashSufficient) {
      return;
    }
    if (paymentMethod === 'split' && !isSplitValid) {
      return;
    }
    const createdBill = generateBill(paymentMethod, splitDetails, calculatedDiscount);
    if (createdBill) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const invoiceNumber = `INV-${billSequence}`;

  return (
    <div className="fixed inset-0 z-50 font-mono select-none text-slate-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog (Locked vertically 100vh, centered horizontally) */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-[580px] max-w-[92vw] h-screen max-h-screen my-0 rounded-none border-y-0 border-x border-slate-800 bg-[#0f172a] shadow-2xl flex flex-col justify-between overflow-hidden z-50">
        {/* 1. PINNED TOP HEADER */}
        <div className="flex-shrink-0 border-b border-slate-800">
          {/* Restaurant & Branch Header */}
          <div className="px-4 py-3 bg-[#162032] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm tracking-tight uppercase leading-none">
                    Zaffran Flavours
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    TAX INVOICE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {branchObj.name} • Phone: {branchObj.phone}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Invoice Metadata Strip */}
          <div className="bg-[#111a2e] px-4 py-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invoice</span>
              <span className="text-slate-100 font-semibold">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date & Time</span>
              <span className="text-slate-100 font-semibold">{currentDate} {currentTime}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Type</span>
              <span className="text-slate-100 font-semibold uppercase">
                {cartOrderType.replace('_', '-')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Destination</span>
              <span className="font-bold text-emerald-400 truncate block">
                {cartOrderType === 'dine_in' ? (cartTableNumber || 'Table 5') : 'Takeaway Counter'}
              </span>
            </div>
          </div>

          {/* Combined KOTs Strip or Advance Payment Strip */}
          {activeSessionKots.length > 0 ? (
            <div className="bg-emerald-950/40 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <span className="font-bold">Combined KOTs ({activeSessionKots.length}):</span>
                <span className="font-bold text-emerald-200 font-mono">
                  {activeSessionKots.map(k => k.kotNumber).join(', ')}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                {billItems.length} Total Items
              </span>
            </div>
          ) : (cartOrderType === 'takeaway' || cartOrderType === 'parcel') ? (
            <div className="bg-sky-950/40 px-4 py-1.5 flex items-center justify-between gap-2 text-xs border-t border-sky-900/40">
              <div className="flex items-center gap-1.5 text-sky-300">
                <span className="font-bold uppercase tracking-wide">Advance Payment:</span>
                <span className="text-slate-300">Invoice paid first; order is PAID - READY TO SEND</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-sky-950/60 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                Express Takeaway
              </span>
            </div>
          ) : null}
        </div>

        {/* 2. SCROLLABLE MIDDLE BODY (Items Table + Subtotal + Discount + GST + Grand Total) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Customer info if provided */}
          {(cartCustomerName || cartCustomerMobile || activeSessionKots.some(k => k.customerName || k.customerMobile)) && (
            <div className="p-2 rounded-lg bg-[#111a2e] border border-slate-800 flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-300">Guest: <strong className="text-white">{cartCustomerName || activeSessionKots.find(k => k.customerName)?.customerName || 'Walk-in'}</strong></span>
              <span className="text-slate-400">Contact: {cartCustomerMobile || activeSessionKots.find(k => k.customerMobile)?.customerMobile || 'N/A'}</span>
            </div>
          )}

          {/* ITEM DATA GRID */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0f172a]">
            <div className="bg-[#111a2e] border-b border-slate-800 grid grid-cols-12 px-3 py-1.5 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-2 text-right">RATE</span>
              <span className="col-span-2 text-right">AMOUNT</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {billItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 px-3 py-1.5 text-xs bg-transparent text-slate-200 border-b border-slate-800/80 items-center">
                  <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="font-semibold text-white truncate">{item.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-tight ${
                      item.serveType === 'PARCEL'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.serveType === 'PARCEL' ? 'Parcel' : 'Dine-In'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center text-slate-300 font-bold">{item.quantity}</span>
                  <span className="col-span-2 text-right text-slate-400 font-mono">₹{item.rate}</span>
                  <span className="col-span-2 text-right font-bold text-emerald-400 font-mono">₹{item.amount}</span>
                </div>
              ))}
              {billItems.length === 0 && (
                <div className="p-3 text-center text-slate-500">No items selected</div>
              )}
            </div>
          </div>

          {/* TOTALS & DISCOUNTS CALCULATION BLOCK */}
          <div className="p-3 bg-[#111a2e] border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({billItems.length} items)</span>
              <span className="font-bold text-white font-mono">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount selector */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Percent className="w-3 h-3 text-slate-400" />
                <span>Discount</span>
              </span>
              <div className="flex gap-1.5">
                {[0, 5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDiscountPercent(pct);
                      setCustomDiscount(0);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      discountPercent === pct && customDiscount === 0
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {pct === 0 ? '0%' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Discount Applied ({discountPercent}%)</span>
                <span>-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>GST (2.5% CGST + 2.5% SGST)</span>
              <span className="font-mono text-slate-300">₹{gstAmount.toFixed(2)}</span>
            </div>

            {/* GRAND TOTAL ROW */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-white">
              <span className="text-white font-bold text-lg tracking-wider">GRAND TOTAL</span>
              <span className="text-xl text-emerald-400 font-mono font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 3. PAYMENT METHODS & TENDER INPUT */}
        <div className="flex-shrink-0 bg-[#0c1424] border-t border-slate-800 p-4 space-y-3">
          {/* Payment Method Tabs */}
          <div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-950/50 border-2 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <Banknote className={`w-4 h-4 shrink-0 ${paymentMethod === 'cash' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">CASH</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('upi')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-emerald-950/50 border-2 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <QrCode className={`w-4 h-4 shrink-0 ${paymentMethod === 'upi' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">UPI</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('card')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-950/50 border-2 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <CreditCard className={`w-4 h-4 shrink-0 ${paymentMethod === 'card' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">CARD</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('split')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'split'
                    ? 'bg-emerald-950/50 border-2 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <Split className={`w-4 h-4 shrink-0 ${paymentMethod === 'split' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">SPLIT</span>
              </button>
            </div>
          </div>

          {/* Selected Method-Specific Panel */}

          {/* A. CASH PAYMENT DETAILS */}
          {paymentMethod === 'cash' && (
            <div className="p-2.5 bg-[#111a2e] border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={cashReceived || ''}
                    onChange={e => setCashReceived(Number(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg font-bold text-xs text-white focus:outline-emerald-500"
                    placeholder="Enter cash received"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <button
                  type="button"
                  onClick={() => setCashReceived(grandTotal)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-[11px] font-bold text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  Exact (₹{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(Math.ceil(grandTotal / 500) * 500 || 500)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-[11px] font-bold text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  ₹{Math.ceil(grandTotal / 500) * 500 || 500}
                </button>
              </div>

              {/* Cash Calculation Summary */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Amount Received</span>
                  <span className="font-bold text-xs text-white">₹{cashReceived}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Grand Total</span>
                  <span className="font-bold text-xs text-white">₹{grandTotal}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Balance / Change</span>
                  <span className={`font-black text-xs ${isCashSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{cashChange}
                  </span>
                </div>
              </div>

              {!isCashSufficient && (
                <div className="px-2 py-1 bg-rose-950/50 border border-rose-800 rounded-lg text-[10px] text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Amount received is short by ₹{grandTotal - cashReceived}.</span>
                </div>
              )}
            </div>
          )}

          {/* B. UPI PAYMENT DETAILS */}
          {paymentMethod === 'upi' && (
            <div className="p-2.5 bg-[#111a2e] border border-slate-800 rounded-xl flex items-center gap-3 animate-in fade-in duration-100">
              <div className="w-16 h-16 bg-slate-950 p-1.5 rounded-lg border border-slate-700 shadow-2xs shrink-0 flex flex-col items-center justify-center">
                <div className="grid grid-cols-6 gap-0.5 w-full h-full p-0.5 bg-slate-900 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-slate-200'
                          : 'bg-emerald-400'
                      } rounded-xs`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-0.5 text-left">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">Scan & Pay ₹{grandTotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-slate-400">VPA: <span className="font-mono text-emerald-300 font-semibold">zaffran.billing@icici</span></p>
                <p className="text-[10px] text-emerald-400">Awaiting customer QR scan or push confirmation</p>
              </div>
            </div>
          )}

          {/* C. CARD PAYMENT DETAILS */}
          {paymentMethod === 'card' && (
            <div className="p-2.5 bg-[#111a2e] border border-slate-800 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Connected Terminal</div>
                  <div className="font-bold text-white text-xs">PAX A920 POS Terminal #02</div>
                  <div className="text-[10px] font-mono text-emerald-400">Ready for Tap / Chip / Swipe</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block uppercase">Charge</span>
                <span className="font-bold text-sm text-emerald-400 font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* D. SPLIT PAYMENT DETAILS */}
          {paymentMethod === 'split' && (
            <div className="p-2.5 bg-[#111a2e] border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-100">
              <div className="grid grid-cols-3 gap-2">
                {/* Cash */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Cash</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, cash: (prev.cash || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.cash || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, cash: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-5 pr-1 py-1 rounded border border-slate-700 text-xs font-bold text-white bg-slate-800 focus:outline-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* UPI */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">UPI</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, upi: (prev.upi || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.upi || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, upi: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-5 pr-1 py-1 rounded border border-slate-700 text-xs font-bold text-white bg-slate-800 focus:outline-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Card */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Card</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, card: (prev.card || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.card || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, card: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-5 pr-1 py-1 rounded border border-slate-700 text-xs font-bold text-white bg-slate-800 focus:outline-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Split Summary Bar */}
              <div className="px-2 py-1 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-300">
                  Allocated: ₹{totalPaidInSplit} / ₹{grandTotal}
                </span>
                <span className={`font-bold ${isSplitValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isSplitValid ? '✓ Split Balanced' : `Remaining: ₹${remainingInSplit}`}
                </span>
              </div>

              {!isSplitValid && (
                <div className="text-[10px] text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-800">
                  The combined amount must equal ₹{grandTotal}.
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              Cancel
            </button>
            
            {isWaiter ? (
              <button
                onClick={() => {
                  requestBill(cartTableNumber);
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white active:scale-98 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>REQUEST BILL FROM CASHIER</span>
              </button>
            ) : (
              <button
                onClick={handleConfirmPayment}
                disabled={
                  (paymentMethod === 'cash' && !isCashSufficient) ||
                  (paymentMethod === 'split' && !isSplitValid)
                }
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all uppercase tracking-wider cursor-pointer ${
                  (paymentMethod === 'cash' && !isCashSufficient) ||
                  (paymentMethod === 'split' && !isSplitValid)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>MARK AS PAID (₹{grandTotal})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
