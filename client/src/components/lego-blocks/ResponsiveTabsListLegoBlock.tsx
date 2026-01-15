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
 * - Flexible layout instead of fixed grid columns
 * - Horizontal scrolling on overflow (mobile/narrow screens)
 * - Consistent spacing and styling across the app
 * 
 * Usage:
 * Replace: <TabsList className="grid w-full grid-cols-5">
 * With:    <ResponsiveTabsListLegoBlock>
 * 
 * This solves the tab label overlap issue when labels are too long
 * for equal-width grid columns.
 * 
 * Note: Uses !flex to override the base TabsList inline-flex class
 * for deterministic layout behavior.
 */
export default function ResponsiveTabsListLegoBlock({ 
  children, 
  className 
}: ResponsiveTabsListLegoBlockProps) {
  return (
    <TabsList 
      className={cn(
        "!flex w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        "[&>*]:flex-shrink-0 [&>*]:min-w-fit",
        "gap-1",
        className
      )}
    >
      {children}
    </TabsList>
  );
}
