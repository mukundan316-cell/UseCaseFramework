import { db } from './db';
import { metadataConfig } from '@shared/schema';
import { eq } from "drizzle-orm";

/**
 * Minimal seeding for pristine database - metadata structure only
 * No automatic use case seeding - user will add via UI/Excel import
 */
export async function seedDatabase() {
  try {
    // Check if metadata exists
    const existingMetadata = await db.select().from(metadataConfig);
    
    // Only seed metadata if NO metadata exists (completely fresh database)
    if (existingMetadata.length === 0) {
      console.log('Fresh database detected, seeding minimal metadata...');
      await seedMetadataConfig();
    } else {
      console.log('Existing metadata found, preserving user data...');
    }
    
    // NO automatic use case seeding - user will add via UI/Excel import
    console.log('Use case database ready for user input');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

/**
 * Seeds minimal metadata configuration for app structure only
 * User will customize processes, activities, and other metadata via UI
 */
async function seedMetadataConfig() {
  try {
    console.log("Creating minimal metadata structure for fresh database...");

    // Insert minimal default metadata configuration - user will customize via UI
    await db.insert(metadataConfig).values({
      id: 'default',
      valueChainComponents: [
        "Risk Assessment & Underwriting",
        "Customer Experience & Distribution", 
        "Claims Management & Settlement",
        "Risk Consulting & Prevention",
        "Portfolio Management & Analytics"
      ],
      processes: [], // Empty - user will add via UI
      activities: [], // Empty - user will add via UI
      processActivities: {}, // Empty - user will add via UI
      linesOfBusiness: ["All Commercial", "Property & Casualty", "Specialty"],
      businessSegments: ["SME", "Mid-Market", "Large Commercial"],
      geographies: ["UK", "Europe", "Global"],
      useCaseTypes: ["Analytics & Insights", "Process Automation", "GenAI", "Predictive ML"],
      sourceTypes: ["rsa_internal", "industry_standard", "ai_inventory"],
      quadrants: ["Quick Win", "Strategic Bet", "Experimental", "Watchlist"],
      useCaseStatuses: ["Discovery", "Backlog", "In-flight", "Implemented", "On Hold"],
      aiMlTechnologies: [
        "Machine Learning",
        "Deep Learning", 
        "Natural Language Processing",
        "Computer Vision",
        "Predictive Analytics",
        "Large Language Models",
        "Reinforcement Learning",
        "Rule-based Systems"
      ],
      dataSources: [
        "Policy Database",
        "Claims Database", 
        "Customer Database",
        "External APIs",
        "Third-party Data",
        "Real-time Feeds",
        "Historical Data",
        "Regulatory Data",
        "Broker Data & Feeds"
      ],
      stakeholderGroups: [
        "Underwriting Teams",
        "Claims Teams",
        "IT/Technology",
        "Business Analytics",
        "Risk Management",
        "Product Management",
        "Customer Service",
        "Sales & Distribution",
        "Executive Leadership",
        "Regulatory & Compliance"
      ],
      horizontalUseCaseTypes: [
        "Customer Experience Enhancement",
        "Operational Efficiency",
        "Risk & Compliance Management", 
        "Revenue & Growth Optimization",
        "Data & Analytics Enablement"
      ],
      questionTypes: [
        "text",
        "textarea", 
        "select",
        "multi_select",
        "radio",
        "checkbox",
        "number",
        "date",
        "email",
        "url"
      ],
      responseStatuses: [
        "started",
        "in_progress", 
        "completed",
        "abandoned"
      ],
      questionCategories: [
        "Strategic Foundation",
        "AI Capabilities",
        "Use Case Discovery",
        "Technology Infrastructure", 
        "Organizational Readiness",
        "Risk & Compliance"
      ],
      companyTiers: [
        "Small (<£100M)",
        "Mid (£100M-£3B)",
        "Large (>£3B)"
      ],
      marketOptions: [
        "Personal Lines",
        "Commercial Lines",
        "Specialty Lines",
        "Reinsurance"
      ],
      scoringModel: {
        businessValue: {
          revenueImpact: 20,
          costSavings: 20,
          riskReduction: 20,
          brokerPartnerExperience: 20,
          strategicFit: 20
        },
        feasibility: {
          dataReadiness: 20,
          technicalComplexity: 20,
          changeImpact: 20,
          modelRisk: 20,
          adoptionReadiness: 20
        },
        quadrantThreshold: 3.0
      }
    });
    
    console.log("✅ Minimal metadata configuration seeded - ready for user customization");
  } catch (error) {
    console.error('Error seeding metadata config:', error);
  }
}