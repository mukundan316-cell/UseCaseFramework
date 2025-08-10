import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, ChevronDown, ChevronUp, Settings, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UseCase {
  id: string;
  title: string;
  description: string;
  process: string;
  activity: string;
  line_of_business: string;
  use_case_type: string;
}

interface UserProfile {
  businessLines?: string[];
  currentSystems?: string[];
  aiMaturity?: number;
  processes?: string[];
}

interface DynamicUseCaseSelectorProps {
  label: string;
  helpText?: string;
  userProfile: UserProfile;
  value?: {
    selectedUseCases?: string[];
    successStories?: string;
    notes?: string;
  };
  onChange: (value: any) => void;
  disabled?: boolean;
  required?: boolean;
  allowNotes?: boolean;
  notesPrompt?: string;
}

interface CategoryGroup {
  key: string;
  label: string;
  count: number;
  useCases: UseCase[];
  type: 'process' | 'use_case_type';
}

export default function DynamicUseCaseSelector({
  label,
  helpText,
  userProfile,
  value = {},
  onChange,
  disabled = false,
  required = false,
  allowNotes = true,
  notesPrompt = "Additional context about your AI applications"
}: DynamicUseCaseSelectorProps) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch use cases from library
  useEffect(() => {
    const fetchUseCases = async () => {
      try {
        const response = await fetch('/api/use-cases/reference');
        const data = await response.json();
        setUseCases(data);
      } catch (error) {
        console.error('Failed to fetch use cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUseCases();
  }, []);

  // Filter use cases based on user profile
  const filteredUseCases = useMemo(() => {
    if (!useCases.length) return [];
    
    return useCases.filter(useCase => {
      // Filter by business lines if available
      if (userProfile.businessLines?.length) {
        const matchesBusinessLine = userProfile.businessLines.some(line => 
          useCase.line_of_business?.toLowerCase().includes(line.toLowerCase()) ||
          useCase.line_of_business === 'All Lines' ||
          line.toLowerCase().includes('all')
        );
        if (!matchesBusinessLine) return false;
      }

      // Filter by current processes if available  
      if (userProfile.processes?.length) {
        const matchesProcess = userProfile.processes.some(process =>
          useCase.process?.toLowerCase().includes(process.toLowerCase())
        );
        if (!matchesProcess && useCase.process) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          useCase.title.toLowerCase().includes(searchLower) ||
          useCase.description.toLowerCase().includes(searchLower) ||
          useCase.use_case_type.toLowerCase().includes(searchLower) ||
          useCase.process?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [useCases, userProfile, searchTerm]);

  // Group filtered use cases by category
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, CategoryGroup>();

    // First group by process (primary grouping)
    filteredUseCases.forEach(useCase => {
      if (!useCase.process) return;
      
      const key = useCase.process;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: useCase.process,
          count: 0,
          useCases: [],
          type: 'process'
        });
      }
      const group = groups.get(key)!;
      group.useCases.push(useCase);
      group.count = group.useCases.length;
    });

    // Then group by use case type (secondary grouping)
    filteredUseCases.forEach(useCase => {
      const key = `type_${useCase.use_case_type}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: useCase.use_case_type,
          count: 0,
          useCases: [],
          type: 'use_case_type'
        });
      }
      const group = groups.get(key)!;
      if (!group.useCases.find(uc => uc.id === useCase.id)) {
        group.useCases.push(useCase);
        group.count = group.useCases.length;
      }
    });

    return Array.from(groups.values())
      .filter(group => group.count > 0)
      .sort((a, b) => {
        // Process groups first, then type groups
        if (a.type !== b.type) {
          return a.type === 'process' ? -1 : 1;
        }
        return b.count - a.count; // Sort by count descending within type
      });
  }, [filteredUseCases]);

  // Get primary categories (top 4-5 most relevant)
  const primaryCategories = categoryGroups
    .filter(group => group.type === 'process')
    .slice(0, 4);
  
  const secondaryCategories = showAllCategories 
    ? categoryGroups.filter(group => !primaryCategories.includes(group))
    : [];

  const handleUseCaseToggle = (useCaseId: string) => {
    const selectedUseCases = value.selectedUseCases || [];
    const newSelected = selectedUseCases.includes(useCaseId)
      ? selectedUseCases.filter(id => id !== useCaseId)
      : [...selectedUseCases, useCaseId];
    
    onChange({
      ...value,
      selectedUseCases: newSelected
    });
  };

  const handleFieldChange = (field: string, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  const toggleCategoryExpansion = (categoryKey: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCategoryGroup = (group: CategoryGroup, isPrimary: boolean = true) => {
    const isExpanded = expandedCategories.includes(group.key) || isPrimary;
    const selectedInCategory = group.useCases.filter(uc => 
      value.selectedUseCases?.includes(uc.id)
    ).length;

    return (
      <div key={group.key} className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleCategoryExpansion(group.key)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
              group.type === 'process' 
                ? "bg-blue-100 text-blue-700" 
                : "bg-purple-100 text-purple-700"
            )}>
              {group.count}
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">{group.label}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{group.count} applications</span>
                {selectedInCategory > 0 && (
                  <Badge variant="secondary" className="h-5 px-2">
                    {selectedInCategory} selected
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            {group.useCases.map(useCase => (
              <div 
                key={useCase.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={useCase.id}
                  checked={value.selectedUseCases?.includes(useCase.id) || false}
                  onCheckedChange={() => handleUseCaseToggle(useCase.id)}
                  disabled={disabled}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <Label 
                    htmlFor={useCase.id}
                    className="font-medium text-gray-900 cursor-pointer"
                  >
                    {useCase.title}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {useCase.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {useCase.use_case_type}
                    </Badge>
                    {useCase.line_of_business && (
                      <Badge variant="outline" className="text-xs">
                        {useCase.line_of_business}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search AI applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium text-blue-900">
                {filteredUseCases.length} applications available
              </span>
              {(value.selectedUseCases?.length || 0) > 0 && (
                <span className="text-blue-700 ml-2">
                  ({value.selectedUseCases?.length || 0} selected)
                </span>
              )}
            </div>
            {userProfile.businessLines && (
              <div className="text-xs text-blue-700">
                Filtered for: {userProfile.businessLines.join(', ')}
              </div>
            )}
          </div>

          {/* Primary Categories */}
          <div className="space-y-3">
            {primaryCategories.map(group => renderCategoryGroup(group, true))}
          </div>

          {/* Show More/Less Toggle */}
          {categoryGroups.length > primaryCategories.length && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full"
              disabled={disabled}
            >
              {showAllCategories ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less Categories
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {categoryGroups.length - primaryCategories.length} More Categories
                </>
              )}
            </Button>
          )}

          {/* Secondary Categories */}
          {secondaryCategories.length > 0 && (
            <div className="space-y-3">
              {secondaryCategories.map(group => renderCategoryGroup(group, false))}
            </div>
          )}

          {/* Success Stories */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-900">
              Success Stories
            </Label>
            <Textarea
              value={value.successStories || ''}
              onChange={(e) => handleFieldChange('successStories', e.target.value)}
              placeholder="Describe your AI success stories and outcomes..."
              disabled={disabled}
              className="min-h-[80px]"
            />
          </div>

          {/* Notes Section */}
          {allowNotes && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700">
                {notesPrompt}
              </Label>
              <Textarea
                value={value.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add any additional context about your AI applications..."
                disabled={disabled}
                className="min-h-[80px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}