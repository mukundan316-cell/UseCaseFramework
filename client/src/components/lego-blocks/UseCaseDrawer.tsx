import React from 'react';
import { X, Edit, FileText, Building2, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UseCase } from '../../types';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant } from '@shared/utils/scoreOverride';
import { getSourceConfig } from '../../utils/sourceColors';
import ExportButton from './ExportButton';

interface UseCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  useCase: UseCase | null;
}

export default function UseCaseDrawer({ isOpen, onClose, onEdit, useCase }: UseCaseDrawerProps) {
  if (!useCase) return null;

  // Get effective scores (manual overrides take precedence)
  const effectiveImpact = getEffectiveImpactScore(useCase as any);
  const effectiveEffort = getEffectiveEffortScore(useCase as any);
  const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
  const hasScores = effectiveImpact !== undefined && effectiveEffort !== undefined;

  // Get source configuration for badge colors
  const sourceConfig = getSourceConfig(useCase.librarySource || 'rsa_internal');

  // Get source badge info
  const getSourceBadge = () => {
    const source = useCase.librarySource || 'rsa_internal';
    let icon = <Building2 className="w-3 h-3 mr-1" />;
    let label = 'RSA Internal';
    let bgColor = '#2563eb';
    let textColor = '#ffffff';

    switch (source) {
      case 'rsa_internal':
        icon = <Building2 className="w-3 h-3 mr-1" />;
        label = 'RSA Internal';
        bgColor = '#2563eb';
        textColor = '#ffffff';
        break;
      case 'industry_standard':
        icon = <Users className="w-3 h-3 mr-1" />;
        label = 'Industry Standard';
        bgColor = '#16a34a';
        textColor = '#ffffff';
        break;
      case 'ai_inventory':
        icon = <ExternalLink className="w-3 h-3 mr-1" />;
        label = 'AI Inventory';
        bgColor = '#9333ea';
        textColor = '#ffffff';
        break;
      default:
        break;
    }

    return { icon, label, bgColor, textColor };
  };

  // Get quadrant badge color
  const getQuadrantBadgeColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Win':
        return { bgColor: '#16a34a', textColor: '#ffffff' };
      case 'Strategic Bet':
        return { bgColor: '#2563eb', textColor: '#ffffff' };
      case 'Experimental':
        return { bgColor: '#ca8a04', textColor: '#ffffff' };
      case 'Watchlist':
        return { bgColor: '#dc2626', textColor: '#ffffff' };
      default:
        return { bgColor: '#6b7280', textColor: '#ffffff' };
    }
  };

  const sourceBadge = getSourceBadge();
  const quadrantBadge = effectiveQuadrant ? getQuadrantBadgeColor(effectiveQuadrant) : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full md:w-[65%]`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Source Badge */}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: sourceBadge.bgColor,
                    color: sourceBadge.textColor
                  }}
                >
                  {sourceBadge.icon}
                  {sourceBadge.label}
                </span>

                {/* Quadrant Badge - Only for strategic cases */}
                {quadrantBadge && effectiveQuadrant && ['Strategic Bet', 'Watchlist', 'Experimental'].includes(effectiveQuadrant) && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: quadrantBadge.bgColor,
                      color: quadrantBadge.textColor
                    }}
                  >
                    {effectiveQuadrant}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {useCase.title}
              </h2>

              {/* Subtitle with Impact/Effort for strategic cases */}
              {hasScores && ['Strategic Bet', 'Watchlist', 'Experimental', 'Quick Win'].includes(effectiveQuadrant) && (
                <p className="text-sm text-gray-600">
                  Impact: {effectiveImpact?.toFixed(1)} | Effort: {effectiveEffort?.toFixed(1)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}

              <ExportButton
                exportType="use-case"
                exportId={useCase.id}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-1" />
                Export PDF
              </ExportButton>

              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{useCase.description}</p>
            </div>

            {/* Problem Statement */}
            {useCase.problemStatement && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                <p className="text-gray-700 leading-relaxed">{useCase.problemStatement}</p>
              </div>
            )}

            {/* Business Context */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Process</div>
                  <div className="text-gray-900">{useCase.process}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Line of Business</div>
                  <div className="text-gray-900">{useCase.lineOfBusiness}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Business Segment</div>
                  <div className="text-gray-900">{useCase.businessSegment}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Geography</div>
                  <div className="text-gray-900">{useCase.geography}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Use Case Type</div>
                  <div className="text-gray-900">{useCase.useCaseType}</div>
                </div>
              </div>
            </div>

            {/* Scoring Information - Only for cases with scores */}
            {hasScores && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Impact Levers */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Impact Levers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue Impact</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.revenueImpact}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost Savings</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.costSavings}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risk Reduction</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.riskReduction}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Broker/Partner Experience</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.brokerPartnerExperience}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Strategic Fit</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.strategicFit}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Effort Levers */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Effort Levers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Data Readiness</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.dataReadiness}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Technical Complexity</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.technicalComplexity}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Change Impact</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.changeImpact}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Model Risk</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.modelRisk}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Adoption Readiness</span>
                        <span className="text-sm font-medium text-gray-900">{useCase.adoptionReadiness}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculated Scores */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Overall Impact</div>
                      <div className="text-2xl font-bold text-blue-600">{effectiveImpact?.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Overall Effort</div>
                      <div className="text-2xl font-bold text-orange-600">{effectiveEffort?.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Quadrant</div>
                      <div 
                        className="text-sm font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: quadrantBadge?.bgColor || '#6b7280',
                          color: quadrantBadge?.textColor || '#ffffff'
                        }}
                      >
                        {effectiveQuadrant}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Implementation & Governance - Show if available */}
            {(useCase as any).primaryBusinessOwner && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation & Governance</h3>
                <div className="space-y-3">
                  {(useCase as any).primaryBusinessOwner && (
                    <div>
                      <div className="text-sm font-medium text-gray-600">Primary Business Owner</div>
                      <div className="text-gray-900">{(useCase as any).primaryBusinessOwner}</div>
                    </div>
                  )}
                  {(useCase as any).useCaseStatus && (
                    <div>
                      <div className="text-sm font-medium text-gray-600">Status</div>
                      <div className="text-gray-900">{(useCase as any).useCaseStatus}</div>
                    </div>
                  )}
                  {(useCase as any).implementationTimeline && (
                    <div>
                      <div className="text-sm font-medium text-gray-600">Implementation Timeline</div>
                      <div className="text-gray-900">{(useCase as any).implementationTimeline}</div>
                    </div>
                  )}
                  {(useCase as any).estimatedValue && (
                    <div>
                      <div className="text-sm font-medium text-gray-600">Estimated Value</div>
                      <div className="text-gray-900">{(useCase as any).estimatedValue}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}