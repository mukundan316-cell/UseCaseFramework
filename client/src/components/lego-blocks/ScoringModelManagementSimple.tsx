import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, RotateCcw, Save } from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';

/**
 * LEGO Block: Simple Scoring Model Management
 * Allows admin users to configure scoring weights for the RSA AI Framework
 */
export default function ScoringModelManagementBlock() {
  const { updateMetadata, metadata } = useUseCases();
  const { toast } = useToast();
  
  // Business Value weights
  const [revenueWeight, setRevenueWeight] = useState(20);
  const [costWeight, setCostWeight] = useState(20);
  const [riskWeight, setRiskWeight] = useState(20);
  const [experienceWeight, setExperienceWeight] = useState(20);
  const [strategicWeight, setStrategicWeight] = useState(20);
  
  // Feasibility weights  
  const [dataWeight, setDataWeight] = useState(20);
  const [technicalWeight, setTechnicalWeight] = useState(20);
  const [changeWeight, setChangeWeight] = useState(20);
  const [modelWeight, setModelWeight] = useState(20);
  const [adoptionWeight, setAdoptionWeight] = useState(20);
  
  // AI Governance weights
  const [explainabilityWeight, setExplainabilityWeight] = useState(50);
  const [complianceWeight, setComplianceWeight] = useState(50);
  
  // Quadrant threshold
  const [quadrantThreshold, setQuadrantThreshold] = useState(3.0);

  const saveModel = async () => {
    try {
      const scoringModel = {
        businessValue: {
          revenueImpact: revenueWeight,
          costSavings: costWeight,
          riskReduction: riskWeight,
          brokerPartnerExperience: experienceWeight,
          strategicFit: strategicWeight
        },
        feasibility: {
          dataReadiness: dataWeight,
          technicalComplexity: technicalWeight,
          changeImpact: changeWeight,
          modelRisk: modelWeight,
          adoptionReadiness: adoptionWeight
        },
        aiGovernance: {
          explainabilityBias: explainabilityWeight,
          regulatoryCompliance: complianceWeight
        },
        quadrantThreshold: quadrantThreshold
      };

      await updateMetadata({
        ...metadata!,
        scoringModel: JSON.stringify(scoringModel)
      });

      toast({
        title: "Model Saved",
        description: "Scoring model configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save scoring model configuration.",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    setRevenueWeight(20);
    setCostWeight(20);
    setRiskWeight(20);
    setExperienceWeight(20);
    setStrategicWeight(20);
    setDataWeight(20);
    setTechnicalWeight(20);
    setChangeWeight(20);
    setModelWeight(20);
    setAdoptionWeight(20);
    setExplainabilityWeight(50);
    setComplianceWeight(50);
    setQuadrantThreshold(3.0);
    
    toast({
      title: "Model Reset",
      description: "Scoring model has been reset to default values.",
    });
  };

  const businessTotal = revenueWeight + costWeight + riskWeight + experienceWeight + strategicWeight;
  const feasibilityTotal = dataWeight + technicalWeight + changeWeight + modelWeight + adoptionWeight;
  const governanceTotal = explainabilityWeight + complianceWeight;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            RSA AI Framework Scoring Model Configuration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure weights for each scoring lever and define calculation formulas. 
            All changes affect how use cases are scored and positioned in the prioritization matrix.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={saveModel} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
            <Button onClick={resetToDefaults} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>

          <Tabs defaultValue="weights" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weights">Lever Weights</TabsTrigger>
              <TabsTrigger value="formulas">Scoring Formulas</TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-6">
              {/* Business Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Business Value Levers
                      </Badge>
                    </div>
                    <span className="text-sm">Total: {businessTotal}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Revenue Impact</Label>
                        <span className="text-sm font-mono">{revenueWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={revenueWeight}
                        onChange={(e) => setRevenueWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Cost Savings</Label>
                        <span className="text-sm font-mono">{costWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={costWeight}
                        onChange={(e) => setCostWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Risk Reduction</Label>
                        <span className="text-sm font-mono">{riskWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={riskWeight}
                        onChange={(e) => setRiskWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Broker/Partner Experience</Label>
                        <span className="text-sm font-mono">{experienceWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={experienceWeight}
                        onChange={(e) => setExperienceWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Strategic Fit</Label>
                        <span className="text-sm font-mono">{strategicWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={strategicWeight}
                        onChange={(e) => setStrategicWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feasibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Feasibility Levers
                      </Badge>
                    </div>
                    <span className="text-sm">Total: {feasibilityTotal}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Data Readiness</Label>
                        <span className="text-sm font-mono">{dataWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={dataWeight}
                        onChange={(e) => setDataWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Technical Complexity</Label>
                        <span className="text-sm font-mono">{technicalWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={technicalWeight}
                        onChange={(e) => setTechnicalWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Change Impact</Label>
                        <span className="text-sm font-mono">{changeWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={changeWeight}
                        onChange={(e) => setChangeWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Model Risk</Label>
                        <span className="text-sm font-mono">{modelWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={modelWeight}
                        onChange={(e) => setModelWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Adoption Readiness</Label>
                        <span className="text-sm font-mono">{adoptionWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={adoptionWeight}
                        onChange={(e) => setAdoptionWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Governance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        AI Governance Levers
                      </Badge>
                    </div>
                    <span className="text-sm">Total: {governanceTotal}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Explainability & Bias</Label>
                        <span className="text-sm font-mono">{explainabilityWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={explainabilityWeight}
                        onChange={(e) => setExplainabilityWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Regulatory Compliance</Label>
                        <span className="text-sm font-mono">{complianceWeight}%</span>
                      </div>
                      <input
                        type="range"
                        value={complianceWeight}
                        onChange={(e) => setComplianceWeight(parseInt(e.target.value))}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formulas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Calculation Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Impact Score Formula */}
                  <div className="p-4 bg-green-50 rounded-lg border">
                    <h4 className="font-medium text-green-800 mb-2">Impact Score (Y-Axis)</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Calculated as the weighted average of all Business Value levers
                    </p>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      Impact = (Revenue×{revenueWeight}% + Cost×{costWeight}% + Risk×{riskWeight}% + Experience×{experienceWeight}% + Strategic×{strategicWeight}%) ÷ 100
                    </div>
                  </div>

                  {/* Effort Score Formula */}
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <h4 className="font-medium text-blue-800 mb-2">Effort Score (X-Axis)</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Calculated as weighted average of Feasibility levers
                    </p>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      Effort = (Data×{dataWeight}% + Technical×{technicalWeight}% + Change×{changeWeight}% + ModelRisk×{modelWeight}% + Adoption×{adoptionWeight}%) ÷ 100
                    </div>
                  </div>

                  {/* Quadrant Threshold */}
                  <div className="p-4 bg-purple-50 rounded-lg border">
                    <h4 className="font-medium text-purple-800 mb-2">Quadrant Classification</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Threshold value that determines quadrant boundaries (1-5 scale)
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Threshold Value</Label>
                        <span className="font-mono">{quadrantThreshold.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        value={quadrantThreshold}
                        onChange={(e) => setQuadrantThreshold(parseFloat(e.target.value))}
                        max={5}
                        min={1}
                        step={0.1}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}