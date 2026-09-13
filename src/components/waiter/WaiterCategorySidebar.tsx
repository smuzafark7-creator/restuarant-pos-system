import React from 'react';

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
      className="w-48 sm:w-52 xl:w-56 bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none h-full sticky top-0 overflow-hidden font-sans z-10"
    >
      {/* Category Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#0f172a] shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Categories
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            {totalItems} Items
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 sidebar-scrollbar">
        {safeCategories.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'All' ? totalItems : (categoryCounts[cat] || 0);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`group w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-sm transition-all duration-[180ms] ease-in-out cursor-pointer text-left border-[1.5px] ${
                isSelected
                  ? 'bg-[#10B981] text-white font-bold border-[#10B981] shadow-[0_4px_14px_rgba(16,185,129,0.4)]'
                  : 'bg-[#1A202C] text-[#E2E8F0] font-semibold border-[rgba(255,255,255,0.14)] hover:bg-[#242E42] hover:border-[rgba(16,185,129,0.6)] hover:text-white hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(16,185,129,0.18)]'
              }`}
            >
              <span className="truncate">{cat}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#064E3B] text-white border border-emerald-500/30'
                    : 'bg-[#2D3748] border border-[rgba(255,255,255,0.1)] text-[#94A3B8] group-hover:text-white group-hover:border-[rgba(16,185,129,0.4)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-[#0f172a] text-[10px] text-slate-400 text-center shrink-0">
        Order Taking Mode
      </div>
    </aside>
  );
};
