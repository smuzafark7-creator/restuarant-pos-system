import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KOT } from '../types';
import { ChefHat } from 'lucide-react';
import { BRANCHES } from '../data/mockData';
import { KdsCard } from '../components/kitchen/KdsCard';

export const KOTPage: React.FC = () => {
  const { filteredKots, currentBranch, showToast, updateKOTStatus, openKOTModal } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Auto-refresh timer for elapsed times every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const branchName = currentBranch === 'all' 
    ? 'All Branches' 
    : BRANCHES.find(b => b.id === currentBranch)?.name || 'Main Branch';

  // Explicit status bucket counts strictly summed for the "All" filter pill
  const newCount = filteredKots.filter(k => k.status === 'new').length;
  const preparingCount = filteredKots.filter(k => k.status === 'preparing').length;
  const readyCount = filteredKots.filter(k => k.status === 'ready').length;
  const pickedUpCount = filteredKots.filter(k => k.status === 'picked_up').length;
  const servedCount = filteredKots.filter(k => k.status === 'served').length;
  const totalCount = newCount + preparingCount + readyCount + pickedUpCount + servedCount;

  const getFilterCount = (filterName: string) => {
    switch (filterName) {
      case 'All': return totalCount;
      case 'New': return newCount;
      case 'Preparing': return preparingCount;
      case 'Ready': return readyCount;
      case 'Picked Up': return pickedUpCount;
      case 'Served': return servedCount;
      default: return 0;
    }
  };

  const displayedKots = filteredKots.filter(kot => {
    if (statusFilter === 'All') {
      return ['new', 'preparing', 'ready', 'picked_up', 'served'].includes(kot.status);
    }
    if (statusFilter === 'Picked Up') return kot.status === 'picked_up';
    return kot.status === statusFilter.toLowerCase();
  });

  const handlePrintKOT = (kot: KOT) => {
    openKOTModal(kot);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans pb-24">
      {/* 1. HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-white/10 bg-[#161B26] text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <ChefHat className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Kitchen Order Tickets (KOT)</h2>
          </div>
          <p className="text-xs mt-1 text-gray-400">
            Tracking active and dispatched kitchen tickets for <strong className="text-white">{branchName}</strong>
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'New', 'Preparing', 'Ready', 'Picked Up', 'Served'].map(st => {
            const count = getFilterCount(st);
            const isActive = statusFilter === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KOT TICKET CARDS GRID (Exact KDS Card Replication with Role-Adapted Print Action) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedKots.map(kot => (
          <KdsCard
            key={kot.id}
            kot={kot}
            currentTime={currentTime}
            onPrint={handlePrintKOT}
            onUpdateStatus={updateKOTStatus}
            mode="staff"
          />
        ))}
      </div>

      {displayedKots.length === 0 && (
        <div className="p-12 text-center text-xs rounded-xl border border-white/10 text-gray-400 bg-[#161B26] shadow-lg">
          No KOT tickets matching status filter "{statusFilter}".
        </div>
      )}
    </div>
  );
};

export default KOTPage;
