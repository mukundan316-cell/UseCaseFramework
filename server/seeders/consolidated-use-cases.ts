import { db } from '../db';
import { useCases } from '@shared/schema';
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from '@shared/calculations';
import { eq } from 'drizzle-orm';

/**
 * Consolidated AI Use Case Database - 22 Strategic Use Cases
 * Loaded into reference library tier for RSA selection and activation
 */
export const consolidatedUseCases = [
  {
    title: "Agentic AI for Underwriting",
    description: "A multi-agent system to automate the entire underwriting workflow, from data intake and risk profiling to pricing, compliance checks, and decision orchestration.",
    process: "Underwriting",
    lineOfBusiness: "All Commercial",
    businessSegment: "All Segments", 
    geography: "Global",
    useCaseType: "Agentic AI",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Underwriting Digital Assistant",
    description: "Provides underwriters with a summarized view of submission data, highlighting information outside of guidelines, assessing appetite capacity, and suggesting next best actions.",
    process: "Underwriting",
    lineOfBusiness: "Property & Casualty",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "GenAI",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Predictive Risk Scoring Engine",
    description: "A machine learning model that analyzes historical and real-time data to predict policy risk levels, improving pricing accuracy and loss ratios.",
    process: "Underwriting",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Europe",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "AI-led Policy Comparison",
    description: "An AI system to compare complex commercial insurance policies (including competitor products), highlighting key differences in coverage, exclusions, and wording.",
    process: "Underwriting",
    lineOfBusiness: "Commercial",
    businessSegment: "Large Commercial",
    geography: "UK",
    useCaseType: "GenAI",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Automated Prefilled Forms",
    description: "An AI system that pre-populates application forms by extracting information from historical client data, public records, and previous submissions to speed up the process.",
    process: "Underwriting",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Process Automation",
    quadrant: "Watchlist",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Dynamic Pricing Engine",
    description: "An AI-driven engine that optimizes and adjusts premium rates in real-time based on market conditions, competitor pricing, and incoming risk data.",
    process: "Pricing",
    lineOfBusiness: "Commercial",
    businessSegment: "Mid-Market",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Behavioral Risk Analytics",
    description: "AI analyzes policyholder behavior patterns to predict claim likelihood and adjust pricing or coverage terms proactively.",
    process: "Risk Assessment",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Consumer",
    geography: "UK",
    useCaseType: "Predictive ML",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Fraud Detection AI",
    description: "Advanced pattern recognition to identify potentially fraudulent claims by analyzing historical claim patterns, network analysis, and behavioral anomalies.",
    process: "Claims",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Quick Win",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Customer Sentiment Analysis",
    description: "NLP tool to analyze customer communications and social media mentions to identify satisfaction trends and potential churn risks.",
    process: "Customer Service",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "NLP",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Document Processing Automation",
    description: "OCR and ML solution to extract key information from policy documents, reducing manual data entry errors and processing time.",
    process: "Policy Administration",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Process Automation",
    quadrant: "Watchlist",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Claims Processing Automation",
    description: "End-to-end AI solution for first notice of loss through settlement, including damage assessment, coverage verification, and payment processing.",
    process: "Claims",
    lineOfBusiness: "Property & Casualty",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Process Automation",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Catastrophe Modeling Enhancement",
    description: "AI-enhanced catastrophe models using satellite imagery and IoT data for more accurate risk assessment and exposure management.",
    process: "Risk Assessment",
    lineOfBusiness: "Property & Casualty",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Broker Portal Intelligence",
    description: "AI-powered broker portal that provides personalized dashboards, automated reporting, and intelligent recommendations for portfolio optimization.",
    process: "Distribution",
    lineOfBusiness: "Commercial",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "GenAI",
    quadrant: "Quick Win",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Regulatory Compliance Monitoring",
    description: "AI system that monitors regulatory changes and automatically assesses impact on existing policies and procedures.",
    process: "Compliance",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Europe",
    useCaseType: "GenAI",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Cyber Risk Assessment AI",
    description: "Advanced AI systems to evaluate cyber risks for commercial clients using external threat intelligence and client security posture analysis.",
    process: "Risk Assessment",
    lineOfBusiness: "Cyber",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Predictive Maintenance for Assets",
    description: "IoT and AI solution to predict maintenance needs for insured commercial assets, reducing claim frequency and building stronger client relationships.",
    process: "Risk Prevention",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "IoT + AI",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "ESG Impact Scoring",
    description: "AI system to evaluate Environmental, Social, and Governance factors in underwriting decisions and portfolio management.",
    process: "Risk Assessment",
    lineOfBusiness: "Commercial",
    businessSegment: "All Segments",
    geography: "Europe",
    useCaseType: "Predictive ML",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Customer Journey Optimization",
    description: "AI-driven analysis of customer touchpoints to optimize experience and reduce abandonment rates in the sales funnel.",
    process: "Customer Acquisition",
    lineOfBusiness: "All Lines",
    businessSegment: "Consumer",
    geography: "UK",
    useCaseType: "Predictive ML",
    quadrant: "Quick Win",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Voice Analytics for Claims",
    description: "Speech-to-text and sentiment analysis for customer calls during claims process to improve service quality and identify process improvements.",
    process: "Claims",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "NLP",
    quadrant: "Experimental",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Portfolio Risk Optimization",
    description: "AI-driven portfolio analysis to optimize risk distribution, identify concentration risks, and suggest rebalancing strategies.",
    process: "Portfolio Management",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Telematics-Based Pricing",
    description: "Usage-based insurance pricing models using telematics data for more accurate risk assessment and personalized pricing.",
    process: "Pricing",
    lineOfBusiness: "Motor",
    businessSegment: "Consumer",
    geography: "UK",
    useCaseType: "IoT + AI",
    quadrant: "Quick Win",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  },
  {
    title: "Climate Risk Modeling",
    description: "Advanced climate models using AI to assess long-term climate risks and their impact on insurance portfolios and pricing strategies.",
    process: "Risk Assessment",
    lineOfBusiness: "Property & Casualty",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Predictive ML",
    quadrant: "Strategic Bet",
    libraryTier: "reference",
    librarySource: "consolidated_database"
  }
];

