import React from 'react';
import { ManagerHeader } from './ManagerHeader';
import { BillDetailsModal } from '../../components/BillDetailsModal';
import { ThermalReceiptModal } from '../../components/ThermalReceiptModal';
import { ToastContainer } from '../../components/ToastContainer';

interface ManagerLayoutProps {
  children: React.ReactNode;
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ 
  children,
  activeTabOverride,
  onNavigate 
}) => {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-[#080d1a] font-sans antialiased text-slate-200 select-none">
      {/* High-speed Manager Console Header with Horizontal Navigation Tabs */}
      <div className="shrink-0 z-30">
        <ManagerHeader activeTabOverride={activeTabOverride} onNavigate={onNavigate} />
      </div>

      {/* Manager Console Terminal Workspace - Full Width */}
      <main className={`flex-1 min-h-0 ${activeTabOverride === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'} min-w-0 w-full overflow-x-hidden bg-[#080d1a] relative`}>
        {children}
      </main>

      <BillDetailsModal />
      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
