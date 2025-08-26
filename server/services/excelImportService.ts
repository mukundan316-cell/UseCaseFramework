import * as XLSX from 'xlsx';
import { storage } from '../storage';
import { insertUseCaseSchema, type InsertUseCase } from '../../shared/schema';
import { z } from 'zod';

interface ImportResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  errors: string[];
  summary: {
    strategic: number;
    aiInventory: number;
    industry: number;
  };
}

interface ImportOptions {
  mode: 'append' | 'replace' | 'replace_ai_inventory';
  validateOnly?: boolean;
}

export class ExcelImportService {
  
  /**
   * Import use cases from Excel file using the same format as export
   */
  static async importUseCasesFromExcel(
    fileBuffer: Buffer, 
    options: ImportOptions = { mode: 'append' }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      errors: [],
      summary: { strategic: 0, aiInventory: 0, industry: 0 }
    };

    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      
      // Process different worksheets
      const strategicData = this.parseStrategicUseCasesSheet(workbook);
      const aiInventoryData = this.parseAIInventorySheet(workbook);
      const rawData = this.parseRawDataSheet(workbook);

      // Combine all data, prioritizing specific sheets over raw data
      const allUseCases = [
        ...strategicData,
        ...aiInventoryData,
        ...rawData.filter(item => 
          !strategicData.some(s => s.title === item.title) &&
          !aiInventoryData.some(a => a.title === item.title)
        )
      ];


      // Validate data
      const validatedUseCases = await this.validateUseCases(allUseCases, result);

      if (options.validateOnly) {
        // Track use case types in validation-only mode
        for (const useCaseData of allUseCases) {
          this.trackUseCaseType(useCaseData, result.summary);
        }
        result.success = true;
        return result;
      }

      // Handle replace modes
      if (options.mode === 'replace') {
        await this.clearExistingUseCases();
      } else if (options.mode === 'replace_ai_inventory') {
        await this.clearExistingAIInventoryUseCases();
      }

      // Import use cases
      for (const useCaseData of validatedUseCases) {
        try {
          // For replace modes, don't check for existing since we just cleared everything
          let existingUseCase = null;
          if (options.mode === 'append') {
            const allUseCases = await storage.getAllUseCases();
            existingUseCase = allUseCases.find(uc => uc.title === useCaseData.title);
          }
          
          if (existingUseCase && options.mode === 'append') {
            // Update existing - ensure proper types for scoring fields
            const updateData = {
              ...useCaseData,
              // Convert null scoring values to undefined for database compatibility
              revenueImpact: useCaseData.revenueImpact ?? undefined,
              costSavings: useCaseData.costSavings ?? undefined,
              riskReduction: useCaseData.riskReduction ?? undefined,
              brokerPartnerExperience: useCaseData.brokerPartnerExperience ?? undefined,
              strategicFit: useCaseData.strategicFit ?? undefined,
              dataReadiness: useCaseData.dataReadiness ?? undefined,
              technicalComplexity: useCaseData.technicalComplexity ?? undefined,
              changeImpact: useCaseData.changeImpact ?? undefined,
              modelRisk: useCaseData.modelRisk ?? undefined,
              adoptionReadiness: useCaseData.adoptionReadiness ?? undefined,
              finalImpactScore: useCaseData.finalImpactScore ?? undefined,
              finalEffortScore: useCaseData.finalEffortScore ?? undefined,
              finalQuadrant: useCaseData.finalQuadrant ?? undefined,
            };
            await storage.updateUseCase(existingUseCase.id, updateData);
            result.updatedCount++;
          } else {
            // Create new - add required scoring fields for new use cases
            const useCaseWithScoring = {
              ...useCaseData,
              impactScore: useCaseData.finalImpactScore || 0,
              effortScore: useCaseData.finalEffortScore || 0,
              quadrant: useCaseData.finalQuadrant || 'Low Impact, High Effort',
              // Ensure scoring fields have default values if null
              revenueImpact: useCaseData.revenueImpact || 0,
              costSavings: useCaseData.costSavings || 0,
              riskReduction: useCaseData.riskReduction || 0,
              brokerPartnerExperience: useCaseData.brokerPartnerExperience || 0,
              strategicFit: useCaseData.strategicFit || 0,
              dataReadiness: useCaseData.dataReadiness || 0,
              technicalComplexity: useCaseData.technicalComplexity || 0,
              changeImpact: useCaseData.changeImpact || 0,
              modelRisk: useCaseData.modelRisk || 0,
              adoptionReadiness: useCaseData.adoptionReadiness || 0
            };
            await storage.createUseCase(useCaseWithScoring);
            result.importedCount++;
          }

          // Track by type
          this.trackUseCaseType(useCaseData, result.summary);

        } catch (error) {
          result.errors.push(`Failed to import "${useCaseData.title}": ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Excel parsing error: ${error}`);
      return result;
    }
  }

