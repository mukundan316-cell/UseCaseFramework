import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calculator } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { UseCase } from '../../types';

interface ScoreOverrideLegoBlockProps {
  form: UseFormReturn<any>;
  calculatedImpact?: number;
  calculatedEffort?: number;
  calculatedQuadrant?: string;
}

export default function ScoreOverrideLegoBlock({
  form,
  calculatedImpact,
  calculatedEffort,
  calculatedQuadrant
}: ScoreOverrideLegoBlockProps) {
  const manualImpact = form.watch('manualImpactScore');
  const manualEffort = form.watch('manualEffortScore');
  const manualQuadrant = form.watch('manualQuadrant');
  
  const hasAnyOverride = manualImpact || manualEffort || manualQuadrant;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          Manual Score Override
        </CardTitle>
        <p className="text-xs text-gray-600">
          Override calculated scores for strategic business decisions
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calculated vs Override Comparison */}
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

        {/* Override Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="manualImpactScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Override Impact Score</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="1.0 - 5.0"
                    className="text-xs"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                    {...field}
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="1.0 - 5.0"
                    className="text-xs"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select quadrant override" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Quick Win">Quick Win</SelectItem>
                  <SelectItem value="Strategic Bet">Strategic Bet</SelectItem>
                  <SelectItem value="Experimental">Experimental</SelectItem>
                  <SelectItem value="Watchlist">Watchlist</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasAnyOverride && (
          <FormField
            control={form.control}
            name="overrideReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  Override Reason <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Explain why these manual overrides are necessary for strategic alignment..."
                    className="text-xs resize-none"
                    rows={2}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Required when any manual override is applied
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {hasAnyOverride && (
          <div className="p-2 bg-orange-100 rounded border border-orange-200">
            <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
              Manual Override Active
            </Badge>
            <p className="text-xs text-orange-600 mt-1">
              This use case will display override values instead of calculated scores
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}