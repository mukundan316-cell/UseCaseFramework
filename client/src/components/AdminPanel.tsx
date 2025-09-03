import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, Settings, Database, ClipboardList, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataActionCard from './lego-blocks/DataActionCard';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import MetadataLegoBlock from './MetadataLegoBlock';
import ReorderableMetadataBlock from './lego-blocks/ReorderableMetadataBlock';
import ProcessActivityManagementBlock from './lego-blocks/ProcessActivityManagementBlock';
import ProcessManagementBlock from './lego-blocks/ProcessManagementBlock';
import ScoringModelManagementBlock from './lego-blocks/ScoringModelManagementSimple';
import ScoringDropdownManagementLegoBlock from './lego-blocks/ScoringDropdownManagementLegoBlock';
import QuestionTemplateLibraryLegoBlock from './lego-blocks/QuestionTemplateLibraryLegoBlock';
import QuestionConfigurationLegoBlock from './lego-blocks/QuestionConfigurationLegoBlock';
import AssessmentStatsLegoBlock from './lego-blocks/AssessmentStatsLegoBlock';
import LibraryManagementLegoBlock from './lego-blocks/LibraryManagementLegoBlock';
import ExcelUploadLegoBlock from './lego-blocks/ExcelUploadLegoBlock';

export default function AdminPanel() {
  const { 
    metadata, 
    exportData, 
    importData, 
    resetToDefaults 
  } = useUseCases();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Question Template Library handlers - using available questionnaire APIs
  const handleAddQuestionTemplate = async (template: any) => {
    try {
      // For now, show what would be added since we don't have a template storage API
      toast({
        title: "Template Action",
        description: `Would add template: "${template.title}" (Type: ${template.questionType})`,
      });
      console.log('Template to add:', template);
    } catch (error) {
      toast({
        title: "Error adding template",
        description: "Template management requires questionnaire definition updates.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImportTemplates = async (templates: any[]) => {
    try {
      toast({
        title: "Bulk Import",
        description: `Would import ${templates.length} templates. Feature requires backend storage.`,
      });
      console.log('Templates to import:', templates);
    } catch (error) {
      toast({
        title: "Error importing templates",
        description: "Bulk import requires additional backend implementation.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomQuestion = async (question: any) => {
    try {
      toast({
        title: "Custom Question",
        description: `Would create question: "${question.questionText}"`,
      });
      console.log('Custom question to create:', question);
    } catch (error) {
      toast({
        title: "Error creating question",
        description: "Custom question creation requires questionnaire API updates.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestionTemplate = async (id: string, updates: any) => {
    try {
      toast({
        title: "Template Update",
        description: `Would update template ${id} with changes.`,
      });
      console.log('Template update:', id, updates);
    } catch (error) {
      toast({
        title: "Error updating template",
        description: "Template updates require questionnaire definition modifications.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestionTemplate = async (id: string) => {
    try {
      toast({
        title: "Template Deletion",
        description: `Would delete template ${id}. Requires confirmation in production.`,
      });
      console.log('Template to delete:', id);
    } catch (error) {
      toast({
        title: "Error deleting template",
        description: "Template deletion requires backend API implementation.",
        variant: "destructive",
      });
    }
  };
  
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
          <CardDescription>Comprehensive admin interface with 4 specialized management areas using LEGO-style reusable blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Management
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Assessment
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User-Selectable List of Values</h3>
                  <p className="text-sm text-gray-600">
                    Manage dropdown options that users explicitly select during use case creation, editing, and workflow activities.
                    Each category below controls the available choices in user-facing forms and filters.
                  </p>
                </div>
                
                {/* Metadata Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ReorderableMetadataBlock
                    category="linesOfBusiness"
                    title="Lines of Business"
                    items={metadata.linesOfBusiness}
                    sortOrder={metadata.linesOfBusinessSortOrder || undefined}
                    placeholder="Add new line of business..."
                  />
                  <ReorderableMetadataBlock
                    category="businessSegments"
                    title="Business Segments"
                    items={metadata.businessSegments}
                    sortOrder={metadata.businessSegmentsSortOrder || undefined}
                    placeholder="Add new business segment..."
                  />
                  <ReorderableMetadataBlock
                    category="geographies"
                    title="Geographies"
                    items={metadata.geographies}
                    sortOrder={metadata.geographiesSortOrder || undefined}
                    placeholder="Add new geography..."
                  />
                  <ReorderableMetadataBlock
                    category="useCaseTypes"
                    title="Use Case Types"
                    items={metadata.useCaseTypes}
                    sortOrder={metadata.useCaseTypesSortOrder || undefined}
                    placeholder="Add new use case type..."
                  />
                  <ReorderableMetadataBlock
                    category="sourceTypes"
                    title="Source Types"
                    items={metadata.sourceTypes || []}
                    sortOrder={metadata.sourceTypesSortOrder || undefined}
                    placeholder="Add new source type..."
                  />
                  <ReorderableMetadataBlock
                    category="useCaseStatuses"
                    title="Use Case Statuses"
                    items={metadata.useCaseStatuses || []}
                    sortOrder={metadata.useCaseStatusesSortOrder || undefined}
                    placeholder="Add new use case status..."
                  />
                  <ReorderableMetadataBlock
                    category="aiMlTechnologies"
                    title="AI/ML Technologies"
                    items={metadata.aiMlTechnologies || []}
                    sortOrder={metadata.aiMlTechnologiesSortOrder || undefined}
                    placeholder="Add new AI/ML technology..."
                  />
                  <ReorderableMetadataBlock
                    category="dataSources"
                    title="Data Sources"
                    items={metadata.dataSources || []}
                    sortOrder={metadata.dataSourcesSortOrder || undefined}
                    placeholder="Add new data source..."
                  />
                  <ReorderableMetadataBlock
                    category="stakeholderGroups"
                    title="Stakeholder Groups"
                    items={metadata.stakeholderGroups || []}
                    sortOrder={metadata.stakeholderGroupsSortOrder || undefined}
                    placeholder="Add new stakeholder group..."
                  />
                  <ReorderableMetadataBlock
                    category="quadrants"
                    title="Matrix Quadrants"
                    items={metadata.quadrants || []}
                    sortOrder={metadata.quadrantsSortOrder || undefined}
                    placeholder="Add new quadrant..."
                  />
                  <ReorderableMetadataBlock
                    category="processes"
                    title="Business Processes"
                    items={metadata.processes || []}
                    sortOrder={metadata.processesSortOrder || undefined}
                    placeholder="Add new business process..."
                  />
                  <ReorderableMetadataBlock
                    category="activities"
                    title="Process Activities"
                    items={metadata.activities || []}
                    sortOrder={metadata.activitiesSortOrder || undefined}
                    placeholder="Add new process activity..."
                  />
                  <MetadataLegoBlock
                    category="horizontalUseCaseTypes"
                    title="Horizontal Use Case Types"
                    items={metadata.horizontalUseCaseTypes || []}
                    placeholder="Add new horizontal use case type..."
                  />
                </div>

                {/* Scoring Dropdown Options Management */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center py-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Scoring Dropdown Options</h4>
                    <p className="text-sm text-gray-600">
                      Manage the dropdown options that users select for the 10-lever scoring framework. 
                      Each option includes a label, score value (1-5), and business context description.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Business Impact Levers */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800 mb-3 border-b pb-2">Business Impact Levers</h5>
                      <ScoringDropdownManagementLegoBlock
                        scoringField="revenueImpact"
                        title="Revenue Impact"
                        options={metadata?.scoringDropdownOptions?.revenueImpact || []}
                        description="Direct revenue generation or loss prevention potential"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="costSavings"
                        title="Cost Savings"
                        options={metadata?.scoringDropdownOptions?.costSavings || []}
                        description="Operational cost reduction and efficiency gains"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="riskReduction"
                        title="Risk Reduction"
                        options={metadata?.scoringDropdownOptions?.riskReduction || []}
                        description="Risk mitigation and compliance improvements"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="brokerPartnerExperience"
                        title="Broker Partner Experience"
                        options={metadata?.scoringDropdownOptions?.brokerPartnerExperience || []}
                        description="Impact on external broker and partner relationships"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="strategicFit"
                        title="Strategic Fit"
                        options={metadata?.scoringDropdownOptions?.strategicFit || []}
                        description="Alignment with RSA's strategic objectives"
                      />
                    </div>

                    {/* Implementation Effort Levers */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800 mb-3 border-b pb-2">Implementation Effort Levers</h5>
                      <ScoringDropdownManagementLegoBlock
                        scoringField="dataReadiness"
                        title="Data Readiness"
                        options={metadata?.scoringDropdownOptions?.dataReadiness || []}
                        description="Quality and accessibility of required data"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="technicalComplexity"
                        title="Technical Complexity"
                        options={metadata?.scoringDropdownOptions?.technicalComplexity || []}
                        description="Technical implementation and integration challenges"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="changeImpact"
                        title="Change Impact"
                        options={metadata?.scoringDropdownOptions?.changeImpact || []}
                        description="Organizational and process change requirements"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="modelRisk"
                        title="Model Risk"
                        options={metadata?.scoringDropdownOptions?.modelRisk || []}
                        description="Potential model performance and regulatory risks"
                      />
                      <ScoringDropdownManagementLegoBlock
                        scoringField="adoptionReadiness"
                        title="Adoption Readiness"
                        options={metadata?.scoringDropdownOptions?.adoptionReadiness || []}
                        description="User acceptance and organizational readiness"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Process-Activity Relationships */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center py-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Process-Activity Relationships</h4>
                    <p className="text-sm text-gray-600">
                      Configure which activities are available for each business process. 
                      These mappings enable dynamic activity selection in use case forms.
                    </p>
                  </div>
                  <ProcessActivityManagementBlock />
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
                
                {/* Excel Upload LEGO Block */}
                <ExcelUploadLegoBlock 
                  onImportComplete={(result) => {
                    console.log('Import completed:', result);
                    // Force refresh of use cases if needed
                    window.location.reload();
                  }}
                />
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
                <AssessmentStatsLegoBlock 
                  questionnaireId="11f4eaf5-0bcd-4963-9ace-84045ecbb79a"
                />
                
                {/* Question Configuration */}
                <QuestionConfigurationLegoBlock 
                  className="w-full"
                  questionnaireId="11f4eaf5-0bcd-4963-9ace-84045ecbb79a"
                />
                
                {/* Question Template Library */}
                <QuestionTemplateLibraryLegoBlock
                  onAddQuestion={handleAddQuestionTemplate}
                  onBulkImport={handleBulkImportTemplates}
                  onCreateCustom={handleCreateCustomQuestion}
                  onUpdateTemplate={handleUpdateQuestionTemplate}
                  onDeleteTemplate={handleDeleteQuestionTemplate}
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}