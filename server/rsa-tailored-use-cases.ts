import { db } from './db';
import { useCases } from '@shared/schema';

/**
 * RSA-Tailored Use Cases with Enhanced Framework Scoring
 * Based on RSA business context and operational reality
 */
const rsaTailoredUseCases = [
  {
    title: "Internal RSA GPT for Broker FAQs",
    description: "Internal AI assistant to help RSA staff quickly answer broker questions about products, processes, and policies using company knowledge base.",
    valueChainComponent: "Distribution",
    process: "Broker Support",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments", 
    geography: "UK",
    useCaseType: "Customer Experience",
    // Business Value Levers (Impact Score)
    revenueImpact: 3, // Indirect revenue through better broker relationships
    costSavings: 5, // High - reduces staff time answering repetitive questions
    riskReduction: 2, // Low operational risk
    brokerPartnerExperience: 5, // Very High - faster responses to brokers
    strategicFit: 4, // High - aligns with RSA's broker-focused model
    // Feasibility Levers (Effort Score)  
    dataReadiness: 5, // Very High - internal FAQs and documents readily available
    technicalComplexity: 2, // Low - established GPT technology
    changeImpact: 1, // Very Low - internal tool, minimal process change
    modelRisk: 1, // Very Low - internal use, low risk if wrong
    adoptionReadiness: 5, // Very High - staff will readily use time-saving tool
    // AI Governance
    explainabilityBias: 3, // Medium - internal use allows for some opacity
    regulatoryCompliance: 4 // High - must comply with data handling
  },
  {
    title: "AI-led Policy Comparison for Complex Products",
    description: "AI system to compare complex commercial insurance policies and highlight key differences for underwriters and brokers.",
    valueChainComponent: "Underwriting",
    process: "Policy Analysis",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Large Commercial",
    geography: "UK",
    useCaseType: "Decision Support",
    // Business Value Levers
    revenueImpact: 4, // High - enables better pricing and risk assessment
    costSavings: 4, // High - reduces manual comparison time
    riskReduction: 4, // High - reduces underwriting errors
    brokerPartnerExperience: 4, // High - provides clearer policy insights
    strategicFit: 4, // High - supports complex commercial focus
    // Feasibility Levers
    dataReadiness: 3, // Medium - policy documents need standardization
    technicalComplexity: 4, // High - complex NLP and document analysis
    changeImpact: 3, // Medium - requires underwriter workflow changes
    modelRisk: 3, // Medium - incorrect comparisons could impact decisions
    adoptionReadiness: 3, // Medium - underwriters may need training
    // AI Governance
    explainabilityBias: 4, // High - decisions need explanation
    regulatoryCompliance: 4 // High - regulatory scrutiny on underwriting tools
  },
  {
    title: "AI-Generated Product Summaries for Delegated Partners",
    description: "Automated generation of clear, standardized product summaries for RSA's delegated authority partners.",
    valueChainComponent: "Distribution",
    process: "Partner Enablement",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "UK",
    useCaseType: "Content Generation",
    // Business Value Levers
    revenueImpact: 3, // Medium - supports partner sales
    costSavings: 4, // High - eliminates manual summary creation
    riskReduction: 3, // Medium - consistent messaging reduces confusion
    brokerPartnerExperience: 5, // Very High - clear, consistent product info
    strategicFit: 4, // High - critical for delegated model
    // Feasibility Levers
    dataReadiness: 4, // High - product information is structured
    technicalComplexity: 2, // Low - text generation is mature technology
    changeImpact: 2, // Low - partners receive better materials
    modelRisk: 2, // Low - incorrect summaries easily caught in review
    adoptionReadiness: 5, // Very High - partners want better materials
    // AI Governance
    explainabilityBias: 3, // Medium - content generation needs oversight
    regulatoryCompliance: 4 // High - product information must be compliant
  },
  {
    title: "Underwriting Decision Explanation Engine",
    description: "AI system that provides clear explanations for automated underwriting decisions to support transparency and regulatory compliance.",
    valueChainComponent: "Underwriting",
    process: "Decision Explanation",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Regulatory Compliance",
    // Business Value Levers
    revenueImpact: 2, // Low - mainly compliance focused
    costSavings: 3, // Medium - reduces manual explanation time
    riskReduction: 5, // Very High - critical for regulatory compliance
    brokerPartnerExperience: 3, // Medium - helps broker understanding
    strategicFit: 3, // Medium - important but not core business
    // Feasibility Levers
    dataReadiness: 2, // Low - requires comprehensive decision audit trails
    technicalComplexity: 5, // Very High - explainable AI is complex
    changeImpact: 4, // High - requires significant process changes
    modelRisk: 5, // Very High - wrong explanations create regulatory risk
    adoptionReadiness: 2, // Low - requires significant change management
    // AI Governance
    explainabilityBias: 5, // Very High - this IS the explainability tool
    regulatoryCompliance: 5 // Very High - core purpose is compliance
  },
  {
    title: "Hyper-personalized Small Business Quotes",
    description: "Real-time AI system providing highly personalized insurance quotes for small businesses based on detailed risk profiling.",
    valueChainComponent: "Distribution",
    process: "Quote Generation",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Small Commercial",
    geography: "UK",
    useCaseType: "Product Innovation",
    // Business Value Levers
    revenueImpact: 5, // Very High - direct revenue impact from better conversion
    costSavings: 3, // Medium - automated quoting saves time
    riskReduction: 3, // Medium - better risk assessment
    brokerPartnerExperience: 4, // High - faster, more accurate quotes
    strategicFit: 5, // Very High - aligns with small business focus
    // Feasibility Levers
    dataReadiness: 3, // Medium - need comprehensive small business data
    technicalComplexity: 4, // High - real-time personalization is complex
    changeImpact: 3, // Medium - changes quoting processes
    modelRisk: 4, // High - wrong pricing creates direct financial risk
    adoptionReadiness: 3, // Medium - requires market acceptance
    // AI Governance
    explainabilityBias: 4, // High - pricing decisions need transparency
    regulatoryCompliance: 4 // High - insurance pricing is regulated
  },
  {
    title: "Claims Intake Automation for Delegated Products",
    description: "Automated claims intake processing specifically designed for RSA's delegated authority products and partner workflows.",
    valueChainComponent: "Claims",
    process: "First Notice",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 3, // Medium - faster claims processing improves retention
    costSavings: 5, // Very High - significant automation savings
    riskReduction: 4, // High - reduces processing errors
    brokerPartnerExperience: 5, // Very High - faster claims for their customers
    strategicFit: 4, // High - critical for delegated model efficiency
    // Feasibility Levers
    dataReadiness: 4, // High - claims data is structured
    technicalComplexity: 2, // Low - FNOL automation is proven
    changeImpact: 2, // Low - improves existing process
    modelRisk: 2, // Low - errors caught in workflow
    adoptionReadiness: 4, // High - partners want faster claims
    // AI Governance
    explainabilityBias: 3, // Medium - some decisions need explanation
    regulatoryCompliance: 4 // High - claims handling is regulated
  },
  {
    title: "AI Audit Assistant for Delegated Management Information",
    description: "AI tool to automatically audit and validate management information submitted by delegated authority partners.",
    valueChainComponent: "Fraud/Compliance",
    process: "Audit & Compliance",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "UK",
    useCaseType: "Risk Assessment",
    // Business Value Levers
    revenueImpact: 2, // Low - mainly cost and risk focused
    costSavings: 4, // High - reduces manual audit time
    riskReduction: 5, // Very High - critical for delegated oversight
    brokerPartnerExperience: 3, // Medium - faster feedback on submissions
    strategicFit: 4, // High - essential for delegated model
    // Feasibility Levers
    dataReadiness: 4, // High - MI data is structured
    technicalComplexity: 2, // Low - pattern recognition in data
    changeImpact: 2, // Low - enhances existing audit process
    modelRisk: 3, // Medium - missed issues create regulatory risk
    adoptionReadiness: 4, // High - auditors want efficiency tools
    // AI Governance
    explainabilityBias: 4, // High - audit findings need clear explanation
    regulatoryCompliance: 5 // Very High - audit compliance is critical
  },
  {
    title: "Voice-to-Claim Narrative NLP Tool",
    description: "Natural language processing tool to convert voice recordings of claim descriptions into structured claim narratives.",
    valueChainComponent: "Claims",
    process: "Documentation",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "UK",
    useCaseType: "Process Automation",
    // Business Value Levers
    revenueImpact: 1, // Very Low - efficiency focused
    costSavings: 3, // Medium - saves transcription time
    riskReduction: 2, // Low - mainly administrative
    brokerPartnerExperience: 2, // Low - limited direct impact
    strategicFit: 2, // Low - nice to have but not strategic
    // Feasibility Levers
    dataReadiness: 3, // Medium - voice data needs processing
    technicalComplexity: 3, // Medium - speech-to-text + NLP
    changeImpact: 2, // Low - optional tool for claims handlers
    modelRisk: 1, // Very Low - transcription errors easily spotted
    adoptionReadiness: 3, // Medium - depends on user preference
    // AI Governance
    explainabilityBias: 2, // Low - transcription is straightforward
    regulatoryCompliance: 3 // Medium - data handling compliance needed
  }
];

export async function seedRSATailoredUseCases() {
  console.log('Adding RSA-tailored use cases...');
  
  // Get existing use cases to avoid duplicates
  const existingUseCases = await db.select().from(useCases);
  const existingTitles = new Set(existingUseCases.map(uc => uc.title.toLowerCase()));
  
  // Filter out duplicates
  const newUseCases = rsaTailoredUseCases.filter(uc => 
    !existingTitles.has(uc.title.toLowerCase())
  );
  
  console.log(`Found ${existingUseCases.length} existing use cases`);
  console.log(`Adding ${newUseCases.length} new RSA-tailored use cases`);
  
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
    console.log(`Successfully added ${newUseCases.length} RSA-tailored use cases`);
    
    // Log scoring results for validation
    useCasesToInsert.forEach(uc => {
      console.log(`${uc.title}: Impact=${uc.impactScore}, Effort=${uc.effortScore}, Quadrant=${uc.quadrant}`);
    });
  } else {
    console.log('No new RSA-tailored use cases to add');
  }
}