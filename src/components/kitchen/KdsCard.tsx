import React from 'react';
import { KOT, KOTStatus } from '../../types';
import { Clock, ChefHat, CheckCircle, Flame, Check } from 'lucide-react';

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
        color: 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse',
      };
    }
    if (mins >= 15) {
      return {
        level: 'warning',
        badge: 'DELAYED',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    }
    return {
      level: 'normal',
      badge: 'ON TIME',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  };

  const urgency = getUrgency(elapsedMins);

  return (
    <div
      className={`rounded-xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all duration-200 bg-white ${
        urgency.level === 'critical'
          ? 'border-rose-400 ring-2 ring-rose-400/20'
          : isNew
          ? 'border-rose-300 ring-1 ring-rose-300/30'
          : isPreparing
          ? 'border-amber-300 ring-1 ring-amber-300/30'
          : 'border-emerald-300'
      }`}
    >
      {/* Top Banner Header */}
      <div
        className={`p-3 flex items-center justify-between font-bold ${
          isNew
            ? 'bg-rose-600 text-white'
            : isPreparing
            ? 'bg-amber-500 text-white'
            : 'bg-emerald-600 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">
            KOT #{kot.kotNumber}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-black/15 uppercase tracking-wider font-semibold">
            {kot.orderType.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMins}m</span>
        </div>
      </div>

      {/* Ticket Meta Info */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-slate-900 font-bold text-sm">
            {kot.tableNumber ? `Table ${kot.tableNumber}` : 'Counter Takeaway'}
          </span>
          {kot.waiterName && (
            <span className="text-[11px] text-slate-500">
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
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="font-semibold truncate">Note: {kot.specialNotes}</span>
        </div>
      )}

      {/* Items List */}
      <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-60">
        {(kot.items || []).map((item, idx) => {
          const isVeg = item.isVeg ?? (item as any)?.menuItem?.isVeg ?? true;
          const itemName = item.name || (item as any)?.menuItem?.name || 'Item';

          return (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    {itemName}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-amber-800 italic mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                      "{item.notes}"
                    </div>
                  )}
                  {item.serveType && item.serveType !== 'all_together' && (
                    <div className="text-[10px] text-sky-700 uppercase font-bold mt-0.5">
                      ● {item.serveType.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-sm font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                x{item.quantity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        {isNew && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'preparing')}
            className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Preparing</span>
          </button>
        )}

        {isPreparing && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'ready')}
            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Ready for Pickup</span>
          </button>
        )}

        {isReady && (
          <button
            type="button"
            onClick={() => onUpdateStatus(kot.id, 'delivered')}
            className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Clear / Delivered</span>
          </button>
        )}
      </div>
    </div>
  );
};
