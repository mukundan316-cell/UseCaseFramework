import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface RoleEvolutionEntry {
  roleId: string;
  roleName: string;
  baselineOwnership: 'vendor' | 'client' | 'shared';
  currentOwnership: 'vendor' | 'client' | 'shared';
  targetOwnership: 'vendor' | 'client' | 'shared';
  transitionHistory: Array<{
    date: string;
    fromOwnership: 'vendor' | 'client' | 'shared';
    toOwnership: 'vendor' | 'client' | 'shared';
    note: string;
    actor: string;
  }>;
  confidenceLevel: 'high' | 'medium' | 'low';
  targetTransitionDate: string | null;
}

interface RoleEvolutionLegoBlockProps {
  roleEvolution?: RoleEvolutionEntry[];
  onUpdate?: (roleEvolution: RoleEvolutionEntry[]) => void;
  readOnly?: boolean;
  emptyStateMessage?: string;
}

const STANDARD_ROLES = [
  { id: 'solution_architect', name: 'Solution Architect' },
  { id: 'data_engineer', name: 'Data Engineer' },
  { id: 'ml_engineer', name: 'ML Engineer' },
  { id: 'business_analyst', name: 'Business Analyst' },
  { id: 'project_manager', name: 'Project Manager' },
  { id: 'qa_engineer', name: 'QA Engineer' },
  { id: 'devops_engineer', name: 'DevOps Engineer' },
  { id: 'product_owner', name: 'Product Owner' }
];

const ownershipColors: Record<string, string> = {
  vendor: 'bg-blue-500',
  client: 'bg-green-500',
  shared: 'bg-purple-500'
};

const confidenceColors: Record<string, string> = {
  high: 'text-green-600',
  medium: 'text-amber-600',
  low: 'text-red-600'
};

export default function RoleEvolutionLegoBlock({ 
  roleEvolution = [], 
  onUpdate,
  readOnly = false,
  emptyStateMessage = "No roles configured for evolution tracking."
}: RoleEvolutionLegoBlockProps) {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRole, setNewRole] = useState({
    roleId: '',
    roleName: '',
    baselineOwnership: 'vendor' as const,
    targetOwnership: 'client' as const
  });

  const handleAddRole = () => {
    if (!newRole.roleId) return;
    
    const selectedRole = STANDARD_ROLES.find(r => r.id === newRole.roleId);
    const newEntry: RoleEvolutionEntry = {
      roleId: newRole.roleId,
      roleName: selectedRole?.name || newRole.roleId,
      baselineOwnership: newRole.baselineOwnership,
      currentOwnership: newRole.baselineOwnership,
      targetOwnership: newRole.targetOwnership,
      transitionHistory: [],
      confidenceLevel: 'medium',
      targetTransitionDate: null
    };
    
    onUpdate?.([...roleEvolution, newEntry]);
    setNewRole({ roleId: '', roleName: '', baselineOwnership: 'vendor', targetOwnership: 'client' });
    setIsAddingRole(false);
  };

  const handleOwnershipChange = (roleId: string, newOwnership: 'vendor' | 'client' | 'shared') => {
    const updated = roleEvolution.map(role => {
      if (role.roleId === roleId && role.currentOwnership !== newOwnership) {
        return {
          ...role,
          currentOwnership: newOwnership,
          transitionHistory: [
            ...role.transitionHistory,
            {
              date: new Date().toISOString(),
              fromOwnership: role.currentOwnership,
              toOwnership: newOwnership,
              note: 'Ownership transition',
              actor: 'system'
            }
          ]
        };
      }
      return role;
    });
    onUpdate?.(updated);
  };

  const calculateProgress = (role: RoleEvolutionEntry): number => {
    if (role.baselineOwnership === role.targetOwnership) return 100;
    if (role.currentOwnership === role.targetOwnership) return 100;
    if (role.currentOwnership === role.baselineOwnership) return 0;
    return 50; // Shared state typically means in transition
  };

  return (
    <Card data-testid="card-role-evolution">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-muted-foreground" />
          Role Evolution Tracking
          <Badge variant="outline" className="ml-auto">
            {roleEvolution.length} {roleEvolution.length === 1 ? 'role' : 'roles'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {roleEvolution.length === 0 ? (
          <div className="text-center py-6" data-testid="empty-role-evolution">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={() => setIsAddingRole(true)} data-testid="button-add-role">
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {roleEvolution.map((role, index) => (
                <AccordionItem key={role.roleId} value={role.roleId} data-testid={`role-evolution-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium">{role.roleName}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Badge variant="secondary" className={ownershipColors[role.baselineOwnership]}>
                          {role.baselineOwnership}
                        </Badge>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="secondary" className={ownershipColors[role.currentOwnership]}>
                          {role.currentOwnership}
                        </Badge>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="outline">
                          {role.targetOwnership}
                        </Badge>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${confidenceColors[role.confidenceLevel]}`} />
                        <span className="text-xs text-muted-foreground">{calculateProgress(role)}%</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Baseline</Label>
                          <Badge className={`mt-1 ${ownershipColors[role.baselineOwnership]}`}>
                            {role.baselineOwnership}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Current</Label>
                          {readOnly ? (
                            <Badge className={`mt-1 ${ownershipColors[role.currentOwnership]}`}>
                              {role.currentOwnership}
                            </Badge>
                          ) : (
                            <Select 
                              value={role.currentOwnership} 
                              onValueChange={(v) => handleOwnershipChange(role.roleId, v as any)}
                            >
                              <SelectTrigger className="h-8 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="shared">Shared</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Target</Label>
                          <Badge variant="outline" className="mt-1">
                            {role.targetOwnership}
                          </Badge>
                        </div>
                      </div>
                      
                      {role.transitionHistory.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Transition History</Label>
                          <div className="space-y-1 text-sm">
                            {role.transitionHistory.slice(-3).map((transition, i) => (
                              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-xs">{format(new Date(transition.date), 'MMM d, yyyy')}</span>
                                <Badge variant="outline" className="text-xs">{transition.fromOwnership}</Badge>
                                <ArrowRight className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">{transition.toOwnership}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {!readOnly && !isAddingRole && (
              <Button variant="outline" size="sm" onClick={() => setIsAddingRole(true)} className="w-full" data-testid="button-add-another-role">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Role
              </Button>
            )}
          </div>
        )}
        
        {isAddingRole && !readOnly && (
          <div className="mt-4 p-4 border rounded-lg space-y-4" data-testid="form-add-role">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={newRole.roleId} onValueChange={(v) => setNewRole({ ...newRole, roleId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARD_ROLES.filter(r => !roleEvolution.find(e => e.roleId === r.id)).map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Baseline Ownership</Label>
                <Select value={newRole.baselineOwnership} onValueChange={(v) => setNewRole({ ...newRole, baselineOwnership: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Ownership</Label>
                <Select value={newRole.targetOwnership} onValueChange={(v) => setNewRole({ ...newRole, targetOwnership: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddRole} data-testid="button-confirm-add-role">Add Role</Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingRole(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
