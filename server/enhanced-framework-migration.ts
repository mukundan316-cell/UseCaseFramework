import { db } from './db';
import { useCases } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Migration script to add new framework columns to existing use cases
 * Adds: brokerPartnerExperience, modelRisk, explainabilityBias, regulatoryCompliance
 */
export async function migrateToEnhancedFramework() {
  console.log('🔄 Starting enhanced framework migration...');
  
  try {
    // Check if migration already completed - prevent re-running quadrant calculation
    const testUseCase = await db.select().from(useCases).limit(1);
    if (testUseCase.length > 0 && testUseCase[0].brokerPartnerExperience !== null) {
      console.log('✅ Enhanced framework migration already completed, skipping...');
      return;
    }
    // Add new columns to use_cases table
    await db.execute(sql`
      ALTER TABLE use_cases 
      ADD COLUMN IF NOT EXISTS broker_partner_experience INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS model_risk INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS explainability_bias INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS regulatory_compliance INTEGER DEFAULT 3;
    `);
    
    console.log('✅ Successfully added new framework columns');
    
    // Update existing records with reasonable default values based on process
    await db.execute(sql`
      UPDATE use_cases SET 
        broker_partner_experience = CASE 
          WHEN process = 'Distribution & Sales' THEN 4
          WHEN process = 'Customer Onboarding' THEN 4
          WHEN process = 'Policy Servicing' THEN 3
          ELSE 2
        END,
        model_risk = CASE
          WHEN process = 'Underwriting & Pricing' THEN 4
          WHEN process = 'Claims Processing' THEN 4
          WHEN process = 'Fraud Detection' THEN 5
          ELSE 3
        END,
        explainability_bias = CASE
          WHEN process = 'Underwriting & Pricing' THEN 4
          WHEN process = 'Claims Processing' THEN 4
          WHEN process = 'Fraud Detection' THEN 5
          ELSE 3
        END,
        regulatory_compliance = CASE
          WHEN process = 'Fraud Detection' THEN 5
          WHEN process = 'Underwriting & Pricing' THEN 4
          WHEN process = 'Customer Onboarding' THEN 4
          ELSE 3
        END
      WHERE broker_partner_experience IS NULL 
         OR model_risk IS NULL 
         OR explainability_bias IS NULL 
         OR regulatory_compliance IS NULL;
    `);
    
    console.log('✅ Updated existing records with enhanced framework values');
    
    // Recalculate scores using new comprehensive framework
    const allUseCases = await db.select().from(useCases);
    
    for (const useCase of allUseCases) {
      // New weighted impact score (5 dimensions × 20%)
      const impactScore = (
        useCase.revenueImpact + 
        useCase.costSavings + 
        useCase.riskReduction + 
        (useCase.brokerPartnerExperience || 3) + 
        useCase.strategicFit
      ) * 0.2;
      
      // New weighted effort score (5 dimensions × 20%)
      const effortScore = (
        useCase.dataReadiness + 
        useCase.technicalComplexity + 
        useCase.changeImpact + 
        (useCase.modelRisk || 3) + 
        useCase.adoptionReadiness
      ) * 0.2;
      
      // Update quadrant based on RSA Framework thresholds (3.0, not 4.0)
      let quadrant: string;
      if (impactScore >= 3.0 && effortScore < 3.0) {
        quadrant = "Quick Win";
      } else if (impactScore >= 3.0 && effortScore >= 3.0) {
        quadrant = "Strategic Bet";
      } else if (impactScore < 3.0 && effortScore < 3.0) {
        quadrant = "Experimental";
      } else {
        quadrant = "Watchlist";
      }
      
      await db.execute(sql`
        UPDATE use_cases 
        SET 
          impact_score = ${impactScore},
          effort_score = ${effortScore},
          quadrant = ${quadrant}
        WHERE id = ${useCase.id}
      `);
    }
    
    console.log('✅ Recalculated all scores using enhanced framework');
    console.log('🎉 Enhanced framework migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}