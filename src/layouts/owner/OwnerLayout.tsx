import React, { useState } from 'react';
import { OwnerHeader } from './OwnerHeader';
import { OwnerSidebar } from './OwnerSidebar';
import { BillDetailsModal } from '../../components/BillDetailsModal';
import { ThermalReceiptModal } from '../../components/ThermalReceiptModal';
import { ToastContainer } from '../../components/ToastContainer';

interface OwnerLayoutProps {
  children: React.ReactNode;
  activeTabOverride?: string;
  onNavigate?: (tab: string) => void;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ 
  children,
  activeTabOverride,
  onNavigate 
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full max-w-[100vw] flex flex-col overflow-hidden overflow-x-hidden bg-slate-50 font-sans antialiased text-slate-900">
      <OwnerHeader 
        className="sticky top-0 z-50 flex-shrink-0"
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)} 
      />
      <div className="flex flex-1 overflow-hidden w-full max-w-[100vw]">
        {/* Fixed Left Sidebar strictly for Owner */}
        <OwnerSidebar 
          className="w-64 flex-shrink-0 h-full overflow-y-auto"
          isOpenMobile={isMobileSidebarOpen} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeTabOverride={activeTabOverride}
          onNavigate={onNavigate}
        />
        {/* Scrollable Owner Management Content */}
        <main className={`flex-1 h-full min-w-0 ${activeTabOverride === 'pos' ? 'p-0 bg-[#F8FAFC] overflow-y-auto' : activeTabOverride === 'kitchen' ? 'p-0 bg-[#18191D] flex flex-col min-h-0' : 'p-6 bg-[#F8FAFC] overflow-y-auto'}`}>
          {children}
        </main>
      </div>

      <BillDetailsModal />
      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
