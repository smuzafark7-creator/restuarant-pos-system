import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KOT, KOTStatus } from '../types';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  Utensils, 
  Volume2, 
  Sparkles,
  RefreshCw,
  Columns,
  Grid,
  AlertTriangle,
  Package,
  Ban,
  Check,
  TrendingUp
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const KitchenPage: React.FC = () => {
  const { 
    filteredKots, 
    updateKOTStatus, 
    currentBranch, 
    showToast, 
    kdsAlerts, 
    dismissKDSAlert,
    dispatchedItemStats,
    openKitchenDrawer
  } = useApp();
  const [viewMode, setViewMode] = useState<'columns' | 'grid'>('columns');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Auto-refresh timer for elapsed times every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const branchName = currentBranch === 'all' 
    ? 'All Branches (Kitchen View)' 
    : BRANCHES.find(b => b.id === currentBranch)?.name || 'Main Branch';

  // Elapsed minutes calculator
  const getElapsedMinutes = (createdAt: string) => {
    const timeMs = new Date(createdAt).getTime();
    if (isNaN(timeMs)) return 0;
    return Math.max(0, Math.floor((currentTime - timeMs) / 60000));
  };

  // Urgency classification
  const getUrgency = (elapsedMins: number) => {
    if (elapsedMins >= 25) {
      return {
        level: 'critical',
        badge: 'CRITICAL',
        color: 'text-rose-400 bg-rose-950/80 border-rose-500/50 animate-pulse'
      };
    }
    if (elapsedMins >= 15) {
      return {
        level: 'warning',
        badge: 'DELAYED',
        color: 'text-amber-400 bg-amber-950/80 border-amber-500/50'
      };
    }
    return {
      level: 'normal',
      badge: 'ON TIME',
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'
    };
  };

  // Group KOTs into Kanban columns
  const newKots = useMemo(() => filteredKots.filter(k => k.status === 'new'), [filteredKots]);
  const preparingKots = useMemo(() => filteredKots.filter(k => k.status === 'preparing'), [filteredKots]);
  const readyKots = useMemo(() => filteredKots.filter(k => k.status === 'ready'), [filteredKots]);

  const activeTotal = newKots.length + preparingKots.length;

  const renderKOTCard = (kot: KOT) => {
    const isNew = kot.status === 'new';
    const isPreparing = kot.status === 'preparing';
    const isReady = kot.status === 'ready';
    const elapsedMins = getElapsedMinutes(kot.createdAt);
    const urgency = getUrgency(elapsedMins);

    return (
      <div
        key={kot.id}
        className={`rounded-xl border-[1.5px] border-[rgba(255,255,255,0.12)] flex flex-col justify-between overflow-hidden bg-[#1E2433] hover:-translate-y-[3px] active:-translate-y-[1px] hover:shadow-[0_8px_20px_-2px_rgba(245,158,11,0.25)] hover:border-amber-500/50 transition-all duration-[180ms] ease-in-out select-none ${
          urgency.level === 'critical'
            ? 'ring-1 ring-rose-500/40 border-rose-500/50'
            : isNew
            ? 'ring-1 ring-rose-500/20'
            : isPreparing
            ? 'ring-1 ring-amber-500/20'
            : 'ring-1 ring-emerald-500/20'
        }`}
      >
        {/* Top Banner */}
        <div
          className={`p-3 flex items-center justify-between text-white font-bold border-b ${
            urgency.level === 'critical' || urgency.level === 'warning'
              ? 'bg-rose-950/60 border-rose-700/60'
              : isNew
              ? 'bg-rose-950/50 border-rose-900/50'
              : isPreparing
              ? 'bg-amber-950/40 border-amber-900/50'
              : 'bg-emerald-950/40 border-emerald-900/50'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg tracking-tight leading-none text-white font-extrabold">{kot.kotNumber}</span>
              {kot.isBilled && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold tracking-wide">
                  PAID
                </span>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              {kot.orderType.replace('_', ' ')}
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold uppercase text-white">
              {kot.tableNumber || (kot.customerName ? kot.customerName : 'Takeaway')}
            </span>
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{kot.timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* Urgency and Time Elapsed Bar */}
        <div className="px-3 py-1.5 bg-[#161B26] border-b border-white/[0.08] flex items-center justify-between text-[10px]">
          <div className={`px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 ${urgency.color}`}>
            {urgency.level === 'critical' && <AlertTriangle className="w-3 h-3" />}
            <span>{urgency.badge}</span>
            <span>•</span>
            <span>{elapsedMins}m ago</span>
          </div>

          <span className="text-slate-400 uppercase font-semibold text-[9px]">
            Status: <span className="text-slate-200">{kot.status}</span>
          </span>
        </div>

        {/* Order Items List */}
        <div className="p-3 flex-1 space-y-2.5">
          <div className="space-y-2 divide-y divide-white/[0.06]">
            {kot.items.map((item, idx) => {
              const isParcel = item.serveType === 'PARCEL';
              const isVoided = item.status === 'voided';

              return (
                <div
                  key={idx}
                  className={`pt-2 first:pt-0 flex items-start justify-between gap-2 transition-all ${
                    isVoided
                      ? 'p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 opacity-80'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isVoided
                          ? 'bg-rose-500'
                          : item.isVeg
                          ? 'bg-emerald-400'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug ${
                            isVoided ? 'line-through text-rose-400' : 'text-[#F1F5F9]'
                          }`}
                        >
                          {item.name}
                        </span>

                        {isVoided ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/80 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                            <Ban className="w-2.5 h-2.5 stroke-[3]" />
                            CANCELLED • DO NOT PREPARE
                          </span>
                        ) : isParcel ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 text-[9px] font-bold uppercase tracking-wider">
                            <Package className="w-2.5 h-2.5 stroke-[2.5]" />
                            PARCEL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-semibold uppercase tracking-wider">
                            DINE-IN
                          </span>
                        )}
                      </div>

                      {isVoided ? (
                        <div className="mt-1 text-[10px] text-rose-300 font-bold bg-rose-950/50 px-2 py-1 rounded border border-rose-800/50">
                          <div>🚫 VOIDED by {item.voidedBy || 'Waiter'} at {item.voidedAt}</div>
                          <div className="text-rose-400 italic font-normal">
                            Reason: "{item.voidReason || 'Customer requested cancellation'}"
                          </div>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`text-[10px] block mt-0.5 ${
                              isParcel ? 'text-amber-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            Serve: {isParcel ? 'PARCEL (PACK)' : 'DINE-IN'}
                          </span>
                          {item.notes && (
                            <p className="text-[10px] text-amber-300 font-medium italic mt-0.5 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded inline-block">
                              Note: {item.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded-lg border text-sm shrink-0 font-extrabold ${
                      isVoided
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-400 line-through'
                        : isParcel
                        ? 'bg-amber-950/40 border-amber-800/40 text-[#F59E0B]'
                        : 'bg-[#161B26] border-white/10 text-[#F59E0B]'
                    }`}
                  >
                    ×{item.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Instructions banner */}
          {kot.specialInstructions && (
            <div className="mt-2.5 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Chef Note: {kot.specialInstructions}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-2.5 bg-[#161B26] border-t border-white/[0.08]">
          {kot.items.every(i => i.status === 'voided') ? (
            <div className="py-2 px-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>ALL ITEMS CANCELLED • VOIDED</span>
            </div>
          ) : (
            <>
              {isNew && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'preparing')}
                  className="w-full py-2 px-3 bg-[#E67E17] hover:brightness-110 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>START PREPARING</span>
                </button>
              )}

              {isPreparing && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'ready')}
                  className="w-full py-2 px-3 bg-[#E67E17] hover:brightness-110 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>READY</span>
                </button>
              )}

              {isReady && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'served')}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{kot.orderType === 'takeaway' || kot.orderType === 'parcel' ? 'MARK COMPLETED' : 'MARK SERVED'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col min-h-0 bg-[#18191D] text-slate-100 select-none">
      {/* Sticky Top Header, Filter & Control Bar */}
      <div className="sticky top-0 z-20 shrink-0 bg-[#18191D] px-4 sm:px-6 pt-4 sm:pt-6 pb-3 space-y-3 border-b border-white/[0.08] shadow-md">
        {/* Real-time Cancellation Alerts Banner */}
        {kdsAlerts.length > 0 && (
          <div className="space-y-2">
            {kdsAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-rose-950/40 border-2 border-rose-800/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse text-xs text-white"
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

        {/* Top KDS Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161B26] border border-white/[0.08] p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
                  Kitchen Display System (KDS)
                </h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">
                Live Cooking Stations • <span className="text-amber-400 font-semibold">{branchName}</span> • <span className="text-emerald-400 font-bold">{activeTotal} Active Orders</span>
              </p>
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center bg-[#18191D] border border-white/[0.08] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('columns')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  viewMode === 'columns'
                    ? 'bg-[#1E2433] text-white font-bold shadow-xs border border-white/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Columns</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#1E2433] text-white font-bold shadow-xs border border-white/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Dispatched Analytics Bar (Dine-in vs Takeaway Breakdown) */}
        <div className="bg-[#161B26] border border-white/[0.08] p-2.5 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dispatched Today (Live):</span>
            </span>
          </div>

          {/* Horizontally scrollable chips showing item: N Served (X Dine-in | Y Takeaway) */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {dispatchedItemStats.slice(0, 6).map(dish => (
              <div
                key={dish.name}
                onClick={() => openKitchenDrawer('dispatched')}
                className="group shrink-0 px-2.5 py-1 rounded-lg bg-[#1E2433] hover:bg-[#252c3e] border border-white/[0.08] hover:border-emerald-500/50 cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                title={`${dish.name}: ${dish.totalServed} Served (${dish.dineIn} Dine-in | ${dish.takeaway} Takeaway) • Click to open full breakdown`}
              >
                <span className="font-semibold text-white">{dish.name}:</span>
                <span className="font-extrabold text-amber-400">{dish.totalServed} Served</span>
                <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  (<span className="text-emerald-400 font-semibold">{dish.dineIn} Dine-in</span> | <span className="text-sky-400 font-semibold">{dish.takeaway} Takeaway</span>)
                </span>
              </div>
            ))}
          </div>

          {/* Action button to open full drawer */}
          <button
            onClick={() => openKitchenDrawer('dispatched')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-700/50 font-bold text-[11px] cursor-pointer transition-colors flex items-center gap-1 self-end md:self-auto"
          >
            <span>Full Breakdown</span>
          </button>
        </div>
      </div>

      {/* Main Orders Section / Grid Wrapper with Vertical Scroll & Bottom Padding */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 pt-4 pb-20">
        {viewMode === 'columns' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
            
            {/* Column 1: NEW */}
            <div className="bg-[#161B26] rounded-2xl border border-white/[0.08] p-3 flex flex-col space-y-3 shadow-lg">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-rose-950/40 border border-rose-900/50 rounded-lg">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>1. NEW ORDERS</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-rose-600/90 text-white">
                  {newKots.length}
                </span>
              </div>

              <div className="space-y-3">
                {newKots.map(renderKOTCard)}
                {newKots.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No new orders in queue
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: PREPARING */}
            <div className="bg-[#161B26] rounded-2xl border border-white/[0.08] p-3 flex flex-col space-y-3 shadow-lg">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-950/40 border border-amber-900/50 rounded-lg">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. PREPARING (COOKING)</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-[#F59E0B] text-white">
                  {preparingKots.length}
                </span>
              </div>

              <div className="space-y-3">
                {preparingKots.map(renderKOTCard)}
                {preparingKots.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No orders currently cooking
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: READY */}
            <div className="bg-[#161B26] rounded-2xl border border-white/[0.08] p-3 flex flex-col space-y-3 shadow-lg">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-900/50 rounded-lg">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. READY TO SERVE</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-emerald-600 text-white">
                  {readyKots.length}
                </span>
              </div>

              <div className="space-y-3">
                {readyKots.map(renderKOTCard)}
                {readyKots.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No orders awaiting pickup
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Full Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredKots.filter(k => k.status !== 'cancelled' && k.status !== 'served').map(renderKOTCard)}
            {filteredKots.filter(k => k.status !== 'cancelled' && k.status !== 'served').length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 text-sm">
                No active orders in queue. Kitchen is clear!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
