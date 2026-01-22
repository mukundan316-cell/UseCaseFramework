import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase } from 'lucide-react';
import type { Client, Engagement } from '@shared/schema';

interface EngagementContextLegoBlockProps {
  selectedClientId: string | null;
  selectedEngagementId: string | null;
  onClientChange: (clientId: string) => void;
  onEngagementChange: (engagementId: string | null) => void;
  className?: string;
}

export default function EngagementContextLegoBlock({
  selectedClientId,
  selectedEngagementId,
  onClientChange,
  onEngagementChange,
  className = ""
}: EngagementContextLegoBlockProps) {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const engagementsUrl = selectedClientId ? `/api/engagements?clientId=${selectedClientId}` : null;
  const { data: engagements = [], isLoading: engagementsLoading, isFetched: engagementsFetched } = useQuery<Engagement[]>({
    queryKey: ['/api/engagements', selectedClientId],
    queryFn: async () => {
      if (!engagementsUrl) return [];
      const res = await fetch(engagementsUrl);
      if (!res.ok) throw new Error('Failed to fetch engagements');
      return res.json();
    },
    enabled: !!selectedClientId,
  });

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      const defaultClient = clients[0];
      onClientChange(defaultClient.id);
    }
  }, [clients, selectedClientId, onClientChange]);

  useEffect(() => {
    if (!selectedClientId || !engagementsFetched) return;
    
    const engagementBelongsToClient = engagements.some(e => e.id === selectedEngagementId);
    
    if (!selectedEngagementId || !engagementBelongsToClient) {
      if (engagements.length > 0) {
        onEngagementChange(engagements[0].id);
      } else {
        onEngagementChange(null);
      }
    }
  }, [selectedClientId, engagements, engagementsFetched, selectedEngagementId, onEngagementChange]);

  const selectedEngagement = engagements.find(e => e.id === selectedEngagementId);

  if (clients.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 py-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedClientId || ''} onValueChange={onClientChange}>
          <SelectTrigger className="w-[180px] h-8 text-sm" data-testid="select-client-context">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} data-testid={`client-option-${client.id}`}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        <Select 
          value={selectedEngagementId || ''} 
          onValueChange={onEngagementChange}
          disabled={!selectedClientId || engagementsLoading}
        >
          <SelectTrigger className="min-w-[200px] h-8 text-sm" data-testid="select-engagement-context">
            <SelectValue placeholder={engagementsLoading ? "Loading..." : "Select Engagement"}>
              {selectedEngagement && (
                <span className="flex items-center gap-2 truncate">
                  <span className="truncate">{selectedEngagement.name}</span>
                  {selectedEngagement.isDefault === 'true' && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 shrink-0">Default</Badge>
                  )}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {engagements.map((engagement) => (
              <SelectItem key={engagement.id} value={engagement.id} data-testid={`engagement-option-${engagement.id}`}>
                <span className="flex items-center gap-2">
                  <span>{engagement.name}</span>
                  {engagement.isDefault === 'true' && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">Default</Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEngagement && (
        <div className="flex items-center gap-2 ml-2">
          <Badge 
            variant={selectedEngagement.tomPresetLocked === 'true' ? 'default' : 'outline'}
            className="text-xs"
          >
            TOM: {selectedEngagement.tomPresetId}
            {selectedEngagement.tomPresetLocked === 'true' && ' (Locked)'}
          </Badge>
        </div>
      )}
    </div>
  );
}
