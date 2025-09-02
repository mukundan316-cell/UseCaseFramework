import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Download, FolderOpen, Building2 } from 'lucide-react';
import ExportButton from './ExportButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUseCases } from '../../contexts/UseCaseContext';
import { UseCase } from '../../types';
import CleanUseCaseCard from './CleanUseCaseCard';
import CRUDUseCaseModal from './CRUDUseCaseModal';
import SourceLegend from './SourceLegend';
import UseCaseDetailDrawer from './UseCaseDetailDrawer';
import { getSourceConfig } from '../../utils/sourceColors';
import { useSortedMetadata } from '../../hooks/useSortedMetadata';

interface ImprovedUseCaseExplorerProps {
  useCases: UseCase[];
  title: string;
  description: string;
  showQuadrantFilters?: boolean;
  showRSASelection?: boolean;
  onEdit?: (useCase: UseCase) => void;
  onDelete?: (useCase: UseCase) => Promise<void>;
  onActivate?: (id: string, reason?: string) => Promise<void>;
  onDeactivate?: (id: string, reason?: string) => Promise<void>;
  showCreateButton?: boolean;
  emptyStateMessage?: string;
  context?: 'reference' | 'active' | 'dashboard';
}

export default function ImprovedUseCaseExplorer({
  useCases,
  title,
  description,
  showQuadrantFilters = true,
  showRSASelection = false,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  showCreateButton = false,
  emptyStateMessage = "No use cases found",
  context = 'reference'
}: ImprovedUseCaseExplorerProps) {
  const { metadata } = useUseCases();
  const sortedMetadata = useSortedMetadata();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail drawer state
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedDetailUseCase, setSelectedDetailUseCase] = useState<UseCase | null>(null);
  
  // Tab state with localStorage memory
  const [activeTab, setActiveTab] = useState<'rsa_internal' | 'industry_standard' | 'inventory' | 'both'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('usecase-explorer-tab');
      // Map old 'strategic' tab to 'rsa_internal' for backwards compatibility
      if (stored === 'strategic') return 'rsa_internal';
      return (stored as 'rsa_internal' | 'industry_standard' | 'inventory' | 'both') || 'rsa_internal';
    }
    return 'rsa_internal';
  });
  
  // Save tab selection to localStorage and reset incompatible filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('usecase-explorer-tab', activeTab);
    }
    
    // Reset filters that don't apply to the new tab context
    if (activeTab === 'inventory') {
      // Reset non-inventory filters
      setFilters(prev => ({
        ...prev,
        activity: '',
        quadrant: ''
      }));
    } else if (activeTab === 'rsa_internal' || activeTab === 'industry_standard') {
      // Reset inventory-only filters
      setFilters(prev => ({
        ...prev,
        aiInventoryStatus: '',
        deploymentStatus: ''
      }));
    }
  }, [activeTab]);
  
  // Filters
  const [filters, setFilters] = useState({
    process: '',
    activity: '',
    lineOfBusiness: '',
    businessSegment: '',
    geography: '',
    useCaseType: '',
    horizontalUseCaseType: '',
    quadrant: '',
    librarySource: '', // New filter for source differentiation
    // AI Inventory specific filters
    aiInventoryStatus: '',
    deploymentStatus: ''
  });

  // Filter use cases with tab-aware logic
  const filteredUseCases = useCases.filter((useCase) => {
    // Define library source types
    const librarySource = (useCase as any).librarySource;
    const isAiInventory = librarySource === 'ai_inventory';
    const isRsaInternal = librarySource === 'rsa_internal';
    const isIndustryStandard = librarySource === 'industry_standard';
    
    // Skip internal tab filtering for active portfolio context since it's already pre-filtered
    if (context === 'active') {
      // Skip tab-based filtering - active portfolio is already filtered by API
    } else {
      // Tab-based filtering for reference library only
      if (activeTab === 'rsa_internal' && !isRsaInternal) return false;
      if (activeTab === 'industry_standard' && !isIndustryStandard) return false;
      if (activeTab === 'inventory' && !isAiInventory) return false;
      // 'both' tab shows everything
    }
    
    // Text search with null safety
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (useCase.title?.toLowerCase() || '').includes(searchLower) ||
        (useCase.description?.toLowerCase() || '').includes(searchLower) ||
        (useCase.process?.toLowerCase() || '').includes(searchLower) ||
        (useCase.lineOfBusiness?.toLowerCase() || '').includes(searchLower) ||
        (useCase.useCaseType?.toLowerCase() || '').includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Common filters
    if (filters.process && useCase.process !== filters.process) return false;
    if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.businessSegment && useCase.businessSegment !== filters.businessSegment) return false;
    if (filters.geography && useCase.geography !== filters.geography) return false;
    if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
    
    // Horizontal use case type filter - matches any of the selected types in the array
    if (filters.horizontalUseCaseType) {
      const horizontalTypes = (useCase as any).horizontalUseCaseTypes || [];
      // If a horizontal filter is selected but the use case has no horizontal types, exclude it
      if (!horizontalTypes.includes(filters.horizontalUseCaseType)) return false;
    }
    
    // Universal activity filter for all source types
    if (filters.activity && (useCase as any).activity && (useCase as any).activity !== filters.activity) return false;
    
    // Quadrant filter only for scored items (excludes AI Inventory)
    if (!isAiInventory && filters.quadrant && useCase.quadrant !== filters.quadrant) return false;
    
    // AI Inventory specific filters
    if (isAiInventory) {
      if (filters.aiInventoryStatus && (useCase as any).aiInventoryStatus !== filters.aiInventoryStatus) return false;
      if (filters.deploymentStatus && (useCase as any).deploymentStatus !== filters.deploymentStatus) return false;
    }
    
    if (filters.librarySource && (useCase as any).librarySource !== filters.librarySource) return false;

    return true;
  });
  
  // Get counts for each tab
  const rsaInternalCount = useCases.filter(uc => (uc as any).librarySource === 'rsa_internal').length;
  const industryStandardCount = useCases.filter(uc => (uc as any).librarySource === 'industry_standard').length;
  const inventoryCount = useCases.filter(uc => (uc as any).librarySource === 'ai_inventory').length;
  
  // Light telemetry effects
  useEffect(() => {
    // Tab switch telemetry
    const telemetryData = {
      action: 'tab_switch',
      tab: activeTab,
      timestamp: new Date().toISOString(),
      useCaseCount: {
        rsaInternal: rsaInternalCount,
        industryStandard: industryStandardCount,
        inventory: inventoryCount,
        total: rsaInternalCount + industryStandardCount + inventoryCount
      }
    };
    console.log('[RSA-AI-Telemetry]', telemetryData);
  }, [activeTab, rsaInternalCount, industryStandardCount, inventoryCount]);
  
  useEffect(() => {
    // Filter usage telemetry
    const activeFilters = Object.entries(filters).filter(([key, value]) => value !== '').length;
    if (activeFilters > 0) {
      const telemetryData = {
        action: 'filter_applied',
        currentTab: activeTab,
        activeFilters: Object.fromEntries(Object.entries(filters).filter(([key, value]) => value !== '')),
        filterCount: activeFilters,
        filteredResultCount: filteredUseCases.length,
        timestamp: new Date().toISOString()
      };
      console.log('[RSA-AI-Telemetry]', telemetryData);
    }
  }, [filters, activeTab, filteredUseCases.length]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUseCase(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (useCase: UseCase) => {
    setModalMode('edit');
    setSelectedUseCase(useCase);
    setIsModalOpen(true);
    onEdit?.(useCase);
  };

  const handleDelete = async (useCase: UseCase) => {
    if (onDelete) {
      await onDelete(useCase);
    }
  };

  // Detail drawer handlers
  const handleView = (useCase: UseCase) => {
    // Light telemetry for detail view interactions
    const telemetryData = {
      action: 'detail_view_open',
      useCaseType: (useCase as any).librarySource || 'rsa_internal',
      hasScores: useCase.impactScore !== undefined && useCase.effortScore !== undefined,
      currentTab: activeTab,
      timestamp: new Date().toISOString()
    };
    console.log('[RSA-AI-Telemetry]', telemetryData);
    
    setSelectedDetailUseCase(useCase);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
    setSelectedDetailUseCase(null);
  };

  const handleMoveToLibrary = async (useCase: UseCase) => {
    if (onDeactivate) {
      await onDeactivate(useCase.id, 'Moved to library');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        
        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-4 bg-gray-100 p-2 rounded-lg w-fit border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('rsa_internal')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 border-2 ${
              activeTab === 'rsa_internal' 
                ? 'bg-white text-blue-600 shadow-md border-blue-200 ring-2 ring-blue-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>RSA Internal</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {rsaInternalCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('industry_standard')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 border-2 ${
              activeTab === 'industry_standard' 
                ? 'bg-white text-green-600 shadow-md border-green-200 ring-2 ring-green-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Industry Standard</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {industryStandardCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 border-2 ${
              activeTab === 'inventory' 
                ? 'bg-white text-purple-600 shadow-md border-purple-200 ring-2 ring-purple-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 border-transparent'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>AI Tool Registry</span>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {inventoryCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
              activeTab === 'both' 
                ? 'bg-white text-gray-900 shadow-md border-gray-300 ring-2 ring-gray-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 border-transparent'
            }`}
          >
            All Items
            <span className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {rsaInternalCount + industryStandardCount + inventoryCount}
            </span>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-3">
          Showing {filteredUseCases.length} of {rsaInternalCount + industryStandardCount + inventoryCount} total items
        </p>
      </div>

      {/* Quadrant Filters */}
      {showQuadrantFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          <button
            onClick={() => setFilters(prev => ({ ...prev, quadrant: prev.quadrant === '' ? '' : '' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.quadrant === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {sortedMetadata.getSortedItems('quadrants', metadata?.quadrants || ['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']).map((quadrant) => (
            <button
              key={quadrant}
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                quadrant: prev.quadrant === quadrant ? '' : quadrant 
              }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.quadrant === quadrant 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {quadrant}
            </button>
          ))}
        </div>
      )}

      {/* Search and Filters - Exact match to screenshot */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {showCreateButton && (
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Use Case
          </Button>
        )}

        {/* Export Button */}
        <ExportButton 
          exportType={title.includes('Active') ? 'portfolio' : 'library'}
          filters={{
            category: filters.useCaseType || 'all',
            status: title.includes('Active') ? 'active' : 'reference'
          }}
          variant="outline"
          size="sm"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        />
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Context-Aware Filter Dropdowns */}
      <div className={`grid gap-4 ${
        activeTab === 'inventory' 
          ? 'grid-cols-2 md:grid-cols-6' // Inventory: Process, LOB, Segment, Geography, Type, Horizontal, AI Status, Deployment
          : 'grid-cols-2 md:grid-cols-8'  // Strategic/both: Process, Activity, LOB, Segment, Geography, Type, Horizontal, (Source on 'both')
      }`}>
        <Select value={filters.process} onValueChange={(value) => setFilters(prev => ({ ...prev, process: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Processes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Processes</SelectItem>
            {sortedMetadata.getSortedProcesses().map((process) => (
              <SelectItem key={process} value={process}>{process}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Activity filter - Strategic only */}
        {activeTab !== 'inventory' && (
          <Select value={filters.activity || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value === 'all' ? '' : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All Activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {sortedMetadata.getSortedActivities().map((activity) => (
                <SelectItem key={activity} value={activity}>{activity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filters.lineOfBusiness} onValueChange={(value) => setFilters(prev => ({ ...prev, lineOfBusiness: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All LOBs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LOBs</SelectItem>
            {sortedMetadata.getSortedLinesOfBusiness().map((lob) => (
              <SelectItem key={lob} value={lob}>{lob}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.businessSegment} onValueChange={(value) => setFilters(prev => ({ ...prev, businessSegment: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {sortedMetadata.getSortedBusinessSegments().map((segment) => (
              <SelectItem key={segment} value={segment}>{segment}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.geography} onValueChange={(value) => setFilters(prev => ({ ...prev, geography: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Geographies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Geographies</SelectItem>
            {sortedMetadata.getSortedGeographies().map((geo) => (
              <SelectItem key={geo} value={geo}>{geo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.useCaseType} onValueChange={(value) => setFilters(prev => ({ ...prev, useCaseType: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {sortedMetadata.getSortedUseCaseTypes().map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Horizontal Use Case Type filter - Show for all tabs */}
        <Select value={filters.horizontalUseCaseType || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, horizontalUseCaseType: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Horizontals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Horizontals</SelectItem>
            {sortedMetadata.getSortedHorizontalUseCaseTypes().map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AI Inventory Status - Inventory only */}
        {activeTab === 'inventory' && (
          <Select value={filters.aiInventoryStatus || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, aiInventoryStatus: value === 'all' ? '' : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {/* Deployment Status - Inventory only */}
        {activeTab === 'inventory' && (
          <Select value={filters.deploymentStatus || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, deploymentStatus: value === 'all' ? '' : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All Deployments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deployments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {/* Source filter - Show only on "both" tab */}
        {activeTab === 'both' && (
          <Select value={filters.librarySource} onValueChange={(value) => setFilters(prev => ({ ...prev, librarySource: value === 'all' ? '' : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {metadata?.sourceTypes?.map((sourceType) => {
                // Get display label from sourceColors utility
                const sourceConfig = getSourceConfig(sourceType);
                return (
                  <SelectItem key={sourceType} value={sourceType}>
                    {sourceConfig.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Source Legend */}
      <SourceLegend className="mb-4" />

      {/* Show Recommendations Only Toggle - Exact match to screenshot */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
          ⭐ Show Recommendations Only
        </Button>
      </div>

      {/* Use Case Grid */}
      {filteredUseCases.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Use Cases Found</h3>
          <p className="text-gray-500 mb-4">{emptyStateMessage}</p>
          {showCreateButton && (
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Use Case
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUseCases.map((useCase) => (
            <CleanUseCaseCard
              key={useCase.id}
              useCase={useCase}
              showScores={showQuadrantFilters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveToLibrary={showRSASelection ? handleMoveToLibrary : undefined}
              onView={handleView}
              showRSAActions={showRSASelection}
            />
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <CRUDUseCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        useCase={selectedUseCase}
        context={context}
      />

      {/* Detail Drawer */}
      <UseCaseDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
        useCase={selectedDetailUseCase}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}