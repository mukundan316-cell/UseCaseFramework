/**
 * Question Configuration LEGO Block
 * 
 * Admin interface for configuring question-specific settings like showTotal for percentage_target questions
 * Provides real-time configuration updates that are immediately applied to the assessment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Percent, Save, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuestionConfig {
  id: string;
  questionText: string;
  questionType: string;
  questionOrder: number;
  showTotal?: boolean;
  precision?: number;
  additionalContextLabel?: string;
  placeholder?: string;
}

interface QuestionConfigurationLegoBlockProps {
  className?: string;
  questionnaireId?: string;
}

export default function QuestionConfigurationLegoBlock({
  className = '',
  questionnaireId
}: QuestionConfigurationLegoBlockProps) {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load percentage_target questions
  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/questionnaires/${questionnaireId}`);
      if (!response.ok) throw new Error('Failed to load questionnaire');
      
      const data = await response.json();
      
      // Extract percentage_target questions from all sections
      const percentageTargetQuestions: QuestionConfig[] = [];
      
      data.sections?.forEach((section: any) => {
        section.questions?.forEach((question: any) => {
          if (question.questionType === 'percentage_target') {
            // Extract question number from question ID (e.g., "q3-distribution" -> 3)
            const questionNumber = question.id.match(/^q(\d+)-/)?.[1] || question.questionOrder;
            
            percentageTargetQuestions.push({
              id: question.id,
              questionText: question.questionText,
              questionType: question.questionType,
              questionOrder: parseInt(questionNumber as string) || question.questionOrder || 0,
              showTotal: question.questionData?.showTotal !== false, // Default to true
              precision: question.questionData?.precision || 1,
              additionalContextLabel: question.questionData?.additionalContextLabel || 'Additional Context',
              placeholder: question.questionData?.placeholder || '0.0'
            });
          }
        });
      });
      
      // Sort by question order
      percentageTargetQuestions.sort((a, b) => a.questionOrder - b.questionOrder);
      setQuestions(percentageTargetQuestions);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  // Save configuration changes
  const saveConfiguration = async (questionId: string, updates: Partial<QuestionConfig>) => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/questions/${questionId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionData: {
            showTotal: updates.showTotal,
            precision: updates.precision,
            additionalContextLabel: updates.additionalContextLabel,
            placeholder: updates.placeholder
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to save configuration');
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ));
      
      toast({
        title: "Configuration Updated",
        description: "Question settings have been saved successfully.",
        duration: 3000,
      });
      
    } catch (err) {
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : 'Failed to save configuration',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle changes
  const handleToggleChange = (questionId: string, showTotal: boolean) => {
    saveConfiguration(questionId, { showTotal });
  };

  // Handle input changes
  const handleInputChange = (questionId: string, field: string, value: string | number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  // Save input changes
  const handleInputSave = (questionId: string, field: string, value: string | number) => {
    saveConfiguration(questionId, { [field]: value });
  };

  useEffect(() => {
    loadQuestions();
  }, [questionnaireId]);

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Percentage Target Question Configuration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure display settings for percentage target questions
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {questions.length} Questions
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuestions}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Percent className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No percentage target questions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Q{question.questionOrder}
                          </Badge>
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {question.questionText}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Precision (decimals)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              value={question.precision}
                              onChange={(e) => handleInputChange(question.id, 'precision', parseInt(e.target.value) || 1)}
                              onBlur={(e) => handleInputSave(question.id, 'precision', parseInt(e.target.value) || 1)}
                              className="text-xs"
                              disabled={saving}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Input Placeholder</Label>
                            <Input
                              value={question.placeholder}
                              onChange={(e) => handleInputChange(question.id, 'placeholder', e.target.value)}
                              onBlur={(e) => handleInputSave(question.id, 'placeholder', e.target.value)}
                              className="text-xs"
                              disabled={saving}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-600">Show Total</Label>
                          <Switch
                            checked={question.showTotal}
                            onCheckedChange={(checked) => handleToggleChange(question.id, checked)}
                            disabled={saving}
                          />
                        </div>
                        
                        {question.showTotal !== undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <Info className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">
                              {question.showTotal ? 'Total visible' : 'Total hidden'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Show Total Setting:</strong> When enabled, questions display a "Total Target" summary. 
              Disable for metrics with independent measurement units (like Q11 impact metrics). 
              Changes are applied immediately to active assessments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}