import React from 'react';
import { Edit, Trash2, Library, Plus, Settings, Building2, Tag, AlertTriangle, Users, ExternalLink, Eye, FolderOpen, Circle } from 'lucide-react';
import { UseCase } from '../../types';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../../utils/calculations';
import { getEffectiveImpactScore, getEffectiveEffortScore, getEffectiveQuadrant, hasManualOverrides } from '@shared/utils/scoreOverride';
import { getSourceConfig, getSourceBackgroundTint } from '../../utils/sourceColors';
import { APP_CONFIG } from '@shared/constants/app-config';

interface CleanUseCaseCardProps {
  useCase: UseCase;
  showScores?: boolean;
  onEdit?: (useCase: UseCase) => void;
  onDelete?: (useCase: UseCase) => void;
  onMoveToLibrary?: (useCase: UseCase) => void;
  onView?: (useCase: UseCase) => void;
  showRSAActions?: boolean;
}

export default function CleanUseCaseCard({
  useCase,
  showScores = false,
  onEdit,
  onDelete,
  onMoveToLibrary,
  onView,
  showRSAActions = false
}: CleanUseCaseCardProps) {
  
  // Get quadrant-based styling for RSA cases with scores
  // Using consistent string types per replit.md - no transformation needed
  const isActiveForRsa = useCase.isActiveForRsa === 'true';
  const hasScores = showScores && useCase.impactScore !== undefined && useCase.effortScore !== undefined && isActiveForRsa;
  
  // Get effective scores (manual overrides take precedence)
  const effectiveImpact = hasScores ? getEffectiveImpactScore(useCase as any) : undefined;
  const effectiveEffort = hasScores ? getEffectiveEffortScore(useCase as any) : undefined;
  
  // DEBUG logging removed after fixing root cause
  const effectiveQuadrant = hasScores ? getEffectiveQuadrant(useCase as any) : '';
  const hasOverrides = hasManualOverrides(useCase as any);
  const quadrantBorder = hasScores ? getQuadrantColor(effectiveQuadrant as any) : APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.BORDERS.DEFAULT;
  
  // Map quadrant to Tailwind background classes using centralized config
  const getQuadrantBgClass = (quadrant: string) => {
    switch (quadrant) {
      case "Quick Win": return APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANT_BACKGROUNDS.QUICK_WIN;
      case "Strategic Bet": return APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANT_BACKGROUNDS.STRATEGIC_BET;
      case "Experimental": return APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANT_BACKGROUNDS.EXPERIMENTAL;
      case "Watchlist": return APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANT_BACKGROUNDS.WATCHLIST;
      default: return APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.QUADRANT_BACKGROUNDS.DEFAULT;
    }
  };
  
  // Get source-based styling
  const sourceConfig = getSourceConfig(useCase.librarySource || 'internal');
  const sourceBgTint = getSourceBackgroundTint(useCase.librarySource || 'internal');
  
  // Combine quadrant and source styling
  const bgClass = hasScores 
    ? `${getQuadrantBgClass(effectiveQuadrant)} ${sourceBgTint}` 
    : sourceBgTint;
  
  // Use centralized border colors for AI Inventory, source color for others
  const borderColor = hasScores ? quadrantBorder : 
    useCase.librarySource === 'ai_inventory' ? APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.BORDERS.AI_INVENTORY : sourceConfig.borderColor;

  // Helper function to get status pill styling using centralized config
  const getStatusPillStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.ACTIVE, 
          color: 'white',
          icon: Circle
        };
      case 'Proof_of_Concept':
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.PROOF_OF_CONCEPT, 
          color: 'white',
          icon: Circle
        };
      case 'Pending_Closure':
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.PENDING_CLOSURE, 
          color: 'white',
          icon: Circle
        };
      case 'Obsolete':
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.OBSOLETE, 
          color: 'white',
          icon: Circle
        };
      case 'Inactive':
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.INACTIVE, 
          color: 'white',
          icon: Circle
        };
      default:
        return { 
          background: APP_CONFIG.EXECUTIVE_DASHBOARD.COLORS.AI_INVENTORY_STATUS.DEFAULT, 
          color: '#374151',
          icon: Circle
        };
    }
  };
  
  return (
    <div 
      className={`border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer ${bgClass}`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={() => onView?.(useCase)}
      data-testid="card-usecase"
    >
      <div className="p-5">
        {/* Source Badge */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              {useCase.meaningfulId && (
                <div className="text-xs font-mono text-rsa-blue bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                  {useCase.meaningfulId}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {useCase.title}
              </h3>
            </div>
            <div className="ml-2 flex items-center gap-2">
              {/* Source Badge */}
              <span 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: useCase.librarySource === 'ai_inventory' ? '#f3f4f6' : sourceConfig.badgeBackground, 
                  color: useCase.librarySource === 'ai_inventory' ? '#374151' : sourceConfig.badgeColor 
                }}
              >
                {useCase.librarySource === 'ai_inventory' ? (
                  <FolderOpen className="w-3 h-3 mr-1" />
                ) : (useCase.librarySource === 'internal' || useCase.librarySource === 'rsa_internal') ? (
                  <Building2 className="w-3 h-3 mr-1" />
                ) : (
                  <Users className="w-3 h-3 mr-1" />
                )}
                {useCase.librarySource === 'ai_inventory' ? 'INVENTORY' : sourceConfig.label}
              </span>
              
              {/* AI Inventory Status Pills */}
              {useCase.librarySource === 'ai_inventory' && (useCase as any).aiInventoryStatus && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={getStatusPillStyle((useCase as any).aiInventoryStatus)}
                  title={`Status: ${(useCase as any).aiInventoryStatus.replace('_', ' ')}`}
                >
                  <Circle className="w-2 h-2 mr-1 fill-current" />
                  {(useCase as any).aiInventoryStatus.replace('_', ' ')}
                </span>
              )}
              
              {/* Deployment Status Pill */}
              {useCase.librarySource === 'ai_inventory' && (useCase as any).deploymentStatus && (
                <span 
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs border"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    borderColor: '#d1d5db',
                    color: '#374151'
                  }}
                  title={`Deployment: ${(useCase as any).deploymentStatus}`}
                >
                  {(useCase as any).deploymentStatus}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 break-words overflow-hidden">
            {useCase.description}
          </p>
        </div>

        {/* Conditional Context Display - AI Inventory vs Strategic Use Cases */}
        <div className="space-y-1.5 mb-3">
          {useCase.librarySource === 'ai_inventory' ? (
            // AI Inventory Governance Information (Purple theme)
            <>
              {/* AI/Model Classification & Status */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {(useCase as any).aiOrModel && (
                  <div className="flex items-center text-xs text-purple-700">
                    <Tag className="w-3 h-3 mr-1.5 text-purple-600" />
                    <span className="font-medium">{(useCase as any).aiOrModel} System</span>
                  </div>
                )}
                {(useCase as any).useCaseStatus && (
                  <div className="flex items-center text-xs text-slate-700">
                    <Settings className="w-3 h-3 mr-1.5 text-slate-600" />
                    <span className="font-medium">{(useCase as any).useCaseStatus}</span>
                  </div>
                )}
              </div>
              
              {/* Process & Business Context */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {useCase.process && (
                  <div className="flex items-center text-xs text-blue-700">
                    <Building2 className="w-3 h-3 mr-1.5 text-blue-600" />
                    <span className="font-medium">{useCase.process}</span>
                  </div>
                )}
                {useCase.lineOfBusiness && (
                  <div className="flex items-center text-xs text-indigo-700">
                    <Tag className="w-3 h-3 mr-1.5 text-indigo-600" />
                    <span className="font-medium">{useCase.lineOfBusiness}</span>
                  </div>
                )}
              </div>

              {/* Model Owner & Data Used */}
              {(useCase as any).modelOwner && (
                <div className="flex items-center text-xs text-violet-700 mb-1">
                  <Users className="w-3 h-3 mr-1.5 text-violet-600" />
                  <span className="font-medium break-words">Owner: {(useCase as any).modelOwner}</span>
                </div>
              )}
              {(useCase as any).dataUsed && (
                <div className="flex items-center text-xs text-teal-700 mb-1">
                  <Tag className="w-3 h-3 mr-1.5 text-teal-600" />
                  <span className="font-medium break-words">Data: {(useCase as any).dataUsed}</span>
                </div>
              )}

              {/* Risk Assessment */}
              {((useCase as any).riskToCustomers || (useCase as any).riskToRsa) && (
                <div className="bg-amber-50 p-2 rounded border border-amber-200 mb-2">
                  <div className="flex items-center text-xs text-amber-800 mb-1">
                    <AlertTriangle className="w-3 h-3 mr-1.5 text-amber-600" />
                    <span className="font-semibold">Risk Assessment</span>
                  </div>
                  {(useCase as any).riskToCustomers && (
                    <div className="text-xs text-amber-700 mb-1 break-words">
                      <span className="font-medium">Customer:</span> {(useCase as any).riskToCustomers}
                    </div>
                  )}
                  {(useCase as any).riskToRsa && (
                    <div className="text-xs text-amber-700 break-words">
                      <span className="font-medium">Hexaware:</span> {(useCase as any).riskToRsa}
                    </div>
                  )}
                </div>
              )}

              {/* Governance & Compliance */}
              <div className="grid grid-cols-2 gap-3">
                {(useCase as any).rsaPolicyGovernance && (
                  <div className="flex items-center text-xs text-purple-700">
                    <Settings className="w-3 h-3 mr-1.5 text-purple-600" />
                    <span className="font-medium break-words">Policy: {(useCase as any).rsaPolicyGovernance}</span>
                  </div>
                )}
                {(useCase as any).thirdPartyModel && (
                  <div className="flex items-center text-xs text-orange-700">
                    <ExternalLink className="w-3 h-3 mr-1.5 text-orange-600" />
                    <span className="font-medium">3rd Party: {(useCase as any).thirdPartyModel}</span>
                  </div>
                )}
              </div>

              {/* Validation & Contact */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(useCase as any).validationResponsibility && (
                  <div className="flex items-center text-xs text-violet-700">
                    <Settings className="w-3 h-3 mr-1.5 text-violet-600" />
                    <span className="font-medium">{(useCase as any).validationResponsibility} Validation</span>
                  </div>
                )}
                {(useCase as any).informedBy && (
                  <div className="flex items-center text-xs text-gray-700">
                    <Users className="w-3 h-3 mr-1.5 text-gray-600" />
                    <span className="font-medium">{(useCase as any).informedBy}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Strategic Use Case Business Context (Enhanced with more fields)
            <>
              {/* Primary Business Context */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {useCase.process && (
                  <div className="flex items-center text-xs text-blue-700">
                    <Settings className="w-3 h-3 mr-1.5 text-blue-600" />
                    <span className="font-medium">{useCase.process}</span>
                  </div>
                )}
                {useCase.useCaseType && (
                  <div className="flex items-center text-xs text-orange-700">
                    <Tag className="w-3 h-3 mr-1.5 text-orange-600" />
                    <span className="font-medium">{useCase.useCaseType}</span>
                  </div>
                )}
              </div>

              {/* Business Segments */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {useCase.lineOfBusiness && (
                  <div className="flex items-center text-xs text-purple-700">
                    <Building2 className="w-3 h-3 mr-1.5 text-purple-600" />
                    <span className="font-medium">{useCase.lineOfBusiness}</span>
                  </div>
                )}
                {useCase.businessSegment && (
                  <div className="flex items-center text-xs text-indigo-700">
                    <Tag className="w-3 h-3 mr-1.5 text-indigo-600" />
                    <span className="font-medium">{useCase.businessSegment}</span>
                  </div>
                )}
              </div>

              {/* Geography & Primary Owner */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {useCase.geography && (
                  <div className="flex items-center text-xs text-green-700">
                    <Building2 className="w-3 h-3 mr-1.5 text-green-600" />
                    <span className="font-medium">{useCase.geography}</span>
                  </div>
                )}
                {(useCase as any).primaryBusinessOwner && (
                  <div className="flex items-center text-xs text-violet-700">
                    <Users className="w-3 h-3 mr-1.5 text-violet-600" />
                    <span className="font-medium">{(useCase as any).primaryBusinessOwner}</span>
                  </div>
                )}
              </div>

              {/* Implementation Status */}
              {(useCase as any).useCaseStatus && (
                <div className="flex items-center text-xs text-slate-700 mt-2">
                  <Settings className="w-3 h-3 mr-1.5 text-slate-600" />
                  <span className="font-medium">Status: {(useCase as any).useCaseStatus}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scores Display - Only for Strategic Use Cases (not AI inventory) with Hexaware Active Portfolio */}
        {hasScores && effectiveImpact !== undefined && effectiveEffort !== undefined && useCase.librarySource !== 'ai_inventory' && (
          <div className="mb-4">
            {/* Quadrant Badge with Override Indicator */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <span 
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${quadrantBorder} 0%, ${quadrantBorder}CC 100%)`,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
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
              <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200 shadow-sm">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  {effectiveImpact.toFixed(1)}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Impact {hasOverrides && useCase.manualImpactScore && '(Manual)'}
                </div>
              </div>
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 shadow-sm">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  {effectiveEffort.toFixed(1)}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  Effort {hasOverrides && useCase.manualEffortScore && '(Manual)'}
                </div>
              </div>
            </div>
            
            {/* T-shirt Sizing Display */}
            {(useCase as any).tShirtSize && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                    </svg>
                    Project Sizing
                  </span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="inline-block px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: (useCase as any).tShirtSize === 'XS' ? '#10B981' : 
                                                 (useCase as any).tShirtSize === 'S' ? '#3B82F6' : 
                                                 (useCase as any).tShirtSize === 'M' ? '#F59E0B' : 
                                                 (useCase as any).tShirtSize === 'L' ? '#EF4444' : 
                                                 (useCase as any).tShirtSize === 'XL' ? '#8B5CF6' : '#6B7280' }}
                    >
                      {(useCase as any).tShirtSize}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-purple-600">
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {(useCase as any).estimatedWeeksMin && (useCase as any).estimatedWeeksMax ? 
                      `${(useCase as any).estimatedWeeksMin}-${(useCase as any).estimatedWeeksMax} weeks` : 
                      'Timeline TBD'
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
                    </svg>
                    {(useCase as any).estimatedCostMin && (useCase as any).estimatedCostMax ? 
                      `£${((useCase as any).estimatedCostMin / 1000).toFixed(0)}k-£${((useCase as any).estimatedCostMax / 1000).toFixed(0)}k` : 
                      'Cost TBD'
                    }
                  </div>
                </div>
              </div>
            )}
            
            {/* ROI Explanation */}
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700">ROI Assessment</span>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    effectiveQuadrant === 'Quick Win' || effectiveQuadrant === 'Strategic Bet' 
                      ? 'bg-green-100 text-green-800'
                      : effectiveQuadrant === 'Experimental'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(() => {
                      const roiLevel = effectiveQuadrant === 'Quick Win' || effectiveQuadrant === 'Strategic Bet' ? 'High ROI' :
                                     effectiveQuadrant === 'Experimental' ? 'Medium ROI' : 'Poor ROI';
                      return roiLevel;
                    })()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600">
                {effectiveQuadrant === 'Quick Win' && 
                  'High business value with manageable effort - excellent return potential with quick payback.'}
                {effectiveQuadrant === 'Strategic Bet' && 
                  'Significant long-term value justifies higher investment - strong ROI over extended timeframe.'}
                {effectiveQuadrant === 'Experimental' && 
                  'Lower impact but manageable cost - suitable for learning and capability building.'}
                {effectiveQuadrant === 'Watchlist' && 
                  'Low value relative to effort required - consider redesigning or deferring this initiative.'}
              </p>
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
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onEdit?.(useCase);
              }}
              className="inline-flex items-center px-3 py-2 text-xs text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-lg border-none bg-transparent transition-all duration-200 hover:shadow-sm"
              data-testid="button-edit"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onDelete?.(useCase);
              }}
              className="inline-flex items-center px-3 py-2 text-xs text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg border-none bg-transparent transition-all duration-200 hover:shadow-sm"
              data-testid="button-delete"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>
          
          {showRSAActions && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onMoveToLibrary?.(useCase);
              }}
              className="inline-flex items-center px-3 py-2 text-xs text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-lg border-none bg-transparent transition-all duration-200 hover:shadow-sm"
              data-testid="button-move-to-library"
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