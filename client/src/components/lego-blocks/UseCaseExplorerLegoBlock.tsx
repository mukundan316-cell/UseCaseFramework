import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Library, Package, Tag, CheckCircle, Circle, BarChart3 } from 'lucide-react';
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
  const { metadata } = useUseCases();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());

  // Simple dropdown filters - matching original design
  const [filters, setFilters] = useState({
    process: '',
    lineOfBusiness: '',
    businessSegment: '',
    geography: '',
    useCaseType: '',
    quadrant: ''
  });

  // Simple filtering with dropdown selects
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

    // Simple dropdown filters
    if (filters.process && useCase.process !== filters.process) return false;
    if (filters.lineOfBusiness && useCase.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.businessSegment && useCase.businessSegment !== filters.businessSegment) return false;
    if (filters.geography && useCase.geography !== filters.geography) return false;
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
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header Section */}
      <div className="p-6 border-b">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Showing {filteredUseCases.length} use case{filteredUseCases.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search use cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            
            {showCreateButton && (
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Use Case
              </Button>
            )}
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Quadrant Tabs - Only show for Active Portfolio */}
      {showQuadrantFilters && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex space-x-1">
            <Button 
              variant={!filters.quadrant ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, quadrant: '' }))}
              className={!filters.quadrant ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
            >
              All
            </Button>
            <Button 
              variant={filters.quadrant === "Quick Win" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, quadrant: 'Quick Win' }))}
              className={filters.quadrant === "Quick Win" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
            >
              Quick Win
            </Button>
            <Button 
              variant={filters.quadrant === "Strategic Bet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, quadrant: 'Strategic Bet' }))}
              className={filters.quadrant === "Strategic Bet" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
            >
              Strategic Bet
            </Button>
            <Button 
              variant={filters.quadrant === "Experimental" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, quadrant: 'Experimental' }))}
              className={filters.quadrant === "Experimental" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
            >
              Experimental
            </Button>
            <Button 
              variant={filters.quadrant === "Watchlist" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, quadrant: 'Watchlist' }))}
              className={filters.quadrant === "Watchlist" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
            >
              Watchlist
            </Button>
          </div>
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* All Processes */}
        <Select
          value={filters.process || "all"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, process: value === 'all' ? '' : value }))}
        >
          <SelectTrigger>
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

        {/* All LOBs */}
        <Select
          value={filters.lineOfBusiness || "all"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, lineOfBusiness: value === 'all' ? '' : value }))}
        >
          <SelectTrigger>
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

        {/* All Segments */}
        <Select
          value={filters.businessSegment || "all"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, businessSegment: value === 'all' ? '' : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {metadata?.businessSegments?.map((segment) => (
              <SelectItem key={segment} value={segment}>
                {segment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* All Geographies */}
        <Select
          value={filters.geography || "all"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, geography: value === 'all' ? '' : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Geographies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Geographies</SelectItem>
            {metadata?.geographies?.map((geo) => (
              <SelectItem key={geo} value={geo}>
                {geo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* All Types */}
        <Select
          value={filters.useCaseType || "all"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, useCaseType: value === 'all' ? '' : value }))}
        >
          <SelectTrigger>
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

        </div>
        
        {/* Show Recommendations Only Toggle - For Reference Library */}
        {!showQuadrantFilters && (
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRecommendationsOnly"
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showRecommendationsOnly" className="text-sm text-gray-700 flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              Show Recommendations Only
            </label>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Use Cases Grid */}
        {filteredUseCases.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
              <Card key={useCase.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-200 bg-white" 
                    style={{ borderLeft: '4px solid #3b82f6' }}>

                <CardContent className="p-4">
                  {/* Title and Description */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {useCase.description}
                    </p>
                  </div>

                  {/* Business Context Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center text-xs text-blue-800" style={{ backgroundColor: 'transparent' }}>
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                      {useCase.process}
                    </span>
                    <span className="inline-flex items-center text-xs text-purple-800" style={{ backgroundColor: 'transparent' }}>
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-1"></div>
                      {useCase.lineOfBusiness}
                    </span>
                    <span className="inline-flex items-center text-xs text-orange-800" style={{ backgroundColor: 'transparent' }}>
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-1"></div>
                      {useCase.useCaseType}
                    </span>
                  </div>

                  {/* Scores Display - Only for RSA Active Portfolio */}
                  {showQuadrantFilters && useCase.impactScore !== undefined && useCase.effortScore !== undefined && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-700">
                          {useCase.impactScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-green-600">Impact</div>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-700">
                          {useCase.effortScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-blue-600">Effort</div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(useCase)}
                        className="h-7 px-2 text-xs border-none text-gray-600 hover:bg-gray-100"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(useCase)}
                          className="h-7 px-2 text-xs border-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>

                    {/* RSA Selection Buttons */}
                    {showRSASelection && (
                      <div className="flex gap-1">
                        {(useCase.isActiveForRsa !== 'true') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivate(useCase)}
                            className="h-7 px-2 text-xs border-none text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Move to RSA
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivate(useCase)}
                            className="h-7 px-2 text-xs border-none text-orange-600 hover:text-orange-700 hover:bg-orange-50"
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
      </div>

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