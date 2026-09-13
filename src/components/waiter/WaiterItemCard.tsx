import React from 'react';
import { MenuItem } from '../../types';
import { Plus, Minus, Flame, Ban, AlertTriangle } from 'lucide-react';

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
  const isFewLeft = !isSoldOut && item.stockStatus === 'few_left' && (item.stockCount ?? 0) > 0;

  return (
    <div
      onClick={() => {
        if (!isSoldOut) onAdd(item);
      }}
      className={`p-3.5 rounded-xl border-[1.5px] transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col justify-between min-h-[175px] relative select-none ${
        isSoldOut
          ? 'bg-[#161B26] border-rose-900/40 opacity-75 cursor-not-allowed'
          : `cursor-pointer hover:-translate-y-[3px] active:-translate-y-[1px] hover:shadow-[0_8px_20px_-2px_rgba(16,185,129,0.35)] hover:border-[#10B981] ${
              inCartQty > 0
                ? 'bg-[#161B26] hover:bg-[#1F2637] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-[#161B26] hover:bg-[#1F2637] border-[rgba(255,255,255,0.12)]'
            }`
      }`}
    >
      <div>
        {/* Top Header Row: Badges (Popular, Low Stock Warning, Sold Out, In-Cart) */}
        <div className="flex items-center justify-between min-h-[22px] mb-2 gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isSoldOut ? (
              <span className="bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-1">
                <Ban className="w-3 h-3 text-rose-400" />
                SOLD OUT
              </span>
            ) : isFewLeft ? (
              <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Only {item.stockCount} Left
              </span>
            ) : item.popular ? (
              <span className="bg-amber-950/40 text-amber-400 border border-amber-800/40 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                POPULAR
              </span>
            ) : (
              <div />
            )}
          </div>

          {inCartQty > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
              {inCartQty} in Cart
            </span>
          )}
        </div>

        {/* Dish Title with standard Veg / Non-Veg indicator */}
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

        {/* Description snippet */}
        {item.description && (
          <div className="text-xs mt-1 text-slate-400 line-clamp-1 pl-6">
            {item.description}
          </div>
        )}

        {/* Price Row */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className={`text-sm font-bold ${isSoldOut ? 'text-slate-500' : 'text-emerald-400'}`}>
            ₹{item.price.toFixed(2)}
          </div>
          {isFewLeft && (
            <span className="text-[10px] text-amber-400 font-semibold">
              Kitchen: {item.stockCount} plates
            </span>
          )}
        </div>
      </div>

      {/* Action Row: Disabled Sold Out vs Minimal Dark Slate + Add button or Stepper */}
      <div className="mt-3 pt-2 border-t border-slate-800">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="w-full bg-rose-950/40 text-rose-400 border border-rose-800/40 py-1 px-3 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
            title="Item marked sold out by kitchen"
          >
            <Ban className="w-3.5 h-3.5 text-rose-400" />
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
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold text-xs min-w-8 text-center">
              {inCartQty}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              className="flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 cursor-pointer flex items-center justify-center shadow-xs"
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
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1 px-3 text-xs rounded-lg font-medium transition-colors flex items-center justify-center cursor-pointer"
            title="Add item to bill"
          >
            <span>+ Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
