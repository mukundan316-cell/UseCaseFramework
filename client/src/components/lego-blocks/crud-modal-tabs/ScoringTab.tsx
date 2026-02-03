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
    1: "Minimal revenue impact (<1% annually)",
    2: "Small revenue potential (1-3%)",
    3: "Moderate revenue opportunity (3-5%)",
    4: "Significant revenue impact (5-10%)",
    5: "Transformational revenue potential (>10%)"
  },
  costSavings: {
    1: "Negligible cost reduction (<2%)",
    2: "Minor operational savings (2-5%)",
    3: "Moderate efficiency gains (5-15%)",
    4: "Substantial cost reduction (15-25%)",
    5: "Major cost transformation (>25%)"
  },
  riskReduction: {
    1: "No material risk mitigation",
    2: "Addresses minor compliance/operational risks",
    3: "Reduces moderate regulatory/financial exposure",
    4: "Significantly improves risk profile",
    5: "Eliminates critical business risks"
  },
  brokerPartnerExperience: {
    1: "No noticeable improvement",
    2: "Minor convenience improvements",
    3: "Moderate enhancement to partner workflows",
    4: "Significant improvement in partner satisfaction",
    5: "Game-changing partner experience"
  },
  strategicFit: {
    1: "Peripheral to business strategy",
    2: "Loosely aligned with strategic goals",
    3: "Supports core strategic initiatives",
    4: "Critical enabler of strategic objectives",
    5: "Essential to strategic transformation"
  },
  dataReadiness: {
    1: "Data doesn't exist or is inaccessible",
    2: "Data exists but requires major cleaning/preparation",
    3: "Data available with moderate preparation needed",
    4: "Good quality data, minor preparation required",
    5: "Clean, accessible, ready-to-use data"
  },
  technicalComplexity: {
    1: "Standard tools, proven approaches",
    2: "Minor technical challenges",
    3: "Moderate complexity, some custom development",
    4: "Complex integration, significant development",
    5: "Cutting-edge tech, major R&D required"
  },
  changeImpact: {
    1: "No process changes required",
    2: "Minor adjustments to existing workflows",
    3: "Moderate process redesign needed",
    4: "Significant organizational change",
    5: "Complete transformation required"
  },
  modelRisk: {
    1: "Simple rules-based system",
    2: "Well-understood ML models",
    3: "Moderate model complexity",
    4: "Complex models with explainability challenges",
    5: "Black-box AI with regulatory concerns"
  },
  adoptionReadiness: {
    1: "Strong resistance expected",
    2: "Significant change management needed",
    3: "Moderate user training required",
    4: "Users receptive with minimal training",
    5: "Eager adoption, minimal barriers"
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
