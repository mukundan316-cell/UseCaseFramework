import React from 'react';
import MatrixPlot from './MatrixPlot';
import SummaryMetricsLegoBlock from './lego-blocks/SummaryMetricsLegoBlock';
import ReportsTabLegoBlock from './lego-blocks/ReportsTabLegoBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target } from 'lucide-react';


/**
 * DashboardView - Renamed from Matrix View and moved to front position
 * Provides comprehensive 2x2 matrix visualization for AI use case prioritization
 * Follows RSA Framework with enhanced scoring and database-first architecture
 * Enhanced with SummaryMetricsLegoBlock for clickable portfolio overview
 */
export default function DashboardView() {

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <SummaryMetricsLegoBlock />
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Portfolio Matrix
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <MatrixPlot />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTabLegoBlock />
        </TabsContent>
      </Tabs>
    </div>
  );
}