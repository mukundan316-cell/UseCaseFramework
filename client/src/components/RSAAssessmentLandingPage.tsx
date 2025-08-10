import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Clock, CheckCircle2, Target, TrendingUp, Shield, Users, Play, RotateCcw, Eye, ArrowLeft, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import ReusableButton from './lego-blocks/ReusableButton';
import { useProgressPersistence } from '@/hooks/useProgressPersistence';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { useUseCases } from '@/contexts/UseCaseContext';

interface RSAAssessmentLandingPageProps {
  className?: string;
}

/**
 * RSA Assessment Landing Page Component
 * Professional introduction and state-aware navigation for the RSA AI Strategy Assessment
 */
export default function RSAAssessmentLandingPage({ 
  className = "" 
}: RSAAssessmentLandingPageProps) {
  const [, setLocation] = useLocation();
  const [assessmentState, setAssessmentState] = useState<'none' | 'in-progress' | 'completed'>('none');
  const [progressData, setProgressData] = useState<any>(null);

  // Use the same questionnaire ID as the main assessment
  const questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b';
  
  // Fetch questionnaire data for dynamic sections
  const { questionnaire } = useQuestionnaire(questionnaireId);
  
  // Check for saved progress
  const progressPersistence = useProgressPersistence({
    storageKey: `questionnaire-progress-${questionnaireId}`,
    autoSaveDelay: 1000,
    enableToasts: false
  });

  const { loadFromStorage } = progressPersistence;

  // Load assessment state on mount
  useEffect(() => {
    const savedProgress = loadFromStorage();
    if (savedProgress) {
      setProgressData(savedProgress);
      
      // Determine state based on completion percentage
      if (savedProgress.completionPercentage >= 100) {
        setAssessmentState('completed');
      } else if (savedProgress.completionPercentage > 0) {
        setAssessmentState('in-progress');
      }
    }
  }, [loadFromStorage]);

  // Value proposition cards data
  const valuePropositions = [
    {
      icon: Target,
      title: "Business Case Development",
      description: "Prioritize AI use cases with highest ROI potential",
      color: "text-[#005DAA]"
    },
    {
      icon: TrendingUp,
      title: "Technology Roadmap",
      description: "Design implementation plans leveraging existing infrastructure",
      color: "text-[#9F4F96]"
    },
    {
      icon: TrendingUp,
      title: "Investment Strategy",
      description: "Recommend budget allocation (£500K-£10M+ annually)",
      color: "text-[#005DAA]"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Identify and mitigate AI-related risks",
      color: "text-[#9F4F96]"
    },
    {
      icon: Users,
      title: "Change Management",
      description: "Create targeted adoption strategies",
      color: "text-[#005DAA]"
    }
  ];

  // Dynamic assessment sections from database
  const assessmentSections = questionnaire?.sections?.map(section => {
    const questionCount = section.questions?.length || 0;
    // Calculate estimated time based on question count and complexity
    const baseTime = Math.max(5, Math.min(25, questionCount * 3)); // 3 minutes per question, 5-25 min range
    const timeRange = `${baseTime}-${baseTime + 5} min`;
    
    return {
      title: section.title,
      time: timeRange,
      questions: questionCount,
      description: section.description
    };
  }) || [
    // Fallback only if database fails to load
    { title: "Business Strategy", time: "15-20 min", questions: 16, description: "Strategic AI vision and business alignment" },
    { title: "Technology Infrastructure", time: "10-15 min", questions: 4, description: "Current systems and technical readiness" }
  ];

  const totalQuestions = assessmentSections.reduce((sum, section) => sum + section.questions, 0);
  const totalEstimatedTime = `${Math.floor(totalQuestions * 2.5)}-${Math.ceil(totalQuestions * 4)} minutes`;

  // Get context for tab management
  const { setActiveTab } = useUseCases();

  // Navigation handlers
  const handleBackToDashboard = () => {
    // Set the active tab to dashboard and navigate
    setActiveTab('dashboard');
    setLocation('/');
  };

  const handleBeginAssessment = () => {
    setLocation('/assessment/take');
  };

  const handleResumeAssessment = () => {
    setLocation('/assessment/take');
  };

  const handleViewResults = () => {
    if (progressData?.responseId) {
      setLocation(`/results/${progressData.responseId}`);
    }
  };

  const handleStartOver = () => {
    if (progressPersistence.clearStorage) {
      progressPersistence.clearStorage();
    }
    setAssessmentState('none');
    setProgressData(null);
    setLocation('/assessment/take');
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-8", className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 border-[#005DAA] text-[#005DAA] hover:bg-[#005DAA] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>RSA AI Strategy Framework</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            RSA AI Strategy Assessment Framework
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            Comprehensive evaluation to unlock £10-50M in annual value
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-[#005DAA]/10 to-[#9F4F96]/10 p-6 rounded-lg border border-[#005DAA]/20">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              This comprehensive assessment enables RSA to develop a tailored AI strategy that moves beyond current data management focus to unlock £10-50M in annual value through targeted AI initiatives across Commercial and Specialty insurance operations.
            </p>
          </div>
        </div>
      </div>

      {/* Assessment State Alert */}
      {assessmentState !== 'none' && (
        <Alert className="border-[#005DAA]/20 bg-[#005DAA]/5">
          <CheckCircle2 className="h-4 w-4 text-[#005DAA]" />
          <AlertDescription className="text-[#005DAA]">
            {assessmentState === 'completed' ? (
              <>Assessment completed! You can view your results or retake the assessment.</>
            ) : (
              <>Assessment in progress ({progressData?.completionPercentage || 0}% complete). You can resume where you left off.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Value Proposition Cards */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Strategic Value Delivery
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valuePropositions.map((prop, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-lg bg-gray-50", prop.color)}>
                    <prop.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{prop.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {prop.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assessment Overview */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Assessment Overview
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sections Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#005DAA]" />
                <span>Assessment Sections</span>
              </CardTitle>
              <CardDescription>
                {assessmentSections.length} comprehensive sections covering all strategic areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessmentSections.map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      <p className="text-sm text-gray-600">{section.questions} questions</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {section.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-[#9F4F96]" />
                <span>Assessment Features</span>
              </CardTitle>
              <CardDescription>
                Designed for executive-level strategic decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#005DAA] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Total Time</h4>
                    <p className="text-sm text-gray-600">{totalEstimatedTime} (can be split across sessions)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9F4F96] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Save & Resume</h4>
                    <p className="text-sm text-gray-600">Progress automatically saved, resume anytime</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#005DAA] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                    <p className="text-sm text-gray-600">Real-time completion status across all sections</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9F4F96] rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Advanced Question Types</h4>
                    <p className="text-sm text-gray-600">Interactive matrices, rankings, and business-specific inputs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <Card className="border-[#005DAA]/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Ready to Begin Your AI Strategy Assessment?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This assessment will provide data-driven insights to guide RSA's AI transformation and unlock significant value across your insurance operations.
            </p>
          </div>

          {/* Progress indicator for in-progress assessments */}
          {assessmentState === 'in-progress' && progressData && (
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Current Progress</span>
                <span>{progressData.completionPercentage}%</span>
              </div>
              <Progress value={progressData.completionPercentage} className="h-2" />
              <p className="text-xs text-gray-500">
                Last saved: {progressData.lastSaved}
              </p>
            </div>
          )}

          {/* Action buttons based on state */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {assessmentState === 'none' && (
              <ReusableButton
                rsaStyle="primary"
                onClick={handleBeginAssessment}
                icon={Play}
                className="px-8 py-3"
              >
                Begin Assessment
              </ReusableButton>
            )}

            {assessmentState === 'in-progress' && (
              <>
                <ReusableButton
                  rsaStyle="primary"
                  onClick={handleResumeAssessment}
                  icon={Play}
                  className="px-8 py-3"
                >
                  Resume Assessment ({progressData?.completionPercentage || 0}% complete)
                </ReusableButton>
                <Button
                  variant="outline"
                  onClick={handleStartOver}
                  className="px-6 py-3 border-[#005DAA] text-[#005DAA] hover:bg-[#005DAA] hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </>
            )}

            {assessmentState === 'completed' && (
              <>
                <ReusableButton
                  rsaStyle="primary"
                  onClick={handleViewResults}
                  icon={Eye}
                  className="px-8 py-3"
                >
                  View Results
                </ReusableButton>
                <Button
                  variant="outline"
                  onClick={handleStartOver}
                  className="px-6 py-3 border-[#9F4F96] text-[#9F4F96] hover:bg-[#9F4F96] hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              </>
            )}
          </div>

          <div className="text-sm text-gray-500 max-w-lg mx-auto">
            <p>
              This assessment follows RSA's strategic framework and incorporates industry best practices 
              for AI transformation in insurance operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}