import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Grid3X3, 
  ReceiptText, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  Receipt,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface CashierSidebarProps {
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const CashierSidebar: React.FC<CashierSidebarProps> = ({ activeTabOverride, onNavigate }) => {
  const { 
    activeTab, 
    setActiveTab, 
    cart, 
    pendingBillRequests, 
    tables, 
    bills, 
    showToast,
    openReceiptModal,
    currentBranch,
    currentUser
  } = useApp();

  const [isZReportOpen, setIsZReportOpen] = useState(false);

  const currentActive = activeTabOverride || activeTab;

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Occupied & billing tables
  const billingTablesCount = tables.filter(t => t.status === 'billing' || t.status === 'occupied').length;

  // Day-End Z-Report calculations
  const totalSales = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalGst = bills.reduce((sum, b) => sum + b.gstAmount, 0);
  const cashSales = bills.filter(b => b.paymentMethod === 'cash').reduce((s, b) => s + b.grandTotal, 0);
  const upiSales = bills.filter(b => b.paymentMethod === 'upi').reduce((s, b) => s + b.grandTotal, 0);
  const cardSales = bills.filter(b => b.paymentMethod === 'card').reduce((s, b) => s + b.grandTotal, 0);

  const handlePrintTest = () => {
    showToast('Test Receipt Sent', 'Thermal printer test job dispatched to Counter EPSON TM-T88VI (58mm).', 'success');
    if (bills.length > 0) {
      openReceiptModal(bills[0]);
    }
  };

  return (
    <>
      {/* Compact vertical strip strictly for Cashier Terminal */}
      <aside className="w-18 sm:w-20 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between py-3 select-none font-mono shrink-0 shadow-lg">
        {/* Navigation Items */}
        <div className="flex flex-col items-center space-y-2">
          {/* 1. Live Tables */}
          <button
            id="cashier-sidebar-tables"
            type="button"
            onClick={() => handleNavigate('tables')}
            className={`w-14 sm:w-16 h-16 rounded-xl flex flex-col items-center justify-center p-1.5 transition-all relative cursor-pointer ${
              currentActive === 'tables'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Live Tables Floor View"
          >
            <div className="relative">
              <Grid3X3 className="w-5 h-5" />
              {pendingBillRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold animate-pulse">
                  {pendingBillRequests.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 text-center leading-tight">Tables</span>
          </button>

          {/* 2. Quick POS Punch */}
          <button
            id="cashier-sidebar-pos"
            type="button"
            onClick={() => handleNavigate('pos')}
            className={`w-14 sm:w-16 h-16 rounded-xl flex flex-col items-center justify-center p-1.5 transition-all relative cursor-pointer ${
              currentActive === 'pos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Quick Billing Terminal"
          >
            <div className="relative">
              <ReceiptText className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 text-center leading-tight">Punch</span>
          </button>

          {/* 3. Bills Register */}
          <button
            id="cashier-sidebar-bills"
            type="button"
            onClick={() => handleNavigate('bills')}
            className={`w-14 sm:w-16 h-16 rounded-xl flex flex-col items-center justify-center p-1.5 transition-all relative cursor-pointer ${
              currentActive === 'bills'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Settled Bills Register"
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-1 text-center leading-tight">Bills</span>
          </button>
        </div>

        {/* Quick Utility Tools: Day-End Z-Report & Print Test */}
        <div className="flex flex-col items-center space-y-2 pt-3 border-t border-slate-800/80">
          {/* Day-End Z-Report Action */}
          <button
            id="cashier-sidebar-zreport"
            type="button"
            onClick={() => setIsZReportOpen(true)}
            className="w-14 sm:w-16 h-14 rounded-xl flex flex-col items-center justify-center p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Generate Day-End Z-Report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-[9px] mt-1 text-center leading-tight">Z-Report</span>
          </button>

          {/* Print Test Action */}
          <button
            id="cashier-sidebar-print-test"
            type="button"
            onClick={handlePrintTest}
            className="w-14 sm:w-16 h-14 rounded-xl flex flex-col items-center justify-center p-1 text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Thermal Printer Self-Test"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[9px] mt-1 text-center leading-tight">Test Print</span>
          </button>
        </div>
      </aside>

      {/* Day-End Z-Report Modal */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-mono">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Daily Z-Report Summary</h3>
                <p className="text-[11px] text-slate-400">Terminal Register 01 • Shift Summary</p>
              </div>
              <button
                type="button"
                onClick={() => setIsZReportOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-[#111a2e] p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gross Invoiced:</span>
                <span className="font-bold text-white">₹{totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total GST (5%):</span>
                <span className="font-bold text-emerald-400">₹{totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Cash Collected:</span>
                <span className="font-bold text-amber-300">₹{cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">UPI / QR:</span>
                <span className="font-bold text-sky-400">₹{upiSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Card POS:</span>
                <span className="font-bold text-purple-400">₹{cardSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsZReportOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Z-Report Printed', 'Day-end audit tape printed successfully.', 'success');
                  setIsZReportOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Z-Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
