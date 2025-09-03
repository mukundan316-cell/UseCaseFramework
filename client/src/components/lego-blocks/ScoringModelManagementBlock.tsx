import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Settings, RotateCcw, Save } from 'lucide-react';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';

/**
 * LEGO Block: Scoring Model Management
 * Allows admin users to configure scoring weights and formulas for the RSA AI Framework
 */

interface ScoringLever {
  key: string;
  name: string;
  weight: number;
}

interface ScoringCategory {
  name: string;
  color: string;
  levers: ScoringLever[];
}

interface ScoringModel {
  categories: {
    businessValue: ScoringCategory;
    feasibility: ScoringCategory;
  };
  formulas: {
    impactScore: string;
    effortScore: string;
    quadrantThreshold: number;
  };
}

const DEFAULT_SCORING_MODEL = {
  categories: {
    businessValue: {
      name: "Business Value",
      color: "green",
      levers: [
        { key: "revenueImpact", name: "Revenue Impact", weight: 20 },
        { key: "costSavings", name: "Cost Savings", weight: 20 },
        { key: "riskReduction", name: "Risk Reduction", weight: 20 },
        { key: "brokerPartnerExperience", name: "Broker/Partner Experience", weight: 20 },
        { key: "strategicFit", name: "Strategic Fit", weight: 20 }
      ]
    },
    feasibility: {
      name: "Feasibility",
      color: "blue", 
      levers: [
        { key: "dataReadiness", name: "Data Readiness", weight: 20 },
        { key: "technicalComplexity", name: "Technical Complexity", weight: 20 },
        { key: "changeImpact", name: "Change Impact", weight: 20 },
        { key: "modelRisk", name: "Model Risk", weight: 20 },
        { key: "adoptionReadiness", name: "Adoption Readiness", weight: 20 }
      ]
    }
  },
  formulas: {
    impactScore: "Average of Business Value levers",
    effortScore: "Average of Feasibility levers (inverted for complexity)",
    quadrantThreshold: 3.0
  }
};

export default function ScoringModelManagementBlock() {
  const { updateMetadata, metadata } = useUseCases();
  const { toast } = useToast();
  
  // Initialize scoring model from metadata or use defaults
  const [scoringModel, setScoringModel] = useState(() => {
    if (metadata?.scoringModel) {
      try {
        return typeof metadata.scoringModel === 'string' 
          ? JSON.parse(metadata.scoringModel) 
          : metadata.scoringModel;
      } catch {
        return DEFAULT_SCORING_MODEL;
      }
    }
    return DEFAULT_SCORING_MODEL;
  });

  const [quadrantThreshold, setQuadrantThreshold] = useState(scoringModel.formulas.quadrantThreshold);

  const updateLeverWeight = (categoryKey: keyof ScoringModel['categories'], leverKey: string, newWeight: number) => {
    setScoringModel((prev: ScoringModel) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          levers: prev.categories[categoryKey].levers.map((lever: ScoringLever) => 
            lever.key === leverKey ? { ...lever, weight: newWeight } : lever
          )
        }
      }
    }));
  };

  const normalizeWeights = (categoryKey: keyof ScoringModel['categories']) => {
    const category = scoringModel.categories[categoryKey];
    const totalWeight = category.levers.reduce((sum: number, lever: ScoringLever) => sum + lever.weight, 0);
    
    if (totalWeight === 100) return; // Already normalized
    
    const normalizedLevers = category.levers.map((lever: ScoringLever) => ({
      ...lever,
      weight: Math.round((lever.weight / totalWeight) * 100)
    }));
    
    setScoringModel((prev: ScoringModel) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          levers: normalizedLevers
        }
      }
    }));
  };

  const resetToDefaults = () => {
    setScoringModel(DEFAULT_SCORING_MODEL);
    setQuadrantThreshold(DEFAULT_SCORING_MODEL.formulas.quadrantThreshold);
    toast({
      title: "Model Reset",
      description: "Scoring model has been reset to default values.",
    });
  };

  const saveModel = async () => {
    try {
      const updatedModel = {
        ...scoringModel,
        formulas: {
          ...scoringModel.formulas,
          quadrantThreshold
        }
      };

      await updateMetadata({
        ...metadata!,
        scoringModel: updatedModel
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

  const getCategoryTotal = (categoryKey: keyof ScoringModel['categories']) => {
    return scoringModel.categories[categoryKey].levers.reduce((sum: number, lever: ScoringLever) => sum + lever.weight, 0);
  };

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
              {(Object.entries(scoringModel.categories) as [keyof ScoringModel['categories'], ScoringCategory][]).map(([categoryKey, category]) => (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`bg-${category.color}-100 text-${category.color}-800`}>
                          {category.name}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ({category.levers.length} levers)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Total: {getCategoryTotal(categoryKey as keyof ScoringModel['categories'])}%</span>
                        <Button 
                          onClick={() => normalizeWeights(categoryKey as keyof ScoringModel['categories'])}
                          size="sm" 
                          variant="outline"
                        >
                          Normalize to 100%
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.levers.map((lever: ScoringLever) => (
                        <div key={lever.key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">{lever.name}</Label>
                            <span className="text-sm font-mono">{lever.weight}%</span>
                          </div>
                          <input
                            type="range"
                            value={lever.weight}
                            onChange={(e) => updateLeverWeight(categoryKey as keyof ScoringModel['categories'], lever.key, parseInt(e.target.value))}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="formulas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Scoring Calculation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Impact Score Formula */}
                  <div className="p-4 bg-green-50 rounded-lg border">
                    <h4 className="font-medium text-green-800 mb-2">Impact Score (Y-Axis)</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Calculated as the weighted average of all Business Value levers
                    </p>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      Impact = (Revenue×{scoringModel.categories.businessValue.levers[0].weight}% + 
                      Cost×{scoringModel.categories.businessValue.levers[1].weight}% + 
                      Risk×{scoringModel.categories.businessValue.levers[2].weight}% + 
                      Experience×{scoringModel.categories.businessValue.levers[3].weight}% + 
                      Strategic×{scoringModel.categories.businessValue.levers[4].weight}%) ÷ 100
                    </div>
                  </div>

                  {/* Effort Score Formula */}
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <h4 className="font-medium text-blue-800 mb-2">Effort Score (X-Axis)</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Calculated as weighted average of Feasibility levers (complexity factors inverted)
                    </p>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      Effort = (Data×{scoringModel.categories.feasibility.levers[0].weight}% + 
                      (6-Technical)×{scoringModel.categories.feasibility.levers[1].weight}% + 
                      (6-Change)×{scoringModel.categories.feasibility.levers[2].weight}% + 
                      (6-ModelRisk)×{scoringModel.categories.feasibility.levers[3].weight}% + 
                      Adoption×{scoringModel.categories.feasibility.levers[4].weight}%) ÷ 100
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
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>• Impact ≥ {quadrantThreshold.toFixed(1)} & Effort &lt; {quadrantThreshold.toFixed(1)} = <strong>Quick Win</strong></div>
                        <div>• Impact ≥ {quadrantThreshold.toFixed(1)} & Effort ≥ {quadrantThreshold.toFixed(1)} = <strong>Strategic Bet</strong></div>
                        <div>• Impact &lt; {quadrantThreshold.toFixed(1)} & Effort &lt; {quadrantThreshold.toFixed(1)} = <strong>Experimental</strong></div>
                        <div>• Impact &lt; {quadrantThreshold.toFixed(1)} & Effort ≥ {quadrantThreshold.toFixed(1)} = <strong>Watchlist</strong></div>
                      </div>
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