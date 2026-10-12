# Hexaware AI Use Case Value Framework

## What this app is

A decision-support workspace for organizing, comparing, and governing AI initiatives. It helps insurers answer:

- Which AI opportunities deserve investment?
- What business value might they deliver, and how difficult are they to implement?
- What readiness, ownership, and risk questions need attention?
- How should initiatives move from ideas into a delivery portfolio?
- How will teams track benefits and develop the capabilities to operate them?

The app brings a use case library, impact-versus-effort scoring, portfolio views, value planning, operating-model guidance, capability planning, and responsible-AI information into one place.

**It manages AI initiatives; it does not execute them.** Recording an underwriting assistant or claims automation use case does not deploy a model, process a claim, price a policy, or connect the app to an insurer's operational systems.

## Verification status

**Reviewed: 12 October 2026.** This guide was checked against the current implementation, the running development app, and read-only responses from that app.

- The dashboard, Insights landing view, and assessment landing page were visually checked. Portfolio, KPI, governance, operating-model, capability configuration, and questionnaire read requests returned data.
- The development snapshot contained **28 active use cases, 110 reference use cases, 169 KPI definitions, and one questionnaire definition**. These are dated observations, not product limits or verified insurer adoption figures.
- The platform reported **no active published deployment and no production database for this workspace**. No production URL or live customer results could therefore be verified.
- Creating, editing, deleting, activating, submitting assessments, importing, uploading, and downloading reports were **not end-to-end tested in this review**. Their descriptions below are based on implemented features, not a claim that every action has passed a live acceptance test.
- The assessment landing page rendered but produced two missing-resource errors. Full assessment completion remains unverified.

**Data in the app is not automatically evidence of real-world results.** The application includes seeded/showcase content and generated estimates; startup can populate or refresh showcase records. Treat displayed benefits, investment figures, progress, and validation labels as planning information until their source and approval have been confirmed.

## Who it is for

| User group | What they can use it for |
|---|---|
| Insurance executives and investment committees | Compare opportunities, discuss trade-offs, and review the committed portfolio. |
| Strategy teams, transformation offices, and PMOs | Maintain the idea pipeline, prioritize proposals, and coordinate reviews. |
| Underwriting, claims, operations, distribution, and actuarial teams | Describe business problems, map initiatives to processes, and select relevant measures. |
| AI, data, technology, and delivery teams | Assess implementation effort, data readiness, delivery requirements, and capability needs. |
| Finance and value owners | Review assumptions, investment, benefit estimates, confidence, and recorded tracking information. |
| Risk and governance teams | Review responsible-AI information, gate decisions, and mitigation needs. |
| Framework administrators | Maintain clients, engagements, classifications, scoring settings, questionnaires, and operating-model configuration. |

These are **intended responsibilities**, not a claim of enforced access permissions. An Admin label or named approver is not proof that only that person can perform the action.

## How insurers can benefit

| Insurance need | Relevant app capability | Practical benefit |
|---|---|---|
| Too many competing AI proposals | Shared library and impact-versus-effort matrix | Gives investment discussions a consistent comparison method rather than relying only on persuasive proposals. |
| Unclear links between AI and business outcomes | Process/activity mapping and KPI selection | Connects an initiative to the insurance operation it is intended to improve. |
| Optimistic or inconsistent business cases | Investment inputs, value estimates, confidence factors, and validation status | Makes assumptions visible for challenge by business, finance, and actuarial stakeholders. |
| Pilots without clear ownership or progression | Active portfolio, lifecycle phases, and governance decisions | Helps teams discuss what must happen before committing to or progressing an initiative. |
| Dependence on external delivery teams | Capability-transition and knowledge-transfer planning | Makes the intended path toward internal ownership explicit. |
| Fragmented executive reporting | Dashboard, four Insights views, and report/export features | Provides a shared basis for portfolio reviews. |
| AI risk considered too late | Responsible-AI information and mitigation guidance | Brings oversight, explainability, impact assessment, and review needs into planning. |

These are **potential decision-making benefits**, not guaranteed savings, improved loss ratios, regulatory approval, or independently measured customer outcomes.

### Insurance examples

The KPI library includes underwriting and risk selection, claims management, policy administration, distribution and broker operations, and finance and actuarial categories. It also covers enterprise concerns such as data quality, model performance, security, talent, and customer experience.

Illustrative ways an insurer could use the framework:

