import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, MenuCategory } from '../types';
import { 
  Utensils, 
  Search, 
  Plus, 
  Edit, 
  Check, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Percent, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';

export const MenuManagementPage: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, toggleMenuItemAvailability } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('Biryani');
  const [formPrice, setFormPrice] = useState<number>(250);
  const [formGstRate, setFormGstRate] = useState<number>(5);
  const [formIsVeg, setFormIsVeg] = useState<boolean>(false);
  const [formDescription, setFormDescription] = useState<string>('');

  const categories: string[] = [
    'All',
    'Biryani',
    'Starters',
    'Main Course',
    'Breads',
    'Rice',
    'Beverages',
    'Desserts'
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Biryani');
    setFormPrice(250);
    setFormGstRate(5);
    setFormIsVeg(false);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormGstRate(item.gstRate);
    setFormIsVeg(item.isVeg);
    setFormDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        price: formPrice,
        gstRate: formGstRate,
        isVeg: formIsVeg,
        description: formDescription.trim() || undefined
      });
    } else {
      addMenuItem({
        name: formName.trim(),
        category: formCategory,
        price: formPrice,
        gstRate: formGstRate,
        isVeg: formIsVeg,
        available: true,
        description: formDescription.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-mono">Menu Catalog & Price Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure dishes, prices, categories, and live availability across kitchen stations
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3 font-mono">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items by dish name or category..."
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors font-mono ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Food Type</th>
                <th className="py-3 px-4 text-right">Price (₹)</th>
                <th className="py-3 px-4 text-center">GST Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-slate-400 font-normal pl-4 truncate max-w-sm">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {item.isVeg ? (
                      <span className="text-emerald-700 font-medium text-[11px]">Vegetarian</span>
                    ) : (
                      <span className="text-rose-700 font-medium text-[11px]">Non-Veg</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    ₹{item.price}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {item.gstRate}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleMenuItemAvailability(item.id)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors border ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {item.available ? 'AVAILABLE' : 'DISABLED'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            No menu items found.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Chicken Tikka Masala"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as MenuCategory)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white font-mono"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={formGstRate}
                    onChange={e => setFormGstRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dietary Type</label>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(true)}
                      className={`flex-1 py-1 rounded text-xs font-semibold border ${
                        formIsVeg ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(false)}
                      className={`flex-1 py-1 rounded text-xs font-semibold border ${
                        !formIsVeg ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Ingredients or preparation note..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
