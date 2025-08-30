import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useUseCases } from '@/contexts/UseCaseContext';
import { UseCase } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Archive, 
  Eye, 
  EyeOff, 
  Settings, 
  Database, 
  Zap, 
  BookOpen, 
  CheckSquare, 
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Search,
  Filter
} from 'lucide-react';

/**
 * LibraryManagementLegoBlock - Two-Tier Use Case Library Management
 * 
 * Provides comprehensive management of the RSA use case library with:
 * - Active Portfolio (dashboard-visible use cases)
 * - Reference Library (archived/inactive use cases)  
 * - Bulk operations for tier management
 * - Individual visibility controls
 * - Activation/deactivation workflows
 * 
 * Design Principle: LEGO-style reusable component with zero duplication
 */
export default function LibraryManagementLegoBlock() {
  const { 
    useCases,
    dashboardUseCases, 
    referenceUseCases, 
    activateUseCase, 
    deactivateUseCase, 
    toggleDashboardVisibility,
    bulkUpdateTier
  } = useUseCases();
  
  const { toast } = useToast();
  
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'reference'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'activate' | 'deactivate' | 'bulk'>('activate');
  const [actionReason, setActionReason] = useState('');
  const [targetUseCase, setTargetUseCase] = useState<UseCase | null>(null);

  // Filter use cases based on search term
  const getFilteredUseCases = (cases: UseCase[]) => {
    if (!searchTerm) return cases;
    return cases.filter(useCase => 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.lineOfBusiness?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle individual use case selection
  const toggleUseCaseSelection = (id: string) => {
    setSelectedUseCases(prev => 
      prev.includes(id) 
        ? prev.filter(useCaseId => useCaseId !== id)
        : [...prev, id]
    );
  };

  // Handle select all/none
  const handleSelectAll = (cases: UseCase[]) => {
    const caseIds = cases.map(c => c.id);
    setSelectedUseCases(prev => 
      prev.length === caseIds.length ? [] : caseIds
    );
  };

  // Open action dialog
  const openActionDialog = (action: 'activate' | 'deactivate' | 'bulk', useCase?: UseCase) => {
    setDialogAction(action);
    setTargetUseCase(useCase || null);
    setActionReason('');
    setIsDialogOpen(true);
  };

  // Execute action
  const executeAction = async () => {
    try {
      if (dialogAction === 'activate' && targetUseCase) {
        await activateUseCase(targetUseCase.id, actionReason || 'Activated via admin panel');
        toast({
          title: "Use case activated",
          description: `"${targetUseCase.title}" is now in the active portfolio.`,
        });
      } else if (dialogAction === 'deactivate' && targetUseCase) {
        await deactivateUseCase(targetUseCase.id, actionReason || 'Moved to reference library');
        toast({
          title: "Use case deactivated",
          description: `"${targetUseCase.title}" moved to reference library.`,
        });
      } else if (dialogAction === 'bulk' && selectedUseCases.length > 0) {
        const targetTier = activeTab === 'active' ? 'reference' : 'active';
        await bulkUpdateTier(selectedUseCases, targetTier);
        toast({
          title: "Bulk update completed",
          description: `${selectedUseCases.length} use cases moved to ${targetTier} tier.`,
        });
        setSelectedUseCases([]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Handle dashboard visibility toggle
  const handleVisibilityToggle = async (useCase: UseCase) => {
    try {
      await toggleDashboardVisibility(useCase.id);
      toast({
        title: "Visibility updated",
        description: `"${useCase.title}" dashboard visibility toggled.`,
      });
    } catch (error) {
      console.error('Visibility toggle failed:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const renderUseCaseRow = (useCase: UseCase, isReference: boolean = false) => {
    const isSelected = selectedUseCases.includes(useCase.id);
    const isDashboardVisible = useCase.isDashboardVisible === 'true';
    
    return (
      <div key={useCase.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center space-x-4 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleUseCaseSelection(useCase.id)}
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {useCase.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {useCase.description}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {useCase.lineOfBusiness}
              </Badge>
              <Badge variant={useCase.quadrant === 'Quick Win' ? 'default' : 'secondary'} className="text-xs">
                {useCase.quadrant}
              </Badge>
              {!isReference && (
                <Badge variant={isDashboardVisible ? 'default' : 'secondary'} className="text-xs">
                  {isDashboardVisible ? 'Dashboard' : 'Hidden'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isReference && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleVisibilityToggle(useCase)}
              className="h-8 w-8 p-0"
            >
              {isDashboardVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openActionDialog(isReference ? 'activate' : 'deactivate', useCase)}
            className="h-8 w-8 p-0"
          >
            {isReference ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  const activeFilteredUseCases = getFilteredUseCases(dashboardUseCases);
  const referenceFilteredUseCases = getFilteredUseCases(referenceUseCases);

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Two-Tier Library Management
            </CardTitle>
            <CardDescription>
              Manage active portfolio and reference library use cases with tier-based organization
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{dashboardUseCases.length} Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Archive className="h-4 w-4" />
              <span>{referenceUseCases.length} Reference</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Controls */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search use cases by title, description, or line of business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {selectedUseCases.length > 0 && (
            <Button
              onClick={() => openActionDialog('bulk')}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Bulk Action ({selectedUseCases.length})
            </Button>
          )}
        </div>

        {/* Tabs for Active/Reference */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'reference')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Active Portfolio ({dashboardUseCases.length})
            </TabsTrigger>
            <TabsTrigger value="reference" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reference Library ({referenceUseCases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active use cases that appear on the dashboard matrix
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(activeFilteredUseCases)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedUseCases.length === activeFilteredUseCases.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {activeFilteredUseCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active use cases found</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
                </div>
              ) : (
                activeFilteredUseCases.map(useCase => renderUseCaseRow(useCase, false))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reference library use cases available for activation
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(referenceFilteredUseCases)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedUseCases.length === referenceFilteredUseCases.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {referenceFilteredUseCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reference use cases found</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
                </div>
              ) : (
                referenceFilteredUseCases.map(useCase => renderUseCaseRow(useCase, true))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Context */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Library Management Context</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>Active Portfolio:</strong> Use cases visible on the main dashboard matrix for active decision-making</p>
            <p><strong>Reference Library:</strong> Archived use cases available for future activation or reference</p>
            <p><strong>Dashboard Visibility:</strong> Active use cases can be hidden from dashboard while remaining in active tier</p>
            <p><strong>Bulk Operations:</strong> Select multiple use cases for tier changes and management efficiency</p>
          </div>
        </div>
      </CardContent>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'activate' && 'Activate Use Case'}
              {dialogAction === 'deactivate' && 'Deactivate Use Case'}
              {dialogAction === 'bulk' && 'Bulk Tier Update'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'activate' && 'Move this use case to the active portfolio.'}
              {dialogAction === 'deactivate' && 'Move this use case to the reference library.'}
              {dialogAction === 'bulk' && `Update ${selectedUseCases.length} selected use cases.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {targetUseCase && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium">{targetUseCase.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{targetUseCase.description}</p>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeAction}>
              {dialogAction === 'activate' && 'Activate'}
              {dialogAction === 'deactivate' && 'Deactivate'}
              {dialogAction === 'bulk' && 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}