- **Underwriting:** compare submission-triage or decision-support proposals, consider readiness and model risk, and identify measures for turnaround time and decision quality.
- **Claims:** evaluate document processing, first-notice-of-loss support, or claims-triage proposals, with appropriate efficiency and quality measures.
- **Policy administration:** assess servicing or renewal automation ideas alongside implementation and change requirements.
- **Distribution and broker operations:** compare service improvements using partner-experience and business-value criteria.
- **Finance and actuarial:** review assumptions behind proposed benefits and track the state of financial or actuarial validation.

These examples describe portfolio-planning use, not operational insurance functionality delivered by this app.

## Functional guide

### 1. Organize work by client and engagement

The workspace supports a **Client → Engagement → Use Cases** structure. Select the relevant client and engagement before reviewing or managing a portfolio. Engagements can carry their own operating-model settings.

This provides organizational context, but should not be treated as proven confidential separation between clients. Some summary views use broader portfolio scopes; confirm the selected population before presenting totals.

### 2. Maintain an idea pool and a committed portfolio

The Explorer separates:

- **Reference Library:** the idea pool for discovery and comparison; reference-tier cases are treated as Ideation.
- **Active Portfolio:** the committed pipeline, intended to start at Assessment or later.

Use case management includes creation, editing, deletion, activation/deactivation, classification, and supporting information. Records can capture descriptions, processes, activities, business segments, lines of business, geographies, status, and scoring inputs.

Use the distinction deliberately: an attractive reference idea is not the same as an approved delivery commitment. Activation has governance checks in its dedicated workflow; this review did not establish that every alternative or bulk-edit path applies identical checks.

### 3. Compare opportunities using ten scoring levers

The framework separates business impact from implementation effort:

| Business-impact levers | Implementation-effort levers |
|---|---|
| Revenue impact | Data readiness |
| Cost savings | Technical complexity |
| Risk reduction | Change impact |
| Broker/partner experience | Model risk |
| Strategic fit | Adoption readiness |

Scores use configurable weights. The matrix places cases into:

- **Quick Win:** high impact, low effort.
- **Strategic Bet:** high impact, high effort.
- **Experimental:** low impact, low effort.
- **Watchlist:** low impact, high effort.

The default dividing threshold is **3 on the five-point scale**, but configuration can change it. Use the on-screen scoring guidance consistently, particularly for readiness-related inputs: the matrix's effort axis treats a higher total as more difficult.

Scoring and override controls support judgment; they do not replace it. A Quick Win classification is not funding approval, and incomplete inputs can distort comparisons.

### 4. Review the executive dashboard

The dashboard presents the active pipeline, priority groupings, matrix, and planning summaries for investment, timeline, and resources. It helps committees compare the portfolio rather than inspect every proposal individually.

Cost and timeline ranges are sizing estimates, not quotes or delivery commitments. Portfolio timeline totals are not necessarily an elapsed delivery schedule: parallel work, shared resources, and dependencies need separate planning.

### 5. Plan and review value realization

Value information can include:

- Relevant KPI selections and baseline/target values.
- Benchmark-derived improvement ranges and estimates.
- Initial investment, ongoing monthly costs, and currency settings.
- Recorded tracking entries and calculated metrics.
- Confidence adjustments, rationale, and validation status.

The framework distinguishes financial, operational, strategic, and compliance KPIs. Value streams include operational savings, combined operating ratio improvement, revenue uplift, risk mitigation, customer experience, and regulatory compliance.

Validation labels include **unvalidated**, **pending finance**, **pending actuarial**, and **fully validated**. A stored label is not independent evidence that the appropriate person has approved the figures.

#### How to interpret ROI and benefits

The shared ROI calculation is:

**ROI (%) = (cumulative value − total investment) ÷ total investment × 100**

ROI is unavailable when investment is zero or negative. The shared portfolio calculation uses initial investment plus twelve months of ongoing costs for cases with investment data; it can also include estimated values from other cases. Consequently, a portfolio total may combine different evidence levels and should not automatically be called “realized return.”

Before using a value figure for an investment decision:

1. Establish whether it is a benchmark estimate, a target, or a measured actual.
2. Confirm the baseline, measurement period, business volume, and unit.
3. Check costs and whether benefits overlap with another KPI or initiative.
4. Review the confidence adjustment and validation evidence.
5. Confirm that currencies and time periods are comparable. Currency settings do not establish live exchange-rate conversion or audited multi-currency consolidation.

### 6. Define the target operating model and governance

The **Target Operating Model (TOM)** describes how initiatives are organized and move through a lifecycle. Presets support different ownership structures, including centralized, federated, hybrid, and CoE-led approaches.

The enterprise lifecycle includes **Ideation → Assessment → Foundation → Build → Scale → Operate**; actual phase definitions and progression depend on the selected configuration.

