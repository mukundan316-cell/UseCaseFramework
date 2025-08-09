import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ReusableButton from './ReusableButton';
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Upload, 
  Download,
  Copy,
  Edit,
  Trash2,
  BookOpen,
  Target,
  Scale,
  List,
  CheckSquare,
  Type,
  Hash,
  Calendar,
  Mail,
  Globe,
  Zap,
  Lightbulb,
  Star
} from 'lucide-react';

// Question template interface
export interface QuestionTemplate {
  id: string;
  title: string;
  description: string;
  questionType: 'scale' | 'multiChoice' | 'ranking' | 'allocation' | 'text' | 'boolean' | 'matrix' | 'compound' | 'score' | 'checkbox' | 'textarea' | 'number' | 'email' | 'url' | 'date';
  category: string;
  section: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
  isStarred: boolean;
  estimatedTime: number; // seconds
  helpText?: string;
  questionData: any; // JSON data specific to question type
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Filter and search interface
export interface TemplateFilters {
  category: string;
  section: string;
  questionType: string;
  difficulty: string;
  isStarred: boolean;
  searchTerm: string;
}

export interface QuestionTemplateLibraryLegoBlockProps {
  onAddQuestion: (template: QuestionTemplate, targetSection: number) => Promise<void>;
  onBulkImport: (templates: QuestionTemplate[], targetSection: number) => Promise<void>;
  onCreateCustom: (template: Partial<QuestionTemplate>) => Promise<void>;
  onUpdateTemplate: (id: string, updates: Partial<QuestionTemplate>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

// Question type configurations
const QUESTION_TYPE_CONFIG = {
  scale: { icon: Scale, label: 'Scale Rating', color: 'bg-blue-500' },
  multiChoice: { icon: CheckSquare, label: 'Multiple Choice', color: 'bg-green-500' },
  ranking: { icon: List, label: 'Ranking', color: 'bg-purple-500' },
  allocation: { icon: Target, label: 'Allocation', color: 'bg-orange-500' },
  text: { icon: Type, label: 'Text Input', color: 'bg-gray-500' },
  boolean: { icon: CheckSquare, label: 'Yes/No', color: 'bg-indigo-500' },
  matrix: { icon: Hash, label: 'Matrix', color: 'bg-pink-500' },
  compound: { icon: Zap, label: 'Compound', color: 'bg-red-500' },
  score: { icon: Star, label: 'Score', color: 'bg-yellow-500' },
  checkbox: { icon: CheckSquare, label: 'Checkbox', color: 'bg-teal-500' },
  textarea: { icon: Type, label: 'Long Text', color: 'bg-slate-500' },
  number: { icon: Hash, label: 'Number', color: 'bg-cyan-500' },
  email: { icon: Mail, label: 'Email', color: 'bg-violet-500' },
  url: { icon: Globe, label: 'URL', color: 'bg-emerald-500' },
  date: { icon: Calendar, label: 'Date', color: 'bg-rose-500' }
};

// RSA Question Categories
const RSA_CATEGORIES = [
  'Strategic Foundation',
  'AI Capabilities',
  'Use Case Discovery', 
  'Technology Infrastructure',
  'Organizational Readiness',
  'Risk & Compliance'
];

/**
 * QuestionTemplateLibraryLegoBlock - Comprehensive question template management
 * 
 * Features:
 * - Browse pre-built question templates by category
 * - Search and filter questions by multiple criteria
 * - Preview questions before adding to sections
 * - Bulk import capabilities for efficient section building
 * - Custom question creation from templates
 * - Template management with CRUD operations
 * - RSA's 100+ questions categorized by section
 * - Database-driven template storage
 */
export default function QuestionTemplateLibraryLegoBlock({
  onAddQuestion,
  onBulkImport,
  onCreateCustom,
  onUpdateTemplate,
  onDeleteTemplate,
  className = '',
  readOnly = false
}: QuestionTemplateLibraryLegoBlockProps) {
  
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [filters, setFilters] = useState<TemplateFilters>({
    category: 'all',
    section: 'all',
    questionType: 'all',
    difficulty: 'all',
    isStarred: false,
    searchTerm: ''
  });
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<QuestionTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [targetSection, setTargetSection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockTemplates: QuestionTemplate[] = [
        {
          id: '1',
          title: 'AI Strategy Alignment Assessment',
          description: 'Evaluate how well your AI initiatives align with overall business strategy',
          questionType: 'scale',
          category: 'Strategic Foundation',
          section: 'business_strategy',
          difficulty: 'intermediate',
          isRequired: true,
          isStarred: true,
          estimatedTime: 120,
          helpText: 'Consider both short-term tactical goals and long-term strategic vision',
          questionData: {
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
            scaleDescription: 'Rate your organization\'s AI strategy alignment'
          },
          tags: ['strategy', 'alignment', 'business', 'planning'],
          usageCount: 245,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z'
        },
        {
          id: '2',
          title: 'Data Quality Maturity Evaluation',
          description: 'Assess the quality and readiness of your data for AI applications',
          questionType: 'matrix',
          category: 'AI Capabilities',
          section: 'ai_capabilities',
          difficulty: 'advanced',
          isRequired: true,
          isStarred: false,
          estimatedTime: 180,
          helpText: 'Evaluate across completeness, accuracy, consistency, and timeliness dimensions',
          questionData: {
            rows: ['Completeness', 'Accuracy', 'Consistency', 'Timeliness'],
            columns: ['Poor', 'Fair', 'Good', 'Excellent'],
            description: 'Rate each data quality dimension'
          },
          tags: ['data', 'quality', 'maturity', 'foundation'],
          usageCount: 189,
          createdAt: '2024-01-16T09:15:00Z',
          updatedAt: '2024-01-22T11:45:00Z'
        },
        {
          id: '3',
          title: 'Use Case Prioritization Framework',
          description: 'Rank potential AI use cases by business value and implementation feasibility',
          questionType: 'ranking',
          category: 'Use Case Discovery',
          section: 'use_case_discovery',
          difficulty: 'intermediate',
          isRequired: false,
          isStarred: true,
          estimatedTime: 240,
          helpText: 'Consider ROI potential, implementation complexity, and strategic importance',
          questionData: {
            items: [
              'Customer Service Automation',
              'Predictive Analytics',
              'Process Optimization',
              'Risk Assessment',
              'Fraud Detection'
            ],
            maxRankings: 5,
            description: 'Drag to rank use cases by priority'
          },
          tags: ['use case', 'prioritization', 'ranking', 'value'],
          usageCount: 156,
          createdAt: '2024-01-17T14:20:00Z',
          updatedAt: '2024-01-25T09:10:00Z'
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates based on current filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !filters.searchTerm || 
      template.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    const matchesCategory = filters.category === 'all' || template.category === filters.category;
    const matchesSection = filters.section === 'all' || template.section === filters.section;
    const matchesType = filters.questionType === 'all' || template.questionType === filters.questionType;
    const matchesDifficulty = filters.difficulty === 'all' || template.difficulty === filters.difficulty;
    const matchesStarred = !filters.isStarred || template.isStarred;
    
    return matchesSearch && matchesCategory && matchesSection && matchesType && matchesDifficulty && matchesStarred;
  });

  // Handle template selection
  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Handle adding single question
  const handleAddQuestion = async (template: QuestionTemplate) => {
    try {
      await onAddQuestion(template, targetSection);
      console.log(`Added question "${template.title}" to section ${targetSection}`);
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (selectedTemplates.length === 0) return;
    
    try {
      const templatesToImport = templates.filter(t => selectedTemplates.includes(t.id));
      await onBulkImport(templatesToImport, targetSection);
      setSelectedTemplates([]);
      console.log(`Imported ${templatesToImport.length} questions to section ${targetSection}`);
    } catch (error) {
      console.error('Failed to bulk import questions:', error);
    }
  };

  // Get question type configuration
  const getQuestionTypeConfig = (type: string) => {
    return QUESTION_TYPE_CONFIG[type as keyof typeof QUESTION_TYPE_CONFIG] || QUESTION_TYPE_CONFIG.text;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render template card
  const renderTemplateCard = (template: QuestionTemplate) => {
    const typeConfig = getQuestionTypeConfig(template.questionType);
    const TypeIcon = typeConfig.icon;
    const isSelected = selectedTemplates.includes(template.id);

    return (
      <Card 
        key={template.id}
        className={cn(
          "relative transition-all duration-200 hover:shadow-md cursor-pointer",
          isSelected && "ring-2 ring-blue-500 bg-blue-50"
        )}
        onClick={() => toggleTemplateSelection(template.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <TypeIcon className={cn("h-4 w-4 text-white p-0.5 rounded", typeConfig.color)} />
                <Badge variant="outline" className="text-xs">
                  {typeConfig.label}
                </Badge>
                {template.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                {template.isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
              </div>
              <CardTitle className="text-sm leading-tight">{template.title}</CardTitle>
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleTemplateSelection(template.id)}
              className="h-4 w-4 text-blue-600 rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            {template.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
            <span>{Math.round(template.estimatedTime / 60)}m</span>
            <span>{template.usageCount} uses</span>
          </div>
          
          <div className="flex space-x-1 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewTemplate(template)}
              className="flex-1 h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddQuestion(template)}
              className="flex-1 h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-[#005DAA]" />
            <span>Question Template Library</span>
            <Badge variant="outline">{templates.length} templates</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates by title, description, or tags..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {RSA_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.questionType} onValueChange={(value) => setFilters(prev => ({ ...prev, questionType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(QUESTION_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetSection.toString()} onValueChange={(value) => setTargetSection(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Target Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Section 1: Business Strategy</SelectItem>
                <SelectItem value="2">Section 2: AI Capabilities</SelectItem>
                <SelectItem value="3">Section 3: Use Case Discovery</SelectItem>
                <SelectItem value="4">Section 4: Technology Infrastructure</SelectItem>
                <SelectItem value="5">Section 5: People & Process</SelectItem>
                <SelectItem value="6">Section 6: Regulatory</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="starred"
                checked={filters.isStarred}
                onChange={(e) => setFilters(prev => ({ ...prev, isStarred: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="starred" className="text-sm">Starred only</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <ReusableButton
              rsaStyle="primary"
              size="sm"
              onClick={handleBulkImport}
              icon={Upload}
              disabled={selectedTemplates.length === 0}
            >
              Import Selected ({selectedTemplates.length})
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              icon={Plus}
            >
              Create Custom
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              size="sm"
              onClick={() => setSelectedTemplates([])}
              disabled={selectedTemplates.length === 0}
            >
              Clear Selection
            </ReusableButton>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredTemplates.map(renderTemplateCard)
        )}
      </div>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Dialog open={true} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewTemplate.title}</DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {getQuestionTypeConfig(previewTemplate.questionType).label}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {previewTemplate.category}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {previewTemplate.difficulty}
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span> {Math.round(previewTemplate.estimatedTime / 60)} minutes
                </div>
              </div>
              
              {previewTemplate.helpText && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{previewTemplate.helpText}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {previewTemplate.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                handleAddQuestion(previewTemplate);
                setPreviewTemplate(null);
              }}>
                Add to Section {targetSection}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}