import { storage } from '../storage';

const COLUMN_MAPPINGS: Record<string, Record<string, string>> = {
  clients: {
    id: 'id',
    name: 'name',
    description: 'description',
    industry: 'industry',
    contactName: 'contact_name',
    contactEmail: 'contact_email',
    currency: 'currency',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  engagements: {
    id: 'id',
    clientId: 'client_id',
    name: 'name',
    description: 'description',
    tomPresetId: 'tom_preset_id',
    tomPresetLocked: 'tom_preset_locked',
    tomPhasesJson: 'tom_phases_json',
    startDate: 'start_date',
    endDate: 'end_date',
    status: 'status',
    isDefault: 'is_default',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    governanceConfig: 'governance_config',
    valueConfig: 'value_config',
    capabilityConfig: 'capability_config'
  },
  use_cases: {
    id: 'id',
    meaningfulId: 'meaningful_id',
    engagementId: 'engagement_id',
    title: 'title',
    description: 'description',
    problemStatement: 'problem_statement',
    useCaseType: 'use_case_type',
    processes: 'processes',
    activities: 'activities',
    linesOfBusiness: 'lines_of_business',
    businessSegments: 'business_segments',
    geographies: 'geographies',
    revenueImpact: 'revenue_impact',
    costSavings: 'cost_savings',
    riskReduction: 'risk_reduction',
    brokerPartnerExperience: 'broker_partner_experience',
    strategicFit: 'strategic_fit',
    dataReadiness: 'data_readiness',
    technicalComplexity: 'technical_complexity',
    changeImpact: 'change_impact',
    modelRisk: 'model_risk',
    adoptionReadiness: 'adoption_readiness',
    explainabilityRequired: 'explainability_required',
    customerHarmRisk: 'customer_harm_risk',
    dataOutsideUkEu: 'data_outside_uk_eu',
    thirdPartyModel: 'third_party_model',
    humanAccountability: 'human_accountability',
    regulatoryCompliance: 'regulatory_compliance',
    aiOrModel: 'ai_or_model',
    riskToCustomers: 'risk_to_customers',
    riskToRsa: 'risk_to_rsa',
    dataUsed: 'data_used',
    modelOwner: 'model_owner',
    rsaPolicyGovernance: 'rsa_policy_governance',
    validationResponsibility: 'validation_responsibility',
    informedBy: 'informed_by',
    businessFunction: 'business_function',
    thirdPartyProvidedModel: 'third_party_provided_model',
    impactScore: 'impact_score',
    effortScore: 'effort_score',
    quadrant: 'quadrant',
    recommendedByAssessment: 'recommended_by_assessment',
    manualImpactScore: 'manual_impact_score',
    manualEffortScore: 'manual_effort_score',
    manualQuadrant: 'manual_quadrant',
    overrideReason: 'override_reason',
    isActiveForRsa: 'is_active_for_rsa',
    isDashboardVisible: 'is_dashboard_visible',
    libraryTier: 'library_tier',
    activationDate: 'activation_date',
    activationReason: 'activation_reason',
    deactivationReason: 'deactivation_reason',
    librarySource: 'library_source',
    aiInventoryStatus: 'ai_inventory_status',
    deploymentStatus: 'deployment_status',
    lastStatusUpdate: 'last_status_update',
    primaryBusinessOwner: 'primary_business_owner',
    deliveryOwner: 'delivery_owner',
    valueValidator: 'value_validator',
    valueGovernanceModel: 'value_governance_model',
    useCaseStatus: 'use_case_status',
    keyDependencies: 'key_dependencies',
    implementationTimeline: 'implementation_timeline',
    successMetrics: 'success_metrics',
    estimatedValue: 'estimated_value',
    valueMeasurementApproach: 'value_measurement_approach',
    integrationRequirements: 'integration_requirements',
    aiMlTechnologies: 'ai_ml_technologies',
    dataSources: 'data_sources',
    stakeholderGroups: 'stakeholder_groups',
    horizontalUseCase: 'horizontal_use_case',
    horizontalUseCaseTypes: 'horizontal_use_case_types',
    presentationFileId: 'presentation_file_id',
    presentationPdfFileId: 'presentation_pdf_file_id',
    presentationFileName: 'presentation_file_name',
    presentationUploadedAt: 'presentation_uploaded_at',
    hasPresentation: 'has_presentation',
    tShirtSize: 't_shirt_size',
    estimatedCostMin: 'estimated_cost_min',
    estimatedCostMax: 'estimated_cost_max',
    estimatedWeeksMin: 'estimated_weeks_min',
    estimatedWeeksMax: 'estimated_weeks_max',
    teamSizeEstimate: 'team_size_estimate',
    tomPhase: 'tom_phase',
    tomPhaseOverride: 'tom_phase_override',
    phaseEnteredAt: 'phase_entered_at',
    lastPhaseTransitionReason: 'last_phase_transition_reason',
    tomOverrideReason: 'tom_override_reason',
    raiRiskTier: 'rai_risk_tier',
    raiAssessmentRequired: 'rai_assessment_required',
    governanceStatus: 'governance_status',
    legacyActivationFlag: 'legacy_activation_flag',
    governancePendingReason: 'governance_pending_reason',
    operatingModelApproval: 'operating_model_approval',
    operatingModelApprovedAt: 'operating_model_approved_at',
    operatingModelApprovedBy: 'operating_model_approved_by',
    operatingModelNotes: 'operating_model_notes',
    intakeDecision: 'intake_decision',
    intakeDecisionAt: 'intake_decision_at',
    intakeDecisionBy: 'intake_decision_by',
    intakeDecisionNotes: 'intake_decision_notes',
    intakePriorityRank: 'intake_priority_rank',
    raiAssurance: 'rai_assurance',
    raiAssuranceAt: 'rai_assurance_at',
    raiAssuranceBy: 'rai_assurance_by',
    raiAssuranceNotes: 'rai_assurance_notes',
    raiRiskLevel: 'rai_risk_level',
    governanceCompletedAt: 'governance_completed_at',
    governanceCompletedBy: 'governance_completed_by',
    valueRealization: 'value_realization',
    capabilityTransition: 'capability_transition',
    duplicateStatus: 'duplicate_status',
    duplicateSimilarTo: 'duplicate_similar_to',
    duplicateSimilarityScore: 'duplicate_similarity_score',
    duplicateReviewedAt: 'duplicate_reviewed_at',
    duplicateReviewedBy: 'duplicate_reviewed_by',
    createdAt: 'created_at'
  },
  metadata_config: {
    id: 'id',
    valueChainComponents: 'value_chain_components',
    processes: 'processes',
    linesOfBusiness: 'lines_of_business',
    businessSegments: 'business_segments',
    geographies: 'geographies',
    useCaseTypes: 'use_case_types',
    updatedAt: 'updated_at',
    activities: 'activities',
    processActivities: 'process_activities',
    scoringModel: 'scoring_model',
    sourceTypes: 'source_types',
    useCaseStatuses: 'use_case_statuses',
    aiMlTechnologies: 'ai_ml_technologies',
    dataSources: 'data_sources',
    stakeholderGroups: 'stakeholder_groups',
    quadrants: 'quadrants',
    questionTypes: 'question_types',
    responseStatuses: 'response_statuses',
    companyTiers: 'company_tiers',
    marketOptions: 'market_options',
    questionCategories: 'question_categories',
    horizontalUseCaseTypes: 'horizontal_use_case_types',
    processesSortOrder: 'processes_sort_order',
    linesOfBusinessSortOrder: 'lines_of_business_sort_order',
    businessSegmentsSortOrder: 'business_segments_sort_order',
    geographiesSortOrder: 'geographies_sort_order',
    useCaseTypesSortOrder: 'use_case_types_sort_order',
    sourceTypesSortOrder: 'source_types_sort_order',
    dataSourcesSortOrder: 'data_sources_sort_order',
    stakeholderGroupsSortOrder: 'stakeholder_groups_sort_order',
    scoringDropdownOptions: 'scoring_dropdown_options',
    processActivitiesSortOrder: 'process_activities_sort_order',
    tShirtSizing: 't_shirt_sizing',
    tomConfig: 'tom_config',
    capabilityTransitionConfig: 'capability_transition_config',
    derivationFormulas: 'derivation_formulas'
  }
};

function escapeString(value: string): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

function formatValue(value: any, isArray: boolean = false): string {
  if (value === null || value === undefined) return 'NULL';
  
  if (isArray && Array.isArray(value)) {
    if (value.length === 0) return "'{}'";
    const escaped = value.map(v => escapeString(String(v)).slice(1, -1)).join(', ');
    return `ARRAY[${value.map(v => escapeString(String(v))).join(', ')}]::TEXT[]`;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::JSONB`;
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'boolean') {
    return value ? "'true'" : "'false'";
  }
  
  if (value instanceof Date) {
    return escapeString(value.toISOString());
  }
  
  return escapeString(String(value));
}

function getSnakeCase(tableName: string, camelCaseKey: string): string {
  const mapping = COLUMN_MAPPINGS[tableName];
  if (mapping && mapping[camelCaseKey]) {
    return mapping[camelCaseKey];
  }
  return camelCaseKey.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function generateInsertStatement(tableName: string, data: Record<string, any>, arrayFields: string[] = []): string {
  const columns: string[] = [];
  const values: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    
    const snakeCaseColumn = getSnakeCase(tableName, key);
    columns.push(snakeCaseColumn);
    
    const isArrayField = arrayFields.includes(key);
    values.push(formatValue(value, isArrayField));
  }
  
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

export class SqlExportService {
  static async generateAzureExportSql(): Promise<string> {
    const lines: string[] = [];
    
    lines.push('-- ============================================');
    lines.push('-- Hexaware AI Use Case Value Framework');
    lines.push('-- Complete Database Export for Azure PostgreSQL');
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('-- SSOT: Generated programmatically from schema.ts');
    lines.push('-- ============================================');
    lines.push('');
    lines.push('-- Enable UUID extension (required for gen_random_uuid())');
    lines.push('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    lines.push('');
    
    lines.push(this.generateTableDefinitions());
    lines.push('');
    lines.push(this.generateIndexes());
    lines.push('');
    
    lines.push('-- ============================================');
    lines.push('-- DATA EXPORT');
    lines.push('-- ============================================');
    lines.push('');
    
    const clients = await storage.getAllClients();
    if (clients.length > 0) {
      lines.push('-- Clients');
      for (const client of clients) {
        lines.push(generateInsertStatement('clients', client));
      }
      lines.push('');
    }
    
    const engagements = await storage.getAllEngagements();
    if (engagements.length > 0) {
      lines.push('-- Engagements');
      for (const engagement of engagements) {
        lines.push(generateInsertStatement('engagements', engagement));
      }
      lines.push('');
    }
    
    const metadata = await storage.getMetadataConfig();
    if (metadata) {
      lines.push('-- Metadata Config');
      const arrayFields = [
        'valueChainComponents', 'processes', 'linesOfBusiness', 'businessSegments',
        'geographies', 'useCaseTypes', 'activities', 'sourceTypes', 'useCaseStatuses',
        'aiMlTechnologies', 'dataSources', 'stakeholderGroups', 'quadrants',
        'questionTypes', 'responseStatuses', 'companyTiers', 'marketOptions',
        'questionCategories', 'horizontalUseCaseTypes'
      ];
      lines.push(generateInsertStatement('metadata_config', metadata, arrayFields));
      lines.push('');
    }
    
    const useCases = await storage.getAllUseCases();
    if (useCases.length > 0) {
      lines.push(`-- Use Cases (${useCases.length} records)`);
      const useCaseArrayFields = [
        'processes', 'activities', 'linesOfBusiness', 'businessSegments',
        'geographies', 'aiMlTechnologies', 'dataSources', 'stakeholderGroups',
        'horizontalUseCaseTypes', 'duplicateSimilarTo'
      ];
      for (const useCase of useCases) {
        lines.push(generateInsertStatement('use_cases', useCase, useCaseArrayFields));
      }
      lines.push('');
    }
    
    lines.push('-- ============================================');
    lines.push('-- Export Complete');
    lines.push('-- ============================================');
    
    return lines.join('\n');
  }
  
  private static generateTableDefinitions(): string {
    return `
-- ============================================
-- TABLE DEFINITIONS
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    contact_name TEXT,
    contact_email TEXT,
    is_active TEXT NOT NULL DEFAULT 'true',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    currency TEXT NOT NULL DEFAULT 'GBP'
);

-- Engagements table
CREATE TABLE IF NOT EXISTS engagements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    description TEXT,
    tom_preset_id TEXT NOT NULL,
    tom_preset_locked TEXT NOT NULL DEFAULT 'false',
    tom_phases_json JSONB,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active',
    is_default TEXT NOT NULL DEFAULT 'false',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    governance_config JSONB,
    value_config JSONB,
    capability_config JSONB
);

-- File attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id VARCHAR,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'presentation',
    uploaded_at TIMESTAMP DEFAULT NOW(),
    local_path TEXT
);

