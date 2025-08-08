import React, { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import MetadataLegoBlock from './MetadataLegoBlock';

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
          <CardDescription>Manage metadata categories and system configuration using LEGO-style reusable blocks</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Data Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Button
              onClick={handleExport}
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 border-gray-200 hover:border-rsa-blue hover:bg-blue-50"
            >
              <Download className="h-8 w-8 text-rsa-blue" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Export Data</div>
                <div className="text-sm text-gray-600">Download use cases and metadata as JSON</div>
              </div>
            </Button>
            
            <Button
              onClick={handleImport}
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 border-gray-200 hover:border-green-500 hover:bg-green-50"
            >
              <Upload className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Import Data</div>
                <div className="text-sm text-gray-600">Upload JSON configuration file</div>
              </div>
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 border-red-200 hover:border-red-500 hover:bg-red-50"
            >
              <RotateCcw className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Reset to Defaults</div>
                <div className="text-sm text-gray-600">Restore original configuration</div>
              </div>
            </Button>
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Metadata Categories Management - LEGO-Style Reusable Blocks */}
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Metadata Management</h3>
              <p className="text-sm text-gray-600">
                Each block below is a reusable LEGO-style component that persists directly to the database.
                Add, edit, or delete items with full CRUD operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetadataLegoBlock
                category="valueChainComponents"
                title="Value Chain Components"
                items={metadata.valueChainComponents}
                placeholder="Add new value chain component..."
              />
              <MetadataLegoBlock
                category="processes"
                title="Business Processes"
                items={metadata.processes}
                placeholder="Add new business process..."
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