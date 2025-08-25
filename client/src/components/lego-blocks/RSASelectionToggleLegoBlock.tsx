import React from 'react';
import { Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RSASelectionToggleLegoBlockProps {
  isActiveForRsa: boolean;
  isDashboardVisible: boolean;
  activationReason?: string;
  deactivationReason?: string;
  libraryTier?: string;
  onRSAToggle: (active: boolean) => void;
  onDashboardToggle: (visible: boolean) => void;
  onActivationReasonChange: (reason: string) => void;
  onDeactivationReasonChange?: (reason: string) => void;
  className?: string;
}

/**
 * RSA Selection Toggle LEGO Block
 * 
 * Manages RSA portfolio inclusion with conditional dashboard visibility.
 * Follows LEGO architecture with consistent spacing, validation, and UX patterns.
 * 
 * Features:
 * - Primary RSA portfolio toggle
 * - Conditional dashboard visibility control
 * - Activation reason tracking
 * - Visual status indicators
 * - LEGO-style validation and feedback
 */
export default function RSASelectionToggleLegoBlock({
  isActiveForRsa,
  isDashboardVisible,
  activationReason = '',
  deactivationReason = '',
  libraryTier = 'reference',
  onRSAToggle,
  onDashboardToggle,
  onActivationReasonChange,
  onDeactivationReasonChange,
  className = ''
}: RSASelectionToggleLegoBlockProps) {
  
  const handleRSAToggle = (checked: boolean) => {
    onRSAToggle(checked);
    // Auto-disable dashboard visibility when RSA is deactivated
    if (!checked && isDashboardVisible) {
      onDashboardToggle(false);
    }
  };

  const getStatusBadge = () => {
    if (isActiveForRsa && isDashboardVisible) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active & Visible
        </Badge>
      );
    } else if (isActiveForRsa) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          <Target className="h-3 w-3 mr-1" />
          RSA Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          <Info className="h-3 w-3 mr-1" />
          Reference Library
        </Badge>
      );
    }
  };

  return (
    <Card className={`border-2 transition-all duration-200 ${
      isActiveForRsa ? 'border-rsa-blue/30 bg-rsa-blue/5' : 'border-gray-200 bg-gray-50/50'
    } ${className}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rsa-blue/10">
              <Target className="h-5 w-5 text-rsa-blue" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                RSA Portfolio Selection
              </CardTitle>
              <CardDescription className="text-sm">
                Control active portfolio inclusion and dashboard visibility
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary RSA Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-300 bg-white hover:border-rsa-blue/50 transition-all duration-200">
          <div className="flex-1">
            <Label htmlFor="rsa-active" className="text-base font-medium text-gray-900 cursor-pointer">
              Include in RSA Active Portfolio
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Move this use case from reference library to active portfolio for scoring and evaluation
            </p>
          </div>
          <div className="flex items-center ml-4">
            <div className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
              isActiveForRsa 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-gray-50 border-gray-300 text-gray-600'
            }`}>
              <Switch 
                id="rsa-active"
                checked={isActiveForRsa}
                onCheckedChange={handleRSAToggle}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 scale-110"
              />
            </div>
            <div className="ml-2 text-xs font-medium">
              <div className={`transition-all duration-200 ${
                isActiveForRsa ? 'text-green-700' : 'text-gray-500'
              }`}>
                {isActiveForRsa ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Dashboard Controls */}
        {isActiveForRsa && (
          <div className="ml-6 space-y-4 border-l-3 border-rsa-blue/30 pl-6">
            {/* Dashboard Visibility Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
              <div className="flex-1">
                <Label htmlFor="dashboard-visible" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Show on Dashboard Matrix
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Display this use case in the main dashboard prioritization matrix
                </p>
              </div>
              <div className="flex items-center ml-3">
                <div className={`px-2 py-1 rounded border-2 transition-all duration-200 ${
                  isDashboardVisible 
                    ? 'bg-blue-50 border-blue-300 text-blue-800' 
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}>
                  <Switch 
                    id="dashboard-visible"
                    checked={isDashboardVisible}
                    onCheckedChange={onDashboardToggle}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 scale-105"
                  />
                </div>
                <div className="ml-2 text-xs font-medium">
                  <div className={`transition-all duration-200 ${
                    isDashboardVisible ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {isDashboardVisible ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Reason */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Activation Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                placeholder="Explain why this use case is selected for RSA portfolio..."
                value={activationReason}
                onChange={(e) => onActivationReasonChange(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Required for RSA portfolio inclusion</span>
                <span>{activationReason.length}/500</span>
              </div>
            </div>

            {/* Validation Alert */}
            {isActiveForRsa && activationReason.trim().length < 10 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Please provide a detailed reason for including this use case in the RSA portfolio.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Deactivation Reason - Only show when RSA is inactive */}
        {!isActiveForRsa && onDeactivationReasonChange && (
          <div className="ml-6 space-y-4 border-l-3 border-gray-300 pl-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Deactivation Reason
              </Label>
              <Textarea 
                placeholder="Explain why this use case was removed from RSA portfolio..."
                value={deactivationReason}
                onChange={(e) => onDeactivationReasonChange!(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Optional - explains portfolio removal</span>
                <span>{deactivationReason.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Reference Library:</strong> Available for browsing and selection</p>
              <p><strong>RSA Active:</strong> Included in portfolio analysis and scoring</p>
              <p><strong>Dashboard Visible:</strong> Shown in prioritization matrix</p>
            </div>
          </div>
        </div>

        {/* Additional Context Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Additional Context
          </Label>
          <div className="text-xs text-gray-600 space-y-1 p-3 bg-gray-50 rounded-lg">
            <p>• Use cases start in Reference Library by default</p>
            <p>• Scoring sections become available after RSA activation</p>
            <p>• Dashboard visibility requires RSA portfolio inclusion</p>
            <p>• Changes are saved automatically when modal is submitted</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}