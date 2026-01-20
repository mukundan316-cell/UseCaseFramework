/**
 * Time Estimation Utilities
 * Formula-driven from database configuration per replit.md
 */

export interface TimeEstimationConfig {
  minMultiplier: number;
  maxMultiplier: number;
}

/**
 * Calculate time estimation range for given question count
 * Uses DB-persisted multipliers from metadata_config.timeEstimationConfig
 */
export function calculateTimeRange(
  questionCount: number,
  config: TimeEstimationConfig
): { min: number; max: number } {
  return {
    min: Math.ceil(questionCount * config.minMultiplier),
    max: Math.ceil(questionCount * config.maxMultiplier)
  };
}

/**
 * Format time estimation as a readable string
 */
export function formatTimeRange(
  questionCount: number,
  config: TimeEstimationConfig
): string {
  const { min, max } = calculateTimeRange(questionCount, config);
  return `${min}-${max} min`;
}

/**
 * Default config - only used as fallback when DB config unavailable
 * Prefer loading from metadata_config.timeEstimationConfig
 */
export const DEFAULT_TIME_ESTIMATION_CONFIG: TimeEstimationConfig = {
  minMultiplier: 2.5,
  maxMultiplier: 4
};

/**
 * Convenience wrapper for client-side usage
 * Uses default config for backward compatibility
 * Prefer fetching config from API for DB-driven values
 */
export const TIME_ESTIMATION = {
  formatRange: (questionCount: number, config = DEFAULT_TIME_ESTIMATION_CONFIG) =>
    formatTimeRange(questionCount, config)
};
