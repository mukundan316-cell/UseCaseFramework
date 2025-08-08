import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { useProcessActivityManager } from './ProcessActivityManager';
import { useUseCases } from '../../contexts/UseCaseContext';
import { useToast } from '@/hooks/use-toast';

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
  
  const { getActivitiesForProcess, getAllProcesses } = useProcessActivityManager();
  const { updateMetadata, addMetadataItem, removeMetadataItem, metadata } = useUseCases();
  const { toast } = useToast();

  const processes = getAllProcesses();
  const activitiesForSelectedProcess = getActivitiesForProcess(selectedProcess);

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
        [selectedProcess]: currentProcessActivities[selectedProcess]?.filter(a => a !== activity) || []
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
            <h4 className="font-medium">Activities for "{selectedProcess}"</h4>
            
            {/* Add New Activity */}
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

            {/* Activities List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activitiesForSelectedProcess.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No activities defined for this process</p>
              ) : (
                activitiesForSelectedProcess.map(activity => (
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
                ))
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