import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const ThermalReceiptModal: React.FC = () => {
  const { activeReceiptBill, isReceiptModalOpen, closeReceiptModal, showToast } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isReceiptModalOpen || !activeReceiptBill) return null;

  const branchObj = BRANCHES.find(b => b.id === activeReceiptBill.branchId) || BRANCHES[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text receipt file download
    const lines = [
      '==========================================',
      '           ZAFFRAN RESTAURANT             ',
      `         ${branchObj.name.toUpperCase()}  `,
      `  ${branchObj.address} `,
      `  Phone: ${branchObj.phone} `,
      `  GSTIN: ${branchObj.gstin} `,
      '==========================================',
      `TAX INVOICE: #${activeReceiptBill.billNumber}`,
      `Date: ${activeReceiptBill.date}   Time: ${activeReceiptBill.time}`,
      `Order Type: ${activeReceiptBill.orderType.toUpperCase()}${activeReceiptBill.tableNumber ? ' | ' + activeReceiptBill.tableNumber : ''}`,
      activeReceiptBill.customerName ? `Guest: ${activeReceiptBill.customerName}` : '',
      '------------------------------------------',
      'Item                     Qty   Rate    Amt',
      '------------------------------------------',
      ...activeReceiptBill.items.map(i => {
        const nameCol = i.name.slice(0, 22).padEnd(22);
        const qtyCol = String(i.quantity).padStart(3);
        const rateCol = String(i.rate).padStart(6);
        const amtCol = String(i.amount).padStart(7);
        return `${nameCol} ${qtyCol} ${rateCol} ${amtCol}`;
      }),
      '------------------------------------------',
      `Subtotal:                         ₹${activeReceiptBill.subtotal}`,
      `CGST (2.5%):                      ₹${(activeReceiptBill.gstAmount / 2).toFixed(2)}`,
      `SGST (2.5%):                      ₹${(activeReceiptBill.gstAmount / 2).toFixed(2)}`,
      activeReceiptBill.discountAmount ? `Discount:                       - ₹${activeReceiptBill.discountAmount}` : '',
      '==========================================',
      `GRAND TOTAL:                     ₹${activeReceiptBill.grandTotal}`,
      `PAYMENT STATUS: PAID via ${activeReceiptBill.paymentMethod.toUpperCase()}`,
      activeReceiptBill.paymentMethod === 'split' && activeReceiptBill.splitDetails ? 
        `[Cash: ₹${activeReceiptBill.splitDetails.cash} | UPI: ₹${activeReceiptBill.splitDetails.upi} | Card: ₹${activeReceiptBill.splitDetails.card}]` : '',
      '==========================================',
      '       Thank you for dining with us!      ',
      '              Please visit again           ',
      '=========================================='
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReceiptBill.billNumber}_Receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Receipt Downloaded', `Saved receipt as ${activeReceiptBill.billNumber}_Receipt.txt`);
  };

  const cgst = (activeReceiptBill.gstAmount / 2).toFixed(2);
  const sgst = (activeReceiptBill.gstAmount / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-sm">Thermal Receipt Preview (80mm)</span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 bg-neutral-100 flex justify-center max-h-[70vh] overflow-y-auto">
          {/* Thermal Paper container */}
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="bg-white w-72 sm:w-80 shadow-md p-5 font-mono text-xs text-neutral-800 border-t-4 border-amber-600 relative"
          >
            {/* Cut paper zig-zag top simulation */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-300">
              <h2 className="text-base font-bold tracking-tight text-neutral-900 uppercase">Zaffran Flavours</h2>
              <div className="text-[11px] font-semibold text-neutral-700">{branchObj.name}</div>
              <p className="text-[10px] text-neutral-500 mt-1 leading-tight">{branchObj.address}</p>
              <p className="text-[10px] text-neutral-500">Ph: {branchObj.phone}</p>
              <p className="text-[10px] font-medium text-neutral-600 mt-0.5">GSTIN: {branchObj.gstin}</p>
            </div>

            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Invoice:</span>
                <span className="font-bold text-neutral-900">#{activeReceiptBill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date/Time:</span>
                <span>{activeReceiptBill.date} {activeReceiptBill.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Type:</span>
                <span className="font-semibold uppercase">{activeReceiptBill.orderType.replace('_', ' ')}</span>
              </div>
              {activeReceiptBill.tableNumber && (
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Table:</span>
                  <span>{activeReceiptBill.tableNumber}</span>
                </div>
              )}
              {activeReceiptBill.customerName && (
                <div className="flex justify-between text-neutral-600">
                  <span>Guest:</span>
                  <span>{activeReceiptBill.customerName}</span>
                </div>
              )}
              {activeReceiptBill.kotNumber && (
                <div className="flex justify-between text-neutral-600">
                  <span>KOT Ref:</span>
                  <span className="font-semibold text-neutral-800">{activeReceiptBill.kotNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>Cashier:</span>
                <span>{activeReceiptBill.cashierName || 'Cashier'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-neutral-300">
              <div className="grid grid-cols-12 font-bold text-[10px] text-neutral-500 mb-1.5 pb-1 border-b border-neutral-200">
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-right">RATE</span>
                <span className="col-span-2 text-right">AMT</span>
              </div>
              <div className="space-y-1.5">
                {activeReceiptBill.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[11px]">
                    <div className="col-span-6 truncate text-neutral-900 flex items-center gap-1">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="text-[9px] font-bold text-neutral-500 shrink-0">
                        ({item.serveType === 'PARCEL' ? 'Parcel' : 'Dine-In'})
                      </span>
                    </div>
                    <span className="col-span-2 text-center text-neutral-600">×{item.quantity}</span>
                    <span className="col-span-2 text-right text-neutral-500">₹{item.rate}</span>
                    <span className="col-span-2 text-right font-semibold text-neutral-900">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{activeReceiptBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>CGST (2.5%)</span>
                <span>₹{cgst}</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[10px]">
                <span>SGST (2.5%)</span>
                <span>₹{sgst}</span>
              </div>
              {activeReceiptBill.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{activeReceiptBill.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-dashed border-neutral-300 flex justify-between items-baseline font-bold text-sm text-neutral-900">
                <span>GRAND TOTAL</span>
                <span className="text-base">₹{activeReceiptBill.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 text-center">
              <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                PAID VIA {activeReceiptBill.paymentMethod.toUpperCase()}
              </div>
              {activeReceiptBill.paymentMethod === 'split' && activeReceiptBill.splitDetails && (
                <div className="text-[10px] text-neutral-600 mt-1.5 flex justify-center gap-2">
                  {activeReceiptBill.splitDetails.cash > 0 && <span>Cash: ₹{activeReceiptBill.splitDetails.cash}</span>}
                  {activeReceiptBill.splitDetails.upi > 0 && <span>UPI: ₹{activeReceiptBill.splitDetails.upi}</span>}
                  {activeReceiptBill.splitDetails.card > 0 && <span>Card: ₹{activeReceiptBill.splitDetails.card}</span>}
                </div>
              )}
            </div>

            {/* Barcode representation */}
            <div className="pt-3 pb-1 text-center">
              <div className="flex justify-center items-center gap-0.5 h-7 mb-1 opacity-75">
                {[2, 4, 1, 3, 2, 5, 1, 4, 3, 2, 1, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 2, 1].map((w, idx) => (
                  <div key={idx} className="bg-neutral-800 h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <p className="text-[9px] text-neutral-400">*{activeReceiptBill.billNumber}*</p>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 text-[10px] text-neutral-500">
              <p className="font-semibold text-neutral-700">Thank you for visiting Zaffran!</p>
              <p className="mt-0.5">Please scan QR on your table for feedback.</p>
              <p className="text-[8px] text-neutral-400 mt-2">Powered by Zaffran Restaurant POS</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={closeReceiptModal}
              className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
