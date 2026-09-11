import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Utensils, 
  Package, 
  Building2, 
  Download, 
  Printer,
  PieChart,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const ReportsPage: React.FC = () => {
  const { computedStats, currentBranch, branches, filteredBills, showToast } = useApp();
  const [dateFilter, setDateFilter] = useState<string>('Today');
  const [customDate, setCustomDate] = useState<string>('2026-09-07');

  // Compute metrics with date multipliers for demo filtering
  const multiplier = dateFilter === 'Today' ? 1 
    : dateFilter === 'Yesterday' ? 0.92 
    : dateFilter === 'This Week' ? 6.8 
    : dateFilter === 'This Month' ? 27.5 
    : 1;

  const totalSales = Math.round(computedStats.todaySales * multiplier);
  const totalOrders = Math.round(computedStats.totalOrders * multiplier);
  const paidBillsCount = totalOrders;
  const aov = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Payment Breakdown
  const cashSales = Math.round(computedStats.paymentBreakdown.cash * multiplier);
  const upiSales = Math.round(computedStats.paymentBreakdown.upi * multiplier);
  const cardSales = Math.round(computedStats.paymentBreakdown.card * multiplier);

  // Order Type Breakdown
  const dineInOrders = Math.round(computedStats.dineInOrders * multiplier);
  const takeawayOrders = Math.round(computedStats.takeawayOrders * multiplier);
  const parcelOrders = Math.max(1, Math.round(takeawayOrders * 0.4));
  const directTakeawayOrders = takeawayOrders - parcelOrders;

  const dineInRevenue = Math.round(totalSales * 0.68);
  const takeawayRevenue = Math.round(totalSales * 0.22);
  const parcelRevenue = totalSales - dineInRevenue - takeawayRevenue;

  // Branch Performance
  const mainBranchSales = Math.round(computedStats.branchPerformance.main * multiplier);
  const cityBranchSales = Math.round(computedStats.branchPerformance.city * multiplier);
  const beachBranchSales = Math.round(computedStats.branchPerformance.beach * multiplier);

  // Top Selling Items
  const topItems = [
    { name: 'Chicken Biryani', category: 'Biryani', qty: Math.round(142 * multiplier), revenue: Math.round(39760 * multiplier), pct: 28 },
    { name: 'Chicken 65', category: 'Starters', qty: Math.round(98 * multiplier), revenue: Math.round(23520 * multiplier), pct: 18 },
    { name: 'Butter Chicken', category: 'Main Course', qty: Math.round(65 * multiplier), revenue: Math.round(20800 * multiplier), pct: 15 },
    { name: 'Butter Naan', category: 'Breads', qty: Math.round(280 * multiplier), revenue: Math.round(14000 * multiplier), pct: 11 },
    { name: 'Mutton Biryani', category: 'Biryani', qty: Math.round(48 * multiplier), revenue: Math.round(17280 * multiplier), pct: 13 },
    { name: 'Coke / Soda', category: 'Beverages', qty: Math.round(210 * multiplier), revenue: Math.round(8400 * multiplier), pct: 7 },
  ];

  const handleExportReport = () => {
    showToast('Report Exported', `Generated Financial Statement for ${dateFilter}`);
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Executive Business Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Consolidated operational metrics, revenue channels, and branch benchmarking for{' '}
            <strong className="text-slate-800 font-mono">
              {currentBranch === 'all' ? 'All 3 Branches' : (branches || []).find(b => b.id === currentBranch)?.name || 'Branch'}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {['Today', 'Yesterday', 'This Week', 'This Month', 'Custom Date'].map(t => (
              <button
                key={t}
                onClick={() => setDateFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  dateFilter === t
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {dateFilter === 'Custom Date' && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
            />
          )}

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4 Exact Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Sales */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {dateFilter === 'Today' ? "Today's Sales" : `${dateFilter} Sales`}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            +14.2% vs prior period
          </span>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalOrders}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-sans">
            Completed order volume
          </span>
        </div>

        {/* 3. Average Order Value (AOV) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{aov.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-sans">
            Revenue per order
          </span>
        </div>

        {/* 4. Paid Bills */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid Bills</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {paidBillsCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            100% Collection Rate
          </span>
        </div>
      </div>

      {/* 3 Dedicated Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Section 1: Payment Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Payment Breakdown</h3>
              <p className="text-xs text-slate-500 font-sans">Tender settlement distribution</p>
            </div>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {/* Cash */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  Cash
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{cashSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{Math.round((cashSales / totalSales) * 100)}% of total sales</span>
                <span>Physical drawer</span>
              </div>
            </div>

            {/* UPI */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  UPI
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{upiSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{Math.round((upiSales / totalSales) * 100)}% of total sales</span>
                <span>QR / Instant</span>
              </div>
            </div>

            {/* Card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                  Card
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{cardSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{Math.round((cardSales / totalSales) * 100)}% of total sales</span>
                <span>EDC Terminal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Order Type Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">2. Order Type Breakdown</h3>
              <p className="text-xs text-slate-500 font-sans">Service channel contribution</p>
            </div>
            <Utensils className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {/* Dine-in */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  Dine-in
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{dineInRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{dineInOrders} orders ({Math.round((dineInRevenue / totalSales) * 100)}%)</span>
                <span>Floor tables</span>
              </div>
            </div>

            {/* Takeaway */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                  Takeaway
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{takeawayRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{directTakeawayOrders} orders ({Math.round((takeawayRevenue / totalSales) * 100)}%)</span>
                <span>Counter pickup</span>
              </div>
            </div>

            {/* Parcel */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  Parcel
                </span>
                <span className="font-extrabold text-sm text-slate-900">₹{parcelRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                <span>{parcelOrders} orders ({Math.round((parcelRevenue / totalSales) * 100)}%)</span>
                <span>Delivery packed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Branch-wise Performance */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">3. Branch-wise Performance</h3>
              <p className="text-xs text-slate-500 font-sans">Consolidated branch benchmarking</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Main Branch */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">Main Branch</span>
                <span className="text-slate-900 font-bold">₹{mainBranchSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded" 
                  style={{ width: `${Math.round((mainBranchSales / totalSales) * 100)}%` }} 
                />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {Math.round((mainBranchSales / totalSales) * 100)}% contribution • MG Road Flagship
              </div>
            </div>

            {/* City Branch */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">City Branch</span>
                <span className="text-slate-900 font-bold">₹{cityBranchSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded" 
                  style={{ width: `${Math.round((cityBranchSales / totalSales) * 100)}%` }} 
                />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {Math.round((cityBranchSales / totalSales) * 100)}% contribution • Jayanagar Complex
              </div>
            </div>

            {/* Beach Road Branch */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">Beach Road Branch</span>
                <span className="text-slate-900 font-bold">₹{beachBranchSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-sky-600 rounded" 
                  style={{ width: `${Math.round((beachBranchSales / totalSales) * 100)}%` }} 
                />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {Math.round((beachBranchSales / totalSales) * 100)}% contribution • Coastal Promenade
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Top Performing Dishes</h3>
            <p className="text-xs text-slate-500 font-sans">Sales volume and gross revenue contribution</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{dateFilter}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank & Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {topItems.map((dish, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-200">
                      {idx + 1}
                    </span>
                    <span>{dish.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] border border-slate-200">
                      {dish.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-900">
                    {dish.qty}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{dish.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded h-1.5 overflow-hidden border border-slate-200">
                        <div className="bg-emerald-600 h-full rounded" style={{ width: `${dish.pct * 3}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">{dish.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
