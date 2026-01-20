import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface InsightsPlaceholderLegoBlockProps {
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export default function InsightsPlaceholderLegoBlock({
  title,
  description,
  icon: Icon,
  comingSoon = true
}: InsightsPlaceholderLegoBlockProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-indigo-50/50 border-slate-200">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
          <Icon className="h-12 w-12 text-indigo-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        
        {comingSoon && (
          <Badge variant="secondary" className="mb-4 bg-indigo-100 text-indigo-700">
            Coming Soon
          </Badge>
        )}
        
        <p className="text-gray-600 max-w-md">{description}</p>
      </CardContent>
    </Card>
  );
}
