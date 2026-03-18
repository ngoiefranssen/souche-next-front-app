import React from 'react';
import { ActionButton } from '@/components/ui/DataTable/types';
import { MoreVertical } from 'lucide-react';
import {
  AppMenu,
  AppMenuButton,
  AppMenuItem,
  AppMenuItems,
} from '@/components/ui/Headless';

interface DataTableActionsProps<T> {
  row: T;
  rowIndex: number;
  actions: ActionButton<T>[];
}

export function DataTableActions<T>({
  row,
  rowIndex,
  actions,
}: DataTableActionsProps<T>) {
  const visibleActions = actions.filter(action => {
    return action.show ? action.show(row) : true;
  });

  if (visibleActions.length === 0) return null;

  const getMenuItemClasses = (variant?: string, focus?: boolean) => {
    const baseClasses =
      'w-full text-left px-4 py-2 text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5] focus:ring-inset';

    switch (variant) {
      case 'danger':
        return `${baseClasses} text-red-600 ${focus ? 'bg-red-50' : 'hover:bg-red-50'}`;
      case 'success':
        return `${baseClasses} text-green-700 ${focus ? 'bg-green-50' : 'hover:bg-green-50'}`;
      case 'secondary':
        return `${baseClasses} text-gray-600 ${focus ? 'bg-gray-100' : 'hover:bg-gray-100'}`;
      default:
        return `${baseClasses} text-blue-600 ${focus ? 'bg-blue-50' : 'hover:bg-blue-50'}`;
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      onClick={e => e.stopPropagation()}
    >
      <AppMenu className="relative z-50">
        <AppMenuButton
          className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#356ca5]"
          aria-label="Actions"
          onClick={e => e.stopPropagation()}
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </AppMenuButton>

        <AppMenuItems className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none">
          <div className="py-1">
            {visibleActions.map((action, index) => (
              <AppMenuItem key={`${action.label}-${index}`}>
                {({ focus, close }) => (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      action.onClick(row, rowIndex);
                      close();
                    }}
                    className={getMenuItemClasses(action.variant, focus)}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </button>
                )}
              </AppMenuItem>
            ))}
          </div>
        </AppMenuItems>
      </AppMenu>
    </div>
  );
}
