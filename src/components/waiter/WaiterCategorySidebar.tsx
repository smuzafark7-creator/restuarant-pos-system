import React from 'react';
import { Utensils } from 'lucide-react';

export interface WaiterCategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  totalItems: number;
}

export const WaiterCategorySidebar: React.FC<WaiterCategorySidebarProps> = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  totalItems = 0,
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <aside
      id="waiter-menu-categories-sidebar"
      className="w-44 sm:w-48 xl:w-52 bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none h-full overflow-hidden"
    >
      {/* Category Header */}
      <div className="p-3 border-b border-slate-800 bg-[#0f172a] shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-300">
            Menu Categories
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            {totalItems} Items
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
        {safeCategories.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'All' ? totalItems : (categoryCounts[cat] || 0);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`w-full relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 ease-in-out cursor-pointer group text-left ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-xs border border-emerald-500'
                  : 'bg-slate-900/40 text-slate-300 font-medium border border-slate-800/70 hover:bg-slate-800/70 hover:text-white hover:border-slate-700'
              }`}
            >
              {/* Active visual indicator */}
              {isSelected && (
                <div className="absolute left-1 top-2 bottom-2 w-1 bg-white rounded-full" />
              )}
              <span className={`truncate ${isSelected ? 'pl-1.5' : ''}`}>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-800 text-emerald-100 border border-emerald-400/40'
                    : 'bg-slate-800/90 text-slate-400 border border-slate-700/60 group-hover:bg-slate-800 group-hover:text-slate-200'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-[#0f172a] shrink-0 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="text-slate-500 uppercase">Items in Cat</span>
        <span className="font-bold text-slate-300">
          {selectedCategory === 'All' ? totalItems : (categoryCounts[selectedCategory] || 0)}
        </span>
      </div>
    </aside>
  );
};
