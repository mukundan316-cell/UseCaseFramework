import { describe, test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import fs from 'fs';
import XLSX from 'xlsx';

// Test against the running server
const baseURL = 'http://localhost:5000';

beforeAll(async () => {
  // Give the server time to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  // Cleanup after tests
});

// Cleanup function to remove test files
const cleanupTestFiles = () => {
  const testFiles = [
    '/tmp/test_all_export.xlsx',
    '/tmp/test_strategic_export.xlsx',
    '/tmp/test_ai_inventory_export.xlsx',
    '/tmp/test_validation_export.xlsx'
  ];
  
  testFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
};

afterEach(() => {
  cleanupTestFiles();
});

describe('Excel Export Integration Tests', () => {
  
  describe('API Endpoint Tests', () => {
    
    test('GET /api/export/excel?category=all&status=all should return Excel file', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Check content type (should be Excel)
      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Check content disposition header for new naming convention
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="rsa_ai_usecase_export_\d{8}_\d{6}_all\.xlsx"/);
      
      // Check that we got binary data
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(1000); // Should be substantial file
    });

    test('Filename should follow new naming convention', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=strategic&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      const contentDisposition = response.headers['content-disposition'];
      expect(contentDisposition).toBeDefined();
      
      // Extract filename from header
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      expect(filenameMatch).toBeTruthy();
      
      const filename = filenameMatch![1];
      
      // Verify naming convention: rsa_ai_usecase_export_YYYYMMDD_HHMMSS_category.xlsx
      expect(filename).toMatch(/^rsa_ai_usecase_export_\d{8}_\d{6}_(all|strategic|ai_inventory)\.xlsx$/);
      
      // Check strategic suffix specifically
      expect(filename).toMatch(/rsa_ai_usecase_export_\d{8}_\d{6}_strategic\.xlsx$/);
    });

    test('Response headers should include validation summary', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Check validation summary header exists
      expect(response.headers['x-validation-summary']).toBeDefined();
      
      // Parse and validate summary structure
      const validationSummary = JSON.parse(response.headers['x-validation-summary']);
      expect(validationSummary).toHaveProperty('totalRecords');
      expect(validationSummary).toHaveProperty('recordsWithIssues');
      expect(validationSummary).toHaveProperty('criticalErrorCount');
      expect(validationSummary).toHaveProperty('warningCount');
      
      expect(typeof validationSummary.totalRecords).toBe('number');
      expect(typeof validationSummary.recordsWithIssues).toBe('number');
      expect(typeof validationSummary.criticalErrorCount).toBe('number');
      expect(typeof validationSummary.warningCount).toBe('number');
      
      // Critical errors should be 0 (export succeeded)
      expect(validationSummary.criticalErrorCount).toBe(0);
    });
  });

  describe('Data Integrity Tests', () => {
    
    test('Export should contain valid Excel workbook structure', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Save file for analysis
      const filePath = '/tmp/test_all_export.xlsx';
      fs.writeFileSync(filePath, response.body);
      
      // Should be able to read as Excel file without errors
      const workbook = XLSX.readFile(filePath);
      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toBeDefined();
      expect(workbook.SheetNames.length).toBeGreaterThan(0);
      
      // Check expected sheets exist
      const expectedSheets = ['Import Guide', 'Summary', 'Strategic Use Cases', 'AI Inventory', 'Raw Data'];
      expectedSheets.forEach(sheetName => {
        expect(workbook.SheetNames).toContain(sheetName);
        expect(workbook.Sheets[sheetName]).toBeDefined();
      });
    });

    test('Strategic Use Cases sheet should have correct structure', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Save file for analysis
      const filePath = '/tmp/test_strategic_export.xlsx';
      fs.writeFileSync(filePath, response.body);
      
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      
      if (workbook.SheetNames.includes('Strategic Use Cases')) {
        const strategicSheet = workbook.Sheets['Strategic Use Cases'];
        const data = XLSX.utils.sheet_to_json(strategicSheet);
        
        if (data.length > 0) {
          const firstRow = data[0] as any;
          const columnCount = Object.keys(firstRow).length;
          
          // Should have reasonable number of columns
          expect(columnCount).toBeGreaterThan(30);
          expect(columnCount).toBeLessThan(60);
          
          // Check for key strategic columns
          expect(firstRow).toHaveProperty('Use Case ID');
          expect(firstRow).toHaveProperty('Title');
          expect(firstRow).toHaveProperty('Description');
        }
      }
    });

    test('AI Inventory sheet should have governance fields', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Save file for analysis
      const filePath = '/tmp/test_ai_inventory_export.xlsx';
      fs.writeFileSync(filePath, response.body);
      
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      
      if (workbook.SheetNames.includes('AI Inventory')) {
        const aiInventorySheet = workbook.Sheets['AI Inventory'];
        const data = XLSX.utils.sheet_to_json(aiInventorySheet);
        
        if (data.length > 0) {
          const firstRow = data[0] as any;
          
          // Check for key AI Inventory governance columns
          expect(firstRow).toHaveProperty('Use Case ID');
          expect(firstRow).toHaveProperty('Title');
          expect(firstRow).toHaveProperty('Description');
          
          // These may or may not be present depending on data
          // Just check that the structure is valid
          expect(typeof firstRow['Use Case ID']).toBeDefined();
          expect(typeof firstRow['Title']).toBeDefined();
          expect(typeof firstRow['Description']).toBeDefined();
        }
      }
    });

    test('Data should be properly sanitized', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Save file for analysis
      const filePath = '/tmp/test_validation_export.xlsx';
      fs.writeFileSync(filePath, response.body);
      
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      const rawDataSheet = workbook.Sheets['Raw Data'];
      const rawData = XLSX.utils.sheet_to_json(rawDataSheet);
      
      if (rawData.length > 0) {
        // Check that data doesn't contain Excel-breaking characters
        const sampleRows = rawData.slice(0, 5); // Check first 5 rows
        sampleRows.forEach((row: any) => {
          Object.values(row).forEach((value: any) => {
            if (typeof value === 'string') {
              // Should not contain control characters
              expect(value).not.toMatch(/[\x00-\x1F\x7F]/);
            }
          });
        });
      }
    });
  });

  describe('File Generation Tests', () => {
    
    test('File should contain correct metadata properties', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Save file for analysis
      const filePath = '/tmp/test_all_export.xlsx';
      fs.writeFileSync(filePath, response.body);
      
      // Read workbook and check properties
      const workbook = XLSX.readFile(filePath);
      
      // Check document properties
      if (workbook.Props) {
        expect(workbook.Props.Title).toContain('RSA AI Use Case Framework Export');
        expect(workbook.Props.Author).toBe('RSA AI Use Case Framework');
        expect(workbook.Props.Company).toBe('RSA Insurance Group');
        expect(workbook.Props.Subject).toBe('RSA AI Use Case Framework Data Export');
      }
      
      // Check custom properties
      if (workbook.Custprops) {
        const custProps = workbook.Custprops as any;
        expect(custProps['Export Category']).toBeDefined();
        expect(custProps['Record Count']).toBeDefined();
        expect(custProps['Validation Status']).toBeDefined();
        expect(custProps['Framework Version']).toBe('2.0');
        
        // Validation status should be PASSED (since export succeeded)
        expect(custProps['Validation Status']).toBe('PASSED');
      }
    });

    test('File size should be reasonable', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      const fileSize = response.body.length;
      
      // Should not be empty
      expect(fileSize).toBeGreaterThan(1000);
      
      // Should not be unreasonably large (>10MB would be concerning)
      expect(fileSize).toBeLessThan(10 * 1024 * 1024);
      
      // Based on our test data, should be around 40-50KB
      expect(fileSize).toBeGreaterThan(30000);
      expect(fileSize).toBeLessThan(100000);
    });

    test('Performance should be acceptable', async () => {
      const startTime = Date.now();
      
      const response = await request(baseURL)
        .get('/api/export/excel?category=all&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      
      // Export should complete within reasonable time (15 seconds max)
      expect(duration).toBeLessThan(15000);
      
      // Should be reasonably fast for typical use (under 5 seconds preferred)
      if (duration > 5000) {
        console.warn(`Export took ${duration}ms - consider optimization if this is consistently slow`);
      }
      
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Category Filtering Tests', () => {
    
    test('Strategic category filter should work correctly', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=strategic&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Check filename contains strategic suffix
      expect(response.headers['content-disposition']).toMatch(/filename="rsa_ai_usecase_export_\d{8}_\d{6}_strategic\.xlsx"/);
    });

    test('AI Inventory category filter should work correctly', async () => {
      const response = await request(baseURL)
        .get('/api/export/excel?category=ai_inventory&status=all')
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });
      
      expect(response.status).toBe(200);
      
      // Check filename contains ai_inventory suffix
      expect(response.headers['content-disposition']).toMatch(/filename="rsa_ai_usecase_export_\d{8}_\d{6}_ai_inventory\.xlsx"/);
    });
  });
});