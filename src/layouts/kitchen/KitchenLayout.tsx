import React, { useState } from 'react';
import { KitchenHeader } from './KitchenHeader';
import { KitchenNav } from './KitchenNav';
import { KitchenStockView } from './views/KitchenStockView';
import { KitchenDispatchedView } from './views/KitchenDispatchedView';
import { KitchenHistoryView } from './views/KitchenHistoryView';
import { ToastContainer } from '../../components/ToastContainer';
import { ThermalReceiptModal } from '../../components/ThermalReceiptModal';
import { useApp } from '../../context/AppContext';

interface KitchenLayoutProps {
  children: React.ReactNode;
}

export const KitchenLayout: React.FC<KitchenLayoutProps> = ({ children }) => {
  const { activeKitchenTab, setActiveKitchenTab } = useApp();
  const [selectedStation, setSelectedStation] = useState('All Stations');
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-[#18191D] font-sans antialiased text-slate-100 select-none">
      {/* 1. PERSISTENT MASTER TOPBAR - Single Consolidated Bar */}
      <div className="shrink-0 z-30">
        <KitchenHeader 
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(prev => !prev)}
        />
      </div>

      {/* 2. MAIN FULL-SCREEN VIEWPORT */}
      <main className="flex-1 min-h-0 bg-[#18191D] flex flex-col relative overflow-hidden">
        {activeKitchenTab === 'live' && children}
        {activeKitchenTab === 'stock86' && <KitchenStockView />}
        {activeKitchenTab === 'dispatched' && <KitchenDispatchedView />}
        {activeKitchenTab === 'history' && <KitchenHistoryView />}
      </main>

      {/* 3. PERSISTENT DEDICATED BOTTOM NAVIGATION BAR */}
      <div className="shrink-0 z-40">
        <KitchenNav 
          activeTab={activeKitchenTab}
          onSelectTab={(tab) => {
            setActiveKitchenTab(tab);
          }}
        />
      </div>

      <ThermalReceiptModal />
      <ToastContainer />
    </div>
  );
};
