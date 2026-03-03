'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SubMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const menuItems: SubMenuItem[] = [
  {
    label: 'Client List',
    href: '/rewards/client-list',
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: 'GPRS & SMS Commands',
    href: '/rewards/gprs-sms',
    icon: <MessageSquare className="w-4 h-4" />,
    children: [{ label: 'GPRS Commands', href: '/rewards/gprs-sms/gprs' }],
  },
];

interface RewardsLayoutProps {
  children: React.ReactNode;
}

export default function RewardsLayout({ children }: RewardsLayoutProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    'Login, Email, Sms History',
    'GPRS & SMS Commands',
  ]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="flex h-full gap-1">
      {/* Sidebar de navigation */}
      <aside className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto">
        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map(item => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname?.includes(item.href)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Contenu principal (outlet) */}
      <main className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
