import React, { useState } from 'react';
import { Search, Filter, ChevronRight, BarChart3, Package, Tag, Plus, Edit, Trash2, Library, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../utils/calculations';
import FilterChip from './lego-blocks/FilterChip';
import CRUDUseCaseModal from './lego-blocks/CRUDUseCaseModal';
import { UseCase } from '../types';
import { useToast } from '@/hooks/use-toast';

export default function Explorer() {
  const { 
    metadata, 
    filters, 
    setFilters, 
    getFilteredUseCases,
    deleteUseCase,
    referenceUseCases,
    activateUseCase,
    deactivateUseCase
  } = useUseCases();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | undefined>();
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<Set<string>>(new Set());

  const filteredUseCases = getFilteredUseCases();
  
  // Filter reference library use cases based on search
  const filteredReferenceUseCases = (referenceUseCases || []).filter((useCase) => {
    if (!librarySearch) return true;
    const searchLower = librarySearch.toLowerCase();
    return (
      useCase.title.toLowerCase().includes(searchLower) ||
      useCase.description.toLowerCase().includes(searchLower) ||
      useCase.process.toLowerCase().includes(searchLower) ||
      useCase.lineOfBusiness.toLowerCase().includes(searchLower) ||
      useCase.useCaseType.toLowerCase().includes(searchLower)
    );
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
  };

  const handleDelete = async (useCase: UseCase) => {
    if (window.confirm(`Are you sure you want to delete "${useCase.title}"?`)) {
      try {
        await deleteUseCase(useCase.id);
        toast({
          title: "Use case deleted",
          description: `"${useCase.title}" has been removed from the database.`,
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

  // Library management functions
  const toggleUseCaseSelection = (useCaseId: string) => {
    const newSelection = new Set(selectedUseCases);
    if (newSelection.has(useCaseId)) {
      newSelection.delete(useCaseId);
    } else {
      newSelection.add(useCaseId);
    }
    setSelectedUseCases(newSelection);
  };

  const handleActivateSelected = async () => {
    if (selectedUseCases.size === 0) {
      toast({
        title: "No use cases selected",
        description: "Please select use cases to activate for RSA portfolio.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const useCaseId of selectedUseCases) {
        await activateUseCase(useCaseId);
      }
      
      toast({
        title: "Use cases activated",
        description: `${selectedUseCases.size} use cases added to RSA active portfolio.`,
      });
      setSelectedUseCases(new Set());
    } catch (error) {
      toast({
        title: "Error activating use cases",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedUseCases.size === filteredReferenceUseCases.length) {
      setSelectedUseCases(new Set());
    } else {
      setSelectedUseCases(new Set(filteredReferenceUseCases.map(uc => uc.id)));
    }
  };

  const quickFilters = [
    { label: 'All', value: '', active: !filters.quadrant },
    { label: 'Quick Win', value: 'Quick Win', active: filters.quadrant === 'Quick Win' },
    { label: 'Strategic Bet', value: 'Strategic Bet', active: filters.quadrant === 'Strategic Bet' },
    { label: 'Experimental', value: 'Experimental', active: filters.quadrant === 'Experimental' },
    { label: 'Watchlist', value: 'Watchlist', active: filters.quadrant === 'Watchlist' },
  ];

  const getQuadrantGradient = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return 'bg-gradient-to-br from-green-50 to-emerald-100';
      case 'Strategic Bet':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100';
      case 'Experimental':
        return 'bg-gradient-to-br from-yellow-50 to-amber-100';
      case 'Watchlist':
        return 'bg-gradient-to-br from-red-50 to-rose-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-100';
    }
  };

  const getQuadrantBorder = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return 'border-l-4 border-l-green-500';
      case 'Strategic Bet':
        return 'border-l-4 border-l-blue-500';
      case 'Experimental':
        return 'border-l-4 border-l-yellow-500';
      case 'Watchlist':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };

  const getQuadrantIcon = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return '⚡';
      case 'Strategic Bet':
        return '🎯';
      case 'Experimental':
        return '🧪';
      case 'Watchlist':
        return '👁️';
      default:
        return '📊';
    }
  };

  const UseCaseCard = ({ useCase }: { useCase: UseCase }) => (
    <Card className={`${getQuadrantGradient(useCase.quadrant)} ${getQuadrantBorder(useCase.quadrant)} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{getQuadrantIcon(useCase.quadrant)}</span>
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm"
                style={{ 
                  backgroundColor: getQuadrantBackgroundColor(useCase.quadrant),
                  color: getQuadrantColor(useCase.quadrant)
                }}
              >
                {useCase.quadrant}
              </span>
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {useCase.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-700 leading-relaxed">
              {useCase.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(useCase)}
              className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(useCase)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-3 bg-white/40 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{useCase.process}</div>
              <div className="text-xs text-gray-600">{(useCase as any).activities?.join(', ') || useCase.activity}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                {(useCase as any).linesOfBusiness?.length > 1 
                  ? `${(useCase as any).linesOfBusiness.join(', ')} (Multi-LOB)` 
                  : useCase.lineOfBusiness}
              </div>
              <div className="text-xs text-gray-600">{useCase.businessSegment} • {useCase.geography}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{useCase.useCaseType}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <span className="font-bold text-green-700 text-sm">
                    {useCase.impactScore.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">Impact</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                  <span className="font-bold text-orange-700 text-sm">
                    {useCase.effortScore.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">Effort</div>
              </div>
            </div>
            <button 
              onClick={() => handleEdit(useCase)}
              className="text-rsa-blue hover:text-blue-700 p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Library use case card component
  const LibraryUseCaseCard = ({ useCase }: { useCase: UseCase }) => (
    <Card 
      key={useCase.id} 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg border-2
        ${selectedUseCases.has(useCase.id) 
          ? 'border-rsa-blue bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${getQuadrantBackgroundColor(useCase.quadrant)}
      `}
      onClick={() => toggleUseCaseSelection(useCase.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {selectedUseCases.has(useCase.id) ? (
                <CheckCircle className="h-5 w-5 text-rsa-blue" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <Badge variant="outline" className="text-xs">
                {useCase.quadrant}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {useCase.useCaseType}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {useCase.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-700 leading-relaxed mb-3">
              {useCase.description}
            </CardDescription>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="bg-white/60 px-2 py-1 rounded">{useCase.process}</span>
              <span className="bg-white/60 px-2 py-1 rounded">{useCase.lineOfBusiness}</span>
              <span className="bg-white/60 px-2 py-1 rounded">{useCase.geography}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <span className="font-bold text-green-700 text-xs">
                  {useCase.impactScore.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Impact</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                <span className="font-bold text-orange-700 text-xs">
                  {useCase.effortScore.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Effort</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="portfolio" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Active Portfolio ({filteredUseCases.length})
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Reference Library ({(referenceUseCases || []).length})
            </TabsTrigger>
          </TabsList>
          
          {selectedUseCases.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedUseCases.size} selected
              </Badge>
              <Button 
                onClick={handleActivateSelected}
                size="sm"
                className="bg-rsa-blue hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to RSA Portfolio
              </Button>
            </div>
          )}
        </div>

        {/* Active Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Filter Panel */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Use Case Explorer
              </CardTitle>
              <CardDescription>Browse, filter, and manage AI use cases with embedded CRUD functionality</CardDescription>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search use cases..."
                  className="pl-10 pr-4 w-64"
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="bg-rsa-blue hover:bg-rsa-purple">
                <Plus className="h-4 w-4 mr-2" />
                Add Use Case
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {quickFilters.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                active={filter.active}
                onClick={() => setFilters({ quadrant: filter.value })}
                variant="primary"
              />
            ))}
          </div>

          {/* Reorganized Filters: Process → Activity → LOB → Segment → Geography → Type */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 1. Primary Process Filter */}
            <Select value={filters.process || 'all'} onValueChange={(value) => setFilters({ process: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Processes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                {metadata?.processes?.filter(process => process && process.trim()).map(process => (
                  <SelectItem key={process} value={process}>{process}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 2. Contextual Activity Filter */}
            <Select value={filters.activity || 'all'} onValueChange={(value) => setFilters({ activity: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {metadata?.activities?.filter(activity => activity && activity.trim()).map(activity => (
                  <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 3. Line of Business Filter */}
            <Select value={filters.lineOfBusiness || 'all'} onValueChange={(value) => setFilters({ lineOfBusiness: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="LOB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LOBs</SelectItem>
                {metadata?.linesOfBusiness?.filter(lob => lob && lob.trim()).map(lob => (
                  <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 4. Business Segment Filter */}
            <Select value={filters.businessSegment || 'all'} onValueChange={(value) => setFilters({ businessSegment: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                {metadata?.businessSegments?.filter(segment => segment && segment.trim()).map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 5. Geography Filter */}
            <Select value={filters.geography || 'all'} onValueChange={(value) => setFilters({ geography: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Geographies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Geographies</SelectItem>
                {metadata?.geographies?.filter(geo => geo && geo.trim()).map(geo => (
                  <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 6. Use Case Type Filter */}
            <Select value={filters.useCaseType || 'all'} onValueChange={(value) => setFilters({ useCaseType: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {metadata?.useCaseTypes?.filter(type => type && type.trim()).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Assessment Recommendations Toggle */}
          <div className="mt-4 flex justify-end">
            <Button
              variant={filters.showRecommendations ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ showRecommendations: !filters.showRecommendations })}
              className={`transition-all duration-200 ${
                filters.showRecommendations 
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600" 
                  : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              }`}
            >
              ⭐ Show Recommendations Only
            </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredUseCases.length} use case{filteredUseCases.length !== 1 ? 's' : ''}
          </div>

          {/* Use Case Cards */}
          {filteredUseCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUseCases.map((useCase) => (
                <UseCaseCard key={useCase.id} useCase={useCase} />
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No use cases found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          )}

          {/* CRUD Modal for Use Case Management */}
          <CRUDUseCaseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            mode={modalMode}
            useCase={selectedUseCase}
          />
        </TabsContent>

        {/* Reference Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Reference Library Search</CardTitle>
                  <CardDescription>Search and select use cases to add to RSA active portfolio</CardDescription>
                </div>
                {filteredReferenceUseCases.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {selectedUseCases.size === filteredReferenceUseCases.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search library by title, description, process, or type..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredReferenceUseCases.length} reference use cases</span>
            {selectedUseCases.size > 0 && (
              <span className="text-rsa-blue font-medium">{selectedUseCases.size} selected for activation</span>
            )}
          </div>

          {/* Library Use Case Cards */}
          {filteredReferenceUseCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReferenceUseCases.map((useCase) => (
                <LibraryUseCaseCard key={useCase.id} useCase={useCase} />
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Library className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reference use cases found</h3>
                <p className="text-gray-600">
                  {librarySearch ? 'Try adjusting your search terms.' : 'The reference library is empty.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
