import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Users, TrendingUp, Award } from 'lucide-react';
import { SmartRatingLegoBlock } from './SmartRatingLegoBlock';

// Training priority types
export type TrainingPriority = 'High' | 'Medium' | 'Low';

// Department data structure
export interface DepartmentData {
  name: string;
  count: number;
  skills: number;
  priority: TrainingPriority;
}

// Component props interface
export interface DepartmentSkillsMatrixLegoBlockProps {
  /** Current departments data */
  departments?: DepartmentData[];
  /** Change handler that receives the updated departments array */
  onChange?: (departments: DepartmentData[]) => void;
  /** Show totals section */
  showTotals?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label */
  label?: string;
  /** Error message */
  error?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Minimum number of departments */
  minDepartments?: number;
  /** Maximum number of departments */
  maxDepartments?: number;
  /** Additional context value */
  additionalContext?: string;
  /** Handler for additional context changes */
  onAdditionalContextChange?: (value: string) => void;
  /** Label for additional context section */
  additionalContextLabel?: string;
}

// Training priority configurations
const PRIORITY_CONFIG = {
  High: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    badgeVariant: 'destructive' as const,
    weight: 3
  },
  Medium: { 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    badgeVariant: 'secondary' as const,
    weight: 2
  },
  Low: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    badgeVariant: 'outline' as const,
    weight: 1
  }
};

// Default departments for organizations
const DEFAULT_DEPARTMENTS = [
  'Underwriting',
  'Claims',
  'Risk Assessment',
  'Customer Service',
  'Operations',
  'Finance',
  'IT',
  'Marketing',
  'Legal & Compliance'
];

/**
 * DepartmentSkillsMatrixLegoBlock - Department AI skills assessment matrix
 * 
 * Features:
 * - Table with department name, employee count, AI skills rating, training priority
 * - SmartRatingLegoBlock integration for skills assessment
 * - Calculated totals for employee count and average skill level
 * - Add/remove departments functionality
 * - JSON serialization for complex data storage
 */
