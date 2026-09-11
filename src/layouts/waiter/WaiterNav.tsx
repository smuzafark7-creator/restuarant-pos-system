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

interface WaiterNavProps {
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
      {/* Touch-optimized Bottom Navigation Bar strictly for Waiter role */}
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

        {/* 3. My Active KOTs */}
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
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {pendingKotsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Active KOTs</span>
          {currentActive === 'kot' && (
            <span className="w-8 h-1 bg-emerald-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* 4. Call Kitchen */}
        <button
          id="waiter-nav-call-kitchen"
          type="button"
          onClick={() => setIsCallKitchenModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-amber-400 hover:text-amber-300 transition-colors relative cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <BellRing className="w-4 h-4" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold tracking-tight">Call Kitchen</span>
        </button>
      </nav>

      {/* Call Kitchen Quick Modal */}
      {isCallKitchenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-mono">
          <div className="w-full max-w-sm bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Call Kitchen Station</h3>
              </div>
              <button 
                onClick={() => setIsCallKitchenModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCallKitchenSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Table</label>
                <input
                  type="text"
                  value={selectedTableForCall}
                  onChange={e => setSelectedTableForCall(e.target.value)}
                  placeholder="e.g. Table 4"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Kitchen Alert Message</label>
                <select
                  value={kitchenCallReason}
                  onChange={e => setKitchenCallReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Urgent status inquiry">Urgent status inquiry</option>
                  <option value="Guest waiting long for food">Guest waiting long for food</option>
                  <option value="Send starter first please">Send starter first please</option>
                  <option value="Hold main course for 10 mins">Hold main course for 10 mins</option>
                  <option value="Cutlery / extra gravy requested">Cutlery / extra gravy requested</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallKitchenModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
