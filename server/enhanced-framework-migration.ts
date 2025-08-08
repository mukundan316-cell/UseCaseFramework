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
    // Add new columns to use_cases table
    await db.execute(sql`
      ALTER TABLE use_cases 
      ADD COLUMN IF NOT EXISTS broker_partner_experience INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS model_risk INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS explainability_bias INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS regulatory_compliance INTEGER DEFAULT 3;
    `);
    
    console.log('✅ Successfully added new framework columns');
    
    // Update existing records with reasonable default values based on use case type
    await db.execute(sql`
      UPDATE use_cases SET 
        broker_partner_experience = CASE 
          WHEN value_chain_component = 'Distribution' THEN 4
          WHEN value_chain_component = 'Customer Service' THEN 4
          WHEN value_chain_component = 'Policy Servicing' THEN 3
          ELSE 2
        END,
        model_risk = CASE
          WHEN value_chain_component = 'Underwriting' THEN 4
          WHEN value_chain_component = 'Claims' THEN 4
          WHEN value_chain_component = 'Fraud/Compliance' THEN 5
          ELSE 3
        END,
        explainability_bias = CASE
          WHEN value_chain_component = 'Underwriting' THEN 4
          WHEN value_chain_component = 'Claims' THEN 4
          WHEN value_chain_component = 'Fraud/Compliance' THEN 5
          ELSE 3
        END,
        regulatory_compliance = CASE
          WHEN value_chain_component = 'Fraud/Compliance' THEN 5
          WHEN value_chain_component = 'Underwriting' THEN 4
          WHEN value_chain_component = 'Customer Service' THEN 4
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
      
      // Update quadrant based on new scoring
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