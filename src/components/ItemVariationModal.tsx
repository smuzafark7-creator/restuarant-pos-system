import React, { useState, useEffect } from 'react';
import { MenuItem, ItemVariation } from '../types';

export interface ItemVariationModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem, selectedVariation: ItemVariation) => void;
}

/**
 * Petpooja-style Item Variation Selection Modal
 * Displays an exact centered white dialog with item name, base price,
 * variation buttons (red when selected, dark charcoal when unselected),
 * and bottom-right action buttons (Cancel / Save).
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

  const handleSave = () => {
    const selected = item.variations?.find(v => v.id === selectedVariationId) || item.variations?.[0];
    if (selected) {
      onSave(item, selected);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 select-none"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[92vw] bg-white rounded-lg shadow-xl p-5 flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="text-slate-900 font-semibold text-base">
              {item.name} | ₹{item.price}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-lg cursor-pointer leading-none p-1 rounded transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Variation Selection Area */}
          <div>
            <div className="text-xs font-medium text-slate-600 mb-2">
              Variation
            </div>
            <div className="flex flex-wrap gap-3 my-2">
              {item.variations.map(variation => {
                const isSelected = selectedVariationId === variation.id;
                return (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => setSelectedVariationId(variation.id)}
                    className={`min-w-[110px] py-2.5 px-3 rounded text-center flex flex-col justify-center items-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#dc2626] text-white shadow-sm'
                        : 'bg-[#334155] hover:bg-[#1e293b] text-slate-100'
                    }`}
                  >
                    <span className="text-xs font-medium">{variation.name}</span>
                    <span className="text-xs font-bold mt-0.5">₹{variation.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Right Action Footer */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-700 hover:bg-slate-100 px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-1.5 rounded text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemVariationModal;
