import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Plus, Edit, Trash2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ChangeLogEntry {
  id: string;
  useCaseId: string;
  useCaseMeaningfulId: string | null;
  changeType: string;
  actor: string;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
  changedFields: string[] | null;
  changeReason: string | null;
  source: string;
  createdAt: string;
}

interface AuditTimelineLegoBlockProps {
  useCaseId?: string;
  limit?: number;
  showTitle?: boolean;
}

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case 'created':
      return <Plus className="h-4 w-4 text-green-600" />;
    case 'updated':
    case 'status_change':
    case 'phase_change':
      return <Edit className="h-4 w-4 text-blue-600" />;
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-red-600" />;
    case 'activation':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'deactivation':
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case 'duplicate_resolved':
      return <ArrowRight className="h-4 w-4 text-purple-600" />;
    default:
      return <History className="h-4 w-4 text-gray-600" />;
  }
};

const getChangeBadgeVariant = (changeType: string) => {
  switch (changeType) {
    case 'created':
      return 'default';
    case 'deleted':
      return 'destructive';
    case 'updated':
    case 'status_change':
    case 'phase_change':
      return 'secondary';
    default:
      return 'outline';
  }
};

const formatChangeType = (changeType: string) => {
  return changeType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AuditTimelineLegoBlock({ 
  useCaseId, 
  limit = 50, 
  showTitle = true 
}: AuditTimelineLegoBlockProps) {
  const queryKey = useCaseId 
    ? ['/api/use-cases', useCaseId, 'audit-log']
    : ['/api/audit-logs', { limit }];
  
  const { data: logs, isLoading, error } = useQuery<ChangeLogEntry[]>({
    queryKey,
    queryFn: async () => {
      const url = useCaseId 
        ? `/api/use-cases/${useCaseId}/audit-log`
        : `/api/audit-logs?limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch audit log');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Card data-testid="card-audit-timeline-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="card-audit-timeline-error">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Failed to load change history.</p>
        </CardContent>
      </Card>
    );
  }

  const entries = logs || [];

  return (
    <Card data-testid="card-audit-timeline">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Change History
            <Badge variant="outline" className="ml-auto">
              {entries.length} {entries.length === 1 ? 'change' : 'changes'}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-audit-timeline">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No changes recorded yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className="relative pl-10"
                    data-testid={`audit-entry-${index}`}
                  >
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      {getChangeIcon(entry.changeType)}
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={getChangeBadgeVariant(entry.changeType)}>
                          {formatChangeType(entry.changeType)}
                        </Badge>
                        {entry.useCaseMeaningfulId && !useCaseId && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {entry.useCaseMeaningfulId}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      {entry.changedFields && entry.changedFields.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Changed: {entry.changedFields.slice(0, 5).join(', ')}
                          {entry.changedFields.length > 5 && ` +${entry.changedFields.length - 5} more`}
                        </p>
                      )}
                      
                      {entry.changeReason && (
                        <p className="text-sm mt-1 italic text-muted-foreground">
                          "{entry.changeReason}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>By: {entry.actor}</span>
                        <span>|</span>
                        <span>Source: {entry.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
