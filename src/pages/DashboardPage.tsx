import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Utensils, 
  Package, 
  ChefHat, 
  CheckCircle2, 
  Building2, 
  CreditCard, 
  QrCode, 
  Banknote,
  ArrowRight,
  Clock,
  ChevronRight,
  Users,
  Bell,
  Grid3X3,
  Check,
  Flame
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const { 
    computedStats, 
    currentBranch, 
    setBranch, 
    setActiveTab, 
    filteredKots, 
    filteredBills, 
    openReceiptModal,
    currentUser,
    filteredTables,
    selectTableForPOS,
    pendingBillRequests,
    updateKOTStatus,
    requestBill
  } = useApp();

  const isConsolidated = currentBranch === 'all';
  const branchName = isConsolidated ? 'All Branches (Consolidated)' : BRANCHES.find(b => b.id === currentBranch)?.name;

  // -------------------------------------------------------------
  // WAITER ROLE: Limited Operational View (No sensitive financials)
  // -------------------------------------------------------------
  if (currentUser?.role === 'waiter') {
    const occupiedTables = filteredTables.filter(t => t.status === 'occupied' || t.status === 'billing' || t.status === 'ready');
    const availableTables = filteredTables.filter(t => t.status === 'available');
    const readyKots = filteredKots.filter(k => k.status === 'ready' && !k.isBilled);
    const cookingKots = filteredKots.filter(k => (k.status === 'preparing' || k.status === 'new') && !k.isBilled);

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-mono">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Floor Operations Console</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Floor dispatch & kitchen monitor for <strong className="text-slate-800">{branchName}</strong> • Logged in as <span className="text-emerald-700 font-bold">{currentUser.name} (Waiter)</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tables')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Tables Floor</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <span>Dine-In POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
            >
              <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
              <span>KDS</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards (No sensitive financials/revenue) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Occupied Tables */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Occupied Tables</span>
              <div className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {occupiedTables.length} <span className="text-xs text-slate-400 font-normal">/ {filteredTables.length} Total</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {availableTables.length} tables currently available
            </div>
          </div>

          {/* Food Ready for Pickup */}
          <div className="bg-white p-4 rounded-lg border border-emerald-300 bg-emerald-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-900">Food Ready</span>
              <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-emerald-800 tracking-tight">
              {readyKots.length} <span className="text-xs text-emerald-600 font-normal">orders</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
              {readyKots.length > 0 ? 'Ready to serve to tables now!' : 'No orders awaiting pickup'}
            </div>
          </div>

          {/* Cooking in Kitchen */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Kitchen Cooking</span>
              <div className="p-1.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                <ChefHat className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {cookingKots.length} <span className="text-xs text-slate-400 font-normal">KOTs</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Actively in preparation
            </div>
          </div>

          {/* Bill Requests Pending Cashier */}
          <div className="bg-white p-4 rounded-lg border border-purple-200 bg-purple-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-purple-900">Bill Requests</span>
              <div className="p-1.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-purple-900 tracking-tight">
              {pendingBillRequests.length} <span className="text-xs text-purple-600 font-normal">pending</span>
            </div>
            <div className="text-[10px] text-purple-700 mt-1">
              Awaiting cashier desk settlement
            </div>
          </div>
        </div>

        {/* Food Ready Alert Section */}
        {readyKots.length > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
              <h3 className="font-bold text-sm text-emerald-950">
                KITCHEN COUNTER: Food Ready for Service ({readyKots.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyKots.map(kot => (
                <div key={kot.id} className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{kot.kotNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {kot.tableNumber || 'Takeaway'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-0.5 max-h-24 overflow-y-auto">
                    {kot.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.name}</span>
                        {it.notes && <span className="text-[10px] text-amber-700 italic">({it.notes})</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateKOTStatus(kot.id, 'served')}
                    className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>MARK AS SERVED TO TABLE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Operational Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Live Floor Table Matrix */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Live Table Floor Matrix</h3>
                <p className="text-xs text-slate-500">Tap table to open in POS or request bill from Cashier</p>
              </div>
              <button
                onClick={() => setActiveTab('tables')}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Floor Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredTables.map(tbl => {
                const isOccupied = tbl.status === 'occupied';
                const isReady = tbl.status === 'ready';
                const isBilling = tbl.status === 'billing';

                let borderCls = 'border-slate-200 bg-white hover:border-emerald-500';
                if (isReady) borderCls = 'border-emerald-400 bg-emerald-50/30';
                else if (isBilling) borderCls = 'border-purple-400 bg-purple-50/30';
                else if (isOccupied) borderCls = 'border-amber-300 bg-amber-50/25';

                return (
                  <div
                    key={tbl.id}
                    onClick={() => selectTableForPOS(tbl.name)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:shadow-xs flex flex-col justify-between ${borderCls}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{tbl.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isReady ? 'bg-emerald-100 text-emerald-800' :
                        isBilling ? 'bg-purple-100 text-purple-800' :
                        isOccupied ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tbl.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{tbl.capacity} seats</span>
                      {tbl.seatedAt && <span>{tbl.seatedAt}</span>}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); selectTableForPOS(tbl.name); }}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        POS
                      </button>
                      {isOccupied || isReady ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); requestBill(tbl.name); }}
                          className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold"
                          title="Request bill from cashier"
                        >
                          Req Bill
                        </button>
                      ) : isBilling ? (
                        <span className="text-[9px] text-purple-800 font-bold">Requested</span>
                      ) : (
                        <span className="text-[9px] text-emerald-700 font-bold">Free</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: In-Flight Kitchen Orders Queue */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Kitchen In-Flight Queue</h3>
                <p className="text-xs text-slate-500">Live prep status</p>
              </div>
              <button
                onClick={() => setActiveTab('kitchen')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View KDS
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {cookingKots.map(kot => (
                <div key={kot.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{kot.kotNumber}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                      {kot.status === 'preparing' ? 'PREPARING' : 'NEW'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>{kot.tableNumber || 'Takeaway'}</span>
                    <span>{kot.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {kot.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
              ))}

              {cookingKots.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No orders currently cooking in kitchen.
                </div>
              )}
            </div>

            {/* Bill Requests status list */}
            {pendingBillRequests.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-purple-700" />
                  <span>Pending Cashier Settlements ({pendingBillRequests.length})</span>
                </h4>
                {pendingBillRequests.map(r => (
                  <div key={r.id} className="p-2 bg-purple-50 border border-purple-200 rounded text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-950">{r.tableNumber}</span>
                      <span className="text-[10px] text-purple-700 block">Requested at {r.requestedAt}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded">
                      ₹{r.totalAmount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXECUTIVE DASHBOARD (Owner / Manager / Cashier with Financials)
  // -------------------------------------------------------------

  const totalPayments = computedStats.paymentBreakdown.cash + 
    computedStats.paymentBreakdown.upi + 
    computedStats.paymentBreakdown.card;

  const cashPct = Math.round((computedStats.paymentBreakdown.cash / (totalPayments || 1)) * 100);
  const upiPct = Math.round((computedStats.paymentBreakdown.upi / (totalPayments || 1)) * 100);
  const cardPct = Math.round((computedStats.paymentBreakdown.card / (totalPayments || 1)) * 100);

  // Hourly mock activity distribution for visual trend chart
  const hourlyData = [
    { hour: '11 AM', sales: 18500, orders: 34 },
    { hour: '12 PM', sales: 42300, orders: 82 },
    { hour: '1 PM', sales: 64100, orders: 126 },
    { hour: '2 PM', sales: 48900, orders: 94 },
    { hour: '3 PM', sales: 21500, orders: 42 },
    { hour: '4 PM', sales: 23150, orders: 50 },
  ];

  const maxHourlySales = Math.max(...hourlyData.map(h => h.sales));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Branch Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-mono">Executive Operations Console</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying live telemetry and sales data for <strong className="text-slate-800 font-mono">{branchName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>Open POS Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('kitchen')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kitchen KDS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3.5">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Today's Sales</span>
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            ₹{computedStats.todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono font-medium mt-1 flex items-center gap-0.5">
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Total Orders</span>
            <div className="p-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            {computedStats.totalOrders}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            All order modes
          </div>
        </div>

        {/* Dine-in Orders */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Dine-in Orders</span>
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            {computedStats.dineInOrders}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Avg table: 42 min
          </div>
        </div>

        {/* Takeaway Orders */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Takeaway Orders</span>
            <div className="p-1.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            {computedStats.takeawayOrders}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Parcel pickups
          </div>
        </div>

        {/* Card 5: Pending KOTs (Awaiting Kitchen Pickup) */}
        <div 
          onClick={() => setActiveTab('kot')}
          className="bg-white p-4 rounded-lg border border-rose-200 shadow-2xs hover:border-rose-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-900 font-mono">Pending KOTs</span>
            <div className="p-1.5 rounded bg-rose-50 text-rose-600 border border-rose-200 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 tracking-tight font-mono">
            {computedStats.pendingKOTs}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
            Awaiting Kitchen Pickup
          </div>
        </div>

        {/* Card 6: Active Cooking (Food in Preparation) */}
        <div 
          onClick={() => setActiveTab('kitchen')}
          className="bg-white p-4 rounded-lg border border-amber-200 shadow-2xs hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-900 font-mono">Active Cooking</span>
            <div className="p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600 tracking-tight font-mono">
            {computedStats.activeCookingKOTs}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
            Food in Preparation
          </div>
        </div>

        {/* Card 7: Settled Bills */}
        <div 
          onClick={() => setActiveTab('bills')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Settled Bills</span>
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 tracking-tight font-mono">
            {computedStats.paidBills}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            100% audited
          </div>
        </div>
      </div>

      {/* Middle Row: Payment Breakdown & Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Breakdown Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-mono">Payment Reconciliation</h3>
                <p className="text-xs text-slate-500">Breakdown by tender channel</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                ₹{totalPayments.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Visual multi-segment bar */}
            <div className="mt-4 mb-4">
              <div className="h-2.5 w-full rounded bg-slate-100 flex overflow-hidden border border-slate-200">
                <div style={{ width: `${upiPct}%` }} className="bg-emerald-600 h-full" title={`UPI: ${upiPct}%`} />
                <div style={{ width: `${cashPct}%` }} className="bg-amber-500 h-full" title={`Cash: ${cashPct}%`} />
                <div style={{ width: `${cardPct}%` }} className="bg-sky-500 h-full" title={`Card: ${cardPct}%`} />
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">UPI Payments</div>
                    <div className="text-[11px] text-slate-500">GPay, PhonePe, Dynamic QR</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    ₹{computedStats.paymentBreakdown.upi.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-semibold">{upiPct}% share</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Cash Payments</div>
                    <div className="text-[11px] text-slate-500">Physical register drawer</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    ₹{computedStats.paymentBreakdown.cash.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-amber-700 font-mono font-semibold">{cashPct}% share</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Card Payments</div>
                    <div className="text-[11px] text-slate-500">POS Swipe / Tap & Pay EDC</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    ₹{computedStats.paymentBreakdown.card.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-sky-700 font-mono font-semibold">{cardPct}% share</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>Includes split payments allocated by share</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Reconciled
            </span>
          </div>
        </div>

        {/* Branch Performance Comparison */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-mono">Branch Revenue Metrics</h3>
                <p className="text-xs text-slate-500">Cross-branch comparative performance</p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                3 Active Branches
              </span>
            </div>

            {/* Performance Bars */}
            <div className="space-y-3 mt-4">
              {/* Main Branch */}
              <div 
                onClick={() => setBranch('main')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentBranch === 'main' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Main Branch</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">MG Road</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    ₹{computedStats.branchPerformance.main.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded transition-all duration-500" 
                    style={{ width: `${Math.round((computedStats.branchPerformance.main / computedStats.todaySales) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>182 Orders completed</span>
                  <span className="font-medium text-slate-800">
                    {Math.round((computedStats.branchPerformance.main / computedStats.todaySales) * 100)}% share
                  </span>
                </div>
              </div>

              {/* City Branch */}
              <div 
                onClick={() => setBranch('city')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentBranch === 'city' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-900">City Branch</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">Jayanagar 4th</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    ₹{computedStats.branchPerformance.city.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div 
                    className="h-full bg-sky-600 rounded transition-all duration-500" 
                    style={{ width: `${Math.round((computedStats.branchPerformance.city / computedStats.todaySales) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>136 Orders completed</span>
                  <span className="font-medium text-slate-800">
                    {Math.round((computedStats.branchPerformance.city / computedStats.todaySales) * 100)}% share
                  </span>
                </div>
              </div>

              {/* Beach Road Branch */}
              <div 
                onClick={() => setBranch('beach')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentBranch === 'beach' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Beach Road Branch</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">Promenade</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    ₹{computedStats.branchPerformance.beach.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded transition-all duration-500" 
                    style={{ width: `${Math.round((computedStats.branchPerformance.beach / computedStats.todaySales) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>110 Orders completed</span>
                  <span className="font-medium text-slate-800">
                    {Math.round((computedStats.branchPerformance.beach / computedStats.todaySales) * 100)}% share
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>Select any branch card to isolate data telemetry</span>
            <span className="text-emerald-700 font-semibold cursor-pointer hover:underline" onClick={() => setBranch('all')}>
              View Consolidated
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Data Grid & Pending Kitchen Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Data Grid */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-mono">Recent Audited Invoices</h3>
              <p className="text-xs text-slate-500">Live sequential billing ledger</p>
            </div>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-mono"
            >
              <span>View All Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {filteredBills.slice(0, 5).map(b => (
              <div 
                key={b.id} 
                onClick={() => openReceiptModal(b)}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                    {b.billNumber.replace('INV-', '#')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {b.tableNumber || (b.orderType === 'takeaway' ? 'Takeaway' : 'Parcel')}
                      <span className="ml-2 text-[10px] font-mono font-normal text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{b.branchName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {b.time} • {b.items.length} items • <span className="uppercase">{b.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">₹{b.grandTotal}</div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Kitchen Orders Widget */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-mono">Active Kitchen Orders (KOT)</h3>
              </div>
              <button
                onClick={() => setActiveTab('kitchen')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-mono"
              >
                <span>KDS Terminal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {filteredKots.filter(k => k.status !== 'served' && k.status !== 'cancelled').slice(0, 3).map(k => (
                <div key={k.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-900 font-mono">{k.kotNumber} • {k.tableNumber || 'Takeaway'}</span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase border ${
                      k.status === 'ready' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : k.status === 'preparing'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {k.status === 'new' ? 'PENDING' : k.status === 'preparing' ? 'COOKING' : k.status}
                    </span>
                  </div>
                  <div className="text-slate-600 space-y-0.5 text-[11px] font-mono">
                    {k.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity} × {it.name}</span>
                        <span className="text-slate-400">₹{it.rate * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {k.timeFormatted}
                    </span>
                    <span className="font-medium text-slate-700">{k.branchName}</span>
                  </div>
                </div>
              ))}

              {filteredKots.filter(k => k.status !== 'served' && k.status !== 'cancelled').length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 font-mono">
                  No active tickets in kitchen queue.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kot')}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors text-center font-mono border border-slate-200"
          >
            Manage All KOT Tickets
          </button>
        </div>
      </div>
    </div>
  );
};
