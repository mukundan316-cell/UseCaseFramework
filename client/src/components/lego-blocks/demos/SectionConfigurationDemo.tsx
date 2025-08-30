import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionConfigurationLegoBlock, { SectionConfiguration } from '../SectionConfigurationLegoBlock';
import ReusableButton from '../ReusableButton';
import { Settings, RotateCcw, Save, PlayCircle, Eye } from 'lucide-react';

/**
 * Demo component showcasing SectionConfigurationLegoBlock functionality
 * Demonstrates admin section management with drag-and-drop, templates, and configuration
 */
export default function SectionConfigurationDemo() {
  // Mock section configuration
  const [section, setSection] = useState<SectionConfiguration>({
    id: 'section_1',
    sectionNumber: 1,
    title: 'Business Strategy & AI Vision',
    description: 'Assess your organization\'s strategic alignment with AI objectives and current vision clarity',
    sectionType: 'business_strategy',
    estimatedTime: 25,
    isLocked: false,
    unlockCondition: 'none',
    scoringWeights: {
      businessValue: 40,
      feasibility: 35,
      aiGovernance: 25
    },
    allowSkip: false,
    questions: [
      {
        id: 'q1',
        sectionId: 1,
        questionOrder: 1,
        questionType: 'text',
        questionText: 'What is your company name and primary industry?',
        isRequired: true,
        helpText: 'This helps us provide industry-specific insights',
        questionData: { placeholder: 'e.g., ABC Insurance - Commercial Property & Casualty' }
      },
      {
        id: 'q2',
        sectionId: 1,
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
        id: 'q3',
        sectionId: 1,
        questionOrder: 3,
        questionType: 'scale',
        questionText: 'How would you rate your current digital transformation maturity?',
        isRequired: true,
        isStarred: true,
        helpText: 'Consider technology adoption, data capabilities, and digital processes',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'Very Low', rightLabel: 'Very High' }
      },
      {
        id: 'q4',
        sectionId: 1,
        questionOrder: 4,
        questionType: 'checkbox',
        questionText: 'Which business segments do you operate in?',
        isRequired: true,
        conditionalLogic: [
          {
            dependentQuestionId: 'q2',
            operator: 'not_equals',
            value: 'small',
            action: 'show'
          }
        ],
        questionData: {
          options: [
            { id: 'personal', optionText: 'Personal Lines', optionValue: 'personal', optionOrder: 1 },
            { id: 'commercial', optionText: 'Commercial Lines', optionValue: 'commercial', optionOrder: 2 },
            { id: 'specialty', optionText: 'Specialty Lines', optionValue: 'specialty', optionOrder: 3 },
            { id: 'reinsurance', optionText: 'Reinsurance', optionValue: 'reinsurance', optionOrder: 4 }
          ]
        }
      }
    ]
  });

  const [savedVersion, setSavedVersion] = useState<SectionConfiguration | null>(null);
  const [previewSection, setPreviewSection] = useState<SectionConfiguration | null>(null);

  // Handle section updates
  const handleSectionUpdate = (updatedSection: SectionConfiguration) => {
    setSection(updatedSection);
  };

  // Handle section preview
  const handlePreviewSection = (sectionToPreview: SectionConfiguration) => {
    setPreviewSection(sectionToPreview);
    // In real app, this would open a preview modal or navigate to preview page
    alert(`Preview Section: ${sectionToPreview.title}\n${sectionToPreview.questions.length} questions configured`);
  };

  // Demo actions
  const handleSave = () => {
    setSavedVersion({ ...section });
    alert('Section configuration saved successfully!');
  };

  const handleReset = () => {
    if (savedVersion) {
      setSection({ ...savedVersion });
    }
  };

  const addSampleQuestions = () => {
    const newQuestions = [
      {
        id: `q${section.questions.length + 1}`,
        sectionId: section.sectionNumber,
        questionOrder: section.questions.length + 1,
        questionType: 'scale' as const,
        questionText: 'How clearly defined is your AI vision and strategy?',
        isRequired: true,
        helpText: 'Consider formal AI strategy documents, executive alignment, and roadmap clarity',
        questionData: { minValue: 1, maxValue: 5, leftLabel: 'No clear vision', rightLabel: 'Very clear vision' }
      },
      {
        id: `q${section.questions.length + 2}`,
        sectionId: section.sectionNumber,
        questionOrder: section.questions.length + 2,
        questionType: 'textarea' as const,
        questionText: 'Describe your ideal future state with AI integration (2-3 years from now)',
        isRequired: false,
        helpText: 'Paint a picture of how AI will transform your business operations',
        questionData: { placeholder: 'Describe key capabilities, processes, and outcomes...', maxLength: 500 }
      }
    ];

    handleSectionUpdate({
      ...section,
      questions: [...section.questions, ...newQuestions]
    });
  };

  // Calculate changes from saved version
  const hasChanges = savedVersion ? JSON.stringify(section) !== JSON.stringify(savedVersion) : true;
  const questionCountChange = savedVersion ? section.questions.length - savedVersion.questions.length : section.questions.length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-[#005DAA]" />
            <span>SectionConfigurationLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Admin interface for section management with drag-and-drop, templates, and configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={handleSave}
              icon={Save}
              size="sm"
              disabled={!hasChanges}
            >
              Save Configuration
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={handleReset}
              icon={RotateCcw}
              size="sm"
              disabled={!savedVersion || !hasChanges}
            >
              Reset Changes
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={addSampleQuestions}
              icon={PlayCircle}
              size="sm"
            >
              Add Sample Questions
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => handlePreviewSection(section)}
              icon={Eye}
              size="sm"
            >
              Preview Section
            </ReusableButton>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <Badge variant="outline" className="mb-2">Configuration Status</Badge>
              <p className="font-semibold text-sm">
                {hasChanges ? 'Modified' : 'Saved'}
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Questions</Badge>
              <p className="font-semibold text-sm">
                {section.questions.length}
                {questionCountChange !== 0 && (
                  <span className={questionCountChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {' '}({questionCountChange > 0 ? '+' : ''}{questionCountChange})
                  </span>
                )}
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Estimated Time</Badge>
              <p className="font-semibold text-sm">{section.estimatedTime} min</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Section Type</Badge>
              <p className="text-sm">{section.sectionType.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Demo Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Drag & Drop:</strong> Reorder questions by dragging the grip handle</p>
              <p><strong>Templates:</strong> Import pre-built question groups from the Templates tab</p>
              <p><strong>Section Settings:</strong> Configure time limits, unlock conditions, and permissions</p>
              <p><strong>Scoring Weights:</strong> Adjust how much each dimension contributes to section score</p>
              <p><strong>Question Management:</strong> Add, edit, duplicate, and remove questions</p>
              <p><strong>Real-time Preview:</strong> See how the section appears to respondents</p>
              <p><strong>Auto-save Status:</strong> Track changes and save configurations</p>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          {savedVersion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Section:</strong> {section.title}
                  </div>
                  <div>
                    <strong>Questions:</strong> {section.questions.length}
                  </div>
                  <div>
                    <strong>Required:</strong> {section.questions.filter(q => q.isRequired).length}
                  </div>
                  <div>
                    <strong>Conditional:</strong> {section.questions.filter(q => q.conditionalLogic && q.conditionalLogic.length > 0).length}
                  </div>
                  <div>
                    <strong>Question Types:</strong> {new Set(section.questions.map(q => q.questionType)).size}
                  </div>
                  <div>
                    <strong>Lock Status:</strong> {section.isLocked ? 'Locked' : 'Unlocked'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Main Component */}
      <SectionConfigurationLegoBlock
        section={section}
        onSectionUpdate={handleSectionUpdate}
        onPreviewSection={handlePreviewSection}
      />

      {/* Implementation Notes */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Drag & Drop:</strong> Uses react-beautiful-dnd for smooth question reordering</p>
          <p><strong>Template System:</strong> Pre-built question groups for Business Strategy & AI Vision</p>
          <p><strong>Configuration Tabs:</strong> Separate interfaces for Questions, Settings, Scoring, and Templates</p>
          <p><strong>Real-time Updates:</strong> All changes immediately reflected in section configuration</p>
          <p><strong>Validation:</strong> Built-in checks for required fields and scoring weight totals</p>
          <p><strong>Admin Features:</strong> Complete section management with preview and save capabilities</p>
        </CardContent>
      </Card>
    </div>
  );
}