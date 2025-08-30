import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const useCases: any = pgTable("use_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meaningfulId: varchar("meaningful_id").unique(), // Human-readable ID like RSA-CLA-001
  title: text("title").notNull(),
  description: text("description").notNull(),
  problemStatement: text("problem_statement"),
  process: text("process"), // Made optional to minimize validation barriers
  lineOfBusiness: text("line_of_business"), // Made optional to minimize validation barriers
  linesOfBusiness: text("lines_of_business").array(),
  businessSegment: text("business_segment"), // Made optional to minimize validation barriers
  geography: text("geography"), // Made optional to minimize validation barriers
  useCaseType: text("use_case_type"), // Made optional to minimize validation barriers
  activity: text("activity"), // Optional field for granular process classification
  // Multi-select array fields for enhanced flexibility
  processes: text("processes").array(), // Multiple processes support
  activities: text("activities").array(), // Multiple activities support  
  businessSegments: text("business_segments").array(), // Multiple segments support
  geographies: text("geographies").array(), // Multiple geographies support
  // Business Impact Levers (Impact Score)
  revenueImpact: integer("revenue_impact").notNull(),
  costSavings: integer("cost_savings").notNull(),
  riskReduction: integer("risk_reduction").notNull(),
  brokerPartnerExperience: integer("broker_partner_experience").notNull(),
  strategicFit: integer("strategic_fit").notNull(),
  
  // Implementation Effort Levers (Effort Score)
  dataReadiness: integer("data_readiness").notNull(),
  technicalComplexity: integer("technical_complexity").notNull(),
  changeImpact: integer("change_impact").notNull(),
  modelRisk: integer("model_risk").notNull(),
  adoptionReadiness: integer("adoption_readiness").notNull(),
  
  // RSA Ethical Principles - standardized to string types for consistency
  explainabilityRequired: text("explainability_required"), // 'true' or 'false'
  customerHarmRisk: text("customer_harm_risk"),
  dataOutsideUkEu: text("data_outside_uk_eu"), // 'true' or 'false'
  thirdPartyModel: text("third_party_model"), // 'true' or 'false'
  humanAccountability: text("human_accountability"), // 'true' or 'false'
  regulatoryCompliance: integer("regulatory_compliance"),
  
  // AI Inventory Governance Fields
  aiOrModel: text("ai_or_model"), // 'AI' or 'Model'
  riskToCustomers: text("risk_to_customers"), // risk assessment text
  riskToRsa: text("risk_to_rsa"), // RSA-specific risk assessment
  dataUsed: text("data_used"), // data sources description
  modelOwner: text("model_owner"), // owner contact information
  rsaPolicyGovernance: text("rsa_policy_governance"), // governance framework reference
  validationResponsibility: text("validation_responsibility"), // 'Internal' or 'Third Party'
  informedBy: text("informed_by"), // stakeholder information
  businessFunction: text("business_function"), // Business function (Marketing, CIO, Claims, etc.)
  thirdPartyProvidedModel: text("third_party_provided_model"), // Whether it's a third-party provided model
  
  impactScore: real("impact_score").notNull(),
  effortScore: real("effort_score").notNull(),
  quadrant: text("quadrant").notNull(),
  recommendedByAssessment: text("recommended_by_assessment"), // Assessment response ID that recommended this use case
  
  // Manual Score Override System
  manualImpactScore: real("manual_impact_score"), // Optional manual override for impact score
  manualEffortScore: real("manual_effort_score"), // Optional manual override for effort score
  manualQuadrant: text("manual_quadrant"), // Optional manual override for quadrant
  overrideReason: text("override_reason"), // Reason for manual override
  
  // Two-tier library system
  isActiveForRsa: text("is_active_for_rsa").notNull().default('false'), // 'true' or 'false'
  isDashboardVisible: text("is_dashboard_visible").notNull().default('false'), // 'true' or 'false'
  libraryTier: text("library_tier").notNull().default('reference'), // 'active' or 'reference'
  activationDate: timestamp("activation_date").defaultNow(),
  activationReason: text("activation_reason"), // Required when isActiveForRsa = 'true'
  deactivationReason: text("deactivation_reason"),
  librarySource: text("library_source").notNull().default('rsa_internal'), // 'rsa_internal', 'industry_standard', 'ai_inventory'
  
  // AI Inventory specific fields
  aiInventoryStatus: text("ai_inventory_status"), // 'Active', 'Proof_of_Concept', 'Pending_Closure', 'Obsolete', 'Inactive'
  deploymentStatus: text("deployment_status"), // 'PoC', 'Pilot', 'Production', 'Decommissioned'
  lastStatusUpdate: timestamp("last_status_update"),
  
  // Tab 3: Implementation & Governance fields
  primaryBusinessOwner: text("primary_business_owner"),
  useCaseStatus: text("use_case_status").default('Discovery'), // Discovery, Backlog, In-flight, Implemented, On Hold
  keyDependencies: text("key_dependencies"),
  implementationTimeline: text("implementation_timeline"),
  successMetrics: text("success_metrics"),
  estimatedValue: text("estimated_value"), // Using text to allow for currency formatting
  valueMeasurementApproach: text("value_measurement_approach"),
  integrationRequirements: text("integration_requirements"),
  aiMlTechnologies: text("ai_ml_technologies").array(),
  dataSources: text("data_sources").array(),
  stakeholderGroups: text("stakeholder_groups").array(),
  
  // Horizontal Use Case feature - following replit.md string boolean pattern
  horizontalUseCase: text("horizontal_use_case").default('false'), // 'true' or 'false'
  horizontalUseCaseTypes: text("horizontal_use_case_types").array(), // Array of selected horizontal use case types
  
  // PowerPoint Presentation Integration - Database Storage
  presentationFileId: varchar("presentation_file_id").references(() => fileAttachments.id), // Reference to original file
  presentationPdfFileId: varchar("presentation_pdf_file_id").references(() => fileAttachments.id), // Reference to PDF version
  presentationFileName: text("presentation_file_name"),
  presentationUploadedAt: timestamp("presentation_uploaded_at"),
  hasPresentation: text("has_presentation").default('false'), // 'true' or 'false' following replit.md pattern
  
  // Legacy URL fields - kept for backward compatibility and migration
  presentationUrl: text("presentation_url"), // Will be deprecated after migration
  presentationPdfUrl: text("presentation_pdf_url"), // Will be deprecated after migration
  
  createdAt: timestamp("created_at").defaultNow(),
});

