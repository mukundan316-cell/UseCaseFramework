# LEGO-Style Component Library

## Overview
This document catalogs all reusable LEGO-style components in the RSA AI Use Case Value Framework. Follow the "Build Once, Reuse Everywhere" principle. The admin interface focuses on managing UI list of values (dropdown options, filter values) rather than internal component management.

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

### SectionTabNavigatorLegoBlock
**Purpose**: Section-based navigation with progress tracking and sequential completion
**Location**: `client/src/components/lego-blocks/SectionTabNavigatorLegoBlock.tsx`
**Features**:
- Responsive horizontal tabs with mobile scrolling
- Visual progress indicators and completion states
- Optional section locking for sequential completion
- Overall progress tracking with question counts
- RSA-styled with consistent theming

**Usage Example**:
```tsx
<SectionTabNavigatorLegoBlock
  currentSection={2}
  completedSections={[1]}
  onSectionChange={handleSectionChange}
  sectionProgress={progressMap}
  enforceOrder={true}
/>
```

### QuestionnaireSectionContainerLegoBlock
**Purpose**: Complete section container with navigation, progress tracking, and mobile support
**Location**: `client/src/components/lego-blocks/QuestionnaireSectionContainerLegoBlock.tsx`
**Features**:
- Consistent section layout with header and footer navigation
- Previous/Next navigation with validation
- Save & Exit functionality with auto-save indicators
- Keyboard navigation support (← → arrows, ESC)
- Touch/swipe gestures for mobile devices
- Transition animations between sections
- Progress indicators for section and overall completion

**Usage Example**:
```tsx
<QuestionnaireSectionContainerLegoBlock
  currentSection={2}
  totalSections={6}
  sectionTitle="Current AI & Data Capabilities"
  sectionProgress={{ completed: 28, total: 35 }}
  overallProgress={{ completed: 45, total: 100 }}
  onPrevious={handlePrevious}
  onNext={handleNext}
  onSaveAndExit={handleSaveExit}
  canProceed={true}
  hasUnsavedChanges={false}
  lastSaved="2025-01-08T15:30:00Z"
>
  <YourSectionContent />
</QuestionnaireSectionContainerLegoBlock>
```

### QuestionRegistryLegoBlock
**Purpose**: Dynamic question management system with conditional logic and database-driven configuration
**Location**: `client/src/components/lego-blocks/QuestionRegistryLegoBlock.tsx`
**Features**:
- Maps question types to appropriate LEGO components
- Supports conditional logic and dependencies between questions
- Database-driven question definitions with JSON metadata
- Dynamic add/edit/remove functionality in edit mode
- Question ordering and validation management
- 15+ supported question types with extensible registry

**Usage Example**:
```tsx
<QuestionRegistryLegoBlock
  questions={dynamicQuestions}
  responses={responseMap}
  onResponseChange={handleResponseChange}
  onQuestionChange={handleQuestionManagement}
  editMode={false}
  showDebug={false}
/>
```

### SectionConfigurationLegoBlock
**Purpose**: Admin component for comprehensive section management with drag-and-drop, templates, and configuration
**Location**: `client/src/components/lego-blocks/SectionConfigurationLegoBlock.tsx`
**Features**:
- Drag & drop question reordering with react-beautiful-dnd
- Template library integration with RSA's 100+ questions
- Section-level configuration (time limits, unlock conditions, scoring weights)
- Real-time preview functionality
- Question management (add/edit/duplicate/remove)
- Multi-tab interface for Questions, Settings, Scoring, and Templates

**Usage Example**:
```tsx
<SectionConfigurationLegoBlock
  section={sectionConfig}
  onSectionUpdate={handleSectionUpdate}
  onPreviewSection={handlePreview}
  availableTemplates={businessStrategyTemplates}
/>
```

### Enhanced Progress Persistence System
**Purpose**: Comprehensive section-level progress tracking with auto-save and resume capabilities
**Location**: `client/src/hooks/useProgressPersistence.ts`
**Features**:
- Section-level progress tracking with independent completion status
- Auto-save functionality with debounced updates (1-second delay)
- Resume capability at exact question within last incomplete section
- API integration with dedicated section progress endpoints
- Local storage backup with 30-day retention policy
- Real-time save status indicators and progress percentages

**API Endpoints**:
- `GET /api/responses/:id/section-progress` - Get all section progress
- `PUT /api/responses/:id/section/:sectionNum/progress` - Update section progress
- `POST /api/responses/:id/section/:sectionNum/complete` - Complete section
- `GET /api/responses/:id/resume-point` - Get resume point for incomplete responses

**Usage Example**:
```tsx
const {
  saveProgressWithSection,
  getSectionProgress,
  completeSectionProgress,
  getResumePoint
} = useProgressPersistence({
  storageKey: 'rsa_assessment_progress',
  autoSaveDelay: 1000,
  enableToasts: true,
  apiBaseUrl: '/api'
});
```

