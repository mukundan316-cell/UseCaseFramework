import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SectionTransitionLegoBlock, { SectionData, TransitionState } from './SectionTransitionLegoBlock';
import ReusableButton from './ReusableButton';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown
} from 'lucide-react';

/**
 * Demo component showcasing SectionTransitionLegoBlock functionality
 * Demonstrates section navigation, validation, and transition effects
 */
export default function SectionTransitionDemo() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(1);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [simulateValidation, setSimulateValidation] = useState(true);

  // Mock section data
  const [sections, setSections] = useState<SectionData[]>([
    {
      sectionNumber: 1,
      title: 'Business Strategy & AI Vision',
      description: 'Assess your organization\'s strategic alignment with AI objectives',
      totalQuestions: 17,
      completedQuestions: 17,
      isCompleted: true,
      isLocked: false,
      estimatedTime: 25,
      completionPercentage: 100,
      keyHighlights: [
        'Executive leadership commitment to AI transformation',
        'Clear vision and strategic roadmap definition',
        'Investment priorities and resource allocation'
      ]
    },
    {
      sectionNumber: 2,
      title: 'AI Capabilities Assessment',
      description: 'Evaluate current AI/ML capabilities and technical readiness',
      totalQuestions: 15,
      completedQuestions: 12,
      isCompleted: false,
      isLocked: false,
      estimatedTime: 20,
      completionPercentage: 80,
      keyHighlights: [
        'Data infrastructure and quality assessment',
        'Machine learning model development capabilities',
        'AI tools and platform evaluation'
      ]
    },
    {
      sectionNumber: 3,
      title: 'Use Case Discovery',
      description: 'Identify and prioritize AI use cases across business operations',
      totalQuestions: 12,
      completedQuestions: 0,
      isCompleted: false,
      isLocked: false,
      estimatedTime: 18,
      completionPercentage: 0,
      keyHighlights: [
        'Business process optimization opportunities',
        'Customer experience enhancement potential',
        'Operational efficiency improvements'
      ]
    },
    {
      sectionNumber: 4,
      title: 'Technology Infrastructure',
      description: 'Assess data architecture and technical infrastructure readiness',
      totalQuestions: 14,
      completedQuestions: 0,
      isCompleted: false,
      isLocked: true,
      estimatedTime: 22,
      completionPercentage: 0,
      keyHighlights: [
        'Cloud platform capabilities and scalability',
        'Data architecture and integration patterns',
        'Security and compliance frameworks'
      ]
    },
    {
      sectionNumber: 5,
      title: 'People, Process & Change',
      description: 'Evaluate organizational readiness and change management',
      totalQuestions: 13,
      completedQuestions: 0,
      isCompleted: false,
      isLocked: true,
      estimatedTime: 20,
      completionPercentage: 0,
      keyHighlights: [
        'Skills assessment and training needs',
        'Change management capabilities',
        'Organizational culture alignment'
      ]
    },
    {
      sectionNumber: 6,
      title: 'Regulatory & Compliance',
      description: 'Assess regulatory requirements and compliance frameworks',
      totalQuestions: 11,
      completedQuestions: 0,
      isCompleted: false,
      isLocked: true,
      estimatedTime: 15,
      completionPercentage: 0,
      keyHighlights: [
        'Regulatory landscape understanding',
        'Risk management frameworks',
        'AI ethics and bias mitigation'
      ]
    }
  ]);

  // Get current section data
  const currentSection = sections[currentSectionIndex - 1];
  const nextSection = sections[currentSectionIndex];
  const previousSection = sections[currentSectionIndex - 2];
  const isAllSectionsComplete = sections.every(s => s.isCompleted);

  // Simulate transition delay
  const simulateTransition = async (action: string, delay: number = 1500) => {
    setTransitionState('loading');
    await new Promise(resolve => setTimeout(resolve, delay));
    setTransitionState('idle');
    console.log(`Simulated: ${action}`);
  };

  // Handle section navigation
  const handleNavigateToSection = async (sectionNumber: number) => {
    await simulateTransition(`Navigate to section ${sectionNumber}`);
    setCurrentSectionIndex(sectionNumber);
    setHasUnsavedChanges(false);
  };

  // Handle section completion
  const handleCompleteSection = async () => {
    setTransitionState('validating');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update section as completed
    setSections(prev => prev.map(s => 
      s.sectionNumber === currentSectionIndex 
        ? { ...s, isCompleted: true, completedQuestions: s.totalQuestions, completionPercentage: 100 }
        : s
    ));

    // Unlock next section
    if (currentSectionIndex < 6) {
      setSections(prev => prev.map(s => 
        s.sectionNumber === currentSectionIndex + 1 
          ? { ...s, isLocked: false }
          : s
      ));
    }

    // Show celebration
    setShowCelebration(true);
    setTransitionState('celebrating');
    
    setTimeout(() => {
      setShowCelebration(false);
      setTransitionState('idle');
    }, 3000);
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    await simulateTransition('Save and exit assessment', 1000);
    alert('Progress saved! Assessment exited.');
  };

  // Handle validation
  const handleValidateSection = async (): Promise<boolean> => {
    if (!simulateValidation) return true;
    
    setTransitionState('validating');
    await new Promise(resolve => setTimeout(resolve, 800));
    setTransitionState('idle');
    
    // Simulate validation failure occasionally
    const shouldPass = currentSection.completionPercentage >= 80;
    return shouldPass;
  };

  // Simulate progress on current section
  const simulateProgress = () => {
    setSections(prev => prev.map(s => {
      if (s.sectionNumber === currentSectionIndex && !s.isCompleted) {
        const newCompleted = Math.min(s.totalQuestions, s.completedQuestions + Math.floor(Math.random() * 3) + 1);
        const newPercentage = Math.round((newCompleted / s.totalQuestions) * 100);
        return {
          ...s,
          completedQuestions: newCompleted,
          completionPercentage: newPercentage
        };
      }
      return s;
    }));
    setHasUnsavedChanges(true);
  };

  // Reset demo
  const resetDemo = () => {
    setCurrentSectionIndex(1);
    setTransitionState('idle');
    setHasUnsavedChanges(false);
    setShowCelebration(false);
    setSections(prev => prev.map((s, index) => ({
      ...s,
      isCompleted: index === 0,
      isLocked: index > 2,
      completedQuestions: index === 0 ? s.totalQuestions : index === 1 ? 12 : index === 2 ? 0 : 0,
      completionPercentage: index === 0 ? 100 : index === 1 ? 80 : 0
    })));
  };

  // Auto-advance effect
  useEffect(() => {
    if (autoAdvance && currentSection.isCompleted && nextSection && !nextSection.isLocked) {
      const timer = setTimeout(() => {
        handleNavigateToSection(nextSection.sectionNumber);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, currentSection, nextSection]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 text-[#005DAA]" />
            <span>SectionTransitionLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Smooth section navigation with validation, animations, and proper state management
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-xl font-bold text-[#005DAA]">{currentSectionIndex}</div>
              <div className="text-sm text-gray-600">Current Section</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {sections.filter(s => s.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {Math.round(currentSection.completionPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Section Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {transitionState}
              </div>
              <div className="text-sm text-gray-600">Transition State</div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Navigation */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Section Navigation</h4>
              <div className="grid grid-cols-3 gap-2">
                {sections.slice(0, 6).map((section) => (
                  <ReusableButton
                    key={section.sectionNumber}
                    rsaStyle={section.sectionNumber === currentSectionIndex ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleNavigateToSection(section.sectionNumber)}
                    disabled={section.isLocked || transitionState === 'loading'}
                    className="text-xs"
                  >
                    {section.isCompleted && <CheckCircle className="h-3 w-3 mr-1" />}
                    {section.isLocked && <Clock className="h-3 w-3 mr-1" />}
                    Section {section.sectionNumber}
                  </ReusableButton>
                ))}
              </div>
            </div>

            {/* Demo Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Demo Actions</h4>
              <div className="flex flex-wrap gap-2">
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={simulateProgress}
                  icon={Play}
                  disabled={currentSection.isCompleted || transitionState === 'loading'}
                >
                  Simulate Progress
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={handleCompleteSection}
                  icon={CheckCircle}
                  disabled={currentSection.completionPercentage < 100 || currentSection.isCompleted}
                >
                  Complete Section
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="reset"
                  size="sm"
                  onClick={resetDemo}
                  icon={RotateCcw}
                >
                  Reset Demo
                </ReusableButton>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Demo Settings
            </h4>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className="flex items-center space-x-2 text-sm"
              >
                {autoAdvance ? (
                  <ToggleRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
                <span>Auto-advance sections</span>
              </button>
              
              <button
                onClick={() => setSimulateValidation(!simulateValidation)}
                className="flex items-center space-x-2 text-sm"
              >
                {simulateValidation ? (
                  <ToggleRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
                <span>Simulate validation</span>
              </button>
              
              <button
                onClick={() => setHasUnsavedChanges(!hasUnsavedChanges)}
                className="flex items-center space-x-2 text-sm"
              >
                {hasUnsavedChanges ? (
                  <ToggleRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
                <span>Unsaved changes</span>
              </button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`h-2 w-2 rounded-full ${
                transitionState === 'idle' ? 'bg-green-500' :
                transitionState === 'loading' ? 'bg-blue-500' :
                transitionState === 'validating' ? 'bg-yellow-500' :
                'bg-purple-500'
              }`}></div>
              <span>State: {transitionState}</span>
            </Badge>
            
            {hasUnsavedChanges && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>Unsaved Changes</span>
              </Badge>
            )}
            
            {showCelebration && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-purple-600" />
                <span>Celebrating</span>
              </Badge>
            )}
            
            {isAllSectionsComplete && (
              <Badge variant="outline" className="flex items-center space-x-1 bg-green-50 border-green-500">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>All Sections Complete</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Component */}
      <SectionTransitionLegoBlock
        currentSection={currentSection}
        nextSection={nextSection}
        previousSection={previousSection}
        transitionState={transitionState}
        onNavigateToSection={handleNavigateToSection}
        onSaveAndExit={handleSaveAndExit}
        onCompleteSection={handleCompleteSection}
        onValidateSection={handleValidateSection}
        hasUnsavedChanges={hasUnsavedChanges}
        isAllSectionsComplete={isAllSectionsComplete}
        showCelebration={showCelebration}
        autoAdvance={autoAdvance}
      />

      {/* Feature Documentation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Section Validation:</strong> Validates completion before allowing navigation to next section</p>
          <p><strong>Unsaved Changes Protection:</strong> Confirmation dialogs prevent accidental data loss</p>
          <p><strong>Progress Visualization:</strong> Real-time progress bars and completion indicators</p>
          <p><strong>Next Section Preview:</strong> Shows upcoming section details after completion</p>
          <p><strong>Transition States:</strong> Loading, validating, transitioning, and celebrating states</p>
          <p><strong>Celebration Animations:</strong> Success animations on section and full assessment completion</p>
          <p><strong>Save & Exit:</strong> Proper cleanup and progress preservation</p>
          <p><strong>Auto-advance:</strong> Optional automatic progression to next section</p>
          <p><strong>Error Handling:</strong> Validation errors and retry mechanisms</p>
          <p><strong>Responsive Design:</strong> Mobile-friendly layout with proper touch targets</p>
        </CardContent>
      </Card>
    </div>
  );
}