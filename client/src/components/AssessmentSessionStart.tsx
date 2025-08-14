import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, User, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';

interface AssessmentSessionStartProps {
  onSessionStarted?: (sessionId: string) => void;
}

export function AssessmentSessionStart({ 
  onSessionStarted 
}: AssessmentSessionStartProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // We'll use a default questionnaire ID for session creation - the /take page will handle questionnaire selection
  const { startResponseAsync, isStartingResponse, startResponseError } = useQuestionnaire('91684df8-9700-4605-bc3e-2320120e5e1b');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartAssessment = async () => {
    if (!validateForm()) return;

    try {
      const result = await startResponseAsync({
        questionnaireId: '91684df8-9700-4605-bc3e-2320120e5e1b', // Use default questionnaire ID
        respondentEmail: formData.email.trim(),
        respondentName: formData.name.trim()
      });

      console.log('Session start result:', result);

      toast({
        title: "Assessment Started",
        description: "Your session has been created successfully.",
        duration: 3000
      });

      if (onSessionStarted && result?.responseId) {
        onSessionStarted(result.responseId);
      }
      
      // Navigate to assessment
      setLocation('/assessment/take');
    } catch (error: any) {
      console.error('Failed to start session:', error);
      
      // Handle completed session case
      if (error?.completedSessionId) {
        toast({
          title: "Assessment Already Completed",
          description: "Redirecting to your results...",
          duration: 3000
        });
        setTimeout(() => {
          setLocation(`/results/${error.completedSessionId}`);
        }, 1500);
        return;
      }
      
      toast({
        title: "Failed to Start Assessment",
        description: "Please check your details and try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToLanding = () => {
    setLocation('/assessment');
  };

  // Don't wait for questionnaire selection on the start page - just show the form
  // The questionnaire will be selected when the user actually starts the assessment

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005DAA] via-[#0066BB] to-[#9F4F96] text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToLanding}
              className="text-white hover:bg-white/20 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Start Your Assessment
            </h1>
            <p className="text-base text-blue-50 leading-relaxed max-w-2xl mx-auto">
              Please provide your contact information to begin the RSA AI Strategy Assessment. 
              Your progress will be automatically saved and can be resumed at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Assessment Information
            </CardTitle>
            <p className="text-gray-600">
              This information will be used to track your progress and generate your personalized results.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {startResponseError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to start assessment. Please check your information and try again.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@company.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={isStartingResponse}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isStartingResponse}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Privacy & Data Security</p>
              <p>
                Your information is stored securely and will only be used for this assessment. 
                Progress is automatically saved and can be resumed using the same email address.
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={handleStartAssessment}
                disabled={isStartingResponse || !formData.email.trim() || !formData.name.trim()}
                className="w-full bg-[#005DAA] hover:bg-[#004A88] text-white py-3 h-auto"
                size="lg"
              >
                {isStartingResponse ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Starting Assessment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Start Assessment
                  </div>
                )}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-500 pt-4">
              <p>
                The assessment takes approximately 30-45 minutes to complete.
                You can save and resume your progress at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}