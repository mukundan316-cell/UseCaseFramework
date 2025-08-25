import React from 'react';
import { Edit, Trash2, Library, Plus, Settings, Building2, Tag, AlertTriangle, Users, ExternalLink } from 'lucide-react';
import { UseCase } from '../../types';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../../utils/calculations';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant, hasManualOverrides } from '@shared/utils/scoreOverride';
import { getSourceConfig, getSourceBackgroundTint } from '../../utils/sourceColors';

interface CleanUseCaseCardProps {
  useCase: UseCase;
  showScores?: boolean;
  onEdit?: (useCase: UseCase) => void;
  onDelete?: (useCase: UseCase) => void;
  onMoveToLibrary?: (useCase: UseCase) => void;
  showRSAActions?: boolean;
}

export default function CleanUseCaseCard({
  useCase,
  showScores = false,
  onEdit,
  onDelete,
  onMoveToLibrary,
  showRSAActions = false
}: CleanUseCaseCardProps) {
  
  // Get quadrant-based styling for RSA cases with scores
  const hasScores = showScores && useCase.impactScore !== undefined && useCase.effortScore !== undefined;
  
  // Get effective scores (manual overrides take precedence)
  const effectiveImpact = hasScores ? getEffectiveImpactScore(useCase as any) : undefined;
  const effectiveEffort = hasScores ? getEffectiveEffortScore(useCase as any) : undefined;
  const effectiveQuadrant = hasScores ? getEffectiveQuadrant(useCase as any) : '';
  const hasOverrides = hasManualOverrides(useCase as any);
  const quadrantBorder = hasScores ? getQuadrantColor(effectiveQuadrant as any) : '#3b82f6';
  
  // Map quadrant to Tailwind background classes
  const getQuadrantBgClass = (quadrant: string) => {
    switch (quadrant) {
      case "Quick Win": return 'bg-green-50';
      case "Strategic Bet": return 'bg-blue-50';
      case "Experimental": return 'bg-yellow-50';
      case "Watchlist": return 'bg-red-50';
      default: return 'bg-white';
    }
  };
  
  // Get source-based styling
  const sourceConfig = getSourceConfig(useCase.librarySource || 'rsa_internal');
  const sourceBgTint = getSourceBackgroundTint(useCase.librarySource || 'rsa_internal');
  
  // Combine quadrant and source styling
  const bgClass = hasScores 
    ? `${getQuadrantBgClass(effectiveQuadrant)} ${sourceBgTint}` 
    : sourceBgTint;
  
  // Use source color for border if no quadrant scores available
  const borderColor = hasScores ? quadrantBorder : sourceConfig.borderColor;
  
  return (
    <div 
      className={`border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 ${bgClass}`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="p-5">
        {/* Source Badge */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {useCase.title}
            </h3>
            <div className="ml-2 flex items-center">
              <span 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: sourceConfig.badgeBackground, 
                  color: sourceConfig.badgeColor 
                }}
              >
                {(useCase.librarySource || 'rsa_internal') === 'rsa_internal' ? (
                  <Building2 className="w-3 h-3 mr-1" />
                ) : (useCase.librarySource || 'rsa_internal') === 'hexaware_external' ? (
                  <ExternalLink className="w-3 h-3 mr-1" />
                ) : (
                  <Users className="w-3 h-3 mr-1" />
                )}
                {sourceConfig.label}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {useCase.description}
          </p>
        </div>

        {/* Conditional Context Display - AI Inventory vs Strategic Use Cases */}
        <div className="space-y-1.5 mb-3">
          {useCase.librarySource === 'sharepoint_import' ? (
            // AI Inventory Governance Information (Purple theme)
            <>
              {/* AI/Model Classification */}
              {(useCase as any).aiOrModel && (
                <div className="flex items-center text-xs text-purple-700">
                  <Tag className="w-3 h-3 mr-1.5 text-purple-600" />
                  <span className="font-medium">{(useCase as any).aiOrModel} System</span>
                </div>
              )}
              
              {/* Model Owner */}
              {(useCase as any).modelOwner && (
                <div className="flex items-center text-xs text-indigo-700">
                  <Users className="w-3 h-3 mr-1.5 text-indigo-600" />
                  <span className="font-medium">Owner: {(useCase as any).modelOwner}</span>
                </div>
              )}

              {/* Risk Level Indicator */}
              {((useCase as any).riskToCustomers || (useCase as any).riskToRsa) && (
                <div className="flex items-center text-xs text-amber-700">
                  <AlertTriangle className="w-3 h-3 mr-1.5 text-amber-600" />
                  <span className="font-medium">Risk Assessment Available</span>
                </div>
              )}

              {/* Validation Responsibility */}
              {(useCase as any).validationResponsibility && (
                <div className="flex items-center text-xs text-violet-700">
                  <Settings className="w-3 h-3 mr-1.5 text-violet-600" />
                  <span className="font-medium">{(useCase as any).validationResponsibility} Validation</span>
                </div>
              )}

              {/* Third Party Indicator */}
              {(useCase as any).thirdPartyModel === 'yes' && (
                <div className="flex items-center text-xs text-orange-700">
                  <ExternalLink className="w-3 h-3 mr-1.5 text-orange-600" />
                  <span className="font-medium">Third Party Model</span>
                </div>
              )}
            </>
          ) : (
            // Strategic Use Case Business Context (Original theme)
            <>
              <div className="flex items-center text-xs text-blue-700">
                <Settings className="w-3 h-3 mr-1.5 text-blue-600" />
                <span className="font-medium">{useCase.process}</span>
              </div>
              <div className="flex items-center text-xs text-purple-700">
                <Building2 className="w-3 h-3 mr-1.5 text-purple-600" />
                <span className="font-medium">{useCase.lineOfBusiness}</span>
              </div>
              <div className="flex items-center text-xs text-orange-700">
                <Tag className="w-3 h-3 mr-1.5 text-orange-600" />
                <span className="font-medium">{useCase.useCaseType}</span>
              </div>
            </>
          )}
        </div>

        {/* Scores Display - Only for Strategic Use Cases (not AI inventory) with RSA Active Portfolio */}
        {hasScores && effectiveImpact !== undefined && effectiveEffort !== undefined && useCase.librarySource !== 'sharepoint_import' && (
          <div className="mb-4">
            {/* Quadrant Badge with Override Indicator */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: quadrantBorder, 
                    color: 'white' 
                  }}
                >
                  {effectiveQuadrant || 'Unassigned'}
                </span>
                {hasOverrides && (
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                )}
              </div>
            </div>
            
            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {effectiveImpact.toFixed(1)}
                </div>
                <div className="text-xs text-green-600">
                  Impact {hasOverrides && useCase.manualImpactScore && '(Manual)'}
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">
                  {effectiveEffort.toFixed(1)}
                </div>
                <div className="text-xs text-blue-600">
                  Effort {hasOverrides && useCase.manualEffortScore && '(Manual)'}
                </div>
              </div>
            </div>
            
            {/* Override Reason Display */}
            {hasOverrides && useCase.overrideReason && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                <div className="font-medium text-orange-800">Override Reason:</div>
                <div className="text-orange-700">{useCase.overrideReason}</div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={() => onEdit?.(useCase)}
              className="inline-flex items-center px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border-none bg-transparent transition-colors"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(useCase)}
              className="inline-flex items-center px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded border-none bg-transparent transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>
          
          {showRSAActions && (
            <button
              onClick={() => onMoveToLibrary?.(useCase)}
              className="inline-flex items-center px-2 py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded border-none bg-transparent transition-colors"
            >
              <Library className="h-3 w-3 mr-1" />
              Move to Library
            </button>
          )}
        </div>
      </div>
    </div>
  );
}