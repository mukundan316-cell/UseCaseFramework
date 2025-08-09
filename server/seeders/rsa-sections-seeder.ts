/**
 * RSA Questionnaire Sections Seeder
 * Creates the 6 main assessment sections
 */

import { db } from '../db';
import { questionnaireSections } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const RSA_SECTIONS_DATA = [
  {
    title: "Business Strategy & AI Vision",
    sectionOrder: 1,
    sectionNumber: 1,
    estimatedTime: 45,
    sectionType: "business_strategy" as const
  },
  {
    title: "Current AI & Data Capabilities", 
    sectionOrder: 2,
    sectionNumber: 2,
    estimatedTime: 60,
    sectionType: "ai_capabilities" as const
  },
  {
    title: "Use Case Discovery & Validation",
    sectionOrder: 3,
    sectionNumber: 3,
    estimatedTime: 30,
    sectionType: "use_case_discovery" as const
  },
  {
    title: "Technology & Infrastructure Readiness",
    sectionOrder: 4,
    sectionNumber: 4,
    estimatedTime: 45,
    sectionType: "technology_infrastructure" as const
  },
  {
    title: "People, Process & Change Management",
    sectionOrder: 5,
    sectionNumber: 5,
    estimatedTime: 30,
    sectionType: "people_process_change" as const
  },
  {
    title: "Governance, Risk & Compliance",
    sectionOrder: 6,
    sectionNumber: 6,
    estimatedTime: 30,
    sectionType: "regulatory_compliance" as const
  }
];

export async function seedRSASections(questionnaireId: string) {
  console.log('📑 Creating RSA Assessment sections...');

  // Clear existing sections for this questionnaire
  await db
    .delete(questionnaireSections)
    .where(eq(questionnaireSections.questionnaireId, questionnaireId));

  const sections = [];
  for (const sectionData of RSA_SECTIONS_DATA) {
    const [section] = await db
      .insert(questionnaireSections)
      .values({
        questionnaireId,
        ...sectionData
      })
      .returning();
    
    sections.push(section);
    console.log(`✅ Created section: ${section.title}`);
  }

  return sections;
}