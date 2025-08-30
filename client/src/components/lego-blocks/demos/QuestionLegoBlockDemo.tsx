import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionLegoBlock, { QuestionData } from '../forms/QuestionLegoBlock';
import ReusableButton from '../ReusableButton';
import { RotateCcw, Eye } from 'lucide-react';

/**
 * Demo component showcasing QuestionLegoBlock functionality
 * Demonstrates all question types with realistic RSA use case examples
 */
export default function QuestionLegoBlockDemo() {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [readonly, setReadonly] = useState(false);

  // Sample questions covering all supported types
  const sampleQuestions: QuestionData[] = [
    {
      id: 'impact_score',
      questionText: 'Rate the expected business impact',
      questionType: 'score',
      isRequired: true,
      helpText: 'Consider revenue potential, cost savings, and strategic alignment',
      minValue: 1,
      maxValue: 5,
      leftLabel: 'Low Impact',
      rightLabel: 'High Impact'
    },
    {
      id: 'implementation_approach',
      questionText: 'What is your preferred implementation approach?',
      questionType: 'multi_choice',
      isRequired: true,
      helpText: 'Select the approach that best fits your use case',
      options: [
        { id: 'pilot', optionText: 'Pilot Program', optionValue: 'pilot', scoreValue: 3, optionOrder: 1 },
        { id: 'phased', optionText: 'Phased Rollout', optionValue: 'phased', scoreValue: 4, optionOrder: 2 },
        { id: 'full', optionText: 'Full Implementation', optionValue: 'full', scoreValue: 5, optionOrder: 3 },
        { id: 'poc', optionText: 'Proof of Concept First', optionValue: 'poc', scoreValue: 2, optionOrder: 4 }
      ]
    },
    {
      id: 'stakeholder_groups',
      questionText: 'Which stakeholder groups will be involved?',
      questionType: 'checkbox',
      isRequired: false,
      helpText: 'Select all relevant stakeholder groups',
      options: [
        { id: 'underwriting', optionText: 'Underwriting Team', optionValue: 'underwriting', optionOrder: 1 },
        { id: 'claims', optionText: 'Claims Department', optionValue: 'claims', optionOrder: 2 },
        { id: 'brokers', optionText: 'Broker Network', optionValue: 'brokers', optionOrder: 3 },
        { id: 'it', optionText: 'IT Department', optionValue: 'it', optionOrder: 4 },
        { id: 'compliance', optionText: 'Compliance Team', optionValue: 'compliance', optionOrder: 5 }
      ]
    },
    {
      id: 'project_name',
      questionText: 'Project Name',
      questionType: 'text',
      isRequired: true,
      helpText: 'Enter a descriptive name for this AI use case project'
    },
    {
      id: 'detailed_description',
      questionText: 'Provide a detailed description of the use case',
      questionType: 'textarea',
      isRequired: true,
      helpText: 'Include business context, expected outcomes, and key requirements'
    },
    {
      id: 'estimated_budget',
      questionText: 'Estimated Budget (£)',
      questionType: 'number',
      isRequired: false,
      helpText: 'Rough budget estimate for the entire project'
    },
    {
      id: 'regulatory_approval',
      questionText: 'Regulatory approval required',
      questionType: 'checkbox',
      isRequired: false,
      helpText: 'Check if this use case requires regulatory approval'
    }
  ];

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const resetResponses = () => {
    setResponses({});
  };

  const toggleReadonly = () => {
    setReadonly(!readonly);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            QuestionLegoBlock Demo
          </CardTitle>
          <CardDescription>
            Showcasing all question types with RSA styling and functionality
          </CardDescription>
          
          <div className="flex space-x-4 pt-4">
            <ReusableButton
              rsaStyle="secondary"
              onClick={resetResponses}
              icon={RotateCcw}
              size="sm"
            >
              Reset Responses
            </ReusableButton>
            <ReusableButton
              rsaStyle={readonly ? "primary" : "secondary"}
              onClick={toggleReadonly}
              icon={Eye}
              size="sm"
            >
              {readonly ? 'Enable Editing' : 'Preview Mode'}
            </ReusableButton>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {sampleQuestions.map((question) => (
            <div key={question.id} className="space-y-4">
              <div className="bg-gradient-to-r from-[#005DAA]/5 to-[#9F4F96]/5 p-6 rounded-lg border border-[#005DAA]/10">
                <QuestionLegoBlock
                  question={question}
                  value={responses[question.id]}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  readonly={readonly}
                  error={
                    question.isRequired && 
                    (responses[question.id] === undefined || responses[question.id] === '' || 
                     (Array.isArray(responses[question.id]) && responses[question.id].length === 0))
                      ? 'This field is required'
                      : undefined
                  }
                />
              </div>
              
              {/* Response Debug Info */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                <strong>Response Value:</strong> {JSON.stringify(responses[question.id]) || 'null'}
              </div>
            </div>
          ))}
          
          {/* Summary */}
          <Card className="border-[#005DAA]/20">
            <CardHeader>
              <CardTitle className="text-lg text-[#005DAA]">Response Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(responses, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}