/**
 * RSA Assessment Questions Seeder
 * Creates all questions and options for the 6 sections
 */

import { db } from '../db';
import { questions, questionOptions, type QuestionnaireSection } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Section 1: Business Strategy & AI Vision Questions
const SECTION_1_QUESTIONS = [
  {
    questionText: "What is RSA's current Gross Written Premium (GWP)?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "This helps us understand your company scale and maturity",
    options: [
      { text: "Small (<£100M)", value: "small", score: 1, order: 1 },
      { text: "Mid (£100M-£3B)", value: "mid", score: 3, order: 2 },
      { text: "Large (>£3B)", value: "large", score: 5, order: 3 }
    ]
  },
  {
    questionText: "Which markets does RSA primarily operate in?",
    questionType: "multiselect" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Select all that apply - this influences AI use case priorities",
    options: [
      { text: "Personal Lines", value: "personal", score: 2, order: 1 },
      { text: "Commercial Lines", value: "commercial", score: 4, order: 2 },
      { text: "Specialty Insurance", value: "specialty", score: 5, order: 3 },
      { text: "Reinsurance", value: "reinsurance", score: 3, order: 4 }
    ]
  },
  {
    questionText: "How would you rate your current AI strategy maturity?",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 3,
    helpText: "1 = No formal strategy, 5 = Comprehensive AI strategy with clear roadmap",
    options: [
      { text: "1 - No Strategy", value: "1", score: 1, order: 1 },
      { text: "2 - Emerging", value: "2", score: 2, order: 2 },
      { text: "3 - Defined", value: "3", score: 3, order: 3 },
      { text: "4 - Advanced", value: "4", score: 4, order: 4 },
      { text: "5 - Leading", value: "5", score: 5, order: 5 }
    ]
  },
  {
    questionText: "What is your target AI investment over the next 2 years?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 4,
    helpText: "This helps scope appropriate recommendations",
    options: [
      { text: "£500K - £2M", value: "tier1", score: 2, order: 1 },
      { text: "£2M - £5M", value: "tier2", score: 3, order: 2 },
      { text: "£5M - £10M", value: "tier3", score: 4, order: 3 },
      { text: "£10M+", value: "tier4", score: 5, order: 4 }
    ]
  },
  {
    questionText: "What is your risk appetite for AI experimentation in regulated areas?",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 5,
    helpText: "1 = Very conservative, 5 = Willing to be an early adopter",
    options: [
      { text: "1 - Very Conservative", value: "1", score: 1, order: 1 },
      { text: "2 - Conservative", value: "2", score: 2, order: 2 },
      { text: "3 - Moderate", value: "3", score: 3, order: 3 },
      { text: "4 - Aggressive", value: "4", score: 4, order: 4 },
      { text: "5 - Very Aggressive", value: "5", score: 5, order: 5 }
    ]
  }
];

// Section 2: Current AI & Data Capabilities Questions
const SECTION_2_QUESTIONS = [
  {
    questionText: "What is your primary data architecture approach?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "Understanding current data foundation is critical for AI success",
    options: [
      { text: "Traditional Data Warehouse", value: "warehouse", score: 2, order: 1 },
      { text: "Data Lake", value: "lake", score: 3, order: 2 },
      { text: "Lakehouse Architecture", value: "lakehouse", score: 4, order: 3 },
      { text: "Modern Data Platform", value: "modern", score: 5, order: 4 }
    ]
  },
  {
    questionText: "Which AI/ML technologies are currently in use?",
    questionType: "multiselect" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Select all technologies currently deployed in production",
    options: [
      { text: "Statistical Models", value: "statistical", score: 2, order: 1 },
      { text: "Machine Learning", value: "ml", score: 3, order: 2 },
      { text: "Deep Learning", value: "dl", score: 4, order: 3 },
      { text: "Generative AI", value: "genai", score: 5, order: 4 },
      { text: "Computer Vision", value: "cv", score: 4, order: 5 },
      { text: "Natural Language Processing", value: "nlp", score: 4, order: 6 },
      { text: "None Currently", value: "none", score: 1, order: 7 }
    ]
  },
  {
    questionText: "How would you rate your cloud and infrastructure readiness?",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 3,
    helpText: "Rate overall cloud strategy maturity from 1 (basic) to 5 (advanced)",
    options: [
      { text: "1 - Basic", value: "1", score: 1, order: 1 },
      { text: "2 - Developing", value: "2", score: 2, order: 2 },
      { text: "3 - Intermediate", value: "3", score: 3, order: 3 },
      { text: "4 - Advanced", value: "4", score: 4, order: 4 },
      { text: "5 - Expert", value: "5", score: 5, order: 5 }
    ]
  }
];

