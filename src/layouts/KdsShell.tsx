import React from 'react';
import { Header } from './Header';

interface ShellProps {
  children: React.ReactNode;
}

export const KdsShell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans antialiased text-white select-none">
      <Header variant="kds" />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-[#0B0F19]">
        {children}
      </main>
    </div>
  );
};
