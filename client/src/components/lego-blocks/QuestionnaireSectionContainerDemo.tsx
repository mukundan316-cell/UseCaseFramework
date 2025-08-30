import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuestionnaireSectionContainerLegoBlock from './QuestionnaireSectionContainerLegoBlock';
import QuestionLegoBlock, { QuestionData } from './QuestionLegoBlock';
import ReusableButton from './ReusableButton';
import { Container, RotateCcw, Settings, PlayCircle, Save } from 'lucide-react';

/**
 * Demo component showcasing QuestionnaireSectionContainerLegoBlock functionality
 * Demonstrates section navigation, progress tracking, and auto-save features
 */
export default function QuestionnaireSectionContainerDemo() {
  const [currentSection, setCurrentSection] = useState(1);
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>();
  const [disabled, setDisabled] = useState(false);

  // Mock section data
  const sections = [
    { id: 1, title: 'Business Strategy & AI Vision', questions: 17 },
    { id: 2, title: 'Current AI & Data Capabilities', questions: 35 },
    { id: 3, title: 'Use Case Discovery & Validation', questions: 8 },
    { id: 4, title: 'Technology & Infrastructure', questions: 20 },
    { id: 5, title: 'People, Process & Change', questions: 10 },
    { id: 6, title: 'Regulatory, Compliance & Ethics', questions: 10 }
  ];

  // Mock questions for current section
  const getSectionQuestions = (sectionId: number): QuestionData[] => {
    const baseQuestions: QuestionData[] = [
      {
        id: `section_${sectionId}_q1`,
        questionText: `How would you rate your organization's maturity in ${sections[sectionId - 1]?.title}?`,
        questionType: 'score',
        isRequired: true,
        helpText: 'Consider current capabilities and future goals',
        minValue: 1,
        maxValue: 5,
        leftLabel: 'Very Low',
        rightLabel: 'Very High'
      },
      {
        id: `section_${sectionId}_q2`,
        questionText: `What are the main challenges in ${sections[sectionId - 1]?.title}?`,
        questionType: 'checkbox',
        isRequired: true,
        helpText: 'Select all that apply',
        options: [
          { id: 'budget', optionText: 'Budget Constraints', optionValue: 'budget', optionOrder: 1 },
          { id: 'skills', optionText: 'Skills Gap', optionValue: 'skills', optionOrder: 2 },
          { id: 'technology', optionText: 'Technology Limitations', optionValue: 'technology', optionOrder: 3 },
          { id: 'governance', optionText: 'Governance Issues', optionValue: 'governance', optionOrder: 4 }
        ]
      }
    ];

    // Add more questions to reach target count
    const additionalCount = sections[sectionId - 1]?.questions - 2;
    for (let i = 0; i < additionalCount; i++) {
      baseQuestions.push({
        id: `section_${sectionId}_q${i + 3}`,
        questionText: `Additional question ${i + 1} for ${sections[sectionId - 1]?.title}`,
        questionType: 'multi_choice',
        isRequired: false,
        options: [
          { id: `opt1_${i}`, optionText: 'Option 1', optionValue: 'opt1', optionOrder: 1 },
          { id: `opt2_${i}`, optionText: 'Option 2', optionValue: 'opt2', optionOrder: 2 },
          { id: `opt3_${i}`, optionText: 'Option 3', optionValue: 'opt3', optionOrder: 3 }
        ]
      });
    }

    return baseQuestions;
  };

  // Calculate progress
  const calculateProgress = () => {
    const currentSectionQuestions = getSectionQuestions(currentSection);
    const currentSectionAnswered = currentSectionQuestions.filter(q => responses.has(q.id)).length;
    
    // Mock overall progress
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions, 0);
    const totalAnswered = Math.min(
      (currentSection - 1) * 10 + currentSectionAnswered, // Rough calculation
      totalQuestions
    );

    return {
      sectionProgress: { completed: currentSectionAnswered, total: currentSectionQuestions.length },
      overallProgress: { completed: totalAnswered, total: totalQuestions }
    };
  };

  // Check if can proceed (all required questions answered)
  const canProceed = () => {
    const currentSectionQuestions = getSectionQuestions(currentSection);
    const requiredQuestions = currentSectionQuestions.filter(q => q.isRequired);
    return requiredQuestions.every(q => responses.has(q.id));
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(new Map(responses.set(questionId, value)));
    setHasUnsavedChanges(true);
    
    // Simulate auto-save after 2 seconds
    setTimeout(() => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setHasUnsavedChanges(false);
        setLastSaved(new Date().toISOString());
      }, 1000);
    }, 2000);
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleSaveAndExit = () => {
    alert('Save and Exit clicked! In real app, this would save progress and return to dashboard.');
  };

  const resetDemo = () => {
    setCurrentSection(1);
    setResponses(new Map());
    setHasUnsavedChanges(false);
    setIsSaving(false);
    setLastSaved(undefined);
  };

  const simulateProgress = () => {
    const questions = getSectionQuestions(currentSection);
    questions.slice(0, 2).forEach(q => {
      if (!responses.has(q.id)) {
        handleResponseChange(q.id, q.questionType === 'score' ? 3 : 'sample_answer');
      }
    });
  };

  const { sectionProgress, overallProgress } = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Container className="h-5 w-5 text-[#005DAA]" />
            <span>QuestionnaireSectionContainerLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Complete section container with navigation, progress tracking, and auto-save
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={simulateProgress}
              icon={PlayCircle}
              size="sm"
            >
              Answer Questions
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={resetDemo}
              icon={RotateCcw}
              size="sm"
            >
              Reset Demo
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="warning"
              onClick={() => setDisabled(!disabled)}
              icon={Settings}
              size="sm"
            >
              {disabled ? 'Enable' : 'Disable'} Navigation
            </ReusableButton>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <Badge variant="outline" className="mb-2">Current Section</Badge>
              <p className="font-semibold">{currentSection} of {sections.length}</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Section Progress</Badge>
              <p className="font-semibold">
                {sectionProgress.completed}/{sectionProgress.total} questions
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Can Proceed</Badge>
              <p className="font-semibold">{canProceed() ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Status</Badge>
              <p className="text-sm">
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved' : 'Saved'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Component Demo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <QuestionnaireSectionContainerLegoBlock
          currentSection={currentSection}
          totalSections={sections.length}
          sectionTitle={sections[currentSection - 1]?.title || 'Unknown Section'}
          sectionProgress={sectionProgress}
          overallProgress={overallProgress}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveAndExit={handleSaveAndExit}
          canProceed={canProceed()}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
          isSaving={isSaving}
          disabled={disabled}
        >
          {/* Mock Section Content */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {sections[currentSection - 1]?.title}
              </h2>
              <p className="text-gray-600">
                Complete the questions below to assess your organization's capabilities in this area.
              </p>
            </div>

            {/* Render Questions */}
            {getSectionQuestions(currentSection).slice(0, 3).map((question, index) => (
              <QuestionLegoBlock
                key={question.id}
                question={question}
                value={responses.get(question.id)}
                onChange={(value) => handleResponseChange(question.id, value)}
                showValidation={true}
              />
            ))}

            {/* Show remaining question count */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                ... and {Math.max(0, sections[currentSection - 1]?.questions - 3)} more questions in this section
              </p>
            </div>
          </div>
        </QuestionnaireSectionContainerLegoBlock>
      </div>

      {/* Usage Instructions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Demo Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Answer Questions:</strong> Fill out sample questions to see progress</p>
          <p><strong>Navigation:</strong> Use Previous/Next buttons or keyboard arrows (← →)</p>
          <p><strong>Mobile:</strong> Try swiping left/right on touch devices</p>
          <p><strong>Auto-save:</strong> Changes are automatically saved with visual feedback</p>
          <p><strong>Validation:</strong> Next button is disabled until required questions are answered</p>
          <p><strong>Keyboard:</strong> Press ESC to trigger Save & Exit</p>
        </CardContent>
      </Card>
    </div>
  );
}