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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* 1. RESTAURANT & BRANCH HEADER */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase leading-none">
                  Zaffran Flavours
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  TAX INVOICE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {branchObj.name} • {branchObj.address} • Phone: {branchObj.phone}
              </p>
              <p className="text-[10px] text-slate-400">
                GSTIN: <span className="text-slate-200 font-semibold">{branchObj.gstin}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. INVOICE METADATA STRIP */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Invoice Number</span>
            <span className="font-bold text-slate-900">{invoiceNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date & Time</span>
            <span className="font-medium text-slate-800">{currentDate} {currentTime}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Order Type</span>
            <span className="font-bold uppercase text-slate-900">
              {cartOrderType.replace('_', '-')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Table / Destination</span>
            <span className="font-bold text-emerald-700">
              {cartOrderType === 'dine_in' ? (cartTableNumber || 'Table 5') : 'Takeaway Counter'}
            </span>
          </div>
        </div>

        {/* Combined KOTs Strip or Advance Payment Strip */}
        {activeSessionKots.length > 0 ? (
          <div className="bg-emerald-50/90 px-5 py-2 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
              <span className="font-bold">Combined KOTs ({activeSessionKots.length}):</span>
              <span className="font-bold text-emerald-950 font-mono">
                {activeSessionKots.map(k => k.kotNumber).join(', ')}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
              {billItems.length} Total Items
            </span>
          </div>
        ) : (cartOrderType === 'takeaway' || cartOrderType === 'parcel') ? (
          <div className="bg-sky-50 px-5 py-2 border-b border-sky-200 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-sky-900">
              <span className="font-bold uppercase tracking-wide">Advance Payment:</span>
              <span>Invoice will be paid first; order remains available as PAID - READY TO SEND</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded">
              Express Takeaway
            </span>
          </div>
        ) : null}

        {/* 3. SCROLLABLE BODY */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Customer info if provided */}
          {(cartCustomerName || cartCustomerMobile || activeSessionKots.some(k => k.customerName || k.customerMobile)) && (
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-700">Guest: {cartCustomerName || activeSessionKots.find(k => k.customerName)?.customerName || 'Walk-in'}</span>
              <span className="text-slate-500">Contact: {cartCustomerMobile || activeSessionKots.find(k => k.customerMobile)?.customerMobile || 'N/A'}</span>
            </div>
          )}

          {/* ITEM DATA GRID */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 grid grid-cols-12 px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {billItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 px-3 py-1.5 text-xs text-slate-800 items-center">
                  <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="font-semibold truncate">{item.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-tight ${
                      item.serveType === 'PARCEL'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.serveType === 'PARCEL' ? 'Parcel' : 'Dine-In'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center text-slate-600 font-bold">{item.quantity}</span>
                  <span className="col-span-2 text-right text-slate-600 font-mono">₹{item.rate}</span>
                  <span className="col-span-2 text-right font-bold text-slate-900 font-mono">₹{item.amount}</span>
                </div>
              ))}
              {billItems.length === 0 && (
                <div className="p-4 text-center text-slate-400">No items selected</div>
              )}
            </div>
          </div>

          {/* TOTALS & DISCOUNTS CALCULATION BLOCK */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({billItems.length} items)</span>
              <span className="font-bold text-slate-900 font-mono">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount selector */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
              <span className="text-slate-600 flex items-center gap-1">
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      discountPercent === pct && customDiscount === 0
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? '0%' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied ({discountPercent}%)</span>
                <span>-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST (2.5% CGST + 2.5% SGST)</span>
              <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold text-sm text-slate-900">
              <span className="text-sm uppercase tracking-wider">Grand Total</span>
              <span className="text-xl text-emerald-700 font-mono font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* 4. PAYMENT OPTIONS SELECTOR */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Payment Method (Recording Demo)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">CASH</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">UPI</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">CARD</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod('split')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  paymentMethod === 'split'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Split className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">SPLIT</span>
              </button>
            </div>
          </div>

          {/* 5. METHOD-SPECIFIC PANELS */}

          {/* A. CASH PAYMENT DETAILS */}
          {paymentMethod === 'cash' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Cash Payment Recording</span>
                <span className="text-[10px] text-slate-500">Calculate Tender & Balance</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Enter Amount Received (₹):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={cashReceived || ''}
                      onChange={e => setCashReceived(Number(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-sm text-slate-900 focus:outline-emerald-500"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <button
                    type="button"
                    onClick={() => setCashReceived(grandTotal)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
                  >
                    Exact (₹{grandTotal})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashReceived(Math.ceil(grandTotal / 500) * 500 || 500)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
                  >
                    ₹{Math.ceil(grandTotal / 500) * 500 || 500}
                  </button>
                </div>
              </div>

              {/* Cash Calculation Summary */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Amount Received</span>
                  <span className="font-bold text-sm text-slate-900">₹{cashReceived}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Grand Total</span>
                  <span className="font-bold text-sm text-slate-900">₹{grandTotal}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Balance / Change</span>
                  <span className={`font-black text-sm ${isCashSufficient ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ₹{cashChange}
                  </span>
                </div>
              </div>

              {!isCashSufficient && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Amount received is short by ₹{grandTotal - cashReceived}. Enter full cash received to proceed.</span>
                </div>
              )}
            </div>
          )}

          {/* B. UPI PAYMENT DETAILS */}
          {paymentMethod === 'upi' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">UPI Payment</h4>
              </div>

              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-2xs flex flex-col items-center justify-center">
                {/* Visual QR Code simulation */}
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-900 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-white'
                          : 'bg-emerald-400'
                      } rounded-xs`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">Scan & Pay ₹{grandTotal.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500">VPA: <span className="font-mono text-slate-800 font-semibold">zaffran.billing@icici</span></p>
                <p className="text-[10px] text-emerald-700 font-medium">Awaiting customer QR scan or dynamic push confirmation</p>
              </div>
            </div>
          )}

          {/* C. CARD PAYMENT DETAILS */}
          {paymentMethod === 'card' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Card Payment</h4>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto space-y-1 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Connected Terminal</div>
                <div className="font-bold text-slate-900 text-xs">PAX A920 POS Terminal #02</div>
                <div className="text-xs font-mono text-emerald-700 font-semibold">Ready for Tap / Chip / Swipe</div>
                <div className="text-[10px] text-slate-400 pt-1">Accepts Visa, MasterCard, RuPay, Maestro, Amex</div>
              </div>

              <p className="text-[11px] text-slate-600">
                Amount to charge: <span className="font-bold text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </p>
            </div>
          )}

          {/* D. SPLIT PAYMENT DETAILS */}
          {paymentMethod === 'split' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-100">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200 text-xs font-bold">
                <span className="text-slate-900">Split Payment Mode</span>
                <span className={remainingInSplit === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                  Remaining: ₹{remainingInSplit}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Cash */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Cash</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, cash: (prev.cash || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-700 font-bold hover:underline"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.cash || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, cash: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* UPI */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">UPI</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, upi: (prev.upi || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-700 font-bold hover:underline"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.upi || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, upi: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Card */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Card</label>
                    <button
                      type="button"
                      onClick={() => setSplitDetails(prev => ({ ...prev, card: (prev.card || 0) + remainingInSplit }))}
                      className="text-[9px] text-emerald-700 font-bold hover:underline"
                    >
                      +Fill
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={splitDetails.card || ''}
                      onChange={e =>
                        setSplitDetails(prev => ({ ...prev, card: Number(e.target.value) || 0 }))
                      }
                      className="w-full pl-6 pr-2 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Split Summary Bar */}
              <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">
                  Allocated: ₹{totalPaidInSplit} / ₹{grandTotal}
                </span>
                <span className={`font-bold ${isSplitValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isSplitValid ? '✓ Split Balanced' : `Remaining: ₹${remainingInSplit}`}
                </span>
              </div>

              {!isSplitValid && (
                <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                  The combined amount must equal Grand Total (₹{grandTotal}) before allowing payment completion.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          
          {isWaiter ? (
            <button
              onClick={() => {
                requestBill(cartTableNumber);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-all uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white active:scale-98"
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
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-all uppercase tracking-wider ${
                (paymentMethod === 'cash' && !isCashSufficient) ||
                (paymentMethod === 'split' && !isSplitValid)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>MARK AS PAID (₹{grandTotal})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
