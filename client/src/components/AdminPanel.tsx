import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, Settings, Database, ClipboardList, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataActionCard from './lego-blocks/DataActionCard';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import MetadataLegoBlock from './MetadataLegoBlock';
import ProcessActivityManagementBlock from './lego-blocks/ProcessActivityManagementBlock';
import ProcessManagementBlock from './lego-blocks/ProcessManagementBlock';
import ScoringModelManagementBlock from './lego-blocks/ScoringModelManagementSimple';
import QuestionTemplateLibraryLegoBlock from './lego-blocks/QuestionTemplateLibraryLegoBlock';
import QuestionConfigurationLegoBlock from './lego-blocks/QuestionConfigurationLegoBlock';
import AssessmentStatsLegoBlock from './lego-blocks/AssessmentStatsLegoBlock';
import LibraryManagementLegoBlock from './lego-blocks/LibraryManagementLegoBlock';
import SourceTypeManagementBlock from './lego-blocks/SourceTypeManagementBlock';

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
          <CardDescription>Comprehensive admin interface with 5 specialized management areas using LEGO-style reusable blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Management
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Library Management
              </TabsTrigger>
              <TabsTrigger value="process" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Process Config
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Assessment Mgmt
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Config
              </TabsTrigger>
            </TabsList>

            {/* Data Management Tab */}
            <TabsContent value="data" className="space-y-6">
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

              {/* UI List of Values Management */}
              <div className="space-y-6">
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">UI List of Values Management</h3>
                  <p className="text-sm text-gray-600">
                    Manage dropdown options, filter values, and categorization lists used throughout the application.
                    Each block below controls the available options in forms and filters.
                  </p>
                </div>
                
                {/* Metadata Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </TabsContent>

            {/* Library Management Tab */}
            <TabsContent value="library" className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Tier Library Management</h3>
                <p className="text-sm text-gray-600">
                  Manage active portfolio and reference library use cases with tier-based organization.
                  Control dashboard visibility and organize use cases for strategic decision-making.
                </p>
              </div>
              
              {/* Library Management LEGO Block */}
              <div className="space-y-6">
                <LibraryManagementLegoBlock />
              </div>
            </TabsContent>

            {/* Process Configuration Tab */}
            <TabsContent value="process" className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Process Configuration</h3>
                <p className="text-sm text-gray-600">
                  Configure business processes and their relationships with activities. 
                  These mappings drive use case categorization and workflow optimization.
                </p>
              </div>
              
              {/* Business Processes and Process-Activity Relationships */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProcessManagementBlock />
                <div className="lg:col-span-1">
                  <ProcessActivityManagementBlock />
                </div>
              </div>
            </TabsContent>

            {/* Assessment Management Tab */}
            <TabsContent value="assessment" className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Content Management</h3>
                <p className="text-sm text-gray-600">
                  Manage RSA's comprehensive question template library with 100+ assessment questions.
                  Configure sections, question types, and dynamic assessment flows.
                </p>
              </div>
              
              {/* Assessment Statistics */}
              <div className="space-y-6">
                <AssessmentStatsLegoBlock />
                
                {/* Question Configuration */}
                <QuestionConfigurationLegoBlock className="w-full" />
                
                {/* Question Template Library */}
                <QuestionTemplateLibraryLegoBlock
                  onAddQuestion={async (template) => console.log('Add question:', template)}
                  onBulkImport={async (templates) => console.log('Bulk import:', templates)}
                  onCreateCustom={async (question) => console.log('Create custom:', question)}
                  onUpdateTemplate={async (id, updates) => console.log('Update template:', id, updates)}
                  onDeleteTemplate={async (id) => console.log('Delete template:', id)}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* System Configuration Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Configuration</h3>
                <p className="text-sm text-gray-600">
                  Configure scoring models, system-wide settings, and advanced administrative features.
                  These settings affect the entire RSA AI Framework operation.
                </p>
              </div>
              
              {/* Scoring Model Management */}
              <div className="space-y-6">
                <ScoringModelManagementBlock />
                
                {/* Source Type Management */}
                <SourceTypeManagementBlock />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}