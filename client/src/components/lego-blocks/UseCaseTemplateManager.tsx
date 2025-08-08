import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  Eye,
  Save,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReusableButton from './ReusableButton';
import FormActionButtons from './FormActionButtons';
import DataActionCard from './DataActionCard';

interface UseCaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  businessSegment: string;
  geography: string;
  useCaseType: string;
  defaultScores: {
    revenueImpact: number;
    costSavings: number;
    riskReduction: number;
    brokerPartnerExperience: number;
    strategicFit: number;
    dataReadiness: number;
    technicalComplexity: number;
    changeImpact: number;
    modelRisk: number;
    adoptionReadiness: number;
    explainabilityBias: number;
    regulatoryCompliance: number;
  };
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  lastUsed: string;
}

/**
 * LEGO Block: Use Case Template Manager
 * Reusable component for managing use case templates that can be used to
 * quickly create new use cases with pre-filled common values
 */
export default function UseCaseTemplateManager() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<UseCaseTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock templates for demonstration
  const [templates] = useState<UseCaseTemplate[]>([
    {
      id: 'claims-processing-template',
      name: 'Claims Processing Template',
      description: 'Template for AI-powered claims processing use cases',
      category: 'Claims Operations',
      valueChainComponent: 'Claims',
      process: 'FNOL',
      lineOfBusiness: 'Auto',
      businessSegment: 'Large Commercial',
      geography: 'UK',
      useCaseType: 'GenAI',
      defaultScores: {
        revenueImpact: 3,
        costSavings: 4,
        riskReduction: 4,
        brokerPartnerExperience: 3,
        strategicFit: 4,
        dataReadiness: 3,
        technicalComplexity: 3,
        changeImpact: 3,
        modelRisk: 3,
        adoptionReadiness: 3,
        explainabilityBias: 4,
        regulatoryCompliance: 4
      },
      isActive: true,
      usageCount: 12,
      createdAt: '2025-01-01',
      lastUsed: '2025-01-08'
    },
    {
      id: 'underwriting-template',
      name: 'Underwriting Automation Template',
      description: 'Template for automated underwriting decision support',
      category: 'Underwriting',
      valueChainComponent: 'Underwriting',
      process: 'Quote & Bind',
      lineOfBusiness: 'Property',
      businessSegment: 'SME',
      geography: 'Europe',
      useCaseType: 'Predictive ML',
      defaultScores: {
        revenueImpact: 4,
        costSavings: 3,
        riskReduction: 5,
        brokerPartnerExperience: 4,
        strategicFit: 5,
        dataReadiness: 4,
        technicalComplexity: 4,
        changeImpact: 4,
        modelRisk: 4,
        adoptionReadiness: 3,
        explainabilityBias: 5,
        regulatoryCompliance: 5
      },
      isActive: true,
      usageCount: 8,
      createdAt: '2025-01-02',
      lastUsed: '2025-01-07'
    },
    {
      id: 'fraud-detection-template',
      name: 'Fraud Detection Template',
      description: 'Template for fraud detection and prevention systems',
      category: 'Risk Management',
      valueChainComponent: 'Fraud/Compliance',
      process: 'FNOL',
      lineOfBusiness: 'Auto',
      businessSegment: 'Mid-Market',
      geography: 'North America',
      useCaseType: 'Predictive ML',
      defaultScores: {
        revenueImpact: 2,
        costSavings: 4,
        riskReduction: 5,
        brokerPartnerExperience: 2,
        strategicFit: 4,
        dataReadiness: 4,
        technicalComplexity: 4,
        changeImpact: 3,
        modelRisk: 4,
        adoptionReadiness: 3,
        explainabilityBias: 4,
        regulatoryCompliance: 5
      },
      isActive: true,
      usageCount: 5,
      createdAt: '2025-01-03',
      lastUsed: '2025-01-06'
    }
  ]);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFromTemplate = (template: UseCaseTemplate) => {
    toast({
      title: "Template applied",
      description: `New use case created using "${template.name}" template.`,
    });
  };

  const handleDuplicateTemplate = (template: UseCaseTemplate) => {
    toast({
      title: "Template duplicated",
      description: `Created a copy of "${template.name}".`,
    });
  };

  const handleDeleteTemplate = (template: UseCaseTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      toast({
        title: "Template deleted",
        description: `"${template.name}" has been removed.`,
      });
    }
  };

  const handleExportTemplates = () => {
    const exportData = {
      templates,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usecase-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Templates exported",
      description: "Use case templates have been downloaded.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                Use Case Template Manager
              </CardTitle>
              <p className="text-gray-600 mt-1">Create and manage reusable templates for common use case patterns</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-600">
                {templates.length} Templates
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {templates.filter(t => t.isActive).length} Active
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <DataActionCard
              title="New Template"
              description="Create template from scratch"
              icon={Plus}
              onClick={() => setIsCreating(true)}
              variant="primary"
            />
            <DataActionCard
              title="Export Templates"
              description="Download template definitions"
              icon={Download}
              onClick={handleExportTemplates}
              variant="success"
            />
            <DataActionCard
              title="Import Templates"
              description="Upload template definitions"
              icon={Upload}
              onClick={() => toast({ title: "Import", description: "Import functionality would be implemented here." })}
              variant="warning"
            />
            <DataActionCard
              title="Template Settings"
              description="Configure global settings"
              icon={Settings}
              onClick={() => toast({ title: "Settings", description: "Global template settings would be configured here." })}
              variant="primary"
            />
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search templates by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <Badge className="mt-2 bg-purple-100 text-purple-800">
                        {template.category}
                      </Badge>
                    </div>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Template Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value Chain:</span>
                      <span className="font-medium">{template.valueChainComponent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Process:</span>
                      <span className="font-medium">{template.process}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LOB:</span>
                      <span className="font-medium">{template.lineOfBusiness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage Count:</span>
                      <span className="font-medium">{template.usageCount}</span>
                    </div>
                  </div>

                  {/* Quick Score Overview */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded ${getScoreColor(template.defaultScores.revenueImpact)}`}>
                        Revenue: {template.defaultScores.revenueImpact}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded ${getScoreColor(template.defaultScores.riskReduction)}`}>
                        Risk: {template.defaultScores.riskReduction}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded ${getScoreColor(template.defaultScores.dataReadiness)}`}>
                        Data: {template.defaultScores.dataReadiness}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateFromTemplate(template)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Create your first template or adjust your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Detail/Edit Modal */}
      {selectedTemplate && (
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Template' : 'Template Details'}: {selectedTemplate.name}
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                }}
              >
                Close
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="context">Business Context</TabsTrigger>
                <TabsTrigger value="scores">Default Scores</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.name} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.category} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea 
                    defaultValue={selectedTemplate.description} 
                    disabled={!isEditing}
                  />
                </div>
              </TabsContent>

              <TabsContent value="context" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value Chain Component
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.valueChainComponent} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Process
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.process} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Line of Business
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.lineOfBusiness} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Segment
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.businessSegment} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geography
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.geography} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use Case Type
                    </label>
                    <Input 
                      defaultValue={selectedTemplate.useCaseType} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scores" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Business Value Scores */}
                  <div>
                    <h4 className="font-medium text-green-700 mb-3">Business Value Levers</h4>
                    <div className="space-y-3">
                      {Object.entries({
                        revenueImpact: 'Revenue Impact',
                        costSavings: 'Cost Savings',
                        riskReduction: 'Risk Reduction',
                        brokerPartnerExperience: 'Broker Experience',
                        strategicFit: 'Strategic Fit'
                      }).map(([key, label]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{label}</span>
                          <div className={`px-2 py-1 rounded text-sm ${getScoreColor(selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores])}`}>
                            {selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feasibility Scores */}
                  <div>
                    <h4 className="font-medium text-blue-700 mb-3">Feasibility Levers</h4>
                    <div className="space-y-3">
                      {Object.entries({
                        dataReadiness: 'Data Readiness',
                        technicalComplexity: 'Technical Complexity',
                        changeImpact: 'Change Impact',
                        modelRisk: 'Model Risk',
                        adoptionReadiness: 'Adoption Readiness'
                      }).map(([key, label]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{label}</span>
                          <div className={`px-2 py-1 rounded text-sm ${getScoreColor(selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores])}`}>
                            {selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Governance Scores */}
                  <div>
                    <h4 className="font-medium text-purple-700 mb-3">AI Governance Levers</h4>
                    <div className="space-y-3">
                      {Object.entries({
                        explainabilityBias: 'Explainability & Bias',
                        regulatoryCompliance: 'Regulatory Compliance'
                      }).map(([key, label]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{label}</span>
                          <div className={`px-2 py-1 rounded text-sm ${getScoreColor(selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores])}`}>
                            {selectedTemplate.defaultScores[key as keyof typeof selectedTemplate.defaultScores]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {isEditing && (
              <div className="mt-6">
                <FormActionButtons
                  onReset={() => setIsEditing(false)}
                  onSave={() => {
                    setIsEditing(false);
                    toast({
                      title: "Template updated",
                      description: "Template settings have been saved.",
                    });
                  }}
                  resetLabel="Cancel"
                  saveLabel="Save Template"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}