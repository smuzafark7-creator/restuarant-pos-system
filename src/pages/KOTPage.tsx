import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KOT, KOTStatus } from '../types';
import { 
  FileText, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Printer, 
  Utensils, 
  Play, 
  Check, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const KOTPage: React.FC = () => {
  const { filteredKots, updateKOTStatus, currentBranch, showToast, currentUser } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const isWaiter = currentUser?.role === 'waiter';

  const branchName = currentBranch === 'all' 
    ? 'All Branches' 
    : BRANCHES.find(b => b.id === currentBranch)?.name || 'Main Branch';

  const displayedKots = filteredKots.filter(kot => {
    if (statusFilter === 'All') return true;
    return kot.status === statusFilter.toLowerCase();
  });

  const handlePrintKOT = (kot: KOT) => {
    showToast('Printing KOT', `Kitchen ticket sent to kitchen printer: #${kot.kotNumber}`);
    window.print();
  };

  const getStatusBadge = (status: KOTStatus) => {
    if (isWaiter) {
      switch (status) {
        case 'new':
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse">NEW</span>;
        case 'preparing':
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">PREPARING</span>;
        case 'ready':
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">READY</span>;
        case 'served':
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">SERVED</span>;
        case 'cancelled':
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800">CANCELLED</span>;
      }
    }
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">NEW</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">PREPARING</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">READY</span>;
      case 'served':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">SERVED</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200">CANCELLED</span>;
    }
  };

  return (
    <div className={`p-4 sm:p-6 space-y-6 max-w-7xl mx-auto ${isWaiter ? 'text-slate-100' : ''}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-lg border shadow-2xs ${
        isWaiter ? 'bg-[#131D36] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight font-mono ${isWaiter ? 'text-white' : 'text-slate-900'}`}>Kitchen Order Tickets (KOT)</h2>
          </div>
          <p className={`text-xs mt-1 ${isWaiter ? 'text-slate-400' : 'text-slate-500'}`}>
            Tracking active and dispatched kitchen tickets for <strong className={`font-mono ${isWaiter ? 'text-slate-200' : 'text-slate-800'}`}>{branchName}</strong>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'New', 'Preparing', 'Ready', 'Served'].map(st => {
            const count = st === 'All' 
              ? filteredKots.length 
              : filteredKots.filter(k => k.status === st.toLowerCase()).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors font-mono cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : isWaiter
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* KOT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedKots.map(kot => {
          return (
            <div
              key={kot.id}
              className={`rounded-lg border shadow-2xs overflow-hidden flex flex-col justify-between transition-colors ${
                isWaiter 
                  ? 'bg-[#131D36] border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className={`p-3.5 border-b flex items-center justify-between font-mono ${
                isWaiter ? 'bg-slate-800/80 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${isWaiter ? 'text-white' : 'text-slate-900'}`}>{kot.kotNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                      isWaiter 
                        ? 'bg-slate-700 text-slate-300 border-slate-600' 
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      {kot.orderType.replace('_', ' ')}
                    </span>
                    {kot.isBilled && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                        isWaiter 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        PAID
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isWaiter ? 'text-slate-400' : 'text-slate-500'}`}>
                    {kot.branchName}
                  </div>
                </div>

                <div className="text-right">
                  {getStatusBadge(kot.status)}
                  <div className={`flex items-center gap-1 text-[11px] mt-1.5 justify-end ${
                    isWaiter ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{kot.timeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 font-mono">
                {/* Table or Customer destination */}
                <div className={`flex items-center justify-between pb-2 border-b text-xs font-semibold ${
                  isWaiter ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-800'
                }`}>
                  <span>Destination:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {kot.tableNumber || (kot.customerName ? `Takeaway (${kot.customerName})` : 'Takeaway')}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order Items ({kot.items.length})
                  </div>
                  <div className={`divide-y ${isWaiter ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {kot.items.map((item, idx) => {
                      const isVoided = item.status === 'voided';
                      return (
                        <div key={idx} className={`py-1.5 flex items-center justify-between text-xs ${
                          isVoided ? (isWaiter ? 'bg-rose-950/30 opacity-75' : 'bg-rose-50/50 opacity-75') : ''
                        }`}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isVoided ? 'bg-slate-500' : item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className={`font-semibold truncate ${
                              isVoided ? 'line-through text-slate-500' : isWaiter ? 'text-slate-200' : 'text-slate-900'
                            }`}>{item.name}</span>
                            {isVoided ? (
                              <span className="shrink-0 text-[8px] font-black px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-tight">
                                VOIDED
                              </span>
                            ) : item.serveType === 'PARCEL' ? (
                              <span className="shrink-0 text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 uppercase tracking-tight">
                                PARCEL
                              </span>
                            ) : (
                              <span className={`shrink-0 text-[8px] font-semibold px-1 py-0.2 rounded uppercase tracking-tight ${
                                isWaiter 
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                DINE-IN
                              </span>
                            )}
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded border shrink-0 font-mono ${
                            isVoided 
                              ? 'bg-slate-800 text-slate-500 line-through border-slate-700' 
                              : isWaiter 
                                ? 'text-slate-200 bg-slate-800 border-slate-700' 
                                : 'text-slate-900 bg-slate-100 border-slate-200'
                          }`}>
                            × {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special instructions if any */}
                {kot.specialInstructions && (
                  <div className={`p-2 rounded text-[11px] font-medium border ${
                    isWaiter 
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-300' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    Note: {kot.specialInstructions}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className={`p-3 border-t flex items-center justify-between gap-2 font-mono ${
                isWaiter ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  onClick={() => handlePrintKOT(kot)}
                  className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    isWaiter 
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'border-slate-300 text-slate-700 hover:bg-white'
                  }`}
                  title="Print KOT Slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print KOT</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {kot.status === 'new' && (
                    <button
                      onClick={() => updateKOTStatus(kot.id, 'preparing')}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {kot.status === 'preparing' && (
                    <button
                      onClick={() => updateKOTStatus(kot.id, 'ready')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {kot.status === 'ready' && (
                    <button
                      onClick={() => updateKOTStatus(kot.id, 'served')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>{kot.orderType === 'takeaway' || kot.orderType === 'parcel' ? 'Mark Completed' : 'Mark Served'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedKots.length === 0 && (
        <div className={`p-12 text-center text-xs rounded-lg border font-mono ${
          isWaiter ? 'bg-[#131D36] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'
        }`}>
          No KOT tickets matching status filter "{statusFilter}".
        </div>
      )}
    </div>
  );
};
