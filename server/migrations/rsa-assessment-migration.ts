/**
 * RSA Assessment Migration
 * Database migration for RSA AI Maturity Assessment
 */

import { seedRSAQuestionnaire } from '../seeders/rsa-questionnaire-seeder';
import { seedRSASections } from '../seeders/rsa-sections-seeder';  
import { seedRSAQuestions } from '../seeders/rsa-questions-seeder';

export async function migrateRSAAssessment() {
  console.log('🔄 Starting RSA Assessment migration...');
  
  try {
    const questionnaire = await seedRSAQuestionnaire();
    const sections = await seedRSASections(questionnaire.id);
    await seedRSAQuestions(sections);
    console.log('✅ RSA Assessment migration completed successfully');
  } catch (error) {
    console.error('❌ RSA Assessment migration failed:', error);
    // Don't throw error to prevent server startup failure
  }
}