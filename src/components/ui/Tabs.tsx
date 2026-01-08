'use client';

import { FC, ReactNode, createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// Tabs Root
export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = (tab: string): void => {
    if (!value) {
      setInternalValue(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('tw-w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// Tabs List
export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'tw-flex tw-gap-1 tw-p-1',
        'tw-bg-obsidian-800 tw-rounded-fluent-lg tw-border tw-border-obsidian-700',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

// Tab Trigger
export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger: FC<TabsTriggerProps> = ({ value, children, className, disabled = false }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'tw-flex-1 tw-px-4 tw-py-2 tw-rounded-fluent',
        'tw-text-body tw-font-medium tw-transition-all tw-duration-200',
        'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan',
        isActive
          ? 'tw-bg-obsidian-700 tw-text-obsidian-100 tw-shadow-sm'
          : 'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700/50',
        disabled && 'tw-opacity-50 tw-cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};

// Tab Content
export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: FC<TabsContentProps> = ({ value, children, className }) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={cn('tw-mt-4 tw-animate-fade-in', className)}>
      {children}
    </div>
  );
};
