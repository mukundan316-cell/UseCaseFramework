import * as XLSX from 'xlsx';
import { storage } from '../storage';
import { insertUseCaseSchema, type InsertUseCase } from '../../shared/schema';
import { z } from 'zod';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../../shared/calculations';

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
   * LEGO: Field validation system for import integrity
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

  private static validateImportHeaders(headers: string[], sheetName: string): string[] {
    const warnings: string[] = [];
    
    // Check for calculated fields
    const calculatedFields = this.getCalculatedFields();
    const foundCalculated = headers.filter(h => calculatedFields.includes(h));
    if (foundCalculated.length > 0) {
      warnings.push(`❌ [${sheetName}] Calculated fields found: ${foundCalculated.join(', ')}. These are auto-generated and will be ignored during import.`);
    }
    
    // Check for system-managed fields  
    const systemFields = this.getSystemManagedFields();
    const foundSystem = headers.filter(h => systemFields.includes(h));
    if (foundSystem.length > 0) {
      warnings.push(`⚠️  [${sheetName}] System-managed fields found: ${foundSystem.join(', ')}. These are auto-generated and will be ignored during import.`);
    }
    
    return warnings;
  }

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
        // Success depends on whether there are validation errors
        result.success = result.errors.length === 0;
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
            
            // Enhanced matching: First try by Use Case ID (if provided), then by title
            // This allows updates when ID is provided but title changed
            if (useCaseData.useCaseId) {
              existingUseCase = allUseCases.find(uc => uc.id === useCaseData.useCaseId);
            }
            
            // Fallback to title matching if no ID match found
            if (!existingUseCase) {
              existingUseCase = allUseCases.find(uc => uc.title === useCaseData.title);
            }
          }
          
          // Validate Use Case ID integrity: If ID provided but doesn't match, reject the record
          if (useCaseData.useCaseId && !existingUseCase && options.mode === 'append') {
            result.errors.push(`❌ Invalid Use Case ID "${useCaseData.useCaseId}" for "${useCaseData.title}". Use Case IDs are auto-generated and cannot be manually created. Remove the Use Case ID to create a new record.`);
            continue; // Skip this record
          }
          
          if (existingUseCase && options.mode === 'append') {
            // Update existing - preserve existing meaningfulId and ensure proper types for scoring fields
            const updateData = {
              ...useCaseData,
              // Remove useCaseId since it's only for matching, not storing
              useCaseId: undefined,
              // Preserve the existing meaningfulId - don't overwrite with auto-generated one
              meaningfulId: existingUseCase.meaningfulId,
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
            // Create new - calculate scores and clean data before passing to storage layer
            const cleanedUseCase = { ...useCaseData };
            
            // Remove useCaseId since it's only for matching, not storing
            delete cleanedUseCase.useCaseId;
            
            // Remove null/undefined values to let storage layer apply defaults exactly like UI
            // This follows replit.md: "Remove null/undefined values to let storage layer apply same defaults as UI"
            Object.keys(cleanedUseCase).forEach(key => {
              if (cleanedUseCase[key] === null || cleanedUseCase[key] === undefined) {
                delete cleanedUseCase[key];
              }
            });
            
            // Calculate required scores just like UI does - get metadata for weights
            const metadata = await storage.getMetadataConfig();
            const businessImpactWeights = (metadata?.scoringModel?.businessValue as any) || {
              revenueImpact: 20, costSavings: 20, riskReduction: 20, brokerPartnerExperience: 20, strategicFit: 20
            };
            const implementationEffortWeights = (metadata?.scoringModel?.feasibility as any) || {
              dataReadiness: 20, technicalComplexity: 20, changeImpact: 20, modelRisk: 20, adoptionReadiness: 20
            };
            const threshold = (metadata?.scoringModel?.quadrantThreshold as number) || 3.0;
            
            // Calculate scores using same logic as UI
            const impactScore = calculateImpactScore(
              Number(cleanedUseCase.revenueImpact) || 0,
              Number(cleanedUseCase.costSavings) || 0,
              Number(cleanedUseCase.riskReduction) || 0,
              Number(cleanedUseCase.brokerPartnerExperience) || 0,
              Number(cleanedUseCase.strategicFit) || 0,
              businessImpactWeights
            );
            
            const effortScore = calculateEffortScore(
              Number(cleanedUseCase.dataReadiness) || 0,
              Number(cleanedUseCase.technicalComplexity) || 0,
              Number(cleanedUseCase.changeImpact) || 0,
              Number(cleanedUseCase.modelRisk) || 0,
              Number(cleanedUseCase.adoptionReadiness) || 0,
              implementationEffortWeights
            );
            
            const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
            
            // Add calculated scores to the use case with proper type casting
            (cleanedUseCase as any).impactScore = impactScore;
            (cleanedUseCase as any).effortScore = effortScore;
            (cleanedUseCase as any).quadrant = quadrant;
            
            await storage.createUseCase(cleanedUseCase as any);
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
  private static parseStrategicUseCasesSheet(workbook: XLSX.WorkBook): any[] {
    const sheetName = 'Strategic Use Cases';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return []; // No data rows

    const headers = data[0] as string[];
    
    // Validate headers and collect warnings (non-breaking validation)
    const headerWarnings = this.validateImportHeaders(headers, sheetName);
    if (headerWarnings.length > 0) {
      console.warn('Import header validation warnings:', headerWarnings);
      // Note: We continue processing but will filter out problematic fields during mapping
    }
    
    const useCases: any[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue; // Skip completely empty rows
      
      // Check if Title column has content (not first column)
      const titleIndex = headers.findIndex(h => h === 'Title');
      if (titleIndex < 0 || !row[titleIndex]) continue; // Skip rows without title

      const useCase = ExcelImportService.mapRowToUseCase(headers, row, 'strategic');
      if (useCase) useCases.push(useCase);
    }

    return useCases;
  }

  /**
   * Parse AI Inventory worksheet (matches export format)
   */
  private static parseAIInventorySheet(workbook: XLSX.WorkBook): any[] {
    const sheetName = 'AI Inventory';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return [];

    const headers = data[0] as string[];
    
    // Validate headers and collect warnings (non-breaking validation)
    const headerWarnings = this.validateImportHeaders(headers, sheetName);
    if (headerWarnings.length > 0) {
      console.warn('Import header validation warnings:', headerWarnings);
      // Note: We continue processing but will filter out problematic fields during mapping
    }
    
    const useCases: any[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue; // Skip completely empty rows
      
      // Check if Title column has content (not first column)
      const titleIndex = headers.findIndex(h => h === 'Title');
      if (titleIndex < 0 || !row[titleIndex]) continue; // Skip rows without title

      const useCase = ExcelImportService.mapRowToUseCase(headers, row, 'ai_inventory');
      if (useCase) useCases.push(useCase);
    }

    return useCases;
  }

  /**
   * Parse Raw Data worksheet (fallback for complete data)
   */
  private static parseRawDataSheet(workbook: XLSX.WorkBook): any[] {
    const sheetName = 'Raw Data';
    if (!workbook.Sheets[sheetName]) return [];

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (data.length < 2) return [];

    const headers = data[0] as string[];
    const useCases: any[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue; // Skip completely empty rows
      
      // Check if Title column has content (not first column)
      const titleIndex = headers.findIndex(h => h === 'Title');
      if (titleIndex < 0 || !row[titleIndex]) continue; // Skip rows without title

      const useCase = ExcelImportService.mapRowToUseCase(headers, row, 'auto_detect');
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
  ): any | null {
    
    const getValue = (columnName: string): any => {
      // Filter out calculated and system fields - return undefined to ignore them
      const calculatedFields = this.getCalculatedFields();
      const systemFields = this.getSystemManagedFields();
      
      if (calculatedFields.includes(columnName) || systemFields.includes(columnName)) {
        return undefined; // Ignore calculated and system fields
      }
      
      const index = headers.findIndex(h => h === columnName);
      const value = index >= 0 ? row[index] : undefined;
      // Convert empty strings to null for proper validation
      return value === '' ? null : value;
    };

    // Special function to get Use Case ID for matching purposes (even though it's system-managed)
    const getUseCaseIdForMatching = (): string | null => {
      const index = headers.findIndex(h => h === 'Use Case ID');
      const value = index >= 0 ? row[index] : undefined;
      return value && value !== '' ? String(value) : null;
    };

    const title = getValue('Title');
    if (!title) return null;

    // Base use case data - handle empty strings properly
    const useCase = {
      title: title,
      description: getValue('Description') || '',
      // Don't set meaningfulId from Excel - let it be auto-generated based on category
      problemStatement: getValue('Problem Statement'),
      process: getValue('Process') || null,
      // Single values for backward compatibility - will be derived from arrays in storage layer
      lineOfBusiness: null,
      businessSegment: null, 
      geography: null,
      useCaseType: getValue('Use Case Type') || 'Process',
      useCaseStatus: getValue('Use Case Status') || 'Reference',
      librarySource: ExcelImportService.normalizeLibrarySource(getValue('Library Source')),
      isActiveForRsa: getValue('Portfolio Status')?.toLowerCase().includes('active') ? 'true' : 'false',
      isDashboardVisible: (getValue('Dashboard Visible') === 'Yes' || getValue('Dashboard Visible') === true) ? 'true' : 'false',
      activationReason: getValue('Activation Reason') || null,
      // Add Use Case ID for matching purposes (won't be saved, just used for finding existing records)
      useCaseId: getUseCaseIdForMatching(),
    };

    // Auto-detect type if needed
    if (type === 'auto_detect') {
      // Use non-calculated fields for type detection
      const hasAIInventory = getValue('AI Inventory Status') !== undefined;
      const hasStrategicScoring = getValue('Revenue Impact (1-5)') !== undefined || getValue('Cost Savings (1-5)') !== undefined;
      
      if (hasAIInventory) {
        type = 'ai_inventory';
      } else if (hasStrategicScoring) {
        type = 'strategic';
      } else {
        type = 'strategic'; // Default
      }
    }

    // Add type-specific data
    if (type === 'strategic') {
      // Skip calculated fields (Final Impact/Effort Score, Final Quadrant) - they will be auto-calculated
      // Only process user-editable scoring inputs and strategic-specific fields
      
      Object.assign(useCase, {
        // Skip: finalImpactScore, finalEffortScore, finalQuadrant (calculated fields)
        overrideReason: getValue('Override Reason') || null,
        
        // Business impact scores (1-5) - convert null to undefined for schema compatibility
        revenueImpact: ExcelImportService.parseNumber(getValue('Revenue Impact (1-5)')) ?? undefined,
        costSavings: ExcelImportService.parseNumber(getValue('Cost Savings (1-5)')) ?? undefined,
        riskReduction: ExcelImportService.parseNumber(getValue('Risk Reduction (1-5)')) ?? undefined,
        brokerPartnerExperience: ExcelImportService.parseNumber(getValue('Broker Partner Experience (1-5)')) ?? undefined,
        strategicFit: ExcelImportService.parseNumber(getValue('Strategic Fit (1-5)')) ?? undefined,
        
        // Implementation effort scores (1-5) - convert null to undefined for schema compatibility
        dataReadiness: ExcelImportService.parseNumber(getValue('Data Readiness (1-5)')) ?? undefined,
        technicalComplexity: ExcelImportService.parseNumber(getValue('Technical Complexity (1-5)')) ?? undefined,
        changeImpact: ExcelImportService.parseNumber(getValue('Change Impact (1-5)')) ?? undefined,
        modelRisk: ExcelImportService.parseNumber(getValue('Model Risk (1-5)')) ?? undefined,
        adoptionReadiness: ExcelImportService.parseNumber(getValue('Adoption Readiness (1-5)')) ?? undefined,
        
        // Implementation details
        primaryBusinessOwner: getValue('Primary Business Owner') || null,
        keyDependencies: getValue('Key Dependencies') || null,
        implementationTimeline: getValue('Implementation Timeline') || null,
        successMetrics: getValue('Success Metrics') || null,
        estimatedValue: getValue('Estimated Value') || null,
        valueMeasurementApproach: getValue('Value Measurement Approach') || null,
        integrationRequirements: getValue('Integration Requirements') || null,
        aiMlTechnologies: ExcelImportService.parseArray(getValue('AI/ML Technologies')),
        dataSources: ExcelImportService.parseArray(getValue('Data Sources')),
        stakeholderGroups: ExcelImportService.parseArray(getValue('Stakeholder Groups')),
        
        // Horizontal Use Case fields - use default instead of null to match schema requirements
        horizontalUseCase: ExcelImportService.parseBoolean(getValue('Horizontal Use Case')) || 'false',
        horizontalUseCaseTypes: ExcelImportService.parseArray(getValue('Horizontal Use Case Types')),
        
        // RSA Ethical Principles - use defaults instead of null to match schema requirements
        explainabilityRequired: ExcelImportService.parseBoolean(getValue('Explainability Required')) || 'false',
        customerHarmRisk: getValue('Customer Harm Risk') || null,
        dataOutsideUkEu: ExcelImportService.parseBoolean(getValue('Data Outside UK/EU')) || 'false',
        thirdPartyModel: ExcelImportService.parseBoolean(getValue('Third Party Model')) || 'false',
        humanAccountability: ExcelImportService.parseBoolean(getValue('Human Accountability')) || 'false',
        regulatoryCompliance: ExcelImportService.parseNumber(getValue('Regulatory Compliance (1-5)')) ?? undefined,
        
        // Multi-select array fields - updated column names to match export
        linesOfBusiness: ExcelImportService.parseArray(getValue('Lines of Business')),
        businessSegments: ExcelImportService.parseArray(getValue('Business Segments')), 
        geographies: ExcelImportService.parseArray(getValue('Geographies')),
        processes: ExcelImportService.parseArray(getValue('Processes (Multi-select)')),
        activities: ExcelImportService.parseArray(getValue('Process Activities')),
        presentationFileName: getValue('Presentation File Name') || null,
        hasPresentation: ExcelImportService.parseBoolean(getValue('Has Presentation')) || 'false',
        deactivationReason: getValue('Deactivation Reason') || null
        // Removed legacy fields: activity (single), valueChainComponent, lastStatusUpdate, createdDate
      });

    } else if (type === 'ai_inventory') {
      // Business Context fields for AI Inventory
      Object.assign(useCase, {
        librarySource: 'ai_inventory', // Force AI Inventory source
        problemStatement: getValue('Problem Statement') || null,
        // Note: removed single 'Process' field - now handled via multi-select 'Processes (Multi-select)'
        lineOfBusiness: getValue('Line of Business') || null,
        businessSegment: getValue('Business Segment') || null,
        geography: getValue('Geography') || null,
        useCaseType: getValue('Use Case Type') || null,
        
        // Implementation fields for AI Inventory
        useCaseStatus: getValue('Use Case Status') || null,
        primaryBusinessOwner: getValue('Primary Business Owner') || null,
        keyDependencies: getValue('Key Dependencies') || null,
        implementationTimeline: getValue('Implementation Timeline') || null,
        successMetrics: getValue('Success Metrics') || null,
        estimatedValue: getValue('Estimated Value') || null,
        valueMeasurementApproach: getValue('Value Measurement Approach') || null,
        integrationRequirements: getValue('Integration Requirements') || null,
        
        // Multi-select array fields for AI Inventory
        linesOfBusiness: ExcelImportService.parseArray(getValue('Lines of Business')),
        businessSegments: ExcelImportService.parseArray(getValue('Business Segments')),
        geographies: ExcelImportService.parseArray(getValue('Geographies')),
        processes: ExcelImportService.parseArray(getValue('Processes (Multi-select)')),
        activities: ExcelImportService.parseArray(getValue('Process Activities')),
        aiMlTechnologies: ExcelImportService.parseArray(getValue('AI/ML Technologies')),
        dataSources: ExcelImportService.parseArray(getValue('Data Sources')),
        stakeholderGroups: ExcelImportService.parseArray(getValue('Stakeholder Groups')),
        
        // Horizontal Use Case fields
        horizontalUseCase: ExcelImportService.parseBoolean(getValue('Horizontal Use Case')) || 'false',
        horizontalUseCaseTypes: ExcelImportService.parseArray(getValue('Horizontal Use Case Types')),
        
        // Set undefined for scoring fields to let schema defaults apply
        revenueImpact: undefined,
        costSavings: undefined,
        riskReduction: undefined,
        brokerPartnerExperience: undefined,
        strategicFit: undefined,
        dataReadiness: undefined,
        technicalComplexity: undefined,
        changeImpact: undefined,
        modelRisk: undefined,
        adoptionReadiness: undefined,
        // RSA Ethical Principles for AI Inventory
        explainabilityRequired: ExcelImportService.parseBoolean(getValue('Explainability Required')) || 'false',
        customerHarmRisk: getValue('Customer Harm Risk') || null,
        dataOutsideUkEu: ExcelImportService.parseBoolean(getValue('Data Outside UK/EU')) || 'false',
        thirdPartyModel: ExcelImportService.parseBoolean(getValue('Third Party Model')) || 'false',
        humanAccountability: ExcelImportService.parseBoolean(getValue('Human Accountability')) || 'false',
        regulatoryCompliance: ExcelImportService.parseNumber(getValue('Regulatory Compliance (1-5)')) ?? undefined,
        finalQuadrant: 'Not Scored',
        
        // AI Inventory specific fields
        aiOrModel: getValue('Is your application a Model or AI?') || getValue('AI or Model') || null,
        businessFunction: getValue('Function') || getValue('Business Function') || null,
        deploymentStatus: getValue('Deployment Status') || null,
        aiInventoryStatus: getValue('AI Inventory Status') || null,
        riskToCustomers: getValue('Risk(s) to Customers, third parties, staff') || getValue('Risk to Customers') || null,
        riskToRsa: getValue('Risk(s) to RSA') || getValue('Risk to RSA') || null,
        dataUsed: getValue('What data is used in this AI?') || getValue('Data Used') || null,
        modelOwner: getValue('Model Owner (day-to-day maintenance)') || getValue('Model Owner') || getValue('Model Ownership') || null,
        rsaPolicyGovernance: getValue('RSA Policy Governance') || null,
        thirdPartyProvidedModel: getValue('Third Party Provided Model') || null,
        validationResponsibility: getValue('Are you responsible for validation / testing, or is a Third Party?') || getValue('Validation Responsibility') || getValue('Validation Process') || null,
        informedBy: getValue('Informed By') || null,
        
        // Presentation field
        hasPresentation: ExcelImportService.parseBoolean(getValue('Has Presentation')) || 'false'
      });
      
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
   * Validate use cases against the same schema used by storage layer
   * Ensures consistency between Excel validation and actual storage requirements
   */
  private static async validateUseCases(
    useCases: any[], 
    result: ImportResult
  ): Promise<InsertUseCase[]> {
    const validated: InsertUseCase[] = [];

    for (const useCaseData of useCases) {
      try {
        // Remove auto-calculated fields that shouldn't come from Excel
        // These will be calculated during the import process
        const cleanedData = { ...useCaseData };
        delete cleanedData.finalQuadrant;
        delete cleanedData.finalImpactScore;
        delete cleanedData.finalEffortScore;
        delete cleanedData.impactScore;
        delete cleanedData.effortScore;
        delete cleanedData.quadrant;
        
        // Use the same insertUseCaseSchema as storage layer for consistency
        // This follows replit.md principles: "Schema Reuse: Never duplicate validation logic"
        const validatedUseCase = insertUseCaseSchema.parse(cleanedData);
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
  private static trackUseCaseType(useCase: any, summary: ImportResult['summary']): void {
    
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
   * Parse boolean from Yes/No or true/false strings - returns 'true'/'false' strings per replit.md
   */
  private static parseBoolean(value: any): 'true' | 'false' | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'yes' || lower === 'true' || lower === '1') return 'true';
      if (lower === 'no' || lower === 'false' || lower === '0') return 'false';
    }
    return null;
  }

  /**
   * Parse array from string (semicolon or comma-separated)
   */
  private static parseArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // Try semicolon first (export format), then comma fallback
    const separator = String(value).includes(';') ? ';' : ',';
    return String(value).split(separator).map(s => s.trim()).filter(s => s.length > 0);
  }
}