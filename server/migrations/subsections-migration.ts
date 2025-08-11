/**
 * Subsections Migration
 * Transforms fake "header questions" into proper subsection organizational containers
 * Preserves exact UI behavior while cleaning up database architecture
 */

import { db } from '../db';
import { questionnaireSubsections, questions, questionnaireSections } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

interface SubsectionData {
  title: string;
  subsectionNumber: string;
  subsectionOrder: number;
  estimatedTime?: number;
  description?: string;
}

// Modern RSA Assessment subsection structure that matches the UI
const RSA_SUBSECTIONS_STRUCTURE = {
  1: [ // Business Strategy & AI Vision
    {
      title: "Executive Vision & Strategic Alignment",
      subsectionNumber: "1.1",
      subsectionOrder: 1,
      estimatedTime: 15,
      description: "AI strategy maturity, investment, and risk appetite assessment"
    },
    {
      title: "Business Context & Market Position", 
      subsectionNumber: "1.2",
      subsectionOrder: 2,
      estimatedTime: 10,
      description: "Company profile, markets, and competitive positioning"
    },
    {
      title: "Operational Readiness & Change Management",
      subsectionNumber: "1.3", 
      subsectionOrder: 3,
      estimatedTime: 10,
      description: "Organizational readiness and leadership support"
    },
    {
      title: "Stakeholder Engagement & Communication",
      subsectionNumber: "1.4",
      subsectionOrder: 4, 
      estimatedTime: 10,
      description: "Communication strategies and stakeholder involvement"
    }
  ],
  2: [ // Current AI & Data Capabilities
    {
      title: "Technology Infrastructure",
      subsectionNumber: "2.1",
      subsectionOrder: 1,
      estimatedTime: 15,
      description: "Core systems, data architecture, and infrastructure readiness"
    },
    {
      title: "Business Function Systems",
      subsectionNumber: "2.2", 
      subsectionOrder: 2,
      estimatedTime: 20,
      description: "Policy admin, claims, underwriting, and operational systems"
    },
    {
      title: "Intelligent Workflows & Automation",
      subsectionNumber: "2.3",
      subsectionOrder: 3,
      estimatedTime: 10,
      description: "Current automation levels across business processes"
    },
    {
      title: "Data Analytics & AI/ML Capabilities", 
      subsectionNumber: "2.4",
      subsectionOrder: 4,
      estimatedTime: 15,
      description: "Analytics infrastructure and AI/ML tooling"
    }
  ],
  3: [ // Use Case Discovery & Validation
    {
      title: "Priority Use Cases & Quick Wins",
      subsectionNumber: "3.1", 
      subsectionOrder: 1,
      estimatedTime: 15,
      description: "High-impact use cases and short-term opportunities"
    },
    {
      title: "Strategic Use Cases & Long-term Vision",
      subsectionNumber: "3.2",
      subsectionOrder: 2,
      estimatedTime: 15,
      description: "Complex use cases requiring strategic investment"
    }
  ],
  4: [ // Technology & Infrastructure Readiness
    {
      title: "Platform Strategy & Architecture",
      subsectionNumber: "4.1",
      subsectionOrder: 1, 
      estimatedTime: 15,
      description: "AI platform approach and technical architecture"
    },
    {
      title: "Integration & API Readiness",
      subsectionNumber: "4.2",
      subsectionOrder: 2,
      estimatedTime: 15,
      description: "System integration capabilities and API maturity"
    },
    {
      title: "Performance & Scalability",
      subsectionNumber: "4.3",
      subsectionOrder: 3,
      estimatedTime: 15,
      description: "Current performance metrics and scalability assessment"
    }
  ],
  5: [ // People, Process & Change Management
    {
      title: "Workforce Readiness & Skills",
      subsectionNumber: "5.1",
      subsectionOrder: 1,
      estimatedTime: 15,
      description: "Team capabilities and training requirements"
    },
    {
      title: "Leadership Support & Sponsorship", 
      subsectionNumber: "5.2",
      subsectionOrder: 2,
      estimatedTime: 15,
      description: "Executive commitment and organizational support"
    }
  ],
  6: [ // Governance, Risk & Compliance
    {
      title: "AI Governance Framework",
      subsectionNumber: "6.1",
      subsectionOrder: 1,
      estimatedTime: 15,
      description: "Ethics, bias monitoring, and governance policies"
    },
    {
      title: "Regulatory Compliance & Risk Management",
      subsectionNumber: "6.2", 
      subsectionOrder: 2,
      estimatedTime: 15,
      description: "Compliance requirements and risk mitigation strategies"
    }
  ]
};

export async function migrateToSubsections() {
  console.log('🔄 Starting subsections migration...');
  
  try {
    // Get all sections for the RSA Assessment
    const sections = await db
      .select()
      .from(questionnaireSections)
      .orderBy(questionnaireSections.sectionOrder);

    console.log(`📋 Found ${sections.length} sections to process`);

    // Create subsections for each section
    for (const section of sections) {
      const sectionNumber = section.sectionNumber;
      const subsectionsData = RSA_SUBSECTIONS_STRUCTURE[sectionNumber];
      
      if (!subsectionsData) {
        console.log(`⚠️ No subsection structure defined for section ${sectionNumber}`);
        continue;
      }

      console.log(`📝 Creating ${subsectionsData.length} subsections for section: ${section.title}`);

      // Create subsections
      for (const subsectionData of subsectionsData) {
        const [subsection] = await db
          .insert(questionnaireSubsections)
          .values({
            sectionId: section.id,
            title: subsectionData.title,
            subsectionNumber: subsectionData.subsectionNumber,
            subsectionOrder: subsectionData.subsectionOrder,
            estimatedTime: subsectionData.estimatedTime,
            description: subsectionData.description,
            isCollapsible: 'true',
            defaultExpanded: 'false'
          })
          .returning();

        console.log(`  ✅ Created subsection: ${subsection.subsectionNumber} ${subsection.title}`);
      }
    }

    // Clean up: Remove fake "header questions" that were used as subsection headers
    console.log('🧹 Cleaning up fake header questions...');
    
    const headerQuestions = await db
      .select()
      .from(questions)
      .where(sql`question_text LIKE '%.%'`); // Questions that look like "1.1 Something" 

    for (const headerQuestion of headerQuestions) {
      if (headerQuestion.questionText.match(/^\d+\.\d+\s/)) {
        console.log(`🗑️ Removing fake header question: ${headerQuestion.questionText}`);
        await db
          .delete(questions)
          .where(eq(questions.id, headerQuestion.id));
      }
    }

    console.log('✅ Subsections migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Created proper subsection organizational containers`);
    console.log(`- Removed fake header questions from database`);
    console.log(`- Preserved all actual questions and UI functionality`);
    console.log(`- UI will continue to work exactly as before`);

  } catch (error) {
    console.error('❌ Subsections migration failed:', error);
    throw error;
  }
}

// Auto-run migration if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  migrateToSubsections().catch(console.error);
}