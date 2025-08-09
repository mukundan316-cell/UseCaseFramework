/**
 * RSA Questionnaire Metadata Seeder
 * Creates the main questionnaire record
 */

import { db } from '../db';
import { questionnaires } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function seedRSAQuestionnaire() {
  const questionnaireData = {
    id: '91684df8-9700-4605-bc3e-2320120e5e1b', // Use existing ID
    title: "RSA AI Maturity Assessment",
    description: "Comprehensive evaluation of your organization's AI readiness and maturity across 6 key domains",
    version: "2.0",
    status: "active" as const,

    createdAt: new Date()
  };

  // Check if questionnaire already exists
  const [existing] = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.id, questionnaireData.id));

  if (existing) {
    console.log('📋 RSA Questionnaire already exists, updating...');
    const [updated] = await db
      .update(questionnaires)
      .set({
        title: questionnaireData.title,
        description: questionnaireData.description,
        version: questionnaireData.version,
        status: questionnaireData.status
      })
      .where(eq(questionnaires.id, questionnaireData.id))
      .returning();
    
    return updated;
  }

  const [questionnaire] = await db
    .insert(questionnaires)
    .values(questionnaireData)
    .returning();

  console.log('✅ RSA Questionnaire created');
  return questionnaire;
}