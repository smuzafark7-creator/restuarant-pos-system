import React, { useState } from 'react';
import { KOT } from '../types';
import { X, AlertTriangle } from 'lucide-react';

interface KOTCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  kot: KOT | null;
  itemIndex?: number;
  onConfirmCancel: (reason: string, qty: number) => void;
}

export const KOTCancelModal: React.FC<KOTCancelModalProps> = ({
  isOpen,
  onClose,
  kot,
  itemIndex,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState('');
  const [qty, setQty] = useState(1);

  if (!isOpen || !kot) return null;

  const targetItem = typeof itemIndex === 'number' && itemIndex >= 0 ? kot.items[itemIndex] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmCancel(reason.trim(), qty);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Cancel / Void {targetItem ? 'Item' : 'KOT'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {targetItem && (
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <div className="text-slate-400">Item to void:</div>
              <div className="font-bold text-white text-sm">{targetItem.name} (Max: {targetItem.quantity})</div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-bold">Reason for cancellation *</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Guest changed mind / wrong order"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl"
            >
              Confirm Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
