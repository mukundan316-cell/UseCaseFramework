import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, CheckCircle2, AlertTriangle, XCircle, 
  Loader2, AlertCircle, HelpCircle, Users, Eye, MapPin, Building2
} from 'lucide-react';

interface UseCase {
  id: string;
  title: string;
  quadrant: string;
  useCaseStatus: string;
  explainabilityRequired: string | null;
  customerHarmRisk: string | null;
  humanAccountability: string | null;
  dataOutsideUkEu: string | null;
  thirdPartyModel: string | null;
}

interface RAIMetrics {
  totalUseCases: number;
  complete: number;
  partial: number;
  incomplete: number;
  completionPercentage: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    unassessed: number;
  };
  fieldCoverage: {
    explainability: number;
    customerHarm: number;
    humanAccountability: number;
    dataLocation: number;
    thirdParty: number;
  };
}

function computeRAIMetrics(useCases: UseCase[]): RAIMetrics {
  const total = useCases.length;
  
  let complete = 0;
  let partial = 0;
  let incomplete = 0;
  
  const riskDistribution = { low: 0, medium: 0, high: 0, unassessed: 0 };
  const fieldCoverage = {
    explainability: 0,
    customerHarm: 0,
    humanAccountability: 0,
    dataLocation: 0,
    thirdParty: 0
  };

  useCases.forEach(uc => {
    const hasExplainability = uc.explainabilityRequired !== null && uc.explainabilityRequired !== '';
    const hasHarmRisk = uc.customerHarmRisk !== null && uc.customerHarmRisk !== '';
    const hasAccountability = uc.humanAccountability !== null && uc.humanAccountability !== '';
    const hasDataLocation = uc.dataOutsideUkEu !== null && uc.dataOutsideUkEu !== '';
    const hasThirdParty = uc.thirdPartyModel !== null && uc.thirdPartyModel !== '';

    if (hasExplainability) fieldCoverage.explainability++;
    if (hasHarmRisk) fieldCoverage.customerHarm++;
    if (hasAccountability) fieldCoverage.humanAccountability++;
    if (hasDataLocation) fieldCoverage.dataLocation++;
    if (hasThirdParty) fieldCoverage.thirdParty++;

    const fieldsCompleted = [hasExplainability, hasHarmRisk, hasAccountability, hasDataLocation, hasThirdParty].filter(Boolean).length;
    
    if (fieldsCompleted === 5) {
      complete++;
    } else if (fieldsCompleted > 0) {
      partial++;
    } else {
      incomplete++;
    }

    if (hasHarmRisk) {
      const risk = uc.customerHarmRisk?.toLowerCase() || '';
      if (risk === 'low' || risk === 'none') {
        riskDistribution.low++;
      } else if (risk === 'medium' || risk === 'moderate') {
        riskDistribution.medium++;
      } else if (risk === 'high' || risk === 'critical') {
        riskDistribution.high++;
      } else {
        riskDistribution.unassessed++;
      }
    } else {
      riskDistribution.unassessed++;
    }
  });

  return {
    totalUseCases: total,
    complete,
    partial,
    incomplete,
    completionPercentage: total > 0 ? Math.round((complete / total) * 100) : 0,
    riskDistribution,
    fieldCoverage
  };
}

function getCompletionStatus(uc: UseCase): 'complete' | 'partial' | 'incomplete' {
  const fields = [
    uc.explainabilityRequired,
    uc.customerHarmRisk,
    uc.humanAccountability,
    uc.dataOutsideUkEu,
    uc.thirdPartyModel
  ];
  const completed = fields.filter(f => f !== null && f !== '').length;
  if (completed === 5) return 'complete';
  if (completed > 0) return 'partial';
  return 'incomplete';
}

