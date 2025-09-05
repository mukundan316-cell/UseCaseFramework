import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ExcelExportService } from '../excelExportService';
import { db } from '../../db';

// Mock database queries
jest.mock('../../db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([{
          useCaseStatuses: ['Discovery', 'Backlog', 'In-flight', 'Implemented', 'On Hold'],
          sourceTypes: ['rsa_internal', 'industry_standard', 'ai_inventory']
        }]))
      }))
    }))
  }
}));

describe('Excel Export Validation Tests', () => {
  
  // Test data factory functions
  const createValidUseCase = (id: string = 'test-1') => ({
    id,
    meaningfulId: `UC-${id}`,
    title: 'Valid Test Use Case',
    description: 'This is a valid test description',
    useCaseStatus: 'Discovery',
    librarySource: 'rsa_internal',
    primaryBusinessOwner: 'John Smith',
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 2,
    brokerPartnerExperience: 3,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 2,
    changeImpact: 3,
    modelRisk: 2,
    adoptionReadiness: 4,
    regulatoryCompliance: 3,
    processes: ['Claims Processing', 'Underwriting'],
    activities: ['Risk Assessment'],
    linesOfBusiness: ['Motor', 'Property'],
    businessSegments: ['Personal Lines'],
    geographies: ['UK', 'Ireland'],
    aiMlTechnologies: ['Machine Learning', 'NLP'],
    dataSources: ['Internal Claims Data'],
    stakeholderGroups: ['Claims Team'],
    horizontalUseCaseTypes: ['Automation']
  });

  const createAIInventoryUseCase = (id: string = 'ai-1') => ({
    ...createValidUseCase(id),
    librarySource: 'ai_inventory',
    businessFunction: 'Claims Processing',
    riskToCustomers: 'Low',
    riskToRsa: 'Medium',
    dataUsed: 'Customer Claims History',
    modelOwner: 'Data Science Team',
    rsaPolicyGovernance: 'Compliant',
    validationResponsibility: 'Model Risk Team',
    informedBy: 'Customer Consent'
  });

  const createInvalidUseCase = (id: string = 'invalid-1') => ({
    id,
    meaningfulId: `UC-${id}`,
    title: '', // Invalid - empty title
    description: null, // Invalid - null description
    useCaseStatus: 'InvalidStatus', // Invalid status
    librarySource: 'InvalidSource', // Invalid source
    primaryBusinessOwner: '',
    revenueImpact: 10, // Invalid - outside 1-5 range
    costSavings: 'high', // Invalid - string instead of number
    riskReduction: -1, // Invalid - negative
    processes: [null, '', 'Valid Process'], // Mixed valid/invalid array
    activities: undefined,
    title_with_formula: '=SUM(A1:A10)', // Excel formula
    description_with_breaks: 'Line 1\r\nLine 2\tTab\x00Control'
  });

  describe('validateUseCasesForExport', () => {
    
    test('should pass validation with valid data', async () => {
      const validUseCases = [
        createValidUseCase('test-1'),
        createValidUseCase('test-2'),
        createAIInventoryUseCase('ai-1')
      ];

      const result = await ExcelExportService.validateExportData(validUseCases);

      expect(result.shouldProceed).toBe(true);
      expect(result.criticalErrors).toHaveLength(0);
      expect(result.totalRecords).toBe(3);
      expect(result.recordsWithIssues).toBeLessThanOrEqual(3);
    });

    test('should generate critical errors for missing titles', async () => {
      const useCasesWithMissingTitles = [
        { ...createValidUseCase(), title: '' },
        { ...createValidUseCase(), title: null },
        { ...createValidUseCase(), title: '   ' } // Only whitespace
      ];

      const result = await ExcelExportService.validateExportData(useCasesWithMissingTitles);

      expect(result.shouldProceed).toBe(false);
      expect(result.criticalErrors.length).toBeGreaterThanOrEqual(3);
      expect(result.criticalErrors.some(error => error.field === 'title')).toBe(true);
      expect(result.criticalErrors.some(error => error.issue.includes('Title is required'))).toBe(true);
    });

    test('should generate critical errors for missing descriptions', async () => {
      const useCasesWithMissingDescriptions = [
        { ...createValidUseCase(), description: '' },
        { ...createValidUseCase(), description: null },
        { ...createValidUseCase(), description: '   ' }
      ];

      const result = await ExcelExportService.validateExportData(useCasesWithMissingDescriptions);

      expect(result.shouldProceed).toBe(false);
      expect(result.criticalErrors.length).toBeGreaterThanOrEqual(3);
      expect(result.criticalErrors.some(error => error.field === 'description')).toBe(true);
      expect(result.criticalErrors.some(error => error.issue.includes('Description is required'))).toBe(true);
    });

    test('should generate critical errors for invalid use case status values', async () => {
      const useCasesWithInvalidStatus = [
        { ...createValidUseCase(), useCaseStatus: 'InvalidStatus' },
        { ...createValidUseCase(), useCaseStatus: 'NotInList' }
      ];

      const result = await ExcelExportService.validateExportData(useCasesWithInvalidStatus);

      expect(result.shouldProceed).toBe(false);
      expect(result.criticalErrors.some(error => error.field === 'useCaseStatus')).toBe(true);
      expect(result.criticalErrors.some(error => error.issue.includes('Use Case Status must be one of'))).toBe(true);
    });

    test('should generate warnings for scores outside 1-5 range', async () => {
      const useCasesWithInvalidScores = [
        { ...createValidUseCase(), revenueImpact: 0 }, // Too low
        { ...createValidUseCase(), costSavings: 10 }, // Too high
        { ...createValidUseCase(), riskReduction: 'high' }, // Non-numeric
        { ...createValidUseCase(), brokerPartnerExperience: -5 } // Negative
      ];

      const result = await ExcelExportService.validateExportData(useCasesWithInvalidScores);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => warning.issue.includes('Score values should be between 1-5'))).toBe(true);
      expect(result.warnings.some(warning => ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience'].includes(warning.field))).toBe(true);
    });

    test('should generate warnings for missing primary business owner', async () => {
      const useCasesWithoutOwner = [
        { ...createValidUseCase(), primaryBusinessOwner: '' },
        { ...createValidUseCase(), primaryBusinessOwner: null }
      ];

      const result = await ExcelExportService.validateExportData(useCasesWithoutOwner);

      expect(result.warnings.some(warning => warning.field === 'primaryBusinessOwner')).toBe(true);
      expect(result.warnings.some(warning => warning.issue.includes('Primary Business Owner is recommended'))).toBe(true);
    });

    test('should detect suspicious scoring patterns', async () => {
      const useCaseWithMaxScores = {
        ...createValidUseCase(),
        revenueImpact: 5,
        costSavings: 5,
        riskReduction: 5,
        brokerPartnerExperience: 5,
        strategicFit: 5
      };

      const result = await ExcelExportService.validateExportData([useCaseWithMaxScores]);

      expect(result.warnings.some(warning => 
        warning.field === 'business_scores' && 
        warning.issue.includes('All business impact scores are maximum')
      )).toBe(true);
    });
  });

  describe('AI Inventory Governance Validation', () => {
    
    test('should report 100% completion for complete governance fields', async () => {
      const completeAIInventory = [createAIInventoryUseCase('complete-1')];

      const result = await ExcelExportService.validateExportData(completeAIInventory);

      expect(result.governanceFieldsAnalysis).toBeDefined();
      expect(result.governanceFieldsAnalysis?.totalAiInventoryRecords).toBe(1);
      expect(result.governanceFieldsAnalysis?.recordsWithPopulatedGovernance).toBe(1);
      expect(result.governanceFieldsAnalysis?.averageGovernanceCompletion).toBe(100);
    });

    test('should report correct percentage for missing governance fields', async () => {
      const partialAIInventory = [{
        ...createAIInventoryUseCase('partial-1'),
        riskToCustomers: '', // Missing field
        dataUsed: '', // Missing field
        modelOwner: '', // Missing field
        rsaPolicyGovernance: '' // Missing field
      }];

      const result = await ExcelExportService.validateExportData(partialAIInventory);

      expect(result.governanceFieldsAnalysis).toBeDefined();
      expect(result.governanceFieldsAnalysis?.averageGovernanceCompletion).toBeLessThan(100);
      expect(result.governanceFieldsAnalysis?.averageGovernanceCompletion).toBeGreaterThan(0);
      
      // Should generate warning for incomplete governance
      expect(result.warnings.some(warning => warning.field === 'governance_fields')).toBe(true);
    });

    test('should categorize AI/Model types correctly', async () => {
      const mixedUseCases = [
        createValidUseCase('strategic-1'), // Strategic use case
        createAIInventoryUseCase('ai-1'),  // AI inventory
        { ...createValidUseCase('strategic-2'), librarySource: 'industry_standard' } // Industry standard
      ];

      const result = await ExcelExportService.validateExportData(mixedUseCases);

      expect(result.totalRecords).toBe(3);
      expect(result.governanceFieldsAnalysis?.totalAiInventoryRecords).toBe(1);
    });
  });

  describe('Data Sanitization', () => {
    
    test('should sanitize Excel-breaking characters', async () => {
      const useCasesWithBadChars = [{
        ...createValidUseCase(),
        title: 'Title with\tTab and\r\nNewlines\x00Control',
        description: 'Description with\r\nBreaks and    extra spaces',
        problemStatement: 'Problem\x01\x02\x03with control chars'
      }];

      const sanitizedData = ExcelExportService.sanitizeExportData(useCasesWithBadChars);

      expect(sanitizedData[0].title).not.toMatch(/[\x00-\x1F\x7F]/);
      expect(sanitizedData[0].title).not.toMatch(/\t/);
      expect(sanitizedData[0].title).not.toMatch(/\r\n|\r|\n/);
      expect(sanitizedData[0].description.trim()).toBe(sanitizedData[0].description);
    });

    test('should handle Excel formulas safely', async () => {
      const useCasesWithFormulas = [{
        ...createValidUseCase(),
        title: '=SUM(A1:A10)',
        description: '=HYPERLINK("http://evil.com", "Click me")',
        problemStatement: '+1+1'
      }];

      const sanitizedData = ExcelExportService.sanitizeExportData(useCasesWithFormulas);

      // Formulas should be sanitized but readable
      expect(sanitizedData[0].title).toBe('=SUM(A1:A10)'); // Should remain as text
      expect(sanitizedData[0].description).not.toContain('\x00');
    });

    test('should clean multi-select arrays', async () => {
      const useCasesWithDirtyArrays = [{
        ...createValidUseCase(),
        processes: [null, '', '  Valid Process  ', undefined, 'Another Valid'],
        activities: ['', null, 'Valid Activity'],
        linesOfBusiness: [null, undefined]
      }];

      const sanitizedData = ExcelExportService.sanitizeExportData(useCasesWithDirtyArrays);

      expect(sanitizedData[0].processes).toEqual(['Valid Process', 'Another Valid']);
      expect(sanitizedData[0].activities).toEqual(['Valid Activity']);
      expect(sanitizedData[0].linesOfBusiness).toEqual([]);
    });

    test('should sanitize numeric fields properly', async () => {
      const useCasesWithBadNumbers = [{
        ...createValidUseCase(),
        revenueImpact: 'invalid',
        costSavings: null,
        riskReduction: undefined,
        brokerPartnerExperience: NaN,
        strategicFit: 3.5 // Valid decimal
      }];

      const sanitizedData = ExcelExportService.sanitizeExportData(useCasesWithBadNumbers);

      expect(sanitizedData[0].revenueImpact).toBe('');
      expect(sanitizedData[0].costSavings).toBeNull();
      expect(sanitizedData[0].riskReduction).toBeUndefined();
      expect(sanitizedData[0].brokerPartnerExperience).toBe('');
      expect(sanitizedData[0].strategicFit).toBe(3.5); // Valid number preserved
    });
  });

  describe('Edge Cases', () => {
    
    test('should handle empty dataset gracefully', async () => {
      const result = await ExcelExportService.validateExportData([]);

      expect(result.shouldProceed).toBe(true);
      expect(result.totalRecords).toBe(0);
      expect(result.recordsWithIssues).toBe(0);
      expect(result.criticalErrors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.governanceFieldsAnalysis).toBeUndefined();
    });

    test('should handle large dataset efficiently', async () => {
      // Create 1000 valid use cases
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createValidUseCase(`large-${i}`)
      );

      const startTime = performance.now();
      const result = await ExcelExportService.validateExportData(largeDataset);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.totalRecords).toBe(1000);
      expect(result.shouldProceed).toBe(true);
      expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    test('should handle malformed data structures without crashing', async () => {
      const malformedData = [
        null,
        undefined,
        {},
        { id: 'partial' },
        { title: 'Only Title' },
        createValidUseCase('valid-1')
      ];

      // Should not throw an error
      const result = await ExcelExportService.validateExportData(malformedData);

      expect(result).toBeDefined();
      expect(result.totalRecords).toBe(6);
      expect(result.criticalErrors.length).toBeGreaterThan(0); // Should have errors for malformed data
    });

    test('should process mixed valid and invalid records correctly', async () => {
      const mixedData = [
        createValidUseCase('valid-1'),
        createInvalidUseCase('invalid-1'),
        createValidUseCase('valid-2'),
        createAIInventoryUseCase('ai-valid'),
        { ...createInvalidUseCase('invalid-2'), title: 'Fixed Title', description: 'Fixed Description' }
      ];

      const result = await ExcelExportService.validateExportData(mixedData);

      expect(result.totalRecords).toBe(5);
      expect(result.recordsWithIssues).toBeGreaterThan(0);
      expect(result.criticalErrors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);

      // Some records should have critical errors, preventing export
      expect(result.shouldProceed).toBe(false);
    });
  });

  describe('Performance Benchmarks', () => {
    
    test('validation should be fast for typical dataset sizes', async () => {
      const typicalDataset = Array.from({ length: 100 }, (_, i) => 
        i % 3 === 0 ? createAIInventoryUseCase(`perf-ai-${i}`) : createValidUseCase(`perf-${i}`)
      );

      const startTime = performance.now();
      const result = await ExcelExportService.validateExportData(typicalDataset);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.totalRecords).toBe(100);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('sanitization should be efficient', () => {
      const complexDataset = Array.from({ length: 500 }, (_, i) => ({
        ...createValidUseCase(`complex-${i}`),
        title: `Title with\tmultiple\r\nbad\x00chars ${i}`,
        description: `Description\twith\r\ncomplex\x01formatting ${i}`,
        processes: [null, '', `Process ${i}`, '  Trimmed  ', null],
        activities: [`Activity ${i}`, null, undefined, '']
      }));

      const startTime = performance.now();
      const sanitized = ExcelExportService.sanitizeExportData(complexDataset);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(sanitized).toHaveLength(500);
      expect(executionTime).toBeLessThan(500); // Should complete in under 500ms
      
      // Verify sanitization worked
      expect(sanitized.every(uc => !uc.title.match(/[\x00-\x1F\x7F]/))).toBe(true);
      expect(sanitized.every(uc => Array.isArray(uc.processes))).toBe(true);
    });
  });
});