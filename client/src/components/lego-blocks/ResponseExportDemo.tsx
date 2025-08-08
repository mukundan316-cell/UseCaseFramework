import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResponseExportLegoBlock from './ResponseExportLegoBlock';
import { FileText, Download } from 'lucide-react';

/**
 * Demo component showcasing the ResponseExportLegoBlock
 * Demonstrates different configurations and use cases
 */
export default function ResponseExportDemo() {
  // Mock response ID for demo purposes
  const mockResponseId = "demo-response-123";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#005DAA]" />
            <span>ResponseExportLegoBlock Demo</span>
          </CardTitle>
          <CardDescription>
            Reusable export functionality for completed assessments with PDF, Excel, and JSON formats
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Basic Usage */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Badge variant="outline">Basic</Badge>
              <span>Default Export Button</span>
            </h3>
            <div className="flex items-center space-x-4">
              <ResponseExportLegoBlock
                responseId={mockResponseId}
                assessmentTitle="Basic Assessment Export"
              />
              <span className="text-sm text-gray-600">
                Standard export with all formats available
              </span>
            </div>
          </div>

          {/* Compact Version */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Badge variant="outline">Compact</Badge>
              <span>Icon Only (No Label)</span>
            </h3>
            <div className="flex items-center space-x-4">
              <ResponseExportLegoBlock
                responseId={mockResponseId}
                assessmentTitle="Compact Export Demo"
                size="sm"
                showLabel={false}
                variant="ghost"
              />
              <span className="text-sm text-gray-600">
                Icon-only version for tight spaces
              </span>
            </div>
          </div>

          {/* Dashboard Integration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Badge variant="outline">Dashboard</Badge>
              <span>Assessment Results Integration</span>
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">AI Maturity Assessment Results</h4>
                  <p className="text-sm text-gray-600">Completed on January 8, 2025</p>
                </div>
                <div className="flex items-center space-x-3">
                  <ResponseExportLegoBlock
                    responseId={mockResponseId}
                    assessmentTitle="AI Maturity Assessment - John Doe"
                    variant="outline"
                    size="sm"
                  />
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-[#005DAA]">85%</div>
                  <div className="text-xs text-gray-600">Overall Score</div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-[#005DAA]">Managed</div>
                  <div className="text-xs text-gray-600">Maturity Level</div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-[#005DAA]">24</div>
                  <div className="text-xs text-gray-600">Responses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Different Variants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Badge variant="outline">Variants</Badge>
              <span>Different Button Styles</span>
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <ResponseExportLegoBlock
                  responseId={mockResponseId}
                  assessmentTitle="Default Variant"
                  variant="default"
                  size="sm"
                />
                <span className="text-xs text-gray-500">Default</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <ResponseExportLegoBlock
                  responseId={mockResponseId}
                  assessmentTitle="Outline Variant"
                  variant="outline"
                  size="sm"
                />
                <span className="text-xs text-gray-500">Outline</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <ResponseExportLegoBlock
                  responseId={mockResponseId}
                  assessmentTitle="Ghost Variant"
                  variant="ghost"
                  size="sm"
                />
                <span className="text-xs text-gray-500">Ghost</span>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Export Formats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">PDF Report</span>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive assessment report with scores, recommendations, and detailed analysis
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="font-semibold">Excel Spreadsheet</span>
                </div>
                <p className="text-sm text-gray-600">
                  Structured data export for analysis with detailed scoring breakdown and pivot tables
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="font-semibold">JSON Data</span>
                </div>
                <p className="text-sm text-gray-600">
                  Raw data export for integration with external systems and custom analysis tools
                </p>
              </div>
            </div>
          </div>

          {/* Usage Notes */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Usage Notes</span>
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Export functionality requires a valid responseId from completed assessments</li>
              <li>• PDF exports are HTML-based and can be printed to PDF from the browser</li>
              <li>• Excel exports use CSV format for broader compatibility</li>
              <li>• JSON exports include complete assessment data and metadata</li>
              <li>• All exports include assessment scores, answers, and recommendations when available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}