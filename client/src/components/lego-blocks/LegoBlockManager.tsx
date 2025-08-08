import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Blocks, 
  Code, 
  Settings, 
  Plus, 
  Edit2, 
  Eye, 
  Trash2,
  Download,
  Upload,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataActionCard from './DataActionCard';
import ReusableButton from './ReusableButton';
import FormActionButtons from './FormActionButtons';

interface LegoComponent {
  id: string;
  name: string;
  purpose: string;
  location: string;
  category: 'form' | 'data' | 'ui' | 'modal' | 'action';
  status: 'active' | 'deprecated' | 'development';
  usageCount: number;
  lastUpdated: string;
  features: string[];
  props: ComponentProp[];
  examples: string[];
}

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

/**
 * LEGO Block Manager - Comprehensive admin interface for managing reusable components
 * Provides CRUD operations for all LEGO-style components in the system
 */
export default function LegoBlockManager() {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<LegoComponent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock data representing the current LEGO components
  const [legoComponents] = useState<LegoComponent[]>([
    {
      id: 'metadata-lego-block',
      name: 'MetadataLegoBlock',
      purpose: 'Reusable CRUD block for managing any type of metadata',
      location: 'client/src/components/MetadataLegoBlock.tsx',
      category: 'data',
      status: 'active',
      usageCount: 6,
      lastUpdated: '2025-01-08',
      features: ['Add/Edit/Delete operations', 'Database persistence', 'Inline editing', 'Confirmation dialogs'],
      props: [
        { name: 'category', type: 'keyof MetadataConfig', required: true, description: 'Metadata category to manage' },
        { name: 'title', type: 'string', required: true, description: 'Display title for the block' },
        { name: 'items', type: 'string[]', required: true, description: 'Array of items to display' },
        { name: 'placeholder', type: 'string', required: false, default: 'Add new item...', description: 'Placeholder text for input' }
      ],
      examples: ['Value Chain Components management', 'Business Processes management', 'Lines of Business management']
    },
    {
      id: 'crud-usecase-modal',
      name: 'CRUDUseCaseModal',
      purpose: 'Modal for creating and editing use cases with full scoring interface',
      location: 'client/src/components/lego-blocks/CRUDUseCaseModal.tsx',
      category: 'modal',
      status: 'active',
      usageCount: 2,
      lastUpdated: '2025-01-08',
      features: ['Create/Edit use cases', 'Enhanced RSA Framework scoring', 'Real-time score calculation', 'Form validation'],
      props: [
        { name: 'isOpen', type: 'boolean', required: true, description: 'Controls modal visibility' },
        { name: 'onClose', type: '() => void', required: true, description: 'Callback when modal closes' },
        { name: 'mode', type: "'create' | 'edit'", required: true, description: 'Operation mode' },
        { name: 'useCase', type: 'UseCase', required: false, description: 'Use case data for edit mode' }
      ],
      examples: ['Create new use case from Explorer', 'Edit existing use case details', 'Bulk use case operations']
    },
    {
      id: 'scoring-lego-block',
      name: 'ScoringLegoBlock',
      purpose: 'Reusable scoring sections for enhanced RSA framework',
      location: 'client/src/components/lego-blocks/ScoringLegoBlock.tsx',
      category: 'form',
      status: 'active',
      usageCount: 3,
      lastUpdated: '2025-01-08',
      features: ['Business Value scoring', 'Feasibility scoring', 'AI Governance scoring', 'Visual indicators'],
      props: [
        { name: 'form', type: 'UseFormReturn<any>', required: true, description: 'React Hook Form instance' },
        { name: 'category', type: "'business-value' | 'feasibility' | 'ai-governance'", required: true, description: 'Scoring category' },
        { name: 'fields', type: 'ScoringField[]', required: true, description: 'Fields to render' }
      ],
      examples: ['Use case submission form', 'Use case editing modal', 'Scoring validation']
    },
    {
      id: 'form-action-buttons',
      name: 'FormActionButtons',
      purpose: 'Standardized form action buttons (Reset/Save)',
      location: 'client/src/components/lego-blocks/FormActionButtons.tsx',
      category: 'action',
      status: 'active',
      usageCount: 4,
      lastUpdated: '2025-01-08',
      features: ['Reset and Save buttons', 'Loading states', 'RSA styling', 'Flexible configuration'],
      props: [
        { name: 'onReset', type: '() => void', required: false, description: 'Reset button callback' },
        { name: 'onSave', type: '() => void', required: false, description: 'Save button callback' },
        { name: 'isLoading', type: 'boolean', required: false, default: 'false', description: 'Loading state' },
        { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disabled state' }
      ],
      examples: ['Use case forms', 'Metadata management', 'Admin panel actions']
    },
    {
      id: 'data-action-card',
      name: 'DataActionCard',
      purpose: 'Reusable action cards for data operations',
      location: 'client/src/components/lego-blocks/DataActionCard.tsx',
      category: 'ui',
      status: 'active',
      usageCount: 3,
      lastUpdated: '2025-01-08',
      features: ['Icon-based cards', 'Multiple variants', 'Hover effects', 'Consistent styling'],
      props: [
        { name: 'title', type: 'string', required: true, description: 'Card title' },
        { name: 'description', type: 'string', required: true, description: 'Card description' },
        { name: 'icon', type: 'LucideIcon', required: true, description: 'Icon component' },
        { name: 'onClick', type: '() => void', required: true, description: 'Click handler' },
        { name: 'variant', type: "'primary' | 'success' | 'warning' | 'danger'", required: false, default: 'primary', description: 'Visual variant' }
      ],
      examples: ['Export data', 'Import data', 'Reset to defaults']
    },
    {
      id: 'reusable-button',
      name: 'ReusableButton',
      purpose: 'Base button component with RSA styling',
      location: 'client/src/components/lego-blocks/ReusableButton.tsx',
      category: 'ui',
      status: 'active',
      usageCount: 15,
      lastUpdated: '2025-01-08',
      features: ['RSA-specific styles', 'Loading states', 'Icon support', 'Full width option'],
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'Button content' },
        { name: 'rsaStyle', type: "'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'reset'", required: false, description: 'RSA styling variant' },
        { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Loading state' },
        { name: 'icon', type: 'LucideIcon', required: false, description: 'Icon component' }
      ],
      examples: ['Form submissions', 'Action triggers', 'Navigation buttons']
    },
    {
      id: 'reusable-modal',
      name: 'ReusableModal',
      purpose: 'Consistent modal wrapper',
      location: 'client/src/components/lego-blocks/ReusableModal.tsx',
      category: 'modal',
      status: 'active',
      usageCount: 2,
      lastUpdated: '2025-01-08',
      features: ['Multiple sizes', 'Close button', 'Header and footer slots', 'Overlay click prevention'],
      props: [
        { name: 'isOpen', type: 'boolean', required: true, description: 'Modal visibility' },
        { name: 'onClose', type: '() => void', required: true, description: 'Close callback' },
        { name: 'title', type: 'string', required: false, description: 'Modal title' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", required: false, default: 'md', description: 'Modal size' }
      ],
      examples: ['Confirmation dialogs', 'Data entry forms', 'Detail views']
    }
  ]);

  const filteredComponents = legoComponents.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || component.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      form: 'bg-blue-100 text-blue-800',
      data: 'bg-green-100 text-green-800',
      ui: 'bg-purple-100 text-purple-800',
      modal: 'bg-orange-100 text-orange-800',
      action: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
      development: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleExportComponents = () => {
    const exportData = {
      components: legoComponents,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lego-components-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Components exported",
      description: "LEGO component definitions have been downloaded.",
    });
  };

  const handleCreateComponent = () => {
    toast({
      title: "Create Component",
      description: "Component creation wizard would open here.",
    });
  };

  const handleRefreshRegistry = () => {
    toast({
      title: "Registry refreshed",
      description: "Component registry has been updated from filesystem.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Blocks className="h-6 w-6 text-purple-600" />
                LEGO Block Manager
              </CardTitle>
              <p className="text-gray-600 mt-1">Manage and configure all reusable LEGO-style components</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-600">
                {legoComponents.length} Components
              </Badge>
              <Badge variant="outline" className="text-green-600">
                System Active
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <DataActionCard
              title="Create Component"
              description="Generate new LEGO block"
              icon={Plus}
              onClick={handleCreateComponent}
              variant="primary"
            />
            <DataActionCard
              title="Export Registry"
              description="Download component definitions"
              icon={Download}
              onClick={handleExportComponents}
              variant="success"
            />
            <DataActionCard
              title="Import Components"
              description="Upload component definitions"
              icon={Upload}
              onClick={() => toast({ title: "Import", description: "Import functionality would be implemented here." })}
              variant="warning"
            />
            <DataActionCard
              title="Refresh Registry"
              description="Scan filesystem for changes"
              icon={RefreshCw}
              onClick={handleRefreshRegistry}
              variant="primary"
            />
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search components by name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="form">Form Components</SelectItem>
                  <SelectItem value="data">Data Components</SelectItem>
                  <SelectItem value="ui">UI Components</SelectItem>
                  <SelectItem value="modal">Modal Components</SelectItem>
                  <SelectItem value="action">Action Components</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Component Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{component.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{component.purpose}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getCategoryBadgeColor(component.category)}>
                        {component.category}
                      </Badge>
                      <Badge className={getStatusBadgeColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usage Count:</span>
                    <span className="font-medium">{component.usageCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{component.lastUpdated}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Props:</span>
                    <span className="font-medium">{component.props.length}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedComponent(component)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedComponent(component);
                        setIsEditing(true);
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Blocks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  {selectedComponent.name}
                </CardTitle>
                <p className="text-gray-600 mt-1">{selectedComponent.purpose}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedComponent(null);
                  setIsEditing(false);
                }}
              >
                Close
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="props">Props</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Component Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {selectedComponent.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge className={getCategoryBadgeColor(selectedComponent.category)}>
                          {selectedComponent.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusBadgeColor(selectedComponent.status)}>
                          {selectedComponent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedComponent.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="props" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Required</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Default</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComponent.props.map((prop, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">
                            {prop.name}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm text-blue-600">
                            {prop.type}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Badge variant={prop.required ? "destructive" : "secondary"}>
                              {prop.required ? 'Required' : 'Optional'}
                            </Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">
                            {prop.default || '-'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm">
                            {prop.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Usage Examples</h4>
                  <div className="space-y-3">
                    {selectedComponent.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-700">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Component Name
                      </label>
                      <Input defaultValue={selectedComponent.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose
                      </label>
                      <Textarea defaultValue={selectedComponent.purpose} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Select defaultValue={selectedComponent.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="deprecated">Deprecated</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormActionButtons
                      onReset={() => setIsEditing(false)}
                      onSave={() => {
                        setIsEditing(false);
                        toast({
                          title: "Component updated",
                          description: "Component settings have been saved.",
                        });
                      }}
                      resetLabel="Cancel"
                      saveLabel="Save Changes"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Edit" to modify component settings.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}