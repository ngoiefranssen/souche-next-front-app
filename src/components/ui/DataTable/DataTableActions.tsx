import React, { useState, useRef, useEffect } from 'react';
import { ActionButton } from '@/components/ui/DataTable/types';
import { MoreVertical } from 'lucide-react';

interface DataTableActionsProps<T> {
  row: T;
  actions: ActionButton<T>[];
}

export function DataTableActions<T>({
  row,
  actions,
}: DataTableActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter(action => {
    return action.show ? action.show(row) : true;
  });

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (visibleActions.length === 0) return null;

  const getButtonClasses = (variant?: string) => {
    const baseClasses =
      'px-3 py-1.5 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#2B6A8E]';
    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-50 text-red-600 hover:bg-red-100`;
      case 'success':
        return `${baseClasses} bg-green-50 text-green-700 hover:bg-green-100`;
      case 'secondary':
        return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100`;
      default:
        return `${baseClasses} bg-blue-50 text-blue-600 hover:bg-blue-100`;
    }
  };

  if (visibleActions.length <= 2) {
    return (
      <div className="flex items-center space-x-2">
        {visibleActions.map((action, index) => (
          <button
            key={index}
            onClick={e => {
              e.stopPropagation();
              action.onClick(row);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                action.onClick(row);
              }
            }}
            className={getButtonClasses(action.variant)}
            aria-label={action.label}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2B6A8E]"
        aria-label="Actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200"
            role="menu"
            aria-label="Menu d'actions"
          >
            <div className="py-1">
              {visibleActions.map((action, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    action.onClick(row);
                    setIsOpen(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      action.onClick(row);
                      setIsOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center focus:outline-none focus:ring-2 focus:ring-[#2B6A8E] focus:ring-inset"
                  role="menuitem"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
