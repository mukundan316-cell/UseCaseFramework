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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail drawer state
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedDetailUseCase, setSelectedDetailUseCase] = useState<UseCase | null>(null);
  
  // Tab state with localStorage memory
  const [activeTab, setActiveTab] = useState<'strategic' | 'inventory' | 'both'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('usecase-explorer-tab') as 'strategic' | 'inventory' | 'both') || 'both';
    }
    return 'both';
  });
  
  // Save tab selection to localStorage and reset incompatible filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('usecase-explorer-tab', activeTab);
    }
    
    // Reset filters that don't apply to the new tab context
    if (activeTab === 'inventory') {
      // Reset strategic-only filters
      setFilters(prev => ({
        ...prev,
        activity: '',
        quadrant: ''
      }));
    } else if (activeTab === 'strategic') {
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
    quadrant: '',
    librarySource: '', // New filter for source differentiation
    // AI Inventory specific filters
    aiInventoryStatus: '',
    deploymentStatus: ''
  });

  // Filter use cases with tab-aware logic
  const filteredUseCases = useCases.filter((useCase) => {
    // Skip internal tab filtering for active portfolio context since it's already pre-filtered
    if (context === 'active') {
      // Skip tab-based filtering - active portfolio is already filtered by API
    } else {
      // Tab-based filtering for reference library only
      const isAiInventory = (useCase as any).librarySource === 'ai_inventory';
      const isStrategic = !isAiInventory;
      
      if (activeTab === 'strategic' && isAiInventory) return false;
      if (activeTab === 'inventory' && isStrategic) return false;
      // 'both' tab shows everything
    }
    
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        useCase.title.toLowerCase().includes(searchLower) ||
        useCase.description.toLowerCase().includes(searchLower) ||
        useCase.process.toLowerCase().includes(searchLower) ||
        useCase.lineOfBusiness.toLowerCase().includes(searchLower) ||
        useCase.useCaseType.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Common filters
    if (filters.process && useCase.process !== filters.process) return false;
    if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.businessSegment && useCase.businessSegment !== filters.businessSegment) return false;
    if (filters.geography && useCase.geography !== filters.geography) return false;
    if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
    
    // Strategic use case specific filters
    if (isStrategic) {
      if (filters.activity && (useCase as any).activity && (useCase as any).activity !== filters.activity) return false;
      if (filters.quadrant && useCase.quadrant !== filters.quadrant) return false;
    }
    
    // AI Inventory specific filters
    if (isAiInventory) {
      if (filters.aiInventoryStatus && (useCase as any).aiInventoryStatus !== filters.aiInventoryStatus) return false;
      if (filters.deploymentStatus && (useCase as any).deploymentStatus !== filters.deploymentStatus) return false;
    }
    
    if (filters.librarySource && (useCase as any).librarySource !== filters.librarySource) return false;

    return true;
  });
  
  // Get counts for each tab
  const strategicCount = useCases.filter(uc => (uc as any).librarySource !== 'ai_inventory').length;
  const inventoryCount = useCases.filter(uc => (uc as any).librarySource === 'ai_inventory').length;
  
  // Light telemetry effects
  useEffect(() => {
    // Tab switch telemetry
    const telemetryData = {
      action: 'tab_switch',
      tab: activeTab,
      timestamp: new Date().toISOString(),
      useCaseCount: {
        strategic: strategicCount,
        inventory: inventoryCount,
        total: strategicCount + inventoryCount
      }
    };
    console.log('[RSA-AI-Telemetry]', telemetryData);
  }, [activeTab, strategicCount, inventoryCount]);
  
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
        <div className="flex items-center space-x-1 mt-4 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('strategic')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'strategic' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Strategic Use Cases</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {strategicCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'inventory' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>AI Tool Registry</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
              {inventoryCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'both' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Items
            <span className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full">
              {strategicCount + inventoryCount}
            </span>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-3">
          Showing {filteredUseCases.length} of {strategicCount + inventoryCount} total items
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
          {(metadata?.quadrants || ['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']).map((quadrant) => (
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
          ? 'grid-cols-2 md:grid-cols-5' // Fewer columns for inventory
          : 'grid-cols-2 md:grid-cols-7'  // Full columns for strategic/both
      }`}>
        <Select value={filters.process} onValueChange={(value) => setFilters(prev => ({ ...prev, process: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Processes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Processes</SelectItem>
            {metadata?.processes?.map((process) => (
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
              {metadata?.activities?.map((activity) => (
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
            {metadata?.linesOfBusiness?.map((lob) => (
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
            {metadata?.businessSegments?.map((segment) => (
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
            {metadata?.geographies?.map((geo) => (
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
            {metadata?.useCaseTypes?.map((type) => (
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