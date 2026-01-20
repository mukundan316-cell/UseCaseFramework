# Hexaware AI Use Case Value Framework - Complete Help Guide

## Quick Start Guide

New to the Hexaware AI Use Case Value Framework? Follow these steps to get started:

### For New Users:
1. **Understand the Basics**: Review the [10-Lever Scoring Framework](#10-lever-scoring-framework) to understand how use cases are evaluated
2. **Learn the Quadrants**: Study the [Prioritization Matrix](#understanding-the-prioritization-matrix) to see how scores translate to action plans
3. **Explore Examples**: Check the example use cases in each quadrant for context
4. **Practice Scoring**: Start with a simple use case using the [Quick Reference Scoring Card](#quick-reference-scoring-card)

### For Administrators:
1. **Configure Thresholds**: Set appropriate [threshold values](#threshold-settings-guide) for your organization
2. **Customize Weights**: Adjust lever weights in the [Metadata Configuration](#metadata-configuration) if needed
3. **Set Up T-shirt Sizing**: Configure [cost estimation parameters](#t-shirt-sizing-system) for your region
4. **Enable Feedback**: Activate the [User Feedback System](#user-feedback-system) for continuous improvement

### Quick Reference Links:
- [Scoring Guidelines](#detailed-scoring-guidelines) - Detailed 1-5 scale criteria
- [Best Practices](#best-practices) - DO's and DON'Ts for accurate scoring
- [Troubleshooting](#troubleshooting) - Common issues and solutions
- [API Documentation](../server/routes.ts) - Technical implementation details
- [Database Schema](../shared/schema.ts) - Data structure reference

---

## Overview
The Hexaware AI Use Case Value Framework is a production-ready strategic platform designed to prioritize AI use cases within Hexaware. It features a comprehensive scoring framework, an executive analytics dashboard, and a full CRUD management system. The platform streamlines the prioritization process, offers robust data management, and provides clear insights for decision-making, ultimately enhancing Hexaware's AI strategy and market potential.

### Platform Capabilities
- **10-Lever Scoring Framework**: Sophisticated evaluation across business impact and implementation effort dimensions
- **Executive Analytics Dashboard**: Interactive matrix plots with quadrant-based ROI analysis
- **T-shirt Sizing System**: UK benchmark-compliant cost and timeline estimation
- **AI Inventory Integration**: Full governance tracking with 126 records (49 Hexaware Internal + 31 Industry Standard + 46 AI Inventory)
- **Assessment Platform**: Multi-section questionnaires with 25+ advanced question types
- **Manual Override System**: Flexible scoring adjustments with comprehensive audit trails
- **User Feedback Integration**: Continuous improvement through contextual feedback collection
- **LEGO Component Architecture**: Rationalized, reusable components with 60% maintenance reduction
- **Value Realization** *(Jan 2026)*: KPI-based ROI tracking with 9 insurance-specific metrics and industry benchmarks
- **Capability Transition** *(Jan 2026)*: "Teach Us to Fish" staffing curves, KT milestones, and independence projections
- **Target Operating Model** *(Jan 2026)*: 4 presets (Centralized CoE, Federated, Hybrid, CoE-Led) with phase-based governance
- **Markel 9 Topics Compliance** *(Jan 2026)*: Duplicate detection, full audit trails, role evolution tracking

## Value Framework & Scoring System

### 10-Lever Scoring Framework

The framework evaluates use cases across two dimensions using 10 levers with configurable weights:

#### Business Impact Levers (Impact Score):
1. **Revenue Impact** (Default: 20% weight)
   - Direct revenue generation potential
   - Market expansion opportunities
   - New revenue streams

2. **Cost Savings** (Default: 20% weight)
   - Operational efficiency improvements
   - Process automation benefits
   - Resource optimization

3. **Risk Reduction** (Default: 20% weight)
   - Compliance and regulatory benefits
   - Security enhancement
   - Operational risk mitigation

4. **Broker Partner Experience** (Default: 20% weight)
   - Partner satisfaction improvements
   - Relationship enhancement
   - Service quality benefits

5. **Strategic Fit** (Default: 20% weight)
   - Alignment with long-term business strategy
   - Competitive advantage potential
   - Market positioning benefits

#### Implementation Effort Levers (Effort Score):
1. **Data Readiness** (Default: 20% weight)
   - Availability of required data
   - Data quality assessment
   - Data governance maturity

2. **Technical Complexity** (Default: 20% weight)
   - Implementation difficulty
   - Technical challenges
   - Infrastructure requirements

3. **Change Impact** (Default: 20% weight)
   - Organizational change requirements
   - Process modification needs
   - Training and adoption challenges

4. **Model Risk** (Default: 20% weight)
   - AI model reliability concerns
   - Governance requirements
   - Regulatory compliance needs

5. **Adoption Readiness** (Default: 20% weight)
   - User acceptance likelihood
   - Change management needs
   - Cultural fit assessment

### Detailed Scoring Guidelines

#### Business Impact Levers (1-5 Scale)

**1. Revenue Impact**
- **1 (Low)**: Minimal revenue impact (<£100k annually)
- **2**: Small revenue potential (£100k-500k)
- **3**: Moderate revenue opportunity (£500k-2M)
- **4**: Significant revenue impact (£2M-5M)
- **5 (High)**: Transformational revenue potential (>£5M)

**2. Cost Savings**
- **1 (Low)**: Negligible cost reduction (<£50k annually)
- **2**: Minor operational savings (£50k-250k)
- **3**: Moderate efficiency gains (£250k-1M)
- **4**: Substantial cost reduction (£1M-3M)
- **5 (High)**: Major cost transformation (>£3M)

**3. Risk Reduction**
- **1 (Low)**: No material risk mitigation
- **2**: Addresses minor compliance/operational risks
- **3**: Reduces moderate regulatory/financial exposure
- **4**: Significantly improves risk profile
- **5 (High)**: Eliminates critical business risks

**4. Broker/Partner Experience**
- **1 (Low)**: No noticeable improvement
- **2**: Minor convenience improvements
- **3**: Moderate enhancement to partner workflows
- **4**: Significant improvement in partner satisfaction
- **5 (High)**: Game-changing partner experience

**5. Strategic Fit**
- **1 (Low)**: Peripheral to business strategy
- **2**: Loosely aligned with strategic goals
- **3**: Supports core strategic initiatives
- **4**: Critical enabler of strategic objectives
- **5 (High)**: Essential to strategic transformation

#### Implementation Effort Levers (1-5 Scale)

**1. Data Readiness**
- **1 (Poor)**: Data doesn't exist or is inaccessible
- **2**: Data exists but requires major cleaning/preparation
- **3**: Data available with moderate preparation needed
- **4**: Good quality data, minor preparation required
- **5 (Excellent)**: Clean, accessible, ready-to-use data

**2. Technical Complexity**
- **1 (Simple)**: Standard tools, proven approaches
- **2**: Minor technical challenges
- **3**: Moderate complexity, some custom development
- **4**: Complex integration, significant development
- **5 (Complex)**: Cutting-edge tech, major R&D required

**3. Change Impact**
- **1 (Minimal)**: No process changes required
- **2**: Minor adjustments to existing workflows
- **3**: Moderate process redesign needed
- **4**: Significant organizational change
- **5 (Extensive)**: Complete transformation required

**4. Model Risk**
- **1 (Low)**: Simple rules-based system
- **2**: Well-understood ML models
- **3**: Moderate model complexity
- **4**: Complex models with explainability challenges
- **5 (High)**: Black-box AI with regulatory concerns

**5. Adoption Readiness**
- **1 (Low)**: Strong resistance expected
- **2**: Significant change management needed
- **3**: Moderate user training required
- **4**: Users receptive with minimal training
- **5 (High)**: Eager adoption, minimal barriers

### Scoring Logic

#### Calculation Process:
1. Each lever is scored 1-5 (1 = Low, 5 = High)
2. Weighted calculation: `(lever_score × weight) / 100`
3. Sum all weighted scores for each dimension
4. Final scores clamped to 0-5 range

#### Formulas:
```
Impact Score = Σ(Business Impact Lever × Weight) / 100
Effort Score = Σ(Implementation Effort Lever × Weight) / 100
```

**Note**: Higher Effort scores indicate HIGHER complexity (harder to implement)

#### Manual Override System:
- **Effective Scoring**: System calculates "effective" scores using overrides when present
- **Override Logic**: `effectiveScore = manualScore ?? calculatedScore`
- **Reason Tracking**: All overrides require justification for audit compliance

## Understanding the Prioritization Matrix

The framework uses a 2x2 matrix to classify AI use cases based on two dimensions:

```
         High Business Value
                ↑
    ┌──────────────┬──────────────┐
    │              │              │
    │  QUICK WIN   │ STRATEGIC BET│
    │              │              │
    ├──────────────┼──────────────┤
    │              │              │
    │ EXPERIMENTAL │  WATCHLIST   │
    │              │              │
    └──────────────┴──────────────┘
    Low ← Implementation Complexity → High
```

- **Y-Axis**: Business Impact (Impact Score) - Higher is better
- **X-Axis**: Implementation Complexity (Effort Score) - Lower is better (left = easy, right = hard)

### Quadrant System

Uses configurable threshold (default: 3.0) to categorize use cases:

#### 🔴 Quick Win (High Value, Low Complexity)
**Characteristics:**
- Impact Score ≥ threshold
- Effort Score < threshold
- Fast ROI, minimal resources

**Action Plan:**
- Prioritize for immediate implementation
- Allocate resources immediately
- Use as proof points for AI strategy
- Target 3-6 month delivery

**Example Use Cases:**
- Automated quote generation
- Simple claims triage
- Document classification

#### 🔵 Strategic Bet (High Value, High Complexity)
**Characteristics:**
- Impact Score ≥ threshold
- Effort Score ≥ threshold
- Transformational but resource-intensive

**Action Plan:**
- Plan carefully with phased approach
- Secure executive sponsorship
- Build dedicated team
- Consider POC/pilot first
- 6-18 month timeline

**Example Use Cases:**
- End-to-end underwriting automation
- Complex fraud detection system
- Predictive risk modeling platform

#### 🟡 Experimental (Low Value, Low Complexity)
**Characteristics:**
- Impact Score < threshold
- Effort Score < threshold
- Easy to try but uncertain value

**Action Plan:**
- Test with minimal investment
- Use for learning and capability building
- Time-box experiments (1-3 months)
- Fail fast or scale if successful

**Example Use Cases:**
- Chatbot for internal FAQs
- Simple sentiment analysis
- Basic data visualization tools

#### 🔴 Watchlist (Low Value, High Complexity)
**Characteristics:**
- Impact Score < threshold
- Effort Score ≥ threshold
- High effort with questionable returns

**Action Plan:**
- Defer or avoid
- Monitor for changing conditions
- Revisit if business case improves
- Consider simpler alternatives

**Example Use Cases:**
- Complex AI with limited use cases
- Over-engineered solutions
- Technology-first initiatives without clear value

## Threshold Settings Guide

The threshold value (1-5 scale) determines quadrant boundaries:

### Conservative Approach (Threshold: 4.0-4.5)
**Use when:** Resources are limited, risk tolerance is low
**Result:** Only highest-value, lowest-risk initiatives proceed
**Pros:** Focus on sure wins
**Cons:** May miss innovative opportunities

### Balanced Approach (Threshold: 2.5-3.5)
**Use when:** Balanced portfolio desired
**Result:** Mix of quick wins and strategic initiatives
**Pros:** Diversified approach
**Cons:** Resources spread across multiple initiatives

### Aggressive Approach (Threshold: 1.5-2.0)
**Use when:** Innovation is priority, resources available
**Result:** More initiatives classified as high-value
**Pros:** Accelerated transformation
**Cons:** Higher risk, resource strain

## Portfolio Distribution Guidelines

### Healthy Portfolio Signs:
- **20-30% Quick Wins** (momentum builders)
- **30-40% Strategic Bets** (transformation drivers)
- **20-30% Experimental** (innovation pipeline)
- **<20% Watchlist** (minimize wasted effort)

### Warning Signs:
- **50% in Watchlist** = Poor use case selection
- **No Quick Wins** = Lack of momentum
- **All Strategic Bets** = Resource overload risk
- **Only Experimental** = Lack of strategic focus

## T-shirt Sizing System

### Configuration Architecture

T-shirt sizing is fully metadata-driven with no hard-coded values:

```json
{
  "enabled": true,
  "sizes": [
    {
      "name": "XS",
      "minWeeks": 1,
      "maxWeeks": 4,
      "teamSizeMin": 1,
      "teamSizeMax": 2,
      "color": "#10B981",
      "description": "Simple automation or tool integration"
    },
    {
      "name": "S",
      "minWeeks": 4,
      "maxWeeks": 8,
      "teamSizeMin": 2,
      "teamSizeMax": 4,
      "color": "#3B82F6",
      "description": "Basic ML model or process optimization"
    }
  ],
  "roles": [
    {
      "type": "Developer",
      "dailyRateGBP": 400
    },
    {
      "type": "Business Analyst",
      "dailyRateGBP": 350
    },
    {
      "type": "Project Manager",
      "dailyRateGBP": 500
    },
    {
      "type": "Data Engineer",
      "dailyRateGBP": 550
    },
    {
      "type": "Solution Architect",
      "dailyRateGBP": 650
    },
    {
      "type": "QA Engineer",
      "dailyRateGBP": 300
    }
  ],
  "overheadMultiplier": 1.4,
  "mappingRules": [
    {
      "name": "High Impact, Low Effort → Small",
      "condition": {
        "impactMin": 4.0,
        "effortMax": 2.0
      },
      "targetSize": "S",
      "priority": 1
    }
  ]
}
```

### Flow Diagram: Scoring to Cost Estimation

```
📊 SCORING INPUT
       ↓
   [10 Levers: 1-5 Scale]
   • Revenue Impact
   • Cost Savings
   • Risk Reduction
   • Partner Experience
   • Strategic Fit
   • Data Readiness
   • Technical Complexity
   • Change Impact
   • Model Risk
   • Adoption Readiness
       ↓
🧮 COMPUTED SCORES
   Impact Score (0-5)
   Effort Score (0-5)
       ↓
📍 QUADRANT PLACEMENT
   [Threshold: 3.0 default]
   • Quick Win (High Impact, Low Effort)
   • Strategic Bet (High Impact, High Effort)
   • Experimental (Low Impact, Low Effort)
   • Watchlist (Low Impact, High Effort)
       ↓
👕 T-SHIRT SIZE MAPPING
   [Based on Impact/Effort Matrix]
   • XS: 1-3 weeks, 1-2 people
   • S: 2-6 weeks, 2-3 people
   • M: 4-12 weeks, 3-5 people
   • L: 8-24 weeks, 5-8 people
   • XL: 16-52 weeks, 8-12 people
       ↓
💰 COST/BENEFIT ESTIMATES
   Cost = Team Size × Daily Rate × Duration × Overhead (1.35x)
   Benefits = Impact Score × Progressive Multiplier (XS:£25K, S:£50K, M:£100K, L:£200K, XL:£400K)
   ROI = (Benefits - Cost) / Cost × 100%
```

### Sizing Calculations

#### Cost Estimation:
```
Estimated Cost = (Average Team Size × Average Daily Rate × Duration in Days × Overhead Multiplier)
```

**UK Role-based Daily Rates (2025):**
- Developer: £400/day
- Business Analyst: £350/day  
- Project Manager: £500/day
- Data Engineer: £550/day
- Solution Architect: £650/day
- QA Engineer: £300/day

#### Timeline Estimation:
- Based on effort score mapping to size categories
- Configurable through mapping rules
- Considers complexity factors and team availability

#### Team Size Estimation:
- Automatically calculated based on impact/effort matrix
- Considers skill requirements and project complexity
- Provides min-max ranges for planning flexibility

#### Benefit Calculation:
**Progressive Size-based Multipliers (corrected 2025):**
- **XS**: £25K per impact point (Small quick wins)
- **S**: £50K per impact point (Standard projects) 
- **M**: £100K per impact point (Medium initiatives)
- **L**: £200K per impact point (Large strategic projects)
- **XL**: £400K per impact point (Major transformations)

**Formula:** `Annual Benefit = Impact Score × Size Multiplier × Range (±20%)`

**Example Calculations:**
- XS project with 4.0 impact: 4.0 × £25K = £100K (Range: £80K - £120K)
- M project with 4.0 impact: 4.0 × £100K = £400K (Range: £320K - £480K)
- XL project with 3.2 impact: 3.2 × £400K = £1.28M (Range: £1.02M - £1.54M)

#### Risk Assessment Integration:
- T-shirt size correlates with quadrant positioning
- Higher effort scores typically result in larger sizes
- Risk factors influence team composition recommendations

## Metadata Configuration

### Configurable Elements

#### 1. Scoring Configuration (`/api/metadata`)
- **Lever Weights**: Adjust the default 20% weights for all 10 levers
- **Quadrant Thresholds**: Change the 3.0 default threshold for classification
- **Score Ranges**: Configure min/max scoring ranges (default: 1-5)

#### 2. T-shirt Sizing Configuration
- **Size Definitions**: Complete control over XS, S, M, L, XL categories
- **Cost Rates**: Role-based daily rates in GBP
- **Mapping Rules**: Impact/effort to size mapping logic
- **Overhead Multipliers**: Project overhead calculations

#### 3. Visual Configuration
- **Bubble Chart Settings**: Min/max bubble sizes, scaling power (default: 1.3)
- **Quadrant Colors**: Customizable color schemes for each quadrant
- **Status Colors**: AI Inventory status indicator colors

#### 4. Business Metadata
- **Value Chain Components**: Processes, activities, business segments
- **Geographies**: Regional categorization options
- **Use Case Types**: Strategic, AI Tool, Horizontal classifications
- **Status Types**: Active, PoC, Pending Closure, Obsolete, Inactive

### Configuration Locations

#### Primary Configuration Files:
- **`shared/constants/app-config.ts`**: Core application constants
- **Metadata API**: Dynamic configuration via `/api/metadata`
- **Admin Interface**: User-friendly configuration management

#### Field Mappings:
- **Excel Import**: Configurable field mappings for bulk import
- **Export Templates**: Customizable export field structures
- **Validation Rules**: Configurable validation schemas

## Manual Override System

### Override Capabilities

#### Score Overrides:
- **Impact Score Override**: Manual adjustment with reason tracking
- **Effort Score Override**: Manual adjustment with reason tracking
- **Quadrant Override**: Direct quadrant assignment bypassing calculations

#### Override Logic Flow:
```typescript
// Effective scoring calculation
const effectiveImpact = useCase.manualImpactScore ?? calculatedImpactScore;
const effectiveEffort = useCase.manualEffortScore ?? calculatedEffortScore;
const effectiveQuadrant = useCase.manualQuadrant ?? 
  calculateQuadrant(effectiveImpact, effectiveEffort, threshold);
```

#### Audit Trail:
- **Override Reason**: Required justification for all manual adjustments
- **Override Tracking**: Historical record of all changes
- **Visibility**: Clear indicators when overrides are active

### Override Use Cases:
1. **Strategic Adjustments**: When calculated scores don't reflect strategic importance
2. **External Factors**: Incorporating factors not captured by standard levers
3. **Stakeholder Input**: Reflecting executive or expert judgment
4. **Regulatory Requirements**: Adjusting for compliance considerations

## AI Inventory Integration

### Governance Framework

#### Core Governance Fields:
- **AI or Model Classification**: Distinguishes between AI applications and ML models
- **Risk Assessments**: Comprehensive customer and Hexaware-specific risk evaluations
- **Data Usage Tracking**: Detailed data source and usage documentation
- **Policy Compliance**: Hexaware AI Policy Framework adherence tracking
- **Validation Responsibility**: Internal vs third-party validation assignments
- **Stakeholder Mapping**: Governance structure and informed parties

#### Status Tracking System:
- **Deployment Status**: PoC → Pilot → Production → Decommissioned lifecycle
- **AI Inventory Status**: Active, Proof of Concept, Pending Closure, Obsolete, Inactive
- **Business Function Mapping**: Marketing, CIO, Claims, Risk Management, etc.
- **Third-party Model Tracking**: Vendor relationship and dependency management

### Governance Workflows:
1. **Risk Assessment Process**: Systematic evaluation of customer and organizational risks
2. **Policy Compliance Review**: Regular assessment against Hexaware AI governance framework
3. **Validation Planning**: Internal capability assessment and third-party requirements
4. **Stakeholder Communication**: Automated notification and reporting workflows

## Assessment System Integration

### Survey.js Platform Features

#### Advanced Question Types (25+ types):
- **Rating Scales**: Likert scales, star ratings, slider inputs
- **Multiple Choice**: Single and multi-select with conditional logic
- **Text Inputs**: Short text, long text, numeric inputs
- **Matrix Questions**: Grid-based comparative assessments
- **File Uploads**: Document and evidence collection
- **Dynamic Content**: Conditional questions based on previous responses

#### Multi-section Assessment Structure:
1. **Organizational Readiness**: Culture, leadership, resources assessment
2. **Data Maturity**: Data quality, governance, accessibility evaluation
3. **Technical Capability**: Infrastructure, skills, tooling assessment
4. **Process Maturity**: Workflow integration and optimization readiness
5. **Risk Management**: Governance, compliance, ethical considerations
6. **Strategic Alignment**: Business objectives and priority alignment

#### Assessment Analytics:
- **Dimension Scoring**: Weighted scoring across assessment categories
- **Gap Analysis**: Identification of capability gaps and improvement areas
- **Maturity Scoring**: Overall organizational AI readiness assessment
- **Benchmark Comparisons**: Industry and best practice comparisons

### PDF Export Capabilities:
- **Client-side Generation**: Survey.js-based PDF creation for optimal compatibility
- **Professional Formatting**: Hexaware-branded templates with consistent styling
- **Comprehensive Reports**: Full assessment results with recommendations
- **Executive Summaries**: High-level overview for stakeholder communication

## User Feedback System

### Continuous Improvement Integration
The platform includes a comprehensive feedback collection system that captures user input to improve accuracy and relevance:

#### T-shirt Sizing Feedback:
- **Context Capture**: Records current size, cost range, and timeline estimates
- **User Suggestions**: Allows users to propose alternative sizing
- **API Integration**: `/api/feedback` endpoint for structured data collection
- **Improvement Loop**: Feedback informs future sizing algorithm refinements

#### Feedback Data Structure:
```json
{
  "useCaseId": "unique-identifier",
  "useCaseTitle": "Use case name",
  "currentTShirtSize": "M",
  "currentCostRange": "£50k-£150k",
  "currentTimeline": "12-16 weeks",
  "feedback": "User feedback text",
  "suggestedSize": "S",
  "userEmail": "user@hexaware.com",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

## Enhanced Features

### Bubble Sizing Optimization
The executive analytics matrix plot uses optimized bubble sizing for better visualization:
- **Size Range**: 3-8px for subtle proportional representation
- **Scaling Logic**: Moderate exponential curve (power 1.3) for realistic scaling
- **Impact Correlation**: Bubble size proportional to business impact level
- **Visual Clarity**: Enhanced distinction without overwhelming the interface

### Horizontal Use Case Tracking
The platform now supports cross-functional use case identification:
- **Horizontal Classification**: Boolean flag for multi-department use cases
- **Type Categorization**: Array field for horizontal use case types
- **Enhanced Filtering**: Improved search and categorization capabilities
- **Cross-functional Visibility**: Better tracking of shared initiatives

### LEGO Component Enhancements
Streamlined component architecture with 60% maintenance reduction:

#### SmartRatingLegoBlock (5 variants):
- **Descriptive**: Text-based rating scales
- **Stars**: Visual star rating system
- **Maturity**: Capability maturity assessments
- **Capability**: Technical capability ratings
- **Slider**: Interactive slider controls

#### UnifiedValueInputLegoBlock (3 variants):
- **Currency**: Monetary value inputs with GBP formatting
- **Percentage Allocation**: 100% constraint validation
- **Percentage Target**: Unconstrained percentage inputs

#### ConfigurationToggleLegoBlock (3 variants):
- **Standard**: Basic toggle functionality
- **With Reason**: Toggle requiring justification
- **Confirmation**: Toggle with confirmation dialog

## Performance & Optimization

### Current Optimizations:
- **Client-side PDF Generation**: Improved performance vs server-side rendering
- **Debounced Search**: 300ms delay for improved user experience
- **Optimized Bubble Rendering**: Efficient chart rendering with configurable scaling
- **Component Rationalization**: 60% maintenance overhead reduction
- **Progressive Disclosure**: Hover tooltips for calculation transparency
- **Responsive Design**: Optimal performance across device types

### Performance Configuration:
```typescript
// From app-config.ts
UX: {
  DEBOUNCE_DELAY: 300,        // Search/filter debouncing
  ANIMATION_DURATION: 200,     // Smooth transitions
  TOOLTIP_DELAY: 500,         // Tooltip display timing
  MIN_BUBBLE_SIZE: 3,         // Matrix plot bubble minimum
  MAX_BUBBLE_SIZE: 8,         // Matrix plot bubble maximum
  BUBBLE_SCALE_POWER: 1.3,    // Exponential scaling factor
}
```

## Data Management

### Database Architecture:
- **String Boolean Pattern**: Consistent use of 'true'/'false' strings throughout
- **Array Field Support**: Multi-select capabilities for processes, segments, geographies
- **JSON Blob Storage**: Flexible metadata storage for complex configurations
- **File Metadata Tracking**: Database references with filesystem storage

### Data Validation:
- **Minimal Requirements**: Title and description only for basic validation
- **Zod Schema Integration**: Type-safe validation throughout the stack
- **Excel Import Validation**: Comprehensive validation matching UI forms
- **Data Integrity**: Automated cleanup and consistency checking

## Best Practices

### Scoring Best Practices

#### DO's:
✅ **Gather cross-functional input** - Include IT, business, risk, and compliance perspectives
✅ **Use data where possible** - Support scores with metrics and benchmarks
✅ **Consider total cost** - Include ongoing maintenance, not just implementation
✅ **Think long-term** - Consider 3-5 year value, not just immediate impact
✅ **Review regularly** - Reassess scores quarterly as conditions change
✅ **Document assumptions** - Record reasoning for future reference

#### DON'Ts:
❌ **Score in isolation** - Avoid single person scoring
❌ **Ignore dependencies** - Consider impact on other systems
❌ **Overestimate benefits** - Be realistic about achievable value
❌ **Underestimate complexity** - Include all aspects of implementation
❌ **Set and forget** - Scores should evolve with learning

### Configuration Management:
1. **Use Centralized Config**: Leverage `app-config.ts` for consistent settings
2. **Test Configuration Changes**: Validate metadata changes before deployment
3. **Document Custom Weights**: Maintain rationale for custom scoring weights
4. **Regular Review Cycles**: Periodic assessment of threshold and weight effectiveness

### Quarterly Review Process
1. **Review existing scores** - Have conditions changed?
2. **Assess completed initiatives** - Were scores accurate?
3. **Adjust threshold if needed** - Based on resource availability
4. **Rebalance portfolio** - Ensure healthy distribution
5. **Update stakeholders** - Communicate changes and rationale

### Assessment Best Practices:
1. **Regular Assessment Updates**: Keep organizational maturity assessments current
2. **Multi-stakeholder Input**: Involve diverse perspectives in assessments
3. **Action Planning**: Convert assessment results into actionable improvement plans
4. **Progress Tracking**: Monitor capability development over time
5. **Feedback Integration**: Leverage user feedback for continuous improvement

## Quick Reference Scoring Card

| Score | Business Value | Implementation Ease |
|-------|----------------|--------------------|
| **5** | Game-changing impact | Plug-and-play solution |
| **4** | Significant value | Straightforward implementation |
| **3** | Moderate benefit | Average complexity |
| **2** | Limited value | Challenging implementation |
| **1** | Minimal impact | Very difficult/risky |

## Troubleshooting

### Common Issues:
1. **Scoring Inconsistencies**: Check weight configuration and calculation logic
2. **T-shirt Sizing Errors**: Validate mapping rules and size definitions
3. **PDF Generation Problems**: Ensure client-side generation is enabled
4. **Import Failures**: Verify Excel field mappings and data formats
5. **Feedback Submission Issues**: Check API endpoint availability and data validation
6. **Bubble Chart Display Problems**: Verify bubble sizing configuration and data ranges

### Support Resources:
- **Configuration Validation**: Built-in validation for metadata changes
- **Error Messaging**: Detailed error descriptions and resolution guidance
- **Audit Logs**: Comprehensive logging for troubleshooting
- **Admin Tools**: Built-in diagnostic and maintenance utilities
- **User Feedback System**: Continuous improvement through user input collection
- **Performance Monitoring**: Real-time performance tracking and optimization

### Technical References:
- **API Documentation**: [Server Routes](../server/routes.ts) - Complete API endpoint reference
- **Database Schema**: [Shared Schema](../shared/schema.ts) - Data structure definitions
- **Configuration**: [App Config](../shared/constants/app-config.ts) - Application constants
- **Calculations**: [Score Logic](../shared/calculations.ts) - Scoring algorithm implementation
- **Components**: [LEGO Blocks](../client/src/components/lego-blocks/) - UI component library
- **Utilities**: [Score Override](../shared/utils/scoreOverride.ts) - Manual override logic

## Key Reminders

> **Remember**: The goal is not to have all use cases as Quick Wins, but to build a balanced portfolio that delivers both immediate value and long-term transformation.

### Success Indicators:
- **Balanced Portfolio Distribution**: Healthy mix across all quadrants (20-30% Quick Wins, 30-40% Strategic Bets, 20-30% Experimental, <20% Watchlist)
- **Regular Score Calibration**: Quarterly reviews and adjustments based on outcomes
- **Stakeholder Alignment**: Consistent scoring across teams with cross-functional input
- **Continuous Improvement**: Active use of feedback systems for algorithm refinement
- **Strategic Focus**: Clear connection between scores and business objectives
- **Naming Consistency**: Standardized role titles and terminology throughout assessments
- **Documentation Currency**: Regular updates to reflect platform enhancements and learnings

---

*This comprehensive guide covers the complete functionality of the Hexaware AI Use Case Value Framework, including all recent enhancements and best practices. For technical implementation details, refer to the codebase documentation and API specifications.*