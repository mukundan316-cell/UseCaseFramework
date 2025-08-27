/**
 * Application Configuration Constants
 * Centralized configuration to replace hardcoded magic numbers
 */

export const APP_CONFIG = {
  // Mobile breakpoint
  MOBILE_BREAKPOINT: 768,

  // PDF Generation
  PDF: {
    MARGINS: {
      TOP: 80,
      BOTTOM: 80,
      LEFT: 60,
      RIGHT: 60,
    },
    BRAND_COLORS: {
      PRIMARY: '#005DAA', // RSA Blue
      SECONDARY: '#F5F5F5', // Light gray
      BACKGROUND: '#F8F9FA',
      WHITE: '#FFFFFF',
      TEXT_PRIMARY: '#333333',
    },
    FONTS: {
      PRIMARY: 'Helvetica',
      BOLD: 'Helvetica-Bold',
    },
    SIZES: {
      PAGE_WIDTH: 595.28,
      LOGO_SIZE: 40,
      HEADER_HEIGHT: 60,
      FOOTER_HEIGHT: 60,
      QR_CODE_SIZE: 80,
    },
    FONT_SIZES: {
      TITLE: 16,
      SUBTITLE: 14,
      BODY: 11,
      SMALL: 8,
    },
    LINE_HEIGHT: 15,
  },

  // Scoring system
  SCORING: {
    MIN_SCORE: 1,
    MAX_SCORE: 5,
    DEFAULT_THRESHOLD: 3.0,
    DEFAULT_WEIGHTS: {
      REVENUE_IMPACT: 20,
      COST_SAVINGS: 20,
      RISK_REDUCTION: 20,
      BROKER_PARTNER_EXPERIENCE: 20,
      STRATEGIC_FIT: 20,
      DATA_READINESS: 20,
      TECHNICAL_COMPLEXITY: 20,
      CHANGE_IMPACT: 20,
      MODEL_RISK: 20,
      ADOPTION_READINESS: 20,
    },
  },

  // Executive Dashboard (LEGO principle: centralized configuration)
  EXECUTIVE_DASHBOARD: {
    MATRIX_PLOT: {
      MIN_BUBBLE_SIZE: 10, // Start smaller for more dramatic range
      MAX_BUBBLE_SIZE: 40, // Much larger for maximum visual impact  
      DEFAULT_BUBBLE_SIZE: 20,
      HIGH_VALUE_THRESHOLD: 4.0,
      LOW_EFFORT_THRESHOLD: 2.0,
    },
    COLORS: {
      QUADRANTS: {
        QUICK_WIN: '#10B981',
        STRATEGIC_BET: '#3B82F6', 
        EXPERIMENTAL: '#F59E0B',
        WATCHLIST: '#EF4444',
        DEFAULT: '#6B7280',
      },
    },
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  },

  // Time estimation multipliers
  TIME_ESTIMATION: {
    MIN_MULTIPLIER: 2.5,
    MAX_MULTIPLIER: 4,
  },

  // Validation limits - more user-friendly
  VALIDATION: {
    TEXT_MAX_LENGTH: 1000,
    DESCRIPTION_MAX_LENGTH: 5000,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10, // Reduced from 500 to be more reasonable
    SHORT_DESCRIPTION_MAX: 250,
  },

  // User experience enhancements
  UX: {
    DEBOUNCE_DELAY: 300, // ms for search/filter debouncing
    ANIMATION_DURATION: 200, // ms for smooth transitions
    TOOLTIP_DELAY: 500, // ms before showing tooltips
  },

  // Excel export
  EXCEL: {
    DEFAULT_COLUMN_WIDTHS: {
      TITLE: 25,
      DESCRIPTION: 20,
      PROCESS: 15,
      SCORE: 10,
      STATUS: 8,
    },
  },

  // UI spacing and animations
  UI: {
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 5000,
  },
} as const;

// Type exports for better type safety
export type AppConfig = typeof APP_CONFIG;
export type PDFConfig = typeof APP_CONFIG.PDF;
export type ScoringConfig = typeof APP_CONFIG.SCORING;