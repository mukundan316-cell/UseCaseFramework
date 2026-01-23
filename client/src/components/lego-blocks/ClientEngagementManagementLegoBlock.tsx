import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Building2, Briefcase, Plus, Lock, Trash2, Pencil, Users, Target } from 'lucide-react';
import type { Client, Engagement } from '@shared/schema';
import { CURRENCY_CONFIG, type CurrencyCode } from '@/hooks/useCurrency';

interface ClientFormData {
  name: string;
  description: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  currency: CurrencyCode;
}

interface EngagementFormData {
  clientId: string;
  name: string;
  description: string;
  tomPresetId: string;
}

const TOM_PRESETS = [
  { id: 'hybrid', name: 'Hybrid Model', description: 'Central platform, distributed execution' },
  { id: 'coe_led', name: 'CoE-Led with Business Pods', description: 'CoE leads with embedded business pods' },
  { id: 'federated', name: 'Federated Model', description: 'Business units own AI with central standards' },
  { id: 'centralized', name: 'Centralized CoE', description: 'Fully centralized AI operations' },
  { id: 'rsa_tom', name: 'RSA Enterprise TOM', description: 'Six-phase enterprise model' },
];

export default function ClientEngagementManagementLegoBlock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isEngagementDialogOpen, setIsEngagementDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  const [clientForm, setClientForm] = useState<ClientFormData>({
    name: '', description: '', industry: '', contactName: '', contactEmail: '', currency: 'GBP'
  });
  const [engagementForm, setEngagementForm] = useState<EngagementFormData>({
    clientId: '', name: '', description: '', tomPresetId: 'hybrid'
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: engagements = [] } = useQuery<Engagement[]>({
    queryKey: ['/api/engagements'],
  });

  const createClientMutation = useMutation({
    mutationFn: (data: ClientFormData) => apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify({ ...data, isActive: 'true' }),
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsClientDialogOpen(false);
      setClientForm({ name: '', description: '', industry: '', contactName: '', contactEmail: '', currency: 'GBP' });
      toast({ title: 'Client Created', description: 'New client added successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create client.', variant: 'destructive' });
    },
  });

  const createEngagementMutation = useMutation({
    mutationFn: (data: EngagementFormData) => apiRequest('/api/engagements', {
      method: 'POST',
      body: JSON.stringify({ ...data, status: 'active', isDefault: 'false', tomPresetLocked: 'false' }),
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engagements'] });
      setIsEngagementDialogOpen(false);
      setEngagementForm({ clientId: '', name: '', description: '', tomPresetId: 'hybrid' });
      toast({ title: 'Engagement Created', description: 'New engagement added successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create engagement.', variant: 'destructive' });
    },
  });

  const lockTomMutation = useMutation({
    mutationFn: (engagementId: string) => apiRequest(`/api/engagements/${engagementId}/lock-tom`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engagements'] });
      toast({ title: 'TOM Locked', description: 'Operating model preset is now locked for this engagement.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to lock TOM.', variant: 'destructive' });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest(`/api/clients/${clientId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({ title: 'Client Deleted', description: 'Client removed successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete client.', variant: 'destructive' });
    },
  });

  const getClientEngagements = (clientId: string) => 
    engagements.filter(e => e.clientId === clientId);

  const getPresetName = (presetId: string) => 
    TOM_PRESETS.find(p => p.id === presetId)?.name || presetId;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Client & Engagement Management
              </CardTitle>
              <CardDescription>
                Manage clients and their engagement portfolios with locked TOM configurations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" data-testid="button-add-client">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Create a new client organization</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Name *</Label>
                      <Input 
                        id="client-name"
                        value={clientForm.name}
                        onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        placeholder="Client organization name"
                        data-testid="input-client-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-industry">Industry</Label>
                      <Input 
                        id="client-industry"
                        value={clientForm.industry}
                        onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
                        placeholder="e.g., Financial Services, Healthcare"
                        data-testid="input-client-industry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-description">Description</Label>
                      <Input 
                        id="client-description"
                        value={clientForm.description}
                        onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
                        placeholder="Brief description"
                        data-testid="input-client-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-currency">Currency</Label>
                      <Select 
                        value={clientForm.currency} 
                        onValueChange={(value) => setClientForm({ ...clientForm, currency: value as CurrencyCode })}
                      >
                        <SelectTrigger id="client-currency" data-testid="select-client-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                            <SelectItem key={code} value={code} data-testid={`option-currency-${code}`}>
                              {config.symbol} {config.name} ({config.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => createClientMutation.mutate(clientForm)}
                      disabled={!clientForm.name || createClientMutation.isPending}
                      data-testid="button-save-client"
                    >
                      Create Client
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEngagementDialogOpen} onOpenChange={setIsEngagementDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-engagement">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Engagement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Engagement</DialogTitle>
                    <DialogDescription>Create a new engagement with a locked TOM preset</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="engagement-client">Client *</Label>
                      <Select 
                        value={engagementForm.clientId} 
                        onValueChange={(v) => setEngagementForm({ ...engagementForm, clientId: v })}
                      >
                        <SelectTrigger data-testid="select-engagement-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engagement-name">Engagement Name *</Label>
                      <Input 
                        id="engagement-name"
                        value={engagementForm.name}
                        onChange={(e) => setEngagementForm({ ...engagementForm, name: e.target.value })}
                        placeholder="e.g., AI Transformation Program 2024"
                        data-testid="input-engagement-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engagement-tom">Operating Model Preset *</Label>
                      <Select 
                        value={engagementForm.tomPresetId} 
                        onValueChange={(v) => setEngagementForm({ ...engagementForm, tomPresetId: v })}
                      >
                        <SelectTrigger data-testid="select-engagement-tom">
                          <SelectValue placeholder="Select TOM preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOM_PRESETS.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{preset.name}</span>
                                <span className="text-xs text-muted-foreground">{preset.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Once locked, the TOM preset cannot be changed for this engagement
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engagement-description">Description</Label>
                      <Input 
                        id="engagement-description"
                        value={engagementForm.description}
                        onChange={(e) => setEngagementForm({ ...engagementForm, description: e.target.value })}
                        placeholder="Brief description"
                        data-testid="input-engagement-description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => createEngagementMutation.mutate(engagementForm)}
                      disabled={!engagementForm.clientId || !engagementForm.name || createEngagementMutation.isPending}
                      data-testid="button-save-engagement"
                    >
                      Create Engagement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No clients configured. Add a client to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => {
                const clientEngagements = getClientEngagements(client.id);
                return (
                  <div 
                    key={client.id} 
                    className="rounded-lg border p-4"
                    data-testid={`client-card-${client.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <div className="flex items-center gap-2">
                            {client.industry && (
                              <p className="text-sm text-muted-foreground">{client.industry}</p>
                            )}
                            {client.currency && (
                              <Badge variant="secondary" className="text-xs">
                                {CURRENCY_CONFIG[client.currency as CurrencyCode]?.symbol || client.currency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {clientEngagements.length} engagement{clientEngagements.length !== 1 ? 's' : ''}
                        </Badge>
                        {clientEngagements.length === 0 && (
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteClientMutation.mutate(client.id)}
                            data-testid={`button-delete-client-${client.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {clientEngagements.length > 0 && (
                      <div className="space-y-2 ml-13 pl-4 border-l">
                        {clientEngagements.map((engagement) => (
                          <div 
                            key={engagement.id}
                            className="flex items-center justify-between p-3 rounded-md bg-muted/30"
                            data-testid={`engagement-card-${engagement.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{engagement.name}</span>
                                  {engagement.isDefault === 'true' && (
                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                  )}
                                </div>
                                {engagement.description && (
                                  <p className="text-xs text-muted-foreground">{engagement.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={engagement.tomPresetLocked === 'true' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                <Target className="h-3 w-3 mr-1" />
                                {getPresetName(engagement.tomPresetId)}
                                {engagement.tomPresetLocked === 'true' && (
                                  <Lock className="h-3 w-3 ml-1" />
                                )}
                              </Badge>
                              {engagement.tomPresetLocked !== 'true' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => lockTomMutation.mutate(engagement.id)}
                                  data-testid={`button-lock-tom-${engagement.id}`}
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  Lock TOM
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