// File attachments table for storing binary data in database
export const fileAttachments: any = pgTable("file_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  useCaseId: varchar("use_case_id").references(() => useCases.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded binary data
  fileType: text("file_type").notNull().default('presentation'), // 'presentation', 'pdf'
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUseCaseSchema = createInsertSchema(useCases).omit({
  id: true,
  impactScore: true,
  effortScore: true,
  quadrant: true,
  createdAt: true,
  activationDate: true,
  lastStatusUpdate: true, // Auto-managed field
}).extend({
  // Minimal required fields - only title and description are essential, relaxed character limits
  title: z.string().min(1, "Please enter a title for this use case").max(200, "Title must be shorter than 200 characters"),
  description: z.string().min(1, "Please provide a brief description").max(2000, "Description must be shorter than 2000 characters"),
  // All other fields are optional to minimize validation barriers
  problemStatement: z.union([z.string(), z.null()]).optional(),
  process: z.union([z.string(), z.null()]).optional(),
  lineOfBusiness: z.union([z.string(), z.null()]).optional(),
  businessSegment: z.union([z.string(), z.null()]).optional(),
  geography: z.union([z.string(), z.null()]).optional(),
  useCaseType: z.union([z.string(), z.null()]).optional(),
  activity: z.union([z.string(), z.null()]).optional(),
  valueChainComponent: z.union([z.string(), z.null()]).optional(),
  // Business Impact Levers (Impact Score) - simplified validation per replit.md
  revenueImpact: z.number().min(1).max(5).optional(),
  costSavings: z.number().min(1).max(5).optional(),
  riskReduction: z.number().min(1).max(5).optional(),
  brokerPartnerExperience: z.number().min(1).max(5).optional(),
  strategicFit: z.number().min(1).max(5).optional(),
  // Implementation Effort Levers (Effort Score) - simplified validation per replit.md
  dataReadiness: z.number().min(1).max(5).optional(),
  technicalComplexity: z.number().min(1).max(5).optional(),
  changeImpact: z.number().min(1).max(5).optional(),
  modelRisk: z.number().min(1).max(5).optional(),
  adoptionReadiness: z.number().min(1).max(5).optional(),
  // Additional scoring fields
  regulatoryCompliance: z.union([z.number().min(1).max(5), z.null()]).optional(),
  // Final scoring fields - simplified per replit.md
  finalImpactScore: z.number().optional(),
  finalEffortScore: z.number().optional(),
  finalQuadrant: z.string().optional(),
  
  linesOfBusiness: z.array(z.string()).optional(),
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  // Boolean fields - simplified to consistent string enums
  isActiveForRsa: z.enum(['true', 'false']).default('false'),
  isDashboardVisible: z.enum(['true', 'false']).default('false'),
  libraryTier: z.enum(['active', 'reference']).default('reference'),
  librarySource: z.enum(['rsa_internal', 'hexaware_external', 'industry_standard', 'imported', 'ai_inventory']).default('rsa_internal'),
  activationReason: z.union([z.string(), z.null()]).optional(),
  deactivationReason: z.union([z.string(), z.null()]).optional(),
  // Manual override fields - simplified per replit.md, allow null for clearing
  manualImpactScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualEffortScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualQuadrant: z.union([z.string(), z.null()]).optional(),
  overrideReason: z.union([z.string(), z.null()]).optional(),
  // Tab 3: Implementation & Governance fields - allow null for import compatibility
  primaryBusinessOwner: z.union([z.string(), z.null()]).optional(),
  useCaseStatus: z.union([z.string(), z.null()]).optional(), // Now dynamic from metadata
  keyDependencies: z.union([z.string(), z.null()]).optional(),
  implementationTimeline: z.union([z.string(), z.null()]).optional(),
  successMetrics: z.union([z.string(), z.null()]).optional(),
  estimatedValue: z.union([z.string(), z.null()]).optional(),
  valueMeasurementApproach: z.union([z.string(), z.null()]).optional(),
  integrationRequirements: z.union([z.string(), z.null()]).optional(),
  aiMlTechnologies: z.array(z.string()).optional(),
  dataSources: z.array(z.string()).optional(),
  stakeholderGroups: z.array(z.string()).optional(),
  // AI Inventory Governance Fields - allow null for import compatibility
  customerHarmRisk: z.union([z.string(), z.null()]).optional(),
  aiOrModel: z.union([z.string(), z.null()]).optional(),
  riskToCustomers: z.union([z.string(), z.null()]).optional(),
  riskToRsa: z.union([z.string(), z.null()]).optional(),
  dataUsed: z.union([z.string(), z.null()]).optional(),
  modelOwner: z.union([z.string(), z.null()]).optional(),
  rsaPolicyGovernance: z.union([z.string(), z.null()]).optional(),
  validationResponsibility: z.union([z.string(), z.null()]).optional(),
  informedBy: z.union([z.string(), z.null()]).optional(),
  businessFunction: z.union([z.string(), z.null()]).optional(),
  thirdPartyProvidedModel: z.union([z.string(), z.null()]).optional(),
  // AI Inventory specific fields (flexible for import - allow any string values)
  aiInventoryStatus: z.union([z.string(), z.null()]).optional(),
  deploymentStatus: z.union([z.string(), z.null()]).optional(),
  // RSA Ethical Principles - simplified to consistent string enums per replit.md
  explainabilityRequired: z.enum(['true', 'false']).optional(),
  dataOutsideUkEu: z.enum(['true', 'false']).optional(),
  thirdPartyModel: z.enum(['true', 'false']).optional(),
  humanAccountability: z.enum(['true', 'false']).optional(),
  
  // Horizontal Use Case fields - following replit.md string boolean pattern
  horizontalUseCase: z.enum(['true', 'false']).default('false'),
  horizontalUseCaseTypes: z.array(z.string()).optional(),
  
  // PowerPoint Presentation fields - following replit.md patterns (allow null for compatibility)
  presentationUrl: z.union([z.string(), z.null()]).optional(),
  presentationPdfUrl: z.union([z.string(), z.null()]).optional(),
  presentationFileName: z.union([z.string(), z.null()]).optional(),
  hasPresentation: z.enum(['true', 'false']).default('false'),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UseCase = typeof useCases.$inferSelect;
export type InsertUseCase = z.infer<typeof insertUseCaseSchema>;

// File attachment schema and types
export const insertFileAttachmentSchema = createInsertSchema(fileAttachments).omit({
  id: true,
  uploadedAt: true,
});

export type FileAttachment = typeof fileAttachments.$inferSelect;
export type InsertFileAttachment = z.infer<typeof insertFileAttachmentSchema>;

// Metadata configuration schema for database persistence
export const metadataConfig = pgTable('metadata_config', {
  id: text('id').primaryKey().default('default'),
  valueChainComponents: text('value_chain_components').array().notNull(),
  processes: text('processes').array().notNull(),
  linesOfBusiness: text('lines_of_business').array().notNull(),
  businessSegments: text('business_segments').array().notNull(),
  geographies: text('geographies').array().notNull(),
  useCaseTypes: text('use_case_types').array().notNull(),
  activities: text('activities').array().notNull().default(sql`'{}'`),
  sourceTypes: text('source_types').array().notNull().default(sql`'{"rsa_internal","industry_standard","ai_inventory"}'`),
  // Tab 3 Implementation & Governance LOVs
  useCaseStatuses: text('use_case_statuses').array().notNull().default(sql`'{"Discovery","Backlog","In-flight","Implemented","On Hold"}'`),
  aiMlTechnologies: text('ai_ml_technologies').array().notNull().default(sql`'{"Machine Learning","Deep Learning","Natural Language Processing","Computer Vision","Predictive Analytics","Large Language Models","Reinforcement Learning","Rule-based Systems"}'`),
  dataSources: text('data_sources').array().notNull().default(sql`'{"Policy Database","Claims Database","Customer Database","External APIs","Third-party Data","Real-time Feeds","Historical Data","Regulatory Data"}'`),
  stakeholderGroups: text('stakeholder_groups').array().notNull().default(sql`'{"Underwriting Teams","Claims Teams","IT/Technology","Business Analytics","Risk Management","Compliance","Customer Service","External Partners"}'`),
  // Horizontal Use Case Types - new field for categorization
  horizontalUseCaseTypes: text('horizontal_use_case_types').array().notNull().default(sql`'{"Document drafting","report generation","Categorization","tagging","curation","Research assistant","information retrieval","Autofill","next-best action suggestions","autonomous agents","Debugging","refactoring","coding","Synthesis","summarization","Augmentation","visualization","Text versions for analysis","time series data generation","scenario generation","Suggestions for workflow amendments","automated changes to workflows","Errors","fraud","problem-solving"}'`),
  // Quadrant definitions for RSA AI Value Matrix
  quadrants: text('quadrants').array().notNull().default(sql`'{"Quick Win","Strategic Bet","Experimental","Watchlist"}'`),
  // Assessment and questionnaire LOVs
  questionTypes: text('question_types').array().notNull().default(sql`'{"text","textarea","select","multi_select","radio","checkbox","number","date","email","url","company_profile","business_lines_matrix","smart_rating","multi_rating","percentage_allocation","percentage_target","ranking","currency","department_skills_matrix","business_performance","composite","dynamic_use_case_selector"}'`),
  responseStatuses: text('response_statuses').array().notNull().default(sql`'{"started","in_progress","completed","abandoned"}'`),
  questionCategories: text('question_categories').array().notNull().default(sql`'{"Strategic Foundation","AI Capabilities","Use Case Discovery","Technology Infrastructure","Organizational Readiness","Risk & Compliance"}'`),
  // Company profile options
  companyTiers: text('company_tiers').array().notNull().default(sql`'{"Small (<£100M)","Mid (£100M-£3B)","Large (>£3B)"}'`),
  marketOptions: text('market_options').array().notNull().default(sql`'{"Personal Lines","Commercial Lines","Specialty Lines","Reinsurance"}'`),
  processActivities: text('process_activities').$type<Record<string, string[]> | string>(),
  scoringModel: text('scoring_model').$type<any>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const insertMetadataConfigSchema = createInsertSchema(metadataConfig);
export type MetadataConfig = typeof metadataConfig.$inferSelect;
export type InsertMetadataConfig = z.infer<typeof insertMetadataConfigSchema>;

// =============================================================================
// QUESTIONNAIRE BLOB STORAGE ARCHITECTURE
// Pure JSON blob storage with lightweight PostgreSQL session tracking
// =============================================================================

// =============================================================================
// HYBRID QUESTIONNAIRE ARCHITECTURE - POSTGRESQL + JSON BLOB STORAGE
// Lightweight session tracking in PostgreSQL + questionnaire data in JSON files
// =============================================================================

// Lightweight session tracking in PostgreSQL
export const responseSessions = pgTable("response_sessions", {
  id: varchar("id").primaryKey(), // Same as response ID
  questionnaireId: varchar("questionnaire_id").notNull(),
  respondentEmail: text("respondent_email").notNull(),
  respondentName: text("respondent_name"),
  status: text("status").notNull().default('started'), // 'started', 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  progressPercent: integer("progress_percent").notNull().default(0),
  currentSectionId: varchar("current_section_id"),
  currentQuestionId: varchar("current_question_id"),
  
  // File references to JSON blob storage
  questionnaireDefinitionPath: text("questionnaire_definition_path").notNull(), // Object storage path to questionnaire JSON
  responsePath: text("response_path"), // Object storage path to response JSON (created when first answer saved)
  
  // Scoring and analytics (computed from JSON data)
  totalScore: real("total_score"),
  sectionScores: jsonb("section_scores"), // { sectionId: score }
  
  // Metadata for quick queries without reading JSON files
  questionnaireVersion: text("questionnaire_version").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answeredQuestions: integer("answered_questions").notNull().default(0),
  totalPages: integer("total_pages").notNull().default(0),
  completedPages: integer("completed_pages").notNull().default(0),
});

export const insertResponseSessionSchema = createInsertSchema(responseSessions).extend({
  status: z.enum(['started', 'in_progress', 'completed', 'abandoned']).default('started'),
});

export type ResponseSession = typeof responseSessions.$inferSelect;
export type InsertResponseSession = z.infer<typeof insertResponseSessionSchema>;




