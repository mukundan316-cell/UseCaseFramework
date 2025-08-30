import { db } from './db';
import { useCases, metadataConfig } from '@shared/schema';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';
import { eq } from "drizzle-orm";

const sampleUseCases = [
  {
    title: "Automated Claims Triage",
    description: "AI-powered system to automatically classify and prioritize incoming claims based on complexity, urgency, and potential fraud indicators.",
    valueChainComponent: "Claims",
    process: "FNOL",
    lineOfBusiness: "Auto",
    businessSegment: "Mid-Market",
    geography: "UK",
    useCaseType: "GenAI",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 5,
    brokerPartnerExperience: 3,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 2,
    modelRisk: 3,
    adoptionReadiness: 3,
    explainabilityBias: 4,
    regulatoryCompliance: 4
  },
  {
    title: "Predictive Risk Scoring",
    description: "Machine learning model to predict policy risk levels during underwriting, improving pricing accuracy and reducing losses.",
    valueChainComponent: "Underwriting",
    process: "Pricing",
    lineOfBusiness: "Property",
    businessSegment: "Large Commercial",
    geography: "Europe",
    useCaseType: "Predictive ML",
    revenueImpact: 5,
    costSavings: 3,
    riskReduction: 5,
    brokerPartnerExperience: 4,
    strategicFit: 5,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 4,
    modelRisk: 4,
    adoptionReadiness: 2,
    explainabilityBias: 3,
    regulatoryCompliance: 5
  },
  {
    title: "Document Processing Automation",
    description: "OCR and NLP solution to extract key information from policy documents, reducing manual data entry errors and processing time.",
    valueChainComponent: "Policy Servicing",
    process: "Quote & Bind",
    lineOfBusiness: "Marine",
    businessSegment: "SME",
    geography: "Global",
    useCaseType: "RPA",
    revenueImpact: 2,
    costSavings: 5,
    riskReduction: 3,
    brokerPartnerExperience: 3,
    strategicFit: 3,
    dataReadiness: 5,
    technicalComplexity: 2,
    changeImpact: 2,
    modelRisk: 2,
    adoptionReadiness: 4,
    explainabilityBias: 2,
    regulatoryCompliance: 3
  },
  {
    title: "Customer Sentiment Analysis",
    description: "NLP tool to analyze customer communications and social media mentions to identify satisfaction trends and potential churn risks.",
    valueChainComponent: "Customer Service",
    process: "Renewal",
    lineOfBusiness: "Life",
    businessSegment: "E&S",
    geography: "North America",
    useCaseType: "NLP",
    revenueImpact: 3,
    costSavings: 2,
    riskReduction: 4,
    brokerPartnerExperience: 4,
    strategicFit: 3,
    dataReadiness: 2,
    technicalComplexity: 3,
    changeImpact: 3,
    modelRisk: 2,
    adoptionReadiness: 2,
    explainabilityBias: 3,
    regulatoryCompliance: 3
  },
  {
    title: "Cyber Risk Assessment AI",
    description: "Advanced AI system to evaluate cyber risk exposure for commercial clients using external threat intelligence and internal data.",
    valueChainComponent: "Underwriting",
    process: "Pricing",
    lineOfBusiness: "Cyber",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "GenAI",
    revenueImpact: 5,
    costSavings: 3,
    riskReduction: 5,
    brokerPartnerExperience: 4,
    strategicFit: 5,
    dataReadiness: 2,
    technicalComplexity: 5,
    changeImpact: 5,
    modelRisk: 4,
    adoptionReadiness: 2,
    explainabilityBias: 3,
    regulatoryCompliance: 5
  },
  {
    title: "Fraud Detection Engine",
    description: "Real-time machine learning system to identify potentially fraudulent claims using pattern recognition and anomaly detection.",
    valueChainComponent: "Fraud/Compliance",
    process: "FNOL",
    lineOfBusiness: "Specialty",
    businessSegment: "Mid-Market",
    geography: "UK",
    useCaseType: "Predictive ML",
    revenueImpact: 4,
    costSavings: 4,
    riskReduction: 5,
    brokerPartnerExperience: 3,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 3,
    modelRisk: 3,
    adoptionReadiness: 3,
    explainabilityBias: 4,
    regulatoryCompliance: 5
  }
];

export async function seedDatabase() {
  try {
    // Check if data already exists - both use cases AND metadata
    const existingUseCases = await db.select().from(useCases);
    const existingMetadata = await db.select().from(metadataConfig);
    
    if (existingUseCases.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Only seed if NO metadata exists (completely fresh database)
    if (existingMetadata.length === 0) {
      console.log('Fresh database detected, seeding minimal metadata...');
      await seedMetadataConfig();
    } else {
      console.log('Existing metadata found, preserving user data...');
      return;
    }

    console.log('Seeding database with sample use cases...');
    
    for (const sampleUseCase of sampleUseCases) {
      const impactScore = calculateImpactScore(
        sampleUseCase.revenueImpact,
        sampleUseCase.costSavings,
        sampleUseCase.riskReduction,
        sampleUseCase.brokerPartnerExperience,
        sampleUseCase.strategicFit
      );
      
      const effortScore = calculateEffortScore(
        sampleUseCase.dataReadiness,
        sampleUseCase.technicalComplexity,
        sampleUseCase.changeImpact,
        sampleUseCase.modelRisk,
        sampleUseCase.adoptionReadiness
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore);
      
      await db.insert(useCases).values({
        ...sampleUseCase,
        impactScore,
        effortScore,
        quadrant
      });
    }
    
    console.log(`Successfully seeded ${sampleUseCases.length} use cases`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

/**
 * Seeds metadata configuration to database for REFERENCE.md compliance
 * Ensures all filter data is database-persisted, not hardcoded
 */
async function seedMetadataConfig() {
  try {
    // MINIMAL metadata seeding - only essential structure for app to function
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
      useCaseStatuses: ["Discovery", "Backlog", "In-flight", "Implemented", "On Hold"]
    });
    
    console.log("Seeded metadata configuration successfully");
  } catch (error) {
    console.error('Error seeding metadata config:', error);
  }
}