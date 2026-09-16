import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KOT } from '../../types';
import { 
  ReceiptText, 
  Printer, 
  LogOut, 
  User, 
  Clock
} from 'lucide-react';

interface CashierHeaderProps {
  printerStatus?: 'online' | 'offline';
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const CashierHeader: React.FC<CashierHeaderProps> = ({ 
  printerStatus = 'online',
  activeTabOverride,
  onNavigate
}) => {
  const { 
    currentUser, 
    activeTab,
    setActiveTab, 
    showToast, 
    logout,
    filteredKots,
    kots,
    bills,
    openReceiptModal,
    currentBranch,
    selectTakeawayOrder,
    setCartOrderType,
    updateKOTStatus
  } = useApp();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [clearedAlertIds, setClearedAlertIds] = useState<string[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const currentActive = activeTabOverride || activeTab;

  const handleTabClick = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Active unbilled KOTs that have reached 'ready' status (Takeaway & Delivery for Cashier Counter)
  const readyOrders = useMemo(() => {
    const list = filteredKots || kots || [];
    return list.filter(k => 
      k.status === 'ready' && 
      !k.isBilled && 
      (currentBranch === 'all' || k.branchId === currentBranch) &&
      (k.orderType === 'takeaway' || k.orderType === 'delivery' || k.orderType === 'parcel')
    );
  }, [filteredKots, kots, currentBranch]);

  // Active alerts not cleared by cashier
  const activeAlerts = useMemo(() => {
    return readyOrders.filter(o => !clearedAlertIds.includes(o.id));
  }, [readyOrders, clearedAlertIds]);

  const unreadCount = activeAlerts.length;

  // Active KOTs count (tickets in active queue: new, preparing, ready)
  const activeTickets = filteredKots || kots || [];
  const activeKotsCount = activeTickets.filter(
    k => k.status === 'new' || k.status === 'preparing' || k.status === 'ready'
  ).length;

  const handlePrintTest = () => {
    showToast('Test Receipt Sent', 'Thermal printer test job dispatched to Counter EPSON TM-T88VI (58mm).', 'success');
    if (bills.length > 0) {
      openReceiptModal(bills[0]);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClearedAlertIds(readyOrders.map(o => o.id));
    showToast('Alerts Cleared', 'Kitchen ready alerts cleared.', 'info');
  };

  const handleMarkHandedOver = (order: KOT) => {
    updateKOTStatus(order.id, 'served');
    const rawId = order.takeawayId || (order.kotNumber ? `TK-${order.kotNumber.replace(/\D/g, '').slice(-3)}` : '101');
    const displayId = rawId.startsWith('#') ? rawId : `#${rawId}`;
    showToast(
      'Order Handed Over',
      `Takeaway ${displayId} marked as handed over / packed!`,
      'success'
    );
  };

  const handleAlertClick = (order: KOT) => {
    const takeawayLabel = order.takeawayId || (order.kotNumber ? `TK-${order.kotNumber.replace(/\D/g, '').slice(-3)}` : 'TK-101');
    selectTakeawayOrder(takeawayLabel);
    setCartOrderType('takeaway');
    handleTabClick('pos');
    setIsNotificationOpen(false);
    showToast('Order Loaded', `Opened Takeaway ${takeawayLabel} in POS.`);
  };

  const getOrderTitle = (order: KOT) => {
    const rawId = order.takeawayId || (order.kotNumber ? `TK-${order.kotNumber.replace(/\D/g, '').slice(-3)}` : '101');
    const displayId = rawId.startsWith('#') ? rawId : `#${rawId}`;
    const typeLabel = order.orderType === 'delivery' ? 'Delivery' : order.orderType === 'parcel' ? 'Parcel' : 'Takeaway';
    return `${typeLabel} ${displayId}: Ready for Handover/Packing`;
  };

  // Close notification on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="w-full flex items-center justify-between px-4 h-16 min-w-0 bg-[#0D111A] border-b border-white/10 select-none flex-shrink-0 shadow-xs font-sans z-30">
        {/* Left: Cashier Terminal branding + Horizontal Navigation Tabs */}
        <div className="flex items-center min-w-0 gap-2 sm:gap-3">
          {/* Cashier Terminal branding */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200 font-bold shadow-xs shrink-0">
              <ReceiptText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                CASHIER TERMINAL
              </div>
              <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Counter #01</div>
            </div>
            <div className="xl:hidden hidden sm:block">
              <div className="text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                CASHIER
              </div>
            </div>
          </div>

          {/* Integrated Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1 shrink overflow-x-auto no-scrollbar max-w-[60vw] bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {/* 1. Tables */}
            <button
              id="cashier-tab-tables"
              type="button"
              onClick={() => handleTabClick('tables')}
              className={`cursor-pointer transition-all ${
                currentActive === 'tables'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all'
              }`}
            >
              <span className="text-base">🪑</span>
              <span>Tables</span>
            </button>

            {/* 2. POS */}
            <button
              id="cashier-tab-pos"
              type="button"
              onClick={() => handleTabClick('pos')}
              className={`cursor-pointer transition-all ${
                currentActive === 'pos'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all'
              }`}
            >
              <span className="text-base">🖥️</span>
              <span>POS</span>
            </button>

            {/* 3. Bills */}
            <button
              id="cashier-tab-bills"
              type="button"
              onClick={() => handleTabClick('bills')}
              className={`cursor-pointer transition-all ${
                currentActive === 'bills'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all'
              }`}
            >
              <span className="text-base">🧾</span>
              <span>Bills</span>
            </button>

            {/* 4. KOTs (with dynamic badge counter) */}
            <button
              id="cashier-tab-kots"
              type="button"
              onClick={() => handleTabClick('kot')}
              className={`cursor-pointer transition-all ${
                currentActive === 'kot' || currentActive === 'kots'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all'
              }`}
            >
              <span className="text-base">📋</span>
              <span>KOTs</span>
              {activeKotsCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono ml-0.5">
                  {activeKotsCount}
                </span>
              )}
            </button>

            {/* 5. Z-Report */}
            <button
              id="cashier-tab-zreport"
              type="button"
              onClick={() => handleTabClick('zreport')}
              className={`cursor-pointer transition-all ${
                currentActive === 'zreport'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all'
              }`}
            >
              <span className="text-base">📊</span>
              <span>Z-Report</span>
            </button>

            {/* 6. Test Print */}
            <button
              id="cashier-tab-test-print"
              type="button"
              onClick={handlePrintTest}
              className="text-gray-400 hover:text-white hover:bg-white/5 font-medium px-2.5 py-1.5 text-xs md:text-sm whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="text-base">🖨️</span>
              <span>Test Print</span>
            </button>
          </div>
        </div>

        {/* Right-Side Actions Alignment: Pinned right container */}
        <div className="shrink-0 flex items-center gap-2 text-xs">
          {/* 1. Thermal Printer status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium">Printer Ready</span>
          </div>

          {/* 2. Kitchen Ready Notification Bell with Floating Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              id="cashier-notification-bell-btn"
              type="button"
              onClick={() => setIsNotificationOpen(prev => !prev)}
              className="relative p-2.5 rounded-xl bg-[#161B26] border border-white/10 text-gray-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={unreadCount > 0 ? `${unreadCount} kitchen ready order(s)` : 'Kitchen Ready Alerts'}
            >
              <span className="text-lg">🔔</span>
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#0D111A] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Floating Popover Dropdown */}
            {isNotificationOpen && (
              <div 
                id="cashier-ready-alerts-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161B26] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200 backdrop-blur-md"
              >
                {/* Header: "Kitchen Ready Alerts" with a "Clear All" button */}
                <div className="px-3.5 py-2.5 bg-[#0D111A] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔔</span>
                    <span className="text-xs font-bold text-white tracking-wider font-mono">
                      Kitchen Ready Alerts
                    </span>
                    {activeAlerts.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-extrabold font-mono">
                        {activeAlerts.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={activeAlerts.length === 0}
                    className="text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-white/10"
                  >
                    Clear All
                  </button>
                </div>

                {/* Items: Display active orders that reached READY status */}
                <div className="max-h-[420px] overflow-y-auto p-2.5 space-y-2.5">
                  {activeAlerts.length === 0 ? (
                    <div className="py-7 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                        ✓
                      </div>
                      <div className="text-xs font-semibold text-white">No Ready Takeaways</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        All takeaway & delivery packets have been handed over or packed.
                      </p>
                    </div>
                  ) : (
                    activeAlerts.map(order => (
                      <div
                        key={order.id}
                        className="bg-[#121620] border border-white/10 rounded-xl p-3 space-y-2 shadow-md transition-all"
                      >
                        {/* Header: Bold Emerald Order Title with timestamp & total */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 flex-wrap">
                              <span>{getOrderTitle(order)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                              <span className="font-mono text-emerald-300 font-semibold">{order.kotNumber}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {order.readyAt ? `Ready at ${order.readyAt}` : (order.timeFormatted || 'Just now')}
                              </span>
                              <span>•</span>
                              <span className="text-white font-semibold font-mono">₹{order.totalAmount.toFixed(0)}</span>
                              {order.customerName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-300 truncate max-w-[130px]">{order.customerName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Items List: Compact gray pills showing dishes ready */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {order.items.map((item, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium"
                            >
                              <span className={item.isVeg ? "w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" : "w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"} />
                              <span className="truncate max-w-[160px]">{item.name}</span>
                              <span className="text-emerald-400 font-bold font-mono">×{item.quantity}</span>
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons at bottom of card */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                          {/* Primary Green Button: [📦 Mark Handed Over / Packed] */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkHandedOver(order);
                            }}
                            className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm border border-emerald-400/40"
                          >
                            <span className="text-sm">📦</span>
                            <span>Mark Handed Over / Packed</span>
                          </button>

                          {/* Secondary Outline Button: [Open Bill / POS] */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertClick(order);
                            }}
                            className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10 shrink-0"
                          >
                            <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Open Bill / POS</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Cashier Profile (Anita) */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#161B26] text-white border border-white/10 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-200">
              {currentUser?.name || 'Anita'}
            </span>
          </div>

          {/* 4. Logout / Switch User */}
          <button
            onClick={logout}
            title="Sign Out / Switch Role"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
};
