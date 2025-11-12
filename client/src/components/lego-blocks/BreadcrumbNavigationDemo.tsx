import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BreadcrumbNavigationLegoBlock, { NavigationContext } from './BreadcrumbNavigationLegoBlock';
import ReusableButton from './ReusableButton';
import { 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Smartphone,
  Monitor,
  ToggleLeft,
  ToggleRight,
  Navigation,
  Play,
  Pause
} from 'lucide-react';

/**
 * Demo component showcasing BreadcrumbNavigationLegoBlock functionality
 * Demonstrates context-aware navigation with responsive design
 */
export default function BreadcrumbNavigationDemo() {
  const [currentContext, setCurrentContext] = useState<NavigationContext>({
    assessmentTitle: 'Hexaware AI Maturity Assessment',
    sectionNumber: 2,
    sectionTitle: 'AI Capabilities Assessment',
    questionNumber: 7,
    questionTitle: 'Data Quality & Governance Framework',
    sectionProgress: 65,
    totalQuestions: 15,
    completedQuestions: 10
  });

  const [showProgress, setShowProgress] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Sample navigation scenarios
  const navigationScenarios = [
    {
      id: 'section-overview',
      name: 'Section Overview',
      context: {
        assessmentTitle: 'Hexaware AI Maturity Assessment',
        sectionNumber: 1,
        sectionTitle: 'Business Strategy & AI Vision',
        sectionProgress: 100,
        totalQuestions: 17,
        completedQuestions: 17
      }
    },
    {
      id: 'mid-section',
      name: 'Mid Section Progress',
      context: {
        assessmentTitle: 'Hexaware AI Maturity Assessment',
        sectionNumber: 3,
        sectionTitle: 'Use Case Discovery',
        questionNumber: 5,
        questionTitle: 'Cross-functional Process Optimization',
        sectionProgress: 42,
        totalQuestions: 12,
        completedQuestions: 5
      }
    },
    {
      id: 'early-question',
      name: 'Early Question',
      context: {
        assessmentTitle: 'Hexaware AI Maturity Assessment',
        sectionNumber: 4,
        sectionTitle: 'Technology Infrastructure',
        questionNumber: 2,
        questionTitle: 'Cloud Platform Capabilities',
        sectionProgress: 14,
        totalQuestions: 14,
        completedQuestions: 2
      }
    },
    {
      id: 'final-section',
      name: 'Final Section',
      context: {
        assessmentTitle: 'Hexaware AI Maturity Assessment',
        sectionNumber: 6,
        sectionTitle: 'Regulatory & Compliance',
        questionNumber: 11,
        questionTitle: 'AI Ethics & Bias Mitigation',
        sectionProgress: 91,
        totalQuestions: 11,
        completedQuestions: 10
      }
    }
  ];

  // Handle navigation events
  const handleNavigateToHome = () => {
    setIsNavigating(true);
    setTimeout(() => {
      alert('Navigate to Assessment Dashboard');
      setIsNavigating(false);
    }, 500);
  };

  const handleNavigateToSection = (sectionNumber: number) => {
    setIsNavigating(true);
    setTimeout(() => {
      alert(`Navigate to Section ${sectionNumber} Overview`);
      setIsNavigating(false);
    }, 500);
  };

  const handleNavigateToQuestion = (questionNumber: number) => {
    setIsNavigating(true);
    setTimeout(() => {
      alert(`Navigate to Question ${questionNumber}`);
      setIsNavigating(false);
    }, 500);
  };

  // Simulate question progression
  const simulateNext = () => {
    if (!currentContext.questionNumber || !currentContext.totalQuestions) return;
    
    const nextQuestion = currentContext.questionNumber + 1;
    if (nextQuestion > currentContext.totalQuestions) {
      // Move to next section
      setCurrentContext(prev => ({
        ...prev,
        sectionNumber: prev.sectionNumber + 1,
        sectionTitle: prev.sectionNumber + 1 === 2 ? 'AI Capabilities Assessment' :
                     prev.sectionNumber + 1 === 3 ? 'Use Case Discovery' :
                     prev.sectionNumber + 1 === 4 ? 'Technology Infrastructure' :
                     prev.sectionNumber + 1 === 5 ? 'People, Process & Change' :
                     'Regulatory & Compliance',
        questionNumber: 1,
        questionTitle: 'Section Introduction',
        sectionProgress: 7,
        totalQuestions: 15,
        completedQuestions: 1
      }));
    } else {
      setCurrentContext(prev => ({
        ...prev,
        questionNumber: nextQuestion,
        questionTitle: `Question ${nextQuestion} Title`,
        sectionProgress: Math.round((nextQuestion / prev.totalQuestions!) * 100),
        completedQuestions: nextQuestion
      }));
    }
  };

  const simulatePrevious = () => {
    if (!currentContext.questionNumber) return;
    
    if (currentContext.questionNumber > 1) {
      const prevQuestion = currentContext.questionNumber - 1;
      setCurrentContext(prev => ({
        ...prev,
        questionNumber: prevQuestion,
        questionTitle: `Question ${prevQuestion} Title`,
        sectionProgress: Math.round((prevQuestion / prev.totalQuestions!) * 100),
        completedQuestions: Math.max(0, prevQuestion - 1)
      }));
    }
  };

  // Load scenario
  const loadScenario = (scenarioId: string) => {
    const scenario = navigationScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setCurrentContext(scenario.context);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-[#3C2CDA]" />
            <span>BreadcrumbNavigationLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Context-aware navigation breadcrumbs with responsive design and progress tracking
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Navigation Scenarios */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Navigation Scenarios</h4>
              <div className="grid grid-cols-2 gap-2">
                {navigationScenarios.map((scenario) => (
                  <ReusableButton
                    key={scenario.id}
                    rsaStyle="secondary"
                    size="sm"
                    onClick={() => loadScenario(scenario.id)}
                    className="text-xs"
                  >
                    {scenario.name}
                  </ReusableButton>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Controls</h4>
              <div className="flex flex-wrap gap-2">
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={simulatePrevious}
                  icon={ArrowLeft}
                  disabled={!currentContext.questionNumber || currentContext.questionNumber <= 1}
                >
                  Previous
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={simulateNext}
                  icon={ArrowRight}
                >
                  Next
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="secondary"
                  size="sm"
                  onClick={() => setShowProgress(!showProgress)}
                  icon={showProgress ? ToggleRight : ToggleLeft}
                >
                  Progress
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="secondary"
                  size="sm"
                  onClick={() => setMobileView(!mobileView)}
                  icon={mobileView ? Monitor : Smartphone}
                >
                  {mobileView ? 'Desktop' : 'Mobile'} View
                </ReusableButton>
              </div>
            </div>
          </div>

          {/* Current Context Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Context</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Section:</span>
                <div className="font-medium">{currentContext.sectionNumber}: {currentContext.sectionTitle}</div>
              </div>
              <div>
                <span className="text-gray-600">Question:</span>
                <div className="font-medium">
                  {currentContext.questionNumber ? `${currentContext.questionNumber}: ${currentContext.questionTitle}` : 'Section Overview'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Progress:</span>
                <div className="font-medium">{currentContext.sectionProgress}%</div>
              </div>
              <div>
                <span className="text-gray-600">Questions:</span>
                <div className="font-medium">{currentContext.completedQuestions}/{currentContext.totalQuestions}</div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${showProgress ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Progress Display: {showProgress ? 'On' : 'Off'}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${mobileView ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
              <span>View: {mobileView ? 'Mobile' : 'Desktop'}</span>
            </Badge>
            {isNavigating && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span>Navigating...</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Component Demo */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Interactive Breadcrumb Navigation</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Simulate mobile viewport if needed */}
          <div className={mobileView ? "max-w-sm mx-auto border-x" : ""}>
            <BreadcrumbNavigationLegoBlock
              context={currentContext}
              onNavigateToHome={handleNavigateToHome}
              onNavigateToSection={handleNavigateToSection}
              onNavigateToQuestion={handleNavigateToQuestion}
              showProgress={showProgress}
              mobileCollapse={true}
            />
          </div>
          
          {/* Sample content below breadcrumbs */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentContext.questionTitle || `${currentContext.sectionTitle} Overview`}
              </h3>
              <p className="text-gray-600 mb-4">
                This is where the actual questionnaire content would appear below the breadcrumb navigation.
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary">
                  Section {currentContext.sectionNumber}
                </Badge>
                {currentContext.questionNumber && (
                  <Badge variant="secondary">
                    Question {currentContext.questionNumber}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Documentation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Hierarchical Navigation:</strong> Clear path from Assessment → Section → Question</p>
          <p><strong>Clickable Breadcrumbs:</strong> Jump back to any previous level in the navigation hierarchy</p>
          <p><strong>Current Location Highlighting:</strong> Active breadcrumb item clearly highlighted with RSA blue</p>
          <p><strong>Question Context:</strong> Show question number and title in dedicated context card</p>
          <p><strong>Progress Tracking:</strong> Section completion percentage with visual progress bar</p>
          <p><strong>Responsive Design:</strong> Collapses to "Back to Section" button on mobile devices</p>
          <p><strong>Context Awareness:</strong> Adapts display based on current location (section vs question level)</p>
          <p><strong>Progress Visualization:</strong> Real-time progress updates with completion status</p>
          <p><strong>Interactive Icons:</strong> Contextual icons for different navigation levels</p>
          <p><strong>Mobile Optimization:</strong> Touch-friendly design with appropriate spacing</p>
        </CardContent>
      </Card>
    </div>
  );
}