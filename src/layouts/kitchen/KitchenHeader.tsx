import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChefHat, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Clock, 
  LogOut, 
  SlidersHorizontal,
  Layers,
  Ban,
  TrendingUp,
} from 'lucide-react';

interface KitchenHeaderProps {
  onToggleDrawer: () => void;
  selectedStation: string;
  onSelectStation: (station: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  onToggleDrawer,
  selectedStation,
  onSelectStation,
  isMuted,
  onToggleMute
}) => {
  const { kots, currentBranch, logout, menuItems, openKitchenDrawer, dispatchedItemStats } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTickets = kots.filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) && (k.status === 'new' || k.status === 'preparing')
  );

  // Check delayed tickets (>15 mins)
  const delayedCount = activeTickets.filter(k => {
    const createdMs = new Date(k.createdAt).getTime();
    if (isNaN(createdMs)) return false;
    return (Date.now() - createdMs) > 15 * 60 * 1000;
  }).length;

  const soldOutCount = menuItems.filter(m => !m.available || m.stockStatus === 'sold_out').length;
  const fewLeftCount = menuItems.filter(m => m.stockStatus === 'few_left' && (m.stockCount ?? 0) > 0).length;
  const totalDispatchedDishes = dispatchedItemStats.reduce((sum, d) => sum + d.totalServed, 0);

  const stations = ['All Stations', 'Tandoor & Grill', 'Main Curry', 'Chinese & Wok', 'Breads & Rice'];

  return (
    <header className="h-16 bg-[#161B26] text-white px-3 sm:px-6 flex items-center justify-between border-b border-white/[0.08] z-30 select-none shrink-0 shadow-lg">
      {/* Left: KDS Brand & Active Tickets Badge */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleDrawer}
          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 border border-white/[0.08]"
          title="Open Kitchen Management Drawer"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold hidden md:inline">Kitchen Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>ZAFFRAN KDS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 font-bold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

        {/* Active Tickets Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18191D] border border-white/[0.08] text-xs">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 hidden sm:inline">Active:</span>
          <span className="font-bold text-emerald-400">{activeTickets.length}</span>
        </div>

        {/* Stock & 86 Manager Quick Button */}
        <button
          onClick={() => openKitchenDrawer('stock86')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18191D] hover:bg-white/[0.05] border border-white/[0.08] text-xs cursor-pointer transition-colors"
          title="Manage Item Availability & 86 Stock"
        >
          <Ban className={`w-3.5 h-3.5 ${soldOutCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="text-slate-300 hidden md:inline">Stock & 86:</span>
          <span className={`font-bold ${soldOutCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {soldOutCount} Sold Out
          </span>
          {fewLeftCount > 0 && (
            <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-600/40 px-1 rounded font-bold">
              {fewLeftCount} Low
            </span>
          )}
        </button>

        {/* Live Dispatched Served Counter Quick Button */}
        <button
          onClick={() => openKitchenDrawer('dispatched')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18191D] hover:bg-white/[0.05] border border-white/[0.08] text-xs cursor-pointer transition-colors"
          title="View Live Dispatched & Served Items Breakdown"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Served:</span>
          <span className="font-bold text-emerald-400">{totalDispatchedDishes} Plates</span>
        </button>

        {/* Delayed Alert */}
        {delayedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{delayedCount} Delayed</span>
          </div>
        )}
      </div>

      {/* Center: Station Switcher Tabs */}
      <div className="hidden lg:flex items-center gap-1 bg-[#18191D] p-1 rounded-xl border border-white/[0.08]">
        {stations.map(st => (
          <button
            key={st}
            onClick={() => onSelectStation(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedStation === st
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Right: Sound Mute Toggle, Large Kitchen Clock, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isMuted 
              ? 'bg-rose-950/50 border-rose-800/50 text-rose-300 hover:bg-rose-900/50' 
              : 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/50'
          }`}
          title={isMuted ? 'Sound Alert Muted - Click to Unmute' : 'Sound Alert Active - Click to Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* Big Kitchen Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18191D] border border-white/[0.08] text-sm font-bold text-slate-100 tracking-wider">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>{currentTime}</span>
        </div>

        {/* Shift Logout */}
        <button
          onClick={logout}
          title="Sign Out Kitchen Terminal"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer border border-white/[0.08] hover:border-rose-800/50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit KDS</span>
        </button>
      </div>
    </header>
  );
};
