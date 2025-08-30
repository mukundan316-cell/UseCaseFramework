import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RankingLegoBlock, RankingItem } from '../forms/RankingLegoBlock';
import { ArrowLeft, ListOrdered, Target, Users, Zap } from 'lucide-react';
import { Link } from 'wouter';

/**
 * RankingLegoBlockDemo - Comprehensive demo showcasing RankingLegoBlock capabilities
 */
export default function RankingLegoBlockDemo() {
  // Demo state for different scenarios
  const [useCaseRanking, setUseCaseRanking] = useState<string[]>([]);
  const [priorityRanking, setPriorityRanking] = useState<string[]>(['P1', 'P3']);
  const [capabilityRanking, setCapabilityRanking] = useState<string[]>([]);

  // Sample data for use case prioritization (Q54-Q56 style)
  const useCaseItems: RankingItem[] = [
    {
      id: 'UC001',
      label: 'Automated Claims Processing',
      description: 'AI-powered claims assessment and approval workflow',
      category: 'Claims Management'
    },
    {
      id: 'UC002', 
      label: 'Risk Assessment & Pricing',
      description: 'Dynamic pricing models based on real-time risk analysis',
      category: 'Underwriting'
    },
    {
      id: 'UC003',
      label: 'Fraud Detection System',
      description: 'Machine learning models to identify fraudulent claims',
      category: 'Risk Management'
    },
    {
      id: 'UC004',
      label: 'Customer Chatbot & Support',
      description: 'AI-driven customer service and policy information assistant',
      category: 'Customer Experience'
    },
    {
      id: 'UC005',
      label: 'Predictive Maintenance',
      description: 'IoT and AI for proactive risk prevention in commercial properties',
      category: 'Loss Prevention'
    },
    {
      id: 'UC006',
      label: 'Document Processing',
      description: 'Automated extraction and classification of policy documents',
      category: 'Operations'
    },
    {
      id: 'UC007',
      label: 'Regulatory Compliance Monitoring',
      description: 'Automated tracking and reporting of regulatory requirements',
      category: 'Compliance'
    },
    {
      id: 'UC008',
      label: 'Market Intelligence Platform',
      description: 'Competitive analysis and market trend identification',
      category: 'Strategy'
    }
  ];

  const priorityItems: RankingItem[] = [
    { id: 'P1', label: 'Immediate Impact (0-3 months)', description: 'Quick wins with measurable ROI' },
    { id: 'P2', label: 'Short Term (3-6 months)', description: 'Tactical improvements with clear benefits' },
    { id: 'P3', label: 'Medium Term (6-12 months)', description: 'Strategic initiatives requiring investment' },
    { id: 'P4', label: 'Long Term (12+ months)', description: 'Transformational changes with high complexity' },
    { id: 'P5', label: 'Future Consideration', description: 'Ideas for future exploration' }
  ];

  const capabilityItems: RankingItem[] = [
    { id: 'C1', label: 'Data Analytics', category: 'Technical' },
    { id: 'C2', label: 'Machine Learning', category: 'Technical' },
    { id: 'C3', label: 'Process Automation', category: 'Operational' },
    { id: 'C4', label: 'Customer Experience', category: 'Business' },
    { id: 'C5', label: 'Risk Management', category: 'Business' },
    { id: 'C6', label: 'Regulatory Compliance', category: 'Governance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-[#005DAA]">
            <ListOrdered className="h-8 w-8" />
            <h1 className="text-3xl font-bold">RankingLegoBlock Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Drag-and-drop ranking component for use case prioritization with mobile-friendly touch interface,
            visual feedback, and comprehensive validation.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Overview */}
        <Card className="border-[#005DAA]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#005DAA]">
              <Target className="h-5 w-5" />
              <span>Key Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Zap className="h-8 w-8 text-[#005DAA] mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Drag & Drop</h3>
                <p className="text-sm text-gray-600">Intuitive reordering with visual feedback</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Mobile Friendly</h3>
                <p className="text-sm text-gray-600">Touch-optimized for all devices</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ListOrdered className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Validation</h3>
                <p className="text-sm text-gray-600">Ensures complete ranking with feedback</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Flexible</h3>
                <p className="text-sm text-gray-600">Configurable limits and partial ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          
          {/* Use Case Prioritization Demo */}
          <Card className="border-[#005DAA]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-[#005DAA]">
                  <ListOrdered className="h-5 w-5" />
                  <span>Q54: Use Case Prioritization (Top 5)</span>
                </CardTitle>
                <Badge variant="outline">RSA Assessment Question</Badge>
              </div>
              <p className="text-gray-600">
                Rank the top 5 AI use cases that would deliver the most value to RSA in the next 12 months.
                Drag items from the available list to your ranking.
              </p>
            </CardHeader>
            <CardContent>
              <RankingLegoBlock
                question={{
                  id: 'Q54',
                  questionText: 'Which AI use cases should RSA prioritize for maximum business impact?',
                  helpText: 'Consider factors like ROI, feasibility, strategic alignment, and time to value.',
                  isRequired: true
                }}
                items={useCaseItems}
                value={useCaseRanking}
                onChange={setUseCaseRanking}
                maxRank={5}
                showNumbers={true}
                allowPartial={false}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Ranking (JSON):</h4>
                <pre className="text-sm text-gray-600 bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(useCaseRanking, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Priority Demo */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Target className="h-5 w-5" />
                <span>Q55: Implementation Timeline Ranking</span>
              </CardTitle>
              <p className="text-gray-600">
                Rank implementation phases by priority. Some items may already be pre-selected based on previous answers.
              </p>
            </CardHeader>
            <CardContent>
              <RankingLegoBlock
                question={{
                  id: 'Q55',
                  questionText: 'In what order should RSA implement these AI initiatives?',
                  helpText: 'Consider dependencies, resource requirements, and business readiness.',
                  isRequired: false
                }}
                items={priorityItems}
                value={priorityRanking}
                onChange={setPriorityRanking}
                showNumbers={true}
                allowPartial={true}
              />
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Partial Ranking Allowed:</h4>
                <p className="text-sm text-gray-600">
                  This question allows partial completion. Current progress: {priorityRanking.length}/{priorityItems.length} items ranked.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Capability Development Demo */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Users className="h-5 w-5" />
                <span>Q56: Capability Development Ranking</span>
              </CardTitle>
              <p className="text-gray-600">
                Rank the capabilities RSA should develop first to support AI initiatives.
              </p>
            </CardHeader>
            <CardContent>
              <RankingLegoBlock
                question={{
                  id: 'Q56',
                  questionText: 'Which capabilities should RSA develop first to support AI initiatives?',
                  helpText: 'Focus on foundational capabilities that enable multiple use cases.',
                  isRequired: true
                }}
                items={capabilityItems}
                value={capabilityRanking}
                onChange={setCapabilityRanking}
                maxRank={6}
                showNumbers={true}
                allowPartial={false}
              />
              
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Full Ranking Required:</h4>
                <p className="text-sm text-gray-600">
                  This question requires all {capabilityItems.length} items to be ranked before submission.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Configuration Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#005DAA]">Configuration Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Props Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">maxRank</code> - Limit number of items to rank</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">allowPartial</code> - Allow incomplete rankings</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">showNumbers</code> - Display ranking numbers</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">disabled</code> - Read-only mode</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Data Format</h4>
                <div className="space-y-2 text-sm">
                  <div>Input: Array of <code className="bg-gray-100 px-2 py-1 rounded">RankingItem</code> objects</div>
                  <div>Output: Array of item IDs in ranked order</div>
                  <div>Storage: JSON array in <code className="bg-gray-100 px-2 py-1 rounded">question_answers.answerValue</code></div>
                  <div>Validation: Configurable completion requirements</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LEGO Architecture Info */}
        <Card className="border-[#005DAA]/20 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#005DAA]">LEGO Block Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reusable Design</h4>
                <p className="text-gray-600">Built following RSA's "Build Once, Reuse Everywhere" principle with props-based configuration.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Database Integration</h4>
                <p className="text-gray-600">Seamlessly integrates with questionnaire system and stores ranking data as JSON arrays.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Accessibility</h4>
                <p className="text-gray-600">Full keyboard navigation, screen reader support, and WCAG compliance built-in.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}