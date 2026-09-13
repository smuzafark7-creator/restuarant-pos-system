import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  BranchId, 
  MenuItem, 
  RestaurantTable, 
  KOT, 
  KOTItem,
  Bill, 
  BillItem,
  Customer, 
  CartItem, 
  OrderType, 
  KOTStatus, 
  PaymentMethod, 
  SplitPaymentDetail, 
  ToastMessage,
  Branch,
  BillRequest,
  ItemServeType,
  KDSAlert,
  ItemStockStatus,
  DispatchedItemStats
} from '../types';
import { 
  BRANCHES, 
  DEMO_USERS, 
  INITIAL_MENU_ITEMS, 
  generateInitialTables, 
  INITIAL_KOTS, 
  INITIAL_BILLS, 
  INITIAL_CUSTOMERS, 
  BENCHMARK_STATS,
  INITIAL_BILL_REQUESTS 
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  currentBranch: BranchId;
  branches: Branch[];
  activeTab: string;
  menuItems: MenuItem[];
  categories: string[];
  tables: RestaurantTable[];
  branchTables: RestaurantTable[];
  kots: KOT[];
  bills: Bill[];
  customers: Customer[];
  
  // Cart state
  cart: CartItem[];
  cartOrderType: OrderType;
  cartTableNumber: string;
  cartCustomerName: string;
  cartCustomerMobile: string;
  cartSpecialNotes: string;
  cartPaidBill: Bill | null;
  cartSentKotId: string | null;
  cartDiscountPercent: number;
  setCartDiscountPercent: (p: number) => void;
  cartCustomDiscount: number;
  setCartCustomDiscount: (d: number) => void;
  
  // Modals & previews
  activeReceiptBill: Bill | null;
  isReceiptModalOpen: boolean;
  activeDetailsBill: Bill | null;
  isBillDetailsModalOpen: boolean;
  openBillDetailsModal: (bill: Bill) => void;
  closeBillDetailsModal: () => void;
  toasts: ToastMessage[];
  billSequence: number;

  // Actions
  login: (emailOrUsername: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  setBranch: (branchId: BranchId) => void;
  setActiveTab: (tab: string) => void;
  
  // Cart actions
  addToCart: (item: MenuItem, qty?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  updateCartItemNotes: (itemId: string, notes: string) => void;
  updateCartItemServeType: (itemId: string, serveType: ItemServeType) => void;
  removeFromCart: (itemId: string) => void;
  setCartItems: (items: CartItem[]) => void;
  clearCart: () => void;
  resetCartOrder: () => void;
  setCartPaidBill: (bill: Bill | null) => void;
  setCartSentKotId: (kotId: string | null) => void;
  setCartOrderType: (type: OrderType) => void;
  setCartTableNumber: (tableNum: string) => void;
  setCartCustomerName: (name: string) => void;
  setCartCustomerMobile: (mobile: string) => void;
  setCartSpecialNotes: (notes: string) => void;
  holdOrder: () => void;
  
  // Flow actions
  sendKOT: (overrideTableNumber?: string) => KOT | null;
  updateKOTStatus: (kotId: string, status: KOTStatus) => void;
  voidKOTItem: (kotId: string, itemIndex: number, voidQty?: number, reason?: string) => boolean;
  kdsAlerts: KDSAlert[];
  dismissKDSAlert: (alertId: string) => void;
  getActiveUnbilledKots: (tableNumber?: string, orderType?: OrderType, customerMobile?: string) => KOT[];
  generateBill: (paymentMethod: PaymentMethod, splitDetails?: SplitPaymentDetail, discountAmount?: number) => Bill | null;
  openReceiptModal: (bill: Bill) => void;
  closeReceiptModal: () => void;
  
  // Bill Request actions (Waiter / Cashier flow)
  billRequests: BillRequest[];
  pendingBillRequests: BillRequest[];
  requestBill: (tableNumber?: string, notes?: string) => BillRequest | null;
  cancelBillRequest: (requestId: string) => void;
  settleBillRequest: (requestId: string, paymentMethod?: PaymentMethod) => void;

  // Table actions
  tableSearchTerm: string;
  setTableSearchTerm: (term: string) => void;
  tableFloorFilter: string;
  setTableFloorFilter: (floor: string) => void;
  selectTableForPOS: (tableNumber: string) => void;
  updateTableStatus: (tableId: string, status: RestaurantTable['status']) => void;
  setTableStatusByNumber: (tableNumber: string, status: RestaurantTable['status']) => void;

  // Management actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleMenuItemAvailability: (id: string) => void;
  updateMenuItemStock: (id: string, stockStatus: ItemStockStatus, stockCount?: number) => void;
  dispatchedItemStats: DispatchedItemStats[];
  isKitchenDrawerOpen: boolean;
  setIsKitchenDrawerOpen: (open: boolean) => void;
  kitchenDrawerTab: 'active' | 'completed' | 'stock86' | 'dispatched' | 'settings';
  setKitchenDrawerTab: (tab: 'active' | 'completed' | 'stock86' | 'dispatched' | 'settings') => void;
  openKitchenDrawer: (tab?: 'active' | 'completed' | 'stock86' | 'dispatched' | 'settings') => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastVisit'>) => void;
  updateCustomer: (customer: Customer) => void;
  
  // Toast & reset
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;
  
  // Computed stats
  computedStats: {
    todaySales: number;
    totalOrders: number;
    dineInOrders: number;
    takeawayOrders: number;
    pendingKOTs: number;
    activeCookingKOTs: number;
    readyKOTs: number;
    paidBills: number;
    paymentBreakdown: { cash: number; upi: number; card: number };
    branchPerformance: { main: number; city: number; beach: number };
  };
  
  // Filtered views
  currentBranchInfo: Branch | null;
  filteredTables: RestaurantTable[];
  filteredKots: KOT[];
  filteredBills: Bill[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const LOCAL_STORAGE_KEY = 'zaffran_pos_storage_v1';
export const AUTH_STORAGE_KEY = 'zaffran_pos_auth_user';

// Helper to retrieve active authentication session from localStorage
const getInitialAuthUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email && parsed.role) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse auth user from storage:', err);
  }
  // The app must ALWAYS start on Login screen when not authenticated
  return null;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const loadStored = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  };

  const storedData = loadStored();

  // Primary Authentication State - Strictly loaded from AUTH_STORAGE_KEY (null if not logged in)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialAuthUser());
  
  const [currentBranch, setCurrentBranch] = useState<BranchId>(
    storedData?.currentBranch ?? 'main'
  );
  
  const [activeTab, setActiveTab] = useState<string>(
    storedData?.activeTab ?? 'dashboard'
  );

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (storedData?.menuItems && Array.isArray(storedData.menuItems)) {
      const storedMap = new Map<string, MenuItem>(storedData.menuItems.map((m: MenuItem) => [m.id, m]));
      const merged = INITIAL_MENU_ITEMS.map(initItem => {
        const existing = storedMap.get(initItem.id);
        if (existing) {
          return {
            ...existing,
            name: initItem.name || existing.name,
            variations: initItem.variations || existing.variations,
            stockStatus: existing.stockStatus || initItem.stockStatus || 'available',
            stockCount: existing.stockCount !== undefined ? existing.stockCount : initItem.stockCount,
            available: existing.stockStatus === 'sold_out' ? false : (existing.available ?? initItem.available ?? true),
          };
        }
        return initItem;
      });
      // Include any custom items created by the user
      storedData.menuItems.forEach((m: MenuItem) => {
        if (!merged.some(item => item.id === m.id)) {
          merged.push(m);
        }
      });
      return merged;
    }
    return INITIAL_MENU_ITEMS;
  });

  // Kitchen Drawer & Tools state
  const [isKitchenDrawerOpen, setIsKitchenDrawerOpen] = useState<boolean>(false);
  const [kitchenDrawerTab, setKitchenDrawerTab] = useState<'active' | 'completed' | 'stock86' | 'dispatched' | 'settings'>('active');

  const openKitchenDrawer = (tab?: 'active' | 'completed' | 'stock86' | 'dispatched' | 'settings') => {
    if (tab) {
      setKitchenDrawerTab(tab);
    }
    setIsKitchenDrawerOpen(true);
  };

  // Live Shift/Session Dispatched Tracking (Real-time item-level counter with Dine-in vs Takeaway Breakdown)
  const [dispatchedDishes, setDispatchedDishes] = useState<Record<string, { dineIn: number; takeaway: number }>>(() => {
    return {
      'Chicken Biryani': { dineIn: 9, takeaway: 5 }, // 14 Served (9 Dine-in | 5 Takeaway)
      'Butter Naan': { dineIn: 16, takeaway: 6 }, // 22 Served (16 Dine-in | 6 Takeaway)
      'Mutton Biryani': { dineIn: 5, takeaway: 2 }, // 7 Served (5 Dine-in | 2 Takeaway)
      'Paneer Tikka': { dineIn: 6, takeaway: 2 }, // 8 Served (6 Dine-in | 2 Takeaway)
      'Chicken 65': { dineIn: 8, takeaway: 3 }, // 11 Served (8 Dine-in | 3 Takeaway)
      'Garlic Naan': { dineIn: 10, takeaway: 4 }, // 14 Served (10 Dine-in | 4 Takeaway)
    };
  });

  const [dispatchedKotIds, setDispatchedKotIds] = useState<Set<string>>(new Set(['kot_10025']));

  const dispatchedItemStats = useMemo<DispatchedItemStats[]>(() => {
    return (Object.entries(dispatchedDishes) as [string, { dineIn: number; takeaway: number }][]).map(([name, counts]) => ({
      name,
      dineIn: counts.dineIn,
      takeaway: counts.takeaway,
      totalServed: counts.dineIn + counts.takeaway
    })).sort((a, b) => b.totalServed - a.totalServed);
  }, [dispatchedDishes]);

  const categories = useMemo<string[]>(() => {
    const list = menuItems || [];
    const unique = Array.from(new Set(list.map(i => i.category).filter(Boolean)));
    return ['All', ...unique];
  }, [menuItems]);

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    if (storedData?.tables && storedData.tables.length > 0) return storedData.tables;
    return [
      ...generateInitialTables('main'),
      ...generateInitialTables('city'),
      ...generateInitialTables('beach'),
    ];
  });

  const [kots, setKots] = useState<KOT[]>(() => {
    const list: KOT[] = storedData?.kots ?? INITIAL_KOTS;
    if (list.length < 15) {
      return INITIAL_KOTS;
    }
    const hasKot10025 = list.some(k => k.kotNumber === 'KOT-10025');
    const hasKot10026 = list.some(k => k.kotNumber === 'KOT-10026');
    if (!hasKot10025 || !hasKot10026) {
      const demoKots = INITIAL_KOTS.filter(k => k.kotNumber === 'KOT-10025' || k.kotNumber === 'KOT-10026');
      return [...demoKots, ...list];
    }
    return list;
  });

  const [bills, setBills] = useState<Bill[]>(
    storedData?.bills ?? INITIAL_BILLS
  );

  const [customers, setCustomers] = useState<Customer[]>(
    storedData?.customers ?? INITIAL_CUSTOMERS
  );

  // Table search & floor filter state
  const [tableSearchTerm, setTableSearchTerm] = useState<string>('');
  const [tableFloorFilter, setTableFloorFilter] = useState<string>('All');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOrderType, setCartOrderType] = useState<OrderType>('dine_in');
  const [cartTableNumber, setCartTableNumber] = useState<string>('Table 5');
  const [cartCustomerName, setCartCustomerName] = useState<string>('');
  const [cartCustomerMobile, setCartCustomerMobile] = useState<string>('');
  const [cartSpecialNotes, setCartSpecialNotes] = useState<string>('');
  const [cartPaidBill, setCartPaidBill] = useState<Bill | null>(storedData?.cartPaidBill ?? null);
  const [cartSentKotId, setCartSentKotId] = useState<string | null>(storedData?.cartSentKotId ?? null);
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [cartCustomDiscount, setCartCustomDiscount] = useState<number>(0);

  // Modals & Toasts
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [activeDetailsBill, setActiveDetailsBill] = useState<Bill | null>(null);
  const [isBillDetailsModalOpen, setIsBillDetailsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Bill Requests state (for Waiter Request Bill -> Cashier Collect Payment)
  const [billRequests, setBillRequests] = useState<BillRequest[]>(() => {
    if (storedData?.billRequests && storedData.billRequests.length > 0) {
      return storedData.billRequests;
    }
    return INITIAL_BILL_REQUESTS;
  });

  // KDS real-time cancellation alerts state
  const [kdsAlerts, setKdsAlerts] = useState<KDSAlert[]>([]);

  // Sequential counter tracker for next demo KOT and Bill (prompt asks for KOT #10025, Bill #INV-10025)
  const [kotSequence, setKotSequence] = useState<number>(() => {
    const stored = storedData?.kotSequence;
    return typeof stored === 'number' && stored >= 10027 ? stored : 10027;
  });
  const [billSequence, setBillSequence] = useState<number>(storedData?.billSequence ?? 10025);

  // Save to localStorage
  useEffect(() => {
    try {
      const stateToPersist = {
        currentUser,
        currentBranch,
        activeTab,
        menuItems,
        tables,
        kots,
        bills,
        customers,
        kotSequence,
        billSequence,
        cartPaidBill,
        cartSentKotId,
        billRequests
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch {
      // Ignored
    }
  }, [currentUser, currentBranch, activeTab, menuItems, tables, kots, bills, customers, kotSequence, billSequence, cartPaidBill, cartSentKotId, billRequests]);

  // Toast Helper
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString().slice(2, 6);
    const newToast: ToastMessage = { id, title, message, type, timestamp: Date.now() };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Methods
  const login = (emailOrUsername: string, password = ''): { success: boolean; error?: string } => {
    const normalizedInput = (emailOrUsername || '').trim().toLowerCase();
    const cleanPassword = password.trim();

    // Map username/email to valid demo accounts
    let userRole: 'owner' | 'cashier' | 'kitchen' | 'manager' | 'waiter' | null = null;
    let expectedPassword = '';
    let demoUserIndex = 0;

    if (normalizedInput === 'admin@restaurant.com' || normalizedInput === 'admin' || normalizedInput === 'owner') {
      userRole = 'owner';
      expectedPassword = 'admin123';
      demoUserIndex = 0;
    } else if (normalizedInput === 'cashier@restaurant.com' || normalizedInput === 'cashier') {
      userRole = 'cashier';
      expectedPassword = 'cashier123';
      demoUserIndex = 2;
    } else if (normalizedInput === 'kitchen@restaurant.com' || normalizedInput === 'kitchen') {
      userRole = 'kitchen';
      expectedPassword = 'kitchen123';
      demoUserIndex = 3;
    } else if (normalizedInput === 'manager@restaurant.com' || normalizedInput === 'manager') {
      userRole = 'manager';
      expectedPassword = 'manager123';
      demoUserIndex = 1;
    } else if (normalizedInput === 'waiter@restaurant.com' || normalizedInput === 'waiter') {
      userRole = 'waiter';
      expectedPassword = 'waiter123';
      demoUserIndex = 4;
    }

    if (!userRole || cleanPassword !== expectedPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    const matchedUser = DEMO_USERS[demoUserIndex];
    if (!matchedUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    // 1. Save authentication state in localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
    } catch (e) {
      console.error('Failed to save auth state in localStorage', e);
    }

    // 2. Set authenticated user in React state
    setCurrentUser(matchedUser);

    // 3. Initial Routing after login:
    // OWNER: Login -> Dashboard
    // CASHIER: Login -> POS
    // KITCHEN: Login -> Kitchen KDS
    // WAITER: Login -> Tables
    if (matchedUser.role === 'owner') {
      setActiveTab('dashboard');
      setCurrentBranch('all');
    } else if (matchedUser.role === 'cashier') {
      setActiveTab('pos');
      setCurrentBranch('main');
    } else if (matchedUser.role === 'kitchen') {
      setActiveTab('kitchen');
      setCurrentBranch('main');
    } else if (matchedUser.role === 'waiter') {
      setActiveTab('tables');
      setCurrentBranch('main');
    } else {
      setActiveTab('dashboard');
      setCurrentBranch('main');
    }

    showToast('Welcome back', `Logged in as ${matchedUser.name}`);
    return { success: true };
  };

  const logout = () => {
    // 1. Remove authentication from localStorage
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed.currentUser;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Error clearing auth from localStorage:', e);
    }

    // 2. Clear current user
    setCurrentUser(null);

    // 3. Reset active tab to default
    setActiveTab('dashboard');

    // 4. Redirect to Login & alert
    showToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  const setBranch = (branchId: BranchId) => {
    if (currentUser?.role !== 'owner' && branchId === 'all') {
      showToast('Restricted Access', 'Only the Owner can view consolidated branches data.', 'warning');
      return;
    }
    setCurrentBranch(branchId);
  };

  const handleSetActiveTab = (tab: string) => {
    if (currentUser?.role === 'waiter') {
      const allowed = ['dashboard', 'tables', 'pos', 'kot', 'kitchen'];
      if (!allowed.includes(tab)) {
        showToast('Restricted Access', 'Waiters do not have permission to access this section.', 'warning');
        return;
      }
    } else if (currentUser?.role === 'kitchen') {
      const allowed = ['kitchen', 'kot'];
      if (!allowed.includes(tab)) {
        showToast('Restricted Access', 'Kitchen display role is restricted to Kitchen KDS and KOT.', 'warning');
        return;
      }
    }
    setActiveTab(tab);
  };

  // Cart Operations
  const addToCart = (item: MenuItem, qty = 1) => {
    if (cartPaidBill) {
      showToast('Order Already Paid', `Invoice #${cartPaidBill.billNumber} is finalized. Send KOT or Start New Order.`, 'info');
      return;
    }

    const baseId = item.id.includes('_') ? item.id.split('_')[0] : item.id;
    const currentItem = (menuItems || []).find(m => m.id === baseId) || item;

    // Check Sold Out / 0 Stock
    const isSoldOut = !currentItem.available || currentItem.stockStatus === 'sold_out' || (currentItem.stockStatus === 'few_left' && (currentItem.stockCount ?? 0) <= 0);
    if (isSoldOut) {
      showToast('Item Unavailable', 'Item currently unavailable in kitchen', 'warning');
      return;
    }

    // Check "Few Left" limit
    if (currentItem.stockStatus === 'few_left' && typeof currentItem.stockCount === 'number') {
      const currentInCart = cart
        .filter(c => c.item.id === baseId || c.item.id.startsWith(`${baseId}_`))
        .reduce((sum, c) => sum + c.quantity, 0);

      const maxAllowed = currentItem.stockCount;
      if (currentInCart >= maxAllowed) {
        showToast('Stock Limit Reached', `Only ${maxAllowed} left in kitchen stock. Cannot add more.`, 'warning');
        return;
      }

      if (currentInCart + qty > maxAllowed) {
        qty = maxAllowed - currentInCart;
        showToast('Stock Limit Reached', `Only ${maxAllowed} left in kitchen stock. Adjusted quantity to ${qty}.`, 'info');
      }
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(c => c.item.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + qty
        };
        return copy;
      } else {
        return [...prev, { item, quantity: qty, serveType: 'DINE_IN' }];
      }
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    if (cartPaidBill) {
      showToast('Order Already Paid', `Invoice #${cartPaidBill.billNumber} is finalized. Send KOT or Start New Order.`, 'info');
      return;
    }

    if (delta > 0) {
      const baseId = itemId.includes('_') ? itemId.split('_')[0] : itemId;
      const currentItem = (menuItems || []).find(m => m.id === baseId);
      if (currentItem) {
        const isSoldOut = !currentItem.available || currentItem.stockStatus === 'sold_out' || (currentItem.stockStatus === 'few_left' && (currentItem.stockCount ?? 0) <= 0);
        if (isSoldOut) {
          showToast('Item Unavailable', 'Item currently unavailable in kitchen', 'warning');
          return;
        }

        if (currentItem.stockStatus === 'few_left' && typeof currentItem.stockCount === 'number') {
          const currentInCart = cart
            .filter(c => c.item.id === baseId || c.item.id.startsWith(`${baseId}_`))
            .reduce((sum, c) => sum + c.quantity, 0);

          if (currentInCart + delta > currentItem.stockCount) {
            showToast('Stock Limit Reached', `Only ${currentItem.stockCount} left in kitchen stock.`, 'warning');
            return;
          }
        }
      }
    }

    setCart(prev => {
      return prev
        .map(c => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, notes } : c));
  };

  const updateCartItemServeType = (itemId: string, serveType: ItemServeType) => {
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, serveType } : c));
  };

  const removeFromCart = (itemId: string) => {
    if (cartPaidBill) {
      showToast('Order Already Paid', `Invoice #${cartPaidBill.billNumber} is finalized. Send KOT or Start New Order.`, 'info');
      return;
    }
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const setCartItems = useCallback((items: CartItem[]) => {
    setCart(items);
  }, []);

  const clearCart = () => {
    setCart([]);
    setCartSpecialNotes('');
    setCartPaidBill(null);
    setCartSentKotId(null);
    setCartDiscountPercent(0);
    setCartCustomDiscount(0);
  };

  const resetCartOrder = () => {
    setCart([]);
    setCartSpecialNotes('');
    setCartCustomerName('');
    setCartCustomerMobile('');
    setCartPaidBill(null);
    setCartSentKotId(null);
    setCartOrderType('dine_in');
    setCartTableNumber('Table 1');
    setCartDiscountPercent(0);
    setCartCustomDiscount(0);
  };

  const holdOrder = () => {
    if (cartPaidBill) {
      showToast('Order is Paid', 'A paid order cannot be held. Send KOT or view receipt.', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Cart is empty', 'Add items to order before holding.', 'warning');
      return;
    }
    showToast('Order On Hold', `Held order for ${cartOrderType === 'dine_in' ? cartTableNumber : 'Takeaway'}`);
    clearCart();
  };

  const selectTableForPOS = (tableNumber: string) => {
    setCartTableNumber(tableNumber);
    setCartOrderType('dine_in');
    setActiveTab('pos');
  };

  // KOT Flow
  const sendKOT = (overrideTableNumber?: string): KOT | null => {
    if (cart.length === 0) {
      showToast('No items', 'Please add items before sending KOT.', 'warning');
      return null;
    }

    // Prevent duplicate KOT if already sent for this paid order
    if (cartPaidBill && cartSentKotId) {
      showToast('KOT Already Sent', `KOT was already sent to kitchen for invoice #${cartPaidBill.billNumber}.`, 'info');
      return null;
    }

    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const branchObj = BRANCHES.find(b => b.id === effectiveBranch) || BRANCHES[0];
    const kotNumberStr = `KOT-${kotSequence}`;
    const nextSeq = kotSequence + 1;
    setKotSequence(nextSeq);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalAmount = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    const isPrepaid = !!cartPaidBill;
    const effectiveTableNumber = overrideTableNumber || (cartOrderType === 'dine_in' ? cartTableNumber : undefined);

    const newKOT: KOT = {
      id: 'kot_' + Date.now(),
      kotNumber: kotNumberStr,
      branchId: branchObj.id,
      branchName: branchObj.name,
      tableNumber: effectiveTableNumber,
      orderType: overrideTableNumber ? 'dine_in' : cartOrderType,
      items: cart.map(c => ({
        menuItemId: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        rate: c.item.price,
        isVeg: c.item.isVeg,
        notes: c.notes,
        serveType: c.serveType || 'DINE_IN'
      })),
      status: 'new',
      createdAt: now.toISOString(),
      timeFormatted,
      specialInstructions: cartSpecialNotes,
      customerName: cartCustomerName || cartPaidBill?.customerName || undefined,
      customerMobile: cartCustomerMobile || cartPaidBill?.customerMobile || undefined,
      totalAmount,
      isBilled: isPrepaid,
      billId: cartPaidBill?.id,
      billedAt: isPrepaid ? now.toISOString() : undefined
    };

    // Update KOT list
    setKots(prev => [newKOT, ...prev]);

    // If pre-paid, link KOT to the bill in bills history
    if (cartPaidBill) {
      setBills(prev =>
        prev.map(b =>
          b.id === cartPaidBill.id
            ? {
                ...b,
                kotNumber: kotNumberStr,
                kotNumbers: [kotNumberStr]
              }
            : b
        )
      );
      setCartPaidBill(prev =>
        prev
          ? {
              ...prev,
              kotNumber: kotNumberStr,
              kotNumbers: [kotNumberStr]
            }
          : null
      );
      setCartSentKotId(newKOT.id);
    }

    // Update table status if dine_in
    const activeTable = effectiveTableNumber;
    if ((cartOrderType === 'dine_in' || overrideTableNumber) && activeTable) {
      setTables(prev =>
        prev.map(tbl => {
          if (tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === activeTable.toLowerCase()) {
            const previousAmt = tbl.status === 'occupied' && tbl.currentAmount ? tbl.currentAmount : 0;
            return {
              ...tbl,
              status: 'occupied',
              activeKotId: newKOT.id,
              currentAmount: previousAmt + totalAmount,
              guestName: cartCustomerName || tbl.guestName || undefined,
              seatedAt: tbl.seatedAt || timeFormatted
            };
          }
          return tbl;
        })
      );
    }

    // Decrement stock for Few Left items
    setMenuItems(prev =>
      prev.map(m => {
        const baseId = m.id;
        const orderedQty = cart
          .filter(c => c.item.id === baseId || c.item.id.startsWith(`${baseId}_`))
          .reduce((sum, c) => sum + c.quantity, 0);

        if (orderedQty > 0 && m.stockStatus === 'few_left' && typeof m.stockCount === 'number') {
          const nextCount = Math.max(0, m.stockCount - orderedQty);
          return {
            ...m,
            stockCount: nextCount,
            stockStatus: nextCount === 0 ? 'sold_out' : 'few_left',
            available: nextCount > 0,
          };
        }
        return m;
      })
    );

    // Clear new punch items from cart
    setCart([]);
    setCartSpecialNotes('');

    showToast(
      'KOT Created & Sent',
      `${kotNumberStr} sent to Kitchen KDS • Status: New${isPrepaid ? ' • PAID' : ''}`,
      'success'
    );
    return newKOT;
  };

  const updateKOTStatus = (kotId: string, status: KOTStatus) => {
    setKots(prev =>
      prev.map(k => {
        if (k.id === kotId) {
          const updated = { ...k, status };
          if (status === 'preparing' && !k.startedAt) {
            updated.startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          if (status === 'ready' && !k.readyAt) {
            updated.readyAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return updated;
        }
        return k;
      })
    );

    const targetKot = kots.find(k => k.id === kotId);
    if (targetKot) {
      // Live Shift/Session Dispatched Tracking (Dine-in vs Takeaway Breakdown)
      if (status === 'ready' || status === 'served') {
        if (!dispatchedKotIds.has(kotId)) {
          setDispatchedKotIds(prev => new Set(prev).add(kotId));
          const isTakeaway = targetKot.orderType === 'takeaway' || targetKot.orderType === 'parcel';
          setDispatchedDishes(prev => {
            const next = { ...prev };
            targetKot.items.forEach(item => {
              if (item.status !== 'voided') {
                const itemParcel = item.serveType === 'PARCEL' || isTakeaway;
                const current = next[item.name] || { dineIn: 0, takeaway: 0 };
                next[item.name] = {
                  dineIn: current.dineIn + (itemParcel ? 0 : item.quantity),
                  takeaway: current.takeaway + (itemParcel ? item.quantity : 0)
                };
              }
            });
            return next;
          });
        }
      }
      if (status === 'ready') {
        showToast('KOT Ready!', `${targetKot.kotNumber} for ${targetKot.tableNumber || 'Takeaway'} is ready for pickup!`);
        // If table exists, mark as ready (unless already billing)
        if (targetKot.tableNumber) {
          setTables(prev =>
            prev.map(tbl =>
              tbl.branchId === targetKot.branchId && tbl.name.toLowerCase() === targetKot.tableNumber?.toLowerCase()
                ? { ...tbl, status: tbl.status === 'billing' ? 'billing' : 'ready' }
                : tbl
            )
          );
        }
      } else if (status === 'preparing') {
        showToast('Kitchen Cooking', `Kitchen started preparing ${targetKot.kotNumber}`);
      } else if (status === 'served') {
        showToast('Order Served', `${targetKot.kotNumber} marked as served to guests.`);
        if (targetKot.tableNumber) {
          setTables(prev =>
            prev.map(tbl =>
              tbl.branchId === targetKot.branchId && tbl.name.toLowerCase() === targetKot.tableNumber?.toLowerCase()
                ? { ...tbl, status: tbl.status === 'billing' ? 'billing' : 'occupied' }
                : tbl
            )
          );
        }
      }
    }
  };

  // Void/Cancel an item in an already sent KOT (preserves audit history, updates running bill & table amount, notifies KDS)
  const voidKOTItem = (
    kotId: string,
    itemIndex: number,
    voidQty?: number,
    reason = 'Customer requested cancellation'
  ): boolean => {
    const targetKot = kots.find(k => k.id === kotId);
    if (!targetKot) {
      showToast('KOT Not Found', 'Could not locate the specified kitchen ticket.', 'error');
      return false;
    }

    if (targetKot.isBilled) {
      showToast('Action Restricted', 'This KOT has already been finalized and billed. Cannot void items.', 'warning');
      return false;
    }

    const itemToVoid = targetKot.items[itemIndex];
    if (!itemToVoid) {
      showToast('Item Not Found', 'Item line does not exist in this KOT.', 'error');
      return false;
    }

    if (itemToVoid.status === 'voided') {
      showToast('Already Voided', 'This item is already marked as voided.', 'info');
      return false;
    }

    const qtyToVoid = Math.min(itemToVoid.quantity, Math.max(1, voidQty ?? itemToVoid.quantity));
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const voidedByName = currentUser?.name || 'Waiter';

    let updatedItems: KOTItem[] = [];

    if (qtyToVoid >= itemToVoid.quantity) {
      // Void the entire item line
      updatedItems = targetKot.items.map((it, idx) => {
        if (idx === itemIndex) {
          return {
            ...it,
            status: 'voided' as const,
            voidedAt: timeFormatted,
            voidedBy: voidedByName,
            voidReason: reason
          };
        }
        return it;
      });
    } else {
      // Partial void: split into active remaining part and voided part
      const remainingActive: KOTItem = {
        ...itemToVoid,
        quantity: itemToVoid.quantity - qtyToVoid,
        status: 'active' as const
      };
      const voidedPart: KOTItem = {
        ...itemToVoid,
        quantity: qtyToVoid,
        status: 'voided' as const,
        voidedAt: timeFormatted,
        voidedBy: voidedByName,
        voidReason: reason,
        originalQuantity: itemToVoid.quantity
      };

      updatedItems = [];
      targetKot.items.forEach((it, idx) => {
        if (idx === itemIndex) {
          updatedItems.push(remainingActive);
          updatedItems.push(voidedPart);
        } else {
          updatedItems.push(it);
        }
      });
    }

    // Recalculate KOT active total amount
    const newActiveTotal = updatedItems.reduce((sum, it) => {
      if (it.status === 'voided') return sum;
      return sum + (it.rate * it.quantity);
    }, 0);

    const allItemsVoided = updatedItems.every(it => it.status === 'voided');

    setKots(prev =>
      prev.map(k => {
        if (k.id === kotId) {
          return {
            ...k,
            items: updatedItems,
            totalAmount: newActiveTotal,
            hasVoidedItems: true,
            status: allItemsVoided ? 'cancelled' : k.status
          };
        }
        return k;
      })
    );

    // If dining in table, update table's currentAmount (reduce by voided value)
    const voidedAmount = qtyToVoid * itemToVoid.rate;
    if (targetKot.orderType === 'dine_in' && targetKot.tableNumber) {
      setTables(prev =>
        prev.map(tbl => {
          if (tbl.branchId === targetKot.branchId && tbl.name.toLowerCase() === targetKot.tableNumber?.toLowerCase()) {
            const newTableAmt = Math.max(0, (tbl.currentAmount || 0) - voidedAmount);
            return {
              ...tbl,
              currentAmount: newTableAmt
            };
          }
          return tbl;
        })
      );
    }

    // Add immediate alert for KDS
    const alertId = 'alert_' + Date.now();
    const newAlert: KDSAlert = {
      id: alertId,
      kotId: targetKot.id,
      kotNumber: targetKot.kotNumber,
      tableNumber: targetKot.tableNumber,
      itemName: itemToVoid.name,
      quantity: qtyToVoid,
      voidedBy: voidedByName,
      time: timeFormatted,
      reason,
      dismissed: false
    };
    setKdsAlerts(prev => [newAlert, ...prev]);

    showToast(
      'Item Voided & KDS Notified',
      `${qtyToVoid}x ${itemToVoid.name} cancelled on ${targetKot.kotNumber}. Notified Kitchen KDS.`,
      'info'
    );

    return true;
  };

  const dismissKDSAlert = (alertId: string) => {
    setKdsAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Query active unbilled KOTs for a dining session or takeaway order
  const getActiveUnbilledKots = useCallback((
    tableNumber?: string,
    orderType?: OrderType,
    customerMobile?: string
  ): KOT[] => {
    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const targetType = orderType || cartOrderType;
    const targetTable = tableNumber || (targetType === 'dine_in' ? cartTableNumber : undefined);
    const targetMobile = customerMobile || cartCustomerMobile;

    if (targetType === 'dine_in') {
      if (!targetTable) return [];
      return kots.filter(
        k => k.branchId === effectiveBranch &&
             k.orderType === 'dine_in' &&
             k.tableNumber?.toLowerCase() === targetTable.toLowerCase() &&
             !k.isBilled &&
             k.status !== 'cancelled'
      );
    } else {
      // Takeaway or parcel
      return kots.filter(
        k => k.branchId === effectiveBranch &&
             k.orderType === targetType &&
             !k.isBilled &&
             k.status !== 'cancelled' &&
             (!targetMobile || k.customerMobile === targetMobile)
      );
    }
  }, [currentBranch, cartOrderType, cartTableNumber, cartCustomerMobile, kots]);

  // Generate Bill & Payment Recording
  const generateBill = (
    paymentMethod: PaymentMethod,
    splitDetails?: SplitPaymentDetail,
    discountAmount = 0
  ): Bill | null => {
    // Permission check: Waiter is strictly forbidden from collecting payment or finalizing tax invoices
    if (currentUser?.role === 'waiter') {
      showToast('Action Restricted', 'Waiters are not permitted to collect payment or finalize tax invoices. Please use Request Bill.', 'warning');
      return null;
    }

    // If order was already paid, do not create a second bill
    if (cartPaidBill) {
      showToast('Order Already Paid', `Order is already finalized under invoice #${cartPaidBill.billNumber}.`, 'info');
      return cartPaidBill;
    }

    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const branchObj = BRANCHES.find(b => b.id === effectiveBranch) || BRANCHES[0];

    // 1. Retrieve all active unbilled KOTs for this dining session / table
    const activeKots = getActiveUnbilledKots(cartTableNumber, cartOrderType, cartCustomerMobile);

    const billItems: BillItem[] = [];

    // Helper to merge duplicate items with same name, rate & serveType (summing quantities)
    const addOrMergeBillItem = (id: string, name: string, quantity: number, rate: number, serveType: ItemServeType = 'DINE_IN') => {
      const existing = billItems.find(
        b => b.name.toLowerCase() === name.toLowerCase() && b.rate === rate && (b.serveType || 'DINE_IN') === serveType
      );
      if (existing) {
        existing.quantity += quantity;
        existing.amount = existing.quantity * existing.rate;
      } else {
        billItems.push({
          id,
          name,
          quantity,
          rate,
          amount: rate * quantity,
          serveType
        });
      }
    };

    // 2. Combine all items from every unbilled KOT
    if (activeKots.length > 0) {
      activeKots.forEach(kot => {
        kot.items.forEach((it, idx) => {
          if (it.status === 'voided') return; // Exclude voided items from bill
          addOrMergeBillItem(
            it.menuItemId || `${kot.id}_item_${idx}`,
            it.name,
            it.quantity,
            it.rate,
            it.serveType || 'DINE_IN'
          );
        });
      });

      // Also include any unsent items currently in the cart
      if (cart.length > 0) {
        cart.forEach(c => {
          addOrMergeBillItem(c.item.id, c.item.name, c.quantity, c.item.price, c.serveType || 'DINE_IN');
        });
      }
    } else if (cart.length > 0) {
      cart.forEach(c => {
        addOrMergeBillItem(c.item.id, c.item.name, c.quantity, c.item.price, c.serveType || 'DINE_IN');
      });
    }

    if (billItems.length === 0) {
      showToast('No items to bill', 'Add items or select an active table with unbilled KOTs to generate bill.', 'error');
      return null;
    }

    const subtotal = billItems.reduce((s, i) => s + i.amount, 0);
    const gstPercent = 5;
    const gstAmount = Math.round((subtotal * gstPercent) / 100);
    const grandTotal = Math.max(0, subtotal + gstAmount - discountAmount);

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const billNumberStr = `INV-${billSequence}`;
    setBillSequence(prev => prev + 1);

    // KOT numbers from the active KOTs combined in this bill
    const kotNumbersList = activeKots.map(k => k.kotNumber);
    const kotNumberStr = kotNumbersList.length > 0 ? kotNumbersList.join(', ') : undefined;

    // Infer customer name / mobile if not set in cart
    const effectiveCustomerName = cartCustomerName || activeKots.find(k => k.customerName)?.customerName || 'Walk-in Guest';
    const effectiveCustomerMobile = cartCustomerMobile || activeKots.find(k => k.customerMobile)?.customerMobile || undefined;

    const newBill: Bill = {
      id: 'bill_' + Date.now(),
      billNumber: billNumberStr,
      kotNumber: kotNumberStr,
      kotNumbers: kotNumbersList.length > 0 ? kotNumbersList : undefined,
      branchId: branchObj.id,
      branchName: branchObj.name,
      date,
      time,
      tableNumber: cartOrderType === 'dine_in' ? cartTableNumber : undefined,
      orderType: cartOrderType,
      customerName: effectiveCustomerName,
      customerMobile: effectiveCustomerMobile,
      items: billItems,
      subtotal,
      gstPercent,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMethod,
      splitDetails: paymentMethod === 'split' ? splitDetails : undefined,
      status: paymentMethod === 'due' ? 'unpaid' : 'paid',
      cashierName: currentUser?.name || 'Cashier'
    };

    // Prepend to bills history
    setBills(prev => [newBill, ...prev]);

    // Mark all included KOTs as billed/settled
    const includedKotIds = activeKots.map(k => k.id);
    if (includedKotIds.length > 0) {
      setKots(prev =>
        prev.map(k => {
          if (includedKotIds.includes(k.id)) {
            return {
              ...k,
              isBilled: true,
              billId: newBill.id,
              billedAt: now.toISOString(),
              status: (k.status === 'new' || k.status === 'preparing' || k.status === 'ready') ? 'served' : k.status
            };
          }
          return k;
        })
      );
    }

    // Free up table if dine_in and settle any pending bill request
    if (cartOrderType === 'dine_in' && cartTableNumber) {
      // Settle any pending bill request for this table
      setBillRequests(prev =>
        prev.map(r => {
          if (
            r.branchId === effectiveBranch &&
            r.tableNumber.toLowerCase() === cartTableNumber.toLowerCase() &&
            r.status === 'pending'
          ) {
            return {
              ...r,
              status: 'settled',
              billId: newBill.id,
              billNumber: newBill.billNumber
            };
          }
          return r;
        })
      );

      setTables(prev =>
        prev.map(tbl => {
          if (tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === cartTableNumber.toLowerCase()) {
            return {
              ...tbl,
              status: 'available',
              activeKotId: undefined,
              activeBillId: undefined,
              currentAmount: 0,
              seatedAt: undefined,
              guestCount: undefined,
              guestName: undefined,
              billRequested: false,
              billRequestedAt: undefined,
              billRequestedBy: undefined
            };
          }
          return tbl;
        })
      );
    }

    // Update customer stats if customer mobile exists
    if (cartCustomerMobile) {
      setCustomers(prev => {
        const existing = prev.find(c => c.mobile === cartCustomerMobile);
        if (existing) {
          return prev.map(c =>
            c.mobile === cartCustomerMobile
              ? {
                  ...c,
                  totalOrders: c.totalOrders + 1,
                  totalSpent: c.totalSpent + grandTotal,
                  lastVisit: date
                }
              : c
          );
        } else {
          return [
            ...prev,
            {
              id: 'cust_' + Date.now(),
              name: cartCustomerName || 'Guest',
              mobile: cartCustomerMobile,
              totalOrders: 1,
              totalSpent: grandTotal,
              lastVisit: date,
              favoriteBranch: branchObj.name
            }
          ];
        }
      });
    }

    // Pre-paid takeaway/parcel workflow:
    // If takeaway or parcel and no KOT was sent prior to billing, keep order available as PAID - READY TO SEND.
    const isTakeawayOrParcel = cartOrderType === 'takeaway' || cartOrderType === 'parcel';
    const isPrepaidOrder = isTakeawayOrParcel && activeKots.length === 0;

    if (isPrepaidOrder) {
      setCartPaidBill(newBill);
      setCartSentKotId(null);
    } else {
      clearCart();
      setCartPaidBill(null);
      setCartSentKotId(null);
    }

    // Show thermal receipt modal automatically for confirmation
    setActiveReceiptBill(newBill);
    setIsReceiptModalOpen(true);

    showToast('Payment successful', `Bill #${billNumberStr} marked as PAID via ${paymentMethod.toUpperCase()}`);
    return newBill;
  };

  const openReceiptModal = (bill: Bill) => {
    setActiveReceiptBill(bill);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  const openBillDetailsModal = (bill: Bill) => {
    setActiveDetailsBill(bill);
    setIsBillDetailsModalOpen(true);
  };

  const closeBillDetailsModal = () => {
    setIsBillDetailsModalOpen(false);
  };

  // Bill Request actions (Waiter -> Cashier settlement flow)
  const requestBill = (tableNum?: string, notes?: string): BillRequest | null => {
    const targetTableNum = tableNum || cartTableNumber;
    if (!targetTableNum) {
      showToast('No Table Selected', 'Please select a table to request a bill.', 'warning');
      return null;
    }

    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    const branchObj = BRANCHES.find(b => b.id === effectiveBranch) || BRANCHES[0];

    // Find active unbilled KOTs for this table
    const unbilledKots = kots.filter(
      k => k.branchId === effectiveBranch &&
           k.orderType === 'dine_in' &&
           k.tableNumber?.toLowerCase() === targetTableNum.toLowerCase() &&
           !k.isBilled &&
           k.status !== 'cancelled'
    );

    let baseAmount = unbilledKots.reduce((sum, k) => sum + k.totalAmount, 0);
    if (baseAmount === 0 && cart.length > 0 && cartTableNumber.toLowerCase() === targetTableNum.toLowerCase()) {
      baseAmount = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
    }

    const grandTotalWithTax = Math.round(baseAmount * 1.05);

    const existingPending = billRequests.find(
      r => r.branchId === effectiveBranch &&
           r.tableNumber.toLowerCase() === targetTableNum.toLowerCase() &&
           r.status === 'pending'
    );

    if (existingPending) {
      showToast('Bill Already Requested', `Cashier was already notified for ${targetTableNum} at ${existingPending.requestedAt}.`, 'info');
      return existingPending;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRequest: BillRequest = {
      id: 'req_' + Date.now(),
      tableNumber: targetTableNum,
      branchId: effectiveBranch,
      branchName: branchObj.name,
      orderType: 'dine_in',
      requestedBy: currentUser?.name || 'Waiter',
      requestedByRole: currentUser?.role || 'waiter',
      requestedAt: timeStr,
      status: 'pending',
      kotNumbers: unbilledKots.map(k => k.kotNumber),
      totalAmount: grandTotalWithTax || baseAmount || 0,
      customerName: cartCustomerName || unbilledKots[0]?.customerName,
      customerMobile: cartCustomerMobile || unbilledKots[0]?.customerMobile,
      notes: notes || cartSpecialNotes
    };

    setBillRequests(prev => [newRequest, ...prev]);

    // Mark table status as 'billing'
    setTables(prev =>
      prev.map(tbl => {
        if (tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === targetTableNum.toLowerCase()) {
          return {
            ...tbl,
            status: 'billing',
            billRequested: true,
            billRequestedAt: timeStr,
            billRequestedBy: currentUser?.name || 'Waiter'
          };
        }
        return tbl;
      })
    );

    showToast('Bill Requested', `Cashier desk notified for ${targetTableNum} (Approx. ₹${newRequest.totalAmount}). Status updated to BILL REQUESTED.`);
    return newRequest;
  };

  const cancelBillRequest = (requestId: string) => {
    const target = billRequests.find(r => r.id === requestId);
    if (!target) return;
    setBillRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r));
    setTables(prev =>
      prev.map(tbl => {
        if (
          tbl.branchId === target.branchId &&
          tbl.name.toLowerCase() === target.tableNumber.toLowerCase() &&
          tbl.status === 'billing'
        ) {
          return {
            ...tbl,
            status: 'occupied',
            billRequested: false,
            billRequestedAt: undefined,
            billRequestedBy: undefined
          };
        }
        return tbl;
      })
    );
    showToast('Request Cancelled', `Bill request for ${target.tableNumber} cancelled.`);
  };

  const settleBillRequest = (requestId: string, paymentMethod: PaymentMethod = 'cash') => {
    const target = billRequests.find(r => r.id === requestId);
    if (!target) return;

    const effectiveBranch = target.branchId;
    const now = new Date();
    const nextSeq = billSequence;
    setBillSequence(prev => prev + 1);
    const billNum = `INV-${nextSeq}`;

    // Find table
    const table = tables.find(
      t => t.branchId === effectiveBranch && t.name.toLowerCase() === target.tableNumber.toLowerCase()
    );

    // Find active KOTs for this table
    const tableKots = kots.filter(
      k => k.branchId === effectiveBranch &&
           k.tableNumber &&
           k.tableNumber.toLowerCase() === target.tableNumber.toLowerCase() &&
           !k.isBilled
    );

    // Gather items from KOTs or generate a dining order item
    let billItems = tableKots.flatMap(k => k.items);
    if (billItems.length === 0) {
      billItems = [
        {
          id: `item_${Date.now()}`,
          name: `${target.tableNumber} Dining Order`,
          quantity: 1,
          price: target.totalAmount,
          category: 'Dining'
        }
      ];
    }

    const newBill: Bill = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      billNumber: billNum,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      branchId: effectiveBranch,
      branchName: BRANCHES.find(b => b.id === effectiveBranch)?.name || 'Main Branch',
      orderType: 'dine_in',
      tableNumber: target.tableNumber,
      customerName: table?.guestName || 'Walk-in Guest',
      items: billItems,
      subtotal: target.totalAmount,
      gstPercent: 5,
      gstAmount: 0,
      discountAmount: 0,
      grandTotal: target.totalAmount,
      paymentMethod,
      status: 'paid',
      cashierName: currentUser?.name || 'Cashier'
    };

    setBills(prev => [newBill, ...prev]);

    // Mark KOTs as billed/settled
    if (tableKots.length > 0) {
      const kotIds = tableKots.map(k => k.id);
      setKots(prev =>
        prev.map(k => {
          if (kotIds.includes(k.id)) {
            return {
              ...k,
              isBilled: true,
              billId: newBill.id,
              billedAt: now.toISOString(),
              status: 'served'
            };
          }
          return k;
        })
      );
    }

    // Mark bill request as settled
    setBillRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'settled', billId: newBill.id, billNumber: newBill.billNumber }
          : r
      )
    );

    // Free up table
    setTables(prev =>
      prev.map(tbl => {
        if (tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === target.tableNumber.toLowerCase()) {
          return {
            ...tbl,
            status: 'available',
            currentAmount: 0,
            guestCount: undefined,
            guestName: undefined,
            seatedAt: undefined,
            billRequested: false,
            billRequestedAt: undefined,
            billRequestedBy: undefined
          };
        }
        return tbl;
      })
    );

    showToast(
      'Payment Settled',
      `${target.tableNumber} bill of ₹${target.totalAmount.toLocaleString('en-IN')} settled via ${paymentMethod.toUpperCase()}. Table is now Available.`,
      'success'
    );
  };

  const pendingBillRequests = useMemo(() => {
    return billRequests.filter(
      r => r.status === 'pending' && (currentBranch === 'all' || r.branchId === currentBranch)
    );
  }, [billRequests, currentBranch]);

  const updateTableStatus = useCallback((tableId: string, status: RestaurantTable['status']) => {
    setTables(prev => {
      const existing = prev.find(tbl => tbl.id === tableId);
      if (existing && existing.status === status) {
        return prev;
      }
      return prev.map(tbl => (tbl.id === tableId ? { ...tbl, status } : tbl));
    });
  }, []);

  const setTableStatusByNumber = useCallback((tableNumber: string, status: RestaurantTable['status']) => {
    const effectiveBranch = currentBranch === 'all' ? 'main' : currentBranch;
    setTables(prev => {
      const existing = prev.find(
        tbl => tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === tableNumber.toLowerCase()
      );
      if (existing && existing.status === status) {
        return prev;
      }
      return prev.map(tbl =>
        tbl.branchId === effectiveBranch && tbl.name.toLowerCase() === tableNumber.toLowerCase()
          ? { ...tbl, status }
          : tbl
      );
    });
  }, [currentBranch]);

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'item_' + Date.now()
    };
    setMenuItems(prev => [newItem, ...prev]);
    showToast('Menu Item Added', `${newItem.name} has been added to ${newItem.category}`);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(m => (m.id === item.id ? item : m)));
    showToast('Item Updated', `${item.name} details saved`);
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextAvail = !m.available;
          const nextStatus: ItemStockStatus = nextAvail ? 'available' : 'sold_out';
          const updated: MenuItem = {
            ...m,
            available: nextAvail,
            stockStatus: nextStatus,
            stockCount: nextAvail ? undefined : 0,
          };
          showToast(
            nextAvail ? 'Item Restocked' : 'Item 86-ed (Sold Out)',
            `${m.name} is now ${nextAvail ? 'AVAILABLE' : 'SOLD OUT (86)'}.`,
            nextAvail ? 'success' : 'warning'
          );
          return updated;
        }
        return m;
      })
    );
  };

  const updateMenuItemStock = (id: string, stockStatus: ItemStockStatus, stockCount?: number) => {
    setMenuItems(prev =>
      prev.map(m => {
        if (m.id === id) {
          let count = stockCount;
          let isAvail = true;
          if (stockStatus === 'sold_out') {
            count = 0;
            isAvail = false;
          } else if (stockStatus === 'few_left') {
            count = typeof stockCount === 'number' ? Math.max(0, stockCount) : (m.stockCount ?? 5);
            isAvail = count > 0;
          } else {
            // available
            count = undefined;
            isAvail = true;
          }
          const updated: MenuItem = {
            ...m,
            stockStatus,
            stockCount: count,
            available: isAvail,
          };
          showToast(
            stockStatus === 'sold_out'
              ? 'Item 86-ed (Sold Out)'
              : stockStatus === 'few_left'
              ? 'Stock Updated: Few Left'
              : 'Item Available',
            stockStatus === 'sold_out'
              ? `${m.name} is now marked SOLD OUT (86) across POS & Waiters.`
              : stockStatus === 'few_left'
              ? `${m.name} set to Few Left: ${count} plates remaining.`
              : `${m.name} is now Available.`,
            stockStatus === 'sold_out' ? 'warning' : 'success'
          );
          return updated;
        }
        return m;
      })
    );
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastVisit'>) => {
    const newCust: Customer = {
      ...customer,
      id: 'cust_' + Date.now(),
      totalOrders: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    showToast('Customer Added', `${newCust.name} added successfully`);
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast('Customer Updated', `${updated.name}'s details saved`);
  };

  const resetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentUser(DEMO_USERS[0]);
    setCurrentBranch('main');
    setActiveTab('dashboard');
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables([
      ...generateInitialTables('main'),
      ...generateInitialTables('city'),
      ...generateInitialTables('beach'),
    ]);
    setKots(INITIAL_KOTS);
    setBills(INITIAL_BILLS);
    setCustomers(INITIAL_CUSTOMERS);
    setCart([]);
    setCartTableNumber('Table 5');
    setCartPaidBill(null);
    setCartSentKotId(null);
    setKotSequence(10025);
    setBillSequence(10025);
    showToast('Demo Data Reset', 'Restored to clean demo scenario.');
  };

  // Filtered views based on branch selection
  const currentBranchInfo = useMemo(() => {
    if (currentBranch === 'all') return null;
    return BRANCHES.find(b => b.id === currentBranch) || null;
  }, [currentBranch]);

  const filteredTables = useMemo(() => {
    if (currentBranch === 'all') return tables;
    return tables.filter(t => t.branchId === currentBranch);
  }, [tables, currentBranch]);

  const filteredKots = useMemo(() => {
    if (currentBranch === 'all') return kots;
    return kots.filter(k => k.branchId === currentBranch);
  }, [kots, currentBranch]);

  const filteredBills = useMemo(() => {
    if (currentBranch === 'all') return bills;
    return bills.filter(b => b.branchId === currentBranch);
  }, [bills, currentBranch]);

  // Dynamically compute stats from seed benchmark plus any live bills created during session
  const computedStats = useMemo(() => {
    // Base benchmark figures
    const isConsolidated = currentBranch === 'all';
    const base = isConsolidated 
      ? BENCHMARK_STATS.consolidated 
      : BENCHMARK_STATS[currentBranch as 'main' | 'city' | 'beach'];

    // Additional live bills created beyond initial seed bills
    const initialBillIds = new Set(INITIAL_BILLS.map(b => b.id));
    const newBills = bills.filter(b => !initialBillIds.has(b.id));

    let liveSales = 0;
    let liveOrders = 0;
    let liveDineIn = 0;
    let liveTakeaway = 0;
    let liveCash = 0;
    let liveUpi = 0;
    let liveCard = 0;
    const branchAdditions = { main: 0, city: 0, beach: 0 };

    newBills.forEach(b => {
      const matchBranch = isConsolidated || b.branchId === currentBranch;
      if (matchBranch) {
        liveSales += b.grandTotal;
        liveOrders += 1;
        if (b.orderType === 'dine_in') liveDineIn += 1;
        else liveTakeaway += 1;

        if (b.paymentMethod === 'cash') liveCash += b.grandTotal;
        else if (b.paymentMethod === 'upi') liveUpi += b.grandTotal;
        else if (b.paymentMethod === 'card') liveCard += b.grandTotal;
        else if (b.paymentMethod === 'split' && b.splitDetails) {
          liveCash += b.splitDetails.cash || 0;
          liveUpi += b.splitDetails.upi || 0;
          liveCard += b.splitDetails.card || 0;
        }
      }
      if (b.branchId === 'main') branchAdditions.main += b.grandTotal;
      if (b.branchId === 'city') branchAdditions.city += b.grandTotal;
      if (b.branchId === 'beach') branchAdditions.beach += b.grandTotal;
    });

    const pendingKotsCount = filteredKots.filter(k => k.status === 'new' && !k.isBilled).length;
    const activeCookingCount = filteredKots.filter(k => k.status === 'preparing' && !k.isBilled).length;
    const readyKotsCount = filteredKots.filter(k => k.status === 'ready' && !k.isBilled).length;

    return {
      todaySales: base.todaySales + liveSales,
      totalOrders: base.totalOrders + liveOrders,
      dineInOrders: base.dineInOrders + liveDineIn,
      takeawayOrders: base.takeawayOrders + liveTakeaway,
      pendingKOTs: pendingKotsCount,
      activeCookingKOTs: activeCookingCount,
      readyKOTs: readyKotsCount,
      paidBills: (isConsolidated ? BENCHMARK_STATS.consolidated.paidBills : BENCHMARK_STATS[currentBranch as 'main'|'city'|'beach'].paidBills) + newBills.filter(b => isConsolidated || b.branchId === currentBranch).length,
      paymentBreakdown: {
        cash: base.paymentBreakdown.cash + liveCash,
        upi: base.paymentBreakdown.upi + liveUpi,
        card: base.paymentBreakdown.card + liveCard
      },
      branchPerformance: {
        main: BENCHMARK_STATS.consolidated.branchPerformance.main + branchAdditions.main,
        city: BENCHMARK_STATS.consolidated.branchPerformance.city + branchAdditions.city,
        beach: BENCHMARK_STATS.consolidated.branchPerformance.beach + branchAdditions.beach
      }
    };
  }, [currentBranch, bills, filteredKots]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentBranch,
        branches: BRANCHES,
        activeTab,
        menuItems,
        categories,
        tables,
        branchTables: filteredTables,
        kots,
        bills,
        customers,
        cart,
        cartOrderType,
        cartTableNumber,
        cartCustomerName,
        cartCustomerMobile,
        cartSpecialNotes,
        cartPaidBill,
        cartSentKotId,
        cartDiscountPercent,
        setCartDiscountPercent,
        cartCustomDiscount,
        setCartCustomDiscount,
        setCartPaidBill,
        setCartSentKotId,
        resetCartOrder,
        activeReceiptBill,
        isReceiptModalOpen,
        activeDetailsBill,
        isBillDetailsModalOpen,
        openBillDetailsModal,
        closeBillDetailsModal,
        toasts,
        login,
        logout,
        setBranch,
        setActiveTab: handleSetActiveTab,
        addToCart,
        updateCartQuantity,
        updateCartItemNotes,
        updateCartItemServeType,
        removeFromCart,
        setCartItems,
        clearCart,
        setCartOrderType,
        setCartTableNumber,
        setCartCustomerName,
        setCartCustomerMobile,
        setCartSpecialNotes,
        holdOrder,
        sendKOT,
        updateKOTStatus,
        voidKOTItem,
        kdsAlerts,
        dismissKDSAlert,
        generateBill,
        openReceiptModal,
        closeReceiptModal,
        billRequests,
        pendingBillRequests,
        requestBill,
        cancelBillRequest,
        settleBillRequest,
        selectTableForPOS,
        updateTableStatus,
        setTableStatusByNumber,
        tableSearchTerm,
        setTableSearchTerm,
        tableFloorFilter,
        setTableFloorFilter,
        getActiveUnbilledKots,
        billSequence,
        addMenuItem,
        updateMenuItem,
        toggleMenuItemAvailability,
        updateMenuItemStock,
        dispatchedItemStats,
        isKitchenDrawerOpen,
        setIsKitchenDrawerOpen,
        kitchenDrawerTab,
        setKitchenDrawerTab,
        openKitchenDrawer,
        addCustomer,
        updateCustomer,
        showToast,
        dismissToast,
        resetDemoData,
        computedStats,
        currentBranchInfo,
        filteredTables,
        filteredKots,
        filteredBills
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
