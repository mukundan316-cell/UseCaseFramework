import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import { MetadataConfig } from '@shared/schema';

export default function AdminPanel() {
  const { 
    metadata, 
    updateMetadata, 
    addMetadataItem, 
    removeMetadataItem, 
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
  
  const [editingItem, setEditingItem] = useState<{
    category: string;
    index: number;
    value: string;
  } | null>(null);
  
  const [newItems, setNewItems] = useState<Record<string, string>>({
    valueChainComponents: '',
    processes: '',
    linesOfBusiness: '',
    businessSegments: '',
    geographies: '',
    useCaseTypes: ''
  });

  const categoryLabels: Record<string, string> = {
    valueChainComponents: 'Value Chain Components',
    processes: 'Processes',
    linesOfBusiness: 'Lines of Business',
    businessSegments: 'Business Segments',
    geographies: 'Geographies',
    useCaseTypes: 'Use Case Types'
  };

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
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      resetToDefaults();
      toast({
        title: "Data reset successfully",
        description: "All configuration and use cases have been restored to defaults.",
      });
    }
  };

  const handleAddItem = (category: string) => {
    const newItem = newItems[category]?.trim();
    if (newItem) {
      addMetadataItem(category as keyof MetadataConfig, newItem);
      setNewItems(prev => ({ ...prev, [category]: '' }));
      toast({
        title: "Item added",
        description: `"${newItem}" has been added to ${categoryLabels[category]}.`,
      });
    }
  };

  const handleEditItem = (category: string, index: number, currentValue: string) => {
    setEditingItem({ category, index, value: currentValue });
  };

  const handleSaveEdit = () => {
    if (!editingItem || !metadata) return;
    
    const newMetadata = { ...metadata };
    const categoryData = newMetadata[editingItem.category as keyof MetadataConfig] as string[];
    if (Array.isArray(categoryData)) {
      categoryData[editingItem.index] = editingItem.value;
      updateMetadata(newMetadata);
      setEditingItem(null);
      
      toast({
        title: "Item updated",
        description: "The item has been successfully updated.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleRemoveItem = (category: string, item: string) => {
    if (confirm(`Are you sure you want to remove "${item}"?`)) {
      removeMetadataItem(category as keyof MetadataConfig, item);
      toast({
        title: "Item removed",
        description: `"${item}" has been removed from ${categoryLabels[category]}.`,
      });
    }
  };

  const MetadataSection = ({ 
    category, 
    items 
  }: { 
    category: string; 
    items: string[]; 
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{categoryLabels[category]}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <GripVertical className="h-4 w-4 text-gray-400" />
              {editingItem?.category === category && editingItem?.index === index ? (
                <Input
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                  className="font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
              ) : (
                <span className="font-medium">{item}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {editingItem?.category === category && editingItem?.index === index ? (
                <>
                  <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditItem(category, index, item)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveItem(category, item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        <div className="flex space-x-2">
          <Input
            placeholder={`Add new ${categoryLabels[category].toLowerCase()}`}
            value={newItems[category]}
            onChange={(e) => setNewItems(prev => ({ ...prev, [category]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem(category);
            }}
          />
          <Button
            onClick={() => handleAddItem(category)}
            disabled={!newItems[category].trim()}
            className="bg-rsa-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Panel</CardTitle>
          <CardDescription>Manage metadata categories and system configuration</CardDescription>
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

          {/* Metadata Categories Management */}
          <div className="space-y-8">
            {Object.entries(metadata)
              .filter(([category]) => category !== 'id' && category !== 'updatedAt')
              .map(([category, items]) => (
                <MetadataSection
                  key={category}
                  category={category}
                  items={Array.isArray(items) ? items : []}
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
