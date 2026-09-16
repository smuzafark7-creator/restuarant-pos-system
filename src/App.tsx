/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context';
import { LoginPage } from './pages';
import { RoleLayoutRouter } from './routing';
import { ToastContainer } from './components';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  // Dynamically manage body & html overflow to prevent lock when unauthenticated
  useEffect(() => {
    if (!currentUser) {
      document.documentElement.classList.remove('pos-locked');
      document.body.classList.remove('pos-locked');
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.height = 'auto';
    } else {
      document.documentElement.classList.add('pos-locked');
      document.body.classList.add('pos-locked');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    }
  }, [currentUser]);

  // Unauthenticated user -> render login screen in an unrestricted scrollable root wrapper
  if (!currentUser) {
    return (
      <div
        id="login-root-wrapper"
        className="min-h-screen w-full overflow-y-auto bg-[#f8fafc] dark:bg-[#060b17] flex flex-col justify-start"
        style={{ minHeight: '100vh', maxHeight: 'none', overflowY: 'auto' }}
      >
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  // Authenticated user -> render via role-isolated Layout Router
  return (
    <div className="overflow-x-hidden w-full max-w-[100vw] h-full flex flex-col">
      <RoleLayoutRouter />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
