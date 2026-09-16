import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, X, CheckCircle2, ChefHat, Utensils } from 'lucide-react';
import { BRANCHES } from '../data/mockData';
import { Bill, KOT, BillItem } from '../types';

interface ConsolidatedItem {
  id: string;
  name: string;
  cleanName: string;
  quantity: number;
  rate: number;
  amount: number;
  serveType?: string;
}

export const ThermalReceiptModal: React.FC = () => {
  const { 
    activeReceiptBill, 
    isReceiptModalOpen, 
    closeReceiptModal, 
    activeReceiptKOT,
    isKOTModalOpen,
    closeKOTModal,
    showToast 
  } = useApp();

  const printableRef = useRef<HTMLDivElement>(null);

  // 1. BILL CONSOLIDATION & SANITIZATION (Customer Receipt)
  // Compute consolidated items via useMemo BEFORE any conditional returns to respect Rules of Hooks
  const consolidatedBillItems: ConsolidatedItem[] = React.useMemo(() => {
    if (!activeReceiptBill || !activeReceiptBill.items) return [];

    const map = new Map<string, ConsolidatedItem>();

    activeReceiptBill.items.forEach(item => {
      // Strip redundant tags like "(Dine-In)", "(Dine in)", "(Parcel)" from name
      const cleanName = item.name
        .replace(/\s*\((?:Dine-In|Dine\s*In|DineIn)\)/gi, '')
        .replace(/\s*\[(?:Dine-In|Dine\s*In|DineIn)\]/gi, '')
        .trim();

      // Key by clean item name and rate so identical items consolidate cleanly
      const key = `${cleanName.toLowerCase()}_${item.rate}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.quantity += item.quantity;
        existing.amount += item.amount || (item.rate * item.quantity);
      } else {
        map.set(key, {
          id: item.id || key,
          name: item.name,
          cleanName: cleanName || item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount || (item.rate * item.quantity),
          serveType: item.serveType
        });
      }
    });

    return Array.from(map.values());
  }, [activeReceiptBill]);

  // Is this modal currently active?
  const isOpen = isKOTModalOpen || isReceiptModalOpen;
  const isKOTMode = Boolean(isKOTModalOpen && activeReceiptKOT);
  
  if (!isOpen) return null;
  if (isKOTMode && !activeReceiptKOT) return null;
  if (!isKOTMode && !activeReceiptBill) return null;

  const currentBill = activeReceiptBill as Bill;
  const currentKOT = activeReceiptKOT as KOT;

  const branchObj = BRANCHES.find(
    b => b.id === (isKOTMode ? currentKOT.branchId : currentBill.branchId)
  ) || BRANCHES[0];

  // Calculated values for Indian standard receipt
  const calcSubtotal = currentBill ? (currentBill.subtotal || consolidatedBillItems.reduce((acc, item) => acc + item.amount, 0)) : 0;
  const calcCgst = Number(((calcSubtotal * 0.025)).toFixed(2));
  const calcSgst = Number(((calcSubtotal * 0.025)).toFixed(2));
  const calcDiscount = currentBill?.discountAmount || 0;
  // Grand total directly calculated: Sub Total + CGST + SGST - Discount
  const calcGrandTotal = Number((calcSubtotal + calcCgst + calcSgst - calcDiscount).toFixed(2));

  // Helper date formatting: DD/MM/YYYY
  const formattedDate = currentBill?.date 
    ? (currentBill.date.includes('-') 
        ? currentBill.date.split('-').reverse().join('/') 
        : currentBill.date)
    : '15/09/2026';

  const tableDisplay = currentBill?.tableNumber 
    ? currentBill.tableNumber.replace(/^(TABLE\s*)+/i, 'Table ') 
    : (currentBill?.takeawayId || 'Counter');

  const userDisplay = currentBill?.cashierName 
    ? currentBill.cashierName.replace(/\s*\(.*?\)/g, '').trim()
    : 'Anita';

  const stewardDisplay = currentBill?.stewardName || 'Ramesh Patel';

  const handleClose = () => {
    if (isKOTMode) {
      closeKOTModal();
    } else {
      closeReceiptModal();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // 2. TEXT DOWNLOAD HANDLERS
  // -------------------------------------------------------------
  const handleDownload = () => {
    if (isKOTMode) {
      // Kitchen KOT slip text export
      const kotNumberClean = currentKOT.kotNumber.startsWith('KOT-') 
        ? currentKOT.kotNumber 
        : `KOT-${currentKOT.kotNumber}`;
      
      const destination = currentKOT.orderType === 'takeaway' || currentKOT.orderType === 'parcel'
        ? (currentKOT.takeawayId || 'TAKEAWAY')
        : (currentKOT.tableNumber?.replace(/^(TABLE\s*)+/i, 'TABLE ') || 'DINE-IN');

      const lines = [
        '========================================',
        '        KITCHEN ORDER TICKET (KOT)      ',
        `               ${branchObj.name.toUpperCase()} `,
        '========================================',
        `TICKET: ${kotNumberClean}`,
        `ORDER TYPE: ${currentKOT.orderType.toUpperCase()}`,
        `DESTINATION: ${destination}`,
        `SERVER: ${currentKOT.serverName || currentKOT.waiterName || 'Staff'}`,
        `TIME: ${currentKOT.timeFormatted || (currentKOT.createdAt ? new Date(currentKOT.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString())}`,
        '----------------------------------------',
        'QTY   ITEM DESCRIPTION',
        '----------------------------------------',
        ...currentKOT.items.filter(i => i.status !== 'voided').flatMap(i => {
          const qtyStr = `[${i.quantity}x]`.padEnd(6);
          const out = [`${qtyStr} ${i.name.toUpperCase()}`];
          if (i.notes) out.push(`       >> NOTE: ${i.notes}`);
          if (i.serveType === 'PARCEL') out.push('       >> ** PACK AS PARCEL **');
          return out;
        }),
        '----------------------------------------',
        currentKOT.specialInstructions ? `SPECIAL CHEF NOTE:\n${currentKOT.specialInstructions}` : '',
        '========================================',
        '           *** CHEF COPY ***            ',
        '========================================'
      ].filter(Boolean).join('\n');

      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kotNumberClean}_Kitchen_Slip.txt`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('KOT Slip Downloaded', `Saved kitchen slip as ${kotNumberClean}_Kitchen_Slip.txt`, 'success');
    } else {
      // Customer Receipt text export - Standard Indian Format
      const invoiceNumberClean = currentBill.billNumber.startsWith('INV-') 
        ? currentBill.billNumber 
        : `INV-${currentBill.billNumber}`;

      const fssaiVal = currentBill.fssaiLicNo || branchObj.fssai || '11223334000128';

      const lines = [
        '---------------------------------',
        '        ZAFFRAN FLAVOURS         ',
        `         ${branchObj.name.toUpperCase()}  `,
        `  ${branchObj.address} `,
        `Contact No: ${branchObj.phone}`,
        `GSTIN: ${branchObj.gstin}`,
        `FSSAI Lic No: ${fssaiVal}`,
        '        ** TAX INVOICE **        ',
        '---------------------------------',
        `Bill No: ${invoiceNumberClean.padEnd(12)} Date: ${formattedDate}`,
        `Tbl No: ${tableDisplay.padEnd(13)} User: ${userDisplay}`,
        `Stw: ${stewardDisplay}`,
        '---------------------------------',
        'Items             Qty  Rate   Amount',
        '---------------------------------',
        ...consolidatedBillItems.map(i => {
          const nameCol = i.cleanName.slice(0, 16).padEnd(17);
          const qtyCol = String(i.quantity).padStart(3);
          const rateCol = i.rate.toFixed(2).padStart(6);
          const amtCol = i.amount.toFixed(2).padStart(8);
          return `${nameCol} ${qtyCol} ${rateCol} ${amtCol}`;
        }),
        '---------------------------------',
        `Sub Total:              ₹${calcSubtotal.toFixed(2).padStart(8)}`,
        `CGST 2.5%:              ₹${calcCgst.toFixed(2).padStart(8)}`,
        `SGST 2.5%:              ₹${calcSgst.toFixed(2).padStart(8)}`,
        currentBill.discountAmount ? `Discount:              -₹${currentBill.discountAmount.toFixed(2).padStart(8)}` : '',
        '=================================',
        `GRAND TOTAL:            ₹${calcGrandTotal.toFixed(2).padStart(8)}`,
        '---------------------------------',
        `PAID VIA ${currentBill.paymentMethod.toUpperCase()}`,
        currentBill.paymentMethod === 'split' && currentBill.splitDetails ? 
          `[Cash: ₹${currentBill.splitDetails.cash} | UPI: ₹${currentBill.splitDetails.upi} | Card: ₹${currentBill.splitDetails.card}]` : '',
        '---------------------------------',
        '  Thank you for dining with us!  ',
        '     Please visit Zaffran again  ',
        '---------------------------------'
      ].filter(Boolean).join('\n');

      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumberClean}_Receipt.txt`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Receipt Downloaded', `Saved receipt as ${invoiceNumberClean}_Receipt.txt`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 text-neutral-900 border border-neutral-200">
        
        {/* Top Header Bar */}
        <div className={`px-5 py-3.5 flex items-center justify-between text-white ${isKOTMode ? 'bg-amber-900' : 'bg-neutral-900'}`}>
          <div className="flex items-center gap-2">
            {isKOTMode ? (
              <>
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-sm">Kitchen Order Ticket (KOT Slip)</span>
              </>
            ) : (
              <>
                <Utensils className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-sm">Customer Receipt (Tax Invoice)</span>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Thermal Preview Area */}
        <div className="p-6 bg-neutral-100 flex justify-center max-h-[70vh] overflow-y-auto">
          
          {/* Printable Thermal Paper Container */}
          <div
            ref={printableRef}
            id="printable-thermal-slip"
            className={`bg-white w-72 sm:w-80 shadow-md font-mono relative ${
              isKOTMode 
                ? 'border-t-4 border-amber-600 p-5 text-xs text-neutral-900' 
                : 'border-t-4 border-black p-4 text-xs text-black'
            }`}
          >
            {isKOTMode ? (
              /* ============================================================== */
              /* TEMPLATE A: KITCHEN ORDER TICKET (KOT SLIP - CHEF ONLY)       */
              /* Zero financial details, bold high-contrast items and notes     */
              /* ============================================================== */
              <div className="space-y-3">
                {/* Header */}
                <div className="text-center pb-2.5 border-b-2 border-dashed border-neutral-800">
                  <span className="inline-block px-2 py-0.5 bg-neutral-900 text-white font-extrabold text-[11px] tracking-wider rounded mb-1">
                    KITCHEN ORDER TICKET
                  </span>
                  <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-900 mt-1">
                    ZAFFRAN FLAVOURS
                  </h2>
                  <div className="text-[10px] font-semibold text-neutral-700">
                    {branchObj.name}
                  </div>
                </div>

                {/* Ticket Meta */}
                <div className="py-2 border-b-2 border-dashed border-neutral-800 space-y-1 text-[11px]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-600 font-semibold">TICKET #:</span>
                    <span className="font-black text-sm text-neutral-950 tracking-wider">
                      {currentKOT.kotNumber.startsWith('KOT-') ? currentKOT.kotNumber : `KOT-${currentKOT.kotNumber}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-600 font-semibold">DESTINATION:</span>
                    <span className="font-black text-sm text-neutral-950 uppercase tracking-wide">
                      {currentKOT.orderType === 'takeaway' || currentKOT.orderType === 'parcel'
                        ? (currentKOT.takeawayId || 'TAKEAWAY / COUNTER')
                        : (currentKOT.tableNumber?.replace(/^(TABLE\s*)+/i, 'TABLE ') || 'DINE-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-600 font-semibold">ORDER TYPE:</span>
                    <span className="font-extrabold uppercase text-neutral-900">
                      {currentKOT.orderType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-600 font-semibold">SERVER / STEWARD:</span>
                    <span className="font-bold text-neutral-900">
                      {currentKOT.serverName || currentKOT.waiterName || 'Staff'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-600 font-semibold">ORDER TIME:</span>
                    <span className="font-bold text-neutral-900">
                      {currentKOT.timeFormatted || (currentKOT.createdAt ? new Date(currentKOT.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString())}
                    </span>
                  </div>
                </div>

                {/* Kitchen Items Body: High-Contrast Bold with QTY and Instructions */}
                <div className="py-2 border-b-2 border-dashed border-neutral-800">
                  <div className="flex justify-between font-black text-[11px] text-neutral-950 pb-1.5 border-b border-neutral-400 mb-2 uppercase tracking-wider">
                    <span>QTY</span>
                    <span>ITEM & INSTRUCTIONS</span>
                  </div>

                  <div className="space-y-3">
                    {currentKOT.items.map((item, idx) => {
                      const isVoided = item.status === 'voided';
                      const cleanItemName = item.name
                        .replace(/\s*\((?:Dine-In|Dine\s*In|DineIn)\)/gi, '')
                        .replace(/\s*\[(?:Dine-In|Dine\s*In|DineIn)\]/gi, '')
                        .trim();

                      return (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2.5 ${isVoided ? 'opacity-40 line-through' : ''}`}
                        >
                          {/* Prominent Quantity Badge */}
                          <div className="w-8 shrink-0 text-center font-black text-base leading-none py-1 bg-neutral-900 text-white rounded">
                            {item.quantity}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-xs leading-snug text-neutral-950 uppercase tracking-tight whitespace-normal break-words">
                              {cleanItemName}
                            </div>

                            {/* Cooking instructions / notes */}
                            {item.notes && (
                              <div className="mt-1 pl-2 border-l-2 border-amber-600 text-[10px] font-bold text-amber-900 italic">
                                Note: {item.notes}
                              </div>
                            )}

                            {/* Parcel Indicator */}
                            {item.serveType === 'PARCEL' && (
                              <div className="mt-0.5 inline-block px-1.5 py-0.2 bg-neutral-800 text-white text-[9px] font-extrabold uppercase rounded">
                                [PACK AS PARCEL]
                              </div>
                            )}

                            {isVoided && (
                              <div className="text-[10px] font-bold text-red-700">
                                ** ITEM VOIDED / CANCELLED **
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chef / Special Note Banner */}
                {(currentKOT.specialInstructions) && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-950 font-bold space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-amber-800 font-extrabold block">
                      CHEF NOTE / TABLE REQUEST:
                    </span>
                    <p className="italic">{currentKOT.specialInstructions}</p>
                  </div>
                )}

                {/* Footer Stamp */}
                <div className="text-center pt-2 text-[10px] font-bold text-neutral-600">
                  <div>*** KITCHEN EXPEDITE COPY ***</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">
                    Printed at: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* TEMPLATE B: CUSTOMER TAX INVOICE (RECEIPT)                    */
              /* Standard Indian Restaurant Receipt: Pure B&W, 80mm mono       */
              /* ============================================================== */
              <div className="space-y-2 text-black font-mono leading-tight">
                {/* 1. Centered Business Branding */}
                <div className="text-center">
                  <h1 className="text-base font-black tracking-wider text-black uppercase">
                    ZAFFRAN FLAVOURS
                  </h1>
                  <div className="text-[11px] font-bold text-black mt-0.5 uppercase">
                    {branchObj.name}
                  </div>
                  <p className="text-[10px] text-black mt-0.5 leading-snug whitespace-normal">
                    {branchObj.address}
                  </p>
                  <p className="text-[10px] text-black font-bold mt-0.5">
                    Contact No: {branchObj.phone}
                  </p>
                  <div className="text-[10px] text-black font-bold mt-0.5">
                    GSTIN: {branchObj.gstin}
                  </div>
                  <div className="text-[10px] text-black font-bold">
                    FSSAI Lic No: {currentBill.fssaiLicNo || branchObj.fssai || '11223334000128'}
                  </div>
                  <div className="text-xs font-black tracking-widest text-black mt-1 uppercase">
                    ** TAX INVOICE **
                  </div>
                </div>

                {/* Dashed horizontal divider line */}
                <div className="text-[11px] tracking-tight overflow-hidden text-center select-none font-bold text-black">
                  ---------------------------------
                </div>

                {/* 1. Invoice Info Grid (clean 2-column key-value alignment) */}
                <div className="text-[11px] font-bold space-y-0.5 text-black">
                  <div className="flex justify-between items-center">
                    <span>
                      Bill No: <span className="font-extrabold">{currentBill.billNumber.startsWith('INV-') ? currentBill.billNumber : `#${currentBill.billNumber}`}</span>
                    </span>
                    <span>
                      Date: <span className="font-normal">{formattedDate}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>
                      Tbl No: <span className="font-normal">{tableDisplay}</span>
                    </span>
                    <span>
                      User: <span className="font-normal">{userDisplay}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>
                      Stw: <span className="font-normal">{stewardDisplay}</span>
                    </span>
                    {currentBill.time && (
                      <span className="text-[10px] font-normal">
                        Time: {currentBill.time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dashed horizontal divider line */}
                <div className="text-[11px] tracking-tight overflow-hidden text-center select-none font-bold text-black">
                  ---------------------------------
                </div>

                {/* 2. LINE ITEMS TABLE (NO KOT DETAILS) */}
                <div>
                  {/* Table Header: Items | Qty | Rate | Amount */}
                  <div className="grid grid-cols-12 text-[11px] font-black pb-1 border-b border-black border-dashed">
                    <span className="col-span-6 text-left">Items</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>

                  {/* Line Items: clean 2nd line wrapping, no KOT references */}
                  <div className="space-y-1.5 pt-1.5">
                    {consolidatedBillItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                        <div className="col-span-6 pr-1 font-bold text-black whitespace-normal break-words leading-tight uppercase">
                          {item.cleanName}
                        </div>
                        <span className="col-span-2 text-center font-bold text-black">
                          {item.quantity}
                        </span>
                        <span className="col-span-2 text-right text-black font-normal">
                          {item.rate.toFixed(2)}
                        </span>
                        <span className="col-span-2 text-right font-bold text-black">
                          {item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashed horizontal divider line */}
                <div className="text-[11px] tracking-tight overflow-hidden text-center select-none font-bold text-black">
                  ---------------------------------
                </div>

                {/* 3. TAXATION & FINANCIAL TOTALS SECTION (RIGHT-ALIGNED) */}
                <div className="space-y-0.5 text-[11px] font-bold text-black">
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span>₹{calcSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>CGST 2.5%:</span>
                    <span>₹{calcCgst.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>SGST 2.5%:</span>
                    <span>₹{calcSgst.toFixed(2)}</span>
                  </div>

                  {currentBill.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{currentBill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Heavy dashed divider line */}
                  <div className="text-[11px] tracking-tight overflow-hidden text-center select-none font-black text-black pt-0.5">
                    =================================
                  </div>

                  {/* GRAND TOTAL (Large bold font) */}
                  <div className="flex justify-between items-baseline font-black text-sm pt-0.5 pb-0.5 text-black">
                    <span className="text-xs uppercase tracking-wide">GRAND TOTAL:</span>
                    <span className="text-base font-black">
                      ₹{calcGrandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Bottom divider line */}
                  <div className="text-[11px] tracking-tight overflow-hidden text-center select-none font-bold text-black">
                    ---------------------------------
                  </div>
                </div>

                {/* Payment & Footer */}
                <div className="text-center pt-0.5 space-y-1 text-black">
                  <div className="text-[11px] font-extrabold uppercase">
                    PAID VIA {currentBill.paymentMethod.toUpperCase()}
                  </div>

                  {currentBill.paymentMethod === 'split' && currentBill.splitDetails && (
                    <div className="text-[10px] flex justify-center gap-2 font-bold">
                      {currentBill.splitDetails.cash > 0 && <span>Cash: ₹{currentBill.splitDetails.cash}</span>}
                      {currentBill.splitDetails.upi > 0 && <span>UPI: ₹{currentBill.splitDetails.upi}</span>}
                      {currentBill.splitDetails.card > 0 && <span>Card: ₹{currentBill.splitDetails.card}</span>}
                    </div>
                  )}

                  <div className="pt-1 text-[10px] font-bold">
                    <p>Thank you for dining with us!</p>
                    <p className="mt-0.5">Please visit Zaffran again.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-colors cursor-pointer ${
                isKOTMode 
                  ? 'bg-amber-600 hover:bg-amber-500' 
                  : 'bg-neutral-900 hover:bg-neutral-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{isKOTMode ? 'Print KOT Slip' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ThermalReceiptModal;
