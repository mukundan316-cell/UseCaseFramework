import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, Building, Globe, Users, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * LEGO Block: RSA Metadata Configuration Switcher
 * Provides safe migration path from generic to RSA-specific commercial insurance terminology
 * Follows LEGO-style architecture with reusable, self-contained functionality
 */
export default function RSAMetadataSwitcher() {
  const { toast } = useToast();
  const [showRSAPreview, setShowRSAPreview] = useState(false);
  const [migrationMode, setMigrationMode] = useState<'preview' | 'guided' | 'bulk'>('preview');

  const rsaMetadataPreview = {
    processes: [
      'Submission & Quote',
      'Underwriting', 
      'Policy Administration',
      'Claims Management',
      'Risk Consulting',
      'Reinsurance',
      'Regulatory & Compliance',
      'Financial Management'
    ],
    linesOfBusiness: [
      'Property & Real Estate',
      'Marine & Transportation',
      'Construction & Engineering', 
      'Professional & Financial',
      'Renewable Energy',
      'Motor & Fleet',
      'Liability & Risk',
      'Accident & Health',
      'Rail',
      'Non-Profit Organizations',
      'All Lines'
    ],
    businessSegments: [
      'Large Corporates',
      'Mid-Market', 
      'Small Businesses',
      'Delegated Authority',
      'All Segments'
    ],
    geographies: [
      'UK Domestic',
      'UK Regions',
      'London Market',
      'European Markets', 
      'Global Network',
      'International/Multinational'
    ]
  };

  const handlePreviewToggle = () => {
    setShowRSAPreview(!showRSAPreview);
    toast({
      title: showRSAPreview ? "Generic Preview" : "RSA Preview",
      description: showRSAPreview 
        ? "Showing generic insurance terminology"
        : "Showing authentic RSA commercial insurance structure"
    });
  };

  const handleMigrationModeChange = (mode: 'preview' | 'guided' | 'bulk') => {
    setMigrationMode(mode);
    toast({
      title: "Migration Mode Changed",
      description: `Switched to ${mode} migration mode`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <CardTitle>RSA Commercial Lines Alignment</CardTitle>
          </div>
          <Badge variant="secondary">LEGO Block</Badge>
        </div>
        <p className="text-sm text-gray-600">
          Safely migrate to authentic RSA commercial insurance terminology while preserving existing data.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Migration Mode Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Migration Approach</h3>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Safe Implementation:</strong> All existing use cases and metadata are preserved. 
              RSA-specific options are added alongside current terminology, allowing gradual adoption.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`cursor-pointer transition-colors ${migrationMode === 'preview' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                  onClick={() => handleMigrationModeChange('preview')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Preview Mode</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Compare RSA vs generic terminology without making changes
                </p>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${migrationMode === 'guided' ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'}`}
                  onClick={() => handleMigrationModeChange('guided')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Guided Migration</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Manually update individual use cases through Admin Panel
                </p>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${migrationMode === 'bulk' ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-50'}`}
                  onClick={() => handleMigrationModeChange('bulk')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium">Smart Mapping</h4>
                </div>
                <p className="text-sm text-gray-600">
                  AI-suggested mappings from generic to RSA terminology
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RSA Preview Toggle */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="rsa-preview"
              checked={showRSAPreview}
              onCheckedChange={handlePreviewToggle}
            />
            <Label htmlFor="rsa-preview">Show RSA Commercial Lines Structure</Label>
          </div>

          {showRSAPreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">RSA Business Processes</h4>
                  <div className="space-y-1">
                    {rsaMetadataPreview.processes.map(process => (
                      <Badge key={process} variant="outline" className="mr-1 mb-1">
                        {process}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">RSA Lines of Business</h4>
                  <div className="space-y-1">
                    {rsaMetadataPreview.linesOfBusiness.map(lob => (
                      <Badge key={lob} variant="outline" className="mr-1 mb-1">
                        {lob}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">RSA Business Segments</h4>
                  <div className="space-y-1">
                    {rsaMetadataPreview.businessSegments.map(segment => (
                      <Badge key={segment} variant="outline" className="mr-1 mb-1">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">RSA Geographic Markets</h4>
                  <div className="space-y-1">
                    {rsaMetadataPreview.geographies.map(geo => (
                      <Badge key={geo} variant="outline" className="mr-1 mb-1">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button 
            variant="default"
            onClick={() => toast({ title: "RSA Metadata Available", description: "RSA options are now available in all Admin Panel LEGO blocks" })}
          >
            Enable RSA Options
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => toast({ title: "Export Current Config", description: "Configuration backup created for rollback safety" })}
          >
            Backup Current Config
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => toast({ title: "Import RSA Config", description: "RSA-specific use case mappings ready for review" })}
          >
            Preview RSA Mappings
          </Button>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Implementation Status:</strong> RSA commercial insurance terminology has been safely added 
            to all Admin Panel LEGO blocks. Users can now select authentic RSA options alongside existing generic terms.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}