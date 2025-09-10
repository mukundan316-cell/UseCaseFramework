import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Target, DollarSign, 
  Clock, Shirt, TrendingUp, Users, Eye, HelpCircle, Info
} from 'lucide-react';
import { getEffectiveQuadrant, getEffectiveImpactScore, getEffectiveEffortScore } from '@shared/utils/scoreOverride';
import { calculateTShirtSize, calculateAnnualBenefitRange } from '@shared/calculations';
import { UseCase } from '../../types';

interface PortfolioTableViewProps {
  useCases: UseCase[];
  metadata: any;
  onViewUseCase?: (useCase: UseCase) => void;
  showDetails?: boolean;
}

type SortField = 'title' | 'impact' | 'effort' | 'tshirt' | 'cost' | 'quadrant';
type SortDirection = 'asc' | 'desc' | null;

interface TableRow {
  id: string;
  title: string;
  impact: number;
  effort: number;
  quadrant: string;
  quadrantColor: string;
  tshirtSize: string;
  tshirtColor: string;
  costMin: number | null;
  costMax: number | null;
  weeksMin: number | null;
  weeksMax: number | null;
  teamSize: string | null;
  annualBenefit: string;
  roiRange: string;
  useCase: UseCase;
}

export default function PortfolioTableView({ useCases, metadata, onViewUseCase, showDetails = false }: PortfolioTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('impact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{type: string; title: string; content: string}>({
    type: '', title: '', content: ''
  });

  // Listen for clear filters event from parent component
  useEffect(() => {
    const handleClearFilters = () => {
      setSortField('impact');
      setSortDirection('desc');
    };

    window.addEventListener('clearTableFilters', handleClearFilters);
    return () => window.removeEventListener('clearTableFilters', handleClearFilters);
  }, []);

  // Transform use cases into table data
  const tableData: TableRow[] = useMemo(() => {
    return useCases.map(useCase => {
      const effectiveQuadrant = getEffectiveQuadrant(useCase as any);
      const effectiveImpact = getEffectiveImpactScore(useCase as any);
      const effectiveEffort = getEffectiveEffortScore(useCase as any);
      
      // Calculate T-shirt sizing if available
      const tShirtConfig = metadata?.tShirtSizing;
      const sizing = tShirtConfig?.enabled 
        ? calculateTShirtSize(effectiveImpact, effectiveEffort, tShirtConfig)
        : null;

      // Get size configuration for color
      const sizeConfig = tShirtConfig?.sizes?.find((s: any) => s.name === sizing?.size);
      
      // Calculate annual benefit using size-based multipliers
      const benefitCalc = calculateAnnualBenefitRange(effectiveImpact, sizing?.size || null, tShirtConfig);
      const annualBenefit = benefitCalc.benefitMin && benefitCalc.benefitMax 
        ? `£${Math.round(benefitCalc.benefitMin/1000)}K–£${Math.round(benefitCalc.benefitMax/1000)}K`
        : effectiveImpact >= 4 ? '£500K+' : 
          effectiveImpact >= 3 ? '£200K-500K' : 
          effectiveImpact >= 2 ? '£50K-200K' : '£0-50K';
      
      // Calculate ROI range based on quadrant
      const roiRange = effectiveQuadrant === 'Quick Win' ? '150-400%' :
                      effectiveQuadrant === 'Strategic Bet' ? '200-500%' :
                      effectiveQuadrant === 'Experimental' ? '50-200%' : '-20-100%';

      return {
        id: useCase.id,
        title: useCase.title,
        impact: effectiveImpact,
        effort: effectiveEffort,
        quadrant: effectiveQuadrant,
        quadrantColor: getQuadrantColor(effectiveQuadrant),
        tshirtSize: sizing?.size || 'TBD',
        tshirtColor: sizeConfig?.color || '#6B7280',
        costMin: sizing?.estimatedCostMin || null,
        costMax: sizing?.estimatedCostMax || null,
        weeksMin: sizing?.estimatedWeeksMin || null,
        weeksMax: sizing?.estimatedWeeksMax || null,
        teamSize: sizing?.teamSizeEstimate || null,
        annualBenefit,
        roiRange,
        useCase
      };
    });
  }, [useCases, metadata]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return tableData;

    return [...tableData].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'impact':
          aVal = a.impact;
          bVal = b.impact;
          break;
        case 'effort':
          aVal = a.effort;
          bVal = b.effort;
          break;
        case 'tshirt':
          const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'TBD': 6 };
          aVal = sizeOrder[a.tshirtSize as keyof typeof sizeOrder] || 99;
          bVal = sizeOrder[b.tshirtSize as keyof typeof sizeOrder] || 99;
          break;
        case 'cost':
          aVal = a.costMin || 0;
          bVal = b.costMin || 0;
          break;
        case 'quadrant':
          const quadrantOrder = { 'Quick Win': 1, 'Strategic Bet': 2, 'Experimental': 3, 'Watchlist': 4 };
          aVal = quadrantOrder[a.quadrant as keyof typeof quadrantOrder] || 99;
          bVal = quadrantOrder[b.quadrant as keyof typeof quadrantOrder] || 99;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [tableData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortField('impact'); // Reset to default
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 text-blue-600" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 text-blue-600" />;
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  const formatCurrency = (min: number | null, max: number | null) => {
    if (!min || !max) return 'TBD';
    const formatAmount = (amount: number) => {
      if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `£${(amount / 1000).toFixed(0)}K`;
      return `£${Math.round(amount).toLocaleString()}`;
    };
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  };

  const formatDuration = (min: number | null, max: number | null) => {
    if (!min || !max) return 'TBD';
    const formatWeeks = (weeks: number) => {
      if (weeks >= 52) return `${(weeks / 52).toFixed(1)}y`;
      if (weeks >= 4) return `${Math.round(weeks / 4)}m`;
      return `${Math.round(weeks)}w`;
    };
    return `${formatWeeks(min)} - ${formatWeeks(max)}`;
  };

  // Helper functions for tooltip content
  const getTShirtTooltip = (row: TableRow) => {
    const tShirtConfig = metadata?.tShirtSizing;
    const sizeConfig = tShirtConfig?.sizes?.find((s: any) => s.name === row.tshirtSize);
    
    if (!sizeConfig) return `Size ${row.tshirtSize}: Based on impact/effort scoring`;
    
    return (
      <div className="space-y-1">
        <div className="font-medium">Size {row.tshirtSize}: {sizeConfig.description}</div>
        <div className="text-xs">Impact {row.impact.toFixed(1)} + Effort {row.effort.toFixed(1)} → {row.tshirtSize} complexity</div>
        <div className="text-xs text-blue-400">Click T-Shirt header for mapping rules</div>
      </div>
    );
  };

  const getCostTooltip = (row: TableRow) => {
    if (!row.costMin || !row.costMax || !row.teamSize) {
      return 'Cost calculation requires T-shirt sizing configuration';
    }
    
    const tShirtConfig = metadata?.tShirtSizing;
    const avgCost = (row.costMin + row.costMax) / 2;
    const avgWeeks = row.weeksMin && row.weeksMax ? (row.weeksMin + row.weeksMax) / 2 : 0;
    const avgDailyRate = tShirtConfig?.roles?.reduce((sum: number, role: any) => sum + role.dailyRateGBP, 0) / (tShirtConfig?.roles?.length || 1) || 400;
    const overhead = tShirtConfig?.overheadMultiplier || 1.35;
    
    return (
      <div className="space-y-1">
        <div className="font-medium">{formatCurrency(row.costMin, row.costMax)}</div>
        <div className="text-xs">{row.teamSize} × £{Math.round(avgDailyRate)}/day × {Math.round(avgWeeks)} weeks × {overhead}x overhead</div>
        <div className="text-xs text-blue-400">Click Cost Range header for rate details</div>
      </div>
    );
  };

  const getTimelineTooltip = (row: TableRow) => {
    if (!row.weeksMin || !row.weeksMax) {
      return 'Timeline estimation requires T-shirt sizing configuration';
    }
    
    return (
      <div className="space-y-1">
        <div className="font-medium">{formatDuration(row.weeksMin, row.weeksMax)}</div>
        <div className="text-xs">Based on {row.tshirtSize}-size projects ({row.weeksMin}-{row.weeksMax} weeks) with buffer</div>
        <div className="text-xs text-blue-400">Includes team availability and complexity factors</div>
      </div>
    );
  };

  const getBenefitTooltip = (row: TableRow) => {
    const tShirtConfig = metadata?.tShirtSizing;
    const sizeConfig = tShirtConfig?.sizes?.find((s: any) => s.name === row.tshirtSize);
    
    return (
      <div className="space-y-1">
        <div className="font-medium">{row.annualBenefit}</div>
        <div className="text-xs">Impact {row.impact.toFixed(1)} × £{getBenefitMultiplier(row.tshirtSize)}K multiplier = {row.annualBenefit}</div>
        <div className="text-xs text-blue-400">Click Annual Benefit header for calculation details</div>
      </div>
    );
  };

  const getBenefitMultiplier = (size: string) => {
    const tShirtConfig = metadata?.tShirtSizing;
    const defaultMultipliers: Record<string, number> = {
      'XS': 25,
      'S': 50,
      'M': 100,
      'L': 200,
      'XL': 400
    };
    return tShirtConfig?.benefitMultipliers?.[size] || defaultMultipliers[size] || 50;
  };

  // Interactive header content functions
  const getImpactExplanation = () => {
    // Use centralized weight utility for consistency
    const weights = metadata?.scoringModel?.businessValue || {
      revenueImpact: 20,
      costSavings: 20,
      riskReduction: 20,
      brokerPartnerExperience: 20,
      strategicFit: 20
    };

    return {
      title: 'Impact Score Calculation',
      content: `Business Impact Score = Weighted average of:
• Revenue Impact (${weights.revenueImpact}%)
• Cost Savings (${weights.costSavings}%)
• Risk Reduction (${weights.riskReduction}%)
• Broker Partner Experience (${weights.brokerPartnerExperience}%)
• Strategic Fit (${weights.strategicFit}%)

Each lever scored 1-5, then weighted and averaged. Manual overrides may apply.`
    };
  };

  const getEffortExplanation = () => {
    // Use centralized weight utility for consistency
    const weights = metadata?.scoringModel?.feasibility || {
      dataReadiness: 20,
      technicalComplexity: 20,
      changeImpact: 20,
      modelRisk: 20,
      adoptionReadiness: 20
    };

    return {
      title: 'Effort Score Calculation',
      content: `Implementation Effort Score = Weighted average of:
• Data Readiness (${weights.dataReadiness}%)
• Technical Complexity (${weights.technicalComplexity}%)
• Change Impact (${weights.changeImpact}%)
• Model Risk (${weights.modelRisk}%)
• Adoption Readiness (${weights.adoptionReadiness}%)

Each lever scored 1-5, then weighted and averaged. Higher scores indicate greater implementation difficulty. Manual overrides may apply.`
    };
  };

  const getTShirtExplanation = () => {
    const tShirtConfig = metadata?.tShirtSizing;
    if (!tShirtConfig?.enabled) {
      return {
        title: 'T-Shirt Sizing',
        content: 'T-shirt sizing is not currently enabled. Contact your administrator to configure sizing rules and UK benchmark rates.'
      };
    }

    const mappingRules = tShirtConfig.mappingRules?.map((rule: any) => 
      `• ${rule.name}: Impact ${rule.condition.impactMin || '?'}+ / Effort ${rule.condition.effortMax || '?'}- → ${rule.targetSize}`
    ).join('\n') || 'No mapping rules configured';

    return {
      title: 'T-Shirt Size Mapping Rules',
      content: `Current mapping rules:\n${mappingRules}\n\nSizes range from XS (1-4 weeks, 1-2 people) to XL (26-52 weeks, 8-15 people) based on UK benchmarks.`
    };
  };

  const getCostExplanation = () => {
    const tShirtConfig = metadata?.tShirtSizing;
    const roles = tShirtConfig?.roles || [];
    const roleRates = roles.map((role: any) => `• ${role.type}: £${role.dailyRateGBP}/day`).join('\n');
    const overhead = tShirtConfig?.overheadMultiplier || 1.35;

    return {
      title: 'Cost Calculation Method',
      content: `UK Benchmark Rates:\n${roleRates || '• No roles configured'}\n\nFormula: Team Size × Average Daily Rate × Duration × ${overhead}x Overhead\n\nOverhead includes project management, infrastructure, training, and contingency.`
    };
  };

  const getTimelineExplanation = () => {
    const tShirtConfig = metadata?.tShirtSizing;
    const sizes = tShirtConfig?.sizes || [];
    const sizeRanges = sizes.map((size: any) => `• ${size.name}: ${size.minWeeks}-${size.maxWeeks} weeks`).join('\n');

    return {
      title: 'Timeline Estimation Method',
      content: `T-shirt Size Ranges:\n${sizeRanges || '• No sizes configured'}\n\nTimeline is determined by:\n1. Impact/Effort scores mapped to T-shirt size\n2. Base duration range for that size\n3. Team availability buffer\n4. Complexity adjustment factors\n\nEstimates include project setup, development, testing, and deployment phases.`
    };
  };

  const getBenefitExplanation = () => {
    const tShirtConfig = metadata?.tShirtSizing;
    const multipliers = {
      'XS': tShirtConfig?.benefitMultipliers?.XS || 25,
      'S': tShirtConfig?.benefitMultipliers?.S || 50,
      'M': tShirtConfig?.benefitMultipliers?.M || 100,
      'L': tShirtConfig?.benefitMultipliers?.L || 200,
      'XL': tShirtConfig?.benefitMultipliers?.XL || 400
    };

    const multiplierList = Object.entries(multipliers).map(([size, mult]) => `• ${size}: £${mult}K per impact point`).join('\n');

    return {
      title: 'Annual Benefit Calculation',
      content: `Benefit = Impact Score × Size-based Multiplier × Range (±20%)\n\nMultipliers by T-shirt Size:\n${multiplierList}\n\nFormula: Impact ${metadata?.scoringModel?.businessValue ? 'Score' : '(1-5)'} × Multiplier = Base Benefit\nRange applied: 80% to 120% of base benefit\n\nBenefits reflect revenue impact, cost savings, risk reduction, and strategic value.`
    };
  };

  const showCalculationDialog = (type: string) => {
    let content;
    switch (type) {
      case 'impact':
        content = getImpactExplanation();
        break;
      case 'effort':
        content = getEffortExplanation();
        break;
      case 'tshirt':
        content = getTShirtExplanation();
        break;
      case 'cost':
        content = getCostExplanation();
        break;
      case 'timeline':
        content = getTimelineExplanation();
        break;
      case 'benefit':
        content = getBenefitExplanation();
        break;
      default:
        return;
    }
    setDialogContent({ type, ...content });
    setCalculationDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Portfolio Resource Planning
          </CardTitle>
          <p className="text-sm text-gray-600">
            Strategic overview with T-shirt sizing and resource estimates for active portfolio
          </p>
        </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    Use Case
                    {getSortIcon('title')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('impact')}
                      className="flex items-center gap-1 hover:bg-gray-50"
                    >
                      <Target className="h-4 w-4" />
                      Impact
                      {getSortIcon('impact')}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('impact')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see how Impact scores are calculated</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('effort')}
                      className="flex items-center gap-1 hover:bg-gray-50"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Effort
                      {getSortIcon('effort')}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('effort')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see how Effort scores are calculated</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('tshirt')}
                      className="flex items-center gap-1 hover:bg-gray-50"
                    >
                      <Shirt className="h-4 w-4" />
                      T-Shirt
                      {getSortIcon('tshirt')}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('tshirt')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see T-shirt sizing mapping rules</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('cost')}
                      className="flex items-center gap-1 hover:bg-gray-50"
                    >
                      <DollarSign className="h-4 w-4" />
                      Cost Range
                      {getSortIcon('cost')}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('cost')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see cost calculation method</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <Clock className="h-4 w-4" />
                    Timeline
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('timeline')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see timeline estimation method</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="h-4 w-4" />
                    Annual Benefit
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showCalculationDialog('benefit')}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to see benefit calculation method</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-center p-3 font-semibold">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('quadrant')}
                    className="flex items-center gap-1 hover:bg-gray-50"
                  >
                    Quadrant
                    {getSortIcon('quadrant')}
                  </Button>
                </th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={row.title}>
                      {row.title}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-green-700">
                      {row.impact.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-blue-700">
                      {row.effort.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          className="text-white font-medium cursor-help"
                          style={{ backgroundColor: row.tshirtColor }}
                        >
                          {row.tshirtSize}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getTShirtTooltip(row)}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="p-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-mono text-sm cursor-help">
                          {formatCurrency(row.costMin, row.costMax)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getCostTooltip(row)}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="p-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-mono text-sm cursor-help">
                          {formatDuration(row.weeksMin, row.weeksMax)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getTimelineTooltip(row)}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="p-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-semibold text-emerald-600 cursor-help">
                          {row.annualBenefit}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getBenefitTooltip(row)}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="p-3 text-center">
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${row.quadrantColor}20`,
                        color: row.quadrantColor 
                      }}
                    >
                      {row.quadrant}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    {onViewUseCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewUseCase(row.useCase)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No use cases available for display
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
          <div>Showing {sortedData.length} use cases</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Impact: Business value potential (1-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Effort: Implementation complexity (1-5)</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Calculation Explanation Dialog */}
      <Dialog open={calculationDialogOpen} onOpenChange={setCalculationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription>
              Understanding how these values are calculated helps ensure accurate resource planning and stakeholder confidence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border">
              {dialogContent.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
    </TooltipProvider>
  );
}

function getQuadrantColor(quadrant: string): string {
  switch (quadrant) {
    case 'Quick Win': return '#10B981';
    case 'Strategic Bet': return '#3B82F6';
    case 'Experimental': return '#F59E0B';
    case 'Watchlist': return '#EF4444';
    default: return '#6B7280';
  }
}