  /**
   * Parse Strategic Use Cases worksheet (matches export format)
   */
  private static parseStrategicUseCasesSheet(workbook: XLSX.WorkBook): Partial<InsertUseCase>[] {
    const sheetName = 'Strategic Use Cases';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return []; // No data rows

    const headers = data[0] as string[];
    const useCases: Partial<InsertUseCase>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue; // Skip empty rows

      const useCase = this.mapRowToUseCase(headers, row, 'strategic');
      if (useCase) useCases.push(useCase);
    }

    return useCases;
  }

  /**
   * Parse AI Inventory worksheet (matches export format)
   */
  private static parseAIInventorySheet(workbook: XLSX.WorkBook): Partial<InsertUseCase>[] {
    const sheetName = 'AI Inventory';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return [];

    const headers = data[0] as string[];
    const useCases: Partial<InsertUseCase>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const useCase = this.mapRowToUseCase(headers, row, 'ai_inventory');
      if (useCase) useCases.push(useCase);
    }

    return useCases;
  }

  /**
   * Parse Raw Data worksheet (fallback for complete data)
   */
  private static parseRawDataSheet(workbook: XLSX.WorkBook): Partial<InsertUseCase>[] {
    const sheetName = 'Raw Data';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return [];

    const headers = data[0] as string[];
    const useCases: Partial<InsertUseCase>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const useCase = this.mapRowToUseCase(headers, row, 'auto_detect');
      if (useCase) useCases.push(useCase);
    }

    return useCases;
  }

  /**
   * Map Excel row to use case object (matches export column mapping)
   */
  private static mapRowToUseCase(
    headers: string[], 
    row: any[], 
    type: 'strategic' | 'ai_inventory' | 'auto_detect'
  ): Partial<InsertUseCase> | null {
    
    const getValue = (columnName: string): any => {
      const index = headers.findIndex(h => h === columnName);
      const value = index >= 0 ? row[index] : undefined;
      // Convert empty strings to null for proper validation
      return value === '' ? null : value;
    };

    const title = getValue('Title');
    if (!title) return null;

    // Base use case data - handle empty strings properly
    const useCase: Partial<InsertUseCase> = {
      title: title,
      description: getValue('Description') || '',
      problemStatement: getValue('Problem Statement'),
      process: getValue('Process') || '',
      lineOfBusiness: getValue('Line of Business') || '',
      businessSegment: getValue('Business Segment') || '',
      geography: getValue('Geography') || '',
      useCaseType: getValue('Use Case Type') || 'Process',
      useCaseStatus: getValue('Use Case Status') || 'Reference',
      librarySource: this.normalizeLibrarySource(getValue('Library Source')),
      isActiveForRsa: getValue('Portfolio Status')?.toLowerCase().includes('active') ? 'true' : 'false',
      isDashboardVisible: (getValue('Dashboard Visible') === 'Yes' || getValue('Dashboard Visible') === true) ? 'true' : 'false',
      activationReason: getValue('Activation Reason') || null,
    };

    // Auto-detect type if needed
    if (type === 'auto_detect') {
      const hasScoring = getValue('Final Impact Score') !== undefined;
      const hasAIInventory = getValue('AI Inventory Status') !== undefined;
      
      if (hasAIInventory) {
        type = 'ai_inventory';
      } else if (hasScoring) {
        type = 'strategic';
      } else {
        type = 'strategic'; // Default
      }
    }

    // Add type-specific data
    if (type === 'strategic') {
      // Scoring data
      const finalImpactScore = this.parseNumber(getValue('Final Impact Score'));
      const finalEffortScore = this.parseNumber(getValue('Final Effort Score'));
      
      if (finalImpactScore !== null) useCase.finalImpactScore = finalImpactScore;
      if (finalEffortScore !== null) useCase.finalEffortScore = finalEffortScore;
      
      useCase.finalQuadrant = getValue('Final Quadrant') || null;
      useCase.overrideReason = getValue('Override Reason') || null;
      
      // Business value scores (1-5)
      useCase.revenueImpact = this.parseNumber(getValue('Revenue Impact (1-5)')) || null;
      useCase.costSavings = this.parseNumber(getValue('Cost Savings (1-5)')) || null;
      useCase.riskReduction = this.parseNumber(getValue('Risk Reduction (1-5)')) || null;
      useCase.brokerPartnerExperience = this.parseNumber(getValue('Broker Partner Experience (1-5)')) || null;
      useCase.strategicFit = this.parseNumber(getValue('Strategic Fit (1-5)')) || null;
      
      // Feasibility scores (1-5)
      useCase.dataReadiness = this.parseNumber(getValue('Data Readiness (1-5)')) || null;
      useCase.technicalComplexity = this.parseNumber(getValue('Technical Complexity (1-5)')) || null;
      useCase.changeImpact = this.parseNumber(getValue('Change Impact (1-5)')) || null;
      useCase.modelRisk = this.parseNumber(getValue('Model Risk (1-5)')) || null;
      useCase.adoptionReadiness = this.parseNumber(getValue('Adoption Readiness (1-5)')) || null;
      
      // Implementation details
      useCase.primaryBusinessOwner = getValue('Primary Business Owner') || null;
      useCase.implementationTimeline = getValue('Implementation Timeline') || null;
      useCase.successMetrics = getValue('Success Metrics') || null;
      useCase.estimatedValue = getValue('Estimated Value') || null;
      useCase.integrationRequirements = getValue('Integration Requirements') || null;
      useCase.aiMlTechnologies = this.parseArray(getValue('AI/ML Technologies'));
      useCase.dataSources = this.parseArray(getValue('Data Sources'));
      useCase.stakeholderGroups = this.parseArray(getValue('Stakeholder Groups'));

    } else if (type === 'ai_inventory') {
      // AI Inventory specific fields - map to exact column names from user's Excel
      useCase.aiOrModel = getValue('Is your application a Model or AI?') || getValue('AI or Model') || null;
      useCase.businessFunction = getValue('Function') || getValue('Business Function') || null;
      
      // Handle deployment status - preserve original values for AI inventory
      const deploymentStatus = getValue('Deployment Status');
      useCase.deploymentStatus = deploymentStatus || null;
      
      // Handle AI inventory status - preserve original values
      const aiInventoryStatus = getValue('AI Inventory Status');
      useCase.aiInventoryStatus = aiInventoryStatus || null;
      
      // Risk fields
      useCase.riskToCustomers = getValue('Risk(s) to Customers, third parties, staff') || getValue('Risk to Customers') || null;
      useCase.riskToRsa = getValue('Risk(s) to RSA') || getValue('Risk to RSA') || null;
      
      // Data and governance fields
      useCase.dataUsed = getValue('What data is used in this AI?') || getValue('Data Used') || null;
      useCase.modelOwner = getValue('Model Owner (day-to-day maintenance)') || getValue('Model Owner') || getValue('Model Ownership') || null;
      useCase.rsaPolicyGovernance = getValue('RSA Policy Governance') || null;
      useCase.thirdPartyProvidedModel = getValue('Third Party Provided Model') || null;
      useCase.validationResponsibility = getValue('Are you responsible for validation / testing, or is a Third Party?') || getValue('Validation Process') || null;
      useCase.informedBy = getValue('Informed By') || null;
      
      // Map Purpose of Use to description if not already set
      if (!useCase.description || useCase.description === '') {
        useCase.description = getValue('Purpose Of Use') || '';
      }
      
      // Use Case Status for AI inventory
      if (!useCase.useCaseStatus) {
        useCase.useCaseStatus = getValue('Use Case Status - For support please click …') || getValue('Use Case Status') || null;
      }
    }

    return useCase;
  }

  /**
   * Validate use cases against schema
   */
  private static async validateUseCases(
    useCases: Partial<InsertUseCase>[], 
    result: ImportResult
  ): Promise<InsertUseCase[]> {
    const validated: InsertUseCase[] = [];

    for (const useCaseData of useCases) {
      try {
        // Use insert schema for validation (excludes auto-generated fields)
        const validatedUseCase = insertUseCaseSchema.parse(useCaseData);
        validated.push(validatedUseCase);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const title = useCaseData.title || 'Unknown';
          const detailedErrors = error.errors.map(e => {
            const field = e.path.join('.');
            let friendlyMessage = `${field}: ${e.message}`;
            
            // Provide more specific error messages for common issues
            if (e.code === 'invalid_type' && e.expected === 'string') {
              friendlyMessage = `${field} is required and must be text`;
            } else if (e.code === 'too_small' && e.type === 'number') {
              friendlyMessage = `${field} must be between 1-5`;
            } else if (e.code === 'too_big' && e.type === 'number') {
              friendlyMessage = `${field} must be between 1-5`;
            } else if (e.code === 'invalid_enum_value') {
              let expectedValues = e.options?.join(', ') || 'valid enum value';
              
              // Provide specific guidance for known fields
              if (field === 'aiInventoryStatus') {
                expectedValues = 'Active, Proof_of_Concept, Pending_Closure, Obsolete, Inactive';
              } else if (field === 'deploymentStatus') {
                expectedValues = 'PoC, Pilot, Production, Decommissioned';
              }
              
              friendlyMessage = `${field} has invalid value "${e.received}". Expected one of: ${expectedValues}`;
            }
            
            return friendlyMessage;
          });
          
          result.errors.push(`Validation error for "${title}": ${detailedErrors.join(', ')}`);
        } else {
          result.errors.push(`Validation error: ${error}`);
        }
      }
    }

    return validated;
  }

  /**
   * Clear existing use cases (for replace mode)
   */
  private static async clearExistingUseCases(): Promise<void> {
    const allUseCases = await storage.getAllUseCases();
    for (const useCase of allUseCases) {
      await storage.deleteUseCase(useCase.id);
    }
  }

  /**
   * Clear only AI inventory use cases (for AI inventory replace mode)
   */
  private static async clearExistingAIInventoryUseCases(): Promise<void> {
    const allUseCases = await storage.getAllUseCases();
    const aiInventoryUseCases = allUseCases.filter(useCase => 
      useCase.librarySource === 'ai_inventory' || 
      (useCase.aiInventoryStatus !== null && useCase.aiInventoryStatus !== undefined) ||
      (useCase.deploymentStatus !== null && useCase.deploymentStatus !== undefined) ||
      (useCase.businessFunction !== null && useCase.businessFunction !== undefined)
    );
    
    console.log(`Found ${aiInventoryUseCases.length} AI inventory use cases to delete`);
    for (const useCase of aiInventoryUseCases) {
      await storage.deleteUseCase(useCase.id);
    }
  }

  /**
   * Track use case type in summary
   */
  private static trackUseCaseType(useCase: Partial<InsertUseCase>, summary: ImportResult['summary']): void {
    
    // Check if this is an AI Inventory item (based on library source or AI inventory fields)
    const isAIInventory = useCase.librarySource === 'ai_inventory' || 
                         (useCase.aiInventoryStatus !== null && useCase.aiInventoryStatus !== undefined) || 
                         (useCase.deploymentStatus !== null && useCase.deploymentStatus !== undefined) ||
                         (useCase.businessFunction !== null && useCase.businessFunction !== undefined);
    
    // Check if this is a Strategic use case (RSA Internal with scoring or active status)
    const isStrategic = useCase.librarySource === 'rsa_internal' || 
                       useCase.isActiveForRsa === 'true' ||
                       useCase.libraryTier === 'active' ||
                       (useCase.finalImpactScore !== null && useCase.finalImpactScore !== undefined) ||
                       (useCase.finalEffortScore !== null && useCase.finalEffortScore !== undefined);
    
    // Categorize based on improved logic
    if (isAIInventory) {
      summary.aiInventory++;
    } else if (isStrategic) {
      summary.strategic++;
    } else {
      summary.industry++;
    }
  }

  /**
   * Normalize library source values to match schema enum
   */
  private static normalizeLibrarySource(value: any): 'rsa_internal' | 'industry_standard' | 'ai_inventory' {
    if (!value) return 'rsa_internal';
    
    const normalized = String(value).toLowerCase().replace(/\s+/g, '_');
    
    // Map common variations to correct enum values
    switch (normalized) {
      case 'rsa_internal':
      case 'rsa':
      case 'internal':
        return 'rsa_internal';
      case 'industry_standard':
      case 'industry':
      case 'standard':
        return 'industry_standard';
      case 'ai_inventory':
      case 'ai':
      case 'inventory':
        return 'ai_inventory';
      default:
        return 'rsa_internal'; // Default fallback for unknown values
    }
  }

  /**
   * Parse number safely
   */
  private static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Parse array from string (comma-separated)
   */
  private static parseArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value).split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
}