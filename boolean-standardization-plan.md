# Boolean Field Standardization Plan

## Overview
Standardize all boolean fields in the RSA AI Use Case Value Framework to use consistent string types ('true'/'false') across database, validation, and frontend components.

## Current Boolean Fields to Standardize

### Database Schema Fields
1. `explainabilityRequired` - Currently: boolean() → Target: text() with 'true'/'false'
2. `dataOutsideUkEu` - Currently: boolean() → Target: text() with 'true'/'false'  
3. `thirdPartyModel` - Currently: boolean() → Target: text() with 'true'/'false'
4. `humanAccountability` - Currently: boolean() → Target: text() with 'true'/'false'
5. `isActiveForRsa` - Already text() with 'true'/'false' ✅
6. `isDashboardVisible` - Already text() with 'true'/'false' ✅

## Implementation Steps

### Phase 1: Database Schema Migration
1. Create migration script to change boolean columns to text columns
2. Convert existing data: true → 'true', false → 'false', null → null
3. Add constraints to ensure only 'true'/'false' values

### Phase 2: Update Validation Schemas  
1. Remove complex union/transformation logic in insertUseCaseSchema
2. Standardize to simple z.enum(['true', 'false']) for all boolean fields
3. Remove utility functions: safeBooleanFromString, safeBooleanToString

### Phase 3: Frontend Component Updates
1. Update form components to handle string values consistently
2. Modify toggle/switch components to work with 'true'/'false' strings
3. Update display logic to handle string comparisons

### Phase 4: API Layer Cleanup
1. Remove boolean transformation logic in storage.ts
2. Simplify validation in routes.ts
3. Update type definitions to reflect string-based approach

## Benefits After Standardization
- ✅ No more validation errors from boolean/string mismatches
- ✅ Simplified codebase with consistent data types
- ✅ Better API predictability and debugging
- ✅ Easier form handling and UI state management
- ✅ No breaking changes (already handling both types)

## Risk Assessment: LOW RISK
- Current system already handles both boolean and string inputs
- Validation transformations already convert booleans to strings
- Frontend components already work with string values
- Database migration can be done safely with data conversion

## Recommendation
**PROCEED** with standardization. This will significantly improve code consistency and prevent future validation issues while maintaining full backward compatibility.