import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Grid3X3, 
  ReceiptText, 
  FileText, 
  Receipt,
  ChefHat,
  X,
  Send,
  CheckCircle2
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
    tables,
    pendingBillRequests, 
    showToast,
    currentUser 
  } = useApp();

  const [isCallKitchenModalOpen, setIsCallKitchenModalOpen] = useState(false);
  const [isBillRequestsModalOpen, setIsBillRequestsModalOpen] = useState(false);
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
      {/* Touch-optimized 5-Tab Bottom Navigation Bar strictly for Waiter role */}
      <nav 
        id="waiter-bottom-navigation-comp"
        className="w-full h-16 bg-[#0f172a] border-t border-slate-800 grid grid-cols-5 items-stretch px-1 shadow-xs select-none font-sans text-slate-200"
      >
        {/* 1. Floor / Tables */}
        <button
          id="waiter-comp-nav-tables"
          type="button"
          onClick={() => handleNavigate('tables')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'tables' 
              ? 'text-white font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1">Floor / Tables</span>
          {currentActive === 'tables' && (
            <span className="w-8 h-1 bg-emerald-500 rounded-full mt-0.5" />
          )}
        </button>

        {/* 2. Quick Punch */}
        <button
          id="waiter-comp-nav-pos"
          type="button"
          onClick={() => handleNavigate('pos')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'pos' 
              ? 'text-white font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ReceiptText className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1">Quick Punch</span>
          {currentActive === 'pos' && (
            <span className="w-8 h-1 bg-emerald-500 rounded-full mt-0.5" />
          )}
        </button>

        {/* 3. Active KOTs */}
        <button
          id="waiter-comp-nav-kot"
          type="button"
          onClick={() => handleNavigate('kot')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative cursor-pointer ${
            currentActive === 'kot' 
              ? 'text-white font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <FileText className="w-5 h-5" />
            {pendingKotsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-slate-700 border border-slate-600 text-slate-200 rounded-full text-[9px] font-bold flex items-center justify-center">
                {pendingKotsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1">Active KOTs</span>
          {currentActive === 'kot' && (
            <span className="w-8 h-1 bg-emerald-500 rounded-full mt-0.5" />
          )}
        </button>

        {/* 4. Bill Requests (5th Nav Tab with Amber Badge) */}
        <button
          id="waiter-comp-nav-bill-requests"
          type="button"
          onClick={() => setIsBillRequestsModalOpen(true)}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative cursor-pointer ${
            isBillRequestsModalOpen || pendingBillRequests.length > 0
              ? 'text-amber-400 hover:text-amber-300' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Receipt className="w-5 h-5" />
            {pendingBillRequests.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                {pendingBillRequests.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1 font-medium">Bill Requests</span>
          {isBillRequestsModalOpen && (
            <span className="w-8 h-1 bg-amber-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* 5. Call Kitchen */}
        <button
          id="waiter-comp-nav-call-kitchen"
          type="button"
          onClick={() => setIsCallKitchenModalOpen(true)}
          className="flex flex-col items-center justify-center h-full py-1 text-slate-400 hover:text-amber-300 transition-colors relative cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1">Call Kitchen</span>
        </button>
      </nav>

      {/* Bill Requests Drawer / Modal */}
      {isBillRequestsModalOpen && (
        <div 
          id="bill-requests-comp-modal-backdrop"
          onClick={() => setIsBillRequestsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs font-sans text-slate-200 animate-in fade-in duration-150"
        >
          <div 
            id="bill-requests-comp-modal-card"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#161f38]/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">Bill Requests</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {pendingBillRequests.length} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cashier handles payments. Verify table ordered items below.
                  </p>
                </div>
              </div>
              <button 
                id="close-bill-requests-comp-modal"
                onClick={() => setIsBillRequestsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Read-Only Table Order Verification */}
            <div className="overflow-y-auto p-4 space-y-3 flex-1 min-h-0">
              {pendingBillRequests.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">No Pending Bill Requests</div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    All customer tables have been settled or are currently enjoying their meal.
                  </p>
                </div>
              ) : (
                pendingBillRequests.map(r => {
                  // Find associated table
                  const table = tables.find(
                    t => t.branchId === r.branchId && t.name.toLowerCase() === r.tableNumber.toLowerCase()
                  );

                  // Find table KOTs
                  const tableKots = kots.filter(
                    k => k.branchId === r.branchId &&
                         k.tableNumber &&
                         k.tableNumber.toLowerCase() === r.tableNumber.toLowerCase() &&
                         !k.isBilled &&
                         k.status !== 'cancelled'
                  );

                  // Merge ordered items
                  const mergedItems: { name: string; quantity: number; rate: number; total: number }[] = [];
                  tableKots.forEach(k => {
                    k.items.forEach(item => {
                      if (item.status === 'voided') return;
                      const existing = mergedItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
                      if (existing) {
                        existing.quantity += item.quantity;
                        existing.total += item.quantity * (item.rate || 0);
                      } else {
                        mergedItems.push({
                          name: item.name,
                          quantity: item.quantity,
                          rate: item.rate,
                          total: item.quantity * (item.rate || 0)
                        });
                      }
                    });
                  });

                  const guestCount = table?.guestCount || (r.tableNumber === 'Table 5' ? 3 : r.tableNumber === 'Table 6' ? 2 : undefined);
                  const waiterName = r.requestedBy || table?.assignedWaiterName || currentUser?.name || 'Waiter';

                  return (
                    <div 
                      key={r.id}
                      id={`bill-request-comp-card-${r.id}`}
                      className="bg-[#161f38] border border-slate-700/80 rounded-xl p-3.5 space-y-2.5 shadow-xs"
                    >
                      {/* Header: Table Number + BILL REQUESTED status pill on left, Total Amount in amber on right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white tracking-tight">
                            {r.tableNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                            BILL REQUESTED
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-amber-400 font-mono tracking-tight">
                            ₹{r.totalAmount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Body: Compact, clear list of items ordered for that table */}
                      <div className="bg-[#0c1222] rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
                        {mergedItems.length > 0 ? (
                          mergedItems.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-800/60 last:border-b-0"
                            >
                              <span className="text-slate-200">
                                <span className="font-medium text-white">{item.name}</span>
                                <span className="text-slate-400 font-normal ml-1.5">× {item.quantity}</span>
                              </span>
                              <span className="font-mono text-slate-300 font-medium shrink-0 ml-2">
                                ₹{item.total.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between text-slate-300 py-0.5">
                            <span className="text-slate-400 italic">Dine-in Order Items</span>
                            <span className="font-mono text-slate-300 font-medium">₹{r.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Meta info: Waiter name, time, and guest count in a small, clean single line */}
                      <div className="text-[11px] text-slate-400 flex items-center flex-wrap gap-x-2.5 gap-y-1 pt-0.5">
                        <span>Waiter: <span className="text-slate-200 font-medium">{waiterName}</span></span>
                        <span className="text-slate-600">•</span>
                        <span>Time: <span className="text-slate-200 font-medium">{r.requestedAt}</span></span>
                        {guestCount !== undefined && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>Guests: <span className="text-slate-200 font-medium">{guestCount}</span></span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer: Clean Close button */}
            <div className="p-3 bg-[#161f38]/60 border-t border-slate-800 flex items-center justify-end shrink-0">
              <button
                id="close-bill-requests-comp-footer-btn"
                type="button"
                onClick={() => setIsBillRequestsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Kitchen Quick Modal */}
      {isCallKitchenModalOpen && (
        <div 
          id="call-kitchen-comp-modal-backdrop"
          onClick={() => setIsCallKitchenModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans text-slate-200"
        >
          <div 
            id="call-kitchen-comp-modal-card"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-200 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Call Kitchen Station</h3>
              </div>
              <button 
                id="close-call-kitchen-comp-modal"
                onClick={() => setIsCallKitchenModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCallKitchenSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Table</label>
                <input
                  id="kitchen-call-comp-target-table"
                  type="text"
                  value={selectedTableForCall}
                  onChange={e => setSelectedTableForCall(e.target.value)}
                  placeholder="e.g. Table 4"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Kitchen Alert Message</label>
                <select
                  id="kitchen-call-comp-reason-select"
                  value={kitchenCallReason}
                  onChange={e => setKitchenCallReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 cursor-pointer"
                >
                  <option value="Urgent status inquiry" className="bg-[#0f172a] text-white">Urgent status inquiry</option>
                  <option value="Guest waiting long for food" className="bg-[#0f172a] text-white">Guest waiting long for food</option>
                  <option value="Send starter first please" className="bg-[#0f172a] text-white">Send starter first please</option>
                  <option value="Hold main course for 10 mins" className="bg-[#0f172a] text-white">Hold main course for 10 mins</option>
                  <option value="Cutlery / extra gravy requested" className="bg-[#0f172a] text-white">Cutlery / extra gravy requested</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallKitchenModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-[#080d1a] hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition-colors border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-call-kitchen-comp"
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
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
