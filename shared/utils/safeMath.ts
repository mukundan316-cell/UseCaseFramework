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

/**
 * Safely converts string boolean to actual boolean (for existing string-based system)
 */
export function safeBooleanFromString(value: string | boolean | null | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

/**
 * Safely converts boolean to string (for existing string-based system)
 */
export function safeBooleanToString(value: boolean | string | null | undefined): string {
  if (typeof value === 'string') return value === 'true' ? 'true' : 'false';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return 'false';
}

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
 * Validates score is within 1-5 range
 */
export function validateScoreRange(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

/**
 * Enhanced null-safe array parsing (extends existing parseArrayField pattern)
 */
export function safeArrayParse(field: string[] | string | null | undefined): string[] {
  if (!field) return [];
  
  // Already an array
  if (Array.isArray(field)) {
    return field.filter(item => item && typeof item === 'string' && item.trim() !== '');
  }
  
  // String that might be JSON
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item === 'string' && item.trim() !== '');
      }
      return field.trim() !== '' ? [field] : [];
    } catch {
      // Not JSON, treat as single item
      return field.trim() !== '' ? [field] : [];
    }
  }
  
  return [];
}