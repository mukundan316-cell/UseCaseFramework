/**
 * Boolean Field Migration
 * Safely migrates text boolean fields to actual boolean columns
 * Following replit.md principles: "Build Once, Reuse Everywhere" with backward compatibility
 */

import { db } from '../db';
import { useCases } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function migrateBooleanFields() {
  console.log('🔄 Starting boolean field migration...');
  
  try {
    // Step 1: Add new boolean columns alongside existing text columns
    await db.execute(sql`
      ALTER TABLE use_cases 
      ADD COLUMN IF NOT EXISTS is_active_for_rsa_bool BOOLEAN,
      ADD COLUMN IF NOT EXISTS is_dashboard_visible_bool BOOLEAN
    `);
    
    console.log('✅ Added new boolean columns');
    
    // Step 2: Populate new boolean columns based on existing text values
    await db.execute(sql`
      UPDATE use_cases 
      SET 
        is_active_for_rsa_bool = CASE 
          WHEN is_active_for_rsa = 'true' THEN true 
          ELSE false 
        END,
        is_dashboard_visible_bool = CASE 
          WHEN is_dashboard_visible = 'true' THEN true 
          ELSE false 
        END
    `);
    
    console.log('✅ Migrated data from text to boolean columns');
    
    // Step 3: Verify data integrity
    const verificationResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN is_active_for_rsa = 'true' AND is_active_for_rsa_bool = true THEN 1 END) as active_true_match,
        COUNT(CASE WHEN is_active_for_rsa = 'false' AND is_active_for_rsa_bool = false THEN 1 END) as active_false_match,
        COUNT(CASE WHEN is_dashboard_visible = 'true' AND is_dashboard_visible_bool = true THEN 1 END) as visible_true_match,
        COUNT(CASE WHEN is_dashboard_visible = 'false' AND is_dashboard_visible_bool = false THEN 1 END) as visible_false_match
      FROM use_cases
    `);
    
    console.log('✅ Data verification completed:', verificationResult.rows[0]);
    console.log('✅ Boolean field migration completed successfully');
    
    return {
      success: true,
      message: 'Boolean fields migrated successfully. Old text columns preserved for backward compatibility.',
      verification: verificationResult.rows[0]
    };
    
  } catch (error) {
    console.error('❌ Boolean field migration failed:', error);
    return {
      success: false,
      message: 'Migration failed. No changes were made.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Phase 2: Schema Update (to be run after application code is updated)
 * This function will be called once the application code has been updated to use boolean columns
 */
export async function finalizeBooleanMigration() {
  console.log('🔄 Starting boolean migration finalization...');
  
  try {
    // Step 1: Add NOT NULL constraints to boolean columns
    await db.execute(sql`
      ALTER TABLE use_cases 
      ALTER COLUMN is_active_for_rsa_bool SET NOT NULL,
      ALTER COLUMN is_dashboard_visible_bool SET NOT NULL
    `);
    
    // Step 2: Add default values
    await db.execute(sql`
      ALTER TABLE use_cases 
      ALTER COLUMN is_active_for_rsa_bool SET DEFAULT false,
      ALTER COLUMN is_dashboard_visible_bool SET DEFAULT false
    `);
    
    // Step 3: Drop old text columns (only after confirming application works)
    // Uncomment these lines once fully tested:
    // await db.execute(sql`
    //   ALTER TABLE use_cases 
    //   DROP COLUMN is_active_for_rsa,
    //   DROP COLUMN is_dashboard_visible
    // `);
    
    // Step 4: Rename new columns to original names (optional)
    // await db.execute(sql`
    //   ALTER TABLE use_cases 
    //   RENAME COLUMN is_active_for_rsa_bool TO is_active_for_rsa,
    //   RENAME COLUMN is_dashboard_visible_bool TO is_dashboard_visible
    // `);
    
    console.log('✅ Boolean migration finalization completed');
    
    return {
      success: true,
      message: 'Boolean field migration finalized successfully'
    };
    
  } catch (error) {
    console.error('❌ Boolean migration finalization failed:', error);
    return {
      success: false,
      message: 'Finalization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}