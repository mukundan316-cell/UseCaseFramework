# Excel Export Field Mapping Documentation

## Overview
This document provides the complete field structure for both Strategic Use Cases and AI Inventory Excel export sheets, serving as the source of truth for export functionality.

## Strategic Use Cases Sheet

### Total Field Count: 52 fields

### Field Structure:

| Position | Field Name | Data Source | Component |
|----------|------------|-------------|-----------|
| 0-3 | Basic Fields | mapBasicFields() | ID, Title, Description, Problem Statement |
| 4-7 | Business Context | mapBusinessContextFields() | Lines of Business, Business Segments, Geographies, Use Case Type |
| 8 | Use Case Status | useCase.implementation.useCaseStatus | Implementation |
| 9 | Portfolio Status | portfolioStatus.isActiveForRsa | Portfolio |
| 10 | Dashboard Visible | portfolioStatus.isDashboardVisible | Portfolio |
| 11 | Library Source | portfolioStatus.librarySource | Portfolio |
| 12-24 | Strategic Scoring | scoring & businessValue & feasibility | 13 scoring fields |
| 25-30 | Implementation Details | implementation fields | 6 detailed fields |
| 31-35 | Technical Fields | mapTechnicalFields() | 5 technical fields |
| 36 | Integration Requirements | implementation.integrationRequirements | Integration |
| 37-42 | RSA Ethical Principles | mapEthicalPrinciplesFields() | 6 ethics fields |
| 43-45 | Strategic-Specific | Manual Override, Override Reason, Activation | 3 fields |
| 46-47 | Process Details | mapProcessFields() | Processes, Activities |
| 48-51 | Presentation/Metadata | Files and IDs | 4 metadata fields |

## AI Inventory Sheet

### Total Field Count: 54 fields

### Field Structure:

| Position | Field Name | Component | Count |
|----------|------------|-----------|--------|
| 0-3 | Basic Fields | mapBasicFields() | 4 |
| 4-7 | Business Context | mapBusinessContextFields() | 4 |
| 8-14 | Implementation | mapImplementationFields() | 7 |
| 15-19 | Technical | mapTechnicalFields() | 5 |
| 20 | Integration | integrationRequirements | 1 |
| 21-22 | Process | mapProcessFields() | 2 |
| 23-34 | AI Inventory Specific | Governance fields | 12 |
| 35-40 | RSA Ethical | mapEthicalPrinciplesFields() | 6 |
| 41-42 | Portfolio | mapPortfolioFields() | 2 |
| 43 | Presentation | hasPresentation | 1 |
| 44-45 | Dates | Last Update, Created | 2 |

## Field Count Verification Status

### ✅ Strategic Use Cases Sheet:
- **Headers**: 52 fields
- **Data Array**: 52 fields  
- **Status**: MATCH CONFIRMED

### ✅ AI Inventory Sheet:
- **Headers**: 54 fields
- **Data Array**: 54 fields
- **Status**: MATCH CONFIRMED

## LEGO Components Used:
- `mapBasicFields()`: 4 fields (reused)
- `mapBusinessContextFields()`: 4 fields (reused)
- `mapImplementationFields()`: 7 fields (reused)
- `mapTechnicalFields()`: 5 fields (reused)
- `mapProcessFields()`: 2 fields (reused)
- `mapEthicalPrinciplesFields()`: 6 fields (reused)
- `mapPortfolioFields()`: 2 fields (reused)

## Verification Date: September 5, 2025

## Notes:
- Both sheets maintain consistent field counts between headers and data arrays
- Multi-select arrays are properly handled with `mapMultiSelectArray()` function
- Strategic Use Cases includes scoring fields (positions 12-24) not present in AI Inventory
- AI Inventory includes governance fields (positions 23-34) not present in Strategic Use Cases
- All field mappings verified against actual implementation in `server/services/excelExportService.ts`