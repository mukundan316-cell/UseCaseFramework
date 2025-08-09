# LEGO Block Component Standards

## Overview
This document defines the standardized patterns and enhancements that must be implemented across all LEGO block components to ensure consistency, usability, and maintainability.

## Core Principles
1. **Build Once, Reuse Everywhere**: All components must be designed for maximum reusability
2. **Consistent User Experience**: Uniform spacing, alignment, and interaction patterns
3. **Progressive Enhancement**: Components should work with minimal configuration but offer advanced features
4. **Accessibility**: All components must be keyboard navigable and screen reader compatible

## Standard Component Structure

### 1. Question Text Display Pattern
All LEGO blocks must implement consistent question header display:

```tsx
{/* Question Header */}
{question && (
  <div className="space-y-2">
    <Label className="text-lg font-semibold text-gray-900">
      {question.questionText}
      {question.isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {question.helpText && (
      <p className="text-sm text-gray-600">{question.helpText}</p>
    )}
  </div>
)}
```

### 2. Spacing and Layout Standards
- **Container spacing**: `space-y-6` for main container
- **Section spacing**: `space-y-4` for sub-sections
- **Grid spacing**: `gap-6` for responsive grids
- **Content padding**: `p-4` for cards and containers

### 3. Error Display Pattern
```tsx
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
    <div className="flex items-center gap-2 text-red-700">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{error}</span>
    </div>
  </div>
)}
```

### 4. Additional Context Section Pattern
```tsx
{/* Additional Context Section */}
{allowNotes && (
  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <AlertCircle className="h-4 w-4" />
      <span>Additional Context</span>
    </Label>
    <p className="text-sm text-gray-600 mb-2">
      {notesPrompt || "Areas needing improvement or performance insights:"}
    </p>
    <Textarea
      value={formData.notes || ''}
      onChange={(e) => handleNotesChange(e.target.value)}
      placeholder="Provide additional context, insights, or areas for improvement..."
      disabled={disabled}
      className="min-h-[100px] bg-white"
    />
  </div>
)}
```

### 5. Input Field Alignment Standards
- **Text inputs**: `text-center` for numeric values, left-aligned for text
- **Suffix positioning**: `pr-16` padding with `right-3` absolute positioning
- **Label spacing**: `space-y-3` between label and input
- **Grid responsiveness**: `md:grid-cols-2 lg:grid-cols-3` for multi-column layouts

## Component-Specific Enhancements

### BusinessPerformanceLegoBlock
- ✅ Enhanced spacing: `gap-6` for metric fields
- ✅ Centered text inputs for better numeric display
- ✅ Improved suffix positioning and visibility
- ✅ Responsive grid layout with proper breakpoints

### MultiRatingLegoBlock
- ✅ Consistent Additional Context section styling
- ✅ Enhanced question header display
- ✅ Improved spacing and alignment

### SmartRatingLegoBlock
- ✅ Added question header with proper typography
- ✅ Enhanced error display pattern
- ✅ Improved spacing consistency

### RankingLegoBlock
- ✅ Standardized question header display
- ✅ Enhanced error handling pattern
- ✅ Consistent spacing improvements

### CompanyProfileLegoBlock
- ✅ Default tier options fallback
- ✅ Default market options fallback
- ✅ Consistent radio button and checkbox layouts

## Duplicate Prevention Rules

### QuestionRegistryLegoBlock Integration
The QuestionRegistryLegoBlock should NOT display Additional Context sections for advanced question types that handle their own notes:

```tsx
{questionMeta.questionData?.allowNotes && 
 !['business_performance', 'multi_rating', 'smart_rating', 'ranking', 
   'percentage_allocation', 'business_lines_matrix', 'department_skills_matrix', 
   'company_profile'].includes(questionMeta.questionType) && (
  // Generic additional context section
)}
```

## Default Options Pattern
All LEGO blocks should provide sensible defaults when questionData is incomplete:

```tsx
// Example from CompanyProfileLegoBlock
const defaultTierOptions = [
  { value: 'small', label: 'Small (<£100M)' },
  { value: 'mid', label: 'Mid (£100M-£3B)' },
  { value: 'large', label: 'Large (>£3B)' }
];

const tierOptions = questionData.companyTier?.options || defaultTierOptions;
```

## Implementation Checklist

For each LEGO block component, ensure:

- [ ] Question header displays question text and help text
- [ ] Error handling follows standard pattern
- [ ] Spacing uses standardized classes (`space-y-6`, `gap-6`, etc.)
- [ ] Additional Context section follows standard styling
- [ ] Default options provided for fallback scenarios
- [ ] No duplicate sections when used in QuestionRegistryLegoBlock
- [ ] Responsive grid layouts with proper breakpoints
- [ ] Consistent typography and color schemes
- [ ] Accessibility features (ARIA labels, keyboard navigation)
- [ ] JSDoc documentation with feature list

## Future Enhancement Guidelines

When adding new LEGO blocks:

1. **Start with this standards template**
2. **Follow existing patterns for similar functionality**
3. **Add to the QuestionRegistryLegoBlock exclusion list if handling own notes**
4. **Test with QuestionnaireContainer integration**
5. **Update this standards document with new patterns**

## Benefits of Standardization

- **Reduced Development Time**: Copy-paste standardized patterns
- **Consistent User Experience**: Uniform look and feel across all questions
- **Easier Maintenance**: Centralized pattern updates
- **Better Testing**: Predictable component behavior
- **Enhanced Accessibility**: Consistent ARIA patterns and keyboard navigation

---

**Last Updated**: January 9, 2025
**Version**: 1.0
**Covers**: All current advanced question types and LEGO block components