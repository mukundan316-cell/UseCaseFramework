import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, ArrowUpDown, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MetadataConfig } from '@shared/schema';

interface ReorderableMetadataBlockProps {
  category: keyof MetadataConfig;
  title: string;
  items: string[];
  sortOrder?: Record<string, number>;
}

/**
 * LEGO Block: Reorderable Metadata List
 * 
 * Features:
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
  sortOrder = {}
}: ReorderableMetadataBlockProps) {
  const { toast } = useToast();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

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
      
      <CardContent>
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
          <div className="space-y-2">
            {displayItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                data-testid={`item-${category}-${index}`}
              >
                <span className="text-sm text-gray-700 break-words">{item}</span>
                <div className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
            {displayItems.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No items available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}