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
  Flame
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
  const { kots, currentBranch, logout, currentUser } = useApp();
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

  const stations = ['All Stations', 'Tandoor & Grill', 'Main Curry', 'Chinese & Wok', 'Breads & Rice'];

  return (
    <header className="h-16 bg-[#090D16] text-white px-3 sm:px-6 flex items-center justify-between border-b border-slate-800 z-30 select-none shrink-0 font-mono">
      {/* Left: KDS Brand & Active Tickets Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDrawer}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          title="Open Kitchen Management Drawer"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold hidden md:inline">Kitchen Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <span>ZAFFRAN KDS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">LIVE</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Active Tickets Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Active:</span>
          <span className="font-bold text-white">{activeTickets.length}</span>
        </div>

        {/* Delayed Alert */}
        {delayedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-300 text-xs animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">{delayedCount} Delayed (&gt;15m)</span>
          </div>
        )}
      </div>

      {/* Center: Station Switcher Tabs */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {stations.map(st => (
          <button
            key={st}
            onClick={() => onSelectStation(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedStation === st
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
              ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/60' 
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
          }`}
          title={isMuted ? 'Sound Alert Muted - Click to Unmute' : 'Sound Alert Active - Click to Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* Big Kitchen Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-bold text-amber-400 tracking-wider">
          <Clock className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>

        {/* Shift Logout */}
        <button
          onClick={logout}
          title="Sign Out Kitchen Terminal"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit KDS</span>
        </button>
      </div>
    </header>
  );
};
