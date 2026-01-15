--
-- PostgreSQL database dump
--

\restrict Jkp2qHEtq3Xbdt4TNg7Lt98F8Igrdh7fP0p6xkr94MxfcfhnGsZ64TiZEfoR2nU

-- Dumped from database version 16.11 (f45eb12)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: file_attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.file_attachments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    use_case_id character varying,
    file_name text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    file_size integer NOT NULL,
    file_type text DEFAULT 'presentation'::text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now(),
    local_path text
);


ALTER TABLE public.file_attachments OWNER TO neondb_owner;

--
-- Name: metadata_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.metadata_config (
    id text DEFAULT 'default'::text NOT NULL,
    value_chain_components text[] NOT NULL,
    processes text[] NOT NULL,
    lines_of_business text[] NOT NULL,
    business_segments text[] NOT NULL,
    geographies text[] NOT NULL,
    use_case_types text[] NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    activities text[] DEFAULT '{}'::text[] NOT NULL,
    process_activities text,
    scoring_model text,
    source_types text[] DEFAULT '{rsa_internal,hexaware_external,industry_standard,imported,consolidated_database}'::text[] NOT NULL,
    use_case_statuses text[] DEFAULT '{Discovery,Backlog,In-flight,Implemented,"On Hold"}'::text[] NOT NULL,
    ai_ml_technologies text[] DEFAULT '{"Machine Learning","Deep Learning","Natural Language Processing","Computer Vision","Predictive Analytics","Large Language Models","Reinforcement Learning","Rule-based Systems"}'::text[] NOT NULL,
    data_sources text[] DEFAULT '{"Policy Database","Claims Database","Customer Database","External APIs","Third-party Data","Real-time Feeds","Historical Data","Regulatory Data"}'::text[] NOT NULL,
    stakeholder_groups text[] DEFAULT '{"Underwriting Teams","Claims Teams",IT/Technology,"Business Analytics","Risk Management",Compliance,"Customer Service","External Partners"}'::text[] NOT NULL,
    quadrants text[] DEFAULT '{"Quick Win","Strategic Bet",Experimental,Watchlist}'::text[] NOT NULL,
    question_types text[] DEFAULT '{text,textarea,select,multi_select,radio,checkbox,number,date,email,url,company_profile,business_lines_matrix,smart_rating,multi_rating,percentage_allocation,percentage_target,ranking,currency,department_skills_matrix,business_performance,composite,dynamic_use_case_selector}'::text[] NOT NULL,
    response_statuses text[] DEFAULT '{started,in_progress,completed,abandoned}'::text[] NOT NULL,
    company_tiers text[] DEFAULT '{"Small (<£100M)","Mid (£100M-£3B)","Large (>£3B)"}'::text[] NOT NULL,
    market_options text[] DEFAULT '{"Personal Lines","Commercial Lines","Specialty Lines",Reinsurance}'::text[] NOT NULL,
    question_categories text[] DEFAULT '{"Strategic Foundation","AI Capabilities","Use Case Discovery","Technology Infrastructure","Organizational Readiness","Risk & Compliance"}'::text[],
    horizontal_use_case_types text[] DEFAULT ARRAY['Document drafting'::text, 'report generation'::text, 'Categorization'::text, 'tagging'::text, 'curation'::text, 'Research assistant'::text, 'information retrieval'::text, 'Autofill'::text, 'next-best action suggestions'::text, 'autonomous agents'::text, 'Debugging'::text, 'refactoring'::text, 'coding'::text, 'Synthesis'::text, 'summarization'::text, 'Augmentation'::text, 'visualization'::text, 'Text versions for analysis'::text, 'time series data generation'::text, 'scenario generation'::text, 'Suggestions for workflow amendments'::text, 'automated changes to workflows'::text, 'Errors'::text, 'fraud'::text, 'problem-solving'::text],
    activities_sort_order jsonb,
    processes_sort_order jsonb,
    lines_of_business_sort_order jsonb,
    business_segments_sort_order jsonb,
    geographies_sort_order jsonb,
    use_case_types_sort_order jsonb,
    value_chain_components_sort_order jsonb,
    source_types_sort_order jsonb,
    ai_ml_technologies_sort_order jsonb,
    data_sources_sort_order jsonb,
    stakeholder_groups_sort_order jsonb,
    use_case_statuses_sort_order jsonb,
    quadrants_sort_order jsonb,
    scoring_dropdown_options jsonb,
    process_activities_sort_order jsonb,
    t_shirt_sizing jsonb
);


ALTER TABLE public.metadata_config OWNER TO neondb_owner;

