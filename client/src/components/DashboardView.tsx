import React from 'react';
import EnhancedMatrixPlot from './analytics/EnhancedMatrixPlot';
import SummaryMetricsLegoBlock from './lego-blocks/SummaryMetricsLegoBlock';
import ReportsTabLegoBlock from './lego-blocks/ReportsTabLegoBlock';
import ExportButton from './lego-blocks/ExportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Download } from 'lucide-react';


/**
 * DashboardView - Renamed from Matrix View and moved to front position
 * Provides comprehensive 2x2 matrix visualization for AI use case prioritization
 * Follows RSA Framework with enhanced scoring and database-first architecture
 * Enhanced with SummaryMetricsLegoBlock for clickable portfolio overview
 */
export default function DashboardView() {

  return (
    <div className="space-y-6">
      {/* Summary Metrics with Export */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <SummaryMetricsLegoBlock />
        </div>
        <div className="ml-4 pt-2">
          <ExportButton 
            exportType="portfolio"
            variant="outline"
            size="sm"
            className="bg-white border-blue-200"
          />
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-white to-slate-50 border border-gray-200 shadow-lg rounded-xl p-2">
          <TabsTrigger value="matrix" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300" data-testid="tab-matrix">
            <Target className="h-4 w-4" />
            RSA AI Value Matrix
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold transition-all duration-300" data-testid="tab-reports">
            <BarChart3 className="h-4 w-4" />
            Analytics & Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <EnhancedMatrixPlot />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTabLegoBlock />
        </TabsContent>
      </Tabs>
    </div>
  );
}