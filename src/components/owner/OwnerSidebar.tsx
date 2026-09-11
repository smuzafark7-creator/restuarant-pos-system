import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Grid3X3, 
  FileText, 
  ChefHat, 
  Receipt, 
  Users, 
  Utensils, 
  BarChart3, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export interface OwnerSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ 
  isOpenMobile, 
  onCloseMobile,
  activeTabOverride,
  onNavigate,
  className
}) => {
  const { activeTab, setActiveTab, kots, tables, currentBranch, pendingBillRequests } = useApp();

  const currentActive = activeTabOverride || activeTab;

  const handleSelectTab = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const pendingKotsCount = kots.filter(
    k => (currentBranch === 'all' || k.branchId === currentBranch) && (k.status === 'new' || k.status === 'preparing')
  ).length;

  const occupiedTablesCount = tables.filter(
    t => (currentBranch === 'all' || t.branchId === currentBranch) && (t.status === 'occupied' || t.status === 'billing' || t.status === 'ready')
  ).length;

  const ownerNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tables',
      label: 'Tables Map',
      icon: <Grid3X3 className="w-4 h-4" />,
      badge: pendingBillRequests.length > 0 ? pendingBillRequests.length : (occupiedTablesCount > 0 ? occupiedTablesCount : undefined)
    },
    {
      id: 'pos',
      label: 'POS Terminal',
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      id: 'kot',
      label: 'KOT Status',
      icon: <FileText className="w-4 h-4" />,
      badge: pendingKotsCount > 0 ? pendingKotsCount : undefined
    },
    {
      id: 'kitchen',
      label: 'Kitchen KDS',
      icon: <ChefHat className="w-4 h-4" />,
      badge: pendingKotsCount > 0 ? pendingKotsCount : undefined
    },
    {
      id: 'bills',
      label: 'Bills History',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'menu',
      label: 'Menu Management',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports & GST',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className={`w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between select-none font-mono ${className || ''}`}
    >
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Enterprise Control
        </div>
        {ownerNavItems.map(item => {
          const isSelected = currentActive === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Admin Access</span>
        </div>
        <span>v2.5</span>
      </div>
    </aside>
  );
};
