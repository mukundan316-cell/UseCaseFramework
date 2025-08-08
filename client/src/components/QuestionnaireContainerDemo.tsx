import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionnaireContainer from './QuestionnaireContainer';
import NavigationHeader from './lego-blocks/NavigationHeader';

/**
 * AI Maturity Assessment Page - Professional assessment interface
 * LEGO Principle: Uses NavigationHeader and QuestionnaireContainer as core LEGO blocks
 */
export default function QuestionnaireContainerDemo() {
  const questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header LEGO Block */}
        <NavigationHeader 
          title="AI Assessment"
          backTo="/"
          backLabel="Back to Dashboard"
        />

        {/* Header Section */}
        <Card className="mb-8 border-[#005DAA] bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#005DAA]">
              RSA AI Maturity Assessment
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Evaluate your organization's AI readiness and maturity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border-l-4 border-[#005DAA]">
              <h3 className="font-semibold text-gray-900 mb-3">Assessment Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full mt-1.5"></span>
                  <span>Real-time progress tracking and auto-save</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full mt-1.5"></span>
                  <span>Section-by-section guided navigation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full mt-1.5"></span>
                  <span>Comprehensive maturity scoring framework</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-[#005DAA] rounded-full mt-1.5"></span>
                  <span>Personalized recommendations and insights</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Assessment Container - Pure LEGO Component */}
        <QuestionnaireContainer questionnaireId={questionnaireId} />
      </div>
    </div>
  );
}