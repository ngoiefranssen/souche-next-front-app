'use client';

import React from 'react';
import {
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuItem as HeadlessMenuItem,
  MenuItems as HeadlessMenuItems,
} from '@headlessui/react';

interface AppMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface AppMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AppMenuItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AppMenuItemRenderProps {
  active: boolean;
  focus: boolean;
  disabled: boolean;
  close: () => void;
}

interface AppMenuItemProps {
  children: (props: AppMenuItemRenderProps) => React.ReactElement;
  disabled?: boolean;
}

export const AppMenu: React.FC<AppMenuProps> = ({ children, className }) => {
  return (
    <HeadlessMenu as="div" className={className}>
      {children}
    </HeadlessMenu>
  );
};

export const AppMenuButton: React.FC<AppMenuButtonProps> = ({
  children,
  type = 'button',
  ...props
}) => {
  return (
    <HeadlessMenuButton type={type} {...props}>
      {children}
    </HeadlessMenuButton>
  );
};

export const AppMenuItems: React.FC<AppMenuItemsProps> = ({
  children,
  ...props
}) => {
  return <HeadlessMenuItems {...props}>{children}</HeadlessMenuItems>;
};

export const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  disabled = false,
}) => {
  return <HeadlessMenuItem disabled={disabled}>{children}</HeadlessMenuItem>;
};
