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
    <header className="h-16 bg-white text-slate-900 px-3 sm:px-6 flex items-center justify-between border-b border-slate-200 z-30 select-none shrink-0 shadow-xs">
      {/* Left: KDS Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>ZAFFRAN KDS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">LIVE</span>
            </div>
          </div>
        </div>

        {/* Live Active Tickets Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500">Queue:</span>
          <span className="font-bold text-amber-700">{activeTickets.length} Orders</span>
        </div>

        {delayedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{delayedCount} Delayed (&gt;15m)</span>
          </div>
        )}
      </div>

      {/* Middle: Station Filter Pills */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
        {stations.map(station => (
          <button
            key={station}
            type="button"
            onClick={() => onSelectStation(station)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              selectedStation === station
                ? 'bg-amber-500 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {station}
          </button>
        ))}
      </div>

      {/* Right: Clock, Sound Toggle, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentTime}</span>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          }`}
          title={isMuted ? 'Unmute KDS Alerts' : 'Mute KDS Alerts'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
          title="Sign Out Kitchen"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
