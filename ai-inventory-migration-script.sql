-- =========================================================================
-- AI INVENTORY DATA MIGRATION SCRIPT TEMPLATE
-- =========================================================================
-- Purpose: Migrate 57 AI tools from AIToolInventory.xlsx to use_cases table
-- Expected Total Records: 82 (25 existing + 57 new AI tools)
-- =========================================================================

-- STEP 1: VERIFY CURRENT STATE
-- Run this first to confirm baseline
SELECT COUNT(*) as current_record_count FROM use_cases;
-- Expected: 25 records before migration

-- STEP 2: SAMPLE AI TOOL INSERT (Template for Excel data processing)
-- Replace with actual data from AIToolInventory.xlsx

INSERT INTO use_cases (
  title,
  description,
  process,
  line_of_business,
  use_case_type,
  library_source,
  library_tier,
  is_active_for_rsa,
  is_dashboard_visible,
  
  -- AI Inventory Governance Fields
  ai_or_model,
  risk_to_customers,
  risk_to_rsa,
  data_used,
  model_owner,
  rsa_policy_governance,
  third_party_model,
  validation_responsibility,
  informed_by,
  
  -- Strategic Scoring Fields (set to neutral/default values for AI tools)
  revenue_impact, cost_savings, risk_reduction, strategic_fit,
  broker_partner_experience, data_readiness, technical_complexity,
  change_impact, model_risk, adoption_readiness,
  
  -- Calculated Fields (will be auto-calculated)
  impact_score, effort_score, quadrant
) VALUES (
  'Sample AI Tool', -- title (from Excel Column A)
  'Description of the AI tool functionality', -- description (from Excel Column D)
  'Claims Management', -- process (from Excel Column E)
  'All Lines', -- line_of_business (default or mapped value)
  'AI Tool', -- use_case_type (default for AI tools)
  'sharepoint_import', -- library_source (identifies as AI inventory)
  'reference', -- library_tier (default)
  'false', -- is_active_for_rsa (default)
  'true', -- is_dashboard_visible (show in admin)
  
  -- Governance Fields (from Excel columns)
  'AI', -- ai_or_model (Column B: AI/Model)
  'Low risk to customer operations', -- risk_to_customers (Column F)
  'Medium operational risk', -- risk_to_rsa (Column G)
  'Customer data, policy information', -- data_used (Column H)
  'John Smith - AI Team', -- model_owner (Column I)
  'RSA AI Policy Framework v2.1', -- rsa_policy_governance (Column J)
  'no', -- third_party_model (Column K: Yes/No)
  'Internal', -- validation_responsibility (Column L)
  'Risk Management Committee', -- informed_by (Column M)
  
  -- Strategic fields (default neutral values for AI tools)
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  
  -- Auto-calculated fields (neutral scoring for AI tools)
  3.0, 3.0, 'Experimental'
);

-- STEP 3: BULK MIGRATION TEMPLATE
-- FOR DEVELOPERS: Use this pattern to process Excel data
/*
Example JavaScript/Node.js script to process Excel and generate SQL:

const XLSX = require('xlsx');
const fs = require('fs');

// Read Excel file
const workbook = XLSX.readFile('AIToolInventory.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

let insertStatements = [];

for (let i = 1; i < data.length; i++) { // Skip header row
  const row = data[i];
  if (!row[0]) continue; // Skip empty rows
  
  const cleanData = {
    title: (row[0] || 'Untitled AI Tool').replace(/'/g, "''"),
    aiOrModel: row[1] || 'AI',
    status: row[2] || 'Active',
    description: (row[3] || 'No description provided').replace(/'/g, "''"),
    process: (row[4] || 'Unknown').replace(/'/g, "''"),
    riskToCustomers: (row[5] || '').replace(/'/g, "''"),
    riskToRsa: (row[6] || '').replace(/'/g, "''"),
    dataUsed: (row[7] || '').replace(/'/g, "''"),
    modelOwner: (row[8] || '').replace(/'/g, "''"),
    rsaPolicyGovernance: (row[9] || '').replace(/'/g, "''"),
    thirdPartyModel: (row[10] === 'Yes') ? 'yes' : 'no',
    validationResponsibility: (row[11] || '').replace(/'/g, "''"),
    informedBy: (row[12] || '').replace(/'/g, "''")}
  };
  
  const insertSQL = `
INSERT INTO use_cases (
  title, description, process, line_of_business, use_case_type,
  library_source, library_tier, is_active_for_rsa, is_dashboard_visible,
  ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
  rsa_policy_governance, third_party_model, validation_responsibility, informed_by,
  revenue_impact, cost_savings, risk_reduction, strategic_fit, broker_partner_experience,
  data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
  impact_score, effort_score, quadrant
) VALUES (
  '${cleanData.title}',
  '${cleanData.description}',
  '${cleanData.process}',
  'All Lines',
  'AI Tool',
  'sharepoint_import',
  'reference',
  'false',
  'true',
  '${cleanData.aiOrModel}',
  '${cleanData.riskToCustomers}',
  '${cleanData.riskToRsa}',
  '${cleanData.dataUsed}',
  '${cleanData.modelOwner}',
  '${cleanData.rsaPolicyGovernance}',
  '${cleanData.thirdPartyModel}',
  '${cleanData.validationResponsibility}',
  '${cleanData.informedBy}',
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3.0, 3.0, 'Experimental'
);`;
  
  insertStatements.push(insertSQL);
}

// Write all INSERT statements to file
fs.writeFileSync('ai-tools-migration.sql', insertStatements.join('\n\n'));
*/

-- STEP 4: VALIDATION AFTER MIGRATION
-- Run these queries to verify successful migration

-- Check total record count (should be 82)
SELECT COUNT(*) as total_records FROM use_cases;

-- Verify AI tool records
SELECT COUNT(*) as ai_tool_count 
FROM use_cases 
WHERE library_source = 'sharepoint_import';

-- Sample AI tool data
SELECT title, ai_or_model, model_owner, validation_responsibility 
FROM use_cases 
WHERE library_source = 'sharepoint_import' 
LIMIT 5;

-- Verify existing strategic records unchanged
SELECT COUNT(*) as strategic_count 
FROM use_cases 
WHERE library_source IN ('rsa_internal', 'hexaware_external');

-- Check data integrity
SELECT 
  library_source,
  COUNT(*) as record_count,
  COUNT(ai_or_model) as governance_fields_populated,
  AVG(impact_score) as avg_impact_score
FROM use_cases 
GROUP BY library_source;

-- Expected Results:
-- rsa_internal: ~17 records, 0 governance fields, varied impact scores
-- hexaware_external: ~8 records, 0 governance fields, varied impact scores  
-- sharepoint_import: 57 records, 57 governance fields, 3.0 impact scores

-- =========================================================================
-- MIGRATION COMPLETION CHECKLIST
-- =========================================================================
-- [ ] Total use_cases records: 82 (25 existing + 57 AI tools)
-- [ ] All AI tools have library_source = 'sharepoint_import'
-- [ ] AI tools show governance fields (ai_or_model, model_owner, etc.)
-- [ ] Strategic use cases unchanged and still show impact/effort scores
-- [ ] CleanUseCaseCard displays purple governance tags for AI tools
-- [ ] Admin panel shows all 82 records correctly
-- [ ] Filtering works across both data types
-- =========================================================================