import XLSX from 'xlsx';
import { db } from '../db';
import { useCases, metadataConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor } from './useCaseDataExtractor';

// Validation interfaces
interface ValidationSummary {
  totalRecords: number;
  recordsWithIssues: number;
  criticalErrors: ValidationError[];
  warnings: ValidationWarning[];
  shouldProceed: boolean;
  governanceFieldsAnalysis?: {
    totalAiInventoryRecords: number;
    recordsWithPopulatedGovernance: number;
    averageGovernanceCompletion: number;
  };
}

interface ValidationError {
  recordId: string;
  field: string;
  issue: string;
  currentValue: any;
}

interface ValidationWarning {
  recordId: string;
  field: string;
  issue: string;
  currentValue: any;
  suggestion?: string;
}

export class ExcelExportService {

  /**
   * Comprehensive data validation for Excel export
   * Validates required fields, sanitizes data, and provides validation summary
   */
  private static async validateUseCasesForExport(useCases: any[]): Promise<ValidationSummary> {
    const criticalErrors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let recordsWithIssues = 0;
    
    // Get valid values from metadata for validation
    const metadata = await db.select().from(metadataConfig).limit(1);
    const validUseCaseStatuses = metadata[0]?.useCaseStatuses || ['Discovery', 'Backlog', 'In-flight', 'Implemented', 'On Hold'];
    const validLibrarySources = metadata[0]?.sourceTypes || ['rsa_internal', 'industry_standard', 'ai_inventory'];
    
    // AI Inventory governance analysis
    const aiInventoryItems = useCases.filter(uc => uc.librarySource === 'ai_inventory');
    let aiInventoryWithGovernance = 0;
    let totalGovernanceFields = 0;
    
    for (const useCase of useCases) {
      let hasIssues = false;
      const recordId = useCase.meaningfulId || useCase.id;
      
      // CRITICAL VALIDATIONS - Required fields
      if (!useCase.title || useCase.title.toString().trim() === '') {
        criticalErrors.push({
          recordId,
          field: 'title',
          issue: 'Title is required and cannot be empty',
          currentValue: useCase.title
        });
        hasIssues = true;
      }
      
      if (!useCase.description || useCase.description.toString().trim() === '') {
        criticalErrors.push({
          recordId,
          field: 'description',
          issue: 'Description is required and cannot be empty',
          currentValue: useCase.description
        });
        hasIssues = true;
      }
      
      // Use Case Status validation
      if (useCase.useCaseStatus && !validUseCaseStatuses.includes(useCase.useCaseStatus)) {
        criticalErrors.push({
          recordId,
          field: 'useCaseStatus',
          issue: `Use Case Status must be one of: ${validUseCaseStatuses.join(', ')}`,
          currentValue: useCase.useCaseStatus
        });
        hasIssues = true;
      }
      
      // Library Source validation
      if (useCase.librarySource && !validLibrarySources.includes(useCase.librarySource)) {
        criticalErrors.push({
          recordId,
          field: 'librarySource',
          issue: `Library Source must be one of: ${validLibrarySources.join(', ')}`,
          currentValue: useCase.librarySource
        });
        hasIssues = true;
      }
      
      // WARNINGS - Data quality checks
      
      // Numeric score validation (1-5 range)
      const scoreFields = [
        'revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
        'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness', 'regulatoryCompliance'
      ];
      
      for (const field of scoreFields) {
        const value = useCase[field];
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 1 || numValue > 5) {
            warnings.push({
              recordId,
              field,
              issue: 'Score values should be between 1-5',
              currentValue: value,
              suggestion: 'Use numeric values 1, 2, 3, 4, or 5, or leave empty'
            });
            hasIssues = true;
          }
        }
      }
      
      // Missing important optional fields
      if (!useCase.primaryBusinessOwner || useCase.primaryBusinessOwner.toString().trim() === '') {
        warnings.push({
          recordId,
          field: 'primaryBusinessOwner',
          issue: 'Primary Business Owner is recommended for implementation tracking',
          currentValue: useCase.primaryBusinessOwner,
          suggestion: 'Add business owner name for better accountability'
        });
        hasIssues = true;
      }
      
      // AI Inventory governance field analysis
      if (useCase.librarySource === 'ai_inventory') {
        const governanceFields = [
          'businessFunction', 'riskToCustomers', 'riskToRsa', 'dataUsed', 'modelOwner',
          'rsaPolicyGovernance', 'validationResponsibility', 'informedBy'
        ];
        
        let populatedFields = 0;
        for (const field of governanceFields) {
          if (useCase[field] && useCase[field].toString().trim() !== '') {
            populatedFields++;
          }
        }
        
        if (populatedFields > 0) {
          aiInventoryWithGovernance++;
        }
        totalGovernanceFields += populatedFields;
        
        // Warn if governance fields are mostly empty
        if (populatedFields < governanceFields.length * 0.5) {
          warnings.push({
            recordId,
            field: 'governance_fields',
            issue: `Only ${populatedFields}/${governanceFields.length} governance fields populated`,
            currentValue: `${Math.round((populatedFields / governanceFields.length) * 100)}% complete`,
            suggestion: 'Complete governance fields for better compliance tracking'
          });
          hasIssues = true;
        }
      }
      
      // Suspicious scoring patterns
      if (useCase.librarySource !== 'ai_inventory') {
        const businessScores = [useCase.revenueImpact, useCase.costSavings, useCase.riskReduction, useCase.brokerPartnerExperience, useCase.strategicFit];
        const validBusinessScores = businessScores.filter(score => score >= 1 && score <= 5);
        
        if (validBusinessScores.length >= 3 && validBusinessScores.every(score => score === 5)) {
          warnings.push({
            recordId,
            field: 'business_scores',
            issue: 'All business impact scores are maximum (5) - verify scoring accuracy',
            currentValue: 'All scores = 5',
            suggestion: 'Review scoring to ensure realistic assessment'
          });
          hasIssues = true;
        }
      }
      
