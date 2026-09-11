import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantTable, TableStatus } from '../types';
import { 
  Users, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  Plus, 
  Utensils, 
  Sparkles, 
  CreditCard,
  ChefHat,
  Eye,
  Layers,
  Bell
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';
import { BillModal } from '../components/BillModal';

export const TablesPage: React.FC = () => {
  const { 
    filteredTables, 
    selectTableForPOS, 
    updateTableStatus, 
    currentBranch,
    kots,
    setActiveTab,
    setCartTableNumber,
    setCartOrderType,
    currentUser,
    requestBill,
    billRequests,
    pendingBillRequests,
    tableSearchTerm,
    setTableSearchTerm,
    tableFloorFilter: floorFilter,
    setTableFloorFilter: setFloorFilter
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'mine'>('all');
  const [billingTable, setBillingTable] = useState<string | null>(null);

  const isWaiter = currentUser?.role === 'waiter';

  const myAssignedTablesCount = useMemo(() => {
    return filteredTables.filter(
      t => t.assignedWaiterName === currentUser?.name || t.assignedWaiterId === currentUser?.id
    ).length;
  }, [filteredTables, currentUser]);

  const branchName = currentBranch === 'all' 
    ? 'All Branches' 
    : BRANCHES.find(b => b.id === currentBranch)?.name || 'Main Branch';

  const getTableFloor = (tableNumber: number): string => {
    if (tableNumber <= 4) return 'Ground Floor';
    if (tableNumber <= 8) return 'First Floor';
    return 'Outdoor / Terrace';
  };

  const displayedTables = useMemo(() => {
    return filteredTables.filter(tbl => {
      const matchStatus = statusFilter === 'All' || tbl.status === statusFilter.toLowerCase();
      const floor = getTableFloor(tbl.number);
      const matchFloor = floorFilter === 'All' || floor === floorFilter;
      const matchAssigned = assignedFilter === 'all' || 
        (tbl.assignedWaiterName === currentUser?.name || tbl.assignedWaiterId === currentUser?.id);
      
      let matchSearch = true;
      if (tableSearchTerm && tableSearchTerm.trim()) {
        const term = tableSearchTerm.trim().toLowerCase();
        const numOnly = term.replace(/^t\s*/, '');
        const numStr = String(tbl.number);
        const nameStr = tbl.name.toLowerCase();
        matchSearch = numStr === numOnly || 
                      nameStr.includes(term) || 
                      `t${tbl.number}`.includes(term) ||
                      nameStr.includes(numOnly);
      }

      return matchStatus && matchFloor && matchAssigned && matchSearch;
    });
  }, [filteredTables, statusFilter, floorFilter, assignedFilter, currentUser, tableSearchTerm]);

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">AVAILABLE</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">OCCUPIED</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">FOOD READY</span>;
      case 'waiting':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">WAITING</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">BILL REQUESTED</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">CLEANING</span>;
    }
  };

  const getCardBorder = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'border-slate-800 bg-[#131D36] hover:border-emerald-500/80 hover:shadow-lg';
      case 'occupied':
        return 'border-amber-700/60 bg-[#131D36] hover:border-amber-500 hover:shadow-lg';
      case 'ready':
        return 'border-emerald-600/60 bg-[#131D36] hover:border-emerald-400 hover:shadow-lg';
      case 'waiting':
        return 'border-sky-700/60 bg-[#131D36] hover:border-sky-400 hover:shadow-lg';
      case 'billing':
        return 'border-purple-600/70 bg-[#131D36] hover:border-purple-400 hover:shadow-lg';
      case 'cleaning':
        return 'border-slate-800 bg-[#131D36] hover:border-slate-600 hover:shadow-lg';
    }
  };

  const handleOpenBillModal = (tableNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartTableNumber(tableNum);
    setCartOrderType('dine_in');
    setBillingTable(tableNum);
  };

  const handleViewKot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('kot');
  };

  return (
    <div className="w-full p-2.5 sm:p-3.5 space-y-2.5 sm:space-y-3 select-none text-slate-100">
      {/* Top Header & Filters (Dark Card Surface) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-slate-800 bg-[#131D36] shadow-xs w-full text-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-mono text-white">
                Floor Plan & Table Matrix
              </h2>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {filteredTables.length} Tables
              </span>
            </div>
            <p className="text-[11px] font-mono mt-0.5 text-slate-400">
              Active floor layout for <strong className="text-slate-200">{branchName}</strong>. Click any table to open POS.
            </p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 md:pb-0 font-mono text-xs shrink-0">
          {['All', 'Available', 'Occupied', 'Ready', 'Billing'].map(status => {
            const count = status === 'All' 
              ? filteredTables.length 
              : filteredTables.filter(t => t.status === status.toLowerCase()).length;
            
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Bill Requests Alert Banner */}
      {pendingBillRequests.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 text-amber-200 rounded-lg p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs font-mono w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {pendingBillRequests.length} Customer Bill Request{pendingBillRequests.length > 1 ? 's' : ''} Awaiting Cashier Settlement
              </div>
              <div className="text-[11px] flex flex-wrap gap-2 mt-0.5 text-amber-300/80">
                {pendingBillRequests.map(r => (
                  <span key={r.id} className="bg-amber-900/60 text-amber-200 border border-amber-700 px-2 py-0.5 rounded">
                    <strong>{r.tableNumber}</strong>: ₹{r.totalAmount} (requested by {r.requestedBy} at {r.requestedAt})
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!isWaiter && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => handleOpenBillModal(pendingBillRequests[0].tableNumber, e)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Settle {pendingBillRequests[0].tableNumber}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compact Floor Areas Inline Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Floor Areas:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['All', 'Ground Floor', 'First Floor', 'Outdoor / Terrace'].map(fl => {
              const count = fl === 'All' 
                ? filteredTables.length 
                : filteredTables.filter(t => getTableFloor(t.number) === fl).length;
              const isSelected = floorFilter === fl;
              return (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setFloorFilter(fl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#131D36] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-2xs'
                  }`}
                >
                  <span>{fl}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Waiter specific assigned tables filter */}
        {isWaiter && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setAssignedFilter('mine')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                assignedFilter === 'mine'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#131D36] hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-2xs'
              }`}
            >
              <span>My Tables</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                assignedFilter === 'mine' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {myAssignedTablesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAssignedFilter('all')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                assignedFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600'
                  : 'bg-[#131D36] hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-2xs'
              }`}
            >
              All Tables
            </button>
          </div>
        )}
      </div>

      {/* Tables Grid (Spanning 100% Available Viewport Width) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3 w-full">
        {displayedTables.map(tbl => {
          // Find all unbilled KOTs for this table
          const tableKots = kots.filter(
            k => k.branchId === tbl.branchId &&
                 k.orderType === 'dine_in' &&
                 k.tableNumber?.toLowerCase() === tbl.name.toLowerCase() &&
                 !k.isBilled &&
                 k.status !== 'cancelled'
          );
          const tableKot = tableKots[0] || null;
          const tableRunningAmount = tableKots.length > 0
            ? tableKots.reduce((sum, k) => sum + k.totalAmount, 0)
            : (tbl.currentAmount || 0);

          const isOccupiedOrBilling = tbl.status === 'occupied' || tbl.status === 'billing' || tbl.status === 'waiting';

          return (
            <div
              key={tbl.id}
              onClick={() => selectTableForPOS(tbl.name)}
              className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[185px] relative group bg-[#131D36] shadow-xs hover:shadow-lg ${getCardBorder(
                tbl.status
              )}`}
            >
              {/* Top Row: Table Number & Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors font-mono bg-slate-800 text-white border border-slate-700">
                      T{tbl.number}
                    </div>
                    {tbl.assignedWaiterName && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold truncate max-w-[70px] ${
                        tbl.assignedWaiterName === currentUser?.name || tbl.assignedWaiterId === currentUser?.id
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`} title={`Assigned Waiter: ${tbl.assignedWaiterName}`}>
                        {tbl.assignedWaiterName === currentUser?.name || tbl.assignedWaiterId === currentUser?.id ? '★ You' : tbl.assignedWaiterName}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(tbl.status)}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold font-mono text-white">{tbl.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{getTableFloor(tbl.number)}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] mt-0.5 font-mono text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-medium">{tbl.capacity} Seats</span>
                  {tbl.guestCount && <span className="text-slate-400">• {tbl.guestCount} Guests</span>}
                </div>

                {/* Seated Info & Running Total */}
                {isOccupiedOrBilling && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs font-mono space-y-1">
                    {tbl.seatedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Seated at {tbl.seatedAt}</span>
                      </div>
                    )}
                    {tableKots.length > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-semibold truncate text-slate-200">
                          {tableKots.map(k => k.kotNumber).join(', ')}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {tableKots.length} KOT{tableKots.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {tableRunningAmount > 0 && (
                      <div className="text-xs font-bold pt-0.5 text-emerald-400 font-mono">
                        Running: ₹{tableRunningAmount}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Quick Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-800 font-mono">
                {tbl.status === 'cleaning' ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateTableStatus(tbl.id, 'available'); }}
                    className="w-full py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors font-mono bg-slate-800 text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark Available</span>
                  </button>
                ) : tbl.status === 'available' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectTableForPOS(tbl.name)}
                      className="flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Open POS</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateTableStatus(tbl.id, 'cleaning'); }}
                      className="px-2 py-1.5 rounded text-[10px] font-semibold border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 cursor-pointer"
                      title="Mark table as being cleaned"
                    >
                      Clean
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); selectTableForPOS(tbl.name); }}
                      className="flex-1 py-1 rounded font-bold text-center transition-colors border bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer"
                      title="Add more items in POS"
                    >
                      POS
                    </button>
                    {tableKot && (
                      <button
                        onClick={handleViewKot}
                        className="py-1 px-2 rounded font-bold text-center transition-colors border bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800 cursor-pointer"
                        title="View KOT tickets"
                      >
                        KOT
                      </button>
                    )}
                    {isWaiter ? (
                      tbl.status === 'billing' || billRequests.some(r => r.tableNumber.toLowerCase() === tbl.name.toLowerCase() && r.status === 'pending') ? (
                        <button
                          disabled
                          className="flex-1 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold text-center text-[10px] cursor-not-allowed"
                          title="Cashier notified"
                        >
                          Req'd
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); requestBill(tbl.name); }}
                          className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-center transition-colors shadow-2xs text-[10px] cursor-pointer"
                          title="Request Cashier to generate customer bill"
                        >
                          Req Bill
                        </button>
                      )
                    ) : (
                      <button
                        onClick={(e) => handleOpenBillModal(tbl.name, e)}
                        className={`flex-1 py-1 rounded text-white font-bold text-center transition-colors shadow-2xs cursor-pointer ${
                          tbl.status === 'billing' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                        title={tbl.status === 'billing' ? 'Settle requested bill' : 'Generate and settle bill'}
                      >
                        {tbl.status === 'billing' ? 'Settle' : 'Bill'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayedTables.length === 0 && (
        <div className="p-12 text-center text-xs rounded-xl border border-slate-800 font-mono text-slate-400 bg-[#131D36] shadow-2xs">
          No tables found matching filter criteria.
        </div>
      )}

      {/* Direct Bill Modal if launched from Tables screen */}
      {billingTable && (
        <BillModal
          isOpen={!!billingTable}
          onClose={() => setBillingTable(null)}
        />
      )}
    </div>
  );
};
