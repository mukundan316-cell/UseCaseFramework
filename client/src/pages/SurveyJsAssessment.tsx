import React, { useState, useRef } from 'react';
import { useParams } from 'wouter';
import { SurveyJsContainer, type SurveyJsContainerRef } from '@/components/SurveyJsContainerProper';
import AssessmentSideMenu from '@/components/AssessmentSideMenu';
import { useQuestionnaireSelection } from '@/hooks/useQuestionnaireSelection';
import { useToast } from '@/hooks/use-toast';

interface SurveyJsAssessmentProps {
  questionnaireId?: string;
}

export default function SurveyJsAssessment({ questionnaireId: propQuestionnaireId }: SurveyJsAssessmentProps) {
  const { questionnaireId: paramQuestionnaireId } = useParams<{ questionnaireId: string }>();
  const initialQuestionnaireId = propQuestionnaireId || paramQuestionnaireId;
  
  const {
    questionnairesWithProgress,
    selectedQuestionnaireId,
    selectQuestionnaire,
    isLoading
  } = useQuestionnaireSelection();
  
  const { toast } = useToast();
  const surveyContainerRef = useRef<SurveyJsContainerRef>(null);

  // Use selection hook's selected ID, fallback to initial prop/param
  const activeQuestionnaireId = selectedQuestionnaireId || initialQuestionnaireId;
  
  // Check if selected questionnaire has no session and needs one created
  const selectedQuestionnaire = questionnairesWithProgress.find(q => q.definition.id === activeQuestionnaireId);
  const needsSessionCreation = selectedQuestionnaire && !selectedQuestionnaire.session;

  const handleQuestionnaireSwitch = async (newQuestionnaireId: string) => {
    try {
      // Save current progress before switching
      if (surveyContainerRef.current) {
        await surveyContainerRef.current.saveCurrentProgress();
      }
      
      // Switch to new questionnaire
      selectQuestionnaire(newQuestionnaireId);
      
      toast({
        title: "Assessment Switched",
        description: "Your progress has been saved and the new assessment loaded.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error switching questionnaire:', error);
      toast({
        title: "Save Error",
        description: "Failed to save progress before switching. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Assessments...</h2>
            <p className="text-gray-600">Please wait while we fetch your available assessments.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show a simple message if no questionnaire is selected yet
  if (!activeQuestionnaireId) {
    if (isLoading) {
      return (
        <div className="flex h-screen">
          <div className="flex items-center justify-center w-full">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Assessments...</h2>
              <p className="text-gray-600">Please wait while we fetch your available assessments.</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex h-screen">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Assessments Available</h1>
            <p className="text-gray-600">No questionnaires are currently available for completion.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyJsContainer 
        key={activeQuestionnaireId} // Force re-render when questionnaire changes
        questionnaireId={activeQuestionnaireId}
        ref={surveyContainerRef}
        questionnaires={questionnairesWithProgress}
        onQuestionnaireSwitch={handleQuestionnaireSwitch}
        onSaveBeforeSwitch={() => 
          surveyContainerRef.current?.saveCurrentProgress() || Promise.resolve()
        }
      />
    </div>
  );
}