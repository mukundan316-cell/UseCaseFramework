// Utility functions for source-based color differentiation in RSA library

export interface SourceStyleConfig {
  borderColor: string;
  badgeColor: string;
  badgeBackground: string;
  iconColor: string;
  label: string;
  description: string;
}

export const getSourceConfig = (librarySource: string): SourceStyleConfig => {
  switch (librarySource) {
    case 'rsa_internal':
      return {
        borderColor: '#1e40af', // blue-800
        badgeColor: '#1e40af',
        badgeBackground: '#dbeafe', // blue-100
        iconColor: '#2563eb', // blue-600
        label: 'RSA Internal',
        description: 'Contributed by RSA internal teams and employees'
      };
    case 'hexaware_external':
      return {
        borderColor: '#7c2d12', // orange-800
        badgeColor: '#ea580c',
        badgeBackground: '#fed7aa', // orange-100
        iconColor: '#f97316', // orange-500
        label: 'Hexaware External',
        description: 'Contributed by Hexaware external consultants'
      };
    case 'industry_standard':
      return {
        borderColor: '#166534', // green-800
        badgeColor: '#16a34a',
        badgeBackground: '#dcfce7', // green-100
        iconColor: '#22c55e', // green-500
        label: 'Industry Standard',
        description: 'Industry best practice use cases'
      };
    case 'imported':
      return {
        borderColor: '#6b21a8', // purple-800
        badgeColor: '#9333ea',
        badgeBackground: '#e9d5ff', // purple-100
        iconColor: '#a855f7', // purple-500
        label: 'Imported',
        description: 'Imported from external sources'
      };
    case 'consolidated_database':
      return {
        borderColor: '#4338ca', // indigo-700
        badgeColor: '#4f46e5',
        badgeBackground: '#e0e7ff', // indigo-100
        iconColor: '#6366f1', // indigo-500
        label: 'Consolidated',
        description: 'Consolidated from database migration'
      };
    case 'ai_inventory':
      return {
        borderColor: '#7c3aed', // purple-600
        badgeColor: '#7c3aed',
        badgeBackground: '#ede9fe', // purple-100
        iconColor: '#8b5cf6', // purple-500
        label: 'AI Inventory',
        description: 'AI tools imported from SharePoint inventory'
      };
    default:
      return {
        borderColor: '#6b7280', // gray-500
        badgeColor: '#6b7280',
        badgeBackground: '#f3f4f6', // gray-100
        iconColor: '#9ca3af', // gray-400
        label: 'Unknown',
        description: 'Unknown source'
      };
  }
};

// Function to get a subtle background tint based on source
export const getSourceBackgroundTint = (librarySource: string): string => {
  switch (librarySource) {
    case 'rsa_internal':
      return 'bg-blue-50/30'; // Very subtle blue tint
    case 'hexaware_external':
      return 'bg-orange-50/30'; // Very subtle orange tint
    case 'industry_standard':
      return 'bg-green-50/30'; // Very subtle green tint
    case 'imported':
      return 'bg-purple-50/30'; // Very subtle purple tint
    case 'consolidated_database':
      return 'bg-indigo-50/30'; // Very subtle indigo tint
    case 'ai_inventory':
      return 'bg-purple-50/30'; // Very subtle purple tint
    default:
      return 'bg-white';
  }
};

export const getAllSourceTypes = () => [
  'rsa_internal',
  'hexaware_external', 
  'industry_standard',
  'imported',
  'consolidated_database',
  'ai_inventory'
];