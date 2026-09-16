import React from 'react';
import { MenuItem } from '../../types';
import { Plus, Minus, Ban } from 'lucide-react';

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
  const isSoldOut = !item.available || item.stockStatus === 'sold_out' || (item.stockStatus === 'few_left' && (item.stockCount ?? 0) <= 0);

  return (
    <div
      onClick={() => {
        if (!isSoldOut) onAdd(item);
      }}
      className={`p-3 rounded-2xl flex flex-col justify-between relative select-none transition-all duration-200 ease-out ${
        isSoldOut
          ? 'border border-red-500/20 bg-slate-900/60 opacity-60 pointer-events-none cursor-not-allowed'
          : inCartQty > 0
          ? 'cursor-pointer border-2 border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
          : 'cursor-pointer border border-emerald-500/40 bg-slate-900/60 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-slate-900/80'
      }`}
    >
      <div>
        {/* Dish Title with standard Veg / Non-Veg dot indicator */}
        <div className="flex items-start gap-2">
          <span
            className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 mt-0.5 ${
              item.isVeg ? 'border-emerald-600/50 bg-emerald-950/30' : 'border-rose-600/50 bg-rose-950/30'
            }`}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            {item.isVeg ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-[2px] bg-rose-400" />
            )}
          </span>

          <span className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
            isSoldOut ? 'text-slate-400 line-through' : 'text-white group-hover:text-slate-200'
          }`}>
            {item.name}
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-2 pt-1.5 flex items-center justify-between">
          <div className={`text-sm font-bold ${isSoldOut ? 'text-slate-500' : 'text-emerald-400'}`}>
            ₹{item.price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Action Row: Disabled Sold Out vs Emerald Green + Add button or Stepper */}
      <div className="mt-2.5 pt-2 border-t border-slate-800">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="w-full bg-red-950/30 border border-red-900/30 text-red-400 py-1 px-3 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
            title="Item marked sold out by kitchen"
          >
            <Ban className="w-3.5 h-3.5 text-red-400" />
            <span>Sold Out</span>
          </button>
        ) : inCartQty > 0 ? (
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              className="flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors border bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer flex items-center justify-center"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold text-xs min-w-7 text-center">
              {inCartQty}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              className="flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors border bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500/30 cursor-pointer flex items-center justify-center shadow-xs"
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
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium border border-emerald-500/30 shadow-md shadow-emerald-950/40 py-1 px-3 text-xs rounded-lg transition-all flex items-center justify-center cursor-pointer select-none"
            title="Add item to bill"
          >
            <span>+ Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
