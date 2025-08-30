import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ScoringLegoBlockProps {
  form: UseFormReturn<any>;
  category: 'business-value' | 'feasibility' | 'ai-governance';
  fields: {
    name: string;
    label: string;
    description: string;
  }[];
}

/**
 * Reusable LEGO block for comprehensive RSA framework scoring sections
 * Supports Business Impact, Implementation Effort, and AI Governance categories
 * Implements 1-5 scale scoring with descriptive labels
 */
export default function ScoringLegoBlock({ form, category, fields }: ScoringLegoBlockProps) {
  const getCategoryTitle = () => {
    switch (category) {
      case 'business-value':
        return 'Business Impact Levers';
      case 'feasibility':
        return 'Implementation Effort Levers';
      case 'ai-governance':
        return 'AI Governance Levers';
      default:
        return 'Scoring';
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case 'business-value':
        return 'Revenue impact, cost savings, risk reduction, broker experience, and strategic alignment';
      case 'feasibility':
        return 'Data readiness, technical complexity, change impact, model risk, and adoption readiness';
      case 'ai-governance':
        return 'Explainability, bias management, and regulatory compliance requirements';
      default:
        return 'Score each dimension on a 1-5 scale';
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'business-value':
        return 'bg-green-50 border-green-200';
      case 'feasibility':
        return 'bg-blue-50 border-blue-200';
      case 'ai-governance':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getScoreLabel = (score: string) => {
    switch (score) {
      case '1': return 'Very Low';
      case '2': return 'Low';
      case '3': return 'Medium';
      case '4': return 'High';
      case '5': return 'Very High';
      default: return 'Select';
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case '1': return 'bg-red-100 text-red-800';
      case '2': return 'bg-orange-100 text-orange-800';
      case '3': return 'bg-yellow-100 text-yellow-800';
      case '4': return 'bg-blue-100 text-blue-800';
      case '5': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${getCategoryColor()} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {getCategoryTitle()}
          </CardTitle>
          <Info className="h-4 w-4 text-gray-500" />
        </div>
        <CardDescription className="text-sm text-gray-600">
          {getCategoryDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {field.label}
                  </FormLabel>
                  {formField.value && (
                    <Badge className={`text-xs ${getScoreColor(formField.value)}`}>
                      {getScoreLabel(formField.value)}
                    </Badge>
                  )}
                </div>
                <FormControl>
                  <Select value={formField.value} onValueChange={formField.onChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select score (1-5)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very Low</SelectItem>
                      <SelectItem value="2">2 - Low</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
}