-- ============================================================
-- HEXAWARE AI USE CASE VALUE FRAMEWORK
-- Complete Azure PostgreSQL Migration Script
-- Generated: 2026-02-04
-- Records: 138 use cases + supporting data
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Run this entire script in Azure Query Editor
-- 2. It will DROP and recreate all tables
-- 3. All data will be inserted with correct relationships
-- 4. No manual fixes needed after execution
--
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- STEP 1: DROP EXISTING TABLES (in correct order for FK)
-- ============================================================
DROP TABLE IF EXISTS use_case_change_log CASCADE;
DROP TABLE IF EXISTS governance_audit_log CASCADE;
DROP TABLE IF EXISTS file_attachments CASCADE;
DROP TABLE IF EXISTS use_cases CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS metadata_config CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- ============================================================
-- STEP 2: CREATE TABLES (matching exact Drizzle column order)
-- ============================================================

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Clients table
CREATE TABLE clients (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    contact_name TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    currency TEXT DEFAULT 'GBP'
);

-- Engagements table
CREATE TABLE engagements (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id VARCHAR(255) REFERENCES clients(id),
    name TEXT NOT NULL,
    description TEXT,
    tom_preset_id TEXT DEFAULT 'hybrid',
    tom_preset_locked BOOLEAN DEFAULT false,
    tom_phases_json JSONB,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status TEXT DEFAULT 'active',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    governance_config JSONB,
    value_config JSONB,
    capability_config JSONB
);

