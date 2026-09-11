import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BranchId } from '../../types';
import { 
  Building2, 
  Clock, 
  User, 
  LogOut, 
  Bell, 
  RotateCcw, 
  ChevronDown,
  UtensilsCrossed
} from 'lucide-react';

export interface OwnerHeaderProps {
  onToggleMobileSidebar?: () => void;
  className?: string;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({ onToggleMobileSidebar, className }) => {
  const { 
    currentUser, 
    currentBranch, 
    setBranch, 
    branches, 
    logout, 
    resetDemoData,
    kots
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showBranchDropdown, setShowBranchDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingKotsCount = (kots || []).filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) && (k.status === 'new' || k.status === 'preparing')
  ).length;

  const currentBranchLabel = currentBranch === 'all' 
    ? 'All Branches (Consolidated)' 
    : (branches || []).find(b => b.id === currentBranch)?.name || 'Main Branch';

  return (
    <header className={`h-16 bg-[#0F172A] text-white px-4 lg:px-6 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50 flex-shrink-0 select-none shadow-md font-mono ${className || ''}`}>
      {/* Brand & Multi-Branch Selector */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-white leading-none font-mono">
              Zaffran Flavours
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] tracking-wider text-emerald-400 font-mono font-medium">EXECUTIVE MANAGEMENT</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Multi-Branch Selector */}
        <div className="relative">
          <button
            id="owner-branch-selector-btn"
            type="button"
            onClick={() => setShowBranchDropdown(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200 font-semibold">{currentBranchLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBranchDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-[#131D36] border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setBranch('all');
                  setShowBranchDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                  currentBranch === 'all' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                }`}
              >
                <span>All Branches (Consolidated)</span>
                {currentBranch === 'all' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>
              <div className="h-px bg-slate-800 my-1" />
              {branches.map(branch => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    setBranch(branch.id as BranchId);
                    setShowBranchDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                    currentBranch === branch.id ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                  }`}
                >
                  <div>
                    <div>{branch.name}</div>
                    <div className="text-[10px] text-slate-400">{branch.location}</div>
                  </div>
                  {currentBranch === branch.id && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Tools: Time, Reset Demo, Profile & Sign out */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentDate} • {currentTime}</span>
        </div>

        <button
          type="button"
          onClick={resetDemoData}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          title="Reset Demo Data"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Reset Data</span>
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="w-6 h-6 rounded-md bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-white font-bold hidden sm:inline">{currentUser?.name || 'Owner'}</span>
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