// Section 3: Use Case Discovery & Validation Questions
const SECTION_3_QUESTIONS = [
  {
    questionText: "Which AI use cases are you most interested in exploring?",
    questionType: "multiselect" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "Select your top priority use cases for AI implementation",
    options: [
      { text: "Automated Underwriting", value: "underwriting", score: 5, order: 1 },
      { text: "Claims Processing Automation", value: "claims", score: 5, order: 2 },
      { text: "Fraud Detection", value: "fraud", score: 4, order: 3 },
      { text: "Customer Service Automation", value: "customer", score: 3, order: 4 },
      { text: "Risk Assessment", value: "risk", score: 4, order: 5 },
      { text: "Pricing Optimization", value: "pricing", score: 4, order: 6 },
      { text: "Document Processing", value: "documents", score: 3, order: 7 }
    ]
  },
  {
    questionText: "Which use cases could deliver value within 3-6 months?",
    questionType: "multiselect" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Select use cases suitable for quick wins",
    options: [
      { text: "Document Classification", value: "doc_classification", score: 4, order: 1 },
      { text: "Email Routing", value: "email_routing", score: 5, order: 2 },
      { text: "Chatbot for FAQs", value: "chatbot", score: 4, order: 3 },
      { text: "Data Quality Checks", value: "data_quality", score: 3, order: 4 },
      { text: "Report Generation", value: "reporting", score: 3, order: 5 },
      { text: "Process Mining", value: "process_mining", score: 2, order: 6 }
    ]
  }
];

// Section 4: Technology & Infrastructure Questions  
const SECTION_4_QUESTIONS = [
  {
    questionText: "What is your preferred AI platform strategy?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "Choose the approach that best aligns with your technology strategy",
    options: [
      { text: "Cloud-first (Azure, AWS, GCP)", value: "cloud_first", score: 5, order: 1 },
      { text: "Hybrid Cloud", value: "hybrid", score: 4, order: 2 },
      { text: "On-premise with Cloud Burst", value: "on_prem_burst", score: 3, order: 3 },
      { text: "Primarily On-premise", value: "on_premise", score: 2, order: 4 }
    ]
  },
  {
    questionText: "Rate your API management maturity",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Assess your ability to integrate AI solutions with existing systems",
    options: [
      { text: "1 - Basic", value: "1", score: 1, order: 1 },
      { text: "2 - Developing", value: "2", score: 2, order: 2 },
      { text: "3 - Intermediate", value: "3", score: 3, order: 3 },
      { text: "4 - Advanced", value: "4", score: 4, order: 4 },
      { text: "5 - Expert", value: "5", score: 5, order: 5 }
    ]
  }
];

