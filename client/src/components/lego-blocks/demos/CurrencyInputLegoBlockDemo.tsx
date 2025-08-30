import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrencyInputLegoBlock, CurrencyType, currencyUtils } from '../forms/CurrencyInputLegoBlock';
import { ArrowLeft, DollarSign, Globe, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

/**
 * CurrencyInputLegoBlockDemo - Comprehensive demo showcasing CurrencyInputLegoBlock capabilities
 */
export default function CurrencyInputLegoBlockDemo() {
  // Demo state for different scenarios
  const [basicAmount, setBasicAmount] = useState<number | null>(null);
  const [basicCurrency, setBasicCurrency] = useState<CurrencyType>('GBP');
  
  const [premiumAmount, setPremiumAmount] = useState<number | null>(null);
  const [premiumCurrency, setPremiumCurrency] = useState<CurrencyType>('USD');
  
  const [limitedAmount, setLimitedAmount] = useState<number | null>(null);
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null);
  
  const [disabledAmount] = useState<number | null>(1000000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-[#005DAA]">
            <DollarSign className="h-8 w-8" />
            <h1 className="text-3xl font-bold">CurrencyInputLegoBlock Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reusable currency input component with multi-currency support, validation, and formatting
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
        <Card className="border-[#005DAA]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#005DAA]">
              <Settings className="h-5 w-5" />
              <span>Key Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Globe className="h-8 w-8 text-[#005DAA] mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Multi-Currency</h3>
                <p className="text-sm text-gray-600">GBP, USD, EUR, CAD support</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Validation</h3>
                <p className="text-sm text-gray-600">Min/max range validation</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Formatting</h3>
                <p className="text-sm text-gray-600">Locale-aware number formatting</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Configurable</h3>
                <p className="text-sm text-gray-600">Props-based LEGO architecture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Basic Currency Input */}
          <Card className="border-[#005DAA]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#005DAA]">
                <DollarSign className="h-5 w-5" />
                <span>Basic Currency Input</span>
              </CardTitle>
              <p className="text-gray-600">
                Simple currency input with optional currency selector.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyInputLegoBlock
                label="Investment Amount"
                value={basicAmount}
                onChange={setBasicAmount}
                currency={basicCurrency}
                onCurrencyChange={setBasicCurrency}
                showCurrencySelector={true}
                placeholder="Enter amount"
                helpText="Select currency and enter investment amount"
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current State:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Value: {basicAmount || 'null'}</div>
                  <div>Currency: {basicCurrency}</div>
                  <div>Formatted: {currencyUtils.formatCurrency(basicAmount, basicCurrency)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Premium Input */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="h-5 w-5" />
                <span>Insurance Premium</span>
              </CardTitle>
              <p className="text-gray-600">
                Premium calculation with currency conversion.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyInputLegoBlock
                label="Annual Premium"
                value={premiumAmount}
                onChange={setPremiumAmount}
                currency={premiumCurrency}
                onCurrencyChange={setPremiumCurrency}
                showCurrencySelector={true}
                placeholder="Enter premium amount"
                helpText="Annual insurance premium in your preferred currency"
                required={true}
              />
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Premium Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Annual: {currencyUtils.formatCurrency(premiumAmount, premiumCurrency)}</div>
                  <div>Monthly: {currencyUtils.formatCurrency(premiumAmount ? premiumAmount / 12 : null, premiumCurrency)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Range Validation */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Settings className="h-5 w-5" />
                <span>Range Validation</span>
              </CardTitle>
              <p className="text-gray-600">
                Input with minimum and maximum value constraints.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyInputLegoBlock
                label="Coverage Limit"
                value={limitedAmount}
                onChange={setLimitedAmount}
                currency="GBP"
                min={10000}
                max={5000000}
                placeholder="10,000 - 5,000,000"
                helpText="Coverage limit must be between £10,000 and £5,000,000"
                required={true}
              />
              
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Validation Rules:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Minimum: £10,000</div>
                  <div>Maximum: £5,000,000</div>
                  <div>Current: {currencyUtils.formatCurrency(limitedAmount, 'GBP')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Planning */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <Globe className="h-5 w-5" />
                <span>Budget Planning</span>
              </CardTitle>
              <p className="text-gray-600">
                Simple budget input without currency selector.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyInputLegoBlock
                label="Annual Budget"
                value={budgetAmount}
                onChange={setBudgetAmount}
                currency="EUR"
                placeholder="Enter budget amount"
                helpText="Annual budget allocation in Euros"
              />
              
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Budget Breakdown:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Annual: {currencyUtils.formatCurrency(budgetAmount, 'EUR')}</div>
                  <div>Quarterly: {currencyUtils.formatCurrency(budgetAmount ? budgetAmount / 4 : null, 'EUR')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disabled State Demo */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Settings className="h-5 w-5" />
              <span>Disabled State</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInputLegoBlock
              label="Fixed Premium"
              value={disabledAmount}
              currency="CAD"
              disabled={true}
              helpText="This amount is set by the system and cannot be modified"
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Utility Functions Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#005DAA]">Utility Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Formatting Examples</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">formatCurrency(1234.56, 'GBP')</code> → {currencyUtils.formatCurrency(1234.56, 'GBP')}</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">formatCurrency(1000000, 'USD')</code> → {currencyUtils.formatCurrency(1000000, 'USD')}</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">formatCurrency(999.99, 'EUR')</code> → {currencyUtils.formatCurrency(999.99, 'EUR')}</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Validation Examples</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">parseCurrency('£1,234.56')</code> → {currencyUtils.parseCurrency('£1,234.56')}</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">parseCurrency('$10,000')</code> → {currencyUtils.parseCurrency('$10,000')}</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">validateCurrency(5000, 1000, 10000)</code> → {currencyUtils.validateCurrency(5000, 1000, 10000) || 'Valid'}</div>
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
                <h4 className="font-medium text-gray-900 mb-2">Props Configuration</h4>
                <p className="text-gray-600">Highly configurable through props including currency, validation, formatting, and styling options.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Utility Functions</h4>
                <p className="text-gray-600">Exported utility functions for currency formatting, parsing, and validation that can be reused across the application.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Form Integration</h4>
                <p className="text-gray-600">Follows standard form input patterns with proper accessibility, validation feedback, and error handling.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}