# RSA AI Use Case Value Framework - Complete Help Guide

## Overview
The RSA AI Use Case Value Framework is a production-ready platform that prioritizes AI use cases using a sophisticated 10-lever scoring system, executive analytics, and comprehensive data management capabilities.

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

#### Manual Override System:
- **Effective Scoring**: System calculates "effective" scores using overrides when present
- **Override Logic**: `effectiveScore = manualScore ?? calculatedScore`
- **Reason Tracking**: All overrides require justification

### Quadrant System

Uses configurable threshold (default: 3.0) to categorize use cases:

#### Quadrant Definitions:
- **Quick Win** (Green): High Impact (≥3.0) + Low Effort (<3.0)
  - High business value with minimal implementation effort
  - Recommended for immediate prioritization
  - Typical ROI timeframe: 3-9 months

- **Strategic Bet** (Blue): High Impact (≥3.0) + High Effort (≥3.0)
  - Significant long-term value justifying higher investment
  - Requires careful planning and adequate resources
  - Typical ROI timeframe: 12-24 months

- **Experimental** (Yellow): Low Impact (<3.0) + Low Effort (<3.0)
  - Suitable for learning and capability building
  - Good for skill development initiatives
  - Typical ROI timeframe: 6-12 months with learning benefits

- **Watchlist** (Red): Low Impact (<3.0) + High Effort (≥3.0)
  - Poor return prospects
  - Should be deprioritized or re-scoped
  - Consider alternative approaches

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
      "type": "Senior Developer",
      "dailyRateGBP": 600
    },
    {
      "type": "Data Scientist",
      "dailyRateGBP": 700
    },
    {
      "type": "ML Engineer",
      "dailyRateGBP": 650
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

### Sizing Calculations

#### Cost Estimation:
```
Estimated Cost = (Average Team Size × Average Daily Rate × Duration in Days × Overhead Multiplier)
```

#### Timeline Estimation:
- Based on effort score mapping to size categories
- Configurable through mapping rules
- Considers complexity factors and team availability

#### Team Size Estimation:
- Automatically calculated based on impact/effort matrix
- Considers skill requirements and project complexity
- Provides min-max ranges for planning flexibility

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
- **Risk Assessments**: Comprehensive customer and RSA-specific risk evaluations
- **Data Usage Tracking**: Detailed data source and usage documentation
- **Policy Compliance**: RSA AI Policy Framework adherence tracking
- **Validation Responsibility**: Internal vs third-party validation assignments
- **Stakeholder Mapping**: Governance structure and informed parties

#### Status Tracking System:
- **Deployment Status**: PoC → Pilot → Production → Decommissioned lifecycle
- **AI Inventory Status**: Active, Proof of Concept, Pending Closure, Obsolete, Inactive
- **Business Function Mapping**: Marketing, CIO, Claims, Risk Management, etc.
- **Third-party Model Tracking**: Vendor relationship and dependency management

### Governance Workflows:
1. **Risk Assessment Process**: Systematic evaluation of customer and organizational risks
2. **Policy Compliance Review**: Regular assessment against RSA AI governance framework
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
- **Professional Formatting**: RSA-branded templates with consistent styling
- **Comprehensive Reports**: Full assessment results with recommendations
- **Executive Summaries**: High-level overview for stakeholder communication

## Performance & Optimization

### Current Optimizations:
- **Client-side PDF Generation**: Improved performance vs server-side rendering
- **Debounced Search**: 300ms delay for improved user experience
- **Optimized Bubble Rendering**: Efficient chart rendering with configurable scaling
- **Component Rationalization**: 60% maintenance overhead reduction

### Performance Configuration:
```typescript
// From app-config.ts
UX: {
  DEBOUNCE_DELAY: 300,        // Search/filter debouncing
  ANIMATION_DURATION: 200,     // Smooth transitions
  TOOLTIP_DELAY: 500,         // Tooltip display timing
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

### Configuration Management:
1. **Use Centralized Config**: Leverage `app-config.ts` for consistent settings
2. **Test Configuration Changes**: Validate metadata changes before deployment
3. **Document Custom Weights**: Maintain rationale for custom scoring weights
4. **Regular Review Cycles**: Periodic assessment of threshold and weight effectiveness

### Scoring Best Practices:
1. **Consistent Application**: Apply scoring criteria uniformly across use cases
2. **Stakeholder Alignment**: Ensure scoring reflects organizational priorities
3. **Regular Calibration**: Review and adjust weights based on outcomes
4. **Override Justification**: Always document reasons for manual overrides

### Assessment Best Practices:
1. **Regular Assessment Updates**: Keep organizational maturity assessments current
2. **Multi-stakeholder Input**: Involve diverse perspectives in assessments
3. **Action Planning**: Convert assessment results into actionable improvement plans
4. **Progress Tracking**: Monitor capability development over time

## Troubleshooting

### Common Issues:
1. **Scoring Inconsistencies**: Check weight configuration and calculation logic
2. **T-shirt Sizing Errors**: Validate mapping rules and size definitions
3. **PDF Generation Problems**: Ensure client-side generation is enabled
4. **Import Failures**: Verify Excel field mappings and data formats

### Support Resources:
- **Configuration Validation**: Built-in validation for metadata changes
- **Error Messaging**: Detailed error descriptions and resolution guidance
- **Audit Logs**: Comprehensive logging for troubleshooting
- **Admin Tools**: Built-in diagnostic and maintenance utilities

---

*This guide covers the complete functionality of the RSA AI Use Case Value Framework. For technical implementation details, refer to the codebase documentation and API specifications.*