-- Use cases table
CREATE TABLE IF NOT EXISTS use_cases (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    meaningful_id VARCHAR UNIQUE,
    engagement_id VARCHAR,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT,
    use_case_type TEXT,
    processes TEXT[],
    activities TEXT[],
    lines_of_business TEXT[],
    business_segments TEXT[],
    geographies TEXT[],
    revenue_impact INTEGER NOT NULL,
    cost_savings INTEGER NOT NULL,
    risk_reduction INTEGER NOT NULL,
    broker_partner_experience INTEGER NOT NULL,
    strategic_fit INTEGER NOT NULL,
    data_readiness INTEGER NOT NULL,
    technical_complexity INTEGER NOT NULL,
    change_impact INTEGER NOT NULL,
    model_risk INTEGER NOT NULL,
    adoption_readiness INTEGER NOT NULL,
    explainability_required TEXT DEFAULT 'false',
    customer_harm_risk TEXT,
    data_outside_uk_eu TEXT DEFAULT 'false',
    third_party_model TEXT DEFAULT 'false',
    human_accountability TEXT DEFAULT 'false',
    regulatory_compliance INTEGER DEFAULT 3,
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
    impact_score REAL NOT NULL,
    effort_score REAL NOT NULL,
    quadrant TEXT NOT NULL,
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
    presentation_file_id VARCHAR,
    presentation_pdf_file_id VARCHAR,
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

-- Metadata config table
CREATE TABLE IF NOT EXISTS metadata_config (
    id VARCHAR PRIMARY KEY,
    value_chain_components TEXT[],
    processes TEXT[],
    lines_of_business TEXT[],
    business_segments TEXT[],
    geographies TEXT[],
    use_case_types TEXT[],
    updated_at TIMESTAMP DEFAULT NOW(),
    activities TEXT[],
    process_activities JSONB,
    scoring_model JSONB,
    source_types TEXT[],
    use_case_statuses TEXT[],
    ai_ml_technologies TEXT[],
    data_sources TEXT[],
    stakeholder_groups TEXT[],
    quadrants TEXT[],
    question_types TEXT[],
    response_statuses TEXT[],
    company_tiers TEXT[],
    market_options TEXT[],
    question_categories TEXT[],
    horizontal_use_case_types TEXT[],
    processes_sort_order JSONB,
    lines_of_business_sort_order JSONB,
    business_segments_sort_order JSONB,
    geographies_sort_order JSONB,
    use_case_types_sort_order JSONB,
    source_types_sort_order JSONB,
    data_sources_sort_order JSONB,
    stakeholder_groups_sort_order JSONB,
    scoring_dropdown_options JSONB,
    process_activities_sort_order JSONB,
    t_shirt_sizing JSONB,
    tom_config JSONB,
    capability_transition_config JSONB,
    derivation_formulas JSONB
);

-- Use case change log table
CREATE TABLE IF NOT EXISTS use_case_change_log (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id VARCHAR NOT NULL,
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

-- Governance audit log table
CREATE TABLE IF NOT EXISTS governance_audit_log (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id VARCHAR NOT NULL,
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
);`;
  }
  
  private static generateIndexes(): string {
    return `
-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_use_cases_meaningful_id ON use_cases(meaningful_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_library_tier ON use_cases(library_tier);
CREATE INDEX IF NOT EXISTS idx_use_cases_is_active ON use_cases(is_active_for_rsa);
CREATE INDEX IF NOT EXISTS idx_use_cases_quadrant ON use_cases(quadrant);
CREATE INDEX IF NOT EXISTS idx_use_cases_engagement ON use_cases(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagements_client ON engagements(client_id);
CREATE INDEX IF NOT EXISTS idx_change_log_use_case ON use_case_change_log(use_case_id);
CREATE INDEX IF NOT EXISTS idx_governance_log_use_case ON governance_audit_log(use_case_id);`;
  }
}
