-- =============================================================================
-- AI INVENTORY GOVERNANCE FIELDS MIGRATION SCRIPT
-- =============================================================================
-- Purpose: Safely add AI inventory governance fields to existing use_cases table
-- Date: $(date)
-- Records: 25 existing use cases (verified)
-- Architecture: Maintains backward compatibility and data integrity
-- =============================================================================

-- STEP 1: BACKUP CURRENT DATA (Verification Query)
-- Run this first to verify current state
-- SELECT COUNT(*) as current_records FROM use_cases;
-- Expected: 25 records

-- STEP 2: ADD NEW AI INVENTORY GOVERNANCE FIELDS
-- All fields are nullable for backward compatibility

-- Add AI or Model classification field
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS ai_or_model text;

-- Add risk assessment fields
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS risk_to_customers text;

ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS risk_to_rsa text;

-- Add data governance fields
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS data_used text;

ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS model_owner text;

ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS rsa_policy_governance text;

-- Add validation and stakeholder fields
ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS validation_responsibility text;

ALTER TABLE use_cases 
ADD COLUMN IF NOT EXISTS informed_by text;

-- STEP 3: VERIFICATION QUERIES
-- Run these to verify migration success

-- Verify all new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'use_cases' 
AND column_name IN (
    'ai_or_model', 
    'risk_to_customers', 
    'risk_to_rsa', 
    'data_used', 
    'model_owner', 
    'rsa_policy_governance', 
    'validation_responsibility', 
    'informed_by'
);

-- Verify existing records are intact
SELECT COUNT(*) as records_after_migration FROM use_cases;
-- Expected: 25 records (no data loss)

-- Verify existing data integrity
SELECT id, title, description, process, line_of_business 
FROM use_cases 
WHERE title IS NOT NULL 
LIMIT 5;

-- Verify new fields are properly nullable
SELECT 
    COUNT(*) as total_records,
    COUNT(ai_or_model) as ai_or_model_populated,
    COUNT(risk_to_customers) as risk_to_customers_populated,
    COUNT(data_used) as data_used_populated
FROM use_cases;
-- Expected: total_records = 25, new fields = 0 (all NULL initially)

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =============================================================================
-- WARNING: Only use if migration needs to be reverted
-- These commands will remove the new columns and their data

/*
-- Remove AI inventory governance fields
ALTER TABLE use_cases DROP COLUMN IF EXISTS ai_or_model;
ALTER TABLE use_cases DROP COLUMN IF EXISTS risk_to_customers;
ALTER TABLE use_cases DROP COLUMN IF EXISTS risk_to_rsa;
ALTER TABLE use_cases DROP COLUMN IF EXISTS data_used;
ALTER TABLE use_cases DROP COLUMN IF EXISTS model_owner;
ALTER TABLE use_cases DROP COLUMN IF EXISTS rsa_policy_governance;
ALTER TABLE use_cases DROP COLUMN IF EXISTS validation_responsibility;
ALTER TABLE use_cases DROP COLUMN IF EXISTS informed_by;

-- Verify rollback
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'use_cases' 
AND column_name IN (
    'ai_or_model', 'risk_to_customers', 'risk_to_rsa', 
    'data_used', 'model_owner', 'rsa_policy_governance', 
    'validation_responsibility', 'informed_by'
);
-- Expected: No rows returned
*/

-- =============================================================================
-- MIGRATION VALIDATION CHECKLIST
-- =============================================================================
-- [ ] 1. Backup verification: 25 use cases exist before migration
-- [ ] 2. Migration execution: All ALTER TABLE statements complete successfully
-- [ ] 3. Column verification: All 8 new columns exist and are nullable
-- [ ] 4. Data integrity: All 25 existing records remain intact
-- [ ] 5. API compatibility: Existing endpoints continue working
-- [ ] 6. Schema sync: Drizzle schema matches database structure
-- =============================================================================