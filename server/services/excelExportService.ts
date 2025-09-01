import XLSX from 'xlsx';
import { db } from '../db';
import { useCases } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { format } from 'date-fns';
import { UseCaseDataExtractor } from './useCaseDataExtractor';

export class ExcelExportService {
  
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
      
      // Create new workbook
      const workbook = XLSX.utils.book_new();
      
      // WORKSHEET 1: Import Guide (Help for users)
      const importGuideSheet = await this.createImportGuideSheet();
      XLSX.utils.book_append_sheet(workbook, importGuideSheet, 'Import Guide');
      
      // WORKSHEET 2: Summary Overview
      const summaryData = UseCaseDataExtractor.getSummaryStats(allUseCases);
      const summarySheet = this.createSummarySheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // WORKSHEET 3: Strategic Use Cases (scored)
      const strategicUseCases = allUseCases.filter(uc => uc.librarySource !== 'ai_inventory');
      if (strategicUseCases.length > 0) {
        const strategicSheet = this.createStrategicUseCasesSheet(strategicUseCases);
        XLSX.utils.book_append_sheet(workbook, strategicSheet, 'Strategic Use Cases');
      }
      
      // WORKSHEET 4: AI Inventory (governance)
      const aiInventoryItems = allUseCases.filter(uc => uc.librarySource === 'ai_inventory');
      if (aiInventoryItems.length > 0) {
        const aiInventorySheet = this.createAiInventorySheet(aiInventoryItems);
        XLSX.utils.book_append_sheet(workbook, aiInventorySheet, 'AI Inventory');
      }
      
