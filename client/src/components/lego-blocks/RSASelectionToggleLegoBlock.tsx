import React from 'react';
import { Target, AlertCircle, CheckCircle, Info, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { GovernanceStatus } from '@shared/calculations';

interface RSASelectionToggleLegoBlockProps {
  isActiveForRsa: 'true' | 'false' | null;
  isDashboardVisible: 'true' | 'false' | null;
  activationReason?: string;
  deactivationReason?: string;
  libraryTier?: string;
  onRSAToggle: (active: 'true' | 'false') => void;
  onDashboardToggle: (visible: 'true' | 'false') => void;
  onActivationReasonChange: (reason: string) => void;
  onDeactivationReasonChange?: (reason: string) => void;
  className?: string;
  governanceStatus?: GovernanceStatus;
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
  className = '',
  governanceStatus
}: RSASelectionToggleLegoBlockProps) {
  
  // Check if activation is blocked by governance gates
  const canActivate = governanceStatus?.canActivate ?? true;
  const isGovernanceBlocked = governanceStatus && !governanceStatus.canActivate;
  
  const handleRSAToggle = (checked: boolean) => {
    // Block activation if governance gates not passed
    if (checked && isGovernanceBlocked) {
      return;
    }
    onRSAToggle(checked ? 'true' : 'false');
    // Auto-disable dashboard visibility when RSA is deactivated
    if (!checked && isDashboardVisible === 'true') {
      onDashboardToggle('false');
    }
  };

  const getStatusBadge = () => {
    if (isActiveForRsa === 'true' && isDashboardVisible === 'true') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active & Visible
        </Badge>
      );
    } else if (isActiveForRsa === 'true') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          <Target className="h-3 w-3 mr-1" />
          Hexaware Active
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
      isActiveForRsa === 'true' ? 'border-rsa-blue/30 bg-rsa-blue/5' : 'border-gray-200 bg-gray-50/50'
    } ${className}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rsa-blue/10">
              <Target className="h-5 w-5 text-rsa-blue" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Hexaware Portfolio Selection
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
        {/* Governance Blocked Warning */}
        {isGovernanceBlocked && (
          <Alert className="bg-amber-50 border-amber-200">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <span className="font-medium">Activation blocked:</span> Complete all 3 governance gates before activating this use case.
              {governanceStatus && (
                <ul className="mt-1 text-sm list-disc ml-4">
                  {!governanceStatus.operatingModel.passed && <li>Operating Model ({governanceStatus.operatingModel.progress}%)</li>}
                  {!governanceStatus.intake.passed && <li>Intake & Prioritization ({governanceStatus.intake.progress}%)</li>}
                  {!governanceStatus.rai.passed && <li>Responsible AI ({governanceStatus.rai.progress}%)</li>}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Primary RSA Toggle */}
        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
          isGovernanceBlocked 
            ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' 
            : 'border-gray-300 bg-white hover:border-rsa-blue/50'
        }`}>
          <div className="flex-1">
            <Label htmlFor="rsa-active" className={`text-base font-medium cursor-pointer ${isGovernanceBlocked ? 'text-gray-500' : 'text-gray-900'}`}>
              Include in Hexaware Active Portfolio
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Move this use case from reference library to active portfolio for scoring and evaluation
            </p>
          </div>
          <div className="flex items-center ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                  isGovernanceBlocked
                    ? 'bg-gray-100 border-gray-200 text-gray-400'
                    : isActiveForRsa === 'true'
                      ? 'bg-green-50 border-green-300 text-green-800' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}>
                  <Switch 
                    id="rsa-active"
                    checked={isActiveForRsa === 'true'}
                    onCheckedChange={handleRSAToggle}
                    disabled={isGovernanceBlocked}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 scale-110"
                  />
                </div>
              </TooltipTrigger>
              {isGovernanceBlocked && (
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium text-red-600">Cannot activate</p>
                  <p className="text-sm">Complete all 3 governance gates first</p>
                </TooltipContent>
              )}
            </Tooltip>
            <div className="ml-2 text-xs font-medium">
              <div className={`transition-all duration-200 ${
                isGovernanceBlocked ? 'text-gray-400' : isActiveForRsa === 'true' ? 'text-green-700' : 'text-gray-500'
              }`}>
                {isGovernanceBlocked ? <Lock className="h-3 w-3" /> : isActiveForRsa === 'true' ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Dashboard Controls */}
        {isActiveForRsa === 'true' && (
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
                  isDashboardVisible === 'true'
                    ? 'bg-blue-50 border-blue-300 text-blue-800' 
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}>
                  <Switch 
                    id="dashboard-visible"
                    checked={isDashboardVisible === 'true'}
                    onCheckedChange={(checked) => onDashboardToggle(checked ? 'true' : 'false')}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 scale-105"
                  />
                </div>
                <div className="ml-2 text-xs font-medium">
                  <div className={`transition-all duration-200 ${
                    isDashboardVisible === 'true' ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {isDashboardVisible === 'true' ? 'YES' : 'NO'}
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
                placeholder="Explain why this use case is selected for Hexaware portfolio..."
                value={activationReason}
                onChange={(e) => onActivationReasonChange(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Required for Hexaware portfolio inclusion</span>
                <span>{activationReason.length}/500</span>
              </div>
            </div>

            {/* Validation Alert - Removed to allow free form submission */}
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
                placeholder="Explain why this use case was removed from Hexaware portfolio..."
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
              <p><strong>Hexaware Active:</strong> Included in portfolio analysis and scoring</p>
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
            <p>• Scoring sections become available after Hexaware activation</p>
            <p>• Dashboard visibility requires Hexaware portfolio inclusion</p>
            <p>• Changes are saved automatically when modal is submitted</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}