import React, { useState } from 'react';
import { KitchenHeader } from './KitchenHeader';
import { KitchenDrawer } from './KitchenDrawer';
import { ToastContainer } from '../../components/ToastContainer';
import { useApp } from '../../context/AppContext';

interface KitchenLayoutProps {
  children: React.ReactNode;
}

export const KitchenLayout: React.FC<KitchenLayoutProps> = ({ children }) => {
  const { 
    isKitchenDrawerOpen, 
    setIsKitchenDrawerOpen, 
    kitchenDrawerTab, 
    setKitchenDrawerTab 
  } = useApp();
  const [selectedStation, setSelectedStation] = useState('All Stations');
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="h-screen bg-[#18191D] flex flex-col font-sans antialiased text-slate-100 select-none">
      {/* Ultra-minimal Kitchen Header */}
      <KitchenHeader 
        onToggleDrawer={() => setIsKitchenDrawerOpen(!isKitchenDrawerOpen)}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
      />

      {/* Full-width Kitchen Display Workspace */}
      <main className="flex-1 min-w-0 bg-[#18191D] flex flex-col min-h-0">
        {children}
      </main>

      {/* Collapsible Kitchen Drawer strictly for Active Orders, Completed, 86 Stock, Dispatched & Settings */}
      <KitchenDrawer 
        isOpen={isKitchenDrawerOpen}
        onClose={() => setIsKitchenDrawerOpen(false)}
        activeDrawerTab={kitchenDrawerTab}
        setActiveDrawerTab={setKitchenDrawerTab}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
      />

      <ToastContainer />
    </div>
  );
};
