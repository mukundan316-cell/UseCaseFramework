import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionSummaryCardLegoBlock, { SectionSummaryData } from '../SectionSummaryCardLegoBlock';
import ReusableButton from '../ReusableButton';
import { 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight, 
  Eye, 
  EyeOff,
  Grid3X3,
  Grid2X2,
  Database,
  Play,
  CheckCircle
} from 'lucide-react';

/**
 * Demo component showcasing SectionSummaryCardLegoBlock functionality
 * Demonstrates section overview cards with progress tracking and navigation
 */
export default function SectionSummaryCardDemo() {
  const [sections, setSections] = useState<SectionSummaryData[]>([]);
  const [showInsights, setShowInsights] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState<Record<number, number>>({});

  // Initialize mock section data
  useEffect(() => {
    const mockSections: SectionSummaryData[] = [
      {
        sectionNumber: 1,
        title: 'Business Strategy & AI Vision',
        description: 'Assess your organization\'s strategic alignment with AI objectives and current vision clarity',
        totalQuestions: 17,
        completedQuestions: 17,
        estimatedTime: 25,
        actualTime: 22,
        isLocked: false,
        isCompleted: true,
        isStarted: true,
        maturityScore: 4,
        maturityLevel: 'Advanced',
        completionPercentage: 100,
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        keyInsights: [
          'Strong executive commitment to AI transformation initiatives',
          'Clear vision but needs more specific success metrics',
          'Investment strategy aligns well with strategic priorities'
        ],
        sectionType: 'business_strategy'
      },
      {
        sectionNumber: 2,
        title: 'AI Capabilities Assessment',
        description: 'Evaluate current AI/ML capabilities, data infrastructure, and technical readiness',
        totalQuestions: 15,
        completedQuestions: 12,
        estimatedTime: 20,
        actualTime: 18,
        isLocked: false,
        isCompleted: false,
        isStarted: true,
        completionPercentage: 80,
        lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        keyInsights: [],
        sectionType: 'ai_capabilities'
      },
      {
        sectionNumber: 3,
        title: 'Use Case Discovery',
        description: 'Identify and prioritize AI use cases across your business operations',
        totalQuestions: 12,
        completedQuestions: 5,
        estimatedTime: 18,
        isLocked: false,
        isCompleted: false,
        isStarted: true,
        completionPercentage: 42,
        lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        keyInsights: [],
        sectionType: 'use_case_discovery'
      },
      {
        sectionNumber: 4,
        title: 'Technology Infrastructure',
        description: 'Assess data architecture, cloud capabilities, and technical infrastructure readiness',
        totalQuestions: 14,
        completedQuestions: 0,
        estimatedTime: 22,
        isLocked: false,
        isCompleted: false,
        isStarted: false,
        completionPercentage: 0,
        keyInsights: [],
        sectionType: 'technology_infrastructure'
      },
      {
        sectionNumber: 5,
        title: 'People, Process & Change',
        description: 'Evaluate organizational readiness, skills, and change management capabilities',
        totalQuestions: 13,
        completedQuestions: 0,
        estimatedTime: 20,
        isLocked: true,
        isCompleted: false,
        isStarted: false,
        completionPercentage: 0,
        keyInsights: [],
        sectionType: 'people_process_change'
      },
      {
        sectionNumber: 6,
        title: 'Regulatory & Compliance',
        description: 'Assess regulatory requirements, risk management, and compliance frameworks',
        totalQuestions: 11,
        completedQuestions: 0,
        estimatedTime: 15,
        isLocked: true,
        isCompleted: false,
        isStarted: false,
        completionPercentage: 0,
        keyInsights: [],
        sectionType: 'regulatory_compliance'
      }
    ];

    setSections(mockSections);
    
    // Initialize simulated progress
    const progress: Record<number, number> = {};
    mockSections.forEach(section => {
      progress[section.sectionNumber] = section.completionPercentage;
    });
    setSimulatedProgress(progress);
  }, []);

  // Handle section navigation
  const handleSectionClick = (sectionNumber: number) => {
    console.log(`Navigating to section ${sectionNumber}`);
    alert(`Navigate to Section ${sectionNumber}: ${sections.find(s => s.sectionNumber === sectionNumber)?.title}`);
  };

  // Handle resume section
  const handleResumeSection = (sectionNumber: number) => {
    console.log(`Resuming section ${sectionNumber}`);
    alert(`Resume Section ${sectionNumber} at last question`);
  };

  // Handle review section
  const handleReviewSection = (sectionNumber: number) => {
    console.log(`Reviewing section ${sectionNumber}`);
    alert(`Review completed Section ${sectionNumber}`);
  };

  // Simulate progress for a section
  const simulateProgress = (sectionNumber: number) => {
    const section = sections.find(s => s.sectionNumber === sectionNumber);
    if (!section || section.isLocked) return;

    // Simulate progress increment
    const currentProgress = simulatedProgress[sectionNumber] || 0;
    const newProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 30) + 10);
    
    setSimulatedProgress(prev => ({
      ...prev,
      [sectionNumber]: newProgress
    }));

    // Update sections array
    setSections(prev => prev.map(s => {
      if (s.sectionNumber === sectionNumber) {
        const questionsCompleted = Math.floor((newProgress / 100) * s.totalQuestions);
        const isCompleted = newProgress >= 100;
        
        return {
          ...s,
          completedQuestions: questionsCompleted,
          completionPercentage: newProgress,
          isStarted: true,
          isCompleted,
          actualTime: isCompleted ? s.estimatedTime + Math.floor(Math.random() * 10) - 5 : undefined,
          maturityScore: isCompleted ? Math.floor(Math.random() * 2) + 3 : undefined,
          lastModified: new Date().toISOString(),
          keyInsights: isCompleted ? [
            `Section completed with ${questionsCompleted} questions answered`,
            'Strong performance in key assessment areas',
            'Identified opportunities for improvement'
          ] : []
        };
      }
      return s;
    }));

    // Unlock next section if current is completed
    if (newProgress >= 100 && sectionNumber < 6) {
      setSections(prev => prev.map(s => {
        if (s.sectionNumber === sectionNumber + 1) {
          return { ...s, isLocked: false };
        }
        return s;
      }));
    }
  };

  // Reset all progress
  const resetProgress = () => {
    setSections(prev => prev.map((s, index) => ({
      ...s,
      completedQuestions: index === 0 ? 17 : index === 1 ? 12 : index === 2 ? 5 : 0,
      completionPercentage: index === 0 ? 100 : index === 1 ? 80 : index === 2 ? 42 : 0,
      isStarted: index < 3,
      isCompleted: index === 0,
      isLocked: index > 3,
      actualTime: index === 0 ? 22 : undefined,
      maturityScore: index === 0 ? 4 : undefined,
      keyInsights: index === 0 ? [
        'Strong executive commitment to AI transformation initiatives',
        'Clear vision but needs more specific success metrics',
        'Investment strategy aligns well with strategic priorities'
      ] : []
    })));

    setSimulatedProgress({
      1: 100,
      2: 80,
      3: 42,
      4: 0,
      5: 0,
      6: 0
    });
  };

  // Calculate overall stats
  const totalQuestions = sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  const completedQuestions = sections.reduce((sum, s) => sum + s.completedQuestions, 0);
  const completedSections = sections.filter(s => s.isCompleted).length;
  const overallProgress = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-[#005DAA]" />
            <span>SectionSummaryCardLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Interactive section overview cards with progress tracking, maturity scoring, and navigation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#005DAA]">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedSections}</div>
              <div className="text-sm text-gray-600">Completed Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedQuestions}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-blue-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={() => simulateProgress(2)}
              icon={Play}
              size="sm"
            >
              Simulate Section 2 Progress
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="primary"
              onClick={() => simulateProgress(3)}
              icon={Play}
              size="sm"
            >
              Simulate Section 3 Progress
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={resetProgress}
              icon={RefreshCw}
              size="sm"
            >
              Reset Progress
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => setShowInsights(!showInsights)}
              icon={showInsights ? EyeOff : Eye}
              size="sm"
            >
              {showInsights ? 'Hide' : 'Show'} Insights
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => setCompactMode(!compactMode)}
              icon={compactMode ? Grid3X3 : Grid2X2}
              size="sm"
            >
              {compactMode ? 'Full' : 'Compact'} Mode
            </ReusableButton>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Completed</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Play className="h-3 w-3 text-blue-600" />
              <span>In Progress</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
              <span>Not Started</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="h-3 w-3 bg-red-400 rounded-full"></div>
              <span>Locked</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Component */}
      <SectionSummaryCardLegoBlock
        sections={sections}
        onSectionClick={handleSectionClick}
        onResumeSection={handleResumeSection}
        onReviewSection={handleReviewSection}
        showInsights={showInsights}
        compactMode={compactMode}
      />

      {/* Feature Documentation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Progress Visualization:</strong> Real-time progress bars with completion percentages</p>
          <p><strong>Maturity Scoring:</strong> 5-star rating system with color-coded maturity levels</p>
          <p><strong>Time Tracking:</strong> Estimated vs actual time with visual indicators</p>
          <p><strong>Key Insights:</strong> Bullet-point insights displayed for completed sections</p>
          <p><strong>Interactive Navigation:</strong> Click cards to enter sections, dedicated Resume/Review buttons</p>
          <p><strong>Lock States:</strong> Visual lock overlay for locked sections with unlock requirements</p>
          <p><strong>Completion States:</strong> Green borders and check marks for completed sections</p>
          <p><strong>Responsive Design:</strong> Adaptive grid layout with compact mode option</p>
          <p><strong>Section Types:</strong> Color-coded categories with appropriate icons</p>
          <p><strong>Data Integration:</strong> Pulls from section_progress table via API</p>
        </CardContent>
      </Card>
    </div>
  );
}