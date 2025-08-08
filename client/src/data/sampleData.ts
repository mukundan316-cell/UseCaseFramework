import { UseCase, MetadataConfig } from '../types';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '../utils/calculations';

export const defaultMetadata: MetadataConfig = {
  valueChainComponents: [
    "Claims",
    "Underwriting", 
    "Policy Servicing",
    "Distribution",
    "Product Development",
    "IT Operations",
    "Fraud/Compliance",
    "Customer Service"
  ],
  processes: [
    "FNOL",
    "Quote & Bind",
    "Pricing",
    "Renewal", 
    "Subrogation"
  ],
  linesOfBusiness: [
    "Auto",
    "Property",
    "Marine", 
    "Life",
    "Cyber",
    "Specialty"
  ],
  businessSegments: [
    "Mid-Market",
    "Large Commercial",
    "SME",
    "E&S"
  ],
  geographies: [
    "UK",
    "Europe",
    "Global",
    "North America"
  ],
  useCaseTypes: [
    "GenAI",
    "Predictive ML",
    "NLP",
    "RPA"
  ]
};

function createUseCase(data: {
  title: string;
  description: string;
  valueChainComponent: string;
  process: string;
  lineOfBusiness: string;
  businessSegment: string;
  geography: string;
  useCaseType: string;
  revenueImpact: number;
  costSavings: number;
  riskReduction: number;
  strategicFit: number;
  dataReadiness: number;
  technicalComplexity: number;
  changeImpact: number;
  adoptionReadiness: number;
}): UseCase {
  const impactScore = calculateImpactScore(
    data.revenueImpact,
    data.costSavings,
    data.riskReduction,
    data.strategicFit
  );
  const effortScore = calculateEffortScore(
    data.dataReadiness,
    data.technicalComplexity,
    data.changeImpact,
    data.adoptionReadiness
  );
  const quadrant = calculateQuadrant(impactScore, effortScore);

  return {
    id: `uc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    impactScore,
    effortScore,
    quadrant,
    createdAt: new Date()
  };
}

export const sampleUseCases: UseCase[] = [
  createUseCase({
    title: "Automated FNOL Summarization",
    description: "Summarizes first notice of loss narratives using GenAI for faster triage and claims processing.",
    valueChainComponent: "Claims",
    process: "FNOL",
    lineOfBusiness: "Auto",
    businessSegment: "Mid-Market",
    geography: "UK",
    useCaseType: "GenAI",
    revenueImpact: 4,
    costSavings: 5,
    riskReduction: 4,
    strategicFit: 5,
    dataReadiness: 4,
    technicalComplexity: 2,
    changeImpact: 2,
    adoptionReadiness: 4
  }),
  createUseCase({
    title: "Intelligent Risk Assessment",
    description: "ML-powered risk scoring for commercial property underwriting with real-time data integration.",
    valueChainComponent: "Underwriting",
    process: "Pricing",
    lineOfBusiness: "Property",
    businessSegment: "Large Commercial",
    geography: "Europe",
    useCaseType: "Predictive ML",
    revenueImpact: 5,
    costSavings: 4,
    riskReduction: 5,
    strategicFit: 5,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 4,
    adoptionReadiness: 4
  }),
  createUseCase({
    title: "Chatbot Policy Assistant",
    description: "AI-powered customer service chatbot for policy inquiries and basic transactions.",
    valueChainComponent: "Customer Service",
    process: "Policy Servicing",
    lineOfBusiness: "Auto",
    businessSegment: "SME",
    geography: "Global",
    useCaseType: "NLP",
    revenueImpact: 3,
    costSavings: 5,
    riskReduction: 4,
    strategicFit: 4,
    dataReadiness: 5,
    technicalComplexity: 2,
    changeImpact: 3,
    adoptionReadiness: 4
  }),
  createUseCase({
    title: "Fraud Detection Engine",
    description: "Advanced ML algorithms to detect fraudulent claims patterns across multiple data sources.",
    valueChainComponent: "Fraud/Compliance",
    process: "Claims",
    lineOfBusiness: "Specialty",
    businessSegment: "Large Commercial",
    geography: "UK",
    useCaseType: "Predictive ML",
    revenueImpact: 4,
    costSavings: 4,
    riskReduction: 5,
    strategicFit: 5,
    dataReadiness: 3,
    technicalComplexity: 5,
    changeImpact: 4,
    adoptionReadiness: 3
  }),
  createUseCase({
    title: "Document Processing Automation",
    description: "OCR and NLP to extract and process data from insurance documents and forms.",
    valueChainComponent: "IT Operations",
    process: "Policy Servicing",
    lineOfBusiness: "Marine",
    businessSegment: "Mid-Market",
    geography: "Europe",
    useCaseType: "RPA",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 3,
    strategicFit: 2,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 2,
    adoptionReadiness: 3
  }),
  createUseCase({
    title: "Predictive Renewal Modeling",
    description: "ML models to predict customer renewal likelihood and optimize retention strategies.",
    valueChainComponent: "Distribution",
    process: "Renewal",
    lineOfBusiness: "Life",
    businessSegment: "E&S",
    geography: "North America",
    useCaseType: "Predictive ML",
    revenueImpact: 5,
    costSavings: 3,
    riskReduction: 4,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 2,
    changeImpact: 2,
    adoptionReadiness: 5
  })
];
