import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  X,
  History,
  Edit2,
  Printer,
  Receipt
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, bills, openReceiptModal } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer form state
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [favoriteBranch, setFavoriteBranch] = useState<string>('Main Branch');

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editMobile, setEditMobile] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editFavoriteBranch, setEditFavoriteBranch] = useState<string>('Main Branch');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.mobile || '').includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    addCustomer({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      favoriteBranch
    });

    setName('');
    setMobile('');
    setEmail('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(cust);
    setEditName(cust.name);
    setEditMobile(cust.mobile);
    setEditEmail(cust.email || '');
    setEditFavoriteBranch(cust.favoriteBranch);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim() || !editMobile.trim()) return;

    updateCustomer({
      ...editingCustomer,
      name: editName.trim(),
      mobile: editMobile.trim(),
      email: editEmail.trim() || undefined,
      favoriteBranch: editFavoriteBranch
    });

    setEditingCustomer(null);
  };

  // Bills for selected customer
  const customerBills = useMemo(() => {
    if (!selectedCustomer) return [];
    return bills.filter(
      b => b.customerMobile === selectedCustomer.mobile || (b.customerName && b.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    );
  }, [selectedCustomer, bills]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Customer Directory & Loyalty</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Registered diner profiles, visit logs, total spend, and contact management
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or 10-digit mobile number..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Frequent Branch</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCustomers.map(cust => (
                <tr 
                  key={cust.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCustomer(cust)}
                >
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div>{cust.name}</div>
                      {cust.email && <div className="text-[10px] text-slate-400 font-normal">{cust.email}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">
                    {cust.mobile}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {cust.favoriteBranch}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {cust.totalOrders}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    ₹{cust.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {cust.lastVisit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEdit(cust, e)}
                        className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors"
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No customers found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add New Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Preferred Branch</label>
                <select
                  value={favoriteBranch}
                  onChange={e => setFavoriteBranch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Main Branch">Main Branch (MG Road)</option>
                  <option value="City Branch">City Branch (Jayanagar)</option>
                  <option value="Beach Road Branch">Beach Road Branch (Promenade)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Customer: {editingCustomer.name}</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={editMobile}
                  onChange={e => setEditMobile(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Preferred Branch</label>
                <select
                  value={editFavoriteBranch}
                  onChange={e => setEditFavoriteBranch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Main Branch">Main Branch (MG Road)</option>
                  <option value="City Branch">City Branch (Jayanagar)</option>
                  <option value="Beach Road Branch">Beach Road Branch (Promenade)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Orders History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Customer Profile & Visit History</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h4>
                  <div className="text-slate-600 mt-0.5">{selectedCustomer.mobile} {selectedCustomer.email ? `• ${selectedCustomer.email}` : ''}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Frequent Branch: {selectedCustomer.favoriteBranch}</div>
                </div>
                <button
                  onClick={() => handleOpenEdit(selectedCustomer)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Total Visits</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedCustomer.totalOrders}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Total Spend</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Last Visit</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{selectedCustomer.lastVisit}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Past Invoices & Bills</h4>
                <div className="space-y-2">
                  {customerBills.map(b => (
                    <div key={b.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{b.billNumber} • {b.tableNumber || b.orderType}</div>
                        <div className="text-[11px] text-slate-500">{b.date} • {b.branchName} • Paid via {b.paymentMethod.toUpperCase()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">₹{b.grandTotal}</span>
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            openReceiptModal(b);
                          }}
                          className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                          title="View Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {customerBills.length === 0 && (
                    <div className="text-slate-400 text-center py-6 text-xs font-sans">
                      No invoices recorded yet for this customer in this session.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
