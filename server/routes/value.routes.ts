import type { Express } from "express";
import { storage } from "../storage";
import { deriveAllFields, getDefaultConfigs, getConfigsFromEngagement, type UseCaseForDerivation, type EngagementTomContext } from "../derivation";

export function registerValueRoutes(app: Express): void {
  app.get("/api/value/config", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      
      if (!metadata?.valueRealizationConfig) {
        res.json(DEFAULT_VALUE_REALIZATION_CONFIG);
        return;
      }
      res.json(metadata.valueRealizationConfig);
    } catch (error) {
      console.error("Error fetching value config:", error);
      res.status(500).json({ error: "Failed to fetch value realization config" });
    }
  });

  app.put("/api/value/config", async (req, res) => {
    try {
      const config = req.body;
      
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        res.status(404).json({ error: "Metadata config not found" });
        return;
      }
      
      await storage.updateMetadataConfig({
        ...currentMetadata,
        valueRealizationConfig: config
      });
      
      res.json({ success: true, config });
    } catch (error) {
      console.error("Error updating value config:", error);
      res.status(500).json({ error: "Failed to update value realization config" });
    }
  });

  app.get("/api/value/kpi-library", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      const config = metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      res.json(config.kpiLibrary || {});
    } catch (error) {
      console.error("Error fetching KPI library:", error);
      res.status(500).json({ error: "Failed to fetch KPI library" });
    }
  });

  app.get("/api/value/portfolio-summary", async (req, res) => {
    try {
      const scope = req.query.scope as string | undefined;
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      const tomModule = await import("@shared/tom");
      const { aggregatePortfolioValue } = await import("@shared/valueRealization");
      const { derivePhase, ensureTomConfig, mergePresetProfile } = tomModule;
      
      const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
      
      // Map use cases with derived phases
      const useCasesWithPhases = useCases.map(uc => {
        let derivedPhase = null;
        if (tomConfig.enabled === 'true') {
          const phaseResult = derivePhase(
            uc.useCaseStatus,
            uc.deploymentStatus,
            uc.tomPhaseOverride,
            tomConfig
          );
          derivedPhase = phaseResult;
        }
        return {
          ...uc,
          derivedPhase,
          valueRealization: uc.valueRealization as any
        };
      });
      
      const summary = aggregatePortfolioValue(useCasesWithPhases as any);
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching value portfolio summary:", error);
      res.status(500).json({ error: "Failed to fetch portfolio value summary" });
    }
  });

  app.post("/api/value/seed-default", async (req, res) => {
    try {
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        res.status(404).json({ error: "Metadata config not found" });
        return;
      }
      
      await storage.updateMetadataConfig({
        ...currentMetadata,
        valueRealizationConfig: DEFAULT_VALUE_REALIZATION_CONFIG
      });
      
      res.json({ success: true, message: "Value realization config seeded with defaults" });
    } catch (error) {
      console.error("Error seeding value config:", error);
      res.status(500).json({ error: "Failed to seed value realization config" });
    }
  });

  app.post("/api/value/sync-processes", async (req, res) => {
    try {
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const canonicalProcesses = currentMetadata.processes || [];
      const kpiLibrary = currentMetadata.valueRealizationConfig?.kpiLibrary || {};
      
      // Update each KPI's applicableProcesses to only include valid canonical processes
      const syncedKpiLibrary: Record<string, any> = {};
      const syncReport: { kpiId: string; removed: string[]; kept: string[] }[] = [];
      
      for (const [kpiId, kpi] of Object.entries(kpiLibrary)) {
        const kpiData = kpi as any;
        const originalProcesses = kpiData.applicableProcesses || [];
        const validProcesses = originalProcesses.filter((p: string) => canonicalProcesses.includes(p));
        const removedProcesses = originalProcesses.filter((p: string) => !canonicalProcesses.includes(p));
        
        syncedKpiLibrary[kpiId] = {
          ...kpiData,
          applicableProcesses: validProcesses
        };
        
        if (removedProcesses.length > 0) {
          syncReport.push({ kpiId, removed: removedProcesses, kept: validProcesses });
        }
      }
      
      await storage.updateMetadataConfig({
        ...currentMetadata,
        valueRealizationConfig: {
          ...currentMetadata.valueRealizationConfig,
          kpiLibrary: syncedKpiLibrary
        } as any
      });
      
      res.json({ 
        success: true, 
        message: "KPI library synced with canonical processes",
        processCount: canonicalProcesses.length,
        kpiCount: Object.keys(syncedKpiLibrary).length,
        changes: syncReport
      });
    } catch (error) {
      console.error("Error syncing KPI library with processes:", error);
      res.status(500).json({ error: "Failed to sync KPI library with processes" });
    }
  });

  app.post("/api/use-cases/:id/derive-value", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      const metadata = await storage.getMetadataConfig();
      const { 
        deriveValueEstimates, 
        calculateTotalEstimatedValue,
        DEFAULT_VALUE_REALIZATION_CONFIG 
      } = await import("@shared/valueRealization");
      
      const valueConfig = metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      const kpiLibrary = valueConfig.kpiLibrary || {};
      const processes = (useCase.processes as string[]) || [];
      
      const scores = {
        dataReadiness: useCase.dataReadiness,
        technicalComplexity: useCase.technicalComplexity,
        adoptionReadiness: useCase.adoptionReadiness
      };
      
      const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
      const totalValue = calculateTotalEstimatedValue(valueEstimates);
      
      const existingVR = (useCase.valueRealization || {}) as any;
      const valueRealization = {
        selectedKpis: existingVR.selectedKpis || [],
        kpiValues: existingVR.kpiValues || {},
        investment: existingVR.investment || null,
        tracking: existingVR.tracking || { entries: [] },
        calculatedMetrics: existingVR.calculatedMetrics || {
          currentRoi: null,
          projectedBreakevenMonth: null,
          cumulativeValueGbp: null,
          lastCalculated: null
        },
        derived: true,
        derivedAt: new Date().toISOString(),
        kpiEstimates: valueEstimates.map(est => ({
          kpiId: est.kpiId,
          kpiName: est.kpiName,
          maturityLevel: est.maturityLevel,
          expectedRange: est.expectedRange,
          confidence: est.confidence,
          estimatedAnnualValueGbp: est.estimatedAnnualValueGbp,
          benchmarkProcess: est.benchmarkProcess
        })),
        totalEstimatedValue: totalValue,
        lastUpdated: new Date().toISOString()
      };
      
      await storage.updateUseCase(id, { valueRealization });
      
      res.json({ success: true, valueRealization });
    } catch (error) {
      console.error("Error deriving value for use case:", error);
      res.status(500).json({ error: "Failed to derive value estimates" });
    }
  });

  app.post("/api/derive/value-all", async (req, res) => {
    try {
      const { overwriteExisting = false } = req.body;
      const useCases = await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      
      const { 
        deriveValueEstimates, 
        calculateTotalEstimatedValue,
        DEFAULT_VALUE_REALIZATION_CONFIG
      } = await import("@shared/valueRealization");
      
      const valueConfig = metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      const kpiLibrary = valueConfig.kpiLibrary || {};
      
      let derivedCount = 0;
      let skippedCount = 0;
      
      for (const useCase of useCases) {
        const existingVR = useCase.valueRealization;
        const hasKpiEstimates = existingVR?.kpiEstimates && existingVR.kpiEstimates.length > 0;
        const shouldDerive = overwriteExisting || !hasKpiEstimates;
        const processes = (useCase.processes as string[]) || [];
        
        if (shouldDerive && processes.length > 0) {
          const scores = {
            dataReadiness: useCase.dataReadiness,
            technicalComplexity: useCase.technicalComplexity,
            adoptionReadiness: useCase.adoptionReadiness
          };
          
          const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
          const totalValue = calculateTotalEstimatedValue(valueEstimates);
          
          const valueRealization = {
            selectedKpis: existingVR?.selectedKpis || [],
            kpiValues: existingVR?.kpiValues || {},
            investment: existingVR?.investment || null,
            tracking: existingVR?.tracking || { entries: [] },
            calculatedMetrics: existingVR?.calculatedMetrics || {
              currentRoi: null,
              projectedBreakevenMonth: null,
              cumulativeValueGbp: null,
              lastCalculated: null
            },
            derived: true,
            derivedAt: new Date().toISOString(),
            kpiEstimates: valueEstimates.map(est => ({
              kpiId: est.kpiId,
              kpiName: est.kpiName,
              maturityLevel: est.maturityLevel,
              expectedRange: est.expectedRange,
              confidence: est.confidence,
              estimatedAnnualValueGbp: est.estimatedAnnualValueGbp,
              benchmarkProcess: est.benchmarkProcess
            })),
            totalEstimatedValue: totalValue,
            lastUpdated: new Date().toISOString()
          };
          
          await storage.updateUseCase(useCase.id, { valueRealization });
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
      console.error("Error deriving value estimates:", error);
      res.status(500).json({ error: "Failed to derive value estimates" });
    }
  });

  app.get("/api/use-cases/:id/value", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      const defaultValue = {
        selectedKpis: [],
        kpiValues: {},
        investment: null,
        tracking: { entries: [] },
        calculatedMetrics: null
      };
      
      res.json(useCase.valueRealization || defaultValue);
    } catch (error) {
      console.error("Error fetching use case value:", error);
      res.status(500).json({ error: "Failed to fetch value realization data" });
    }
  });

  app.put("/api/use-cases/:id/value", async (req, res) => {
    try {
      const { id } = req.params;
      const valueRealization = req.body;
      
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      await storage.updateUseCase(id, { valueRealization });
      
      res.json({ success: true, valueRealization });
    } catch (error) {
      console.error("Error updating use case value:", error);
      res.status(500).json({ error: "Failed to update value realization data" });
    }
  });

  app.post("/api/value/derive-all", async (req, res) => {
    try {
      const { overwriteExisting = true } = req.body;
      const useCases = await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      
      const { 
        deriveValueEstimates, 
        calculateTotalEstimatedValue,
        DEFAULT_VALUE_REALIZATION_CONFIG
      } = await import("@shared/valueRealization");
      
      const valueConfig = metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      const kpiLibrary = valueConfig.kpiLibrary || {};
      
      let derivedCount = 0;
      let skippedCount = 0;
      
      for (const useCase of useCases) {
        const processes = (useCase.processes as string[]) || [];
        const existingVR = useCase.valueRealization;
        const hasKpiEstimates = existingVR?.kpiEstimates && existingVR.kpiEstimates.length > 0;
        const shouldDerive = overwriteExisting || !hasKpiEstimates;
        
        if (shouldDerive && processes.length > 0) {
          const scores = {
            dataReadiness: useCase.dataReadiness,
            technicalComplexity: useCase.technicalComplexity,
            adoptionReadiness: useCase.adoptionReadiness
          };
          
          const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
          const totalValue = calculateTotalEstimatedValue(valueEstimates);
          
          const valueRealization = {
            selectedKpis: existingVR?.selectedKpis || [],
            kpiValues: existingVR?.kpiValues || {},
            investment: existingVR?.investment || null,
            tracking: existingVR?.tracking || { entries: [] },
            calculatedMetrics: existingVR?.calculatedMetrics || {
              currentRoi: null,
              projectedBreakevenMonth: null,
              cumulativeValueGbp: null,
              lastCalculated: null
            },
            derived: true,
            derivedAt: new Date().toISOString(),
            kpiEstimates: valueEstimates.map(est => ({
              kpiId: est.kpiId,
              kpiName: est.kpiName,
              maturityLevel: est.maturityLevel,
              expectedRange: est.expectedRange,
              confidence: est.confidence,
              estimatedAnnualValueGbp: est.estimatedAnnualValueGbp,
              benchmarkProcess: est.benchmarkProcess
            })),
            totalEstimatedValue: totalValue,
            lastUpdated: new Date().toISOString()
          };
          
          await storage.updateUseCase(useCase.id, { valueRealization });
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
      console.error("Error deriving value estimates:", error);
      res.status(500).json({ error: "Failed to derive value estimates" });
    }
  });

  // Calculate adjusted value for a use case based on conservativeFactor
  app.get("/api/value/adjusted/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const useCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
      
      if (!useCase) {
        res.status(404).json({ error: "Use case not found" });
        return;
      }
      
      const valueRealization = useCase.valueRealization as any;
      if (!valueRealization) {
        res.json({
          useCaseId: id,
          rawValueGbp: null,
          adjustedValueGbp: null,
          conservativeFactor: 1.0,
          validationStatus: 'unvalidated'
        });
        return;
      }
      
      const conservativeFactor = valueRealization.valueConfidence?.conservativeFactor ?? 1.0;
      const validationStatus = valueRealization.valueConfidence?.validationStatus ?? 'unvalidated';
      const rawValueGbp = valueRealization.totalValueGbp ?? valueRealization.totalEstimatedValue ?? null;
      const adjustedValueGbp = rawValueGbp !== null ? rawValueGbp * conservativeFactor : null;
      
      res.json({
        useCaseId: id,
        rawValueGbp,
        adjustedValueGbp,
        conservativeFactor,
        validationStatus
      });
    } catch (error) {
      console.error("Error calculating adjusted value:", error);
      res.status(500).json({ error: "Failed to calculate adjusted value" });
    }
  });

  // Aggregate KPIs across portfolio by type and stream
  app.get("/api/value/kpi-aggregation", async (req, res) => {
    try {
      const scope = req.query.scope as string | undefined;
      const useCases = scope === 'dashboard' 
        ? await storage.getDashboardUseCases() 
        : await storage.getAllUseCases();
      
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      const valueConfig = metadata?.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      const kpiLibrary = valueConfig.kpiLibrary || {};
      
      // Initialize aggregation structures
      const byKpiType: Record<string, { count: number; totalValueGbp: number; adjustedValueGbp: number; kpis: string[] }> = {
        financial: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        operational: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        strategic: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        compliance: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] }
      };
      
      const byValueStream: Record<string, { count: number; totalValueGbp: number; adjustedValueGbp: number; kpis: string[] }> = {
        operational_savings: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        cor_improvement: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        revenue_uplift: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        risk_mitigation: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        customer_experience: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] },
        regulatory_compliance: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0, kpis: [] }
      };
      
      const byValidationStatus: Record<string, { count: number; totalValueGbp: number; adjustedValueGbp: number }> = {
        unvalidated: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0 },
        pending_finance: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0 },
        pending_actuarial: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0 },
        fully_validated: { count: 0, totalValueGbp: 0, adjustedValueGbp: 0 }
      };
      
      let totalRawValue = 0;
      let totalAdjustedValue = 0;
      let useCasesWithValue = 0;
      
      for (const useCase of useCases) {
        const valueRealization = useCase.valueRealization as any;
        if (!valueRealization) continue;
        
        const conservativeFactor = valueRealization.valueConfidence?.conservativeFactor ?? 1.0;
        const validationStatus = valueRealization.valueConfidence?.validationStatus ?? 'unvalidated';
        const rawValue = valueRealization.totalValueGbp ?? valueRealization.totalEstimatedValue ?? 0;
        const adjustedValue = rawValue * conservativeFactor;
        
        if (rawValue > 0) {
          useCasesWithValue++;
          totalRawValue += rawValue;
          totalAdjustedValue += adjustedValue;
        }
        
        // Aggregate by validation status
        if (byValidationStatus[validationStatus]) {
          byValidationStatus[validationStatus].count++;
          byValidationStatus[validationStatus].totalValueGbp += rawValue;
          byValidationStatus[validationStatus].adjustedValueGbp += adjustedValue;
        }
        
        // Process KPI estimates
        const kpiEstimates = valueRealization.kpiEstimates || [];
        for (const estimate of kpiEstimates) {
          const kpiDef = kpiLibrary[estimate.kpiId] as any;
          if (!kpiDef) continue;
          
          const kpiType = kpiDef.kpiType || 'operational';
          const valueStream = kpiDef.valueStream || 'operational_savings';
          const estimatedValue = estimate.estimatedAnnualValueGbp || 0;
          const adjustedKpiValue = estimatedValue * conservativeFactor;
          
          // Aggregate by KPI type
          if (byKpiType[kpiType]) {
            byKpiType[kpiType].count++;
            byKpiType[kpiType].totalValueGbp += estimatedValue;
            byKpiType[kpiType].adjustedValueGbp += adjustedKpiValue;
            if (!byKpiType[kpiType].kpis.includes(estimate.kpiId)) {
              byKpiType[kpiType].kpis.push(estimate.kpiId);
            }
          }
          
          // Aggregate by value stream
          if (byValueStream[valueStream]) {
            byValueStream[valueStream].count++;
            byValueStream[valueStream].totalValueGbp += estimatedValue;
            byValueStream[valueStream].adjustedValueGbp += adjustedKpiValue;
            if (!byValueStream[valueStream].kpis.includes(estimate.kpiId)) {
              byValueStream[valueStream].kpis.push(estimate.kpiId);
            }
          }
        }
      }
      
      res.json({
        summary: {
          totalUseCases: useCases.length,
          useCasesWithValue,
          totalRawValueGbp: totalRawValue,
          totalAdjustedValueGbp: totalAdjustedValue,
          averageConservativeFactor: useCasesWithValue > 0 ? totalAdjustedValue / totalRawValue : 1.0
        },
        byKpiType,
        byValueStream,
        byValidationStatus
      });
    } catch (error) {
      console.error("Error aggregating KPIs:", error);
      res.status(500).json({ error: "Failed to aggregate KPIs" });
    }
  });
}
