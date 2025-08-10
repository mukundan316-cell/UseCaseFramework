import React from 'react';
import { Edit, Trash2, Library, Plus } from 'lucide-react';
import { UseCase } from '../../types';

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
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200"
      style={{ borderLeft: '4px solid #3b82f6' }}
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

        {/* Business Context Tags - Simple colored text with dots */}
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="text-xs text-blue-800 flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
            {useCase.process}
          </span>
          <span className="text-xs text-purple-800 flex items-center">
            <span className="w-2 h-2 bg-purple-600 rounded-full mr-1"></span>
            {useCase.lineOfBusiness}
          </span>
          <span className="text-xs text-orange-800 flex items-center">
            <span className="w-2 h-2 bg-orange-600 rounded-full mr-1"></span>
            {useCase.useCaseType}
          </span>
        </div>

        {/* Scores Display - Only for RSA Active Portfolio */}
        {showScores && useCase.impactScore !== undefined && useCase.effortScore !== undefined && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">
                {useCase.impactScore.toFixed(1)}
              </div>
              <div className="text-xs text-green-600">Impact</div>
            </div>
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700">
                {useCase.effortScore.toFixed(1)}
              </div>
              <div className="text-xs text-blue-600">Effort</div>
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