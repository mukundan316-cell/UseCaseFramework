import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PercentageAllocationLegoBlock, 
  AllocationCategory, 
  AllocationValues, 
  allocationUtils 
} from './PercentageAllocationLegoBlock';
import { ArrowLeft, PieChart, Target, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'wouter';

/**
 * PercentageAllocationLegoBlockDemo - Comprehensive demo showcasing PercentageAllocationLegoBlock capabilities
 */
export default function PercentageAllocationLegoBlockDemo() {
  // Demo state for different allocation scenarios
  const [budgetAllocation, setBudgetAllocation] = useState<AllocationValues>({});
  const [riskAllocation, setRiskAllocation] = useState<AllocationValues>({
    'low': 40,
    'medium': 35,
    'high': 15
  });
  const [portfolioAllocation, setPortfolioAllocation] = useState<AllocationValues>({});
  const [constrainedAllocation, setConstrainedAllocation] = useState<AllocationValues>({});

  // Sample categories for different scenarios
  const budgetCategories: AllocationCategory[] = [
    { id: 'technology', label: 'Technology & Infrastructure', color: '#3C2CDA' },
    { id: 'people', label: 'People & Training', color: '#0066CC' },
    { id: 'operations', label: 'Operations & Processes', color: '#3399FF' },
    { id: 'marketing', label: 'Marketing & Sales', color: '#66B2FF' },
    { id: 'research', label: 'Research & Development', color: '#99CCFF' }
  ];

  const riskCategories: AllocationCategory[] = [
    { 
      id: 'low', 
      label: 'Low Risk Assets', 
      description: 'Government bonds, savings accounts',
      color: '#22C55E' 
    },
    { 
      id: 'medium', 
      label: 'Medium Risk Assets', 
      description: 'Corporate bonds, balanced funds',
      color: '#F59E0B' 
    },
    { 
      id: 'high', 
      label: 'High Risk Assets', 
      description: 'Stocks, commodities, crypto',
      color: '#EF4444' 
    }
  ];

  const portfolioCategories: AllocationCategory[] = [
    { id: 'property', label: 'Property Insurance', color: '#8B5CF6' },
    { id: 'motor', label: 'Motor Insurance', color: '#06B6D4' },
    { id: 'liability', label: 'Liability Coverage', color: '#10B981' },
    { id: 'life', label: 'Life Insurance', color: '#F59E0B' },
    { id: 'health', label: 'Health Insurance', color: '#EF4444' },
    { id: 'travel', label: 'Travel Insurance', color: '#8B5CF6' }
  ];

  const constrainedCategories: AllocationCategory[] = [
    { 
      id: 'core', 
      label: 'Core Systems', 
      description: 'Mission-critical infrastructure',
      minValue: 20, 
      maxValue: 50,
      color: '#DC2626' 
    },
    { 
      id: 'innovation', 
      label: 'Innovation Projects', 
      description: 'New technology initiatives',
      minValue: 10, 
      maxValue: 30,
      color: '#7C3AED' 
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance & Support', 
      description: 'Ongoing operational costs',
      minValue: 15, 
      maxValue: 40,
      color: '#059669' 
    },
    { 
      id: 'training', 
      label: 'Training & Development', 
      description: 'Skills development programs',
      minValue: 5, 
      maxValue: 25,
      color: '#0891B2' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-[#3C2CDA]">
            <PieChart className="h-8 w-8" />
            <h1 className="text-3xl font-bold">PercentageAllocationLegoBlock Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reusable percentage allocation component with validation, visual feedback, and configurable constraints
            following RSA's LEGO architecture principles.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Overview */}
        <Card className="border-[#3C2CDA]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#3C2CDA]">
              <Target className="h-5 w-5" />
              <span>Key Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <PieChart className="h-8 w-8 text-[#3C2CDA] mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Visual Allocation</h3>
                <p className="text-sm text-gray-600">Progress bars and percentage display</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">100% Validation</h3>
                <p className="text-sm text-gray-600">Real-time validation and feedback</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Constraints</h3>
                <p className="text-sm text-gray-600">Min/max limits per category</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Auto Distribute</h3>
                <p className="text-sm text-gray-600">Smart allocation assistance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Budget Allocation */}
          <Card className="border-[#3C2CDA]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#3C2CDA]">
                <PieChart className="h-5 w-5" />
                <span>Budget Allocation</span>
              </CardTitle>
              <p className="text-gray-600">
                Allocate annual budget across different business areas.
              </p>
            </CardHeader>
            <CardContent>
              <PercentageAllocationLegoBlock
                label="Annual Budget Distribution"
                categories={budgetCategories}
                values={budgetAllocation}
                onChange={setBudgetAllocation}
                helpText="Distribute your annual budget across key business areas"
                showRemaining={true}
                required={true}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Allocation:</h4>
                <pre className="text-sm text-gray-600 bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(budgetAllocation, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Risk Portfolio */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="h-5 w-5" />
                <span>Risk Portfolio (Partial)</span>
              </CardTitle>
              <p className="text-gray-600">
                Investment portfolio with partial allocation allowed.
              </p>
            </CardHeader>
            <CardContent>
              <PercentageAllocationLegoBlock
                label="Investment Risk Distribution"
                categories={riskCategories}
                values={riskAllocation}
                onChange={setRiskAllocation}
                allowPartial={true}
                helpText="Allocate your investment portfolio by risk level (partial allocation allowed)"
                showRemaining={true}
              />
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Portfolio Status:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total: {allocationUtils.calculateTotal(riskAllocation).toFixed(1)}%</div>
                  <div>Remaining: {allocationUtils.calculateRemaining(riskAllocation).toFixed(1)}%</div>
                  <div>Valid: {allocationUtils.validateAllocation(riskAllocation, riskCategories, true) ? 'No' : 'Yes'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Portfolio */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Target className="h-5 w-5" />
                <span>Insurance Portfolio</span>
              </CardTitle>
              <p className="text-gray-600">
                Distribute insurance coverage across different product lines.
              </p>
            </CardHeader>
            <CardContent>
              <PercentageAllocationLegoBlock
                label="Insurance Product Mix"
                categories={portfolioCategories}
                values={portfolioAllocation}
                onChange={setPortfolioAllocation}
                helpText="Define your insurance product portfolio distribution"
                precision={0}
              />
              
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Product Mix:</h4>
                <div className="text-sm text-gray-600">
                  Total allocated: {allocationUtils.calculateTotal(portfolioAllocation)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Constrained Allocation */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <Settings className="h-5 w-5" />
                <span>Constrained Allocation</span>
              </CardTitle>
              <p className="text-gray-600">
                Allocation with minimum and maximum constraints per category.
              </p>
            </CardHeader>
            <CardContent>
              <PercentageAllocationLegoBlock
                label="IT Budget with Constraints"
                categories={constrainedCategories}
                values={constrainedAllocation}
                onChange={setConstrainedAllocation}
                helpText="Each category has minimum and maximum allocation limits"
                required={true}
              />
              
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Constraints:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {constrainedCategories.map(cat => (
                    <div key={cat.id}>
                      {cat.label}: {cat.minValue}% - {cat.maxValue}%
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State Demo */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Settings className="h-5 w-5" />
              <span>Empty State</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentageAllocationLegoBlock
              categories={[]}
              values={{}}
              onChange={() => {}}
              label="No Categories Provided"
              helpText="This shows the placeholder state when no categories are provided"
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Utility Functions Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#3C2CDA]">Utility Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Calculation Examples</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">calculateTotal({'{'}"a": 30, "b": 70{'}'})</code> → {allocationUtils.calculateTotal({"a": 30, "b": 70})}%</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">calculateRemaining({'{'}"a": 30, "b": 40{'}'})</code> → {allocationUtils.calculateRemaining({"a": 30, "b": 40})}%</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">formatPercentage(33.333, 1)</code> → {allocationUtils.formatPercentage(33.333, 1)}%</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Validation Examples</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">validateAllocation(over100%, ...)</code> → Error message</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">validateAllocation(under100%, partial=false)</code> → Error message</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">validateAllocation(exactly100%, ...)</code> → {allocationUtils.validateAllocation({"a": 50, "b": 50}, [], false) || 'Valid'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LEGO Architecture Info */}
        <Card className="border-[#3C2CDA]/20 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#3C2CDA]">LEGO Block Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Configurable Categories</h4>
                <p className="text-gray-600">Define categories with labels, descriptions, colors, and min/max constraints through props.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Real-time Validation</h4>
                <p className="text-gray-600">Built-in validation utilities ensure allocations meet requirements with immediate feedback.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Visual Feedback</h4>
                <p className="text-gray-600">Progress bars, color coding, and summary displays provide clear visual allocation status.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}