Governance features include operating-model, intake/prioritization, and responsible-AI decisions, a review queue, and decision history. Phase guidance helps teams identify information that needs attention as an initiative matures.

References to **NIST AI RMF** and **ISO 42001** describe framework-oriented guidance, **not certification, a compliance opinion, or proof that an insurer meets its regulatory obligations**. Review records and change logs are not a verified tamper-proof audit system.

### 7. Plan capability transition

Capability-transition features cover role evolution, staffing expectations, certifications, knowledge-transfer milestones, and independence targets. Defaults can be derived from use case attributes and benchmark archetypes.

Use them to discuss who will build, operate, and own an initiative, and what skills must transfer. Derived staffing curves or independence targets are plans—not evidence that people have completed training or that the insurer can operate the solution independently.

### 8. Review responsible AI

Responsible-AI views organize risk information and highlight mitigation needs. High-risk guidance includes human oversight, explainability, periodic review, and impact assessment.

These views support review conversations. They do not automatically test deployed models for fairness, monitor model drift, enforce human oversight in a claims system, or perform a legal assessment.

### 9. Use the four Insights views

| View | Main review question |
|---|---|
| Value Realization | What value is estimated or recorded, and what evidence supports it? |
| Operating Model | Where are initiatives in the lifecycle, and what governance work remains? |
| Capability Transition | What delivery and ownership capabilities need to develop? |
| Responsible AI | Which cases need risk review or additional mitigations? |

Insights offers Active Portfolio and Reference Library scopes. Check the scope before comparing counts or presenting a summary: an idea-pool estimate is not a committed-portfolio result.

### 10. Assess readiness and explore the roadmap

The app includes an assessment landing page, questionnaire selection/session views, Survey.js questionnaire screens, saved-response functionality, and recommendation-related features.

The landing view and questionnaire read services were observed, but completing, resuming, scoring, and applying recommendations were not verified end to end. Do not base a decision on an assessment result until that workflow has been checked.

The **AI Roadmap** is guidance content with fixed illustrative progress values; it is not a live measurement of an insurer's maturity or delivery progress.

### 11. Share information and maintain the framework

Implemented supporting features include:

- PDF reporting for portfolios, libraries, assessments, and individual use cases.
- Excel import/export and JSON backup exports.
- Supporting presentation/file uploads, with a 50 MB limit on presentation uploads.
- Administration of framework data, library content, assessments, and TOM settings.
- In-app help explaining role-oriented workflows.

Exports, imports, conversion, and backup restoration were not exercised in this review. Uploaded files and questionnaire materials use local storage; confirm persistence, retention, and recovery arrangements before relying on them as the sole record.

## Suggested workflow for an insurer

1. **Set the context.** Select the client and engagement; agree the business objective, scope, and decision owners.
2. **Build the idea pool.** Browse or add reference use cases mapped to the relevant insurance processes and activities.
3. **Score consistently.** Review all ten levers, challenge assumptions, and compare cases in the matrix.
4. **Prepare the business case.** Select KPIs, establish baselines, estimate costs and benefits, and record confidence and validation needs.
5. **Review readiness and governance.** Agree ownership, risk mitigations, operating-model requirements, and required approvals.
6. **Commit deliberately.** Activate approved initiatives and manage their lifecycle rather than treating every idea as funded.
7. **Review delivery and value.** Use Insights to discuss phase, capability, risk, and benefit information; distinguish estimates from measured outcomes.
8. **Share a qualified summary.** Export the appropriate scope and state assumptions, evidence dates, and outstanding decisions.

## Important boundaries before business use

- **Not a live-production assurance:** this review verified the development app, not a published customer deployment.
- **Not all data is customer evidence:** showcase records and automatically derived values can appear in summaries.
- **Not an access-controlled insurer system by default:** the current application entry point does not enforce authentication or role-based permissions. Client/engagement selection is not a security boundary. Do not load confidential policyholder, claims, or commercial data without an appropriate access-control review.
- **Not fully acceptance-tested:** assessment resource errors remain, and write/export workflows were not exercised. Existing code checks also fail; no blanket reliability or production-readiness claim is made.
- **Not an operational AI platform:** the app does not itself run the insurance AI solutions described in its library.
- **Not regulatory certification or guaranteed ROI:** stakeholders remain responsible for approvals, evidence, financial validation, and compliance.

## Further project context

This README is the business-facing functional guide. [replit.md](replit.md) contains project-maintenance context and implementation caveats. Neither document replaces testing the actual environment and workflows an insurer intends to use.
