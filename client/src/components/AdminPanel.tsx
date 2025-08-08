import React, { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataActionCard from './lego-blocks/DataActionCard';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import MetadataLegoBlock from './MetadataLegoBlock';
import RSAMetadataSwitcher from './lego-blocks/RSAMetadataSwitcher';

export default function AdminPanel() {
  const { 
    metadata, 
    exportData, 
    importData, 
    resetToDefaults 
  } = useUseCases();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading state while metadata is being fetched (database-first compliance)
  if (!metadata) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Admin Panel...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">Loading metadata configuration from database...</div>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rsa-ai-framework-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Configuration and use cases have been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importData(data);
        toast({
          title: "Data imported successfully",
          description: "Configuration and use cases have been restored.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format or corrupted data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all metadata to default values? This action cannot be undone.')) {
      try {
        await resetToDefaults();
        toast({
          title: "Reset successful",
          description: "All metadata has been restored to default values.",
        });
      } catch (error) {
        toast({
          title: "Reset failed",
          description: "There was an error resetting the data.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Panel</CardTitle>
          <CardDescription>Manage UI list of values and system configuration using LEGO-style reusable blocks</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Data Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DataActionCard
              title="Export Data"
              description="Download use cases and metadata as JSON"
              icon={Download}
              onClick={handleExport}
              variant="primary"
            />
            
            <DataActionCard
              title="Import Data"
              description="Upload JSON configuration file"
              icon={Upload}
              onClick={handleImport}
              variant="success"
            />
            
            <DataActionCard
              title="Reset to Defaults"
              description="Restore original configuration"
              icon={RotateCcw}
              onClick={handleReset}
              variant="danger"
            />
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* RSA Commercial Lines Alignment - Safe Migration Tool */}
          <RSAMetadataSwitcher />

          {/* UI List of Values Management - LEGO-Style Reusable Blocks */}
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">UI List of Values Management</h3>
              <p className="text-sm text-gray-600">
                Manage dropdown options, filter values, and categorization lists used throughout the application.
                Each block below now includes authentic RSA commercial insurance terminology alongside generic options.
              </p>
            </div>
            
            {/* Aligned with Explorer Filter Order: Process → Activity → LOB → Segment → Geography → Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetadataLegoBlock
                category="processes"
                title="Business Processes"
                items={metadata.processes}
                placeholder="Add new business process..."
              />
              <MetadataLegoBlock
                category="activities"
                title="Process Activities"
                items={metadata.activities || []}
                placeholder="Add new process activity..."
              />
              <MetadataLegoBlock
                category="linesOfBusiness"
                title="Lines of Business"
                items={metadata.linesOfBusiness}
                placeholder="Add new line of business..."
              />
              <MetadataLegoBlock
                category="businessSegments"
                title="Business Segments"
                items={metadata.businessSegments}
                placeholder="Add new business segment..."
              />
              <MetadataLegoBlock
                category="geographies"
                title="Geographies"
                items={metadata.geographies}
                placeholder="Add new geography..."
              />
              <MetadataLegoBlock
                category="useCaseTypes"
                title="Use Case Types"
                items={metadata.useCaseTypes}
                placeholder="Add new use case type..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}