-- Use Cases table (EXACT Drizzle column order from shared/schema.ts)
CREATE TABLE use_cases (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    meaningful_id VARCHAR(255) UNIQUE,
    engagement_id VARCHAR(255) REFERENCES engagements(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT,
    use_case_type TEXT,
    processes TEXT[],
    activities TEXT[],
    lines_of_business TEXT[],
    business_segments TEXT[],
    geographies TEXT[],
    revenue_impact INTEGER NOT NULL DEFAULT 0,
    cost_savings INTEGER NOT NULL DEFAULT 0,
    risk_reduction INTEGER NOT NULL DEFAULT 0,
    broker_partner_experience INTEGER NOT NULL DEFAULT 0,
    strategic_fit INTEGER NOT NULL DEFAULT 0,
    data_readiness INTEGER NOT NULL DEFAULT 0,
    technical_complexity INTEGER NOT NULL DEFAULT 0,
    change_impact INTEGER NOT NULL DEFAULT 0,
    model_risk INTEGER NOT NULL DEFAULT 0,
    adoption_readiness INTEGER NOT NULL DEFAULT 0,
    explainability_required TEXT DEFAULT 'false',
    customer_harm_risk TEXT,
    data_outside_uk_eu TEXT DEFAULT 'false',
    third_party_model TEXT DEFAULT 'false',
    human_accountability TEXT DEFAULT 'false',
    regulatory_compliance INTEGER,
    ai_or_model TEXT,
    risk_to_customers TEXT,
    risk_to_rsa TEXT,
    data_used TEXT,
    model_owner TEXT,
    rsa_policy_governance TEXT,
    validation_responsibility TEXT,
    informed_by TEXT,
    business_function TEXT,
    third_party_provided_model TEXT,
    impact_score REAL NOT NULL DEFAULT 0,
    effort_score REAL NOT NULL DEFAULT 0,
    quadrant TEXT NOT NULL DEFAULT 'Evaluate',
    recommended_by_assessment TEXT,
    manual_impact_score REAL,
    manual_effort_score REAL,
    manual_quadrant TEXT,
    override_reason TEXT,
    is_active_for_rsa TEXT NOT NULL DEFAULT 'false',
    is_dashboard_visible TEXT NOT NULL DEFAULT 'false',
    library_tier TEXT NOT NULL DEFAULT 'reference',
    activation_date TIMESTAMP DEFAULT NOW(),
    activation_reason TEXT,
    deactivation_reason TEXT,
    library_source TEXT NOT NULL DEFAULT 'internal',
    ai_inventory_status TEXT,
    deployment_status TEXT,
    last_status_update TIMESTAMP,
    primary_business_owner TEXT,
    delivery_owner TEXT,
    value_validator TEXT,
    value_governance_model TEXT,
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
    horizontal_use_case TEXT DEFAULT 'false',
    horizontal_use_case_types TEXT[],
    presentation_file_id VARCHAR(255),
    presentation_pdf_file_id VARCHAR(255),
    presentation_file_name TEXT,
    presentation_uploaded_at TIMESTAMP,
    has_presentation TEXT DEFAULT 'false',
    t_shirt_size TEXT,
    estimated_cost_min INTEGER,
    estimated_cost_max INTEGER,
    estimated_weeks_min INTEGER,
    estimated_weeks_max INTEGER,
    team_size_estimate TEXT,
    tom_phase TEXT,
    tom_phase_override TEXT,
    phase_entered_at TIMESTAMP,
    last_phase_transition_reason TEXT,
    tom_override_reason TEXT,
    rai_risk_tier TEXT,
    rai_assessment_required TEXT DEFAULT 'false',
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
    value_realization JSONB,
    capability_transition JSONB,
    duplicate_status TEXT DEFAULT 'unique',
    duplicate_similar_to TEXT[],
    duplicate_similarity_score REAL,
    duplicate_reviewed_at TIMESTAMP,
    duplicate_reviewed_by TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- File Attachments table
CREATE TABLE file_attachments (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    use_case_id VARCHAR(255) REFERENCES use_cases(id),
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    local_path TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'presentation',
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Use Case Change Log table
CREATE TABLE use_case_change_log (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    use_case_id VARCHAR(255) NOT NULL,
    use_case_meaningful_id TEXT,
    change_type TEXT NOT NULL,
    actor TEXT DEFAULT 'system',
    before_state JSONB,
    after_state JSONB,
    changed_fields TEXT[],
    change_reason TEXT,
    source TEXT DEFAULT 'api',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Governance Audit Log table
CREATE TABLE governance_audit_log (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    use_case_id VARCHAR(255) NOT NULL,
    use_case_meaningful_id TEXT,
    gate_type TEXT NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    actor_role TEXT,
    previous_status TEXT,
    new_status TEXT,
    notes TEXT,
    evidence JSONB,
    tom_phase_at_decision TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metadata Config table
CREATE TABLE metadata_config (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'default',
    value_chain_components JSONB,
    use_case_types JSONB,
    business_segments JSONB,
    lines_of_business JSONB,
    geographies JSONB,
    ai_ml_technologies JSONB,
    stakeholder_groups JSONB,
    data_sources JSONB,
    risk_levels JSONB,
    compliance_standards JSONB,
    scoring_weights JSONB,
    quadrant_thresholds JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    process_activity_mapping JSONB,
    use_case_statuses JSONB,
    horizontal_use_case_types JSONB,
    t_shirt_benchmarks JSONB,
    governance_gates_config JSONB,
    phase_transitions_config JSONB,
    kpi_library JSONB,
    kt_milestones_config JSONB,
    certification_paths_config JSONB,
    roles_config JSONB,
    capability_benchmarks JSONB
);

-- Session table for express-session
CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- ============================================================
-- STEP 3: INSERT SUPPORTING DATA
-- ============================================================

-- Insert Client (use same ID that will be referenced)
INSERT INTO clients (id, name, description, industry, is_active, currency)
VALUES ('93dbeac0-58c3-41a0-9d6b-affbfe0be923', 'Hexaware', 'Default Hexaware organization', 'Technology Consulting', true, 'USD');

-- Insert Engagement (use same ID that will be referenced by use cases)
INSERT INTO engagements (id, client_id, name, description, tom_preset_id, tom_preset_locked, status, is_default)
VALUES ('93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', '93dbeac0-58c3-41a0-9d6b-affbfe0be923', 'AI Strategy Initiative', 'Default AI use case portfolio', 'hybrid', true, 'active', true);


-- ============================================================
-- STEP 4: INSERT USE CASES (138 records)
-- ============================================================

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '10cbecf8-1eba-4a60-9c20-b72228e914a0', 'HEX_AITOOL_001', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Vehicle Identification', 'Uses computer vision to assist with vehicle identification from photos', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.574000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.884Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.884Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.815Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.632545'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '21cca0a0-e21c-442e-a96d-67b616b418f4', 'HEX_AITOOL_002', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Net Reveal', 'Strategic fraud tool used by CFU across all business lines in UW & Claims.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'This capability helps to identify suspected policy and claims fraud in order to protect our honest customers.', 'Rules in system (ML) not correct meaning that a significant number of false positives created meaning innocent customers going through a fraud process. This is mitigated by all tuning been run through test system', 'Policy Systems, Claims Systems, Intelligence platform and TP data sources such as CRIF and IFR.', NULL, NULL, NULL, NULL, 'CFU', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.624000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.966Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.966Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.886Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.061442'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'e8dc5d7f-9b5a-47d9-8eab-7b85e6bb3731', 'HEX_AITOOL_003', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Injury Estimate', 'Estimate the damages that may arise from a motor claim involving injury', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.609000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.948Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.948Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.867Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.062689'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '79a6dd3a-1fc0-4077-b3aa-b3a08847cc0e', 'HEX_AITOOL_004', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Large Loss Allocation', 'Identify claims that should be allocated to the large loss team', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.650000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.997Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.997Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.920Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.037671'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '710c0189-dc47-4699-8f18-c23012cf53e1', 'HEX_AITOOL_005', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Triaging Delays', 'Predicts claims that are likely to be delayed to enable proactive management', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.636000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.982Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.982Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.903Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.057851'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '60e523c7-85c9-4a73-8e55-bfbc3d89a87d', 'HEX_AITOOL_006', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Credit Repair', 'CURRENTLY INACTIVE POST PL MOTOR EXIT Predict the likelihood that a claim will be subject to credit repair, to enable claim handlers to intervene proactively', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.663000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.018Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.018Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.935Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.025341'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd7bbe570-0b15-497b-a50a-cedfda03e61b', 'HEX_AITOOL_007', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Havas – Display DSPs (Digital Media – targeting)', 'Obsolete from April 24 and can be deleted', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - AI is used by the different providers to ensure our ads are being seen by the most relevant people.', 'No risk to RSA and AI is used to make our targeting more efficient.', NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.689000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.050Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.050Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.959Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:27.466127'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b0033e17-ab7c-40ab-b23d-27c9a098ce60', 'HEX_AITOOL_008', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'ScanmarQED (Econometric Analysis)', 'Obsolete end March 2024', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - AI was used to model performance of our marketing campaigns.', 'This would make it more difficult to measure performance of or marketing activity.', NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.676000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.034Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.034Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.948Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:27.467858'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'fb6b6b22-550a-428d-82cf-4d1be164980a', 'HEX_AITOOL_009', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Instabase (pilot phase)', 'Recently signed a 3-year deal to license AI tooling from Instabase Uses generative AI to extract rating information from broker submissions.', NULL, NULL, ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Commercial', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Proof_of_Concept', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.729000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.097Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.097Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.997Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:27.453099'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '68652d8d-2383-44aa-9554-01d6be297e3f', 'HEX_AITOOL_010', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Carpe Data (PoC)', 'Automated open source searching software deployed currently as part of a PoC in Commercial Claims.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None as this is part of a PoC on historic data', 'None as this is part of a PoC on historic data', 'Used Commercial EL & PL data obtained by Claims Analytics. This has been shared via RSA SFTP and signed off by InfoSec as part of TPM process.', NULL, NULL, NULL, NULL, 'CFU', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Inactive', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.716000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.082Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.082Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.984Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:27.454288'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '1f67fe0c-34e3-4217-9c8a-5ea39479163c', 'HEX_AITOOL_011', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Vehicle Damage Estimate', 'Estimate the damage to a vehicle in a motor claim', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.702000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.065Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.065Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.971Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:27.454914'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '03399271-4b5e-4409-a6d0-0a0009128e86', 'HEX_AITOOL_012', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'ENI IVI Total Loss', '19/06/24 - Tool is no longer used so updated status AI assessment of vehicle damage photos to assess whether the vehicle can be repaired or will be a total loss', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'The tool works to speed up the vehicle damage assessment process. Risk to customers is minimal as if a total loss was predicted the customer would then be consulted as part of this process to agree any settlement amount', 'If the calculation was incorrect then there could be a risk of increased indemnity cost associated with the process', 'Customer submitted vehicle damage photos', NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.782000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.158Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.158Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.139Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.888390'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '8926d885-3583-48c5-96af-91a81060304e', 'HEX_AITOOL_013', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Google Analytics (media attribution within the tool)', 'Enables understanding of origin of our website traffic. Supports our marketing approach', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CIO | Digital Analytics', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.767000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.144Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.144Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.035Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.888841'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9728c0e7-c990-4c80-9c88-f6545bd350e3', 'HEX_AITOOL_014', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Google Performance Max (Digital Media – targeting)', 'Obsolete at end March 2024', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - AI is used by Performance Max to ensure our ads are being seen by the most relevant people.', 'No risk to RSA and Google use AI for Performance Max when deciding which ads to show and when.', NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.755000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.130Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.130Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.024Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.891254'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd40dd931-c4a9-4e73-8684-d5701e894325', 'HEX_AITOOL_015', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Meta (Digital Media – targeting)', 'Obsolete by end of June 2024', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.799000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.171Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.171Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.153Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.887769'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '938ab186-ec2b-4b3f-9819-a8103d34a559', 'HEX_AITOOL_016', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Courtesy Car Eligibility', 'Determine whether the customer is entitled to a courtesy car for their claim', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.741000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.113Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.113Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.011Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.891298'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9aaa0a5d-fc18-4670-80f1-2434dca1fa29', 'HEX_AITOOL_017', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Fast Track', 'Identify motor claims that can be allocated to fast track processing', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.907000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.224Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.224Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.204Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.309565'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '1a0f8789-e38c-4fb5-9c3e-1c961e6c55f9', 'HEX_AITOOL_018', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Visual Studio IDE', 'Developers and testers scripting code using integrated dev environments like Visual Studio which provides help with assisted coding in terms of prompts. No transfer of data that is involved.', NULL, NULL, ARRAY['General']::text[], ARRAY['Issue Resolution']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'No risk to customers as this tool is used during software development and testing processes. They are not used in live environments.', 'No risk to RSA. This tool does not impact applications running in live or production environments. No live/customer data is used.', 'The tool works in context of the code being developed so the code, which is being developed and ultimately stored in code version management tools like Azure DevOps Repo can be considered as the data source.', NULL, NULL, NULL, NULL, 'CIO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.872000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.197Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.197Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.179Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.326234'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '67cee301-8e03-40af-b82a-f668ffd44c0e', 'HEX_AITOOL_019', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Recoveries', 'Identifies potential recovery opportunities for investigation. Significant update implemented in ClaimCenter BAU2 release on September 2024.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.923000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.238Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.238Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.215Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.306375'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '2cf98998-de61-46d8-b59f-d5393a8d3266', 'HEX_AITOOL_020', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Havas - DAX', 'Obsolete from April 24 and can be deleted', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - AI is used the DAX to ensure our ads are being seen by the most relevant people.', 'No risk to RSA and AI is used to make our targeting more efficient.', NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.890000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.211Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.211Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.190Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.310529'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9479e4cd-f564-41b2-bfaf-e0dea93c33fc', 'HEX_AITOOL_021', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Earnix Optimisation - Home Market price model', 'No Description', NULL, NULL, ARRAY['Financial Management']::text[], ARRAY['Accounting','Financial Reporting','Payment Processing']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, 'Money Supermarket licensed data feed', NULL, NULL, NULL, NULL, 'CUO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.817000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.184Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.184Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.166Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:26.328493'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b214b057-88e9-4558-aee9-8446f8c778c8', 'HEX_AITOOL_022', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'HR - Horizon Machine Learning', 'Makes recommendations for learning based on previous training completed, or skill gaps identified in an assessment, or a user''s interests/topics. New Generative AI tool for learning content curation - this allows you to input a topic/subject and it will generate a description and curate learning from the catalogue.', NULL, NULL, ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - Internal employee training data only held on this system', 'None - Internal training data and training recommendations only.', 'Cornerstone', NULL, NULL, NULL, NULL, 'HR L & D', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.970000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.279Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.279Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.254Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.747516'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '30b14d3e-e8db-469f-96ba-569097e29f7f', 'HEX_AITOOL_023', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Scoring Engine', 'Audatex rules engine linked to digital FNOL front end to assess claim submission details and allow for straight through processing where acceptable to do so', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'No risks for customers. This capability helps to negate back office processes to improve claim settlements time frames', 'Risk would be if rules engine rule allowed incorrect claims to be STP''d. This would impact indemnity. Testing and controls are in place to tightly monitor performance', 'Customer FNOL claim submission data', NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.981000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.294Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.294Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.265Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.745584'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '89414552-109f-498f-9ddb-32904c2aa5c9', 'HEX_AITOOL_024', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Predictive Total Loss', 'Predicts based on loss characteristics whether vehicle (both first party and third party) should be repaired or written off, makes recommendation with explainers to Claims Handler', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter, ABI', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.956000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.265Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.265Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.241Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.748515'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '8afc1422-ec1c-4989-8669-4513c2da1f8e', 'HEX_AITOOL_025', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Allocation of Liability', 'Predicts the probability of fault/non fault to enable rapid claim routing. Significant update implemented in ClaimCenter BAU2 release on September 2024.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.993000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.313Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.313Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.278Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.745000'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '50ebedec-ea07-4307-b2b9-298d2d58c622', 'HEX_AITOOL_026', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Qubit (Digital Media – targeting)', 'No Description', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CIO | Digital Analytics', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Obsolete', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.942000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.252Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.252Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.228Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.749005'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '653252d6-5f2d-4a88-bf40-a527d1aa8aa8', 'HEX_AITOOL_027', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Credit Hire Reduction', 'CURRENTLY INACTIVE POST PL MOTOR EXIT Predicts the probably length and cost of hire, and flags higher risk cases to Claims Handler for proactive management', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.059000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.400Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.400Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.377Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.170757'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '79d877e2-59e5-4fc6-a3a7-ec1245a704bf', 'HEX_AITOOL_028', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Clear Speed', 'Voice sentiment analysis technology used as part of a current PoC in both PL & CL claims.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'If not deployed in correct area with right question set could cause complaints. Mitigated by sign off process.', 'None', 'CCS/Guidewire', NULL, NULL, NULL, NULL, 'CFU', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.006000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.334Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.334Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.291Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.188217'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'c1886c56-6d36-4091-a391-913b29f593b0', 'HEX_AITOOL_029', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Allocation', 'Allocate claims to the most appropriate team', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.018000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.358Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.358Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.306Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.185926'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '93d66e9e-76a3-4295-963a-b313494c9d98', 'HEX_AITOOL_030', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Litigation Prop', 'CURRENTLY INACTIVE POST PL MOTOR EXIT Predict the likelihood of a claim litigating, to enable claim handlers to intervene proactively', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.032000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.375Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.375Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.324Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.171933'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3ddb2b00-da4f-4e1c-b802-9ecadadd9b0c', 'HEX_AITOOL_031', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Commercial Motor Triage', 'Triages commercial motor claims to identify those that can be straight through processed and those that require more complex handling', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.046000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.388Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.388Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.343Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:25.171393'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '7d4d71bc-4d50-4f7d-9705-515fb4d8aaee', 'HEX_AITOOL_032', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Property Damage Estimate', 'Estimate the damage to property in a motor claim', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.095000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.444Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.444Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.443Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.604349'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '1e32bdd5-09e7-445d-8483-a8d1dbe833c6', 'HEX_AITOOL_033', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - TP Liability Assessment', 'Assess third party liability in a motor claim', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.108000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.458Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.458Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.456Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.602905'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b747065a-dd30-48c2-8dcf-1821a8a6d17d', 'HEX_AITOOL_034', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Total Loss Early Identification', 'Predict when claims should be routed for total loss early identification and management', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.120000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.472Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.472Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.469Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.596843'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '7922144e-4f9c-42eb-ace4-d5a9827eeb3c', 'HEX_AITOOL_035', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Virtual Settlement', 'Predict which claims may be suitable for digital settlement and customer contact management', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.072000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.415Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.415Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.417Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.609657'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '2ab6cce8-f9dc-48b9-91d8-09cc53f9ea2c', 'HEX_AITOOL_036', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Self Serve Customer Experience', 'Predict which claims may be suitable for self service customer experience', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.082000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.430Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.430Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.430Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.605755'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3d77aad0-3ae3-4d18-a34e-2e033938ce29', 'HEX_AITOOL_037', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Dual Control Estimate', 'Predict which claims may require dual control estimate', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.156000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.513Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.513Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.504Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.037581'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'cd430ca6-78f4-4c01-b21d-bb1f39824be3', 'HEX_AITOOL_038', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Fraud Classification', 'Predicts various fraud related propensities within motor claims', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.145000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.499Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.499Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.492Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.038307'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'a326285e-2b2b-4dd7-8ae5-8f3430a7de71', 'HEX_AITOOL_039', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Cogito', 'Use of AI, NLP & OCR capabilities to mimic the handler / vet assessment processes of claim evaluations i.e., reading the claim history and invoice to assess claim validity and identify invoice deductibles', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'This capability helps mitigate the risk of manual handler error when assessing complex medical history''s and invoices', 'The tool is used as a guide to handlers, whom would still perform a sense check assessment on the summary findings. No risk to RSA', 'Customer pet medical history and claim invoice data', NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.183000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.550Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.550Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.529Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.020127'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'ccc20c85-1219-4156-af59-8f28518de419', 'HEX_AITOOL_040', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'PCW Market Price Modelling and Marketing Targeting using Datarobot', 'Monitors market rate for Home and Pet (More Than and Partnerships). Takes data from aggregators and produces a benchmarking report with no customer information. External service provision to cease from 31st December 2024.', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - an illustrative basket of risks that provides representative market information that help informs our insight and knowledge of market / competitor changes.', 'Supplier based relationship that''s widely accessed and utilised in the market. Results are aggregated and contain no specific customer data - restricted to technical information based on characteristics of Home or Pet Insurance. No exposure to RSA.', '3rd Party', NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.132000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.486Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.486Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.480Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.040995'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9e74894e-6d29-4f37-b080-d3cf3475b6d6', 'HEX_AITOOL_041', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Indemnity Estimate', 'Estimate total cost of a motor claim', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.170000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.531Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.531Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.517Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:24.022158'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '6b5a73dc-17ee-4684-a6f9-ff7f743f6753', 'HEX_AITOOL_042', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Settled Direct', 'CURRENTLY INACTIVE POST PL MOTOR EXIT Predicts based on loss characteristics whether a third party claim represents an opportunity to cash settle directly and makes recommendation to the Claims Handler', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Pending_Closure', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.220000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.596Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.596Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.567Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:23.450468'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '4e373740-ff1b-4896-ae78-348991a5035c', 'HEX_AITOOL_043', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Call Miner', 'Transcription Engine, Entity Redaction, Semantic Search, Sentiment Classification', NULL, NULL, ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Account Management','Service Delivery']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sale | Service | Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', 'Production', NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.195000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.568Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.568Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.543Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002", "kt_003", "kt_004"], "inProgressMilestones": ["kt_005"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:23.453470'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd5f33104-c99a-47e6-bf34-eadfaa5528f7', 'HEX_AITOOL_044', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Google PPC (Digital Media – targeting)', 'Check with Gareth Hawkes as to whether needed for Commercial after MT closes.', NULL, NULL, ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'None - AI is used by the different providers to ensure our ads are being seen by the most relevant people.', 'No risk to RSA and Google / Microsoft use AI in their targeting.', NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.244000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.624Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.624Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.593Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:23.449144'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b083de05-2483-40df-a86b-ce7ae6222fb9', 'HEX_AITOOL_045', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Motor - Interventions - Fraud Validation', 'Uses clustering algorithms to identify unusual trends in claims data that may be indicative of fraud', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'Risk that the model makes an incorrect recommendation that a handler then follows, resulting in worse outcomes for the customer and RSA', 'ClaimCenter', NULL, NULL, NULL, NULL, 'COO', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.208000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.581Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.581Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.555Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:23.452637'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'dfb99ed5-aad3-4020-b733-ac153b27d457', 'HEX_AITOOL_046', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'InsurSight AI tool - InsurSight Insight - InsurSight Predict (test and development stage – roll out in 2024)', 'InsurSight Insight - Reserving diagnostics using AI to identify trends/ outliers (and actual : expected) across 000''s of datasets. - Identifies where further investigation may be required, usually by Claims. InsurSight Predict - Provides first cut reserve estimate based upon data and AI reserve models. - May identify where a deep dive reserve analysis is required. AI in reserving has been presented to the Audit Committee, Board and Exec.', NULL, NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, 'InsurSight Insight No direct customer impact as used for diagnostics only and where Reserving, Claims and U&P should investigate. InsurSight Predict If goes live then could impact financial results and balance sheet if we use the output for reserve and results booking.', 'InsurSight Insight If the diagnostics miss a trend which should have been spotted earlier so we don''t reflect in reserve estimates or U&P don''t react to in terms of UW and Pricing. InsurSight Predict If inappropriate reserve estimates aren''t spotted and booked to financial result.', 'Corporate Actuarial reserving data: Claims from the various claims systems via FDS; Premiums from Finance via FDS; and Exposures from U&P.', NULL, NULL, NULL, NULL, 'Corporate Actuarial (used by Reserving, with results shared with Claims, and Underwriting and Pricin', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'ai_inventory', 'Active', NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:33.232000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.609Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.609Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.579Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:23.449849'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd38fd2aa-6b25-447d-81be-1748a0681244', 'HEX_IND_001', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Broker Portal Intelligence', 'AI-powered broker portal that provides personalized dashboards, automated reporting, and intelligent recommendations for portfolio optimization.', NULL, 'GenAI', ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:31.935000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.161Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.161Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.193Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:34.406823'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'de9c4f58-1d85-489d-819e-8ee6a3840193', 'HEX_IND_002', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Predictive Risk Scoring Engine', 'A machine learning model that analyzes historical and real-time data to predict policy risk levels, improving pricing accuracy and loss ratios.', NULL, 'Predictive ML', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:31.923000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.147Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.147Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.182Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:34.409546'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '62e0e19c-02b4-4e1d-8aa9-b39243169d56', 'HEX_IND_003', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'ESG Impact Scoring', 'AI system to evaluate Environmental, Social, and Governance factors in underwriting decisions and portfolio management.', NULL, 'Predictive ML', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], ARRAY['All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['United States']::text[], 2, 2, 3, 3, 4, 1, 4, 4, 4, 3, 'true', 'high', 'false', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 2.8, 3.2, 'Watchlist', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'ABC', 'ABC', NULL, 'joint', 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 17:36:01.487000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.133Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "lastUpdated": "2026-02-03T14:22:50.133Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.1, "vendor": 2.9}, "month12": {"client": 2.9, "vendor": 2.1}, "month18": {"client": 3.5, "vendor": 1.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T17:36:01.542Z", "derivedFrom": {"quadrant": "Watchlist", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-12-25", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:34.410644'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '4096050f-2dda-4d64-8c0b-da583017256f', 'HEX_IND_004', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Underwriting Digital Assistant', 'Provides underwriters with a summarized view of submission data, highlighting information outside of guidelines, assessing appetite capacity, and suggesting next best actions.', NULL, 'GenAI', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:31.958000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.189Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.189Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.216Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.855074'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3c2acd81-6293-4126-b26b-874c60f9124b', 'HEX_IND_005', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Customer Journey Optimization', 'AI-driven analysis of customer touchpoints to optimize experience and reduce abandonment rates in the sales funnel.', NULL, 'Predictive ML', ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Account Management','Service Delivery']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:31.969000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.204Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.204Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.227Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.842505'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'a4541de6-a718-49d4-ae30-345f828aa8ea', 'HEX_IND_006', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Catastrophe Modeling Enhancement', 'AI-enhanced catastrophe models using satellite imagery and IoT data for more accurate risk assessment and exposure management.', NULL, 'Predictive ML', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:31.993000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.252Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.252Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.282Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.839043'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'bf491e7d-b3fb-4529-b45e-69157f81f4fd', 'HEX_IND_007', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Automated Claims Triage', 'AI-powered system to automatically classify and prioritize incoming claims based on complexity, urgency, and potential fraud indicators.', NULL, 'GenAI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.005000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.273Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.273Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.304Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.270534'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '63f704ef-b983-4ede-8359-88310bc6f459', 'HEX_IND_008', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Automated Prefilled Forms', 'An AI system that pre-populates application forms by extracting information from historical client data, public records, and previous submissions to speed up the process.', NULL, 'Process Automation', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.067000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.355Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.355Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.362Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.689916'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '31f894f7-cd0e-4abd-957b-7fcbecf25cdf', 'HEX_IND_009', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Portfolio Risk Optimization', 'AI-driven portfolio analysis to optimize risk distribution, identify concentration risks, and suggest rebalancing strategies.', NULL, 'Predictive ML', ARRAY['Financial Management']::text[], ARRAY['Accounting','Financial Reporting','Payment Processing']::text[], ARRAY['Property Owners','Workers Compensation']::text[], ARRAY['All Segments']::text[], ARRAY['United States']::text[], 5, 3, 4, 4, 5, 2, 4, 3, 4, 4, 'true', 'high', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 4.2, 3.4, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'ABC', 'ABC', NULL, 'business_led', 'In-flight', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 18:25:19.004000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.369Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "lastUpdated": "2026-02-03T14:22:50.369Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null, "phaseDefaultsApplied": "foundation", "expectedValueRangeMax": 100000, "expectedValueRangeMin": 25000, "phaseDefaultsAppliedAt": "2026-02-03T18:25:19.004Z"}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T18:25:19.046Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-29", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.663596'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'acac8e25-8c56-479d-a073-3abd76647a31', 'HEX_IND_010', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'AI-led Policy Comparison', 'An AI system to compare complex commercial insurance policies (including competitor products), highlighting key differences in coverage, exclusions, and wording.', NULL, 'GenAI', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], ARRAY['Commercial Property','Motor']::text[], ARRAY['All Segments']::text[], ARRAY[]::text[], 3, 3, 4, 3, 4, 2, 2, 3, 2, 3, 'true', 'high', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 3.4, 2.4, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'ABC', 'ABC', NULL, 'business_led', 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'true', ARRAY['Content Management -Categorization, tagging, curation','Data Analysis - Augmentation, visualization']::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-02-03 18:35:20.994000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.381Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "lastUpdated": "2026-02-03T14:22:50.381Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.9, "byRole": {}}, "vendor": {"total": 2.1, "byRole": {}}}, "planned": {"month6": {"client": 1.7, "vendor": 1.3}, "month12": {"client": 2.7, "vendor": 0.3}, "month18": {"client": 3.4, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 60, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T18:35:21.026Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "S", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.658744'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'a042dfaf-2ea2-46c9-bbdb-e5aa41eb5741', 'HEX_IND_011', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Agentic AI for Underwriting', 'A multi-agent system to automate the entire underwriting workflow, from data intake and risk profiling to pricing, compliance checks, and decision orchestration.', NULL, 'Agentic AI', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment']::text[], ARRAY['Commercial Combined']::text[], ARRAY['UK Commercial Lines (Traded SME Channel)','UK Commercial Lines (Regional Channel)']::text[], ARRAY['UK','United States']::text[], 4, 4, 4, 4, 5, 4, 4, 5, 4, 3, 'true', 'high', 'false', 'true', 'true', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 4.2, 3.6, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, 'Moved to library', 'industry_standard', NULL, 'PoC', NULL, 'CUO', 'Sarah Mitchell', 'David Chen', 'AI Steering Committee', 'In-flight', 'All Underwriting systems with upsteam and downstream systems', 'Q2 2026', NULL, NULL, NULL, 'All upstream and downstream applications to DXC PAS, Instabse and Power UP Underwriting workbench', ARRAY['Large Language Models','Natural Language Processing','Predictive Analytics','Rule-based Systems','Reinforcement Learning']::text[], ARRAY['Broker Data & Feeds','Claims Database','Policy Database','Customer Database']::text[], ARRAY['Distrbution (Broker) Teams','Underwriting Teams','Claims Teams','Customer Service']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'L', 371250, 603281, 16, 26, '5-10', 'foundation', NULL, '2025-09-03 17:12:32.658289', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.394Z", "kpiValues": {}, "investment": {"initialInvestment": 350000, "ongoingMonthlyCost": 25000}, "lastUpdated": "2026-02-03T14:22:50.394Z", "kpiEstimates": [{"kpiId": "uw_004", "kpiName": "Risk Assessment Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_001", "kpiName": "Submission Processing Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_005", "kpiName": "Risk Score Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_002", "kpiName": "Auto-Classification Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_003", "kpiName": "Submission Leakage Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_006", "kpiName": "Adverse Selection Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_007", "kpiName": "Quote Generation Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_008", "kpiName": "Rate Adequacy Index", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_009", "kpiName": "Premium Leakage", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_010", "kpiName": "Referral Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_011", "kpiName": "Referral Resolution Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_012", "kpiName": "False Positive Referral Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_013", "kpiName": "Quote-to-Bind Ratio", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_014", "kpiName": "Policy Issuance Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_015", "kpiName": "Document Accuracy Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_001", "kpiName": "Model Accuracy Degradation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_002", "kpiName": "Prediction Confidence Distribution", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_003", "kpiName": "Inference Latency (p95)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_004", "kpiName": "Model Drift Detection Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_005", "kpiName": "Feature Importance Stability", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_006", "kpiName": "A/B Test Statistical Power", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_001", "kpiName": "Data Freshness Score", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_002", "kpiName": "Feature Store Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_003", "kpiName": "Feature Reuse Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_004", "kpiName": "Data Quality Score (DQS)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_005", "kpiName": "Data Pipeline SLA Adherence", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_006", "kpiName": "Schema Drift Incidents", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_001", "kpiName": "Technical Debt Ratio", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_002", "kpiName": "API Error Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_003", "kpiName": "Security Vulnerability Remediation Time", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_004", "kpiName": "Platform Currency Score", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_005", "kpiName": "Infrastructure Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_006", "kpiName": "Environment Parity", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_001", "kpiName": "AI Talent Retention Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_002", "kpiName": "Skill Gap Closure Velocity", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_003", "kpiName": "Knowledge Documentation Coverage", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_004", "kpiName": "Bus Factor Risk", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_005", "kpiName": "Team Utilization Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_006", "kpiName": "Internal Mobility/Growth", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_001", "kpiName": "Idea-to-PoC Conversion Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_002", "kpiName": "PoC Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_003", "kpiName": "Experimentation Velocity", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_004", "kpiName": "Failed Experiment Learning Capture", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_005", "kpiName": "Innovation Funnel Health", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_006", "kpiName": "External Partnership Value", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_001", "kpiName": "Business Sponsor Satisfaction", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_002", "kpiName": "Strategic Priority Alignment", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_003", "kpiName": "Demand Backlog Age", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_004", "kpiName": "Stakeholder Engagement Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_005", "kpiName": "Value Realization Communication", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_006", "kpiName": "Executive Dashboard Access", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_001", "kpiName": "Hallucination Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_002", "kpiName": "Human Override Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_003", "kpiName": "Prompt Effectiveness Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_004", "kpiName": "Token Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_005", "kpiName": "Guardrail Trigger Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_006", "kpiName": "Context Window Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_007", "kpiName": "RAG Retrieval Precision", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_008", "kpiName": "Response Time SLA Compliance", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_001", "kpiName": "Cloud Cost Optimization", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_002", "kpiName": "Infrastructure Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_003", "kpiName": "Deployment Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_004", "kpiName": "Mean Time to Recovery (MTTR)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_005", "kpiName": "Change Failure Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_006", "kpiName": "Lead Time for Changes", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_001", "kpiName": "AI Security Incidents", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_002", "kpiName": "Privacy Compliance Rate", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_003", "kpiName": "Access Control Adherence", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_004", "kpiName": "Data Encryption Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_005", "kpiName": "Model Adversarial Testing", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_006", "kpiName": "PII Detection Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_001", "kpiName": "AI-Assisted Resolution Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_002", "kpiName": "Self-Service Adoption Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_003", "kpiName": "Response Time Improvement", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_004", "kpiName": "Customer Effort Score (AI)", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_005", "kpiName": "First Contact Resolution (AI)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_006", "kpiName": "AI NPS Impact", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_001", "kpiName": "Process Automation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_002", "kpiName": "Straight-Through Processing Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_003", "kpiName": "Manual Intervention Reduction", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_004", "kpiName": "Exception Handling Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_005", "kpiName": "Predictive Accuracy (Operations)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_006", "kpiName": "Resource Optimization Savings", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}], "selectedKpis": ["uw_004", "uw_006", "mp_006", "td_003", "ta_002"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.7}, "calculatedMetrics": {"currentRoi": -65.52307692307693, "lastCalculated": "2026-02-03T18:22:33.730Z", "cumulativeValueGbp": 224100, "projectedBreakevenMonth": "2029-01"}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 2.4, "byRole": {}}, "vendor": {"total": 5.6, "byRole": {}}}, "planned": {"month6": {"client": 3.8, "vendor": 4.2}, "month12": {"client": 5.8, "vendor": 2.2}, "month18": {"client": 7.2, "vendor": 0.8}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 160, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.353Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "foundation", "tShirtSize": "L", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001"], "inProgressMilestones": ["kt_002"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 20}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 20}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.658289'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '39a9ded6-bce2-4f09-8249-4d4fc0a02881', 'HEX_IND_012', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Predictive Risk Scoring', 'Machine learning model to predict policy risk levels during underwriting, improving pricing accuracy and reducing losses.', NULL, 'Predictive ML', ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.099000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.408Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.408Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.407Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.657684'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '8698fdbb-4a36-4870-a46c-f082c67a9b19', 'HEX_IND_013', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Customer Sentiment Analysis', 'NLP tool to analyze customer communications and social media mentions to identify satisfaction trends and potential churn risks.', NULL, 'NLP', ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.202000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.460Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.460Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.453Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.080371'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd42d6705-35f6-4c40-aa27-700b1771b912', 'HEX_IND_014', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Dynamic Pricing Engine', 'An AI-driven engine that optimizes and adjusts premium rates in real-time based on market conditions, competitor pricing, and incoming risk data.', NULL, 'Predictive ML', ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.213000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.478Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.478Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.465Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.079620'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b352b3cd-c60e-4021-9d2f-2d67fe86aa4f', 'HEX_IND_015', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Claims Processing Automation', 'End-to-end AI solution for first notice of loss through settlement, including damage assessment, coverage verification, and payment processing.', NULL, 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.110000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.419Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.419Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.419Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.100223'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '02ae6cab-3707-40a9-bf3b-4e1e82f285c8', 'HEX_IND_016', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Predictive Maintenance for Assets', 'IoT and AI solution to predict maintenance needs for insured commercial assets, reducing claim frequency and building stronger client relationships.', NULL, 'IoT + AI', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.179000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.433Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.433Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.430Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.083437'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '197bfb8d-fe00-443b-8838-ca90f5292a39', 'HEX_IND_017', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Fraud Detection AI', 'Advanced pattern recognition to identify potentially fraudulent claims by analyzing historical claim patterns, network analysis, and behavioral anomalies.', NULL, 'Predictive ML', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.261000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.537Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.537Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.510Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:31.504090'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'f14de88d-2464-4282-b0cf-50a7ff5964cb', 'HEX_IND_018', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Climate Risk Modeling', 'Advanced climate models using AI to assess long-term climate risks and their impact on insurance portfolios and pricing strategies.', NULL, 'Predictive ML', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], ARRAY['Property Owners']::text[], ARRAY['All Segments']::text[], ARRAY['United States']::text[], 3, 2, 2, 3, 3, 2, 3, 3, 3, 2, 'true', 'medium', 'false', 'true', 'true', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 2.6, 2.6, 'Experimental', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'Chief Underwriting Officer', 'Climate Analytics Team', NULL, 'joint', 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 18:09:28.973000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 850000, "ongoingMonthlyCost": 25000}, "selectedKpis": ["uw_001", "ops_003", "fin_002"], "valueConfidence": {"rationale": "Complex climate models require actuarial validation", "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.7}, "calculatedMetrics": {"currentRoi": -84.03478260869565, "lastCalculated": "2026-02-03T18:13:01.780Z", "cumulativeValueGbp": 183600, "projectedBreakevenMonth": "2032-06"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {"Risk Analyst": 1}}, "vendor": {"total": 5, "byRole": {"ML Engineer": 1, "Data Scientist": 2, "Climate Analyst": 2}}}, "planned": {"month6": {"client": 2, "vendor": 4}, "month12": {"client": 3, "vendor": 3}, "month18": {"client": 4, "vendor": 2}}}, "training": {"plannedCertifications": ["Climate Risk Modeling Certification"], "completedCertifications": [], "totalTrainingHoursPlanned": 120, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_shadow"]}, "selfSufficiencyTarget": {"targetDate": "2027-06", "advisoryRetainer": "true", "targetIndependence": 85}, "independencePercentage": 15}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:31.502116'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '2b7099ad-aec3-40b1-bbb5-9cb45a1ed9a4', 'HEX_IND_019', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Behavioral Risk Analytics', 'AI analyzes policyholder behavior patterns to predict claim likelihood and adjust pricing or coverage terms proactively.', NULL, 'Predictive ML', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.249000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.524Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.524Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.500Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:31.504692'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '0cf5dfa7-5ee1-47b5-bd11-22049c65daf3', 'HEX_IND_020', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Document Processing Automation', 'OCR and NLP solution to extract key information from policy documents, reducing manual data entry errors and processing time.', NULL, 'RPA', ARRAY['Submission & Quote']::text[], ARRAY['Risk Analysis','Pricing','Pipelining']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.224000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.495Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.495Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.476Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:31.524407'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'd2fa48e9-43f1-4346-aca6-254354fda956', 'HEX_IND_021', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Voice Analytics for Claims', 'Speech-to-text and sentiment analysis for customer calls during claims process to improve service quality and identify process improvements.', NULL, 'NLP', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.286000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.562Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.562Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.533Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.941453'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b1c0fcdd-5d13-4bc5-b693-184cb5ef11bb', 'HEX_IND_022', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'FNOL Claims processing', 'Claims Related ', NULL, 'Analytics & Insights', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.341000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.622Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.622Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.591Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.935166'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3806d678-331d-457b-8db2-c9917ea12697', 'HEX_IND_023', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Telematics-Based Pricing', 'Usage-based insurance pricing models using telematics data for more accurate risk assessment and personalized pricing.', NULL, 'IoT + AI', ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], ARRAY['Motor']::text[], ARRAY['Personal Lines']::text[], ARRAY[]::text[], 2, 2, 4, 3, 3, 1, 5, 3, 3, 1, 'true', 'low', 'true', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 2.8, 2.6, 'Experimental', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'Head of Motor Pricing', 'IoT Innovation Team', NULL, 'business_led', 'In-flight', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 18:16:35.129000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 1200000, "ongoingMonthlyCost": 45000}, "selectedKpis": ["ops_004", "strat_002"], "valueConfidence": {"rationale": "IoT infrastructure investment with long payback period", "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.5}, "calculatedMetrics": {"currentRoi": -89.44827586206895, "lastCalculated": "2026-02-03T18:16:35.196Z", "cumulativeValueGbp": 183600, "projectedBreakevenMonth": "2035-08"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {"Pricing Analyst": 1}}, "vendor": {"total": 8, "byRole": {"PM": 1, "IoT Engineer": 3, "Data Engineer": 2, "Actuarial Analyst": 2}}}, "planned": {"month6": {"client": 2, "vendor": 7}, "month12": {"client": 3, "vendor": 6}, "month18": {"client": 4, "vendor": 5}}}, "training": {"plannedCertifications": ["IoT Platform Training", "Telematics Data Analysis"], "completedCertifications": [], "totalTrainingHoursPlanned": 200, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "selfSufficiencyTarget": {"targetDate": "2028-06", "advisoryRetainer": "true", "targetIndependence": 75}, "independencePercentage": 5}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.765964'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'ea2fc72b-4d27-439d-977c-5fe022000a7c', 'HEX_IND_024', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Cyber Risk Assessment AI', 'Advanced AI system to evaluate cyber risk exposure for commercial clients using external threat intelligence and internal data.', NULL, 'GenAI', ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], ARRAY['Cyber','Professional Indemnity']::text[], ARRAY['Commercial Lines']::text[], ARRAY[]::text[], 3, 3, 3, 4, 5, 3, 5, 5, 5, 2, 'true', 'high', 'true', 'true', 'true', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 3.6, 4.0, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'Chief Information Security Officer', 'Cyber Insurance Team', NULL, 'joint', 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'L', 371250, 603281, 16, 26, '5-10', 'assessment', NULL, '2026-02-03 18:09:29.113000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 950000, "ongoingMonthlyCost": 35000}, "selectedKpis": ["fin_001", "ops_002", "strat_001"], "valueConfidence": {"rationale": "Emerging cyber market with uncertain loss patterns", "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.6}, "calculatedMetrics": {"currentRoi": -86.5985401459854, "lastCalculated": "2026-02-03T18:20:10.030Z", "cumulativeValueGbp": 183600, "projectedBreakevenMonth": "2033-08"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {"Cyber Underwriter": 1}}, "vendor": {"total": 6, "byRole": {"ML Engineer": 2, "Data Engineer": 2, "Cyber Security Expert": 2}}}, "planned": {"month6": {"client": 2, "vendor": 5}, "month12": {"client": 3, "vendor": 4}, "month18": {"client": 5, "vendor": 2}}}, "training": {"plannedCertifications": ["Cyber Risk Assessment Certification", "CISSP"], "completedCertifications": [], "totalTrainingHoursPlanned": 160, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_shadow"]}, "selfSufficiencyTarget": {"targetDate": "2027-09", "advisoryRetainer": "true", "targetIndependence": 80}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.778113'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3d32ed63-e616-43df-b6a8-100d949c42e9', 'HEX_IND_025', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Regulatory Compliance Monitoring', 'AI system that monitors regulatory changes and automatically assesses impact on existing policies and procedures.', NULL, 'GenAI', ARRAY['Regulatory & Compliance']::text[], ARRAY['Regulatory Reporting','Sanctions Check','Compliance Verification']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'ideation', NULL, '2026-01-29 07:56:32.514000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.813Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.813Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.757Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "ideation", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.205150'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'df2cfe13-9be1-4c3c-b219-d37150fe75ac', 'HEX_IND_026', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Automated Testing & Quality Assurance', 'Generates test cases, executes testing scenarios, and identifies bugs across all systems. Includes regression, performance, and security testing.', NULL, 'Gen AI', ARRAY['General']::text[], ARRAY['Issue Resolution']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'true', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:33.285000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.689Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.689Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.648Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:22.838307'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '06f0e01f-7301-4fb7-9790-381d8e91cddf', 'HEX_IND_027', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Intelligent Email & Communication Assistant', 'Drafts responses, schedules meetings, summarizes threads, and manages follow-ups. Understands context and maintains appropriate tone.', NULL, 'GenAI', ARRAY['General']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK','Ireland']::text[], 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, NULL, 'Mark Johnson', 'Amanda Reenan', 'AI Working Group', 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'true', ARRAY['Content Generation - Document drafting, report generation','Content Management -Categorization, tagging, curation','Information Analysis (Synthesis, summarization)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2025-09-03 17:12:22.842313', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.638Z", "kpiValues": {}, "investment": {"initialInvestment": 85000, "ongoingMonthlyCost": 7000}, "lastUpdated": "2026-02-03T14:22:51.638Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.5}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.721Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:22.842313'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3065e463-129e-4980-9af4-46c5459a4bc7', 'HEX_IND_028', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Document Scanning and Analysis Project', 'This project would implement an AI-driven solution designed to enhance user accessibility to the library of Benefit Plan Documents. By leveraging natural language processing (NLP) and machine learning technologies, the system scans and analyzes complex documents, extracting key information and presenting it in both an API and a user-friendly chat interface.', 'The Benefit Plan Documents for each of our clients are very detailed legal documents maintained by our Plan Build team.  These documents are complex, customized, and free form. They contain some details that are not captured in any system (including PowerSTEPP). There is a desire within the business to make this information more accessible to Customer Service, Claims, Data Analytics, as well as Clients / Members / Providers and other vendor partners', 'Agentic AI', ARRAY['General','Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY[]::text[], ARRAY['United States']::text[], 0, 0, 0, 0, 0, 4, 3, 0, 0, 4, 'false', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'industry_standard', NULL, 'Pilot', NULL, 'Todd', 'David Chen', 'Amanda Reenan', 'Business Owner Review', 'In-flight', NULL, 'Q2-2026', NULL, '500k', NULL, NULL, ARRAY[]::text[], ARRAY['Policy Database']::text[], ARRAY['Claims Teams']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-01-24 05:25:15.408000', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.637Z", "kpiValues": {}, "investment": {"initialInvestment": 145000, "ongoingMonthlyCost": 10000}, "lastUpdated": "2026-02-03T14:22:49.637Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.75}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.794Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-12-09 03:42:18.694506'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'e221505d-3226-4df7-9b4b-cd4691197ce6', 'HEX_INT_002', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Manual Back-and-Forth for Claims Adjustors with Underwriters to Confirm Coverage', 'GenAI-powered policy comparison engine to analyze inception, renewal, and endorsement documents
Automated clause/exception extraction and summarization for claims handlers
Side-by-side comparison view of coverage changes across policy periods
Seamless integration into Guidewire for real-time coverage summaries at FNOL.', 'Claims handlers and loss adjusters must frequently email underwriters to confirm policy coverage, clauses, and endorsements. This manual back-and-forth creates delays, inconsistent interpretations, and errors. Underwriters are distracted from core tasks, and clients/brokers experience slow claims resolution.', 'Gen AI', ARRAY['Claims Management']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (Commercial Property Loss Adjuster, frontline claims perspective).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium–High – recurring, significant pain highlighted by Andy Brown.', NULL, 'Faster, consistent coverage confirmation
Reduced manual burden on underwriters
Improved broker and customer satisfaction
Lower risk of misinterpretation and disputes
Stronger compliance and auditability of claims decisions.', NULL, NULL, ARRAY[]::text[], ARRAY['Guidewire Claims Center','UKRIS PAS','legacy PAS','shared drives/doc repositories.']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-01-29 07:56:31.899000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.120Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.120Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.9, "byRole": {}}, "vendor": {"total": 2.1, "byRole": {}}}, "planned": {"month6": {"client": 1.3, "vendor": 1.7}, "month12": {"client": 1.9, "vendor": 1.1}, "month18": {"client": 2.4, "vendor": 0.6}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 60, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.906Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "S", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:34.423638'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '197fd273-2829-455e-b138-861fc0d39e2e', 'HEX_INT_003', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Guidewire + Claims Connect Integration Gaps → Reconciliation Bots', 'AI bots/RPA to reconcile reserves, payments, and supplier invoices across Guidewire, Claims Connect, and finance systems
AI anomaly detection to highlight mismatches (amount, supplier, reference, date)
Invoice digitization/NLP extraction to auto-ingest supplier invoices
Event-driven sync to update Guidewire when actions occur in Claims Connect
Exception routing to finance/handlers only when mismatches can’t be auto-resolved.', 'Integration gaps between Guidewire and Claims Connect mean supplier invoices, reserves, and payments are not always synchronized. Handlers and finance staff manually confirm data across systems, leading to mismatches, delayed reconciliations, disputes with suppliers, and financial leakage. Audit trails are incomplete, and suppliers often face payment delays.', 'Prescriptive Rules Based', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (flagged integration and reconciliation pain points).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium — not the top pain compared to FNOL/triage but a recurring issue with clear ROI.', NULL, 'Reduced leakage through early detection of mismatches
Faster, more accurate supplier payments → stronger supplier relationships
Ops/finance efficiency gains → less manual reconciliation, staff focus on exceptions
Stronger auditability and compliance reporting
Reduced fraud/duplicate invoice risk.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','Claims Connect','Finance (SAP/Oracle)','RPA/automation middleware.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:31.947000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.174Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.175Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.205Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:34.406058'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '12d60f7b-c466-4991-ab9e-265cfb2d29b4', 'HEX_INT_004', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Provide Broker Insights both internally & externally  for proactive cross-sell / prospecting insights → AI-Driven Broker Analytics', '1) 19 Strategic brokers: (plus a wider "medium" cohort). Organization gets portal access for those brokers (upcoming renewals/portfolios).
2) Automated research & ingestion (AI bot) from broker portals (Marsh, Aon) into Unicorn Data Platform (SQL), this is a tactical solution but longer term will be replaced by the EDP. This will eliminate the error prone manual trackers/excel currently being used. Join broker portal data (e.g., Marsh) with internal data (Unicorn) to Identify incumbent vs. non-incumbent product opportunities per customer.
3) AI scoring of broker opportunities (propensity to win, cross-sell likelihood, value)
4) Support Internal & Broker-facing reports with automated insights/decisions and meeting-ready "storylines."
5) Evolve from Qlik → Power BI for distribution dashboards in longer term.', ' Growth- Pipeline generation - currently consists manual trackers from sales teams / UW, and Excel data dumps from brokers or online prospecting portals, wealth of information in these that should translate better and more focused pipeline supporting increased quotes. We get data together for all 20 Strategic Brokers from their sites and in time analyse however an AI agent should be able to easily tell us what’s in profile to look at prospecting / quotable. Distribution relies on manual portal scraping and ad-hoc prep for broker meetings; no propensity scoring or automated opportunity surfacing today.', 'Analytics & Insights', ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Broker Relations','Channel Management','Sales Support']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 4, 3, 4, 4, 4, 3, 3, 3, 2, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 3.8, 2.8, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, 'High value use case identified', 'Auto-deactivated: Governance gates incomplete', 'internal', NULL, NULL, NULL, 'James (Jay) Gregory (walked through Unicorn, portal data, and target state for automated insights).', 'Kevin O''Brien', 'James Gregory', 'AI Working Group', 'Discovery', 'Unicorn Data Model, current cource, Broker portal access', 'Medium — strong appetite; framed as quick/tactical wins while EDP matures.', NULL, 'Higher win rates and cross-sell via prioritized outreach, Shorter prep time; consistent data stories for brokersStronger broker relationships and revenue growth. Better management visibility across RSA/NIG portfolios.', 'Conversion rate', 'Unicorn Data Model, Source systems feeds, Finance', ARRAY['Natural Language Processing','Machine Learning','Rule-based Systems']::text[], ARRAY['Unicorn data model (SQL outputs','controls)','broker data feeds (Marsh','Aon portals)','Qlik/Power BI','CRM (MSD) for execution.','Broker Data & Feeds','Policy Database']::text[], ARRAY['Distrbution (Broker) Teams','IT/Technology','Business Analytics']::text[], 'true', ARRAY['Content Management -Categorization, tagging, curation','AI Assistant—Automation (Autofill, next-best action suggestions, autonomous agents)','Data Analysis - Augmentation, visualization']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'ideation', NULL, '2026-02-03 16:03:08.587000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.231Z", "kpiValues": {}, "investment": {"initialInvestment": 120000, "ongoingMonthlyCost": 9000}, "lastUpdated": "2026-02-03T14:22:50.231Z", "kpiEstimates": [{"kpiId": "ds_001", "kpiName": "Onboarding Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_002", "kpiName": "License Verification Automation", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_003", "kpiName": "Compliance Verification Rate", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_004", "kpiName": "Commission Processing Time", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_005", "kpiName": "Commission Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_006", "kpiName": "Commission Dispute Rate", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_007", "kpiName": "Agency Scorecard Automation", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_008", "kpiName": "Book Roll Prediction Accuracy", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ds_009", "kpiName": "Cross-Sell Recommendation Accuracy", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_001", "kpiName": "Model Accuracy Degradation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_002", "kpiName": "Prediction Confidence Distribution", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_003", "kpiName": "Inference Latency (p95)", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_004", "kpiName": "Model Drift Detection Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_005", "kpiName": "Feature Importance Stability", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_006", "kpiName": "A/B Test Statistical Power", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_001", "kpiName": "Data Freshness Score", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_002", "kpiName": "Feature Store Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_003", "kpiName": "Feature Reuse Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_004", "kpiName": "Data Quality Score (DQS)", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_005", "kpiName": "Data Pipeline SLA Adherence", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_006", "kpiName": "Schema Drift Incidents", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_001", "kpiName": "Technical Debt Ratio", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_002", "kpiName": "API Error Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_003", "kpiName": "Security Vulnerability Remediation Time", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_004", "kpiName": "Platform Currency Score", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_005", "kpiName": "Infrastructure Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_006", "kpiName": "Environment Parity", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_001", "kpiName": "AI Talent Retention Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_002", "kpiName": "Skill Gap Closure Velocity", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_003", "kpiName": "Knowledge Documentation Coverage", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_004", "kpiName": "Bus Factor Risk", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_005", "kpiName": "Team Utilization Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_006", "kpiName": "Internal Mobility/Growth", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_001", "kpiName": "Idea-to-PoC Conversion Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_002", "kpiName": "PoC Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_003", "kpiName": "Experimentation Velocity", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_004", "kpiName": "Failed Experiment Learning Capture", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_005", "kpiName": "Innovation Funnel Health", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_006", "kpiName": "External Partnership Value", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_001", "kpiName": "Business Sponsor Satisfaction", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_002", "kpiName": "Strategic Priority Alignment", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_003", "kpiName": "Demand Backlog Age", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_004", "kpiName": "Stakeholder Engagement Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_005", "kpiName": "Value Realization Communication", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_006", "kpiName": "Executive Dashboard Access", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_001", "kpiName": "Hallucination Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_002", "kpiName": "Human Override Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_003", "kpiName": "Prompt Effectiveness Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_004", "kpiName": "Token Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_005", "kpiName": "Guardrail Trigger Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_006", "kpiName": "Context Window Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_007", "kpiName": "RAG Retrieval Precision", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_008", "kpiName": "Response Time SLA Compliance", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_001", "kpiName": "Cloud Cost Optimization", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_002", "kpiName": "Infrastructure Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_003", "kpiName": "Deployment Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_004", "kpiName": "Mean Time to Recovery (MTTR)", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_005", "kpiName": "Change Failure Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_006", "kpiName": "Lead Time for Changes", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_001", "kpiName": "AI Security Incidents", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_002", "kpiName": "Privacy Compliance Rate", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_003", "kpiName": "Access Control Adherence", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_004", "kpiName": "Data Encryption Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_005", "kpiName": "Model Adversarial Testing", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_006", "kpiName": "PII Detection Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_001", "kpiName": "AI-Assisted Resolution Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_002", "kpiName": "Self-Service Adoption Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_003", "kpiName": "Response Time Improvement", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_004", "kpiName": "Customer Effort Score (AI)", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_005", "kpiName": "First Contact Resolution (AI)", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_006", "kpiName": "AI NPS Impact", "kpiType": "strategic", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_001", "kpiName": "Process Automation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_002", "kpiName": "Straight-Through Processing Rate", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_003", "kpiName": "Manual Intervention Reduction", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_004", "kpiName": "Exception Handling Time", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_005", "kpiName": "Predictive Accuracy (Operations)", "kpiType": "operational", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_006", "kpiName": "Resource Optimization Savings", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}], "selectedKpis": ["sd_001", "sd_004", "in_001", "ta_005", "dq_001"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.55}, "calculatedMetrics": {"currentRoi": -8.81578947368421, "lastCalculated": "2026-02-03T16:03:08.650Z", "cumulativeValueGbp": 207900, "projectedBreakevenMonth": "2027-04"}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.573Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "ideation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-31", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.839690'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '897848d2-1204-4c86-895b-adfdaee33b84', 'HEX_INT_005', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Policy Documents Not Auto-Attached in Guidewire Claims Center', 'AI-enabled ingestion of policy docs from PAS, underwriting, and shared sources
Document classification (renewal vs inception vs endorsement) to avoid duplicates
Auto-linking of policy docs to claim at FNOL
Automated exception-handling triggers if docs cannot be found.', 'Policy documents (especially inception versions) are not automatically attached in Guidewire. Claims handlers must manually chase underwriters or brokers for missing files, delaying claim setup and coverage validation. This creates inefficiency, poor customer/broker experience, and frustration across claims and underwriting teams.', 'Gen AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (Commercial Property Loss Adjuster; detailed frontline pain).', NULL, NULL, NULL, 'Backlog', NULL, 'High – raised as major frustration by Andy Brown.', NULL, 'Faster claim setup and validation
Improved accuracy in applying correct coverage
Reduced manual chasing by claims and underwriters
Enhanced customer and broker experience
Better compliance and audit trail.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','UKRIS','legacy PAS','shared drives/document repositories.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:31.981000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.217Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.217Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.242Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.841283'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'f95048a6-b50e-4cb6-a931-0455b1e1ebe0', 'HEX_INT_006', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Premium debiting in UKRIS', 'RPA/AI to automate debit posting immediately upon broker approval
Automated reconciliation with broker approval data (amount/date/reference checks)
Exception handling logic to flag mismatches for manual review.', 'Premium debiting in UKRIS is a manual process performed after broker approval. Re-keying errors, mismatched amounts, and delayed postings create frequent disputes, account complaints, and additional work for finance/ops. Underwriters are distracted from underwriting to chase corrections. Audit trail is inconsistent.', 'Process Automation', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Craig Brownrigg (UK – flagged automation ask); Rachel (UK – highlighted accuracy/capability issues); underwriters acknowledged distraction from underwriting.', NULL, NULL, NULL, 'Backlog', 'UKRIS PAS, broker approval workflows (email/manual), billing/finance systems (SAP/Oracle).', 'Medium–High – recurring issue with measurable impact.', 'Improved billing accuracy; reduced disputes and complaints.
Faster, reliable posting builds broker/client trust.
Ops/finance efficiency gains; fewer write-offs.
Stronger audit/compliance traceability.', 'Improved billing accuracy; reduced disputes and complaints
Faster, reliable posting builds broker/client trust
Ops/finance efficiency gains; fewer write-offs
Stronger audit/compliance traceability.', NULL, NULL, ARRAY[]::text[], ARRAY['UKRIS PAS','broker approval workflows (email/manual)','billing/finance systems (SAP/Oracle).']::text[], ARRAY['Underwriting Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.016000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.302Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.302Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.318Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.265827'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '458313d4-0897-4c66-8d16-87b909e3be11', 'HEX_INT_007', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Predictive Risk Monitoring (IoT + AI)', 'Deploy IoT sensors (fire, flood, water leak, structural health)
AI models to analyze sensor data and predict risk events (e.g., overheating, water damage, structural instability)
Automated alerting to clients and underwriters
Integration with underwriting systems for dynamic pricing and with claims systems for early FNOL triggers.', 'Claims prevention today is largely reactive — insurers only act once a loss event occurs (fire, flood, structural failure). There is no systematic predictive monitoring of insured assets. This leads to higher frequency/severity of claims, higher costs, and limited ability to support clients with proactive advice.', 'IoT + AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['Commercial Property']::text[], ARRAY['Commercial Lines']::text[], ARRAY[]::text[], 2, 3, 3, 2, 2, 1, 5, 5, 4, 1, 'false', 'low', 'true', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 2.4, 3.2, 'Watchlist', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Head of Commercial Property', 'Risk Engineering', NULL, 'business_led', 'Backlog', 'IoT sensor platforms, PowerUp analytics layer, underwriting PAS (UKRIS/DxC PAS), Claims Center, client-facing dashboards.', 'Medium–High – described by Andrew Hall as more of a longer-term bet but strategically important.', 'Reduced claims frequency/severity through early detection and intervention.
Stronger client relationships via proactive risk advice.
Underwriters benefit from live risk monitoring for more accurate pricing.
Operations/claims savings through fewer catastrophic losses.
Portfolio-level insights for risk management and reinsurance optimization.', 'Reduced claims frequency/severity through early detection and intervention
Stronger client relationships via proactive risk advice
Underwriters benefit from live risk monitoring for more accurate pricing
Operations/claims savings through fewer catastrophic losses
Portfolio-level insights for risk management and reinsurance optimization.', NULL, NULL, ARRAY[]::text[], ARRAY['IoT sensor platforms','PowerUp analytics layer','underwriting PAS (UKRIS/DxC PAS)','Claims Center','client-facing dashboards.','Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-02-03 18:09:29.527000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 900000, "ongoingMonthlyCost": 30000}, "selectedKpis": ["ops_005", "fin_004"], "valueConfidence": {"rationale": "IoT sensor deployment requires significant capital and time to value", "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.4}, "calculatedMetrics": {"currentRoi": -81.35714285714286, "lastCalculated": "2026-02-03T18:13:46.695Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2031-07"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {"Property Underwriter": 1}}, "vendor": {"total": 7, "byRole": {"PM": 1, "Risk Engineer": 1, "Data Scientist": 2, "IoT Specialist": 3}}}, "planned": {"month6": {"client": 2, "vendor": 6}, "month12": {"client": 3, "vendor": 5}, "month18": {"client": 4, "vendor": 4}}}, "training": {"plannedCertifications": ["IoT Sensor Integration", "Predictive Maintenance Analytics"], "completedCertifications": [], "totalTrainingHoursPlanned": 180, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "selfSufficiencyTarget": {"targetDate": "2028-03", "advisoryRetainer": "true", "targetIndependence": 70}, "independencePercentage": 5}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.249586'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '467850cb-198e-40d5-93c7-5b45a4626250', 'HEX_INT_008', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Email/document triage for Instabase mailbox', 'AI-powered email/document triage to classify messages (new business, MTA, inquiry)
Auto-route to the correct Instabase parser/workflow
Integrate with Instabase APIs and provide confidence scores
Exceptions flagged to underwriter for validation.', 'Broker submissions (new business, MTAs, inquiries) arrive by email. Underwriters must manually forward relevant emails/slips to Instabase mailboxes. This manual triage causes delays, errors, and inconsistencies. High dependency on individual underwriters creates scalability and reliability risks.', 'Gen AI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Prompted by Hexaware suggestion; confirmed by Andrew Hall (CUO – highlighted current mailbox burden and constraints).', NULL, NULL, NULL, 'Backlog', 'Outlook inboxes, Instabase mailboxes, Instabase APIs, UW Workbench (Power UP)', 'High – positioned as quick win with strong ROI.', 'Faster triage and ingestion.
Scalable process → supports growth without proportional headcount.
Reduced misrouting/missed submissions.
Improved broker responsiveness and satisfaction.', 'Faster triage and ingestion
Scalable process → supports growth without proportional headcount
Reduced misrouting/missed submissions
Improved broker responsiveness and satisfaction.', NULL, NULL, ARRAY['Natural Language Processing']::text[], ARRAY['Outlook inboxes','Instabase mailboxes','Instabase APIs.','Policy Database','Historical Data']::text[], ARRAY['Underwriting Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.042000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.330Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.330Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.342Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.246818'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b3164f02-7dcc-4a89-a25f-e6a7f0ad067a', 'HEX_INT_009', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', ' Multiple Underwriting Systems (Fragmented Policy Access for Claims Handlers)', 'Unified data/API layer connecting legacy PAS, UKRIS, Instabase, and Guidewire
AI-enabled semantic search across structured/unstructured data
Automated reconciliation to present a single, authoritative policy view
Surface results via PowerUp dashboards or Guidewire plug-in.', 'Policy data is fragmented across multiple underwriting systems — UKRIS, Instabase, legacy PAS, and delegated scheme portals. Claims handlers and underwriters must search across multiple sources, reconcile mismatched records, and risk acting on incomplete or inconsistent information. This slows claims handling, creates errors, and frustrates brokers.', 'Process', ARRAY['General']::text[], ARRAY['Issue Resolution']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown', NULL, NULL, NULL, 'Backlog', NULL, 'High – described as a structural challenge (not just an ops fix).', NULL, 'Single policy view reduces delays and errors
Faster coverage validation and claims handling
Underwriters access complete history for better renewal/pricing decisions
Improved broker and customer experience
Strategic enabler for PAS modernization roadmap.', NULL, NULL, NULL, ARRAY['UKRIS PAS','Instabase','legacy PAS/delegated systems','Guidewire','PowerUp dashboards.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.054000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.343Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.343Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.352Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:33.246042'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'dd2c0565-9579-4921-9617-e51c4f063c87', 'HEX_INT_010', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Risk Consulting Surveys', 'Drone-based aerial imaging analyzed with computer vision for hazard detection
Wearables for surveyors to capture real-time environmental/safety data
AI-driven hazard classification and auto-ingestion of findings into survey reports
Integration of outputs into underwriting workflows and client-facing risk portals.', 'Risk Consulting surveys are performed manually by site engineers, relying on notes and photos. Hazards (e.g., fire exits, roof defects, flood risks) are often missed, reports are inconsistent, and turnaround times are slow. Underwriters and clients depend on these reports, leading to downstream pricing and prevention challenges when data is incomplete. Surveyors also face safety risks in hazardous environments.', 'IoT + AI', ARRAY['Risk Consulting']::text[], ARRAY['Risk Evaluation','Compliance Verification','Advisory Services']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andrew Hall (referenced Andy Jones in Risk Consulting, and external examples of drones/wearables in industry).', NULL, NULL, NULL, 'Backlog', 'Risk Consulting survey reporting platform, client-facing risk portals, underwriting risk assessment systems, data feeds into PAS/PowerUp.', 'Medium (innovation-oriented currently, but strategic for prevention and underwriting accuracy).', 'Improved hazard detection accuracy and survey consistency.
Enhanced underwriting quality through richer risk data.
Proactive claims prevention via better client risk advice.
Improved surveyor safety (reduced need for risky manual inspections).
Faster turnaround times and standardized reporting.', 'Improved hazard detection accuracy and survey consistency
Enhanced underwriting quality through richer risk data
Proactive claims prevention via better client risk advice
Improved surveyor safety (reduced need for risky manual inspections)
Faster turnaround times and standardized reporting.', NULL, NULL, NULL, ARRAY['Risk Consulting survey reporting platform','client-facing risk portals','underwriting risk assessment systems','data feeds into PAS/PowerUp.','Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.190000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.445Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.445Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.442Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:32.080905'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '6a9a3653-4903-4de6-b3d0-6ed92845cdf9', 'HEX_INT_011', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Data Silos Across PAS, Underwriting, Claims, Legacy Systems', 'Develop unified enterprise data platfor(lakehouse) integrating PAS, claims, and doc systems
AI-driven data cleansing, enrichment, and reconciliation
Analytics layer to enable ML and GenAI across value chain
Unified APIs to feed downstream systems (PowerUp dashboards, underwriting apps, claims platforms).', 'RSA’s data is fragmented across legacy PAS (UKRIS), AIS (doc system), Guidewire Claims, Instabase, and other silos. This prevents underwriters, claims, and executives from accessing a unified view of clients, policies, and claims. Data inconsistencies block AI/ML adoption and increase compliance/reporting risk.', 'Analytics & Insights', ARRAY['Process Integration']::text[], ARRAY['Service Delivery']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andrew Hall (CUO; highlighted fragmented systems and referenced India-led data platform program).', NULL, NULL, NULL, 'Backlog', NULL, 'described as strategic enabler by Andrew Hall; being led by India data/analytics team.', NULL, 'Single source of truth for all insurance data
Faster, more confident underwriting and claims decisions
Portfolio-level analytics for pricing, reserving, and risk appetite
Operational savings from reduced reconciliation
Enables regulatory compliance (IFRS 17, Solvency II)
Strategic foundation for nearly every other AI/automation use case.', NULL, NULL, NULL, ARRAY['PowerUp','UKRIS PAS','AIS','Instabase','Guidewire Claims Center','future DxC PAS','broker feeds.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.235000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.511Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.511Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.488Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:31.506513'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b55af410-f7ee-4bb4-996d-54bc60cdad93', 'HEX_INT_012', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'AI auto-flagging of risks (sanctions, watchlists, news enrichment)', 'An automated risk-enrichment service that, post-ingestion, queries public news/press sources, corporate registries, and industry feeds to auto-flag relevant red flags (e.g., incidents, adverse filings, regulatory actions) with confidence scoring and citations. Summaries are embedded in PowerUp (or equivalent workbench) with links to sources. (Note: Sanctions/watchlists enforcement remains a dedicated compliance control in UC9, but high-level sanction flags can be surfaced in the same panel for completeness.)', 'After Instabase converts broker slips to structured data, underwriters still perform manual external research (news, company events, asset incidents) to uncover red flags. This is time-consuming, inconsistent across individuals, and risks missed adverse signals.', 'Agentic AI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Hall; endorsed by underwriters (manual burden and examples like marine vessel news checks).', NULL, NULL, NULL, 'Backlog', 'Instabase (trigger), PowerUp (display), external data/APIs for news/press/registry feeds; optional touchpoints S360, Copilot 365 (current ad-hoc tool).', 'High — repeatedly positioned as a key capability beyond basic ingestion.', 'Improved decision quality (better risk selection/pricing).
Time savings vs. manual research; scalable as submission volumes grow.
Consistency in external checks; fewer missed issues.
Auditability via cited sources supporting underwriting rationale.', 'Improved decision quality (better risk selection/pricing)
Time savings vs. manual research; scalable as submission volumes grow
Consistency in external checks; fewer missed issues
Auditability via cited sources supporting underwriting rationale.', NULL, NULL, ARRAY[]::text[], ARRAY['Instabase (trigger), PowerUp (display), external data/APIs for news/press/registry feeds','optional touchpoints S360, Copilot 365 (current ad-hoc tool).']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.328000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.606Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.606Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.575Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.939151'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'a54f1c85-bf1d-4510-8e35-c58622ca876b', 'HEX_INT_013', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Automated sanctions & high-risk country scanning', 'Automated sanctions/watchlist and high-risk geography scanning triggered from Instabase ingestion; integrated into PowerUp dashboards; compliance escalation path; audit trail maintained.', 'Manual sanctions and high-risk country checks by underwriters are inconsistent and time-consuming. No system-embedded workflow → regulatory exposure. Copilot 365 is piloted but separate.', 'Agentic AI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY['Commercial Lines','Personal Lines']::text[], ARRAY['All Segments']::text[], ARRAY[]::text[], 4, 4, 4, 4, 4, 2, 4, 3, 2, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 4.0, 2.8, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andrew Hall (explicitly), with underwriters confirming manual pain.', 'Andrew Hall', NULL, 'joint', 'Backlog', 'Instabase, PowerUp, sanctions/watchlist APIs (OFAC, HMT, EU, commercial providers), compliance systems.', 'High – compliance-critical.', 'Compliance assurance (avoid fines, reputational harm); efficiency (remove manual burden); consistency (every case checked); better broker response.', 'Compliance assurance (avoid fines, reputational harm); efficiency (remove manual burden); consistency (every case checked); better broker response.', NULL, NULL, ARRAY[]::text[], ARRAY['Instabase','PowerUp','sanctions/watchlist APIs (OFAC','HMT','EU','commercial providers)','compliance systems.']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 18:28:26.803000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.575Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "lastUpdated": "2026-02-03T14:22:50.575Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T18:39:01.120Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.940488'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '04fdda06-54fe-411f-a898-92d6baeecddb', 'HEX_INT_014', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Supplier Appointments via Claims Connect (Dual Navigation)', 'Embedded supplier orchestration within Guidewire, integrated with Claims Connect via APIs/queues
AI-based supplier recommendation at FNOL (rank by location, capacity, SLA performance, specialization)
Event-driven synchronization: supplier instructions, appointments, updates, and documents flow automatically back to the claim record
NLP auto-notes: summarize supplier updates into structured Guidewire notes/tasks
Exception handling: flag delays/SLA breaches; trigger escalation or reallocation.', 'Claims handlers must leave Guidewire to instruct and manage suppliers in Claims Connect, then manually re-enter updates into Guidewire. This dual navigation causes delays, rekeying errors, inconsistent status, and weak SLA visibility. Customers and brokers wait longer for supplier contact and resolution.', 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (frontline claims perspective on dual navigation and status lag).', NULL, NULL, NULL, 'Backlog', NULL, 'day-to-day friction with tangible gains; also an enabler for finance reconciliation and field efficiency.', NULL, 'Faster supplier instruction and earlier on-site action → reduced cycle times
Single source of truth in Guidewire; fewer rekeying errors and status gaps
Improved supplier performance management (live SLAs, automatic alerts)
Better cost control and downstream invoice alignment 
Enhanced customer/broker experience with timely, consistent updates.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center (primary UI/record)','Claims Connect (supplier network)','integration middleware/queues','document repository (for auto-ingested supplier reports/photos).']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.312000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.589Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.589Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.560Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.939933'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3dd30099-a949-4b34-98e0-a6e4d3889563', 'HEX_INT_015', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Heavy reliance on manual claim notes, narrations, unstructured text → GenAI Insight Extraction', 'GenAI-driven summarization of claim narratives for handovers and audits
NLP-based auto-coding of claims attributes (LOB, SIC, cause, severity)
Intelligent suggestion engine for “next best action” based on historical case outcomes
Sentiment and red-flag detection to flag dissatisfied customers or risk indicators
Knowledge graph enrichment to connect unstructured notes with related cases/policies.', 'Claims handlers rely heavily on free-text notes in Guidewire and other systems. Notes are long, inconsistent, and lack structured coding. This leads to delays (handlers re-read histories), inconsistent MI, and missed opportunities for proactive actions (fraud, subrogation, customer risk). Supervisors and auditors also struggle to review cases quickly.', 'Gen AI', ARRAY['Claims Management']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (explicitly raised issue of unstructured notes, coding, and industry-wide challenges).', NULL, NULL, NULL, 'Backlog', NULL, 'High — flagged as a widespread, industry-level challenge with significant operational impact.', NULL, 'Faster handovers and decision-making
Improved coding consistency and MI accuracy
More proactive detection of risk, fraud, and subrogation opportunities
Increased handler productivity by reducing time spent reading notes
Improved customer outcomes from faster, more consistent responses.', NULL, NULL, ARRAY[]::text[], ARRAY['Guidewire Claims Center notes','Instabase','legacy doc repositories','MI/reporting platforms..']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.398000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.684Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.684Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.647Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.373488'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'c29f26f0-0d27-4250-b5b9-95f4822b75a8', 'HEX_INT_016', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Legacy PAS (UKRIS) – Bridging with Bots', 'RPA bots to handle repetitive PAS tasks (policy setup, amendments, renewals)
Bots for AIS document handling (auto-populate, attach to policy)
AI-enabled validation to catch mismatches between PAS and doc outputs
Automation built as a “bridge” until DxC PAS rollout.', 'Legacy UKRIS PAS and AIS are outdated, fragmented systems. Underwriters face heavy manual rekeying, doc mismatches, and inefficient workflows. AIS is not integrated, so documents require manual intervention. Modernization (DxC PAS) is in progress but will take years, leaving an immediate productivity and error-risk gap.', 'RPA', ARRAY['Underwriting & Triage']::text[], ARRAY['Risk Assessment','Rating','Quality Assurance']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'medium', 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Iain Cameron (UK – cited NIG precedent with IS2000 bots); Helen Franklin (UK – raised legacy PAS/AIS pain points).', NULL, NULL, NULL, 'Backlog', 'UKRIS PAS, AIS (doc gen), IS2000 (historical precedent), future DxC PAS integration.', 'Medium – recognized as a structural pain point, but seen as interim solution until modernization.', 'Reduced manual effort and error rate in PAS workflows.
Improved underwriter focus on value-add tasks.
Increased ops capacity without additional headcount.
Smooth transition path while DxC PAS is phased in.', 'Reduced manual effort and error rate in PAS workflows
Improved underwriter focus on value-add tasks
Increased ops capacity without additional headcount
Smooth transition path while DxC PAS is phased in.', NULL, NULL, NULL, ARRAY['UKRIS PAS','AIS (doc gen)','IS2000 (historical precedent)','future DxC PAS integration.']::text[], ARRAY['Underwriting Teams','IT/Technology']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.353000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.640Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.640Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.604Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.377037'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '94d44035-da68-4dd9-891c-80864a9b64ad', 'HEX_INT_017', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Subrogation Detection', 'NLP models to analyze FNOL narratives, claim notes, and adjuster text for liability cues
Computer Vision on uploaded images to detect third-party involvement
AI-driven subrogation scoring and prioritization engine
Automated task creation in Guidewire for recovery teams when opportunities are detected.', 'Subrogation opportunities are currently flagged only if adjusters/handlers complete manual forms in Guidewire. This process is inconsistent, prone to oversight, and often reactive, leading to missed recoveries and financial leakage.', 'NLP', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (Commercial Property Loss Adjuster – flagged manual nature of current subrogation process).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium–High – raised as recurring financial opportunity, with Guidewire improvements noted but gaps persisting.', NULL, 'Increased recovery rates and reduced financial leakage
Proactive subrogation detection → earlier in claim lifecycle
Reduced reliance on handler judgment and manual form completion
Improved auditability and consistency in recovery decisions.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','recoveries workflows','evidence/document repositories.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.383000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.670Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.670Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.633Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.374038'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '88f7c743-32e9-49af-974d-27a1594965e3', 'HEX_INT_018', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Document Management, Generation, AI-assisted document ingestion & clause handling', 'AI-assisted document production, management & ingestion pipeline with:
- Auto-tagging/indexing into central repository
- Intelligent clause/exception insertion (based on risk class, LOB, underwriting rules)
- Consistency checks against clause library
- Automated formatting/numbering cleanup.', 'Documents produced by raters and AIS require heavy manual editing by underwriters to add clauses, exceptions, and endorsements. Formatting errors and inconsistent clause usage across underwriters lead to compliance risk and rework. Storage in shared drives is inconsistent, with missing metadata/tags, making retrieval and audit difficult. Ops teams must re-check and fix formatting/scanning issues downstream.', 'GenAI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'high', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Iain Cameron (UK) (raised doc editing/quality pain); Craig Brownrigg (UK) (highlighted downstream ops impact); Helen Franklin (UK) (raised missed endorsements risk).', NULL, NULL, NULL, 'Backlog', 'AIS, Raters, UKRIS doc gen, Paragon, SRI, Integrate, shared drives (potential future migration to central repository).', 'Medium–High – recurring underwriter frustration; compliance-critical.', 'Faster document preparation; reduced manual edits.
Improved compliance and reduced regulatory/audit risk.
Consistent broker-facing documents → stronger trust.
Ops efficiency: less re-checking, easier retrieval.', 'Faster document preparation; reduced manual edits
Improved compliance and reduced regulatory/audit risk
Consistent broker-facing documents → stronger trust
Ops efficiency: less re-checking, easier retrieval.', NULL, NULL, ARRAY[]::text[], ARRAY['AIS','Raters','UKRIS doc gen','Paragon','SRI','Integrate','shared drives (potential future migration to central repository).']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.412000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.698Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.698Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.662Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.367884'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '810aec82-4e24-4203-9411-a9d1492ea29a', 'HEX_INT_019', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Pre-renewal triggers & terrorism questionnaires', 'AI-driven automation to trigger pre-renewal reminders and generate required forms/emails directly from PAS data
NLP/GenAI to pre-fill terrorism questionnaires with available policy/risk data
Automated email orchestration and response tracking with escalation logic.', 'Renewal prep is manual and inconsistent. Pre-renewal triggers (90 days prior) must be set up and tracked manually in PAS/MSD. Terrorism questionnaires are manually generated, sent, and chased by underwriters, consuming valuable time. Responses are collated via spreadsheets, creating high risk of missed deadlines, errors, and inconsistent follow-ups. Reputational damage occurs when renewals are delayed or incomplete.', 'Prescriptive Rules Based', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Iain Cameron (UK – pre-renewal triggers); Rachel (UK – terrorism questionnaire pain); Ops team flagged downstream reputational impact.', NULL, NULL, NULL, 'Backlog', 'MSD renewal triggers, PAS, Outlook/email systems, broker extranets (partial integration).', 'Medium – clearly seen as an automation candidate with compliance importance.', 'Reduced cycle time; fewer missed renewals.
Consistent and compliant handling of terrorism questionnaires.
Improved broker/client experience and trust.
Freed underwriter/ops time for higher-value tasks.', 'Reduced cycle time; fewer missed renewals
Consistent and compliant handling of terrorism questionnaires
Improved broker/client experience and trust
Freed underwriter/ops time for higher-value tasks.', NULL, NULL, ARRAY[]::text[], ARRAY['MSD renewal triggers','PAS','Outlook/email systems','broker extranets (partial integration).']::text[], ARRAY['Underwriting Teams','IT/Technology','Compliance']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.367000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.656Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.656Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.618Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:30.376419'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '4448e341-de74-47a3-a974-5d45f9f133e9', 'HEX_INT_020', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Hazard Data in Commercial Property Claims', 'AI-driven enrichment at FNOL: auto-link external hazard feeds (weather, IoT, geospatial) to claim location
Real-time risk scoring engine to suggest initial reserve bands
IoT integration to pull data from client sensors (fire, flood, structural)
Visualization dashboards for handlers/adjusters showing live hazard overlays
Automatic flagging of “repeat hazard” clients for proactive mitigation engagement.', 'Hazard context (e.g., flood risk, fire exposure, severe weather patterns) is often missed or captured late in the commercial property claims process. Handlers rely on manual searches or adjuster experience, leading to under-reserving, overlooked mitigation opportunities, and inconsistent decision-making.', 'Gen AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (Commercial Property Loss Adjuster – flagged recurring issue of missing hazard context at FNOL).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium–High — seen as a strong opportunity to improve reserving and link claims with prevention.', NULL, 'More accurate initial reserves → fewer late adjustments, reduced financial leakage
Faster identification of high-severity claims → better resource allocation
Proactive client risk mitigation → lower repeat claims, improved retention
Portfolio-level insights on hazard clusters → supports underwriting and reinsurance strategy.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','hazard data APIs (weather/flood/geospatial)','IoT sensor feeds','PowerUp dashboards.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.424000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.715Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.715Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.675Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.810485'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '96e795e5-1ee7-4963-a4f6-7e1afb23cf69', 'HEX_INT_021', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Product Duplication Across Multiple Brands ("One Commercial")', 'AI/NLP-driven product mapping and comparison of terms, clauses, and rating rules
Automated identification of overlaps, gaps, and redundancies across products
Decision support for harmonizing product definitions into a single "One Commercial" framework
Integration with PAS and broker portals for unified access to consolidated product set.', 'RSA, NIG, and DLG maintain separate product definitions and systems, leading to duplication in underwriting processes, IT configuration, and broker-facing propositions. FarmWeb operates independently as a specialized agriculture platform. This fragmentation increases operational complexity, slows innovation, and creates inconsistency in broker and client experience.', 'NLP', ARRAY['Product & Rating']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'high', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Helen Franklin (UK – explained One Commercial, noted FarmWeb remains separate).', NULL, NULL, NULL, 'Backlog', 'RSA PAS (UKRIS), NIG PAS, DLG systems, Rating engines, FarmWeb platform, broker portals.', 'Medium – acknowledged as already in flight as part of “One Commercial” strategy.', 'Streamlined product portfolio reduces duplication and overhead.
Consistent, harmonized offerings improve broker and client satisfaction.
Simplified IT landscape (fewer product configurations across PAS and rating engines).
Improved analytics and risk insight across unified products.
Strategic enabler for “One Commercial” program.', 'Streamlined product portfolio reduces duplication and overhead
Consistent, harmonized offerings improve broker and client satisfaction
Simplified IT landscape (fewer product configurations across PAS and rating engines)
Improved analytics and risk insight across unified products
Strategic enabler for “One Commercial” program.', NULL, NULL, ARRAY['Machine Learning','Rule-based Systems']::text[], ARRAY['RSA PAS (UKRIS)','NIG PAS','DLG systems','FarmWeb platform','broker portals.']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.437000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.731Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.731Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.689Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.802841'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '63d0e5fa-ab16-4322-8927-a824b57b7f91', 'HEX_INT_022', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Instabase ingestion validation & enrichment', 'AI-driven validation of ingestion accuracy (cross-check extracted data against source slip and rules)
Automated enrichment via sanctions lists, watchlists, news feeds, and public data APIs
Confidence scoring and exception routing for human review.', 'Instabase ingests broker slips but lacks intelligence for validation and enrichment. Underwriters manually cross-check extracted data against original slips and external sources (sanctions, news, public data). This creates delays, errors, and duplicated effort. Ops must fix issues late in the process when validation gaps are discovered.', 'Gen AI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andrew Hall (CUO – Head of Technical Delivery); supported by underwriters (validation burden).', NULL, NULL, NULL, 'Backlog', 'Instabase (ingestion), PowerUp (analytics dashboard), S360 (Canada/US tooling), external sanctions/news APIs.', 'High – positioned as strategic improvement to Instabase.', 'Higher data quality and accuracy at point of entry.
Faster underwriting decisions with enriched context.
Reduced compliance and reputational risk.
Scalable ingestion → fewer manual checks and faster turnaround.', 'Higher data quality and accuracy at point of entry
Faster underwriting decisions with enriched context
Reduced compliance and reputational risk
Scalable ingestion → fewer manual checks and faster turnaround.', NULL, NULL, ARRAY['Machine Learning','Natural Language Processing']::text[], ARRAY['Instabase (ingestion)','PowerUp (analytics dashboard)','S360 (Canada/US tooling)','external sanctions/news APIs.','Policy Database','External APIs','Third-party Data','Historical Data']::text[], ARRAY['Underwriting Teams','IT/Technology','Business Analytics']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.455000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.752Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.752Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.704Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.778831'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '872dd0da-6ee7-47cc-a34f-0bc6540e599b', 'HEX_INT_023', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', ' Better integration of external & internal data → AI Enrichment Pipelines', 'AI-enabled enrichment pipelines that ingest external broker feeds/portals and unify with PAS/claims datasets.
Entity resolution, schema harmonization, quality controls/exception reports (as done in Unicorn today).
Feed PowerUp and operational apps with governed, decision-ready data.
Design to repoint to EDP later without re-engineering.', 'External broker/market data and internal PAS/claims data are not seamlessly integrated; teams rely on manual stitching for insights. EDP is the target end-state, but near-term value is needed.', 'Process Automation', ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation','Broker Relations','Channel Management']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['United States']::text[], 3, 3, 4, 5, 5, 2, 4, 3, 2, 3, 'true', 'low', 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 4.0, 2.8, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'James (Jay) Gregory', 'James', NULL, 'joint', 'Backlog', NULL, 'Medium —tactical enabler for near-term impact while EDP is built.', NULL, 'Faster, consistent underwriting and claims decisions from a trusted data layer
Reduced manual manipulation; repeatable insights for distribution and UW
Prepares the ground for automated insights/decisions and future EDP integration.', NULL, NULL, ARRAY['Machine Learning','Natural Language Processing','Predictive Analytics']::text[], ARRAY['Unicorn pipelines (SQL), PowerUp analytics, PAS (UKRIS/NIG), Guidewire','external broker feeds/portals.','Policy Database','Broker Data & Feeds']::text[], ARRAY['Underwriting Teams','Claims Teams','Distrbution (Broker) Teams']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 18:32:36.605000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.843Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "lastUpdated": "2026-02-03T14:22:50.843Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T18:32:36.638Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.203893'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'bd31557b-d22e-47f8-b9ae-a5759dc3d5f5', 'HEX_INT_024', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Claims Triage by Value Thresholds', 'AI-based triage engine leveraging claim attributes beyond value (LOB, complexity, completeness of documentation, claimant profile, geography)
Workload balancing algorithm to dynamically allocate claims based on adjuster availability, skill, and SLA requirements
Seamless Guidewire integration to present real-time routing decisions at FNOL.', 'Claims routing is still based on manual triage using value thresholds (<£10K hubs, £10–100K adjusters, >£100K major loss). This creates delays, inconsistent allocations, and inefficient resource use. Complex low-value claims may be mishandled, while simple higher-value claims consume adjuster capacity unnecessarily.', 'Gen AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (Commercial Property Loss Adjuster – highlighted inefficiencies in value-based triage).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium – recurring operational pain, but framed as an optimization rather than structural failure.', NULL, 'Faster, more accurate claim allocation
Better resource utilization → skilled adjusters focus on complex cases
Reduced cycle times and bottlenecks
Improved broker and customer experience through prompt assignment
Operational resilience during surge events (CAT claims).', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','existing triage rules engine.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.524000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.828Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.828Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.768Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.204519'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '716a4b30-63b0-44a1-ab28-c2e46814fa47', 'HEX_INT_025', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Auto-renewal “fast track” rules workbook', 'Convert the Excel-based rules into an embedded AI-enabled rules engine within/outside PAS
Automate the pass/fail logic and flag exceptions for manual review
Provide audit logging of rule application for compliance.', 'Renewal fast-tracking depends on a manual Excel workbook containing 7 underwriting rules. Underwriters/ops must export data, run checks in Excel, and re-key results into PAS/doc gen. This introduces errors, inconsistent application across users, and missed exceptions. Despite being stable and repeatable, the process remains manual, creating delays and leakage.', 'Prescriptive Rules Based', ARRAY['Underwriting']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'medium', 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Rachel (UK) (described fast-track rules workbook); underwriters and ops confirmed manual pain.', NULL, NULL, NULL, 'Backlog', 'CQE/CQA PAS, Excel (to be replaced), doc producer.', 'High – seen as strong ROI; repeatedly flagged as a quick win with structural benefits.', 'Faster renewals with less manual intervention.
Reduced leakage from missed exceptions or incorrect renewals.
Consistency across users; compliance via audit trail.
Improved scalability of renewal handling as book grows.', 'Faster renewals with less manual intervention
Reduced leakage from missed exceptions or incorrect renewals
Consistency across users; compliance via audit trail
Improved scalability of renewal handling as book grows.', NULL, NULL, ARRAY[]::text[], ARRAY['CQE/CQA PAS','Excel (to be replaced)','doc producer.']::text[], ARRAY['Underwriting Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.550000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.855Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.855Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.792Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.196515'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'c2ce8fdd-c13f-4f82-a9f5-0d9d27c09892', 'HEX_INT_026', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Loss Adjusters Manually Visit Sites, Document, and Upload Reports', 'AI-enabled image analytics to detect and classify damage from photos/videos
Drone and satellite remote sensing for inaccessible or high-risk sites
Mobile app with AI-powered auto-tagging and direct Guidewire/Claims Connect integration
Automated damage reports generated from evidence, reducing manual input.', 'Loss adjusters must manually travel to sites, capture photos and notes, and upload reports days later. This delays claim assessments, introduces inconsistency in reporting, and puts adjusters at risk in hazardous environments. Claims handlers and customers wait unnecessarily for decisions.', 'IoT + AI', ARRAY['Claims Management']::text[], ARRAY[]::text[], ARRAY['Property Owners','Commercial Property','Motor']::text[], ARRAY['All Segments']::text[], ARRAY[]::text[], 1, 3, 2, 2, 2, 1, 4, 5, 3, 1, 'false', 'low', 'false', 'true', 'true', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 2.0, 2.8, 'Experimental', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Head of Claims Operations', 'Field Operations Team', NULL, 'joint', 'Backlog', NULL, 'Medium–High – recognized as a strong efficiency and safety improvement.', NULL, 'Faster, more consistent assessments → reduced cycle times
Lower operational costs by minimizing unnecessary site visits
Safer working conditions for adjusters
Improved customer experience with quicker settlements
Scalability during surge events (e.g., floods, storms, catastrophes).', NULL, NULL, ARRAY[]::text[], ARRAY['Guidewire','Claims Connect','mobile survey apps','external imaging/remote sensing tools.']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-02-03 18:09:29.654000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"investment": {"currency": "GBP", "initialInvestment": 550000, "ongoingMonthlyCost": 15000}, "selectedKpis": ["ops_006", "ops_007"], "valueConfidence": {"rationale": "Field adoption challenges and training requirements", "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.5}, "calculatedMetrics": {"currentRoi": -67.82191780821918, "lastCalculated": "2026-02-03T18:16:56.586Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2029-04"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {"Claims Manager": 1}}, "vendor": {"total": 5, "byRole": {"UX Designer": 1, "Mobile Developer": 2, "Computer Vision Engineer": 2}}}, "planned": {"month6": {"client": 2, "vendor": 4}, "month12": {"client": 3, "vendor": 3}, "month18": {"client": 4, "vendor": 2}}}, "training": {"plannedCertifications": ["Mobile App Training", "AI Image Analysis"], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "selfSufficiencyTarget": {"targetDate": "2027-06", "advisoryRetainer": "false", "targetIndependence": 80}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:29.208452'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'f52c7259-840c-45a7-b74f-003bd5fcb566', 'HEX_INT_027', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Lack of Standardized Underwriting SOPs', 'GenAI ingestion and structuring of existing SOPs/documents
AI-assisted generation of standardized SOPs per LOB, aligned to corporate standards
Automated maintenance: system monitors regulatory/product changes and proposes SOP updates
Integration with underwriting platforms (PowerUp, PAS) to surface SOPs contextually during workflows.', 'Underwriting SOPs are fragmented across LOBs (Marine, Property, Aviation, Specialty). Current documentation is inconsistent, outdated, and scattered across shared drives. This creates onboarding challenges, inconsistent underwriting practices, and compliance risks. Andrew Hall is informally collecting SOPs but lacks a unified approach.', 'Gen AI', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andrew Hall (initiated SOP collection; suggested contacts like Toby and enterprise architects).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium – recognized by Andrew Hall as a need; seen as a strategic enabler but not yet prioritized against urgent ops issues.', NULL, 'Faster onboarding of underwriters; reduced training overhead
Consistency in underwriting across lines of business
Reduced compliance risk; stronger governance
Knowledge retention (avoids institutional knowledge loss)
Supports audit/regulatory reviews.', NULL, NULL, ARRAY[]::text[], ARRAY['SOP repositories (currently shared drives)','PowerUp dashboards','PAS','underwriting workflow tools.']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.587000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.900Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.900Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.829Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.630352'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9ab700fe-c0b1-4728-aff9-02422182b187', 'HEX_INT_028', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', ' Legacy Systems Overlap with Guidewire → Claims Routing by Product/LOB', 'AI/NLP classification of FNOL data to automatically identify correct product/LOB
Intelligent routing engine to send claim to Guidewire, legacy PAS, or external adjusters
API/middleware integration for bi-directional data sync between systems
Exception handling workflow for ambiguous claims
Handler-facing dashboard for routing transparency.', 'Claims handling is fragmented between Guidewire and legacy systems (FarmWeb, NIG, UKRIS). Handlers manually decide where to route new claims, causing errors, delays, and duplicated effort. Specialist lines (agriculture) often require external adjusters, but referrals are manual and inconsistent. Reporting and MI suffer due to siloed data.', 'Prescriptive Rules Based', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', NULL, 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (highlighted fragmented routing pain, esp. agriculture).', NULL, NULL, NULL, 'Backlog', NULL, 'Medium — recurring operational pain, particularly in specialist LOBs.', NULL, 'Faster, more accurate routing → reduced cycle times
Less manual effort for handlers/ops → focus on servicing customers
Improved customer/broker experience with quicker specialist allocation
Unified MI across systems → better risk/claims portfolio insight
Supports long-term transition to Guidewire by masking legacy complexity.', NULL, NULL, NULL, ARRAY['Guidewire Claims Center','FarmWeb','NIG','UKRIS','external adjuster platforms','routing middleware.']::text[], NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.563000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.869Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.869Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.805Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.643018'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '4c939a88-b15f-49db-be74-af5db4ba5d10', 'HEX_INT_029', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Limited predictive insight into claim lifecycle → AI Simulation Engine for Settlement Path', 'AI simulation engine that models possible settlement paths (cash vs repair vs replace)
Predictive recommendation based on historical cost, duration, and satisfaction data
Supplier availability/pricing integration to factor in real-time constraints
Feedback loop to refine predictions based on actual claim outcomes
Decision rationale logging for audit/compliance.', 'Claims handlers currently decide between cash settlements, repairs, or replacements without predictive tools. This leads to inconsistent outcomes, higher leakage, and uneven customer experience. Finance and audit lack transparency into decision rationale.', 'Predictive ML', ARRAY['Claims Management']::text[], ARRAY[]::text[], ARRAY['All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'medium', 'false', 'false', 'true', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Brown (highlighted inconsistent lifecycle outcomes and finance concerns).', NULL, NULL, NULL, 'Backlog', 'Guidewire Claims Center, finance/payment systems, supplier engagement platforms.', 'Medium — raised as a notable gap but framed as an opportunity for future predictive capability.', NULL, 'Reduced claim leakage by selecting optimal paths systematically
Faster, more consistent decision-making for handlers
Improved customer satisfaction with transparent, fair outcomes
Stronger finance/audit traceability
Better supplier engagement → reduced delays and inflated settlements.', NULL, NULL, ARRAY['Machine Learning','Predictive Analytics','Rule-based Systems']::text[], ARRAY['Guidewire Claims Center','finance/payment systems','supplier engagement platforms.','Claims Database','External APIs','Historical Data']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'XS', 9281, 18563, 2, 4, '1-2', 'assessment', NULL, '2026-01-29 07:56:32.598000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.933Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:50.933Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.6, "byRole": {}}, "vendor": {"total": 1.4, "byRole": {}}}, "planned": {"month6": {"client": 0.9, "vendor": 1.1}, "month12": {"client": 1.3, "vendor": 0.7}, "month18": {"client": 1.6, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 40, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:21.852Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "XS", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.622085'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'f04b9aff-218e-49ed-ae08-c75729138871', 'HEX_INT_030', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Conversational AI->High call volumes in contact center, manual QA of calls slow & inconsistent → AI Speech Analytics & Real-Time Support (part of this is already live)', '1) Real-time transcription for every call with live compliance prompts and agent assist
2) End-of-call AI summary and action capture immediately at wrap-up
3) Always-on QA (100% coverage) with alerts and coaching signals for supervisors.', 'Service – Telephony ACW – We have AI summarisation up and working in Call Miner already, there was a project at the start of the year to get this real time so they could use it for notes and save on after call work (ACW). This requires some change in Vodafone and the process had started but stalled. Claims have now assigned a PM to work on it to push through to get the benefit. There is a secondary benefit as it will do in call prompting aka ‘the broker said looking for advice on product coverage – direct to site XXX’. Contact centers handle high volumes with after-the-fact QA and no in-call assist. Although CallMiner + Microsoft Cognitive + Verint are already procured and the solution design exists, the program is not mobilized at scale; value is left on the table.', 'GenAI', ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Relationship Management','Issue Resolution','Service Delivery']::text[], ARRAY['All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 4, 2, 0, 0, 4, 'true', 'high', 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'Production', NULL, 'James (Jay) Gregory (Service & Ops).', 'Lisa Chen', 'James Gregory', 'Business Owner Review', 'Implemented', 'CallMiner (core), Microsoft Cognitive Services add-in, Verint (desktop/live prompts), contact center telephony & CRM.', 'Medium–High — “just needs mobilizing”; architecture and licenses are in place.', NULL, 'In-year: approx. 6–7 FTE benefit (transcript)
Next year: approx. 300–400k value (transcript; currency not specified)
Compliance assurance, improved CX, consistent service quality, and lower QA costs.', NULL, NULL, ARRAY['Natural Language Processing']::text[], ARRAY['CallMiner (core)','Microsoft Cognitive Services add-in','Verint (desktop/live prompts)','contact center telephony & CRM.','Customer Database','Policy Database','Claims Database']::text[], ARRAY['Customer Service','Compliance','IT/Technology']::text[], 'true', ARRAY['Content Management -Categorization, tagging, curation','Information Analysis (Synthesis, summarization)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'scale', NULL, '2025-09-03 17:12:28.629548', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.917Z", "kpiValues": {}, "investment": {"initialInvestment": 180000, "ongoingMonthlyCost": 12000}, "lastUpdated": "2026-02-03T14:22:50.917Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "fully_validated", "conservativeFactor": 0.9}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.597Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "scale", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002", "kt_003", "kt_004"], "inProgressMilestones": ["kt_005"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:28.629548'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '9f82c76f-6b5c-4bc7-816b-0f815e51f944', 'HEX_INT_031', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Customer Support AI Assistant (NLP Chatbot)', 'Customer Support Assistant Agents: Automate routine inquiries, policy details, claim status updates, and FAQs using NLP chatbots to provide 24/7 service support and freeing human agents. ', '1) Automate Routine Customer Interactions: Handle inquiries related to policy details, claim status, coverage information, billing, and FAQs to provide instant 24/7 responses, reducing wait times and improving customer satisfaction.
2) Free Up Human Agents: Enable human representatives to focus on complex cases and personalized service by offloading repetitive queries to AI agents.
3) Improve Customer Experience: Provide personalized recommendations, guided help through claims and renewals, and interactive assistance, promoting policyholder retention and trust.
4) Cost Efficiency: Reduce operational costs through automation of high-volume support tasks with consistent quality.', 'GenAI', ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK','Ireland']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'medium', 'false', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'Customer Servicing Manager', NULL, NULL, NULL, 'Backlog', 'All Customer Servicing applications', 'Q4 2025', NULL, NULL, NULL, 'Guidewire, PAS systems, Contact center systems', ARRAY['Machine Learning','Large Language Models','Natural Language Processing','Rule-based Systems']::text[], ARRAY['Claims Database','Policy Database','Customer Database']::text[], ARRAY['Customer Service']::text[], 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)','Information Analysis (Synthesis, summarization)']::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-01-29 07:56:33.269000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.673Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.673Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.9, "byRole": {}}, "vendor": {"total": 2.1, "byRole": {}}}, "planned": {"month6": {"client": 1.3, "vendor": 1.7}, "month12": {"client": 1.9, "vendor": 1.1}, "month18": {"client": 2.4, "vendor": 0.6}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 60, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.635Z", "derivedFrom": {"quadrant": "Experimental", "tomPhase": "assessment", "tShirtSize": "S", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-07-23", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:22.840322'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3e902b90-c3cd-4fc2-a541-d46f2aadb918', 'HEX_INT_032', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'AI-Driven Risk Monitoring and Early Warning System', 'This AI use case involves continuously monitoring insurance portfolios using machine learning and predictive analytics to identify emerging risks, unusual claim activity, or complex exposures that require early intervention despite their low immediate value. The AI system analyzes structured and unstructured data from multiple sources—claims, underwriting, external events, social signals—to detect patterns, anomalies, and trends that may predict future adverse outcomes or escalating risk profiles.', 'Insurers face difficulty in proactively identifying latent or evolving risks within large volumes of low-value policies or claims that are complex in nature. Traditional systems may overlook subtle signs of potential loss development, fraud, regulatory issues, or operational inefficiencies, leading to surprise financial impacts, increased reserves, delayed interventions, and reduced profitability.', NULL, ARRAY['Risk Consulting','Regulatory & Compliance']::text[], ARRAY['Risk Monitoring','Risk Evaluation']::text[], ARRAY['Specialty (E&S)','All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK','Ireland']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'high', 'false', 'true', 'true', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'industry_standard', NULL, NULL, NULL, 'Risk Services', NULL, NULL, NULL, 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['Machine Learning','Predictive Analytics']::text[], ARRAY['Claims Database','Broker Data & Feeds','Policy Database','Customer Database']::text[], ARRAY['Risk Management','Compliance','External Partners']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:33.258000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:51.654Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:51.654Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.1, "vendor": 2.9}, "month12": {"client": 2.9, "vendor": 2.1}, "month18": {"client": 3.5, "vendor": 1.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:22.622Z", "derivedFrom": {"quadrant": "Watchlist", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-12-20", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-03 17:12:22.841260'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '7ca1e712-f49a-4cef-88e7-84482736d278', 'HEX_INT_033', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'HR Data Lake/Warehouse Enablement', 'Consolidate HR data (people, roles, tenure, attendance, hires) into a governed store to enable analytics, KPI automation, and downstream AI.', 'Data fragmentation: HR data sits across multiple systems, making reporting slow and incomplete; need a data lake/warehouse for HR to enable analytics and AI on top.', 'Analytics & Insights', ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 3, 4, 0, 0, 3, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'PoC', NULL, 'Jess Jubb – HR/Transformation', 'Michelle Adams', 'Jess Jubb', 'AI Steering Committee', 'Discovery', 'AI readiness varies by function: HR systems are comparatively less advanced; pricing/data areas are further along.
HR platform: Intact uses Workday; RSA HR evaluating alignment. Decision expected by EOY/early next year; overall HR platform rollout targeted ~2026/27.', '2026/27', NULL, NULL, NULL, NULL, ARRAY['Predictive Analytics','Rule-based Systems']::text[], ARRAY['Historical Data','Third-party Data']::text[], NULL, 'true', ARRAY['Data Analysis - Augmentation, visualization','Information Analysis (Synthesis, summarization)','Workflow Improvements  - Suggestions for workflow amendments, automated changes to workflows']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'ideation', NULL, '2025-09-04 11:17:32.689369', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:50.104Z", "kpiValues": {}, "investment": {"initialInvestment": 280000, "ongoingMonthlyCost": 20000}, "lastUpdated": "2026-02-03T14:22:50.104Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.65}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.646Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "ideation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001"], "inProgressMilestones": ["kt_002"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 20}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 20}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:17:32.689369'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '05a60f99-478e-49db-8b13-b7c2f0f4d7cd', 'HEX_INT_034', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Semantic HR Policy Search & Q&A', 'Natural-language search over HR policies/intranet with retrieval-augmented answers and citations to the source documents.', 'Intranet/policy access: Current intranet search is clunky; employees struggle to find policy info without exact terms; better search/self-service needed.', 'GenAI', ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 4, 2, 0, 0, 4, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'PoC', NULL, 'Jess Jubb – HR/Transformation', 'Alex Wright', 'Jess Jubb', 'Business Owner Review', 'In-flight', 'Governance & access: ChatGPT access exists for some roles with mandatory training module and security policy; customer-facing areas restricted due to data sensitivity. Broader AI governance decisions pending.', NULL, NULL, NULL, NULL, NULL, ARRAY['Rule-based Systems','Large Language Models']::text[], ARRAY['Historical Data','Third-party Data']::text[], NULL, 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-04 11:20:31.295396', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.947Z", "kpiValues": {}, "investment": {"initialInvestment": 65000, "ongoingMonthlyCost": 5000}, "lastUpdated": "2026-02-03T14:22:49.947Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.75}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.673Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001"], "inProgressMilestones": ["kt_002"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 20}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 20}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:20:31.295396'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '6644ff7c-36dc-49f3-af87-888fbc0de5ff', 'HEX_INT_035', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Employee Self-Service Assistant', 'Guided workflows for common HR queries/tasks (leave, benefits, policy lookups) with guardrails; integrates with current intranet and future HR platform.', NULL, 'Conversational AI', ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Jess Jubb – HR/Transformation', NULL, NULL, NULL, 'Backlog', 'Governance & access: ChatGPT access exists for some roles with mandatory training module and security policy; customer-facing areas restricted due to data sensitivity. Broader AI governance decisions pending.', NULL, NULL, NULL, NULL, NULL, ARRAY['Natural Language Processing','Reinforcement Learning']::text[], NULL, NULL, 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:31.887000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.926Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.926Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.873Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:30:27.499273'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '70be09c6-10f1-4bc7-924b-7fa17aadd1ad', 'HEX_INT_036', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'HR Recruitment Flow Automation', 'Job req creation → screening → interview scheduling → offer steps orchestrated end-to-end; aligns with future ATS/Workday integration.', 'Recruitment: Today uses an external partner; considering future model (potentially in-house) and a slicker, end-to-end recruiting flow with new platform.', 'Process Automation', ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Jess Jubb – HR/Transformation', NULL, NULL, NULL, 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['Rule-based Systems']::text[], NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:31.876000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.905Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.905Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.859Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:33:08.027297'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '474840f3-8585-4902-924d-d4c8d43ae3c9', 'HEX_INT_037', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Workforce Insights & KPI Dashboards', 'Automated metrics: absence, tenure, office attendance compliance, internal vs external retention, skill gaps—driven from the HR data foundation.', 'Track HR KPIs (current/desired): Absence rates, tenure, office attendance compliance (return-to-office policy), skill gaps, internal vs external hire retention;', 'Analytics & Insights', ARRAY['Human Resources']::text[], ARRAY['Issue Resolution']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'false', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Jess Jubb – HR/Transformation', NULL, NULL, NULL, 'Backlog', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['Rule-based Systems']::text[], NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:31.864000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.885Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.885Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.844Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:35:32.730481'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'feb4dbdb-72ee-413b-b585-e02ab7c105ee', 'HEX_INT_038', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'AI Access Enablement & Governance (HR)', 'Role-based access to GenAI with embedded data-loss prevention, audit, and policy training completion checks.', 'Ensure these are addressed - Data sensitivity (PII) in HR and customer-facing domains; governance model and deployment pattern (cloud vs. on-prem/private) to be defined. Platform timing: Significant HR process re-work may align better with the new platform roll-out; risk of near-term duplicative effort.', 'GenAI', ARRAY['Human Resources']::text[], ARRAY[]::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'Pilot', NULL, 'Jess Jubb – HR/Transformation', 'Patricia Garcia', 'Jess Jubb', 'AI Steering Committee', 'In-flight', 'Governance & access: ChatGPT access exists for some roles with mandatory training module and security policy; customer-facing areas restricted due to data sensitivity. Broader AI governance decisions pending.
Change posture: Top-down remit to invest in AI is clear; general openness expected if benefits and safeguards are understood.', NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-04 11:37:32.342117', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.871Z", "kpiValues": {}, "investment": {"initialInvestment": 95000, "ongoingMonthlyCost": 8000}, "lastUpdated": "2026-02-03T14:22:49.871Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.7}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.697Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-04 11:37:32.342117'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'c2cb358a-313e-4e0a-8078-cd11115785e5', 'HEX_INT_039', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Call summarization for claims interactions', 'Handlers spend time reading long notes/emails and listening to calls to understand claim context. Manual note‑taking is inconsistent and delays response; difficult to surface status to customers quickly.', 'Use existing call transcription capability to generate concise call summaries, actions, and next steps. Auto‑attach summary to claim file and flag follow‑ups; surface status via customer/partner portal where applicable.', 'Conversational AI', ARRAY['Claims Management']::text[], ARRAY['First Notice of Loss (FNOL),First Report of Injury (FROI)','Claims Triage & Assessment']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK','United States']::text[], 3, 3, 3, 4, 4, 4, 3, 3, 3, 4, 'true', 'medium', 'false', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.4, 3.4, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'internal', NULL, 'Pilot', NULL, 'Vicky Walker (UK) & Andy Flower', 'Sarah Mitchell', 'Amanda Reenan', 'Business Owner Review', 'In-flight', 'Existing call‑transcription platform (Call Miner); Guidewire (claims notes/communications).', 'High — near‑term/tactical opportunity using existing transcripts.', 'Reduced average handling time; faster customer updates; improved consistency and auditability of notes; fewer hand‑offs and rework.', NULL, NULL, NULL, ARRAY['Large Language Models','Natural Language Processing','Rule-based Systems']::text[], ARRAY['Claims Database','Customer Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 10:02:55.731626', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.856Z", "kpiValues": {}, "investment": {"initialInvestment": 175000, "ongoingMonthlyCost": 12000}, "lastUpdated": "2026-02-03T14:22:49.856Z", "kpiEstimates": [{"kpiId": "cl_001", "kpiName": "FNOL Capture Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_002", "kpiName": "FNOL Data Completeness", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_003", "kpiName": "Self-Service FNOL Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_004", "kpiName": "Triage Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_005", "kpiName": "Auto-Triage Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_006", "kpiName": "Routing Efficiency", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_007", "kpiName": "Investigation Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_008", "kpiName": "Document Collection Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_009", "kpiName": "Fraud Detection Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_010", "kpiName": "Reserve Accuracy", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_011", "kpiName": "Initial Reserve Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_012", "kpiName": "Reserve Development Volatility", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_013", "kpiName": "Average Settlement Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_014", "kpiName": "Straight-Through Processing Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_015", "kpiName": "Payment Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_016", "kpiName": "Claims Severity", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_017", "kpiName": "Subrogation Identification Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_018", "kpiName": "Recovery Rate", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cl_019", "kpiName": "Recovery Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_001", "kpiName": "Model Accuracy Degradation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_002", "kpiName": "Prediction Confidence Distribution", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_003", "kpiName": "Inference Latency (p95)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_004", "kpiName": "Model Drift Detection Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_005", "kpiName": "Feature Importance Stability", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_006", "kpiName": "A/B Test Statistical Power", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_001", "kpiName": "Data Freshness Score", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_002", "kpiName": "Feature Store Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_003", "kpiName": "Feature Reuse Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_004", "kpiName": "Data Quality Score (DQS)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_005", "kpiName": "Data Pipeline SLA Adherence", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_006", "kpiName": "Schema Drift Incidents", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_001", "kpiName": "Technical Debt Ratio", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_002", "kpiName": "API Error Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_003", "kpiName": "Security Vulnerability Remediation Time", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_004", "kpiName": "Platform Currency Score", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_005", "kpiName": "Infrastructure Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_006", "kpiName": "Environment Parity", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_001", "kpiName": "AI Talent Retention Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_002", "kpiName": "Skill Gap Closure Velocity", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_003", "kpiName": "Knowledge Documentation Coverage", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_004", "kpiName": "Bus Factor Risk", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_005", "kpiName": "Team Utilization Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_006", "kpiName": "Internal Mobility/Growth", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_001", "kpiName": "Idea-to-PoC Conversion Rate", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_002", "kpiName": "PoC Cycle Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_003", "kpiName": "Experimentation Velocity", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_004", "kpiName": "Failed Experiment Learning Capture", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_005", "kpiName": "Innovation Funnel Health", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_006", "kpiName": "External Partnership Value", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_001", "kpiName": "Business Sponsor Satisfaction", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_002", "kpiName": "Strategic Priority Alignment", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_003", "kpiName": "Demand Backlog Age", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_004", "kpiName": "Stakeholder Engagement Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_005", "kpiName": "Value Realization Communication", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_006", "kpiName": "Executive Dashboard Access", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_001", "kpiName": "Hallucination Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_002", "kpiName": "Human Override Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_003", "kpiName": "Prompt Effectiveness Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_004", "kpiName": "Token Cost Efficiency", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_005", "kpiName": "Guardrail Trigger Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_006", "kpiName": "Context Window Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_007", "kpiName": "RAG Retrieval Precision", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_008", "kpiName": "Response Time SLA Compliance", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_001", "kpiName": "Cloud Cost Optimization", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_002", "kpiName": "Infrastructure Utilization", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_003", "kpiName": "Deployment Frequency", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_004", "kpiName": "Mean Time to Recovery (MTTR)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_005", "kpiName": "Change Failure Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_006", "kpiName": "Lead Time for Changes", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_001", "kpiName": "AI Security Incidents", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_002", "kpiName": "Privacy Compliance Rate", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_003", "kpiName": "Access Control Adherence", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_004", "kpiName": "Data Encryption Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_005", "kpiName": "Model Adversarial Testing", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_006", "kpiName": "PII Detection Coverage", "kpiType": "compliance", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_001", "kpiName": "AI-Assisted Resolution Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_002", "kpiName": "Self-Service Adoption Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_003", "kpiName": "Response Time Improvement", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_004", "kpiName": "Customer Effort Score (AI)", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_005", "kpiName": "First Contact Resolution (AI)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_006", "kpiName": "AI NPS Impact", "kpiType": "strategic", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_001", "kpiName": "Process Automation Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_002", "kpiName": "Straight-Through Processing Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_003", "kpiName": "Manual Intervention Reduction", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_004", "kpiName": "Exception Handling Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_005", "kpiName": "Predictive Accuracy (Operations)", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_006", "kpiName": "Resource Optimization Savings", "kpiType": "financial", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}], "selectedKpis": ["cl_001", "cl_003", "mp_002", "dq_004", "sh_002"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.8}, "calculatedMetrics": {"currentRoi": -26.36363636363636, "lastCalculated": "2026-02-03T16:03:23.357Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2027-07"}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.746Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 10:02:55.731626'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '3fc6b0f7-4aec-4de6-a9a1-1528f64e32b9', 'HEX_INT_040', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Predictive Total Loss (Motor) — next‑best‑action', 'Real‑time ML model combining handler inputs and external valuation signals to recommend repair/write‑off and next steps; surface guidance in‑flow.', 'Early decision on repair vs write‑off requires synthesizing handler inputs, vehicle data, and external valuations; manual assessment delays settlement and drives cost.', 'Predictive ML', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Andy Flower (UK)', NULL, NULL, NULL, 'Discovery', 'Guidewire (real‑time integration); external valuation services/feeds.', 'High — already live and central to Motor. (can extend to Commercial Lines)', 'Quicker settlements; reduced hire/storage costs; better indemnity control; improved customer experience.', NULL, NULL, NULL, ARRAY['Predictive Analytics']::text[], ARRAY['Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'ideation', NULL, '2026-01-29 07:56:31.850000', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.841Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.841Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.801Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "ideation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 10:34:08.244304'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '2c667373-aee6-4f86-aaed-5ad4fa242b29', 'HEX_INT_041', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Claims triage (Home & Commercial Property)', 'ML triage models at intake to route claims to appropriate paths (e.g., complexity bands, specialist teams).', 'High‑volume claims need consistent routing/severity estimation; manual triage leads to variability and delays.', 'Predictive ML', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'PoC', NULL, 'Andy Flower (UK).', 'Emma Richardson', 'Andy Flower', 'Business Owner Review', 'In-flight', 'Guidewire (FNOL/claim intake).', 'High — already in place; continue optimisation.', 'Improved throughput and SLA adherence; better matching of resource to complexity; reduced cycle times.', NULL, NULL, NULL, ARRAY['Rule-based Systems']::text[], ARRAY['Claims Database']::text[], ARRAY['Claims Teams']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 10:36:45.797595', NULL, NULL, 'low', 'false', 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.827Z", "kpiValues": {}, "investment": {"initialInvestment": 180000, "ongoingMonthlyCost": 12000}, "lastUpdated": "2026-02-03T14:22:49.827Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.65}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.444Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001"], "inProgressMilestones": ["kt_002"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 20}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 20}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 10:36:45.797595'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'fed6df03-36f7-4b38-b248-86207239c8eb', 'HEX_INT_042', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Recoveries / subrogation opportunity identification', 'Text analytics over claim notes and documents to flag potential recovery/subrogation leads and trigger workflows.', 'Signals for recovery/subrogation are scattered across notes and documents; missed opportunities reduce net recovery.', 'NLP', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 4, 3, 0, 0, 5, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'internal', NULL, 'Production', NULL, 'Andy Flower (UK)', 'Catherine Moore', 'Andy Flower', 'Business Owner Review', 'Implemented', 'Guidewire (claims data/notes); document analytics capability (Doc IQ/ Instabase).', 'Medium‑High — discussed as an active model and extension area.', 'Increased recovery yield; improved indemnity outcomes; better cash realisation.', NULL, NULL, NULL, ARRAY['Natural Language Processing','Large Language Models']::text[], ARRAY['Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'L', 371250, 603281, 16, 26, '5-10', 'scale', NULL, '2025-09-09 10:46:29.042754', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.813Z", "kpiValues": {}, "investment": {"initialInvestment": 150000, "ongoingMonthlyCost": 10000}, "lastUpdated": "2026-02-03T14:22:49.813Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "fully_validated", "conservativeFactor": 0.95}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 2.4, "byRole": {}}, "vendor": {"total": 5.6, "byRole": {}}}, "planned": {"month6": {"client": 3.8, "vendor": 4.2}, "month12": {"client": 5.8, "vendor": 2.2}, "month18": {"client": 7.2, "vendor": 0.8}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 160, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.546Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "scale", "tShirtSize": "L", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002", "kt_003", "kt_004"], "inProgressMilestones": ["kt_005"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 10:46:29.042754'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '51fcdcb3-08be-4b60-9269-6d1c06fa98a6', 'HEX_INT_043', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Coverage decision support at FNOL (data‑dependent)', 'Once policy data quality is improved, apply rules + ML to support early coverage validation and automated pathways; gate with confidence thresholds.', 'Early coverage decisions are constrained by policy data quality/integration; inconsistent decisions and low STP potential.', 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['First Notice of Loss (FNOL),First Report of Injury (FROI)','Claims Triage & Assessment']::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 3, 4, 0, 0, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'internal', NULL, 'Pilot', NULL, 'Andy Flower (UK) ', 'James Patterson', 'Amanda Reenan', 'AI Steering Committee', 'In-flight', 'Policy data sources: Guidewire claim intake; integration services.', 'Medium — identified as valuable but constrained by current data quality (Policy Data from PAS).', 'Fewer touchpoints; faster routing/settlement; higher straight‑through processing where safe.', NULL, NULL, NULL, ARRAY['Rule-based Systems']::text[], ARRAY['Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 11:36:08.821988', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.799Z", "kpiValues": {}, "investment": {"initialInvestment": 225000, "ongoingMonthlyCost": 18000}, "lastUpdated": "2026-02-03T14:22:49.799Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.65}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.769Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 11:36:08.821988'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '6c7534f6-f61a-465c-9ca8-cc6d6019e88a', 'HEX_INT_044', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Emerging risk signal detection from claims documents', 'NLP to mine documents/notes for new risk patterns and surface dashboards/alerts for operations and underwriting feedback loops.', 'Trends like ‘metal theft’ emerge in free‑text documents; lack of systematic detection delays response and pricing/claims actions.', 'NLP', ARRAY['Claims Management']::text[], ARRAY[]::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 'true', NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'Pilot', NULL, 'Andy Flower (UK)', 'Thomas Grant', 'Andy Flower', 'AI Working Group', 'In-flight', 'Document analytics (Doc IQ/Instabase); data warehouse/BI; Guidewire (as data source).', 'Medium — discussed as a beneficial extension of document AI.', 'Earlier detection of patterns; proactive mitigation guidance; potential loss avoidance.', NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 11:42:30.995982', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.786Z", "kpiValues": {}, "investment": {"initialInvestment": 95000, "ongoingMonthlyCost": 8000}, "lastUpdated": "2026-02-03T14:22:49.786Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.75}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.473Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 11:42:30.995982'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '828a3cf7-2a37-49a4-ac7a-c50277f636c0', 'HEX_INT_045', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Contact Centre Speech & Sentiment Analytics', 'Automated speech-to-text + NLP for sentiment/topic detection; benchmark UK’s use of speech analytics platforms; move from manual mining to continuous analytics', 'Calls are recorded but sentiment insights are “very manual”; need automated understanding of grievances/trends and ability to mine calls to spot shifts in customer sentiment and plan accordingly', NULL, ARRAY['Customer Servicing']::text[], ARRAY['Customer Support']::text[], ARRAY['Personal Lines (Ireland)']::text[], ARRAY['Ireland']::text[], ARRAY['Ireland']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Contact Centre', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, 'Elaine Robinson (via email) and Amanda Reenan', NULL, NULL, NULL, 'Backlog', 'Contact centre telephony/recordings; current (manual) speech analytics workflow', 'High — part of “Contact Centre of the Future” case for change (“digital when I want it, human when I need it”)', 'Earlier detection of issues; better planning/staffing; improved CX by acting on sentiment trends', NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:31.826000', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.774Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.774Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.733Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:01:58.514659'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'dfe9c524-4a70-44a5-815b-2e5b51ba470d', 'HEX_INT_046', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Customer 360 + Customer Lifetime Value & Next-Best-Action', 'CLV & propensity models; real-time segment inference at first contact; apply behavior-based segmentation across journeys', 'Data fragmented; policy number used as key instead of customer; moving to a single view and need models to predict retention/upsell/cross-sell and apply behavior segments at quote/call', 'Analytics & Insights', ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Account Management','Service Delivery']::text[], ARRAY['Personal Lines (Ireland)']::text[], ARRAY['Ireland']::text[], ARRAY['Ireland']::text[], 0, 0, 0, 0, 0, 3, 4, 0, 0, 3, 'false', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marketing', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'internal', NULL, 'Pilot', NULL, 'Elaine Robinson (via email) and Amanda Reenan', 'Olivia Barnes', 'Elaine Robinson', 'AI Steering Committee', 'In-flight', 'Customer 360 data store; quote journey; contact centre tooling', 'High — active consolidation to customer 360 and explicitly called out as a key need', 'Higher retention; better upsell/cross-sell; targeted acquisition for “customers who want to be with 123.ie”', NULL, NULL, NULL, ARRAY['Predictive Analytics']::text[], ARRAY['Customer Database','Policy Database','Third-party Data']::text[], ARRAY['IT/Technology','Business Analytics']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 12:10:53.058808', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.760Z", "kpiValues": {}, "investment": {"initialInvestment": 320000, "ongoingMonthlyCost": 22000}, "lastUpdated": "2026-02-03T14:22:49.760Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.6}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.498Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:10:53.058808'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'e51e98c2-f22b-48d6-b805-d40e324ec514', 'HEX_INT_047', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Document Processing & Centralised Document Management (ECM + APIs)', 'Implement/expand ECM (Hyland/Alfresco mentioned) with automation; add API layer so all PASs use a central doc hub; consider doc summarisation/RAG (“Doc IQ”)', 'Very paper-heavy; documentation is disjointed across multiple systems (esp. commercial with ~4 PAS). Desire to centralise doc management to reduce cost and speed customer packs/queries', NULL, ARRAY['Policy Servicing']::text[], ARRAY['Policy Issuance','Document Management','Contract Management']::text[], ARRAY['Personal Lines (Ireland)','All Commercial']::text[], ARRAY['Ireland']::text[], ARRAY['Ireland']::text[], 0, 0, 0, 0, 0, 4, 3, 0, 0, 4, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, 'Pilot', NULL, 'Amanda Reenan', 'Daniel Foster', 'Amanda Reenan', 'Business Owner Review', 'In-flight', 'ECM (Hyland/Alfresco); multiple commercial PAS; personal-lines PAS; API layer', 'High — called a “bigger problem” with cost-saving strategy; ECM is being implemented now', 'Faster turnaround; cost reduction; consistent “one view” of docs; central team can manage templates/changes once', NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 12:13:49.904852', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.747Z", "kpiValues": {}, "investment": {"initialInvestment": 240000, "ongoingMonthlyCost": 15000}, "lastUpdated": "2026-02-03T14:22:49.747Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.85}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.523Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:13:49.904852'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '22ae4421-76a0-4a6b-8c88-a0b91d886da2', 'HEX_INT_048', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Claims FNOL: Fault/Liability & Repair Cost Estimation', 'ML models in FNOL for liability/fault and cost estimation (write-off vs repairable)', 'Need rapid FNOL decisioning on fault/liability and total-loss vs repair; capability already implemented in the new system', NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], NULL, NULL, NULL, 0, 0, 0, 0, 0, 4, 3, 0, 0, 4, 'false', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, 'Governance gates passed - ready for portfolio tracking', 'Moved to library', 'internal', NULL, 'Pilot', NULL, 'Amanda Reenan', 'Michael Torres', 'Amanda Reenan', 'Business Owner Review', 'In-flight', 'FNOL/claims platform', 'In production (already implemented)', 'Faster, more consistent FNOL triage; better customer experience; improved cost control', NULL, NULL, NULL, ARRAY['Predictive Analytics']::text[], ARRAY['Claims Database']::text[], ARRAY['Claims Teams','Business Analytics']::text[], 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2025-09-09 12:15:56.809942', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.734Z", "kpiValues": {}, "investment": {"initialInvestment": 280000, "ongoingMonthlyCost": 18000}, "lastUpdated": "2026-02-03T14:22:49.734Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "valueConfidence": {"rationale": null, "adjustedValueGbp": null, "validationStatus": "pending_actuarial", "conservativeFactor": 0.8}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 469800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.395Z", "derivedFrom": {"quadrant": "Evaluate", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:15:56.809942'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'b30c4f4a-6898-4b6c-8557-e814877dcb9e', 'HEX_INT_049', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Fraud Analytics & Detection (Quote + Claims)', 'Combine vendor solution with internal analytics; behavioural signals during quote/journey; claims-side analytics; phased approach given skills/investment', 'Significant manual overhead handling fraud-related queries; want to flag behavioural fraud (e.g., online changes to selections); strategic programme underway; external solution likely near-term; own ML later', NULL, ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['Motor','Property Owners','Commercial Property']::text[], ARRAY['All Segments']::text[], ARRAY[]::text[], 4, 5, 5, 3, 5, 5, 4, 4, 4, 4, 'true', 'medium', 'false', 'false', 'true', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 4.4, 4.2, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, 'Moved to library', 'internal', NULL, 'Production', NULL, 'Head of Claims', 'Jennifer Walsh', 'Robert Kim', 'AI Working Group', 'Implemented', '123.ie online journey; claims fraud tools; data platform', 'High — “one of our strategic priorities”; project already stood up', 'Reduced manual effort; earlier fraud prevention; improved loss ratio and CX for genuine customers', NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'L', 371250, 603281, 16, 26, '5-10', 'scale', NULL, '2026-02-03 18:09:29.233000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"initialInvestment": 420000, "ongoingMonthlyCost": 35000}, "selectedKpis": ["fin_003", "ops_001", "comp_001"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "fully_validated", "conservativeFactor": 0.9}, "calculatedMetrics": {"currentRoi": -72.03571428571428, "lastCalculated": "2026-02-03T18:16:02.801Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2029-09"}, "phaseDefaultsApplied": "scale", "expectedValueRangeMax": 600000, "expectedValueRangeMin": 150000, "phaseDefaultsAppliedAt": "2026-02-03T18:09:29.233Z"}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 2.4, "byRole": {}}, "vendor": {"total": 5.6, "byRole": {}}}, "planned": {"month6": {"client": 3.8, "vendor": 4.2}, "month12": {"client": 5.8, "vendor": 2.2}, "month18": {"client": 7.2, "vendor": 0.8}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 160, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.419Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "scale", "tShirtSize": "L", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002", "kt_003", "kt_004"], "inProgressMilestones": ["kt_005"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:17:24.760634'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '428c6569-d69b-43c8-9e92-fbad5e20d3fd', 'HEX_INT_050', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Developer & Knowledge-Worker Productivity (Microsoft Copilot family)', 'Microsoft 365 Copilot and GitHub Copilot to assist coding and Office workflows; governed rollout within EU AI Act guardrails', 'Driving workstation efficiencies for end-users; Copilot being rolled out; also evaluating other Microsoft tech; engineering practices (CI/CD) already mature', NULL, ARRAY['General']::text[], ARRAY['Issue Resolution']::text[], ARRAY['Personal Lines (Ireland)','All Lines (CL,SL,Others)']::text[], ARRAY['Ireland','All Segments']::text[], ARRAY['Ireland','United States']::text[], 3, 3, 3, 3, 5, 4, 2, 3, 2, 4, 'true', 'low', 'false', 'true', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CIO', NULL, 3.4, 3.0, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', NULL, NULL, NULL, 'internal', NULL, 'Pilot', NULL, 'Amanda Reenan', 'Ryan Patterson', 'Amanda Reenan', 'AI Working Group', 'In-flight', 'Office 365 suite; developer toolchain (GitHub)', 'In rollout / Medium-High — already rolled out/under evaluation', 'Productivity gains for engineering and business users; faster delivery; standardized governance', NULL, NULL, 'Cross Enterprise Rollout', ARRAY['Large Language Models']::text[], ARRAY[]::text[], ARRAY['Distrbution (Broker) Teams','Underwriting Teams','Claims Teams','Customer Service','Actuarial','Risk Management','Compliance','Business Analytics','External Partners','IT/Technology']::text[], 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)','Code Development (Debugging, refactoring, coding)','Synthetic Data Generation - Text versions for analysis, time series data generation, scenario generation','Data Analysis - Augmentation, visualization']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 18:05:57.197000', NULL, NULL, 'low', 'false', 'complete', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.703Z", "kpiValues": {}, "investment": {"initialInvestment": 75000, "ongoingMonthlyCost": 15000}, "lastUpdated": "2026-02-03T14:22:49.703Z", "kpiEstimates": [], "selectedKpis": ["mp_001", "mp_002", "mp_006", "dq_002", "td_005"], "trackingEnabled": false, "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.8}, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": -28.000000000000004, "lastCalculated": "2026-02-03T18:18:59.142Z", "cumulativeValueGbp": 183600, "projectedBreakevenMonth": "2027-07"}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-04T09:33:10.622Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": ["kt_001", "kt_002"], "inProgressMilestones": ["kt_003"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 25}], "selfSufficiencyTarget": {"targetDate": "2027-04-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 25}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:18:50.889974'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '8b04814c-25e7-466c-b19f-17ae9314234c', 'HEX_INT_051', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Contact Centre Workforce Planning & Demand Forecasting (Sentiment-Driven)', 'Use call-level sentiment and external event features to forecast demand and guide staffing; dashboards for managers', 'Need to understand events driving sentiment changes and balance people across lines appropriately; current insight generation is manual', NULL, ARRAY['Customer Servicing']::text[], ARRAY['Customer Support','Service Delivery']::text[], ARRAY['Personal Lines (Ireland)']::text[], ARRAY['Ireland']::text[], ARRAY['Ireland']::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Contact Centre', NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, 'Moved to library', 'internal', NULL, NULL, NULL, 'Elaine Robinson (via email) and Amanda Reenan', NULL, NULL, NULL, 'Backlog', 'Contact centre data; planning/MI tools', 'High (within CC programme) — explicitly tied to planning need in the contact centre case for change', 'Better staffing/utilisation; reduced wait times; proactive service adjustments tied to sentiment trends', NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-01-29 07:56:31.806000', NULL, NULL, 'low', 'false', 'in_review', NULL, NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.683Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.683Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 367200, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.643Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-09-09 12:20:23.782763'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'dc04c7a3-747e-4d6a-bb36-f24ea7876b49', 'HEX_INT_052', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'LH Email Solution', 'The solution would probably include the following items:

•	Document Scanning and Analysis:
o	The system automatically scans a comprehensive library of plan benefit documents, identifying relevant sections and extracting critical information such as coverage details, eligibility criteria, and policy limits.
•	Natural Language Understanding:
o	Utilizing NLP algorithms, the system comprehends user queries in natural language, allowing users to ask questions in everyday terms. The AI can interpret intent and context, ensuring accurate and relevant responses.
•	Conversational Interface:
o	Users can interact with the system via a chat interface, making inquiries about specific benefits, coverage options, and claims processes. The AI responds with concise, easily understandable information, eliminating the need to sift through lengthy documents.
o	Applications would interact with the system via a flexible API 
•	Personalization and Context Awareness:
o	The system can tailor responses based on user profiles and previous interactions, providing a more personalized experience. It can also recognize follow-up questions, maintaining context throughout the conversation.
•	Continuous Learning:
o	The AI continually learns from user interactions and document updates, enhancing its accuracy and expanding its knowledge base over time', 'The Benefit Plan Documents for each of our clients are very detailed legal documents maintained by our Plan Build team.  These documents are complex, customized, and free form. They contain some details that are not captured in any system (including PowerSTEPP). There is a desire within the business to make this information more accessible to Customer Service, Claims, Data Analytics, as well as Clients / Members / Providers and other vendor partners. ', 'Agentic AI', ARRAY['Sales & Distribution (Including Broker Relationships)']::text[], ARRAY['Lead Generation']::text[], ARRAY[]::text[], ARRAY['UK Commercial Lines (Traded SME Channel)']::text[], ARRAY[]::text[], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0.0, 'Evaluate', NULL, NULL, NULL, NULL, NULL, 'false', 'false', 'reference', NULL, NULL, NULL, 'internal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Discovery', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'ideation', NULL, '2026-01-29 07:56:31.775000', NULL, NULL, 'low', 'false', 'none', NULL, NULL, 'approved', NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, 'approved', NULL, NULL, NULL, NULL, '2026-01-20 16:18:10.234000', NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.657Z", "kpiValues": {}, "investment": null, "lastUpdated": "2026-02-03T14:22:49.657Z", "kpiEstimates": [], "selectedKpis": [], "trackingEnabled": false, "validationStatus": "unvalidated", "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "totalEstimatedValue": {"max": 415800, "min": 0, "currency": "GBP"}, "confidenceAdjustment": null}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-01-29T08:58:20.627Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "ideation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-01", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-24", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2025-12-09 03:23:35.978106'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '297404e5-1e61-4ff5-861c-86fd3ee587d2', 'MKL_US_001', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Intelligent Intake Orchestrator Agent', 'Markel US: Agentic AI-powered email and document intake system that monitors Markel Claims inboxes (markelclaims@markel.com, newclaims@markel.com), automatically categorizes incoming correspondence, extracts key data points, classifies attached documents, and routes to appropriate downstream systems (ClaimCenter, ERMS, Legacy) based on claim number patterns and business rules.', 'Intake specialists manually manage multiple email inboxes, manually categorize correspondence, identify claim numbers, determine routing destination (ClaimCenter vs Legacy systems), and upload documents. This repetitive process consumes significant FTE time and introduces delays in claims processing.', 'Agentic AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering']::text[], ARRAY['All Lines (CL','SL','Others)']::text[], ARRAY['All Segments']::text[], ARRAY['US']::text[], 3, 3, 4, 4, 5, 3, 4, 3, 3, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.8, 3.2, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:29.745641', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', 'Finance', 'joint', 'Backlog', 'Microsoft Graph/Exchange API access; Guidewire ClaimCenter API; OnBase Unity integration; IDP platform for document extraction', '12-16 weeks', '40% reduction in manual email routing time; 95%+ email categorization accuracy; 30% faster document-to-claim linkage; Reduced intake backlog by 50%', NULL, NULL, 'Microsoft Outlook/Exchange, Guidewire ClaimCenter API, OnBase Unity, Legacy system connectors (SNP, ImageWrite)', ARRAY['Large Language Models','Natural Language Processing','Machine Learning','Rule-based Systems']::text[], ARRAY['Email Systems (Outlook/Exchange)','Claims Database','Policy Database','OnBase Unity']::text[], ARRAY['Claims Teams','Customer Service','External Partners','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 16:42:22.538000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 876000, "ongoingMonthlyCost": 56788}, "selectedKpis": ["cl_001", "cl_002", "cl_003", "mp_006", "dq_002", "cl_008"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.85}, "calculatedMetrics": {"currentRoi": -84.91771196104416, "lastCalculated": "2026-02-03T16:44:50.763Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2032-10"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 5, "byRole": {}}, "vendor": {"total": 5, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "selfSufficiencyTarget": {"targetDate": "", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 45}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:29.745641'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '6722185a-8b24-4b58-9130-b22b50ce1f76', 'MKL_US_002', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - FNOL Intelligent Claim Creation Agent', 'Markel US: Automated FNOL processing agent that receives new loss notifications via email, extracts claimant information, policy details, and loss details from emails and attachments, validates against ClaimCenter policy records, creates claims with minimum required data, moves to appropriate queues (New Claims/Correction), and generates acknowledgment responses.', 'FNOL processing requires technicians to manually read emails, extract data from documents, search policies in ClaimCenter, verify coverage, create claims, and route to appropriate queues. Manual data entry leads to errors and delays in claim setup.', 'Agentic AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['All Lines (CL','SL','Others)','Property Owners','Workers Compensation','Specialty (E&S)']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.0, 3.0, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.069801', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', 'Finance', 'joint', 'Backlog', 'Guidewire ClaimCenter API availability; IDP platform with 98%+ OCR accuracy; Email system API access; Test data availability', '16-24 weeks', '50% reduction in FNOL setup time; 98% data extraction accuracy; 30% reduction in correction queue volume; Improved SLA adherence for FNOL processing', NULL, NULL, 'Guidewire ClaimCenter API, Microsoft Outlook/Exchange, IDP Platform, Legacy system lookup (SNP)', ARRAY['Large Language Models','Natural Language Processing','Intelligent Document Processing','Predictive Analytics']::text[], ARRAY['Email Systems','Claims Database','Policy Database','Document Management System']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 17:53:37.859000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 250000, "ongoingMonthlyCost": 2000}, "selectedKpis": ["cl_001", "cl_002", "cl_003", "mp_006", "dq_002", "cl_007", "cl_006"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.85}, "calculatedMetrics": {"currentRoi": -14.27007299270073, "lastCalculated": "2026-02-03T17:53:37.919Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2027-04"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.4, "vendor": 2.6}, "month12": {"client": 3.6, "vendor": 1.4}, "month18": {"client": 4.5, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T17:53:37.905Z", "derivedFrom": {"quadrant": "Strategic Bet", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-04-29", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.069801'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '90651b45-14a3-4c60-81d9-6db262436ce8', 'MKL_US_003', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - FROI Workers Compensation Claim Agent', 'Markel US: Specialized agentic workflow for First Report of Injury (FROI) processing in Maveric system. Agent reads FROI emails, extracts employee injury details, validates policy and employer information, creates claims in Maveric with body diagram mapping, captures witness/contact details, uploads FROI documents, and notifies appropriate adjusters.', 'FROI processing involves complex data extraction from injury reports, demographic and employment information entry, body part injury mapping, narrative documentation, and multi-step claim creation in Maveric. Manual processing is time-intensive and error-prone.', 'Agentic AI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['Workers Compensation']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 'true', 'medium', 'false', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 4.0, 3.2, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.249848', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennnis', 'Maren Dennis', 'Finance', 'joint', 'In-flight', 'Maveric API or RPA access; FROI form template recognition; Email API access; Body diagram digitization', '16-20 weeks', '45% reduction in FROI processing time; 95%+ injury detail extraction accuracy; Faster adjuster assignment; Reduced data entry errors by 60%', NULL, NULL, 'Maveric Claims System, Microsoft Outlook/Exchange, IDP Platform, Policy Verification Systems', ARRAY['Large Language Models','Natural Language Processing','Intelligent Document Processing','Rule-based Systems']::text[], ARRAY['Email Systems','Maveric Claims Database','Policy Database','FROI Forms']::text[], ARRAY['Claims Teams','Business Analytics','IT/Technology','External Partners']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 17:00:21.640000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 750000, "ongoingMonthlyCost": 5000}, "selectedKpis": ["cl_001", "cl_002", "cl_003", "mp_006", "dq_002"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.85}, "calculatedMetrics": {"currentRoi": -71, "lastCalculated": "2026-02-03T18:00:16.054Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2029-08"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 2, "byRole": {}}, "vendor": {"total": 6, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "independenceHistory": [{"date": "2026-02", "note": "Phase default applied for foundation", "percentage": 15}], "phaseDefaultsApplied": "foundation", "selfSufficiencyTarget": {"targetIndependence": 35}, "independencePercentage": 15, "phaseDefaultsAppliedAt": "2026-02-03T17:00:21.640Z"}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.249848'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'cba0d42f-0f14-466a-8cef-79be2ccb941c', 'MKL_US_004', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Document Classification & Intelligent Extraction Agent', 'Markel US: IDP-powered agent that automatically classifies incoming documents (police reports, medical records, legal documents, invoices, correspondence) and extracts structured data including claim numbers, policy numbers, dates of loss, claimant information, injury details, and financial amounts with 98%+ accuracy threshold.', 'Documents arrive in various formats (PDF, images, faxes) and require manual classification and data extraction. Technicians spend significant time identifying document types and manually keying data into claims systems. OCR accuracy below 98% requires human review.', 'NLP', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering']::text[], ARRAY['All Lines (CL','SL','Others)','All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 4, 4, 4, 4, 4, 4, 4, 3, 2, 4, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 4.0, 3.4, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.264705', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', NULL, 'joint', 'In-flight', 'IDP platform selection; Document template training; Integration with OnBase Unity; Sample document corpus for training', '8-12 weeks', '98%+ classification accuracy; 95%+ data extraction accuracy; 60% reduction in manual indexing time; Zero tolerance for misclassified legal documents', NULL, NULL, 'OnBase Unity, Guidewire ClaimCenter, Email Systems, Fax-to-Email Gateway', ARRAY['Natural Language Processing','Machine Learning','Intelligent Document Processing','Computer Vision']::text[], ARRAY['Document Management System','Email Attachments','Fax Systems','Claims Database']::text[], ARRAY['IT/Technology','Claims Teams']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 17:32:10.035000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "selectedKpis": [], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}, "phaseDefaultsApplied": "foundation", "expectedValueRangeMax": 100000, "expectedValueRangeMin": 25000, "phaseDefaultsAppliedAt": "2026-02-03T17:32:10.035Z"}'::jsonb, '{"staffing": {"current": {"client": {"total": 2, "byRole": {}}, "vendor": {"total": 6, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "independenceHistory": [{"date": "2026-02", "note": "Phase default applied for foundation", "percentage": 15}], "phaseDefaultsApplied": "foundation", "selfSufficiencyTarget": {"targetIndependence": 35}, "independencePercentage": 15, "phaseDefaultsAppliedAt": "2026-02-03T17:32:10.035Z"}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.264705'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '4468a7ca-2c42-4526-9235-a88715075df8', 'MKL_US_005', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Examiner Letter Generation Agent', 'Markel US: GenAI-powered correspondence generation system that automatically creates coverage letters, reservation of rights letters, denial letters, acknowledgment letters, and general correspondence based on claim data, policy terms, and predefined templates. Letters are formatted via SendPro and routed for examiner review before dispatch.', 'Examiners spend significant time drafting routine correspondence letters. Each letter requires gathering claim data, policy information, and coverage details, then formatting according to templates. High letter volume creates bottlenecks in claim processing.', 'GenAI', ARRAY['Claims Management']::text[], ARRAY['Claims Adjudication','Issue Resolution']::text[], ARRAY['All Lines (CL','SL','Others)','Workers Compensation','Specialty (E&S)']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 3, 3, 4, 4, 4, 3, 2, 1, 1, 5, 'true', 'none', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.6, 2.4, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.270753', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', 'Finance', 'joint', 'In-flight', 'Letter template library; SendPro integration; Claims data API access; Legal/compliance review workflow', '8-12 weeks', '50% reduction in letter drafting time; 90%+ first-draft acceptance rate; Consistent letter quality; Reduced compliance issues from letter content', NULL, NULL, 'Guidewire ClaimCenter, SendPro, Policy Database, Email Systems', ARRAY['Large Language Models','Natural Language Processing','Rule-based Systems']::text[], ARRAY['Claims Database','Policy Database','Letter Templates','Coverage Forms']::text[], ARRAY[]::text[], 'true', ARRAY['Content Generation - Document drafting, report generation','Content Management -Categorization, tagging, curation','AI Assistant—Automation (Autofill, next-best action suggestions, autonomous agents)','Information Analysis (Synthesis, summarization)']::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'foundation', NULL, '2026-02-03 17:49:36.477000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 234000, "ongoingMonthlyCost": 3400}, "selectedKpis": ["cl_001", "cl_002", "cl_003", "mp_006", "dq_002", "cl_004", "cl_005"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.85}, "calculatedMetrics": {"currentRoi": -14.519650655021834, "lastCalculated": "2026-02-03T19:10:46.576Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2027-05"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 3, "byRole": {}}, "vendor": {"total": 4, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "selfSufficiencyTarget": {"targetDate": "", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 43}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.270753'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'effec591-a611-4d11-a970-4eef27bf205b', 'MKL_US_006', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Document Archival Automation Agent', 'Markel US: Low-complexity automation agent that monitors designated folders for completed documents, extracts claim numbers from document content, validates against ClaimCenter, and automatically uploads documents to the appropriate claim file with correct document type classification and metadata.', 'After generating acknowledgment letters and other correspondence, documents must be manually archived to ClaimCenter. Technicians spend time locating claim numbers, navigating to correct claim files, and uploading with appropriate categorization.', 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['Investigation & Evidence Gathering']::text[], ARRAY['All Lines (CL','SL','Others)','All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 3, 3, 3, 3, 4, 3, 3, 3, 2, 4, 'true', 'low', 'false', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.2, 3.0, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.277241', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', NULL, 'joint', 'Backlog', 'Guidewire ClaimCenter Document API; Folder monitoring capability; Document type mapping configuration', '4-6 weeks', '90% reduction in manual archival time; 100% document traceability; Zero misfiled documents; Same-day archival completion', NULL, NULL, 'Guidewire ClaimCenter API, File System/Folder Watcher, OnBase Unity', ARRAY['Natural Language Processing','Rule-based Systems']::text[], ARRAY['Document Folders','Claims Database']::text[], ARRAY['Claims Teams','IT/Technology']::text[], 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)','Content Management -Categorization, tagging, curation','Information Analysis (Synthesis, summarization)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 17:29:23.294000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "selectedKpis": [], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {}}, "vendor": {"total": 4, "byRole": {}}}}, "independenceHistory": [{"date": "2026-02", "note": "Phase default applied for assessment", "percentage": 5}], "phaseDefaultsApplied": "assessment", "selfSufficiencyTarget": {"targetIndependence": 20}, "independencePercentage": 5, "phaseDefaultsAppliedAt": "2026-02-03T17:29:23.294Z"}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.277241'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '06d7f731-4a7c-4787-8e6a-48c991f360a0', 'MKL_US_007', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Policy Attachment Agent', 'Markel US: Agent that monitors ClaimCenter queue for policy attachment tasks, searches for policy documents in ImageWrite or other legacy document repositories, validates that the policy belongs to Markel (vs. external/affiliate), downloads the policy document, and attaches it to the claim in ClaimCenter with appropriate metadata.', 'Attaching policies to claims requires manual search across multiple legacy systems (ImageWrite, other document repositories), verification of Markel policy ownership, document download, and upload to ClaimCenter. This multi-system navigation is time-consuming.', 'Agentic AI', ARRAY['Claims Management']::text[], ARRAY['Investigation & Evidence Gathering','Claims Adjudication']::text[], ARRAY['All Lines (CL','SL','Others)','Property Owners']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.0, 2.4, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.286712', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren dennis', NULL, 'joint', 'Backlog', 'ImageWrite API or RPA access; ClaimCenter queue API; Policy ownership verification rules; Legacy system connectivity', '8-12 weeks', '70% reduction in policy attachment time; 100% accuracy in Markel policy identification; Reduced queue backlog by 60%', NULL, NULL, 'Guidewire ClaimCenter, ImageWrite, Legacy Policy Systems, OnBase Unity', ARRAY['Rule-based Systems','Natural Language Processing']::text[], ARRAY['Claims Database','Policy Database','ImageWrite','Legacy Document Systems']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'S', 37125, 74250, 4, 8, '2-4', 'assessment', NULL, '2026-02-03 17:11:39.048000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "selectedKpis": [], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 0.9, "byRole": {}}, "vendor": {"total": 2.1, "byRole": {}}}, "planned": {"month6": {"client": 1.7, "vendor": 1.3}, "month12": {"client": 2.7, "vendor": 0.3}, "month18": {"client": 3.4, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 60, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T17:12:55.572Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "S", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.286712'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '69113b0a-dfeb-4540-9bab-2b55739af09c', 'MKL_US_008', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US- Marsh Partner Data Exchange Agent', 'Markel US: Automated data exchange agent that processes Excel input files from Marsh containing claim inquiries, extracts claimant names, policy numbers, and dates of loss, cross-references with stored claim data, retrieves required information, populates response Excel files, and sends updated files back to Marsh via email.', 'Marsh sends Excel files requiring claim data updates. Technicians manually process each row, look up claim details in multiple systems, populate response columns, and return completed files. This batch processing is repetitive and time-sensitive.', 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['Issue Resolution','Service Delivery']::text[], ARRAY['All Lines (CL','SL','Others)']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 4, 4, 4, 5, 4, 3, 2, 3, 3, 4, 'true', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Operations', NULL, 4.2, 3.0, 'Strategic Bet', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.294100', NULL, NULL, 'internal', NULL, NULL, NULL, 'Marsh Admin', 'Marsh Admin', 'Finance', 'joint', 'Backlog', 'Marsh file format standardization; Claims database API access; Email automation capability; Data mapping configuration', '6-10 weeks', '80% reduction in manual data reconciliation time; Same-day response to Marsh inquiries; 99%+ data accuracy; Improved partner satisfaction', NULL, NULL, 'Microsoft Outlook/Exchange, Claims Database, Policy Database, Excel Processing', ARRAY['Rule-based Systems','Machine Learning']::text[], ARRAY['Email Systems','Claims Database','Policy Database','Partner Files']::text[], ARRAY[]::text[], 'true', ARRAY['AI Assistant—Knowledge Source (Research assistant, information retrieval)']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 16:18:00.774000', 'Move to Backlog', NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 876000, "ongoingMonthlyCost": 344}, "selectedKpis": ["cl_001", "cl_003", "mp_006", "dq_002", "cl_002", "cl_005"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.9}, "calculatedMetrics": {"currentRoi": -73.3107002617801, "lastCalculated": "2026-02-03T18:39:47.088Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2029-11"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {}}, "vendor": {"total": 4, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "independenceHistory": [{"date": "2026-02", "note": "Phase default applied for assessment", "percentage": 5}], "phaseDefaultsApplied": "assessment", "selfSufficiencyTarget": {"targetIndependence": 20}, "independencePercentage": 5, "phaseDefaultsAppliedAt": "2026-02-03T16:18:00.774Z"}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.294100'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '780586f3-9aa1-466c-b5ff-5326027a2c6e', 'MKL_US_009', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Cyber & Time-Sensitive Claims Priority Agent', 'Markel US: AI-powered priority detection agent that identifies cyber claims, catastrophe-related claims, and other time-sensitive loss notifications, applies special labeling, triggers priority workflows, sends immediate alerts to designated handlers, and ensures accelerated processing paths.', 'Cyber claims and time-sensitive matters require immediate attention but may be mixed with routine correspondence. Delayed identification can result in SLA breaches, regulatory issues, and customer dissatisfaction.', 'GenAI', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment']::text[], ARRAY['Cyber','All Lines (CL','SL','Others)','All Commercial']::text[], ARRAY['All Segments']::text[], ARRAY['US','United States']::text[], 3, 2, 3, 3, 3, 2, 2, 4, 4, 3, 'true', 'high', 'false', 'true', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 2.8, 3.0, 'Watchlist', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.300726', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', 'Cat Risk Team', 'business_led', 'Backlog', 'Priority claim classification rules; Alert notification system; Handler assignment rules; Integration with intake workflow', '4-8 weeks', '100% cyber claim identification within 1 hour; Zero missed time-sensitive claims; Improved SLA adherence for priority claims; 50% faster priority claim initiation', NULL, NULL, 'Email Systems, Guidewire ClaimCenter, Alert/Notification System, Intake Orchestrator', ARRAY['Large Language Models','Rule-based Systems','Predictive Analytics','Reinforcement Learning']::text[], ARRAY['Email Systems','Claims Database','Third-party Data','Real-time Feeds','Historical Data']::text[], ARRAY['Actuarial','Risk Management']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 16:55:43.084000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 4567000, "ongoingMonthlyCost": 56666}, "selectedKpis": ["cl_001", "cl_002", "cl_003", "mp_006", "dq_002"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 0.85}, "calculatedMetrics": {"currentRoi": -95.5231492634256, "lastCalculated": "2026-02-03T16:56:14.455Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2048-07"}}'::jsonb, '{"staffing": {"current": {"client": {"total": 1, "byRole": {}}, "vendor": {"total": 4, "byRole": {}}}, "planned": {"month6": {"client": 0, "vendor": 0}, "month12": {"client": 0, "vendor": 0}, "month18": {"client": 0, "vendor": 0}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 0, "totalTrainingHoursCompleted": 0}, "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": []}, "independenceHistory": [{"date": "2026-02", "note": "Phase default applied for assessment", "percentage": 5}], "phaseDefaultsApplied": "assessment", "selfSufficiencyTarget": {"targetIndependence": 20}, "independencePercentage": 5, "phaseDefaultsAppliedAt": "2026-02-03T16:55:43.084Z"}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.300726'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'c621e33a-641d-4864-a11f-2e946d8309db', 'MKL_US_010', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US- Legal Document Identification & Escalation Agent', 'Markel US: AI agent that scans all incoming documents and correspondence to identify legal documents (subpoenas, summons, suits, complaints) that name Markel or its affiliates, applies appropriate legal flags, and automatically escalates to Associate General Counsel with relevant claim context.', 'Legal documents require immediate identification and proper escalation to legal counsel. Missed or delayed identification of subpoenas and suits can result in default judgments and significant financial exposure.', 'NLP', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment','Investigation & Evidence Gathering']::text[], ARRAY['All Lines (CL','SL','Others)']::text[], ARRAY['All Segments']::text[], ARRAY['US']::text[], 4, 3, 4, 4, 4, 2, 3, 3, 2, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.8, 2.6, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.308631', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', NULL, 'joint', 'Backlog', 'Legal document template training; Escalation workflow configuration; General Counsel notification integration; Markel entity recognition', '8-12 weeks', '100% legal document identification; Zero missed subpoenas or suits; Same-day escalation to legal; Reduced legal exposure risk', NULL, NULL, 'OnBase Unity, Email Systems, Guidewire ClaimCenter, Legal Case Management', ARRAY['Natural Language Processing','Large Language Models','Machine Learning']::text[], ARRAY['Document Management System','Email Systems','Claims Database']::text[], ARRAY['IT/Technology','Compliance','Risk Management']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 16:21:36.016000', 'Move to Assessment', NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "selectedKpis": [], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T18:36:34.621Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.308631'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    '62d0ff65-7bcb-4d56-a7d9-ef0bd36ca780', 'MKL_US_011', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US- Affiliate Correspondence Routing Agent', 'Markel US: Intelligent routing agent that identifies correspondence belonging to Markel affiliates (Hagerty, MINT, Markel Canada, State National) and automatically forwards to appropriate affiliate email addresses, preventing manual re-routing and ensuring proper handling by the correct entity.', 'Affiliate correspondence frequently arrives in Markel Claims inboxes and requires manual identification and forwarding to correct affiliate addresses. Misrouted correspondence delays claim handling and creates customer confusion.', 'Process Automation', ARRAY['Claims Management']::text[], ARRAY['Claims Triage & Assessment']::text[], ARRAY['All Lines (CL','SL','Others)']::text[], ARRAY['All Segments']::text[], ARRAY['US','Canada']::text[], 3, 3, 4, 3, 4, 3, 3, 1, 3, 4, 'true', 'medium', 'true', 'false', 'false', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 3.4, 2.8, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.313040', NULL, NULL, 'internal', NULL, NULL, NULL, 'Maren Dennis', 'Maren Dennis', 'Finance', 'joint', 'Backlog', 'Affiliate policy identification rules; Email forwarding configuration; Policy database access for affiliate verification', '4-6 weeks', '95%+ affiliate identification accuracy; Same-day routing to affiliates; 80% reduction in manual forwarding; Improved affiliate satisfaction', NULL, NULL, 'Microsoft Outlook/Exchange, Policy Database, Affiliate Email Systems', ARRAY['Natural Language Processing','Rule-based Systems']::text[], ARRAY['Email Systems','Policy Database']::text[], ARRAY[]::text[], 'true', ARRAY['Content Management -Categorization, tagging, curation','Detection Models  - Errors, fraud, problem-solving']::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 16:13:42.372000', 'Want to move this use case to backlog', NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 650000, "ongoingMonthlyCost": 3444}, "selectedKpis": ["cl_003", "mp_006", "dq_002", "cl_001", "cl_002"], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "pending_finance", "conservativeFactor": 0.8}, "calculatedMetrics": {"currentRoi": -66.02191723754859, "lastCalculated": "2026-02-03T16:25:01.107Z", "cumulativeValueGbp": 234900, "projectedBreakevenMonth": "2029-02"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T16:25:01.089Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.313040'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'f30eb5e4-517a-497a-beb6-b6bb41619f42', 'MKL_US_012', '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Markel US - Claims Payment Processing Assistant', 'Markel US: AI-assisted payment processing agent that reads payment request spreadsheets, identifies claim source system (ERMS, Primis, FAA, Maveric), retrieves claim and vendor details, verifies reserve amounts and payment history, validates against duplicate payments, and prepares payment transactions for approval.', 'Payment processing requires technicians to navigate multiple systems (Legal Exchange, Primis, Maveric) based on claim type, verify payment history, check reserves, and ensure no duplicate payments. System switching and manual verification is time-intensive.', 'Agentic AI', ARRAY['Claims Management']::text[], ARRAY['Claims Adjudication','Payment Processing']::text[], ARRAY['All Lines (CL','SL','Others)']::text[], ARRAY['All Segments']::text[], ARRAY['US']::text[], 2, 3, 3, 2, 3, 2, 4, 3, 3, 3, 'true', 'medium', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claims', NULL, 2.6, 3.0, 'Watchlist', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 15:00:30.318714', NULL, NULL, 'internal', NULL, NULL, NULL, 'Test Owner', 'Test Delivery', NULL, 'business_led', 'Backlog', 'Multi-system API access (ERMS, Primis, Maveric); Payment approval workflow; Reserve validation rules; Vendor database integration', '12-18 weeks', '40% reduction in payment processing time; Zero duplicate payments; 100% reserve verification; Improved payment accuracy', NULL, NULL, 'ERMS, Primis, Maveric, Legal Exchange, Payment Processing Systems', ARRAY['Rule-based Systems','Machine Learning','Natural Language Processing']::text[], ARRAY['Claims Database','Payment Systems','Vendor Database','Reserve Data']::text[], ARRAY[]::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'assessment', NULL, '2026-02-03 17:24:39.322000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"investment": {"currency": "GBP", "initialInvestment": 0, "ongoingMonthlyCost": 0}, "selectedKpis": [], "valueConfidence": {"rationale": null, "lastValidatedAt": null, "lastValidatedBy": null, "adjustedValueGbp": null, "validationStatus": "unvalidated", "conservativeFactor": 1}, "calculatedMetrics": {"currentRoi": null, "lastCalculated": null, "cumulativeValueGbp": null, "projectedBreakevenMonth": null}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.1, "vendor": 2.9}, "month12": {"client": 2.9, "vendor": 2.1}, "month18": {"client": 3.5, "vendor": 1.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T17:26:01.231Z", "derivedFrom": {"quadrant": "Watchlist", "tomPhase": "assessment", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2027-12-25", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 15:00:30.318714'
);

