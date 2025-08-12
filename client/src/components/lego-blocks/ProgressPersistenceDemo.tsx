import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProgressPersistence, ProgressData, SectionProgress } from '@/hooks/useProgressPersistence';
import ReusableButton from './ReusableButton';
import { 
  Save, 
  RotateCcw, 
  Play, 
  CheckCircle, 
  Clock, 
  Database,
  RefreshCw,
  Eye,
  Trash2 
} from 'lucide-react';

/**
 * Demo component showcasing enhanced progress persistence with section support
 * Demonstrates section-level tracking, auto-save, and resume capabilities
 */
export default function ProgressPersistenceDemo() {
  const [currentSection, setCurrentSection] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, any>>({});
  const [simulatedProgress, setSimulatedProgress] = useState<ProgressData | null>(null);

  const {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveProgressWithSection,
    getProgressSummary,
    getResumePoint,
    clearStorage,
    getSectionProgress,
    updateSectionProgress,
    completeSectionProgress,
    hasResumableProgress
  } = useProgressPersistence({
    storageKey: 'demo_rsa_assessment_progress',
    autoSaveDelay: 1000,
    enableToasts: true,
    apiBaseUrl: '/api'
  });

  // Mock section configuration
  const sectionConfig = {
    1: { title: 'Business Strategy & AI Vision', totalQuestions: 17 },
    2: { title: 'AI Capabilities Assessment', totalQuestions: 15 },
    3: { title: 'Use Case Discovery', totalQuestions: 12 },
    4: { title: 'Technology Infrastructure', totalQuestions: 14 },
    5: { title: 'People, Process & Change', totalQuestions: 13 },
    6: { title: 'Regulatory & Compliance', totalQuestions: 11 }
  };

  // Initialize demo progress
  useEffect(() => {
    const demoProgress: ProgressData = {
      responseId: 'demo_response_001',
      questionnaireId: 'rsa_ai_maturity_assessment',
      answers: {},
      currentSection: currentSection,
      currentQuestionIndex: currentQuestionIndex,
      email: 'demo@example.com',
      name: 'Demo User',
      lastSaved: new Date().toLocaleString(),
      timestamp: Date.now(),
      totalSections: 6,
      completionPercentage: 0,
      sectionProgress: {}
    };
    setSimulatedProgress(demoProgress);
  }, [currentSection, currentQuestionIndex]);

  // Simulate answering a question
  const handleAnswerQuestion = (questionId: string, answer: any) => {
    const newAnswers = { ...sectionAnswers, [questionId]: answer };
    setSectionAnswers(newAnswers);

    if (simulatedProgress) {
      const totalQuestionsInSection = sectionConfig[currentSection as keyof typeof sectionConfig].totalQuestions;
      const newIndex = currentQuestionIndex + 1;
      
      // Update progress with section awareness
      const updatedProgress = saveProgressWithSection(
        simulatedProgress,
        currentSection,
        newIndex,
        newAnswers,
        totalQuestionsInSection
      );

      setSimulatedProgress(updatedProgress);
      setCurrentQuestionIndex(newIndex);

      // Automatically move to next section if current section is complete
      if (newIndex >= totalQuestionsInSection && currentSection < 6) {
        setTimeout(() => {
          setCurrentSection(currentSection + 1);
          setCurrentQuestionIndex(0);
          setSectionAnswers({});
        }, 1000);
      }
    }
  };

  // Complete current section
  const handleCompleteSection = async () => {
    if (simulatedProgress) {
      await completeSectionProgress(simulatedProgress.responseId, currentSection);
      
      // Move to next section
      if (currentSection < 6) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestionIndex(0);
        setSectionAnswers({});
      }
    }
  };

  // Get section progress from API
  const handleRefreshSectionProgress = async () => {
    if (simulatedProgress) {
      const apiProgress = await getSectionProgress(simulatedProgress.responseId);
      console.log('Section progress from API:', apiProgress);
    }
  };

  // Simulate resuming from saved progress
  const handleResumeProgress = () => {
    const resumePoint = getResumePoint();
    if (resumePoint) {
      setCurrentSection(resumePoint.sectionNumber);
      setCurrentQuestionIndex(resumePoint.questionIndex);
      setSectionAnswers(resumePoint.answers);
    }
  };

  // Reset demo
  const handleReset = () => {
    clearStorage();
    setCurrentSection(1);
    setCurrentQuestionIndex(0);
    setSectionAnswers({});
    setSimulatedProgress(null);
  };

  // Calculate overall progress
  const overallProgress = simulatedProgress ? 
    Math.round(((currentSection - 1 + (currentQuestionIndex / sectionConfig[currentSection as keyof typeof sectionConfig].totalQuestions)) / 6) * 100) : 0;

  const currentSectionConfig = sectionConfig[currentSection as keyof typeof sectionConfig];
  const sectionProgress = currentSectionConfig ? Math.round((currentQuestionIndex / currentSectionConfig.totalQuestions) * 100) : 0;

  const progressSummary = getProgressSummary();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-[#005DAA]" />
            <span>Enhanced Progress Persistence Demo</span>
          </CardTitle>
          <CardDescription>
            Section-level progress tracking with auto-save, resume capabilities, and API integration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <Badge variant="outline">{overallProgress}%</Badge>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              Section {currentSection} of 6
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Section</span>
              <Badge variant="outline">{sectionProgress}%</Badge>
            </div>
            <Progress value={sectionProgress} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              Question {currentQuestionIndex} of {currentSectionConfig?.totalQuestions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Save Status</span>
              {isSaving ? (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Saving</span>
                </Badge>
              ) : hasUnsavedChanges ? (
                <Badge variant="destructive">Unsaved</Badge>
              ) : (
                <Badge variant="default" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Saved</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {lastSaved ? `Last saved: ${lastSaved}` : 'No saves yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Section Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">
            Section {currentSection}: {currentSectionConfig?.title}
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Question {currentQuestionIndex} of {currentSectionConfig?.totalQuestions}</span>
            </div>
            <Badge variant="outline">
              {Object.keys(sectionAnswers).length} answers saved
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Simulated Question */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-2">
              Sample Question {currentQuestionIndex + 1}
            </h4>
            <p className="text-gray-600 mb-3">
              How would you rate your organization's current AI readiness level?
            </p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <ReusableButton
                  key={rating}
                  rsaStyle={sectionAnswers[`q${currentQuestionIndex + 1}`] === rating ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleAnswerQuestion(`q${currentQuestionIndex + 1}`, rating)}
                >
                  {rating}
                </ReusableButton>
              ))}
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={() => handleAnswerQuestion(`q${currentQuestionIndex + 1}`, Math.floor(Math.random() * 5) + 1)}
              icon={Play}
              size="sm"
            >
              Answer & Continue
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={handleCompleteSection}
              icon={CheckCircle}
              size="sm"
              disabled={currentQuestionIndex < (currentSectionConfig?.totalQuestions || 0)}
            >
              Complete Section
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={handleRefreshSectionProgress}
              icon={RefreshCw}
              size="sm"
            >
              Refresh API Progress
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={handleReset}
              icon={Trash2}
              size="sm"
            >
              Reset Demo
            </ReusableButton>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      {progressSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Email:</strong> {progressSummary.email}
              </div>
              <div>
                <strong>Current Section:</strong> {progressSummary.currentSection}
              </div>
              <div>
                <strong>Completed Sections:</strong> {progressSummary.completedSections}
              </div>
              <div>
                <strong>Last Saved:</strong> {progressSummary.lastSaved}
              </div>
            </div>
            
            {/* Section Progress Grid */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Section Completion Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(sectionConfig).map(([sectionNum, config]) => {
                  const sectionProgress = progressSummary.sectionProgress?.[parseInt(sectionNum)];
                  const isCompleted = sectionProgress?.completed || false;
                  const isStarted = sectionProgress?.started || false;
                  const isCurrent = parseInt(sectionNum) === currentSection;
                  
                  return (
                    <div
                      key={sectionNum}
                      className={`p-2 rounded border text-xs ${
                        isCurrent ? 'border-blue-500 bg-blue-50' :
                        isCompleted ? 'border-green-500 bg-green-50' :
                        isStarted ? 'border-yellow-500 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Section {sectionNum}</span>
                        {isCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
                        {isCurrent && <Clock className="h-3 w-3 text-blue-600" />}
                      </div>
                      <p className="text-gray-600 truncate">{config.title}</p>
                      {sectionProgress && (
                        <div className="mt-1">
                          <Progress value={sectionProgress.completionPercentage || 0} className="h-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Capability */}
      {hasResumableProgress() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-amber-800">Resumable Progress Found</h4>
                <p className="text-sm text-amber-700">
                  You have an incomplete assessment that can be resumed
                </p>
              </div>
              <ReusableButton
                rsaStyle="primary"
                onClick={handleResumeProgress}
                icon={Play}
                size="sm"
              >
                Resume Assessment
              </ReusableButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Documentation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Section-Level Tracking:</strong> Independent progress tracking for each of 6 sections</p>
          <p><strong>Auto-Save:</strong> Debounced auto-save every answer with 1-second delay</p>
          <p><strong>Resume Capability:</strong> Resume at exact question within last incomplete section</p>
          <p><strong>API Integration:</strong> Real-time sync with backend via dedicated section progress endpoints</p>
          <p><strong>Progress Persistence:</strong> Local storage backup with 30-day retention</p>
          <p><strong>Section Completion:</strong> Automatic section completion detection and next section unlocking</p>
          <p><strong>Status Indicators:</strong> Real-time save status, timestamps, and progress percentages</p>
        </CardContent>
      </Card>
    </div>
  );
}