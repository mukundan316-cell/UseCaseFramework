/**
 * Schema Evolution: Boolean Field Migration
 * Future schema with proper boolean types while maintaining backward compatibility
 * Following replit.md principles: consistent camelCase and database-first architecture
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import existing schema components for reuse
export { users, insertUserSchema, User, InsertUser } from './schema';

// Evolved use cases table with proper boolean types
export const useCase_v2 = pgTable("use_cases", {
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
  activity: text("activity"),
  
  // Multi-select array fields for enhanced flexibility
  processes: text("processes").array(),
  activities: text("activities").array(),  
  businessSegments: text("business_segments").array(),
  geographies: text("geographies").array(),
  
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
  
  // RSA Ethical Principles - proper boolean types
  explainabilityRequired: boolean("explainability_required"),
  customerHarmRisk: text("customer_harm_risk"),
  dataOutsideUkEu: boolean("data_outside_uk_eu"),
  thirdPartyModel: boolean("third_party_model"),
  humanAccountability: boolean("human_accountability"),
  regulatoryCompliance: integer("regulatory_compliance"),
  
  // AI Inventory Governance Fields
  aiOrModel: text("ai_or_model"),
  riskToCustomers: text("risk_to_customers"),
  riskToRsa: text("risk_to_rsa"),
  dataUsed: text("data_used"),
  modelOwner: text("model_owner"),
  rsaPolicyGovernance: text("rsa_policy_governance"),
  validationResponsibility: text("validation_responsibility"),
  informedBy: text("informed_by"),
  businessFunction: text("business_function"),
  thirdPartyProvidedModel: text("third_party_provided_model"),
  
  impactScore: real("impact_score").notNull(),
  effortScore: real("effort_score").notNull(),
  quadrant: text("quadrant").notNull(),
  recommendedByAssessment: text("recommended_by_assessment"),
  
  // Manual Score Override System
  manualImpactScore: real("manual_impact_score"),
  manualEffortScore: real("manual_effort_score"),
  manualQuadrant: text("manual_quadrant"),
  overrideReason: text("override_reason"),
  
  // Two-tier library system - NOW WITH PROPER BOOLEAN TYPES
  isActiveForRsa: boolean("is_active_for_rsa").notNull().default(false),
  isDashboardVisible: boolean("is_dashboard_visible").notNull().default(false),
  libraryTier: text("library_tier").notNull().default('reference'),
  activationDate: timestamp("activation_date").defaultNow(),
  activationReason: text("activation_reason"),
  deactivationReason: text("deactivation_reason"),
  librarySource: text("library_source").notNull().default('rsa_internal'),
  
  // AI Inventory specific fields
  aiInventoryStatus: text("ai_inventory_status"),
  deploymentStatus: text("deployment_status"),
  lastStatusUpdate: timestamp("last_status_update"),
  
  // Tab 3: Implementation & Governance fields
  primaryBusinessOwner: text("primary_business_owner"),
  useCaseStatus: text("use_case_status").default('Discovery'),
  keyDependencies: text("key_dependencies"),
  implementationTimeline: text("implementation_timeline"),
  successMetrics: text("success_metrics"),
  estimatedValue: text("estimated_value"),
  valueMeasurementApproach: text("value_measurement_approach"),
  integrationRequirements: text("integration_requirements"),
  aiMlTechnologies: text("ai_ml_technologies").array(),
  dataSources: text("data_sources").array(),
  stakeholderGroups: text("stakeholder_groups").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced insert schema with proper boolean validation
export const insertUseCaseSchema_v2 = createInsertSchema(useCase_v2).omit({
  id: true,
  impactScore: true,
  effortScore: true,
  quadrant: true,
  createdAt: true,
  activationDate: true,
  lastStatusUpdate: true,
}).extend({
  // Core required fields for data integrity
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  process: z.string().min(1, "Process is required"),
  lineOfBusiness: z.string().min(1, "Line of Business is required"),
  businessSegment: z.string().min(1, "Business Segment is required"),
  geography: z.string().min(1, "Geography is required"),
  useCaseType: z.string().min(1, "Use Case Type is required"),
  
  // Business Value Levers with validation constraints
  revenueImpact: z.union([z.number().min(1).max(5), z.null()]).optional(),
  costSavings: z.union([z.number().min(1).max(5), z.null()]).optional(),
  riskReduction: z.union([z.number().min(1).max(5), z.null()]).optional(),
  brokerPartnerExperience: z.union([z.number().min(1).max(5), z.null()]).optional(),
  strategicFit: z.union([z.number().min(1).max(5), z.null()]).optional(),
  
  // Feasibility Levers with validation constraints
  dataReadiness: z.union([z.number().min(1).max(5), z.null()]).optional(),
  technicalComplexity: z.union([z.number().min(1).max(5), z.null()]).optional(),
  changeImpact: z.union([z.number().min(1).max(5), z.null()]).optional(),
  modelRisk: z.union([z.number().min(1).max(5), z.null()]).optional(),
  adoptionReadiness: z.union([z.number().min(1).max(5), z.null()]).optional(),
  
  // Proper boolean validation (no more string unions!)
  isActiveForRsa: z.boolean().default(false),
  isDashboardVisible: z.boolean().default(false),
  explainabilityRequired: z.boolean().optional(),
  dataOutsideUkEu: z.boolean().optional(),
  thirdPartyModel: z.boolean().optional(),
  humanAccountability: z.boolean().optional(),
  
  // Array fields
  linesOfBusiness: z.array(z.string()).optional(),
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  aiMlTechnologies: z.array(z.string()).optional(),
  dataSources: z.array(z.string()).optional(),
  stakeholderGroups: z.array(z.string()).optional(),
  
  // Manual override fields
  manualImpactScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualEffortScore: z.union([z.number().min(1).max(5), z.null()]).optional(),
  manualQuadrant: z.union([z.string(), z.null()]).optional(),
  overrideReason: z.union([z.string(), z.null()]).optional(),
  
  // Other fields
  libraryTier: z.enum(['active', 'reference']).default('reference'),
  librarySource: z.enum(['rsa_internal', 'hexaware_external', 'industry_standard', 'imported', 'ai_inventory']).default('rsa_internal'),
  activationReason: z.union([z.string(), z.null()]).optional(),
  deactivationReason: z.union([z.string(), z.null()]).optional(),
  problemStatement: z.union([z.string(), z.null()]).optional(),
  
  // Tab 3 fields
  primaryBusinessOwner: z.union([z.string(), z.null()]).optional(),
  useCaseStatus: z.union([z.string(), z.null()]).optional(),
  keyDependencies: z.union([z.string(), z.null()]).optional(),
  implementationTimeline: z.union([z.string(), z.null()]).optional(),
  successMetrics: z.union([z.string(), z.null()]).optional(),
  estimatedValue: z.union([z.string(), z.null()]).optional(),
  valueMeasurementApproach: z.union([z.string(), z.null()]).optional(),
  integrationRequirements: z.union([z.string(), z.null()]).optional(),
  
  // AI Inventory Governance Fields
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
  
  // AI Inventory specific fields
  aiInventoryStatus: z.union([z.string(), z.null()]).optional(),
  deploymentStatus: z.union([z.string(), z.null()]).optional(),
});

// Type exports for future use
export type UseCase_v2 = typeof useCase_v2.$inferSelect;
export type InsertUseCase_v2 = z.infer<typeof insertUseCaseSchema_v2>;