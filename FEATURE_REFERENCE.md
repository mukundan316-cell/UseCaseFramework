# RSA AI Framework - Complete Feature Reference

## Navigation System

### Primary Tabs
- **Dashboard View**: Portfolio overview with resumable assessments and matrix visualization
- **Explorer**: Use case browsing with advanced filtering and CRUD operations
- **AI Assessment**: Complete maturity questionnaire with progress persistence
- **Admin**: Metadata management and system configuration

## Dashboard Features

### Portfolio Overview (SummaryMetricsLegoBlock)
- **Quadrant metrics** with clickable filtering integration
- **Real-time counts** across all four priority quadrants
- **Average scores** for Impact and Effort calculations
- **New use cases** tracking with monthly statistics
- **Interactive cards** that filter the matrix view when clicked

### Resumable Assessments (ResumeProgressLegoBlock)
- **Progress visualization** with completion percentages
- **Section tracking** showing current position
- **Last saved timestamps** with relative time display
- **Resume capability** returning to exact assessment position
- **Delete functionality** for clearing unwanted progress
- **Auto-refresh** checking for new progress every 30 seconds

### Matrix Visualization
- **Interactive scatter plot** with use case positioning
- **Hover tooltips** showing detailed use case information
- **Quadrant boundaries** clearly marked at 3.0 threshold
- **Color coding** by quadrant with consistent theme
- **Recommendation highlighting** with gold star indicators
- **Click-to-detail** functionality for use case editing

## Explorer Features

### Advanced Filtering System
- **Text search** across title and description fields
- **Quick quadrant filters** with active state indicators
- **Process filtering** across value chain components
- **Activity filtering** with contextual options
- **Line of Business** multi-selection support
- **Business Segment** categorical filtering
- **Geography** regional filtering
- **Use Case Type** classification filtering
- **Recommendation toggle** showing assessment-matched cases
- **Clear filters** functionality with single click

### Use Case Management (CRUDUseCaseModal)
- **Comprehensive form** with all required fields
- **12-lever scoring sliders** with tooltips and descriptions
- **Real-time calculations** showing Impact and Effort scores
- **Quadrant preview** with automatic assignment logic
- **Validation system** ensuring data completeness
- **Create and Edit modes** with proper state management
- **Database persistence** with immediate updates

### Card Display System
- **Compact cards** showing essential information
- **Score visualization** with Impact and Effort display
- **Metadata badges** for quick identification
- **Edit access** via click-through actions
- **Responsive grid** adapting to screen size
- **Recommendation indicators** for assessment matches

## Assessment System Features

### Questionnaire Workflow (QuestionnaireContainer)
- **Email capture** with validation
- **Multi-section progression** with navigation controls
- **Question type support**: Scale, multiple choice, text, number
- **Required field validation** with error messaging
- **Section-by-section validation** preventing incomplete progression
- **Progress tracking** with visual completion indicators

### Enhanced Progress Persistence (useProgressPersistence)
- **1-second debounced auto-save** minimizing database calls
- **LocalStorage backup** for offline capabilities
- **Session recovery** on browser reload with validation
- **30-day retention** with automatic cleanup of old data
- **Progress timestamps** with precise save tracking
- **Online/offline indicators** showing connectivity status

### Real-time Status (ProgressStatusLegoBlock)
- **Save status display** with visual indicators
- **Last saved timestamp** with precise timing
- **Connectivity status** showing online/offline state
- **Saving animation** during database operations
- **Error state handling** with retry capabilities
- **Badge indicators** for connection quality

### Results Dashboard (AssessmentResultsDashboard)
- **Maturity scoring** across 5 key domains
- **Visual progress bars** showing domain strengths
- **Overall average** with percentage indicators
- **Maturity level mapping** (Initial, Defined, Managed, Optimized)
- **Completion celebration** with success messaging
- **Navigation to recommendations** with use case matching

### Export Functionality (ResponseExportLegoBlock)
- **PDF export** with formatted results
- **Excel download** with structured data
- **JSON export** for technical integration
- **Assessment summary** included in all formats
- **Progress preservation** during export operations

## Scoring System

### 12-Lever RSA Framework
**Business Value (Impact Score)**
1. **Revenue Impact**: New revenue, premium growth, market expansion
2. **Cost Savings**: Operational cost reductions and efficiency gains
3. **Risk Reduction**: Underwriting, claims, fraud, operational risk lowering
4. **Broker/Partner Experience**: Relationship and experience improvements
5. **Strategic Fit**: Corporate strategy and competitive positioning alignment

**Feasibility (Effort Score)**
6. **Data Readiness**: Quality, availability, usability of required datasets
7. **Technical Complexity**: Model maturity requirements and difficulty
8. **Change Impact**: Process and role redesign requirements
9. **Model Risk**: Potential harm if model fails (regulatory, reputational)
10. **Adoption Readiness**: Stakeholder buy-in and user acceptance

**AI Governance**
11. **Explainability/Bias**: Responsible AI principles and bias management
12. **Regulatory Compliance**: FCA, GDPR, UK/EU AI Act readiness

### Automatic Calculations
- **Impact Score** = Average of Business Value levers (1-5)
- **Effort Score** = Average of Feasibility levers (6-10)
- **Quadrant Assignment** using 3.0 threshold logic:
  - High Impact (≥3.0), Low Effort (<3.0) = **Quick Win**
  - High Impact (≥3.0), High Effort (≥3.0) = **Strategic Bet**
  - Low Impact (<3.0), Low Effort (<3.0) = **Experimental**  
  - Low Impact (<3.0), High Effort (≥3.0) = **Watchlist**

## Recommendation Engine

### Assessment-to-Use Case Matching
- **Automatic analysis** of assessment completion
- **Maturity-based recommendations** using business logic
- **Visual highlighting** with gold star indicators
- **Filtering integration** showing only recommended cases
- **Score-based ranking** prioritizing best matches

### Recommendation Logic
- **High maturity domains** (≥4.0) suggest Strategic Bet use cases
- **Medium maturity domains** (2.5-3.9) suggest Quick Win opportunities
- **Low maturity domains** (<2.5) suggest Experimental approaches
- **Cross-domain analysis** considering overall readiness
- **Business segment alignment** with assessment context

## Data Management

### Database-First Architecture
- **PostgreSQL** with Neon serverless hosting
- **Automatic migrations** via Drizzle ORM
- **Real-time persistence** with immediate consistency
- **Data validation** at API and database levels
- **Transaction support** ensuring data integrity

### Metadata Configuration
- **Dynamic dropdowns** configurable via Admin panel
- **Process-Activity mapping** with contextual relationships
- **Line of Business** hierarchical organization
- **Geographic regions** with flexible definitions
- **Use case types** with classification system

This comprehensive feature set provides complete AI use case management capabilities while maintaining simplicity and user-friendly operation.