--
-- Name: response_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.response_sessions (
    id character varying NOT NULL,
    questionnaire_id character varying NOT NULL,
    respondent_email text NOT NULL,
    respondent_name text,
    status text DEFAULT 'started'::text NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    last_updated_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    progress_percent integer DEFAULT 0 NOT NULL,
    current_section_id character varying,
    current_question_id character varying,
    questionnaire_definition_path text NOT NULL,
    response_path text,
    total_score real,
    section_scores jsonb,
    questionnaire_version text NOT NULL,
    total_questions integer NOT NULL,
    answered_questions integer DEFAULT 0 NOT NULL,
    total_pages integer DEFAULT 0 NOT NULL,
    completed_pages integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.response_sessions OWNER TO neondb_owner;

--
-- Name: use_cases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.use_cases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    use_case_type text,
    revenue_impact integer NOT NULL,
    cost_savings integer NOT NULL,
    risk_reduction integer NOT NULL,
    strategic_fit integer NOT NULL,
    data_readiness integer NOT NULL,
    technical_complexity integer NOT NULL,
    change_impact integer NOT NULL,
    adoption_readiness integer NOT NULL,
    impact_score real NOT NULL,
    effort_score real NOT NULL,
    quadrant text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    broker_partner_experience integer NOT NULL,
    model_risk integer NOT NULL,
    lines_of_business text[],
    processes text[],
    activities text[],
    business_segments text[],
    geographies text[],
    recommended_by_assessment text,
    is_active_for_rsa text DEFAULT 'false'::text NOT NULL,
    is_dashboard_visible text DEFAULT 'false'::text NOT NULL,
    library_tier text DEFAULT 'reference'::text NOT NULL,
    activation_date timestamp without time zone DEFAULT now(),
    deactivation_reason text,
    library_source text DEFAULT 'rsa_internal'::text NOT NULL,
    activation_reason text,
    manual_impact_score real,
    manual_effort_score real,
    manual_quadrant text,
    override_reason text,
    problem_statement text,
    primary_business_owner text,
    use_case_status text DEFAULT 'Discovery'::text,
    key_dependencies text,
    implementation_timeline text,
    success_metrics text,
    estimated_value text,
    value_measurement_approach text,
    integration_requirements text,
    ai_ml_technologies text[],
    data_sources text[],
    stakeholder_groups text[],
    customer_harm_risk text,
    explainability_bias integer DEFAULT 3,
    regulatory_compliance integer DEFAULT 3,
    ai_or_model text,
    risk_to_customers text,
    risk_to_rsa text,
    data_used text,
    model_owner text,
    rsa_policy_governance text,
    validation_responsibility text,
    informed_by text,
    ai_inventory_status text,
    deployment_status text,
    last_status_update timestamp without time zone,
    business_function text,
    third_party_provided_model text,
    is_active_for_rsa_bool boolean,
    is_dashboard_visible_bool boolean,
    explainability_required text,
    data_outside_uk_eu text,
    third_party_model text,
    human_accountability text,
    presentation_url text,
    presentation_pdf_url text,
    presentation_file_name text,
    presentation_uploaded_at timestamp without time zone,
    has_presentation text DEFAULT 'false'::text,
    presentation_file_id character varying,
    presentation_pdf_file_id character varying,
    meaningful_id character varying,
    horizontal_use_case text DEFAULT 'false'::text,
    horizontal_use_case_types text[],
    t_shirt_size text,
    estimated_cost_min integer,
    estimated_cost_max integer,
    estimated_weeks_min integer,
    estimated_weeks_max integer,
    team_size_estimate text
);


ALTER TABLE public.use_cases OWNER TO neondb_owner;

--
-- Name: use_cases_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.use_cases_backup (
    id character varying,
    title text,
    description text,
    process text,
    line_of_business text,
    business_segment text,
    geography text,
    use_case_type text,
    revenue_impact integer,
    cost_savings integer,
    risk_reduction integer,
    strategic_fit integer,
    data_readiness integer,
    technical_complexity integer,
    change_impact integer,
    adoption_readiness integer,
    impact_score real,
    effort_score real,
    quadrant text,
    created_at timestamp without time zone,
    broker_partner_experience integer,
    model_risk integer,
    lines_of_business text[],
    activity text,
    processes text[],
    activities text[],
    business_segments text[],
    geographies text[],
    recommended_by_assessment text,
    is_active_for_rsa text,
    is_dashboard_visible text,
    library_tier text,
    activation_date timestamp without time zone,
    deactivation_reason text,
    library_source text,
    activation_reason text,
    manual_impact_score real,
    manual_effort_score real,
    manual_quadrant text,
    override_reason text,
    problem_statement text,
    primary_business_owner text,
    use_case_status text,
    key_dependencies text,
    implementation_timeline text,
    success_metrics text,
    estimated_value text,
    value_measurement_approach text,
    integration_requirements text,
    ai_ml_technologies text[],
    data_sources text[],
    stakeholder_groups text[],
    customer_harm_risk text,
    explainability_bias integer,
    regulatory_compliance integer,
    ai_or_model text,
    risk_to_customers text,
    risk_to_rsa text,
    data_used text,
    model_owner text,
    rsa_policy_governance text,
    validation_responsibility text,
    informed_by text,
    ai_inventory_status text,
    deployment_status text,
    last_status_update timestamp without time zone,
    business_function text,
    third_party_provided_model text,
    is_active_for_rsa_bool boolean,
    is_dashboard_visible_bool boolean,
    explainability_required text,
    data_outside_uk_eu text,
    third_party_model text,
    human_accountability text
);


ALTER TABLE public.use_cases_backup OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: file_attachments file_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.file_attachments
    ADD CONSTRAINT file_attachments_pkey PRIMARY KEY (id);


--
-- Name: metadata_config metadata_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metadata_config
    ADD CONSTRAINT metadata_config_pkey PRIMARY KEY (id);


--
-- Name: response_sessions response_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.response_sessions
    ADD CONSTRAINT response_sessions_pkey PRIMARY KEY (id);


--
-- Name: use_cases use_cases_meaningful_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_meaningful_id_key UNIQUE (meaningful_id);


--
-- Name: use_cases use_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: file_attachments file_attachments_use_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.file_attachments
    ADD CONSTRAINT file_attachments_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES public.use_cases(id);


--
-- Name: use_cases use_cases_presentation_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_presentation_file_id_fkey FOREIGN KEY (presentation_file_id) REFERENCES public.file_attachments(id);


--
-- Name: use_cases use_cases_presentation_pdf_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.use_cases
    ADD CONSTRAINT use_cases_presentation_pdf_file_id_fkey FOREIGN KEY (presentation_pdf_file_id) REFERENCES public.file_attachments(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict Jkp2qHEtq3Xbdt4TNg7Lt98F8Igrdh7fP0p6xkr94MxfcfhnGsZ64TiZEfoR2nU

