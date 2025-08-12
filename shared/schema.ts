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
  librarySource: text("library_source").notNull().default('rsa_internal'), // 'rsa_internal', 'industry_standard', 'imported'
  
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
  librarySource: z.enum(['rsa_internal', 'industry_standard', 'imported', 'consolidated_database']).default('rsa_internal'),
  activationReason: z.string().optional(),
  deactivationReason: z.string().optional(),
  // Manual override fields (accept null values for optional operation)
  manualImpactScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualEffortScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualQuadrant: z.union([z.enum(['Quick Win', 'Strategic Bet', 'Experimental', 'Watchlist']), z.null()]).optional(),
  overrideReason: z.union([z.string(), z.null()]).optional(),
  // Tab 3: Implementation & Governance fields
  primaryBusinessOwner: z.string().optional(),
  useCaseStatus: z.enum(['Discovery', 'Backlog', 'In-flight', 'Implemented', 'On Hold']).optional(),
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
  processActivities: text('process_activities').$type<Record<string, string[]> | string>(),
  scoringModel: text('scoring_model').$type<any>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const insertMetadataConfigSchema = createInsertSchema(metadataConfig);
export type MetadataConfig = typeof metadataConfig.$inferSelect;
export type InsertMetadataConfig = z.infer<typeof insertMetadataConfigSchema>;

// =============================================================================
// QUESTIONNAIRE SYSTEM SCHEMA
// Database-first questionnaire framework for RSA AI use case evaluation
// =============================================================================

