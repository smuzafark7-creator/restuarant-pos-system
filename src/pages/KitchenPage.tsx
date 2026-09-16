import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KOT } from '../types';
import { 
  CheckCircle, 
  Flame, 
  Ban, 
  Check 
} from 'lucide-react';
import { KdsCard } from '../components/kitchen/KdsCard';

export const KitchenPage: React.FC = () => {
  const { 
    filteredKots, 
    updateKOTStatus, 
    kdsAlerts, 
    dismissKDSAlert,
    kdsViewMode
  } = useApp();

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Auto-refresh timer for elapsed times every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Active KOTs sorted by creation time (active queue: 'new', 'preparing', 'ready')
  const activeKots = useMemo(() => {
    return filteredKots
      .filter(k => k.status !== 'cancelled' && k.status !== 'served')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [filteredKots]);

  const newKots = useMemo(() => activeKots.filter(k => k.status === 'new'), [activeKots]);
  const preparingKots = useMemo(() => activeKots.filter(k => k.status === 'preparing'), [activeKots]);
  const readyKots = useMemo(() => activeKots.filter(k => k.status === 'ready' || k.status === 'picked_up'), [activeKots]);

  const renderKOTCard = (kot: KOT) => (
    <KdsCard
      key={kot.id}
      kot={kot}
      currentTime={currentTime}
      onUpdateStatus={updateKOTStatus}
      mode="kitchen"
    />
  );

  return (
    <div className="flex-1 h-full flex flex-col min-h-0 bg-[#18191D] text-slate-100 select-none">
      {/* Real-time Cancellation Alerts Banner (if any voided items) */}
      {kdsAlerts.length > 0 && (
        <div className="p-4 bg-[#18191D] border-b border-white/10 space-y-2 shrink-0">
          {kdsAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-rose-950/50 border-2 border-rose-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse text-xs text-white"
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <Ban className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-rose-200">
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      CANCELLED ITEM ALERT
                    </span>
                    <span>{alert.kotNumber} • {alert.tableNumber ? `Table ${alert.tableNumber}` : 'Takeaway'}</span>
                    <span className="text-slate-400 font-normal">({alert.time})</span>
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">
                    DO NOT PREPARE: {alert.itemName} ×{alert.quantity}
                  </div>
                  <div className="text-rose-300 text-[11px]">
                    Reason: <span className="text-white font-semibold">{alert.reason || 'Guest requested cancellation'}</span> • Voided by: {alert.voidedBy}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissKDSAlert(alert.id)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 self-end sm:self-center transition-colors cursor-pointer border border-rose-500 flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KDS Viewport: 3-Column Workflow Board with Locked Headers & Independent Scroll or Unified Auto-Flowing Grid */}
      {kdsViewMode === 'columns' ? (
        <div className="flex-1 min-h-0 p-4 flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-0 items-stretch">
            {/* 1. NEW ORDERS COLUMN */}
            <div className="flex flex-col h-full min-h-0 min-w-0">
              <div className="shrink-0 p-3 rounded-xl bg-[#161B26] border border-rose-500/30 flex items-center justify-between shadow-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    1. NEW ORDERS
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-950/80 text-rose-300 border border-rose-700/50">
                  {newKots.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-190px)] pr-1 space-y-4 pb-20">
                {newKots.length === 0 ? (
                  <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs bg-[#161B26]/60 rounded-xl border border-dashed border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-400">No new orders waiting</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Incoming KOTs will show here</span>
                  </div>
                ) : (
                  newKots.map(renderKOTCard)
                )}
              </div>
            </div>

            {/* 2. PREPARING COLUMN */}
            <div className="flex flex-col h-full min-h-0 min-w-0">
              <div className="shrink-0 p-3 rounded-xl bg-[#161B26] border border-amber-500/30 flex items-center justify-between shadow-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    2. PREPARING
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  {preparingKots.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-190px)] pr-1 space-y-4 pb-20">
                {preparingKots.length === 0 ? (
                  <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs bg-[#161B26]/60 rounded-xl border border-dashed border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                      <Flame className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-400">No orders in preparation</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Orders in prep will show here</span>
                  </div>
                ) : (
                  preparingKots.map(renderKOTCard)
                )}
              </div>
            </div>

            {/* 3. READY TO SERVE / DISPATCH COLUMN */}
            <div className="flex flex-col h-full min-h-0 min-w-0">
              <div className="shrink-0 p-3 rounded-xl bg-[#161B26] border border-emerald-500/30 flex items-center justify-between shadow-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    3. READY / DISPATCH
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  {readyKots.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-190px)] pr-1 space-y-4 pb-20">
                {readyKots.length === 0 ? (
                  <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs bg-[#161B26]/60 rounded-xl border border-dashed border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-400">No orders ready to serve</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Ready orders will show here</span>
                  </div>
                ) : (
                  readyKots.map(renderKOTCard)
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {activeKots.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-[#161B26] border border-white/10 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Kitchen Queue Clear</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                All incoming KOT tickets have been prepared and served. New orders from Cashier or Waiters will display here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              {activeKots.map(renderKOTCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
