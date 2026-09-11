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
  DollarSign, 
  CheckCircle2,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { NewOrderModal } from '../NewOrderModal';

export interface CashierHeaderProps {
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

  // Calculate drawer cash: sum of cash paid bills + opening float (₹5,000)
  const shiftCashSales = useMemo(() => {
    return bills
      .filter(b => b.paymentMethod === 'cash')
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const drawerTotal = 5000 + shiftCashSales;

  return (
    <>
      <header className="h-16 bg-[#0f172a] text-white flex justify-between items-center w-full px-4 border-b border-slate-800 z-30 select-none shrink-0 shadow-md font-sans">
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm sm:text-base tracking-tight text-white">
                ZAFFRAN POS
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                REGISTER 01
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Cashier Billing & Settlement Terminal
            </div>
          </div>
        </div>

        {/* Center: Fast Bill / KOT Search */}
        <div className="hidden md:flex items-center gap-3 max-w-md w-full mx-4">
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={billSearchQuery}
                onChange={e => {
                  setBillSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Find Bill #, Phone, Table..."
                className="w-full pl-9 pr-8 py-1.5 bg-[#131D36] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
              />
              {billSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setBillSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Results Popover */}
            {isSearchOpen && matchingBills.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#131D36] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 font-mono text-xs max-h-64 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Matching Bills ({matchingBills.length})
                </div>
                {matchingBills.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBill(b)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{b.billNumber}</span>
                        <span className="text-[10px] text-emerald-400">({b.paymentMethod.toUpperCase()})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {b.tableNumber ? `Table ${b.tableNumber}` : 'Counter'} • {b.customerName || 'Guest'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{b.grandTotal.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-500">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Order Button */}
          <button
            type="button"
            onClick={handleNewOrderClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold shadow-2xs cursor-pointer shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>

        {/* Right Section: Drawer, Printer, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cash Drawer Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131D36] border border-slate-700/80 text-xs font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-400 leading-none">DRAWER CASH</span>
              <span className="font-bold text-emerald-400 text-xs leading-tight">
                ₹{drawerTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Thermal Printer Online Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#131D36] border border-slate-700/80 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${printerStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <Printer className="w-3 h-3 text-slate-300" />
            <span className="hidden sm:inline text-slate-300">
              {printerStatus === 'online' ? 'POS-80 PRINTER' : 'PRINTER OFFLINE'}
            </span>
          </div>

          {/* Cashier Profile */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131D36] border border-slate-700/80 text-xs font-mono">
            <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-white font-bold text-[11px] leading-tight">{currentUser?.name || 'Cashier'}</span>
              <span className="text-emerald-400 text-[9px] font-bold leading-tight">ON SHIFT</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Confirmation modal if unsent items exist when clicking New Order */}
      {isNewOrderModalOpen && (
        <NewOrderModal 
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onConfirm={() => {
            resetCartOrder();
            setIsNewOrderModalOpen(false);
            setActiveTab('pos');
            showToast('New Order Prepared', 'Previous unsent items cleared.', 'info');
          }}
        />
      )}
    </>
  );
};
