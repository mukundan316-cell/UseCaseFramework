import { db } from './db';
import { metadataConfig } from '@shared/schema';
import { eq } from "drizzle-orm";

/**
 * Complete metadata seeding for pristine database
 * All features are now driven by database-persisted configuration per replit.md
 */
export async function seedDatabase() {
  try {
    const existingMetadata = await db.select().from(metadataConfig);
    
    if (existingMetadata.length === 0) {
      console.log('Fresh database detected, seeding complete metadata configuration...');
      await seedMetadataConfig();
    } else {
      console.log('Existing metadata found, preserving user data...');
    }
    
    console.log('Use case database ready for user input');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

/**
 * Seeds complete metadata configuration with all framework-driven features
 * Per replit.md: All features driven by DB-persisted values and formulas
 */
async function seedMetadataConfig() {
  try {
    console.log("Creating complete metadata configuration for framework-driven features...");

    // Use 'as any' for complex JSONB types per storage.ts pattern
    await db.insert(metadataConfig).values({
      id: 'default',
      valueChainComponents: [
        "Risk Assessment & Underwriting",
        "Customer Experience & Distribution", 
        "Claims Management & Settlement",
        "Risk Consulting & Prevention",
        "Portfolio Management & Analytics"
      ],
      processes: [],
      activities: [],
      processActivities: {},
      linesOfBusiness: ["All Commercial", "Property & Casualty", "Specialty"],
      businessSegments: ["SME", "Mid-Market", "Large Commercial"],
      geographies: ["UK", "Europe", "Global"],
      useCaseTypes: ["Analytics & Insights", "Process Automation", "GenAI", "Predictive ML"],
      sourceTypes: ["rsa_internal", "industry_standard", "ai_inventory"],
      quadrants: ["Quick Win", "Strategic Bet", "Experimental", "Watchlist"],
      useCaseStatuses: ["Discovery", "Backlog", "In-flight", "Implemented", "On Hold"],
      aiMlTechnologies: [
        "Machine Learning", "Deep Learning", "Natural Language Processing",
        "Computer Vision", "Predictive Analytics", "Large Language Models",
        "Reinforcement Learning", "Rule-based Systems"
      ],
      dataSources: [
        "Policy Database", "Claims Database", "Customer Database",
        "External APIs", "Third-party Data", "Real-time Feeds",
        "Historical Data", "Regulatory Data", "Broker Data & Feeds"
      ],
      stakeholderGroups: [
        "Underwriting Teams", "Claims Teams", "IT/Technology",
        "Business Analytics", "Risk Management", "Product Management",
        "Customer Service", "Sales & Distribution", "Executive Leadership",
        "Regulatory & Compliance"
      ],
      horizontalUseCaseTypes: [
        "Customer Experience Enhancement", "Operational Efficiency",
        "Risk & Compliance Management", "Revenue & Growth Optimization",
        "Data & Analytics Enablement"
      ],
      questionTypes: [
        "text", "textarea", "select", "multi_select", "radio",
        "checkbox", "number", "date", "email", "url"
      ],
      responseStatuses: ["started", "in_progress", "completed", "abandoned"],
      questionCategories: [
        "Strategic Foundation", "AI Capabilities", "Use Case Discovery",
        "Technology Infrastructure", "Organizational Readiness", "Risk & Compliance"
      ],
      companyTiers: ["Small (<£100M)", "Mid (£100M-£3B)", "Large (>£3B)"],
      marketOptions: ["Personal Lines", "Commercial Lines", "Specialty Lines", "Reinsurance"],
      
      // Scoring Model Configuration - weights sum to 100% per category
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
      },

      // T-shirt Sizing Configuration - UK benchmark compliance
      tShirtSizing: {
        enabled: true,
        sizes: [
          { name: 'XS', minWeeks: 2, maxWeeks: 4, teamSizeMin: 1, teamSizeMax: 2, color: '#10B981', description: 'Simple automation or tool integration' },
          { name: 'S', minWeeks: 4, maxWeeks: 8, teamSizeMin: 2, teamSizeMax: 4, color: '#3B82F6', description: 'Basic ML model, RPA, or process optimization' },
          { name: 'M', minWeeks: 8, maxWeeks: 16, teamSizeMin: 3, teamSizeMax: 6, color: '#FBBF24', description: 'Advanced ML/NLP, data pipelines, multi-system integration' },
          { name: 'L', minWeeks: 16, maxWeeks: 26, teamSizeMin: 5, teamSizeMax: 10, color: '#EF4444', description: 'Complex AI systems, agentic bots, cross-functional rollout' },
          { name: 'XL', minWeeks: 26, maxWeeks: 52, teamSizeMin: 8, teamSizeMax: 15, color: '#8B5CF6', description: 'Enterprise-wide transformation, end-to-end automation' }
        ],
        roles: [
          { type: 'Developer', dailyRateGBP: 400 },
          { type: 'Analyst', dailyRateGBP: 350 },
          { type: 'PM', dailyRateGBP: 500 },
          { type: 'Data Engineer', dailyRateGBP: 550 },
          { type: 'Architect', dailyRateGBP: 650 },
          { type: 'QA Engineer', dailyRateGBP: 300 }
        ],
        overheadMultiplier: 1.35,
        mappingRules: [
          { name: 'Critical Quick Fix', condition: { impactMin: 4.5, effortMax: 1.5 }, targetSize: 'XS', priority: 150 },
          { name: 'High-Value Quick Win', condition: { impactMin: 4.0, effortMax: 2.5 }, targetSize: 'S', priority: 140 },
          { name: 'Strategic Quick Win', condition: { impactMin: 3.5, effortMax: 2.0 }, targetSize: 'S', priority: 130 },
          { name: 'Strategic Priority', condition: { impactMin: 4.0, effortMin: 2.5, effortMax: 3.5 }, targetSize: 'M', priority: 120 },
          { name: 'Major Strategic Bet', condition: { impactMin: 4.0, effortMin: 3.5, effortMax: 4.5 }, targetSize: 'L', priority: 110 },
          { name: 'Complex Strategic', condition: { impactMin: 3.5, effortMin: 4.5 }, targetSize: 'XL', priority: 105 },
          { name: 'Standard Quick Win', condition: { impactMin: 3.0, effortMax: 2.5 }, targetSize: 'S', priority: 100 },
          { name: 'Important Project', condition: { impactMin: 3.5, effortMin: 2.0, effortMax: 3.5 }, targetSize: 'M', priority: 95 },
          { name: 'Strategic Project', condition: { impactMin: 3.0, effortMin: 3.5, effortMax: 4.5 }, targetSize: 'L', priority: 90 },
          { name: 'Standard Project', condition: { impactMin: 2.5, effortMin: 2.5, effortMax: 3.5 }, targetSize: 'M', priority: 80 },
          { name: 'Complex Standard', condition: { impactMin: 2.5, effortMin: 3.5, effortMax: 4.5 }, targetSize: 'M', priority: 75 },
          { name: 'Resource-Heavy Project', condition: { impactMin: 2.5, effortMin: 4.5 }, targetSize: 'L', priority: 70 },
          { name: 'Small Project', condition: { impactMin: 2.0, effortMin: 1.5, effortMax: 2.5 }, targetSize: 'S', priority: 65 },
          { name: 'Maintenance Project', condition: { impactMax: 2.5, effortMin: 2.5, effortMax: 3.5 }, targetSize: 'S', priority: 60 },
          { name: 'Questionable Investment', condition: { impactMax: 2.5, effortMin: 3.5, effortMax: 4.5 }, targetSize: 'M', priority: 55 },
          { name: 'Low-Value Money Pit', condition: { impactMax: 2.5, effortMin: 4.5 }, targetSize: 'XL', priority: 40 },
          { name: 'Major Money Pit', condition: { impactMax: 1.5, effortMin: 3.5 }, targetSize: 'XL', priority: 35 },
          { name: 'Minor Enhancement', condition: { impactMin: 2.0, effortMax: 1.5 }, targetSize: 'XS', priority: 30 },
          { name: 'Small Maintenance', condition: { impactMax: 2.0, effortMax: 2.5 }, targetSize: 'XS', priority: 25 },
          { name: 'Low-Value Work', condition: { impactMax: 1.5, effortMax: 3.5 }, targetSize: 'S', priority: 20 },
          { name: 'Trivial Task', condition: {}, targetSize: 'XS', priority: 10 }
        ],
        benefitMultipliers: { XS: 20000, S: 40000, M: 75000, L: 150000, XL: 300000 },
        benefitRangePct: 0.20
      },

      // TOM (Target Operating Model) Configuration
      tomConfig: {
        enabled: 'true',
        activePreset: 'coe_led',
        presets: {
          centralized: { name: 'Centralized CoE', description: 'Single AI team owns all delivery' },
          federated: { name: 'Federated Model', description: 'Business units own AI with central standards' },
          hybrid: { name: 'Hybrid Model', description: 'Central platform, distributed execution' },
          coe_led: { name: 'CoE-Led with Business Pods', description: 'CoE leads with embedded business pods' }
        },
        phases: [
          {
            id: 'foundation', name: 'Foundation',
            description: 'Initial setup, governance alignment, and backlog grooming',
            order: 1, priority: 1, color: '#3C2CDA',
            mappedStatuses: ['Discovery', 'Backlog', 'On Hold'],
            mappedDeployments: [],
            manualOnly: false, governanceGate: 'ai_steerco', expectedDurationWeeks: 8
          },
          {
            id: 'strategic', name: 'Strategic',
            description: 'Active development, pilots, and value validation',
            order: 2, priority: 2, color: '#1D86FF',
            mappedStatuses: ['In-flight'],
            mappedDeployments: ['PoC', 'Pilot'],
            manualOnly: false, governanceGate: 'working_group', expectedDurationWeeks: 16
          },
          {
            id: 'transition', name: 'Transition',
            description: 'Production deployment and capability transfer in progress',
            order: 3, priority: 3, color: '#14CBDE',
            mappedStatuses: ['Implemented'],
            mappedDeployments: ['Production'],
            manualOnly: false, governanceGate: 'business_owner', expectedDurationWeeks: 12
          },
          {
            id: 'steady_state', name: 'Steady State',
            description: 'Full client ownership, optimization mode',
            order: 4, priority: 4, color: '#07125E',
            mappedStatuses: [],
            mappedDeployments: [],
            manualOnly: true, governanceGate: 'none', expectedDurationWeeks: null
          }
        ],
        governanceBodies: [
          { id: 'ai_steerco', name: 'AI Steering Committee', role: 'Strategic oversight and investment decisions', cadence: 'Monthly' },
          { id: 'working_group', name: 'AI Working Group', role: 'Tactical execution and prioritization', cadence: 'Bi-weekly' },
          { id: 'business_owner', name: 'Business Owner Review', role: 'Value validation and adoption sign-off', cadence: 'Weekly' }
        ],
        derivationRules: {
          matchOrder: ['useCaseStatus', 'deploymentStatus'],
          fallbackBehavior: 'lowestPriority',
          nullDeploymentHandling: 'ignoreInMatching'
        }
      },

      // Value Realization Configuration with KPI Library
      valueRealizationConfig: {
        enabled: 'true',
        kpiLibrary: {
          cycle_time_reduction: {
            id: 'cycle_time_reduction', name: 'Cycle Time Reduction',
            description: 'Reduction in end-to-end processing time', unit: '%', direction: 'decrease',
            applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Reinsurance', 'Customer Servicing', 'Product & Rating', 'Human Resources'],
            industryBenchmarks: {
              'Claims Management': { baselineValue: 45, baselineUnit: 'minutes', baselineSource: 'McKinsey Insurance Operations 2024', improvementRange: { min: 40, max: 70 }, improvementUnit: '%', typicalTimeline: '6-12 months', maturityTiers: { foundational: { min: 20, max: 30 }, developing: { min: 40, max: 50 }, advanced: { min: 60, max: 70 } } },
              'Underwriting & Triage': { baselineValue: 120, baselineUnit: 'minutes', baselineSource: 'BCG Insurance Benchmarks 2024', improvementRange: { min: 30, max: 60 }, improvementUnit: '%', typicalTimeline: '9-18 months', maturityTiers: { foundational: { min: 15, max: 25 }, developing: { min: 30, max: 45 }, advanced: { min: 50, max: 60 } } }
            },
            maturityRules: [
              { level: 'advanced', conditions: { dataReadiness: { min: 4 }, technicalComplexity: { max: 2 }, adoptionReadiness: { min: 4 } }, range: { min: 60, max: 70 }, confidence: 'high' },
              { level: 'developing', conditions: { dataReadiness: { min: 3 }, technicalComplexity: { max: 3 } }, range: { min: 40, max: 50 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 20, max: 30 }, confidence: 'low' }
            ]
          },
          cost_per_transaction: {
            id: 'cost_per_transaction', name: 'Cost Per Transaction Reduction',
            description: 'Reduction in cost to process each transaction', unit: '%', direction: 'decrease',
            applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Reinsurance'],
            industryBenchmarks: {
              'Claims Management': { baselineValue: 125, baselineUnit: 'GBP', baselineSource: 'McKinsey Insurance Operations 2024', improvementRange: { min: 20, max: 35 }, improvementUnit: '%', typicalTimeline: '6-12 months', maturityTiers: { foundational: { min: 8, max: 15 }, developing: { min: 20, max: 28 }, advanced: { min: 30, max: 35 } } },
              'Billing': { baselineValue: 35, baselineUnit: 'GBP', baselineSource: 'Deloitte Insurance Study 2023', improvementRange: { min: 25, max: 45 }, improvementUnit: '%', typicalTimeline: '3-6 months', maturityTiers: { foundational: { min: 15, max: 22 }, developing: { min: 28, max: 36 }, advanced: { min: 40, max: 45 } } }
            },
            maturityRules: [
              { level: 'advanced', conditions: { dataReadiness: { min: 4 }, changeImpact: { max: 2 } }, range: { min: 25, max: 35 }, confidence: 'high' },
              { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 15, max: 25 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 8, max: 15 }, confidence: 'low' }
            ]
          },
          fte_efficiency: {
            id: 'fte_efficiency', name: 'FTE Efficiency Gain',
            description: 'FTE hours saved or reallocated per month', unit: 'hours/month', direction: 'increase',
            applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Submission & Quote', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Risk Consulting', 'Sales & Distribution', 'Customer Servicing', 'General', 'Product & Rating', 'Human Resources'],
            industryBenchmarks: {
              'Claims Management': { baselineValue: 160, baselineUnit: 'hours/FTE/month', baselineSource: 'Industry Average', improvementRange: { min: 15, max: 40 }, improvementUnit: '%', typicalTimeline: '6-12 months', maturityTiers: { foundational: { min: 50, max: 100 }, developing: { min: 200, max: 400 }, advanced: { min: 500, max: 800 } } }
            },
            maturityRules: [
              { level: 'advanced', conditions: { dataReadiness: { min: 4 }, adoptionReadiness: { min: 4 } }, range: { min: 500, max: 1000 }, confidence: 'high' },
              { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 200, max: 500 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 50, max: 200 }, confidence: 'low' }
            ]
          },
          accuracy_improvement: {
            id: 'accuracy_improvement', name: 'Accuracy Improvement',
            description: 'Improvement in decision or data accuracy', unit: '%', direction: 'increase',
            applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Policy Servicing', 'Billing', 'Financial Management', 'Regulatory & Compliance', 'Reinsurance', 'Product & Rating'],
            industryBenchmarks: {
              'Claims Management': { baselineValue: 85, baselineUnit: '% accuracy', baselineSource: 'Industry Average', improvementRange: { min: 5, max: 12 }, improvementUnit: 'percentage points', typicalTimeline: '6-12 months', maturityTiers: { foundational: { min: 2, max: 4 }, developing: { min: 5, max: 8 }, advanced: { min: 10, max: 12 } } }
            },
            maturityRules: [
              { level: 'advanced', conditions: { dataReadiness: { min: 4 }, technicalComplexity: { max: 3 } }, range: { min: 10, max: 15 }, confidence: 'high' },
              { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 5, max: 10 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 2, max: 5 }, confidence: 'low' }
            ]
          },
          customer_satisfaction: {
            id: 'customer_satisfaction', name: 'Customer Satisfaction Improvement',
            description: 'Improvement in CSAT or NPS scores', unit: 'points', direction: 'increase',
            applicableProcesses: ['Customer Servicing', 'Claims Management', 'Sales & Distribution', 'Risk Consulting'],
            industryBenchmarks: {},
            maturityRules: [
              { level: 'advanced', conditions: { adoptionReadiness: { min: 4 } }, range: { min: 10, max: 15 }, confidence: 'high' },
              { level: 'developing', conditions: { adoptionReadiness: { min: 3 } }, range: { min: 5, max: 10 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 2, max: 5 }, confidence: 'low' }
            ]
          },
          loss_ratio_reduction: {
            id: 'loss_ratio_reduction', name: 'Loss Ratio Reduction',
            description: 'Reduction in claims loss ratio', unit: 'percentage points', direction: 'decrease',
            applicableProcesses: ['Claims Management', 'Underwriting & Triage', 'Risk Consulting'],
            industryBenchmarks: {},
            maturityRules: [
              { level: 'advanced', conditions: { dataReadiness: { min: 4 }, modelRisk: { max: 2 } }, range: { min: 3, max: 5 }, confidence: 'high' },
              { level: 'developing', conditions: { dataReadiness: { min: 3 } }, range: { min: 1.5, max: 3 }, confidence: 'medium' },
              { level: 'foundational', conditions: {}, range: { min: 0.5, max: 1.5 }, confidence: 'low' }
            ]
          }
        },
        calculationConfig: {
          roiFormula: '((cumulativeValue - totalInvestment) / totalInvestment) * 100',
          breakevenFormula: 'totalInvestment / monthlyValue',
          defaultCurrency: 'GBP',
          fiscalYearStart: 4
        }
      },

      // Capability Transition Configuration ("Teach Us to Fish")
      capabilityTransitionConfig: {
        enabled: 'true',
        independenceTargets: {
          foundation: { min: 0, max: 20, description: 'Vendor-led, client observing' },
          strategic: { min: 20, max: 50, description: 'Joint execution, client learning' },
          transition: { min: 50, max: 85, description: 'Client-led, vendor supporting' },
          steadyState: { min: 85, max: 100, description: 'Client self-sufficient' }
        },
        knowledgeTransferMilestones: [
          { id: 'kt_001', name: 'Solution Design Handover', description: 'Client team understands architecture and design decisions', phase: 'foundation', order: 1, requiredArtifacts: ['Architecture diagram', 'Design decisions doc'] },
          { id: 'kt_002', name: 'Development Shadowing Complete', description: 'Client developers have paired on all major components', phase: 'strategic', order: 2, requiredArtifacts: ['Pairing log', 'Code walkthrough recordings'] },
          { id: 'kt_003', name: 'Operations Handover', description: 'Client ops team can deploy, monitor, and troubleshoot', phase: 'strategic', order: 3, requiredArtifacts: ['Runbook', 'Monitoring dashboard access'] },
          { id: 'kt_004', name: 'First Client-Led Release', description: 'Client team completes a release without vendor assistance', phase: 'transition', order: 4, requiredArtifacts: ['Release notes', 'Post-release review'] },
          { id: 'kt_005', name: 'Model Retraining Capability', description: 'Client team can retrain and deploy model updates', phase: 'transition', order: 5, requiredArtifacts: ['Retraining procedure', 'Model registry access'] },
          { id: 'kt_006', name: 'Full Independence Certification', description: 'Client team certified to operate without vendor support', phase: 'steadyState', order: 6, requiredArtifacts: ['Capability assessment', 'Sign-off document'] }
        ],
        roleTransitions: [
          { role: 'Solution Architect', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 12 },
          { role: 'Data Engineer', vendorStartFte: 2.0, clientEndFte: 2.0, transitionMonth: 9 },
          { role: 'ML Engineer', vendorStartFte: 2.0, clientEndFte: 1.5, transitionMonth: 12 },
          { role: 'Business Analyst', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 6 },
          { role: 'QA Engineer', vendorStartFte: 1.0, clientEndFte: 1.0, transitionMonth: 9 },
          { role: 'Project Manager', vendorStartFte: 0.5, clientEndFte: 0.5, transitionMonth: 6 }
        ],
        certifications: [
          { id: 'cert_001', name: 'AI/ML Foundations', description: 'Basic understanding of AI/ML concepts', targetAudience: ['Business Analyst', 'Project Manager'], estimatedHours: 16 },
          { id: 'cert_002', name: 'Platform Operations', description: 'Deployment, monitoring, and troubleshooting', targetAudience: ['Data Engineer', 'ML Engineer'], estimatedHours: 24 },
          { id: 'cert_003', name: 'Model Development', description: 'Model training, evaluation, and optimization', targetAudience: ['ML Engineer', 'Data Scientist'], estimatedHours: 40 },
          { id: 'cert_004', name: 'AI Governance & Ethics', description: 'Responsible AI principles and compliance', targetAudience: ['All roles'], estimatedHours: 8 }
        ],
        benchmarkConfig: {
          archetypes: {
            foundation_centralized: { independenceRange: [0, 15], vendorFteMultiplier: 1.0, clientFteMultiplier: 0.1, transitionMonths: 18 },
            foundation_coe: { independenceRange: [5, 25], vendorFteMultiplier: 0.9, clientFteMultiplier: 0.2, transitionMonths: 15 },
            strategic_hybrid: { independenceRange: [25, 50], vendorFteMultiplier: 0.6, clientFteMultiplier: 0.5, transitionMonths: 12 },
            transition_hybrid: { independenceRange: [50, 75], vendorFteMultiplier: 0.35, clientFteMultiplier: 0.75, transitionMonths: 9 },
            steady_state_federated: { independenceRange: [85, 100], vendorFteMultiplier: 0.1, clientFteMultiplier: 1.0, transitionMonths: 3 }
          },
          paceModifiers: { 'Quick Win': 0.7, 'Strategic Bet': 1.0, 'Experimental': 1.2, 'Watchlist': 1.5 },
          tShirtBaseFte: { XS: 2, S: 3, M: 5, L: 8, XL: 12 }
        }
      },

      // Time Estimation Configuration for questionnaires
      timeEstimationConfig: {
        minMultiplier: 2.5,
        maxMultiplier: 4
      }
    } as any);
    
    console.log("✅ Complete metadata configuration seeded - all features now DB-driven");
  } catch (error) {
    console.error('Error seeding metadata config:', error);
  }
}
