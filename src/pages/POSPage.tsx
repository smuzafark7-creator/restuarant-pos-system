import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MenuCategory, MenuItem, OrderType, RestaurantTable, KOT, KOTItem, TableStatus, PaymentMethod, ItemServeType } from '../types';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Receipt, 
  PauseCircle, 
  RotateCcw, 
  User, 
  Phone, 
  UtensilsCrossed, 
  ShoppingBag, 
  Package,
  Table as TableIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  ChefHat,
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  Bell,
  Tag,
  FileText,
  Flame,
  Check,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  CreditCard,
  Banknote,
  QrCode,
  Split,
  Printer,
  Gift,
  CheckSquare,
  Square,
  Coins,
  Wallet,
  SendHorizontal,
  Ban,
  AlertTriangle
} from 'lucide-react';
import { BillModal } from '../components/BillModal';

export const POSPage: React.FC = () => {
  const { 
    menuItems, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    updateCartItemNotes,
    updateCartItemServeType,
    removeFromCart, 
    clearCart, 
    holdOrder, 
    sendKOT,
    cartOrderType, 
    setCartOrderType, 
    cartTableNumber, 
    setCartTableNumber, 
    cartCustomerName, 
    setCartCustomerName, 
    cartCustomerMobile, 
    setCartCustomerMobile, 
    cartSpecialNotes, 
    setCartSpecialNotes,
    tables,
    customers,
    currentBranch,
    kots,
    getActiveUnbilledKots,
    setActiveTab,
    cartPaidBill,
    cartSentKotId,
    cartDiscountPercent,
    setCartDiscountPercent,
    cartCustomDiscount,
    setCartCustomDiscount,
    resetCartOrder,
    openReceiptModal,
    currentUser,
    requestBill,
    billRequests,
    showToast,
    generateBill,
    voidKOTItem
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState<boolean>(false);
  const [lastSentKot, setLastSentKot] = useState<KOT | null>(null);
  const [isSendingKot, setIsSendingKot] = useState<boolean>(false);

  // Void modal state for post-send KOT item correction
  const [voidTarget, setVoidTarget] = useState<{
    kot: KOT;
    item: KOTItem;
    itemIndex: number;
    quantityToVoid: number;
    reason: string;
  } | null>(null);

  const handleOpenVoidModal = (kot: KOT, item: KOTItem, itemIndex: number) => {
    if (kot.isBilled) {
      showToast('Action Restricted', 'This KOT is already billed and finalized. Cannot void items.', 'warning');
      return;
    }
    setVoidTarget({
      kot,
      item,
      itemIndex,
      quantityToVoid: 1,
      reason: 'Guest changed mind'
    });
  };

  const handleConfirmVoid = () => {
    if (!voidTarget) return;
    const success = voidKOTItem(
      voidTarget.kot.id,
      voidTarget.itemIndex,
      voidTarget.quantityToVoid,
      voidTarget.reason
    );
    if (success) {
      setVoidTarget(null);
    }
  };

  // Petpooja-style Bottom Section State
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('cash');
  const [bogoActive, setBogoActive] = useState<boolean>(false);
  const [complimentaryActive, setComplimentaryActive] = useState<boolean>(false);
  const [isOrderPaid, setIsOrderPaid] = useState<boolean>(false);
  const [loyaltyActive, setLoyaltyActive] = useState<boolean>(false);
  const [sendFeedbackSms, setSendFeedbackSms] = useState<boolean>(true);
  const [splitDetails, setSplitDetails] = useState<{ cash: number; upi: number; card: number; due?: number; other?: number }>({
    cash: 0,
    upi: 0,
    card: 0
  });

  // Checkbox verification state for order items (ITEMS | CHECK ITEMS | QTY | PRICE)
  const [checkedItemKeys, setCheckedItemKeys] = useState<Record<string, boolean>>({
    'kot_10025_0': true,
    'kot_10025_1': true,
    'kot_10026_0': true,
    'kot_10026_1': true,
  });

  const toggleCheckItem = (key: string) => {
    setCheckedItemKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Item-level note editing state
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Discount state synced with AppContext
  const discountPercent = cartDiscountPercent;
  const setDiscountPercent = setCartDiscountPercent;
  const customDiscount = cartCustomDiscount;
  const setCustomDiscount = setCartCustomDiscount;

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Press '/' to focus search, 'Escape' to clear/blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If pressing '/' when not already typing in an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        } else if (isTablePickerOpen) {
          setIsTablePickerOpen(false);
        } else if (isBillModalOpen) {
          setIsBillModalOpen(false);
        } else if (editingNoteItemId) {
          setEditingNoteItemId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTablePickerOpen, isBillModalOpen, editingNoteItemId]);

  const categories: string[] = [
    'All',
    'Biryani',
    'Starters',
    'Main Course',
    'Breads',
    'Rice',
    'Beverages',
    'Desserts'
  ];

  const quickInstructions = [
    'Less Spicy',
    'Extra Raita',
    'No Onion / Garlic',
    'Serve Hot',
    'Pack Gravy Separate'
  ];

  const quickItemNotes = [
    'Less spicy',
    'Extra crispy',
    'No onion',
    'Mild',
    'Well cooked'
  ];

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length };
    categories.slice(1).forEach(cat => {
      counts[cat] = menuItems.filter(m => m.category === cat).length;
    });
    return counts;
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
                          item.name.toLowerCase().includes(query) ||
                          item.category.toLowerCase().includes(query) ||
                          (item.description && item.description.toLowerCase().includes(query));
      
      const matchDietary = 
        dietaryFilter === 'all' ? true :
        dietaryFilter === 'veg' ? item.isVeg :
        !item.isVeg;

      return matchCategory && matchSearch && matchDietary;
    });
  }, [menuItems, selectedCategory, searchQuery, dietaryFilter]);

  // Pricing calculations for current unsent items (NEW KOT)
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  }, [cart]);

  const totalCartUnits = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Available and occupied tables for this branch
  const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
  const branchTables = useMemo(() => {
    return tables.filter(t => t.branchId === effectiveBranch);
  }, [tables, effectiveBranch]);

  // Selected table entity
  const selectedTable = useMemo(() => {
    if (cartOrderType !== 'dine_in' || !cartTableNumber) return null;
    return branchTables.find(t => t.name.toLowerCase() === cartTableNumber.toLowerCase()) || branchTables[0] || null;
  }, [branchTables, cartOrderType, cartTableNumber]);

  // Floor mapping helper
  const getTableFloor = (tableNumber: number): string => {
    if (tableNumber <= 4) return 'Ground Floor';
    if (tableNumber <= 8) return '1st Floor';
    return 'Rooftop Terrace';
  };

  // Active unbilled KOTs for current dining session or takeaway order
  const activeSessionKots = useMemo(() => {
    return getActiveUnbilledKots(cartTableNumber, cartOrderType, cartCustomerMobile);
  }, [getActiveUnbilledKots, cartTableNumber, cartOrderType, cartCustomerMobile]);

  // Chronologically sorted KOTs
  const chronologicalKots = useMemo(() => {
    return [...activeSessionKots].sort((a, b) => {
      const numA = parseInt(a.kotNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.kotNumber.replace(/\D/g, ''), 10) || 0;
      if (numA && numB) return numA - numB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [activeSessionKots]);

  // Running amount across active unbilled KOTs (strictly active items only)
  const runningKotsAmount = useMemo(() => {
    return activeSessionKots.reduce((sum, k) => {
      const activeSum = k.items.reduce((acc, it) => {
        if (it.status === 'voided') return acc;
        return acc + (it.rate * it.quantity);
      }, 0);
      return sum + activeSum;
    }, 0);
  }, [activeSessionKots]);

  // Combined session subtotal: previously sent unbilled KOTs + current unsent items (NEW KOT)
  const effectiveSubtotal = useMemo(() => {
    return runningKotsAmount + subtotal;
  }, [runningKotsAmount, subtotal]);

  // Total session item units across unbilled KOTs + current cart (strictly active items only)
  const totalSessionUnits = useMemo(() => {
    const kotsUnits = activeSessionKots.reduce((cnt, kot) => {
      return cnt + kot.items.reduce((s, i) => {
        if (i.status === 'voided') return s;
        return s + i.quantity;
      }, 0);
    }, 0);
    return kotsUnits + totalCartUnits;
  }, [activeSessionKots, totalCartUnits]);

  // Discount calculation across the entire active session
  const calculatedDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return Math.round((effectiveSubtotal * discountPercent) / 100);
    }
    return customDiscount;
  }, [effectiveSubtotal, discountPercent, customDiscount]);

  // 5% total GST breakdown (2.5% CGST + 2.5% SGST)
  const taxableAmount = Math.max(0, effectiveSubtotal - calculatedDiscount);
  const cgstAmount = useMemo(() => Math.round(taxableAmount * 0.025 * 100) / 100, [taxableAmount]);
  const sgstAmount = useMemo(() => Math.round(taxableAmount * 0.025 * 100) / 100, [taxableAmount]);
  const totalGst = useMemo(() => cgstAmount + sgstAmount, [cgstAmount, sgstAmount]);
  const grandTotal = useMemo(() => Math.max(0, Math.round((taxableAmount + totalGst) * 100) / 100), [taxableAmount, totalGst]);

  // Real-time tracking of the KOT sent for a pre-paid takeaway order
  const sentKot = useMemo(() => {
    if (!cartSentKotId) return null;
    return kots.find(k => k.id === cartSentKotId) || null;
  }, [kots, cartSentKotId]);

  // Live workflow step for paid takeaway order:
  // PAID (0) -> SENT TO KITCHEN (1) -> PREPARING (2) -> READY (3) -> SERVED/COMPLETED (4)
  const { currentOrderStep, currentOrderStatusText } = useMemo(() => {
    if (!cartPaidBill) return { currentOrderStep: -1, currentOrderStatusText: '' };
    if (!sentKot) return { currentOrderStep: 0, currentOrderStatusText: 'PAID • READY TO SEND' };

    switch (sentKot.status) {
      case 'new':
        return { currentOrderStep: 1, currentOrderStatusText: 'PAID • SENT TO KITCHEN' };
      case 'preparing':
        return { currentOrderStep: 2, currentOrderStatusText: 'PAID • PREPARING' };
      case 'ready':
        return { currentOrderStep: 3, currentOrderStatusText: 'PAID • FOOD READY' };
      case 'served':
        return { currentOrderStep: 4, currentOrderStatusText: 'PAID • COMPLETED' };
      default:
        return { currentOrderStep: 1, currentOrderStatusText: 'PAID • SENT TO KITCHEN' };
    }
  }, [cartPaidBill, sentKot]);

  // Customer match lookup by mobile
  const matchedCustomer = useMemo(() => {
    if (!cartCustomerMobile || cartCustomerMobile.trim().length < 4) return null;
    const cleanMobile = cartCustomerMobile.trim();
    return (customers || []).find(c => Boolean(c.mobile && c.mobile.includes(cleanMobile)));
  }, [customers, cartCustomerMobile]);

  const pendingBillRequestForCurrentTable = useMemo(() => {
    if (!cartTableNumber) return null;
    return (billRequests || []).find(
      r => r.tableNumber.toLowerCase() === cartTableNumber.toLowerCase() &&
           (currentBranch === 'all' || r.branchId === currentBranch) &&
           r.status === 'pending'
    );
  }, [billRequests, cartTableNumber, currentBranch]);

  // Quick instruction insertion
  const handleAddInstruction = (inst: string) => {
    if (!cartSpecialNotes) {
      setCartSpecialNotes(inst);
    } else if (!cartSpecialNotes.includes(inst)) {
      setCartSpecialNotes(`${cartSpecialNotes}, ${inst}`);
    }
  };

  // Demo order helper: Table 5 with active KOTs and NEW KOT items
  const handleLoadDemoOrder = () => {
    setCartOrderType('dine_in');
    setCartTableNumber('Table 5');
    setCartCustomerName('Mr. Rajesh Sharma');
    setCartCustomerMobile('+91 98765 43210');
    clearCart();
    setLastSentKot(null);

    const garlicNaan = (menuItems || []).find(m => m.name === 'Garlic Naan');
    const tandooriRoti = (menuItems || []).find(m => m.name === 'Tandoori Roti');

    if (garlicNaan) addToCart(garlicNaan, 1);
    if (tandooriRoti) addToCart(tandooriRoti, 2);
  };

  // Preload Table 5 demo items to NEW KOT if starting fresh on Table 5
  useEffect(() => {
    if (cart.length === 0 && cartTableNumber === 'Table 5' && !cartPaidBill) {
      const garlicNaan = (menuItems || []).find(m => m.name === 'Garlic Naan');
      const tandooriRoti = (menuItems || []).find(m => m.name === 'Tandoori Roti');
      if (garlicNaan && tandooriRoti) {
        addToCart(garlicNaan, 1);
        addToCart(tandooriRoti, 2);
      }
    }
  }, []);

  // BOGO Discount calculation: lowest price item in cart or promotional BOGO calculation
  const bogoDiscountAmount = useMemo(() => {
    if (!bogoActive || effectiveSubtotal === 0) return 0;
    if (cart.length > 0) {
      const prices: number[] = [];
      cart.forEach(c => {
        for (let i = 0; i < c.quantity; i++) prices.push(c.item.price);
      });
      prices.sort((a, b) => a - b);
      return prices[0] || 0;
    }
    return Math.round(effectiveSubtotal * 0.15);
  }, [bogoActive, effectiveSubtotal, cart]);

  // Effective grand total with BOGO, Complimentary, and Loyalty
  const displayGrandTotal = useMemo(() => {
    if (cartPaidBill) return cartPaidBill.grandTotal;
    if (complimentaryActive) return 0;

    let disc = calculatedDiscount;
    if (bogoActive) disc += bogoDiscountAmount;
    if (loyaltyActive) disc += Math.min(50, effectiveSubtotal);
    disc = Math.min(effectiveSubtotal, disc);

    const taxBase = Math.max(0, effectiveSubtotal - disc);
    const tax = Math.round(taxBase * 0.05 * 100) / 100;
    return Math.max(0, Math.round((taxBase + tax) * 100) / 100);
  }, [cartPaidBill, complimentaryActive, calculatedDiscount, bogoActive, bogoDiscountAmount, loyaltyActive, effectiveSubtotal]);

  // Keep splitDetails balanced with displayGrandTotal
  useEffect(() => {
    if (posPaymentMethod === 'split') {
      const half = Math.round(displayGrandTotal / 2);
      setSplitDetails({
        cash: half,
        upi: Math.max(0, displayGrandTotal - half),
        card: 0
      });
    }
  }, [posPaymentMethod, displayGrandTotal]);

  // Send KOT flow execution with loading and duplicate prevention
  const handleSendKOT = () => {
    if (cart.length === 0 || isSendingKot) return;
    if (cartPaidBill && cartSentKotId) return; // Prevent duplicate KOT for paid bill

    setIsSendingKot(true);
    setTimeout(() => {
      const kot = sendKOT();
      setIsSendingKot(false);
      if (kot) {
        setLastSentKot(kot);
        if (!cartPaidBill) {
          clearCart();
        }
      }
    }, 250);
  };

  // Send KOT and trigger thermal kitchen ticket print
  const handleSendKotAndPrint = () => {
    if (cart.length === 0 || isSendingKot) return;
    if (cartPaidBill && cartSentKotId) return;

    setIsSendingKot(true);
    setTimeout(() => {
      const kot = sendKOT();
      setIsSendingKot(false);
      if (kot) {
        setLastSentKot(kot);
        if (!cartPaidBill) {
          clearCart();
        }
        showToast('KOT Sent & Printed', `Kitchen Ticket #${kot.kotNumber} sent to KOT printer.`, 'success');
      }
    }, 250);
  };

  // Unified Save / Settle Order Handler:
  // - Save: Saves invoice to system without print popup
  // - Save & Print: Saves invoice and opens thermal receipt print modal
  // - Save & eBill: Saves invoice and dispatches digital WhatsApp/SMS eBill
  const handleSaveOrder = (mode: 'save' | 'print' | 'ebill') => {
    // If order is already paid, directly view or share existing bill
    if (cartPaidBill) {
      if (mode === 'print') {
        openReceiptModal(cartPaidBill);
      } else if (mode === 'ebill') {
        const phone = cartPaidBill.customerMobile || cartCustomerMobile || '+91 98765 43210';
        showToast('eBill Dispatched', `Digital tax invoice #${cartPaidBill.billNumber} sent to ${phone} via WhatsApp & SMS.`, 'success');
      } else {
        showToast('Order Finalized', `Invoice #${cartPaidBill.billNumber} is already recorded in system.`, 'info');
      }
      return;
    }

    const hasItems = cart.length > 0 || activeSessionKots.length > 0;
    if (!hasItems && (!selectedTable || selectedTable.status !== 'occupied')) {
      showToast('No items to bill', 'Please add items or select an active table.', 'warning');
      return;
    }

    // Net discount amount
    let finalDiscount = calculatedDiscount;
    if (complimentaryActive) {
      finalDiscount = effectiveSubtotal;
    } else {
      if (bogoActive) finalDiscount += bogoDiscountAmount;
      if (loyaltyActive) finalDiscount += Math.min(50, effectiveSubtotal);
    }
    finalDiscount = Math.min(effectiveSubtotal, finalDiscount);

    const targetPayment = posPaymentMethod;
    const targetSplit = targetPayment === 'split' ? splitDetails : undefined;

    const bill = generateBill(targetPayment, targetSplit, finalDiscount);
    if (!bill) return;

    if (mode === 'print') {
      openReceiptModal(bill);
    } else if (mode === 'ebill') {
      const phone = bill.customerMobile || cartCustomerMobile || '+91 98765 43210';
      showToast('eBill Dispatched', `Digital tax invoice #${bill.billNumber} sent to ${phone} via WhatsApp & SMS.`, 'success');
    } else {
      showToast('Order Saved', `Invoice #${bill.billNumber} recorded with ${targetPayment.toUpperCase()} payment.`, 'success');
    }

    if (sendFeedbackSms && (bill.customerMobile || cartCustomerMobile)) {
      const phone = bill.customerMobile || cartCustomerMobile;
      setTimeout(() => {
        showToast('Feedback SMS Queued', `Review link queued for ${phone}`, 'info');
      }, 900);
    }
  };

  // Item note handling
  const handleOpenNoteEditor = (itemId: string, currentNote?: string) => {
    setEditingNoteItemId(itemId);
    setTempNoteText(currentNote || '');
  };

  const handleSaveItemNote = (itemId: string) => {
    updateCartItemNotes(itemId, tempNoteText.trim());
    setEditingNoteItemId(null);
    setTempNoteText('');
  };

  const handleApplyQuickNote = (itemId: string, note: string) => {
    updateCartItemNotes(itemId, note);
    setEditingNoteItemId(null);
    setTempNoteText('');
  };

  // Table status badge helper
  const renderTableStatusBadge = (status?: TableStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">AVAILABLE</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">OCCUPIED</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">BILLING</span>;
      case 'ready':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">FOOD READY</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">CLEANING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">AVAILABLE</span>;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden select-none bg-[#080d1a]">
      
      {/* ========================================================================= */}
      {/* ZONE 1 (LEFT SIDEBAR): MENU CATEGORIES */}
      {/* ========================================================================= */}
      <aside 
        id="pos-menu-categories-sidebar"
        className="w-44 sm:w-48 xl:w-52 bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none h-full overflow-hidden"
      >
        {/* Category Header */}
        <div className="p-3 border-b border-slate-800 bg-[#0f172a] shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-300">
              Menu Categories
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {categories.length}
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                id={`category-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 ease-in-out cursor-pointer group text-left ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs border border-emerald-500'
                    : 'bg-slate-900/40 text-slate-300 font-medium border border-slate-800/70 hover:bg-slate-800/70 hover:text-white hover:border-slate-700'
                }`}
              >
                {/* Active visual indicator */}
                {isSelected && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-200 rounded-r-full" />
                )}
                <span className={`truncate ${isSelected ? 'pl-1.5' : ''}`}>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-800 text-emerald-100 border border-emerald-400/40'
                    : 'bg-slate-800/90 text-slate-400 border border-slate-700/60 group-hover:bg-slate-800 group-hover:text-slate-200'
                }`}>
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
            {selectedCategory === 'All' ? menuItems.length : (categoryCounts[selectedCategory] || 0)}
          </span>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* ZONE 2 (MIDDLE): Instant Search and Menu Cards Grid */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#080d1a] border-r border-slate-800">
        
        {/* Sub-bar: Instant Search, Veg/Non-Veg Filter, and Demo order trigger */}
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Search Input with Keyboard Shortcut Hint */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search dish name, code or category (Press '/' to focus)..."
                className="w-full pl-9 pr-14 py-2 bg-[#111a2e] hover:bg-[#131d36] border border-slate-700 focus:bg-[#111a2e] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded font-medium border border-slate-700">
                    /
                  </span>
                )}
              </div>
            </div>

            {/* Veg / Non-Veg Quick Dietary Segmented Control */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0 font-mono text-xs">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1.5 rounded-md font-semibold text-[11px] transition-all ${
                  dietaryFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({menuItems.length})
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-2.5 py-1.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-400 hover:bg-rose-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Quick Demo order button for rapid testing */}
            <button
              onClick={handleLoadDemoOrder}
              className="hidden xl:flex items-center gap-1 px-2.5 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0"
              title="Quick-load Table 5 test order (Biryani x2, Coke x2, Chicken 65 x1)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Table 5 Demo</span>
            </button>
          </div>
        </div>

        {/* Menu Items Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 bg-[#080d1a]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map(item => {
              const cartEntry = cart.find(c => c.item.id === item.id);
              const inCartQty = cartEntry?.quantity || 0;
              const hasItemNote = !!cartEntry?.notes;

              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item, 1)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[185px] relative group shadow-xs hover:shadow-lg select-none ${
                    inCartQty > 0
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-[#111a2e]'
                      : 'border-slate-800 hover:border-emerald-500/80 bg-[#0f172a] hover:bg-[#111a2e]'
                  }`}
                >
                  {/* Top Row: Avatar box + Veg/Non-veg & Badges matching OCCUPIED / AVAILABLE status pills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {/* Food icon badge matching T{number} on Table Card */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors font-mono bg-slate-800 text-white border border-slate-700 shrink-0">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                        </div>
                        {/* Veg / Non-Veg badge styled identically to assigned waiter pill */}
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

                      {/* Status Pill styled identical to OCCUPIED / AVAILABLE status pills */}
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

                    {/* Item Title: Crisp white font matching "Table 1" */}
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

                    {/* Price: Emerald green font matching the "Running: ₹..." color */}
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

                  {/* Bottom Action Area: Styled identical to lower action buttons ("POS", "KOT") on table cards */}
                  <div className="mt-3 pt-2 border-t border-slate-800 font-mono">
                    {inCartQty > 0 ? (
                      /* Quantity Stepper right on card */
                      <div
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-[10px]"
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
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
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="flex-1 py-1 rounded font-bold text-center transition-colors border bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border-slate-700 cursor-pointer flex items-center justify-center gap-1"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      /* + Add Button styled identical to lower action buttons ("POS", "KOT") */
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className="w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors border bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border-slate-700 cursor-pointer font-mono shadow-xs"
                        title="Add item to order"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add</span>
                      </button>
                    )}
                  </div>

                  {/* Indicator if cart item has a special note */}
                  {hasItemNote && (
                    <div className="mt-1.5 text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono truncate">
                      Note: {cartEntry?.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-mono">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-500" />
              <p className="text-sm font-bold text-white">No dishes match your search</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for another dish or reset your filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setDietaryFilter('all');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ZONE 3 (RIGHT): Cashier Order Panel, Table Status, Cart, Totals & Billing */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[420px] bg-[#0f172a] border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-xl z-10 text-slate-200">
        
        {/* Top Section: Order Type, Table Selector, Guest Information */}
        <div className="p-3.5 border-b border-slate-800 space-y-3 shrink-0 bg-[#0f172a]">
          
          {/* Order Type Segmented Switcher */}
          <div className="grid grid-cols-3 gap-1 bg-[#111a2e] p-1 rounded-xl font-mono border border-slate-800">
            <button
              onClick={() => setCartOrderType('dine_in')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                cartOrderType === 'dine_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>DINE-IN</span>
            </button>

            <button
              onClick={() => setCartOrderType('takeaway')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                cartOrderType === 'takeaway'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>TAKEAWAY</span>
            </button>

            <button
              onClick={() => setCartOrderType('parcel')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                cartOrderType === 'parcel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>PARCEL</span>
            </button>
          </div>

          {/* Dine-In Table Selection & Real-Time Status */}
          {cartOrderType === 'dine_in' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <select
                    value={cartTableNumber}
                    onChange={e => setCartTableNumber(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-[#111a2e] border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
                  >
                    {branchTables.map(tbl => (
                      <option key={tbl.id} value={tbl.name} className="bg-[#0f172a] text-white">
                        {tbl.name} • ({tbl.capacity} Seats) • {tbl.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visual Floor Picker Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setIsTablePickerOpen(true)}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1 border border-slate-700 shadow-2xs transition-colors shrink-0"
                  title="Open graphical table floor layout"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Floor Plan</span>
                </button>
              </div>

              {/* Table Info Bar (Floor, Seats, Status, Active KOTs) */}
              {selectedTable && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#111a2e] border border-slate-800 rounded-lg text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="font-bold text-white">{selectedTable.name}</span>
                    <span>•</span>
                    <span className="text-slate-400">{getTableFloor(selectedTable.number)}</span>
                    <span>•</span>
                    <span className="text-slate-400">{selectedTable.capacity} Seats</span>
                    {activeSessionKots.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold truncate">
                          {activeSessionKots.length} KOT{activeSessionKots.length > 1 ? 's' : ''} Sent
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    {renderTableStatusBadge(selectedTable.status)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Takeaway / Parcel Order Banner */
            <div className="space-y-1.5">
              {cartPaidBill ? (
                /* Clear Takeaway Workflow Status: PAID -> READY TO SEND */
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 font-mono text-xs space-y-1.5 text-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-emerald-300">
                        {currentOrderStatusText}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-200 border border-emerald-700 text-[10px] font-bold">
                      INVOICE #{cartPaidBill.billNumber}
                    </span>
                  </div>

                  {/* 4-Stage Visual Progress Indicator */}
                  <div className="grid grid-cols-4 gap-1 pt-1 text-center text-[9px] font-bold">
                    <div className="py-1 rounded bg-emerald-600 text-white">1. PAID</div>
                    <div className={`py-1 rounded ${currentOrderStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      2. SENT
                    </div>
                    <div className={`py-1 rounded ${currentOrderStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      3. PREP
                    </div>
                    <div className={`py-1 rounded ${currentOrderStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      4. READY
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-[#111a2e] border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Standard Takeaway Counter Order</span>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Pay-at-Counter
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Guest Name and Mobile Number with matched regular customer */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cartCustomerName}
                onChange={e => setCartCustomerName(e.target.value)}
                placeholder="Guest Name"
                disabled={!!cartPaidBill}
                className="w-full pl-8 pr-2 py-1.5 bg-[#111a2e] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:bg-slate-900 disabled:text-slate-500"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cartCustomerMobile}
                onChange={e => setCartCustomerMobile(e.target.value)}
                placeholder="Phone (Optional)"
                disabled={!!cartPaidBill}
                className="w-full pl-8 pr-2 py-1.5 bg-[#111a2e] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:bg-slate-900 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Recognized Returning Guest Tag */}
          {matchedCustomer && (
            <div className="text-[10px] font-mono bg-amber-950/50 text-amber-300 border border-amber-800/70 px-2 py-1 rounded flex items-center justify-between">
              <span>★ Regular Guest: {matchedCustomer.name}</span>
              <span className="text-amber-700 font-semibold">{matchedCustomer.totalOrders || 0} visits</span>
            </div>
          )}
        </div>

        {/* Scrollable Middle: Order Items Area with KOT Grouping */}
        <div className="flex-1 overflow-y-auto flex flex-col font-mono bg-[#080d1a]">
          
          {/* Columns Header: ITEMS | CHECK ITEMS | QTY | PRICE */}
          <div className="sticky top-0 z-10 grid grid-cols-12 gap-1 px-3 py-1.5 bg-[#0f172a] border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none shadow-xs">
            <span className="col-span-5">ITEMS</span>
            <span className="col-span-3 text-center">CHECK ITEMS</span>
            <span className="col-span-2 text-center">QTY</span>
            <span className="col-span-2 text-right">PRICE</span>
          </div>

          <div className="p-2 space-y-1.5 flex-1">
            {/* 1. Previously Sent KOTs Grouped by KOT Number */}
            {chronologicalKots.map(kot => {
              const kotDisplayNum = kot.kotNumber.replace(/^KOT-?/i, '');

              return (
                <div key={kot.id} className="space-y-1">
                  {/* KOT Group Separator Line */}
                  <div className="relative py-2 flex items-center justify-center select-none">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative bg-slate-900 px-3 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono font-bold text-slate-200 tracking-wider shadow-xs flex items-center gap-1.5">
                      <span className="font-extrabold text-white">KOT - {kotDisplayNum}</span>
                      {kot.timeFormatted && (
                        <span className="text-[9px] text-slate-400 font-normal">({kot.timeFormatted})</span>
                      )}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] uppercase font-bold ${
                          kot.status === 'ready'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : kot.status === 'served'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {kot.status}
                      </span>
                    </div>
                  </div>

                  {/* KOT Items List */}
                  <div className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                    {kot.items.map((it, idx) => {
                      const itemKey = `${kot.id}_${idx}`;
                      const isChecked = !!checkedItemKeys[itemKey];
                      const isVoided = it.status === 'voided';

                      return (
                        <div
                          key={itemKey}
                          className={`grid grid-cols-12 gap-1 px-2.5 py-1.5 items-center text-xs transition-colors ${
                            isVoided
                              ? 'bg-rose-950/30 opacity-70'
                              : isChecked
                              ? 'bg-emerald-950/30'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          {/* ITEMS */}
                          <div className="col-span-5 flex items-start gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${
                                isVoided ? 'bg-slate-400' : it.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span
                                  className={`font-semibold truncate text-[11px] block ${
                                    isVoided ? 'line-through text-slate-500' : 'text-white'
                                  }`}
                                  title={it.name}
                                >
                                  {it.name}
                                </span>
                                {isVoided ? (
                                  <span className="shrink-0 text-[8px] font-black px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-tight">
                                    VOIDED
                                  </span>
                                ) : it.serveType === 'PARCEL' ? (
                                  <span className="shrink-0 text-[8px] font-extrabold px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-tight">
                                    PARCEL
                                  </span>
                                ) : (
                                  <span className="shrink-0 text-[8px] font-semibold px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-tight">
                                    DINE-IN
                                  </span>
                                )}
                              </div>
                              {it.notes && (
                                <span className="text-[9px] text-amber-400 italic block truncate">
                                  "{it.notes}"
                                </span>
                              )}
                              {isVoided ? (
                                <div className="text-[8px] text-rose-700 font-sans mt-0.5 leading-tight">
                                  Voided {it.voidedAt} by {it.voidedBy || 'Waiter'}{it.voidReason ? ` • ${it.voidReason}` : ''}
                                </div>
                              ) : (
                                !kot.isBilled && (
                                  <div className="mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenVoidModal(kot, it, idx)}
                                      className="text-[9px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 px-1 py-0.2 rounded font-medium inline-flex items-center gap-0.5 transition-colors cursor-pointer border border-rose-800/70"
                                      title="Void / Cancel this item from ticket"
                                    >
                                      <Ban className="w-2.5 h-2.5" />
                                      <span>Void</span>
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* CHECK ITEMS */}
                          <div className="col-span-3 flex justify-center">
                            {isVoided ? (
                              <span className="text-[9px] text-rose-400 font-mono italic">Void</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleCheckItem(itemKey)}
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                                }`}
                                title={isChecked ? 'Verified / Served' : 'Mark checked'}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </button>
                            )}
                          </div>

                          {/* QTY */}
                          <div className="col-span-2 flex justify-center items-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                isVoided ? 'bg-slate-900 text-slate-500 line-through' : 'bg-slate-800 text-slate-200'
                              }`}
                            >
                              {it.quantity}
                            </span>
                          </div>

                          {/* PRICE */}
                          <div className="col-span-2 text-right font-mono font-bold text-[11px]">
                            {isVoided ? (
                              <div>
                                <span className="line-through text-slate-400 text-[10px]">₹{it.rate * it.quantity}</span>
                                <span className="text-rose-600 ml-1 font-bold">₹0</span>
                              </div>
                            ) : (
                              <span className="text-slate-200">₹{it.rate * it.quantity}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 2. NEW KOT Section */}
            <div className="space-y-1 pt-1">
              {/* NEW KOT Separator Line */}
              <div className="relative py-2 flex items-center justify-center select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-amber-400" />
                </div>
                <div className="relative bg-amber-500 text-white px-3 py-0.5 rounded-full text-[10px] font-mono font-extrabold tracking-wider shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-100" />
                  <span>NEW KOT</span>
                  {cart.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[8px] font-bold">
                      {cart.reduce((s, c) => s + c.quantity, 0)} Items Unsent
                    </span>
                  ) : (
                    <span className="text-[8px] text-amber-100 font-normal">
                      (Empty)
                    </span>
                  )}
                </div>
              </div>

              {/* NEW KOT Items List */}
              {cart.length > 0 ? (
                <div className="bg-[#0f172a] rounded-xl border border-amber-500/40 overflow-hidden divide-y divide-slate-800/80">
                  {cart.map(cartItem => {
                    const itemKey = `new_${cartItem.item.id}`;
                    const isChecked = !!checkedItemKeys[itemKey];
                    const isEditingNote = editingNoteItemId === cartItem.item.id;

                    return (
                      <div
                        key={cartItem.item.id}
                        className={`transition-colors ${
                          isChecked ? 'bg-amber-950/40' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 items-center text-xs">
                          {/* ITEMS */}
                          <div className="col-span-5 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  cartItem.item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              <span
                                className="font-bold text-white truncate text-[11px]"
                                title={cartItem.item.name}
                              >
                                {cartItem.item.name}
                              </span>
                              {(cartItem.serveType || 'DINE_IN') === 'PARCEL' && (
                                <span className="shrink-0 text-[8px] font-black px-1 py-0.2 rounded bg-amber-500 text-white uppercase tracking-tight">
                                  PARCEL
                                </span>
                              )}
                            </div>
                            {cartItem.notes && !isEditingNote && (
                              <p className="text-[10px] text-amber-400 italic truncate pl-3">
                                "{cartItem.notes}"
                              </p>
                            )}
                          </div>

                          {/* CHECK ITEMS */}
                          <div className="col-span-3 flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleCheckItem(itemKey)}
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-600 border-amber-600 text-white shadow-2xs'
                                  : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                              }`}
                              title={isChecked ? 'Marked checked' : 'Click to check'}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>

                          {/* QTY: - Qty + Stepper */}
                          <div className="col-span-2 flex justify-center items-center">
                            <div className="flex items-center bg-slate-950 border border-slate-700 rounded shadow-2xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(cartItem.item.id, -1)}
                                className="px-1 py-0.5 hover:bg-slate-800 text-slate-300 font-bold text-[10px] cursor-pointer"
                                title="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="px-1 py-0.5 font-bold text-white text-[11px] min-w-3 text-center font-mono">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(cartItem.item.id, 1)}
                                className="px-1 py-0.5 hover:bg-slate-800 text-slate-300 font-bold text-[10px] cursor-pointer"
                                title="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* PRICE & Remove */}
                          <div className="col-span-2 flex items-center justify-end gap-1 font-mono">
                            <span className="font-bold text-emerald-400 text-[11px]">
                              ₹{cartItem.item.price * cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(cartItem.item.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                              title="Remove item from NEW KOT"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Serve Type Dropdown & Special Instructions Note row */}
                        <div className="px-2.5 pb-1.5 pt-0 flex items-center justify-between text-[10px] gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Compact Serve Type Control */}
                            <div className="flex items-center gap-1">
                              <label htmlFor={`serve-type-${cartItem.item.id}`} className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                                Serve:
                              </label>
                              <select
                                id={`serve-type-${cartItem.item.id}`}
                                value={cartItem.serveType || 'DINE_IN'}
                                onChange={(e) => updateCartItemServeType(cartItem.item.id, e.target.value as ItemServeType)}
                                className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer font-mono outline-none transition-all shadow-2xs ${
                                  (cartItem.serveType || 'DINE_IN') === 'PARCEL'
                                    ? 'bg-amber-500 text-white border-amber-600 ring-1 ring-amber-400'
                                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
                                }`}
                                title="Select Serve Type: Dine-In or Parcel"
                              >
                                <option value="DINE_IN" className="bg-slate-900 text-slate-100 font-medium">Dine-In</option>
                                <option value="PARCEL" className="bg-slate-900 text-slate-100 font-medium">Parcel</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenNoteEditor(cartItem.item.id, cartItem.notes)}
                              className="text-amber-400 hover:text-amber-300 text-[9px] flex items-center gap-0.5 cursor-pointer font-mono ml-0.5"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>{cartItem.notes ? 'Edit note' : '+ Add Note'}</span>
                            </button>
                          </div>

                          {(cartItem.serveType || 'DINE_IN') === 'PARCEL' && (
                            <span className="text-[8px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <Package className="w-2.5 h-2.5" />
                              <span>Pack</span>
                            </span>
                          )}
                        </div>

                        {/* Inline Note Editor */}
                        {isEditingNote && (
                          <div className="px-2.5 pb-2 pt-1 border-t border-slate-800 space-y-1 bg-slate-950">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={tempNoteText}
                                onChange={e => setTempNoteText(e.target.value)}
                                placeholder="e.g. Less spicy, crisp, no onion"
                                className="flex-1 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveItemNote(cartItem.item.id)}
                                className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold hover:bg-emerald-500 font-mono"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNoteItemId(null)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-slate-300 text-[9px] font-mono"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {quickItemNotes.map(n => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => handleApplyQuickNote(cartItem.item.id, n)}
                                  className="px-1.5 py-0.2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 text-[8px] rounded font-mono"
                                >
                                  + {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-slate-400 text-[11px] font-mono italic">
                  {chronologicalKots.length > 0 ? (
                    <div className="py-2.5 bg-slate-900/90 rounded-lg border border-dashed border-slate-700 text-amber-300 text-[11px] flex items-center justify-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Click menu items to add to NEW KOT</span>
                    </div>
                  ) : (
                    <div className="py-6 space-y-1.5">
                      <UtensilsCrossed className="w-7 h-7 mx-auto opacity-30 text-slate-500" />
                      <p className="font-bold text-slate-300 text-xs">No active orders</p>
                      <p className="text-[10px] text-slate-400">Click dishes from the menu to start order</p>
                      <button
                        onClick={handleLoadDemoOrder}
                        className="mt-2 px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-800/60 transition-colors inline-flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Load Table 5 Demo Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Calculations & Action Buttons (Permanently visible at bottom) */}
        <div className="p-3 bg-[#0f172a] border-t border-slate-800 space-y-2 shrink-0 font-mono select-none">
          
          {/* Quick Kitchen Instruction & Utilities */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={cartSpecialNotes}
                onChange={e => setCartSpecialNotes(e.target.value)}
                placeholder="Kitchen note (e.g. Less spicy, Serve starters first)"
                className="flex-1 px-2 py-1 bg-[#111a2e] border border-slate-700 rounded text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={holdOrder}
                disabled={cart.length === 0 || !!cartPaidBill}
                className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 bg-slate-900 text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                title="Hold current order"
              >
                Hold
              </button>
              {cartPaidBill ? (
                <button
                  type="button"
                  onClick={resetCartOrder}
                  className="px-2 py-1 rounded bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                  title="Start a fresh order"
                >
                  New Order
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 bg-slate-900 text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  title="Clear items in cart"
                >
                  Clear
                </button>
              )}
            </div>
            {quickInstructions.length > 0 && !cartSpecialNotes && (
              <div className="flex flex-wrap gap-1">
                {quickInstructions.slice(0, 4).map(inst => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleAddInstruction(inst)}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-mono border border-slate-800 transition-colors cursor-pointer"
                  >
                    + {inst}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1. BILLING CONTROLS: BOGO Offer, Split, Complimentary, Total amount */}
          <div className="p-2 bg-[#111a2e] border border-slate-800 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {/* BOGO Offer */}
              <button
                type="button"
                onClick={() => {
                  setBogoActive(!bogoActive);
                  if (!bogoActive) setComplimentaryActive(false);
                }}
                className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  bogoActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
                title="Toggle Buy One Get One Offer"
              >
                <Tag className="w-3 h-3" />
                <span>BOGO Offer</span>
                {bogoActive && <Check className="w-2.5 h-2.5" />}
              </button>

              {/* Split */}
              <button
                type="button"
                onClick={() => {
                  const next = posPaymentMethod === 'split' ? 'cash' : 'split';
                  setPosPaymentMethod(next);
                }}
                className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  posPaymentMethod === 'split'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
                title="Split bill into multiple payments"
              >
                <Split className="w-3 h-3" />
                <span>Split</span>
                {posPaymentMethod === 'split' && <Check className="w-2.5 h-2.5" />}
              </button>

              {/* Complimentary */}
              <button
                type="button"
                onClick={() => {
                  setComplimentaryActive(!complimentaryActive);
                  if (!complimentaryActive) setBogoActive(false);
                }}
                className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  complimentaryActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
                title="Mark order as 100% Complimentary (NC)"
              >
                <Gift className="w-3 h-3" />
                <span>Complimentary</span>
                {complimentaryActive && <Check className="w-2.5 h-2.5" />}
              </button>
            </div>

            {/* Total amount */}
            <div className="text-right shrink-0">
              <span className="text-[9px] text-slate-400 block leading-none">Total Amount</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tracking-tight leading-tight">
                ₹{cartPaidBill ? cartPaidBill.grandTotal.toFixed(2) : displayGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 2. PAYMENT OPTIONS: Cash, Card, UPI, Due, Other, Part / Split */}
          <div className="space-y-1">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'upi', label: 'UPI', icon: QrCode },
                { id: 'due', label: 'Due', icon: Coins },
                { id: 'other', label: 'Other', icon: Wallet },
                { id: 'split', label: 'Part / Split', icon: Split }
              ].map(method => {
                const Icon = method.icon;
                const isSelected = posPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPosPaymentMethod(method.id as PaymentMethod)}
                    className={`py-1 px-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-950 text-white border-emerald-500 ring-2 ring-emerald-500/40 shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inline Part/Split Controls if selected */}
            {posPaymentMethod === 'split' && (
              <div className="p-1.5 bg-purple-950/40 border border-purple-800/80 rounded text-[10px] space-y-1 text-purple-200">
                <div className="flex justify-between items-center text-purple-200 font-bold">
                  <span>Split Payment (₹{displayGrandTotal.toFixed(2)})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const half = Math.round(displayGrandTotal / 2);
                      setSplitDetails({ cash: half, upi: Math.max(0, displayGrandTotal - half), card: 0 });
                    }}
                    className="text-purple-400 hover:underline cursor-pointer"
                  >
                    Auto 50:50
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div>
                    <span className="text-slate-400 block">Cash (₹)</span>
                    <input
                      type="number"
                      value={splitDetails.cash || ''}
                      onChange={e => setSplitDetails({ ...splitDetails, cash: Number(e.target.value) || 0 })}
                      className="w-full px-1 py-0.5 bg-slate-950 border border-purple-700 text-white rounded font-bold text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">UPI (₹)</span>
                    <input
                      type="number"
                      value={splitDetails.upi || ''}
                      onChange={e => setSplitDetails({ ...splitDetails, upi: Number(e.target.value) || 0 })}
                      className="w-full px-1 py-0.5 bg-slate-950 border border-purple-700 text-white rounded font-bold text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Card (₹)</span>
                    <input
                      type="number"
                      value={splitDetails.card || ''}
                      onChange={e => setSplitDetails({ ...splitDetails, card: Number(e.target.value) || 0 })}
                      className="w-full px-1 py-0.5 bg-slate-950 border border-purple-700 text-white rounded font-bold text-xs"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer Due / Credit Note if selected */}
            {posPaymentMethod === 'due' && (
              <div className="px-2 py-0.5 bg-amber-950/50 border border-amber-800/80 rounded text-[10px] text-amber-200 flex items-center justify-between">
                <span>Customer Ledger Due:</span>
                <span className="font-bold truncate max-w-[180px]">
                  {cartCustomerName || matchedCustomer?.name || 'Walk-in Guest'} ({cartCustomerMobile || 'Add Phone'})
                </span>
              </div>
            )}
          </div>

          {/* 3. ORDER OPTIONS: It's Paid, Loyalty, Send Feedback SMS */}
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {/* It's Paid */}
            <button
              type="button"
              onClick={() => setIsOrderPaid(!isOrderPaid)}
              className={`py-1 px-1.5 rounded-md text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                isOrderPaid || !!cartPaidBill
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
              title="Mark order as already collected / prepaid"
            >
              {isOrderPaid || !!cartPaidBill ? (
                <CheckSquare className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span className="truncate">It's Paid</span>
            </button>

            {/* Loyalty */}
            <button
              type="button"
              onClick={() => {
                setLoyaltyActive(!loyaltyActive);
                if (!loyaltyActive) {
                  showToast('Loyalty Points', 'Applied ₹50 loyalty points discount.', 'info');
                }
              }}
              className={`py-1 px-1.5 rounded-md text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                loyaltyActive
                  ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
              title={matchedCustomer ? `${matchedCustomer.name} has reward points available` : 'Redeem customer loyalty points'}
            >
              <Sparkles className={`w-3 h-3 ${loyaltyActive ? 'text-amber-600' : 'text-slate-400'} shrink-0`} />
              <span className="truncate">Loyalty{loyaltyActive ? ' (-₹50)' : ''}</span>
            </button>

            {/* Send Feedback SMS */}
            <button
              type="button"
              onClick={() => setSendFeedbackSms(!sendFeedbackSms)}
              className={`py-1 px-1.5 rounded-md text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                sendFeedbackSms
                  ? 'bg-blue-950/60 border-blue-700 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
              title="Automated feedback and review SMS link for customer"
            >
              {sendFeedbackSms ? (
                <CheckSquare className="w-3 h-3 text-blue-600 shrink-0" />
              ) : (
                <Square className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span className="truncate">Feedback SMS</span>
            </button>
          </div>

          {/* 4. ACTION BUTTONS: KOT, KOT & Print, Save, Save & Print, Save & eBill */}
          <div className="space-y-1 pt-0.5">
            {/* Kitchen Operations Row */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* KOT */}
              {cartPaidBill && cartSentKotId ? (
                <button
                  type="button"
                  disabled
                  className="py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1 font-mono cursor-not-allowed shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>KOT SENT</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="pos-send-kot-btn"
                  onClick={handleSendKOT}
                  disabled={cart.length === 0 || isSendingKot}
                  className={`py-1.5 px-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono cursor-pointer ${
                    cartPaidBill && !cartSentKotId
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 ring-2 ring-emerald-400 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 active:scale-98'
                  }`}
                  title="Send NEW KOT items to kitchen"
                >
                  {isSendingKot ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isSendingKot ? 'SENDING...' : 'KOT'}</span>
                </button>
              )}

              {/* KOT & Print */}
              <button
                type="button"
                id="pos-kot-print-btn"
                onClick={handleSendKotAndPrint}
                disabled={cart.length === 0 || isSendingKot || (!!cartPaidBill && !!cartSentKotId)}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-98 text-amber-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono cursor-pointer"
                title="Send KOT to kitchen and print thermal kitchen ticket"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>KOT & Print</span>
              </button>
            </div>

            {/* Settle / Save Operations Row or Waiter Request Bill */}
            {currentUser?.role === 'waiter' ? (
              <div>
                <button
                  type="button"
                  id="waiter-request-bill-btn"
                  onClick={() => {
                    if (!cartTableNumber) {
                      showToast('Select Table', 'Please select a table to request bill.', 'warning');
                      return;
                    }
                    requestBill(cartTableNumber);
                  }}
                  disabled={!cartTableNumber || (cart.length === 0 && activeSessionKots.length === 0 && (!selectedTable || selectedTable.status !== 'occupied'))}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all font-mono active:scale-98 cursor-pointer uppercase tracking-wider ${
                    pendingBillRequestForCurrentTable
                      ? 'bg-amber-100 border border-amber-400 text-amber-900'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Request final bill from Cashier for Table"
                >
                  <Receipt className="w-4 h-4" />
                  <span>
                    {pendingBillRequestForCurrentTable
                      ? `BILL REQUESTED FOR ${cartTableNumber} (PENDING CASHIER)`
                      : `REQUEST BILL FROM CASHIER (${cartTableNumber || 'TABLE'})`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {/* Save */}
                <button
                  type="button"
                  id="pos-save-btn"
                  onClick={() => handleSaveOrder('save')}
                  disabled={cart.length === 0 && activeSessionKots.length === 0 && (!selectedTable || selectedTable.status !== 'occupied')}
                  className="py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono cursor-pointer active:scale-98"
                  title="Save and settle order in system"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                {/* Save & Print */}
                <button
                  type="button"
                  id="pos-save-print-btn"
                  onClick={() => handleSaveOrder('print')}
                  disabled={cart.length === 0 && activeSessionKots.length === 0 && (!selectedTable || selectedTable.status !== 'occupied')}
                  className="py-1.5 px-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono cursor-pointer active:scale-98"
                  title="Save invoice and print thermal customer receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="truncate">Save & Print</span>
                </button>

                {/* Save & eBill */}
                <button
                  type="button"
                  id="pos-save-ebill-btn"
                  onClick={() => handleSaveOrder('ebill')}
                  disabled={cart.length === 0 && activeSessionKots.length === 0 && (!selectedTable || selectedTable.status !== 'occupied')}
                  className="py-1.5 px-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono cursor-pointer active:scale-98"
                  title="Save invoice and send digital WhatsApp / SMS eBill"
                >
                  <SendHorizontal className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="truncate">Save & eBill</span>
                </button>
              </div>
            )}

            {/* Pending bill request alert for Cashier if waiter requested */}
            {pendingBillRequestForCurrentTable && (
              <div className="bg-amber-950/60 border border-amber-800/80 rounded p-1.5 flex items-center justify-between text-[11px] font-mono text-amber-200">
                <span className="truncate">
                  <strong>{pendingBillRequestForCurrentTable.requestedBy}</strong> requested bill
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveOrder('print')}
                  className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700 shrink-0 ml-1 cursor-pointer"
                >
                  Settle Table
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Table Quick-Picker Modal */}
      {isTablePickerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 overflow-hidden font-mono text-white animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Select Table for POS Order</h3>
                <span className="text-xs text-slate-400">({branchTables.length} tables in this branch)</span>
              </div>
              <button
                onClick={() => setIsTablePickerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              {['Ground Floor', '1st Floor', 'Rooftop Terrace'].map(floor => {
                const floorTables = branchTables.filter(t => getTableFloor(t.number) === floor);
                if (floorTables.length === 0) return null;

                return (
                  <div key={floor} className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {floor} ({floorTables.length} tables)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {floorTables.map(tbl => {
                        const isSelected = cartTableNumber.toLowerCase() === tbl.name.toLowerCase();
                        return (
                          <div
                            key={tbl.id}
                            onClick={() => {
                              setCartTableNumber(tbl.name);
                              setCartOrderType('dine_in');
                              setIsTablePickerOpen(false);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-950/40 ring-2 ring-amber-500/20 shadow-xs'
                                : tbl.status === 'available'
                                ? 'border-slate-800 hover:border-emerald-500 bg-[#131d36]'
                                : tbl.status === 'occupied'
                                ? 'border-amber-900/60 bg-amber-950/30 hover:border-amber-500'
                                : 'border-blue-900/60 bg-blue-950/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-white">{tbl.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                tbl.status === 'available'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : tbl.status === 'occupied'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : tbl.status === 'ready'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-purple-950 text-purple-300 border border-purple-800'
                              }`}>
                                {tbl.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {tbl.capacity} Seats
                              {tbl.currentAmount ? ` • ₹${tbl.currentAmount}` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsTablePickerOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void / Cancel Item Confirmation Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0f172a] text-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-800 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 stroke-[2.5]" />
                <h3 className="font-bold text-sm">Void / Cancel Sent Item</h3>
              </div>
              <button
                onClick={() => setVoidTarget(null)}
                className="text-white/80 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs text-slate-300">
              {/* Target info card */}
              <div className="p-2.5 rounded-lg bg-[#131d36] border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-600 font-semibold">{voidTarget.kot.kotNumber}</span>
                  <span className="font-bold text-white">{voidTarget.kot.tableNumber || 'Takeaway'}</span>
                </div>
                <div className="font-bold text-sm text-white">
                  {voidTarget.item.name}
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Price: ₹{voidTarget.item.rate} each</span>
                  <span>Currently in Ticket: ×{voidTarget.item.quantity}</span>
                </div>
              </div>

              {/* Quantity to void selector (if item.quantity > 1) */}
              {voidTarget.item.quantity > 1 ? (
                <div className="space-y-1">
                  <label className="font-bold text-[11px] text-slate-200 block">
                    Quantity to Void / Cancel:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setVoidTarget(prev => prev ? { ...prev, quantityToVoid: Math.max(1, prev.quantityToVoid - 1) } : null)}
                        disabled={voidTarget.quantityToVoid <= 1}
                        className="px-2.5 py-1.5 hover:bg-slate-800 disabled:opacity-30 cursor-pointer font-bold text-slate-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 font-mono font-bold text-white text-sm">
                        {voidTarget.quantityToVoid}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVoidTarget(prev => prev ? { ...prev, quantityToVoid: Math.min(prev.item.quantity, prev.quantityToVoid + 1) } : null)}
                        disabled={voidTarget.quantityToVoid >= voidTarget.item.quantity}
                        className="px-2.5 py-1.5 hover:bg-slate-800 disabled:opacity-30 cursor-pointer font-bold text-slate-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {voidTarget.quantityToVoid === voidTarget.item.quantity 
                        ? '(Void entire item)' 
                        : `(Leaves ${voidTarget.item.quantity - voidTarget.quantityToVoid} on ticket)`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-600">
                  Voiding <strong>1 unit</strong> of this item.
                </div>
              )}

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-[11px] text-slate-200 block">
                  Cancellation Reason:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Guest changed mind',
                    'Ordered by mistake',
                    'Kitchen delay',
                    'Item unavailable'
                  ].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setVoidTarget(prev => prev ? { ...prev, reason: r } : null)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                        voidTarget.reason === r
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={voidTarget.reason}
                  onChange={e => setVoidTarget(prev => prev ? { ...prev, reason: e.target.value } : null)}
                  placeholder="Specify reason..."
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Audit notice */}
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/80 text-[10px] text-amber-200 leading-relaxed">
                <strong>Audit Notice:</strong> This item will be removed from the active running bill and marked as <strong>CANCELLED</strong> on the Kitchen KDS immediately. The original KOT ticket history is preserved.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoidTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-medium text-xs hover:bg-slate-800 cursor-pointer"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Void</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Payment Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        initialDiscountPercent={discountPercent}
        initialCustomDiscount={customDiscount}
      />
    </div>
  );
};
