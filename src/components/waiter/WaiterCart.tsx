import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KOT, ServeType } from '../../types';
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
  Ban
} from 'lucide-react';
import { KOTCancelModal } from '../KOTCancelModal';
import { KOTModifyModal } from '../KOTModifyModal';

export interface WaiterCartProps {
  tableNumber: string;
  onTableChange?: (tableName: string) => void;
  activeSessionKots: KOT[];
}

export const WaiterCart: React.FC<WaiterCartProps> = ({
  tableNumber,
  onTableChange,
  activeSessionKots,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemServeType,
    updateCartItemNotes,
    clearCart,
    cartSpecialNotes,
    setCartSpecialNotes,
    sendKOT,
    requestBill,
    pendingBillRequests,
    branchTables,
    voidKOTItem,
    updateKOTStatus,
    showToast,
  } = useApp();

  const [guestCount, setGuestCount] = useState<number>(2);
  const [isSendingKot, setIsSendingKot] = useState<boolean>(false);
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // KOT item modify/cancel modals
  const [cancelModalTarget, setCancelModalTarget] = useState<{ kot: KOT; itemIndex?: number } | null>(null);
  const [modifyModalTarget, setModifyModalTarget] = useState<{ kot: KOT; itemIndex: number } | null>(null);

  const safePendingBillRequests = Array.isArray(pendingBillRequests) ? pendingBillRequests : [];
  const safeBranchTables = Array.isArray(branchTables) ? branchTables : [];

  const pendingBillRequestForCurrentTable = safePendingBillRequests.find(
    r => r?.tableNumber?.toLowerCase() === tableNumber?.toLowerCase()
  );

  const selectedTable = safeBranchTables.find(t => t?.name?.toLowerCase() === tableNumber?.toLowerCase());

  // Running amount across previous KOTs
  const runningKOTsTotal = activeSessionKots.reduce((acc, kot) => acc + kot.totalAmount, 0);
  const newCartTotal = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);
  const totalTableAmount = runningKOTsTotal + newCartTotal;

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
    if (!tableNumber) {
      showToast('Select Table', 'Please assign a table before sending KOT.', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Cart Empty', 'Add items to order before sending KOT.', 'warning');
      return;
    }

    setIsSendingKot(true);
    setTimeout(() => {
      const kot = sendKOT();
      setIsSendingKot(false);
      if (kot) {
        showToast('KOT Dispatched', `KOT #${kot.kotNumber} sent to Kitchen.`, 'success');
      }
    }, 250);
  };

  const handleRequestBill = () => {
    if (!tableNumber) {
      showToast('Select Table', 'Please select a table to request bill.', 'warning');
      return;
    }
    requestBill(tableNumber, `Guests: ${guestCount}`);
    showToast('Bill Requested', `Cashier desk notified for Table ${tableNumber}.`, 'info');
  };

  return (
    <div className="w-full lg:w-[420px] bg-[#0f172a] border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-xl z-10 text-slate-200 font-mono">
      {/* Top Header: Table Info & Guest Counter */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 shrink-0 bg-[#0f172a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {tableNumber ? tableNumber.replace(/[^0-9]/g, '') || 'T' : 'T'}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">
                {tableNumber || 'No Table Selected'}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectedTable ? `${selectedTable.capacity} Seats • ${selectedTable.floor || 'Dining'}` : 'Dining Area'}
              </div>
            </div>
          </div>

          {/* Guest Count Stepper */}
          <div className="flex items-center gap-1.5 bg-[#111a2e] border border-slate-700 px-2 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <button
              type="button"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
            >
              -
            </button>
            <span className="text-xs font-bold text-emerald-400 min-w-4 text-center">
              {guestCount}
            </span>
            <button
              type="button"
              onClick={() => setGuestCount(guestCount + 1)}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Table Running Balance & Status Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#111a2e] border border-slate-800 rounded-lg text-xs">
          <span className="text-slate-400">Running Total:</span>
          <span className="font-bold text-emerald-400 text-sm">
            ₹{totalTableAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Middle Scrollable: Existing Table KOTs & New Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#080d1a]">
        
        {/* Existing Dispatched KOTs for Table */}
        {activeSessionKots.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                Active Kitchen KOTs ({activeSessionKots.length})
              </span>
              <span className="text-emerald-400">₹{runningKOTsTotal.toFixed(2)}</span>
            </div>

            {(activeSessionKots || []).map(kot => (
              <div
                key={kot.id}
                className="p-2.5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-400">KOT #{kot.kotNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    kot.status === 'ready'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : kot.status === 'preparing'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {kot.status}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 text-xs">
                  {(kot.items || []).map((it, idx) => {
                    const itemName = it.name || (it as any)?.menuItem?.name || 'Item';
                    const itemRate = it.rate ?? (it as any)?.menuItem?.price ?? 0;

                    return (
                      <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                        <div className="flex-1 truncate">
                          <span className="font-bold text-slate-200">{itemName}</span>
                          {it.notes && (
                            <div className="text-[10px] text-amber-400/90 truncate">Note: {it.notes}</div>
                          )}
                        </div>
                        <span className="text-slate-400 shrink-0">×{it.quantity}</span>
                        <span className="font-bold text-slate-300 shrink-0 w-14 text-right">
                          ₹{(itemRate * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Unsent Order Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              New Order Items ({cart.length})
            </span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/40">
              <p className="text-xs">No new items in this KOT.</p>
              <p className="text-[10px] mt-1 text-slate-600">Tap items on the left to add.</p>
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-xl border border-amber-500/40 divide-y divide-slate-800/80 overflow-hidden">
              {(cart || []).map(cartItem => (
                <div key={cartItem.item.id} className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {cartItem.item.name}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        ₹{cartItem.item.price.toFixed(2)} each
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-white">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(cartItem.item.id, 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-14 text-right text-xs font-bold text-emerald-400">
                      ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Notes & Serve Type Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      {/* Serve Type Selector */}
                      <select
                        value={cartItem.serveType || 'normal'}
                        onChange={e => updateCartItemServeType(cartItem.item.id, e.target.value as ServeType)}
                        className="text-[10px] bg-[#111a2e] border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 font-mono"
                      >
                        <option value="normal">Normal</option>
                        <option value="starter">Starter</option>
                        <option value="main">Main</option>
                        <option value="dessert">Dessert</option>
                      </select>
                    </div>

                    {/* Kitchen Note Trigger */}
                    {editingNoteItemId === cartItem.item.id ? (
                      <div className="flex items-center gap-1 flex-1 max-w-[200px]">
                        <input
                          type="text"
                          value={tempNoteText}
                          onChange={e => setTempNoteText(e.target.value)}
                          placeholder="e.g. Less spicy"
                          className="w-full text-[10px] bg-[#111a2e] border border-slate-700 rounded px-1.5 py-0.5 text-white placeholder-slate-500 font-mono"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              updateCartItemNotes(cartItem.item.id, tempNoteText);
                              setEditingNoteItemId(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateCartItemNotes(cartItem.item.id, tempNoteText);
                            setEditingNoteItemId(null);
                          }}
                          className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteItemId(cartItem.item.id);
                          setTempNoteText(cartItem.notes || '');
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 truncate max-w-[180px]"
                      >
                        <Edit3 className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{cartItem.notes || '+ Note'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Pinned Controls: Kitchen Note & Dispatched Actions */}
      <div className="p-3 bg-[#0f172a] border-t border-slate-800 space-y-2 shrink-0">
        <input
          type="text"
          value={cartSpecialNotes}
          onChange={e => setCartSpecialNotes(e.target.value)}
          placeholder="Special kitchen instruction for order..."
          className="w-full px-2.5 py-1.5 bg-[#111a2e] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
        />

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Send KOT Button */}
          <button
            type="button"
            onClick={handleSendKOT}
            disabled={cart.length === 0 || isSendingKot}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingKot ? 'Sending...' : 'Send KOT'}</span>
          </button>

          {/* Request Bill Button */}
          <button
            type="button"
            onClick={handleRequestBill}
            disabled={!tableNumber || (cart.length === 0 && activeSessionKots.length === 0)}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer ${
              pendingBillRequestForCurrentTable
                ? 'bg-amber-950 border border-amber-600 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>
              {pendingBillRequestForCurrentTable ? 'Bill Pending' : 'Request Bill'}
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
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
