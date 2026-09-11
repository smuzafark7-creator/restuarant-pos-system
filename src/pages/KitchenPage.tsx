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
  Check
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const KitchenPage: React.FC = () => {
  const { filteredKots, updateKOTStatus, currentBranch, showToast, kdsAlerts, dismissKDSAlert } = useApp();
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
        {/* Top Banner */}
        <div
          className={`p-3 flex items-center justify-between text-slate-950 font-bold font-mono ${
            isNew
              ? 'bg-rose-500'
              : isPreparing
              ? 'bg-amber-400'
              : 'bg-emerald-500'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg tracking-tight leading-none">{kot.kotNumber}</span>
              {kot.isBilled && (
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-emerald-400 border border-slate-800 text-[9px] font-extrabold tracking-wide">
                  PAID
                </span>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-90 font-semibold mt-0.5">
              {kot.orderType.replace('_', ' ')}
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold uppercase">
              {kot.tableNumber || (kot.customerName ? kot.customerName : 'Takeaway')}
            </span>
            <div className="text-[10px] opacity-90 flex items-center justify-end gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>{kot.timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* Urgency and Time Elapsed Bar */}
        <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between font-mono text-[10px]">
          <div className={`px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 ${urgency.color}`}>
            {urgency.level === 'critical' && <AlertTriangle className="w-3 h-3" />}
            <span>{urgency.badge}</span>
            <span>•</span>
            <span>{elapsedMins}m ago</span>
          </div>

          <span className="text-slate-400 uppercase font-semibold text-[9px]">
            Status: {kot.status}
          </span>
        </div>

        {/* Order Items List */}
        <div className="p-3 flex-1 space-y-2.5 font-mono">
          <div className="space-y-2 divide-y divide-slate-800">
            {kot.items.map((item, idx) => {
              const isParcel = item.serveType === 'PARCEL';
              const isVoided = item.status === 'voided';

              return (
                <div
                  key={idx}
                  className={`pt-2 first:pt-0 flex items-start justify-between gap-2 transition-all ${
                    isVoided
                      ? 'p-2 rounded-lg bg-rose-950/60 border border-rose-600/70 opacity-80'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isVoided
                          ? 'bg-rose-500 ring-2 ring-rose-900'
                          : item.isVeg
                          ? 'bg-emerald-400 ring-2 ring-emerald-900'
                          : 'bg-rose-400 ring-2 ring-rose-900'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug ${
                            isVoided ? 'line-through text-rose-300' : 'text-slate-100'
                          }`}
                        >
                          {item.name}
                        </span>

                        {isVoided ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                            <Ban className="w-2.5 h-2.5 stroke-[3]" />
                            CANCELLED • DO NOT PREPARE
                          </span>
                        ) : isParcel ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow-2xs animate-pulse">
                            <Package className="w-2.5 h-2.5 stroke-[2.5]" />
                            PARCEL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[9px] font-bold uppercase tracking-wider">
                            DINE-IN
                          </span>
                        )}
                      </div>

                      {isVoided ? (
                        <div className="mt-1 text-[10px] text-rose-300 font-bold bg-rose-950/80 px-2 py-1 rounded border border-rose-800">
                          <div>🚫 VOIDED by {item.voidedBy || 'Waiter'} at {item.voidedAt}</div>
                          <div className="text-rose-200 italic font-normal">
                            Reason: "{item.voidReason || 'Customer requested cancellation'}"
                          </div>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`text-[10px] font-mono block mt-0.5 ${
                              isParcel ? 'text-amber-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            Serve: {isParcel ? 'PARCEL (PACK)' : 'DINE-IN'}
                          </span>
                          {item.notes && (
                            <p className="text-[10px] text-amber-300 font-medium italic mt-0.5">
                              Note: {item.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded border text-sm shrink-0 font-mono font-extrabold ${
                      isVoided
                        ? 'bg-rose-950 border-rose-700 text-rose-400 line-through'
                        : isParcel
                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-white'
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
            <div className="mt-2.5 p-2 rounded bg-amber-950/60 border border-amber-600/40 text-[11px] text-amber-200 font-medium flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Chef Note: {kot.specialInstructions}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-2.5 bg-[#0B0F19] border-t border-slate-800">
          {kot.items.every(i => i.status === 'voided') ? (
            <div className="py-2 px-3 bg-rose-950/80 border border-rose-800 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-lg text-center font-mono flex items-center justify-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>ALL ITEMS CANCELLED • VOIDED</span>
            </div>
          ) : (
            <>
              {isNew && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'preparing')}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg font-mono shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>START PREPARING</span>
                </button>
              )}

              {isPreparing && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'ready')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-lg font-mono shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>MARK READY</span>
                </button>
              )}

              {isReady && (
                <button
                  onClick={() => updateKOTStatus(kot.id, 'served')}
                  className="w-full py-2 px-3 bg-sky-700 hover:bg-sky-600 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-lg font-mono shadow flex items-center justify-center gap-1.5 transition-all border border-sky-600 cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" />
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0F19] text-white p-4 sm:p-6 space-y-5 select-none">
      {/* Real-time Cancellation Alerts Banner */}
      {kdsAlerts.length > 0 && (
        <div className="space-y-2">
          {kdsAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-rose-950/90 border-2 border-rose-500 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-pulse font-mono text-xs"
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
                    Reason: <span className="text-rose-100 font-semibold">{alert.reason || 'Guest requested cancellation'}</span> • Voided by: {alert.voidedBy}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissKDSAlert(alert.id)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs shrink-0 self-end sm:self-center transition-colors cursor-pointer border border-rose-600 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Top KDS Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase font-mono">
                Kitchen Display System (KDS)
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live Cooking Stations • <span className="text-amber-400 font-semibold">{branchName}</span> • <span className="text-slate-300 font-bold">{activeTotal} Active Orders</span>
            </p>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('columns')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'columns'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Columns</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board Layout: NEW, PREPARING, READY */}
      {viewMode === 'columns' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1: NEW */}
          <div className="bg-[#111827]/80 rounded-xl border border-rose-900/50 p-3 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-rose-950/60 border border-rose-800/50 rounded-lg font-mono">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>1. NEW ORDERS</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-rose-500 text-slate-950 font-mono">
                {newKots.length}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
              {newKots.map(renderKOTCard)}
              {newKots.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No new orders in queue
                </div>
              )}
            </div>
          </div>

          {/* Column 2: PREPARING */}
          <div className="bg-[#111827]/80 rounded-xl border border-amber-900/50 p-3 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-amber-950/60 border border-amber-800/50 rounded-lg font-mono">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>2. PREPARING (COOKING)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono">
                {preparingKots.length}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
              {preparingKots.map(renderKOTCard)}
              {preparingKots.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No orders currently cooking
                </div>
              )}
            </div>
          </div>

          {/* Column 3: READY */}
          <div className="bg-[#111827]/80 rounded-xl border border-emerald-900/50 p-3 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-emerald-950/60 border border-emerald-800/50 rounded-lg font-mono">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. READY TO SERVE</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-mono">
                {readyKots.length}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
              {readyKots.map(renderKOTCard)}
              {readyKots.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No orders awaiting pickup
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Full Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKots.filter(k => k.status !== 'cancelled' && k.status !== 'served').map(renderKOTCard)}
        </div>
      )}
    </div>
  );
};
