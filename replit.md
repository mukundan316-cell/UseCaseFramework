# RSA AI Use Case Value Framework

## Overview
Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment system, 12-lever scoring framework, and executive analytics dashboard. Enables organizations to strategically identify, assess, and prioritize AI initiatives for maximum business impact.

## User Preferences
Preferred communication style: Simple, everyday language.

**LEGO-Style Architecture Mandate**: All buttons, modals, components and features must be implemented as reusable LEGO blocks where possible. Follow the "Build Once, Reuse Everywhere" principle to maintain consistency and reduce development overhead. Every new UI element should be evaluated for reusability potential before implementation.

**Database Schema Consistency Principle**: Always use consistent casing between Drizzle schema definitions and database column references to prevent Schema Mismatch errors. The Drizzle schema uses camelCase field names (e.g., `questionId`, `answerValue`) which must match exactly in all database queries. Never mix camelCase and snake_case within the same operation. This prevents critical issues like answer persistence failures and export errors.

**LEGO CRUD Card Design Standard**: All use case cards across the entire application must follow this exact design specification:

**LEGO Field Label Prominence Standard**: All field labels in questionnaire LEGO blocks must use `text-base font-semibold text-gray-900` styling for maximum visibility and consistent user experience across all question types.
- **Card Structure**: Clean white cards with 4px blue left border (#3b82f6), subtle gray border, hover shadow
- **Content Padding**: p-5 for comfortable spacing
- **Title**: text-lg font-semibold text-gray-900 with mb-2 spacing
- **Description**: text-sm text-gray-600 with line-clamp-2
- **Tags**: Rounded pill-style tags with color-coded backgrounds:
  - Process: bg-blue-100 text-blue-800 with blue dot
  - Line of Business: bg-purple-100 text-purple-800 with purple dot  
  - Use Case Type: bg-orange-100 text-orange-800 with orange dot
- **Score Display**: Side-by-side grid with green (Impact) and blue (Effort) backgrounds, only for RSA Active Portfolio
- **Action Buttons**: Ghost-style buttons with proper icons, border-top separator
- **Contextual Actions**: Show appropriate buttons based on view (Edit/Delete for all, Move to Library/RSA as applicable)

This design must be used consistently for all CRUD cards throughout the application to maintain visual unity.

## Architecture

### Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter routing
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation  
- **Database**: PostgreSQL (12 tables, 130+ records with subsections table)

### Recent Fixes (August 2025)
- **Answer Persistence Bug**: Fixed critical schema mismatch causing completed assessments to have zero saved answers
- **Export System**: Resolved questionnaire export failures by correcting database column naming consistency
- **Database Schema**: Aligned all Drizzle queries to use consistent camelCase field names

### Key Features
- **LEGO Architecture**: Reusable components with consistent CRUD card design
- **Enhanced Use Case CRUD**: Problem Statement field added below Description; RSA Portfolio Selection moved to bottom for improved workflow
- **Manual Override System**: Toggle-based score customization with database persistence
- **RSA Scoring Framework**: 12-lever system (Business Value, Feasibility, AI Governance)
- **Assessment System**: 6-section questionnaire with 14 advanced question types
- **Professional PDF Exports**: Enhanced McKinsey/Bain/BCG consulting-grade reports with:
  - Executive cover pages with RSA blue branding and confidential classification
  - Professional tabular formats for all use case details (process, business unit, scores, implementation details)
  - Context-specific templates optimized for each export type (library catalog, portfolio report, assessment results)
  - Proper typography, alignment, and visual hierarchy matching consulting standards
  - Enhanced questionnaire exports supporting both blank templates and populated responses
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts and authentic data
- **Real-time Persistence**: Database → API → Frontend pattern with live synchronization
- **Subsection Architecture**: Proper organizational containers with sequential question numbering (Q1-Q52) and collapsible UI

## Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **Build**: Vite, ESBuild

## Critical Development Guidelines

### Database Schema Consistency
- **Schema-Database Alignment**: Drizzle schema field names (camelCase) must match exactly in all database operations
- **Common Errors to Avoid**: 
  - Using `question_id` instead of `questionId` in queries
  - Mixing `answer_value` and `answerValue` in the same operation
  - Inconsistent casing in join conditions
- **Validation**: Always test answer persistence and export functionality after schema changes