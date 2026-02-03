import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, TrendingUp, Wrench, Target, Info } from 'lucide-react';
import ScoreOverrideLegoBlock from '../ScoreOverrideLegoBlock';
import TShirtSizingDisplayLegoBlock from '../TShirtSizingDisplayLegoBlock';
import { SectionHeader } from './utils';
import type { ScoringTabProps, ScoresState } from './types';

const leverScoreDescriptions: Record<keyof ScoresState, Record<number, string>> = {
  revenueImpact: {
    1: "No direct revenue impact",
    2: "Minor revenue uplift (<1%)",
    3: "Moderate revenue growth (1-3%)",
    4: "Significant new revenue (3-5%)",
    5: "Major new revenue stream (>5%)"
  },
  costSavings: {
    1: "No measurable savings",
    2: "Minor efficiency gains (<5%)",
    3: "Moderate cost reduction (5-15%)",
    4: "Significant savings (15-30%)",
    5: "Transformational savings (>30%)"
  },
  riskReduction: {
    1: "No risk mitigation",
    2: "Minor risk reduction",
    3: "Moderate risk mitigation",
    4: "Significant risk reduction",
    5: "Critical risk elimination"
  },
  brokerPartnerExperience: {
    1: "No partner impact",
    2: "Minor convenience improvement",
    3: "Notable experience enhancement",
    4: "Significant relationship value",
    5: "Competitive differentiation"
  },
  strategicFit: {
    1: "Not aligned with strategy",
    2: "Loosely aligned",
    3: "Moderately aligned",
    4: "Strongly aligned",
    5: "Core strategic initiative"
  },
  dataReadiness: {
    1: "Data not available",
    2: "Significant data gaps",
    3: "Partial data availability",
    4: "Most data ready",
    5: "Data fully prepared"
  },
  technicalComplexity: {
    1: "Cutting-edge R&D required",
    2: "Complex custom development",
    3: "Moderate complexity",
    4: "Standard implementation",
    5: "Simple/off-the-shelf solution"
  },
  changeImpact: {
    1: "Massive org restructuring",
    2: "Significant process changes",
    3: "Moderate workflow updates",
    4: "Minor adjustments",
    5: "No process changes needed"
  },
  modelRisk: {
    1: "Critical regulatory/safety risk",
    2: "High reputational risk",
    3: "Moderate oversight needed",
    4: "Low risk with monitoring",
    5: "Minimal risk exposure"
  },
  adoptionReadiness: {
    1: "Strong resistance expected",
    2: "Significant change management",
    3: "Mixed stakeholder buy-in",
    4: "Good user acceptance",
    5: "Champions ready to adopt"
  }
};

export default function ScoringTab({
  form,
  scores,
  handleSliderChange,
  governanceStatus,
  currentImpactScore,
  currentEffortScore,
  currentQuadrant,
  rsaSelection,
  setIsOverrideEnabled,
  sliderTooltips,
  useCase,
}: ScoringTabProps) {
  const DropdownField = ({ 
    field, 
    label, 
    tooltip 
  }: { 
    field: keyof ScoresState; 
    label: string; 
    tooltip?: string 
  }) => {
    const descriptions = leverScoreDescriptions[field];
    
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-sm font-semibold flex items-center gap-1">
            {label}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
          {scores[field] > 0 && (
            <Badge variant="outline" className="text-xs">{scores[field]}/5</Badge>
          )}
        </div>
        <Select
          value={scores[field] > 0 ? String(scores[field]) : ''}
          onValueChange={(value) => handleSliderChange(field, parseInt(value))}
        >
          <SelectTrigger className="bg-white" data-testid={`select-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`}>
            <SelectValue placeholder="Select score (1-5)..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - {descriptions[1]}</SelectItem>
            <SelectItem value="2">2 - {descriptions[2]}</SelectItem>
            <SelectItem value="3">3 - {descriptions[3]}</SelectItem>
            <SelectItem value="4">4 - {descriptions[4]}</SelectItem>
            <SelectItem value="5">5 - {descriptions[5]}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Intake & Prioritization Scoring</h3>
        </div>
        <Badge variant="outline" className={`${governanceStatus.intake.passed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {governanceStatus.intake.passed ? 'Gate Complete' : `${governanceStatus.intake.progress}% Complete`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
          <SectionHeader icon={TrendingUp} title="Business Impact Levers" description="Value and strategic alignment (5 required)" />
          <div className="space-y-4">
            <DropdownField field="revenueImpact" label="Revenue Impact" tooltip={sliderTooltips.revenueImpact} />
            <DropdownField field="costSavings" label="Cost Savings" tooltip={sliderTooltips.costSavings} />
            <DropdownField field="riskReduction" label="Risk Reduction" tooltip={sliderTooltips.riskReduction} />
            <DropdownField field="brokerPartnerExperience" label="Broker/Partner Experience" tooltip={sliderTooltips.brokerPartnerExperience} />
            <DropdownField field="strategicFit" label="Strategic Fit" tooltip={sliderTooltips.strategicFit} />
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <SectionHeader icon={Wrench} title="Implementation Effort Levers" description="Complexity and readiness (5 required)" />
          <div className="space-y-4">
            <DropdownField field="dataReadiness" label="Data Readiness" tooltip={sliderTooltips.dataReadiness} />
            <DropdownField field="technicalComplexity" label="Technical Complexity" tooltip={sliderTooltips.technicalComplexity} />
            <DropdownField field="changeImpact" label="Change Impact" tooltip={sliderTooltips.changeImpact} />
            <DropdownField field="modelRisk" label="Model Risk" tooltip={sliderTooltips.modelRisk} />
            <DropdownField field="adoptionReadiness" label="Adoption Readiness" tooltip={sliderTooltips.adoptionReadiness} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
        <SectionHeader icon={Target} title="Calculated Scores" description="Auto-calculated from the 10 levers above" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-green-600 mb-1">{currentImpactScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Impact Score</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-orange-600 mb-1">{currentEffortScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Effort Score</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-lg font-semibold text-purple-600">{currentQuadrant}</div>
            <div className="text-sm text-gray-600">Quadrant</div>
          </div>
        </div>
      </div>

      {rsaSelection.isActiveForRsa === 'true' && (
        <ScoreOverrideLegoBlock
          form={form}
          calculatedImpact={currentImpactScore}
          calculatedEffort={currentEffortScore}
          calculatedQuadrant={currentQuadrant}
          onToggleChange={setIsOverrideEnabled}
        />
      )}

      <TShirtSizingDisplayLegoBlock
        impactScore={currentImpactScore}
        effortScore={currentEffortScore}
        quadrant={currentQuadrant}
        useCaseId={useCase?.id}
        useCaseTitle={form.watch('title')}
      />
    </div>
  );
}
