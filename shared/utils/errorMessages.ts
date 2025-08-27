/**
 * User-friendly error messages for common validation scenarios
 * Provides context-aware feedback to improve user experience
 */

export const ERROR_MESSAGES = {
  VALIDATION: {
    TITLE_REQUIRED: "Please enter a title for your use case",
    TITLE_TOO_LONG: "Title must be under 100 characters for readability",
    DESCRIPTION_TOO_SHORT: "Please provide at least 10 characters to describe your use case",
    DESCRIPTION_TOO_LONG: "Description is too long - please keep it under 500 characters",
    SCORE_OUT_OF_RANGE: "Scores must be between 1 and 5",
    REQUIRED_FIELD: (field: string) => `${field} is required to calculate your AI value score`,
  },
  
  CALCULATION: {
    INVALID_SCORE: "Unable to calculate score - please check all input values are between 1-5",
    MISSING_WEIGHTS: "Score calculation failed - using default weights instead",
  },

  NETWORK: {
    SAVE_FAILED: "Unable to save changes - please check your connection and try again",
    LOAD_FAILED: "Unable to load data - please refresh the page",
    TIMEOUT: "Request timed out - please try again",
  },

  GENERAL: {
    UNEXPECTED_ERROR: "Something went wrong - please try again or contact support",
    PERMISSION_DENIED: "You don't have permission to perform this action",
  }
} as const;

/**
 * Creates a user-friendly error message from a technical error
 */
export function createUserFriendlyMessage(
  error: Error | string,
  context?: string
): string {
  const errorText = typeof error === 'string' ? error : error.message;
  
  // Map common technical errors to user-friendly messages
  if (errorText.includes('validation')) {
    return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD(context || 'field');
  }
  
  if (errorText.includes('network') || errorText.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK.LOAD_FAILED;
  }
  
  if (errorText.includes('timeout')) {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }
  
  // Fall back to generic message for unknown errors
  return ERROR_MESSAGES.GENERAL.UNEXPECTED_ERROR;
}