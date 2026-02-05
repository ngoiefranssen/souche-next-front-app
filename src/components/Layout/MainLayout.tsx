'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader onMenuClick={handleMenuClick} />
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-1">{children}</main>
      </div>
    </div>
  );
}
