import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, AlertTriangle, UserCheck, Globe } from 'lucide-react';
import type { ResponsibleAITabProps } from './types';
import { SectionHeader } from './utils';

export default function ResponsibleAITab({ form, governanceStatus }: ResponsibleAITabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Responsible AI Assessment</h3>
        </div>
        <Badge variant="outline" className={`${governanceStatus.rai.passed ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
          {governanceStatus.rai.passed ? 'Gate Complete' : `${governanceStatus.rai.progress}% Complete`}
        </Badge>
      </div>

      <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
        <SectionHeader icon={Eye} title="Transparency" description="Can the AI's decisions be explained?" />
        <FormField
          control={form.control}
          name="explainabilityRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Is explainability required? <Badge variant="outline" className="ml-2 text-xs">Gate Required</Badge>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === 'yes' ? 'true' : value === 'no' ? 'false' : undefined)} 
                value={field.value === 'true' ? 'yes' : field.value === 'false' ? 'no' : undefined}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes - Decisions must be explainable</SelectItem>
                  <SelectItem value="no">No - Black box acceptable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
        <SectionHeader icon={AlertTriangle} title="Risk Assessment" description="Potential harm to customers" />
        <FormField
          control={form.control}
          name="customerHarmRisk"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Customer harm risk level <Badge variant="outline" className="ml-2 text-xs">Gate Required</Badge>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select risk level..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None - No potential for customer harm</SelectItem>
                  <SelectItem value="low">Low - Minimal impact if errors occur</SelectItem>
                  <SelectItem value="medium">Medium - Moderate potential impact</SelectItem>
                  <SelectItem value="high">High - Significant potential harm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
        <SectionHeader icon={UserCheck} title="Accountability" description="Human oversight requirements" />
        <FormField
          control={form.control}
          name="humanAccountability"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Human accountability required? <Badge variant="outline" className="ml-2 text-xs">Gate Required</Badge>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value)} 
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Yes - Human must approve/review decisions</SelectItem>
                  <SelectItem value="false">No - Fully automated acceptable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
        <SectionHeader icon={Globe} title="Data & Compliance" description="Data location and third-party considerations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataOutsideUkEu"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Cross-border data transfer? <Badge variant="outline" className="ml-2 text-xs">Gate Required</Badge>
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value)} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes - Data transferred across jurisdictions</SelectItem>
                    <SelectItem value="false">No - Data stays within local jurisdiction</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="thirdPartyModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Third party model? <Badge variant="outline" className="ml-2 text-xs">Gate Required</Badge>
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value)} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes - Uses third-party AI/ML model</SelectItem>
                    <SelectItem value="false">No - Internal/custom model only</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