      // WORKSHEET 5: Complete Raw Data
      const rawDataSheet = this.createRawDataSheet(allUseCases);
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');
      
      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set response headers
      const filename = `RSA_Use_Cases_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      // Send the buffer
      res.send(buffer);
      console.log('Excel export generated successfully');
      
    } catch (error) {
      console.error('Failed to generate Excel export:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate Excel export' });
      }
    }
  }
  
  /**
   * Create import guide worksheet with comprehensive help
   */
  private static async createImportGuideSheet(): Promise<XLSX.WorkSheet> {
    // Import storage to get current metadata
    const { storage } = await import('../storage');
    const metadata = await storage.getMetadataConfig();
    const data = [
      ['RSA AI Use Case Framework - Import Guide'],
      ['Last Updated: ' + format(new Date(), 'MMMM d, yyyy')],
      [''],
      ['OVERVIEW'],
      ['This guide helps you prepare Excel data for import into the RSA AI Use Case Framework.'],
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
      ['✗ Don\'t leave required fields empty (Title, Description, Process)'],
      ['✗ Don\'t use commas in array fields (use semicolons instead)'],
      ['✗ Don\'t change Portfolio Status without proper authority'],
      [''],
      ['FIELD TYPES & EXAMPLES'],
      [''],
      ['TEXT FIELDS (most common)'],
      ['Examples: "Claims automation using AI", "Reduce manual processing time"'],
      ['Required: Title, Description, Process'],
      [''],
      ['NUMERIC SCORES (1-5 scale)'],
      ['Examples: 3, 5, 1 (not "High", "Medium", "Low")'],
      ['Used for: All business impact and implementation effort scores'],
      [''],
      ['BOOLEAN FIELDS (true/false)'],
      ['Examples: true, false (not "Yes", "No", "Y", "N")'],
      ['Used for: Explainability Required, Data Outside UK/EU, etc.'],
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
      ['Use Case Type: ' + (metadata?.useCaseTypes?.join(', ') || 'Business Process, Customer Experience, Risk Management, Data & Analytics')],
      [''],
      ['Library Source: ' + (metadata?.sourceTypes?.join(', ') || 'rsa_internal, industry_standard, ai_inventory')],
      [''],
      ['Portfolio Status: Active Portfolio, Reference Library'],
      [''],
      ['AI Inventory Status: ' + (metadata?.useCaseStatuses?.join(', ') || 'Active, Proof_of_Concept, Pending_Closure, Obsolete, Inactive')],
      [''],
      ['Deployment Status: PoC, Pilot, Production, Decommissioned'],
      [''],
      ['Use Case Status: ' + (metadata?.useCaseStatuses?.join(', ') || 'Discovery, Backlog, In-flight, Implemented, On Hold')],
      [''],
      ['Lines of Business: ' + (metadata?.linesOfBusiness?.join(', ') || 'Personal Lines, Commercial Lines, International, London Market, etc.')],
      [''],
      ['Business Segments: ' + (metadata?.businessSegments?.join(', ') || 'Motor, Property, Liability, Marine, Aviation, etc.')],
      [''],
      ['Geographies: ' + (metadata?.geographies?.join(', ') || 'UK, Europe, North America, Asia Pacific, Global')],
      [''],
      ['Processes: ' + (metadata?.processes?.join(', ') || 'FNOL, Quote & Bind, Pricing, Renewal, Subrogation')],
      [''],
      ['AI/ML Technologies: ' + (metadata?.aiMlTechnologies?.join(', ') || 'Machine Learning, Deep Learning, Natural Language Processing, Computer Vision')],
      [''],
      ['Data Sources: ' + (metadata?.dataSources?.join(', ') || 'Policy Database, Claims Database, Customer Database, External APIs')],
      [''],
      ['Stakeholder Groups: ' + (metadata?.stakeholderGroups?.join(', ') || 'Underwriting Teams, Claims Teams, IT/Technology, Business Analytics')],
      [''],
      ['Horizontal Use Case Types: ' + (metadata?.horizontalUseCaseTypes?.join(', ') || 'Document drafting, report generation, Categorization, tagging, curation, Research assistant, information retrieval, Autofill, next-best action suggestions, autonomous agents, Debugging, refactoring, coding, Synthesis, summarization, Augmentation, visualization, Text versions for analysis, time series data generation, scenario generation, Suggestions for workflow amendments, automated changes to workflows, Errors, fraud, problem-solving')],
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
      ['Solution: Ensure Title, Description, Process are not empty'],
      [''],
      ['Error: "Invalid array format"'],
      ['Solution: Use semicolons (;) to separate multiple values'],
      [''],
      ['Error: "Date format invalid"'],
      ['Solution: Use YYYY-MM-DD format (2025-01-15)'],
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
      ['Contact: RSA AI Framework Support Team'],
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
      ['RSA AI Use Case Value Framework - Executive Summary'],
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
      ['Organization', 'RSA Insurance'],
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
    return Array.isArray(array) ? array.join('; ') : fallback;
  }

  private static mapBusinessContextFields(useCase: any, rawUseCase: any): any[] {
    return [
      useCase.basicInfo.process || '',
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
      useCase.implementation.valueMeasurementApproach || '',
      useCase.implementation.integrationRequirements || ''
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
      'Use Case ID',
      'Title',
      'Description',
      'Problem Statement',
      'Process',
      'Use Case Type',
      'Use Case Status',
      'Portfolio Status',
      'Dashboard Visible',
      'Library Source',
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
      'Primary Business Owner',
      'Key Dependencies',
      'Implementation Timeline',
      'Success Metrics',
      'Estimated Value',
      'Value Measurement Approach',
      'Integration Requirements',
      'AI/ML Technologies',
      'Data Sources',
      'Stakeholder Groups',
      'Horizontal Use Case',
      'Horizontal Use Case Types',
      'Explainability Required',
      'Customer Harm Risk',
      'Data Outside UK/EU',
      'Third Party Model',
      'Human Accountability',
      'Regulatory Compliance (1-5)',
      'Manual Override?',
      'Override Reason',
      'Activation Reason',
      'Lines of Business',
      'Business Segments', 
      'Geographies',
      'Processes',
      'Process Activities',
      'Presentation File Name',
      'Has Presentation',
      'Meaningful ID',
      'Deactivation Reason'
    ];
    
    const rows = useCases.map(rawUseCase => {
      const useCase = UseCaseDataExtractor.extractCompleteData(rawUseCase);
      
      return [
        // Basic fields (LEGO reused)
        ...this.mapBasicFields(useCase, rawUseCase),
        useCase.basicInfo.process,
        useCase.basicInfo.useCaseType,
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
        
        // Implementation fields (LEGO reused)
        ...this.mapImplementationFields(useCase),
        
        // Technical fields (LEGO reused)
        ...this.mapTechnicalFields(useCase, rawUseCase),
        
        // RSA Ethical Principles (LEGO reused)
        ...this.mapEthicalPrinciplesFields(useCase),
        
        // Strategic-specific override fields
        useCase.display.hasScoring && useCase.scoring.manualImpactScore ? 'Yes' : '',
        useCase.display.hasScoring ? (useCase.scoring.overrideReason || '') : '',
        useCase.portfolioStatus.activationReason || '',
        
        // Business context arrays (LEGO reused)
        this.mapMultiSelectArray(useCase.multiSelectData.linesOfBusiness, useCase.basicInfo.lineOfBusiness || ''),
        this.mapMultiSelectArray(useCase.multiSelectData.businessSegments, useCase.basicInfo.businessSegment || ''),
        this.mapMultiSelectArray(useCase.multiSelectData.geographies, useCase.basicInfo.geography || ''),
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
      'Use Case ID',
      'Title',
      'Description',
      'Problem Statement',
      'Process',
      'Lines of Business',
      'Business Segments',
      'Geographies',
      'Use Case Type',
      'Use Case Status',
      'Primary Business Owner',
      'Key Dependencies',
      'Implementation Timeline',
      'Success Metrics',
      'Estimated Value',
      'Value Measurement Approach',
      'Integration Requirements',
      'AI/ML Technologies',
      'Data Sources',
      'Stakeholder Groups',
      'Horizontal Use Case',
      'Horizontal Use Case Types',
      'Business Function',
      'AI Inventory Status',
      'Deployment Status',
      'AI or Model',
      'Risk to Customers',
      'Risk to RSA',
      'Data Used',
      'Model Owner',
      'RSA Policy Governance',
      'Validation Responsibility',
      'Informed By',
      'Third Party Provided Model',
      'Explainability Required',
      'Customer Harm Risk',
      'Data Outside UK/EU',
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
        ['Process', extractedData.basicInfo.process],
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
          ['Risk to RSA', extractedData.aiInventory.riskToRsa || ''],
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
      const filename = `RSA_UseCase_${extractedData.basicInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
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