import { db } from '../db';
import { metadataConfig } from '@shared/schema';
import { eq } from "drizzle-orm";

/**
 * Updates metadata configuration with process-activity mapping
 * This makes the process-activity relationships database-driven and reusable
 */
export async function migrateProcessActivities() {
  try {
    const processActivitiesMapping = {
      "Submission & Quote": [
        "Risk Analysis", "Cat Modeling", "Market Analysis", "Pricing", "Pipelining"
      ],
      "Underwriting": [
        "Risk Assessment", "Rating", "Quality Assurance", "Contract Certainty", "Exposure Management"
      ],
      "Claims Management": [
        "Claims Processing", "Expert Settlement", "Loss Fund Management", "Subrogation", "Claims Analysis"
      ],
      "Risk Consulting": [
        "Risk Evaluation", "Compliance Verification", "Advisory Services", "Risk Monitoring"
      ],
      "Reinsurance": [
        "R/I Transactions", "Contract Charging", "Reinsurance Messages", "Manual Adjustments"
      ],
      "Regulatory & Compliance": [
        "Regulatory Reporting", "Sanctions Check", "Lloyds Compliance", "Licensing Check"
      ],
      "Financial Management": [
        "Accounting", "Credit Control", "Payment Processing", "Financial Reporting"
      ],
      "Sales & Distribution": [
        "Lead Generation", "Broker Relations", "Channel Management", "Sales Support", "Market Development"
      ],
      "Customer Servicing": [
        "Customer Support", "Account Management", "Service Delivery", "Relationship Management", "Issue Resolution"
      ],
      "Policy Servicing": [
        "Policy Issuance", "Booking & Recording", "Document Management", "Renewal Processing", "Contract Management"
      ]
    };

    // Get current metadata
    const [existingConfig] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, 'default'));
    
    if (existingConfig) {
      // Update with process-activity mapping
      await db.update(metadataConfig)
        .set({
          processActivities: processActivitiesMapping,
          processes: Object.keys(processActivitiesMapping),
          activities: Object.values(processActivitiesMapping).flat(),
          updatedAt: new Date()
        })
        .where(eq(metadataConfig.id, 'default'));
        
      console.log("✅ Process-activity mapping updated in metadata");
    } else {
      // Create new metadata with process-activity mapping
      await db.insert(metadataConfig).values({
        id: 'default',
        valueChainComponents: [
          "Risk Assessment & Underwriting",
          "Customer Experience & Distribution", 
          "Claims Management & Settlement",
          "Risk Consulting & Prevention",
          "Portfolio Management & Analytics"
        ],
        processes: Object.keys(processActivitiesMapping),
        linesOfBusiness: [
          "Property & Real Estate",
          "Marine & Transportation",
          "Construction & Engineering", 
          "Professional & Financial",
          "Renewable Energy",
          "Motor & Fleet",
          "Liability & Risk",
          "Accident & Health",
          "Rail",
          "Non-Profit Organizations"
        ],
        businessSegments: [
          "Large Corporates",
          "Mid-Market", 
          "Small Businesses",
          "Delegated Authority"
        ],
        geographies: [
          "UK Domestic",
          "UK Regions",
          "London Market",
          "European Markets", 
          "Global Network",
          "International/Multinational"
        ],
        useCaseTypes: [
          "Analytics & Insights",
          "Process Automation",
          "Customer Experience",
          "Risk Intelligence"
        ],
        activities: Object.values(processActivitiesMapping).flat(),
        processActivities: processActivitiesMapping
      });
      
      console.log("✅ Created new metadata with process-activity mapping");
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating process activities:', error);
    return false;
  }
}