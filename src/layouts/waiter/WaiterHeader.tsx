import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UtensilsCrossed, 
  User, 
  LogOut, 
  MapPin, 
  Layers,
  Search,
  X,
  ChevronRight
} from 'lucide-react';
import { RestaurantTable } from '../../types';

export const WaiterHeader: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    filteredTables, 
    tableSearchTerm, 
    setTableSearchTerm,
    tableFloorFilter,
    selectTableForPOS,
    showToast
  } = useApp();

  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active occupied/billing tables count
  const occupiedCount = useMemo(() => {
    return filteredTables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  }, [filteredTables]);

  // Floor calculation matching table matrix rules (1-4: Ground Floor, 5-8: First Floor, 9-10: Outdoor / Terrace)
  const getTableFloor = (tableNumber: number): string => {
    if (tableNumber <= 4) return 'Ground Floor';
    if (tableNumber <= 8) return 'First Floor';
    return 'Outdoor / Terrace';
  };

  // Dynamic floor tables count
  const floorTablesCount = useMemo(() => {
    if (tableFloorFilter === 'All') return filteredTables.length;
    return filteredTables.filter(t => getTableFloor(t.number) === tableFloorFilter).length;
  }, [filteredTables, tableFloorFilter]);

  // Dynamic floor badge label (e.g., "All Floors • 10 Tables", "Ground Floor • 4 Tables")
  const floorBadgeLabel = useMemo(() => {
    if (tableFloorFilter === 'All') {
      return `All Floors • ${floorTablesCount} Tables`;
    }
    return `${tableFloorFilter} • ${floorTablesCount} Tables`;
  }, [tableFloorFilter, floorTablesCount]);

  // Click outside listener for table search popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered matching tables for quick jump popover
  const matchingTables = useMemo(() => {
    if (!tableSearchTerm || !tableSearchTerm.trim()) return [];
    const term = tableSearchTerm.trim().toLowerCase();
    const numOnly = term.replace(/^t\s*/, '');
    return filteredTables.filter(tbl => {
      const numStr = String(tbl.number);
      const nameStr = tbl.name.toLowerCase();
      return numStr === numOnly || 
             nameStr.includes(term) || 
             `t${tbl.number}`.includes(term) ||
             nameStr.includes(numOnly);
    }).slice(0, 6);
  }, [filteredTables, tableSearchTerm]);

  const handleSelectTable = (tbl: RestaurantTable) => {
    selectTableForPOS(tbl.name);
    setTableSearchTerm(tbl.name);
    setIsSearchDropdownOpen(false);
    showToast(`Table Selected`, `Switched to ${tbl.name} (${tbl.status.toUpperCase()})`, 'info');
  };

  const waiterName = currentUser?.name?.replace(/\s*\(Waiter\)$/i, '').trim() || 'Ramesh Patel';

  return (
    <header className="h-16 bg-[#0F172A] text-white flex justify-between items-center w-full px-4 border-b border-slate-800 z-30 select-none shrink-0 shadow-sm font-sans">
      {/* 1. Left Section: Logo badge ("ZAFFRAN ORDER PAD - WAITER") */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
          <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-mono uppercase whitespace-nowrap">
              Zaffran Order Pad
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold whitespace-nowrap">
              WAITER
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center Section: [Search Table Input] -> [Active Floor / Filter State] -> [Active Tables: 5] */}
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-1 max-w-2xl mx-2 sm:mx-4">
        {/* Fast Table Search/Filter Input */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="waiter-table-search-input"
              ref={searchInputRef}
              type="text"
              value={tableSearchTerm}
              onChange={(e) => {
                setTableSearchTerm(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (tableSearchTerm.trim().length > 0) {
                  setIsSearchDropdownOpen(true);
                }
              }}
              placeholder="Search Table No. (e.g. T1, T5)..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 focus:border-emerald-500 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
            />
            {tableSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setTableSearchTerm('');
                  setIsSearchDropdownOpen(false);
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Table Search Dropdown Results */}
          {isSearchDropdownOpen && matchingTables.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-mono animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] text-slate-400 uppercase border-b border-slate-700/80 mb-1">
                <span>Matching Tables ({matchingTables.length})</span>
                <span className="text-[9px]">Click to jump to table</span>
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {matchingTables.map(tbl => (
                  <button
                    key={tbl.id}
                    type="button"
                    onClick={() => handleSelectTable(tbl)}
                    className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/60 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{tbl.name} (T{tbl.number})</span>
                      <span className="text-[10px] text-slate-400">• {tbl.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tbl.status === 'occupied' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                          OCCUPIED {tbl.currentAmount ? `₹${tbl.currentAmount}` : ''}
                        </span>
                      ) : tbl.status === 'billing' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                          BILLING
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          AVAILABLE
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Active Floor / Filter State */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300 shrink-0 font-mono">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] lg:text-xs font-medium whitespace-nowrap">
            {floorBadgeLabel}
          </span>
        </div>

        {/* Active Tables: 5 */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300 shrink-0 font-mono text-[11px] lg:text-xs">
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="whitespace-nowrap">Active Tables:</span>
          <span className="font-bold text-amber-300">{occupiedCount}</span>
        </div>
      </div>

      {/* 3. Right Section: Waiter Profile chip ("Ramesh Patel") & Shift Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Waiter Profile Chip */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-200">
          <div className="w-6 h-6 rounded-md bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap hidden sm:inline">
            {waiterName}
          </span>
        </div>

        {/* Shift Logout Button */}
        <button
          id="waiter-logout-btn"
          type="button"
          onClick={logout}
          title="End Waiter Shift & Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline whitespace-nowrap">Shift Logout</span>
        </button>
      </div>
    </header>
  );
};
