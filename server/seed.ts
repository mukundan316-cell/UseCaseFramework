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
    // Check if data already exists
    const existingUseCases = await db.select().from(useCases);
    if (existingUseCases.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Seed metadata configuration first (database-first compliance)
    await seedMetadataConfig();

    console.log('Seeding database with sample use cases...');
    
    for (const sampleUseCase of sampleUseCases) {
      const impactScore = calculateImpactScore(
        sampleUseCase.revenueImpact,
        sampleUseCase.costSavings,
        sampleUseCase.riskReduction,
        sampleUseCase.brokerPartnerExperience || 3,
        sampleUseCase.strategicFit
      );
      
      const effortScore = calculateEffortScore(
        sampleUseCase.dataReadiness,
        sampleUseCase.technicalComplexity,
        sampleUseCase.changeImpact,
        sampleUseCase.modelRisk || 3,
        sampleUseCase.adoptionReadiness
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore);
      
      // Map old field names to new schema
      const useCaseData = {
        title: sampleUseCase.title,
        description: sampleUseCase.description,
        valueChainComponent: sampleUseCase.valueChainComponent,
        process: sampleUseCase.process,
        lineOfBusiness: sampleUseCase.lineOfBusiness,
        businessSegment: sampleUseCase.businessSegment,
        geography: sampleUseCase.geography,
        useCaseType: sampleUseCase.useCaseType,
        revenueImpact: sampleUseCase.revenueImpact,
        costSavings: sampleUseCase.costSavings,
        riskReduction: sampleUseCase.riskReduction,
        brokerPartnerExperience: sampleUseCase.brokerPartnerExperience || 3,
        strategicFit: sampleUseCase.strategicFit,
        dataReadiness: sampleUseCase.dataReadiness,
        technicalComplexity: sampleUseCase.technicalComplexity,
        changeImpact: sampleUseCase.changeImpact,
        modelRisk: sampleUseCase.modelRisk || 3,
        adoptionReadiness: sampleUseCase.adoptionReadiness,
        impactScore,
        effortScore,
        quadrant
      };
      
      await db.insert(useCases).values(useCaseData);
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
    // Check if metadata already exists
    const [existingConfig] = await db.select().from(metadataConfig).where(eq(metadataConfig.id, 'default'));
    if (existingConfig) {
      console.log("Metadata config already exists, skipping...");
      return;
    }

    // Insert default metadata configuration
    await db.insert(metadataConfig).values({
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
      sourceTypes: ["rsa_internal", "industry_standard", "ai_inventory"]
    });
    
    console.log("Seeded metadata configuration successfully");
  } catch (error) {
    console.error('Error seeding metadata config:', error);
  }
}