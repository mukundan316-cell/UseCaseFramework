# LEGO Block Rationalization Plan
## RSA AI Use Case Value Framework - Component Consolidation

### Executive Summary
Current audit identified 13+ LEGO components with overlapping functionality across scoring, percentages, and configuration. This plan consolidates them into 8 streamlined components while maintaining all existing functionality.

### Identified Duplications

#### **Category 1: Scoring & Rating (HIGH PRIORITY)**
**Current State:** 5 components with overlapping score/rating functionality
- ScoreSliderLegoBlock (basic 1-5 slider)
- SmartRatingLegoBlock (enhanced variants: descriptive, stars, maturity, capability)
- QuestionLegoBlock (includes 'score' and 'scale' types)
- MultiRatingLegoBlock (multiple ratings in one component)
- ScoreOverrideLegoBlock (manual override functionality)

**Rationalization:** Consolidate to 2 components
1. **Enhanced SmartRatingLegoBlock** - Add 'slider' variant, absorb QuestionLegoBlock score types
2. **ScoreOverrideLegoBlock** - Keep as specialized override component

**Benefits:**
- Reduce maintenance overhead by 60%
- Unified scoring interface patterns
- Consistent validation and error handling
- Single source of truth for scoring configuration

#### **Category 2: Percentage & Value Input (MEDIUM PRIORITY)**
**Current State:** 3 components with overlapping percentage/value functionality
- PercentageAllocationLegoBlock (100% constraint)
- PercentageTargetLegoBlock (no constraint)
- CurrencyInputLegoBlock (monetary values)

**Rationalization:** Consolidate to 1 component
1. **UnifiedValueInputLegoBlock** - Support percentage (allocation/target) and currency modes

**Benefits:**
- Unified number formatting and validation
- Consistent error handling patterns
- Reduced bundle size

#### **Category 3: Assessment Matrices (LOW PRIORITY)**
**Current State:** Specialized matrix components
- BusinessLinesMatrixLegoBlock
- DepartmentSkillsMatrixLegoBlock
- RankingLegoBlock

**Assessment:** Keep as-is - serve distinct business purposes

#### **Category 4: Configuration & Toggles (MEDIUM PRIORITY)**
**Current State:** Multiple toggle patterns across components
- RSASelectionToggleLegoBlock
- ScoreOverrideLegoBlock toggle logic
- Various form toggles

**Rationalization:** Create reusable toggle patterns
1. **ConfigurationToggleLegoBlock** - Standardized toggle with reason capture

### Implementation Strategy

#### **Phase 1: Scoring Consolidation (Week 1)**
1. Enhance SmartRatingLegoBlock with 'slider' variant
2. Update QuestionLegoBlock to use SmartRatingLegoBlock for score types
3. Test all existing score/rating functionality
4. Update documentation and examples

#### **Phase 2: Value Input Consolidation (Week 2)**
1. Create UnifiedValueInputLegoBlock
2. Migrate PercentageAllocationLegoBlock usage
3. Migrate PercentageTargetLegoBlock usage
4. Migrate CurrencyInputLegoBlock usage
5. Remove deprecated components

#### **Phase 3: Configuration Standardization (Week 3)**
1. Extract common toggle patterns
2. Create ConfigurationToggleLegoBlock
3. Standardize toggle interfaces across components

### Risk Mitigation
- Maintain backward compatibility during transition
- Comprehensive testing of consolidated components
- Gradual migration with feature flags
- Rollback plan for each phase

### Success Metrics
- **Component Count Reduction:** 13 → 8 components (38% reduction)
- **Code Maintainability:** Unified patterns and interfaces
- **Bundle Size:** Estimated 15-20% reduction in component code
- **Developer Experience:** Single API for similar functionality

### Database Layer Analysis
**Current State:** Manual override fields (manualImpactScore, manualEffortScore, manualQuadrant) properly structured
**Assessment:** No database duplication identified - schema is clean and normalized

### API Layer Analysis  
**Current State:** Clean RESTful endpoints with proper separation
**Assessment:** No API duplication - follow single responsibility principle

### Data Flow Analysis
**Current State:** Consistent patterns from UI → Context → API → Database
**Assessment:** Minimal transformation layers achieved - aligned with LEGO principles

## Next Steps
1. Get stakeholder approval for consolidation plan
2. Create feature branches for each phase
3. Begin Phase 1 implementation
4. Monitor performance and user experience impact