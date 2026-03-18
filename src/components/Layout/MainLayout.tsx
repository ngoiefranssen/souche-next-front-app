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
        <main className="flex flex-1 min-h-0 flex-col overflow-y-auto p-1 sm:p-1 lg:p-2">
          {/* Breadcrumb (mobile only, desktop is shown in header) */}
          <div className="md:hidden">
            <Breadcrumb />
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
