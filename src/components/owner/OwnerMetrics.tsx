import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Receipt, 
  Users, 
  Clock, 
  UtensilsCrossed, 
  DollarSign, 
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OwnerMetrics: React.FC = () => {
  const { bills, tables, kots, currentBranch, branches } = useApp();

  // Filter bills by branch if branch selected
  const branchBills = bills.filter(
    b => currentBranch === 'all' || b.branchId === currentBranch
  );

  const totalSales = branchBills.reduce((acc, b) => acc + b.grandTotal, 0);
  const totalGst = branchBills.reduce((acc, b) => acc + b.gstAmount, 0);
  const netRevenue = Math.max(0, totalSales - totalGst);
  const totalBillsCount = branchBills.length;
  const avgOrderValue = totalBillsCount > 0 ? totalSales / totalBillsCount : 0;

  // Active tables
  const branchTables = tables.filter(
    t => currentBranch === 'all' || t.branchId === currentBranch
  );
  const occupiedTables = branchTables.filter(t => t.status === 'occupied' || t.status === 'billing');
  const occupancyRate = branchTables.length > 0 
    ? Math.round((occupiedTables.length / branchTables.length) * 100) 
    : 0;

  // Active KOTs
  const activeKots = kots.filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) &&
         (k.status === 'new' || k.status === 'preparing')
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none font-mono">
      {/* 1. Gross Revenue */}
      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gross Sales
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white">
            ₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* 2. Net Sales & GST */}
      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Net Revenue (Excl. Tax)
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white">
            ₹{netRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            GST 5%: ₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 3. Average Order Value (AOV) */}
      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Ticket Size (AOV)
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white">
            ₹{avgOrderValue.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Total Settled Bills: {totalBillsCount}
          </div>
        </div>
      </div>

      {/* 4. Table Occupancy & Active KOTs */}
      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Table Occupancy
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white">
            {occupancyRate}%
          </div>
          <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{occupiedTables.length} of {branchTables.length} Active • {activeKots.length} in Kitchen</span>
          </div>
        </div>
      </div>
    </div>
  );
};
