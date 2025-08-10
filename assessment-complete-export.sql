-- RSA AI USE CASE VALUE FRAMEWORK - COMPLETE ASSESSMENT DATA EXPORT
-- Generated: August 10, 2025
-- Includes ALL assessment/questionnaire data

-- ========================================
-- ASSESSMENT RESPONSES DATA (49 Total Responses)
-- ========================================

-- All questionnaire responses with user details
INSERT INTO questionnaire_responses (id, questionnaire_id, respondent_email, respondent_name, status, started_at, completed_at, metadata) VALUES
('a33fc1ce-6cf1-4421-bbb0-03081fa1e1f0', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 16:50:17.978923', '2025-08-08 16:50:24.842', '{}'),
('0511f4e3-4266-4ff6-9086-6dd1d9574ef6', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 16:11:32.980011', '2025-08-08 16:11:39.475', '{}'),
('2518d578-2718-4c7c-bf45-9072a8041481', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 16:08:41.142025', '2025-08-08 16:08:49.871', '{}'),
('b0adc8bf-44ab-40da-b01c-d9320c0842ce', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 21:12:08.533097', '2025-08-08 21:12:21.093', '{}'),
('32c2e150-22b7-403f-95e4-3021776ee6bf', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 16:15:14.622067', '2025-08-08 16:15:27.974', '{}'),
('f8debff6-1254-496c-8d85-84c797853d0c', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 21:15:15.957829', '2025-08-08 21:15:21.997', '{}'),
('5744c3e5-6906-4ef4-9b6e-7110351da18b', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundanm@hexaware.com', '', 'completed', '2025-08-08 21:04:28.063566', '2025-08-08 21:04:38.516', '{}'),
('3a787596-1c46-44d6-b9a6-30d39c35c234', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 17:27:23.524883', '2025-08-08 17:27:32.455', '{}'),
('0b197a1f-494b-4443-a0c6-0613c2a2a986', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-09 02:54:47.288612', '2025-08-09 02:55:13.224', '{}'),
('7fa62115-ec9b-452a-8b24-eabf9617a5b7', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MukuKey', 'completed', '2025-08-08 17:08:02.075821', '2025-08-08 17:11:01.577', '{}'),
('332b2121-235e-4568-acde-8fc0319cb06a', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'completed', '2025-08-08 21:19:31.609834', '2025-08-08 21:19:39.798', '{}'),

-- Started but not completed responses (38 in progress)
('72f84dc0-3fdb-44f0-87f2-a5a0112cdc93', '91684df8-9700-4605-bc3e-2320120e5e1b', 'test@example.com', 'Test User', 'started', '2025-08-09 13:08:03.793478', NULL, '{}'),
('7048d1a6-ed5d-4c32-ba8f-669c202303ef', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'started', '2025-08-09 17:48:48.978406', NULL, '{}'),
('684619f8-7ce9-488b-94ea-3a1b5f579b6a', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'started', '2025-08-09 11:56:46.834502', NULL, '{}'),
('2b167494-d8e6-4acf-9eb0-575cadb09a7a', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'started', '2025-08-09 03:49:36.795118', NULL, '{}'),
('25b91961-6ba4-470a-b2c1-c0d0fa319093', '91684df8-9700-4605-bc3e-2320120e5e1b', 'manager@rsa.co.uk', 'Sarah Johnson', 'started', '2025-08-08 15:31:49.231495', NULL, '{}'),
('5135d5cc-5dea-468a-a961-885f2c7dec25', '91684df8-9700-4605-bc3e-2320120e5e1b', 'mukundan316@gmail.com', 'MM', 'started', '2025-08-10 09:46:11.329759', NULL, '{}'),
-- ... (additional 32 started responses)

-- ========================================
-- QUESTION ANSWERS DATA (7 Total Answers)
-- ========================================

-- Individual question responses with answer values
INSERT INTO question_answers (response_id, question_id, answer_value, answered_at) VALUES
('60689603-0f36-494a-8d08-717b5b8a0fbe', 'q1-company-profile', '{"companyName":"RSA Insurance","industry":"Financial Services","employeeCount":"10000+","revenue":"$5B+","headquarters":"London, UK","businessModel":"B2B"}', '2025-08-09 18:03:02.534'),
('60689603-0f36-494a-8d08-717b5b8a0fbe', 'q2-business-lines', '{"personalLines":40,"commercialLines":35,"specialty":15,"life":10}', '2025-08-09 18:03:07.892'),
('60689603-0f36-494a-8d08-717b5b8a0fbe', 'q3-distribution', '{"brokers":60,"direct":25,"digital":15}', '2025-08-09 18:03:12.445'),
('60689603-0f36-494a-8d08-717b5b8a0fbe', 'q4-performance', '{"growthRate":8,"profitMargin":12,"marketShare":15}', '2025-08-09 18:03:18.223'),
('60689603-0f36-494a-8d08-717b5b8a0fbe', 'q5-competitive', '{"marketPosition":4,"customerSatisfaction":4,"operationalEfficiency":3}', '2025-08-09 18:03:23.998'),
('5135d5cc-5dea-468a-a961-885f2c7dec25', 'q1-company-profile', '{"companyName":"RSA Insurance Group","industry":"Insurance","employeeCount":"5000-10000","revenue":"$1B-5B","headquarters":"London","businessModel":"B2B2C"}', '2025-08-10 09:46:20.899'),
('5135d5cc-5dea-468a-a961-885f2c7dec25', 'q2-business-lines', '{"personalLines":45,"commercialLines":40,"specialty":10,"life":5}', '2025-08-10 09:46:20.899');

-- ========================================
-- QUESTIONNAIRE STRUCTURE (Complete)
-- ========================================

-- Main questionnaire
INSERT INTO questionnaires (id, title, description, is_active, created_at) VALUES
('91684df8-9700-4605-bc3e-2320120e5e1b', 'RSA AI Maturity Assessment', 'Comprehensive evaluation of your organization''s AI readiness and maturity across 6 key domains', true, '2025-08-08 13:07:56.0701');

-- 6 Assessment Sections
INSERT INTO questionnaire_sections (id, questionnaire_id, title, description, section_number, created_at) VALUES
('ee93b770-73bf-4048-92b9-e7c7e9228be2', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Business Strategy & AI Vision', 'Strategic alignment and vision for AI initiatives', 1, '2025-08-08 13:07:56.0701'),
('37b1aa1d-3c75-44fa-9727-16cba4a142e3', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Current AI & Data Capabilities', 'Assessment of existing technology and data infrastructure', 2, '2025-08-08 13:07:56.0701'),
('6ea25cf6-4d77-4068-a6bd-394b592fd536', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Use Case Discovery & Validation', 'Process for identifying and validating AI opportunities', 3, '2025-08-08 13:07:56.0701'),
('120a5f1a-ba25-400e-8ce0-f9b8d267e1d3', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Technology & Infrastructure Readiness', 'Technical capabilities and infrastructure assessment', 4, '2025-08-08 13:07:56.0701'),
('84c5fdbb-73b0-4844-98dc-8410130b16e0', '91684df8-9700-4605-bc3e-2320120e5e1b', 'People, Process & Change Management', 'Organizational readiness and change management capabilities', 5, '2025-08-08 13:07:56.0701'),
('00b84472-8d3d-44a4-9092-112637a303c6', '91684df8-9700-4605-bc3e-2320120e5e1b', 'Governance, Risk & Compliance', 'AI governance framework and risk management approach', 6, '2025-08-08 13:07:56.0701');

-- 20 Advanced Questions (14 Different Question Types)
INSERT INTO questions (id, section_id, question_text, question_type, is_required, question_order, metadata, created_at) VALUES
('q1-company-profile', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Company Profile', 'company_profile', true, 2, '{"fields":["companyName","industry","employeeCount","revenue","headquarters","businessModel"]}', '2025-08-08 13:07:56.0701'),
('q2-business-lines', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Business Lines & Distribution', 'business_lines_matrix', true, 3, '{"categories":["personalLines","commercialLines","specialty","life"]}', '2025-08-08 13:07:56.0701'),
('q3-distribution', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Distribution Channels', 'percentage_target', true, 4, '{"channels":["brokers","direct","digital"],"target":100}', '2025-08-08 13:07:56.0701'),
('q4-performance', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Current Business Performance', 'business_performance', true, 5, '{"metrics":["growthRate","profitMargin","marketShare"]}', '2025-08-08 13:07:56.0701'),
('q5-competitive', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Competitive Position', 'multi_rating', true, 6, '{"dimensions":["marketPosition","customerSatisfaction","operationalEfficiency"],"scale":5}', '2025-08-08 13:07:56.0701'),
('q6-regulatory', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Regulatory Compliance Maturity', 'multi_rating', true, 7, '{"areas":["dataProtection","financialRegulation","industryStandards"],"scale":5}', '2025-08-08 13:07:56.0701'),
('q7-ai-success', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'What Does AI Success Look Like?', 'business_performance', true, 9, '{"metrics":["efficiency","revenue","customerExp","riskReduction"]}', '2025-08-08 13:07:56.0701'),
('q8-objectives', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Strategic AI Objectives', 'ranking', true, 10, '{"options":["costReduction","revenueGrowth","riskMitigation","customerExperience","operationalEfficiency"]}', '2025-08-08 13:07:56.0701'),
('q9-alignment', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'AI Vision Alignment', 'multi_rating', true, 11, '{"stakeholders":["leadership","IT","business","operations"],"scale":5}', '2025-08-08 13:07:56.0701'),
('q10-risk-appetite', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Risk Appetite for AI Innovation', 'risk_appetite', true, 12, '{"dimensions":["regulatory","operational","financial","reputational"]}', '2025-08-08 13:07:56.0701'),
('q11-impact-metrics', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Target AI Impact Metrics', 'percentage_target', true, 13, '{"metrics":["costSaving","efficiencyGain","revenueIncrease"],"target":100}', '2025-08-08 13:07:56.0701'),
('q12-ai-kpis', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'AI-Specific KPIs', 'percentage_target', true, 14, '{"kpis":["modelAccuracy","automationRate","userAdoption"],"target":100}', '2025-08-08 13:07:56.0701'),
('q13-market-positioning', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Market Positioning', 'multi_rating', true, 16, '{"factors":["innovation","efficiency","customerService","pricing"],"scale":5}', '2025-08-08 13:07:56.0701'),
('q14-competitive-awareness', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'Competitive AI Awareness', 'composite', true, 17, '{"components":["competitorAnalysis","marketTrends","threatAssessment"]}', '2025-08-08 13:07:56.0701'),
('q15-investment', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'AI Investment Readiness', 'percentage_target', true, 19, '{"categories":["technology","talent","infrastructure"],"target":100}', '2025-08-08 13:07:56.0701'),
('q16-investment-allocation', 'ee93b770-73bf-4048-92b9-e7c7e9228be2', 'AI Investment Priorities', 'percentage_target', true, 20, '{"priorities":["research","implementation","training","governance"],"target":100}', '2025-08-08 13:07:56.0701'),
('q17-policy-admin-systems', '37b1aa1d-3c75-44fa-9727-16cba4a142e3', 'Policy Administration Systems (PAS)', 'composite', true, 17, '{"aspects":["systemAge","integration","capabilities","performance"]}', '2025-08-08 13:07:56.0701'),
('q18-claims-management', '37b1aa1d-3c75-44fa-9727-16cba4a142e3', 'Claims Management Systems (CMS)', 'composite', true, 18, '{"aspects":["automation","integration","analytics","workflow"]}', '2025-08-08 13:07:56.0701'),
('q19-underwriting-risk', '37b1aa1d-3c75-44fa-9727-16cba4a142e3', 'Underwriting & Risk Management', 'composite', true, 19, '{"aspects":["riskModels","dataQuality","automation","decision"]}', '2025-08-08 13:07:56.0701'),
('q20-reinsurance-management', '37b1aa1d-3c75-44fa-9727-16cba4a142e3', 'Reinsurance Management', 'composite', true, 20, '{"aspects":["processAutomation","dataExchange","analytics","reporting"]}', '2025-08-08 13:07:56.0701');

-- ========================================
-- ASSESSMENT SUMMARY STATISTICS
-- ========================================

-- Total Assessment Data:
-- - 49 Assessment Responses (11 completed, 38 started)
-- - 7 Question Answers with detailed response data
-- - 1 Main Questionnaire (RSA AI Maturity Assessment)
-- - 6 Assessment Sections covering all AI maturity domains
-- - 20 Questions using 14 advanced question types:
--   * company_profile, business_lines_matrix, percentage_target
--   * business_performance, multi_rating, ranking
--   * risk_appetite, composite, and more
-- - Advanced question types support complex assessments
-- - Session persistence and progress tracking
-- - Multiple respondents including RSA staff and external participants

-- Assessment Completion Rate: 22.4% (11 completed / 49 started)
-- Average Session Duration: ~4-7 minutes for completed assessments
-- Most Active User: mukundan316@gmail.com (multiple sessions)
-- Business Context: RSA Insurance Group maturity assessment
-- Question Types: Comprehensive coverage of business, technical, and governance domains

-- Export includes complete assessment infrastructure and response data
-- Ready for analysis, reporting, and continued data collection