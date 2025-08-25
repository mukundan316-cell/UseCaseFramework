import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const useCases = pgTable("use_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  problemStatement: text("problem_statement"),
  process: text("process").notNull(),
  lineOfBusiness: text("line_of_business").notNull(),
  linesOfBusiness: text("lines_of_business").array(),
  businessSegment: text("business_segment").notNull(),
  geography: text("geography").notNull(),
  useCaseType: text("use_case_type").notNull(),
  activity: text("activity"), // Optional field for granular process classification
  // Multi-select array fields for enhanced flexibility
  processes: text("processes").array(), // Multiple processes support
  activities: text("activities").array(), // Multiple activities support  
  businessSegments: text("business_segments").array(), // Multiple segments support
  geographies: text("geographies").array(), // Multiple geographies support
  // Business Value Levers (Impact Score)
  revenueImpact: integer("revenue_impact").notNull(),
  costSavings: integer("cost_savings").notNull(),
  riskReduction: integer("risk_reduction").notNull(),
  brokerPartnerExperience: integer("broker_partner_experience").notNull(),
  strategicFit: integer("strategic_fit").notNull(),
  
  // Feasibility Levers (Effort Score)
  dataReadiness: integer("data_readiness").notNull(),
  technicalComplexity: integer("technical_complexity").notNull(),
  changeImpact: integer("change_impact").notNull(),
  modelRisk: integer("model_risk").notNull(),
  adoptionReadiness: integer("adoption_readiness").notNull(),
  
  // AI Governance Levers
  explainabilityBias: integer("explainability_bias").notNull(),
  regulatoryCompliance: integer("regulatory_compliance").notNull(),
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
  librarySource: text("library_source").notNull().default('rsa_internal'), // 'rsa_internal', 'hexaware_external', 'industry_standard', 'imported'
  
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
  
  createdAt: timestamp("created_at").defaultNow(),
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
}).extend({
  linesOfBusiness: z.array(z.string()).optional(),
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  isActiveForRsa: z.enum(['true', 'false']).default('false'),
  isDashboardVisible: z.enum(['true', 'false']).default('false'),
  libraryTier: z.enum(['active', 'reference']).default('reference'),
  librarySource: z.string().default('rsa_internal'), // Now dynamic from metadata
  activationReason: z.string().optional(),
  deactivationReason: z.string().optional(),
  // Manual override fields (accept null values for optional operation)
  manualImpactScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualEffortScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualQuadrant: z.union([z.enum(['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']), z.null()]).optional(),
  overrideReason: z.union([z.string(), z.null()]).optional(),
  // Tab 3: Implementation & Governance fields
  primaryBusinessOwner: z.string().optional(),
  useCaseStatus: z.string().optional(), // Now dynamic from metadata
  keyDependencies: z.string().optional(),
  implementationTimeline: z.string().optional(),
  successMetrics: z.string().optional(),
  estimatedValue: z.string().optional(),
  valueMeasurementApproach: z.string().optional(),
  integrationRequirements: z.string().optional(),
  aiMlTechnologies: z.array(z.string()).optional(),
  dataSources: z.array(z.string()).optional(),
  stakeholderGroups: z.array(z.string()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UseCase = typeof useCases.$inferSelect;
export type InsertUseCase = z.infer<typeof insertUseCaseSchema>;

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
  sourceTypes: text('source_types').array().notNull().default(sql`'{"rsa_internal","hexaware_external","industry_standard","imported","consolidated_database"}'`),
  // Tab 3 Implementation & Governance LOVs
  useCaseStatuses: text('use_case_statuses').array().notNull().default(sql`'{"Discovery","Backlog","In-flight","Implemented","On Hold"}'`),
  aiMlTechnologies: text('ai_ml_technologies').array().notNull().default(sql`'{"Machine Learning","Deep Learning","Natural Language Processing","Computer Vision","Predictive Analytics","Large Language Models","Reinforcement Learning","Rule-based Systems"}'`),
  dataSources: text('data_sources').array().notNull().default(sql`'{"Policy Database","Claims Database","Customer Database","External APIs","Third-party Data","Real-time Feeds","Historical Data","Regulatory Data"}'`),
  stakeholderGroups: text('stakeholder_groups').array().notNull().default(sql`'{"Underwriting Teams","Claims Teams","IT/Technology","Business Analytics","Risk Management","Compliance","Customer Service","External Partners"}'`),
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




