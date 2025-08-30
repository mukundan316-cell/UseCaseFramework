import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Lightbulb } from 'lucide-react';
import { useUseCases } from '@/contexts/UseCaseContext';

interface HorizontalUseCaseLegoBlockProps {
  isHorizontalUseCase: string; // 'true' or 'false' following replit.md pattern
  selectedTypes: string[];
  onHorizontalUseCaseChange: (value: 'true' | 'false') => void; // 'true' or 'false'
  onTypesChange: (types: string[]) => void;
  className?: string;
}

/**
 * LEGO Block: Horizontal Use Case Selection
 * Provides checkbox for enabling horizontal use case feature
 * and conditional multi-select for horizontal use case types
 * Follows replit.md string boolean pattern ('true'/'false')
 */
export default function HorizontalUseCaseLegoBlock({
  isHorizontalUseCase,
  selectedTypes,
  onHorizontalUseCaseChange,
  onTypesChange,
  className = ""
}: HorizontalUseCaseLegoBlockProps) {
  
  const isEnabled = isHorizontalUseCase === 'true';
  const { metadata } = useUseCases();
  
  // Get horizontal use case types from metadata, fallback to empty array if deleted
  const availableTypes = metadata?.horizontalUseCaseTypes || [];

  const handleMainCheckboxChange = (checked: boolean) => {
    const newValue: 'true' | 'false' = checked ? 'true' : 'false';
    onHorizontalUseCaseChange(newValue);
    
    // Clear selected types if disabling
    if (!checked) {
      onTypesChange([]);
    }
  };

  const handleTypeToggle = (type: string, checked: boolean) => {
    let newTypes: string[];
    if (checked) {
      newTypes = [...selectedTypes, type];
    } else {
      newTypes = selectedTypes.filter(t => t !== type);
    }
    onTypesChange(newTypes);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Horizontal Use Case Checkbox */}
      <div className="flex items-center space-x-3">
        <Checkbox
          id="horizontal-use-case"
          checked={isEnabled}
          onCheckedChange={handleMainCheckboxChange}
          className="w-5 h-5"
          data-testid="checkbox-horizontal-use-case"
        />
        <Label 
          htmlFor="horizontal-use-case" 
          className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
        >
          <Network className="w-4 h-4 text-blue-600" />
          Horizontal Use Case
        </Label>
      </div>

      {/* Conditional Multi-Select for Horizontal Use Case Types */}
      {isEnabled && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              Select Horizontal Use Case Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-64 overflow-y-auto">
            {availableTypes.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableTypes.map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <div key={type} className="flex items-center space-x-2 whitespace-nowrap">
                      <Checkbox
                        id={`horizontal-type-${type}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleTypeToggle(type, !!checked)}
                        className="w-4 h-4 flex-shrink-0"
                        data-testid={`checkbox-horizontal-type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                      />
                      <Label 
                        htmlFor={`horizontal-type-${type}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">No horizontal use case types configured.</p>
                <p className="text-xs mt-1">Add types in the Admin Panel → Data Management tab.</p>
              </div>
            )}
          </CardContent>
          
          {/* Selected Types Summary */}
          {selectedTypes.length > 0 && (
            <CardContent className="pt-0">
              <div className="text-xs text-gray-600 mb-2">
                Selected ({selectedTypes.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTypes.map((type) => (
                  <Badge 
                    key={type} 
                    variant="secondary" 
                    className="text-xs bg-blue-100 text-blue-700"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}