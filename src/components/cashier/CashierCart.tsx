import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KOT, PaymentMethod, OrderType, ServeType } from '../../types';
import { 
  Users, 
  Send, 
  Receipt, 
  Trash2, 
  Plus, 
  Minus, 
  Edit3, 
  Clock, 
  ChefHat, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Ban,
  Check,
  Percent,
  Split,
  Gift,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  DollarSign,
  Search,
  X
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
    removeFromCart,
    updateCartQuantity,
    updateCartItemServeType,
    updateCartItemNotes,
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
    cartPaidBill,
    sendKOT,
    generateBill,
    holdOrder,
    openReceiptModal,
    branchTables,
    voidKOTItem,
    updateKOTStatus,
    showToast,
    addToCart,
  } = useApp();

  const [cartPaymentMethod, setCartPaymentMethod] = useState<PaymentMethod>('cash');
  const [cartIsComplimentary, setCartIsComplimentary] = useState<boolean>(false);
  const [cartBogoActive, setCartBogoActive] = useState<boolean>(false);

  const cartDiscountAmount = cartCustomDiscount;
  const setCartDiscountAmount = setCartCustomDiscount;
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

  const [checkedItemKeys, setCheckedItemKeys] = useState<Record<string, boolean>>({});
  const [isSendingKot, setIsSendingKot] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

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
    // Apply 50% discount to new items or least expensive item
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

  // Toggle item check
  const toggleItemCheck = (key: string) => {
    setCheckedItemKeys(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    const allKeys: Record<string, boolean> = {};
    activeSessionKots.forEach(kot => {
      kot.items.forEach((_, idx) => {
        allKeys[`${kot.id}_${idx}`] = true;
      });
    });
    cart.forEach(c => {
      allKeys[`new_${c.item.id}`] = true;
    });
    setCheckedItemKeys(allKeys);
  };

  const handleUncheckAll = () => {
    setCheckedItemKeys({});
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
      const kot = sendKOT();
      setIsSendingKot(false);
      if (kot) {
        showToast('KOT Dispatched', `KOT #${kot.kotNumber} sent to kitchen.`, 'success');
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
    <div className="w-full lg:w-[420px] bg-[#0f172a] border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-xl z-10 text-slate-200 font-mono">
      {/* Top Section: Order Type, Table Selector, Customer Details */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 shrink-0 bg-[#0f172a]">
        
        {/* Order Type Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#111a2e] p-1 rounded-xl font-mono border border-slate-800">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              orderType === 'dine_in'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dine In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              orderType === 'takeaway'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              orderType === 'delivery'
                ? 'bg-emerald-600 text-white shadow-xs'
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
                className="w-full pl-3 pr-8 py-2 bg-[#111a2e] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
              >
                {(branchTables || []).map(tbl => (
                  <option key={tbl.id} value={tbl.name} className="bg-[#0f172a] text-white">
                    {tbl.name} • ({tbl.capacity} Seats) • {tbl.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {selectedTable && (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#111a2e] border border-slate-800 rounded-lg text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span className="font-bold text-white">{selectedTable.name}</span>
                  <span>•</span>
                  <span>{selectedTable.capacity} Seats</span>
                  {selectedTable.assignedWaiterName && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{selectedTable.assignedWaiterName}</span>
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
          <div className="p-2 rounded-lg bg-[#111a2e] border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Direct Counter Order</span>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Pay-at-Counter
            </span>
          </div>
        )}

        {/* Customer Name & Phone */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={cartCustomerName}
            onChange={e => setCartCustomerName(e.target.value)}
            placeholder="Guest Name (Optional)"
            className="w-full px-2.5 py-1.5 bg-[#111a2e] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={cartCustomerMobile}
            onChange={e => setCartCustomerMobile(e.target.value)}
            placeholder="Phone (Optional)"
            className="w-full px-2.5 py-1.5 bg-[#111a2e] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Middle Scrollable: Order Checklist & KOTs */}
      <div className="flex-1 overflow-y-auto flex flex-col font-mono bg-[#080d1a]">
        
        {/* Columns Header */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-1 px-3 py-1.5 bg-[#0f172a] border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none shadow-xs">
          <span className="col-span-5">ITEMS</span>
          <span className="col-span-3 text-center">AUDIT</span>
          <span className="col-span-2 text-center">QTY</span>
          <span className="col-span-2 text-right">PRICE</span>
        </div>

        {/* Active KOTs */}
        <div className="p-3 space-y-3 flex-1">
          {(activeSessionKots || []).map(kot => (
            <div key={kot.id} className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
                <span className="text-amber-400">KOT #{kot.kotNumber}</span>
                <span className="text-emerald-400">₹{kot.totalAmount.toFixed(2)}</span>
              </div>

              <div className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                {(kot.items || []).map((it, idx) => {
                  const itemKey = `${kot.id}_${idx}`;
                  const isChecked = !!checkedItemKeys[itemKey];

                  return (
                    <div key={idx} className="grid grid-cols-12 gap-1 p-2 items-center text-xs">
                      <div className="col-span-5 truncate">
                        <div className="font-bold text-slate-200 truncate">{it.name || (it as any)?.menuItem?.name || 'Item'}</div>
                        {it.notes && <div className="text-[10px] text-amber-400 truncate">{it.notes}</div>}
                      </div>
                      
                      <div className="col-span-3 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleItemCheck(itemKey)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                            isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-800 border border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="col-span-2 text-center text-slate-300 font-bold">
                        {it.quantity}
                      </div>

                      <div className="col-span-2 text-right font-bold text-emerald-400">
                        ₹{(((it.rate ?? (it as any)?.menuItem?.price) || 0) * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* New Cart Items */}
          {(cart || []).length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-amber-400">
                <span>NEW PUNCH ITEMS ({cart.length})</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div className="bg-[#0f172a] rounded-xl border border-amber-500/40 overflow-hidden divide-y divide-slate-800/80">
                {(cart || []).map(cartItem => {
                  const itemKey = `new_${cartItem.item.id}`;
                  const isChecked = !!checkedItemKeys[itemKey];

                  return (
                    <div key={cartItem.item.id} className="grid grid-cols-12 gap-1 p-2 items-center text-xs">
                      <div className="col-span-5 truncate">
                        <div className="font-bold text-white truncate">{cartItem.item.name}</div>
                        <div className="text-[10px] text-emerald-400">₹{cartItem.item.price.toFixed(2)}</div>
                      </div>

                      <div className="col-span-3 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleItemCheck(itemKey)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                            isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-800 border border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                          className="w-4 h-4 rounded bg-slate-800 text-white flex items-center justify-center text-[10px]"
                        >
                          -
                        </button>
                        <span className="font-bold text-white">{cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(cartItem.item.id, 1)}
                          className="w-4 h-4 rounded bg-slate-800 text-white flex items-center justify-center text-[10px]"
                        >
                          +
                        </button>
                      </div>

                      <div className="col-span-2 text-right font-bold text-emerald-400">
                        ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSessionKots.length === 0 && cart.length === 0 && (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/30">
              <p className="text-xs">Cart is currently empty.</p>
              <p className="text-[10px] mt-1 text-slate-600">Select dishes from the menu to build bill.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Billing Computations & Checkout Controls */}
      <div className="p-3 bg-[#0f172a] border-t border-slate-800 space-y-2 shrink-0 font-mono">
        {/* Quick Kitchen Instruction & Utilities */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={cartSpecialNotes}
            onChange={e => setCartSpecialNotes(e.target.value)}
            placeholder="Kitchen note (e.g. Less spicy, Serve starters first)"
            className="flex-1 px-2 py-1 bg-[#111a2e] border border-slate-700 rounded text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="button"
            onClick={repeatOrder}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
            title="Repeat Last Order"
          >
            Repeat
          </button>
          <button
            type="button"
            onClick={holdCurrentBill}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
            title="Hold Bill"
          >
            Hold
          </button>
        </div>

        {/* 1. Offers & Adjustments Toolbar */}
        <div className="p-2 bg-[#111a2e] border border-slate-800 rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {/* BOGO Offer */}
            <button
              type="button"
              onClick={() => setCartBogoActive(!cartBogoActive)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                cartBogoActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Percent className="w-3 h-3" />
              BOGO
            </button>

            {/* Complimentary */}
            <button
              type="button"
              onClick={() => setCartIsComplimentary(!cartIsComplimentary)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                cartIsComplimentary
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Gift className="w-3 h-3" />
              Complimentary
            </button>

            {/* Split Bill */}
            <button
              type="button"
              onClick={() => setIsSplitModalOpen(true)}
              className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
            >
              <Split className="w-3 h-3" />
              Split
            </button>
          </div>

          {/* Quick Total Tag */}
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block leading-none">Net Total</span>
            <span className="text-sm font-bold text-emerald-400 leading-none">
              ₹{finalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 2. Payment Method Selector */}
        <div className="grid grid-cols-4 gap-1">
          {(['cash', 'upi', 'card', 'due'] as PaymentMethod[]).map(pm => (
            <button
              key={pm}
              type="button"
              onClick={() => setCartPaymentMethod(pm)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-1 cursor-pointer ${
                cartPaymentMethod === pm
                  ? 'bg-emerald-600 text-white border border-emerald-500'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {pm === 'cash' && <Banknote className="w-3 h-3" />}
              {pm === 'upi' && <QrCode className="w-3 h-3" />}
              {pm === 'card' && <CreditCard className="w-3 h-3" />}
              {pm === 'due' && <Clock className="w-3 h-3" />}
              <span>{pm}</span>
            </button>
          ))}
        </div>

        {/* 3. Action Rows */}
        <div className="grid grid-cols-2 gap-2">
          {/* Send KOT Button */}
          <button
            type="button"
            onClick={handleSendKOT}
            disabled={cart.length === 0 || isSendingKot}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSendingKot ? 'Sending...' : 'Send KOT'}</span>
          </button>

          {/* Settle & Print Bill */}
          <button
            type="button"
            onClick={handleSettleAndPrint}
            disabled={rawSubtotal <= 0 || isSettling}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
