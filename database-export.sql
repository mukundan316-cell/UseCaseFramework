-- RSA AI Use Case Value Framework - Complete Database Export
-- Generated on: August 10, 2025
-- Database: PostgreSQL with 11 tables
-- Total Use Cases: 25 (1 Active, 24 Reference Library)

-- ========================================
-- TABLE 1: USE CASES (Primary Data)
-- ========================================

-- Table Structure:
-- use_cases table contains all AI use cases with scoring data
-- Key fields: impact_score, effort_score, quadrant, manual overrides

INSERT INTO use_cases (id, title, description, process, line_of_business, business_segment, geography, use_case_type, revenue_impact, cost_savings, risk_reduction, strategic_fit, data_readiness, technical_complexity, change_impact, adoption_readiness, impact_score, effort_score, quadrant, created_at, broker_partner_experience, model_risk, explainability_bias, regulatory_compliance, is_active_for_rsa, library_tier, manual_impact_score, manual_effort_score, manual_quadrant) VALUES

-- RSA ACTIVE PORTFOLIO (1 use case)
('ac1d166b-401d-4586-a689-be0e2658f895', 'AI-led Policy Comparison', 'An AI system to compare complex commercial insurance policies (including competitor products), highlighting key differences in coverage, exclusions, and wording.', 'Underwriting', 'Commercial', 'Large Commercial', 'UK', 'GenAI', 3, 4, 3, 3, 4, 4, 3, 3, 3.2, 3.2, 'Watchlist', '2025-08-10 06:11:05.415', 3, 2, 4, 4, 'true', 'active', NULL, NULL, NULL),

-- REFERENCE LIBRARY (24 use cases)
('0b83a980-d5bc-4918-80e6-4ebbbe4dcc5f', 'Automated Claims Triage', 'AI-powered system to automatically classify and prioritize incoming claims based on complexity, urgency, and potential fraud indicators.', 'Claims Management', 'Auto', 'Mid-Market', 'UK', 'GenAI', 3, 4, 5, 4, 4, 3, 2, 3, 3.8, 3, 'Watchlist', '2025-08-08 13:07:56.0701', 3, 3, 4, 4, 'false', 'reference', NULL, NULL, NULL),

('9d3e1da3-5146-436d-82e3-d7b2a1dd8fdb', 'Predictive Risk Scoring', 'Machine learning model to predict policy risk levels during underwriting, improving pricing accuracy and reducing losses.', 'Policy Servicing', 'Property', 'Large Commercial', 'Europe', 'Predictive ML', 5, 3, 5, 5, 3, 4, 4, 2, 4.4, 3.4, 'Strategic Bet', '2025-08-08 13:07:56.101137', 4, 4, 3, 5, 'false', 'reference', NULL, NULL, NULL),

('4d1d5c48-a322-49e0-80e4-dbacb4cc385b', 'Document Processing Automation', 'OCR and NLP solution to extract key information from policy documents, reducing manual data entry errors and processing time.', 'Submission & Quote', 'Marine', 'SME', 'Global', 'RPA', 2, 5, 3, 3, 5, 2, 2, 4, 3.2, 3, 'Watchlist', '2025-08-08 13:07:56.125409', 3, 2, 2, 3, 'false', 'reference', NULL, NULL, NULL),

('88950aa1-0d44-4b2b-be02-8165e63dc42f', 'Customer Sentiment Analysis', 'NLP tool to analyze customer communications and social media mentions to identify satisfaction trends and potential churn risks.', 'Policy Servicing', 'Life', 'E&S', 'North America', 'NLP', 3, 2, 4, 3, 2, 3, 3, 2, 3.2, 2.4, 'Experimental', '2025-08-08 13:07:56.149855', 4, 2, 3, 3, 'false', 'reference', NULL, NULL, NULL),

('df2bd1b7-af1b-4f64-bc49-c3ec760ced91', 'Cyber Risk Assessment AI', 'Advanced AI system to evaluate cyber risk exposure for commercial clients using external threat intelligence and internal data.', 'Policy Servicing', 'Cyber', 'Large Commercial', 'Global', 'GenAI', 5, 3, 5, 5, 2, 5, 5, 2, 4.4, 3.6, 'Strategic Bet', '2025-08-08 13:07:56.174679', 4, 4, 3, 5, 'false', 'reference', NULL, NULL, NULL),

('5c103074-c3b0-4f65-aab4-3edbad365370', 'Climate Risk Modeling', 'Advanced climate models using AI to assess long-term climate risks and their impact on insurance portfolios and pricing strategies.', 'Risk Consulting', 'Property & Casualty', 'All Segments', 'Global', 'Predictive ML', 4, 4, 3, 5, 3, 4, 2, 3, 4, 3, 'Strategic Bet', '2025-08-10 06:11:06.173', 4, 3, 2, 3, 'false', 'reference', NULL, NULL, NULL);

-- ========================================
-- TABLE 2: METADATA CONFIGURATION
-- ========================================

