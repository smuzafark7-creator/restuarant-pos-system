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
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">AVAILABLE</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">OCCUPIED</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse">FOOD READY</span>;
      case 'waiting':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">WAITING</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">BILL REQUESTED</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">CLEANING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getBorderClass = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500/30 hover:border-emerald-500/70 hover:shadow-emerald-950/20';
      case 'occupied':
        return 'border-amber-500/50 hover:border-amber-500/90 hover:shadow-amber-950/20';
      case 'ready':
        return 'border-emerald-400 ring-2 ring-emerald-500/40';
      case 'billing':
        return 'border-purple-500/60 ring-1 ring-purple-500/30';
      default:
        return 'border-slate-800 hover:border-slate-700';
    }
  };

  return (
    <div
      onClick={() => onSelect(table.name)}
      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[185px] relative group bg-[#0f172a] shadow-xs hover:shadow-lg select-none ${getBorderClass(
        table.status
      )}`}
    >
      {/* Top Row: Table badge + Waiter assigned tag & Status */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors font-mono bg-slate-800 text-white border border-slate-700">
              T{table.number}
            </div>
            {table.assignedWaiterName && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold truncate max-w-[70px] ${
                  isMyTable
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
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
          <span className="text-sm font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
            {table.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
            <Users className="w-3 h-3 text-slate-500" />
            {table.capacity} Seats
          </span>
        </div>

        {/* Running Amount & KOT Count */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Running:</span>
          <span className="font-bold text-emerald-400">
            ₹{runningAmount.toFixed(2)}
          </span>
        </div>

        {unbilledKots.length > 0 && (
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>KOTs: {unbilledKots.length}</span>
            <span className="text-amber-400 truncate max-w-[110px]">
              {(unbilledKots[unbilledKots.length - 1]?.items || []).map(i => i?.name || (i as any)?.menuItem?.name || 'Item').slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1.5 font-mono">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSelect(table.name);
          }}
          className="flex-1 py-1 rounded text-xs font-bold text-center transition-colors border bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border-slate-700 cursor-pointer"
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
            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors border cursor-pointer ${
              isBillPending
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white border-slate-700'
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
