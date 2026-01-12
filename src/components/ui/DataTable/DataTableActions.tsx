import React, { useState } from 'react';
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

  const visibleActions = actions.filter(action => {
    return action.show ? action.show(row) : true;
  });

  if (visibleActions.length === 0) return null;

  const getButtonClasses = (variant?: string) => {
    const baseClasses = 'px-3 py-1.5 rounded text-sm font-medium transition';
    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-50 text-red-600 hover:bg-red-100`;
      case 'success':
        return `${baseClasses} bg-green-50 text-green-600 hover:bg-green-100`;
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
            className={getButtonClasses(action.variant)}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              {visibleActions.map((action, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    action.onClick(row);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
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
