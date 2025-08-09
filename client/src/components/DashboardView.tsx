import React from 'react';
import MatrixPlot from './MatrixPlot';
import SummaryMetricsLegoBlock from './lego-blocks/SummaryMetricsLegoBlock';


/**
 * DashboardView - Renamed from Matrix View and moved to front position
 * Provides comprehensive 2x2 matrix visualization for AI use case prioritization
 * Follows RSA Framework with enhanced scoring and database-first architecture
 * Enhanced with SummaryMetricsLegoBlock for clickable portfolio overview
 */
export default function DashboardView() {

  return (
    <div className="space-y-6">
      {/* Resume Progress Section */}


      {/* Summary Metrics - placed between resume section and matrix */}
      <SummaryMetricsLegoBlock />
      
      {/* Matrix Plot */}
      <MatrixPlot />
    </div>
  );
}