import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Settings, 
  Plus, 
  Clock, 
  Lock, 
  Unlock, 
  Download, 
  Eye, 
  GripVertical,
  Trash2,
  Edit3,
  Copy,
  FileText,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import ReusableButton from './ReusableButton';
import { QuestionMetadata, QuestionType } from './QuestionRegistryLegoBlock';

// Section configuration interface
export interface SectionConfiguration {
  id: string;
  sectionNumber: number;
  title: string;
  description?: string;
  sectionType: string;
  estimatedTime: number;
  isLocked: boolean;
  unlockCondition: 'none' | 'previous_complete' | 'custom';
  customUnlockRule?: string;
  scoringWeights: {
    businessValue: number;
    feasibility: number;
    aiGovernance: number;
  };
  maxQuestions?: number;
  allowSkip: boolean;
  questions: QuestionMetadata[];
}

// Question template groups
export interface QuestionTemplate {
  id: string;
  groupName: string;
  description: string;
  questionCount: number;
  questions: Omit<QuestionMetadata, 'id' | 'sectionId'>[];
}

// Business Strategy & AI Vision Templates
const BUSINESS_STRATEGY_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'company_profile',
    groupName: 'Company Profile',
    description: 'Basic company information and current state (Q1-7)',
    questionCount: 7,
    questions: [
      {
        questionOrder: 1,
        questionType: 'text',
        questionText: 'What is your company name and primary industry?',
        isRequired: true,
        helpText: 'This helps us provide industry-specific insights',
        questionData: { placeholder: 'e.g., ABC Insurance - Commercial Property & Casualty' }
      },
      {
        questionOrder: 2,
        questionType: 'multiChoice',
        questionText: 'What is your company size?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'small', optionText: 'Small (< 500 employees)', optionValue: 'small', optionOrder: 1 },
            { id: 'medium', optionText: 'Medium (500-5,000 employees)', optionValue: 'medium', optionOrder: 2 },
            { id: 'large', optionText: 'Large (5,000+ employees)', optionValue: 'large', optionOrder: 3 }
          ]
        }
      },
      {
        questionOrder: 3,
        questionType: 'scale',
        questionText: 'How would you rate your current digital transformation maturity?',
        isRequired: true,
        helpText: 'Consider technology adoption, data capabilities, and digital processes',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Very Low', rightLabel: 'Very High' }
      },
      {
        questionOrder: 4,
        questionType: 'checkbox',
        questionText: 'Which business segments do you operate in?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'personal', optionText: 'Personal Lines', optionValue: 'personal', optionOrder: 1 },
            { id: 'commercial', optionText: 'Commercial Lines', optionValue: 'commercial', optionOrder: 2 },
            { id: 'specialty', optionText: 'Specialty Lines', optionValue: 'specialty', optionOrder: 3 },
            { id: 'reinsurance', optionText: 'Reinsurance', optionValue: 'reinsurance', optionOrder: 4 }
          ]
        }
      },
      {
        questionOrder: 5,
        questionType: 'multiChoice',
        questionText: 'What is your primary geographical market?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'local', optionText: 'Local/Regional', optionValue: 'local', optionOrder: 1 },
            { id: 'national', optionText: 'National', optionValue: 'national', optionOrder: 2 },
            { id: 'international', optionText: 'International', optionValue: 'international', optionOrder: 3 }
          ]
        }
      },
      {
        questionOrder: 6,
        questionType: 'scale',
        questionText: 'How data-driven are your current business processes?',
        isRequired: true,
        helpText: 'Consider analytics usage, automated decision-making, and data quality',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Not at all', rightLabel: 'Highly data-driven' }
      },
      {
        questionOrder: 7,
        questionType: 'textarea',
        questionText: 'What are your top 3 strategic priorities for the next 2-3 years?',
        isRequired: false,
        helpText: 'This helps us align AI recommendations with your strategic goals',
        questionData: { placeholder: 'e.g., Market expansion, operational efficiency, customer experience...', maxLength: 500 }
      }
    ]
  },
  {
    id: 'vision_success',
    groupName: 'Vision & Success Definition',
    description: 'AI vision and success metrics definition (Q8-13)',
    questionCount: 6,
    questions: [
      {
        questionOrder: 8,
        questionType: 'scale',
        questionText: 'How clearly defined is your AI vision and strategy?',
        isRequired: true,
        helpText: 'Consider formal AI strategy documents, executive alignment, and roadmap clarity',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'No clear vision', rightLabel: 'Very clear vision' }
      },
      {
        questionOrder: 9,
        questionType: 'checkbox',
        questionText: 'What are your primary AI objectives? (Select all that apply)',
        isRequired: true,
        questionData: {
          options: [
            { id: 'cost_reduction', optionText: 'Cost Reduction', optionValue: 'cost_reduction', optionOrder: 1 },
            { id: 'revenue_growth', optionText: 'Revenue Growth', optionValue: 'revenue_growth', optionOrder: 2 },
            { id: 'risk_management', optionText: 'Risk Management', optionValue: 'risk_management', optionOrder: 3 },
            { id: 'customer_experience', optionText: 'Customer Experience', optionValue: 'customer_experience', optionOrder: 4 },
            { id: 'operational_efficiency', optionText: 'Operational Efficiency', optionValue: 'operational_efficiency', optionOrder: 5 },
            { id: 'competitive_advantage', optionText: 'Competitive Advantage', optionValue: 'competitive_advantage', optionOrder: 6 }
          ]
        }
      },
      {
        questionOrder: 10,
        questionType: 'scale',
        questionText: 'How committed is senior leadership to AI initiatives?',
        isRequired: true,
        helpText: 'Consider executive sponsorship, resource allocation, and public commitments',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Not committed', rightLabel: 'Highly committed' }
      },
      {
        questionOrder: 11,
        questionType: 'multiChoice',
        questionText: 'What is your target timeline for seeing measurable AI impact?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'immediate', optionText: '0-6 months', optionValue: 'immediate', optionOrder: 1 },
            { id: 'short_term', optionText: '6-12 months', optionValue: 'short_term', optionOrder: 2 },
            { id: 'medium_term', optionText: '1-2 years', optionValue: 'medium_term', optionOrder: 3 },
            { id: 'long_term', optionText: '2+ years', optionValue: 'long_term', optionOrder: 4 }
          ]
        }
      },
      {
        questionOrder: 12,
        questionType: 'scale',
        questionText: 'How well-defined are your AI success metrics and KPIs?',
        isRequired: true,
        helpText: 'Consider specific metrics, measurement processes, and success criteria',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Not defined', rightLabel: 'Well-defined' }
      },
      {
        questionOrder: 13,
        questionType: 'textarea',
        questionText: 'Describe your ideal future state with AI integration (2-3 years from now)',
        isRequired: false,
        helpText: 'Paint a picture of how AI will transform your business operations',
        questionData: { placeholder: 'Describe key capabilities, processes, and outcomes...', maxLength: 500 }
      }
    ]
  },
  {
    id: 'competitive_position',
    groupName: 'Competitive Position',
    description: 'Market position and competitive landscape (Q14-15)',
    questionCount: 2,
    questions: [
      {
        questionOrder: 14,
        questionType: 'scale',
        questionText: 'How do you rate your competitive position in AI adoption compared to industry peers?',
        isRequired: true,
        helpText: 'Consider your AI capabilities relative to direct competitors',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Far behind', rightLabel: 'Industry leader' }
      },
      {
        questionOrder: 15,
        questionType: 'multiChoice',
        questionText: 'What is your primary competitive differentiation strategy?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'cost_leadership', optionText: 'Cost Leadership', optionValue: 'cost_leadership', optionOrder: 1 },
            { id: 'differentiation', optionText: 'Product/Service Differentiation', optionValue: 'differentiation', optionOrder: 2 },
            { id: 'niche_focus', optionText: 'Niche Market Focus', optionValue: 'niche_focus', optionOrder: 3 },
            { id: 'innovation', optionText: 'Innovation Leadership', optionValue: 'innovation', optionOrder: 4 }
          ]
        }
      }
    ]
  },
  {
    id: 'investment_strategy',
    groupName: 'Investment Strategy',
    description: 'Budget allocation and resource planning (Q16-17)',
    questionCount: 2,
    questions: [
      {
        questionOrder: 16,
        questionType: 'multiChoice',
        questionText: 'What is your planned AI investment level over the next 2 years?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'minimal', optionText: 'Minimal (< $100K)', optionValue: 'minimal', optionOrder: 1 },
            { id: 'moderate', optionText: 'Moderate ($100K - $500K)', optionValue: 'moderate', optionOrder: 2 },
            { id: 'significant', optionText: 'Significant ($500K - $2M)', optionValue: 'significant', optionOrder: 3 },
            { id: 'substantial', optionText: 'Substantial ($2M+)', optionValue: 'substantial', optionOrder: 4 }
          ]
        }
      },
      {
        questionOrder: 17,
        questionType: 'checkbox',
        questionText: 'Which investment areas are priorities for AI initiatives?',
        isRequired: true,
        questionData: {
          options: [
            { id: 'technology', optionText: 'Technology & Infrastructure', optionValue: 'technology', optionOrder: 1 },
            { id: 'talent', optionText: 'Talent & Skills Development', optionValue: 'talent', optionOrder: 2 },
            { id: 'data', optionText: 'Data & Analytics Capabilities', optionValue: 'data', optionOrder: 3 },
            { id: 'processes', optionText: 'Process Redesign', optionValue: 'processes', optionOrder: 4 },
            { id: 'partnerships', optionText: 'External Partnerships', optionValue: 'partnerships', optionOrder: 5 }
          ]
        }
      }
    ]
  }
];

