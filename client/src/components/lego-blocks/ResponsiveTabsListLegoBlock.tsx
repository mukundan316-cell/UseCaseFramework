import * as React from "react";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ResponsiveTabsListLegoBlockProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * LEGO Block: Responsive Tabs List
 * 
 * A reusable wrapper for TabsList that provides:
 * - Flexible layout with wrap for multiple rows when needed
 * - All tabs visible without scrolling
 * - Consistent spacing and styling across the app
 * 
 * Usage:
 * Replace: <TabsList className="grid w-full grid-cols-5">
 * With:    <ResponsiveTabsListLegoBlock>
 * 
 * This solves the tab label overlap issue when labels are too long
 * for equal-width grid columns, and ensures all tabs are visible.
 */
export default function ResponsiveTabsListLegoBlock({ 
  children, 
  className 
}: ResponsiveTabsListLegoBlockProps) {
  return (
    <TabsList 
      className={cn(
        "!flex flex-wrap w-full h-auto min-h-[40px]",
        "[&>*]:flex-shrink-0",
        "gap-1 p-1",
        className
      )}
    >
      {children}
    </TabsList>
  );
}
