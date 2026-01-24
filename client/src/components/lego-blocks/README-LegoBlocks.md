# LEGO Blocks Documentation

## Overview (Updated Jan 2026)

This directory contains 70+ reusable LEGO components following the "Build Once, Reuse Everywhere" principle.

### Modular Tab Components (`crud-modal-tabs/`)
The CRUD modal has been modularized into specialized tab components:
- `DetailsTab.tsx` - Overview and use case details (772 lines)
- `ScoringTab.tsx` - 10-lever scoring framework (143 lines)
- `OperatingModelTab.tsx` - TOM phase management (208 lines)
- `ResponsibleAITab.tsx` - AI governance and compliance (169 lines)
- `GuideTab.tsx` - Progressive guidance system (15 lines)
- `utils.tsx` - Shared utilities and helpers (91 lines)

## QuestionLegoBlock & SectionLegoBlock

These are fully reusable LEGO components following RSA's "Build Once, Reuse Everywhere" principle.

### QuestionLegoBlock

Supports all question types with validation and error states:

#### Supported Question Types
- `score/scale` - Slider input with custom min/max and labels
- `multi_choice` - Radio button selection  
- `select` - Dropdown (auto-switches to dropdown for >4 options)
- `checkbox` - Single or multiple checkboxes
- `text` - Text input with validation
- `email` - Email input with validation
- `url` - URL input with validation  
- `date` - Date picker input
- `textarea` - Multi-line text input
- `number` - Numeric input

#### Key Features
- **Validation Support**: Required fields, min/max length, pattern matching
- **Error States**: Visual error indicators with custom messages
- **Accessibility**: Proper ARIA labels, tooltips for help text
- **Responsive**: Works on all screen sizes
- **RSA Styling**: Consistent blue (#005DAA) theme

#### Props
```typescript
interface QuestionLegoBlockProps {
  question: QuestionData;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readonly?: boolean;
  className?: string;
}
```

### SectionLegoBlock  

Container for multiple questions with progress tracking:

#### Key Features
- **Collapsible Sections**: Expand/collapse with progress indicators
- **Progress Tracking**: Visual progress bars and completion percentages
- **Required vs Optional**: Separate tracking for required questions
- **Time Estimates**: Display estimated completion time
- **Validation Callbacks**: Real-time section validation status
- **Compact Mode**: Space-efficient layout option

#### Props
```typescript
interface SectionLegoBlockProps {
  section: SectionData;
  responses: Map<string, any>;
  onChange: (questionId: string, value: any) => void;
  readonly?: boolean;
  defaultExpanded?: boolean;
  showProgress?: boolean;
  errors?: Record<string, string>;
  className?: string;
  onValidation?: (sectionId: string, isValid: boolean, requiredComplete: boolean) => void;
  compact?: boolean;
}
```

### Usage Examples

```tsx
// Basic question usage
<QuestionLegoBlock
  question={questionData}
  value={responses.get(question.id)}
  onChange={(value) => handleChange(question.id, value)}
  error={errors[question.id]}
/>

// Section with validation callback
<SectionLegoBlock
  section={sectionData}
  responses={responseMap}
  onChange={handleQuestionChange}
  onValidation={(sectionId, isValid, requiredComplete) => {
    setSectionValidation(sectionId, { isValid, requiredComplete });
  }}
  errors={validationErrors}
/>
```

## Architecture Benefits

### ✅ Reusability
- Single components work across assessments, use case forms, admin panels
- No duplication of question rendering logic
- Consistent behavior everywhere

### ✅ Database-Driven
- No hardcoded content or question types
- Dynamic rendering based on database configuration
- Easy to add new question types

### ✅ Maintainability  
- Centralized validation logic
- Single source of truth for question rendering
- Easy to update styling across entire application

### ✅ Extensibility
- Simple to add new question types
- Plugin-style architecture for custom validation
- Callback system for custom behavior

### ✅ Modular Architecture (Jan 2026)
- CRUD modal split into 6 specialized tab components
- Improved IDE performance with smaller file sizes
- Clear separation of concerns for easier maintenance

These LEGO blocks power the entire questionnaire system with zero code duplication and maximum flexibility.