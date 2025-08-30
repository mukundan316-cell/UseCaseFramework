import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuestionRegistryLegoBlock, { QuestionMetadata, ConditionalRule } from './QuestionRegistryLegoBlock';
import ReusableButton from './ReusableButton';
import { Database, RotateCcw, Settings, PlayCircle, Eye, EyeOff, Edit } from 'lucide-react';

/**
 * Demo component showcasing QuestionRegistryLegoBlock functionality
 * Demonstrates dynamic question management, conditional logic, and database-driven configuration
 */
export default function QuestionRegistryDemo() {
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [editMode, setEditMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // Mock dynamic questions with various types and conditional logic
  const [questions, setQuestions] = useState<QuestionMetadata[]>([
    {
      id: 'ai_maturity',
      sectionId: 1,
      questionOrder: 1,
      questionType: 'scale',
      questionText: 'How would you rate your organization\'s current AI maturity?',
      isRequired: true,
      isStarred: true,
      helpText: 'Consider your current AI capabilities, governance, and strategic alignment',
      questionData: {
        minValue: 1,
        maxValue: 5,
        leftLabel: 'Very Low',
        rightLabel: 'Very High'
      },
      createdAt: '2025-01-08T10:00:00Z'
    },
    {
      id: 'ai_experience',
      sectionId: 1,
      questionOrder: 2,
      questionType: 'multiChoice',
      questionText: 'What is your experience level with AI implementation?',
      isRequired: true,
      helpText: 'Select the option that best describes your experience',
      questionData: {
        options: [
          { id: 'beginner', optionText: 'Beginner - New to AI', optionValue: 'beginner', optionOrder: 1 },
          { id: 'intermediate', optionText: 'Intermediate - Some projects', optionValue: 'intermediate', optionOrder: 2 },
          { id: 'advanced', optionText: 'Advanced - Multiple implementations', optionValue: 'advanced', optionOrder: 3 },
          { id: 'expert', optionText: 'Expert - AI-driven organization', optionValue: 'expert', optionOrder: 4 }
        ]
      },
      createdAt: '2025-01-08T10:05:00Z'
    },
    {
      id: 'budget_range',
      sectionId: 1,
      questionOrder: 3,
      questionType: 'multiChoice',
      questionText: 'What is your estimated AI implementation budget?',
      isRequired: false,
      helpText: 'Select the range that best fits your budget allocation',
      dependsOn: ['ai_experience'],
      conditionalLogic: [
        {
          dependentQuestionId: 'ai_experience',
          operator: 'not_equals',
          value: 'beginner',
          action: 'show'
        }
      ],
      questionData: {
        options: [
          { id: 'low', optionText: 'Under $50K', optionValue: 'low', optionOrder: 1 },
          { id: 'medium', optionText: '$50K - $200K', optionValue: 'medium', optionOrder: 2 },
          { id: 'high', optionText: '$200K - $500K', optionValue: 'high', optionOrder: 3 },
          { id: 'enterprise', optionText: 'Over $500K', optionValue: 'enterprise', optionOrder: 4 }
        ]
      },
      createdAt: '2025-01-08T10:10:00Z'
    },
    {
      id: 'priority_areas',
      sectionId: 1,
      questionOrder: 4,
      questionType: 'checkbox',
      questionText: 'Which business areas are priority for AI implementation?',
      isRequired: true,
      helpText: 'Select all areas that apply to your organization',
      questionData: {
        options: [
          { id: 'customer_service', optionText: 'Customer Service', optionValue: 'customer_service', optionOrder: 1 },
          { id: 'operations', optionText: 'Operations & Automation', optionValue: 'operations', optionOrder: 2 },
          { id: 'analytics', optionText: 'Data Analytics', optionValue: 'analytics', optionOrder: 3 },
          { id: 'risk_management', optionText: 'Risk Management', optionValue: 'risk_management', optionOrder: 4 },
          { id: 'fraud_detection', optionText: 'Fraud Detection', optionValue: 'fraud_detection', optionOrder: 5 }
        ]
      },
      createdAt: '2025-01-08T10:15:00Z'
    },
    {
      id: 'timeline_urgency',
      sectionId: 1,
      questionOrder: 5,
      questionType: 'scale',
      questionText: 'How urgent is your AI implementation timeline?',
      isRequired: false,
      helpText: 'Rate the urgency level for implementing AI solutions',
      dependsOn: ['ai_maturity'],
      conditionalLogic: [
        {
          dependentQuestionId: 'ai_maturity',
          operator: 'greater_than',
          value: 2,
          action: 'show'
        },
        {
          dependentQuestionId: 'ai_maturity',
          operator: 'greater_than',
          value: 3,
          action: 'require'
        }
      ],
      questionData: {
        minValue: 1,
        maxValue: 5,
        leftLabel: 'No Rush',
        rightLabel: 'Very Urgent'
      },
      createdAt: '2025-01-08T10:20:00Z'
    },
    {
      id: 'additional_comments',
      sectionId: 1,
      questionOrder: 6,
      questionType: 'textarea',
      questionText: 'Any additional comments or specific requirements?',
      isRequired: false,
      helpText: 'Share any specific needs, concerns, or goals for your AI implementation',
      questionData: {
        placeholder: 'Please share any additional context...',
        maxLength: 500
      },
      createdAt: '2025-01-08T10:25:00Z'
    }
  ]);

  // Handle response changes
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(new Map(responses.set(questionId, value)));
  };

  // Handle question management
  const handleQuestionChange = (action: 'add' | 'edit' | 'delete', question: QuestionMetadata) => {
    switch (action) {
      case 'add':
        const newQuestion: QuestionMetadata = {
          id: `new_question_${Date.now()}`,
          sectionId: 1,
          questionOrder: questions.length + 1,
          questionType: 'text',
          questionText: 'New Question',
          isRequired: false,
          questionData: {},
          createdAt: new Date().toISOString()
        };
        setQuestions([...questions, newQuestion]);
        break;
      case 'delete':
        setQuestions(questions.filter(q => q.id !== question.id));
        responses.delete(question.id);
        setResponses(new Map(responses));
        break;
      case 'edit':
        // In real app, this would open an edit modal
        alert(`Edit question: ${question.questionText}`);
        break;
    }
  };

  // Demo actions
  const simulateProgress = () => {
    const sampleResponses = new Map(responses);
    
    // Add some sample responses
    sampleResponses.set('ai_maturity', 3);
    sampleResponses.set('ai_experience', 'intermediate');
    sampleResponses.set('priority_areas', ['customer_service', 'analytics']);
    
    setResponses(sampleResponses);
  };

  const resetDemo = () => {
    setResponses(new Map());
    setEditMode(false);
    setShowDebug(false);
  };

  const addConditionalQuestion = () => {
    const conditionalQuestion: QuestionMetadata = {
      id: `conditional_${Date.now()}`,
      sectionId: 1,
      questionOrder: questions.length + 1,
      questionType: 'text',
      questionText: 'What specific AI tools are you considering? (Only shown if you have intermediate+ experience)',
      isRequired: false,
      helpText: 'This question appears based on your experience level',
      dependsOn: ['ai_experience'],
      conditionalLogic: [
        {
          dependentQuestionId: 'ai_experience',
          operator: 'in',
          value: ['intermediate', 'advanced', 'expert'],
          action: 'show'
        }
      ],
      questionData: {
        placeholder: 'e.g., ChatGPT, Azure AI, AWS ML services...'
      },
      createdAt: new Date().toISOString()
    };
    
    setQuestions([...questions, conditionalQuestion]);
  };

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => responses.has(q.id)).length;
  const completionRate = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-[#005DAA]" />
            <span>QuestionRegistryLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Dynamic question management with conditional logic and database-driven configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Controls */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <ReusableButton
              rsaStyle="primary"
              onClick={simulateProgress}
              icon={PlayCircle}
              size="sm"
            >
              Fill Sample Answers
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={addConditionalQuestion}
              icon={PlayCircle}
              size="sm"
            >
              Add Conditional Question
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="reset"
              onClick={resetDemo}
              icon={RotateCcw}
              size="sm"
            >
              Reset Demo
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => setEditMode(!editMode)}
              icon={Edit}
              size="sm"
            >
              {editMode ? 'Exit Edit' : 'Edit Mode'}
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="secondary"
              onClick={() => setShowDebug(!showDebug)}
              icon={showDebug ? EyeOff : Eye}
              size="sm"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </ReusableButton>
            
            <ReusableButton
              rsaStyle="warning"
              onClick={() => setDisabled(!disabled)}
              icon={Settings}
              size="sm"
            >
              {disabled ? 'Enable' : 'Disable'} All
            </ReusableButton>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <Badge variant="outline" className="mb-2">Total Questions</Badge>
              <p className="font-semibold">{totalQuestions}</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Answered</Badge>
              <p className="font-semibold">{answeredQuestions}</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Completion Rate</Badge>
              <p className="font-semibold">{completionRate}%</p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Mode</Badge>
              <p className="text-sm">
                Edit: {editMode ? 'On' : 'Off'} | Debug: {showDebug ? 'On' : 'Off'}
              </p>
            </div>
          </div>

          {/* Question Types Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Supported Question Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {[
                  'scale', 'multiChoice', 'ranking', 'allocation',
                  'text', 'boolean', 'matrix', 'compound',
                  'score', 'checkbox', 'textarea', 'number',
                  'email', 'url', 'date'
                ].map(type => (
                  <Badge key={type} variant="outline" className="justify-center">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Main Component Demo */}
      <QuestionRegistryLegoBlock
        questions={questions}
        responses={responses}
        onResponseChange={handleResponseChange}
        onQuestionChange={handleQuestionChange}
        editMode={editMode}
        showDebug={showDebug}
        disabled={disabled}
      />

      {/* Usage Instructions */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Demo Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Fill Sample Answers:</strong> Populate questions to see conditional logic in action</p>
          <p><strong>Add Conditional Question:</strong> Adds a question that shows based on experience level</p>
          <p><strong>Edit Mode:</strong> Enable question management (add/edit/delete functionality)</p>
          <p><strong>Debug Mode:</strong> Show internal state and conditional logic evaluation</p>
          <p><strong>Conditional Logic:</strong> Notice how questions appear/disappear based on answers</p>
          <p><strong>Question Types:</strong> Registry supports 15+ different input types</p>
          <p><strong>Database-Driven:</strong> Questions stored as JSON metadata for dynamic management</p>
        </CardContent>
      </Card>

      {/* Response Data Display */}
      {responses.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
              {Array.from(responses.entries()).map(([questionId, value]) => (
                <div key={questionId}>
                  <strong>{questionId}:</strong> {JSON.stringify(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}