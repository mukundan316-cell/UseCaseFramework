# RSA AI Use Case Value Framework

## Overview
Strategic AI use case prioritization platform for RSA Insurance featuring comprehensive assessment system, 12-lever scoring framework, and executive analytics dashboard.

## User Preferences
- **Communication**: Simple, everyday language
- **Architecture**: LEGO-style reusable components following "Build Once, Reuse Everywhere" principle
- **Database**: Consistent camelCase field naming between Drizzle schema and queries

## Design Standards
### CRUD Card Design
- Clean white cards with 4px blue left border, hover shadows
- Color-coded tags: Process (blue), Line of Business (purple), Use Case Type (orange)  
- Score displays with green (Impact) and blue (Effort) backgrounds for active portfolio
- Context-sensitive action buttons (Edit/Delete, Move to Library/RSA)

### Form Labels
- Questionnaire field labels: `text-base font-semibold text-gray-900` for visibility

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS + Wouter
- **Backend**: Node.js + Express + Drizzle ORM + Zod validation  
- **Database**: PostgreSQL with JSONB support

### Core Features
- **Use Case Management**: Complete CRUD with RSA 12-lever scoring framework
- **Assessment System**: 6-section questionnaire with 14 advanced question types (company_profile, business_lines_matrix, smart_rating, ranking, etc.)
- **Manual Override System**: Toggle-based score customization with database persistence
- **Analytics Dashboard**: RSA AI Value Matrix with interactive charts
- **Professional PDF Exports**: Executive-grade reports for use cases, library catalogs, active portfolios, and assessment responses
- **Real-time Persistence**: Live database synchronization

### Recent Enhancements (August 2025)
- **PDF Export System**: Enhanced to handle complex nested JSON data with proper rendering for structured question types
- **Spacing Improvements**: Professional PDF formatting with consistent spacing, page breaks, and visual hierarchy
- **Data Integrity**: Fixed complex JSON serialization issues in questionnaire responses

## Dependencies
- **Core**: React, TypeScript, Node.js, Express, PostgreSQL
- **UI**: shadcn/ui, TailwindCSS, Recharts, Wouter
- **Data**: Drizzle ORM, TanStack Query, Zod, React Hook Form
- **PDF**: PDFKit for professional report generation

## Development Guidelines
- **Database**: Use consistent camelCase field naming between Drizzle schema and queries
- **Architecture**: Follow LEGO-style reusable component design
- **Testing**: Verify answer persistence and PDF export functionality after changes