export const questionnaires = pgTable("questionnaires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull().default('1.0'),
  status: text("status").notNull().default('draft'), // draft, active, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionnaireSections = pgTable("questionnaire_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionnaireId: varchar("questionnaire_id").notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  sectionOrder: integer("section_order").notNull(),
  sectionNumber: integer("section_number").notNull(), // 1-6 for the main sections
  isLocked: text("is_locked").notNull().default('false'), // 'true' or 'false'
  unlockCondition: text("unlock_condition").default('previous_complete'), // 'previous_complete', 'none', 'custom'
  sectionType: text("section_type").notNull(), // 'business_strategy', 'ai_capabilities', 'use_case_discovery', etc.
  estimatedTime: integer("estimated_time"), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New subsections table - organizational containers for questions
export const questionnaireSubsections = pgTable("questionnaire_subsections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => questionnaireSections.id, { onDelete: 'cascade' }),
  title: text("title").notNull(), // "Executive Vision & Strategic Alignment"
  subsectionNumber: text("subsection_number").notNull(), // "1.1", "1.2", "2.1", etc.
  subsectionOrder: integer("subsection_order").notNull(), // Order within the section
  estimatedTime: integer("estimated_time"), // in minutes
  description: text("description"), // Optional description
  isCollapsible: text("is_collapsible").notNull().default('true'), // 'true' or 'false'
  defaultExpanded: text("default_expanded").notNull().default('false'), // 'true' or 'false'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => questionnaireSections.id, { onDelete: 'cascade' }),
  subsectionId: varchar("subsection_id").references(() => questionnaireSubsections.id, { onDelete: 'cascade' }), // Optional - questions can be directly in section or in subsection
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // text, number, select, multiselect, scale, boolean
  isRequired: text("is_required").notNull().default('false'), // 'true' or 'false'
  questionOrder: integer("question_order").notNull(), // Order within subsection or section
  helpText: text("help_text"), // Optional guidance for respondents
  questionData: text("question_data").$type<Record<string, any>>(), // JSON configuration for advanced question types
  subQuestions: text("sub_questions"), // JSONB for compound questions
  displayCondition: text("display_condition"), // JSONB for conditional logic
  scoringCategory: text("scoring_category"), // For dimension mapping (business_value, feasibility, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionOptions = pgTable("question_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionText: text("option_text").notNull(),
  optionValue: text("option_value").notNull(),
  scoreValue: integer("score_value"), // For scoring questions (1-5 scale, etc.)
  optionOrder: integer("option_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionnaireId: varchar("questionnaire_id").notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  respondentEmail: text("respondent_email").notNull(),
  respondentName: text("respondent_name"), // Optional
  status: text("status").notNull().default('started'), // started, completed, abandoned
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  totalScore: integer("total_score"), // Calculated aggregate score
  metadata: text("metadata").$type<Record<string, any>>(), // Additional context data
});

export const questionAnswers = pgTable("question_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responseId: varchar("response_id").notNull().references(() => questionnaireResponses.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  answerValue: text("answer_value").notNull(), // Legacy text field - kept for backward compatibility
  answerData: jsonb("answer_data"), // New JSONB field for structured data storage
  score: integer("score"), // Individual question score
  notes: text("notes"), // Qualitative feedback and observations for stakeholder interviews
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// =============================================================================
// QUESTIONNAIRE INSERT SCHEMAS AND TYPES
// =============================================================================

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionnaireSectionSchema = createInsertSchema(questionnaireSections).omit({
  id: true,
  createdAt: true,
}).extend({
  isLocked: z.enum(['true', 'false']).default('false'),
  sectionType: z.enum([
    'business_strategy',
    'ai_capabilities', 
    'use_case_discovery',
    'technology_infrastructure',
    'people_process_change',
    'regulatory_compliance'
  ]),
});

export const insertQuestionnaireSubsectionSchema = createInsertSchema(questionnaireSubsections).omit({
  id: true,
  createdAt: true,
}).extend({
  isCollapsible: z.enum(['true', 'false']).default('true'),
  defaultExpanded: z.enum(['true', 'false']).default('false'),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
}).extend({
  isRequired: z.enum(['true', 'false']).default('false'),
  questionType: z.enum(['text', 'number', 'select', 'multiselect', 'scale', 'boolean', 'smart_rating', 'ranking', 'currency', 'percentage_allocation', 'percentage_target', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating', 'textarea', 'composite', 'risk_appetite']),
  scoringCategory: z.enum(['business_value', 'feasibility', 'ai_governance', 'general']).optional(),
});

export const insertQuestionOptionSchema = createInsertSchema(questionOptions).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionnaireResponseSchema = createInsertSchema(questionnaireResponses).omit({
  id: true,
  startedAt: true,
});

export const insertQuestionAnswerSchema = createInsertSchema(questionAnswers).omit({
  id: true,
  answeredAt: true,
});

// =============================================================================
// QUESTIONNAIRE TYPES
// =============================================================================

export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;

export type QuestionnaireSection = typeof questionnaireSections.$inferSelect;
export type InsertQuestionnaireSection = z.infer<typeof insertQuestionnaireSectionSchema>;

export type QuestionnaireSubsection = typeof questionnaireSubsections.$inferSelect;
export type InsertQuestionnaireSubsection = z.infer<typeof insertQuestionnaireSubsectionSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuestionOption = typeof questionOptions.$inferSelect;
export type InsertQuestionOption = z.infer<typeof insertQuestionOptionSchema>;

export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = z.infer<typeof insertQuestionnaireResponseSchema>;

export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type InsertQuestionAnswer = z.infer<typeof insertQuestionAnswerSchema>;

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
});

export const insertResponseSessionSchema = createInsertSchema(responseSessions).extend({
  status: z.enum(['started', 'in_progress', 'completed', 'abandoned']).default('started'),
});

export type ResponseSession = typeof responseSessions.$inferSelect;
export type InsertResponseSession = z.infer<typeof insertResponseSessionSchema>;

// =============================================================================
// DYNAMIC QUESTION REGISTRY SCHEMA
// =============================================================================

export const dynamicQuestions = pgTable("dynamic_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: integer("section_id").notNull(),
  questionOrder: integer("question_order").notNull(),
  questionType: text("question_type").notNull(), // scale, multiChoice, ranking, etc.
  questionText: text("question_text").notNull(),
  isRequired: text("is_required").notNull().default('false'), // 'true' or 'false'
  isStarred: text("is_starred").default('false'), // 'true' or 'false'
  helpText: text("help_text"),
  dependsOn: text("depends_on").array(), // Array of question IDs this depends on
  conditionalLogic: text("conditional_logic"), // JSON string for conditional rules
  questionData: text("question_data").notNull(), // JSON string for question-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDynamicQuestionSchema = createInsertSchema(dynamicQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isRequired: z.enum(['true', 'false']).default('false'),
  isStarred: z.enum(['true', 'false']).default('false'),
  questionType: z.enum([
    'scale', 'multiChoice', 'ranking', 'allocation', 'text', 
    'boolean', 'matrix', 'compound', 'score', 'checkbox', 
    'textarea', 'number', 'email', 'url', 'date', 'smart_rating', 'currency', 'percentage_allocation', 'business_lines_matrix', 'department_skills_matrix', 'company_profile', 'business_performance', 'multi_rating', 'composite', 'risk_appetite'
  ]),
  dependsOn: z.array(z.string()).optional(),
  conditionalLogic: z.string().optional(), // JSON string
  questionData: z.string(), // JSON string
});

export type DynamicQuestion = typeof dynamicQuestions.$inferSelect;
export type InsertDynamicQuestion = z.infer<typeof insertDynamicQuestionSchema>;

// =============================================================================
// SECTION PROGRESS TRACKING SCHEMA
// =============================================================================

export const sectionProgress = pgTable("section_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userResponseId: varchar("user_response_id").notNull().references(() => questionnaireResponses.id, { onDelete: 'cascade' }),
  sectionNumber: integer("section_number").notNull(), // 1-6
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastModifiedAt: timestamp("last_modified_at").defaultNow().notNull(),
  completionPercentage: integer("completion_percentage").notNull().default(0), // 0-100
  isComplete: text("is_complete").notNull().default('false'), // 'true' or 'false'
});

export const insertSectionProgressSchema = createInsertSchema(sectionProgress).omit({
  id: true,
  startedAt: true,
  lastModifiedAt: true,
}).extend({
  isComplete: z.enum(['true', 'false']).default('false'),
});

export type SectionProgress = typeof sectionProgress.$inferSelect;
export type InsertSectionProgress = z.infer<typeof insertSectionProgressSchema>;