// Section 5: People, Process & Change Management Questions
const SECTION_5_QUESTIONS = [
  {
    questionText: "What is your workforce's overall readiness for AI-driven change?",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "Consider change management history, digital literacy, and leadership support",
    options: [
      { text: "1 - Low Readiness", value: "1", score: 1, order: 1 },
      { text: "2 - Below Average", value: "2", score: 2, order: 2 },
      { text: "3 - Moderate", value: "3", score: 3, order: 3 },
      { text: "4 - Above Average", value: "4", score: 4, order: 4 },
      { text: "5 - High Readiness", value: "5", score: 5, order: 5 }
    ]
  },
  {
    questionText: "How would you describe leadership support for AI initiatives?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Assess the level of executive sponsorship and commitment",
    options: [
      { text: "Minimal - Some interest but no commitment", value: "minimal", score: 1, order: 1 },
      { text: "Basic - Verbal support but limited resources", value: "basic", score: 2, order: 2 },
      { text: "Moderate - Some budget and resources allocated", value: "moderate", score: 3, order: 3 },
      { text: "Strong - Clear champion with significant resources", value: "strong", score: 4, order: 4 },
      { text: "Exceptional - Board-level commitment and investment", value: "exceptional", score: 5, order: 5 }
    ]
  }
];

// Section 6: Governance, Risk & Compliance Questions
const SECTION_6_QUESTIONS = [
  {
    questionText: "How mature is your AI governance framework?",
    questionType: "scale" as const,
    isRequired: "true" as const,
    questionOrder: 1,
    helpText: "Assess your AI ethics, bias monitoring, and governance policies",
    options: [
      { text: "1 - No Framework", value: "1", score: 1, order: 1 },
      { text: "2 - Basic Policies", value: "2", score: 2, order: 2 },
      { text: "3 - Developing Framework", value: "3", score: 3, order: 3 },
      { text: "4 - Comprehensive Framework", value: "4", score: 4, order: 4 },
      { text: "5 - Leading Practice", value: "5", score: 5, order: 5 }
    ]
  },
  {
    questionText: "What is your approach to AI model explainability and bias monitoring?",
    questionType: "select" as const,
    isRequired: "true" as const,
    questionOrder: 2,
    helpText: "Regulatory compliance requires transparent and unbiased AI models",
    options: [
      { text: "No current approach", value: "none", score: 1, order: 1 },
      { text: "Basic monitoring in development", value: "basic", score: 2, order: 2 },
      { text: "Systematic monitoring with tools", value: "systematic", score: 4, order: 3 },
      { text: "Comprehensive framework with continuous monitoring", value: "comprehensive", score: 5, order: 4 }
    ]
  }
];

const QUESTIONS_BY_SECTION = [
  SECTION_1_QUESTIONS,
  SECTION_2_QUESTIONS,
  SECTION_3_QUESTIONS,
  SECTION_4_QUESTIONS,
  SECTION_5_QUESTIONS,
  SECTION_6_QUESTIONS
];

export async function seedRSAQuestions(sections: QuestionnaireSection[]) {
  console.log('🔄 Creating RSA Assessment questions...');

  for (let i = 0; i < sections.length && i < QUESTIONS_BY_SECTION.length; i++) {
    const section = sections[i];
    const sectionQuestions = QUESTIONS_BY_SECTION[i];

    // Clear existing questions for this section
    await db
      .delete(questions)
      .where(eq(questions.sectionId, section.id));

    console.log(`📝 Creating ${sectionQuestions.length} questions for section: ${section.title}`);

    for (const questionData of sectionQuestions) {
      const { options, ...questionFields } = questionData;
      
      // Create the question
      const [question] = await db
        .insert(questions)
        .values({
          sectionId: section.id,
          ...questionFields
        })
        .returning();

      // Create options for this question
      if (options && options.length > 0) {
        for (const optionData of options) {
          await db
            .insert(questionOptions)
            .values({
              questionId: question.id,
              optionText: optionData.text,
              optionValue: optionData.value,
              scoreValue: optionData.score,
              optionOrder: optionData.order
            });
        }
        console.log(`  ✅ Created question "${question.questionText}" with ${options.length} options`);
      } else {
        console.log(`  ✅ Created text question "${question.questionText}"`);
      }
    }
  }

  console.log('✅ All RSA Assessment questions created successfully');
}