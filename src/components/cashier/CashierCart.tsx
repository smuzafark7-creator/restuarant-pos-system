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
  Phone
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
    cartCustomDiscount,
    sendKOT,
    generateBill,
    holdOrder,
    openReceiptModal,
    branchTables,
    voidKOTItem,
    updateKOTStatus,
    showToast,
    addToCart,
    menuItems,
  } = useApp();

  const [cartPaymentMethod, setCartPaymentMethod] = useState<PaymentMethod>('cash');
  const [cartIsComplimentary, setCartIsComplimentary] = useState<boolean>(false);
  const [cartBogoActive, setCartBogoActive] = useState<boolean>(false);

  const cartDiscountAmount = cartCustomDiscount;
  const holdCurrentBill = holdOrder;
  const repeatOrder = () => {
    if (activeSessionKots && activeSessionKots.length > 0) {
      activeSessionKots.forEach(kot => {
        (kot.items || []).forEach(it => {
          const menuItem = (menuItems || []).find(
            m => m.id === it.menuItemId || m.name.toLowerCase() === (it.name || '').toLowerCase()
          );
          if (menuItem) {
            addToCart(menuItem, it.quantity);
          }
        });
      });
      showToast('Order Repeated', 'Active KOT items duplicated into current punch.', 'info');
    }
  };

  const [isSendingKot, setIsSendingKot] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);

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

  const handleSettleAndPrint = () => {
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
        openReceiptModal(bill);
      }
    }, 250);
  };

  return (
    <div className="w-full lg:w-[420px] bg-[#0f172a] border-l border-slate-800 h-full flex flex-col flex-shrink-0 overflow-hidden shadow-lg z-10 text-slate-200 select-none font-sans">
      {/* Top Section: Order Type, Table Selector, Customer Details */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 flex-shrink-0 bg-[#0f172a]">
        
        {/* Order Type Switcher: Clean emerald active button */}
        <div className="grid grid-cols-3 gap-1 bg-[#080d1a] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
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
          <div className="space-y-1.5">
            <div className="relative">
              <select
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-slate-700 shadow-xs cursor-pointer"
              >
                {(branchTables || []).map(tbl => (
                  <option key={tbl.id} value={tbl.name} className="bg-[#0f172a] text-white">
                    {tbl.name} • ({tbl.capacity} Seats) • {tbl.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {selectedTable && (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#080d1a] border border-slate-800 rounded-lg text-[11px]">
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
          <div className="p-2 rounded-lg bg-[#080d1a] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Direct Counter Order</span>
            <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Pay-at-Counter
            </span>
          </div>
        )}

        {/* Customer Name & Phone */}
        <div className="w-full grid grid-cols-2 gap-2">
          {/* Optional Guest Name */}
          <div className="w-full min-w-0">
            <input
              type="text"
              value={cartCustomerName}
              onChange={e => setCartCustomerName(e.target.value)}
              placeholder="Guest Name (Optional)"
              className="px-2.5 py-1.5 h-[34px] w-full text-xs text-white bg-[#161B26] border border-white/10 rounded-md focus:border-emerald-500 focus:outline-none transition-colors placeholder-slate-500"
            />
          </div>

          {/* Customer Mobile / Phone */}
          <div className="relative w-full min-w-0">
            <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              value={cartCustomerMobile}
              onChange={e => setCartCustomerMobile(e.target.value.slice(0, 12))}
              placeholder="Phone (Optional)"
              maxLength={12}
              className="pl-8 pr-2 py-1.5 h-[34px] w-full text-xs text-white bg-[#161B26] border border-white/10 rounded-md focus:border-emerald-500 focus:outline-none transition-colors placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Middle Scrollable: Order Items & KOTs */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-[#080d1a] min-h-0">
        
        {/* Order Items List */}
        <div className="p-3 space-y-4 flex-1">
          {(activeSessionKots || []).map(kot => {
            return (
              <div key={kot.id} className="space-y-1">
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">KOT #{kot.kotNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-medium ${
                      kot.status === 'ready' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' 
                        : kot.status === 'preparing'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {kot.status}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">₹{kot.totalAmount.toFixed(2)}</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {(kot.items || []).map((it, idx) => {
                    const itName = it.name || (it as any)?.menuItem?.name || 'Item';
                    const match = itName.match(/^(.*?)\s*\((.*?)\)$/);
                    const baseName = match ? match[1].trim() : itName;
                    const variationName = match ? match[2].trim() : undefined;
                    const itRate = (it.rate ?? (it as any)?.menuItem?.price) || 0;

                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 py-2 px-1 text-xs">
                        {/* Left side: Item name (bold/clear) with variation & rate below it */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-white truncate leading-tight">
                            {baseName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {variationName && (
                              <span className="text-amber-400 font-medium">
                                {variationName}
                              </span>
                            )}
                            {variationName && <span className="text-slate-600">•</span>}
                            <span className="text-emerald-400 font-medium">
                              ₹{itRate.toFixed(2)}
                            </span>
                            {it.serveType === 'PARCEL' && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                  [PARCEL]
                                </span>
                              </>
                            )}
                            {it.notes && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-amber-400/80 italic">
                                  {it.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right side: Qty badge, Total Price, and Void action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs min-w-7 text-center">
                            ×{it.quantity}
                          </span>
                          <div className="w-16 text-right font-bold text-xs text-emerald-400 whitespace-nowrap">
                            ₹{(itRate * it.quantity).toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCancelModalTarget({ kot, itemIndex: idx })}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer shrink-0"
                            title="Void item"
                            aria-label={`Void ${itName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400/70 hover:text-rose-400" />
                          </button>
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
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 pb-1 text-[11px] font-semibold text-amber-400 border-b border-slate-800/60">
                <span className="bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">NEW PUNCH ITEMS ({cart.length})</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {(cart || []).map(cartItem => {
                  const match = cartItem.item.name.match(/^(.*?)\s*\((.*?)\)$/);
                  const baseName = match ? match[1].trim() : cartItem.item.name;
                  const variationName = match ? match[2].trim() : undefined;

                  return (
                    <div key={cartItem.item.id} className="flex items-center justify-between gap-2 py-2 px-1 text-xs">
                      {/* Left side: Item name (bold/clear) with variation & rate below it */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-semibold text-white truncate leading-tight">
                          {baseName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {variationName && (
                            <span className="text-amber-400 font-medium">
                              {variationName}
                            </span>
                          )}
                          {variationName && <span className="text-slate-600">•</span>}
                          <span className="text-emerald-400 font-medium">
                            ₹{cartItem.item.price.toFixed(2)}
                          </span>
                          {cartItem.serveType === 'PARCEL' && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                [PARCEL]
                              </span>
                            </>
                          )}
                          {cartItem.notes && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400 italic">
                                {cartItem.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right side: Stepper [- Qty +], Item Total Price (e.g. ₹180.00, fully visible), and red Trash button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Stepper [- Qty +] */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors border border-slate-700 active:scale-95"
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
                            className="w-5 h-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total Price (e.g. ₹180.00, fully visible) */}
                        <div className="w-16 text-right font-bold text-xs text-emerald-400 whitespace-nowrap">
                          ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        </div>

                        {/* Red Trash button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer shrink-0"
                          title="Delete item from cart"
                          aria-label={`Delete ${cartItem.item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSessionKots.length === 0 && cart.length === 0 && (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/40">
              <p className="text-xs font-medium text-slate-300">Cart is currently empty.</p>
              <p className="text-[11px] mt-1 text-slate-500">Select dishes from the menu to build bill.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Billing Computations & Checkout Controls */}
      <div className="p-3.5 bg-[#0f172a] border-t border-slate-800 space-y-2.5 flex-shrink-0 mt-auto">
        {/* Quick Kitchen Instruction & Utilities */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={cartSpecialNotes}
            onChange={e => setCartSpecialNotes(e.target.value)}
            placeholder="Kitchen note (e.g. Less spicy)"
            className="flex-1 px-2.5 py-1.5 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
          <button
            type="button"
            onClick={repeatOrder}
            className="px-2.5 py-1.5 bg-[#080d1a] hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 cursor-pointer transition-colors"
            title="Repeat Last Order"
          >
            Repeat
          </button>
          <button
            type="button"
            onClick={holdCurrentBill}
            className="px-2.5 py-1.5 bg-[#080d1a] hover:bg-slate-800 text-amber-400 text-xs font-medium rounded-lg border border-slate-800 cursor-pointer transition-colors"
            title="Hold Bill"
          >
            Hold
          </button>
        </div>

        {/* 1. Offers & Adjustments Toolbar */}
        <div className="p-2.5 bg-[#080d1a] border border-slate-800 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* BOGO Offer */}
            <button
              type="button"
              onClick={() => setCartBogoActive(!cartBogoActive)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                cartBogoActive
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs font-semibold'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Percent className="w-3 h-3" />
              BOGO
            </button>

            {/* Complimentary */}
            <button
              type="button"
              onClick={() => setCartIsComplimentary(!cartIsComplimentary)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                cartIsComplimentary
                  ? 'bg-purple-600 text-white border-purple-500 shadow-xs font-semibold'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Gift className="w-3 h-3" />
              Complimentary
            </button>

            {/* Split Bill */}
            <button
              type="button"
              onClick={() => setIsSplitModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Split className="w-3 h-3" />
              Split
            </button>
          </div>

          {/* Quick Total Tag */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block leading-none">Net Total</span>
            <span className="text-base font-bold text-emerald-400 leading-none">
              ₹{finalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 2. Payment Method Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['cash', 'upi', 'card', 'due'] as PaymentMethod[]).map(pm => (
            <button
              key={pm}
              type="button"
              onClick={() => setCartPaymentMethod(pm)}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors uppercase flex items-center justify-center gap-1 cursor-pointer ${
                cartPaymentMethod === pm
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-xs font-semibold'
                  : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
              }`}
            >
              {pm === 'cash' && <Banknote className="w-3.5 h-3.5" />}
              {pm === 'upi' && <QrCode className="w-3.5 h-3.5" />}
              {pm === 'card' && <CreditCard className="w-3.5 h-3.5" />}
              {pm === 'due' && <Clock className="w-3.5 h-3.5" />}
              <span>{pm}</span>
            </button>
          ))}
        </div>

        {/* 3. Action Rows: Emerald for KOT, Orange/Amber for Settle (matching Floor Plan action buttons) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Send KOT Button - Flat solid Emerald */}
          <button
            type="button"
            onClick={handleSendKOT}
            disabled={cart.length === 0 || isSendingKot}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-xs text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingKot ? 'Sending...' : 'Send KOT'}</span>
          </button>

          {/* Settle & Print Bill - Flat solid Orange/Amber matching Floor Plan Req/Settle */}
          <button
            type="button"
            onClick={handleSettleAndPrint}
            disabled={rawSubtotal <= 0 || isSettling}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl shadow-xs text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isSettling ? 'Settling...' : `Settle ₹${finalTotal}`}</span>
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
          kot={cancelModalTarget.kot}
          itemIndex={cancelModalTarget.itemIndex}
          onConfirm={handleConfirmCancel}
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
    </div>
  );
};
