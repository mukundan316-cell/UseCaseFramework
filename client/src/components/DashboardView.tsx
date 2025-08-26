import React from 'react';
import MatrixPlot from './MatrixPlot';
import SummaryMetricsLegoBlock from './lego-blocks/SummaryMetricsLegoBlock';
import ReportsTabLegoBlock from './lego-blocks/ReportsTabLegoBlock';
import ExportButton from './lego-blocks/ExportButton';
import ImprovedUseCaseExplorer from './lego-blocks/ImprovedUseCaseExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Download } from 'lucide-react';
import { useUseCases } from '../contexts/UseCaseContext';


/**
 * DashboardView - Renamed from Matrix View and moved to front position
 * Provides comprehensive 2x2 matrix visualization for AI use case prioritization
 * Follows RSA Framework with enhanced scoring and database-first architecture
 * Enhanced with SummaryMetricsLegoBlock for clickable portfolio overview
 */
export default function DashboardView() {
  const { dashboardUseCases } = useUseCases();

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
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Portfolio
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Value Matrix
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <ImprovedUseCaseExplorer
            useCases={dashboardUseCases}
            title="Enterprise Platform - Active Portfolio"
            description="Active use cases currently deployed or in development for RSA's strategic AI initiatives"
            showQuadrantFilters={true}
            showRSASelection={false}
            showCreateButton={true}
            context="dashboard"
            emptyStateMessage="No active use cases in your portfolio. Add use cases from the Reference Library to start building your AI strategy."
          />
        </TabsContent>

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