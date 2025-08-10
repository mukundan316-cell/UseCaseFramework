import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Library, Package, Tag, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUseCases } from '../../contexts/UseCaseContext';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../../utils/calculations';
import CRUDUseCaseModal from './CRUDUseCaseModal';
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
  const { metadata, filters, setFilters } = useUseCases();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());

  // Local filtering with search
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

    // Global filters
    if (filters.process && useCase.process !== filters.process) return false;
    if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.useCaseType && useCase.useCaseType !== filters.useCaseType) return false;
    if (filters.quadrant && useCase.quadrant !== filters.quadrant) return false;

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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <Select
            value={filters.process || "all"}
            onValueChange={(value) => setFilters({ process: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Processes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Processes</SelectItem>
              {metadata?.processes?.map((process) => (
                <SelectItem key={process} value={process}>
                  {process}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.lineOfBusiness || "all"}
            onValueChange={(value) => setFilters({ lineOfBusiness: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All LOBs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All LOBs</SelectItem>
              {metadata?.linesOfBusiness?.map((lob) => (
                <SelectItem key={lob} value={lob}>
                  {lob}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.useCaseType || "all"}
            onValueChange={(value) => setFilters({ useCaseType: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {metadata?.useCaseTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showQuadrantFilters && (
            <Select
              value={filters.quadrant || "all"}
              onValueChange={(value) => setFilters({ quadrant: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Quadrants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quadrants</SelectItem>
                <SelectItem value="Quick Win">Quick Win</SelectItem>
                <SelectItem value="Strategic Bet">Strategic Bet</SelectItem>
                <SelectItem value="Experimental">Experimental</SelectItem>
                <SelectItem value="Watchlist">Watchlist</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.process || filters.lineOfBusiness || filters.useCaseType || filters.quadrant || searchTerm) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
              Search: "{searchTerm}" ×
            </Badge>
          )}
          {filters.process && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ process: '' })}>
              Process: {filters.process} ×
            </Badge>
          )}
          {filters.lineOfBusiness && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ lineOfBusiness: '' })}>
              LOB: {filters.lineOfBusiness} ×
            </Badge>
          )}
          {filters.useCaseType && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ useCaseType: '' })}>
              Type: {filters.useCaseType} ×
            </Badge>
          )}
          {filters.quadrant && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ quadrant: '' })}>
              Quadrant: {filters.quadrant} ×
            </Badge>
          )}
        </div>
      )}

      {/* Use Cases Grid */}
      {filteredUseCases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyStateMessage}</h3>
            {useCases.length === 0 ? (
              <p className="text-muted-foreground text-center mb-4">
                Get started by adding your first use case.
              </p>
            ) : (
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your search terms or filters.
              </p>
            )}
            {showCreateButton && useCases.length === 0 && (
              <Button onClick={handleCreate}>Add Your First Use Case</Button>
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

              {/* Selection Checkbox */}
              <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleSelection(useCase.id)}
                  className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50"
                >
                  {selectedUseCases.has(useCase.id) ? (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

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
                      {useCase.isActiveForRsa === 'false' || useCase.isActiveForRsa === false ? (
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