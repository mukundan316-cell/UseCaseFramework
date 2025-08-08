import { db } from './db';
import { useCases } from '@shared/schema';

/**
 * High-Impact Commercial Property & Casualty AI Use Cases
 * Based on comprehensive industry analysis grid
 * Scored using Enhanced RSA Framework (12 levers)
 */
const highImpactUseCases = [
  {
    title: "Broker-Facing Pricing Chatbot",
    description: "Interactive AI assistant providing real-time pricing guidance and product information to brokers during client conversations, with instant access to rating engines and underwriting guidelines.",
    valueChainComponent: "Distribution",
    process: "Quote Generation",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Mid Market",
    geography: "UK",
    useCaseType: "Customer Experience",
    // Business Value Levers (Impact Score)
    revenueImpact: 4, // High - faster quotes increase conversion
    costSavings: 3, // Medium - reduces broker support calls
    riskReduction: 3, // Medium - consistent pricing guidance
    brokerPartnerExperience: 5, // Very High - core broker support tool
    strategicFit: 4, // High - supports broker-centric model
    // Feasibility Levers (Effort Score)
    dataReadiness: 4, // High - pricing data is structured
    technicalComplexity: 3, // Medium - chatbot integration with rating engines
    changeImpact: 2, // Low - enhances existing broker interactions
    modelRisk: 2, // Low - pricing guidance, not binding decisions
    adoptionReadiness: 4, // High - brokers want faster tools
    // AI Governance
    explainabilityBias: 3, // Medium - pricing logic should be transparent
    regulatoryCompliance: 4 // High - pricing tools face regulatory scrutiny
  },
  {
    title: "Hyper-personalized Customer Outreach",
    description: "AI-driven customer segmentation and personalized marketing campaigns for commercial lines, leveraging behavioral data and market intelligence for targeted outreach.",
    valueChainComponent: "Distribution",
    process: "Lead Generation",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Small Commercial",
    geography: "UK",
    useCaseType: "Product Innovation",
    // Business Value Levers
    revenueImpact: 5, // Very High - direct impact on new business acquisition
    costSavings: 4, // High - automated campaign management
    riskReduction: 2, // Low - marketing focus
    brokerPartnerExperience: 3, // Medium - supports broker lead generation
    strategicFit: 4, // High - growth-focused strategy
    // Feasibility Levers
    dataReadiness: 3, // Medium - requires customer behavior data integration
    technicalComplexity: 3, // Medium - ML personalization algorithms
    changeImpact: 3, // Medium - new marketing approach
    modelRisk: 2, // Low - marketing decisions have limited risk
    adoptionReadiness: 3, // Medium - requires marketing team training
    // AI Governance
    explainabilityBias: 4, // High - personalization must avoid discrimination
    regulatoryCompliance: 5 // Very High - GDPR and marketing regulations critical
  },
  {
    title: "Service Provider Contract Analyzer",
    description: "AI tool to analyze and optimize service provider contracts for claims management, identifying cost optimization opportunities and performance benchmarks.",
    valueChainComponent: "Claims",
    process: "Vendor Management",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 2, // Low - cost-focused rather than revenue
    costSavings: 5, // Very High - direct vendor cost optimization
    riskReduction: 4, // High - better vendor oversight
    brokerPartnerExperience: 2, // Low - internal process
    strategicFit: 3, // Medium - operational efficiency focus
    // Feasibility Levers
    dataReadiness: 4, // High - contract documents available
    technicalComplexity: 3, // Medium - document analysis and NLP
    changeImpact: 2, // Low - enhances existing vendor management
    modelRisk: 2, // Low - contract analysis has limited risk
    adoptionReadiness: 4, // High - procurement teams want efficiency
    // AI Governance
    explainabilityBias: 3, // Medium - contract recommendations need justification
    regulatoryCompliance: 3 // Medium - vendor management compliance
  },
  {
    title: "Real-time Market Pricing Analysis",
    description: "AI system monitoring competitor pricing and market conditions for dynamic pricing adjustments, providing real-time competitive intelligence for underwriters.",
    valueChainComponent: "Underwriting",
    process: "Pricing",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Large Commercial",
    geography: "UK",
    useCaseType: "Decision Support",
    // Business Value Levers
    revenueImpact: 5, // Very High - optimized pricing drives profitability
    costSavings: 3, // Medium - automated market analysis
    riskReduction: 4, // High - better pricing reduces underwriting risk
    brokerPartnerExperience: 3, // Medium - competitive pricing benefits brokers
    strategicFit: 5, // Very High - core competitive advantage
    // Feasibility Levers
    dataReadiness: 2, // Low - requires external market data feeds
    technicalComplexity: 4, // High - real-time data processing and analysis
    changeImpact: 3, // Medium - changes pricing processes
    modelRisk: 4, // High - pricing errors have direct financial impact
    adoptionReadiness: 3, // Medium - underwriters need training on new tools
    // AI Governance
    explainabilityBias: 4, // High - pricing decisions need transparency
    regulatoryCompliance: 5 // Very High - pricing regulations are strict
  },
  {
    title: "Automated Prefilled Forms",
    description: "AI system pre-populating application forms using historical client data, public records, and third-party data sources to reduce broker administrative burden.",
    valueChainComponent: "Underwriting",
    process: "Application Processing",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 3, // Medium - faster applications increase throughput
    costSavings: 4, // High - reduces data entry time
    riskReduction: 3, // Medium - reduces data entry errors
    brokerPartnerExperience: 5, // Very High - significantly reduces broker workload
    strategicFit: 4, // High - supports broker efficiency
    // Feasibility Levers
    dataReadiness: 3, // Medium - requires data integration from multiple sources
    technicalComplexity: 2, // Low - form filling automation is mature
    changeImpact: 2, // Low - improves existing process
    modelRisk: 1, // Very Low - pre-filling doesn't make decisions
    adoptionReadiness: 5, // Very High - everyone wants less admin work
    // AI Governance
    explainabilityBias: 2, // Low - data pre-filling is straightforward
    regulatoryCompliance: 4 // High - data handling and accuracy requirements
  },
  {
    title: "Auto-generated First Notice of Loss Insights",
    description: "AI analysis providing immediate risk assessment, settlement recommendations, and next-best-action guidance upon claim submission to optimize claims handling.",
    valueChainComponent: "Claims",
    process: "First Notice",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Decision Support",
    // Business Value Levers
    revenueImpact: 3, // Medium - faster settlements improve customer retention
    costSavings: 5, // Very High - automates initial claims assessment
    riskReduction: 4, // High - early fraud detection and risk assessment
    brokerPartnerExperience: 4, // High - faster claims processing for their clients
    strategicFit: 4, // High - claims efficiency is strategic priority
    // Feasibility Levers
    dataReadiness: 4, // High - claims data is well-structured
    technicalComplexity: 3, // Medium - ML models for claims assessment
    changeImpact: 2, // Low - enhances existing FNOL process
    modelRisk: 3, // Medium - recommendations affect claims costs
    adoptionReadiness: 4, // High - claims teams want faster tools
    // AI Governance
    explainabilityBias: 4, // High - claims decisions need clear reasoning
    regulatoryCompliance: 4 // High - claims handling is regulated
  },
  {
    title: "Claims Review Copilot",
    description: "AI assistant helping claims adjusters with decision support, documentation assistance, and best-practice recommendations throughout the claims lifecycle.",
    valueChainComponent: "Claims",
    process: "Claims Assessment",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Decision Support",
    // Business Value Levers
    revenueImpact: 2, // Low - primarily cost and efficiency focused
    costSavings: 4, // High - reduces adjuster time per claim
    riskReduction: 4, // High - consistent decision support reduces errors
    brokerPartnerExperience: 3, // Medium - faster, more consistent claims handling
    strategicFit: 3, // Medium - operational excellence focus
    // Feasibility Levers
    dataReadiness: 4, // High - claims workflow data available
    technicalComplexity: 3, // Medium - AI assistant with domain knowledge
    changeImpact: 2, // Low - assists existing adjusters
    modelRisk: 3, // Medium - advice affects claims outcomes
    adoptionReadiness: 3, // Medium - adjusters may need time to trust AI advice
    // AI Governance
    explainabilityBias: 5, // Very High - adjuster decisions must be explainable
    regulatoryCompliance: 4 // High - claims handling compliance requirements
  },
  {
    title: "Dynamic Information Collection",
    description: "Adaptive AI system that intelligently requests additional information based on claim type, complexity, and initial assessment to optimize claims investigation.",
    valueChainComponent: "Claims",
    process: "Information Gathering",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 2, // Low - process efficiency focused
    costSavings: 4, // High - reduces back-and-forth information requests
    riskReduction: 4, // High - ensures complete information gathering
    brokerPartnerExperience: 4, // High - reduces multiple information requests
    strategicFit: 3, // Medium - process optimization
    // Feasibility Levers
    dataReadiness: 4, // High - claims process data available
    technicalComplexity: 3, // Medium - dynamic workflow management
    changeImpact: 3, // Medium - changes information collection process
    modelRisk: 2, // Low - information requests have limited risk
    adoptionReadiness: 4, // High - reduces manual coordination work
    // AI Governance
    explainabilityBias: 3, // Medium - information requests should be logical
    regulatoryCompliance: 3 // Medium - information handling compliance
  },
  {
    title: "Enhanced Fraud Detection with Market Sentiment",
    description: "Advanced fraud detection incorporating social media monitoring, market sentiment analysis, and external data sources to identify sophisticated fraud patterns.",
    valueChainComponent: "Fraud/Compliance",
    process: "Fraud Detection",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Risk Assessment",
    // Business Value Levers
    revenueImpact: 3, // Medium - fraud prevention protects profitability
    costSavings: 4, // High - automated fraud detection
    riskReduction: 5, // Very High - core fraud prevention capability
    brokerPartnerExperience: 3, // Medium - protects broker reputation
    strategicFit: 4, // High - fraud prevention is strategic priority
    // Feasibility Levers
    dataReadiness: 2, // Low - requires external social media and market data
    technicalComplexity: 4, // High - advanced ML and sentiment analysis
    changeImpact: 3, // Medium - enhances existing fraud processes
    modelRisk: 4, // High - false positives affect customer experience
    adoptionReadiness: 3, // Medium - fraud teams need new skills
    // AI Governance
    explainabilityBias: 5, // Very High - fraud accusations need clear evidence
    regulatoryCompliance: 5 // Very High - fraud detection is heavily regulated
  },
  {
    title: "Prior Authorization Optimization",
    description: "AI system streamlining medical and service authorization processes for casualty claims, predicting approval likelihood and optimizing provider networks.",
    valueChainComponent: "Claims",
    process: "Medical Management",
    lineOfBusiness: "Auto",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 2, // Low - cost control focused
    costSavings: 5, // Very High - reduces medical costs and admin time
    riskReduction: 4, // High - better cost control and provider oversight
    brokerPartnerExperience: 3, // Medium - faster claim resolution
    strategicFit: 3, // Medium - operational efficiency
    // Feasibility Levers
    dataReadiness: 3, // Medium - medical authorization data available
    technicalComplexity: 3, // Medium - predictive models for authorization
    changeImpact: 3, // Medium - changes authorization workflow
    modelRisk: 4, // High - authorization errors affect patient care
    adoptionReadiness: 3, // Medium - medical teams need training
    // AI Governance
    explainabilityBias: 5, // Very High - medical decisions need full transparency
    regulatoryCompliance: 5 // Very High - medical authorization is strictly regulated
  }
];

