/**
 * Enhanced Data Validation Utilities
 * Strengthens existing validation without breaking current architecture
 * Following replit.md principle: "Build Once, Reuse Everywhere"
 */

import { z } from 'zod';
import { safeNumber, validateScoreRange } from './safeMath';

/**
 * Clean boolean validation - consistent string enums (no transformations needed)
 */
export const cleanBooleanValidation = z.enum(['true', 'false']);

/**
 * Enhanced score validation with range constraints
 */
export const enhancedScoreValidation = z.union([
  z.number().min(1).max(5),
  z.null(),
  z.undefined()
]).transform(val => val != null ? validateScoreRange(safeNumber(val)) : val);

/**
 * Safe array validation that handles various input formats
 */
export const enhancedArrayValidation = z.union([
  z.array(z.string()),
  z.string().transform(str => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim()) : [str];
    } catch {
      return str.trim() ? [str] : [];
    }
  }),
  z.null(),
  z.undefined()
]).transform(val => val || []);

/**
 * Enhanced text validation with length constraints
 */
export const enhancedTextValidation = z.string()
  .min(1, "Field is required")
  .max(500, "Text must be less than 500 characters")
  .transform(val => val.trim());

/**
 * Safe ID validation
 */
export const enhancedIdValidation = z.string()
  .min(1, "ID is required")
  .regex(/^[a-zA-Z0-9\-_]+$/, "ID must contain only alphanumeric characters, hyphens, and underscores");

/**
 * Validates use case data before database operations
 */
export function validateUseCaseData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required field validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  // Score validation (if provided)
  ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
   'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness'].forEach(field => {
    if (data[field] != null) {
      const score = safeNumber(data[field]);
      if (score < 1 || score > 5) {
        errors.push(`${field} must be between 1 and 5`);
      }
    }
  });
  
  // Boolean field validation - consistent string enum validation
  ['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
   'thirdPartyModel', 'humanAccountability'].forEach(field => {
    if (data[field] != null) {
      const value = data[field];
      if (typeof value === 'string' && !['true', 'false'].includes(value)) {
        errors.push(`${field} must be 'true' or 'false'`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Safely prepares data for database insertion/update
 */
export function prepareDataForDatabase(data: any): any {
  const cleanData: any = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }
    
    // Handle empty strings
    if (value === '') {
      return; // Skip empty strings
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      const cleanArray = value.filter(item => item && typeof item === 'string' && item.trim());
      if (cleanArray.length > 0) {
        cleanData[key] = cleanArray;
      }
      return;
    }
    
    // Handle scores
    if (['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit',
         'dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness',
         'impactScore', 'effortScore', 'manualImpactScore', 'manualEffortScore'].includes(key)) {
      const score = safeNumber(value);
      if (score > 0) {
        cleanData[key] = validateScoreRange(score);
      }
      return;
    }
    
    // Handle boolean string fields - pass through valid string values
    if (['isActiveForRsa', 'isDashboardVisible', 'explainabilityRequired', 'dataOutsideUkEu', 
         'thirdPartyModel', 'humanAccountability'].includes(key)) {
      if (typeof value === 'string' && ['true', 'false'].includes(value)) {
        cleanData[key] = value;
      }
      return;
    }
    
    // Handle regular values
    cleanData[key] = value;
  });
  
  return cleanData;
}

/**
 * Error boundary helper for safe data operations
 */
export function safeDataOperation<T>(operation: () => T, fallback: T, errorContext: string): T {
  try {
    return operation();
  } catch (error) {
    console.warn(`Safe data operation failed in ${errorContext}:`, error);
    return fallback;
  }
}