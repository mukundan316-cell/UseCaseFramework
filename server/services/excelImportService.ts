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
  mode: 'append' | 'replace';
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
        result.success = true;
        return result;
      }

      // Handle replace mode
      if (options.mode === 'replace') {
        await this.clearExistingUseCases();
      }

      // Import use cases
      for (const useCaseData of validatedUseCases) {
        try {
          // Find existing use case by title
          const allUseCases = await storage.getAllUseCases();
          const existingUseCase = allUseCases.find(uc => uc.title === useCaseData.title);
          
          if (existingUseCase && options.mode === 'append') {
            // Update existing
            await storage.updateUseCase(existingUseCase.id, useCaseData);
            result.updatedCount++;
          } else {
            // Create new - add required scoring fields for new use cases
            const useCaseWithScoring = {
              ...useCaseData,
              impactScore: useCaseData.finalImpactScore || 0,
              effortScore: useCaseData.finalEffortScore || 0,
              quadrant: useCaseData.finalQuadrant || 'Low Impact, High Effort'
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
      return index >= 0 ? row[index] : undefined;
    };

    const title = getValue('Title');
    if (!title) return null;

    // Base use case data
    const useCase: Partial<InsertUseCase> = {
      title: title,
      description: getValue('Description') || '',
      problemStatement: getValue('Problem Statement') || null,
      process: getValue('Process') || '',
      lineOfBusiness: getValue('Line of Business') || '',
      businessSegment: getValue('Business Segment') || '',
      geography: getValue('Geography') || '',
      useCaseType: getValue('Use Case Type') || 'Process',
      useCaseStatus: getValue('Use Case Status') || 'Reference',
      librarySource: getValue('Library Source') || 'Manual Entry',
      isActiveForRsa: (getValue('Portfolio Status')?.toLowerCase().includes('active') || false) ? 'true' : 'false',
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
      // AI Inventory specific fields
      useCase.businessFunction = getValue('Business Function') || null;
      useCase.aiInventoryStatus = getValue('AI Inventory Status') || null;
      useCase.deploymentStatus = getValue('Deployment Status') || null;
      useCase.riskToCustomers = getValue('Risk to Customers') || null;
      useCase.riskToRsa = getValue('Risk to RSA') || null;
      useCase.dataUsed = getValue('Data Used') || null;
      useCase.modelOwnership = getValue('Model Ownership') || null;
      useCase.validationProcess = getValue('Validation Process') || null;
      useCase.lastStatusUpdate = getValue('Last Status Update') ? new Date(getValue('Last Status Update')) : null;
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
          result.errors.push(`Validation error for "${title}": ${error.errors.map(e => e.message).join(', ')}`);
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
   * Track use case type in summary
   */
  private static trackUseCaseType(useCase: Partial<InsertUseCase>, summary: ImportResult['summary']): void {
    const hasScoring = useCase.finalImpactScore !== undefined || useCase.finalEffortScore !== undefined;
    const hasAIInventory = useCase.aiInventoryStatus !== undefined;
    
    if (hasAIInventory) {
      summary.aiInventory++;
    } else if (hasScoring || useCase.useCaseStatus === 'Active') {
      summary.strategic++;
    } else {
      summary.industry++;
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