export default function DepartmentSkillsMatrixLegoBlock({
  departments = [],
  onChange,
  showTotals = true,
  disabled = false,
  className = '',
  label = 'Department AI Skills Assessment',
  error,
  helpText = 'Assess AI skills maturity across departments and identify training priorities.',
  required = false,
  minDepartments = 1,
  maxDepartments = 15,
  additionalContext = '',
  onAdditionalContextChange,
  additionalContextLabel = 'Additional Context'
}: DepartmentSkillsMatrixLegoBlockProps) {

  const [localDepartments, setLocalDepartments] = useState<DepartmentData[]>(
    departments.length > 0 ? departments : [
      { name: 'Underwriting', count: 0, skills: 1, priority: 'Medium' }
    ]
  );
  const [isEditing, setIsEditing] = useState<number | null>(null);

  // Calculate totals
  const totalEmployees = localDepartments.reduce((sum, dept) => sum + dept.count, 0);
  const averageSkillLevel = localDepartments.length > 0 
    ? localDepartments.reduce((sum, dept) => sum + dept.skills, 0) / localDepartments.length
    : 0;
  const highPriorityCount = localDepartments.filter(dept => dept.priority === 'High').length;

  // Update parent when local state changes
  useEffect(() => {
    if (onChange) {
      onChange(localDepartments);
    }
  }, [localDepartments, onChange]);

  // Handle department name change
  const handleNameChange = useCallback((index: number, newName: string) => {
    setLocalDepartments(prev => prev.map((dept, i) => 
      i === index ? { ...dept, name: newName } : dept
    ));
  }, []);

  // Handle employee count change
  const handleCountChange = useCallback((index: number, newCount: number) => {
    const validCount = Math.max(0, Math.min(10000, newCount));
    setLocalDepartments(prev => prev.map((dept, i) => 
      i === index ? { ...dept, count: validCount } : dept
    ));
  }, []);

  // Handle skills rating change
  const handleSkillsChange = useCallback((index: number, newSkills: number) => {
    setLocalDepartments(prev => prev.map((dept, i) => 
      i === index ? { ...dept, skills: newSkills } : dept
    ));
  }, []);

  // Handle training priority change
  const handlePriorityChange = useCallback((index: number, newPriority: TrainingPriority) => {
    setLocalDepartments(prev => prev.map((dept, i) => 
      i === index ? { ...dept, priority: newPriority } : dept
    ));
  }, []);

  // Add new department
  const addDepartment = useCallback(() => {
    if (localDepartments.length >= maxDepartments) return;
    
    // Find unused default name or create custom one
    const usedNames = localDepartments.map(dept => dept.name);
    const availableName = DEFAULT_DEPARTMENTS.find(name => !usedNames.includes(name)) 
      || `Department ${localDepartments.length + 1}`;
    
    setLocalDepartments(prev => [...prev, {
      name: availableName,
      count: 0,
      skills: 1,
      priority: 'Medium'
    }]);
  }, [localDepartments, maxDepartments]);

  // Remove department
  const removeDepartment = useCallback((index: number) => {
    if (localDepartments.length <= minDepartments) return;
    setLocalDepartments(prev => prev.filter((_, i) => i !== index));
  }, [localDepartments.length, minDepartments]);

  // Get priority configuration
  const getPriorityConfig = (priority: TrainingPriority) => PRIORITY_CONFIG[priority];

  // Get skill level description
  const getSkillDescription = (level: number) => {
    const descriptions = {
      1: 'No AI Skills',
      2: 'Basic Awareness',
      3: 'Working Knowledge',
      4: 'Proficient',
      5: 'Expert Level'
    };
    return descriptions[level as keyof typeof descriptions] || 'Unknown';
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Question Header */}
      {label && (
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {helpText && (
            <p className="text-sm text-gray-600">{helpText}</p>
          )}
        </div>
      )}

      {/* Department Skills Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Department Skills Matrix</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {localDepartments.length} Departments
              </Badge>
              {highPriorityCount > 0 && (
                <Badge variant="destructive">
                  {highPriorityCount} High Priority
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 pb-2 border-b">
            <div className="col-span-4">Department</div>
            <div className="col-span-2"># People</div>
            <div className="col-span-3">AI Skills (1-5)</div>
            <div className="col-span-2">Training Priority</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Department Rows */}
          <div className="space-y-3">
            {localDepartments.map((department, index) => {
              const priorityConfig = getPriorityConfig(department.priority);

              return (
                <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg border hover:bg-gray-50">
                  {/* Department Name */}
                  <div className="col-span-4">
                    {isEditing === index ? (
                      <Input
                        value={department.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        onBlur={() => setIsEditing(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditing(null);
                        }}
                        className="h-8 text-sm"
                        autoFocus
                        disabled={disabled}
                      />
                    ) : (
                      <div
                        className="text-sm cursor-pointer hover:text-blue-600 truncate font-medium"
                        onClick={() => !disabled && setIsEditing(index)}
                        title={department.name}
                      >
                        {department.name}
                      </div>
                    )}
                  </div>

                  {/* Employee Count */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={department.count}
                      onChange={(e) => handleCountChange(index, parseInt(e.target.value) || 0)}
                      min="0"
                      max="10000"
                      className="h-8 text-sm"
                      disabled={disabled}
                    />
                  </div>

                  {/* AI Skills Rating - Using SmartRatingLegoBlock */}
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <SmartRatingLegoBlock
                        question={{
                          id: `skills-${index}`,
                          questionText: '',
                          helpText: getSkillDescription(department.skills),
                          isRequired: false
                        }}
                        value={department.skills}
                        onChange={(value: number) => handleSkillsChange(index, value)}
                        variant="capability"
                        size="sm"
                        showScore={false}
                        disabled={disabled}
                        minValue={1}
                        maxValue={5}
                      />
                      <span className="text-xs text-gray-500 min-w-0 truncate">
                        {getSkillDescription(department.skills)}
                      </span>
                    </div>
                  </div>

                  {/* Training Priority */}
                  <div className="col-span-2">
                    <Select
                      value={department.priority}
                      onValueChange={(value: TrainingPriority) => handlePriorityChange(index, value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue>
                          <Badge variant={priorityConfig.badgeVariant} className="text-xs">
                            {department.priority}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <Badge variant={config.badgeVariant} className="text-xs">
                                {key}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDepartment(index)}
                      disabled={disabled || localDepartments.length <= minDepartments}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Department Button */}
          {localDepartments.length < maxDepartments && (
            <Button
              variant="outline"
              size="sm"
              onClick={addDepartment}
              disabled={disabled}
              className="w-full h-8 text-sm border-dashed"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Department
            </Button>
          )}

          {/* Totals Summary */}
          {showTotals && (
            <div className="pt-3 border-t">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">{totalEmployees.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Employees</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">{averageSkillLevel.toFixed(1)}/5</div>
                    <div className="text-xs text-gray-600">Avg. Skill Level</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">{highPriorityCount}</div>
                    <div className="text-xs text-gray-600">High Priority Depts</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Additional Context Section */}
      <div className="mt-6 space-y-3">
        <Label className="text-base font-semibold text-gray-900">
          {additionalContextLabel}
        </Label>
        <Textarea
          value={additionalContext}
          onChange={(e) => onAdditionalContextChange?.(e.target.value)}
          placeholder="Provide additional context about department capabilities, training plans, organizational structure, or strategic AI development priorities..."
          disabled={disabled}
          className="min-h-[100px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

// Utility functions for external use
export const departmentSkillsMatrixUtils = {
  /**
   * Validate departments data
   */
  validateDepartments: (departments: DepartmentData[]): string[] => {
    const errors: string[] = [];
    
    if (!departments || departments.length === 0) {
      errors.push('At least one department is required');
      return errors;
    }

    departments.forEach((dept, index) => {
      if (!dept.name.trim()) {
        errors.push(`Department ${index + 1} name is required`);
      }
      if (dept.count < 0) {
        errors.push(`Department ${index + 1} employee count cannot be negative`);
      }
      if (dept.skills < 1 || dept.skills > 5) {
        errors.push(`Department ${index + 1} skills rating must be between 1 and 5`);
      }
    });

    return errors;
  },

  /**
   * Calculate skill distribution
   */
  getSkillDistribution: (departments: DepartmentData[]) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    departments.forEach(dept => {
      distribution[dept.skills as keyof typeof distribution]++;
    });
    return distribution;
  },

  /**
   * Get training recommendations
   */
  getTrainingRecommendations: (departments: DepartmentData[]) => {
    const highPriority = departments.filter(d => d.priority === 'High');
    const lowSkills = departments.filter(d => d.skills <= 2);
    const recommendations = [];

    if (highPriority.length > 0) {
      recommendations.push(`Focus on ${highPriority.length} high-priority departments`);
    }
    if (lowSkills.length > 0) {
      recommendations.push(`${lowSkills.length} departments need foundational AI training`);
    }

    return recommendations;
  },

  /**
   * Format departments data for display
   */
  formatDepartments: (departments: DepartmentData[]): string => {
    return departments
      .map(dept => `${dept.name}: ${dept.count} people, Level ${dept.skills} (${dept.priority})`)
      .join('; ');
  },

  /**
   * Create default departments data
   */
  createDefault: (deptNames: string[] = DEFAULT_DEPARTMENTS.slice(0, 4)): DepartmentData[] => {
    return deptNames.map(name => ({
      name,
      count: 0,
      skills: 1,
      priority: 'Medium' as TrainingPriority
    }));
  }
};