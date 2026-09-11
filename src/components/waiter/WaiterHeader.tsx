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

  const safeFilteredTables = Array.isArray(filteredTables) ? filteredTables : [];

  const occupiedCount = useMemo(() => {
    return safeFilteredTables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  }, [safeFilteredTables]);

  const getTableFloor = (tableNumber: number): string => {
    if (tableNumber <= 4) return 'Ground Floor';
    if (tableNumber <= 8) return 'First Floor';
    return 'Outdoor / Terrace';
  };

  const floorTablesCount = useMemo(() => {
    if (tableFloorFilter === 'All') return safeFilteredTables.length;
    return safeFilteredTables.filter(t => getTableFloor(t.number) === tableFloorFilter).length;
  }, [safeFilteredTables, tableFloorFilter]);

  const floorBadgeLabel = useMemo(() => {
    if (tableFloorFilter === 'All') {
      return `All Floors • ${floorTablesCount} Tables`;
    }
    return `${tableFloorFilter} • ${floorTablesCount} Tables`;
  }, [tableFloorFilter, floorTablesCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingTables = useMemo(() => {
    if (!tableSearchTerm || !tableSearchTerm.trim()) return [];
    const term = tableSearchTerm.trim().toLowerCase();
    const numOnly = term.replace(/^t\s*/, '');
    return safeFilteredTables.filter(tbl => {
      const numStr = String(tbl.number);
      const nameStr = tbl.name.toLowerCase();
      return numStr === numOnly || 
             nameStr.includes(term) || 
             `t${tbl.number}`.includes(term) ||
             nameStr.includes(numOnly);
    }).slice(0, 6);
  }, [safeFilteredTables, tableSearchTerm]);

  const handleSelectTable = (tbl: RestaurantTable) => {
    selectTableForPOS(tbl.name);
    setTableSearchTerm(tbl.name);
    setIsSearchDropdownOpen(false);
    showToast(`Table Selected`, `Switched to ${tbl.name} (${tbl.status.toUpperCase()})`, 'info');
  };

  const waiterName = currentUser?.name?.replace(/\s*\(Waiter\)$/i, '').trim() || 'Ramesh Patel';

  return (
    <header className="h-16 bg-[#0F172A] text-white flex justify-between items-center w-full px-4 border-b border-slate-800 z-30 select-none shrink-0 shadow-sm font-sans">
      {/* 1. Left Section: Logo badge */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
          <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-mono font-extrabold text-xs sm:text-sm tracking-tight text-white">
              ZAFFRAN ORDER PAD
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              WAITER
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Main Dining Floor</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{occupiedCount} Active</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Search & Floor Pill */}
      <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-4">
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={tableSearchTerm}
              onChange={e => {
                setTableSearchTerm(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              placeholder="Jump to Table (e.g. 4, T2)..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#131D36] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
            />
            {tableSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setTableSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {isSearchDropdownOpen && matchingTables.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#131D36] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 font-mono text-xs max-h-56 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                Select Table
              </div>
              {matchingTables.map(tbl => (
                <button
                  key={tbl.id}
                  type="button"
                  onClick={() => handleSelectTable(tbl)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">T{tbl.number}</span>
                    <span className="text-[11px] text-slate-400">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    {tbl.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#131D36] border border-slate-700/80 text-[11px] font-mono text-slate-300 shrink-0">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>{floorBadgeLabel}</span>
        </div>
      </div>

      {/* 3. Right Section: Waiter profile and Sign out */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131D36] border border-slate-700/80 text-xs font-mono">
          <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-white font-bold text-[11px] leading-tight">{waiterName}</span>
            <span className="text-emerald-400 text-[9px] font-bold leading-tight">ACTIVE SHIFT</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