INSERT INTO use_cases (
    id, meaningful_id, engagement_id, title, description, problem_statement, use_case_type,
    processes, activities, lines_of_business, business_segments, geographies,
    revenue_impact, cost_savings, risk_reduction, broker_partner_experience, strategic_fit,
    data_readiness, technical_complexity, change_impact, model_risk, adoption_readiness,
    explainability_required, customer_harm_risk, data_outside_uk_eu, third_party_model, human_accountability,
    regulatory_compliance, ai_or_model, risk_to_customers, risk_to_rsa, data_used, model_owner,
    rsa_policy_governance, validation_responsibility, informed_by, business_function, third_party_provided_model,
    impact_score, effort_score, quadrant, recommended_by_assessment,
    manual_impact_score, manual_effort_score, manual_quadrant, override_reason,
    is_active_for_rsa, is_dashboard_visible, library_tier, activation_date, activation_reason, deactivation_reason, library_source,
    ai_inventory_status, deployment_status, last_status_update,
    primary_business_owner, delivery_owner, value_validator, value_governance_model,
    use_case_status, key_dependencies, implementation_timeline, success_metrics, estimated_value,
    value_measurement_approach, integration_requirements, ai_ml_technologies, data_sources, stakeholder_groups,
    horizontal_use_case, horizontal_use_case_types,
    presentation_file_id, presentation_pdf_file_id, presentation_file_name, presentation_uploaded_at, has_presentation,
    t_shirt_size, estimated_cost_min, estimated_cost_max, estimated_weeks_min, estimated_weeks_max, team_size_estimate,
    tom_phase, tom_phase_override, phase_entered_at, last_phase_transition_reason, tom_override_reason,
    rai_risk_tier, rai_assessment_required,
    governance_status, legacy_activation_flag, governance_pending_reason,
    operating_model_approval, operating_model_approved_at, operating_model_approved_by, operating_model_notes,
    intake_decision, intake_decision_at, intake_decision_by, intake_decision_notes, intake_priority_rank,
    rai_assurance, rai_assurance_at, rai_assurance_by, rai_assurance_notes, rai_risk_level,
    governance_completed_at, governance_completed_by,
    value_realization, capability_transition,
    duplicate_status, duplicate_similar_to, duplicate_similarity_score, duplicate_reviewed_at, duplicate_reviewed_by,
    created_at
) VALUES (
    'af938386-5ec0-4316-9402-f8fcc14f96e3', NULL, '93dbeac0-58c3-41a0-9d6b-affbfe0be923-eng', 'Enter-once automation for underwriter data (Straight through processing)', 'AI-enabled automation / RPA for "enter once, feed many" workflow across core systems. Intelligent validation to ensure one source of truth flows across raters, PAS, doc gen, and renewal triggers.', 'Underwriters must re-enter the same data across multiple disconnected systems (Dynamics, Excel raters, PAS/UKRIS, AIS, doc gen, Thunderhead, Profhin). Manual copying of outputs (raters → doc gen → PAS) adds rework, creates inconsistencies, and forces email/Excel workarounds. Leads to high error risk, wasted effort, compliance gaps, and downstream ops rework.', 'Process Automation', ARRAY['Underwriting & Triage']::text[], ARRAY[]::text[], ARRAY['All Lines (CL,SL,Others)']::text[], ARRAY['All Segments']::text[], ARRAY['UK']::text[], 3, 4, 4, 3, 4, 3, 3, 3, 2, 2, 'false', 'low', 'false', 'false', 'true', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Underwriting', NULL, 3.6, 2.6, 'Quick Win', NULL, NULL, NULL, NULL, NULL, 'true', 'true', 'active', '2026-02-03 11:37:25.557122', 'Good use case for immediate implementation', 'Auto-deactivated: Governance gates incomplete', 'internal', NULL, NULL, NULL, 'Helen Franklin; supported by Iain Cameron; Craig Brownrigg (Ops) flagged downstream impacts.', 'Helen', NULL, 'joint', 'In-flight', 'Dynamics, Excel raters, UKRIS, AIS, Thunderhead, Profin (plus MSD renewal triggers – related overlap).', 'immediate', 'Significant efficiency gains; fewer errors; faster turnaround; improved compliance; reduced downstream ops effort; stronger broker trust from consistent outputs.', 'High', NULL, 'Dynamics, Excel raters, UKRIS, AIS, Thunderhead, Profin (plus MSD renewal triggers – related overlap).', ARRAY['Rule-based Systems','Machine Learning']::text[], ARRAY['Policy Database','Customer Database','Submissions & Underwriting Database']::text[], ARRAY['Underwriting Teams','IT/Technology']::text[], 'false', ARRAY[]::text[], NULL, NULL, NULL, NULL, 'false', 'M', 111375, 222750, 8, 16, '3-6', 'foundation', NULL, '2026-02-03 13:10:24.381000', NULL, NULL, 'medium', 'false', 'complete', 'false', NULL, 'pending', NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, '{"derived": true, "tracking": {"entries": []}, "derivedAt": "2026-02-03T14:22:49.607Z", "kpiValues": {}, "investment": {"currency": "GBP", "initialInvestment": 86500, "ongoingMonthlyCost": 333}, "lastUpdated": "2026-02-03T14:22:49.607Z", "kpiEstimates": [{"kpiId": "uw_004", "kpiName": "Risk Assessment Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_001", "kpiName": "Submission Processing Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_005", "kpiName": "Risk Score Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "cor_improvement", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_002", "kpiName": "Auto-Classification Accuracy", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_003", "kpiName": "Submission Leakage Rate", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_006", "kpiName": "Adverse Selection Rate", "kpiType": "financial", "confidence": "low", "valueStream": "cor_improvement", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_007", "kpiName": "Quote Generation Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_008", "kpiName": "Rate Adequacy Index", "kpiType": "financial", "confidence": "low", "valueStream": "cor_improvement", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_009", "kpiName": "Premium Leakage", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_010", "kpiName": "Referral Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_011", "kpiName": "Referral Resolution Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_012", "kpiName": "False Positive Referral Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_013", "kpiName": "Quote-to-Bind Ratio", "kpiType": "financial", "confidence": "low", "valueStream": "revenue_uplift", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_014", "kpiName": "Policy Issuance Time", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "uw_015", "kpiName": "Document Accuracy Rate", "kpiType": "operational", "confidence": "low", "valueStream": "operational_savings", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_001", "kpiName": "Model Accuracy Degradation Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_002", "kpiName": "Prediction Confidence Distribution", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_003", "kpiName": "Inference Latency (p95)", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_004", "kpiName": "Model Drift Detection Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_005", "kpiName": "Feature Importance Stability", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "mp_006", "kpiName": "A/B Test Statistical Power", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_001", "kpiName": "Data Freshness Score", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_002", "kpiName": "Feature Store Coverage", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_003", "kpiName": "Feature Reuse Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_004", "kpiName": "Data Quality Score (DQS)", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_005", "kpiName": "Data Pipeline SLA Adherence", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "dq_006", "kpiName": "Schema Drift Incidents", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_001", "kpiName": "Technical Debt Ratio", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_002", "kpiName": "API Error Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_003", "kpiName": "Security Vulnerability Remediation Time", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_004", "kpiName": "Platform Currency Score", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_005", "kpiName": "Infrastructure Cost Efficiency", "kpiType": "financial", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "td_006", "kpiName": "Environment Parity", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_001", "kpiName": "AI Talent Retention Rate", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_002", "kpiName": "Skill Gap Closure Velocity", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_003", "kpiName": "Knowledge Documentation Coverage", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_004", "kpiName": "Bus Factor Risk", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_005", "kpiName": "Team Utilization Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ta_006", "kpiName": "Internal Mobility/Growth", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_001", "kpiName": "Idea-to-PoC Conversion Rate", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_002", "kpiName": "PoC Cycle Time", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_003", "kpiName": "Experimentation Velocity", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_004", "kpiName": "Failed Experiment Learning Capture", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_005", "kpiName": "Innovation Funnel Health", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "in_006", "kpiName": "External Partnership Value", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_001", "kpiName": "Business Sponsor Satisfaction", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_002", "kpiName": "Strategic Priority Alignment", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_003", "kpiName": "Demand Backlog Age", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_004", "kpiName": "Stakeholder Engagement Frequency", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_005", "kpiName": "Value Realization Communication", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sh_006", "kpiName": "Executive Dashboard Access", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_001", "kpiName": "Hallucination Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_002", "kpiName": "Human Override Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_003", "kpiName": "Prompt Effectiveness Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_004", "kpiName": "Token Cost Efficiency", "kpiType": "financial", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_005", "kpiName": "Guardrail Trigger Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_006", "kpiName": "Context Window Utilization", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_007", "kpiName": "RAG Retrieval Precision", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "ga_008", "kpiName": "Response Time SLA Compliance", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_001", "kpiName": "Cloud Cost Optimization", "kpiType": "financial", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_002", "kpiName": "Infrastructure Utilization", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_003", "kpiName": "Deployment Frequency", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_004", "kpiName": "Mean Time to Recovery (MTTR)", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_005", "kpiName": "Change Failure Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "it_006", "kpiName": "Lead Time for Changes", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_001", "kpiName": "AI Security Incidents", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_002", "kpiName": "Privacy Compliance Rate", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_003", "kpiName": "Access Control Adherence", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_004", "kpiName": "Data Encryption Coverage", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_005", "kpiName": "Model Adversarial Testing", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "sp_006", "kpiName": "PII Detection Coverage", "kpiType": "compliance", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_001", "kpiName": "AI-Assisted Resolution Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_002", "kpiName": "Self-Service Adoption Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_003", "kpiName": "Response Time Improvement", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_004", "kpiName": "Customer Effort Score (AI)", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_005", "kpiName": "First Contact Resolution (AI)", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "cx_006", "kpiName": "AI NPS Impact", "kpiType": "strategic", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_001", "kpiName": "Process Automation Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_002", "kpiName": "Straight-Through Processing Rate", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_003", "kpiName": "Manual Intervention Reduction", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_004", "kpiName": "Exception Handling Time", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_005", "kpiName": "Predictive Accuracy (Operations)", "kpiType": "operational", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}, {"kpiId": "oe_006", "kpiName": "Resource Optimization Savings", "kpiType": "financial", "confidence": "low", "expectedRange": {"max": 10, "min": 0}, "maturityLevel": "foundational", "benchmarkProcess": null, "estimatedAnnualValueGbp": {"max": 5400, "min": 0}}], "selectedKpis": ["uw_001", "uw_003", "mp_006", "dq_002", "ta_001"], "calculatedMetrics": {"currentRoi": 147.63525459688827, "lastCalculated": "2026-02-03T14:14:59.881Z", "cumulativeValueGbp": 224100, "projectedBreakevenMonth": "2026-07"}, "totalEstimatedValue": {"max": 448200, "min": 0, "currency": "GBP"}}'::jsonb, '{"derived": true, "staffing": {"current": {"client": {"total": 1.5, "byRole": {}}, "vendor": {"total": 3.5, "byRole": {}}}, "planned": {"month6": {"client": 2.7, "vendor": 2.3}, "month12": {"client": 4.5, "vendor": 0.5}, "month18": {"client": 5.7, "vendor": 0.5}}}, "training": {"plannedCertifications": [], "completedCertifications": [], "totalTrainingHoursPlanned": 100, "totalTrainingHoursCompleted": 0}, "derivedAt": "2026-02-03T14:14:59.866Z", "derivedFrom": {"quadrant": "Quick Win", "tomPhase": "foundation", "tShirtSize": "M", "operatingModel": "coe_led"}, "roleEvolution": [], "knowledgeTransfer": {"milestoneNotes": {}, "completedMilestones": [], "inProgressMilestones": ["kt_001"]}, "independenceHistory": [{"date": "2026-02", "note": "Auto-derived from use case attributes", "percentage": 10}], "selfSufficiencyTarget": {"targetDate": "2026-12-30", "advisoryRetainer": "false", "targetIndependence": 90}, "independencePercentage": 10}'::jsonb, 'unique', NULL, NULL, NULL, NULL, '2026-02-03 11:37:25.557122'
);