export interface SectionConfigurationLegoBlockProps {
  section: SectionConfiguration;
  onSectionUpdate: (section: SectionConfiguration) => void;
  onPreviewSection: (section: SectionConfiguration) => void;
  availableTemplates?: QuestionTemplate[];
  className?: string;
}

/**
 * SectionConfigurationLegoBlock - Admin component for managing section settings
 * 
 * Features:
 * - Drag & drop question reordering
 * - Template library integration
 * - Section-level configuration (time limits, unlock conditions)
 * - Scoring weight configuration
 * - Section preview functionality
 * - Import from RSA template library
 */
export default function SectionConfigurationLegoBlock({
  section,
  onSectionUpdate,
  onPreviewSection,
  availableTemplates = BUSINESS_STRATEGY_TEMPLATES,
  className = ''
}: SectionConfigurationLegoBlockProps) {
  const [activeTab, setActiveTab] = useState('questions');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Handle drag and drop reordering
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(section.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update question orders
    const updatedQuestions = items.map((question, index) => ({
      ...question,
      questionOrder: index + 1
    }));

    onSectionUpdate({
      ...section,
      questions: updatedQuestions
    });
  }, [section, onSectionUpdate]);

  // Handle section property updates
  const handleSectionPropertyUpdate = useCallback((updates: Partial<SectionConfiguration>) => {
    onSectionUpdate({ ...section, ...updates });
  }, [section, onSectionUpdate]);

  // Handle scoring weight updates
  const handleScoringWeightUpdate = useCallback((weight: keyof SectionConfiguration['scoringWeights'], value: number) => {
    const updatedWeights = { ...section.scoringWeights, [weight]: value };
    handleSectionPropertyUpdate({ scoringWeights: updatedWeights });
  }, [section.scoringWeights, handleSectionPropertyUpdate]);

  // Import questions from template
  const handleImportTemplate = useCallback(async (template: QuestionTemplate) => {
    setIsImporting(true);
    
    try {
      const newQuestions: QuestionMetadata[] = template.questions.map((q, index) => ({
        id: `imported_${Date.now()}_${index}`,
        sectionId: section.sectionNumber,
        ...q,
        questionOrder: section.questions.length + index + 1
      }));

      const updatedQuestions = [...section.questions, ...newQuestions];
      
      handleSectionPropertyUpdate({ questions: updatedQuestions });
      setShowTemplateDialog(false);
      setSelectedTemplate(null);
    } finally {
      setIsImporting(false);
    }
  }, [section, handleSectionPropertyUpdate]);

  // Remove question
  const handleRemoveQuestion = useCallback((questionId: string) => {
    const updatedQuestions = section.questions
      .filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, questionOrder: index + 1 }));
    
    handleSectionPropertyUpdate({ questions: updatedQuestions });
  }, [section.questions, handleSectionPropertyUpdate]);

  // Add new question
  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuestionMetadata = {
      id: `new_question_${Date.now()}`,
      sectionId: section.sectionNumber,
      questionOrder: section.questions.length + 1,
      questionType: 'text',
      questionText: 'New Question',
      isRequired: false,
      questionData: {}
    };

    handleSectionPropertyUpdate({ 
      questions: [...section.questions, newQuestion] 
    });
  }, [section, handleSectionPropertyUpdate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalQuestions = section.questions.length;
    const requiredQuestions = section.questions.filter(q => q.isRequired).length;
    const conditionalQuestions = section.questions.filter(q => 
      q.conditionalLogic && q.conditionalLogic.length > 0
    ).length;
    const questionTypes = new Set(section.questions.map(q => q.questionType)).size;

    return {
      totalQuestions,
      requiredQuestions,
      conditionalQuestions,
      questionTypes,
      completionEstimate: Math.ceil(totalQuestions * 1.5) // 1.5 minutes per question
    };
  }, [section.questions]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Section Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#3C2CDA]" />
                <span>Section {section.sectionNumber}: {section.title}</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{section.estimatedTime} min</span>
              </Badge>
              <Badge variant={section.isLocked ? "destructive" : "default"} className="flex items-center space-x-1">
                {section.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span>{section.isLocked ? 'Locked' : 'Unlocked'}</span>
              </Badge>
              <ReusableButton
                rsaStyle="secondary"
                onClick={() => onPreviewSection(section)}
                icon={Eye}
                size="sm"
              >
                Preview
              </ReusableButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3C2CDA]">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.requiredQuestions}</div>
            <div className="text-sm text-gray-600">Required</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.conditionalQuestions}</div>
            <div className="text-sm text-gray-600">Conditional</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.questionTypes}</div>
            <div className="text-sm text-gray-600">Types</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.completionEstimate}</div>
            <div className="text-sm text-gray-600">Est. Minutes</div>
          </div>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Question Management</h3>
            <div className="flex space-x-2">
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <ReusableButton rsaStyle="secondary" icon={Download} size="sm">
                    Import Template
                  </ReusableButton>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import from Template Library</DialogTitle>
                    <DialogDescription>
                      Select a question group to import into this section
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {availableTemplates.map((template) => (
                      <Card 
                        key={template.id} 
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-gray-50",
                          selectedTemplate?.id === template.id && "ring-2 ring-[#3C2CDA]"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{template.groupName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {template.questionCount} questions
                              </Badge>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Cancel
                    </Button>
                    <ReusableButton
                      rsaStyle="primary"
                      onClick={() => selectedTemplate && handleImportTemplate(selectedTemplate)}
                      disabled={!selectedTemplate || isImporting}
                      loading={isImporting}
                    >
                      Import {selectedTemplate?.questionCount || 0} Questions
                    </ReusableButton>
                  </div>
                </DialogContent>
              </Dialog>
              
              <ReusableButton
                rsaStyle="primary"
                onClick={handleAddQuestion}
                icon={Plus}
                size="sm"
              >
                Add Question
              </ReusableButton>
            </div>
          </div>

          {/* Question List with Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {section.questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "transition-shadow",
                            snapshot.isDragging && "shadow-lg ring-2 ring-[#3C2CDA]"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              
                              <Badge variant="outline" className="text-xs min-w-8">
                                {question.questionOrder}
                              </Badge>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{question.questionText}</span>
                                  {question.isRequired && (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  )}
                                  {question.conditionalLogic && question.conditionalLogic.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">Conditional</Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="text-xs">
                                    {question.questionType}
                                  </Badge>
                                  {question.helpText && (
                                    <span className="truncate">{question.helpText}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Edit3 className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit question</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate question</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                        onClick={() => handleRemoveQuestion(question.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove question</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {section.questions.length === 0 && (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Questions Added</h3>
              <p className="text-gray-600 mb-4">Start by adding questions or importing from templates</p>
              <div className="flex justify-center space-x-2">
                <ReusableButton
                  rsaStyle="secondary"
                  onClick={() => setShowTemplateDialog(true)}
                  icon={Download}
                  size="sm"
                >
                  Import Template
                </ReusableButton>
                <ReusableButton
                  rsaStyle="primary"
                  onClick={handleAddQuestion}
                  icon={Plus}
                  size="sm"
                >
                  Add Question
                </ReusableButton>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Section Title</Label>
                  <Input
                    id="title"
                    value={section.title}
                    onChange={(e) => handleSectionPropertyUpdate({ title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={section.estimatedTime}
                    onChange={(e) => handleSectionPropertyUpdate({ estimatedTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Section Description</Label>
                <Textarea
                  id="description"
                  value={section.description || ''}
                  onChange={(e) => handleSectionPropertyUpdate({ description: e.target.value })}
                  placeholder="Describe what this section covers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sectionType">Section Type</Label>
                  <Select
                    value={section.sectionType}
                    onValueChange={(value) => handleSectionPropertyUpdate({ sectionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business_strategy">Business Strategy</SelectItem>
                      <SelectItem value="ai_capabilities">AI Capabilities</SelectItem>
                      <SelectItem value="use_case_discovery">Use Case Discovery</SelectItem>
                      <SelectItem value="technology_infrastructure">Technology Infrastructure</SelectItem>
                      <SelectItem value="people_process_change">People, Process & Change</SelectItem>
                      <SelectItem value="regulatory_compliance">Regulatory & Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxQuestions">Max Questions (Optional)</Label>
                  <Input
                    id="maxQuestions"
                    type="number"
                    value={section.maxQuestions || ''}
                    onChange={(e) => handleSectionPropertyUpdate({ maxQuestions: parseInt(e.target.value) || undefined })}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isLocked">Section Lock</Label>
                    <p className="text-sm text-gray-600">Require previous sections to be completed</p>
                  </div>
                  <Switch
                    id="isLocked"
                    checked={section.isLocked}
                    onCheckedChange={(checked) => handleSectionPropertyUpdate({ isLocked: checked })}
                  />
                </div>

                {section.isLocked && (
                  <div className="space-y-2">
                    <Label htmlFor="unlockCondition">Unlock Condition</Label>
                    <Select
                      value={section.unlockCondition}
                      onValueChange={(value: any) => handleSectionPropertyUpdate({ unlockCondition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No conditions</SelectItem>
                        <SelectItem value="previous_complete">Previous section complete</SelectItem>
                        <SelectItem value="custom">Custom rule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowSkip">Allow Skip</Label>
                    <p className="text-sm text-gray-600">Let users skip this section</p>
                  </div>
                  <Switch
                    id="allowSkip"
                    checked={section.allowSkip}
                    onCheckedChange={(checked) => handleSectionPropertyUpdate({ allowSkip: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Scoring Weights</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure how much each dimension contributes to the section score
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Business Value Weight</Label>
                    <span className="text-sm font-medium">{section.scoringWeights.businessValue}%</span>
                  </div>
                  <Slider
                    value={[section.scoringWeights.businessValue]}
                    onValueChange={([value]) => handleScoringWeightUpdate('businessValue', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Feasibility Weight</Label>
                    <span className="text-sm font-medium">{section.scoringWeights.feasibility}%</span>
                  </div>
                  <Slider
                    value={[section.scoringWeights.feasibility]}
                    onValueChange={([value]) => handleScoringWeightUpdate('feasibility', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>AI Governance Weight</Label>
                    <span className="text-sm font-medium">{section.scoringWeights.aiGovernance}%</span>
                  </div>
                  <Slider
                    value={[section.scoringWeights.aiGovernance]}
                    onValueChange={([value]) => handleScoringWeightUpdate('aiGovernance', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Weight Distribution</span>
                </div>
                <p className="text-sm text-gray-600">
                  Total: {section.scoringWeights.businessValue + section.scoringWeights.feasibility + section.scoringWeights.aiGovernance}%
                  {(section.scoringWeights.businessValue + section.scoringWeights.feasibility + section.scoringWeights.aiGovernance) !== 100 && (
                    <span className="text-amber-600"> (Should equal 100%)</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Templates</h3>
            <Badge variant="outline">
              {availableTemplates.length} template groups
            </Badge>
          </div>

          <div className="grid gap-4">
            {availableTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{template.groupName}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline">{template.questionCount} questions</Badge>
                        <Badge variant="secondary">Business Strategy</Badge>
                      </div>

                      <div className="text-xs text-gray-500">
                        Question types: {Array.from(new Set(template.questions.map(q => q.questionType))).join(', ')}
                      </div>
                    </div>
                    
                    <ReusableButton
                      rsaStyle="secondary"
                      onClick={() => handleImportTemplate(template)}
                      icon={Download}
                      size="sm"
                      disabled={isImporting}
                    >
                      Import
                    </ReusableButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}