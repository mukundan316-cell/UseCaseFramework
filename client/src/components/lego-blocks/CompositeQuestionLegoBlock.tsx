import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartRatingLegoBlock } from './SmartRatingLegoBlock';
import PercentageTargetLegoBlock from './PercentageTargetLegoBlock';
import { Settings, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompositeField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  scale?: number;
  labels?: string[];
  showTotal?: boolean;
  conditionalDisplay?: {
    field: string;
    value: string;
  };
}

interface CompositeQuestionData {
  fields: CompositeField[];
  allowNotes?: boolean;
  notesPrompt?: string;
}

interface CompositeQuestionLegoBlockProps {
  label: string;
  helpText?: string;
  questionData: CompositeQuestionData;
  value?: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function CompositeQuestionLegoBlock({
  label,
  helpText,
  questionData,
  value = {},
  onChange,
  disabled = false,
  required = false
}: CompositeQuestionLegoBlockProps) {
  const [formData, setFormData] = useState<Record<string, any>>(value);

  useEffect(() => {
    setFormData(value);
  }, [value]);

  const handleFieldChange = (fieldId: string, fieldValue: any) => {
    const newData = { ...formData, [fieldId]: fieldValue };
    setFormData(newData);
    onChange(newData);
  };

  const isFieldVisible = (field: CompositeField): boolean => {
    if (!field.conditionalDisplay) return true;
    
    const dependentValue = formData[field.conditionalDisplay.field];
    return dependentValue === field.conditionalDisplay.value;
  };

  const renderField = (field: CompositeField) => {
    if (!isFieldVisible(field)) return null;

    const fieldValue = formData[field.id];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type={field.type}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className="w-full"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className="w-full min-h-[80px]"
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'smart_rating':
        return (
          <div key={field.id} className="space-y-2">
            <SmartRatingLegoBlock
              question={{
                id: field.id,
                questionText: field.label,
                isRequired: field.required
              }}
              value={fieldValue || null}
              onChange={(value) => handleFieldChange(field.id, value)}
              disabled={disabled}
            />
          </div>
        );

      case 'percentage_target':
        return (
          <div key={field.id} className="space-y-2">
            <PercentageTargetLegoBlock
              categories={[{
                id: field.id,
                label: field.label,
                placeholder: field.placeholder
              }]}
              values={fieldValue || {}}
              onChange={(values) => handleFieldChange(field.id, values)}
              disabled={disabled}
              required={field.required}
              label={field.label}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questionData.fields?.map(renderField)}

          {/* Additional Notes Section */}
          {questionData.allowNotes && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700">
                {questionData.notesPrompt || 'Additional Context'}
              </Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add any additional context or notes..."
                disabled={disabled}
                className="w-full min-h-[80px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}