-- ============================================================
-- STEP 5: INSERT METADATA CONFIG
-- ============================================================

INSERT INTO metadata_config (id, value_chain_components, processes, lines_of_business, business_segments, geographies, use_case_types, updated_at, activities, process_activities, scoring_model, source_types, use_case_statuses, ai_ml_technologies, data_sources, stakeholder_groups, quadrants, question_types, response_statuses, company_tiers, market_options, question_categories, horizontal_use_case_types, activities_sort_order, processes_sort_order, lines_of_business_sort_order, business_segments_sort_order, geographies_sort_order, use_case_types_sort_order, value_chain_components_sort_order, source_types_sort_order, ai_ml_technologies_sort_order, data_sources_sort_order, stakeholder_groups_sort_order, use_case_statuses_sort_order, quadrants_sort_order, scoring_dropdown_options, process_activities_sort_order, t_shirt_sizing, tom_config, value_realization_config, capability_transition_config, time_estimation_config, derivation_formulas) VALUES (
    'default', '["Risk Assessment & Underwriting", "Customer Experience & Distribution", "Claims Management & Settlement", "Risk Consulting & Prevention", "Portfolio Management & Analytics"]'::jsonb, '["Submission & Quote", "Underwriting & Triage", "Claims Management", "Risk Consulting", "Reinsurance", "Regulatory & Compliance", "Financial Management", "Sales & Distribution (Including Broker Relationships)", "Customer Servicing", "Policy Servicing", "Billing", "General", "Product & Rating", "Human Resources"]'::jsonb, '["All Commercial", "All Lines (CL,SL,Others)", "Property Owners", "Personal Lines (Ireland)", "Specialty (E&S)", "Casualty", "Commercial Combined", "ProFin", "eTrade Product Lines", "Motor Fleet", "Workers Compensation"]'::jsonb, '["All Segments", "UK Commercial Lines (Traded SME Channel)", "Ireland", "UK Specialty Lines (Mid Market Regional Channel)", "Europe Specialty Lines", "UK Commercial Lines (eTrade Channel)", "UK Commercial Lines (Regional Channel)"]'::jsonb, '["United States", "United Kingdom", "EMEA"]'::jsonb, '["Agentic AI", "Analytics & Insights", "GenAI", "IoT + AI", "NLP", "Predictive ML", "Process Automation", "RPA", "Conversational AI"]'::jsonb, '2026-02-03 17:44:02.195000', '["Risk Analysis", "Cat Modeling", "Market Analysis", "Pricing", "Pipelining", "Risk Assessment", "Rating", "Quality Assurance", "Contract Certainty", "Exposure Management", "Claims Processing", "Expert Settlement", "Loss Fund Management", "Subrogation", "Claims Analysis", "Risk Evaluation", "Compliance Verification", "Advisory Services", "Risk Monitoring", "R/I Transactions", "Contract Charging", "Reinsurance Messages", "Manual Adjustments", "Regulatory Reporting", "Sanctions Check", "Lloyds Compliance", "Licensing Check", "Accounting", "Credit Control", "Payment Processing", "Financial Reporting", "Lead Generation", "Broker Relations", "Channel Management", "Sales Support", "Market Development", "Customer Support", "Account Management", "Service Delivery", "Relationship Management", "Issue Resolution", "Policy Issuance", "Booking & Recording", "Document Management", "Renewal Processing", "Contract Management", "Invoice Generation", "Collections Management", "Billing Reconciliation", "Payment Tracking", "FNOL & Triage", "First Notice of Loss (FNOL)", "First Notice of Loss (FNOL),First Report of Injury (FROI)", "Claims Triage & Assessment", "Investigation & Evidence Gathering", "Claims Adjudication", "Special Investigative Unit (SIU)", "Loss Adjustment & Valuation", "Settlement Negotiation", "Claims Payment Processing", "Recovery Operations", "Claims Closure", "Post-Settlement Services", "Claims Prevention & Mitigation", "Claims Prevention & Risk Mitigation", "Special Investigations (Fraud Detection)", "Recovery Operations (Subrogation & Salvage)", "Post-Settlement Services & Analytics"]'::jsonb, '{"Submission & Quote":["Risk Analysis","Cat Modeling","Market Analysis","Pricing","Pipelining"],"Claims Management":["Loss Fund Management","First Notice of Loss (FNOL),First Report of Injury (FROI)","Claims Triage & Assessment","Investigation & Evidence Gathering","Claims Adjudication","Special Investigative Unit (SIU)","Loss Adjustment & Valuation","Settlement Negotiation","Claims Payment Processing","Claims Closure","Post-Settlement Services","Claims Prevention & Risk Mitigation","Special Investigations (Fraud Detection)","Recovery Operations (Subrogation & Salvage)","Post-Settlement Services & Analytics"],"Risk Consulting":["Risk Evaluation","Compliance Verification","Advisory Services","Risk Monitoring"],"Reinsurance":["R/I Transactions","Contract Charging","Reinsurance Messages","Manual Adjustments"],"Regulatory & Compliance":["Regulatory Reporting","Sanctions Check","Lloyds Compliance","Licensing Check"],"Financial Management":["Accounting","Credit Control","Payment Processing","Financial Reporting"],"Customer Servicing":["Customer Support","Account Management","Service Delivery","Relationship Management","Issue Resolution"],"Policy Servicing":["Policy Issuance","Booking & Recording","Document Management","Renewal Processing","Contract Management"],"Sales & Distribution (Including Broker Relationships)":["Lead Generation","Broker Relations","Channel Management","Sales Support","Market Development"],"Underwriting & Triage":["Risk Assessment","Rating","Quality Assurance","Contract Certainty","Exposure Management"]}', '{"businessValue":{"revenueImpact":20,"costSavings":20,"riskReduction":20,"brokerPartnerExperience":20,"strategicFit":20},"feasibility":{"dataReadiness":20,"technicalComplexity":20,"changeImpact":20,"modelRisk":20,"adoptionReadiness":20},"quadrantThreshold":3}', '["internal", "industry_standard", "ai_inventory"]'::jsonb, '["Discovery", "Backlog", "In-flight", "Implemented", "On Hold"]'::jsonb, '["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Predictive Analytics", "Large Language Models", "Reinforcement Learning", "Rule-based Systems"]'::jsonb, '["Policy Database", "Claims Database", "Customer Database", "External APIs", "Third-party Data", "Real-time Feeds", "Historical Data", "Regulatory Data", "Broker Data & Feeds", "Submissions & Underwriting Database"]'::jsonb, '["Underwriting Teams", "Claims Teams", "IT/Technology", "Business Analytics", "Risk Management", "Compliance", "Customer Service", "External Partners", "Actuarial", "Distrbution (Broker) Teams"]'::jsonb, '["Quick Win", "Strategic Bet", "Experimental", "Watchlist"]'::jsonb, '["text", "textarea", "select", "multi_select", "radio", "checkbox", "number", "date", "email", "url", "company_profile", "business_lines_matrix", "smart_rating", "multi_rating", "percentage_allocation", "percentage_target", "ranking", "currency", "department_skills_matrix", "business_performance", "composite", "dynamic_use_case_selector"]'::jsonb, '["started", "in_progress", "completed", "abandoned"]'::jsonb, '["Small (<$100M)", "Mid ($100M-$3B)", "Large (>$3B)"]'::jsonb, '["Personal Lines", "Commercial Lines", "Specialty Lines", "Reinsurance"]'::jsonb, '["Strategic Foundation", "AI Capabilities", "Use Case Discovery", "Technology Infrastructure", "Organizational Readiness", "Risk & Compliance"]'::jsonb, '["Content Generation - Document drafting, report generation", "Content Management -Categorization, tagging, curation", "AI Assistant\u2014Knowledge Source (Research assistant, information retrieval)", "AI Assistant\u2014Automation (Autofill, next-best action suggestions, autonomous agents)", "Code Development (Debugging, refactoring, coding)", "Information Analysis (Synthesis, summarization)", "Data Analysis - Augmentation, visualization", "Synthetic Data Generation - Text versions for analysis, time series data generation, scenario generation", "Workflow Improvements  - Suggestions for workflow amendments, automated changes to workflows", "Detection Models  - Errors, fraud, problem-solving"]'::jsonb, NULL, '{"Billing": 12, "General": 0, "Reinsurance": 11, "Risk Consulting": 7, "Policy Servicing": 9, "Product & Rating": 6, "Claims Management": 4, "Customer Servicing": 5, "Submission & Quote": 2, "Financial Management": 8, "Underwriting & Triage": 3, "Regulatory & Compliance": 10, "Sales & Distribution (Including Broker Relationships)": 1}'::jsonb, '{"ProFin": 4, "Casualty": 5, "Motor Fleet": 6, "All Commercial": 1, "Property Owners": 3, "Specialty (E&S)": 8, "Commercial Combined": 2, "eTrade Product Lines": 9, "All Lines (CL,SL,Others)": 0, "Personal Lines (Ireland)": 7}'::jsonb, '{"Ireland": 5, "All Segments": 0, "Europe Specialty Lines": 6, "UK Commercial Lines (eTrade Channel)": 2, "UK Commercial Lines (Regional Channel)": 3, "UK Commercial Lines (Traded SME Channel)": 1, "UK Specialty Lines (Mid Market Regional Channel)": 4}'::jsonb, '{"UK": 0, "Canada": 3, "Europe": 4, "Global": 2, "Ireland": 1, "North America": 5}'::jsonb, '{"NLP": 4, "RPA": 8, "GenAI": 1, "IoT + AI": 6, "Agentic AI": 0, "Predictive ML": 3, "Conversational AI": 2, "Process Automation": 7, "Analytics & Insights": 5}'::jsonb, NULL, '{"ai_inventory": 2, "rsa_internal": 0, "industry_standard": 1}'::jsonb, NULL, '{"External APIs": 5, "Claims Database": 1, "Historical Data": 6, "Policy Database": 2, "Real-time Feeds": 7, "Regulatory Data": 8, "Third-party Data": 9, "Customer Database": 3, "Broker Data & Feeds": 0, "Submissions & Underwriting Database": 4}'::jsonb, '{"Actuarial": 4, "Compliance": 6, "Claims Teams": 2, "IT/Technology": 7, "Risk Management": 5, "Customer Service": 3, "External Partners": 8, "Business Analytics": 9, "Underwriting Teams": 1, "Distrbution (Broker) Teams": 0}'::jsonb, NULL, NULL, '{"modelRisk": [{"label": "Low", "value": 1, "description": "Well-understood technology, minimal regulatory risk"}, {"label": "Minor", "value": 2, "description": "Some model uncertainty, manageable compliance"}, {"label": "Moderate", "value": 3, "description": "Moderate model risk, standard regulatory oversight"}, {"label": "High", "value": 4, "description": "Significant model risk, complex regulatory requirements"}, {"label": "Very High", "value": 5, "description": "High regulatory risk, unproven technology"}], "costSavings": [{"label": "None", "value": 1, "description": "No cost reduction or potential increase"}, {"label": "Minor", "value": 2, "description": "Small operational savings (<$50k annually)"}, {"label": "Moderate", "value": 3, "description": "Meaningful cost reduction ($50k-$250k annually)"}, {"label": "Significant", "value": 4, "description": "Large operational savings ($250k-$1M annually)"}, {"label": "Major", "value": 5, "description": "Substantial cost reduction (>$1M annually)"}], "changeImpact": [{"label": "Minimal", "value": 1, "description": "Minor process adjustments, no role changes"}, {"label": "Low", "value": 2, "description": "Some process updates, minimal training needed"}, {"label": "Moderate", "value": 3, "description": "Workflow changes and moderate retraining"}, {"label": "High", "value": 4, "description": "Major process redesign and extensive training"}, {"label": "Extensive", "value": 5, "description": "Complete organizational transformation required"}], "strategicFit": [{"label": "Misaligned", "value": 1, "description": "Contradicts company strategy or priorities"}, {"label": "Poor Fit", "value": 2, "description": "Limited alignment with strategic objectives"}, {"label": "Moderate Fit", "value": 3, "description": "Reasonable alignment with business strategy"}, {"label": "Strong Fit", "value": 4, "description": "High alignment with strategic priorities"}, {"label": "Perfect Fit", "value": 5, "description": "Complete alignment with core strategic goals"}], "dataReadiness": [{"label": "Ready", "value": 1, "description": "Data is clean, accessible, and well-structured"}, {"label": "Minor Prep", "value": 2, "description": "Requires minor data cleanup or formatting"}, {"label": "Moderate Prep", "value": 3, "description": "Needs significant data preparation work"}, {"label": "Major Issues", "value": 4, "description": "Has substantial data quality or access issues"}, {"label": "Poor", "value": 5, "description": "Data is incomplete, messy, or unavailable"}], "revenueImpact": [{"label": "None", "value": 1, "description": "No revenue effect or potential loss"}, {"label": "Minor", "value": 2, "description": "Small revenue impact (<$100k annually)"}, {"label": "Moderate", "value": 3, "description": "Meaningful revenue impact ($100k-$500k annually)"}, {"label": "Significant", "value": 4, "description": "Large revenue impact ($500k-$2M annually)"}, {"label": "Major", "value": 5, "description": "Substantial revenue impact (>$2M annually)"}], "riskReduction": [{"label": "None", "value": 1, "description": "No risk mitigation or potential risk increase"}, {"label": "Minor", "value": 2, "description": "Small reduction in operational or compliance risks"}, {"label": "Moderate", "value": 3, "description": "Meaningful reduction in business or regulatory risks"}, {"label": "Significant", "value": 4, "description": "Large reduction in enterprise or market risks"}, {"label": "Major", "value": 5, "description": "Substantial mitigation of critical business risks"}], "adoptionReadiness": [{"label": "Ready", "value": 1, "description": "Organization is eager and fully prepared"}, {"label": "Mostly Ready", "value": 2, "description": "Good preparation with minor readiness gaps"}, {"label": "Moderate", "value": 3, "description": "Some preparation needed, mixed readiness"}, {"label": "Low Readiness", "value": 4, "description": "Significant preparation needed, some resistance"}, {"label": "Resistant", "value": 5, "description": "Organization unprepared or resistant to change"}], "technicalComplexity": [{"label": "Simple", "value": 1, "description": "Uses existing tools and basic configuration"}, {"label": "Low", "value": 2, "description": "Minor integration with standard APIs"}, {"label": "Moderate", "value": 3, "description": "Requires new system integration or development"}, {"label": "High", "value": 4, "description": "Complex custom development across multiple systems"}, {"label": "Very High", "value": 5, "description": "Cutting-edge technology requiring R&D"}], "brokerPartnerExperience": [{"label": "Negative", "value": 1, "description": "Harms broker relationships or creates friction"}, {"label": "Minor", "value": 2, "description": "Small improvements to broker processes"}, {"label": "Moderate", "value": 3, "description": "Meaningful enhancement to broker experience"}, {"label": "Significant", "value": 4, "description": "Large improvement in broker satisfaction"}, {"label": "Major", "value": 5, "description": "Transformative broker partnership value"}]}'::jsonb, '{"Claims Management": {"Claims Closure": 9, "Claims Adjudication": 4, "Loss Fund Management": 14, "Settlement Negotiation": 7, "Post-Settlement Services": 10, "Claims Payment Processing": 8, "Claims Triage & Assessment": 2, "Loss Adjustment & Valuation": 6, "Special Investigative Unit (SIU)": 5, "Investigation & Evidence Gathering": 3, "Claims Prevention & Risk Mitigation": 0, "Post-Settlement Services & Analytics": 13, "Special Investigations (Fraud Detection)": 11, "Recovery Operations (Subrogation & Salvage)": 12, "First Notice of Loss (FNOL),First Report of Injury (FROI)": 1}}'::jsonb, '{"roles": [{"type": "Developer", "dailyRateGBP": 400}, {"type": "Analyst", "dailyRateGBP": 350}, {"type": "PM", "dailyRateGBP": 500}, {"type": "Data Engineer", "dailyRateGBP": 550}, {"type": "Architect", "dailyRateGBP": 650}, {"type": "QA Engineer", "dailyRateGBP": 300}], "sizes": [{"name": "XS", "color": "#10B981", "maxWeeks": 4, "minWeeks": 2, "description": "Simple automation or tool integration", "teamSizeMax": 2, "teamSizeMin": 1}, {"name": "S", "color": "#3B82F6", "maxWeeks": 8, "minWeeks": 4, "description": "Basic ML model, RPA, or process optimization", "teamSizeMax": 4, "teamSizeMin": 2}, {"name": "M", "color": "#FBBF24", "maxWeeks": 16, "minWeeks": 8, "description": "Advanced ML/NLP, data pipelines, multi-system integration", "teamSizeMax": 6, "teamSizeMin": 3}, {"name": "L", "color": "#EF4444", "maxWeeks": 26, "minWeeks": 16, "description": "Complex AI systems, agentic bots, cross-functional rollout", "teamSizeMax": 10, "teamSizeMin": 5}, {"name": "XL", "color": "#8B5CF6", "maxWeeks": 52, "minWeeks": 26, "description": "Enterprise-wide transformation, end-to-end automation", "teamSizeMax": 15, "teamSizeMin": 8}], "enabled": true, "mappingRules": [{"name": "Critical Quick Fix", "priority": 150, "condition": {"effortMax": 1.5, "impactMin": 4.5}, "targetSize": "XS"}, {"name": "High-Value Quick Win", "priority": 140, "condition": {"effortMax": 2.5, "impactMin": 4}, "targetSize": "S"}, {"name": "Strategic Quick Win", "priority": 130, "condition": {"effortMax": 2, "impactMin": 3.5}, "targetSize": "S"}, {"name": "Strategic Priority", "priority": 120, "condition": {"effortMax": 3.5, "effortMin": 2.5, "impactMin": 4}, "targetSize": "M"}, {"name": "Major Strategic Bet", "priority": 110, "condition": {"effortMax": 4.5, "effortMin": 3.5, "impactMin": 4}, "targetSize": "L"}, {"name": "Complex Strategic", "priority": 105, "condition": {"effortMin": 4.5, "impactMin": 3.5}, "targetSize": "XL"}, {"name": "Standard Quick Win", "priority": 100, "condition": {"effortMax": 2.5, "impactMin": 3}, "targetSize": "S"}, {"name": "Important Project", "priority": 95, "condition": {"effortMax": 3.5, "effortMin": 2, "impactMin": 3.5}, "targetSize": "M"}, {"name": "Strategic Project", "priority": 90, "condition": {"effortMax": 4.5, "effortMin": 3.5, "impactMin": 3}, "targetSize": "L"}, {"name": "Standard Project", "priority": 80, "condition": {"effortMax": 3.5, "effortMin": 2.5, "impactMin": 2.5}, "targetSize": "M"}, {"name": "Complex Standard", "priority": 75, "condition": {"effortMax": 4.5, "effortMin": 3.5, "impactMin": 2.5}, "targetSize": "M"}, {"name": "Resource-Heavy Project", "priority": 70, "condition": {"effortMin": 4.5, "impactMin": 2.5}, "targetSize": "L"}, {"name": "Small Project", "priority": 65, "condition": {"effortMax": 2.5, "effortMin": 1.5, "impactMin": 2}, "targetSize": "S"}, {"name": "Maintenance Project", "priority": 60, "condition": {"effortMax": 3.5, "effortMin": 2.5, "impactMax": 2.5}, "targetSize": "S"}, {"name": "Questionable Investment", "priority": 55, "condition": {"effortMax": 4.5, "effortMin": 3.5, "impactMax": 2.5}, "targetSize": "M"}, {"name": "Low-Value Money Pit", "priority": 40, "condition": {"effortMin": 4.5, "impactMax": 2.5}, "targetSize": "XL"}, {"name": "Major Money Pit", "priority": 35, "condition": {"effortMin": 3.5, "impactMax": 1.5}, "targetSize": "XL"}, {"name": "Minor Enhancement", "priority": 30, "condition": {"effortMax": 1.5, "impactMin": 2}, "targetSize": "XS"}, {"name": "Small Maintenance", "priority": 25, "condition": {"effortMax": 2.5, "impactMax": 2}, "targetSize": "XS"}, {"name": "Low-Value Work", "priority": 20, "condition": {"effortMax": 3.5, "impactMax": 1.5}, "targetSize": "S"}, {"name": "Trivial Task", "priority": 10, "condition": {}, "targetSize": "XS"}], "benefitRangePct": 0.2, "benefitMultipliers": {"L": 150000, "M": 75000, "S": 40000, "XL": 300000, "XS": 20000}, "overheadMultiplier": 1.35}'::jsonb, '{"phases": [{"id": "ideation", "name": "Ideation", "color": "#9333EA", "order": 1, "priority": 1, "manualOnly": false, "description": "Early discovery, opportunity identification, and initial concept validation", "phaseDefaults": {"responsibleAI": {"riskTier": "low", "assessmentRequired": false, "recommendedCheckpoints": ["initial_screening"]}, "valueRealization": {"defaultKpiCategories": [], "expectedValueRangeMax": null, "expectedValueRangeMin": null}, "capabilityTransition": {"clientFts": 1, "hexawareFts": 2, "independenceFts": 5, "targetIndependence": 10, "currentIndependence": 0}}, "staffingRatio": {"client": 0.7, "vendor": 0.3}, "governanceGate": "innovation_board", "mappedStatuses": ["Discovery"], "dataRequirements": {"exit": ["primaryBusinessOwner", "strategicAlignment"], "entry": ["title", "description"]}, "unlockedFeatures": ["overview"], "mappedDeployments": [], "expectedDurationWeeks": 4}, {"id": "assessment", "name": "Assessment", "color": "#3C2CDA", "order": 2, "priority": 2, "manualOnly": false, "description": "Detailed feasibility analysis, business case development, and resource planning", "phaseDefaults": {"responsibleAI": {"riskTier": "medium", "assessmentRequired": true, "recommendedCheckpoints": ["bias_review", "data_privacy"]}, "valueRealization": {"defaultKpiCategories": [], "expectedValueRangeMax": null, "expectedValueRangeMin": null}, "capabilityTransition": {"clientFts": 1, "hexawareFts": 4, "independenceFts": 10, "targetIndependence": 20, "currentIndependence": 5}}, "staffingRatio": {"client": 0.5, "vendor": 0.5}, "governanceGate": "ai_steerco", "mappedStatuses": ["Backlog", "On Hold"], "dataRequirements": {"exit": ["scoringComplete", "raiAssessment"], "entry": ["primaryBusinessOwner"]}, "unlockedFeatures": ["overview", "scoring", "rai"], "mappedDeployments": [], "expectedDurationWeeks": 6}, {"id": "foundation", "name": "Foundation", "color": "#1D86FF", "order": 3, "priority": 3, "manualOnly": false, "description": "Technical infrastructure setup, team onboarding, and governance alignment", "phaseDefaults": {"responsibleAI": {"riskTier": "medium", "assessmentRequired": true, "recommendedCheckpoints": ["model_validation", "fairness_testing"]}, "valueRealization": {"defaultKpiCategories": ["efficiency"], "expectedValueRangeMax": 100000, "expectedValueRangeMin": 25000}, "capabilityTransition": {"clientFts": 2, "hexawareFts": 6, "independenceFts": 20, "targetIndependence": 35, "currentIndependence": 15}}, "staffingRatio": {"client": 0.25, "vendor": 0.75}, "governanceGate": "ai_steerco", "mappedStatuses": ["In-flight"], "dataRequirements": {"exit": ["processMapping"], "entry": ["scoringComplete"]}, "unlockedFeatures": ["overview", "scoring", "rai", "details"], "mappedDeployments": [], "expectedDurationWeeks": 8}, {"id": "build", "name": "Build", "color": "#14CBDE", "order": 4, "priority": 4, "manualOnly": false, "description": "Active development, integration, and pilot testing with controlled user groups", "phaseDefaults": {"responsibleAI": {"riskTier": "medium", "assessmentRequired": true, "recommendedCheckpoints": ["pilot_evaluation", "user_feedback"]}, "valueRealization": {"defaultKpiCategories": ["efficiency", "quality"], "expectedValueRangeMax": 250000, "expectedValueRangeMin": 50000}, "capabilityTransition": {"clientFts": 2, "hexawareFts": 8, "independenceFts": 30, "targetIndependence": 50, "currentIndependence": 25}}, "staffingRatio": {"client": 0.2, "vendor": 0.8}, "governanceGate": "working_group", "mappedStatuses": [], "dataRequirements": {"exit": ["tshirtSizing", "capabilityData"], "entry": ["processMapping"]}, "unlockedFeatures": ["overview", "scoring", "rai", "details", "tshirtSizing", "capability"], "mappedDeployments": ["PoC", "Pilot"], "expectedDurationWeeks": 12}, {"id": "scale", "name": "Scale", "color": "#10B981", "order": 5, "priority": 5, "manualOnly": false, "description": "Production deployment, user adoption, and capability transfer to client teams", "phaseDefaults": {"responsibleAI": {"riskTier": "high", "assessmentRequired": true, "recommendedCheckpoints": ["production_monitoring", "incident_response"]}, "valueRealization": {"defaultKpiCategories": ["efficiency", "quality", "cost_savings"], "expectedValueRangeMax": 600000, "expectedValueRangeMin": 150000}, "capabilityTransition": {"clientFts": 5, "hexawareFts": 4, "independenceFts": 55, "targetIndependence": 75, "currentIndependence": 50}}, "staffingRatio": {"client": 0.5, "vendor": 0.5}, "governanceGate": "business_owner", "mappedStatuses": ["Implemented"], "dataRequirements": {"exit": ["investmentData", "kpiData"], "entry": ["tshirtSizing"]}, "unlockedFeatures": ["overview", "scoring", "rai", "details", "tshirtSizing", "capability", "investment", "kpi"], "mappedDeployments": ["Production"], "expectedDurationWeeks": 10}, {"id": "operate", "name": "Operate", "color": "#07125E", "order": 6, "priority": 6, "manualOnly": true, "description": "Full client ownership, continuous optimization, and value realization tracking", "phaseDefaults": {"responsibleAI": {"riskTier": "low", "assessmentRequired": false, "recommendedCheckpoints": ["annual_review", "continuous_monitoring"]}, "valueRealization": {"defaultKpiCategories": ["efficiency", "quality", "cost_savings", "revenue"], "expectedValueRangeMax": 1500000, "expectedValueRangeMin": 300000}, "capabilityTransition": {"clientFts": 8, "hexawareFts": 1, "independenceFts": 90, "targetIndependence": 95, "currentIndependence": 85}}, "staffingRatio": {"client": 0.85, "vendor": 0.15}, "governanceGate": "none", "mappedStatuses": [], "dataRequirements": {"exit": ["valueRealization", "validationFullyValidated"], "entry": ["kpiData"]}, "unlockedFeatures": ["overview", "scoring", "rai", "details", "tshirtSizing", "capability", "investment", "kpi", "valueRealization"], "mappedDeployments": [], "expectedDurationWeeks": null}], "enabled": "true", "presets": {"hybrid": {"name": "Hybrid Model", "description": "Central platform, distributed execution"}, "coe_led": {"name": "CoE-Led with Business Pods", "description": "CoE leads with embedded business pods"}, "federated": {"name": "Federated Model", "description": "Business units own AI with central standards"}, "centralized": {"name": "Centralized CoE", "description": "Single AI team owns all delivery"}, "enterprise_tom": {"name": "Enterprise TOM", "description": "Six-phase enterprise model with extended governance"}}, "activePreset": "enterprise_tom", "presetProfiles": {"hybrid": {"deliveryTracks": [{"id": "quick_wins", "name": "Quick Wins", "description": "Fast-track high-impact, low-effort initiatives"}, {"id": "strategic", "name": "Strategic Initiatives", "description": "Long-term capability building and complex projects"}], "phaseOverrides": {"strategic": {"governanceGate": "working_group", "expectedDurationWeeks": 14}, "foundation": {"governanceGate": "working_group", "expectedDurationWeeks": 6}, "transition": {"governanceGate": "business_owner", "expectedDurationWeeks": 10}, "steady_state": {"governanceGate": "none", "expectedDurationWeeks": null}}, "staffingRatios": {"strategic": {"client": 0.5, "vendor": 0.5}, "foundation": {"client": 0.4, "vendor": 0.6}, "transition": {"client": 0.65, "vendor": 0.35}, "steady_state": {"client": 0.85, "vendor": 0.15}}}, "coe_led": {"deliveryTracks": [{"id": "coe_track", "name": "CoE Pipeline", "description": "Primary delivery through CoE with business pod support"}, {"id": "pod_track", "name": "Business Pods", "description": "Embedded teams handling domain-specific initiatives"}], "phaseOverrides": {"strategic": {"governanceGate": "working_group", "expectedDurationWeeks": 16}, "foundation": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 8}, "transition": {"governanceGate": "business_owner", "expectedDurationWeeks": 12}, "steady_state": {"governanceGate": "none", "expectedDurationWeeks": null}}, "staffingRatios": {"strategic": {"client": 0.45, "vendor": 0.55}, "foundation": {"client": 0.3, "vendor": 0.7}, "transition": {"client": 0.6, "vendor": 0.4}, "steady_state": {"client": 0.8, "vendor": 0.2}}}, "federated": {"deliveryTracks": [{"id": "bu_owned", "name": "Business Unit Owned", "description": "Each business unit manages own AI initiatives"}], "phaseOverrides": {"strategic": {"governanceGate": "business_owner", "expectedDurationWeeks": 12}, "foundation": {"governanceGate": "working_group", "expectedDurationWeeks": 6}, "transition": {"governanceGate": "business_owner", "expectedDurationWeeks": 8}, "steady_state": {"governanceGate": "none", "expectedDurationWeeks": null}}, "staffingRatios": {"strategic": {"client": 0.7, "vendor": 0.3}, "foundation": {"client": 0.6, "vendor": 0.4}, "transition": {"client": 0.8, "vendor": 0.2}, "steady_state": {"client": 0.9, "vendor": 0.1}}}, "centralized": {"deliveryTracks": [{"id": "single_track", "name": "Unified Delivery", "description": "All initiatives through central CoE pipeline"}], "phaseOverrides": {"strategic": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 20}, "foundation": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 12}, "transition": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 16}, "steady_state": {"governanceGate": "ai_steerco", "expectedDurationWeeks": null}}, "staffingRatios": {"strategic": {"client": 0.2, "vendor": 0.8}, "foundation": {"client": 0.1, "vendor": 0.9}, "transition": {"client": 0.4, "vendor": 0.6}, "steady_state": {"client": 0.8, "vendor": 0.2}}}, "enterprise_tom": {"phases": [{"id": "ideation", "name": "Ideation", "color": "#9333EA", "order": 1, "priority": 1, "manualOnly": false, "description": "Early discovery, opportunity identification, and initial concept validation", "governanceGate": "innovation_board", "mappedStatuses": ["Discovery"], "mappedDeployments": [], "expectedDurationWeeks": 4}, {"id": "assessment", "name": "Assessment", "color": "#3C2CDA", "order": 2, "priority": 2, "manualOnly": false, "description": "Detailed feasibility analysis, business case development, and resource planning", "governanceGate": "ai_steerco", "mappedStatuses": ["Backlog", "On Hold"], "mappedDeployments": [], "expectedDurationWeeks": 6}, {"id": "foundation", "name": "Foundation", "color": "#1D86FF", "order": 3, "priority": 3, "manualOnly": false, "description": "Technical infrastructure setup, team onboarding, and governance alignment", "governanceGate": "ai_steerco", "mappedStatuses": ["In-flight"], "mappedDeployments": [], "expectedDurationWeeks": 8}, {"id": "build", "name": "Build", "color": "#14CBDE", "order": 4, "priority": 4, "manualOnly": false, "description": "Active development, integration, and pilot testing with controlled user groups", "governanceGate": "working_group", "mappedStatuses": [], "mappedDeployments": ["PoC", "Pilot"], "expectedDurationWeeks": 12}, {"id": "scale", "name": "Scale", "color": "#10B981", "order": 5, "priority": 5, "manualOnly": false, "description": "Production deployment, user adoption, and capability transfer to client teams", "governanceGate": "business_owner", "mappedStatuses": ["Implemented"], "mappedDeployments": ["Production"], "expectedDurationWeeks": 10}, {"id": "operate", "name": "Operate", "color": "#07125E", "order": 6, "priority": 6, "manualOnly": true, "description": "Full client ownership, continuous optimization, and value realization tracking", "governanceGate": "none", "mappedStatuses": [], "mappedDeployments": [], "expectedDurationWeeks": null}], "deliveryTracks": [{"id": "innovation", "name": "Innovation Track", "description": "Exploratory initiatives and proof of concepts"}, {"id": "transformation", "name": "Transformation Track", "description": "Large-scale enterprise transformation programs"}, {"id": "enhancement", "name": "Enhancement Track", "description": "Incremental improvements to existing capabilities"}], "phaseOverrides": {"build": {"governanceGate": "working_group", "expectedDurationWeeks": 12}, "scale": {"governanceGate": "business_owner", "expectedDurationWeeks": 10}, "operate": {"governanceGate": "none", "expectedDurationWeeks": null}, "ideation": {"governanceGate": "innovation_board", "expectedDurationWeeks": 4}, "assessment": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 6}, "foundation": {"governanceGate": "ai_steerco", "expectedDurationWeeks": 8}}, "staffingRatios": {"build": {"client": 0.2, "vendor": 0.8}, "scale": {"client": 0.5, "vendor": 0.5}, "operate": {"client": 0.85, "vendor": 0.15}, "ideation": {"client": 0.7, "vendor": 0.3}, "assessment": {"client": 0.5, "vendor": 0.5}, "foundation": {"client": 0.25, "vendor": 0.75}}}}, "derivationRules": {"matchOrder": ["useCaseStatus", "deploymentStatus"], "fallbackBehavior": "lowestPriority", "nullDeploymentHandling": "ignoreInMatching"}, "gateDefinitions": [{"id": "operatingModel", "color": "#3C2CDA", "order": 1, "title": "Operating Model", "subtitle": "Accountability", "principle": "Accountability and organizational alignment must be established before AI work begins", "targetPhase": "foundation", "requirements": ["Primary Business Owner assigned", "Business Function identified", "Status beyond Discovery"]}, {"id": "intake", "color": "#1D86FF", "order": 2, "title": "Intake & Prioritization", "subtitle": "Assessment", "principle": "Must be properly assessed before building", "targetPhase": "strategic", "requirements": ["Complete 10-lever scoring (all Impact & Effort levers)"]}, {"id": "rai", "color": "#14CBDE", "order": 3, "title": "Responsible AI", "subtitle": "Compliance", "principle": "Must clear ethical/compliance review before production", "targetPhase": "transition", "requirements": ["Complete RAI questionnaire (5 key fields)"]}], "governanceBodies": [{"id": "ai_steerco", "name": "AI Steering Committee", "role": "Strategic oversight and investment decisions", "cadence": "Monthly"}, {"id": "working_group", "name": "AI Working Group", "role": "Tactical execution and prioritization", "cadence": "Bi-weekly"}, {"id": "business_owner", "name": "Business Owner Review", "role": "Value validation and adoption sign-off", "cadence": "Weekly"}, {"id": "innovation_board", "name": "Innovation Board", "role": "Early-stage opportunity assessment and ideation approval", "cadence": "Weekly"}], "phaseTransitions": [{"toPhase": "strategic", "fromPhase": "foundation", "description": "Gate 2: Full 10-lever scoring must be complete before active development", "requiredGate": "intake"}, {"toPhase": "transition", "fromPhase": "strategic", "description": "Gate 3: Responsible AI clearance required before production deployment", "requiredGate": "rai"}, {"toPhase": "steady_state", "fromPhase": "transition", "description": "Transition to full client ownership", "requiredGate": "none"}, {"toPhase": "assessment", "fromPhase": "ideation", "requiredGate": "operatingModel"}, {"toPhase": "foundation", "fromPhase": "assessment", "requiredGate": "intake"}, {"toPhase": "build", "fromPhase": "foundation", "requiredGate": "rai"}]}'::jsonb, NULL, '{"enabled": "true", "certifications": [{"id": "cert_001", "name": "AI/ML Foundations", "description": "Basic understanding of AI/ML concepts", "estimatedHours": 16, "targetAudience": ["Business Analyst", "Project Manager"]}, {"id": "cert_002", "name": "Platform Operations", "description": "Deployment, monitoring, and troubleshooting", "estimatedHours": 24, "targetAudience": ["Data Engineer", "ML Engineer"]}, {"id": "cert_003", "name": "Model Development", "description": "Model training, evaluation, and optimization", "estimatedHours": 40, "targetAudience": ["ML Engineer", "Data Scientist"]}, {"id": "cert_004", "name": "AI Governance & Ethics", "description": "Responsible AI principles and compliance", "estimatedHours": 8, "targetAudience": ["All roles"]}], "roleTransitions": [{"role": "Solution Architect", "clientEndFte": 1, "vendorStartFte": 1, "transitionMonth": 12}, {"role": "Data Engineer", "clientEndFte": 2, "vendorStartFte": 2, "transitionMonth": 9}, {"role": "ML Engineer", "clientEndFte": 1.5, "vendorStartFte": 2, "transitionMonth": 12}, {"role": "Business Analyst", "clientEndFte": 1, "vendorStartFte": 1, "transitionMonth": 6}, {"role": "QA Engineer", "clientEndFte": 1, "vendorStartFte": 1, "transitionMonth": 9}, {"role": "Project Manager", "clientEndFte": 0.5, "vendorStartFte": 0.5, "transitionMonth": 6}], "independenceTargets": {"strategic": {"max": 50, "min": 20, "description": "Joint execution, client learning"}, "foundation": {"max": 20, "min": 0, "description": "Vendor-led, client observing"}, "transition": {"max": 85, "min": 50, "description": "Client-led, vendor supporting"}, "steadyState": {"max": 100, "min": 85, "description": "Client self-sufficient"}}, "knowledgeTransferMilestones": [{"id": "kt_001", "name": "Solution Design Handover", "order": 1, "phase": "foundation", "description": "Client team understands architecture and design decisions", "requiredArtifacts": ["Architecture diagram", "Design decisions doc"]}, {"id": "kt_002", "name": "Development Shadowing Complete", "order": 2, "phase": "strategic", "description": "Client developers have paired on all major components", "requiredArtifacts": ["Pairing log", "Code walkthrough recordings"]}, {"id": "kt_003", "name": "Operations Handover", "order": 3, "phase": "strategic", "description": "Client ops team can deploy, monitor, and troubleshoot", "requiredArtifacts": ["Runbook", "Monitoring dashboard access"]}, {"id": "kt_004", "name": "First Client-Led Release", "order": 4, "phase": "transition", "description": "Client team completes a release without vendor assistance", "requiredArtifacts": ["Release notes", "Post-release review"]}, {"id": "kt_005", "name": "Model Retraining Capability", "order": 5, "phase": "transition", "description": "Client team can retrain and deploy model updates", "requiredArtifacts": ["Retraining procedure", "Model registry access"]}, {"id": "kt_006", "name": "Full Independence Certification", "order": 6, "phase": "steadyState", "description": "Client team certified to operate without vendor support", "requiredArtifacts": ["Capability assessment", "Sign-off document"]}]}'::jsonb, NULL, '{"scoring": {"quadrant": {"formula": "Compare Impact vs Effort against threshold", "description": "Impact >= threshold AND Effort <= threshold \u2192 Quick Win; Impact >= threshold AND Effort > threshold \u2192 Strategic Bet; etc.", "thresholdDefault": 3}, "effortScore": {"levers": ["dataReadiness", "technicalComplexity", "changeImpact", "modelRisk", "adoptionReadiness"], "example": "Higher scores mean MORE ready, so we invert for effort calculation", "formula": "Weighted average of Feasibility levers (inverted)", "description": "Sum of ((6 - lever_score) \u00d7 lever_weight) / 100 for complexity-based effort"}, "impactScore": {"levers": ["revenueImpact", "costSavings", "riskReduction", "brokerPartnerExperience", "strategicFit"], "example": "(3\u00d720 + 4\u00d720 + 3\u00d720 + 2\u00d720 + 4\u00d720) / 100 = 3.2", "formula": "Weighted average of Business Value levers", "description": "Sum of (lever_score \u00d7 lever_weight) / 100 for all impact levers"}}, "tomPhase": {"formula": "Status \u2192 TOM Phase mapping with manual override support", "description": "Derives lifecycle phase from implementation status", "overrideField": "tomPhaseOverride"}, "capability": {"baseFte": {"values": {"L": 4, "M": 2, "S": 1, "XL": 8, "XS": 0.5}, "formula": "T-shirt size \u2192 Base FTE mapping", "description": "Maps implementation complexity to required resources"}, "independence": {"formula": "Archetype-based independence curve", "archetypes": {}, "description": "Target independence level based on use case complexity"}, "transitionSpeed": {"values": {"Quick Win": 1.5, "Watchlist": 0.8, "Experimental": 1.2, "Strategic Bet": 1}, "formula": "Quadrant-based pace modifier", "description": "Quick Wins transition faster than Strategic Bets"}}, "testUpdate": "true", "lastUpdated": "2026-01-20T16:28:48.451Z", "valueRealization": {"roi": {"formula": "((cumulativeValue - totalInvestment) / totalInvestment) \u00d7 100", "description": "Return on Investment as a percentage"}, "breakeven": {"formula": "totalInvestment / monthlyValue", "description": "Number of months until investment is recovered"}, "hourlyRate": 45, "kpiMatching": {"formula": "Match use case processes to KPI applicableProcesses", "description": "Fuzzy matching of processes to KPIs"}}}'::jsonb
);

