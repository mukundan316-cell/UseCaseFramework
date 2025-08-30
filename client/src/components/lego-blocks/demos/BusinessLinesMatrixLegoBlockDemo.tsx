import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BusinessLinesMatrixLegoBlock, { 
  BusinessLineData, 
  businessLinesMatrixUtils 
} from '../forms/BusinessLinesMatrixLegoBlock';
import { Building2, RefreshCw, Eye, Code } from 'lucide-react';

/**
 * BusinessLinesMatrixLegoBlockDemo - Interactive demonstration component
 */
export default function BusinessLinesMatrixLegoBlockDemo() {
  const [businessLines, setBusinessLines] = useState<BusinessLineData[]>(
    businessLinesMatrixUtils.createDefault([
      'Commercial Property & Casualty',
      'Personal Lines',
      'Specialty Insurance'
    ])
  );
  const [showJson, setShowJson] = useState(false);

  const handleReset = () => {
    setBusinessLines(businessLinesMatrixUtils.createDefault());
  };

  const handlePresetRSA = () => {
    setBusinessLines([
      { line: 'Commercial Property & Casualty', premium: 45.0, trend: 'up' },
      { line: 'Personal Lines', premium: 30.0, trend: 'stable' },
      { line: 'Specialty Insurance', premium: 15.0, trend: 'up' },
      { line: 'International', premium: 7.0, trend: 'down' },
      { line: 'Reinsurance', premium: 3.0, trend: 'stable' }
    ]);
  };

  const validationErrors = businessLinesMatrixUtils.validateBusinessLines(businessLines, true);
  const isValid = validationErrors.length === 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-[#005DAA]" />
            <span>BusinessLinesMatrixLegoBlock Demo</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Interactive demonstration of the business lines premium distribution matrix component.
            Test table editing, percentage validation, and growth trend indicators.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Default</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePresetRSA}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Load RSA Example</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              className="flex items-center space-x-2"
            >
              {showJson ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
              <span>{showJson ? 'Hide JSON' : 'Show JSON'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Component</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isValid ? "default" : "destructive"}>
              {isValid ? 'Valid' : 'Validation Errors'}
            </Badge>
            <Badge variant="outline">
              {businessLines.length} Lines
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <BusinessLinesMatrixLegoBlock
            businessLines={businessLines}
            onChange={setBusinessLines}
            label="Business Lines Premium Distribution"
            helpText="Distribute your organization's premium allocation across business lines. Total must equal 100%."
            required={true}
            minLines={1}
            maxLines={8}
          />
        </CardContent>
      </Card>

      {/* Validation Status */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 flex items-center space-x-2">
                  <span>•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* JSON Output */}
      {showJson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JSON Output</CardTitle>
            <p className="text-sm text-gray-600">
              This is the data structure that would be saved to the database.
            </p>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify({ businessLines }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Component Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Table Functionality</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Editable business line names (click to edit)</li>
                <li>• Premium percentage input with validation</li>
                <li>• Growth trend selection with visual indicators</li>
                <li>• Add/remove lines with constraints</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Validation & Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Real-time 100% total validation</li>
                <li>• Auto-distribute remaining percentage</li>
                <li>• Configurable min/max line limits</li>
                <li>• JSON serialization for database storage</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Growth Trends</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• ↑ Growing (green)</li>
                <li>• ↓ Declining (red)</li>
                <li>• → Stable (gray)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Props Interface</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• businessLines: BusinessLineData[]</li>
                <li>• onChange: (lines) =&gt; void</li>
                <li>• enforceTotal: boolean</li>
                <li>• Standard form props (label, error, etc.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
{`import BusinessLinesMatrixLegoBlock from '../forms/BusinessLinesMatrixLegoBlock';

function MyComponent() {
  const [businessLines, setBusinessLines] = useState([
    { line: "Commercial P&C", premium: 45, trend: "up" },
    { line: "Personal Lines", premium: 30, trend: "stable" },
    { line: "Specialty", premium: 25, trend: "up" }
  ]);

  return (
    <BusinessLinesMatrixLegoBlock
      businessLines={businessLines}
      onChange={setBusinessLines}
      enforceTotal={true}
      label="Premium Distribution"
      required={true}
    />
  );
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}