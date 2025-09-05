import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Building } from 'lucide-react';
import ExecutiveAnalytics from '../analytics/ExecutiveAnalytics';
import ResourcePlanningMetricsLegoBlock from './ResourcePlanningMetricsLegoBlock';

/**
 * Reports Tab LEGO Block - Streamlined Analytics Dashboard
 * 
 * Consolidated analytics focusing on executive insights and resource planning.
 * Eliminates redundant visualizations while preserving all valuable functionality.
 * 
 * Features:
 * - Executive Analytics with comprehensive portfolio insights
 * - Resource Planning with T-shirt sizing and cost estimates
 * - All data sourced from database with LEGO component architecture
 */
export default function ReportsTabLegoBlock() {
  return (
    <Tabs defaultValue="executive" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="executive" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Executive Analytics
        </TabsTrigger>
        <TabsTrigger value="resource-planning" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Resource Planning
        </TabsTrigger>
      </TabsList>

      <TabsContent value="executive">
        <ExecutiveAnalytics />
      </TabsContent>

      <TabsContent value="resource-planning">
        <ResourcePlanningMetricsLegoBlock />
      </TabsContent>
    </Tabs>
  );
}

