# Database Rebuild Plan: Clean Architecture Implementation

## Overview
Complete database schema rebuild to eliminate legacy transformation complexity and achieve 100% consistency following replit.md principles.

## Current Issues to Resolve
1. **Mixed Data Types**: Legacy boolean/string inconsistencies (now partially resolved)
2. **Complex Validation**: Unnecessary transformation logic and utility functions
3. **Schema Inconsistencies**: Some fields have legacy constraints and naming
4. **Performance**: Simplify queries by removing transformation layers

## Proposed Clean Schema Design

### Core Principles
- **Consistent String Types**: All boolean-like fields use 'true'/'false' strings
- **Simplified Validation**: Direct enum validation without transformations
- **Clean Field Names**: Consistent camelCase throughout
- **Optimized Indexes**: Better query performance
- **Type Safety**: Clear, predictable data types

### Schema Improvements
1. **Boolean Fields**: All use TEXT with CHECK constraints for 'true'/'false'
2. **Score Fields**: Consistent DECIMAL(2,1) for precision
3. **Array Fields**: JSON arrays with proper validation
4. **Timestamps**: Consistent timestamptz with proper defaults
5. **Constraints**: Proper foreign keys and check constraints

## Implementation Strategy

### Phase 1: Backup & Validation
✅ Create complete data backup
✅ Validate data integrity
✅ Document current schema structure

### Phase 2: Clean Schema Creation
- Drop existing tables (with backup safety)
- Create optimized schema with consistent types
- Add proper constraints and indexes
- Apply migrations through Drizzle

### Phase 3: Data Migration
- Transform and clean existing data
- Validate data consistency
- Restore to new schema format
- Verify no data loss

### Phase 4: Code Simplification
- Remove all transformation utilities
- Simplify validation schemas
- Clean storage layer logic
- Update frontend components

## Benefits Expected
- ✅ 100% consistent data types across entire stack
- ✅ Simplified codebase with no transformation complexity
- ✅ Better performance with optimized schema
- ✅ Easier maintenance and debugging
- ✅ Future-proof architecture

## Risk Assessment: LOW RISK
- Complete data backup ensures no data loss
- Drizzle ORM handles schema migrations safely
- Existing validation already works with target format
- No breaking API changes required

## Recommendation: PROCEED
This rebuild will create the clean, maintainable architecture that aligns perfectly with replit.md principles and eliminates all legacy complexity.