import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Users, Shield } from 'lucide-react';
import ValueRealizationView from '@/components/insights/ValueRealizationView';
import OperatingModelView from '@/components/insights/OperatingModelView';
import CapabilityTransitionView from '@/components/insights/CapabilityTransitionView';
import ResponsibleAIPortfolioView from '@/components/insights/ResponsibleAIPortfolioView';

type InsightsSubTab = 'value-realization' | 'operating-model' | 'capability-transition' | 'responsible-ai';

interface InsightsPageProps {
  defaultTab?: InsightsSubTab;
}

export default function InsightsPage({ defaultTab = 'value-realization' }: InsightsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<InsightsSubTab>(defaultTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600">Portfolio analytics and value tracking</p>
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
              <ValueRealizationView />
            </TabsContent>

            <TabsContent value="operating-model" className="space-y-6">
              <OperatingModelView />
            </TabsContent>

            <TabsContent value="capability-transition" className="space-y-6">
              <CapabilityTransitionView />
            </TabsContent>

            <TabsContent value="responsible-ai" className="space-y-6">
              <ResponsibleAIPortfolioView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
