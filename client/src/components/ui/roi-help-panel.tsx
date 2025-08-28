import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, TrendingUp, Clock, Target, Calculator, Info } from "lucide-react";
import { getScoringFormulaExplanation } from "@shared/utils/roiExplanations";

export function ROIHelpPanel() {
  const formulas = getScoringFormulaExplanation();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          Understanding ROI Calculations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Learn how use cases are evaluated and why they receive specific ROI ratings
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">ROI Overview</TabsTrigger>
            <TabsTrigger value="formulas">Scoring Formulas</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* High ROI */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">High ROI</Badge>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-medium text-green-800 mb-2">Quick Win & Strategic Bet</h4>
                <p className="text-sm text-green-700 mb-3">
                  High business value potential justifies investment and resource allocation
                </p>
                <div className="space-y-1 text-xs text-green-600">
                  <div>• <strong>Quick Win:</strong> High impact, low effort (3-9 months)</div>
                  <div>• <strong>Strategic Bet:</strong> High impact, high effort (12-24 months)</div>
                </div>
              </div>

              {/* Medium ROI */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium ROI</Badge>
                  <Target className="h-4 w-4 text-yellow-600" />
                </div>
                <h4 className="font-medium text-yellow-800 mb-2">Experimental</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Moderate returns with learning benefits and capability building value
                </p>
                <div className="space-y-1 text-xs text-yellow-600">
                  <div>• Lower business impact but manageable effort</div>
                  <div>• Good for testing and skill development</div>
                  <div>• Typical timeframe: 6-12 months</div>
                </div>
              </div>

              {/* Poor ROI */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-red-100 text-red-800 border-red-300">Poor ROI</Badge>
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <h4 className="font-medium text-red-800 mb-2">Watchlist</h4>
                <p className="text-sm text-red-700 mb-3">
                  Low business value combined with high effort creates poor return prospects
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-red-600">
                  <div>
                    <strong>Issues:</strong> High resource requirement with minimal benefit
                  </div>
                  <div>
                    <strong>Recommendation:</strong> Defer, redesign, or focus elsewhere
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formulas" className="space-y-4">
            <div className="space-y-4">
              {/* Impact Formula */}
              <div className="p-4 bg-green-50 rounded-lg border">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Impact Score (Business Value)
                </h4>
                <p className="text-sm text-green-700 mb-3">{formulas.impactFormula}</p>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  Impact = (Revenue×20% + Cost×20% + Risk×20% + Partner×20% + Strategic×20%) ÷ 100
                </div>
                <p className="text-xs text-green-600 mt-2">
                  <strong>Tip:</strong> Higher weights on Revenue Impact and Cost Savings increase ROI ratings
                </p>
              </div>

              {/* Effort Formula */}
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Effort Score (Implementation Feasibility)
                </h4>
                <p className="text-sm text-blue-700 mb-3">{formulas.effortFormula}</p>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  Effort = (Data×20% + Technical×20% + Change×20% + Model×20% + Adoption×20%) ÷ 100
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Tip:</strong> Lower weights on Technical Complexity make implementation appear easier
                </p>
              </div>

              {/* ROI Concept */}
              <div className="p-4 bg-indigo-50 rounded-lg border">
                <h4 className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  ROI Calculation Logic
                </h4>
                <p className="text-sm text-indigo-700">{formulas.roiConcept}</p>
                <div className="mt-3 text-xs text-indigo-600 space-y-1">
                  <div>• <strong>Threshold:</strong> Configurable value (default 3.0) determines quadrant boundaries</div>
                  <div>• <strong>Higher threshold:</strong> More selective ROI requirements</div>
                  <div>• <strong>Lower threshold:</strong> More use cases qualify for High ROI</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Example 1 */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Example: Automated Claims Processing</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Impact Score:</strong> 4.2/5 (High revenue + cost savings)</div>
                  <div><strong>Effort Score:</strong> 2.8/5 (Good data readiness, manageable complexity)</div>
                  <div><strong>Quadrant:</strong> Quick Win</div>
                  <Badge className="bg-green-100 text-green-800">High ROI</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Why High ROI:</strong> Significant business value with reasonable implementation effort creates excellent return potential
                </p>
              </div>

              {/* Example 2 */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Example: Basic Chatbot</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Impact Score:</strong> 2.5/5 (Limited business impact)</div>
                  <div><strong>Effort Score:</strong> 2.2/5 (Easy to implement)</div>
                  <div><strong>Quadrant:</strong> Experimental</div>
                  <Badge className="bg-yellow-100 text-yellow-800">Medium ROI</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Why Medium ROI:</strong> Limited impact but low effort makes it suitable for learning and testing
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Compact ROI help tooltip for use in other components
 */
export function ROIHelpTooltip({ className = "" }: { className?: string }) {
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <div className="flex items-center gap-1">
        <HelpCircle className="h-3 w-3" />
        <span>ROI = Impact ÷ Effort. Higher impact + lower effort = better ROI</span>
      </div>
    </div>
  );
}