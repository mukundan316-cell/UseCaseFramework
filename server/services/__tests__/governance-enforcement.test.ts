/**
 * Governance Enforcement Unit Tests
 * 
 * Tests the 3-gate governance workflow:
 * - Gate 1: Operating Model
 * - Gate 2: Intake & Prioritization
 * - Gate 3: Responsible AI
 * 
 * Note: Run with: npx tsx --test server/services/__tests__/governance-enforcement.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkActivationAllowed,
  checkGovernanceRegression,
  checkPhaseTransitionRequirements,
  performFullGovernanceCheck,
  ACTIVATION_STATUSES,
  GOVERNANCE_ENFORCEMENT_DATE
} from '../governance-enforcement';
import type { TomConfig } from '../../../shared/tom';

const mockTomConfig = {
  enabled: 'true',
  activePreset: 'hybrid',
  phases: [
    { 
      id: 'foundation', 
      name: 'Foundation', 
      order: 1, 
      color: '#3B82F6', 
      description: 'Initial phase',
      priority: 'high',
      mappedStatuses: ['Discovery'],
      mappedDeployments: [],
      icon: 'foundation',
      isDefault: true,
      allowedTransitions: ['incubate'],
      dataRequirements: { entry: [], exit: ['raiRiskTier'] }, 
      unlockedFeatures: [] 
    },
    { 
      id: 'incubate', 
      name: 'Incubate', 
      order: 2, 
      color: '#10B981', 
      description: 'Development phase',
      priority: 'medium',
      mappedStatuses: ['In-flight', 'Implemented'],
      mappedDeployments: [],
      icon: 'incubate',
      isDefault: false,
      allowedTransitions: [],
      dataRequirements: { entry: [], exit: [] }, 
      unlockedFeatures: [] 
    }
  ],
  statusPhaseMapping: {
    'Discovery': 'foundation',
    'In-flight': 'incubate',
    'Implemented': 'incubate'
  },
  disabledPhaseStatuses: ['Cancelled', 'Parked']
} as TomConfig;

describe('Governance Enforcement', () => {
  describe('Gate 1 - Operating Model', () => {
    it('fails when primaryBusinessOwner is empty', () => {
      const useCase = {
        primaryBusinessOwner: '',
        businessFunction: 'IT',
        useCaseStatus: 'Backlog'
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.blocked, true);
      assert.strictEqual(result.governanceCheck?.gates.operatingModel.passed, false);
    });

    it('fails when businessFunction is empty', () => {
      const useCase = {
        primaryBusinessOwner: 'John Doe',
        businessFunction: '',
        useCaseStatus: 'Backlog'
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.blocked, true);
      assert.strictEqual(result.governanceCheck?.gates.operatingModel.passed, false);
    });

    it('fails when useCaseStatus is Discovery', () => {
      const useCase = {
        primaryBusinessOwner: 'John Doe',
        businessFunction: 'IT',
        useCaseStatus: 'Discovery'
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.blocked, true);
      assert.strictEqual(result.governanceCheck?.gates.operatingModel.passed, false);
    });

    it('passes when all 3 requirements met', () => {
      const useCase = {
        primaryBusinessOwner: 'John Doe',
        businessFunction: 'IT',
        useCaseStatus: 'Backlog',
        strategicFit: 4,
        raiRiskTier: 'Low'
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.governanceCheck?.gates.operatingModel.passed, true);
    });
  });

  describe('Activation Blocking', () => {
    it('blocks activation to In-flight with incomplete governance', () => {
      const useCase = {
        primaryBusinessOwner: '',
        businessFunction: '',
        useCaseStatus: 'Backlog'
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.blocked, true);
    });

    it('allows status change to Backlog without governance check', () => {
      const useCase = {
        primaryBusinessOwner: '',
        businessFunction: '',
        useCaseStatus: 'Discovery'
      };
      const result = checkActivationAllowed(useCase, 'Backlog');
      assert.strictEqual(result.blocked, false);
    });

    it('returns governance check details when blocked', () => {
      const useCase = {
        primaryBusinessOwner: '',
        businessFunction: '',
        useCaseStatus: 'Discovery',
        strategicFit: null,
        raiRiskTier: null
      };
      const result = checkActivationAllowed(useCase, 'In-flight');
      assert.strictEqual(result.blocked, true);
      assert.ok(result.governanceCheck);
      assert.ok(result.governanceCheck.missingFields.length > 0);
    });

    it('identifies In-flight as an activation status', () => {
      assert.ok(ACTIVATION_STATUSES.includes('In-flight'));
    });

    it('identifies Implemented as an activation status', () => {
      assert.ok(ACTIVATION_STATUSES.includes('Implemented'));
    });
  });

  describe('Governance Regression', () => {
    const enforcementDate = GOVERNANCE_ENFORCEMENT_DATE;
    const postEnforcementDate = new Date(enforcementDate.getTime() + 86400000);
    const preEnforcementDate = new Date(enforcementDate.getTime() - 86400000);

    // Base use case with ALL governance requirements met (canActivate = true)
    // Gate 1: primaryBusinessOwner, businessFunction, useCaseStatus != Discovery
    // Gate 2: ALL 5 scoring fields (1-5 range)
    // Gate 3: explainabilityRequired, customerHarmRisk, humanAccountability, dataOutsideUkEu, thirdPartyModel
    const fullyCompliantUseCase = {
      id: 'test-1',
      useCaseStatus: 'In-flight',
      primaryBusinessOwner: 'John Doe',
      businessFunction: 'IT',
      // Gate 2 - All 5 scoring fields (1-5 range)
      revenueImpact: 4,
      costSavings: 3,
      riskReduction: 3,
      brokerPartnerExperience: 4,
      strategicFit: 5,
      // Gate 3 - RAI fields (actual required fields from calculateRAIGate)
      explainabilityRequired: 'true',
      customerHarmRisk: 'Low',
      humanAccountability: 'true',
      dataOutsideUkEu: 'false',
      thirdPartyModel: 'false',
      createdAt: postEnforcementDate
    };

    it('triggers auto-deactivation when owner removed from active use case', () => {
      const currentUseCase = { ...fullyCompliantUseCase };
      const updates = {
        primaryBusinessOwner: ''
      };
      const result = checkGovernanceRegression(currentUseCase, updates);
      assert.strictEqual(result.shouldDeactivate, true);
      assert.strictEqual(result.regressedGate, 'gate1_operating_model');
    });

    it('triggers auto-deactivation when businessFunction removed from active use case', () => {
      const currentUseCase = { 
        ...fullyCompliantUseCase,
        useCaseStatus: 'Implemented'
      };
      const updates = {
        businessFunction: ''
      };
      const result = checkGovernanceRegression(currentUseCase, updates);
      assert.strictEqual(result.shouldDeactivate, true);
      assert.strictEqual(result.regressedGate, 'gate1_operating_model');
    });

    it('bypasses deactivation for legacy use cases (pre-2026-01-24)', () => {
      const currentUseCase = {
        ...fullyCompliantUseCase,
        createdAt: preEnforcementDate
      };
      const updates = {
        primaryBusinessOwner: ''
      };
      const result = checkGovernanceRegression(currentUseCase, updates);
      assert.strictEqual(result.shouldDeactivate, false);
      assert.strictEqual(result.isLegacyUseCase, true);
    });

    it('logs warning for legacy use cases instead of deactivating', () => {
      const currentUseCase = {
        ...fullyCompliantUseCase,
        id: 'legacy-2',
        createdAt: preEnforcementDate
      };
      const updates = {
        primaryBusinessOwner: ''
      };
      const result = checkGovernanceRegression(currentUseCase, updates);
      assert.strictEqual(result.shouldDeactivate, false);
      assert.strictEqual(result.isLegacyUseCase, true);
      assert.ok(result.reason?.includes('Legacy'));
    });

    it('does not trigger deactivation for non-active use cases', () => {
      const currentUseCase = {
        id: 'test-2',
        useCaseStatus: 'Backlog',
        primaryBusinessOwner: 'John Doe',
        businessFunction: 'IT',
        createdAt: postEnforcementDate
      };
      const updates = {
        primaryBusinessOwner: ''
      };
      const result = checkGovernanceRegression(currentUseCase, updates);
      assert.strictEqual(result.shouldDeactivate, false);
    });
  });

  describe('Phase Transition', () => {
    const governanceGates = {
      operatingModelPassed: true,
      intakePassed: true,
      raiPassed: true
    };

    it('requires justification when exit requirements incomplete', () => {
      const useCase = {
        raiRiskTier: null,
        useCaseStatus: 'Discovery'
      };
      const result = checkPhaseTransitionRequirements(
        useCase,
        'Discovery',
        'In-flight',
        mockTomConfig,
        undefined,
        governanceGates
      );
      assert.strictEqual(result.requiresJustification, true);
      assert.strictEqual(result.allowed, false);
    });

    it('allows transition when justification provided', () => {
      const useCase = {
        raiRiskTier: null,
        useCaseStatus: 'Discovery'
      };
      const result = checkPhaseTransitionRequirements(
        useCase,
        'Discovery',
        'In-flight',
        mockTomConfig,
        'Business priority override - CEO approved',
        governanceGates
      );
      assert.strictEqual(result.allowed, true);
    });

    it('allows transition when exit requirements are met', () => {
      const useCase = {
        raiRiskTier: 'Low',
        useCaseStatus: 'Discovery'
      };
      const result = checkPhaseTransitionRequirements(
        useCase,
        'Discovery',
        'In-flight',
        mockTomConfig,
        undefined,
        governanceGates
      );
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.requiresJustification, false);
    });

    it('identifies current and target phases correctly', () => {
      const useCase = {
        raiRiskTier: null,
        useCaseStatus: 'Discovery'
      };
      const result = checkPhaseTransitionRequirements(
        useCase,
        'Discovery',
        'In-flight',
        mockTomConfig,
        undefined,
        governanceGates
      );
      // Phase names are display names, not IDs
      assert.ok(result.currentPhase.toLowerCase().includes('foundation'));
      assert.ok(result.targetPhase.toLowerCase().includes('incubate'));
    });
  });

  describe('Full Governance Check', () => {
    it('enforces sequential gating - Gate 2 requires Gate 1', () => {
      const useCase = {
        primaryBusinessOwner: '',
        businessFunction: '',
        useCaseStatus: 'Discovery',
        strategicFit: 5
      };
      const result = performFullGovernanceCheck(useCase);
      assert.strictEqual(result.gates.operatingModel.passed, false);
      assert.strictEqual(result.gates.intake.passed, false);
    });

    it('enforces sequential gating - Gate 3 requires Gate 2', () => {
      const useCase = {
        primaryBusinessOwner: 'John Doe',
        businessFunction: 'IT',
        useCaseStatus: 'Backlog',
        strategicFit: null,
        raiRiskTier: 'Low'
      };
      const result = performFullGovernanceCheck(useCase);
      assert.strictEqual(result.gates.operatingModel.passed, true);
      assert.strictEqual(result.gates.intake.passed, false);
    });

    it('passes all gates when requirements met', () => {
      const useCase = {
        // Gate 1: Operating Model
        primaryBusinessOwner: 'John Doe',
        businessFunction: 'IT',
        useCaseStatus: 'Backlog',
        // Gate 2: All 5 scoring fields
        revenueImpact: 4,
        costSavings: 3,
        riskReduction: 3,
        brokerPartnerExperience: 4,
        strategicFit: 5,
        // Gate 3: RAI fields (actual required fields)
        explainabilityRequired: 'true',
        customerHarmRisk: 'Low',
        humanAccountability: 'true',
        dataOutsideUkEu: 'false',
        thirdPartyModel: 'false'
      };
      const result = performFullGovernanceCheck(useCase);
      assert.strictEqual(result.gates.operatingModel.passed, true);
      assert.strictEqual(result.gates.intake.passed, true);
      assert.strictEqual(result.gates.responsibleAI.passed, true);
      assert.strictEqual(result.canActivate, true);
    });
  });

  describe('Enforcement Date', () => {
    it('has correct enforcement date set', () => {
      const expected = new Date('2026-01-24T00:00:00Z');
      assert.strictEqual(GOVERNANCE_ENFORCEMENT_DATE.getTime(), expected.getTime());
    });
  });
});
