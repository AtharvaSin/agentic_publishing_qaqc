'use client';

import { FC, ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// Table Container
export type TableContainerProps = HTMLAttributes<HTMLDivElement>;

export const TableContainer: FC<TableContainerProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'tw-overflow-x-auto tw-rounded-fluent-lg tw-border tw-border-obsidian-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Table
export type TableProps = HTMLAttributes<HTMLTableElement>;

export const Table: FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <table className={cn('tw-w-full tw-text-body', className)} {...props}>
      {children}
    </table>
  );
};

// Table Header
export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader: FC<TableHeaderProps> = ({ className, children, ...props }) => {
  return (
    <thead className={cn('tw-bg-obsidian-800', className)} {...props}>
      {children}
    </thead>
  );
};

// Table Body
export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody: FC<TableBodyProps> = ({ className, children, ...props }) => {
  return (
    <tbody className={cn('tw-divide-y tw-divide-obsidian-700/50', className)} {...props}>
      {children}
    </tbody>
  );
};

// Table Row
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
  selected?: boolean;
}

export const TableRow: FC<TableRowProps> = ({
  className,
  clickable = false,
  selected = false,
  children,
  ...props
}) => {
  return (
    <tr
      className={cn(
        'tw-transition-colors tw-duration-200',
        clickable && 'hover:tw-bg-obsidian-700/50 tw-cursor-pointer',
        selected && 'tw-bg-obsidian-700/70',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

// Table Head Cell
export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export const TableHead: FC<TableHeadProps> = ({
  className,
  sortable = false,
  sortDirection,
  onSort,
  children,
  ...props
}) => {
  const SortIcon = sortDirection === 'asc' ? ChevronUp : sortDirection === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <th
      className={cn(
        'tw-text-left tw-px-4 tw-py-3',
        'tw-text-caption tw-font-semibold tw-text-obsidian-300',
        'tw-border-b tw-border-obsidian-700',
        sortable && 'tw-cursor-pointer hover:tw-text-obsidian-100 tw-select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="tw-flex tw-items-center tw-gap-1">
        <span>{children}</span>
        {sortable && (
          <SortIcon
            className={cn(
              'tw-h-3.5 tw-w-3.5 tw-flex-shrink-0',
              sortDirection ? 'tw-text-aurora-cyan' : 'tw-text-obsidian-500'
            )}
          />
        )}
      </div>
    </th>
  );
};

// Table Cell
export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell: FC<TableCellProps> = ({ className, children, ...props }) => {
  return (
    <td className={cn('tw-px-4 tw-py-3 tw-text-obsidian-200', className)} {...props}>
      {children}
    </td>
  );
};

// Empty State
export interface TableEmptyProps extends HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  message?: string;
  icon?: ReactNode;
}

export const TableEmpty: FC<TableEmptyProps> = ({
  colSpan,
  message = 'No data available',
  icon,
  className,
  ...props
}) => {
  return (
    <tr className={className} {...props}>
      <td colSpan={colSpan} className="tw-px-4 tw-py-12 tw-text-center">
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-obsidian-400">
          {icon && <div className="tw-text-obsidian-500">{icon}</div>}
          <p className="tw-text-body">{message}</p>
        </div>
      </td>
    </tr>
  );
};
