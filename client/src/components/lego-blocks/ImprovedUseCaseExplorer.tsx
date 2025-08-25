import React, { useState } from 'react';
import { Search, Filter, Plus, Download } from 'lucide-react';
import ExportButton from './ExportButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUseCases } from '../../contexts/UseCaseContext';
import { UseCase } from '../../types';
import CleanUseCaseCard from './CleanUseCaseCard';
import UseCaseDrawer from './UseCaseDrawer';
import SourceLegend from './SourceLegend';

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
}

export default function ImprovedUseCaseExplorer({
  useCases,
  title,
  description,
  showQuadrantFilters = false,
  showRSASelection = false,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  showCreateButton = false,
  emptyStateMessage = "No use cases found"
}: ImprovedUseCaseExplorerProps) {
  const { metadata } = useUseCases();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerUseCase, setDrawerUseCase] = useState<UseCase | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    process: '',
    activity: '',
    lineOfBusiness: '',
    businessSegment: '',
    geography: '',
    useCaseType: '',
    quadrant: '',
    librarySource: '' // New filter for source differentiation
  });

  // Filter use cases
  const filteredUseCases = useCases.filter((useCase) => {
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

    // Dropdown filters
    if (filters.process && useCase.process !== filters.process) return false;
    if (filters.activity && (useCase as any).activity && (useCase as any).activity !== filters.activity) return false;
    if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.businessSegment && useCase.businessSegment !== filters.businessSegment) return false;
    if (filters.geography && useCase.geography !== filters.geography) return false;
    if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
    if (filters.quadrant && useCase.quadrant !== filters.quadrant) return false;
    if (filters.librarySource && (useCase as any).librarySource !== filters.librarySource) return false;

    return true;
  });

  const handleCreate = () => {
    console.log('handleCreate called - Opening CREATE drawer');
    setDrawerMode('create');
    setDrawerUseCase(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (useCase: UseCase) => {
    console.log('handleEdit called - Opening EDIT drawer for:', useCase.title);
    setDrawerMode('edit');
    setDrawerUseCase(useCase);
    setIsDrawerOpen(true);
    onEdit?.(useCase);
  };

  const handleViewUseCase = (useCase: UseCase) => {
    console.log('Opening drawer for use case:', useCase.title);
    setDrawerMode('view');
    setDrawerUseCase(useCase);
    setIsDrawerOpen(true);
  };

  const handleSave = async (useCase: UseCase) => {
    // Handle both create and update operations
    try {
      if (drawerMode === 'create') {
        // Handle creation (you'll need to add this to your context)
        console.log('Creating new use case:', useCase);
        // await createUseCase(useCase);
      } else {
        // Handle update
        console.log('Updating use case:', useCase);
        onEdit?.(useCase);
      }
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error saving use case:', error);
    }
  };

  const handleDelete = async (useCase: UseCase) => {
    if (onDelete) {
      await onDelete(useCase);
    }
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
        <p className="text-sm text-gray-500 mt-1">
          Showing {filteredUseCases.length} use case{filteredUseCases.length !== 1 ? 's' : ''}
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
            status: title.includes('Active') ? 'active' : 'all'
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

      {/* Filter Dropdowns Row - Enhanced with source filter */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
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

        <Select value={filters.librarySource} onValueChange={(value) => setFilters(prev => ({ ...prev, librarySource: value === 'all' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {metadata?.sourceTypes?.map((sourceType) => (
              <SelectItem key={sourceType} value={sourceType}>
                {sourceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              showRSAActions={showRSASelection}
              onView={handleViewUseCase}
            />
          ))}
        </div>
      )}

      {/* Use Case Drawer - Handles all CRUD operations */}
      <UseCaseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onEdit={handleEdit}
        useCase={drawerUseCase}
        mode={drawerMode}
      />
    </div>
  );
}