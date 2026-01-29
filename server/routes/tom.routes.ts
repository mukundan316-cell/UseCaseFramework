import type { Express } from "express";
import { storage } from "../storage";
import { calculateGovernanceStatus } from "@shared/calculations";
import { z } from "zod";

const PhaseTransitionRuleSchema = z.object({
  fromPhase: z.string(),
  toPhase: z.string(),
  requiredGate: z.string(),
  description: z.string().optional(),
});

const GateDefinitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  principle: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  color: z.string().optional(),
  order: z.number(),
  targetPhase: z.string().optional(),
});

const PhaseTransitionsUpdateSchema = z.object({
  phaseTransitions: z.array(PhaseTransitionRuleSchema),
});

const GateDefinitionsUpdateSchema = z.object({
  gateDefinitions: z.array(GateDefinitionSchema),
});

export function registerTomRoutes(app: Express): void {
  app.get("/api/tom/clients", async (req, res) => {
    try {
      const clients = await storage.getAllMetadataConfigIds();
      const clientOptions = clients.map(id => ({
        id,
        name: id === 'default' ? 'Default Configuration' : id.charAt(0).toUpperCase() + id.slice(1)
      }));
      res.json(clientOptions);
    } catch (error) {
      console.error("Error fetching TOM clients:", error);
      res.json([{ id: 'default', name: 'Default Configuration' }]);
    }
  });

  app.get("/api/tom/config", async (req, res) => {
    try {
      const clientId = (req.query.clientId as string) || 'default';
      const metadata = await storage.getMetadataConfigById(clientId);
      const { ensureTomConfig } = await import("@shared/tom");
      const tomConfig = ensureTomConfig(metadata?.tomConfig);
      res.json(tomConfig);
    } catch (error) {
      console.error("Error fetching TOM config:", error);
      res.status(500).json({ error: "Failed to fetch TOM configuration" });
    }
  });

  app.get("/api/tom/config/:clientId", async (req, res) => {
    try {
      const clientId = req.params.clientId || 'default';
      const metadata = await storage.getMetadataConfigById(clientId);
      const { ensureTomConfig } = await import("@shared/tom");
      const tomConfig = ensureTomConfig(metadata?.tomConfig);
      res.json(tomConfig);
    } catch (error) {
      console.error("Error fetching TOM config:", error);
      res.status(500).json({ error: "Failed to fetch TOM configuration" });
    }
  });

  app.put("/api/tom/config", async (req, res) => {
    try {
      const clientId = (req.query.clientId as string) || 'default';
      const tomConfig = req.body;
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig
      };
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      res.json(result?.tomConfig || tomConfig);
    } catch (error) {
      console.error("Error updating TOM config:", error);
      res.status(500).json({ error: "Failed to update TOM configuration" });
    }
  });

  app.put("/api/tom/phases", async (req, res) => {
    try {
      const { phases } = req.body;
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      const updatedTom = {
        ...currentTom,
        phases
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: updatedTom
      };
      
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      res.json(result?.tomConfig?.phases || phases);
    } catch (error) {
      console.error("Error updating phases:", error);
      res.status(500).json({ error: "Failed to update phases" });
    }
  });

  // Update phase transition rules
  app.put("/api/tom/transitions", async (req, res) => {
    try {
      const validationResult = PhaseTransitionsUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid phase transitions data", 
          details: validationResult.error.errors 
        });
      }
      
      const { phaseTransitions } = validationResult.data;
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      const updatedTom = {
        ...currentTom,
        phaseTransitions
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: updatedTom
      };
      
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      const tomResult = result?.tomConfig as { phaseTransitions?: typeof phaseTransitions } | undefined;
      res.json(tomResult?.phaseTransitions || phaseTransitions);
    } catch (error) {
      console.error("Error updating phase transitions:", error);
      res.status(500).json({ error: "Failed to update phase transitions" });
    }
  });

  // Update gate definitions
  app.put("/api/tom/gates", async (req, res) => {
    try {
      const validationResult = GateDefinitionsUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid gate definitions data", 
          details: validationResult.error.errors 
        });
      }
      
      const { gateDefinitions } = validationResult.data;
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      const updatedTom = {
        ...currentTom,
        gateDefinitions
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: updatedTom
      };
      
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      const tomResult = result?.tomConfig as { gateDefinitions?: typeof gateDefinitions } | undefined;
      res.json(tomResult?.gateDefinitions || gateDefinitions);
    } catch (error) {
      console.error("Error updating gate definitions:", error);
      res.status(500).json({ error: "Failed to update gate definitions" });
    }
  });

  app.post("/api/tom/sync-defaults", async (req, res) => {
    try {
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig, DEFAULT_TOM_CONFIG } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      const mergedPresets = {
        ...DEFAULT_TOM_CONFIG.presets,
        ...currentTom.presets
      };
      
      const mergedProfiles = {
        ...DEFAULT_TOM_CONFIG.presetProfiles,
        ...currentTom.presetProfiles
      };
      
      const existingBodyIds = new Set(currentTom.governanceBodies.map(b => b.id));
      const mergedGovernance = [
        ...currentTom.governanceBodies,
        ...DEFAULT_TOM_CONFIG.governanceBodies.filter(b => !existingBodyIds.has(b.id))
      ];
      
      const updatedTom = {
        ...currentTom,
        presets: mergedPresets,
        presetProfiles: mergedProfiles,
        governanceBodies: mergedGovernance
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: updatedTom
      };
      
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      
      res.json({ 
        success: true, 
        message: 'TOM configuration synced with defaults',
        presetsAdded: Object.keys(mergedPresets).filter(k => !currentTom.presets[k]),
        profilesAdded: Object.keys(mergedProfiles).filter(k => !currentTom.presetProfiles[k]),
        governanceAdded: mergedGovernance.length - currentTom.governanceBodies.length
      });
    } catch (error) {
      console.error("Error syncing TOM defaults:", error);
      res.status(500).json({ error: "Failed to sync TOM defaults" });
    }
  });

  app.post("/api/tom/phases/load-preset/:presetId", async (req, res) => {
    try {
      const { presetId } = req.params;
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig, DEFAULT_TOM_CONFIG } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      const presetProfile = DEFAULT_TOM_CONFIG.presetProfiles[presetId];
      const presetPhases = presetProfile?.phases || DEFAULT_TOM_CONFIG.phases;
      
      const updatedTom = {
        ...currentTom,
        activePreset: presetId,
        phases: presetPhases
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: updatedTom
      };
      
      const result = await storage.updateMetadataConfigById(clientId, updatedMetadata);
      res.json({ 
        success: true, 
        presetId, 
        phases: result?.tomConfig?.phases || presetPhases 
      });
    } catch (error) {
      console.error("Error loading preset phases:", error);
      res.status(500).json({ error: "Failed to load preset phases" });
    }
  });

  app.get("/api/tom/phase-summary", async (req, res) => {
    try {
      const clientId = (req.query.clientId as string) || 'default';
      const scope = (req.query.scope as string) || 'all';
      const metadata = await storage.getMetadataConfigById(clientId);
      const { ensureTomConfig, calculatePhaseSummary, mergePresetProfile } = await import("@shared/tom");
      const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
      
      if (tomConfig.enabled !== 'true') {
        return res.json({ enabled: false, summary: {} });
      }
      
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      
      const summary = calculatePhaseSummary(
        useCases.map(uc => {
          const govStatus = calculateGovernanceStatus(uc);
          return {
            useCaseStatus: uc.useCaseStatus,
            deploymentStatus: uc.deploymentStatus,
            tomPhaseOverride: uc.tomPhaseOverride,
            governanceGates: {
              operatingModelPassed: govStatus.operatingModel.passed,
              intakePassed: govStatus.intake.passed,
              raiPassed: govStatus.rai.passed
            }
          };
        }),
        tomConfig
      );
      
      res.json({ 
        enabled: true, 
        summary,
        phases: tomConfig.phases.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color,
          count: summary[p.id] || 0
        })),
        unphasedCount: summary['unphased'] || 0
      });
    } catch (error) {
      console.error("Error calculating TOM phase summary:", error);
      res.status(500).json({ error: "Failed to calculate phase summary" });
    }
  });

  app.get("/api/tom/phase-summary/:clientId", async (req, res) => {
    try {
      const clientId = req.params.clientId || 'default';
      const scope = (req.query.scope as string) || 'all';
      const metadata = await storage.getMetadataConfigById(clientId);
      const { ensureTomConfig, calculatePhaseSummary, mergePresetProfile } = await import("@shared/tom");
      const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
      
      if (tomConfig.enabled !== 'true') {
        return res.json({ enabled: false, summary: {} });
      }
      
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      
      const summary = calculatePhaseSummary(
        useCases.map(uc => {
          const govStatus = calculateGovernanceStatus(uc);
          return {
            useCaseStatus: uc.useCaseStatus,
            deploymentStatus: uc.deploymentStatus,
            tomPhaseOverride: uc.tomPhaseOverride,
            governanceGates: {
              operatingModelPassed: govStatus.operatingModel.passed,
              intakePassed: govStatus.intake.passed,
              raiPassed: govStatus.rai.passed
            }
          };
        }),
        tomConfig
      );
      
      res.json({ 
        enabled: true, 
        summary,
        phases: tomConfig.phases.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color,
          count: summary[p.id] || 0
        })),
        unphasedCount: summary['unphased'] || 0
      });
    } catch (error) {
      console.error("Error calculating TOM phase summary:", error);
      res.status(500).json({ error: "Failed to calculate phase summary" });
    }
  });

  app.post("/api/tom/seed-default", async (req, res) => {
    try {
      const { DEFAULT_TOM_CONFIG } = await import("@shared/tom");
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig: DEFAULT_TOM_CONFIG
      };
      const result = await storage.updateMetadataConfig(updatedMetadata);
      res.json({ 
        success: true, 
        message: "Default TOM configuration seeded successfully",
        tomConfig: result?.tomConfig 
      });
    } catch (error) {
      console.error("Error seeding TOM config:", error);
      res.status(500).json({ error: "Failed to seed TOM configuration" });
    }
  });

  app.post("/api/tom/rederive-phases", async (req, res) => {
    try {
      const { 
        ensureTomConfig, 
        derivePhase, 
        mergePresetProfile 
      } = await import("@shared/tom");
      
      const metadata = await storage.getMetadataConfig();
      const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
      
      if (tomConfig.enabled !== 'true') {
        return res.json({ 
          success: false, 
          message: "TOM is not enabled",
          total: 0, 
          updated: 0 
        });
      }
      
      const useCases = await storage.getAllUseCases();
      
      const results = {
        total: useCases.length,
        updated: 0,
        phaseDistribution: {} as Record<string, number>,
        errors: [] as string[]
      };
      
      for (const useCase of useCases) {
        try {
          const phaseResult = derivePhase(
            useCase.useCaseStatus,
            useCase.deploymentStatus,
            useCase.tomPhaseOverride,
            tomConfig
          );
          
          if (phaseResult.id !== useCase.tomPhase) {
            await storage.updateUseCase(useCase.id, { 
              tomPhase: phaseResult.id,
              phaseEnteredAt: new Date()
            });
            results.updated++;
          }
          
          results.phaseDistribution[phaseResult.id] = 
            (results.phaseDistribution[phaseResult.id] || 0) + 1;
        } catch (err) {
          results.errors.push(`${useCase.id}: ${(err as Error).message}`);
        }
      }
      
      res.json({ 
        success: true,
        message: `Re-derived TOM phases for ${results.updated}/${results.total} use cases`,
        ...results
      });
    } catch (error) {
      console.error("Error re-deriving TOM phases:", error);
      res.status(500).json({ error: "Failed to re-derive TOM phases" });
    }
  });
}
