import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill } from '../../types';
import { 
  ReceiptText, 
  Search, 
  X, 
  Plus, 
  Printer, 
  LogOut, 
  User, 
  DollarSign
} from 'lucide-react';
import { NewOrderModal } from '../../components/NewOrderModal';

interface CashierHeaderProps {
  printerStatus?: 'online' | 'offline';
}

export const CashierHeader: React.FC<CashierHeaderProps> = ({ printerStatus = 'online' }) => {
  const { 
    currentUser, 
    bills, 
    cart, 
    cartPaidBill, 
    resetCartOrder, 
    setActiveTab, 
    openBillDetailsModal, 
    showToast, 
    logout
  } = useApp();

  const [billSearchQuery, setBillSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter bills instantly
  const matchingBills = useMemo(() => {
    const q = billSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const cleanQ = q.replace(/^#/, '');

    return bills.filter(b => {
      const billNum = (b.billNumber || '').toLowerCase();
      const kotNum = (b.kotNumber || '').toLowerCase();
      const custName = (b.customerName || '').toLowerCase();
      const custMobile = (b.customerMobile || '').toLowerCase();
      const tblNum = (b.tableNumber || '').toLowerCase();

      return (
        billNum.includes(cleanQ) ||
        kotNum.includes(cleanQ) ||
        custName.includes(cleanQ) ||
        custMobile.includes(cleanQ) ||
        tblNum.includes(cleanQ)
      );
    }).slice(0, 6);
  }, [bills, billSearchQuery]);

  const handleSelectBill = (bill: Bill) => {
    openBillDetailsModal(bill);
    setBillSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleNewOrderClick = () => {
    const hasUnsentItems = cart.length > 0 && !cartPaidBill;
    if (hasUnsentItems) {
      setIsNewOrderModalOpen(true);
    } else {
      resetCartOrder();
      setActiveTab('pos');
      showToast('Fresh Order Started', 'Ready for new order ticket.', 'info');
    }
  };

  // Calculate drawer cash: sum of cash paid bills + opening float (e.g. ₹5,000)
  const shiftCashSales = useMemo(() => {
    return bills
      .filter(b => b.paymentMethod === 'cash')
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const shiftTotalPaid = useMemo(() => {
    return bills.reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const drawerCashBalance = 5000 + shiftCashSales;

  return (
    <header className="h-14 bg-[#0f172a] text-slate-200 px-3 sm:px-5 flex items-center justify-between border-b border-slate-800 z-30 select-none flex-shrink-0 shadow-xs font-sans">
      {/* Left: Terminal Info, New Order Button, and Quick Bill Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl min-w-0 mr-3">
        {/* Terminal Name / ID */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold shadow-2xs">
            <ReceiptText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              CASHIER TERMINAL
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Counter Billing #01</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block shrink-0" />

        {/* Quick New Order Button */}
        <button
          id="cashier-new-order-btn"
          type="button"
          onClick={handleNewOrderClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          title="Start fresh order"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">New Order</span>
        </button>

        {/* Expanded Quick Bill / Table / Phone Search Input */}
        <div className="relative flex-1 max-w-xs sm:max-w-md min-w-[140px]" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              id="cashier-bill-search-input"
              ref={searchInputRef}
              type="text"
              value={billSearchQuery}
              onChange={e => {
                setBillSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Quick Bill / Table / Phone..."
              className="pl-8 pr-7 py-1.5 rounded-lg bg-[#080d1a] border border-slate-800 focus:border-slate-700 text-xs text-slate-200 placeholder-slate-500 w-full transition-colors focus:outline-none shadow-xs"
            />
            {billSearchQuery && (
              <button
                type="button"
                onClick={() => setBillSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Bill Search Dropdown Popover */}
          {isSearchOpen && billSearchQuery.trim().length > 0 && (
            <div className="absolute left-0 mt-1.5 w-80 sm:w-96 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] text-slate-400 uppercase border-b border-slate-800 mb-1.5">
                <span>Matching Bills ({matchingBills.length})</span>
                <span className="text-[9px]">ESC to close</span>
              </div>

              {matchingBills.length > 0 ? (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {matchingBills.map(bill => (
                    <button
                      key={bill.id}
                      type="button"
                      onClick={() => handleSelectBill(bill)}
                      className="w-full text-left p-2 rounded-lg bg-[#080d1a] hover:bg-slate-800/80 border border-slate-800/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">{bill.billNumber}</span>
                        <span className="font-bold text-emerald-400">₹{bill.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>{bill.tableNumber || bill.orderType.toUpperCase()}</span>
                        <span className="uppercase font-medium">{bill.paymentMethod}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs">
                  No bill matching "{billSearchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Register Cash, Shift Summary, Printer Status, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
        {/* Active Register / Drawer Balance */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-white">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Drawer Cash:</span>
          <span className="font-bold text-white">₹{drawerCashBalance.toLocaleString('en-IN')}</span>
        </div>

        {/* Cashier Shift summary */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-white">
          <span className="text-slate-400 text-[11px]">Shift Bills:</span>
          <span className="font-bold text-white">{bills.length}</span>
          <span className="text-slate-700">|</span>
          <span className="font-bold text-emerald-400">₹{shiftTotalPaid.toLocaleString('en-IN')}</span>
        </div>

        {/* Thermal Printer status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400">
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium hidden sm:inline">Printer Ready</span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-[#080d1a] text-slate-200 border border-slate-800 flex items-center justify-center font-bold text-xs">
            {currentUser?.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-200">
            {currentUser?.name?.split(' ')[0] || 'Cashier'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out Cashier Terminal"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <NewOrderModal 
        isOpen={isNewOrderModalOpen} 
        onClose={() => setIsNewOrderModalOpen(false)} 
      />
    </header>
  );
};