      if (hasIssues) {
        recordsWithIssues++;
      }
    }
    
    // Calculate governance analysis for AI Inventory
    const governanceAnalysis = aiInventoryItems.length > 0 ? {
      totalAiInventoryRecords: aiInventoryItems.length,
      recordsWithPopulatedGovernance: aiInventoryWithGovernance,
      averageGovernanceCompletion: Math.round((totalGovernanceFields / (aiInventoryItems.length * 8)) * 100)
    } : undefined;
    
    const shouldProceed = criticalErrors.length === 0;
    
    // Log validation results
    console.log(`Excel Export Validation Complete:`, {
      totalRecords: useCases.length,
      recordsWithIssues,
      criticalErrors: criticalErrors.length,
      warnings: warnings.length,
      shouldProceed
    });
    
    if (criticalErrors.length > 0) {
      console.error('Critical validation errors found:', criticalErrors);
    }
    
    return {
      totalRecords: useCases.length,
      recordsWithIssues,
      criticalErrors,
      warnings,
      shouldProceed,
      governanceFieldsAnalysis: governanceAnalysis
    };
  }

  /**
   * Sanitize use case data for Excel export
   * Removes invalid characters and cleans arrays
   */
  private static sanitizeUseCaseData(useCases: any[]): any[] {
    return useCases.map(useCase => {
      const sanitized = { ...useCase };
      
      // Sanitize string fields - remove Excel-breaking characters
      const stringFields = ['title', 'description', 'problemStatement', 'useCaseType', 'primaryBusinessOwner', 
                           'keyDependencies', 'implementationTimeline', 'successMetrics', 'estimatedValue',
                           'valueMeasurementApproach', 'integrationRequirements', 'activationReason',
                           'customerHarmRisk', 'riskToCustomers', 'riskToRsa', 'dataUsed', 'modelOwner'];
      
      for (const field of stringFields) {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
          // Remove control characters and Excel-breaking chars, trim whitespace
          sanitized[field] = sanitized[field]
            .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove control characters
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .replace(/\r\n|\r|\n/g, ' ') // Replace line breaks with spaces
            .trim();
        }
      }
      
      // Clean multi-select arrays
      const arrayFields = ['processes', 'activities', 'linesOfBusiness', 'businessSegments', 'geographies',
                          'aiMlTechnologies', 'dataSources', 'stakeholderGroups', 'horizontalUseCaseTypes'];
      
      for (const field of arrayFields) {
        if (Array.isArray(sanitized[field])) {
          sanitized[field] = sanitized[field]
            .filter(item => item != null && item !== '')
            .map(item => typeof item === 'string' ? item.trim() : item);
        }
      }
      
      // Ensure numeric fields are valid numbers or empty strings
      const numericFields = ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
                            'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness', 'regulatoryCompliance'];
      
      for (const field of numericFields) {
        if (sanitized[field] !== null && sanitized[field] !== undefined) {
          const numValue = Number(sanitized[field]);
          if (isNaN(numValue)) {
            sanitized[field] = ''; // Convert invalid numbers to empty string
          }
        }
      }
      
      return sanitized;
    });
  }
  
  /**
   * Generate comprehensive Excel export with multiple worksheets
   */
  static async generateUseCaseLibraryExcel(res: Response, filters: {
    category?: string;
    status?: string;
  } = {}): Promise<void> {
    try {
      console.log('Generating Excel export with filters:', filters);
      
      // Fetch use cases based on filters
      let allUseCases;
      if (filters.status === 'active') {
        allUseCases = await db.select().from(useCases).where(eq(useCases.isActiveForRsa, 'true'));
      } else if (filters.status === 'all') {
        allUseCases = await db.select().from(useCases);
      } else {
        // Default library export to reference items only (excludes active portfolio)
        allUseCases = await db.select().from(useCases).where(eq(useCases.isActiveForRsa, 'false'));
      }
      
      // Apply category filtering if specified
      if (filters.category && filters.category !== 'all') {
        if (filters.category === 'ai_inventory') {
          allUseCases = allUseCases.filter(uc => uc.librarySource === 'ai_inventory');
        } else if (filters.category === 'strategic') {
          allUseCases = allUseCases.filter(uc => uc.librarySource !== 'ai_inventory');
        }
      }
      
      console.log('Found use cases for Excel export:', allUseCases.length);
      
      // VALIDATE DATA BEFORE EXPORT
      console.log('🔍 Starting data validation...');
      const validationSummary = await this.validateUseCasesForExport(allUseCases);
      
      // If critical errors exist, return error response with validation details
      if (!validationSummary.shouldProceed) {
        console.error('❌ Export blocked due to critical validation errors');
        res.status(400).json({
          success: false,
          error: 'Export blocked due to data validation errors',
          validation: validationSummary
        });
        return;
      }
      
      // SANITIZE DATA FOR EXPORT
      console.log('🧹 Sanitizing data for export...');
      const sanitizedUseCases = this.sanitizeUseCaseData(allUseCases);
      
      // Log validation summary (warnings only since critical errors would have returned already)
      if (validationSummary.warnings.length > 0) {
        console.warn(`⚠️ Export proceeding with ${validationSummary.warnings.length} data quality warnings`);
      } else {
        console.log('✅ Data validation passed with no issues');
      }
      
      // Create new workbook with metadata properties
      const workbook = XLSX.utils.book_new();
      this.setWorkbookMetadata(workbook, validationSummary, sanitizedUseCases.length, filters);
      
      // WORKSHEET 1: Import Guide (Help for users)
      const importGuideSheet = await this.createImportGuideSheet();
      XLSX.utils.book_append_sheet(workbook, importGuideSheet, 'Import Guide');
      
      // WORKSHEET 2: Summary Overview
      const summaryData = UseCaseDataExtractor.getSummaryStats(sanitizedUseCases);
      const summarySheet = this.createSummarySheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // WORKSHEET 3: Strategic Use Cases (scored)
      const strategicUseCases = sanitizedUseCases.filter(uc => uc.librarySource !== 'ai_inventory');
      if (strategicUseCases.length > 0) {
        const strategicSheet = this.createStrategicUseCasesSheet(strategicUseCases);
        XLSX.utils.book_append_sheet(workbook, strategicSheet, 'Strategic Use Cases');
      }
      
      // WORKSHEET 4: AI Inventory (governance)
      const aiInventoryItems = sanitizedUseCases.filter(uc => uc.librarySource === 'ai_inventory');
      if (aiInventoryItems.length > 0) {
        const aiInventorySheet = this.createAiInventorySheet(aiInventoryItems);
        XLSX.utils.book_append_sheet(workbook, aiInventorySheet, 'AI Inventory');
      }
      
      // WORKSHEET 5: Complete Raw Data
      const rawDataSheet = this.createRawDataSheet(sanitizedUseCases);
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
      
      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Generate standardized filename with category suffix
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const categorySuffix = this.getCategorySuffix(filters);
      const filename = `hexaware_ai_usecase_export_${timestamp}_${categorySuffix}.xlsx`;
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('X-Validation-Summary', JSON.stringify({
        totalRecords: validationSummary.totalRecords,
        recordsWithIssues: validationSummary.recordsWithIssues,
        criticalErrorCount: validationSummary.criticalErrors.length,
        warningCount: validationSummary.warnings.length,
        governanceAnalysis: validationSummary.governanceFieldsAnalysis
      }));
      
      // Send the buffer
      res.send(buffer);
      console.log(`✅ Excel export generated successfully with validation summary:`, {
        totalRecords: validationSummary.totalRecords,
        issues: validationSummary.recordsWithIssues,
        warnings: validationSummary.warnings.length
      });
      
    } catch (error) {
      console.error('Failed to generate Excel export:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate Excel export' });
      }
    }
  }

  /**
   * Public method to validate use case data for API endpoints
   * Returns validation summary without performing export
   */
  static async validateExportData(useCases: any[]): Promise<ValidationSummary> {
    return this.validateUseCasesForExport(useCases);
  }

  /**
   * Public method to sanitize use case data for API endpoints
   * Returns cleaned data without performing export
   */
  static sanitizeExportData(useCases: any[]): any[] {
    return this.sanitizeUseCaseData(useCases);
  }
  
  /**
   * Generate category suffix for filename based on filters
   */
  private static getCategorySuffix(filters: { category?: string; status?: string } = {}): string {
    if (filters.category === 'ai_inventory') {
      return 'ai_inventory';
    } else if (filters.category === 'strategic') {
      return 'strategic';
    } else {
      return 'all';
    }
  }
  
  /**
   * Set Excel workbook metadata properties
   */
  private static setWorkbookMetadata(
    workbook: XLSX.WorkBook, 
    validationSummary: ValidationSummary, 
    recordCount: number, 
    filters: { category?: string; status?: string } = {}
  ): void {
    const exportDate = new Date();
    const categorySuffix = this.getCategorySuffix(filters);
    
    // Set workbook properties
    workbook.Props = {
      Title: `Hexaware AI Use Case Framework Export - ${categorySuffix.charAt(0).toUpperCase() + categorySuffix.slice(1)}`,
      Subject: 'Hexaware AI Use Case Framework Data Export',
      Author: 'Hexaware AI Use Case Framework',
      Manager: 'Hexaware Technologies',
      Company: 'Hexaware Technologies',
      Category: 'AI Use Case Data',
      Keywords: `AI, Use Cases, Hexaware, Framework, ${categorySuffix}`,
      Comments: `Export generated on ${format(exportDate, 'yyyy-MM-dd HH:mm:ss')}. ` +
                `Contains ${recordCount} records with ${validationSummary.warnings.length} data quality warnings. ` +
                `Validation status: ${validationSummary.shouldProceed ? 'PASSED' : 'FAILED'}. ` +
                `Export category: ${categorySuffix}.`,
      LastAuthor: 'Hexaware AI Use Case Framework',
      CreatedDate: exportDate,
      ModifiedDate: exportDate,
      Version: '1.0'
    };
    
    // Set custom properties for detailed tracking
    workbook.Custprops = {
      'Export Category': categorySuffix,
      'Record Count': recordCount.toString(),
      'Validation Status': validationSummary.shouldProceed ? 'PASSED' : 'FAILED',
      'Critical Errors': validationSummary.criticalErrors.length.toString(),
      'Warnings': validationSummary.warnings.length.toString(),
      'Records With Issues': validationSummary.recordsWithIssues.toString(),
      'AI Inventory Records': validationSummary.governanceFieldsAnalysis?.totalAiInventoryRecords?.toString() || '0',
      'Framework Version': '2.0',
      'Export Timestamp': format(exportDate, 'yyyyMMdd_HHmmss')
    };
  }
  
  /**
   * Create import guide worksheet with comprehensive help
   */
  private static async createImportGuideSheet(): Promise<XLSX.WorkSheet> {
    // Import storage to get current metadata
    const { storage } = await import('../storage');
    const metadata = await storage.getMetadataConfig();
    const data = [
      ['Hexaware AI Use Case Framework - Import Guide'],
      ['Last Updated: ' + format(new Date(), 'MMMM d, yyyy')],
      [''],
      ['OVERVIEW'],
      ['This guide helps you prepare Excel data for import into the Hexaware AI Use Case Framework.'],
      ['Follow these guidelines to avoid data type errors and maintain system consistency.'],
      [''],
      ['WORKSHEET STRUCTURE'],
      ['• Import Guide: This help sheet'],
      ['• Summary: Portfolio overview (read-only)'],
      ['• Strategic Use Cases: Scored business use cases (editable)'],
      ['• AI Inventory: Governance tracking items (editable)'],
      ['• Raw Data: Complete database dump (advanced users only)'],
      [''],
      ['CRITICAL DO\'S'],
      ['✓ Keep column headers unchanged - system relies on exact header names'],
      ['✓ Use dropdown values where available (see Valid Values section below)'],
      ['✓ Enter scores as numbers 1-5 only (not text like "high" or "3 out of 5")'],
      ['✓ Use only \'true\' or \'false\' for Yes/No fields (lowercase, quotes optional)'],
      ['✓ Leave cells empty rather than using "N/A", "NULL", or "-"'],
      ['✓ Use semicolon (;) to separate multiple values in array fields'],
      ['✓ Keep dates in YYYY-MM-DD format (e.g., 2025-01-15)'],
      ['✓ Test import with small batch first'],
      [''],
      ['CRITICAL DON\'TS'],
      ['✗ Don\'t add/remove/rename column headers'],
      ['✗ Don\'t use text like "High" for numeric scores (use 1-5 numbers)'],
      ['✗ Don\'t use "Yes/No", "Y/N", "1/0" for boolean fields'],
      ['✗ Don\'t merge cells or add formatting that affects data structure'],
      ['✗ Don\'t leave required fields empty (Title, Description only)'],
      ['✗ Don\'t use commas in array fields (use semicolons instead)'],
      ['✗ Don\'t change Portfolio Status without proper authority'],
      [''],
      ['FIELD CATEGORIES (Important!)'],
      [''],
      ['🔵 USER-EDITABLE FIELDS (You can modify these)'],
      ['• Basic Information: Title, Description, Problem Statement'],
      ['• Scoring Inputs: Revenue Impact (1-5), Cost Savings (1-5), etc.'],
      ['• Business Details: Lines of Business, Business Segments, etc.'],
      ['• Implementation: Primary Business Owner, Timeline, Dependencies'],
      [''],
      ['❌ CALCULATED FIELDS (Auto-generated - DO NOT EDIT)'],
      ['• Final Impact Score (calculated from your scoring inputs)'],
      ['• Final Effort Score (calculated from your scoring inputs)'],
      ['• Final Quadrant (derived from impact/effort scores)'],
      ['⚠️  These will be IGNORED during import and recalculated automatically'],
      [''],
      ['⚙️  SYSTEM-MANAGED FIELDS (Auto-generated - DO NOT EDIT)'],
      ['• Use Case ID (database identifier)'],
      ['• Meaningful ID (auto-generated based on category)'],
      ['• Created Date, Last Status Update (timestamps)'],
      ['• Manual Override flags and reasons'],
      ['⚠️  These will be IGNORED during import to prevent data corruption'],
      ['❌ CRITICAL: Invalid Use Case IDs will cause import to FAIL'],
      ['   Only existing IDs from exported data are valid for updates'],
      [''],
      ['FIELD TYPES & EXAMPLES'],
      [''],
      ['TEXT FIELDS (most common)'],
      ['Examples: "Claims automation using AI", "Reduce manual processing time"'],
      ['Required: Title, Description only (minimal validation per replit.md)'],
      [''],
      ['NUMERIC SCORES (1-5 scale)'],
      ['Examples: 3, 5, 1 (not "High", "Medium", "Low")'],
      ['Used for: All business impact and implementation effort scores'],
      [''],
      ['BOOLEAN FIELDS (true/false)'],
      ['Examples: true, false (not "Yes", "No", "Y", "N")'],
      ['Used for: Explainability Required, Cross-Border Data Transfer, etc.'],
      [''],
      ['ARRAY FIELDS (semicolon-separated)'],
      ['Examples: "Machine Learning; Natural Language Processing"'],
      ['Used for: AI/ML Technologies, Data Sources, Stakeholder Groups'],
      [''],
      ['DATE FIELDS'],
      ['Examples: 2025-01-15, 2024-12-31'],
      ['Used for: Created Date, Last Status Update'],
      [''],
      ['VALID VALUES FOR DROPDOWNS'],
      [''],
      ['Use Case Type: ' + (metadata?.useCaseTypes?.join(', ') || 'See metadata configuration')],
      [''],
      ['Library Source: ' + (metadata?.sourceTypes?.join(', ') || 'See metadata configuration')],
      [''],
      ['Portfolio Status: Active Portfolio, Reference Library'],
      [''],
      ['AI Inventory Status: ' + (metadata?.useCaseStatuses?.join(', ') || 'See metadata configuration')],
      [''],
      ['Deployment Status: PoC, Pilot, Production, Decommissioned'],
      [''],
      ['Use Case Status: ' + (metadata?.useCaseStatuses?.join(', ') || 'See metadata configuration')],
      [''],
      ['Lines of Business: ' + (metadata?.linesOfBusiness?.join(', ') || 'See metadata configuration')],
      [''],
      ['Business Segments: ' + (metadata?.businessSegments?.join(', ') || 'See metadata configuration')],
      [''],
      ['Geographies: ' + (metadata?.geographies?.join(', ') || 'See metadata configuration')],
      [''],
      ['Processes: ' + (metadata?.processes?.join(', ') || 'See metadata configuration')],
      [''],
      ['AI/ML Technologies: ' + (metadata?.aiMlTechnologies?.join(', ') || 'See metadata configuration')],
      [''],
      ['Data Sources: ' + (metadata?.dataSources?.join(', ') || 'See metadata configuration')],
      [''],
      ['Stakeholder Groups: ' + (metadata?.stakeholderGroups?.join(', ') || 'See metadata configuration')],
      [''],
      ['Horizontal Use Case Types: ' + (metadata?.horizontalUseCaseTypes?.join(', ') || 'See metadata configuration')],
      [''],
      ['NEW: IMPORT VALIDATION FEATURES'],
      [''],
      ['✅ Field Category Detection: System warns if calculated/system fields found'],
      ['✅ Smart Field Filtering: Calculated fields automatically ignored during import'],
      ['✅ Backward Compatibility: Existing Excel templates still work with warnings'],
      ['✅ Non-Breaking Validation: Import continues even with field category warnings'],
      [''],
      ['COMMON IMPORT ERRORS & SOLUTIONS'],
      [''],
      ['Error: "Invalid score value"'],
      ['Solution: Use numbers 1-5, not text descriptions'],
      [''],
      ['Error: "Boolean field validation failed"'],
      ['Solution: Use \'true\' or \'false\', not Yes/No'],
      [''],
      ['Error: "Required field missing"'],
      ['Solution: Ensure Title, Description are not empty (minimal validation)'],
      [''],
      ['Error: "Invalid array format"'],
      ['Solution: Use semicolons (;) to separate multiple values'],
      [''],
      ['Error: "Date format invalid"'],
      ['Solution: Use YYYY-MM-DD format (2025-01-15)'],
      [''],
      ['Error: "Invalid Use Case ID"'],
      ['Solution: Remove the Use Case ID to create new records, or use only IDs from exported data for updates'],
      [''],
      ['WORKFLOW RECOMMENDATIONS'],
      [''],
      ['1. PREPARATION'],
      ['• Export current data first as backup'],
      ['• Make changes in small batches (10-20 rows)'],
      ['• Validate data locally before import'],
      [''],
      ['2. EDITING'],
      ['• Work on one worksheet at a time'],
      ['• Use Excel\'s data validation features'],
      ['• Double-check required fields are populated'],
      [''],
      ['3. IMPORT'],
      ['• Test with a few rows first'],
      ['• Check system immediately after import'],
      ['• Report any data discrepancies promptly'],
      [''],
      ['AUTHORIZATION LEVELS'],
      [''],
      ['Standard Users Can Edit:'],
      ['• Basic information (Title, Description, Process)'],
      ['• Implementation details (Timeline, Dependencies)'],
      ['• Technology arrays (AI/ML Tools, Data Sources)'],
      [''],
      ['Admin Users Can Edit:'],
      ['• Portfolio Status (Active/Reference)'],
      ['• Scoring overrides and manual adjustments'],
      ['• Library Source classification'],
      [''],
      ['SUPPORT CONTACT'],
      ['For technical issues or data validation questions:'],
      ['Contact: Hexaware AI Framework Support Team'],
      [''],
      ['VERSION CONTROL'],
      ['Framework Version: 2.0'],
      ['Schema Version: Compatible with database schema 109+ fields'],
      ['Last Updated: ' + format(new Date(), 'MMMM d, yyyy')]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Style the header
    if (ws['A1']) {
      ws['A1'].s = { 
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } }, 
        fill: { fgColor: { rgb: "005DAA" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Style section headers
    const sectionHeaders = [4, 8, 16, 26, 32, 56, 69, 79, 90, 96, 107, 115];
    sectionHeaders.forEach(row => {
      const cell = ws[XLSX.utils.encode_cell({r: row - 1, c: 0})];
      if (cell) {
        cell.s = { 
          font: { bold: true, sz: 12 }, 
          fill: { fgColor: { rgb: "E3F2FD" } }
        };
      }
    });
    
    // Set column widths
    ws['!cols'] = [{ width: 80 }];
    
    return ws;
  }

  /**
   * Create summary overview worksheet
   */
  private static createSummarySheet(summary: any): XLSX.WorkSheet {
    const data = [
      ['Hexaware AI Use Case Value Framework - Executive Summary'],
      ['Generated', format(new Date(), 'EEEE, MMMM d, yyyy \'at\' h:mm a')],
      [''],
      ['Portfolio Overview'],
      ['Total Use Cases', summary.totalUseCases],
      ['Strategic Use Cases', summary.strategicUseCases],
      ['AI Inventory Items', summary.aiInventoryItems],
      ['Active Portfolio', summary.activeUseCases],
      ['Reference Library', summary.referenceUseCases],
      [''],
      ['Performance Metrics'],
      ['Average Impact Score', summary.averageImpactScore.toFixed(2)],
      ['Average Effort Score', summary.averageEffortScore.toFixed(2)],
      [''],
      ['Export Details'],
      ['Organization', 'Hexaware'],
      ['Framework Version', '2.0'],
      ['Classification', 'Internal Use Only']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Style the header
    ws['A1'].s = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: "005DAA" } } };
    
    // Set column widths
    ws['!cols'] = [{ width: 25 }, { width: 20 }];
    
    return ws;
  }
  
  /**
   * LEGO: Field categorization system for export/import separation
   */
  private static getCalculatedFields(): string[] {
    return [
      'Final Impact Score',
      'Final Effort Score', 
      'Final Quadrant'
    ];
  }

  private static getSystemManagedFields(): string[] {
    return [
      'Use Case ID',
      'Meaningful ID',
      'Manual Override?',
      'Override Reason',
      'Last Status Update',
      'Created Date'
    ];
  }

  private static getUserEditableFields(): string[] {
    return [
      // Basic Information
      'Title', 'Description', 'Problem Statement',
      // Business Context
      'Lines of Business', 'Business Segments', 'Geographies', 'Use Case Type',
      'Processes (Multi-select)', 'Process Activities',
      // Scoring Levers (input only, not calculated results)
      'Revenue Impact (1-5)', 'Cost Savings (1-5)', 'Risk Reduction (1-5)',
      'Broker Partner Experience (1-5)', 'Strategic Fit (1-5)',
      'Data Readiness (1-5)', 'Technical Complexity (1-5)', 'Change Impact (1-5)',
      'Model Risk (1-5)', 'Adoption Readiness (1-5)', 'Regulatory Compliance (1-5)',
      // Implementation & Governance
      'Primary Business Owner', 'Key Dependencies', 'Implementation Timeline',
      'Success Metrics', 'Estimated Value', 'Value Measurement Approach',
      'AI/ML Technologies', 'Data Sources', 'Stakeholder Groups',
      'Horizontal Use Case', 'Horizontal Use Case Types', 'Integration Requirements',
      // RSA Ethical Principles
      'Explainability Required', 'Customer Harm Risk', 'Cross-Border Data Transfer',
      'Third Party Model', 'Human Accountability',
      // AI Inventory Specific
      'Business Function', 'AI Inventory Status', 'Deployment Status', 'AI or Model',
      'Risk to Customers', 'Risk to Organization', 'Data Used', 'Model Owner',
      'Policy Governance', 'Validation Responsibility', 'Informed By',
      'Third Party Provided Model',
      // Portfolio Management
      'Use Case Status', 'Portfolio Status', 'Dashboard Visible', 'Library Source',
      'Activation Reason', 'Deactivation Reason',
      // Presentation
      'Presentation File Name', 'Has Presentation'
    ];
  }

  private static categorizeField(fieldName: string): 'calculated' | 'system' | 'user_editable' | 'unknown' {
    if (this.getCalculatedFields().includes(fieldName)) return 'calculated';
    if (this.getSystemManagedFields().includes(fieldName)) return 'system';
    if (this.getUserEditableFields().includes(fieldName)) return 'user_editable';
    return 'unknown';
  }

  /**
   * LEGO: Common field mappers for reuse across both strategic and AI inventory exports
   */
  private static mapBasicFields(useCase: any, rawUseCase: any): any[] {
    return [
      rawUseCase.meaningfulId || rawUseCase.id,
      useCase.basicInfo.title,
      useCase.basicInfo.description,
      useCase.basicInfo.problemStatement || ''
    ];
  }

  private static mapMultiSelectArray(array: any[], fallback: string = ''): string {
    return Array.isArray(array) && array.length > 0 ? array.join('; ') : fallback;
  }

  private static mapBusinessContextFields(useCase: any, rawUseCase: any): any[] {
    return [
      // Removed process field from here to eliminate duplication with mapProcessFields
      this.mapMultiSelectArray(useCase.multiSelectData.linesOfBusiness, useCase.basicInfo.lineOfBusiness || ''),
      this.mapMultiSelectArray(useCase.multiSelectData.businessSegments, useCase.basicInfo.businessSegment || ''),
      this.mapMultiSelectArray(useCase.multiSelectData.geographies, useCase.basicInfo.geography || ''),
      useCase.basicInfo.useCaseType || ''
    ];
  }

  private static mapImplementationFields(useCase: any): any[] {
    return [
      useCase.implementation.useCaseStatus || '',
      useCase.implementation.primaryBusinessOwner || '',
      useCase.implementation.keyDependencies || '',
      useCase.implementation.implementationTimeline || '',
      useCase.implementation.successMetrics || '',
      useCase.implementation.estimatedValue || '',
      useCase.implementation.valueMeasurementApproach || ''
    ];
  }


  private static mapTechnicalFields(useCase: any, rawUseCase: any): any[] {
    return [
      this.mapMultiSelectArray(useCase.multiSelectData.aiMlTechnologies),
      this.mapMultiSelectArray(useCase.multiSelectData.dataSources),
      this.mapMultiSelectArray(useCase.multiSelectData.stakeholderGroups),
      rawUseCase.horizontalUseCase === 'true' ? 'Yes' : 'No',
      this.mapMultiSelectArray(rawUseCase.horizontalUseCaseTypes)
    ];
  }

  private static mapProcessFields(useCase: any, rawUseCase: any): any[] {
    return [
      this.mapMultiSelectArray(useCase.multiSelectData.processes, useCase.basicInfo.process || ''),
      this.mapMultiSelectArray(useCase.multiSelectData.activities)
    ];
  }

  private static mapEthicalPrinciplesFields(useCase: any): any[] {
    return [
      useCase.aiInventory.explainabilityRequired || '',
      useCase.aiInventory.customerHarmRisk || '',
      useCase.aiInventory.dataOutsideUkEu || '',
      useCase.aiInventory.thirdPartyModel || '',
      useCase.aiInventory.humanAccountability || '',
      useCase.aiInventory.regulatoryCompliance || ''
    ];
  }

  /**
   * LEGO: Import-specific field mappers that exclude calculated and system fields
   */
  private static getStrategicImportHeaders(): string[] {
    const allHeaders = [
      // Basic fields (excluding system-generated IDs)
      'Title', 'Description', 'Problem Statement',
      // Business context fields  
      'Lines of Business', 'Business Segments', 'Geographies', 'Use Case Type',
      // Implementation and portfolio fields (user-editable only)
      'Use Case Status', 'Portfolio Status', 'Dashboard Visible', 'Library Source',
      // Scoring levers (inputs only - NOT calculated results)
      'Revenue Impact (1-5)', 'Cost Savings (1-5)', 'Risk Reduction (1-5)',
      'Broker Partner Experience (1-5)', 'Strategic Fit (1-5)',
      'Data Readiness (1-5)', 'Technical Complexity (1-5)', 'Change Impact (1-5)',
      'Model Risk (1-5)', 'Adoption Readiness (1-5)',
      // Implementation details
      'Primary Business Owner', 'Key Dependencies', 'Implementation Timeline',
      'Success Metrics', 'Estimated Value', 'Value Measurement Approach',
      // Technical fields
      'AI/ML Technologies', 'Data Sources', 'Stakeholder Groups',
      'Horizontal Use Case', 'Horizontal Use Case Types', 'Integration Requirements',
      // RSA Ethical Principles
      'Explainability Required', 'Customer Harm Risk', 'Cross-Border Data Transfer',
      'Third Party Model', 'Human Accountability', 'Regulatory Compliance (1-5)',
      // Strategic-specific fields (excluding manual override system fields)
      'Activation Reason',
      // Process details
      'Processes (Multi-select)', 'Process Activities',
      // Presentation fields
      'Presentation File Name', 'Has Presentation', 'Deactivation Reason'
    ];
    return allHeaders;
  }

  private static getAiInventoryImportHeaders(): string[] {
    const allHeaders = [
      // Basic fields (excluding system-generated IDs)
      'Title', 'Description', 'Problem Statement',
      // Business context fields
      'Lines of Business', 'Business Segments', 'Geographies', 'Use Case Type',
      // Implementation fields
      'Use Case Status', 'Primary Business Owner', 'Key Dependencies',
      'Implementation Timeline', 'Success Metrics', 'Estimated Value',
      'Value Measurement Approach',
      // Technical fields
      'AI/ML Technologies', 'Data Sources', 'Stakeholder Groups',
      'Horizontal Use Case', 'Horizontal Use Case Types', 'Integration Requirements',
      // Process details
      'Processes (Multi-select)', 'Process Activities',
      // AI Inventory specific fields
      'Business Function', 'AI Inventory Status', 'Deployment Status', 'AI or Model',
      'Risk to Customers', 'Risk to Organization', 'Data Used', 'Model Owner',
      'Policy Governance', 'Validation Responsibility', 'Informed By',
      'Third Party Provided Model',
      // RSA Ethical Principles
      'Explainability Required', 'Customer Harm Risk', 'Cross-Border Data Transfer',
      'Third Party Model', 'Human Accountability', 'Regulatory Compliance (1-5)',
      // Portfolio fields
      'Portfolio Status', 'Library Source', 'Has Presentation'
    ];
    return allHeaders;
  }

  private static mapPortfolioFields(useCase: any): any[] {
    return [
      useCase.portfolioStatus.isActiveForRsa ? 'Active Portfolio' : 'Reference Library',
      useCase.portfolioStatus.librarySource
    ];
  }

  private static applyExcelStyling(ws: XLSX.WorkSheet, headers: string[]): void {
    // Style headers
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = { 
          font: { bold: true }, 
          fill: { fgColor: { rgb: "E3F2FD" } },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }
    // Auto-fit columns
    ws['!cols'] = headers.map(() => ({ width: 20 }));
  }

  /**
   * Create strategic use cases worksheet
   */
  private static createStrategicUseCasesSheet(useCases: any[]): XLSX.WorkSheet {
    const headers = [
      // Basic fields (4)
      'Use Case ID',
      'Title',
      'Description',
      'Problem Statement',
      // Business context fields (4) - removed Process to eliminate duplication with Processes below
      'Lines of Business',
      'Business Segments', 
      'Geographies',
      'Use Case Type',
      // Implementation and portfolio fields (4)
      'Use Case Status',
      'Portfolio Status',
      'Dashboard Visible',
      'Library Source',
      // Strategic scoring fields (13)
      'Final Impact Score',
      'Final Effort Score',
      'Final Quadrant',
      'Revenue Impact (1-5)',
      'Cost Savings (1-5)',
      'Risk Reduction (1-5)',
      'Broker Partner Experience (1-5)',
      'Strategic Fit (1-5)',
      'Data Readiness (1-5)',
      'Technical Complexity (1-5)',
      'Change Impact (1-5)',
      'Model Risk (1-5)',
      'Adoption Readiness (1-5)',
      // Implementation details (6)
      'Primary Business Owner',
      'Key Dependencies',
      'Implementation Timeline',
      'Success Metrics',
      'Estimated Value',
      'Value Measurement Approach',
      // Technical fields (5)
      'AI/ML Technologies',
      'Data Sources',
      'Stakeholder Groups',
      'Horizontal Use Case',
      'Horizontal Use Case Types',
      // Integration and workflow
      'Integration Requirements',
      // RSA Ethical Principles (6)
      'Explainability Required',
      'Customer Harm Risk',
      'Cross-Border Data Transfer',
      'Third Party Model',
      'Human Accountability',
      'Regulatory Compliance (1-5)',
      // Strategic-specific fields (3)
      'Manual Override?',
      'Override Reason',
      'Activation Reason',
      // Process details (2) - clear naming to show multi-select nature
      'Processes (Multi-select)',
      'Process Activities',
      // Presentation and metadata (4)
      'Presentation File Name',
      'Has Presentation',
      'Meaningful ID',
      'Deactivation Reason'
    ];
    
    const rows = useCases.map(rawUseCase => {
      const useCase = UseCaseDataExtractor.extractCompleteData(rawUseCase);
      
      
      return [
        // Basic fields (LEGO reused) - ID, Title, Description, Problem Statement
        ...this.mapBasicFields(useCase, rawUseCase),
        // Business context fields (LEGO reused) - Lines of Business, Business Segments, Geographies, Use Case Type
        ...this.mapBusinessContextFields(useCase, rawUseCase),
        // Implementation status and portfolio fields  
        useCase.implementation.useCaseStatus || '',
        useCase.portfolioStatus.isActiveForRsa ? 'Active Portfolio' : 'Reference Library',
        useCase.portfolioStatus.isDashboardVisible ? 'Yes' : 'No',
        useCase.portfolioStatus.librarySource,
        
        // Strategic scoring fields (unique to strategic)
        useCase.display.hasScoring ? useCase.scoring.finalImpactScore : '',
        useCase.display.hasScoring ? useCase.scoring.finalEffortScore : '',
        useCase.display.hasScoring ? useCase.scoring.finalQuadrant : '',
        useCase.display.hasScoring ? useCase.businessValue.revenueImpact : '',
        useCase.display.hasScoring ? useCase.businessValue.costSavings : '',
        useCase.display.hasScoring ? useCase.businessValue.riskReduction : '',
        useCase.display.hasScoring ? useCase.businessValue.brokerPartnerExperience : '',
        useCase.display.hasScoring ? useCase.businessValue.strategicFit : '',
        useCase.display.hasScoring ? useCase.feasibility.dataReadiness : '',
        useCase.display.hasScoring ? useCase.feasibility.technicalComplexity : '',
        useCase.display.hasScoring ? useCase.feasibility.changeImpact : '',
        useCase.display.hasScoring ? useCase.feasibility.modelRisk : '',
        useCase.display.hasScoring ? useCase.feasibility.adoptionReadiness : '',
        
        // Implementation details (6 fields)
        useCase.implementation.primaryBusinessOwner || '',
        useCase.implementation.keyDependencies || '',
        useCase.implementation.implementationTimeline || '',
        useCase.implementation.successMetrics || '',
        useCase.implementation.estimatedValue || '',
        useCase.implementation.valueMeasurementApproach || '',
        
        // Technical fields (5 fields)
        ...this.mapTechnicalFields(useCase, rawUseCase),
        
        // Integration Requirements (1 field)
        useCase.implementation.integrationRequirements || '',
        
        // RSA Ethical Principles (6 fields)
        ...this.mapEthicalPrinciplesFields(useCase),
        
        // Strategic-specific override fields (3 fields)
        useCase.display.hasScoring && useCase.scoring.manualImpactScore ? 'Yes' : '',
        useCase.display.hasScoring ? (useCase.scoring.overrideReason || '') : '',
        useCase.portfolioStatus.activationReason || '',
        
        // Process details (2 fields) - multi-select arrays for processes and activities
        this.mapMultiSelectArray(useCase.multiSelectData.processes, useCase.basicInfo.process || ''),
        this.mapMultiSelectArray(useCase.multiSelectData.activities),
        
        // Presentation fields
        rawUseCase.presentationFileName || '',
        rawUseCase.hasPresentation === 'true' ? 'Yes' : 'No',
        rawUseCase.meaningfulId || '',
        useCase.portfolioStatus.deactivationReason || ''
      ];
    });
    
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply common LEGO styling
    this.applyExcelStyling(ws, headers);
    
    return ws;
  }
  
  /**
   * Create AI inventory worksheet
   */
  private static createAiInventorySheet(useCases: any[]): XLSX.WorkSheet {
    const headers = [
      // Basic fields (4)
      'Use Case ID',
      'Title',
      'Description',
      'Problem Statement',
      // Business context fields (4) - removed Process to eliminate duplication
      'Lines of Business',
      'Business Segments',
      'Geographies',
      'Use Case Type',
      // Implementation fields (7)
      'Use Case Status',
      'Primary Business Owner',
      'Key Dependencies',
      'Implementation Timeline',
      'Success Metrics',
      'Estimated Value',
      'Value Measurement Approach',
      // Technical fields (5)
      'AI/ML Technologies',
      'Data Sources',
      'Stakeholder Groups',
      'Horizontal Use Case',
      'Horizontal Use Case Types',
      // Integration Requirements (1)
      'Integration Requirements',
      // Process details (2) - clear naming to show multi-select nature
      'Processes (Multi-select)',
      'Process Activities',
      // AI Inventory specific fields (11)
      'Business Function',
      'AI Inventory Status',
      'Deployment Status',
      'AI or Model',
      'Risk to Customers',
      'Risk to Organization',
      'Data Used',
      'Model Owner',
      'Policy Governance',
      'Validation Responsibility',
      'Informed By',
      'Third Party Provided Model',
      'Explainability Required',
      'Customer Harm Risk',
      'Cross-Border Data Transfer',
      'Third Party Model',
      'Human Accountability',
      'Regulatory Compliance (1-5)',
      'Portfolio Status',
      'Library Source',
      'Has Presentation',
      'Last Status Update',
      'Created Date'
    ];
    
    const rows = useCases.map(rawUseCase => {
      const useCase = UseCaseDataExtractor.extractCompleteData(rawUseCase);
      
      
      return [
        // Basic fields (LEGO reused)
        ...this.mapBasicFields(useCase, rawUseCase),
        
        // Business context (LEGO reused)
        ...this.mapBusinessContextFields(useCase, rawUseCase),
        
        // Implementation fields (LEGO reused)
        ...this.mapImplementationFields(useCase),
        
        // Technical fields (LEGO reused)
        ...this.mapTechnicalFields(useCase, rawUseCase),
        
        // Integration Requirements (moved here to match header order)
        useCase.implementation.integrationRequirements || '',
        
        // Process fields (LEGO reused) - CRITICAL for AI Inventory multi-select arrays
        ...this.mapProcessFields(useCase, rawUseCase),
        
        // AI Inventory specific fields
        useCase.aiInventory.businessFunction || '',
        useCase.aiInventory.aiInventoryStatus || '',
        useCase.aiInventory.deploymentStatus || '',
        useCase.aiInventory.aiOrModel || '',
        useCase.aiInventory.riskToCustomers || '',
        useCase.aiInventory.riskToRsa || '',
        useCase.aiInventory.dataUsed || '',
        useCase.aiInventory.modelOwner || '',
        useCase.aiInventory.rsaPolicyGovernance || '',
        useCase.aiInventory.validationResponsibility || '',
        useCase.aiInventory.informedBy || '',
        useCase.aiInventory.thirdPartyProvidedModel || '',
        
        // RSA Ethical Principles (LEGO reused)
        ...this.mapEthicalPrinciplesFields(useCase),
        
        // Portfolio fields (LEGO reused)
        ...this.mapPortfolioFields(useCase),
        
        // Presentation and dates
        rawUseCase.hasPresentation === 'true' ? 'Yes' : 'No',
        useCase.aiInventory.lastStatusUpdate ? format(useCase.aiInventory.lastStatusUpdate, 'yyyy-MM-dd') : '',
        useCase.basicInfo.createdAt ? format(useCase.basicInfo.createdAt, 'yyyy-MM-dd') : ''
      ];
    });
    
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply common LEGO styling
    this.applyExcelStyling(ws, headers);
    
    return ws;
  }
  
  /**
   * Create raw data worksheet with all fields
   */
  private static createRawDataSheet(useCases: any[]): XLSX.WorkSheet {
    if (useCases.length === 0) {
      return XLSX.utils.aoa_to_sheet([['No data available']]);
    }
    
    // Get all field names from the first use case
    const firstUseCase = useCases[0];
    const headers = Object.keys(firstUseCase).filter(key => key !== 'id');
    
    // Reorder headers to put meaningful ID first if it exists
    if (headers.includes('meaningfulId')) {
      const meaningfulIdIndex = headers.indexOf('meaningfulId');
      headers.splice(meaningfulIdIndex, 1);
      headers.unshift('meaningfulId');
    }
    
    const rows = useCases.map(useCase => {
      return headers.map(header => {
        const value = useCase[header];
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        } else if (Array.isArray(value)) {
          return value.join(', ');
        } else if (typeof value === 'object' && value instanceof Date) {
          return format(value, 'yyyy-MM-dd HH:mm:ss');
        } else if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        } else {
          return String(value);
        }
      });
    });
    
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Style headers
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = { 
          font: { bold: true }, 
          fill: { fgColor: { rgb: "F5F5F5" } }
        };
      }
    }
    
    return ws;
  }
  
  /**
   * Generate active portfolio Excel export
   */
  static async generateActivePortfolioExcel(res: Response): Promise<void> {
    return this.generateUseCaseLibraryExcel(res, { status: 'active' });
  }
  
  /**
   * Generate individual use case Excel export
   */
  static async generateIndividualUseCaseExcel(useCaseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating individual use case Excel for:', useCaseId);
      
      // Fetch specific use case
      const [useCase] = await db
        .select()
        .from(useCases)
        .where(eq(useCases.id, useCaseId));

      if (!useCase) {
        res.status(404).json({ error: 'Use case not found' });
        return;
      }
      
      // Extract structured data
      const extractedData = UseCaseDataExtractor.extractCompleteData(useCase);
      
      // Create workbook with detailed breakdown
      const workbook = XLSX.utils.book_new();
      
      // Main details sheet
      const detailsData = [
        ['RSA Use Case Analysis'],
        [''],
        ['Basic Information'],
        ['Title', extractedData.basicInfo.title],
        ['Description', extractedData.basicInfo.description],
        ['Problem Statement', extractedData.basicInfo.problemStatement || ''],
        ['Processes', this.mapMultiSelectArray(extractedData.multiSelectData.processes, extractedData.basicInfo.process || '')],
        ['Line of Business', extractedData.basicInfo.lineOfBusiness],
        ['Business Segment', extractedData.basicInfo.businessSegment],
        ['Geography', extractedData.basicInfo.geography],
        ['Use Case Type', extractedData.basicInfo.useCaseType],
        [''],
        ['Portfolio Status'],
        ['Active for RSA', extractedData.portfolioStatus.isActiveForRsa ? 'Yes' : 'No'],
        ['Dashboard Visible', extractedData.portfolioStatus.isDashboardVisible ? 'Yes' : 'No'],
        ['Library Source', extractedData.portfolioStatus.librarySource],
        ['Activation Reason', extractedData.portfolioStatus.activationReason || ''],
        ['']
      ];
      
      // Add scoring section if it's a strategic use case
      if (extractedData.display.hasScoring) {
        detailsData.push(
          ['Scoring'],
          ['Final Impact Score', extractedData.scoring.finalImpactScore.toString()],
          ['Final Effort Score', extractedData.scoring.finalEffortScore.toString()],
          ['Final Quadrant', extractedData.scoring.finalQuadrant],
          ['Manual Override', extractedData.scoring.manualImpactScore ? 'Yes' : 'No'],
          ['Override Reason', extractedData.scoring.overrideReason || ''],
          [''],
          ['Business Impact Scores (1-5)'],
          ['Revenue Impact', extractedData.businessValue.revenueImpact.toString()],
          ['Cost Savings', extractedData.businessValue.costSavings.toString()],
          ['Risk Reduction', extractedData.businessValue.riskReduction.toString()],
          ['Broker Partner Experience', extractedData.businessValue.brokerPartnerExperience.toString()],
          ['Strategic Fit', extractedData.businessValue.strategicFit.toString()],
          [''],
          ['Implementation Effort Scores (1-5)'],
          ['Data Readiness', extractedData.feasibility.dataReadiness.toString()],
          ['Technical Complexity', extractedData.feasibility.technicalComplexity.toString()],
          ['Change Impact', extractedData.feasibility.changeImpact.toString()],
          ['Model Risk', extractedData.feasibility.modelRisk.toString()],
          ['Adoption Readiness', extractedData.feasibility.adoptionReadiness.toString()],
          ['']
        );
      } else {
        // Add AI inventory governance details
        detailsData.push(
          ['AI Inventory Governance'],
          ['Business Function', extractedData.aiInventory.businessFunction || ''],
          ['AI Inventory Status', extractedData.aiInventory.aiInventoryStatus || ''],
          ['Deployment Status', extractedData.aiInventory.deploymentStatus || ''],
          ['Risk to Customers', extractedData.aiInventory.riskToCustomers || ''],
          ['Risk to Organization', extractedData.aiInventory.riskToRsa || ''],
          ['Data Used', extractedData.aiInventory.dataUsed || ''],
          ['Model Owner', extractedData.aiInventory.modelOwner || ''],
          ['Informed By', extractedData.aiInventory.informedBy || ''],
          ['']
        );
      }
      
      // Add implementation details
      detailsData.push(
        ['Implementation & Governance'],
        ['Primary Business Owner', extractedData.implementation.primaryBusinessOwner || ''],
        ['Use Case Status', extractedData.implementation.useCaseStatus || ''],
        ['Implementation Timeline', extractedData.implementation.implementationTimeline || ''],
        ['Success Metrics', extractedData.implementation.successMetrics || ''],
        ['Estimated Value', extractedData.implementation.estimatedValue || ''],
        ['Integration Requirements', extractedData.implementation.integrationRequirements || ''],
        ['AI/ML Technologies', extractedData.multiSelectData.aiMlTechnologies.join(', ')],
        ['Data Sources', extractedData.multiSelectData.dataSources.join(', ')],
        ['Stakeholder Groups', extractedData.multiSelectData.stakeholderGroups.join(', ')]
      );
      
      const ws = XLSX.utils.aoa_to_sheet(detailsData);
      ws['!cols'] = [{ width: 25 }, { width: 60 }];
      
      XLSX.utils.book_append_sheet(workbook, ws, 'Use Case Details');
      
      // Generate and send Excel
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const filename = `Hexaware_UseCase_${extractedData.basicInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      console.log('Individual use case Excel generated successfully');
      
    } catch (error) {
      console.error('Failed to generate individual use case Excel:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate individual use case Excel' });
      }
    }
  }
}