import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChefHat, 
  Volume2, 
  VolumeX, 
  Clock, 
  LogOut,
  Columns3,
  LayoutGrid,
  Utensils,
  BarChart3,
  History
} from 'lucide-react';

interface KitchenHeaderProps {
  selectedStation: string;
  onSelectStation: (station: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  selectedStation,
  onSelectStation,
  isMuted,
  onToggleMute
}) => {
  const { logout, kdsViewMode, setKdsViewMode, activeKitchenTab } = useApp();
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

  const stations = ['All Stations', 'Tandoor & Grill', 'Curry', 'Chinese'];

  return (
    <header className="h-16 bg-[#161B26] text-white px-4 sm:px-6 flex items-center justify-between border-b border-white/[0.08] z-30 select-none shrink-0 shadow-md">
      {/* Left: Logo + "ZAFFRAN KDS" badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
          <ChefHat className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
            ZAFFRAN KDS
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold tracking-wider">
            LIVE
          </span>
        </div>
      </div>

      {/* Center: Live Station Filters OR Current Page View Title */}
      <div className="hidden sm:flex items-center">
        {activeKitchenTab === 'live' ? (
          <div className="flex items-center gap-1.5 bg-[#18191D] p-1 rounded-xl border border-white/[0.08]">
            {stations.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => onSelectStation(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStation === st
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        ) : activeKitchenTab === 'stock86' ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18191D] border border-amber-500/30 text-xs font-bold text-amber-400 shadow-xs">
            <Utensils className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Live Item Stock & 86 Inventory</span>
          </div>
        ) : activeKitchenTab === 'dispatched' ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18191D] border border-emerald-500/30 text-xs font-bold text-emerald-400 shadow-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Shift Dispatched Analytics</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18191D] border border-sky-500/30 text-xs font-bold text-sky-400 shadow-xs">
            <History className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Order History & Recall Archive</span>
          </div>
        )}
      </div>

      {/* Right: View Mode Switcher + Live clock + Audio toggle + Exit KDS */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* View Mode Switcher: Only on Live tab */}
        {activeKitchenTab === 'live' && (
          <div className="flex items-center bg-[#161B26] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setKdsViewMode('columns')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                kdsViewMode === 'columns'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs border border-emerald-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="3-Column Workflow (New Orders | Preparing | Ready to Serve)"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              type="button"
              onClick={() => setKdsViewMode('grid')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                kdsViewMode === 'grid'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs border border-emerald-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Unified Auto-Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Grid</span>
            </button>
          </div>
        )}

        {/* Live clock */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18191D] border border-white/[0.08] text-xs sm:text-sm font-bold text-slate-100 tracking-wider">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>{currentTime || '00:00:00'}</span>
        </div>

        {/* Audio toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isMuted 
              ? 'bg-rose-950/50 border-rose-800/50 text-rose-300 hover:bg-rose-900/50' 
              : 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/50'
          }`}
          title={isMuted ? 'Sound Alert Muted - Click to Unmute' : 'Sound Alert Active - Click to Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden md:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* Exit KDS */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out Kitchen Terminal"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer border border-white/[0.08] hover:border-rose-800/50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit KDS</span>
        </button>
      </div>
    </header>
  );
};
