import { useUseCases } from '../contexts/UseCaseContext';

/**
 * Custom hook for getting sorted metadata items
 * Uses custom sort order if available, falls back to alphabetical sorting
 */
export function useSortedMetadata() {
  const { metadata } = useUseCases();

  const getSortedItems = (
    category: string, 
    items: string[], 
    sortOrder?: Record<string, number> | null
  ): string[] => {
    if (!items || items.length === 0) return [];
    
    // If no custom sort order is defined, return alphabetically sorted items
    if (!sortOrder || Object.keys(sortOrder).length === 0) {
      return [...items].sort();
    }
    
    // Sort using custom order, with unordered items at the end alphabetically
    return [...items].sort((a, b) => {
      const orderA = sortOrder[a] ?? 999; // Items without order go to end
      const orderB = sortOrder[b] ?? 999;
      
      // If both items have custom order, use that
      if (orderA !== 999 && orderB !== 999) {
        return orderA - orderB;
      }
      
      // If both items don't have custom order, sort alphabetically
      if (orderA === 999 && orderB === 999) {
        return a.localeCompare(b);
      }
      
      // One has custom order, one doesn't - custom order comes first
      return orderA - orderB;
    });
  };

  return {
    getSortedActivities: () => getSortedItems('activities', metadata?.activities || [], metadata?.activitiesSortOrder),
    getSortedProcesses: () => getSortedItems('processes', metadata?.processes || [], metadata?.processesSortOrder),
    getSortedLinesOfBusiness: () => getSortedItems('linesOfBusiness', metadata?.linesOfBusiness || [], metadata?.linesOfBusinessSortOrder),
    getSortedBusinessSegments: () => getSortedItems('businessSegments', metadata?.businessSegments || [], metadata?.businessSegmentsSortOrder),
    getSortedGeographies: () => getSortedItems('geographies', metadata?.geographies || [], metadata?.geographiesSortOrder),
    getSortedUseCaseTypes: () => getSortedItems('useCaseTypes', metadata?.useCaseTypes || [], metadata?.useCaseTypesSortOrder),
    getSortedValueChainComponents: () => getSortedItems('valueChainComponents', metadata?.valueChainComponents || [], metadata?.valueChainComponentsSortOrder),
    
    // Generic function for any category
    getSortedItems: (category: string, items: string[]) => {
      const sortOrderMap: Record<string, Record<string, number> | null | undefined> = {
        activities: metadata?.activitiesSortOrder,
        processes: metadata?.processesSortOrder,
        linesOfBusiness: metadata?.linesOfBusinessSortOrder,
        businessSegments: metadata?.businessSegmentsSortOrder,
        geographies: metadata?.geographiesSortOrder,
        useCaseTypes: metadata?.useCaseTypesSortOrder,
        valueChainComponents: metadata?.valueChainComponentsSortOrder,
      };
      
      return getSortedItems(category, items, sortOrderMap[category]);
    }
  };
}