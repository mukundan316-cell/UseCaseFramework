import React from 'react';
import { Search, Filter, ChevronRight, BarChart3, Package, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUseCases } from '../contexts/UseCaseContext';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../utils/calculations';

export default function Explorer() {
  const { 
    metadata, 
    filters, 
    setFilters, 
    getFilteredUseCases 
  } = useUseCases();

  const filteredUseCases = getFilteredUseCases();

  const quickFilters = [
    { label: 'All', value: '', active: !filters.quadrant },
    { label: 'Quick Win', value: 'Quick Win', active: filters.quadrant === 'Quick Win' },
    { label: 'Strategic Bet', value: 'Strategic Bet', active: filters.quadrant === 'Strategic Bet' },
    { label: 'Experimental', value: 'Experimental', active: filters.quadrant === 'Experimental' },
    { label: 'Watchlist', value: 'Watchlist', active: filters.quadrant === 'Watchlist' },
  ];

  const UseCaseCard = ({ useCase }: { useCase: any }) => (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {useCase.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {useCase.description}
            </CardDescription>
          </div>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-lg ml-4 whitespace-nowrap"
            style={{ 
              backgroundColor: getQuadrantBackgroundColor(useCase.quadrant),
              color: getQuadrantColor(useCase.quadrant)
            }}
          >
            {useCase.quadrant}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {useCase.valueChainComponent} • {useCase.process}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {useCase.lineOfBusiness} • {useCase.businessSegment} • {useCase.geography}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{useCase.useCaseType}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {useCase.impactScore.toFixed(1)}
              </div>
              <div className="text-gray-500">Impact</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">
                {useCase.effortScore.toFixed(1)}
              </div>
              <div className="text-gray-500">Effort</div>
            </div>
            <button className="text-rsa-blue hover:text-blue-700">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Use Case Explorer
              </CardTitle>
              <CardDescription>Filter and search AI use cases</CardDescription>
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
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setFilters({ quadrant: filter.value })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter.active
                    ? 'bg-rsa-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Select value={filters.valueChainComponent} onValueChange={(value) => setFilters({ valueChainComponent: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Value Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {metadata.valueChainComponents.filter(component => component && component.trim()).map(component => (
                  <SelectItem key={component} value={component}>{component}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.process} onValueChange={(value) => setFilters({ process: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Process" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                {metadata.processes.filter(process => process && process.trim()).map(process => (
                  <SelectItem key={process} value={process}>{process}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.lineOfBusiness} onValueChange={(value) => setFilters({ lineOfBusiness: value })}>
              <SelectTrigger>
                <SelectValue placeholder="LOB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LOBs</SelectItem>
                {metadata.linesOfBusiness.filter(lob => lob && lob.trim()).map(lob => (
                  <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.businessSegment} onValueChange={(value) => setFilters({ businessSegment: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                {metadata.businessSegments.filter(segment => segment && segment.trim()).map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.geography} onValueChange={(value) => setFilters({ geography: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Geography" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Geographies</SelectItem>
                {metadata.geographies.filter(geo => geo && geo.trim()).map(geo => (
                  <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.useCaseType} onValueChange={(value) => setFilters({ useCaseType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {metadata.useCaseTypes.filter(type => type && type.trim()).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </div>
  );
}
