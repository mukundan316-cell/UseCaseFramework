/**
 * Clean Database Schema - Rebuilt for Consistency
 * Following replit.md "Build Once, Reuse Everywhere" principle
 * Eliminates all legacy transformation complexity
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - unchanged, clean design
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Response sessions for questionnaire tracking
export const responseSessions = pgTable("response_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionnaireName: text("questionnaire_name").notNull(),
  responses: text("responses"), // JSON string
  status: text("status").notNull().default('in_progress'), // 'in_progress', 'completed'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// Main use cases table - completely cleaned and standardized
export const useCases = pgTable("use_cases", {
  // Core identifiers
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  problemStatement: text("problem_statement"),
  
  // Business context - single values
  process: text("process").notNull(),
  lineOfBusiness: text("line_of_business").notNull(), 
  businessSegment: text("business_segment").notNull(),
  geography: text("geography").notNull(),
  useCaseType: text("use_case_type").notNull(),
  activity: text("activity"),
  
  // Business context - multi-select arrays (JSON)
  processes: text("processes").array(),
  activities: text("activities").array(),
  businessSegments: text("business_segments").array(),
  geographies: text("geographies").array(), 
  linesOfBusiness: text("lines_of_business").array(),
  
  // RSA 10-Lever Scoring System - consistent decimal precision
  // Business Value Levers (Impact)
  revenueImpact: integer("revenue_impact").notNull(),
  costSavings: integer("cost_savings").notNull(), 
  riskReduction: integer("risk_reduction").notNull(),
  brokerPartnerExperience: integer("broker_partner_experience").notNull(),
  strategicFit: integer("strategic_fit").notNull(),
  
  // Feasibility Levers (Effort)  
  dataReadiness: integer("data_readiness").notNull(),
  technicalComplexity: integer("technical_complexity").notNull(),
  changeImpact: integer("change_impact").notNull(),
  modelRisk: integer("model_risk").notNull(),
  adoptionReadiness: integer("adoption_readiness").notNull(),
  
  // Calculated scores - precise decimal values
  impactScore: decimal("impact_score", { precision: 3, scale: 1 }).notNull(),
  effortScore: decimal("effort_score", { precision: 3, scale: 1 }).notNull(),
  quadrant: text("quadrant").notNull(),
  
  // Manual override system - clean design
  manualImpactScore: decimal("manual_impact_score", { precision: 3, scale: 1 }),
  manualEffortScore: decimal("manual_effort_score", { precision: 3, scale: 1 }),
  manualQuadrant: text("manual_quadrant"),
  overrideReason: text("override_reason"),
  
  // RSA Ethical AI Principles - consistent string booleans
  explainabilityRequired: text("explainability_required"), // 'true', 'false', or null
  customerHarmRisk: text("customer_harm_risk"),
  dataOutsideUkEu: text("data_outside_uk_eu"), // 'true', 'false', or null  
  thirdPartyModel: text("third_party_model"), // 'true', 'false', or null
  humanAccountability: text("human_accountability"), // 'true', 'false', or null
  regulatoryCompliance: integer("regulatory_compliance"),
  
  // Portfolio management - consistent string booleans
  isActiveForRsa: text("is_active_for_rsa").notNull().default('false'), // 'true' or 'false'
  isDashboardVisible: text("is_dashboard_visible").notNull().default('false'), // 'true' or 'false'
  libraryTier: text("library_tier").notNull().default('reference'), // 'active' or 'reference'
  librarySource: text("library_source").notNull().default('rsa_internal'),
  
  // Lifecycle management
  activationDate: timestamp("activation_date", { withTimezone: true }),
  activationReason: text("activation_reason"),
  deactivationReason: text("deactivation_reason"),
  
  // AI Inventory fields - simplified
  aiInventoryStatus: text("ai_inventory_status"), // 'active', 'development', 'testing', 'deprecated'
  deploymentStatus: text("deployment_status"), // 'production', 'staging', 'development', 'local'
  
  // Extended metadata fields
  primaryBusinessOwner: text("primary_business_owner"),
  useCaseStatus: text("use_case_status"),
  keyDependencies: text("key_dependencies"), 
  implementationTimeline: text("implementation_timeline"),
  successMetrics: text("success_metrics"),
  estimatedValue: text("estimated_value"),
  
  // Technical arrays - clean JSON arrays
  aiMlTechnologies: text("ai_ml_technologies").array(),
  dataSources: text("data_sources").array(),
  stakeholderGroups: text("stakeholder_groups").array(),
  
  // Governance fields
  recommendedByAssessment: text("recommended_by_assessment"),
  valueChainComponent: text("value_chain_component"),
  
  // Timestamps - consistent naming
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// Metadata configuration - unchanged
export const metadataConfig = pgTable("metadata_config", {
  id: text("id").primaryKey().default('default'),
  valueChainComponents: text("value_chain_components").array(),
  processes: text("processes").array(),
  activities: text("activities").array(),  
  businessSegments: text("business_segments").array(),
  geographies: text("geographies").array(),
  linesOfBusiness: text("lines_of_business").array(),
  useCaseTypes: text("use_case_types").array(),
  aiMlTechnologies: text("ai_ml_technologies").array(),
  dataSources: text("data_sources").array(),
  stakeholderGroups: text("stakeholder_groups").array(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// CLEAN VALIDATION SCHEMAS - No more transformations!

export const insertUserSchema = createInsertSchema(users);
export const insertResponseSessionSchema = createInsertSchema(responseSessions);

// Clean, consistent use case validation
export const insertUseCaseSchema = createInsertSchema(useCases).omit({
  id: true,
  impactScore: true,
  effortScore: true, 
  quadrant: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Required core fields
  title: z.string().min(1, "Title required").max(100),
  description: z.string().min(1, "Description required").max(500),
  process: z.string().min(1, "Process required"),
  lineOfBusiness: z.string().min(1, "Line of Business required"),
  businessSegment: z.string().min(1, "Business Segment required"), 
  geography: z.string().min(1, "Geography required"),
  useCaseType: z.string().min(1, "Use Case Type required"),
  
  // Score validation - simple integer constraints
  revenueImpact: z.number().int().min(1).max(5),
  costSavings: z.number().int().min(1).max(5),
  riskReduction: z.number().int().min(1).max(5),
  brokerPartnerExperience: z.number().int().min(1).max(5),
  strategicFit: z.number().int().min(1).max(5),
  dataReadiness: z.number().int().min(1).max(5),
  technicalComplexity: z.number().int().min(1).max(5),
  changeImpact: z.number().int().min(1).max(5),
  modelRisk: z.number().int().min(1).max(5),
  adoptionReadiness: z.number().int().min(1).max(5),
  regulatoryCompliance: z.number().int().min(1).max(5),
  
  // Boolean fields - simple string enums (NO TRANSFORMATIONS!)
  isActiveForRsa: z.enum(['true', 'false']).default('false'),
  isDashboardVisible: z.enum(['true', 'false']).default('false'),
  explainabilityRequired: z.enum(['true', 'false']).optional(),
  dataOutsideUkEu: z.enum(['true', 'false']).optional(),
  thirdPartyModel: z.enum(['true', 'false']).optional(),
  humanAccountability: z.enum(['true', 'false']).optional(),
  
  // Array fields - simple arrays
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  linesOfBusiness: z.array(z.string()).optional(),
  aiMlTechnologies: z.array(z.string()).optional(),
  dataSources: z.array(z.string()).optional(),
  stakeholderGroups: z.array(z.string()).optional(),
});

export const insertMetadataSchema = createInsertSchema(metadataConfig);

// Type exports - clean and simple
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertResponseSession = z.infer<typeof insertResponseSessionSchema>; 
export type ResponseSession = typeof responseSessions.$inferSelect;

export type InsertUseCase = z.infer<typeof insertUseCaseSchema>;
export type UseCase = typeof useCases.$inferSelect;

export type InsertMetadata = z.infer<typeof insertMetadataSchema>;
export type Metadata = typeof metadataConfig.$inferSelect;