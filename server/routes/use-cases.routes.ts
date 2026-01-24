import type { Express } from "express";
import { storage } from "../storage";
import { insertUseCaseSchema } from "@shared/schema";
import { z } from "zod";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant, calculateGovernanceStatus } from "@shared/calculations";
import { getImpactWeights, getEffortWeights } from "@shared/utils/weightUtils";
import { mapUseCaseToFrontend, type UseCaseFrontend } from "@shared/mappers";
import { derivePhase, type TomConfig, type GovernanceGateInput } from "@shared/tom";
import { deriveAllFields, getDefaultConfigs, getConfigsFromEngagement, shouldTriggerDerivation, applyPhaseDefaults, type UseCaseForDerivation, type EngagementTomContext } from "../derivation";
import {
  checkActivationAllowed,
  checkGovernanceRegression,
  checkPhaseTransitionRequirements,
  buildActivationBlockedResponse,
  buildPhaseTransitionRequiredResponse,
  ACTIVATION_STATUSES
} from '../services/governance-enforcement';

interface DerivedPhaseInfo {
  id: string;
  name: string;
  color: string;
  isOverride: boolean;
  matchedBy?: 'status' | 'deployment' | 'priority' | 'manual' | 'governance_entry' | 'unphased';
}

async function enrichUseCasesWithTomPhase(
  useCases: UseCaseFrontend[], 
  engagementId?: string
): Promise<(UseCaseFrontend & { derivedPhase?: DerivedPhaseInfo })[]> {
  try {
    const metadata = await storage.getMetadataConfig();
    const { ensureTomConfig, mergePresetProfile } = await import("@shared/tom");
    
    let engagementTomContext: EngagementTomContext | null = null;
    if (engagementId) {
      const engagement = await storage.getEngagement(engagementId);
      if (engagement) {
        engagementTomContext = {
          tomPresetId: engagement.tomPresetId,
          tomPhasesJson: engagement.tomPhasesJson
        };
      }
    }
    
    const configs = getConfigsFromEngagement(metadata, engagementTomContext);
    const tomConfig = mergePresetProfile(ensureTomConfig(configs.tomConfig));
    
    if (tomConfig.enabled !== 'true') {
      return useCases;
    }
    
    return useCases.map(uc => {
      const govStatus = calculateGovernanceStatus(uc);
      const governanceGates: GovernanceGateInput = {
        operatingModelPassed: govStatus.operatingModel.passed,
        intakePassed: govStatus.intake.passed,
        raiPassed: govStatus.rai.passed
      };
      
      return {
        ...uc,
        derivedPhase: derivePhase(
          uc.useCaseStatus || null,
          uc.deploymentStatus || null,
          (uc as any).tomPhaseOverride || null,
          tomConfig,
          governanceGates
        ) as DerivedPhaseInfo
      };
    });
  } catch (error) {
    console.error('Error enriching use cases with TOM phase:', error);
    return useCases;
  }
}

