import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuestionTemplateLibraryLegoBlock, { QuestionTemplate } from './QuestionTemplateLibraryLegoBlock';
import ReusableButton from './ReusableButton';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
  Settings
} from 'lucide-react';

/**
 * Demo component showcasing QuestionTemplateLibraryLegoBlock functionality
 * Demonstrates template browsing, searching, filtering, and question management
 */
export default function QuestionTemplateLibraryDemo() {
  const [addedQuestions, setAddedQuestions] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [targetSection, setTargetSection] = useState(1);
  const [lastAction, setLastAction] = useState<string>('');

  // Handle adding single question
  const handleAddQuestion = async (template: QuestionTemplate, sectionNumber: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAddedQuestions(prev => [...prev, template.id]);
    setLastAction(`Added "${template.title}" to Section ${sectionNumber}`);
    console.log(`Added question: ${template.title} to section ${sectionNumber}`);
  };

  // Handle bulk import
  const handleBulkImport = async (templates: QuestionTemplate[], sectionNumber: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setImportedCount(prev => prev + templates.length);
    setAddedQuestions(prev => [...prev, ...templates.map(t => t.id)]);
    setLastAction(`Imported ${templates.length} questions to Section ${sectionNumber}`);
    console.log(`Bulk imported ${templates.length} questions to section ${sectionNumber}`);
  };

  // Handle creating custom question
  const handleCreateCustom = async (template: Partial<QuestionTemplate>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLastAction(`Created custom question: ${template.title}`);
    console.log('Created custom question:', template);
  };

  // Handle updating template
  const handleUpdateTemplate = async (id: string, updates: Partial<QuestionTemplate>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setLastAction(`Updated template ${id}`);
    console.log('Updated template:', id, updates);
  };

  // Handle deleting template
  const handleDeleteTemplate = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setLastAction(`Deleted template ${id}`);
    console.log('Deleted template:', id);
  };

  // Reset demo state
  const resetDemo = () => {
    setAddedQuestions([]);
    setImportedCount(0);
    setLastAction('');
  };

  // Simulate loading more templates
  const loadMoreTemplates = () => {
    setLastAction('Loaded additional templates from database');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-[#3C2CDA]" />
            <span>Question Template Library Demo</span>
          </CardTitle>
          <CardDescription>
            Comprehensive question template management with browse, search, filter, and import capabilities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3C2CDA]">100+</div>
              <div className="text-sm text-gray-600">RSA Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{addedQuestions.length}</div>
              <div className="text-sm text-gray-600">Questions Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{importedCount}</div>
              <div className="text-sm text-gray-600">Bulk Imported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">6</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Demo Actions</h4>
              <div className="flex flex-wrap gap-2">
                <ReusableButton
                  rsaStyle="primary"
                  size="sm"
                  onClick={loadMoreTemplates}
                  icon={Download}
                >
                  Load More Templates
                </ReusableButton>
                
                <ReusableButton
                  rsaStyle="secondary"
                  size="sm"
                  onClick={resetDemo}
                  icon={RefreshCw}
                >
                  Reset Demo
                </ReusableButton>
              </div>
            </div>

            {/* Last Action */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Latest Action</h4>
              {lastAction ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{lastAction}</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">No actions yet - try browsing and adding templates</p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Component Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Browse</Badge>
                  <span>Pre-built RSA question templates by category</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Search</Badge>
                  <span>Find templates by keywords, tags, or descriptions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Filter</Badge>
                  <span>Multi-criteria filtering by type, difficulty, category</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Preview</Badge>
                  <span>Detailed template preview before adding</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Import</Badge>
                  <span>Bulk import multiple questions to sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Custom</Badge>
                  <span>Create custom questions from templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Manage</Badge>
                  <span>Full CRUD operations for template management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Database</Badge>
                  <span>Persistent storage with usage analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3" />
              <span>Template Library Active</span>
            </Badge>
            
            {addedQuestions.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1 bg-green-50 border-green-500">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>{addedQuestions.length} Questions Added</span>
              </Badge>
            )}
            
            {importedCount > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 border-blue-500">
                <Upload className="h-3 w-3 text-blue-600" />
                <span>{importedCount} Bulk Imported</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Component */}
      <QuestionTemplateLibraryLegoBlock
        onAddQuestion={handleAddQuestion}
        onBulkImport={handleBulkImport}
        onCreateCustom={handleCreateCustom}
        onUpdateTemplate={handleUpdateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        readOnly={false}
      />

      {/* Technical Implementation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>RSA Question Library:</strong> 100+ pre-built questions categorized across 6 assessment sections</p>
          <p><strong>Advanced Search:</strong> Full-text search across titles, descriptions, and tags with real-time filtering</p>
          <p><strong>Multi-Criteria Filtering:</strong> Category, question type, difficulty level, starred status, and section filters</p>
          <p><strong>Template Preview:</strong> Detailed question preview with configuration data and usage statistics</p>
          <p><strong>Bulk Operations:</strong> Multi-select with bulk import capability for efficient section building</p>
          <p><strong>Custom Question Creation:</strong> Template-based custom question creation with validation</p>
          <p><strong>CRUD Management:</strong> Full create, read, update, delete operations for template management</p>
          <p><strong>Database Integration:</strong> Persistent storage with usage tracking and analytics</p>
          <p><strong>Section Targeting:</strong> Dynamic section selection for flexible question placement</p>
          <p><strong>Responsive Design:</strong> Mobile-optimized layout with touch-friendly interactions</p>
        </CardContent>
      </Card>
    </div>
  );
}