import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KOT, PaymentMethod, OrderType, ServeType, ItemServeType } from '../../types';
import { 
  Send, 
  Trash2, 
  Percent, 
  Split, 
  Gift, 
  Printer, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Clock,
  Phone,
  ShieldCheck,
  ShieldAlert,
  BadgePercent,
  Tag,
  X,
  Save,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { KOTCancelModal } from '../KOTCancelModal';
import { KOTModifyModal } from '../KOTModifyModal';
import { BillModal } from '../BillModal';

export interface CashierCartProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  activeSessionKots: KOT[];
}

export const CashierCart: React.FC<CashierCartProps> = ({
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  activeSessionKots,
}) => {
  const {
    cart,
    updateCartQuantity,
    updateCartItemServeType,
    removeFromCart,
    clearCart,
    cartCustomerName,
    setCartCustomerName,
    cartCustomerMobile,
    setCartCustomerMobile,
    cartSpecialNotes,
    setCartSpecialNotes,
    cartDiscountPercent,
    setCartDiscountPercent,
    cartCustomDiscount,
    setCartCustomDiscount,
    currentUser,
    sendKOT,
    generateBill,
    openReceiptModal,
    openKOTModal,
    branchTables,
    voidKOTItem,
    updateKOTStatus,
    showToast,
    addToCart,
    menuItems,
    cartTakeawayId,
    startNewTakeawayOrder,
    selectTakeawayOrder,
    kots,
    currentBranch,
  } = useApp();

  const [cartPaymentMethod, setCartPaymentMethod] = useState<PaymentMethod>('cash');
  const [cartIsComplimentary, setCartIsComplimentary] = useState<boolean>(false);
  const [cartBogoActive, setCartBogoActive] = useState<boolean>(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [tempDiscountPercent, setTempDiscountPercent] = useState<number>(cartDiscountPercent);
  const [tempDiscountAmount, setTempDiscountAmount] = useState<number>(cartCustomDiscount);
  const [tempDiscountReason, setTempDiscountReason] = useState<string>('Manager Discretion');
  const [supervisorPin, setSupervisorPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Group active unbilled takeaway tickets for quick switching
  const allTakeawayTickets = useMemo(() => {
    if (orderType === 'dine_in') return [];
    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const unbilledTakeaways = kots.filter(
      k =>
        k.branchId === effectiveBranch &&
        (k.orderType === 'takeaway' || k.orderType === 'parcel' || k.orderType === 'delivery') &&
        !k.isBilled &&
        k.status !== 'cancelled'
    );
    const map = new Map<string, { id: string; customerName?: string; customerMobile?: string; kotCount: number; totalAmount: number }>();
    unbilledTakeaways.forEach(k => {
      const id = k.takeawayId || (k.kotNumber ? `TK-${k.kotNumber.replace(/\D/g, '').slice(-3)}` : 'TK-101');
      const existing = map.get(id);
      if (existing) {
        existing.kotCount += 1;
        existing.totalAmount += k.totalAmount;
        if (!existing.customerName && k.customerName) existing.customerName = k.customerName;
        if (!existing.customerMobile && k.customerMobile) existing.customerMobile = k.customerMobile;
      } else {
        map.set(id, {
          id,
          customerName: k.customerName,
          customerMobile: k.customerMobile,
          kotCount: 1,
          totalAmount: k.totalAmount,
        });
      }
    });

    // Ensure the current active ticket is included
    const currentId = cartTakeawayId || 'TK-102';
    if (!map.has(currentId)) {
      map.set(currentId, {
        id: currentId,
        customerName: cartCustomerName || undefined,
        customerMobile: cartCustomerMobile || undefined,
        kotCount: 0,
        totalAmount: 0,
      });
    }
    return Array.from(map.values());
  }, [kots, currentBranch, orderType, cartTakeawayId, cartCustomerName, cartCustomerMobile]);

  const cartDiscountAmount = cartCustomDiscount;

  const [isSendingKot, setIsSendingKot] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);

  // Save & E-Bill State
  const [isEBillModalOpen, setIsEBillModalOpen] = useState<boolean>(false);
  const [eBillPhone, setEBillPhone] = useState<string>('');
  const [eBillChannel, setEBillChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [isSendingEBill, setIsSendingEBill] = useState<boolean>(false);

  // Modals
  const [cancelModalTarget, setCancelModalTarget] = useState<{ kot: KOT; itemIndex?: number } | null>(null);
  const [modifyModalTarget, setModifyModalTarget] = useState<{ kot: KOT; itemIndex: number } | null>(null);

  const safeBranchTables = Array.isArray(branchTables) ? branchTables : [];
  const selectedTable = safeBranchTables.find(t => t?.name?.toLowerCase() === tableNumber?.toLowerCase());

  // Running amounts
  const runningKotsTotal = activeSessionKots.reduce((acc, k) => acc + k.totalAmount, 0);
  const newCartTotal = cart.reduce((acc, i) => acc + i.item.price * i.quantity, 0);
  const rawSubtotal = runningKotsTotal + newCartTotal;

  // BOGO calculation
  const bogoDiscount = useMemo(() => {
    if (!cartBogoActive) return 0;
    if (cart.length > 0) {
      const minPriceItem = [...cart].sort((a, b) => a.item.price - b.item.price)[0];
      return minPriceItem ? minPriceItem.item.price : 0;
    }
    return 0;
  }, [cartBogoActive, cart]);

  // Discount computation
  const totalDiscount = useMemo(() => {
    if (cartIsComplimentary) return rawSubtotal;
    let disc = 0;
    if (cartDiscountPercent > 0) {
      disc += (rawSubtotal * cartDiscountPercent) / 100;
    }
    if (cartDiscountAmount > 0) {
      disc += cartDiscountAmount;
    }
    disc += bogoDiscount;
    return Math.min(rawSubtotal, disc);
  }, [rawSubtotal, cartDiscountPercent, cartDiscountAmount, bogoDiscount, cartIsComplimentary]);

  const discountedSubtotal = Math.max(0, rawSubtotal - totalDiscount);
  const taxAmount = cartIsComplimentary ? 0 : discountedSubtotal * 0.05; // 5% GST
  const finalTotal = Math.round(discountedSubtotal + taxAmount);

  const settleBill = () => {
    return generateBill(cartPaymentMethod, undefined, totalDiscount);
  };

  const handleConfirmCancel = (reason: string, qty: number) => {
    if (!cancelModalTarget) return;
    if (typeof cancelModalTarget.itemIndex === 'number') {
      voidKOTItem(cancelModalTarget.kot.id, cancelModalTarget.itemIndex, qty, reason);
      showToast('Item Voided', 'Item cancellation sent to kitchen.', 'info');
    } else {
      updateKOTStatus(cancelModalTarget.kot.id, 'cancelled');
      showToast('KOT Cancelled', 'Kitchen order cancelled.', 'info');
    }
    setCancelModalTarget(null);
  };

  const handleConfirmModify = (updates: { notes?: string; serveType?: ServeType }) => {
    if (!modifyModalTarget) return;
    showToast('Item Updated', `Instructions noted: ${updates.notes || updates.serveType || 'Updated'}`, 'success');
    setModifyModalTarget(null);
  };

  const handleSendKOT = () => {
    if (isSendingKot) return;
    if (orderType === 'dine_in' && !tableNumber) {
      showToast('Select Table', 'Please assign a table before sending KOT.', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Cart Empty', 'Add items before sending KOT.', 'warning');
      return;
    }

    setIsSendingKot(true);
    setTimeout(() => {
      const kot = sendKOT(orderType === 'dine_in' ? tableNumber : undefined);
      setIsSendingKot(false);
      if (kot) {
        showToast('KOT Dispatched', `${kot.kotNumber.startsWith('KOT-') ? kot.kotNumber : `KOT #${kot.kotNumber}`} sent to kitchen.`, 'success');
      }
    }, 250);
  };

  const handleSaveRunningOrder = () => {
    if (rawSubtotal <= 0 && cart.length === 0) {
      showToast('No Order', 'Add items before saving order.', 'warning');
      return;
    }

    if (orderType === 'dine_in' && !tableNumber) {
      showToast('Select Table', 'Please assign a table before saving order.', 'warning');
      return;
    }

    if (cart.length > 0) {
      const kot = sendKOT(orderType === 'dine_in' ? tableNumber : undefined);
      if (kot) {
        showToast(
          'Order Saved',
          `Saved running order for ${orderType === 'dine_in' ? tableNumber : 'Takeaway'} without closing bill.`,
          'success'
        );
      }
    } else {
      showToast(
        'Order Saved',
        `Running order for ${orderType === 'dine_in' ? tableNumber : 'Takeaway'} is saved and active.`,
        'success'
      );
    }
  };

  const handleSettle = () => {
    if (rawSubtotal <= 0) {
      showToast('No Order', 'There are no items to settle.', 'warning');
      return;
    }

    setIsSettling(true);
    setTimeout(() => {
      const bill = settleBill();
      setIsSettling(false);
      if (bill) {
        showToast('Bill Settled', `Bill #${bill.billNumber} paid via ${bill.paymentMethod.toUpperCase()}.`, 'success');
      }
    }, 250);
  };

  const handleSaveAndPrint = () => {
    if (rawSubtotal <= 0) {
      showToast('No Order', 'There are no items to settle.', 'warning');
      return;
    }

    setIsSettling(true);
    setTimeout(() => {
      const bill = settleBill();
      setIsSettling(false);
      if (bill) {
        showToast('Bill Settled & Printed', `Bill #${bill.billNumber} paid via ${bill.paymentMethod.toUpperCase()}.`, 'success');
        openReceiptModal(bill);
      }
    }, 250);
  };

  const handleOpenEBillModal = () => {
    if (rawSubtotal <= 0) {
      showToast('No Order', 'There are no items to settle.', 'warning');
      return;
    }
    setEBillPhone(cartCustomerMobile || '');
    setIsEBillModalOpen(true);
  };

  const handleConfirmEBill = () => {
    const cleanPhone = eBillPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Invalid Mobile', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    setIsSendingEBill(true);
    setCartCustomerMobile(cleanPhone);

    setTimeout(() => {
      const bill = settleBill();
      setIsSendingEBill(false);
      setIsEBillModalOpen(false);

      if (bill) {
        const channelName = eBillChannel === 'whatsapp' ? 'WhatsApp' : 'SMS';
        showToast(
          'E-Bill Dispatched',
          `Bill #${bill.billNumber} (₹${bill.total.toFixed(2)}) sent to +91 ${cleanPhone} via ${channelName}.`,
          'success'
        );
      }
    }, 250);
  };

  return (
    <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0 overflow-hidden bg-[#0f172a] border-l border-slate-800 h-full flex flex-col shadow-lg z-10 text-slate-200 select-none font-sans">
      {/* Top Section: Order Type, Table Selector, Customer Details */}
      <div className="p-2 pt-1 border-b border-slate-800 space-y-1.5 flex-shrink-0 bg-[#0f172a]">
        
        {/* Order Type Switcher: Clean emerald active button */}
        <div className="grid grid-cols-3 gap-1 bg-[#080d1a] p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              orderType === 'dine_in'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dine In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              orderType === 'takeaway'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              orderType === 'delivery'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Delivery</span>
          </button>
        </div>

        {/* Table Selector (for Dine In) */}
        {orderType === 'dine_in' ? (
          <div className="space-y-1">
            <div className="relative">
              <select
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full pl-2.5 pr-7 py-1.5 bg-[#080d1a] border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-slate-700 shadow-xs cursor-pointer"
              >
                {(branchTables || []).map(tbl => {
                  const normStatus = (tbl.status === 'ready' || tbl.status === 'waiting') ? 'occupied' : tbl.status;
                  return (
                    <option key={tbl.id} value={tbl.name} className="bg-[#0f172a] text-white">
                      {tbl.name} • ({tbl.capacity} Seats) • {normStatus.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedTable && (
              <div className="flex items-center justify-between px-2 py-1 bg-[#080d1a] border border-slate-800 rounded-lg text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  <span className="font-semibold text-white">{selectedTable.name}</span>
                  <span>•</span>
                  <span>{selectedTable.capacity} Seats</span>
                  {selectedTable.assignedWaiterName && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">{selectedTable.assignedWaiterName}</span>
                    </>
                  )}
                </div>
                <span className="font-bold text-emerald-400 shrink-0">
                  ₹{rawSubtotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Active Takeaway Ticket Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-[#080d1a] border border-slate-800 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 font-bold text-[11px] tracking-wide shrink-0">
                  {orderType === 'delivery' ? 'DELIVERY' : 'TAKEAWAY'} #{cartTakeawayId || 'TK-102'}
                </span>
                {cartCustomerName ? (
                  <span className="text-white font-medium truncate text-[11px]">
                    {cartCustomerName}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Direct Counter</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={startNewTakeawayOrder}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  title="Start fresh takeaway order ticket"
                >
                  + New Order
                </button>
                <span className="font-bold text-emerald-400 text-xs">
                  ₹{rawSubtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* If there are multiple active takeaway tickets, show quick switcher chips */}
            {allTakeawayTickets.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[10px] no-scrollbar">
                <span className="text-slate-500 font-medium shrink-0">Active:</span>
                {allTakeawayTickets.map(t => {
                  const isActive = t.id === cartTakeawayId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTakeawayOrder(t.id)}
                      className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      #{t.id} {t.customerName ? `(${t.customerName})` : ''} {t.totalAmount > 0 ? `• ₹${t.totalAmount}` : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customer Name & Phone */}
        <div className="w-full grid grid-cols-2 gap-1.5">
          {/* Optional Guest Name */}
          <div className="w-full min-w-0">
            <input
              type="text"
              value={cartCustomerName}
              onChange={e => setCartCustomerName(e.target.value)}
              placeholder="Guest Name (Optional)"
              className="px-2.5 py-1 h-[30px] w-full text-xs text-white bg-[#161B26] border border-white/10 rounded-md focus:border-emerald-500 focus:outline-none transition-colors placeholder-slate-500"
            />
          </div>

          {/* Customer Mobile / Phone */}
          <div className="relative w-full min-w-0">
            <Phone className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              value={cartCustomerMobile}
              onChange={e => setCartCustomerMobile(e.target.value.slice(0, 12))}
              placeholder="Phone (Optional)"
              maxLength={12}
              className="pl-7 pr-2 py-1 h-[30px] w-full text-xs text-white bg-[#161B26] border border-white/10 rounded-md focus:border-emerald-500 focus:outline-none transition-colors placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Cart Table Header */}
      <div className="flex items-center justify-between text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider py-1 px-2.5 border-b border-white/10 bg-white/5 shrink-0 select-none">
        <span className="flex-1 min-w-0 text-left">ITEMS</span>
        <span className="w-16 text-center shrink-0">QTY</span>
        <span className="w-16 text-right shrink-0">PRICE</span>
      </div>

      {/* Middle Scrollable: Order Items & KOTs */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-[#080d1a] min-h-0">
        
        {/* Order Items List */}
        <div className="p-1 space-y-1.5 flex-1">
          {(activeSessionKots || []).map(kot => {
            return (
              <div key={kot.id} className="space-y-0.5">
                {/* Thin KOT Ribbon Header */}
                <div className="py-0.5 px-2 text-[10px] bg-slate-900/90 border-y border-slate-800/80 flex items-center justify-between text-slate-300 font-semibold uppercase tracking-wider rounded-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">KOT #{kot.kotNumber}</span>
                    <button
                      type="button"
                      onClick={() => openKOTModal(kot)}
                      className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Print KOT Slip"
                      aria-label={`Print KOT ${kot.kotNumber}`}
                    >
                      <Printer className="w-2.5 h-2.5" />
                    </button>
                    <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-medium ${
                      kot.status === 'ready' 
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                        : kot.status === 'picked_up'
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                        : kot.status === 'preparing'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {kot.status === 'picked_up' ? 'Picked Up' : kot.status}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">₹{kot.totalAmount.toFixed(2)}</span>
                </div>

                <div className="divide-y divide-slate-800/40">
                  {(kot.items || []).map((it, idx) => {
                    const itName = it.name || (it as any)?.menuItem?.name || 'Item';
                    const match = itName.match(/^(.*?)\s*\((.*?)\)$/);
                    const baseName = match ? match[1].trim() : itName;
                    const variationName = match ? match[2].trim() : undefined;
                    const itRate = (it.rate ?? (it as any)?.menuItem?.price) || 0;
                    const isVoided = it.status === 'voided';

                    return (
                      <div
                        key={idx}
                        className={`h-8 min-h-[32px] max-h-[34px] px-1.5 flex items-center justify-between gap-1.5 hover:bg-white/[0.03] transition-colors rounded-xs text-xs ${
                          isVoided ? 'opacity-60 bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Left side: Delete/Void icon + Dish Name (variant inline) */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate pr-1">
                          {!isVoided ? (
                            <button
                              type="button"
                              onClick={() => setCancelModalTarget({ kot, itemIndex: idx })}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                              title="Void / Cancel Item"
                              aria-label={`Void ${itName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400/70 hover:text-rose-400" />
                            </button>
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-rose-500 font-bold">✕</span>
                            </div>
                          )}
                          <span className={`font-medium truncate leading-tight ${isVoided ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {baseName}
                          </span>
                          {variationName && (
                            <span className="text-amber-400 text-[11px] font-normal shrink-0">
                              ({variationName})
                            </span>
                          )}
                          {it.serveType === 'PARCEL' && (
                            <span className="text-[9px] font-bold text-amber-400 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-800/40 shrink-0 uppercase">
                              P
                            </span>
                          )}
                          {isVoided && (
                            <span className="text-[9px] font-bold text-rose-400 px-1 py-0.2 rounded bg-rose-950/60 border border-rose-800/40 shrink-0">
                              VOID
                            </span>
                          )}
                          {it.notes && (
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[90px] shrink-0">
                              • {it.notes}
                            </span>
                          )}
                        </div>

                        {/* Center: Slim quantity badge aligned with center controller */}
                        <div className="flex items-center justify-center shrink-0 w-16">
                          <span className={`px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/80 font-bold text-xs text-center ${isVoided ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            ×{it.quantity}
                          </span>
                        </div>

                        {/* Right side: Item total price */}
                        <div className={`w-16 text-right font-bold text-xs whitespace-nowrap shrink-0 ${isVoided ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                          ₹{(itRate * it.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* New Cart Items */}
          {(cart || []).length > 0 && (
            <div className="space-y-0.5">
              {/* Thin New Items Ribbon Header */}
              <div className="py-0.5 px-2 text-[10px] bg-amber-950/40 border-y border-amber-800/40 flex items-center justify-between text-amber-400 font-semibold uppercase tracking-wider rounded-xs">
                <span>NEW PUNCH ITEMS ({cart.length})</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-rose-400 hover:text-rose-300 text-[10px] font-medium flex items-center gap-0.5 cursor-pointer uppercase"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Clear
                </button>
              </div>

              <div className="divide-y divide-slate-800/40">
                {(cart || []).map(cartItem => {
                  const match = cartItem.item.name.match(/^(.*?)\s*\((.*?)\)$/);
                  const baseName = match ? match[1].trim() : cartItem.item.name;
                  const variationName = match ? match[2].trim() : undefined;

                  return (
                    <div
                      key={cartItem.item.id}
                      className="h-8 min-h-[32px] max-h-[34px] px-1.5 flex items-center justify-between gap-1.5 hover:bg-white/[0.03] transition-colors rounded-xs text-xs"
                    >
                      {/* Left: [🗑️] delete icon + Dish Name (with variant tag inline) */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate pr-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                          title="Delete item"
                          aria-label={`Delete ${cartItem.item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400/70 hover:text-rose-400" />
                        </button>
                        <span className="font-medium text-slate-100 truncate leading-tight">
                          {baseName}
                        </span>
                        {variationName && (
                          <span className="text-amber-400 text-[11px] font-normal shrink-0">
                            ({variationName})
                          </span>
                        )}
                        {cartItem.serveType === 'PARCEL' && (
                          <span className="text-[9px] font-bold text-amber-400 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-800/40 shrink-0 uppercase">
                            P
                          </span>
                        )}
                        {cartItem.notes && (
                          <span className="text-[10px] text-slate-400 italic truncate max-w-[90px] shrink-0">
                            • {cartItem.notes}
                          </span>
                        )}
                      </div>

                      {/* Center: Slim quantity controller [-] [ Qty ] [+] */}
                      <div className="flex items-center justify-center gap-1 shrink-0 w-16">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors border border-slate-700 active:scale-95"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-white text-xs">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(cartItem.item.id, 1)}
                          className="w-5 h-5 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Right: Item Total Price */}
                      <div className="w-16 text-right font-bold text-xs text-emerald-400 whitespace-nowrap shrink-0">
                        ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSessionKots.length === 0 && cart.length === 0 && (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/40">
              <p className="text-xs font-semibold text-slate-200">Cart is currently empty.</p>
              <p className="text-[11px] mt-1 text-slate-500">
                {orderType === 'dine_in'
                  ? `Select dishes from the menu to build bill for ${tableNumber || 'selected table'}.`
                  : `Select dishes from the menu to build takeaway order #${cartTakeawayId || 'TK-102'}.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Billing Computations & Checkout Controls */}
      <div className="px-2 py-1.5 bg-[#0f172a] border-t border-slate-800 space-y-1 flex-shrink-0">
        {/* Quick Kitchen Instruction */}
        <div className="w-full">
          <input
            id="cashier-cart-kitchen-note"
            type="text"
            value={cartSpecialNotes}
            onChange={e => setCartSpecialNotes(e.target.value)}
            placeholder="Kitchen note (e.g. Less spicy)"
            className="w-full px-2.5 py-1 bg-[#080d1a] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        {/* 1. Combined Offers & Total Row */}
        <div className="w-full flex items-center justify-between gap-1.5 px-0.5 py-0.5">
          {/* Left: Compact Offer Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* BOGO Offer */}
            <button
              id="cashier-cart-btn-bogo"
              type="button"
              onClick={() => setCartBogoActive(!cartBogoActive)}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                cartBogoActive
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs font-semibold'
                  : 'bg-[#080d1a] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Buy One Get One Free"
            >
              <Percent className="w-3 h-3 shrink-0" />
              <span>BOGO</span>
            </button>

            {/* Complimentary */}
            <button
              id="cashier-cart-btn-comp"
              type="button"
              onClick={() => setCartIsComplimentary(!cartIsComplimentary)}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                cartIsComplimentary
                  ? 'bg-purple-600 text-white border-purple-500 shadow-xs font-semibold'
                  : 'bg-[#080d1a] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Complimentary Order (100% off)"
            >
              <Gift className="w-3 h-3 shrink-0" />
              <span>Comp</span>
            </button>

            {/* Supervisor Discount / Custom Waiver */}
            <button
              id="cashier-cart-btn-discount"
              type="button"
              onClick={() => {
                setTempDiscountPercent(cartDiscountPercent);
                setTempDiscountAmount(cartCustomDiscount);
                setSupervisorPin('');
                setPinError(false);
                setIsDiscountModalOpen(true);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                (cartDiscountPercent > 0 || cartCustomDiscount > 0)
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700 shadow-xs font-semibold'
                  : 'bg-[#080d1a] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Supervisor Discount & Waiver"
            >
              <BadgePercent className="w-3 h-3 text-rose-400 shrink-0" />
              <span>
                {cartDiscountPercent > 0 
                  ? `${cartDiscountPercent}%` 
                  : cartCustomDiscount > 0 
                    ? `₹${cartCustomDiscount}` 
                    : 'Discount'}
              </span>
            </button>
          </div>

          {/* Right: Dynamic Total Badge */}
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm md:text-base whitespace-nowrap shrink-0">
            <span className="text-xs font-semibold text-slate-300">Total:</span>
            {totalDiscount > 0 && (
              <span className="text-xs text-rose-400 font-medium line-through">
                ₹{rawSubtotal.toFixed(2)}
              </span>
            )}
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* 3. Payment Method Selector: [CASH] [UPI] [CARD] [SPLIT] [DUE] */}
        <div className="grid grid-cols-5 gap-1">
          {/* CASH */}
          <button
            type="button"
            onClick={() => setCartPaymentMethod('cash')}
            className={`py-1 rounded-md text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer ${
              cartPaymentMethod === 'cash'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-xs font-semibold'
                : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>CASH</span>
          </button>

          {/* UPI */}
          <button
            type="button"
            onClick={() => setCartPaymentMethod('upi')}
            className={`py-1 rounded-md text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer ${
              cartPaymentMethod === 'upi'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-xs font-semibold'
                : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI</span>
          </button>

          {/* CARD */}
          <button
            type="button"
            onClick={() => setCartPaymentMethod('card')}
            className={`py-1 rounded-md text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer ${
              cartPaymentMethod === 'card'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-xs font-semibold'
                : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>CARD</span>
          </button>

          {/* SPLIT */}
          <button
            id="cashier-cart-btn-split-payment"
            type="button"
            onClick={() => setIsSplitModalOpen(true)}
            className="py-1 rounded-md text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800"
            title="Split Bill / Payment Modes"
          >
            <Split className="w-3.5 h-3.5 text-slate-400" />
            <span>SPLIT</span>
          </button>

          {/* DUE */}
          <button
            type="button"
            onClick={() => setCartPaymentMethod('due')}
            className={`py-1 rounded-md text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer ${
              cartPaymentMethod === 'due'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-xs font-semibold'
                : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>DUE</span>
          </button>
        </div>

        {/* 4. Action Row 1 (Operations): Send KOT, Save, Settle */}
        <div className="grid grid-cols-3 gap-1 pt-0.5">
          {/* Send KOT: Emerald green */}
          <button
            id="cashier-cart-btn-send-kot"
            type="button"
            onClick={handleSendKOT}
            disabled={cart.length === 0 || isSendingKot}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-1.5 rounded-lg shadow-xs text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            title="Send active items to Kitchen Order Ticket (KOT)"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>{isSendingKot ? 'Sending...' : 'Send KOT'}</span>
          </button>

          {/* Save: Slate gray */}
          <button
            id="cashier-cart-btn-save"
            type="button"
            onClick={handleSaveRunningOrder}
            disabled={rawSubtotal <= 0 && cart.length === 0}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-1.5 rounded-lg shadow-xs text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            title="Save running order / table without printing or closing bill"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>Save</span>
          </button>

          {/* Settle: Amber/Orange displaying dynamic total (e.g. "Settle ₹305") */}
          <button
            id="cashier-cart-btn-settle"
            type="button"
            onClick={handleSettle}
            disabled={rawSubtotal <= 0 || isSettling}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-1.5 rounded-lg shadow-xs text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            title="Settle bill with selected payment method"
          >
            <span>{isSettling ? 'Settling...' : `Settle ₹${Math.round(finalTotal)}`}</span>
          </button>
        </div>

        {/* 5. Action Row 2 (Quick Checkout & Print): Save & Print, Save & E-Bill */}
        <div className="flex items-center gap-1">
          {/* Save & Print: Orange/Amber with printer icon */}
          <button
            id="cashier-cart-btn-save-print"
            type="button"
            onClick={handleSaveAndPrint}
            disabled={rawSubtotal <= 0 || isSettling}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-2.5 rounded-lg text-xs flex-1 flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs whitespace-nowrap"
            title="Close/settle bill & open 80mm thermal receipt preview"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>{isSettling ? 'Saving...' : 'Save & Print'}</span>
          </button>

          {/* Save & E-Bill: Cyan/Sky blue with phone/receipt icon */}
          <button
            id="cashier-cart-btn-save-ebill"
            type="button"
            onClick={handleOpenEBillModal}
            disabled={rawSubtotal <= 0 || isSettling}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-3 rounded-lg text-xs flex-1 flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs whitespace-nowrap"
            title="Close/settle bill & prompt phone for digital receipt via WhatsApp / SMS"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Save & E-Bill</span>
          </button>
        </div>
      </div>

      {/* Split Bill Modal */}
      {isSplitModalOpen && (
        <BillModal
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          tableNumber={tableNumber}
          totalAmount={finalTotal}
          orderItems={cart.map(c => ({
            name: c.item.name,
            quantity: c.quantity,
            price: c.item.price * c.quantity,
          }))}
        />
      )}

      {/* Cancel / Modify Item Modals */}
      {cancelModalTarget && (
        <KOTCancelModal
          isOpen={Boolean(cancelModalTarget)}
          kot={cancelModalTarget.kot}
          itemIndex={cancelModalTarget.itemIndex}
          onConfirmCancel={handleConfirmCancel}
          onClose={() => setCancelModalTarget(null)}
        />
      )}

      {modifyModalTarget && (
        <KOTModifyModal
          kot={modifyModalTarget.kot}
          itemIndex={modifyModalTarget.itemIndex}
          onConfirm={handleConfirmModify}
          onClose={() => setModifyModalTarget(null)}
        />
      )}

      {/* Supervisor Discount / Custom Waiver Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden text-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Supervisor Discount & Waiver</h3>
                  <p className="text-[11px] text-slate-400">Subtotal Eligible: ₹{rawSubtotal.toFixed(2)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Privilege status banner */}
            <div className="p-4 space-y-4">
              {currentUser?.role === 'manager' || currentUser?.role === 'owner' ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-emerald-200">Direct Manager Permission Active</div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">
                      Logged in as <strong>{currentUser?.name || 'Vikram Sharma (Manager)'}</strong>. Custom discounts, owner concessions, and goodwill waivers apply directly without authorization popups.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-amber-200">Supervisor Authorization Required</div>
                    <div className="text-[11px] text-amber-300/80 mt-0.5">
                      Cashier initiated discount requires Branch Manager (Vikram Sharma) authorization.
                    </div>
                  </div>
                </div>
              )}

              {/* Presets */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">Quick Presets:</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { label: '5% Reg', pct: 5, amt: 0, reason: 'Regular Customer' },
                    { label: '10% Staff', pct: 10, amt: 0, reason: 'Staff Concession' },
                    { label: '15% VIP', pct: 15, amt: 0, reason: 'VIP Guest' },
                    { label: '20% Delay', pct: 20, amt: 0, reason: 'Goodwill - Kitchen Delay' },
                    { label: '₹100 Flat', pct: 0, amt: 100, reason: 'Manager Discretion' },
                    { label: '₹200 Flat', pct: 0, amt: 200, reason: 'Goodwill Settlement' },
                    { label: '50% Comp', pct: 50, amt: 0, reason: 'Special Promotion' },
                    { label: '100% Free', pct: 100, amt: 0, reason: 'Owner / VIP Full Waiver' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTempDiscountPercent(preset.pct);
                        setTempDiscountAmount(preset.amt);
                        setTempDiscountReason(preset.reason);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                        (preset.pct > 0 && tempDiscountPercent === preset.pct) || (preset.amt > 0 && tempDiscountAmount === preset.amt)
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Discount %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempDiscountPercent || ''}
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setTempDiscountPercent(val);
                        if (val > 0) setTempDiscountAmount(0);
                      }}
                      placeholder="0"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Or Flat ₹ Discount</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={tempDiscountAmount || ''}
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setTempDiscountAmount(val);
                        if (val > 0) setTempDiscountPercent(0);
                      }}
                      placeholder="₹0"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">₹</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={tempDiscountReason}
                  onChange={e => setTempDiscountReason(e.target.value)}
                  placeholder="e.g., Goodwill, Food Delay, Owner Discount"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* PIN input if cashier */}
              {currentUser?.role !== 'manager' && currentUser?.role !== 'owner' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-300 font-semibold">Supervisor PIN (Vikram Sharma):</label>
                    <button
                      type="button"
                      onClick={() => setSupervisorPin('1234')}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Fill Demo PIN (1234)
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={supervisorPin}
                    onChange={e => { setSupervisorPin(e.target.value); setPinError(false); }}
                    placeholder="Enter 4-digit PIN (1234)"
                    className={`w-full px-3 py-1.5 bg-slate-950 border rounded-lg text-white font-mono text-xs ${pinError ? 'border-rose-500' : 'border-slate-700'}`}
                  />
                  {pinError && <p className="text-[10px] text-rose-400 mt-1">Invalid supervisor PIN. Manager PIN is 1234.</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setCartDiscountPercent(0);
                  setCartCustomDiscount(0);
                  setIsDiscountModalOpen(false);
                  showToast('Discount Cleared', 'Order returned to standard pricing.', 'info');
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Clear Discount
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const isManager = currentUser?.role === 'manager' || currentUser?.role === 'owner';
                    if (!isManager && (tempDiscountPercent > 10 || tempDiscountAmount > 100)) {
                      if (supervisorPin.trim() !== '1234') {
                        setPinError(true);
                        showToast('Authorization Required', 'Please enter supervisor PIN 1234 to apply this discount.', 'error');
                        return;
                      }
                    }
                    setCartDiscountPercent(tempDiscountPercent);
                    setCartCustomDiscount(tempDiscountAmount);
                    setIsDiscountModalOpen(false);
                    showToast('Discount Applied', `${tempDiscountPercent > 0 ? `${tempDiscountPercent}%` : `₹${tempDiscountAmount}`} discount authorized.`, 'success');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Apply Discount</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Save & E-Bill Modal */}
      {isEBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Save & Send E-Bill</h3>
                  <p className="text-xs text-slate-400">Digital receipt via WhatsApp / SMS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEBillModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Order Info & Payable Total */}
              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-medium">Order Target</div>
                  <div className="text-sm font-bold text-white">
                    {orderType === 'dine_in' ? `Table ${tableNumber || 'N/A'}` : `Takeaway #${cartTakeawayId || 'TK-102'}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">
                    Total ({cartPaymentMethod.toUpperCase()})
                  </div>
                  <div className="text-base font-bold text-emerald-400">
                    ₹{finalTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Delivery Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Delivery Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEBillChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      eBillChannel === 'whatsapp'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEBillChannel('sms')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      eBillChannel === 'sms'
                        ? 'bg-sky-950/70 border-sky-500 text-sky-300 shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>SMS Receipt</span>
                  </button>
                </div>
              </div>

              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={eBillPhone}
                    onChange={e => setEBillPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    autoFocus
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl pl-12 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tax invoice & payment confirmation link will be delivered instantly.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEBillModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEBill}
                disabled={isSendingEBill}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingEBill ? 'Dispatching...' : 'Settle & Send E-Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
