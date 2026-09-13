import React, { useState, useEffect } from 'react';
import { KOT } from '../types';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface KOTCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  kot: KOT | null;
  itemIndex?: number;
  onConfirmCancel: (reason: string, qty: number) => void;
}

const COMMON_REASONS = [
  'Customer changed mind',
  'Wrong punch',
  'Out of stock',
  'Customer waited too long',
];

export const KOTCancelModal: React.FC<KOTCancelModalProps> = ({
  isOpen,
  onClose,
  kot,
  itemIndex,
  onConfirmCancel,
}) => {
  const targetItem = kot && typeof itemIndex === 'number' && itemIndex >= 0 && kot.items
    ? kot.items[itemIndex]
    : null;

  const [reason, setReason] = useState<string>('Customer changed mind');
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setReason('Customer changed mind');
      setQty(targetItem ? targetItem.quantity : 1);
    }
  }, [isOpen, targetItem]);

  if (!isOpen || !kot) return null;

  const maxQty = targetItem ? targetItem.quantity : 1;
  const itemRate = targetItem ? (targetItem.rate || 0) : 0;
  const refundAmount = itemRate * qty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmCancel(reason.trim(), qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span>Void / Cancel {targetItem ? 'Sent Item' : `KOT #${kot.kotNumber}`}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Item Details */}
        {targetItem && (
          <div className="bg-[#080d1a] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Item to void:</div>
              <div className="font-bold text-white text-sm">{targetItem.name}</div>
              <div className="text-[11px] text-slate-400">
                Ticket: <span className="text-slate-300 font-semibold">#{kot.kotNumber}</span> • Rate: <span className="text-emerald-400 font-semibold">₹{itemRate.toFixed(2)}</span>
              </div>
            </div>
            {targetItem.quantity > 1 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 mb-1">Qty to cancel:</span>
                <div className="flex items-center gap-1.5 bg-[#0f172a] border border-slate-700 px-2 py-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-white min-w-5 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(maxQty, qty + 1))}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick Reason Pills */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">
              Reason for cancellation <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {COMMON_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium border transition-colors cursor-pointer truncate ${
                    reason === r
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold'
                      : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Or type custom reason..."
              className="w-full px-3 py-2 bg-[#080d1a] border border-slate-700 focus:border-rose-500 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs transition-colors"
              required
            />
          </div>

          {/* Deduct Amount Banner */}
          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total reduction from bill:</span>
            <span className="font-bold text-rose-400 text-sm">
              -₹{refundAmount.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs cursor-pointer transition-colors"
            >
              Keep Item
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Void</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
