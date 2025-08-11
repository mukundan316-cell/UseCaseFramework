# RSA AI Use Case Value Framework - Development Reference

## Core Principles

### 1. LEGO-Style Architecture
- **Build Once, Reuse Everywhere**: Every component should be designed as a reusable LEGO block
- **Consistent Design System**: All CRUD cards follow the exact same visual specification
- **Modular Components**: Components should be self-contained and reusable across different contexts

### 2. Database Schema Consistency Principle
**Critical**: Always maintain consistent casing between Drizzle schema definitions and database operations.

#### Schema-Database Alignment Rules
- **Drizzle Schema**: Uses camelCase field names (`questionId`, `answerValue`, `responseId`)
- **Database Queries**: Must use identical camelCase in all operations
- **Never Mix Casing**: Avoid combining `question_id` and `questionId` in the same operation

#### Common Schema Mismatch Errors
```typescript
// ❌ WRONG - Mixed casing causes failures
.where(and(
  eq(questionAnswers.response_id, responseId),  // snake_case
  eq(questionAnswers.questionId, questionId)    // camelCase
))

// ✅ CORRECT - Consistent camelCase
.where(and(
  eq(questionAnswers.responseId, responseId),   // camelCase
  eq(questionAnswers.questionId, questionId)    // camelCase
))
```

#### Impact of Schema Mismatches
- **Answer Persistence Failures**: Users complete assessments but answers aren't saved
- **Export Errors**: PDF generation fails with "Invalid time value" or "Questionnaire not found"
- **Foreign Key Violations**: Database constraint errors during answer saving

### 3. Testing After Schema Changes
Always verify these critical flows after any database schema modifications:
1. **Answer Persistence**: Complete a questionnaire section and verify answers save to database
2. **Assessment Completion**: Mark response as completed and check status updates
3. **PDF Exports**: Test both template and populated questionnaire exports
4. **Data Integrity**: Verify foreign key relationships remain intact

## Architecture Standards

### Frontend Components
- Use React + TypeScript with shadcn/ui components
- Implement consistent CRUD card design across all use case displays
- Follow LEGO field label prominence standard (`text-base font-semibold text-gray-900`)

### Backend Data Layer
- Drizzle ORM with PostgreSQL for all database operations
- Zod validation for all API requests and responses
- Consistent error handling and logging

### PDF Generation
- Professional consulting-grade formatting (McKinsey/Bain/BCG standards)
- Context-specific templates for different export types
- RSA blue branding (#005DAA) with proper typography

## Quality Assurance

### Pre-Deployment Checklist
- [ ] Answer persistence tested with real question data
- [ ] All PDF exports generate successfully
- [ ] Database schema consistency verified
- [ ] LEGO component reusability maintained
- [ ] Error handling covers edge cases

### Performance Guidelines
- Use parallel tool calls for multiple file operations
- Implement proper database indexing for query performance
- Cache frequently accessed data where appropriate

## Documentation Standards
- Update replit.md for architectural changes
- Document user preferences and technical decisions
- Maintain clear commit messages with context
- Include screenshots for UI changes when relevant