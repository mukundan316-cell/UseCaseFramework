# Azure PostgreSQL Import Instructions

## Files Provided
1. `use_cases_azure_import.csv` - 138 use case records (properly escaped CSV)
2. This instruction file

## Step 1: Create the Table in Azure

Run this SQL in your Azure PostgreSQL database:

```sql
-- Drop existing table if needed (CAUTION: This deletes existing data)
-- DROP TABLE IF EXISTS use_cases;

CREATE TABLE IF NOT EXISTS use_cases (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    use_case_type TEXT,
    revenue_impact INTEGER NOT NULL DEFAULT 0,
    cost_savings INTEGER NOT NULL DEFAULT 0,
    risk_reduction INTEGER NOT NULL DEFAULT 0,
    strategic_fit INTEGER NOT NULL DEFAULT 0,
    data_readiness INTEGER NOT NULL DEFAULT 0,
    technical_complexity INTEGER NOT NULL DEFAULT 0,
    change_impact INTEGER NOT NULL DEFAULT 0,
    adoption_readiness INTEGER NOT NULL DEFAULT 0,
    impact_score REAL NOT NULL DEFAULT 0,
    effort_score REAL NOT NULL DEFAULT 0,
    quadrant TEXT NOT NULL DEFAULT 'Evaluate',
    created_at TIMESTAMP DEFAULT NOW(),
    broker_partner_experience INTEGER NOT NULL DEFAULT 0,
    model_risk INTEGER NOT NULL DEFAULT 0,
    lines_of_business TEXT[],
    processes TEXT[],
    activities TEXT[],
    business_segments TEXT[],
    geographies TEXT[],
    recommended_by_assessment TEXT,
    is_active_for_rsa TEXT NOT NULL DEFAULT 'false',
    is_dashboard_visible TEXT NOT NULL DEFAULT 'false',
    library_tier TEXT NOT NULL DEFAULT 'reference',
    activation_date TIMESTAMP DEFAULT NOW(),
    deactivation_reason TEXT,
    library_source TEXT NOT NULL DEFAULT 'rsa_internal',
    activation_reason TEXT,
    manual_impact_score REAL,
    manual_effort_score REAL,
    manual_quadrant TEXT,
    override_reason TEXT,
    problem_statement TEXT,
    primary_business_owner TEXT,
    use_case_status TEXT DEFAULT 'Discovery',
    key_dependencies TEXT,
    implementation_timeline TEXT,
    success_metrics TEXT,
    estimated_value TEXT,
    value_measurement_approach TEXT,
    integration_requirements TEXT,
    ai_ml_technologies TEXT[],
    data_sources TEXT[],
    stakeholder_groups TEXT[],
    customer_harm_risk TEXT,
    explainability_bias INTEGER DEFAULT 3,
    regulatory_compliance INTEGER DEFAULT 3,
    ai_or_model TEXT,
    risk_to_customers TEXT,
    risk_to_rsa TEXT,
    data_used TEXT,
    model_owner TEXT,
    rsa_policy_governance TEXT,
    validation_responsibility TEXT,
    informed_by TEXT,
    ai_inventory_status TEXT,
    deployment_status TEXT,
    last_status_update TIMESTAMP,
    business_function TEXT,
    third_party_provided_model TEXT,
    is_active_for_rsa_bool BOOLEAN,
    is_dashboard_visible_bool BOOLEAN,
    explainability_required TEXT,
    data_outside_uk_eu TEXT,
    third_party_model TEXT,
    human_accountability TEXT,
    presentation_url TEXT,
    presentation_pdf_url TEXT,
    presentation_file_name TEXT,
    presentation_uploaded_at TIMESTAMP,
    has_presentation TEXT DEFAULT 'false',
    presentation_file_id VARCHAR(255),
    presentation_pdf_file_id VARCHAR(255),
    meaningful_id VARCHAR(255),
    horizontal_use_case TEXT DEFAULT 'false',
    horizontal_use_case_types TEXT[],
    t_shirt_size TEXT,
    estimated_cost_min INTEGER,
    estimated_cost_max INTEGER,
    estimated_weeks_min INTEGER,
    estimated_weeks_max INTEGER,
    team_size_estimate TEXT,
    tom_phase_override TEXT,
    phase_entered_at TIMESTAMP,
    tom_override_reason TEXT,
    value_realization JSONB,
    capability_transition JSONB,
    tom_phase TEXT,
    duplicate_status TEXT DEFAULT 'unique',
    duplicate_similar_to TEXT[],
    duplicate_similarity_score REAL,
    duplicate_reviewed_at TIMESTAMP,
    duplicate_reviewed_by TEXT,
    governance_status TEXT DEFAULT 'none',
    legacy_activation_flag TEXT DEFAULT 'false',
    governance_pending_reason TEXT,
    operating_model_approval TEXT DEFAULT 'pending',
    operating_model_approved_at TIMESTAMP,
    operating_model_approved_by TEXT,
    operating_model_notes TEXT,
    intake_decision TEXT DEFAULT 'pending',
    intake_decision_at TIMESTAMP,
    intake_decision_by TEXT,
    intake_decision_notes TEXT,
    intake_priority_rank INTEGER,
    rai_assurance TEXT DEFAULT 'pending',
    rai_assurance_at TIMESTAMP,
    rai_assurance_by TEXT,
    rai_assurance_notes TEXT,
    rai_risk_level TEXT,
    governance_completed_at TIMESTAMP,
    governance_completed_by TEXT,
    engagement_id VARCHAR(255),
    last_phase_transition_reason TEXT,
    rai_risk_tier TEXT,
    rai_assessment_required TEXT DEFAULT 'false',
    delivery_owner TEXT,
    value_validator TEXT,
    value_governance_model TEXT
);
```

## Step 2: Import CSV Data

### Option A: Using psql COPY command (Recommended)
```bash
# From command line with psql
psql "your_azure_connection_string" -c "\COPY use_cases FROM 'use_cases_azure_import.csv' WITH (FORMAT CSV, HEADER, ENCODING 'UTF8')"
```

### Option B: Using Azure Data Studio or pgAdmin
1. Right-click on the `use_cases` table
2. Select "Import Data" or "Import/Export"
3. Choose the CSV file
4. Ensure "Header row" is checked
5. Map columns (they should auto-match)
6. Execute import

### Option C: Using Azure Portal
1. Go to Azure Database for PostgreSQL
2. Use Query Editor or Cloud Shell
3. Upload the CSV file
4. Run the COPY command

## Step 3: Verify Import
```sql
-- Verify count
SELECT COUNT(*) FROM use_cases;
-- Should return: 138

-- Verify sample data
SELECT meaningful_id, title, use_case_status 
FROM use_cases 
ORDER BY meaningful_id 
LIMIT 10;
```

## Troubleshooting

### If you get encoding errors:
```bash
# Convert file to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 use_cases_azure_import.csv > use_cases_utf8.csv
```

### If COPY fails, try INSERT statements:
A separate `use_cases_inserts.sql` file can be generated on request.

## Record Count Summary
- Total records: 138
- AI Tools (HEX_AITOOL): 46
- Industry (HEX_IND): 28  
- Integration (HEX_INT): 51
- MKL Use Cases: 12
- Other: 1
