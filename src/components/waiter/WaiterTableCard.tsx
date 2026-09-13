import React from 'react';
import { RestaurantTable, TableStatus, KOT } from '../../types';
import { Users, Clock, Receipt, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

export interface WaiterTableCardProps {
  table: RestaurantTable;
  runningAmount: number;
  unbilledKots: KOT[];
  isMyTable: boolean;
  onSelect: (tableName: string) => void;
  onRequestBill: (tableName: string) => void;
  isBillPending: boolean;
}

export const WaiterTableCard: React.FC<WaiterTableCardProps> = ({
  table,
  runningAmount,
  unbilledKots,
  isMyTable,
  onSelect,
  onRequestBill,
  isBillPending,
}) => {
  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">AVAILABLE</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">OCCUPIED</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800 animate-pulse">FOOD READY</span>;
      case 'waiting':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-950/60 text-sky-300 border border-sky-800">WAITING</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800">BILL REQUESTED</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">CLEANING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  const getBorderClass = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'border-[rgba(255,255,255,0.12)] hover:border-[#10B981] hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)]';
      case 'occupied':
        return 'border-[#F59E0B]/40 hover:border-[#F59E0B] hover:shadow-[0_8px_20px_-4px_rgba(245,158,11,0.35)]';
      case 'ready':
        return 'border-[#14B8A6]/40 hover:border-[#14B8A6] hover:shadow-[0_8px_20px_-4px_rgba(20,184,166,0.35)]';
      case 'waiting':
        return 'border-[#38BDF8]/40 hover:border-[#38BDF8] hover:shadow-[0_8px_20px_-4px_rgba(56,189,248,0.35)]';
      case 'billing':
        return 'border-[#8B5CF6]/40 hover:border-[#8B5CF6] hover:shadow-[0_8px_20px_-4px_rgba(139,92,246,0.35)]';
      case 'cleaning':
        return 'border-[rgba(255,255,255,0.12)] hover:border-slate-500 hover:shadow-[0_8px_20px_-4px_rgba(100,116,139,0.35)]';
      default:
        return 'border-[rgba(255,255,255,0.12)] hover:border-[#10B981] hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)]';
    }
  };

  return (
    <div
      onClick={() => onSelect(table.name)}
      className={`p-3.5 rounded-xl border-[1.5px] bg-[#161B26] hover:bg-[#1F2637] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[185px] relative group select-none ${getBorderClass(
        table.status
      )}`}
    >
      {/* Top Row: Table badge + Waiter assigned tag & Status */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors bg-slate-800 text-slate-200 border border-slate-700">
              T{table.number}
            </div>
            {table.assignedWaiterName && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[80px] ${
                  isMyTable
                    ? 'bg-[#080d1a] text-emerald-400 border border-emerald-800/60'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
                title={`Assigned Waiter: ${table.assignedWaiterName}`}
              >
                {isMyTable ? '● Mine' : table.assignedWaiterName}
              </span>
            )}
          </div>
          {getStatusBadge(table.status)}
        </div>

        {/* Table Name & Capacity */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
            {table.name}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
            <Users className="w-3 h-3 text-slate-400" />
            {table.capacity} Seats
          </span>
        </div>

        {/* Running Amount & KOT Count */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Running:</span>
          <span className="font-bold text-emerald-400">
            ₹{runningAmount.toFixed(2)}
          </span>
        </div>

        {unbilledKots.length > 0 && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>KOTs: {unbilledKots.length}</span>
            <span className="text-amber-300 truncate max-w-[110px]">
              {(unbilledKots[unbilledKots.length - 1]?.items || []).map(i => i?.name || (i as any)?.menuItem?.name || 'Item').slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1.5">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSelect(table.name);
          }}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all border bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer shadow-2xs"
        >
          Punch POS
        </button>

        {table.status === 'occupied' && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onRequestBill(table.name);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
              isBillPending
                ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                : 'bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-300 border-slate-700'
            }`}
            title="Request final bill from cashier"
          >
            {isBillPending ? 'Pending' : 'Bill'}
          </button>
        )}
      </div>
    </div>
  );
};
