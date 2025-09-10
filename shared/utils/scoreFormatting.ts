/**
 * Score Formatting Utilities - Centralized rounding logic (LEGO principle)
 * Following replit.md: "Build Once, Reuse Everywhere"
 * Ensures consistent display and threshold logic for all scoring operations
 */

/**
 * Standard score precision used across the application
 * Consistent with display formatting (1 decimal place)
 */
export const SCORE_PRECISION = 1;

/**
 * Rounds a score to standard application precision
 * Used for both display formatting AND threshold comparisons
 * Ensures "What You See Is What You Get" principle
 */
export function roundScore(score: number): number {
  return Math.round(score * Math.pow(10, SCORE_PRECISION)) / Math.pow(10, SCORE_PRECISION);
}

/**
 * Formats a score for display with consistent precision
 * Replaces scattered .toFixed(1) calls throughout the app
 */
export function formatScore(score: number): string {
  return roundScore(score).toFixed(SCORE_PRECISION);
}

/**
 * Compares a score against a threshold using rounded values
 * Ensures threshold logic matches display formatting
 * Critical for high-value classification consistency
 */
export function isScoreAboveThreshold(score: number, threshold: number): boolean {
  return roundScore(score) >= roundScore(threshold);
}

/**
 * Compares a score against a threshold using rounded values (less than or equal)
 * For low-effort classification and similar use cases
 */
export function isScoreBelowOrEqualThreshold(score: number, threshold: number): boolean {
  return roundScore(score) <= roundScore(threshold);
}