export async function seedConsolidatedUseCases() {
  console.log('🔄 Loading 22 consolidated use cases...');
  
  try {
    for (const useCaseData of consolidatedUseCases) {
      // Generate realistic scores for each use case
      const revenueImpact = Math.floor(Math.random() * 3) + 2; // 2-4
      const costSavings = Math.floor(Math.random() * 3) + 2; // 2-4
      const riskReduction = Math.floor(Math.random() * 3) + 2; // 2-4
      const brokerPartnerExperience = Math.floor(Math.random() * 3) + 2; // 2-4
      const strategicFit = Math.floor(Math.random() * 3) + 3; // 3-5
      
      const dataReadiness = Math.floor(Math.random() * 3) + 2; // 2-4
      const technicalComplexity = Math.floor(Math.random() * 3) + 2; // 2-4
      const changeImpact = Math.floor(Math.random() * 3) + 2; // 2-4
      const modelRisk = Math.floor(Math.random() * 3) + 2; // 2-4
      const adoptionReadiness = Math.floor(Math.random() * 3) + 2; // 2-4
      const explainabilityBias = Math.floor(Math.random() * 3) + 2; // 2-4
      const regulatoryCompliance = Math.floor(Math.random() * 3) + 2; // 2-4
      
      // Calculate scores
      const impactScore = calculateImpactScore(
        revenueImpact,
        costSavings,
        riskReduction,
        brokerPartnerExperience,
        strategicFit
      );
      
      const effortScore = calculateEffortScore(
        dataReadiness,
        technicalComplexity,
        changeImpact,
        modelRisk,
        adoptionReadiness
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore);
      
      // Check if use case already exists
      const existing = await db.select().from(useCases)
        .where(eq(useCases.title, useCaseData.title));
      
      if (existing.length === 0) {
        await db.insert(useCases).values({
          title: useCaseData.title,
          description: useCaseData.description,
          process: useCaseData.process,
          lineOfBusiness: useCaseData.lineOfBusiness,
          linesOfBusiness: [useCaseData.lineOfBusiness],
          businessSegment: useCaseData.businessSegment,
          businessSegments: [useCaseData.businessSegment],
          geography: useCaseData.geography,
          geographies: [useCaseData.geography],
          useCaseType: useCaseData.useCaseType,
          revenueImpact,
          costSavings,
          riskReduction,
          brokerPartnerExperience,
          strategicFit,
          dataReadiness,
          technicalComplexity,
          changeImpact,
          modelRisk,
          adoptionReadiness,
          explainabilityBias,
          regulatoryCompliance,
          impactScore,
          effortScore,
          quadrant,
          isActiveForRsa: 'false',
          isDashboardVisible: 'false',
          libraryTier: useCaseData.libraryTier,
          librarySource: useCaseData.librarySource,
          createdAt: new Date()
        });
      }
    }
    
    console.log('✅ Successfully loaded 22 consolidated use cases to reference library');
  } catch (error) {
    console.error('❌ Error loading consolidated use cases:', error);
    throw error;
  }
}