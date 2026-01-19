# Process Activity Manager LEGO Block

## Overview
The ProcessActivityManager is a reusable LEGO component that centralizes process-activity relationship management across the Hexaware AI Framework application. It eliminates duplication by storing mappings in the database metadata and provides consistent contextual filtering anywhere in the app.

## Key Components

### 1. `useProcessActivityManager` Hook
Database-driven hook that provides process-activity utilities:
- `getActivitiesForProcess(process)` - Gets filtered activities for a specific process
- `getAllProcesses()` - Returns all available processes from metadata
- `getAllActivities()` - Returns all unique activities across processes
- `validateActivityForProcess(process, activity)` - Validates activity-process compatibility

### 2. `ContextualProcessActivityField` Component  
Drop-in replacement for manual process-activity filtering:
- Automatically filters activities based on selected process
- Handles multi-select functionality with checkboxes
- Provides consistent UX with loading states and validation
- Backward compatible with single-value fields

## Database Integration
Process-activity mappings are stored in `metadata_config.processActivities` as JSON:
```json
{
  "Claims Management": ["Claims Processing", "Expert Settlement", "Loss Fund Management"],
  "Underwriting": ["Risk Assessment", "Rating", "Quality Assurance"],
  ...
}
```

## Usage Examples

### In Forms
```tsx
import { ContextualProcessActivityField } from '@/components/lego-blocks/ProcessActivityManager';

<ContextualProcessActivityField
  selectedProcess={selectedProcess}
  selectedActivities={selectedActivities}
  onActivitiesChange={handleActivitiesChange}
  helpText="Activities filtered by selected process"
/>
```

### In Utilities
```tsx
import { useProcessActivityManager } from '@/components/lego-blocks/ProcessActivityManager';

const { getActivitiesForProcess, validateActivityForProcess } = useProcessActivityManager();
const activities = getActivitiesForProcess("Claims Management");
const isValid = validateActivityForProcess("Claims Management", "Claims Processing");
```

## Benefits
1. **No Duplication** - Single source of truth in database metadata
2. **Consistent UX** - Same behavior across all forms and components  
3. **Maintainable** - Admin panel can modify mappings without code changes
4. **Extensible** - Easy to add new processes and activities
5. **Type Safe** - Full TypeScript support with proper typing

## LEGO Architecture Compliance
✅ Reusable across multiple components  
✅ Self-contained with no external dependencies  
✅ Database-first with metadata integration  
✅ Backward compatible with existing single-value fields  
✅ Follows REFERENCE.md modular design principles