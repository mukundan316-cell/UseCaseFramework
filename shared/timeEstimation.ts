/**
 * Time Estimation Constants
 * Centralized constants for consistent time estimation across the entire application
 */

export const TIME_ESTIMATION = {
  /**
   * Time multipliers for question-based estimation
   * Used for calculating estimated completion time based on question count
   */
  MIN_MULTIPLIER: 2.5, // Minimum minutes per question
  MAX_MULTIPLIER: 4,   // Maximum minutes per question
  
  /**
   * Calculate time estimation range for given question count
   * @param questionCount - Number of questions
   * @returns Object with min and max time estimates in minutes
   */
  calculateRange: (questionCount: number) => ({
    min: Math.ceil(questionCount * TIME_ESTIMATION.MIN_MULTIPLIER),
    max: Math.ceil(questionCount * TIME_ESTIMATION.MAX_MULTIPLIER)
  }),
  
  /**
   * Format time estimation as a readable string
   * @param questionCount - Number of questions  
   * @returns Formatted string like "15-24 min"
   */
  formatRange: (questionCount: number): string => {
    const { min, max } = TIME_ESTIMATION.calculateRange(questionCount);
    return `${min}-${max} min`;
  }
} as const;