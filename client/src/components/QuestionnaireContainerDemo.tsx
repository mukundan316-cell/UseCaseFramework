import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionnaireContainer from './QuestionnaireContainer';

/**
 * Demo component showcasing QuestionnaireContainer with live questionnaire data
 * Uses the test questionnaire created in the database
 */
export default function QuestionnaireContainerDemo() {
  // This is the test questionnaire ID created by server/test-questionnaire.ts
  const testQuestionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">
              QuestionnaireContainer Demo
            </CardTitle>
            <CardDescription className="text-lg">
              Complete questionnaire experience with section navigation, auto-save, and progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-[#005DAA]/5 to-[#9F4F96]/5 p-6 rounded-lg border border-[#005DAA]/10">
              <h3 className="font-semibold text-gray-800 mb-3">Features Demonstrated:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Real-time API data loading with TanStack Query</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Auto-save responses with 1.5s debouncing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Section-by-section navigation with validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Overall progress tracking and completion scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Required field validation before proceeding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full"></span>
                  <span>Integrated LEGO blocks (SectionLegoBlock + QuestionLegoBlock)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Questionnaire Container */}
        <QuestionnaireContainer 
          questionnaireId={testQuestionnaireId}
        />
      </div>
    </div>
  );
}