function FieldIndicator({ value, label }: { value: string | null; label: string }) {
  const hasValue = value !== null && value !== '';
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          hasValue 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          {hasValue ? '✓' : '-'}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{label}</p>
        <p className="text-sm">{hasValue ? `Value: ${value}` : 'Not assessed'}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function ResponsibleAIPortfolioView() {
  const { data: useCases, isLoading, isError } = useQuery<UseCase[]>({
    queryKey: ['/api/use-cases'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading governance data...</span>
      </div>
    );
  }

  if (isError || !useCases) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <span className="text-red-700">Failed to load portfolio data</span>
        </CardContent>
      </Card>
    );
  }

  const metrics = computeRAIMetrics(useCases);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsible AI Governance</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Portfolio-wide view of AI governance, risk assessments, and compliance status across {metrics.totalUseCases} use cases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-700 font-medium">Fully Assessed</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases with all 5 RAI fields completed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{metrics.complete}</p>
                  <p className="text-sm text-green-600">{metrics.completionPercentage}% of portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-yellow-700 font-medium">Partially Assessed</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-yellow-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases with 1-4 RAI fields completed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{metrics.partial}</p>
                  <p className="text-sm text-yellow-600">Need completion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-red-700 font-medium">Not Assessed</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-red-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use cases with no RAI fields completed</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">{metrics.incomplete}</p>
                  <p className="text-sm text-red-600">Require review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-700 font-medium">Governance Score</CardDescription>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall portfolio governance health based on RAI completion</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{metrics.completionPercentage}%</p>
                  <Progress value={metrics.completionPercentage} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Customer Harm Risk Distribution
              </CardTitle>
              <CardDescription>Risk levels across assessed use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Low Risk
                  </span>
                  <span className="font-medium">{metrics.riskDistribution.low}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Medium Risk
                  </span>
                  <span className="font-medium">{metrics.riskDistribution.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    High Risk
                  </span>
                  <span className="font-medium">{metrics.riskDistribution.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    Unassessed
                  </span>
                  <span className="font-medium">{metrics.riskDistribution.unassessed}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                RAI Field Coverage
              </CardTitle>
              <CardDescription>Completion rates for each governance dimension</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Explainability
                    </span>
                    <span className="text-sm font-medium">{metrics.fieldCoverage.explainability}/{metrics.totalUseCases}</span>
                  </div>
                  <Progress value={metrics.totalUseCases > 0 ? (metrics.fieldCoverage.explainability / metrics.totalUseCases) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Customer Harm Risk
                    </span>
                    <span className="text-sm font-medium">{metrics.fieldCoverage.customerHarm}/{metrics.totalUseCases}</span>
                  </div>
                  <Progress value={metrics.totalUseCases > 0 ? (metrics.fieldCoverage.customerHarm / metrics.totalUseCases) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Human Accountability
                    </span>
                    <span className="text-sm font-medium">{metrics.fieldCoverage.humanAccountability}/{metrics.totalUseCases}</span>
                  </div>
                  <Progress value={metrics.totalUseCases > 0 ? (metrics.fieldCoverage.humanAccountability / metrics.totalUseCases) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Data Location (UK/EU)
                    </span>
                    <span className="text-sm font-medium">{metrics.fieldCoverage.dataLocation}/{metrics.totalUseCases}</span>
                  </div>
                  <Progress value={metrics.totalUseCases > 0 ? (metrics.fieldCoverage.dataLocation / metrics.totalUseCases) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Third-Party Model
                    </span>
                    <span className="text-sm font-medium">{metrics.fieldCoverage.thirdParty}/{metrics.totalUseCases}</span>
                  </div>
                  <Progress value={metrics.totalUseCases > 0 ? (metrics.fieldCoverage.thirdParty / metrics.totalUseCases) * 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Use Case RAI Status</CardTitle>
            <CardDescription>Individual assessment status across all use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm" data-testid="table-rai-status">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Use Case</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">
                      <Tooltip>
                        <TooltipTrigger><Eye className="h-4 w-4 mx-auto" /></TooltipTrigger>
                        <TooltipContent>Explainability Required</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">
                      <Tooltip>
                        <TooltipTrigger><AlertTriangle className="h-4 w-4 mx-auto" /></TooltipTrigger>
                        <TooltipContent>Customer Harm Risk</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">
                      <Tooltip>
                        <TooltipTrigger><Users className="h-4 w-4 mx-auto" /></TooltipTrigger>
                        <TooltipContent>Human Accountability</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">
                      <Tooltip>
                        <TooltipTrigger><MapPin className="h-4 w-4 mx-auto" /></TooltipTrigger>
                        <TooltipContent>Data Outside UK/EU</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">
                      <Tooltip>
                        <TooltipTrigger><Building2 className="h-4 w-4 mx-auto" /></TooltipTrigger>
                        <TooltipContent>Third-Party Model</TooltipContent>
                      </Tooltip>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases.map((uc) => {
                    const status = getCompletionStatus(uc);
                    return (
                      <tr key={uc.id} className="border-b hover-elevate" data-testid={`row-uc-${uc.id}`}>
                        <td className="py-3 px-2 max-w-xs truncate" title={uc.title}>{uc.title}</td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant={status === 'complete' ? 'default' : status === 'partial' ? 'secondary' : 'destructive'}
                            className={
                              status === 'complete' ? 'bg-green-100 text-green-800' : 
                              status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }
                          >
                            {status === 'complete' ? 'Complete' : status === 'partial' ? 'Partial' : 'Incomplete'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FieldIndicator value={uc.explainabilityRequired} label="Explainability Required" />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FieldIndicator value={uc.customerHarmRisk} label="Customer Harm Risk" />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FieldIndicator value={uc.humanAccountability} label="Human Accountability" />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FieldIndicator value={uc.dataOutsideUkEu} label="Data Outside UK/EU" />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FieldIndicator value={uc.thirdPartyModel} label="Third-Party Model" />
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{uc.quadrant}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 text-center py-2">
                Showing all {useCases.length} use cases
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
