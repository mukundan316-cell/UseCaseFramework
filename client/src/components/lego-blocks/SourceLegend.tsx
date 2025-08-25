import React from 'react';
import { Building2, ExternalLink, Users, Download, Database } from 'lucide-react';
import { getSourceConfig } from '../../utils/sourceColors';
import { useUseCases } from '../../contexts/UseCaseContext';

interface SourceLegendProps {
  className?: string;
  showTitle?: boolean;
}

export default function SourceLegend({ className = '', showTitle = true }: SourceLegendProps) {
  const { metadata } = useUseCases();
  
  // Icon mapping for source types
  const iconMapping: Record<string, any> = {
    'rsa_internal': Building2,
    'industry_standard': Users,
    'ai_inventory': Users
  };

  // Generate dynamic source types from metadata
  const sourceTypes = (metadata?.sourceTypes || []).map(sourceKey => ({
    key: sourceKey,
    icon: iconMapping[sourceKey] || Building2 // Default to Building2 if no mapping exists
  }));

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Source Legend</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {sourceTypes.map(({ key, icon: Icon }) => {
          const config = getSourceConfig(key);
          return (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.borderColor }}
              />
              <Icon 
                className="w-4 h-4"
                style={{ color: config.iconColor }}
              />
              <span className="text-xs text-gray-700 font-medium">
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Use cases are color-coded by their source. Cards show colored left borders and source badges to help identify contributors.
      </p>
    </div>
  );
}