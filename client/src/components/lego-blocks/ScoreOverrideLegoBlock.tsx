import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Calculator, Settings } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useUseCases } from '../../contexts/UseCaseContext';
import { APP_CONFIG } from '@shared/constants/app-config';
// No need to import UseCase type since we're only using form props

interface ScoreOverrideLegoBlockProps {
  form: UseFormReturn<any>;
  calculatedImpact?: number;
  calculatedEffort?: number;
  calculatedQuadrant?: string;
  onToggleChange?: (enabled: boolean) => void;
}

export default function ScoreOverrideLegoBlock({
  form,
  calculatedImpact,
  calculatedEffort,
  calculatedQuadrant,
  onToggleChange
}: ScoreOverrideLegoBlockProps) {
  const { metadata } = useUseCases();
  const manualImpact = form.watch('manualImpactScore');
  const manualEffort = form.watch('manualEffortScore');
  const manualQuadrant = form.watch('manualQuadrant');
  
  // Check if manual overrides are already active (for edit mode)
  const hasExistingOverrides = !!(manualImpact || manualEffort || manualQuadrant);
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(hasExistingOverrides);
  
  // Sync toggle state when manual override values change externally
  useEffect(() => {
    const hasOverrides = !!(manualImpact || manualEffort || manualQuadrant);
    setIsOverrideEnabled(hasOverrides);
  }, [manualImpact, manualEffort, manualQuadrant]);
  
  const handleToggleOverride = (enabled: boolean) => {
    setIsOverrideEnabled(enabled);
    
    // If disabling overrides, clear all manual override fields
    if (!enabled) {
      console.log('🧹 ScoreOverrideLegoBlock: Clearing manual override values...');
      form.setValue('manualImpactScore', null);
      form.setValue('manualEffortScore', null);
      form.setValue('manualQuadrant', null);
      form.setValue('overrideReason', '');
      
      console.log('🧹 Values after clearing:', {
        manualImpactScore: form.getValues('manualImpactScore'),
        manualEffortScore: form.getValues('manualEffortScore'),
        manualQuadrant: form.getValues('manualQuadrant')
      });
      
      // Force form to trigger re-render to clear displayed values
      form.trigger(['manualImpactScore', 'manualEffortScore', 'manualQuadrant', 'overrideReason']);
    }
    
    // Notify parent component of toggle state change
    onToggleChange?.(enabled);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-base">Manual Score Override</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {isOverrideEnabled ? 'Override Active' : 'Use Calculated Scores'}
            </span>
            <Switch
              checked={isOverrideEnabled}
              onCheckedChange={handleToggleOverride}
            />
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {isOverrideEnabled 
            ? 'Override calculated scores for strategic business decisions'
            : 'Toggle to override calculated scores when needed'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Show current effective scores when override is disabled */}
        {!isOverrideEnabled && (calculatedImpact || calculatedEffort) && (
          <div className="bg-white p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Using Calculated Scores</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Impact:</span>
                <div className="font-semibold text-green-700">
                  {calculatedImpact?.toFixed(1) || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Effort:</span>
                <div className="font-semibold text-blue-700">
                  {calculatedEffort?.toFixed(1) || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Quadrant:</span>
                <div className="font-semibold text-gray-700">
                  {calculatedQuadrant || 'N/A'}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Manual override fields are empty when using calculated scores
            </div>
          </div>
        )}

        {/* Override Fields - Only show when toggle is enabled */}
        {isOverrideEnabled && (
          <>
            {/* Show comparison when override is enabled */}
            {(calculatedImpact || calculatedEffort) && (
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">System Calculated</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Impact:</span>
                    <div className="font-semibold text-green-700">
                      {calculatedImpact?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Effort:</span>
                    <div className="font-semibold text-blue-700">
                      {calculatedEffort?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Quadrant:</span>
                    <div className="font-semibold text-gray-700">
                      {calculatedQuadrant || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manualImpactScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Override Impact Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={APP_CONFIG.SCORING.MIN_SCORE}
                        max={APP_CONFIG.SCORING.MAX_SCORE}
                        step="0.1"
                        placeholder="1.0 - 5.0"
                        className="text-xs"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manualEffortScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Override Effort Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={APP_CONFIG.SCORING.MIN_SCORE}
                        max={APP_CONFIG.SCORING.MAX_SCORE}
                        step="0.1"
                        placeholder="1.0 - 5.0"
                        className="text-xs"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="manualQuadrant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Override Quadrant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select quadrant override" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(metadata?.quadrants || ['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']).map((quadrant) => (
                        <SelectItem key={quadrant} value={quadrant}>{quadrant}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overrideReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Override Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Explain why these scores should be overridden..."
                      className="text-xs min-h-[60px]"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Document the business rationale for manual score adjustments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-2 bg-orange-100 rounded border border-orange-200">
              <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
                Manual Override Active
              </Badge>
              <p className="text-xs text-orange-600 mt-1">
                This use case will display override values instead of calculated scores
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}