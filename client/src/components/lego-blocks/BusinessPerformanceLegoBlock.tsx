import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, AlertCircle, Info } from "lucide-react";

interface BusinessPerformanceLegoBlockProps {
  /** Question data including text and help text */
  question?: {
    id: string;
    questionText: string;
    helpText?: string;
    isRequired?: boolean;
  };
  questionData?: {
    metrics?: Array<{
      id: string;
      label: string;
      type: 'percentage' | 'number' | 'scale' | 'currency';
      required?: boolean;
      min?: number;
      max?: number;
    }>;
    categories?: Record<string, Array<{
      id: string;
      label: string;
      type: 'percentage' | 'number' | 'scale' | 'currency';
      required?: boolean;
      min?: number;
      max?: number;
    }>>;
    allowNotes?: boolean;
    notesPrompt?: string;
    placeholder?: string;
    helpText?: string;
  };
  value?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export default function BusinessPerformanceLegoBlock({
  question,
  questionData = {},
  value = {},
  onChange,
  disabled = false,
  error
}: BusinessPerformanceLegoBlockProps) {
  const [formData, setFormData] = useState<any>(value);
  
  useEffect(() => {
    setFormData(value);
  }, [value]);

  const handleChange = (field: string, fieldValue: string, type: string = 'text') => {
    let processedValue: any = fieldValue;
    
    // Convert to number for numeric and percentage fields
    if ((type === 'number' || type === 'percentage' || type === 'scale') && fieldValue !== '') {
      const parsed = parseFloat(fieldValue);
      processedValue = isNaN(parsed) ? undefined : parsed;
    } else if ((type === 'number' || type === 'percentage' || type === 'scale') && fieldValue === '') {
      processedValue = undefined;
    }
    
    const newData = { ...formData, [field]: processedValue };
    setFormData(newData);
    onChange(newData);
  };

  const handleNotesChange = (notes: string) => {
    const newData = { ...formData, notes };
    setFormData(newData);
    onChange(newData);
  };

  // Get metrics configuration - either flat metrics array or categorized
  const getMetricsConfig = () => {
    if (questionData?.metrics) {
      return { 'Performance Metrics': questionData.metrics };
    } else if (questionData?.categories) {
      return questionData.categories;
    } else {
      // Fallback to default metrics based on database configuration
      return {
        'Financial Performance Ratios': [
          { id: 'combinedRatio', label: 'Combined Ratio', type: 'percentage' as const },
          { id: 'expenseRatio', label: 'Expense Ratio', type: 'percentage' as const },
          { id: 'lossRatio', label: 'Loss Ratio', type: 'percentage' as const }
        ],
        'Growth & Customer Metrics': [
          { id: 'premiumGrowth', label: 'Premium Growth Rate (YoY)', type: 'percentage' as const },
          { id: 'retentionRate', label: 'Policy Retention Rate', type: 'percentage' as const }
        ]
      };
    }
  };

  const metricsConfig = getMetricsConfig();

  const renderMetricField = (metric: any) => {
    const suffix = metric.type === 'percentage' ? '%' : 
                  metric.type === 'scale' ? `/${metric.max || 10}` :
                  metric.type === 'currency' ? '' : 
                  'ratio';
                  
    const placeholder = metric.type === 'percentage' ? 'e.g., 95' :
                       metric.type === 'scale' ? `1-${metric.max || 10}` :
                       'e.g., 0.95';

    return (
      <div key={metric.id} className="space-y-3">
        <Label htmlFor={metric.id} className="text-base font-semibold text-gray-900 block">
          {metric.label}
          {metric.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={metric.id}
            type="text"
            value={formData[metric.id] !== undefined ? formData[metric.id].toString() : ''}
            onChange={(e) => handleChange(metric.id, e.target.value, metric.type)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${suffix ? "pr-16" : "pr-4"} ${metric.type === 'percentage' || metric.type === 'scale' ? 'text-right' : 'text-left'}`}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      {question && (
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.helpText && (
            <p className="text-sm text-gray-600">{question.helpText}</p>
          )}
        </div>
      )}

      {Object.entries(metricsConfig).map(([categoryName, metrics], categoryIndex) => {
        const colors = [
          { border: 'border-blue-200', bg: 'bg-blue-50/30', icon: 'text-blue-600' },
          { border: 'border-green-200', bg: 'bg-green-50/30', icon: 'text-green-600' },
          { border: 'border-purple-200', bg: 'bg-purple-50/30', icon: 'text-purple-600' },
          { border: 'border-orange-200', bg: 'bg-orange-50/30', icon: 'text-orange-600' }
        ];
        const colorScheme = colors[categoryIndex % colors.length];
        
        return (
          <Card key={categoryName} className={`${colorScheme.border} ${colorScheme.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg font-semibold text-gray-800 flex items-center gap-2`}>
                <TrendingUp className={`h-5 w-5 ${colorScheme.icon}`} />
                {categoryName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid grid-cols-1 ${metrics.length > 2 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                {metrics.map(renderMetricField)}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Notes Section */}
      {questionData?.allowNotes && (
        <Card className="border-gray-200 bg-gray-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              Additional Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-900">
                {questionData.notesPrompt || 'Additional notes:'}
              </Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Provide additional context, insights, or areas for improvement..."
                disabled={disabled}
                className="min-h-[100px] bg-white"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}