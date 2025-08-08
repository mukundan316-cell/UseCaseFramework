# LEGO-Style Component Library

## Overview
This document catalogs all reusable LEGO-style components in the RSA GenAI Use Case Framework. Follow the "Build Once, Reuse Everywhere" principle.

## Available LEGO Components

### MetadataLegoBlock
**Purpose**: Reusable CRUD block for managing any type of metadata
**Location**: `client/src/components/MetadataLegoBlock.tsx`
**Features**:
- Add/Edit/Delete operations
- Database persistence
- Inline editing
- Confirmation dialogs
- Loading states
- Error handling

**Usage Example**:
```tsx
<MetadataLegoBlock
  category="valueChainComponents"
  title="Value Chain Components"
  items={metadata.valueChainComponents}
  placeholder="Add new value chain component..."
/>
```

### FormActionButtons  
**Purpose**: Standardized form action buttons (Reset/Save)
**Location**: `client/src/components/lego-blocks/FormActionButtons.tsx`
**Features**:
- Reset and Save buttons with icons
- Loading states
- RSA styling
- Flexible configuration

**Usage Example**:
```tsx
<FormActionButtons
  onReset={resetForm}
  resetType="button"
  saveType="submit"
  isLoading={form.formState.isSubmitting}
/>
```

### DataActionCard
**Purpose**: Reusable action cards for data operations
**Location**: `client/src/components/lego-blocks/DataActionCard.tsx`
**Features**:
- Icon-based action cards
- Multiple variants (primary, success, warning, danger)
- Hover effects
- Consistent styling

**Usage Example**:
```tsx
<DataActionCard
  title="Export Data"
  description="Download use cases and metadata"
  icon={Download}
  onClick={handleExport}
  variant="primary"
/>
```

### FilterChip
**Purpose**: Interactive filter chips for quick filtering
**Location**: `client/src/components/lego-blocks/FilterChip.tsx`
**Features**:
- Active/inactive states
- Multiple variants and sizes
- Hover effects
- RSA styling

**Usage Example**:
```tsx
<FilterChip
  label="Quick Win"
  active={filters.quadrant === 'Quick Win'}
  onClick={() => setFilters({ quadrant: 'Quick Win' })}
  variant="primary"
/>
```

### TabButton
**Purpose**: Navigation tab buttons with RSA styling
**Location**: `client/src/components/lego-blocks/TabButton.tsx`
**Features**:
- Active/inactive states
- Icons and labels
- Hover animations
- Pill-style design

**Usage Example**:
```tsx
<TabButton
  id="submit"
  label="Submit Use Case"
  icon={PlusCircle}
  isActive={activeTab === 'submit'}
  onClick={setActiveTab}
/>
```

### ReusableButton
**Purpose**: Base button component with RSA styling
**Location**: `client/src/components/lego-blocks/ReusableButton.tsx`
**Features**:
- Multiple RSA-specific styles
- Loading states
- Icon support
- Full width option

### ReusableModal
**Purpose**: Consistent modal wrapper
**Location**: `client/src/components/lego-blocks/ReusableModal.tsx`
**Features**:
- Multiple sizes
- Close button
- Header and footer slots
- Overlay click prevention

### ScoringLegoBlock
**Purpose**: Reusable scoring sections for enhanced RSA framework
**Location**: `client/src/components/lego-blocks/ScoringLegoBlock.tsx`
**Features**:
- Business Value, Feasibility, and AI Governance categories
- 1-5 scale scoring with descriptive labels
- Visual score indicators and tooltips
- Form integration with validation

**Usage Example**:
```tsx
<ScoringLegoBlock
  form={form}
  category="business-value"
  fields={businessValueFields}
/>
```

### RSAHeader
**Purpose**: Consistent header with authentic RSA branding
**Location**: `client/src/components/RSAHeader.tsx`
**Features**:
- RSA logo with purple sunburst
- "an [intact] company" tagline
- Responsive design
- Enterprise platform badge

## LEGO Development Guidelines

### Before Creating New Components
1. Check this document for existing LEGO blocks
2. Evaluate if existing components can be extended
3. Consider if the new component could be useful elsewhere

### Creating New LEGO Components
1. Design for maximum reusability
2. Use props for all customizable aspects
3. Include proper TypeScript interfaces
4. Add to this documentation
5. Follow RSA branding guidelines

### LEGO Component Requirements
- **Consistency**: Follow RSA design system
- **Reusability**: Props-based configuration
- **Independence**: No tight coupling
- **Database Integration**: Persist to PostgreSQL
- **Error Handling**: Built-in error states
- **Loading States**: Show loading indicators
- **Accessibility**: Proper ARIA labels
- **Responsive**: Work on all screen sizes

## Future LEGO Components

### Planned Components
- `ReusableButton` - Standardized button with RSA styling
- `ReusableModal` - Consistent modal wrapper
- `ReusableCard` - Standard card layout
- `ReusableForm` - Base form with validation
- `ReusableTable` - Data table with sorting/filtering
- `ReusableChart` - Consistent chart components

### Component Naming Convention
- Prefix with "Reusable" or end with "LegoBlock"
- Use PascalCase
- Be descriptive but concise
- Example: `ReusableDataTable`, `FilterLegoBlock`

## Contributing
When adding new LEGO components:
1. Update this documentation
2. Add usage examples
3. Document all props and features
4. Include screenshots if helpful
5. Test in multiple contexts

## Best Practices
- Design once, use everywhere
- Consistent API patterns across components
- Proper error handling and loading states
- Follow RSA branding guidelines
- Database-first architecture
- No hardcoded values
- Extensible through props