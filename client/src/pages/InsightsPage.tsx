import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Target, Users, Shield, Library, CheckCircle2, HelpCircle } from 'lucide-react';
import ValueRealizationView from '@/components/insights/ValueRealizationView';
import OperatingModelView from '@/components/insights/OperatingModelView';
import CapabilityTransitionView from '@/components/insights/CapabilityTransitionView';
import ResponsibleAIPortfolioView from '@/components/insights/ResponsibleAIPortfolioView';

type InsightsSubTab = 'value-realization' | 'operating-model' | 'capability-transition' | 'responsible-ai';
export type InsightsScope = 'active' | 'all';

interface InsightsPageProps {
  defaultTab?: InsightsSubTab;
}

export default function InsightsPage({ defaultTab = 'value-realization' }: InsightsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<InsightsSubTab>(defaultTab);
  const [scope, setScope] = useState<InsightsScope>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
            <p className="text-gray-600">Portfolio analytics and value tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  <strong>Active Portfolio:</strong> Use cases that passed all governance gates<br/>
                  <strong>Reference Library:</strong> All use cases for strategic planning
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <Button
              variant={scope === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScope('active')}
              className="flex items-center gap-1.5"
              data-testid="scope-toggle-active"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active Portfolio
            </Button>
            <Button
              variant={scope === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScope('all')}
              className="flex items-center gap-1.5"
              data-testid="scope-toggle-all"
            >
              <Library className="h-3.5 w-3.5" />
              Reference Library
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as InsightsSubTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="value-realization" className="flex items-center gap-2" data-testid="tab-value-realization">
                <TrendingUp className="h-4 w-4" />
                Value Realization
              </TabsTrigger>
              <TabsTrigger value="operating-model" className="flex items-center gap-2" data-testid="tab-operating-model">
                <Target className="h-4 w-4" />
                Operating Model
              </TabsTrigger>
              <TabsTrigger value="capability-transition" className="flex items-center gap-2" data-testid="tab-capability-transition">
                <Users className="h-4 w-4" />
                Capability Transition
              </TabsTrigger>
              <TabsTrigger value="responsible-ai" className="flex items-center gap-2" data-testid="tab-responsible-ai">
                <Shield className="h-4 w-4" />
                Responsible AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="value-realization" className="space-y-6">
              <ValueRealizationView scope={scope} />
            </TabsContent>

            <TabsContent value="operating-model" className="space-y-6">
              <OperatingModelView scope={scope} />
            </TabsContent>

            <TabsContent value="capability-transition" className="space-y-6">
              <CapabilityTransitionView scope={scope} />
            </TabsContent>

            <TabsContent value="responsible-ai" className="space-y-6">
              <ResponsibleAIPortfolioView scope={scope} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
