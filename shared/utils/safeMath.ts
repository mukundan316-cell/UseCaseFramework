/**
 * Safe Math Utilities - Enhanced calculation safety without breaking existing logic
 * Following replit.md principle: "Build Once, Reuse Everywhere"
 */

/**
 * Safely calculates average from array of numbers with null/undefined protection
 */
export function safeAverage(values: (number | null | undefined)[]): number {
  const validValues = values.filter((v): v is number => 
    v != null && !isNaN(v) && isFinite(v)
  );
  
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const result = sum / validValues.length;
  
  // Ensure result is within valid bounds (0-5 for scoring)
  return Math.max(0, Math.min(5, result));
}

/**
 * Safely calculates sum with bounds checking
 */
export function safeSum(values: (number | null | undefined)[]): number {
  const validValues = values.filter((v): v is number => 
    v != null && !isNaN(v) && isFinite(v)
  );
  
  const result = validValues.reduce((acc, val) => acc + val, 0);
  return Math.max(0, result);
}

// Boolean utility functions removed - now using consistent string enums throughout

/**
 * Safe number parsing with default value
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  
  return defaultValue;
}

/**
 * Validates score is within 0-5 range with decimal precision
 * FIXED: Remove Math.round() to preserve calculated score precision (3.8, 2.6 etc.)
 */
export function validateScoreRange(value: number): number {
  return Math.max(0, Math.min(5, value));
}

/**
 * UNIFIED ARRAY PARSER - Consolidates all array parsing logic following "Build Once, Reuse Everywhere"
 * Handles: JSON arrays, semicolon/comma-separated strings, single values, null/undefined
 * Used by: UseCaseDataExtractor, ExcelImportService, ExcelExportService
 */
export function safeArrayParse(field: string[] | string | null | undefined): string[] {
  if (!field) return [];
  
  // Already an array - filter out empty/invalid items
  if (Array.isArray(field)) {
    return field.filter(item => item && typeof item === 'string' && item.trim() !== '');
  }
  
  // String processing
  if (typeof field === 'string') {
    const trimmed = field.trim();
    if (trimmed === '') return [];
    
    // Try JSON parsing first (database storage format)
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item === 'string' && item.trim() !== '');
      }
      // JSON but not array, treat as single item
      return [String(parsed)].filter(s => s.trim() !== '');
    } catch {
      // Not JSON - handle Excel/CSV format (semicolon preferred, comma fallback)
      const separator = trimmed.includes(';') ? ';' : ',';
      if (trimmed.includes(separator)) {
        return trimmed.split(separator).map(s => s.trim()).filter(s => s.length > 0);
      }
      // Single value
      return [trimmed];
    }
  }
  
  return [];
}