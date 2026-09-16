import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Bill, PaymentMethod } from '../types';
import { 
  Search, 
  Receipt, 
  Printer, 
  Eye, 
  Filter, 
  Calendar, 
  Building2, 
  CreditCard,
  Download,
  CheckCircle2,
  X,
  Clock,
  User,
  Utensils,
  DollarSign,
  Ban,
  AlertTriangle
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const BillsPage: React.FC = () => {
  const { 
    bills, 
    openReceiptModal, 
    openBillDetailsModal, 
    currentBranch, 
    setBranch, 
    branches, 
    currentUser, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return bills.filter(bill => {
      // Branch filter: if user is not owner, restricted by currentUser/currentBranch, else by selectedBranch
      const matchBranch = selectedBranch === 'all' 
        ? (currentBranch === 'all' || bill.branchId === currentBranch)
        : bill.branchId === selectedBranch;

      const matchSearch = bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (bill.customerName && bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (bill.tableNumber && bill.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPayment = paymentFilter === 'All' || bill.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();
      const matchOrderType = orderTypeFilter === 'All' || bill.orderType.toLowerCase() === orderTypeFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' 
        ? true 
        : statusFilter === 'paid' 
          ? bill.status !== 'cancelled' 
          : statusFilter === 'cancelled' 
            ? bill.status === 'cancelled' 
            : bill.status === statusFilter;

      // Date filtering
      let matchDate = true;
      if (dateFilter === 'Today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchDate = bill.date === todayStr || (bill.date ? (bill.date.includes('07 Sep 2026') || bill.date.includes('Today')) : false);
      } else if (dateFilter === 'Yesterday') {
        matchDate = bill.date ? (bill.date.includes('06 Sep') || bill.date.includes('Yesterday')) : false;
      }

      return matchBranch && matchSearch && matchPayment && matchOrderType && matchStatus && matchDate;
    });
  }, [bills, currentBranch, selectedBranch, searchQuery, paymentFilter, orderTypeFilter, statusFilter, dateFilter]);

  const totalAmount = useMemo(() => {
    return filtered
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [filtered]);

  // Calculate drawer cash: sum of cash paid bills + opening float (₹5,000)
  const shiftCashSales = useMemo(() => {
    return bills
      .filter(b => b.status !== 'cancelled' && b.paymentMethod === 'cash')
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const shiftTotalPaid = useMemo(() => {
    return bills
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.grandTotal, 0);
  }, [bills]);

  const drawerCashBalance = 5000 + shiftCashSales;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Top Banner (Dark Slate Surface) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0f172a] p-4 sm:p-5 rounded-xl border border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Bills & Invoices Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete billing register, tax receipts archive, and settled customer accounts
          </p>
        </div>

        {/* Financial Overview Metrics Group */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Drawer Cash (Emerald badge) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-xs">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold block leading-tight">
                Drawer Cash
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ₹{drawerCashBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Shift Bills */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white shadow-xs">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block leading-tight">
                Shift Bills
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-white font-mono">{bills.length}</span>
                <span className="text-slate-600">|</span>
                <span className="text-[10px] text-slate-400">Total:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ₹{shiftTotalPaid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Filtered Revenue & Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white shadow-xs">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block leading-tight">
                Filtered Revenue
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-emerald-400 font-mono">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-semibold text-slate-300 font-mono">
                  {filtered.length} Bills
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar with all required filters (Dark Slate Surface) */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Invoice #, guest name, table..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-slate-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="all" className="bg-[#0f172a] text-slate-200">All Branches</option>
              <option value="main" className="bg-[#0f172a] text-slate-200">Main Branch</option>
              <option value="city" className="bg-[#0f172a] text-slate-200">City Branch</option>
              <option value="beach" className="bg-[#0f172a] text-slate-200">Beach Road Branch</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="All" className="bg-[#0f172a] text-slate-200">All Dates</option>
              <option value="Today" className="bg-[#0f172a] text-slate-200">Today (07 Sep)</option>
              <option value="Yesterday" className="bg-[#0f172a] text-slate-200">Yesterday</option>
              <option value="This Week" className="bg-[#0f172a] text-slate-200">This Week</option>
              <option value="This Month" className="bg-[#0f172a] text-slate-200">This Month</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="All" className="bg-[#0f172a] text-slate-200">All Payments</option>
              <option value="upi" className="bg-[#0f172a] text-slate-200">UPI</option>
              <option value="cash" className="bg-[#0f172a] text-slate-200">Cash</option>
              <option value="card" className="bg-[#0f172a] text-slate-200">Card</option>
              <option value="split" className="bg-[#0f172a] text-slate-200">Split</option>
            </select>

            {/* Order Type Filter */}
            <select
              value={orderTypeFilter}
              onChange={e => setOrderTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="All" className="bg-[#0f172a] text-slate-200">All Types</option>
              <option value="dine_in" className="bg-[#0f172a] text-slate-200">Dine-in</option>
              <option value="takeaway" className="bg-[#0f172a] text-slate-200">Takeaway</option>
              <option value="parcel" className="bg-[#0f172a] text-slate-200">Parcel</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="All" className="bg-[#0f172a] text-slate-200">All Status</option>
              <option value="paid" className="bg-[#0f172a] text-slate-200">PAID</option>
              <option value="cancelled" className="bg-[#0f172a] text-slate-200">VOIDED / CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table Grid (Dark Slate Surface) */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Order Type</th>
                <th className="py-3 px-4">Table / Guest</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map(bill => (
                <tr 
                  key={bill.id} 
                  className="bg-[#0f172a] hover:bg-slate-800/60 border-b border-slate-800 text-slate-200 transition-colors group cursor-pointer"
                  onClick={() => openBillDetailsModal(bill)}
                >
                  <td className="py-3.5 px-4 font-bold text-white">
                    {bill.billNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{bill.date}</div>
                    <div className="text-[10px] text-slate-400">{bill.time}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {bill.branchName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800/80 font-medium text-slate-300 text-[11px] border border-slate-700">
                      {bill.orderType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {bill.tableNumber ? (
                      <span className="font-bold text-white">{bill.tableNumber}</span>
                    ) : (
                      <span className="text-slate-300">{bill.customerName || 'Takeaway'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {bill.items.length} items
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                    ₹{bill.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold uppercase text-[11px] text-slate-300">
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {bill.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800">
                        <Ban className="w-3 h-3" />
                        VOIDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        PAID
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openBillDetailsModal(bill)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="View Full Bill Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => openReceiptModal(bill)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Print Thermal Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs bg-[#0f172a]">
            No bills match the selected filters or search query.
          </div>
        )}
      </div>
    </div>
  );
};
