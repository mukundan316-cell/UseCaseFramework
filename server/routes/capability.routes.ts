import type { Express } from "express";
import { storage } from "../storage";
import { deriveAllFields, getConfigsFromEngagement, type UseCaseForDerivation, type EngagementTomContext } from "../derivation";

export function registerCapabilityRoutes(app: Express): void {
  app.get("/api/capability/config", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_CAPABILITY_TRANSITION_CONFIG } = await import("@shared/capabilityTransition");
      
      if (!metadata?.capabilityTransitionConfig) {
        res.json(DEFAULT_CAPABILITY_TRANSITION_CONFIG);
        return;
      }
      res.json(metadata.capabilityTransitionConfig);
    } catch (error) {
      console.error("Error fetching capability config:", error);
      res.status(500).json({ error: "Failed to fetch capability transition config" });
    }
  });

  app.put("/api/capability/config", async (req, res) => {
    try {
      const config = req.body;
      
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        res.status(404).json({ error: "Metadata config not found" });
        return;
      }
      
      await storage.updateMetadataConfig({
        ...currentMetadata,
        capabilityTransitionConfig: config
      });
      
      res.json({ success: true, config });
    } catch (error) {
      console.error("Error updating capability config:", error);
      res.status(500).json({ error: "Failed to update capability transition config" });
    }
  });

  app.get("/api/use-cases/:id/capability", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      const { DEFAULT_USE_CASE_CAPABILITY_TRANSITION } = await import("@shared/capabilityTransition");
      
      res.json(useCase.capabilityTransition || DEFAULT_USE_CASE_CAPABILITY_TRANSITION);
    } catch (error) {
      console.error("Error fetching use case capability:", error);
      res.status(500).json({ error: "Failed to fetch capability transition data" });
    }
  });

  app.put("/api/use-cases/:id/capability", async (req, res) => {
    try {
      const { id } = req.params;
      const capabilityTransition = req.body;
      const { calculateIndependenceFromStaffing } = await import("@shared/capabilityTransition");
      
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      if (capabilityTransition.staffing?.current) {
        const calculatedIndependence = calculateIndependenceFromStaffing(capabilityTransition.staffing.current);
        capabilityTransition.independencePercentage = calculatedIndependence;
        
        const existingHistory = capabilityTransition.independenceHistory || [];
        const lastEntry = existingHistory[existingHistory.length - 1];
        if (!lastEntry || lastEntry.percentage !== calculatedIndependence) {
          capabilityTransition.independenceHistory = [
            ...existingHistory,
            {
              date: new Date().toISOString().slice(0, 7),
              percentage: calculatedIndependence,
              note: 'Auto-calculated from staffing update'
            }
          ];
        }
      }
      
      await storage.updateUseCase(id, { capabilityTransition });
      
      res.json({ success: true, capabilityTransition });
    } catch (error) {
      console.error("Error updating use case capability:", error);
      res.status(500).json({ error: "Failed to update capability transition data" });
    }
  });

  app.get("/api/capability/portfolio-summary", async (req, res) => {
    try {
      const scope = req.query.scope as string | undefined;
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      const { 
        aggregatePortfolioCapability, 
        DEFAULT_CAPABILITY_TRANSITION_CONFIG 
      } = await import("@shared/capabilityTransition");
      
      const config = metadata?.capabilityTransitionConfig || DEFAULT_CAPABILITY_TRANSITION_CONFIG;
      
      const useCasesWithCapability = useCases.map(uc => ({
        capabilityTransition: uc.capabilityTransition || null,
        valueRealization: uc.valueRealization || null
      }));
      
      const summary = aggregatePortfolioCapability(useCasesWithCapability, config);
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching capability portfolio summary:", error);
      res.status(500).json({ error: "Failed to fetch portfolio capability summary" });
    }
  });

  app.get("/api/capability/staffing-projection", async (req, res) => {
    try {
      const scope = req.query.scope as string | undefined;
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      const { generateAggregateStaffingProjection } = await import("@shared/capabilityTransition");
      
      const useCasesWithCapability = useCases.map(uc => ({
        capabilityTransition: uc.capabilityTransition || null
      }));
      
      const projection = generateAggregateStaffingProjection(useCasesWithCapability);
      
      res.json(projection);
    } catch (error) {
      console.error("Error fetching staffing projection:", error);
      res.status(500).json({ error: "Failed to fetch staffing projection" });
    }
  });

  app.post("/api/derive/all", async (req, res) => {
    try {
      const { 
        overwriteValue = false, 
        overwriteCapability = false 
      } = req.body;
      
      const useCases = await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      const allEngagements = await storage.getAllEngagements();
      const allClients = await storage.getAllClients();
      
      const clientCurrencyMap = new Map<string, string>();
      for (const client of allClients) {
        clientCurrencyMap.set(client.id, client.currency || 'GBP');
      }
      
      const engagementConfigMap = new Map<string, EngagementTomContext & { clientCurrency: string }>();
      for (const engagement of allEngagements) {
        engagementConfigMap.set(engagement.id, {
          tomPresetId: engagement.tomPresetId,
          tomPhasesJson: engagement.tomPhasesJson,
          clientCurrency: clientCurrencyMap.get(engagement.clientId) || 'GBP'
        });
      }
      
      const results = {
        total: useCases.length,
        tomDerived: 0,
        valueDerived: 0,
        capabilityDerived: 0,
        errors: [] as string[]
      };
      
      for (const useCase of useCases) {
        try {
          const engagementData = useCase.engagementId 
            ? engagementConfigMap.get(useCase.engagementId) || null 
            : null;
          const engagementContext = engagementData ? { tomPresetId: engagementData.tomPresetId, tomPhasesJson: engagementData.tomPhasesJson } : null;
          const clientCurrency = engagementData?.clientCurrency || 'GBP';
          const configs = getConfigsFromEngagement(metadata, engagementContext);
          
          const useCaseForDerivation: UseCaseForDerivation = {
            id: useCase.id,
            title: useCase.title,
            useCaseStatus: useCase.useCaseStatus,
            deploymentStatus: useCase.deploymentStatus,
            tomPhaseOverride: useCase.tomPhaseOverride,
            processes: useCase.processes,
            quadrant: useCase.quadrant,
            tShirtSize: useCase.tShirtSize,
            dataReadiness: useCase.dataReadiness,
            technicalComplexity: useCase.technicalComplexity,
            adoptionReadiness: useCase.adoptionReadiness,
            capabilityTransition: useCase.capabilityTransition,
            valueRealization: useCase.valueRealization,
            tomPhase: useCase.tomPhase
          };
          
          const derived = deriveAllFields(useCaseForDerivation, configs, {
            overwriteValue: overwriteValue && 
              (!useCase.valueRealization || useCase.valueRealization?.derived === true),
            overwriteCapability,
            currencyCode: clientCurrency as any
          });
          
          if (derived.tomPhase && !useCase.phaseEnteredAt) {
            (derived as any).phaseEnteredAt = new Date();
          }
          
          if (Object.keys(derived).length > 0) {
            await storage.updateUseCase(useCase.id, derived);
            
            if (derived.tomPhase !== undefined) results.tomDerived++;
            if (derived.valueRealization !== undefined) results.valueDerived++;
            if (derived.capabilityTransition !== undefined) results.capabilityDerived++;
          }
        } catch (err) {
          results.errors.push(`${useCase.id}: ${(err as Error).message}`);
        }
      }
      
      res.json({ success: true, ...results });
    } catch (error) {
      console.error("Error in bulk derivation:", error);
      res.status(500).json({ error: "Failed to derive fields for use cases" });
    }
  });

  app.post("/api/capability/derive-all", async (req, res) => {
    try {
      const { overwriteExisting = false } = req.body;
      const useCases = await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      
      const { 
        deriveCapabilityDefaults, 
        DEFAULT_CAPABILITY_TRANSITION_CONFIG,
        shouldRecalculateCapability
      } = await import("@shared/capabilityTransition");
      
      const config = metadata?.capabilityTransitionConfig || DEFAULT_CAPABILITY_TRANSITION_CONFIG;
      const benchmarkConfig = config.benchmarkConfig;
      
      let derivedCount = 0;
      let skippedCount = 0;
      
      for (const useCase of useCases) {
        const shouldDerive = overwriteExisting || shouldRecalculateCapability(useCase.capabilityTransition);
        
        if (shouldDerive) {
          const derivedCapability = deriveCapabilityDefaults(
            {
              id: useCase.id,
              title: useCase.title,
              tomPhase: useCase.tomPhase,
              quadrant: useCase.quadrant,
              tShirtSize: useCase.tShirtSize,
              deploymentStatus: useCase.deploymentStatus,
              useCaseStatus: useCase.useCaseStatus
            },
            config,
            benchmarkConfig
          );
          
          await storage.updateUseCase(useCase.id, { capabilityTransition: derivedCapability });
          derivedCount++;
        } else {
          skippedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        derived: derivedCount, 
        skipped: skippedCount,
        total: useCases.length
      });
    } catch (error) {
      console.error("Error deriving capability defaults:", error);
      res.status(500).json({ error: "Failed to derive capability defaults" });
    }
  });

  app.post("/api/use-cases/:id/capability/derive", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      const metadata = await storage.getMetadataConfig();
      const { 
        deriveCapabilityDefaults, 
        DEFAULT_CAPABILITY_TRANSITION_CONFIG 
      } = await import("@shared/capabilityTransition");
      
      const config = metadata?.capabilityTransitionConfig || DEFAULT_CAPABILITY_TRANSITION_CONFIG;
      
      const derivedCapability = deriveCapabilityDefaults(
        {
          id: useCase.id,
          title: useCase.title,
          tomPhase: useCase.tomPhase,
          quadrant: useCase.quadrant,
          tShirtSize: useCase.tShirtSize,
          deploymentStatus: useCase.deploymentStatus,
          useCaseStatus: useCase.useCaseStatus
        },
        config,
        config.benchmarkConfig
      );
      
      await storage.updateUseCase(id, { capabilityTransition: derivedCapability });
      
      res.json({ success: true, capabilityTransition: derivedCapability });
    } catch (error) {
      console.error("Error deriving capability for use case:", error);
      res.status(500).json({ error: "Failed to derive capability defaults" });
    }
  });
}