### SectionSummaryCardLegoBlock
**Purpose**: Interactive section overview cards with progress tracking and navigation
**Location**: `client/src/components/lego-blocks/SectionSummaryCardLegoBlock.tsx`
**Features**:
- Progress visualization with completion percentages and question counts
- Maturity scoring with 5-star rating system and color-coded levels
- Time tracking display (estimated vs actual time)
- Key insights display for completed sections (2-3 bullet points)
- Interactive navigation with Resume/Review/Start buttons
- Lock state management with visual overlays for locked sections
- Completion indicators with green borders and check marks
- Responsive grid layout (1-3 columns) with compact mode option
- Section type categorization with color-coded themes and icons
- API integration with section_progress table

**Usage Example**:
```tsx
<SectionSummaryCardLegoBlock
  sections={sectionData}
  onSectionClick={handleSectionNavigation}
  onResumeSection={handleResumeSection}
  onReviewSection={handleReviewSection}
  showInsights={true}
  compactMode={false}
/>
```

### BreadcrumbNavigationLegoBlock
**Purpose**: Context-aware navigation breadcrumbs for assessment progress tracking
**Location**: `client/src/components/lego-blocks/BreadcrumbNavigationLegoBlock.tsx`
**Features**:
- Hierarchical navigation path display (Assessment → Section → Question)
- Clickable breadcrumbs for quick navigation to previous levels
- Current location highlighting with RSA blue theming
- Question number and title display in context card
- Section completion percentage with visual progress bar
- Responsive design with mobile collapse to "Back to Section" button
- Context-aware display adapting to section vs question level
- Progress visualization with completed/total question counts
- Interactive icons for different navigation levels
- Touch-friendly mobile optimization

**Usage Example**:
```tsx
<BreadcrumbNavigationLegoBlock
  context={{
    assessmentTitle: 'RSA AI Maturity Assessment',
    sectionNumber: 2,
    sectionTitle: 'AI Capabilities Assessment',
    questionNumber: 7,
    questionTitle: 'Data Quality Framework',
    sectionProgress: 65,
    totalQuestions: 15,
    completedQuestions: 10
  }}
  onNavigateToHome={handleHomeNavigation}
  onNavigateToSection={handleSectionNavigation}
  onNavigateToQuestion={handleQuestionNavigation}
  showProgress={true}
  mobileCollapse={true}
/>
```

### SectionTransitionLegoBlock
**Purpose**: Smooth section navigation with validation, animations, and state management
**Location**: `client/src/components/lego-blocks/SectionTransitionLegoBlock.tsx`
**Features**:
- Section completion validation before allowing navigation
- Confirmation dialogs for unsaved changes protection
- Loading states and transition animations (slide, fade, celebration)
- Next section preview with key highlights
- Save & Exit functionality with proper cleanup
- Progress visualization with completion percentages
- Error handling and validation feedback
- Auto-advance capability for seamless progression
- Celebration animations on section and assessment completion
- Responsive design with mobile optimization

**Usage Example**:
```tsx
<SectionTransitionLegoBlock
  currentSection={currentSectionData}
  nextSection={nextSectionData}
  previousSection={previousSectionData}
  transitionState="idle"
  onNavigateToSection={handleSectionNavigation}
  onSaveAndExit={handleSaveExit}
  onCompleteSection={handleSectionCompletion}
  onValidateSection={handleValidation}
  hasUnsavedChanges={false}
  isAllSectionsComplete={false}
  showCelebration={false}
  autoAdvance={true}
/>
```

### QuestionTemplateLibraryLegoBlock
**Purpose**: Comprehensive question template management for dynamic assessment building
**Location**: `client/src/components/lego-blocks/QuestionTemplateLibraryLegoBlock.tsx`
**Features**:
- Browse pre-built RSA question templates (100+) categorized by assessment section
- Advanced search with full-text filtering across titles, descriptions, and tags
- Multi-criteria filtering by category, question type, difficulty level, and starred status
- Detailed template preview with question configuration and usage statistics
- Bulk import capabilities for efficient section building with multi-select
- Custom question creation from templates with validation
- Full CRUD operations for template management (create, update, delete)
- Database-driven storage with persistent question library
- Section targeting for flexible question placement across all 6 sections
- Usage analytics and question popularity tracking

**Usage Example**:
```tsx
<QuestionTemplateLibraryLegoBlock
  onAddQuestion={handleAddQuestion}
  onBulkImport={handleBulkImport}
  onCreateCustom={handleCreateCustom}
  onUpdateTemplate={handleUpdateTemplate}
  onDeleteTemplate={handleDeleteTemplate}
  readOnly={false}
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

### CRUDUseCaseModal
**Purpose**: Complete modal for creating and editing use cases with full scoring
**Location**: `client/src/components/lego-blocks/CRUDUseCaseModal.tsx`
**Features**:
- Create/Edit use cases with full form validation
- Enhanced RSA Framework scoring with 12 levers
- Real-time score calculation and quadrant assignment
- Business metadata management
- Database persistence

**Usage Example**:
```tsx
<CRUDUseCaseModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  mode="create"
  useCase={selectedUseCase}
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