import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  GripVertical, 
  Info, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface RankingItem {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

export interface RankingLegoBlockProps {
  /** Question data including text and help text */
  question: {
    id: string;
    questionText: string;
    helpText?: string;
    isRequired?: boolean;
  };
  /** Items to be ranked */
  items: RankingItem[];
  /** Current ranking (array of item IDs in ranked order) */
  value: string[] | null;
  /** Change handler */
  onChange: (value: string[]) => void;
  /** Maximum number of items to rank (default: all items) */
  maxRank?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Show validation errors */
  error?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show ranking numbers */
  showNumbers?: boolean;
  /** Allow partial ranking */
  allowPartial?: boolean;
}

/**
 * RankingLegoBlock - Drag-and-drop ranking component for use case prioritization
 * 
 * Features:
 * - Drag-and-drop reordering with visual feedback
 * - Touch-friendly mobile interface
 * - Ranking numbers display
 * - Validation for complete ranking
 * - Keyboard navigation support
 * - Reset functionality
 */
export const RankingLegoBlock: React.FC<RankingLegoBlockProps> = ({
  question,
  items,
  value,
  onChange,
  maxRank,
  disabled = false,
  error,
  className = '',
  showNumbers = true,
  allowPartial = false
}) => {
  const [rankedItems, setRankedItems] = useState<RankingItem[]>([]);
  const [unrankedItems, setUnrankedItems] = useState<RankingItem[]>([]);
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  const effectiveMaxRank = maxRank || items.length;

  // Initialize ranking state
  useEffect(() => {
    if (value && value.length > 0) {
      // Build ranked items from value array
      const ranked = value
        .slice(0, effectiveMaxRank)
        .map(id => items.find(item => item.id === id))
        .filter(Boolean) as RankingItem[];
      
      // Build unranked items
      const rankedIds = new Set(value);
      const unranked = items.filter(item => !rankedIds.has(item.id));
      
      setRankedItems(ranked);
      setUnrankedItems(unranked);
    } else {
      // No ranking yet - all items are unranked
      setRankedItems([]);
      setUnrankedItems([...items]);
    }
  }, [items, value, effectiveMaxRank]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (disabled || !result.destination) return;

    const { source, destination } = result;

    // Handle reordering within ranked items
    if (source.droppableId === 'ranked' && destination.droppableId === 'ranked') {
      const newRankedItems = Array.from(rankedItems);
      const [reorderedItem] = newRankedItems.splice(source.index, 1);
      newRankedItems.splice(destination.index, 0, reorderedItem);
      
      setRankedItems(newRankedItems);
      updateValue(newRankedItems);
    }
    // Handle moving from unranked to ranked
    else if (source.droppableId === 'unranked' && destination.droppableId === 'ranked') {
      if (rankedItems.length >= effectiveMaxRank) return;
      
      const newUnrankedItems = Array.from(unrankedItems);
      const [movedItem] = newUnrankedItems.splice(source.index, 1);
      
      const newRankedItems = Array.from(rankedItems);
      newRankedItems.splice(destination.index, 0, movedItem);
      
      setRankedItems(newRankedItems);
      setUnrankedItems(newUnrankedItems);
      updateValue(newRankedItems);
    }
    // Handle moving from ranked to unranked
    else if (source.droppableId === 'ranked' && destination.droppableId === 'unranked') {
      const newRankedItems = Array.from(rankedItems);
      const [movedItem] = newRankedItems.splice(source.index, 1);
      
      const newUnrankedItems = Array.from(unrankedItems);
      newUnrankedItems.splice(destination.index, 0, movedItem);
      
      setRankedItems(newRankedItems);
      setUnrankedItems(newUnrankedItems);
      updateValue(newRankedItems);
    }
  };

  // Update the value prop
  const updateValue = (ranked: RankingItem[]) => {
    onChange(ranked.map(item => item.id));
  };

  // Move item up in ranking
  const moveUp = (index: number) => {
    if (index === 0 || disabled) return;
    const newRankedItems = Array.from(rankedItems);
    const [item] = newRankedItems.splice(index, 1);
    newRankedItems.splice(index - 1, 0, item);
    setRankedItems(newRankedItems);
    updateValue(newRankedItems);
  };

  // Move item down in ranking
  const moveDown = (index: number) => {
    if (index === rankedItems.length - 1 || disabled) return;
    const newRankedItems = Array.from(rankedItems);
    const [item] = newRankedItems.splice(index, 1);
    newRankedItems.splice(index + 1, 0, item);
    setRankedItems(newRankedItems);
    updateValue(newRankedItems);
  };

  // Reset ranking
  const resetRanking = () => {
    if (disabled) return;
    setRankedItems([]);
    setUnrankedItems([...items]);
    onChange([]);
  };

  // Add item to ranking
  const addToRanking = (item: RankingItem) => {
    if (disabled || rankedItems.length >= effectiveMaxRank) return;
    
    const newRankedItems = [...rankedItems, item];
    const newUnrankedItems = unrankedItems.filter(i => i.id !== item.id);
    
    setRankedItems(newRankedItems);
    setUnrankedItems(newUnrankedItems);
    updateValue(newRankedItems);
  };

  // Remove item from ranking
  const removeFromRanking = (item: RankingItem) => {
    if (disabled) return;
    
    const newRankedItems = rankedItems.filter(i => i.id !== item.id);
    const newUnrankedItems = [...unrankedItems, item];
    
    setRankedItems(newRankedItems);
    setUnrankedItems(newUnrankedItems);
    updateValue(newRankedItems);
  };

  // Validation
  const isValid = allowPartial || rankedItems.length === effectiveMaxRank;
  const completionPercentage = (rankedItems.length / effectiveMaxRank) * 100;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Question Header */}
      {question && (
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.helpText && (
            <p className="text-sm text-gray-600">{question.helpText}</p>
          )}
        </div>
      )}

      {/* Validation Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Ranking Controls */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Priority Ranking
        </Label>
        
        {question.helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{question.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Progress and Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Progress: <span className="font-medium">{rankedItems.length}/{effectiveMaxRank}</span>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#005DAA] h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-600" />
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetRanking}
          disabled={disabled || rankedItems.length === 0}
          className="text-gray-600 hover:text-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranked Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              Ranked Items
              {effectiveMaxRank < items.length && (
                <span className="ml-2 text-xs text-gray-500">(Top {effectiveMaxRank})</span>
              )}
            </h3>
            
            <Droppable droppableId="ranked">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors",
                    snapshot.isDraggingOver ? "border-[#005DAA] bg-blue-50" : "border-gray-300 bg-gray-50",
                    disabled && "opacity-50"
                  )}
                >
                  {rankedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      Drag items here to rank them
                    </div>
                  ) : (
                    rankedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={disabled}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "mb-2 p-3 bg-white border rounded-lg shadow-sm transition-all",
                              snapshot.isDragging && "shadow-lg rotate-2 scale-105",
                              disabled ? "cursor-not-allowed" : "cursor-move"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              {/* Rank Number */}
                              {showNumbers && (
                                <div className="flex-shrink-0 w-8 h-8 bg-[#005DAA] text-white rounded-full flex items-center justify-center font-medium text-sm">
                                  {index + 1}
                                </div>
                              )}
                              
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="flex-shrink-0">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              
                              {/* Item Content */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{item.label}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</div>
                                )}
                                {item.category && (
                                  <div className="text-xs text-gray-500 mt-1">Category: {item.category}</div>
                                )}
                              </div>
                              
                              {/* Manual Controls */}
                              <div className="flex flex-col space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveUp(index)}
                                  disabled={disabled || index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveDown(index)}
                                  disabled={disabled || index === rankedItems.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Unranked Items */}
          {unrankedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Available Items</h3>
              
              <Droppable droppableId="unranked">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors",
                      snapshot.isDraggingOver ? "border-gray-400 bg-gray-100" : "border-gray-200 bg-gray-25",
                      disabled && "opacity-50"
                    )}
                  >
                    {unrankedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={disabled}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "mb-2 p-3 bg-white border rounded-lg shadow-sm transition-all",
                              snapshot.isDragging && "shadow-lg rotate-2 scale-105",
                              disabled ? "cursor-not-allowed" : "cursor-move"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="flex-shrink-0">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              
                              {/* Item Content */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{item.label}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</div>
                                )}
                                {item.category && (
                                  <div className="text-xs text-gray-500 mt-1">Category: {item.category}</div>
                                )}
                              </div>
                              
                              {/* Quick Add Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToRanking(item)}
                                disabled={disabled || rankedItems.length >= effectiveMaxRank}
                                className="text-xs"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </DragDropContext>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
      
      {/* Validation Message */}
      {!allowPartial && !isValid && rankedItems.length > 0 && (
        <p className="text-sm text-orange-600 mt-2">
          Please rank {effectiveMaxRank - rankedItems.length} more item{effectiveMaxRank - rankedItems.length !== 1 ? 's' : ''} to complete this question.
        </p>
      )}
    </div>
  );
};

export default RankingLegoBlock;