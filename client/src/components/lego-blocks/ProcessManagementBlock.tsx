import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../../contexts/UseCaseContext';

/**
 * LEGO Block: Business Processes Management
 * Reuses existing modal pattern exactly like Business Segments
 */
export default function ProcessManagementBlock() {
  const { addMetadataItem, removeMetadataItem, updateMetadata, metadata } = useUseCases();
  const { toast } = useToast();
  
  const [newItem, setNewItem] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const processes = metadata?.processes || [];

  const handleAddProcess = async () => {
    if (!newItem.trim()) return;
    
    try {
      // Add to processes list using existing metadata API
      await addMetadataItem('processes', newItem.trim());
      
      // Initialize empty activities for the new process in processActivities
      const currentProcessActivities = metadata?.processActivities 
        ? (typeof metadata.processActivities === 'string' 
           ? JSON.parse(metadata.processActivities) 
           : metadata.processActivities)
        : {};

      const updatedProcessActivities = {
        ...currentProcessActivities,
        [newItem.trim()]: []
      };

      // Update the process-activity mapping
      await updateMetadata({
        ...metadata!,
        processActivities: updatedProcessActivities
      });

      setNewItem('');
      setIsModalOpen(false);
      
      toast({
        title: "Process added",
        description: `"${newItem.trim()}" has been added to Business Processes.`,
      });
    } catch (error) {
      toast({
        title: "Error adding process",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProcess = async (process: string) => {
    if (!confirm(`Are you sure you want to remove "${process}"? This will also remove all its activities.`)) return;
    
    try {
      // Remove from processes list
      await removeMetadataItem('processes', process);
      
      // Remove from process-activity mapping
      const currentProcessActivities = metadata?.processActivities 
        ? (typeof metadata.processActivities === 'string' 
           ? JSON.parse(metadata.processActivities) 
           : metadata.processActivities)
        : {};

      const { [process]: removed, ...updatedProcessActivities } = currentProcessActivities;

      await updateMetadata({
        ...metadata!,
        processActivities: updatedProcessActivities
      });
      
      toast({
        title: "Process removed",
        description: `"${process}" has been removed from Business Processes.`,
      });
    } catch (error) {
      toast({
        title: "Error removing process",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Business Processes</span>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 rounded-full" variant="default">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Business Process</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Enter new process name"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddProcess()}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewItem('');
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {processes.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No business processes defined
            </p>
          ) : (
            processes.map((process) => (
              <div
                key={process}
                className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">{process}</span>
                <Button
                  onClick={() => handleRemoveProcess(process)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}