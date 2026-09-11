import React, { useState } from 'react';
import { KitchenHeader } from './KitchenHeader';
import { KitchenDrawer } from './KitchenDrawer';
import { ToastContainer } from '../../components/ToastContainer';

interface KitchenLayoutProps {
  children: React.ReactNode;
}

export const KitchenLayout: React.FC<KitchenLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'active' | 'completed' | 'stock86' | 'settings'>('active');
  const [selectedStation, setSelectedStation] = useState('All Stations');
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A11] flex flex-col font-sans antialiased text-white select-none">
      {/* Ultra-minimal Kitchen Header */}
      <KitchenHeader 
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
      />

      {/* Full-width Kitchen Display Workspace - NO standard sidebar eating screen */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-[#070A11]">
        {children}
      </main>

      {/* Collapsible Kitchen Drawer strictly for Active Orders, Completed, 86 Stock & Settings */}
      <KitchenDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeDrawerTab={activeDrawerTab}
        setActiveDrawerTab={setActiveDrawerTab}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
      />

      <ToastContainer />
    </div>
  );
};
