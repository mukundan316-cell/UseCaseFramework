import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Clock, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessPerformanceData {
  combinedRatio?: number;
  expenseRatio?: number;
  lossRatio?: number;
  premiumGrowthRate?: number;
  policyRetentionRate?: number;
  avgProcessingTime?: number;
  claimsSettlementTime?: number;
  customerSatisfactionScore?: number;
  areasNeedingImprovement?: string;
}

interface BusinessPerformanceLegoBlockProps {
  questionData?: {
    placeholder?: string;
    helpText?: string;
  };
  value?: BusinessPerformanceData;
  onChange: (value: BusinessPerformanceData) => void;
  disabled?: boolean;
  error?: string;
}

export default function BusinessPerformanceLegoBlock({
  questionData = {},
  value = {},
  onChange,
  disabled = false,
  error
}: BusinessPerformanceLegoBlockProps) {
  const [formData, setFormData] = useState<BusinessPerformanceData>(value);
  
  useEffect(() => {
    setFormData(value);
  }, [value]);

  const handleChange = (field: keyof BusinessPerformanceData, fieldValue: string) => {
    const numericFields = [
      'combinedRatio', 'expenseRatio', 'lossRatio', 'premiumGrowthRate', 
      'policyRetentionRate', 'avgProcessingTime', 'claimsSettlementTime', 
      'customerSatisfactionScore'
    ];
    
    let processedValue: any = fieldValue;
    
    // Convert to number for numeric fields, allow empty strings
    if (numericFields.includes(field) && fieldValue !== '') {
      const parsed = parseFloat(fieldValue);
      processedValue = isNaN(parsed) ? undefined : parsed;
    } else if (numericFields.includes(field) && fieldValue === '') {
      processedValue = undefined;
    }
    
    const newData = { ...formData, [field]: processedValue };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {/* Financial Ratios Section */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Financial Performance Ratios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combinedRatio" className="text-sm font-medium text-gray-700">
                Combined Ratio
              </Label>
              <div className="relative">
                <Input
                  id="combinedRatio"
                  type="text"
                  value={formData.combinedRatio !== undefined ? formData.combinedRatio.toString() : ''}
                  onChange={(e) => handleChange('combinedRatio', e.target.value)}
                  placeholder="e.g., 0.95"
                  disabled={disabled}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ratio
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expenseRatio" className="text-sm font-medium text-gray-700">
                Expense Ratio
              </Label>
              <div className="relative">
                <Input
                  id="expenseRatio"
                  type="text"
                  value={formData.expenseRatio !== undefined ? formData.expenseRatio.toString() : ''}
                  onChange={(e) => handleChange('expenseRatio', e.target.value)}
                  placeholder="e.g., 0.30"
                  disabled={disabled}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ratio
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lossRatio" className="text-sm font-medium text-gray-700">
                Loss Ratio
              </Label>
              <div className="relative">
                <Input
                  id="lossRatio"
                  type="text"
                  value={formData.lossRatio !== undefined ? formData.lossRatio.toString() : ''}
                  onChange={(e) => handleChange('lossRatio', e.target.value)}
                  placeholder="e.g., 0.65"
                  disabled={disabled}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  ratio
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth & Retention Metrics */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Growth & Customer Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premiumGrowthRate" className="text-sm font-medium text-gray-700">
                Premium Growth Rate (YoY)
              </Label>
              <div className="relative">
                <Input
                  id="premiumGrowthRate"
                  type="text"
                  value={formData.premiumGrowthRate !== undefined ? formData.premiumGrowthRate.toString() : ''}
                  onChange={(e) => handleChange('premiumGrowthRate', e.target.value)}
                  placeholder="e.g., 8.5"
                  disabled={disabled}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policyRetentionRate" className="text-sm font-medium text-gray-700">
                Policy Retention Rate
              </Label>
              <div className="relative">
                <Input
                  id="policyRetentionRate"
                  type="text"
                  value={formData.policyRetentionRate !== undefined ? formData.policyRetentionRate.toString() : ''}
                  onChange={(e) => handleChange('policyRetentionRate', e.target.value)}
                  placeholder="e.g., 92.5"
                  disabled={disabled}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Efficiency */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Operational Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgProcessingTime" className="text-sm font-medium text-gray-700">
                Average Policy Processing Time
              </Label>
              <div className="relative">
                <Input
                  id="avgProcessingTime"
                  type="text"
                  value={formData.avgProcessingTime !== undefined ? formData.avgProcessingTime.toString() : ''}
                  onChange={(e) => handleChange('avgProcessingTime', e.target.value)}
                  placeholder="e.g., 5"
                  disabled={disabled}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  days
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimsSettlementTime" className="text-sm font-medium text-gray-700">
                Claims Settlement Time
              </Label>
              <div className="relative">
                <Input
                  id="claimsSettlementTime"
                  type="text"
                  value={formData.claimsSettlementTime !== undefined ? formData.claimsSettlementTime.toString() : ''}
                  onChange={(e) => handleChange('claimsSettlementTime', e.target.value)}
                  placeholder="e.g., 15"
                  disabled={disabled}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Customer Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerSatisfactionScore" className="text-sm font-medium text-gray-700">
              Customer Satisfaction Score
            </Label>
            <div className="relative w-full md:w-1/2">
              <Input
                id="customerSatisfactionScore"
                type="text"
                value={formData.customerSatisfactionScore !== undefined ? formData.customerSatisfactionScore.toString() : ''}
                onChange={(e) => handleChange('customerSatisfactionScore', e.target.value)}
                placeholder="e.g., 8.5"
                disabled={disabled}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                /10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Areas Needing Improvement */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Areas Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="areasNeedingImprovement" className="text-sm font-medium text-gray-700">
              Please describe specific areas where your organization needs improvement
            </Label>
            <Textarea
              id="areasNeedingImprovement"
              value={formData.areasNeedingImprovement || ''}
              onChange={(e) => handleChange('areasNeedingImprovement', e.target.value)}
              placeholder="e.g., Claims processing efficiency, customer onboarding experience, digital transformation initiatives, risk assessment accuracy..."
              disabled={disabled}
              rows={4}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

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

// Export utils for external use
export const businessPerformanceUtils = {
  validateData: (data: BusinessPerformanceData): string | null => {
    // Optional validation - can be enhanced as needed
    return null;
  },
  
  formatForDisplay: (data: BusinessPerformanceData): Record<string, string> => {
    const formatted: Record<string, string> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'number') {
          if (key.includes('Ratio')) {
            formatted[key] = value.toFixed(2);
          } else if (key.includes('Rate') || key.includes('Score')) {
            formatted[key] = value.toString();
          } else if (key.includes('Time')) {
            formatted[key] = `${value} days`;
          } else {
            formatted[key] = value.toString();
          }
        } else {
          formatted[key] = value.toString();
        }
      }
    });
    
    return formatted;
  }
};