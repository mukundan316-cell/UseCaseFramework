import React from 'react';
import { Edit, Trash2, Library, Plus, Settings, Building2, Tag } from 'lucide-react';
import { UseCase } from '../../types';
import { getQuadrantBackgroundColor, getQuadrantColor } from '../../utils/calculations';

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
  const quadrantBorder = hasScores ? getQuadrantColor(useCase.quadrant || '') : '#3b82f6';
  
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
  
  const bgClass = hasScores ? getQuadrantBgClass(useCase.quadrant || '') : 'bg-white';
  
  return (
    <div 
      className={`border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 ${bgClass}`}
      style={{ borderLeft: `4px solid ${quadrantBorder}` }}
    >
      <div className="p-5">
        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {useCase.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {useCase.description}
          </p>
        </div>

        {/* Business Context Tags - Compact icon-based layout */}
        <div className="space-y-1.5 mb-3">
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
        </div>

        {/* Scores Display - Only for RSA Active Portfolio with enhanced quadrant styling */}
        {hasScores && (
          <div className="mb-4">
            {/* Quadrant Badge */}
            <div className="mb-3 text-center">
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ 
                  backgroundColor: quadrantBorder, 
                  color: 'white' 
                }}
              >
                {useCase.quadrant || 'Unassigned'}
              </span>
            </div>
            
            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {useCase.impactScore.toFixed(1)}
                </div>
                <div className="text-xs text-green-600">Impact</div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">
                  {useCase.effortScore.toFixed(1)}
                </div>
                <div className="text-xs text-blue-600">Effort</div>
              </div>
            </div>
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