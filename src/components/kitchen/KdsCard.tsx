import React from 'react';
import { KOT, KOTStatus } from '../../types';
import { Clock, ChefHat, CheckCircle, Flame, Utensils, AlertTriangle, Check } from 'lucide-react';

export interface KdsCardProps {
  kot: KOT;
  currentTime: number;
  onUpdateStatus: (kotId: string, status: KOTStatus) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({ kot, currentTime, onUpdateStatus }) => {
  const isNew = kot.status === 'new';
  const isPreparing = kot.status === 'preparing';
  const isReady = kot.status === 'ready';

  const timeMs = new Date(kot.createdAt).getTime();
  const elapsedMins = isNaN(timeMs) ? 0 : Math.max(0, Math.floor((currentTime - timeMs) / 60000));

  const getUrgency = (mins: number) => {
    if (mins >= 25) {
      return {
        level: 'critical',
        badge: 'CRITICAL',
        color: 'text-rose-400 bg-rose-950/80 border-rose-500/50 animate-pulse',
      };
    }
    if (mins >= 15) {
      return {
        level: 'warning',
        badge: 'DELAYED',
        color: 'text-amber-400 bg-amber-950/80 border-amber-500/50',
      };
    }
    return {
      level: 'normal',
      badge: 'ON TIME',
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
    };
  };

  const urgency = getUrgency(elapsedMins);

  return (
    <div
      className={`rounded-xl border flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-200 ${
        urgency.level === 'critical'
          ? 'border-rose-500 ring-2 ring-rose-500/40 bg-[#111827]'
          : isNew
          ? 'border-rose-500/80 bg-[#111827] ring-1 ring-rose-500/30'
          : isPreparing
          ? 'border-amber-500/80 bg-[#111827] ring-1 ring-amber-500/30'
          : 'border-emerald-500/80 bg-[#111827]'
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`p-3 flex items-center justify-between text-slate-950 font-bold font-mono ${
          isNew
            ? 'bg-rose-500'
            : isPreparing
            ? 'bg-amber-400'
            : 'bg-emerald-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight">
            KOT #{kot.kotNumber}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-black/20 text-current uppercase tracking-wider">
            {kot.orderType.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMins}m</span>
        </div>
      </div>

      {/* Ticket Meta Info */}
      <div className="p-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">
            {kot.tableNumber ? `Table ${kot.tableNumber}` : 'Counter Takeaway'}
          </span>
          {kot.waiterName && (
            <span className="text-[11px] text-slate-400">
              • Waiter: {kot.waiterName}
            </span>
          )}
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${urgency.color}`}>
          {urgency.badge}
        </span>
      </div>

      {/* Special Kitchen Notes Banner */}
      {kot.specialNotes && (
        <div className="px-3 py-1.5 bg-amber-950/40 border-b border-amber-800/60 text-amber-300 text-xs font-mono flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span className="font-bold truncate">Note: {kot.specialNotes}</span>
        </div>
      )}

      {/* Items List */}
      <div className="p-3 divide-y divide-slate-800/80 flex-1 overflow-y-auto max-h-60 font-mono">
        {(kot.items || []).map((item, idx) => {
          const isVeg = item.isVeg ?? (item as any)?.menuItem?.isVeg ?? true;
          const itemName = item.name || (item as any)?.menuItem?.name || 'Item';

          return (
            <div key={idx} className="py-2 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {itemName}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-amber-300 italic mt-0.5">
                      "{item.notes}"
                    </div>
                  )}
                  {item.serveType && item.serveType !== 'all_together' && (
                    <div className="text-[10px] text-sky-400 uppercase font-bold mt-0.5">
                      ● {item.serveType.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-base font-black px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                x{item.quantity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-3 bg-[#0d131f] border-t border-slate-800 flex items-center gap-2 font-mono">
        {isNew && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'preparing')}
            className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Preparing</span>
          </button>
        )}

        {isPreparing && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'ready')}
            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Ready for Pickup</span>
          </button>
        )}

        {isReady && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'delivered')}
            className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Check className="w-4 h-4" />
            <span>Clear / Delivered</span>
          </button>
        )}
      </div>
    </div>
  );
};
