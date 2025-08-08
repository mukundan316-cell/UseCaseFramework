import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
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
}).extend({
  linesOfBusiness: z.array(z.string()).optional(),
  processes: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  businessSegments: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
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
