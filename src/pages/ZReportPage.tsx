import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Lock, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  QrCode, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle,
  X,
  Layers,
  UtensilsCrossed
} from 'lucide-react';

export const ZReportPage: React.FC = () => {
  const { 
    currentUser, 
    bills, 
    menuItems, 
    showToast,
    openReceiptModal
  } = useApp();

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [shiftClosed, setShiftClosed] = useState(false);
  const [countedCash, setCountedCash] = useState<string>('29409');
  const [settleNotes, setSettleNotes] = useState('');

  // Shift financial figures
  const totalInvoices = bills.length;
  const grossSales = useMemo(() => bills.reduce((sum, b) => sum + b.grandTotal, 0), [bills]);
  const totalGst = useMemo(() => bills.reduce((sum, b) => sum + b.gstAmount, 0), [bills]);
  const netRevenue = grossSales - totalGst;

  // Payment Breakdown
  const openingFloat = 5000;
  const cashCollected = useMemo(() => {
    return bills.filter(b => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);
  const cashDrawerTotal = openingFloat + cashCollected;

  const upiSales = useMemo(() => {
    return bills.filter(b => b.paymentMethod === 'upi').reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const cardSales = useMemo(() => {
    return bills.filter(b => b.paymentMethod === 'card').reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const dueSales = useMemo(() => {
    return bills.filter(b => b.paymentMethod === 'due').reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  // Counts by payment method
  const cashCount = useMemo(() => bills.filter(b => b.paymentMethod === 'cash').length, [bills]);
  const upiCount = useMemo(() => bills.filter(b => b.paymentMethod === 'upi').length, [bills]);
  const cardCount = useMemo(() => bills.filter(b => b.paymentMethod === 'card').length, [bills]);
  const dueCount = useMemo(() => bills.filter(b => b.paymentMethod === 'due').length, [bills]);

  // Category breakdown calculation
  const categorySales = useMemo(() => {
    const itemToCategory: Record<string, string> = {};
    menuItems.forEach(item => {
      itemToCategory[item.name.toLowerCase().trim()] = item.category;
    });

    const categoriesMap: Record<string, { quantity: number; revenue: number }> = {
      'Biryani': { quantity: 0, revenue: 0 },
      'Starters': { quantity: 0, revenue: 0 },
      'Beverages': { quantity: 0, revenue: 0 },
      'Main Course': { quantity: 0, revenue: 0 },
      'Breads': { quantity: 0, revenue: 0 },
      'Desserts': { quantity: 0, revenue: 0 }
    };

    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const lower = item.name.toLowerCase().trim();
        let cat = itemToCategory[lower];
        if (!cat) {
          if (lower.includes('biryani')) cat = 'Biryani';
          else if (lower.includes('tikka') || lower.includes('65') || lower.includes('kebab') || lower.includes('chilli') || lower.includes('starter')) cat = 'Starters';
          else if (lower.includes('coke') || lower.includes('lassi') || lower.includes('soda') || lower.includes('lime') || lower.includes('water') || lower.includes('tea') || lower.includes('coffee')) cat = 'Beverages';
          else if (lower.includes('roti') || lower.includes('naan') || lower.includes('kulcha') || lower.includes('paratha')) cat = 'Breads';
          else if (lower.includes('jamun') || lower.includes('dessert') || lower.includes('ice cream') || lower.includes('kulfi')) cat = 'Desserts';
          else cat = 'Main Course';
        }

        if (!categoriesMap[cat]) {
          categoriesMap[cat] = { quantity: 0, revenue: 0 };
        }
        categoriesMap[cat].quantity += item.quantity;
        categoriesMap[cat].revenue += item.amount;
      });
    });

    return categoriesMap;
  }, [bills, menuItems]);

  const totalCategoryRevenue = useMemo(() => {
    return Object.values(categorySales).reduce((sum: number, c: { quantity: number; revenue: number }) => sum + c.revenue, 0) || 1;
  }, [categorySales]);

  // Handle Full Print
  const handlePrintReport = () => {
    showToast('Z-Report Printed', 'Shift close summary dispatched to Counter EPSON Thermal Register.', 'success');
    if (bills.length > 0) {
      openReceiptModal(bills[0]);
    }
  };

  // Handle Close Shift & Settle
  const handleConfirmSettle = () => {
    setShiftClosed(true);
    setIsSettleModalOpen(false);
    showToast(
      'Shift Closed & Settled',
      `Cashier drawer closed with ₹${countedCash} physical cash verified. Z-Report logged.`,
      'success'
    );
  };

  const cashierDisplayName = currentUser?.name || 'Anita Deshmukh';
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const countedNum = parseFloat(countedCash) || 0;
  const variance = countedNum - cashDrawerTotal;

  return (
    <div className="w-full min-h-full bg-[#0D111A] text-slate-200 font-sans p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161B26] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Day-End Z-Report / Shift Close Audit
            </h1>
            {shiftClosed && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Shift Settled
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 pl-11">
            Cashier: <span className="text-slate-200 font-semibold">{cashierDisplayName}</span> • Terminal Register #01 • <span className="font-mono text-slate-300">{reportDate}</span>
          </p>
        </div>

        {/* Actions on top right */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-auto">
          {/* [🖨️ Print Full Report] */}
          <button
            id="zreport-print-btn"
            type="button"
            onClick={handlePrintReport}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm text-white flex items-center gap-2 shadow-sm border border-emerald-400/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Full Report</span>
          </button>

          {/* [🔒 Close Shift & Settle Drawer] */}
          <button
            id="zreport-settle-btn"
            type="button"
            onClick={() => setIsSettleModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 active:scale-98 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm text-white flex items-center gap-2 shadow-sm border border-amber-400/30 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{shiftClosed ? 'Review Shift Settlement' : 'Close Shift & Settle Drawer'}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Invoices Settled */}
        <div className="bg-[#161B26] p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Invoices Settled
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Receipt className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {totalInvoices}
            </span>
            <span className="text-xs text-slate-400 font-medium">bills cleared</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Active Shift: 11:00 AM – Present</span>
          </div>
        </div>

        {/* 2. Gross Sales */}
        <div className="bg-[#161B26] p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gross Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              ₹{grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">Avg Ticket:</span>
            <span className="font-mono text-white">
              ₹{(totalInvoices > 0 ? grossSales / totalInvoices : 0).toFixed(0)} / order
            </span>
          </div>
        </div>

        {/* 3. Net Revenue (excl. Tax) */}
        <div className="bg-[#161B26] p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Revenue (excl. Tax)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              ₹{netRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Taxable food & beverage earnings</span>
          </div>
        </div>

        {/* 4. GST Collected (5%) */}
        <div className="bg-[#161B26] p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              GST Collected (5%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-amber-400 tracking-tight">
              ₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span>CGST (2.5%): ₹{(totalGst / 2).toFixed(2)}</span>
            <span>•</span>
            <span>SGST (2.5%): ₹{(totalGst / 2).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Payment Mode Breakdown Table & Drawer Reconciliation */}
      <div className="bg-[#161B26] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>Payment Mode Breakdown & Cash Drawer Balance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed audit trail of cash float, digital UPI collections, and card terminal batch settlements.
            </p>
          </div>

          {/* Drawer Cash Indicator Banner */}
          <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold block leading-tight">
                Cash Drawer Total
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                ₹{cashDrawerTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Float Reconciliation Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0D111A] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold font-mono text-sm">
              ₹
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Opening Cash Float</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                ₹{openingFloat.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block">Provided at shift launch</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l border-white/10 md:pl-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm">
              +
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Shift Cash Inflow</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ₹{cashCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block">{cashCount} cash bills settled</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l border-white/10 md:pl-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm">
              =
            </div>
            <div>
              <span className="text-[11px] text-emerald-300 uppercase font-semibold block">Net Physical Drawer Cash</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                ₹{cashDrawerTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Drawer Ready for Safe Deposit
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0D111A] text-slate-400 border-b border-white/10 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Transactions</th>
                <th className="py-3 px-4">Channel Notes & Settlement</th>
                <th className="py-3 px-4 text-right">Collected Amount</th>
                <th className="py-3 px-4 text-right">% Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#161B26]">
              {/* Cash */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">Cash Drawer</span>
                      <span className="text-[10px] text-slate-400">Currency Notes & Coins</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-200">
                  {cashCount} invoices
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Physical Cash in Drawer #01
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    ₹{cashCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 block">(Total in drawer: ₹{cashDrawerTotal.toLocaleString('en-IN')})</span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-300">
                  {grossSales > 0 ? ((cashCollected / grossSales) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* UPI */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <QrCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">UPI / QR Digital</span>
                      <span className="text-[10px] text-slate-400">GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-200">
                  {upiCount} invoices
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-950/40 border border-sky-800/40 text-sky-300 text-[10px] font-medium">
                    Auto-Settled to Merchant Bank (HDFC)
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold font-mono text-sky-400 text-sm">
                    ₹{upiSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-300">
                  {grossSales > 0 ? ((upiSales / grossSales) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Card */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">Card Swipes / Tap</span>
                      <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay EDC</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-200">
                  {cardCount} invoices
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[10px] font-medium">
                    POS EDC Terminal Batch #4092
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold font-mono text-purple-400 text-sm">
                    ₹{cardSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-300">
                  {grossSales > 0 ? ((cardSales / grossSales) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Due / Credit */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">Due / Customer Credit</span>
                      <span className="text-[10px] text-slate-400">Corporate & Staff Ledgers</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-200">
                  {dueCount} invoices
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium">
                    No Pending Credit Outstandings
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold font-mono text-slate-300 text-sm">
                    ₹{dueSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-400">
                  0.0%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Category Sales Breakdown */}
      <div className="bg-[#161B26] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span>Category Sales Breakdown & Revenue Share</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume and revenue distribution across Biryani, Starters, Beverages, and kitchen stations.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Category Volume: <span className="text-white font-bold">{Object.values(categorySales).reduce((s: number, c: { quantity: number; revenue: number }) => s + c.quantity, 0)} items</span>
          </span>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Biryani */}
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍚</span>
                <span className="font-bold text-white text-sm">Biryani Section</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
                {((categorySales['Biryani']?.revenue || 0) / totalCategoryRevenue * 100).toFixed(1)}% Share
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₹{(categorySales['Biryani']?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Revenue generated</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">
                  {categorySales['Biryani']?.quantity || 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Dishes sold</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ((categorySales['Biryani']?.revenue || 0) / totalCategoryRevenue * 100)))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Avg: ₹{((categorySales['Biryani']?.revenue || 0) / (categorySales['Biryani']?.quantity || 1)).toFixed(0)} / dish</span>
              <span className="text-amber-300 font-medium">Top Performer</span>
            </div>
          </div>

          {/* Starters */}
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍗</span>
                <span className="font-bold text-white text-sm">Starters & Tandoor</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold font-mono">
                {((categorySales['Starters']?.revenue || 0) / totalCategoryRevenue * 100).toFixed(1)}% Share
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₹{(categorySales['Starters']?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Revenue generated</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">
                  {categorySales['Starters']?.quantity || 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Dishes sold</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ((categorySales['Starters']?.revenue || 0) / totalCategoryRevenue * 100)))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Avg: ₹{((categorySales['Starters']?.revenue || 0) / (categorySales['Starters']?.quantity || 1)).toFixed(0)} / dish</span>
              <span className="text-rose-300 font-medium">Appetizers</span>
            </div>
          </div>

          {/* Beverages */}
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥤</span>
                <span className="font-bold text-white text-sm">Beverages & Mocktails</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold font-mono">
                {((categorySales['Beverages']?.revenue || 0) / totalCategoryRevenue * 100).toFixed(1)}% Share
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₹{(categorySales['Beverages']?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Revenue generated</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">
                  {categorySales['Beverages']?.quantity || 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Drinks sold</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ((categorySales['Beverages']?.revenue || 0) / totalCategoryRevenue * 100)))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Avg: ₹{((categorySales['Beverages']?.revenue || 0) / (categorySales['Beverages']?.quantity || 1)).toFixed(0)} / drink</span>
              <span className="text-sky-300 font-medium">Quick Refreshers</span>
            </div>
          </div>
        </div>

        {/* Secondary category summary bars */}
        <div className="p-4 rounded-xl bg-[#0D111A] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Other Station Sales:</span>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-300">
            <span>
              <strong className="text-white">Main Course:</strong> {categorySales['Main Course']?.quantity || 0} items (₹{(categorySales['Main Course']?.revenue || 0).toLocaleString('en-IN')})
            </span>
            <span>•</span>
            <span>
              <strong className="text-white">Breads & Rotis:</strong> {categorySales['Breads']?.quantity || 0} items (₹{(categorySales['Breads']?.revenue || 0).toLocaleString('en-IN')})
            </span>
            <span>•</span>
            <span>
              <strong className="text-white">Desserts:</strong> {categorySales['Desserts']?.quantity || 0} items (₹{(categorySales['Desserts']?.revenue || 0).toLocaleString('en-IN')})
            </span>
          </div>
        </div>
      </div>

      {/* Settle Drawer / Close Shift Confirmation Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[#161B26] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Shift Close & Drawer Reconciliation</h3>
                  <div className="text-[11px] text-slate-400">Terminal Register #01 • Cashier: {cashierDisplayName}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D111A] border border-white/5 space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Opening Float:</span>
                  <span className="text-white">₹{openingFloat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cash Inflow from Invoices:</span>
                  <span className="text-emerald-400 font-bold">+ ₹{cashCollected.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                  <span className="text-slate-200">Expected Physical Drawer Cash:</span>
                  <span className="text-emerald-400">₹{cashDrawerTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Physical Cash Count Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Actual Physical Cash Counted (₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">₹</span>
                  <input
                    type="number"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-[#0D111A] border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                    placeholder="Enter physical cash in drawer"
                  />
                </div>
              </div>

              {/* Variance notice */}
              <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
                Math.abs(variance) < 0.01 
                  ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-950/50 border border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {Math.abs(variance) < 0.01 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{Math.abs(variance) < 0.01 ? 'Cash Drawer Perfectly Balanced' : 'Cash Variance Detected'}</span>
                </div>
                <span className="font-mono text-sm font-bold">
                  {variance === 0 ? '₹0.00' : (variance > 0 ? `+₹${variance.toFixed(2)}` : `-₹${Math.abs(variance).toFixed(2)}`)}
                </span>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Closing Remarks (Optional):
                </label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="e.g., Safe drop completed to Manager vault"
                  className="w-full px-3 py-2 bg-[#0D111A] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-white/20"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm border border-amber-400/30"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm Shift Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
