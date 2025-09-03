import fs from 'fs';

// Read the transformed data
const transformedData = JSON.parse(fs.readFileSync('data_transformed.json', 'utf8'));

// Use direct database insertion via pg
import pkg from '@neondatabase/serverless';
const { neonConfig, Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

// Create bulk import using direct database connection
const useCases = transformedData.useCases;
console.log(`Processing ${useCases.length} use cases for import...`);

async function importAll() {
  const pool = new Pool({ connectionString });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < useCases.length; i++) {
    const useCase = useCases[i];
    console.log(`[${i+1}/${useCases.length}] Importing: ${useCase.title}`);
    
    try {
      // Build insert query with only the fields we want to keep
      const fields = ['id', 'meaningful_id', 'title', 'description'];
      const values = ['$1', '$2', '$3', '$4'];
      const params = [useCase.id, useCase.meaningfulId, useCase.title, useCase.description];
      let paramIndex = 4;
      
      // Add optional fields if they exist
      if (useCase.problemStatement) {
        fields.push('problem_statement');
        values.push(`$${++paramIndex}`);
        params.push(useCase.problemStatement);
      }
      
      if (useCase.useCaseType) {
        fields.push('use_case_type');
        values.push(`$${++paramIndex}`);
        params.push(useCase.useCaseType);
      }
      
      // Array fields
      if (useCase.processes && useCase.processes.length > 0) {
        fields.push('processes');
        values.push(`$${++paramIndex}`);
        params.push(useCase.processes);
      }
      
      if (useCase.activities && useCase.activities.length > 0) {
        fields.push('activities');
        values.push(`$${++paramIndex}`);
        params.push(useCase.activities);
      }
      
      if (useCase.linesOfBusiness && useCase.linesOfBusiness.length > 0) {
        fields.push('lines_of_business');
        values.push(`$${++paramIndex}`);
        params.push(useCase.linesOfBusiness);
      }
      
      if (useCase.businessSegments && useCase.businessSegments.length > 0) {
        fields.push('business_segments');
        values.push(`$${++paramIndex}`);
        params.push(useCase.businessSegments);
      }
      
      if (useCase.geographies && useCase.geographies.length > 0) {
        fields.push('geographies');
        values.push(`$${++paramIndex}`);
        params.push(useCase.geographies);
      }
      
      // Add scoring fields
      fields.push('revenue_impact', 'cost_savings', 'risk_reduction', 'broker_partner_experience', 'strategic_fit');
      fields.push('data_readiness', 'technical_complexity', 'change_impact', 'model_risk', 'adoption_readiness');
      fields.push('impact_score', 'effort_score', 'quadrant');
      fields.push('is_active_for_rsa', 'is_dashboard_visible', 'library_tier', 'library_source');
      
      values.push(`$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`);
      values.push(`$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`);
      values.push(`$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`);
      values.push(`$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`, `$${++paramIndex}`);
      
      params.push(
        useCase.revenueImpact || 3, useCase.costSavings || 3, useCase.riskReduction || 3, 
        useCase.brokerPartnerExperience || 3, useCase.strategicFit || 3,
        useCase.dataReadiness || 3, useCase.technicalComplexity || 3, useCase.changeImpact || 3,
        useCase.modelRisk || 3, useCase.adoptionReadiness || 3,
        useCase.impactScore || 3.0, useCase.effortScore || 3.0, useCase.quadrant || 'Experimental',
        useCase.isActiveForRsa || 'false', useCase.isDashboardVisible || 'false',
        useCase.libraryTier || 'reference', useCase.librarySource || 'rsa_internal'
      );
      
      const query = `INSERT INTO use_cases (${fields.join(', ')}) VALUES (${values.join(', ')})`;
      
      await pool.query(query, params);
      console.log(`✓ Imported: ${useCase.title}`);
      successCount++;
      
    } catch (error) {
      console.log(`✗ Failed: ${useCase.title} - ${error.message}`);
      errorCount++;
    }
  }
  
  await pool.end();
  
  console.log(`\n=== Import Complete ===`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log(`Total: ${useCases.length}`);
}

// Start the import
importAll().catch(console.error);