import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { WaiterCategorySidebar } from './WaiterCategorySidebar';
import { WaiterItemCard } from './WaiterItemCard';
import { WaiterCart } from './WaiterCart';
import { Search, X, Sparkles } from 'lucide-react';

export const WaiterPOSView: React.FC = () => {
  const {
    menuItems,
    categories,
    cart,
    addToCart,
    updateCartQuantity,
    cartTableNumber,
    setCartTableNumber,
    kots,
    currentBranch,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Safe category list
  const safeCategories = useMemo<string[]>(() => {
    if (categories && Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    const dynamic = Array.from(new Set((menuItems || []).map(i => i.category).filter(Boolean)));
    return ['All', ...dynamic];
  }, [categories, menuItems]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (menuItems || []).forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchDiet =
        dietaryFilter === 'all' ||
        (dietaryFilter === 'veg' && item.isVeg) ||
        (dietaryFilter === 'non-veg' && !item.isVeg);
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDiet && matchSearch;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  // Active unbilled KOTs for current table
  const activeSessionKots = useMemo(() => {
    if (!cartTableNumber) return [];
    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    return kots.filter(
      k =>
        k.branchId === effectiveBranch &&
        k.orderType === 'dine_in' &&
        k.tableNumber?.toLowerCase() === cartTableNumber.toLowerCase() &&
        !k.isBilled &&
        k.status !== 'cancelled'
    );
  }, [kots, currentBranch, cartTableNumber]);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden select-none bg-[#080d1a]">
      {/* 1. Category Navigation (Left) */}
      <WaiterCategorySidebar
        categories={safeCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        totalItems={(menuItems || []).length}
      />

      {/* 2. Menu Items & Search (Middle) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#080d1a] border-r border-slate-800">
        {/* Search & Dietary Filters Bar */}
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search dish or category..."
                className="w-full pl-9 pr-8 py-2 bg-[#111a2e] hover:bg-[#131d36] border border-slate-700 focus:bg-[#111a2e] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Veg / Non-Veg Quick Segment */}
            <div className="flex items-center gap-1 bg-[#111a2e] p-1 rounded-lg border border-slate-700 shrink-0 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  dietaryFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                ● Veg
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                ▲ Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 bg-[#080d1a]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map(item => {
              const cartEntry = (cart || []).find(c => c.item.id === item.id);
              const inCartQty = cartEntry ? cartEntry.quantity : 0;

              return (
                <WaiterItemCard
                  key={item.id}
                  item={item}
                  inCartQty={inCartQty}
                  onAdd={() => addToCart(item, 1)}
                  onIncrement={() => updateCartQuantity(item.id, 1)}
                  onDecrement={() => updateCartQuantity(item.id, -1)}
                />
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-mono">
              <p className="text-sm">No dishes matched your filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setDietaryFilter('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Waiter Order Panel / Cart (Right) */}
      <WaiterCart
        tableNumber={cartTableNumber}
        onTableChange={setCartTableNumber}
        activeSessionKots={activeSessionKots}
      />
    </div>
  );
};
