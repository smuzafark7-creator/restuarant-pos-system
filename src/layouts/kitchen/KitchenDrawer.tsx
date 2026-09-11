import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Ban, 
  Sliders, 
  ChefHat, 
  Search,
  Volume2,
  Bell,
  RefreshCw
} from 'lucide-react';

interface KitchenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDrawerTab: 'active' | 'completed' | 'stock86' | 'settings';
  setActiveDrawerTab: (tab: 'active' | 'completed' | 'stock86' | 'settings') => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KitchenDrawer: React.FC<KitchenDrawerProps> = ({
  isOpen,
  onClose,
  activeDrawerTab,
  setActiveDrawerTab,
  isMuted,
  onToggleMute
}) => {
  const { 
    kots, 
    menuItems, 
    toggleMenuItemAvailability, 
    updateKOTStatus, 
    showToast,
    currentBranch 
  } = useApp();

  const [menuSearch, setMenuSearch] = useState('');
  const [ticketSort, setTicketSort] = useState<'oldest' | 'newest'>('oldest');

  if (!isOpen) return null;

  const activeKots = kots.filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) && (k.status === 'new' || k.status === 'preparing')
  );

  const completedKots = kots.filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) && (k.status === 'ready' || k.status === 'served')
  );

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
    item.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-800 h-full flex flex-col shadow-2xl text-white">
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#090D16]">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm tracking-wider uppercase text-white">Kitchen Drawer</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs: Active Orders, Prepared/Completed, 86 Out-of-Stock, Station Settings */}
        <div className="grid grid-cols-4 bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveDrawerTab('active')}
            className={`py-2 px-1 rounded-lg text-center transition-colors cursor-pointer ${
              activeDrawerTab === 'active' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active ({activeKots.length})
          </button>

          <button
            onClick={() => setActiveDrawerTab('completed')}
            className={`py-2 px-1 rounded-lg text-center transition-colors cursor-pointer ${
              activeDrawerTab === 'completed' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Done ({completedKots.length})
          </button>

          <button
            onClick={() => setActiveDrawerTab('stock86')}
            className={`py-2 px-1 rounded-lg text-center transition-colors cursor-pointer ${
              activeDrawerTab === 'stock86' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            86 Toggle
          </button>

          <button
            onClick={() => setActiveDrawerTab('settings')}
            className={`py-2 px-1 rounded-lg text-center transition-colors cursor-pointer ${
              activeDrawerTab === 'settings' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: ACTIVE ORDERS */}
          {activeDrawerTab === 'active' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Active Cooking Queue</span>
                <span className="text-amber-400 font-bold">{activeKots.length} Tickets</span>
              </div>
              {activeKots.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active orders right now. Kitchen queue is clear!
                </div>
              ) : (
                activeKots.map(kot => (
                  <div key={kot.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-xs">{kot.kotNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                        {kot.tableNumber || 'Takeaway'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 divide-y divide-slate-700/40">
                      {kot.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-[10px] text-slate-500">{item.serveType}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => updateKOTStatus(kot.id, 'ready')}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PREPARED / COMPLETED */}
          {activeDrawerTab === 'completed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Completed Tickets History</span>
                <span className="text-emerald-400 font-bold">{completedKots.length} Ready/Served</span>
              </div>
              {completedKots.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No completed tickets recorded in this session.
                </div>
              ) : (
                completedKots.slice(0, 15).map(kot => (
                  <div key={kot.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{kot.kotNumber}</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">{kot.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {kot.tableNumber || 'Takeaway'} • {kot.items.length} items • {kot.timeFormatted}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: 86 ITEM OUT-OF-STOCK TOGGLE */}
          {activeDrawerTab === 'stock86' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Ban className="w-4 h-4" />
                  <span>86 Item Stock Control</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Toggle items unavailable immediately across all Waiter and POS terminals.
                </p>
              </div>

              {/* Quick Search for menu items */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  placeholder="Filter item name or category..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5 max-h-[420px] overflow-y-auto divide-y divide-slate-800">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.category} • ₹{item.price}</div>
                    </div>
                    <button
                      onClick={() => {
                        toggleMenuItemAvailability(item.id);
                        showToast(
                          item.available ? 'Item 86-ed (Out of Stock)' : 'Item Restocked',
                          `${item.name} is now marked ${item.available ? 'OUT OF STOCK' : 'AVAILABLE'}.`,
                          item.available ? 'warning' : 'success'
                        );
                      }}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        item.available
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
                      }`}
                    >
                      {item.available ? 'AVAILABLE' : '86 / OUT'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STATION SETTINGS */}
          {activeDrawerTab === 'settings' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Sliders className="w-4 h-4" />
                <span>Station & Display Settings</span>
              </div>

              {/* Sound Audio alert toggle */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Audio Order Chimes</span>
                  <button
                    onClick={onToggleMute}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      isMuted 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isMuted ? 'MUTED' : 'ENABLED'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Plays audible chime whenever a new KOT ticket arrives from POS or Waiter pad.
                </p>
              </div>

              {/* Ticket Sorting */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-white">Ticket Sorting</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTicketSort('oldest')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketSort === 'oldest' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}
                  >
                    Oldest First (FIFO)
                  </button>
                  <button
                    onClick={() => setTicketSort('newest')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      ticketSort === 'newest' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}
                  >
                    Newest First
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
