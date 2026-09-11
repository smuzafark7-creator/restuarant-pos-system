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
    <div className="min-h-screen bg-[#0b1329] flex flex-col font-sans antialiased text-slate-100">
      {/* High-speed Cashier Counter Header */}
      <CashierHeader />

      <div className="flex-1 flex overflow-hidden">
        {/* Compact Vertical Cashier Strip - Live Tables, Quick Punch, Unsettled Bills, Z-Report, Print Test */}
        <CashierSidebar 
          activeTabOverride={activeTabOverride}
          onNavigate={onNavigate}
        />

        {/* Operational Billing Terminal Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-[#0b1329]">
          {children}
        </main>
      </div>

      <BillDetailsModal />
      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