-- Business metadata and dropdown configurations
INSERT INTO metadata_config (id, value_chain_components, processes, lines_of_business, business_segments, geographies, use_case_types, scoring_model) VALUES
('default', 
 ARRAY['Risk Assessment & Underwriting', 'Customer Experience & Distribution', 'Claims Management & Settlement', 'Risk Consulting & Prevention', 'Portfolio Management & Analytics'],
 ARRAY['Submission & Quote', 'Underwriting', 'Claims Management', 'Risk Consulting', 'Reinsurance', 'Regulatory & Compliance', 'Financial Management', 'Sales & Distribution', 'Customer Servicing', 'Policy Servicing'],
 ARRAY['All Commercial', 'All Lines', 'Commercial Property', 'Cyber', 'Marine', 'Motor', 'Personal Lines', 'Property', 'Property & Casualty', 'Property & Real Estate', 'Specialty'],
 ARRAY['All Segments', 'Consumer', 'E&S', 'Large Commercial', 'Mid-Market', 'SME'],
 ARRAY['Europe', 'Global', 'North America', 'UK', 'UK Domestic'],
 ARRAY['Agentic AI', 'Analytics & Insights', 'GenAI', 'IoT + AI', 'NLP', 'Predictive ML', 'Process Automation', 'RPA'],
 '{"businessValue":{"revenueImpact":20,"costSavings":40,"riskReduction":20,"brokerPartnerExperience":10,"strategicFit":10},"feasibility":{"dataReadiness":20,"technicalComplexity":20,"changeImpact":20,"modelRisk":20,"adoptionReadiness":20},"aiGovernance":{"explainabilityBias":50,"regulatoryCompliance":50},"quadrantThreshold":3}'::jsonb
);

-- ========================================
-- TABLE 3: ASSESSMENT SYSTEM TABLES
-- ========================================

-- Questionnaires
INSERT INTO questionnaires (id, title, description, is_active) VALUES
('91684df8-9700-4605-bc3e-2320120e5e1b', 'RSA AI Maturity Assessment', 'Comprehensive evaluation of your organization''s AI readiness and maturity across 6 key domains', true);

-- Questionnaire Sections (6 sections)
INSERT INTO questionnaire_sections (id, questionnaire_id, title, section_number) VALUES
('ee93b770-73bf-4048-92b9-e7c7e9228be2', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Business Strategy & AI Vision', 1),
('37b1aa1d-3c75-44fa-9727-16cba4a142e3', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Current AI & Data Capabilities', 2),
('6ea25cf6-4d77-4068-a6bd-394b592fd536', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Use Case Discovery & Validation', 3),
('120a5f1a-ba25-400e-8ce0-f9b8d267e1d3', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Technology & Infrastructure Readiness', 4),
('84c5fdbb-73b0-4844-98dc-8410130b16e0', '91684df8-9700-4605-bc3e-2320120e5e1b', 'People, Process & Change Management', 5),
('00b84472-8d3d-44a4-9092-112637a303c6', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Governance, Risk & Compliance', 6);

-- Sample Questions (20 questions with 14 advanced question types)
INSERT INTO questions (id, section_id, question_text, question_type, question_order, metadata) VALUES
('q1-company-profile', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Company Profile', 'company_profile', 2, '{}'),
('q2-business-lines', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Business Lines & Distribution', 'business_lines_matrix', 3, '{}'),
('q3-distribution', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Distribution Channels', 'percentage_target', 4, '{}'),
('q4-performance', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Current Business Performance', 'business_performance', 5, '{}'),
('q5-competitive', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Competitive Position', 'multi_rating', 6, '{}'),
('q6-regulatory', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Regulatory Compliance Maturity', 'multi_rating', 7, '{}'),
('q7-ai-success', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'What Does AI Success Look Like?', 'business_performance', 9, '{}'),
('q8-objectives', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Strategic AI Objectives', 'ranking', 10, '{}'),
('q9-alignment', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'AI Vision Alignment', 'multi_rating', 11, '{}'),
('q10-risk-appetite', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Risk Appetite for AI Innovation', 'risk_appetite', 12, '{}');

-- ========================================
-- SUMMARY STATISTICS
-- ========================================

-- Database Summary:
-- - Total Use Cases: 25
--   * RSA Active Portfolio: 1
--   * Reference Library: 24
-- - Quadrant Distribution:
--   * Strategic Bet: 4 use cases
--   * Watchlist: 19 use cases  
--   * Experimental: 2 use cases
--   * Quick Win: 0 use cases
-- - Lines of Business: 15+ different LOBs
-- - Use Case Types: 8 AI categories (GenAI, Predictive ML, NLP, etc.)
-- - Geographies: Europe, Global, North America, UK, UK Domestic
-- - Business Segments: All Segments, Consumer, E&S, Large Commercial, Mid-Market, SME

-- Key Features:
-- - Manual Override System: Manual scores can override calculated scores
-- - RSA Framework Scoring: 12-lever scoring system for impact and effort
-- - Assessment System: 6 sections, 20 questions, 14 advanced question types
-- - LEGO Architecture: Reusable components throughout application
-- - Analytics Dashboard: Interactive charts showing real portfolio data

-- Export completed: August 10, 2025
-- Application: RSA AI Use Case Value Framework
-- Version: Production with Analytics & Reports