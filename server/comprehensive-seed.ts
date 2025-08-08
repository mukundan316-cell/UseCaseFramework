import { db } from './db';
import { useCases } from '@shared/schema';

// Comprehensive AI/GenAI use cases organized by value chain component
const comprehensiveUseCases = [
  // Underwriting
  {
    title: "Risk Triage System",
    description: "AI-powered automated risk assessment and classification system that triages incoming applications based on complexity and risk factors.",
    valueChainComponent: "Underwriting",
    process: "Risk Assessment",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Large Commercial",
    geography: "North America",
    useCaseType: "Process Automation",
    revenueImpact: 4,
    costSavings: 4,
    riskReduction: 5,
    brokerPartnerExperience: 3,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 3,
    changeImpact: 3,
    modelRisk: 3,
    adoptionReadiness: 4,
    explainabilityBias: 4,
    regulatoryCompliance: 4
  },
  {
    title: "AI-based Decisioning Engine",
    description: "Machine learning system for automated underwriting decisions with real-time risk scoring and pricing recommendations.",
    valueChainComponent: "Underwriting",
    process: "Decision Making",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Decision Support",
    revenueImpact: 5,
    costSavings: 4,
    riskReduction: 4,
    strategicFit: 5,
    dataReadiness: 4,
    technicalComplexity: 4,
    changeImpact: 4,
    adoptionReadiness: 3
  },
  {
    title: "Real-time Binding Platform",
    description: "Instant policy binding system using AI to evaluate risk and provide immediate coverage decisions.",
    valueChainComponent: "Underwriting",
    process: "Policy Issuance",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "North America",
    useCaseType: "Process Automation",
    revenueImpact: 4,
    costSavings: 5,
    riskReduction: 3,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },
  {
    title: "Dynamic Pricing Engine",
    description: "AI-driven pricing optimization that adjusts rates in real-time based on market conditions and risk factors.",
    valueChainComponent: "Underwriting",
    process: "Pricing",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Middle Market",
    geography: "Global",
    useCaseType: "Pricing Optimization",
    revenueImpact: 5,
    costSavings: 3,
    riskReduction: 4,
    strategicFit: 5,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 4,
    adoptionReadiness: 3
  },
  {
    title: "Cyber Risk Modeling",
    description: "Advanced AI system for assessing cyber risk exposure using external threat intelligence and behavioral analytics.",
    valueChainComponent: "Underwriting",
    process: "Risk Assessment",
    lineOfBusiness: "Cyber",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "Risk Modeling",
    revenueImpact: 4,
    costSavings: 3,
    riskReduction: 5,
    strategicFit: 5,
    dataReadiness: 2,
    technicalComplexity: 5,
    changeImpact: 4,
    adoptionReadiness: 2
  },

  // Claims
  {
    title: "FNOL Ingestion Automation",
    description: "Automated first notice of loss processing using NLP to extract key information from multiple communication channels.",
    valueChainComponent: "Claims",
    process: "First Notice",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Process Automation",
    revenueImpact: 3,
    costSavings: 5,
    riskReduction: 4,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },
  {
    title: "Scene Reconstruction AI",
    description: "Computer vision and AI technology to reconstruct accident scenes from photos and witness statements.",
    valueChainComponent: "Claims",
    process: "Investigation",
    lineOfBusiness: "Auto",
    businessSegment: "Mass Market",
    geography: "North America",
    useCaseType: "Investigation Support",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 5,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 5,
    changeImpact: 3,
    adoptionReadiness: 3
  },
  {
    title: "Subrogation Opportunity Identification",
    description: "AI system to identify and prioritize subrogation opportunities by analyzing claim patterns and third-party involvement.",
    valueChainComponent: "Claims",
    process: "Subrogation",
    lineOfBusiness: "Auto",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Revenue Recovery",
    revenueImpact: 4,
    costSavings: 3,
    riskReduction: 3,
    strategicFit: 3,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 2,
    adoptionReadiness: 4
  },

  // Distribution
  {
    title: "Product Recommendation Engine",
    description: "AI-powered system to recommend optimal insurance products based on customer profile and behavior analytics.",
    valueChainComponent: "Distribution",
    process: "Sales",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Sales Enhancement",
    revenueImpact: 5,
    costSavings: 3,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },
  {
    title: "Smart Cross-selling Platform",
    description: "Intelligent cross-selling system that identifies optimal timing and products for existing customers.",
    valueChainComponent: "Distribution",
    process: "Cross-selling",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Sales Enhancement",
    revenueImpact: 4,
    costSavings: 2,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },
  {
    title: "Concierge Assistant Bot",
    description: "AI-powered virtual assistant to guide customers through product selection and application processes.",
    valueChainComponent: "Distribution",
    process: "Customer Guidance",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Customer Experience",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },

  // Policy Servicing
  {
    title: "Custom Policy Generation",
    description: "AI system to automatically generate customized policy documents based on customer requirements and risk profile.",
    valueChainComponent: "Policy Servicing",
    process: "Policy Creation",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Middle Market",
    geography: "Global",
    useCaseType: "Document Generation",
    revenueImpact: 3,
    costSavings: 5,
    riskReduction: 3,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 4,
    changeImpact: 3,
    adoptionReadiness: 3
  },
  {
    title: "Intelligent Routing System",
    description: "AI-powered system to route customer inquiries and service requests to the most appropriate department or specialist.",
    valueChainComponent: "Policy Servicing",
    process: "Request Routing",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Process Automation",
    revenueImpact: 2,
    costSavings: 4,
    riskReduction: 3,
    strategicFit: 3,
    dataReadiness: 4,
    technicalComplexity: 2,
    changeImpact: 2,
    adoptionReadiness: 5
  },

  // Product Development
  {
    title: "Hyper-personalization Engine",
    description: "AI system to create highly personalized insurance products based on individual customer data and behavior patterns.",
    valueChainComponent: "Product Development",
    process: "Product Design",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Affluent",
    geography: "Global",
    useCaseType: "Product Innovation",
    revenueImpact: 5,
    costSavings: 2,
    riskReduction: 3,
    strategicFit: 5,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 4,
    adoptionReadiness: 2
  },
  {
    title: "Parametric Insurance Platform",
    description: "AI-driven platform for developing and managing parametric insurance products with automated trigger detection.",
    valueChainComponent: "Product Development",
    process: "Product Innovation",
    lineOfBusiness: "Specialty",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "Product Innovation",
    revenueImpact: 4,
    costSavings: 3,
    riskReduction: 4,
    strategicFit: 5,
    dataReadiness: 2,
    technicalComplexity: 5,
    changeImpact: 5,
    adoptionReadiness: 2
  },
  {
    title: "Synthetic Data Generation",
    description: "AI system to generate synthetic datasets for testing new products and pricing models while preserving privacy.",
    valueChainComponent: "Product Development",
    process: "Testing & Validation",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Data Generation",
    revenueImpact: 2,
    costSavings: 4,
    riskReduction: 4,
    strategicFit: 3,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 2,
    adoptionReadiness: 3
  },

  // Customer Service
  {
    title: "Virtual Customer Assistant",
    description: "Advanced AI chatbot capable of handling complex customer inquiries and policy-related questions.",
    valueChainComponent: "Customer Service",
    process: "Customer Support",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Customer Experience",
    revenueImpact: 3,
    costSavings: 5,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 3,
    adoptionReadiness: 4
  },
  {
    title: "LLM-powered Query Handling",
    description: "Large language model integration for understanding and responding to complex customer queries across multiple channels.",
    valueChainComponent: "Customer Service",
    process: "Query Resolution",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Customer Experience",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 4,
    changeImpact: 3,
    adoptionReadiness: 3
  },
  {
    title: "IVR Replacement System",
    description: "AI-powered conversational system to replace traditional IVR with natural language processing capabilities.",
    valueChainComponent: "Customer Service",
    process: "Call Handling",
    lineOfBusiness: "Personal Lines",
    businessSegment: "Mass Market",
    geography: "Global",
    useCaseType: "Customer Experience",
    revenueImpact: 2,
    costSavings: 4,
    riskReduction: 2,
    strategicFit: 3,
    dataReadiness: 3,
    technicalComplexity: 3,
    changeImpact: 4,
    adoptionReadiness: 3
  },

  // Infrastructure/IT Operations
  {
    title: "Mainframe Modernization AI",
    description: "AI-assisted analysis and migration of legacy mainframe systems to modern cloud-based architectures.",
    valueChainComponent: "Infrastructure/IT Operations",
    process: "System Migration",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Technology Modernization",
    revenueImpact: 2,
    costSavings: 5,
    riskReduction: 4,
    strategicFit: 4,
    dataReadiness: 3,
    technicalComplexity: 5,
    changeImpact: 5,
    adoptionReadiness: 2
  },
  {
    title: "Automated Testing Harness",
    description: "AI-powered testing framework that automatically generates and executes test cases for software releases.",
    valueChainComponent: "Infrastructure/IT Operations",
    process: "Quality Assurance",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Process Automation",
    revenueImpact: 2,
    costSavings: 4,
    riskReduction: 5,
    strategicFit: 3,
    dataReadiness: 4,
    technicalComplexity: 4,
    changeImpact: 3,
    adoptionReadiness: 3
  },
  {
    title: "Legacy Code Migration Assistant",
    description: "AI tool to analyze and automatically convert legacy code to modern programming languages and frameworks.",
    valueChainComponent: "Infrastructure/IT Operations",
    process: "Code Modernization",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Technology Modernization",
    revenueImpact: 1,
    costSavings: 5,
    riskReduction: 4,
    strategicFit: 3,
    dataReadiness: 3,
    technicalComplexity: 5,
    changeImpact: 4,
    adoptionReadiness: 2
  },

  // Fraud/Compliance
  {
    title: "Document Discrepancy Detection",
    description: "AI system to identify inconsistencies and potential fraud indicators in submitted documents and applications.",
    valueChainComponent: "Fraud/Compliance",
    process: "Document Verification",
    lineOfBusiness: "All Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Fraud Prevention",
    revenueImpact: 3,
    costSavings: 4,
    riskReduction: 5,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 4,
    changeImpact: 3,
    adoptionReadiness: 3
  },
  {
    title: "Unstructured Data Mining",
    description: "AI-powered analysis of unstructured data during application process to identify risk factors and compliance issues.",
    valueChainComponent: "Fraud/Compliance",
    process: "Risk Analysis",
    lineOfBusiness: "Commercial Property",
    businessSegment: "Large Commercial",
    geography: "Global",
    useCaseType: "Risk Assessment",
    revenueImpact: 3,
    costSavings: 3,
    riskReduction: 5,
    strategicFit: 4,
    dataReadiness: 2,
    technicalComplexity: 4,
    changeImpact: 3,
    adoptionReadiness: 3
  },

  // Analytics/Insights
  {
    title: "Customer Behavior Modeling",
    description: "Advanced analytics to model and predict customer behavior patterns for improved retention and product development.",
    valueChainComponent: "Analytics/Insights",
    process: "Predictive Analytics",
    lineOfBusiness: "Personal Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Analytics",
    revenueImpact: 4,
    costSavings: 2,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 2,
    adoptionReadiness: 4
  },
  {
    title: "Lifetime Value Estimation",
    description: "AI model to predict customer lifetime value for improved acquisition and retention strategies.",
    valueChainComponent: "Analytics/Insights",
    process: "Customer Analytics",
    lineOfBusiness: "Personal Lines",
    businessSegment: "All Segments",
    geography: "Global",
    useCaseType: "Analytics",
    revenueImpact: 4,
    costSavings: 2,
    riskReduction: 2,
    strategicFit: 4,
    dataReadiness: 4,
    technicalComplexity: 3,
    changeImpact: 2,
    adoptionReadiness: 4
  }
];

export async function seedComprehensiveUseCases() {
  console.log('Starting comprehensive use case seeding...');
  
  // Get existing use cases to avoid duplicates
  const existingUseCases = await db.select().from(useCases);
  const existingTitles = new Set(existingUseCases.map(uc => uc.title.toLowerCase()));
  
  // Filter out duplicates
  const newUseCases = comprehensiveUseCases.filter(uc => 
    !existingTitles.has(uc.title.toLowerCase())
  );
  
  console.log(`Found ${existingUseCases.length} existing use cases`);
  console.log(`Adding ${newUseCases.length} new use cases`);
  
  if (newUseCases.length > 0) {
    // Calculate scores and quadrants for new use cases using enhanced framework
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
    console.log(`Successfully added ${newUseCases.length} new comprehensive use cases`);
  } else {
    console.log('No new use cases to add - all use cases already exist');
  }
}