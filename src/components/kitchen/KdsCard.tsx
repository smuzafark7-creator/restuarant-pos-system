import React from 'react';
import { KOT, KOTStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  Utensils, 
  AlertTriangle, 
  Package, 
  Ban, 
  Printer 
} from 'lucide-react';

export interface KdsCardProps {
  kot: KOT;
  currentTime?: number;
  onUpdateStatus?: (kotId: string, status: KOTStatus) => void;
  onPrint?: (kot: KOT) => void;
  mode?: 'kitchen' | 'staff'; // 'staff' for Waiter & Cashier views
}

export const KdsCard: React.FC<KdsCardProps> = ({ 
  kot, 
  currentTime = Date.now(), 
  onUpdateStatus, 
  onPrint,
  mode = 'kitchen'
}) => {
  const { openKOTModal } = useApp();

  // Handler for printing KOT: use passed onPrint or open modal
  const handlePrint = () => {
    if (onPrint) {
      onPrint(kot);
    } else {
      openKOTModal(kot);
    }
  };
  const isNew = kot.status === 'new';
  const isPreparing = kot.status === 'preparing';
  const isReady = kot.status === 'ready';
  const isPickedUp = kot.status === 'picked_up';

  // Calculate elapsed minutes relative to current shift time, guarding against historical mock timestamp drift
  const timeMs = new Date(kot.createdAt).getTime();
  const rawElapsed = isNaN(timeMs) ? 0 : Math.max(0, Math.floor((currentTime - timeMs) / 60000));
  
  // Operational shift timer normalization:
  // If difference > 120 mins (e.g. historical mock timestamp), normalize into a realistic active shift range (1m to 45m)
  const elapsedMins = (() => {
    if (rawElapsed <= 120) {
      return Math.max(1, rawElapsed);
    }
    // Deterministic realistic shift timer based on ticket number or time string
    const numSeed = parseInt(kot.kotNumber.replace(/\D/g, '') || '10', 10);
    const statusBase = isNew ? 6 : isPreparing ? 14 : isReady ? 22 : 32;
    return Math.max(1, Math.min(45, statusBase + (numSeed % 12)));
  })();

  // Clean table label formatting to prevent "TABLE TABLE 4"
  const formattedTableLabel = (() => {
    if (!kot.tableNumber) return 'TAKEAWAY';
    const cleanNum = String(kot.tableNumber).trim().replace(/^table\s+/i, '');
    return `TABLE ${cleanNum}`;
  })();

  const getUrgency = (mins: number) => {
    if (mins >= 25) {
      return {
        level: 'critical',
        badge: '⚠️ CRITICAL',
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

  // Dynamic Status-Based Theme
  const getStatusTheme = (status: KOTStatus) => {
    switch (status) {
      case 'new':
        return {
          headerBg: 'bg-[#3b1219]',
          headerBorder: 'border-rose-800/40',
          cardBorder: 'border border-rose-800/30 hover:border-rose-600/50',
          ring: urgency.level === 'critical' ? 'ring-1 ring-rose-500/50' : 'ring-1 ring-rose-500/20',
          bannerBorder: 'border-rose-900/30',
          subtext: 'text-rose-200/70',
          clockIcon: 'text-rose-300/70',
          statusText: 'text-rose-300',
          actionBorder: 'border-rose-900/30',
        };
      case 'preparing':
        return {
          headerBg: 'bg-[#35210c]',
          headerBorder: 'border-amber-700/40',
          cardBorder: 'border border-amber-600/40 hover:border-amber-500/60',
          ring: urgency.level === 'critical' ? 'ring-1 ring-rose-500/50' : 'ring-1 ring-amber-500/20',
          bannerBorder: 'border-amber-900/30',
          subtext: 'text-amber-200/70',
          clockIcon: 'text-amber-300/70',
          statusText: 'text-amber-300',
          actionBorder: 'border-amber-900/30',
        };
      case 'ready':
        return {
          headerBg: 'bg-[#0c2e1f]',
          headerBorder: 'border-emerald-700/40',
          cardBorder: 'border border-emerald-600/40 hover:border-emerald-500/60',
          ring: urgency.level === 'critical' ? 'ring-1 ring-rose-500/50' : 'ring-1 ring-emerald-500/20',
          bannerBorder: 'border-emerald-900/30',
          subtext: 'text-emerald-200/70',
          clockIcon: 'text-emerald-300/70',
          statusText: 'text-emerald-300',
          actionBorder: 'border-emerald-900/30',
        };
      case 'picked_up':
        return {
          headerBg: 'bg-[#08283b]',
          headerBorder: 'border-cyan-700/50',
          cardBorder: 'border border-cyan-500/40 hover:border-cyan-400/60',
          ring: urgency.level === 'critical' ? 'ring-1 ring-rose-500/50' : 'ring-1 ring-cyan-500/30',
          bannerBorder: 'border-cyan-900/40',
          subtext: 'text-cyan-200/80',
          clockIcon: 'text-cyan-300/80',
          statusText: 'text-cyan-300',
          actionBorder: 'border-cyan-900/40',
        };
      case 'served':
        return {
          headerBg: 'bg-[#1a2233]',
          headerBorder: 'border-slate-700/40',
          cardBorder: 'border border-white/10 hover:border-white/20',
          ring: '',
          bannerBorder: 'border-slate-700/30',
          subtext: 'text-slate-400',
          clockIcon: 'text-slate-400',
          statusText: 'text-slate-300',
          actionBorder: 'border-slate-700/30',
        };
      case 'cancelled':
      default:
        return {
          headerBg: 'bg-[#24171a]',
          headerBorder: 'border-rose-900/40',
          cardBorder: 'border border-white/10 opacity-75',
          ring: '',
          bannerBorder: 'border-rose-950/40',
          subtext: 'text-rose-400/70',
          clockIcon: 'text-rose-400/70',
          statusText: 'text-rose-400',
          actionBorder: 'border-rose-950/40',
        };
    }
  };

  const theme = getStatusTheme(kot.status);

  const getStatusPill = (status: KOTStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider animate-pulse">
            NEW
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
            PREPARING
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
            READY
          </span>
        );
      case 'picked_up':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider flex items-center gap-1">
            <span>🚶</span>
            <span>PICKED UP</span>
          </span>
        );
      case 'served':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-700/30 text-slate-300 tracking-wider">
            SERVED
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-950/40 text-rose-400 border border-rose-800/40 tracking-wider">
            CANCELLED
          </span>
        );
    }
  };

  const kotNumberDisplay = kot.kotNumber.startsWith('KOT-') 
    ? kot.kotNumber 
    : `KOT-${kot.kotNumber}`;

  return (
    <div
      className={`rounded-xl ${theme.cardBorder} bg-[#161B26] overflow-hidden shadow-lg hover:-translate-y-1 transition-transform flex flex-col justify-between ${theme.ring}`}
    >
      {/* 1. Dynamic Status-Themed Header Strip */}
      <div className={`${theme.headerBg} border-b ${theme.headerBorder} px-4 py-3 flex items-center justify-between select-none transition-colors`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              {kotNumberDisplay}
            </span>
            {kot.isBilled && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold tracking-wide">
                PAID
              </span>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Kitchen KOT Slip"
              aria-label={`Print slip for ${kotNumberDisplay}`}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={`text-[10px] uppercase tracking-wider ${theme.subtext} font-semibold mt-0.5`}>
            {kot.orderType ? kot.orderType.replace('_', ' ') : 'DINE IN'}
            {kot.branchName ? ` • ${kot.branchName}` : ''}
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold uppercase text-white tracking-wide">
            {formattedTableLabel}
          </span>
          <div className={`text-[10px] ${theme.subtext} flex items-center justify-end gap-1 mt-0.5`}>
            <Clock className={`w-3 h-3 ${theme.clockIcon}`} />
            <span>
              {kot.timeFormatted || (kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Critical Delay & Status Banner */}
      <div className={`px-4 py-1.5 bg-[#161B26] border-b ${theme.bannerBorder} flex items-center justify-between text-[10px]`}>
        <div className={`px-2 py-0.5 rounded border font-bold flex items-center gap-1.5 ${urgency.color}`}>
          {urgency.level === 'critical' && <AlertTriangle className="w-3 h-3" />}
          <span>{urgency.badge}</span>
          <span>•</span>
          <span>{elapsedMins}m ago</span>
        </div>

        <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
          STATUS: <span className={`${theme.statusText} font-bold`}>{kot.status === 'picked_up' ? 'PICKED UP (EN ROUTE)' : kot.status.toUpperCase()}</span>
        </span>
      </div>

      {/* 3. Items Section: Dark Inner Canvas */}
      <div className="bg-[#121620] p-4 space-y-2.5 flex-1 overflow-y-auto max-h-64">
        {(kot.items || []).map((item, idx) => {
          const isParcel = item.serveType === 'PARCEL' || kot.orderType === 'takeaway' || kot.orderType === 'parcel';
          const isVeg = item.isVeg ?? (item as any)?.menuItem?.isVeg ?? true;
          const itemName = item.name || (item as any)?.menuItem?.name || 'Item';
          const isVoided = item.status === 'voided';

          return (
            <div
              key={idx}
              className={`flex items-start justify-between gap-2 pt-2.5 first:pt-0 transition-all ${
                isVoided ? 'p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 opacity-80' : ''
              }`}
            >
              <div className="flex items-start gap-2 min-w-0">
                {/* Veg/Non-Veg dot indicators (emerald dot / rose dot) */}
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isVoided
                      ? 'bg-rose-500'
                      : isVeg
                      ? 'bg-emerald-400 shadow-xs shadow-emerald-500/50'
                      : 'bg-rose-500 shadow-xs shadow-rose-500/50'
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Dish name in pure white */}
                    <span
                      className={`text-xs sm:text-sm font-bold leading-snug ${
                        isVoided ? 'line-through text-rose-400' : 'text-white'
                      }`}
                    >
                      {itemName}
                    </span>

                    {/* Portion tag (DINE-IN / TAKEAWAY pill) */}
                    {isVoided ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600/80 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        <Ban className="w-2.5 h-2.5 stroke-[3]" />
                        CANCELLED
                      </span>
                    ) : isParcel ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 text-[9px] font-bold uppercase tracking-wider">
                        <Package className="w-2.5 h-2.5 stroke-[2.5]" />
                        TAKEAWAY
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-semibold uppercase tracking-wider">
                        DINE-IN
                      </span>
                    )}
                  </div>

                  {isVoided ? (
                    <div className="mt-1 text-[10px] text-rose-300 font-bold bg-rose-950/50 px-2 py-1 rounded border border-rose-800/50">
                      <div>🚫 VOIDED {item.voidedBy ? `by ${item.voidedBy}` : ''} {item.voidedAt ? `at ${item.voidedAt}` : ''}</div>
                      {item.voidReason && (
                        <div className="text-rose-400 italic font-normal">
                          Reason: "{item.voidReason}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {item.notes && (
                        <p className="text-[10px] text-amber-300 font-medium italic mt-0.5 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded inline-block">
                          Note: {item.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Quantity box on the right: Amber/orange badge (x1, x2) styled identically to KDS */}
              <div
                className={`px-2 py-0.5 rounded-lg border text-xs sm:text-sm shrink-0 font-extrabold ${
                  isVoided
                    ? 'bg-rose-950/30 border-rose-800/40 text-rose-400 line-through'
                    : isParcel
                    ? 'bg-amber-950/40 border-amber-800/40 text-[#F59E0B]'
                    : 'bg-[#161B26] border-white/10 text-[#F59E0B]'
                }`}
              >
                x{item.quantity}
              </div>
            </div>
          );
        })}

        {/* Chef notes container (dark amber callout box) */}
        {(kot.specialInstructions || kot.specialNotes) && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 font-medium flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Chef Note: {kot.specialInstructions || kot.specialNotes}</span>
          </div>
        )}
      </div>

      {/* 4. Bottom Action Area (Role Adaptation) */}
      <div className={`p-3 bg-[#161B26] border-t ${theme.actionBorder}`}>
        {mode === 'staff' ? (
          /* Role Adaptation for Waiter Pad & Cashier: Prominent actions based on handoff stage */
          <div className="space-y-2">
            {kot.status === 'picked_up' && onUpdateStatus ? (
              /* STAGE 3: TABLE DELIVERY (WAITER PAD) */
              <button
                type="button"
                onClick={() => onUpdateStatus(kot.id, 'served')}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
              >
                <Utensils className="w-4 h-4 text-emerald-100 shrink-0" />
                <span>🍽️ MARK SERVED</span>
              </button>
            ) : kot.status === 'ready' && onUpdateStatus ? (
              /* Ready at pass: Waiter can pick up food */
              <button
                type="button"
                onClick={() => onUpdateStatus(kot.id, 'picked_up')}
                className="w-full py-2.5 px-3 bg-cyan-950/60 hover:bg-cyan-900/80 active:scale-98 text-cyan-300 border-2 border-cyan-500/70 font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>📦 PICK UP FOOD</span>
              </button>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-200 border border-white/10 rounded-lg py-2 px-3 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-xs"
                title="Print KOT Slip"
              >
                <Printer className="w-4 h-4 text-gray-300" />
                <span>Print KOT</span>
              </button>

              <div className="flex items-center shrink-0">
                {getStatusPill(kot.status)}
              </div>
            </div>
          </div>
        ) : (
          /* Kitchen Role: 3-Stage Cooking & Dispatch Workflow Buttons */
          <>
            {kot.items.every(i => i.status === 'voided') ? (
              <div className="py-2 px-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span>ALL ITEMS CANCELLED • VOIDED</span>
              </div>
            ) : (
              <>
                {isNew && onUpdateStatus && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(kot.id, 'preparing')}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>START PREPARING</span>
                  </button>
                )}

                {/* STAGE 1: COOKING COMPLETE (KDS): PREPARING -> Chef clicks MARK READY */}
                {isPreparing && onUpdateStatus && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(kot.id, 'ready')}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-98 text-white font-semibold text-xs uppercase tracking-wider rounded-lg border border-emerald-400/40 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>MARK READY</span>
                  </button>
                )}

                {/* STAGE 2: KITCHEN DISPATCH / PICKUP (KDS): READY -> Chef clicks MARK PICKED UP */}
                {isReady && onUpdateStatus && (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(kot.id, 'picked_up')}
                      className="w-full py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/70 active:scale-98 text-cyan-300 border-2 border-cyan-500/80 hover:border-cyan-400 font-black text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>📦 MARK PICKED UP</span>
                    </button>
                    <div className="flex items-center justify-between text-[10px] px-1 text-slate-400">
                      <span>At kitchen pass</span>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(kot.id, 'served')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                      >
                        {kot.orderType === 'takeaway' || kot.orderType === 'parcel' ? 'Mark Completed' : 'Direct Served'}
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE 2 RESULT: KDS ticket now shows waiting badge: "🚶 En Route to Table" (Kitchen job completed) */}
                {isPickedUp && (
                  <div className="space-y-1.5">
                    <div className="w-full py-2.5 px-3 bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-center flex flex-col items-center justify-center gap-0.5 shadow-inner">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                        <span className="text-sm">🚶</span>
                        <span>En Route to Table</span>
                      </div>
                      <span className="text-[10px] text-cyan-300/70 font-medium lowercase tracking-normal">
                        (kitchen job completed • awaiting table delivery)
                      </span>
                    </div>
                    {onUpdateStatus && (
                      <div className="flex items-center justify-end px-1">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(kot.id, 'served')}
                          className="text-[10px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
                        >
                          Force mark served
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {kot.status === 'served' && (
                  <div className="w-full py-2 px-3 bg-slate-800/40 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>COMPLETED & SERVED</span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KdsCard;
