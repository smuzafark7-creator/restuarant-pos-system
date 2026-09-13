import React from 'react';
import { CashierHeader } from './CashierHeader';
import { CashierSidebar } from './CashierSidebar';
import { BillDetailsModal } from '../../components/BillDetailsModal';
import { ThermalReceiptModal } from '../../components/ThermalReceiptModal';
import { ToastContainer } from '../../components/ToastContainer';

interface CashierLayoutProps {
  children: React.ReactNode;
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const CashierLayout: React.FC<CashierLayoutProps> = ({ 
  children,
  activeTabOverride,
  onNavigate 
}) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#080d1a] font-sans antialiased text-slate-200">
      {/* High-speed Cashier Counter Header */}
      <CashierHeader />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Compact Vertical Cashier Strip - Live Tables, Quick Punch, Unsettled Bills, Z-Report, Print Test */}
        <CashierSidebar 
          activeTabOverride={activeTabOverride}
          onNavigate={onNavigate}
        />

        {/* Operational Billing Terminal Workspace */}
        <main className={`flex-1 h-full ${activeTabOverride === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'} min-w-0 bg-[#080d1a]`}>
          {children}
        </main>
      </div>

      <BillDetailsModal />
      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
