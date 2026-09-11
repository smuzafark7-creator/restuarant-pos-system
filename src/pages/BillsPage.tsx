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
  Utensils
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
      const matchStatus = statusFilter === 'All' || statusFilter === 'paid';

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
    return filtered.reduce((sum, b) => sum + b.grandTotal, 0);
  }, [filtered]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-mono">Bills & Invoices Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete billing register, tax receipts archive, and settled customer accounts
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
              Filtered Revenue
            </span>
            <span className="text-lg font-bold text-slate-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            {filtered.length} Bills
          </div>
        </div>
      </div>

      {/* Filter Bar with all required filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 font-mono">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Invoice #, guest name, table..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="main">Main Branch</option>
              <option value="city">City Branch</option>
              <option value="beach">Beach Road Branch</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today (07 Sep)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Payments</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="split">Split</option>
            </select>

            {/* Order Type Filter */}
            <select
              value={orderTypeFilter}
              onChange={e => setOrderTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="dine_in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
              <option value="parcel">Parcel</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="paid">PAID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.map(bill => (
                <tr 
                  key={bill.id} 
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => openBillDetailsModal(bill)}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {bill.billNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{bill.date}</div>
                    <div className="text-[10px] text-slate-400">{bill.time}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {bill.branchName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[11px] border border-slate-200">
                      {bill.orderType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {bill.tableNumber ? (
                      <span className="font-bold text-slate-900">{bill.tableNumber}</span>
                    ) : (
                      <span className="text-slate-600">{bill.customerName || 'Takeaway'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {bill.items.length} items
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                    ₹{bill.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold uppercase text-[11px] text-slate-700">
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openBillDetailsModal(bill)}
                        className="px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="View Full Bill Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => openReceiptModal(bill)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors text-[11px] font-semibold flex items-center gap-1"
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
          <div className="p-12 text-center text-slate-400 text-xs">
            No bills match the selected filters or search query.
          </div>
        )}
      </div>
    </div>
  );
};
