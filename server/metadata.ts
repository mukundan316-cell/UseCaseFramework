import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { MetadataConfig } from '@shared/schema';

const FILTERS_PATH = join(process.cwd(), 'data', 'filters.json');

/**
 * Loads metadata configuration from JSON file
 * Implements metadata-driven design principle from REFERENCE.md
 */
export function loadMetadata(): MetadataConfig {
  try {
    const data = readFileSync(FILTERS_PATH, 'utf8');
    return JSON.parse(data) as MetadataConfig;
  } catch (error) {
    console.error('Error loading metadata from filters.json:', error);
    // Fallback to defaults if file doesn't exist
    return getDefaultMetadata();
  }
}

/**
 * Saves metadata configuration to JSON file
 * Enables admin panel to persist changes
 */
export function saveMetadata(metadata: MetadataConfig): void {
  try {
    writeFileSync(FILTERS_PATH, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error saving metadata to filters.json:', error);
    throw new Error('Failed to save metadata configuration');
  }
}

/**
 * Default metadata configuration as fallback
 * Used only when filters.json is not available
 */
function getDefaultMetadata(): MetadataConfig {
  return {
    id: 'default',
    valueChainComponents: [
      "Claims", "Underwriting", "Policy Servicing", "Distribution",
      "Product Development", "IT Operations", "Fraud/Compliance", "Customer Service"
    ],
    processes: ["FNOL", "Quote & Bind", "Pricing", "Renewal", "Subrogation"],
    linesOfBusiness: ["Auto", "Property", "Marine", "Life", "Cyber", "Specialty"],
    businessSegments: ["Mid-Market", "Large Commercial", "SME", "E&S"],
    geographies: ["UK", "Europe", "Global", "North America"],
    useCaseTypes: ["GenAI", "Predictive ML", "NLP", "RPA"],
    activities: [],
    sourceTypes: ["rsa_internal", "industry_standard", "imported", "consolidated_database", "ai_inventory"],
    // RSA AI Value Matrix quadrants
    quadrants: ["Quick Win", "Strategic Bet", "Experimental", "Watchlist"],
    // Assessment and questionnaire LOVs
    questionTypes: ["text", "textarea", "select", "multi_select", "radio", "checkbox", "number", "date", "email", "url", "company_profile", "business_lines_matrix", "smart_rating", "multi_rating", "percentage_allocation", "percentage_target", "ranking", "currency", "department_skills_matrix", "business_performance", "composite", "dynamic_use_case_selector"],
    responseStatuses: ["started", "in_progress", "completed", "abandoned"],
    // Company profile options  
    companyTiers: ["Small (<£100M)", "Mid (£100M-£3B)", "Large (>£3B)"],
    marketOptions: ["Personal Lines", "Commercial Lines", "Specialty Lines", "Reinsurance"],
    // AI inventory governance fields
    useCaseStatuses: ["Active", "Obsolete", "Pending Closure", "Proof of Concept", "Discovery"],
    aiMlTechnologies: ["AI", "Model", "ML", "GenAI", "NLP"],
    dataSources: ["Internal Data", "External Data", "Aggregated Data", "Public Data"],
    stakeholderGroups: ["IT Operations", "Business Users", "Risk Management", "Compliance"],
    processActivities: null,
    scoringModel: null,
    updatedAt: new Date()
  };
}