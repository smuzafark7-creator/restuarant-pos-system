import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Grid3X3, 
  ReceiptText, 
  FileText, 
  BellRing,
  X,
  Send,
  ChefHat
} from 'lucide-react';

export interface WaiterNavProps {
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const WaiterNav: React.FC<WaiterNavProps> = ({ activeTabOverride, onNavigate }) => {
  const { 
    activeTab, 
    setActiveTab, 
    cart, 
    kots, 
    pendingBillRequests, 
    showToast,
    currentUser 
  } = useApp();

  const [isCallKitchenModalOpen, setIsCallKitchenModalOpen] = useState(false);
  const [kitchenCallReason, setKitchenCallReason] = useState('Urgent status inquiry');
  const [selectedTableForCall, setSelectedTableForCall] = useState('Table 1');

  const currentActive = activeTabOverride || activeTab;

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handleCallKitchenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Kitchen Alert Dispatched', 
      `Alert sent to Kitchen KDS: "${kitchenCallReason}" for ${selectedTableForCall} by ${currentUser?.name || 'Waiter'}.`,
      'success'
    );
    setIsCallKitchenModalOpen(false);
  };

  const pendingKotsCount = kots.filter(k => k.status === 'new' || k.status === 'preparing').length;

  return (
    <>
      <nav className="w-full h-16 bg-[#0F172A] border-t border-slate-800 flex items-center justify-around px-2 shadow-2xl select-none font-mono">
        {/* 1. Floor / Table Grid */}
        <button
          id="waiter-nav-tables"
          type="button"
          onClick={() => handleNavigate('tables')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'tables' 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Grid3X3 className="w-5 h-5" />
            {pendingBillRequests.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {pendingBillRequests.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Floor / Tables</span>
          {currentActive === 'tables' && (
            <span className="w-8 h-1 bg-emerald-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* 2. Quick Order Punch */}
        <button
          id="waiter-nav-pos"
          type="button"
          onClick={() => handleNavigate('pos')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'pos' 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ReceiptText className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Quick Punch</span>
          {currentActive === 'pos' && (
            <span className="w-8 h-1 bg-emerald-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* 3. Kitchen KOT Status */}
        <button
          id="waiter-nav-kot"
          type="button"
          onClick={() => handleNavigate('kot')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'kot' 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5" />
            {pendingKotsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                {pendingKotsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">KOT History</span>
          {currentActive === 'kot' && (
            <span className="w-8 h-1 bg-emerald-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* 4. Instant Call Kitchen Alert Modal Trigger */}
        <button
          id="waiter-nav-call-kitchen"
          type="button"
          onClick={() => setIsCallKitchenModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-amber-300 transition-colors relative cursor-pointer"
        >
          <div className="relative">
            <BellRing className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Call Kitchen</span>
        </button>
      </nav>

      {/* Call Kitchen Fast Modal */}
      {isCallKitchenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-mono">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Call Kitchen Station</h3>
                  <p className="text-[11px] text-slate-400">Broadcast alert to Kitchen KDS screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCallKitchenModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCallKitchenSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Table</label>
                <input
                  type="text"
                  value={selectedTableForCall}
                  onChange={e => setSelectedTableForCall(e.target.value)}
                  placeholder="e.g. Table 4"
                  className="w-full px-3 py-2 bg-[#111a2e] border border-slate-700 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Message / Urgent Reason</label>
                <textarea
                  value={kitchenCallReason}
                  onChange={e => setKitchenCallReason(e.target.value)}
                  placeholder="e.g. Rush starter, guest in hurry"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#111a2e] border border-slate-700 rounded-xl text-xs text-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCallKitchenModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Kitchen Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
