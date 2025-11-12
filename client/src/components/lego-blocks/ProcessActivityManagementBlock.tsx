import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit2, GripVertical, ArrowUpDown, Save } from 'lucide-react';
import { useProcessActivityManager } from './ProcessActivityManager';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * LEGO Block: Process-Activity Management
 * Provides a unified interface to manage process-activity relationships
 * Reuses existing metadata management APIs and components
 */
export default function ProcessActivityManagementBlock() {
  const [selectedProcess, setSelectedProcess] = useState<string>('');
  const [newActivity, setNewActivity] = useState('');
  const [newProcessName, setNewProcessName] = useState('');
  const [isAddProcessModalOpen, setIsAddProcessModalOpen] = useState(false);
  
  // Reordering state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localActivities, setLocalActivities] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { getActivitiesForProcess, getAllProcesses } = useProcessActivityManager();
  const { updateMetadata, addMetadataItem, removeMetadataItem, metadata } = useUseCases();
  const { toast } = useToast();

  const processes = getAllProcesses();
  const activitiesForSelectedProcess = getActivitiesForProcess(selectedProcess);
  
  // Get sorted activities for the selected process
  const getSortedActivities = (activities: string[]) => {
    const processActivitiesSortOrder = metadata?.processActivitiesSortOrder;
    if (!processActivitiesSortOrder || !selectedProcess || !processActivitiesSortOrder[selectedProcess]) {
      return activities; // Return in original order if no custom sorting
    }
    
    const sortOrder = processActivitiesSortOrder[selectedProcess];
    return activities.sort((a, b) => {
      const aOrder = sortOrder[a] ?? 999; // Put items without order at end
      const bOrder = sortOrder[b] ?? 999;
      return aOrder - bOrder;
    });
  };
  
  const sortedActivities = getSortedActivities(activitiesForSelectedProcess);
  
  // Update local activities when process changes or reorder mode is enabled
  React.useEffect(() => {
    setLocalActivities(sortedActivities);
  }, [selectedProcess, JSON.stringify(sortedActivities), isReorderMode]);

  const handleAddActivity = async () => {
    if (!selectedProcess || !newActivity.trim()) return;
    
    try {
      // Update the processActivities mapping in metadata
      const currentProcessActivities = metadata?.processActivities 
        ? (typeof metadata.processActivities === 'string' 
           ? JSON.parse(metadata.processActivities) 
           : metadata.processActivities)
        : {};

      const updatedProcessActivities = {
        ...currentProcessActivities,
        [selectedProcess]: [
          ...(currentProcessActivities[selectedProcess] || []),
          newActivity.trim()
        ]
      };

      // Update metadata with new process-activity mapping
      await updateMetadata({
        ...metadata!,
        processActivities: updatedProcessActivities,
        activities: [
          ...(metadata?.activities || []),
          newActivity.trim()
        ].filter((activity, index, arr) => arr.indexOf(activity) === index) // Remove duplicates
      });

      setNewActivity('');
      toast({
        title: "Activity Added",
        description: `"${newActivity}" added to ${selectedProcess}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveActivity = async (activity: string) => {
    if (!selectedProcess) return;
    
    try {
      const currentProcessActivities = metadata?.processActivities 
        ? (typeof metadata.processActivities === 'string' 
           ? JSON.parse(metadata.processActivities) 
           : metadata.processActivities)
        : {};

      const updatedProcessActivities = {
        ...currentProcessActivities,
        [selectedProcess]: currentProcessActivities[selectedProcess]?.filter((a: string) => a !== activity) || []
      };

      await updateMetadata({
        ...metadata!,
        processActivities: updatedProcessActivities
      });

      toast({
        title: "Activity Removed",
        description: `"${activity}" removed from ${selectedProcess}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove activity",
        variant: "destructive",
      });
    }
  };

  const handleAddProcess = async () => {
    if (!newProcessName.trim()) return;
    
    try {
      // Add to processes list
      const updatedProcesses = [...(metadata?.processes || []), newProcessName.trim()];
      
      // Initialize empty activities for the new process
      const currentProcessActivities = metadata?.processActivities 
        ? (typeof metadata.processActivities === 'string' 
           ? JSON.parse(metadata.processActivities) 
           : metadata.processActivities)
        : {};

      const updatedProcessActivities = {
        ...currentProcessActivities,
        [newProcessName.trim()]: []
      };

      await updateMetadata({
        ...metadata!,
        processes: updatedProcesses,
        processActivities: updatedProcessActivities
      });

      setSelectedProcess(newProcessName.trim()); // Auto-select the new process
      setNewProcessName('');
      setIsAddProcessModalOpen(false);
      
      toast({
        title: "Process Added",
        description: `"${newProcessName}" has been created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add process",
        variant: "destructive",
      });
    }
  };
  
  // Drag and drop handlers
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(localActivities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalActivities(items);
  };
  
  const saveReorder = async () => {
    if (!selectedProcess) return;
    
    setIsSaving(true);
    try {
      await apiRequest(`/api/metadata/process-activities/${encodeURIComponent(selectedProcess)}/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedActivities: localActivities }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "Order Updated",
        description: `Activity order saved for ${selectedProcess}`,
      });
      
      setIsReorderMode(false);
      
      // Refresh metadata to get updated sort order
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save activity order",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const cancelReorder = () => {
    setLocalActivities(sortedActivities);
    setIsReorderMode(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit2 className="h-5 w-5" />
          Process-Activity Relationships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Process Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Select Process to Manage Activities</Label>
            <Dialog open={isAddProcessModalOpen} onOpenChange={setIsAddProcessModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Process
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Business Process</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter new process name"
                    value={newProcessName}
                    onChange={(e) => setNewProcessName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProcess()}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddProcessModalOpen(false);
                        setNewProcessName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddProcess}>
                      Add Process
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <select 
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">-- Select Process --</option>
            {processes.map(process => (
              <option key={process} value={process}>{process}</option>
            ))}
          </select>
        </div>

        {/* Activities Management */}
        {selectedProcess && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Activities for "{selectedProcess}"</h4>
              {sortedActivities.length > 1 && (
                <div className="flex gap-2">
                  {isReorderMode ? (
                    <>
                      <Button 
                        onClick={saveReorder} 
                        size="sm" 
                        disabled={isSaving}
                        className="bg-[#3C2CDA] hover:bg-[#004a8c] text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? 'Saving...' : 'Save Order'}
                      </Button>
                      <Button onClick={cancelReorder} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsReorderMode(true)} 
                      size="sm" 
                      variant="outline"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Reorder
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Add New Activity */}
            {!isReorderMode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new activity"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                />
                <Button onClick={handleAddActivity} size="sm">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            )}

            {/* Activities List with Drag and Drop */}
            <div className="max-h-48 overflow-y-auto">
              {sortedActivities.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No activities defined for this process</p>
              ) : isReorderMode ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="activities">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {localActivities.map((activity, index) => (
                          <Draggable key={activity} draggableId={activity} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center p-2 bg-white rounded border ${
                                  snapshot.isDragging ? 'shadow-md ring-2 ring-[#3C2CDA]/20' : ''
                                }`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="mr-2 text-gray-400 hover:text-gray-600"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <span className="text-sm flex-1">{activity}</span>
                                <span className="text-xs text-gray-400 ml-2">#{index + 1}</span>
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
                  {sortedActivities.map(activity => (
                    <div key={activity} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{activity}</span>
                      <Button
                        onClick={() => handleRemoveActivity(activity)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedProcess && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Select a process above to manage its activities. This interface maintains the relationship between processes and their specific activities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}