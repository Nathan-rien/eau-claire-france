import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  stickyFirstColumn?: boolean;
}

/**
 * Responsive table component that switches to cards on mobile
 * Implements horizontal scroll with sticky first column on tablet
 * Switches to stacked cards on mobile breakpoint
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  mobileBreakpoint = 'md',
  stickyFirstColumn = true
}) => {
  const breakpointClass = {
    sm: 'sm:table',
    md: 'md:table',
    lg: 'lg:table'
  }[mobileBreakpoint];

  return (
    <div className={cn('table-wrap', className)}>
      <table 
        className={cn(
          'hidden w-full',
          breakpointClass,
          stickyFirstColumn && 'table-sticky-col'
        )}
      >
        {children}
      </table>
    </div>
  );
};

interface ResponsiveTableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card alternative for table rows on mobile
 */
export const ResponsiveTableCard: React.FC<ResponsiveTableCardProps> = ({
  title,
  children,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  );
};

interface ResponsiveTableRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * Row component for mobile cards
 */
export const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({
  label,
  value,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
};
