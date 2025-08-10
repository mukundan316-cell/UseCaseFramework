import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Library, Package, Tag, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUseCases } from '../../contexts/UseCaseContext';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../../utils/calculations';
import CRUDUseCaseModal from './CRUDUseCaseModal';
import MultiSelectField from './MultiSelectField';
import { UseCase } from '../../types';
import { useToast } from '@/hooks/use-toast';

interface UseCaseExplorerLegoBlockProps {
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

/**
 * Shared Use Case Explorer LEGO Block
 * Reusable component for browsing, filtering, and managing use cases
 * Following LEGO principle: Build Once, Reuse Everywhere
 */
export default function UseCaseExplorerLegoBlock({
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
}: UseCaseExplorerLegoBlockProps) {
  const { metadata } = useUseCases();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());

  // Advanced filtering state - matching CRUD LEGO design
  const [advancedFilters, setAdvancedFilters] = useState({
    processes: [] as string[],
    linesOfBusiness: [] as string[],
    businessSegments: [] as string[],
    geographies: [] as string[],
    useCaseTypes: [] as string[],
    quadrants: [] as string[]
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filtering with multi-select support
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

    // Advanced multi-select filters
    if (advancedFilters.processes.length > 0 && !advancedFilters.processes.includes(useCase.process)) return false;
    if (advancedFilters.linesOfBusiness.length > 0 && !advancedFilters.linesOfBusiness.includes(useCase.lineOfBusiness)) return false;
    if (advancedFilters.businessSegments.length > 0 && !advancedFilters.businessSegments.includes(useCase.businessSegment || '')) return false;
    if (advancedFilters.geographies.length > 0 && !advancedFilters.geographies.includes(useCase.geography || '')) return false;
    if (advancedFilters.useCaseTypes.length > 0 && !advancedFilters.useCaseTypes.includes(useCase.useCaseType)) return false;
    if (advancedFilters.quadrants.length > 0 && !advancedFilters.quadrants.includes(useCase.quadrant || '')) return false;

    return true;
  });

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
    if (window.confirm(`Are you sure you want to delete "${useCase.title}"?`)) {
      try {
        await onDelete?.(useCase);
        toast({
          title: "Use case deleted",
          description: `"${useCase.title}" has been removed.`,
        });
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error deleting use case",
          description: `Please try again. ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleActivate = async (useCase: UseCase) => {
    try {
      await onActivate?.(useCase.id, 'Activated from explorer');
      toast({
        title: "Use case activated",
        description: `"${useCase.title}" has been added to RSA Active Portfolio.`,
      });
    } catch (error) {
      console.error("Activation error:", error);
      toast({
        title: "Error activating use case",
        description: `Please try again. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (useCase: UseCase) => {
    try {
      await onDeactivate?.(useCase.id, 'Deactivated from explorer');
      toast({
        title: "Use case deactivated",
        description: `"${useCase.title}" has been moved to Reference Library.`,
      });
    } catch (error) {
      console.error("Deactivation error:", error);
      toast({
        title: "Error deactivating use case",
        description: `Please try again. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedUseCases);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUseCases(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredUseCases.length} use case{filteredUseCases.length !== 1 ? 's' : ''}
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Use Case
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search use cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel - CRUD LEGO Style */}
      {showAdvancedFilters && (
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg">Business Context Filters</CardTitle>
            <CardDescription>Multi-select filters to refine your use case view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Process Filter */}
              <MultiSelectField
                label="Process"
                items={metadata?.processes || []}
                selectedItems={advancedFilters.processes}
                onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, processes: items }))}
                helpText="Multi-select Process Activities available"
              />

              {/* Lines of Business Filter */}
              <MultiSelectField
                label="Lines of Business"
                items={metadata?.linesOfBusiness || []}
                selectedItems={advancedFilters.linesOfBusiness}
                onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, linesOfBusiness: items }))}
                helpText="Select one or more lines of business"
              />

              {/* Business Segments Filter */}
              <MultiSelectField
                label="Business Segments"
                items={metadata?.businessSegments || []}
                selectedItems={advancedFilters.businessSegments}
                onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, businessSegments: items }))}
                helpText="Select one or more business segments"
              />

              {/* Geographies Filter */}
              <MultiSelectField
                label="Geographies"
                items={metadata?.geographies || []}
                selectedItems={advancedFilters.geographies}
                onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, geographies: items }))}
                helpText="Select one or more geographic markets"
              />

              {/* Use Case Types Filter */}
              <MultiSelectField
                label="Use Case Types"
                items={metadata?.useCaseTypes || []}
                selectedItems={advancedFilters.useCaseTypes}
                onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, useCaseTypes: items }))}
                helpText="Select one or more use case types"
              />

              {/* Quadrants Filter - Only show if enabled */}
              {showQuadrantFilters && (
                <MultiSelectField
                  label="Quadrants"
                  items={['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']}
                  selectedItems={advancedFilters.quadrants}
                  onSelectionChange={(items) => setAdvancedFilters(prev => ({ ...prev, quadrants: items }))}
                  helpText="Select one or more priority quadrants"
                />
              )}
            </div>
            
            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAdvancedFilters({
                  processes: [],
                  linesOfBusiness: [],
                  businessSegments: [],
                  geographies: [],
                  useCaseTypes: [],
                  quadrants: []
                })}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Summary */}
      {(advancedFilters.processes.length > 0 || 
        advancedFilters.linesOfBusiness.length > 0 || 
        advancedFilters.businessSegments.length > 0 || 
        advancedFilters.geographies.length > 0 || 
        advancedFilters.useCaseTypes.length > 0 || 
        advancedFilters.quadrants.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          {advancedFilters.processes.map(item => (
            <Badge key={`process-${item}`} variant="secondary" className="text-xs">
              Process: {item}
            </Badge>
          ))}
          {advancedFilters.linesOfBusiness.map(item => (
            <Badge key={`lob-${item}`} variant="secondary" className="text-xs">
              LOB: {item}
            </Badge>
          ))}
          {advancedFilters.businessSegments.map(item => (
            <Badge key={`segment-${item}`} variant="secondary" className="text-xs">
              Segment: {item}
            </Badge>
          ))}
          {advancedFilters.geographies.map(item => (
            <Badge key={`geo-${item}`} variant="secondary" className="text-xs">
              Geography: {item}
            </Badge>
          ))}
          {advancedFilters.useCaseTypes.map(item => (
            <Badge key={`type-${item}`} variant="secondary" className="text-xs">
              Type: {item}
            </Badge>
          ))}
          {advancedFilters.quadrants.map(item => (
            <Badge key={`quadrant-${item}`} variant="secondary" className="text-xs">
              Quadrant: {item}
            </Badge>
          ))}
        </div>
      )}

      {/* Use Cases Grid */}
      {filteredUseCases.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Use Cases Found</h3>
            <p className="text-gray-500 mb-4">{emptyStateMessage}</p>
            {showCreateButton && (
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Use Case
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUseCases.map((useCase) => (
            <Card key={useCase.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4" 
                  style={{ borderLeftColor: useCase.quadrant ? getQuadrantColor(useCase.quadrant) : '#e5e7eb' }}>
              {/* Quadrant Badge */}
              {useCase.quadrant && (
                <div className={`absolute right-2 top-2 px-2 py-1 rounded text-xs font-bold text-white ${getQuadrantBackgroundColor(useCase.quadrant)}`}>
                  {useCase.quadrant === 'Quick Win' && 'Quick Win'}
                  {useCase.quadrant === 'Strategic Bet' && 'Strategic'}
                  {useCase.quadrant === 'Experimental' && 'Experimental'}
                  {useCase.quadrant === 'Watchlist' && 'Watchlist'}
                </div>
              )}

              {/* Multi-selection checkbox */}
              {selectedUseCases.size > 0 && (
                <button
                  onClick={() => toggleSelection(useCase.id)}
                  className="absolute left-2 top-2 z-10"
                >
                  {selectedUseCases.has(useCase.id) ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-8">
                    <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-sm">
                      {useCase.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {useCase.process}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {useCase.lineOfBusiness}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {useCase.useCaseType}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Scores Display */}
                {useCase.impactScore !== undefined && useCase.effortScore !== undefined && (
                  <div className="flex justify-between items-center">
                    <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex-1 mr-2">
                      <div className="text-xl font-bold text-green-700 dark:text-green-400">
                        {useCase.impactScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 font-medium">Impact</div>
                    </div>
                    <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-1 ml-2">
                      <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        {useCase.effortScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-500 font-medium">Effort</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(useCase)}
                      className="h-8 px-3 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(useCase)}
                        className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>

                  {/* RSA Selection Buttons */}
                  {showRSASelection && (
                    <div className="flex gap-2">
                      {(useCase.isActiveForRsa === 'false' || useCase.isActiveForRsa === false || !useCase.isActiveForRsa) ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleActivate(useCase)}
                          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Move to RSA
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(useCase)}
                          className="h-8 px-3 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Library className="h-3 w-3 mr-1" />
                          Move to Library
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <CRUDUseCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        useCase={selectedUseCase}
      />
    </div>
  );
}