export async function seedHighImpactUseCases() {
  console.log('Adding high-impact commercial property & casualty use cases...');
  
  // Get existing use cases to avoid duplicates
  const existingUseCases = await db.select().from(useCases);
  const existingTitles = new Set(existingUseCases.map(uc => uc.title.toLowerCase()));
  
  // Filter out duplicates
  const newUseCases = highImpactUseCases.filter(uc => 
    !existingTitles.has(uc.title.toLowerCase())
  );
  
  console.log(`Found ${existingUseCases.length} existing use cases`);
  console.log(`Adding ${newUseCases.length} new high-impact use cases`);
  
  if (newUseCases.length > 0) {
    // Calculate scores and quadrants using enhanced framework
    const useCasesToInsert = newUseCases.map(uc => {
      const impactScore = (uc.revenueImpact + uc.costSavings + uc.riskReduction + uc.brokerPartnerExperience + uc.strategicFit) * 0.2;
      const effortScore = (uc.dataReadiness + uc.technicalComplexity + uc.changeImpact + uc.modelRisk + uc.adoptionReadiness) * 0.2;
      
      let quadrant: string;
      if (impactScore >= 4 && effortScore <= 2.5) {
        quadrant = "Quick Win";
      } else if (impactScore >= 4) {
        quadrant = "Strategic Bet";
      } else if (effortScore <= 2.5) {
        quadrant = "Experimental";
      } else {
        quadrant = "Watchlist";
      }
      
      return {
        ...uc,
        impactScore: Math.round(impactScore * 10) / 10,
        effortScore: Math.round(effortScore * 10) / 10,
        quadrant
      };
    });
    
    await db.insert(useCases).values(useCasesToInsert);
    console.log(`Successfully added ${newUseCases.length} high-impact use cases`);
    
    // Log scoring results for validation
    useCasesToInsert.forEach(uc => {
      console.log(`${uc.title}: Impact=${uc.impactScore}, Effort=${uc.effortScore}, Quadrant=${uc.quadrant}`);
    });
  } else {
    console.log('No new high-impact use cases to add');
  }
}