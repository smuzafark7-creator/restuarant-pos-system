import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, ItemVariation } from '../../types';
import { WaiterCategorySidebar } from './WaiterCategorySidebar';
import { WaiterItemCard } from './WaiterItemCard';
import { WaiterCart } from './WaiterCart';
import { ItemVariationModal } from '../ItemVariationModal';
import { Search, X } from 'lucide-react';

export const WaiterPOSView: React.FC = () => {
  const {
    menuItems,
    categories,
    cart,
    addToCart,
    updateCartQuantity,
    cartTableNumber,
    setCartTableNumber,
    cartOrderType,
    setCartOrderType,
    kots,
    currentBranch,
  } = useApp();

  // Ensure waiter POS operates in dine_in mode for tables
  useEffect(() => {
    if (cartOrderType !== 'dine_in') {
      setCartOrderType('dine_in');
    }
  }, [cartOrderType, setCartOrderType]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [variationModalItem, setVariationModalItem] = useState<MenuItem | null>(null);

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

  // Active unbilled KOTs for current table, sorted chronologically (oldest first, newest after)
  const activeSessionKots = useMemo(() => {
    if (!cartTableNumber) return [];
    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/^t\s*/, 'table ');
    const cartNorm = norm(cartTableNumber);
    const cartDigits = cartTableNumber.replace(/[^0-9]/g, '');

    return kots
      .filter(
        k => {
          if (k.branchId !== effectiveBranch) return false;
          if (k.orderType !== 'dine_in') return false;
          if (k.isBilled || k.status === 'cancelled') return false;
          if (!k.tableNumber) return false;
          const kNorm = norm(k.tableNumber);
          const kDigits = k.tableNumber.replace(/[^0-9]/g, '');
          return kNorm === cartNorm || (Boolean(cartDigits) && kDigits === cartDigits);
        }
      )
      .sort((a, b) => {
        const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        return (a.kotNumber || '').localeCompare(b.kotNumber || '');
      });
  }, [kots, currentBranch, cartTableNumber]);

  const handleItemClick = (item: MenuItem) => {
    if (item.variations && item.variations.length > 0) {
      setVariationModalItem(item);
    } else {
      addToCart(item, 1);
    }
  };

  const handleSaveVariation = (baseItem: MenuItem, selectedVariation: ItemVariation) => {
    const variantItem: MenuItem = {
      ...baseItem,
      id: `${baseItem.id}_${selectedVariation.id}`,
      name: `${baseItem.name} (${selectedVariation.name})`,
      price: selectedVariation.price,
    };
    addToCart(variantItem, 1);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden select-none bg-[#080d1a] font-sans">
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
                className="w-full pl-9 pr-8 py-2 bg-[#080d1a] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dietary filter pills */}
            <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-lg border border-slate-800 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setDietaryFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  dietaryFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('veg')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Veg
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 bg-[#080d1a]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map(item => {
              const matchingCartItems = (cart || []).filter(
                c => c.item.id === item.id || c.item.id.startsWith(`${item.id}_`)
              );
              const inCartQty = matchingCartItems.reduce((acc, c) => acc + c.quantity, 0);

              return (
                <WaiterItemCard
                  key={item.id}
                  item={item}
                  inCartQty={inCartQty}
                  onAdd={() => handleItemClick(item)}
                  onIncrement={() => {
                    if (item.variations && item.variations.length > 0) {
                      handleItemClick(item);
                    } else {
                      updateCartQuantity(item.id, 1);
                    }
                  }}
                  onDecrement={() => {
                    if (item.variations && item.variations.length > 0) {
                      if (matchingCartItems.length > 0) {
                        updateCartQuantity(matchingCartItems[matchingCartItems.length - 1].item.id, -1);
                      }
                    } else {
                      updateCartQuantity(item.id, -1);
                    }
                  }}
                />
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <p className="text-sm">No dishes found matching selection.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setDietaryFilter('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Waiter Cart / Active Table Session (Right) */}
      <WaiterCart
        tableNumber={cartTableNumber}
        onTableChange={setCartTableNumber}
        activeSessionKots={activeSessionKots}
      />

      {/* Petpooja Item Variation Modal */}
      <ItemVariationModal
        isOpen={!!variationModalItem}
        item={variationModalItem}
        onClose={() => setVariationModalItem(null)}
        onSave={handleSaveVariation}
      />
    </div>
  );
};