-- ============================================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================================

-- Verify all records imported correctly
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'engagements', COUNT(*) FROM engagements
UNION ALL
SELECT 'use_cases', COUNT(*) FROM use_cases
UNION ALL
SELECT 'metadata_config', COUNT(*) FROM metadata_config;

-- Verify use case count by meaningful_id prefix
SELECT 
    CASE 
        WHEN meaningful_id LIKE 'HEX_AITOOL%' THEN 'HEX_AITOOL'
        WHEN meaningful_id LIKE 'HEX_IND%' THEN 'HEX_IND'
        WHEN meaningful_id LIKE 'HEX_INT%' THEN 'HEX_INT'
        WHEN meaningful_id LIKE 'MKL%' THEN 'MKL_US'
        ELSE 'Other'
    END as prefix,
    COUNT(*) as count
FROM use_cases
GROUP BY 1
ORDER BY 2 DESC;

-- Verify governance fields are populated
SELECT 
    governance_status,
    COUNT(*) as count
FROM use_cases
GROUP BY governance_status;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Expected results:
-- - clients: 1
-- - engagements: 1
-- - use_cases: 138
-- - metadata_config: 1
--
-- Use case breakdown:
-- - HEX_AITOOL: 46
-- - HEX_IND: 28
-- - HEX_INT: 51
-- - MKL_US: 12
-- - Other: 1
-- ============================================================
