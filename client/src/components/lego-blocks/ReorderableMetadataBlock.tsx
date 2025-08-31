import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, ArrowUpDown, Save, X, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../../contexts/UseCaseContext';
import { apiRequest } from '@/lib/queryClient';
import { MetadataConfig } from '@shared/schema';

interface ReorderableMetadataBlockProps {
  category: keyof MetadataConfig;
  title: string;
  items: string[];
  sortOrder?: Record<string, number>;
  placeholder?: string;
}

/**
 * LEGO Block: Enhanced Metadata List with Reordering
 * 
 * Features:
 * - Full CRUD operations (add, edit, delete)
 * - Drag-and-drop reordering using react-beautiful-dnd
 * - Custom sort order persistence in database
 * - Toggle between reorder mode and normal view
 * - Backwards compatible with existing MetadataLegoBlock
 * - Follows RSA branding and LEGO architecture principles
 */
export default function ReorderableMetadataBlock({ 
  category, 
  title, 
  items,
  sortOrder = {},
  placeholder = "Add new item..."
}: ReorderableMetadataBlockProps) {
  const { addMetadataItem, removeMetadataItem, editMetadataItem } = useUseCases();
  const { toast } = useToast();
  
  // Reordering state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  
  // CRUD state
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // CRUD handlers
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
    
    const oldValue = displayItems[editingIndex];
    if (oldValue === editingValue.trim()) {
      setEditingIndex(null);
      return;
    }

    try {
      await editMetadataItem(category, oldValue, editingValue.trim());
      
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

  // Sort items based on custom order or alphabetically
  const getSortedItems = () => {
    if (Object.keys(sortOrder).length === 0) {
      return [...items].sort(); // Alphabetical fallback
    }
    
    return [...items].sort((a, b) => {
      const orderA = sortOrder[a] ?? 999; // Items without order go to end
      const orderB = sortOrder[b] ?? 999;
      return orderA - orderB;
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(localItems);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setLocalItems(reorderedItems);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    
    try {
      await apiRequest(`/api/metadata/${category}/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedItems: localItems }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setIsReorderMode(false);
      toast({
        title: "Order saved",
        description: `Custom order for ${title} has been saved.`,
      });
      
      // Refresh the page to show updated order
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error saving order",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelReorder = () => {
    setLocalItems(getSortedItems());
    setIsReorderMode(false);
  };

  const handleEnterReorderMode = () => {
    setLocalItems(getSortedItems());
    setIsReorderMode(true);
  };

  const displayItems = isReorderMode ? localItems : getSortedItems();

  return (
    <Card className="card-rsa border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {!isReorderMode ? (
              <>
                <Button
                  onClick={() => setIsAdding(true)}
                  size="sm"
                  className="bg-rsa-blue hover:bg-rsa-dark-blue text-white rounded-full p-2 h-8 w-8"
                  data-testid={`button-add-${category}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleEnterReorderMode}
                  size="sm"
                  variant="outline"
                  className="text-rsa-blue border-rsa-blue hover:bg-rsa-blue hover:text-white"
                  data-testid={`button-reorder-${category}`}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Reorder
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveOrder}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSaving}
                  data-testid={`button-save-order-${category}`}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={handleCancelReorder}
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  data-testid={`button-cancel-reorder-${category}`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
        {isReorderMode && (
          <p className="text-sm text-gray-600 mt-2">
            Drag items to reorder them. Changes will be saved for all users.
          </p>
        )}
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
              data-testid={`input-new-${category}`}
            />
            <Button
              onClick={handleAddItem}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8"
              data-testid={`button-save-new-${category}`}
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
              data-testid={`button-cancel-new-${category}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isReorderMode ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`droppable-${category}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-2 min-h-[100px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-rsa-blue bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {displayItems.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center p-3 bg-white rounded-lg border transition-all ${
                            snapshot.isDragging 
                              ? 'shadow-lg border-rsa-blue scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`draggable-item-${category}-${index}`}
                        >
                          <GripVertical className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700 break-words">{item}</span>
                          <div className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {displayItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                data-testid={`item-${category}-${index}`}
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
                      data-testid={`input-edit-${category}-${index}`}
                    />
                    <Button
                      onClick={saveEdit}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white p-1 h-8 w-8"
                      data-testid={`button-save-edit-${category}-${index}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      size="sm"
                      variant="outline"
                      className="p-1 h-8 w-8"
                      data-testid={`button-cancel-edit-${category}-${index}`}
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
                        data-testid={`button-edit-${category}-${index}`}
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveItem(item)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8 hover:bg-red-100"
                        data-testid={`button-delete-${category}-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {displayItems.length === 0 && !isAdding && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">No items yet. Click the + button to add the first one.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}