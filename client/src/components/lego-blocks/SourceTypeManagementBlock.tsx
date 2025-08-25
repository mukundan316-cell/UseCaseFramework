import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Globe, Download, Database } from 'lucide-react';
import { getSourceConfig } from '@/utils/sourceColors';

/**
 * LEGO Block: Source Type Management
 * Displays available source types with their configurations and usage statistics
 * Follows "Build Once, Reuse Everywhere" principle with consistent design patterns
 */

const SOURCE_TYPES = [
  {
    key: 'rsa_internal',
    icon: Building,
    usage: 'Default source for RSA internal teams and employees'
  },
  {
    key: 'hexaware_external',
    icon: Users,
    usage: 'External consultants and Hexaware team contributions'
  },
  {
    key: 'industry_standard',
    icon: Globe,
    usage: 'Industry best practices and standard implementations'
  },
  {
    key: 'imported',
    icon: Download,
    usage: 'Use cases imported from external sources'
  },
  {
    key: 'consolidated_database',
    icon: Database,
    usage: 'Legacy data consolidated during migration'
  }
];

export default function SourceTypeManagementBlock() {
  return (
    <Card className="card-rsa border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building className="h-5 w-5 text-rsa-blue" />
          Source Type Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage use case source types and their visual differentiation. Each source type has a distinct color scheme for easy identification.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {SOURCE_TYPES.map((sourceType) => {
            const config = getSourceConfig(sourceType.key);
            const IconComponent = sourceType.icon;
            
            return (
              <div
                key={sourceType.key}
                className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-all duration-200"
                style={{ 
                  borderLeftColor: config.borderColor,
                  borderLeftWidth: '4px'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: config.badgeBackground }}
                  >
                    <IconComponent 
                      className="h-4 w-4"
                      style={{ color: config.iconColor }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{config.label}</span>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          borderColor: config.badgeColor,
                          color: config.badgeColor,
                          backgroundColor: config.badgeBackground 
                        }}
                      >
                        {sourceType.key.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{sourceType.usage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">System Defined</div>
                  <div className="text-xs text-gray-400">Built-in Source Type</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Source Type Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Visual Differentiation:</strong> Each source has a unique color scheme for easy identification</li>
            <li>• <strong>Filtering Support:</strong> Users can filter use cases by source type in the library</li>
            <li>• <strong>Badge Display:</strong> Source badges appear on use case cards with appropriate icons</li>
            <li>• <strong>Admin Control:</strong> Source assignment is managed during use case creation/editing</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Note on Source Types</h4>
              <p className="text-sm text-amber-800 mt-1">
                Source types are system-defined enums that ensure data consistency. 
                They cannot be modified through the UI but can be updated through schema changes if needed.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}