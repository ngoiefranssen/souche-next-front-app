'use client';

import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { Breadcrumb } from './Breadcrumb';
import { Sidebar } from './Sidebar';

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
    <div className="h-screen bg-gray-50 lg:pl-[88px]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      {/* Main Content Area */}
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <DashboardHeader onMenuClick={handleMenuClick} />
        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-1 lg:p-3">
          {/* Breadcrumb */}
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
