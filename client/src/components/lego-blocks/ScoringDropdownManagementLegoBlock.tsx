import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUseCases } from '../../contexts/UseCaseContext';

interface ScoringDropdownOption {
  value: number;
  label: string;
  description?: string;
}

interface ScoringDropdownManagementLegoBlockProps {
  scoringField: string;
  title: string;
  options: ScoringDropdownOption[];
  description?: string;
}

/**
 * LEGO Block: Scoring Dropdown Options Management
 * 
 * Features:
 * - CRUD operations for dropdown options (label, value, description)
 * - Maintains value consistency for scoring calculations
 * - Admin-friendly interface for business users
 * - Follows RSA branding and LEGO architecture principles
 * - Validates that scoring values remain 1-5 for calculation compatibility
 */
export default function ScoringDropdownManagementLegoBlock({ 
  scoringField, 
  title, 
  options = [],
  description 
}: ScoringDropdownManagementLegoBlockProps) {
  const { updateScoringDropdownOptions } = useUseCases();
  const { toast } = useToast();
  
  // Add new option state
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState<number>(1);
  const [newDescription, setNewDescription] = useState('');
  
  // Edit option state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingValue, setEditingValue] = useState<number>(1);
  const [editingDescription, setEditingDescription] = useState('');

  // Add new option handler
  const handleAddOption = async () => {
    if (!newLabel.trim()) {
      toast({
        title: "Label required",
        description: "Please provide a label for the option.",
        variant: "destructive",
      });
      return;
    }

    if (newValue < 1 || newValue > 5) {
      toast({
        title: "Invalid value",
        description: "Score values must be between 1 and 5.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate values
    if (options.some(opt => opt.value === newValue)) {
      toast({
        title: "Duplicate value",
        description: `Value ${newValue} is already used by another option.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const newOption: ScoringDropdownOption = {
        label: newLabel.trim(),
        value: newValue,
        description: newDescription.trim() || undefined
      };

      const updatedOptions = [...options, newOption].sort((a, b) => a.value - b.value);
      await updateScoringDropdownOptions(scoringField, updatedOptions);
      
      // Reset form
      setNewLabel('');
      setNewValue(1);
      setNewDescription('');
      setIsAdding(false);
      
      toast({
        title: "Option added",
        description: `"${newLabel.trim()}" has been added to ${title}.`,
      });
    } catch (error) {
      toast({
        title: "Error adding option",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove option handler
  const handleRemoveOption = async (index: number) => {
    const option = options[index];
    if (!confirm(`Are you sure you want to remove "${option.label}" (${option.value})?`)) return;
    
    try {
      const updatedOptions = options.filter((_, i) => i !== index);
      await updateScoringDropdownOptions(scoringField, updatedOptions);
      
      toast({
        title: "Option removed",
        description: `"${option.label}" has been removed from ${title}.`,
      });
    } catch (error) {
      toast({
        title: "Error removing option",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start editing
  const startEditing = (index: number) => {
    const option = options[index];
    setEditingIndex(index);
    setEditingLabel(option.label);
    setEditingValue(option.value);
    setEditingDescription(option.description || '');
  };

  // Save edit
  const saveEdit = async () => {
    if (editingIndex === null || !editingLabel.trim()) return;
    
    if (editingValue < 1 || editingValue > 5) {
      toast({
        title: "Invalid value",
        description: "Score values must be between 1 and 5.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate values (excluding current option)
    if (options.some((opt, i) => i !== editingIndex && opt.value === editingValue)) {
      toast({
        title: "Duplicate value",
        description: `Value ${editingValue} is already used by another option.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedOptions = options.map((option, i) => 
        i === editingIndex 
          ? { 
              label: editingLabel.trim(), 
              value: editingValue, 
              description: editingDescription.trim() || undefined 
            }
          : option
      ).sort((a, b) => a.value - b.value);
      
      await updateScoringDropdownOptions(scoringField, updatedOptions);
      
      setEditingIndex(null);
      setEditingLabel('');
      setEditingValue(1);
      setEditingDescription('');
      
      toast({
        title: "Option updated",
        description: `Option has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error updating option",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingLabel('');
    setEditingValue(1);
    setEditingDescription('');
  };

  const cancelAdd = () => {
    setNewLabel('');
    setNewValue(1);
    setNewDescription('');
    setIsAdding(false);
  };

  return (
    <Card className="card-rsa border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="bg-rsa-blue hover:bg-rsa-blue/90 text-white"
            data-testid={`button-add-scoring-option-${scoringField}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>
        {description && (
          <div className="flex items-start gap-2 mt-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Add new option form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Add New Option</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Option label (e.g., 'Significant')"
                  data-testid={`input-new-label-${scoringField}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score Value (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={newValue}
                  onChange={(e) => setNewValue(parseInt(e.target.value) || 1)}
                  data-testid={`input-new-value-${scoringField}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed description for business context"
                  rows={2}
                  data-testid={`textarea-new-description-${scoringField}`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddOption}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid={`button-save-new-option-${scoringField}`}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
                <Button
                  onClick={cancelAdd}
                  variant="outline"
                  size="sm"
                  data-testid={`button-cancel-new-option-${scoringField}`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Options list */}
        <div className="space-y-2">
          {options.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No options configured. Add the first option to get started.
            </div>
          ) : (
            options.map((option, index) => (
              <div 
                key={`${option.value}-${option.label}`} 
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                data-testid={`option-item-${scoringField}-${option.value}`}
              >
                {editingIndex === index ? (
                  // Edit mode
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        placeholder="Label"
                        data-testid={`input-edit-label-${scoringField}-${index}`}
                      />
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={editingValue}
                        onChange={(e) => setEditingValue(parseInt(e.target.value) || 1)}
                        data-testid={`input-edit-value-${scoringField}-${index}`}
                      />
                      <div className="flex gap-1">
                        <Button
                          onClick={saveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-save-edit-${scoringField}-${index}`}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="outline"
                          size="sm"
                          data-testid={`button-cancel-edit-${scoringField}-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Description"
                      rows={2}
                      data-testid={`textarea-edit-description-${scoringField}-${index}`}
                    />
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{option.label}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Value: {option.value}
                        </span>
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600">{option.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => startEditing(index)}
                        variant="outline"
                        size="sm"
                        data-testid={`button-edit-option-${scoringField}-${index}`}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveOption(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-option-${scoringField}-${index}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Help text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Scoring Guidelines:</strong> Values must be 1-5 to maintain calculation compatibility. 
            Lower values typically represent easier implementation or lower impact. Ensure logical consistency within each scoring dimension.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}