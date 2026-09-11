/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context';
import { LoginPage } from './pages';
import { RoleLayoutRouter } from './routing';
import { ToastContainer } from './components';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  // Unauthenticated user -> render login screen
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Authenticated user -> render via role-isolated Layout Router
  return <RoleLayoutRouter />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
