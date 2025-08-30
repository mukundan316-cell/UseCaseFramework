import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SectionLegoBlock, { SectionData } from '../assessment/SectionLegoBlock';
import { QuestionData } from '../forms/QuestionLegoBlock';
import ReusableButton from '../ReusableButton';
import { RotateCcw, Eye, Save } from 'lucide-react';

/**
 * Demo component showcasing SectionLegoBlock functionality
 * Demonstrates sections with multiple questions, progress tracking, and validation
 */
export default function SectionLegoBlockDemo() {
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [readonly, setReadonly] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sample sections with realistic RSA questionnaire content
  const sampleSections: SectionData[] = [
    {
      id: 'business_impact',
      title: 'Business Impact Assessment',
      sectionOrder: 1,
      estimatedTime: 15,
      questions: [
        {
          id: 'revenue_impact',
          questionText: 'Expected Revenue Impact',
          questionType: 'score',
          isRequired: true,
          helpText: 'Rate the potential revenue generation or protection',
          minValue: 1,
          maxValue: 5,
          leftLabel: 'Minimal',
          rightLabel: 'Substantial',
          questionOrder: 1
        },
        {
          id: 'cost_savings',
          questionText: 'Operational Cost Savings',
          questionType: 'score',
          isRequired: true,
          helpText: 'Assess the potential for reducing operational costs',
          minValue: 1,
          maxValue: 5,
          leftLabel: 'Low',
          rightLabel: 'High',
          questionOrder: 2
        },
        {
          id: 'business_areas',
          questionText: 'Which business areas will benefit?',
          questionType: 'checkbox',
          isRequired: true,
          helpText: 'Select all applicable business areas',
          questionOrder: 3,
          options: [
            { id: 'underwriting', optionText: 'Underwriting', optionValue: 'underwriting', optionOrder: 1 },
            { id: 'claims', optionText: 'Claims Processing', optionValue: 'claims', optionOrder: 2 },
            { id: 'risk', optionText: 'Risk Assessment', optionValue: 'risk', optionOrder: 3 },
            { id: 'customer', optionText: 'Customer Service', optionValue: 'customer', optionOrder: 4 }
          ]
        },
        {
          id: 'success_metrics',
          questionText: 'How will you measure success?',
          questionType: 'textarea',
          isRequired: false,
          helpText: 'Describe the key performance indicators and success metrics',
          questionOrder: 4
        }
      ]
    },
    {
      id: 'technical_feasibility',
      title: 'Technical Feasibility & Implementation',
      sectionOrder: 2,
      estimatedTime: 20,
      questions: [
        {
          id: 'data_availability',
          questionText: 'Data Readiness Level',
          questionType: 'score',
          isRequired: true,
          helpText: 'Assess the current state of required data',
          minValue: 1,
          maxValue: 5,
          leftLabel: 'Poor Quality',
          rightLabel: 'Production Ready',
          questionOrder: 1
        },
        {
          id: 'technical_complexity',
          questionText: 'Technical Complexity Assessment',
          questionType: 'multi_choice',
          isRequired: true,
          helpText: 'Select the complexity level that best describes this implementation',
          questionOrder: 2,
          options: [
            { id: 'simple', optionText: 'Simple - Existing tools/APIs', optionValue: 'simple', scoreValue: 1, optionOrder: 1 },
            { id: 'moderate', optionText: 'Moderate - Some custom development', optionValue: 'moderate', scoreValue: 3, optionOrder: 2 },
            { id: 'complex', optionText: 'Complex - Significant R&D required', optionValue: 'complex', scoreValue: 5, optionOrder: 3 }
          ]
        },
        {
          id: 'integration_points',
          questionText: 'Required System Integrations',
          questionType: 'checkbox',
          isRequired: false,
          helpText: 'Select systems that will need integration',
          questionOrder: 3,
          options: [
            { id: 'policy_admin', optionText: 'Policy Administration System', optionValue: 'policy_admin', optionOrder: 1 },
            { id: 'crm', optionText: 'CRM Platform', optionValue: 'crm', optionOrder: 2 },
            { id: 'data_warehouse', optionText: 'Data Warehouse', optionValue: 'data_warehouse', optionOrder: 3 },
            { id: 'external_api', optionText: 'External APIs', optionValue: 'external_api', optionOrder: 4 }
          ]
        },
        {
          id: 'timeline_estimate',
          questionText: 'Implementation Timeline (months)',
          questionType: 'number',
          isRequired: true,
          helpText: 'Estimated time for full implementation and deployment',
          questionOrder: 4
        }
      ]
    },
    {
      id: 'risk_governance',
      title: 'Risk & Governance',
      sectionOrder: 3,
      estimatedTime: 10,
      questions: [
        {
          id: 'regulatory_compliance',
          questionText: 'Regulatory Compliance Requirements',
          questionType: 'score',
          isRequired: true,
          helpText: 'Rate the regulatory complexity and compliance requirements',
          minValue: 1,
          maxValue: 5,
          leftLabel: 'Minimal',
          rightLabel: 'Extensive',
          questionOrder: 1
        },
        {
          id: 'data_privacy',
          questionText: 'Involves personal data processing',
          questionType: 'checkbox',
          isRequired: true,
          helpText: 'Check if this use case processes personal or sensitive data',
          questionOrder: 2
        },
        {
          id: 'risk_mitigation',
          questionText: 'Key risks and mitigation strategies',
          questionType: 'textarea',
          isRequired: false,
          helpText: 'Identify main risks and how they will be addressed',
          questionOrder: 3
        }
      ]
    }
  ];

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => {
      const newResponses = new Map(prev);
      newResponses.set(questionId, value);
      return newResponses;
    });

    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateResponses = () => {
    const newErrors: Record<string, string> = {};
    
    sampleSections.forEach(section => {
      section.questions.forEach(question => {
        if (question.isRequired) {
          const value = responses.get(question.id);
          if (value === undefined || value === '' || 
              (Array.isArray(value) && value.length === 0)) {
            newErrors[question.id] = 'This field is required';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetResponses = () => {
    setResponses(new Map());
    setErrors({});
  };

  const toggleReadonly = () => {
    setReadonly(!readonly);
  };

  const handleSubmit = () => {
    if (validateResponses()) {
      alert('All sections completed successfully!');
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalQuestions = 0;
    let completedQuestions = 0;

    sampleSections.forEach(section => {
      section.questions.forEach(question => {
        totalQuestions++;
        const value = responses.get(question.id);
        if (value !== undefined && value !== '' && 
            (!Array.isArray(value) || value.length > 0)) {
          completedQuestions++;
        }
      });
    });

    return totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            SectionLegoBlock Demo
          </CardTitle>
          <CardDescription>
            Multi-section questionnaire with progress tracking and validation
          </CardDescription>
          
          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-[#005DAA]/5 to-[#9F4F96]/5 p-4 rounded-lg border border-[#005DAA]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-lg font-bold text-[#005DAA]">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#005DAA] to-[#9F4F96] h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <ReusableButton
              rsaStyle="secondary"
              onClick={resetResponses}
              icon={RotateCcw}
              size="sm"
            >
              Reset All
            </ReusableButton>
            <ReusableButton
              rsaStyle={readonly ? "primary" : "secondary"}
              onClick={toggleReadonly}
              icon={Eye}
              size="sm"
            >
              {readonly ? 'Enable Editing' : 'Preview Mode'}
            </ReusableButton>
            <ReusableButton
              rsaStyle="primary"
              onClick={handleSubmit}
              icon={Save}
              size="sm"
            >
              Submit Questionnaire
            </ReusableButton>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {sampleSections.map((section) => (
          <SectionLegoBlock
            key={section.id}
            section={section}
            responses={responses}
            onChange={handleResponseChange}
            readonly={readonly}
            errors={errors}
            showProgress={true}
            defaultExpanded={true}
          />
        ))}
      </div>

      {/* Debug Panel */}
      <Card className="border-[#005DAA]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#005DAA]">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Responses ({responses.size})</h4>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-auto max-h-40">
{JSON.stringify(Object.fromEntries(responses), null, 2)}
              </pre>
            </div>
            
            {Object.keys(errors).length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-red-700 mb-2">Validation Errors</h4>
                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded border">
{JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}