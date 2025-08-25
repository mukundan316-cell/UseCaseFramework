import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../contexts/UseCaseContext';
import { MetadataConfig } from '@shared/schema';

interface MetadataLegoBlockProps {
  category: keyof MetadataConfig;
  title: string;
  items: string[];
  placeholder?: string;
}

export default function MetadataLegoBlock({ 
  category, 
  title, 
  items, 
  placeholder = "Add new item..." 
}: MetadataLegoBlockProps) {
  const { addMetadataItem, removeMetadataItem } = useUseCases();
  const { toast } = useToast();
  
  // Debug logging for activities
  if (category === 'activities') {
    console.log(`[${title}] Received ${items.length} items:`, items.slice(0, 5), '...');
  }
  
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    
    try {
      await addMetadataItem(category, newItem.trim());
      setNewItem('');
      setIsAdding(false);
      toast({
        title: "Item added",
        description: `"${newItem.trim()}" has been added to ${title}.`,
      });
    } catch (error) {
      toast({
        title: "Error adding item",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (item: string) => {
    if (!confirm(`Are you sure you want to remove "${item}"?`)) return;
    
    try {
      await removeMetadataItem(category, item);
      toast({
        title: "Item removed",
        description: `"${item}" has been removed from ${title}.`,
      });
    } catch (error) {
      toast({
        title: "Error removing item",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  const saveEdit = async () => {
    if (editingIndex === null || !editingValue.trim()) return;
    
    const oldValue = items[editingIndex];
    if (oldValue === editingValue.trim()) {
      setEditingIndex(null);
      return;
    }

    try {
      // Remove old item and add new one
      await removeMetadataItem(category, oldValue);
      await addMetadataItem(category, editingValue.trim());
      
      setEditingIndex(null);
      setEditingValue('');
      toast({
        title: "Item updated",
        description: `"${oldValue}" has been updated to "${editingValue.trim()}".`,
      });
    } catch (error) {
      toast({
        title: "Error updating item",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <Card className="card-rsa border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="bg-rsa-blue hover:bg-rsa-dark-blue text-white rounded-full p-2 h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Add new item interface */}
        {isAdding && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewItem('');
                }
              }}
              autoFocus
            />
            <Button
              onClick={handleAddItem}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewItem('');
              }}
              size="sm"
              variant="outline"
              className="p-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Existing items */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
            >
              {editingIndex === index ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={saveEdit}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white p-1 h-8 w-8"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    size="sm"
                    variant="outline"
                    className="p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700 font-medium flex-1">{item}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => startEditing(index, item)}
                      size="sm"
                      variant="ghost"
                      className="p-1 h-8 w-8 hover:bg-blue-100"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => handleRemoveItem(item)}
                      size="sm"
                      variant="ghost"
                      className="p-1 h-8 w-8 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No items yet. Click the + button to add the first one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}