// Process-Activity mapping for RSA commercial insurance operations
export const processActivityMap: Record<string, string[]> = {
  "Submission & Quote": [
    "Risk Analysis", 
    "Cat Modeling", 
    "Market Analysis", 
    "Pricing", 
    "Pipelining"
  ],
  
  "Underwriting": [
    "Risk Assessment", 
    "Rating", 
    "Quality Assurance", 
    "Contract Certainty", 
    "Exposure Management"
  ],
  
  "Claims Management": [
    "Claims Processing", 
    "Expert Settlement", 
    "Loss Fund Management", 
    "Subrogation", 
    "Claims Analysis"
  ],
  
  "Risk Consulting": [
    "Risk Evaluation", 
    "Compliance Verification", 
    "Advisory Services", 
    "Risk Monitoring"
  ],
  
  "Reinsurance": [
    "R/I Transactions", 
    "Contract Charging", 
    "Reinsurance Messages", 
    "Manual Adjustments"
  ],
  
  "Regulatory & Compliance": [
    "Regulatory Reporting", 
    "Sanctions Check", 
    "Lloyds Compliance", 
    "Licensing Check"
  ],
  
  "Financial Management": [
    "Accounting", 
    "Credit Control", 
    "Payment Processing", 
    "Financial Reporting"
  ],
  
  "Sales & Distribution": [
    "Lead Generation", 
    "Broker Relations", 
    "Channel Management", 
    "Sales Support", 
    "Market Development"
  ],
  
  "Customer Servicing": [
    "Customer Support", 
    "Account Management", 
    "Service Delivery", 
    "Relationship Management", 
    "Issue Resolution"
  ],
  
  "Policy Servicing": [
    "Policy Issuance", 
    "Booking & Recording", 
    "Document Management", 
    "Renewal Processing", 
    "Contract Management"
  ]
};

/**
 * Gets available activities for a selected process
 * @param process - The selected business process
 * @returns Array of relevant activities or empty array if no process selected
 */
export function getActivitiesForProcess(process: string): string[] {
  if (!process) return [];
  return processActivityMap[process] || [];
}

/**
 * Gets all unique activities across all processes
 * @returns Array of all available activities
 */
export function getAllActivities(): string[] {
  return Object.values(processActivityMap).flat();
}