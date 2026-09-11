import React from 'react';
import { WaiterHeader } from './WaiterHeader';
import { WaiterNav } from './WaiterNav';
import { BillDetailsModal } from '../../components/BillDetailsModal';
import { ThermalReceiptModal } from '../../components/ThermalReceiptModal';
import { ToastContainer } from '../../components/ToastContainer';

interface WaiterLayoutProps {
  children: React.ReactNode;
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const WaiterLayout: React.FC<WaiterLayoutProps> = ({ 
  children,
  activeTabOverride,
  onNavigate 
}) => {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-[#080d1a] font-sans antialiased text-slate-100 select-none">
      {/* 1. PERSISTENT MASTER TOP HEADER - pinned at the top */}
      <div className="shrink-0 z-30">
        <WaiterHeader />
      </div>
      
      {/* 2. MIDDLE CONTENT AREA ARCHITECTURE */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#080d1a] relative">
        {children}
      </main>

      {/* 3. PERSISTENT MASTER BOTTOM NAVIGATION - pinned at the bottom */}
      <div className="shrink-0 z-40">
        <WaiterNav 
          activeTabOverride={activeTabOverride}
          onNavigate={onNavigate}
        />
      </div>

      {/* Modals & Toasts */}
      <BillDetailsModal />
      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
