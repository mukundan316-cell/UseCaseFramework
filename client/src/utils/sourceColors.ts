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
        label: 'Hexaware Internal',
        description: 'Contributed by Hexaware internal teams and employees'
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
    case 'industry_standard':
      return 'bg-green-50/30'; // Very subtle green tint
    case 'ai_inventory':
      return 'bg-purple-50/30'; // Very subtle purple tint
    default:
      return 'bg-white';
  }
};

export const getAllSourceTypes = () => [
  'rsa_internal', 
  'industry_standard',
  'ai_inventory'
];