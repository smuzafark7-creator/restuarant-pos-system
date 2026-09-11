import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, Volume2, VolumeX, AlertTriangle, Clock, LogOut } from 'lucide-react';

export interface KdsHeaderProps {
  selectedStation: string;
  onSelectStation: (station: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  selectedStation,
  onSelectStation,
  isMuted,
  onToggleMute,
}) => {
  const { kots, currentBranch, logout } = useApp();
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

  const delayedCount = activeTickets.filter(k => {
    const createdMs = new Date(k.createdAt).getTime();
    if (isNaN(createdMs)) return false;
    return (Date.now() - createdMs) > 15 * 60 * 1000;
  }).length;

  const stations = ['All Stations', 'Tandoor & Grill', 'Main Curry', 'Chinese & Wok', 'Breads & Rice'];

  return (
    <header className="h-16 bg-[#090D16] text-white px-3 sm:px-6 flex items-center justify-between border-b border-slate-800 z-30 select-none shrink-0 font-mono">
      {/* Left: KDS Brand */}
      <div className="flex items-center gap-3">
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

        {/* Live Active Tickets Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Queue:</span>
          <span className="font-bold text-amber-400">{activeTickets.length} Orders</span>
        </div>

        {delayedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-300 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{delayedCount} Delayed (&gt;15m)</span>
          </div>
        )}
      </div>

      {/* Middle: Station Filter Pills */}
      <div className="hidden lg:flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800">
        {stations.map(station => (
          <button
            key={station}
            type="button"
            onClick={() => onSelectStation(station)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              selectedStation === station
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {station}
          </button>
        ))}
      </div>

      {/* Right: Clock, Sound Toggle, Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111827] border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentTime}</span>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
          }`}
          title={isMuted ? 'Unmute KDS Alerts' : 'Mute KDS Alerts'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
          title="Sign Out Kitchen"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