export function registerUseCaseRoutes(app: Express): void {
  app.get("/api/use-cases", async (req, res) => {
    try {
      const engagementId = req.query.engagementId as string | undefined;
      let useCases = await storage.getAllUseCases();
      
      if (engagementId) {
        useCases = useCases.filter(uc => uc.engagementId === engagementId);
      }
      
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases, engagementId);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching all use cases:", error);
      res.status(500).json({ error: "Failed to fetch use cases" });
    }
  });

  app.get("/api/use-cases/dashboard", async (req, res) => {
    try {
      const engagementId = req.query.engagementId as string | undefined;
      let useCases = await storage.getDashboardUseCases();
      
      if (engagementId) {
        useCases = useCases.filter(uc => uc.engagementId === engagementId);
      }
      
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases, engagementId);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching dashboard use cases:", error);
      res.status(500).json({ error: "Failed to fetch dashboard use cases" });
    }
  });

  app.get("/api/use-cases/active", async (req, res) => {
    try {
      const engagementId = req.query.engagementId as string | undefined;
      let useCases = await storage.getActiveUseCases();
      
      if (engagementId) {
        useCases = useCases.filter(uc => uc.engagementId === engagementId);
      }
      
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases, engagementId);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching active use cases:", error);
      res.status(500).json({ error: "Failed to fetch active use cases" });
    }
  });

  app.get("/api/use-cases/reference", async (req, res) => {
    try {
      const engagementId = req.query.engagementId as string | undefined;
      let useCases = await storage.getReferenceLibraryUseCases();
      
      if (engagementId) {
        useCases = useCases.filter(uc => uc.engagementId === engagementId);
      }
      
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases, engagementId);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching reference library use cases:", error);
      res.status(500).json({ error: "Failed to fetch reference library use cases" });
    }
  });

  app.patch("/api/use-cases/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const useCase = await storage.activateUseCase(id, reason);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error activating use case:", error);
      res.status(500).json({ error: "Failed to activate use case" });
    }
  });

  app.patch("/api/use-cases/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const useCase = await storage.deactivateUseCase(id, reason);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error deactivating use case:", error);
      res.status(500).json({ error: "Failed to deactivate use case" });
    }
  });

  app.patch("/api/use-cases/:id/toggle-dashboard", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.toggleDashboardVisibility(id);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error toggling dashboard visibility:", error);
      res.status(500).json({ error: "Failed to toggle dashboard visibility" });
    }
  });

  app.patch("/api/use-cases/bulk-tier", async (req, res) => {
    try {
      const { ids, tier } = req.body;
      if (!Array.isArray(ids) || !tier || !['active', 'reference'].includes(tier)) {
        return res.status(400).json({ error: "Invalid request body. Expected { ids: string[], tier: 'active' | 'reference' }" });
      }
      const useCases = await storage.bulkUpdateUseCaseTier(ids, tier);
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error bulk updating use case tier:", error);
      res.status(500).json({ error: "Failed to bulk update use case tier" });
    }
  });

  app.post("/api/use-cases", async (req, res) => {
    try {
      if (req.body.presentationUploadedAt && typeof req.body.presentationUploadedAt === 'string') {
        try {
          req.body.presentationUploadedAt = new Date(req.body.presentationUploadedAt);
        } catch (dateError) {
          console.error('Date conversion error:', dateError);
          req.body.presentationUploadedAt = null;
        }
      }
      
      const validatedData = insertUseCaseSchema.parse(req.body);
      
      let engagementId = validatedData.engagementId as string | null;
      if (!engagementId) {
        const allEngagements = await storage.getAllEngagements();
        const defaultEngagement = allEngagements.find(e => e.isDefault === 'true');
        if (defaultEngagement) {
          engagementId = defaultEngagement.id;
        }
      }
      
      const metadata = await storage.getMetadataConfig();
      const businessImpactWeights = getImpactWeights(metadata);
      const implementationEffortWeights = getEffortWeights(metadata);
      const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
      
      const impactScore = calculateImpactScore(
        (validatedData.revenueImpact as number) || 0,
        (validatedData.costSavings as number) || 0,
        (validatedData.riskReduction as number) || 0,
        (validatedData.brokerPartnerExperience as number) || 0,
        (validatedData.strategicFit as number) || 0,
        businessImpactWeights
      );
      
      const effortScore = calculateEffortScore(
        (validatedData.dataReadiness as number) || 0,
        (validatedData.technicalComplexity as number) || 0,
        (validatedData.changeImpact as number) || 0,
        (validatedData.modelRisk as number) || 0,
        (validatedData.adoptionReadiness as number) || 0,
        implementationEffortWeights
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
      
      const useCaseWithScores = {
        ...validatedData,
        linesOfBusiness: (validatedData.linesOfBusiness as string[])?.filter((item): item is string => item != null),
        processes: (validatedData.processes as string[]) || [],
        activities: (validatedData.activities as string[]) || [],
        businessSegments: (validatedData.businessSegments as string[]) || [],
        geographies: (validatedData.geographies as string[]) || [],
        isActiveForRsa: (validatedData.isActiveForRsa as string) || 'false',
        isDashboardVisible: (validatedData.isDashboardVisible as string) || 'false',
        libraryTier: (validatedData.libraryTier as string) || 'reference',
        engagementId,
        impactScore,
        effortScore,
        quadrant
      };
      
      const newUseCase = await storage.createUseCase(useCaseWithScores as any);
      
      try {
        const derivedMetadata = await storage.getMetadataConfig();
        
        let engagementContext: EngagementTomContext | null = null;
        let clientCurrency: string = 'GBP';
        if (engagementId) {
          const engagement = await storage.getEngagement(engagementId);
          if (engagement) {
            engagementContext = {
              tomPresetId: engagement.tomPresetId,
              tomPhasesJson: engagement.tomPhasesJson
            };
            const client = await storage.getClient(engagement.clientId);
            if (client?.currency) {
              clientCurrency = client.currency;
            }
          }
        }
        
        const configs = getConfigsFromEngagement(derivedMetadata, engagementContext);
        
        const useCaseForDerivation: UseCaseForDerivation = {
          id: newUseCase.id,
          title: newUseCase.title,
          useCaseStatus: newUseCase.useCaseStatus,
          deploymentStatus: newUseCase.deploymentStatus,
          tomPhaseOverride: newUseCase.tomPhaseOverride,
          processes: newUseCase.processes,
          quadrant: newUseCase.quadrant,
          tShirtSize: newUseCase.tShirtSize,
          dataReadiness: newUseCase.dataReadiness,
          technicalComplexity: newUseCase.technicalComplexity,
          adoptionReadiness: newUseCase.adoptionReadiness,
          capabilityTransition: null,
          valueRealization: null,
          tomPhase: null
        };
        
        const derived = deriveAllFields(useCaseForDerivation, configs, {
          overwriteValue: true,
          overwriteCapability: true,
          currencyCode: clientCurrency as any
        });
        
        if (derived.tomPhase) {
          (derived as any).phaseEnteredAt = new Date();
          
          const phaseDefaults = applyPhaseDefaults(newUseCase, null, derived.tomPhase, configs.tomConfig);
          Object.assign(derived, phaseDefaults);
        }
        
        if (Object.keys(derived).length > 0) {
          await storage.updateUseCase(newUseCase.id, derived);
          Object.assign(newUseCase, derived);
        }
      } catch (derivationError) {
        console.error("Auto-derivation warning (use case created successfully):", derivationError);
      }
      
      res.status(201).json(mapUseCaseToFrontend(newUseCase));
    } catch (error) {
      console.error("Error creating use case:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.issues);
        
        const friendlyMessages = error.issues.map(issue => {
          const field = issue.path.join('.');
          const message = issue.message;
          
          const fieldLabels: { [key: string]: string } = {
            'title': 'Title',
            'description': 'Description', 
            'processes': 'Processes',
            'linesOfBusiness': 'Lines of Business',
            'businessSegments': 'Business Segments',
            'geographies': 'Geographies',
            'useCaseType': 'Use Case Type',
            'presentationUrl': 'Presentation file',
            'presentationPdfUrl': 'Presentation file',
            'presentationFileName': 'Presentation file'
          };
          
          const friendlyField = fieldLabels[field] || field;
          
          if (field.includes('presentation')) {
            return `There was an issue with the uploaded file. Please try uploading again.`;
          } else if (message.includes('Expected string, received null')) {
            return `${friendlyField} cannot be empty.`;
          } else {
            return `${friendlyField}: ${message}`;
          }
        });
        
        res.status(400).json({ 
          error: "Please check your entries", 
          issues: friendlyMessages,
          type: "validation"
        });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ 
          error: "Unable to save use case", 
          message: "Please try again. If the problem continues, contact support.",
          type: "server"
        });
      }
    }
  });

  app.put("/api/use-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (req.body.presentationUploadedAt && typeof req.body.presentationUploadedAt === 'string') {
        try {
          req.body.presentationUploadedAt = new Date(req.body.presentationUploadedAt);
        } catch (dateError) {
          console.error('Date conversion error:', dateError);
          req.body.presentationUploadedAt = null;
        }
      }
      
      const updateSchema = insertUseCaseSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const currentUseCaseForGovernance = await storage.getAllUseCases().then(cases => 
        cases.find(c => c.id === id)
      );
      
      if (!currentUseCaseForGovernance) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      if (validatedData.useCaseStatus && 
          validatedData.useCaseStatus !== currentUseCaseForGovernance.useCaseStatus) {
        const targetStatus = validatedData.useCaseStatus;
        
        const proposedState = { ...currentUseCaseForGovernance, ...validatedData };
        const activationCheck = checkActivationAllowed(proposedState, targetStatus);
        
        if (activationCheck.blocked) {
          await storage.createGovernanceAuditLog({
            useCaseId: id,
            useCaseMeaningfulId: currentUseCaseForGovernance.meaningfulId || undefined,
            gateType: 'activation',
            action: 'ACTIVATION_BLOCKED',
            notes: `Attempted to move to status "${targetStatus}" but governance gates incomplete`,
            tomPhaseAtDecision: currentUseCaseForGovernance.tomPhase || undefined
          });
          
          return res.status(403).json(buildActivationBlockedResponse(activationCheck));
        }
        
        const metadataForGovernance = await storage.getMetadataConfig();
        const tomConfigForGovernance = metadataForGovernance?.tomConfig as TomConfig | null;
        
        if (tomConfigForGovernance?.enabled === 'true') {
          const governanceStatus = calculateGovernanceStatus(proposedState);
          const governanceGates: GovernanceGateInput = {
            operatingModelPassed: governanceStatus.operatingModel.passed,
            intakePassed: governanceStatus.intake.passed,
            raiPassed: governanceStatus.rai.passed
          };
          
          const justification = req.body.phaseTransitionJustification as string | undefined;
          
          const phaseCheck = checkPhaseTransitionRequirements(
            proposedState,
            currentUseCaseForGovernance.useCaseStatus,
            targetStatus,
            tomConfigForGovernance,
            justification,
            governanceGates
          );
          
          if (!phaseCheck.allowed) {
            return res.status(400).json(buildPhaseTransitionRequiredResponse(phaseCheck));
          }
          
          if (phaseCheck.requiresJustification && justification) {
            validatedData.lastPhaseTransitionReason = justification;
            
            await storage.createGovernanceAuditLog({
              useCaseId: id,
              useCaseMeaningfulId: currentUseCaseForGovernance.meaningfulId || undefined,
              gateType: 'phase_transition',
              action: 'PHASE_TRANSITION_OVERRIDE',
              notes: `Phase transition ${phaseCheck.currentPhase} → ${phaseCheck.targetPhase} with incomplete requirements. Justification: ${justification}`,
              previousStatus: currentUseCaseForGovernance.useCaseStatus || undefined,
              newStatus: targetStatus,
              tomPhaseAtDecision: phaseCheck.currentPhase
            });
          }
        }
      }
      
      const regressionCheck = checkGovernanceRegression(currentUseCaseForGovernance, validatedData);
      
      if (regressionCheck.shouldDeactivate) {
        validatedData.useCaseStatus = 'Backlog';
        
        await storage.createGovernanceAuditLog({
          useCaseId: id,
          useCaseMeaningfulId: currentUseCaseForGovernance.meaningfulId || undefined,
          gateType: regressionCheck.regressedGate || 'governance',
          action: 'AUTO_DEACTIVATION',
          notes: regressionCheck.reason,
          previousStatus: currentUseCaseForGovernance.useCaseStatus || undefined,
          newStatus: 'Backlog',
          tomPhaseAtDecision: currentUseCaseForGovernance.tomPhase || undefined
        });
        
        console.log(`Auto-deactivated use case ${id}: ${regressionCheck.reason}`);
      } else if (regressionCheck.isLegacyUseCase && regressionCheck.reason) {
        await storage.createGovernanceAuditLog({
          useCaseId: id,
          useCaseMeaningfulId: currentUseCaseForGovernance.meaningfulId || undefined,
          gateType: regressionCheck.regressedGate || 'governance',
          action: 'LEGACY_GOVERNANCE_WARNING',
          notes: regressionCheck.reason,
          tomPhaseAtDecision: currentUseCaseForGovernance.tomPhase || undefined
        });
        
        console.log(`Legacy governance warning for use case ${id}: ${regressionCheck.reason}`);
      }

      let updatesWithScores = { ...validatedData };
      
      if (validatedData.revenueImpact !== undefined || 
          validatedData.costSavings !== undefined ||
          validatedData.riskReduction !== undefined ||
          validatedData.brokerPartnerExperience !== undefined ||
          validatedData.strategicFit !== undefined ||
          validatedData.dataReadiness !== undefined ||
          validatedData.technicalComplexity !== undefined ||
          validatedData.changeImpact !== undefined ||
          validatedData.modelRisk !== undefined ||
          validatedData.adoptionReadiness !== undefined) {
        
        const currentUseCase = currentUseCaseForGovernance;
        
        if (!currentUseCase) {
          return res.status(404).json({ error: "Use case not found" });
        }
        
        const metadata = await storage.getMetadataConfig();
        const businessImpactWeights = getImpactWeights(metadata);
        const implementationEffortWeights = getEffortWeights(metadata);
        const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
        
        const completeData = {
          revenueImpact: validatedData.revenueImpact ?? currentUseCase.revenueImpact,
          costSavings: validatedData.costSavings ?? currentUseCase.costSavings,
          riskReduction: validatedData.riskReduction ?? currentUseCase.riskReduction,
          brokerPartnerExperience: validatedData.brokerPartnerExperience ?? currentUseCase.brokerPartnerExperience,
          strategicFit: validatedData.strategicFit ?? currentUseCase.strategicFit,
          dataReadiness: validatedData.dataReadiness ?? currentUseCase.dataReadiness,
          technicalComplexity: validatedData.technicalComplexity ?? currentUseCase.technicalComplexity,
          changeImpact: validatedData.changeImpact ?? currentUseCase.changeImpact,
          modelRisk: validatedData.modelRisk ?? currentUseCase.modelRisk,
          adoptionReadiness: validatedData.adoptionReadiness ?? currentUseCase.adoptionReadiness,
        };
        
        const impactScore = calculateImpactScore(
          completeData.revenueImpact || 0,
          completeData.costSavings || 0,
          completeData.riskReduction || 0,
          completeData.brokerPartnerExperience || 0,
          completeData.strategicFit || 0,
          businessImpactWeights
        );
        
        const effortScore = calculateEffortScore(
          completeData.dataReadiness || 0,
          completeData.technicalComplexity || 0,
          completeData.changeImpact || 0,
          completeData.modelRisk || 0,
          completeData.adoptionReadiness || 0,
          implementationEffortWeights
        );
        
        const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
        
        updatesWithScores = {
          ...validatedData,
          linesOfBusiness: validatedData.linesOfBusiness || currentUseCase.linesOfBusiness,
          impactScore,
          effortScore,
          quadrant
        } as any;
      }
      
      if (validatedData.manualImpactScore !== undefined || 
          validatedData.manualEffortScore !== undefined ||
          validatedData.manualQuadrant !== undefined ||
          validatedData.overrideReason !== undefined) {
        updatesWithScores = {
          ...updatesWithScores,
          manualImpactScore: validatedData.manualImpactScore,
          manualEffortScore: validatedData.manualEffortScore,
          manualQuadrant: validatedData.manualQuadrant,
          overrideReason: validatedData.overrideReason
        } as any;
      }
      
      const allowNullFields = ['manualImpactScore', 'manualEffortScore', 'manualQuadrant', 'overrideReason'];
      const cleanUpdates = Object.fromEntries(
        Object.entries(updatesWithScores).map(([key, value]) => {
          if (allowNullFields.includes(key)) {
            return [key, value];
          }
          return [key, value === null ? undefined : value];
        })
      );
      
      const metadataForTom = await storage.getMetadataConfig();
      const tomConfig = metadataForTom?.tomConfig as TomConfig | null;
      
      let oldDerivedPhaseId: string | null = null;
      if (tomConfig?.enabled === 'true') {
        const currentUseCaseForPhase = await storage.getAllUseCases().then(cases => 
          cases.find(c => c.id === id)
        );
        if (currentUseCaseForPhase) {
          const oldPhaseResult = derivePhase(
            currentUseCaseForPhase.useCaseStatus,
            currentUseCaseForPhase.deploymentStatus,
            currentUseCaseForPhase.tomPhaseOverride,
            tomConfig
          );
          oldDerivedPhaseId = oldPhaseResult?.id || null;
        }
      }
      
      const updatedUseCase = await storage.updateUseCase(id, cleanUpdates);
      if (!updatedUseCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      if (tomConfig?.enabled === 'true') {
        const newPhaseResult = derivePhase(
          updatedUseCase.useCaseStatus,
          updatedUseCase.deploymentStatus,
          updatedUseCase.tomPhaseOverride,
          tomConfig
        );
        const newDerivedPhaseId = newPhaseResult?.id || null;
        
        if (newDerivedPhaseId !== oldDerivedPhaseId) {
          const phaseTransitionUpdates: Record<string, any> = { 
            phaseEnteredAt: new Date(),
            tomPhase: newDerivedPhaseId
          };
          
          if (newDerivedPhaseId && oldDerivedPhaseId) {
            const phaseDefaults = applyPhaseDefaults(updatedUseCase, oldDerivedPhaseId, newDerivedPhaseId, tomConfig);
            if (Object.keys(phaseDefaults).length > 0) {
              Object.assign(phaseTransitionUpdates, phaseDefaults);
              console.log(`Phase defaults applied for ${id}: ${JSON.stringify(Object.keys(phaseDefaults))}`);
            }
          }
          
          if (validatedData.lastPhaseTransitionReason || validatedData.phaseTransitionReason) {
            phaseTransitionUpdates.lastPhaseTransitionReason = validatedData.lastPhaseTransitionReason || validatedData.phaseTransitionReason;
          }
          
          await storage.updateUseCase(id, phaseTransitionUpdates as any);
          console.log(`Phase changed for ${id}: ${oldDerivedPhaseId} → ${newDerivedPhaseId}, updated phaseEnteredAt, tomPhase, and applied defaults`);
        } else if (updatedUseCase.tomPhase !== newDerivedPhaseId) {
          await storage.updateUseCase(id, { tomPhase: newDerivedPhaseId } as any);
        }
      }
      
      const triggers = shouldTriggerDerivation(validatedData, undefined);
      if (triggers.value || triggers.capability) {
        try {
          const derivedMetadata = await storage.getMetadataConfig();
          
          const refreshedUseCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
          
          let engagementContext: EngagementTomContext | null = null;
          let clientCurrency: string = 'GBP';
          if (refreshedUseCase?.engagementId) {
            const engagement = await storage.getEngagement(refreshedUseCase.engagementId);
            if (engagement) {
              engagementContext = {
                tomPresetId: engagement.tomPresetId,
                tomPhasesJson: engagement.tomPhasesJson
              };
              const client = await storage.getClient(engagement.clientId);
              if (client?.currency) {
                clientCurrency = client.currency;
              }
            }
          }
          
          const configs = getConfigsFromEngagement(derivedMetadata, engagementContext);
          if (refreshedUseCase) {
            const useCaseForDerivation: UseCaseForDerivation = {
              id: refreshedUseCase.id,
              title: refreshedUseCase.title,
              useCaseStatus: refreshedUseCase.useCaseStatus,
              deploymentStatus: refreshedUseCase.deploymentStatus,
              tomPhaseOverride: refreshedUseCase.tomPhaseOverride,
              processes: refreshedUseCase.processes,
              quadrant: refreshedUseCase.quadrant,
              tShirtSize: refreshedUseCase.tShirtSize,
              dataReadiness: refreshedUseCase.dataReadiness,
              technicalComplexity: refreshedUseCase.technicalComplexity,
              adoptionReadiness: refreshedUseCase.adoptionReadiness,
              capabilityTransition: refreshedUseCase.capabilityTransition,
              valueRealization: refreshedUseCase.valueRealization,
              tomPhase: refreshedUseCase.tomPhase
            };
            
            const canOverwriteValue = triggers.value && 
              !validatedData.valueRealization &&
              (!refreshedUseCase.valueRealization || refreshedUseCase.valueRealization?.derived === true);
            
            const derived = deriveAllFields(useCaseForDerivation, configs, {
              overwriteValue: canOverwriteValue,
              overwriteCapability: triggers.capability && 
                (!refreshedUseCase.capabilityTransition || refreshedUseCase.capabilityTransition?.derived === true),
              currencyCode: clientCurrency as any
            });
            
            const fieldsToUpdate: Record<string, any> = {};
            if (derived.valueRealization && canOverwriteValue) {
              fieldsToUpdate.valueRealization = derived.valueRealization;
            }
            const canOverwriteCapability = triggers.capability && 
              (!refreshedUseCase.capabilityTransition || refreshedUseCase.capabilityTransition?.derived === true);
            if (derived.capabilityTransition && canOverwriteCapability) {
              fieldsToUpdate.capabilityTransition = derived.capabilityTransition;
            }
            
            if (Object.keys(fieldsToUpdate).length > 0) {
              await storage.updateUseCase(id, fieldsToUpdate);
              Object.assign(updatedUseCase, fieldsToUpdate);
            }
          }
        } catch (derivationError) {
          console.error("Smart derivation warning:", derivationError);
        }
      }
      
      if (validatedData.valueRealization) {
        const vr = validatedData.valueRealization as any;
        if (vr.investment && (vr.investment.initialInvestment > 0 || vr.investment.ongoingMonthlyCost > 0)) {
          try {
            const { 
              deriveValueEstimates, 
              calculateTotalEstimatedValue, 
              calculateRoi, 
              calculateBreakevenMonth,
              DEFAULT_VALUE_REALIZATION_CONFIG 
            } = await import("@shared/valueRealization");
            
            const kpiLibrary = DEFAULT_VALUE_REALIZATION_CONFIG.kpiLibrary;
            const processes = (updatedUseCase.processes as string[]) || [];
            const scores = {
              dataReadiness: updatedUseCase.dataReadiness,
              technicalComplexity: updatedUseCase.technicalComplexity,
              adoptionReadiness: updatedUseCase.adoptionReadiness,
              changeImpact: updatedUseCase.changeImpact,
              modelRisk: updatedUseCase.modelRisk
            };
            
            const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
            const totalValue = calculateTotalEstimatedValue(valueEstimates);
            
            const estimatedAnnualValue = (totalValue.min + totalValue.max) / 2;
            const totalInvestment = (vr.investment.initialInvestment || 0) + ((vr.investment.ongoingMonthlyCost || 0) * 12);
            
            const currentRoi = calculateRoi(estimatedAnnualValue, totalInvestment);
            const monthlyValue = estimatedAnnualValue / 12;
            const projectedBreakevenMonth = calculateBreakevenMonth(totalInvestment, monthlyValue);
            
            const updatedVR = {
              ...vr,
              calculatedMetrics: {
                currentRoi,
                projectedBreakevenMonth,
                cumulativeValueGbp: estimatedAnnualValue,
                lastCalculated: new Date().toISOString()
              }
            };
            
            await storage.updateUseCase(id, { valueRealization: updatedVR });
            updatedUseCase.valueRealization = updatedVR;
          } catch (vrError) {
            console.error("Value realization calculation error:", vrError);
          }
        }
      }
      
      res.json(mapUseCaseToFrontend(updatedUseCase));
    } catch (error) {
      console.error("Error updating use case:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid use case data", issues: error.issues });
      } else {
        res.status(500).json({ error: "Failed to update use case" });
      }
    }
  });

  app.delete("/api/use-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUseCase(id);
      if (!deleted) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting use case:", error);
      res.status(500).json({ error: "Failed to delete use case" });
    }
  });

  app.post("/api/use-cases/check-duplicates", async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title && !description) {
        return res.status(400).json({ error: "Title or description required" });
      }
      const duplicates = await storage.checkDuplicateUseCases(title, description);
      res.json(duplicates);
    } catch (error) {
      console.error("Error checking duplicates:", error);
      res.status(500).json({ error: "Failed to check for duplicates" });
    }
  });

  app.get("/api/use-cases/potential-duplicates", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const duplicateGroups = await storage.findPotentialDuplicates(limit);
      res.json(duplicateGroups);
    } catch (error) {
      console.error("Error finding potential duplicates:", error);
      res.status(500).json({ error: "Failed to find potential duplicates" });
    }
  });

  app.post("/api/use-cases/resolve-duplicate", async (req, res) => {
    try {
      const { keepId, removeId, mergeFields } = req.body;
      if (!keepId || !removeId) {
        return res.status(400).json({ error: "keepId and removeId required" });
      }
      const result = await storage.resolveDuplicate(keepId, removeId, mergeFields);
      res.json(result);
    } catch (error) {
      console.error("Error resolving duplicate:", error);
      res.status(500).json({ error: "Failed to resolve duplicate" });
    }
  });

  app.get("/api/use-cases/:id/audit-log", async (req, res) => {
    try {
      const { id } = req.params;
      const logs = await storage.getUseCaseChangeLog(id);
      res.json(logs);
    } catch (error) {
      console.error("Error getting audit log:", error);
      res.status(500).json({ error: "Failed to get audit log" });
    }
  });
  
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAllChangeLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting all audit logs:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });
}
