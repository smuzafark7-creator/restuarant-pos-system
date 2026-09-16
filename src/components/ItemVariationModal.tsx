import React, { useState, useEffect } from 'react';
import { MenuItem, ItemVariation } from '../types';
import { X, Check } from 'lucide-react';

export interface ItemVariationModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem, selectedVariation: ItemVariation) => void;
}

/**
 * Item Variation Selection Modal
 * Dark system theme with dynamic price sync in the header and confirmation button,
 * high-contrast emerald selection states, and top-right checkmark badges.
 */
export const ItemVariationModal: React.FC<ItemVariationModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [selectedVariationId, setSelectedVariationId] = useState<string>('');

  useEffect(() => {
    if (item && item.variations && item.variations.length > 0) {
      setSelectedVariationId(item.variations[0].id);
    }
  }, [item]);

  if (!isOpen || !item || !item.variations || item.variations.length === 0) {
    return null;
  }

  // Find currently selected variation with fallback to the first variation
  const selectedVariation =
    item.variations.find(v => v.id === selectedVariationId) || item.variations[0];

  // Dynamic price based on active variation
  const currentPrice = selectedVariation ? selectedVariation.price : item.price;

  const handleSave = () => {
    if (selectedVariation) {
      onSave(item, selectedVariation);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#161B26] border border-white/10 rounded-2xl shadow-2xl text-white p-6 flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar with Dynamic Price Update */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="text-white font-bold text-base tracking-tight flex items-center gap-2">
              <span>{item.name}</span>
              <span className="text-gray-500 font-normal">•</span>
              <span className="text-emerald-400 font-semibold transition-all">
                ₹{currentPrice}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Variation Selection Area */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Select Portion / Variation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
              {item.variations.map(variation => {
                const isSelected = selectedVariation?.id === variation.id;
                return (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => setSelectedVariationId(variation.id)}
                    className={`relative py-3.5 px-4 rounded-xl text-center flex flex-col justify-center items-center transition-all duration-150 ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-950/40 text-white shadow-lg shadow-emerald-950/50 scale-[1.03]'
                        : 'bg-[#1E2433] border border-white/10 text-gray-300 hover:border-emerald-500/50 hover:bg-[#252C3E] cursor-pointer'
                    }`}
                  >
                    {/* Green checkmark badge at top-right of selected card */}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/60 ring-2 ring-[#161B26]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <span className="text-sm font-bold truncate w-full">{variation.name}</span>
                    <span className="text-emerald-400 font-semibold text-xs mt-1">
                      ₹{variation.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Right Action Footer with Dynamic Button Price */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-white/10 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-white/10 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl px-6 py-2.5 shadow-md shadow-emerald-900/30 text-sm flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item (₹{currentPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemVariationModal;
