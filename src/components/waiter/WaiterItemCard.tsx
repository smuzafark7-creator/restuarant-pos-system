import React from 'react';
import { MenuItem } from '../../types';
import { Plus, Minus, Flame, UtensilsCrossed } from 'lucide-react';

export interface WaiterItemCardProps {
  item: MenuItem;
  inCartQty: number;
  onAdd: (item: MenuItem) => void;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
}

export const WaiterItemCard: React.FC<WaiterItemCardProps> = ({
  item,
  inCartQty,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div
      onClick={() => onAdd(item)}
      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[185px] relative group shadow-xs hover:shadow-lg select-none ${
        inCartQty > 0
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-[#111a2e]'
          : 'border-slate-800 hover:border-emerald-500/80 bg-[#0f172a] hover:bg-[#111a2e]'
      }`}
    >
      {/* Top Row: Avatar box + Veg/Non-veg & Badges matching table styling */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors font-mono bg-slate-800 text-white border border-slate-700 shrink-0">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold truncate ${
                item.isVeg
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {item.isVeg ? '● VEG' : '▲ NON-VEG'}
            </span>
          </div>

          {item.popular ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              POPULAR
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {item.category.toUpperCase()}
            </span>
          )}
        </div>

        {/* Item Title */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold font-mono text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {item.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
            {item.category}
          </span>
        </div>

        {/* Description snippet */}
        <div className="flex items-center gap-1 text-[11px] mt-0.5 font-mono text-slate-400">
          {item.description ? (
            <span className="truncate">{item.description}</span>
          ) : (
            <span>Chef's Special Selection</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-emerald-400 font-mono">
            ₹{item.price.toFixed(2)}
          </div>
          {inCartQty > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              {inCartQty} in Order
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Area: Waiter Touch Stepper / Add Button */}
      <div className="mt-3 pt-2 border-t border-slate-800 font-mono">
        {inCartQty > 0 ? (
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[10px]"
          >
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              className="flex-1 py-1 rounded font-bold text-center transition-colors border bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer flex items-center justify-center gap-1"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold font-mono text-xs min-w-6 text-center">
              {inCartQty}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              className="flex-1 py-1 rounded font-bold text-center transition-colors border bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border-slate-700 cursor-pointer flex items-center justify-center gap-1"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onAdd(item);
            }}
            className="w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors border bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border-slate-700 cursor-pointer font-mono shadow-xs"
            title="Add item to waiter order"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
