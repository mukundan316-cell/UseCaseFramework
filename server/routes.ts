import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUseCaseSchema } from "@shared/schema";
import { z } from "zod";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from "@shared/calculations";
import { getImpactWeights, getEffortWeights } from "@shared/utils/weightUtils";
import { mapUseCaseToFrontend, type UseCaseFrontend } from "@shared/mappers";
import recommendationRoutes from "./routes/recommendations";
import exportRoutes from "./routes/export.routes";
import importRoutes from "./routes/import.routes";
import presentationRoutes from "./routes/presentations";
import { derivePhase, type TomConfig } from "@shared/tom";
import { deriveAllFields, getDefaultConfigs, shouldTriggerDerivation, type UseCaseForDerivation } from "./derivation";

import { questionnaireServiceInstance } from './services/questionnaireService';
import { db } from './db';
import { responseSessions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Helper function to recalculate all use case scores with new weights
async function recalculateAllUseCaseScores(scoringModel: any) {
  const useCases = await storage.getAllUseCases();
  
  // Parse scoring model if it's a string
  let parsedScoringModel = scoringModel;
  if (typeof scoringModel === 'string') {
    try {
      parsedScoringModel = JSON.parse(scoringModel);
    } catch (e) {
      console.error('Error parsing scoring model:', e);
      parsedScoringModel = scoringModel;
    }
  }
  
  // Use centralized weight utilities for consistency
  const businessImpactWeights = getImpactWeights({ scoringModel: parsedScoringModel });
  const implementationEffortWeights = getEffortWeights({ scoringModel: parsedScoringModel });
  
  const threshold = parsedScoringModel?.quadrantThreshold || 3.0;
  
  
  for (const useCase of useCases) {
    const impactScore = calculateImpactScore(
      useCase.revenueImpact,
      useCase.costSavings,
      useCase.riskReduction,
      useCase.brokerPartnerExperience,
      useCase.strategicFit,
      businessImpactWeights
    );
    
    const effortScore = calculateEffortScore(
      useCase.dataReadiness,
      useCase.technicalComplexity,
      useCase.changeImpact,
      useCase.modelRisk,
      useCase.adoptionReadiness,
      implementationEffortWeights
    );
    
    const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
    
    
    await storage.updateUseCase(useCase.id, {
      impactScore,
      effortScore,
      quadrant
    });
  }
}

// Helper to enrich use cases with TOM derivedPhase when TOM is enabled
interface DerivedPhaseInfo {
  id: string;
  name: string;
  color: string;
  isOverride: boolean;
  matchedBy?: 'status' | 'deployment' | 'priority' | 'manual';
}

async function enrichUseCasesWithTomPhase(useCases: UseCaseFrontend[]): Promise<(UseCaseFrontend & { derivedPhase?: DerivedPhaseInfo })[]> {
  try {
    const metadata = await storage.getMetadataConfig();
    const { ensureTomConfig, mergePresetProfile } = await import("@shared/tom");
    const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
    
    if (tomConfig.enabled !== 'true') {
      return useCases;
    }
    
    return useCases.map(uc => ({
      ...uc,
      derivedPhase: derivePhase(
        uc.useCaseStatus || null,
        uc.deploymentStatus || null,
        (uc as any).tomPhaseOverride || null,
        tomConfig
      ) as DerivedPhaseInfo
    }));
  } catch (error) {
    console.error('Error enriching use cases with TOM phase:', error);
    return useCases;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const questionnaireService = questionnaireServiceInstance;
  
  // Use Case routes - All Use Cases (for library browsing)
  app.get("/api/use-cases", async (req, res) => {
    try {
      const useCases = await storage.getAllUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching all use cases:", error);
      res.status(500).json({ error: "Failed to fetch use cases" });
    }
  });

  // Two-tier library system routes
  app.get("/api/use-cases/dashboard", async (req, res) => {
    try {
      const useCases = await storage.getDashboardUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching dashboard use cases:", error);
      res.status(500).json({ error: "Failed to fetch dashboard use cases" });
    }
  });

  app.get("/api/use-cases/active", async (req, res) => {
    try {
      const useCases = await storage.getActiveUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases);
      res.json(enrichedUseCases);
    } catch (error) {
      console.error("Error fetching active use cases:", error);
      res.status(500).json({ error: "Failed to fetch active use cases" });
    }
  });

  app.get("/api/use-cases/reference", async (req, res) => {
    try {
      const useCases = await storage.getReferenceLibraryUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      const enrichedUseCases = await enrichUseCasesWithTomPhase(mappedUseCases);
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
      
      // Handle date conversion before validation
      if (req.body.presentationUploadedAt && typeof req.body.presentationUploadedAt === 'string') {
        try {
          req.body.presentationUploadedAt = new Date(req.body.presentationUploadedAt);
        } catch (dateError) {
          console.error('Date conversion error:', dateError);
          req.body.presentationUploadedAt = null;
        }
      }
      
      const validatedData = insertUseCaseSchema.parse(req.body);
      
      // Get current metadata for weights
      const metadata = await storage.getMetadataConfig();
      // Use centralized weight utilities for consistency
      const businessImpactWeights = getImpactWeights(metadata);
      const implementationEffortWeights = getEffortWeights(metadata);
      const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
      
      // Calculate scores with weights
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
        // Handle multi-select arrays only
        processes: (validatedData.processes as string[]) || [],
        activities: (validatedData.activities as string[]) || [],
        businessSegments: (validatedData.businessSegments as string[]) || [],
        geographies: (validatedData.geographies as string[]) || [],
        // Ensure new use cases go to reference library by default
        isActiveForRsa: (validatedData.isActiveForRsa as string) || 'false',
        isDashboardVisible: (validatedData.isDashboardVisible as string) || 'false',
        libraryTier: (validatedData.libraryTier as string) || 'reference',
        impactScore,
        effortScore,
        quadrant
      };
      
      const newUseCase = await storage.createUseCase(useCaseWithScores as any);
      
      // Auto-derive TOM phase, value estimates, and capability defaults
      try {
        const derivedMetadata = await storage.getMetadataConfig();
        const configs = getDefaultConfigs(derivedMetadata);
        
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
          overwriteCapability: true
        });
        
        // Always set phaseEnteredAt on creation for TOM phase timeline tracking
        if (derived.tomPhase) {
          (derived as any).phaseEnteredAt = new Date();
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
        
        // Create user-friendly validation messages
        const friendlyMessages = error.issues.map(issue => {
          const field = issue.path.join('.');
          const message = issue.message;
          
          // Convert technical field names to user-friendly labels
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
          
          // Provide context-specific error messages
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
      
      // Handle date conversion before validation
      if (req.body.presentationUploadedAt && typeof req.body.presentationUploadedAt === 'string') {
        try {
          req.body.presentationUploadedAt = new Date(req.body.presentationUploadedAt);
        } catch (dateError) {
          console.error('Date conversion error:', dateError);
          req.body.presentationUploadedAt = null;
        }
      }
      
      // Create a partial schema for updates by making all fields optional
      const updateSchema = insertUseCaseSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      // Handle multi-select arrays for updates - no backward compatibility needed
      // Arrays are now the primary data format

      // Calculate enhanced framework scores if scoring fields are present
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
        
        // Get current use case to fill in missing values
        const currentUseCase = await storage.getAllUseCases().then(cases => 
          cases.find(c => c.id === id)
        );
        
        if (!currentUseCase) {
          return res.status(404).json({ error: "Use case not found" });
        }
        
        // Get current metadata for weights
        const metadata = await storage.getMetadataConfig();
        // Use centralized weight utilities for consistency
        const businessImpactWeights = getImpactWeights(metadata);
        const implementationEffortWeights = getEffortWeights(metadata);
        const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
        
        // Merge current values with updates for complete scoring
        const completeData = {
          revenueImpact: validatedData.revenueImpact ?? currentUseCase.revenueImpact,
          costSavings: validatedData.costSavings ?? currentUseCase.costSavings,
          riskReduction: validatedData.riskReduction ?? currentUseCase.riskReduction,
          brokerPartnerExperience: validatedData.brokerPartnerExperience ?? currentUseCase.brokerPartnerExperience,
          strategicFit: validatedData.strategicFit ?? currentUseCase.strategicFit,
          dataReadiness: validatedData.dataReadiness ?? currentUseCase.dataReadiness,
          technicalComplexity: validatedData.technicalComplexity ?? currentUseCase.technicalComplexity,
          changeImpact: validatedData.changeImpact ?? currentUseCase.changeImpact,
          modelRisk: validatedData.modelRisk ?? currentUseCase.modelRisk, // Include modelRisk in merge
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
          completeData.modelRisk || 0, // Use merged modelRisk value
          completeData.adoptionReadiness || 0,
          implementationEffortWeights
        );
        
        const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
        
        updatesWithScores = {
          ...validatedData,
          linesOfBusiness: validatedData.linesOfBusiness || (validatedData.lineOfBusiness ? [validatedData.lineOfBusiness] : currentUseCase.linesOfBusiness),
          impactScore,
          effortScore,
          quadrant
        } as any; // Type assertion to handle calculated fields
      }
      
      // Handle manual override fields - always preserve them if provided
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
      
      // Handle null values properly - allow nulls for manual override fields to clear them
      const allowNullFields = ['manualImpactScore', 'manualEffortScore', 'manualQuadrant', 'overrideReason'];
      const cleanUpdates = Object.fromEntries(
        Object.entries(updatesWithScores).map(([key, value]) => {
          // Allow null values for manual override fields to clear database values
          if (allowNullFields.includes(key)) {
            return [key, value]; // Keep null as-is for these fields
          }
          // Convert null to undefined for other fields
          return [key, value === null ? undefined : value];
        })
      );
      
      // Track TOM phase changes if TOM is enabled
      // First, get old phase before update and TOM config
      const metadataForTom = await storage.getMetadataConfig();
      const tomConfig = metadataForTom?.tomConfig as TomConfig | null;
      
      let oldDerivedPhaseId: string | null = null;
      if (tomConfig?.enabled === 'true') {
        // Get the current use case to calculate old phase
        const currentUseCaseForPhase = await storage.getAllUseCases().then(cases => 
          cases.find(c => c.id === id)
        );
        if (currentUseCaseForPhase) {
          // derivePhase expects: (useCaseStatus, deploymentStatus, tomPhaseOverride, tomConfig)
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
      
      // Check if phase changed and update phaseEnteredAt if so
      if (tomConfig?.enabled === 'true') {
        // derivePhase expects: (useCaseStatus, deploymentStatus, tomPhaseOverride, tomConfig)
        const newPhaseResult = derivePhase(
          updatedUseCase.useCaseStatus,
          updatedUseCase.deploymentStatus,
          updatedUseCase.tomPhaseOverride,
          tomConfig
        );
        const newDerivedPhaseId = newPhaseResult?.id || null;
        
        // Only update phaseEnteredAt if phase actually changed
        if (newDerivedPhaseId !== oldDerivedPhaseId) {
          await storage.updateUseCase(id, { 
            phaseEnteredAt: new Date(),
            tomPhase: newDerivedPhaseId
          } as any);
          console.log(`Phase changed for ${id}: ${oldDerivedPhaseId} → ${newDerivedPhaseId}, updated phaseEnteredAt and tomPhase`);
        } else if (updatedUseCase.tomPhase !== newDerivedPhaseId) {
          // Ensure tomPhase field is always in sync
          await storage.updateUseCase(id, { tomPhase: newDerivedPhaseId } as any);
        }
      }
      
      // Smart derivation: only recalculate fields affected by changes
      const triggers = shouldTriggerDerivation(validatedData, undefined);
      if (triggers.value || triggers.capability) {
        try {
          const derivedMetadata = await storage.getMetadataConfig();
          const configs = getDefaultConfigs(derivedMetadata);
          
          // Refresh use case data after phase update
          const refreshedUseCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
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
            
            // Only overwrite value if no manual data exists (derived === true or absent)
            const canOverwriteValue = triggers.value && 
              !validatedData.valueRealization &&
              (!refreshedUseCase.valueRealization || refreshedUseCase.valueRealization?.derived === true);
            
            const derived = deriveAllFields(useCaseForDerivation, configs, {
              overwriteValue: canOverwriteValue,
              overwriteCapability: triggers.capability && 
                (!refreshedUseCase.capabilityTransition || refreshedUseCase.capabilityTransition?.derived === true)
            });
            
            // Only update derived fields if not manually set
            const fieldsToUpdate: Record<string, any> = {};
            if (derived.valueRealization && canOverwriteValue) {
              fieldsToUpdate.valueRealization = derived.valueRealization;
            }
            // Only overwrite capability if derived or absent (protect manual data)
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
      
      // If valueRealization was updated with investment data, calculate metrics
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
            
            const selectedKpis = vr.selectedKpis || [];
            const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary, 1000);
            const selectedEstimates = valueEstimates.filter((e: any) => selectedKpis.includes(e.kpiId));
            const totalValue = calculateTotalEstimatedValue(selectedEstimates);
            
            const estimatedAnnualValue = (totalValue.min + totalValue.max) / 2;
            const totalInvestment = (vr.investment.initialInvestment || 0) + ((vr.investment.ongoingMonthlyCost || 0) * 12);
            const currentRoi = calculateRoi(estimatedAnnualValue, totalInvestment);
            const monthlyValue = estimatedAnnualValue / 12;
            const projectedBreakevenMonth = calculateBreakevenMonth(totalInvestment, monthlyValue);
            
            // Update with calculated metrics
            const updatedVR = {
              ...vr,
              calculatedMetrics: {
                currentRoi,
                projectedBreakevenMonth,
                cumulativeValueGbp: estimatedAnnualValue,
                lastCalculated: new Date().toISOString()
              }
            };
            
            await storage.updateUseCase(id, { valueRealization: updatedVR } as any);
            const finalUseCase = await storage.getAllUseCases().then(cases => cases.find(c => c.id === id));
            if (finalUseCase) {
              return res.json(mapUseCaseToFrontend(finalUseCase));
            }
          } catch (calcError) {
            console.error("Value calculation error:", calcError);
            // Continue with original response if calculation fails
          }
        }
      }
      
      res.json(mapUseCaseToFrontend(updatedUseCase));
    } catch (error) {
      console.error("Error updating use case:", error);
      res.status(400).json({ error: "Failed to update use case" });
    }
  });

  app.delete("/api/use-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get use case first to access presentation files
      const useCase = await storage.getAllUseCases().then(cases => 
        cases.find(c => c.id === id)
      );
      
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      // Delete presentation files if they exist (supports both legacy URLs and new database file IDs)
      if (useCase.presentationUrl || useCase.presentationPdfUrl || useCase.presentationFileId || useCase.presentationPdfFileId) {
        try {
          
          // Handle new database-stored files
          const fileIdsToDelete = [
            useCase.presentationFileId,
            useCase.presentationPdfFileId
          ].filter(Boolean);
          
          if (fileIdsToDelete.length > 0) {
            const { localFileService } = await import('./services/localFileService');
            await localFileService.deleteFiles(fileIdsToDelete);
          }
          
          console.log(`🗑️ Cleaned up presentation files for use case: ${useCase.title}`);
        } catch (fileDeleteError) {
          console.error('Warning: Failed to delete presentation files:', fileDeleteError);
          // Continue with use case deletion even if file cleanup fails
        }
      }
      
      const deleted = await storage.deleteUseCase(id);
      if (!deleted) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting use case:", error);
      res.status(500).json({ error: "Failed to delete use case" });
    }
  });

  // Duplicate Detection Routes (Topic 3.4 - Markel 9 Topics)
  app.post("/api/use-cases/check-duplicates", async (req, res) => {
    try {
      const { title, description, excludeId } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const similarCases = await storage.findSimilarUseCases(title, description || '', excludeId);
      res.json({ 
        hasDuplicates: similarCases.length > 0,
        similarCases 
      });
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      res.status(500).json({ error: "Failed to check for duplicates" });
    }
  });
  
  app.get("/api/use-cases/potential-duplicates", async (req, res) => {
    try {
      const useCases = await storage.getAllUseCases();
      const potentialDuplicates = useCases.filter(uc => 
        uc.duplicateStatus === 'potential_duplicate'
      ).map(uc => mapUseCaseToFrontend(uc));
      res.json(potentialDuplicates);
    } catch (error) {
      console.error("Error getting potential duplicates:", error);
      res.status(500).json({ error: "Failed to get potential duplicates" });
    }
  });
  
  app.put("/api/use-cases/:id/resolve-duplicate", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewedBy } = req.body;
      
      if (!status || !['confirmed_duplicate', 'reviewed_not_duplicate'].includes(status)) {
        return res.status(400).json({ error: "Invalid duplicate status" });
      }
      
      const useCase = await storage.resolveDuplicate(id, status, reviewedBy || 'admin');
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error resolving duplicate:", error);
      res.status(500).json({ error: "Failed to resolve duplicate" });
    }
  });
  
  // Audit Trail Routes (Topic 8.2 - Markel 9 Topics)
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

  // Metadata routes for database-first compliance
  app.get("/api/metadata", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      res.json(metadata);
    } catch (error) {
      console.error("Error loading metadata:", error);
      res.status(500).json({ error: "Failed to load metadata" });
    }
  });

  app.put("/api/metadata", async (req, res) => {
    try {
      const metadata = req.body;
      const updated = await storage.updateMetadataConfig(metadata);
      
      // Always recalculate all use case scores when metadata is updated
      try {
        const currentMetadata = await storage.getMetadataConfig();
        await recalculateAllUseCaseScores(currentMetadata?.scoringModel || metadata.scoringModel);
      } catch (recalcError) {
        console.error('⚠️ Error recalculating scores after metadata update:', recalcError);
        // Continue - don't fail the metadata update if recalculation fails
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error saving metadata:", error);
      res.status(500).json({ error: "Failed to save metadata" });
    }
  });

  // Manual recalculation endpoint for testing
  app.post("/api/recalculate-scores", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      await recalculateAllUseCaseScores(metadata?.scoringModel);
      res.json({ success: true, message: "All use case scores recalculated successfully" });
    } catch (error) {
      console.error("Error during manual recalculation:", error);
      res.status(500).json({ error: "Failed to recalculate scores" });
    }
  });

  // Individual metadata item endpoints for LEGO component CRUD operations
  // NOTE: Specific routes must come BEFORE generic parameterized routes
  app.post("/api/metadata/migrate-tshirt-sizing", async (req, res) => {
    try {
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }

      // Import comprehensive T-shirt sizing configuration
      const { getDefaultTShirtSizingConfig } = await import("@shared/calculations");
      const comprehensiveConfig = getDefaultTShirtSizingConfig();

      // Update metadata with comprehensive T-shirt sizing configuration
      const updatedMetadata = {
        ...currentMetadata,
        tShirtSizing: comprehensiveConfig
      };

      const result = await storage.updateMetadataConfig(updatedMetadata);
      
      res.json({
        success: true,
        message: "T-shirt sizing configuration successfully migrated to comprehensive 22-rule system",
        rulesCount: comprehensiveConfig.mappingRules.length,
        benefitMultipliers: comprehensiveConfig.benefitMultipliers
      });
    } catch (error) {
      console.error("Failed to migrate T-shirt sizing configuration:", error);
      res.status(500).json({ 
        error: "Failed to migrate T-shirt sizing configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/metadata/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const { item } = req.body;
      
      if (!item || typeof item !== 'string') {
        return res.status(400).json({ error: "Item is required and must be a string" });
      }
      
      const updated = await storage.addMetadataItem(category, item.trim());
      res.json(updated);
    } catch (error) {
      console.error("Error adding metadata item:", error);
      res.status(500).json({ error: "Failed to add metadata item" });
    }
  });

  app.delete("/api/metadata/:category/:item", async (req, res) => {
    try {
      const { category, item } = req.params;
      const decodedItem = decodeURIComponent(item);
      
      const updated = await storage.removeMetadataItem(category, decodedItem);
      res.json(updated);
    } catch (error) {
      console.error("Error removing metadata item:", error);
      res.status(500).json({ error: "Failed to remove metadata item" });
    }
  });

  // PUT /api/metadata/:category/reorder - Update custom sort order for metadata category
  // NOTE: This route must come BEFORE the generic /:category/:oldItem route to avoid conflicts
  app.put("/api/metadata/:category/reorder", async (req, res) => {
    try {
      const { category } = req.params;
      const { orderedItems } = req.body;
      
      // Validation
      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({ error: "orderedItems must be an array" });
      }

      // Validate category is reorderable
      const reorderableCategories = [
        'activities', 'processes', 'linesOfBusiness', 'businessSegments', 
        'geographies', 'useCaseTypes', 'valueChainComponents', 'sourceTypes',
        'useCaseStatuses', 'aiMlTechnologies', 'dataSources', 'stakeholderGroups', 
        'quadrants'
      ];
      
      if (!reorderableCategories.includes(category)) {
        return res.status(400).json({ error: `Category ${category} does not support reordering` });
      }
      
      const updated = await storage.updateMetadataSortOrder(category, orderedItems);
      res.json(updated);
    } catch (error) {
      console.error("Error updating sort order:", error);
      res.status(500).json({ error: "Failed to update sort order" });
    }
  });

  // PUT /api/metadata/process-activities/:processName/reorder - Update activity sort order for specific process
  app.put("/api/metadata/process-activities/:processName/reorder", async (req, res) => {
    try {
      const { processName } = req.params;
      const { orderedActivities } = req.body;
      
      // Validation
      if (!Array.isArray(orderedActivities)) {
        return res.status(400).json({ error: "orderedActivities must be an array" });
      }
      
      if (!processName || processName.trim() === '') {
        return res.status(400).json({ error: "Process name is required" });
      }
      
      const decodedProcessName = decodeURIComponent(processName);
      const updated = await storage.updateProcessActivitySortOrder(decodedProcessName, orderedActivities);
      res.json(updated);
    } catch (error) {
      console.error("Error updating process activity sort order:", error);
      res.status(500).json({ error: "Failed to update process activity sort order" });
    }
  });

  // PUT /api/metadata/:category/:oldItem - Edit metadata item in place
  app.put("/api/metadata/:category/:oldItem", async (req, res) => {
    try {
      const { category, oldItem } = req.params;
      const { newItem } = req.body;
      
      if (!newItem || newItem.trim() === '') {
        return res.status(400).json({ error: "New item value is required" });
      }

      const decodedOldItem = decodeURIComponent(oldItem);
      const updated = await storage.editMetadataItem(category, decodedOldItem, newItem.trim());
      res.json(updated);
    } catch (error) {
      console.error("Error editing metadata item:", error);
      res.status(500).json({ error: "Failed to edit metadata item" });
    }
  });

  // TOM (Target Operating Model) Configuration Routes
  
  // Get available clients for TOM configuration
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

  // Phase management endpoints
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

  // Backfill endpoint - sync DEFAULT_TOM_CONFIG presets/profiles to database
  app.post("/api/tom/sync-defaults", async (req, res) => {
    try {
      const clientId = (req.query.clientId as string) || 'default';
      const currentMetadata = await storage.getMetadataConfigById(clientId);
      
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { ensureTomConfig, DEFAULT_TOM_CONFIG } = await import("@shared/tom");
      const currentTom = ensureTomConfig(currentMetadata.tomConfig);
      
      // Merge presets from DEFAULT_TOM_CONFIG (add missing, preserve existing)
      const mergedPresets = {
        ...DEFAULT_TOM_CONFIG.presets,
        ...currentTom.presets
      };
      
      // Merge presetProfiles from DEFAULT_TOM_CONFIG (add missing, preserve existing)
      const mergedProfiles = {
        ...DEFAULT_TOM_CONFIG.presetProfiles,
        ...currentTom.presetProfiles
      };
      
      // Merge governance bodies (add missing based on id)
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
      
      // Get preset-specific phases or default phases
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
      const metadata = await storage.getMetadataConfigById(clientId);
      const { ensureTomConfig, calculatePhaseSummary, mergePresetProfile } = await import("@shared/tom");
      const tomConfig = mergePresetProfile(ensureTomConfig(metadata?.tomConfig));
      
      if (tomConfig.enabled !== 'true') {
        return res.json({ enabled: false, summary: {} });
      }
      
      const useCases = await storage.getAllUseCases();
      const summary = calculatePhaseSummary(
        useCases.map(uc => ({
          useCaseStatus: uc.useCaseStatus,
          deploymentStatus: uc.deploymentStatus,
          tomPhaseOverride: uc.tomPhaseOverride
        })),
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
        }))
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

  // =============================================================================
  // VALUE REALIZATION API ENDPOINTS
  // =============================================================================

  app.get("/api/value/config", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      if (!metadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      // Return config or default if not set
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      const config = metadata.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      res.json(config);
    } catch (error) {
      console.error("Error fetching value config:", error);
      res.status(500).json({ error: "Failed to fetch value configuration" });
    }
  });

  app.put("/api/value/config", async (req, res) => {
    try {
      const maturityConditionSchema = z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      });
      
      const maturityRuleSchema = z.object({
        level: z.enum(['advanced', 'developing', 'foundational']),
        conditions: z.record(maturityConditionSchema),
        range: z.object({
          min: z.number(),
          max: z.number(),
        }),
        confidence: z.enum(['high', 'medium', 'low']),
      });
      
      const industryBenchmarkSchema = z.object({
        baselineValue: z.number(),
        baselineUnit: z.string(),
        baselineSource: z.string(),
        improvementRange: z.object({ min: z.number(), max: z.number() }),
        improvementUnit: z.string(),
        typicalTimeline: z.string(),
        maturityTiers: z.object({
          foundational: z.object({ min: z.number(), max: z.number() }),
          developing: z.object({ min: z.number(), max: z.number() }),
          advanced: z.object({ min: z.number(), max: z.number() }),
        }),
      });

      const kpiDefinitionSchema = z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        unit: z.string(),
        direction: z.enum(['increase', 'decrease']),
        applicableProcesses: z.array(z.string()),
        industryBenchmarks: z.record(industryBenchmarkSchema).optional(),
        maturityRules: z.array(maturityRuleSchema),
      });
      
      const configSchema = z.object({
        enabled: z.string().optional(),
        kpiLibrary: z.record(kpiDefinitionSchema).optional(),
        calculationConfig: z.object({
          roiFormula: z.string(),
          breakevenFormula: z.string(),
          defaultCurrency: z.string(),
          fiscalYearStart: z.number(),
        }).optional(),
      });
      
      const parseResult = configSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid configuration format", details: parseResult.error.errors });
      }
      
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      const existingConfig = currentMetadata.valueRealizationConfig || DEFAULT_VALUE_REALIZATION_CONFIG;
      
      const mergedConfig = {
        enabled: parseResult.data.enabled ?? existingConfig.enabled,
        kpiLibrary: parseResult.data.kpiLibrary ?? existingConfig.kpiLibrary,
        calculationConfig: parseResult.data.calculationConfig ?? existingConfig.calculationConfig,
      };
      
      const updatedMetadata = {
        ...currentMetadata,
        valueRealizationConfig: mergedConfig
      };
      
      const result = await storage.updateMetadataConfig(updatedMetadata);
      res.json(result?.valueRealizationConfig);
    } catch (error) {
      console.error("Error updating value config:", error);
      res.status(500).json({ error: "Failed to update value configuration" });
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
      const useCases = await storage.getAllUseCases();
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
      
      const summary = aggregatePortfolioValue(useCasesWithPhases);
      res.json(summary);
    } catch (error) {
      console.error("Error calculating portfolio summary:", error);
      res.status(500).json({ error: "Failed to calculate portfolio summary" });
    }
  });

  app.post("/api/value/seed-default", async (req, res) => {
    try {
      const { DEFAULT_VALUE_REALIZATION_CONFIG } = await import("@shared/valueRealization");
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      const updatedMetadata = {
        ...currentMetadata,
        valueRealizationConfig: DEFAULT_VALUE_REALIZATION_CONFIG
      };
      const result = await storage.updateMetadataConfig(updatedMetadata);
      res.json({ 
        success: true, 
        message: "Default Value Realization configuration seeded successfully",
        valueRealizationConfig: result?.valueRealizationConfig 
      });
    } catch (error) {
      console.error("Error seeding Value config:", error);
      res.status(500).json({ error: "Failed to seed Value Realization configuration" });
    }
  });

  // POST /api/value/sync-processes - Sync KPI library processes with metadata.processes (SSOT)
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
          applicableProcesses: validProcesses.length > 0 ? validProcesses : canonicalProcesses // fallback to all if none match
        };
        
        if (removedProcesses.length > 0) {
          syncReport.push({ kpiId, removed: removedProcesses, kept: validProcesses });
        }
      }
      
      const updatedMetadata = {
        ...currentMetadata,
        valueRealizationConfig: {
          ...currentMetadata.valueRealizationConfig,
          enabled: currentMetadata.valueRealizationConfig?.enabled || 'true',
          kpiLibrary: syncedKpiLibrary
        }
      };
      
      await storage.updateMetadataConfig(updatedMetadata as any);
      
      res.json({
        success: true,
        message: `Synced KPI library with ${canonicalProcesses.length} canonical processes`,
        canonicalProcesses,
        syncReport
      });
    } catch (error) {
      console.error("Error syncing KPI processes:", error);
      res.status(500).json({ error: "Failed to sync KPI processes" });
    }
  });

  // GET /api/derivation/formulas - Get all derivation formulas for Admin transparency
  app.get("/api/derivation/formulas", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      
      // Always try to return DB-stored formulas first, enriched with live TOM config
      if ((metadata as any)?.derivationFormulas) {
        const formulas = (metadata as any).derivationFormulas;
        // Enrich with live TOM config
        formulas.tom = {
          enabled: metadata?.tomConfig?.enabled,
          activePreset: metadata?.tomConfig?.activePreset,
          phases: Object.keys(metadata?.tomConfig?.phases || {})
        };
        res.json(formulas);
        return;
      }
      
      // Fallback: build from existing configs (indicates DB needs seeding)
      const derivationFormulas = {
        _note: 'Built from config - run POST /api/derivation/seed to persist',
        scoring: {
          impactScore: {
            formula: 'Weighted average of Business Value levers',
            description: 'Sum of (lever_score × lever_weight) / 100',
            levers: Object.keys(metadata?.scoringModel?.weights?.impact || {}),
            weights: metadata?.scoringModel?.weights?.impact
          },
          effortScore: {
            formula: 'Weighted average of Feasibility levers',
            description: 'Sum of (lever_score × lever_weight) / 100',
            levers: Object.keys(metadata?.scoringModel?.weights?.effort || {}),
            weights: metadata?.scoringModel?.weights?.effort
          },
          quadrant: {
            formula: 'Impact vs Effort threshold comparison',
            threshold: metadata?.scoringModel?.quadrantThresholds || { impactMidpoint: 3.0, effortMidpoint: 3.0 }
          }
        },
        valueRealization: metadata?.valueRealizationConfig?.calculationConfig || {},
        capability: metadata?.capabilityTransitionConfig?.benchmarkConfig || {},
        tom: {
          enabled: metadata?.tomConfig?.enabled,
          activePreset: metadata?.tomConfig?.activePreset,
          phases: Object.keys(metadata?.tomConfig?.phases || {})
        }
      };
      
      res.json(derivationFormulas);
    } catch (error) {
      console.error("Error fetching derivation formulas:", error);
      res.status(500).json({ error: "Failed to fetch derivation formulas" });
    }
  });

  // POST /api/derivation/seed - Persist derivation formulas to database (SSOT)
  app.post("/api/derivation/seed", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      if (!metadata) {
        return res.status(404).json({ error: "Metadata not found" });
      }
      
      // Build comprehensive derivation formulas from all configs
      const derivationFormulas = {
        scoring: {
          impactScore: {
            formula: 'Weighted average of Business Value levers',
            description: 'Sum of (lever_score × lever_weight) / 100 for all impact levers',
            levers: ['revenueImpact', 'costSavings', 'riskReduction', 'brokerPartnerExperience', 'strategicFit'],
            example: '(3×20 + 4×20 + 3×20 + 2×20 + 4×20) / 100 = 3.2'
          },
          effortScore: {
            formula: 'Weighted average of Feasibility levers (inverted)',
            description: 'Sum of ((6 - lever_score) × lever_weight) / 100 for complexity-based effort',
            levers: ['dataReadiness', 'technicalComplexity', 'changeImpact', 'modelRisk', 'adoptionReadiness'],
            example: 'Higher scores mean MORE ready, so we invert for effort calculation'
          },
          quadrant: {
            formula: 'Compare Impact vs Effort against threshold',
            description: 'Impact >= threshold AND Effort <= threshold → Quick Win; Impact >= threshold AND Effort > threshold → Strategic Bet; etc.',
            thresholdDefault: metadata?.scoringModel?.quadrantThresholds?.impactMidpoint || 3.0
          }
        },
        valueRealization: {
          kpiMatching: {
            formula: 'Match use case processes to KPI applicableProcesses',
            description: 'For each process in use case, find KPIs where applicableProcesses includes that process (with fuzzy matching)'
          },
          maturityLevel: {
            formula: 'Evaluate maturity rules based on scores',
            description: 'Check dataReadiness, technicalComplexity, adoptionReadiness against conditions to determine foundational/developing/advanced'
          },
          roi: {
            formula: metadata?.valueRealizationConfig?.calculationConfig?.roiFormula || '((cumulativeValue - totalInvestment) / totalInvestment) × 100',
            description: 'Return on Investment as a percentage'
          },
          breakeven: {
            formula: metadata?.valueRealizationConfig?.calculationConfig?.breakevenFormula || 'totalInvestment / monthlyValue',
            description: 'Number of months until investment is recovered'
          }
        },
        tomPhase: {
          formula: 'Map useCaseStatus + deploymentStatus to lifecycle phase',
          description: 'Discovery/Backlog → Ideation; In-flight → Assessment/Foundation/Build based on deployment; Implemented → Scale/Operate',
          overrideField: 'tomPhaseOverride takes precedence if set'
        },
        capability: {
          baseFte: {
            formula: 'tShirtBaseFte[size]',
            description: 'XS=2, S=3, M=5, L=8, XL=12 base FTE',
            values: metadata?.capabilityTransitionConfig?.benchmarkConfig?.tShirtBaseFte || { XS: 2, S: 3, M: 5, L: 8, XL: 12 }
          },
          transitionSpeed: {
            formula: 'baseMonths × paceModifier[quadrant]',
            description: 'Quick Win=0.7x, Strategic Bet=1.0x, Experimental=1.2x, Watchlist=1.5x',
            values: metadata?.capabilityTransitionConfig?.benchmarkConfig?.paceModifiers || {}
          },
          independence: {
            formula: 'archetype.independenceRange based on TOM phase',
            description: 'Foundation phases: 0-25%; Strategic: 25-50%; Transition: 50-85%; Steady State: 85-100%',
            archetypes: metadata?.capabilityTransitionConfig?.benchmarkConfig?.archetypes || {}
          }
        },
        lastUpdated: new Date().toISOString()
      };
      
      const updatedMetadata = {
        ...metadata,
        derivationFormulas
      };
      
      await storage.updateMetadataConfig(updatedMetadata as any);
      
      res.json({
        success: true,
        message: 'Derivation formulas persisted to database',
        derivationFormulas
      });
    } catch (error) {
      console.error("Error seeding derivation formulas:", error);
      res.status(500).json({ error: "Failed to seed derivation formulas" });
    }
  });

  // POST /api/use-cases/:id/derive-value - Re-derive value realization for a specific use case
  app.post("/api/use-cases/:id/derive-value", async (req, res) => {
    try {
      const id = req.params.id;
      const allUseCases = await storage.getAllUseCases();
      const useCase = allUseCases.find(uc => uc.id === id);
      
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      const processes = (useCase.processes as string[]) || [];
      if (processes.length === 0) {
        return res.status(400).json({ error: "Use case has no processes - value realization requires at least one process" });
      }
      
      const { deriveValueEstimates, calculateTotalEstimatedValue } = await import("@shared/valueRealization");
      const metadata = await storage.getMetadataConfig();
      const kpiLibrary = metadata?.valueRealizationConfig?.kpiLibrary || {};
      
      const scores = {
        dataReadiness: (useCase.dataReadiness as number) || 3,
        technicalComplexity: (useCase.technicalComplexity as number) || 3,
        adoptionReadiness: (useCase.adoptionReadiness as number) || 3
      };
      
      const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
      const totalValue = calculateTotalEstimatedValue(valueEstimates);
      
      const derivedValueRealization = {
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
      
      await storage.updateUseCase(id, { valueRealization: derivedValueRealization });
      
      res.json({
        success: true,
        useCaseId: id,
        processesMatched: processes,
        kpisFound: valueEstimates.length,
        valueRealization: derivedValueRealization
      });
    } catch (error) {
      console.error("Error deriving value realization:", error);
      res.status(500).json({ error: "Failed to derive value realization" });
    }
  });

  // POST /api/derive/value-all - Bulk re-derive value realization for all use cases with processes
  app.post("/api/derive/value-all", async (req, res) => {
    try {
      const { deriveValueEstimates, calculateTotalEstimatedValue } = await import("@shared/valueRealization");
      const metadata = await storage.getMetadataConfig();
      const kpiLibrary = metadata?.valueRealizationConfig?.kpiLibrary || {};
      
      const allUseCases = await storage.getAllUseCases();
      const updated: string[] = [];
      const skipped: string[] = [];
      
      for (const useCase of allUseCases) {
        const processes = (useCase.processes as string[]) || [];
        if (processes.length === 0) {
          skipped.push(useCase.id);
          continue;
        }
        
        const scores = {
          dataReadiness: (useCase.dataReadiness as number) || 3,
          technicalComplexity: (useCase.technicalComplexity as number) || 3,
          adoptionReadiness: (useCase.adoptionReadiness as number) || 3
        };
        
        const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary);
        const totalValue = calculateTotalEstimatedValue(valueEstimates);
        
        const derivedValueRealization = {
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
        
        await storage.updateUseCase(useCase.id, { valueRealization: derivedValueRealization });
        updated.push(useCase.id);
      }
      
      res.json({
        success: true,
        updated: updated.length,
        skipped: skipped.length,
        message: `Re-derived value realization for ${updated.length} use cases (${skipped.length} skipped - no processes)`
      });
    } catch (error) {
      console.error("Error bulk deriving value realization:", error);
      res.status(500).json({ error: "Failed to bulk derive value realization" });
    }
  });

  // PUT /api/use-cases/:id/value - Update value realization data for a use case
  app.put("/api/use-cases/:id/value", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "Invalid use case ID" });
      }
      
      const allUseCases = await storage.getAllUseCases();
      const useCase = allUseCases.find(uc => uc.id === id);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      const { investment, selectedKpis, kpiValues } = req.body;
      
      // Import value realization utilities
      const { 
        deriveValueEstimates, 
        calculateTotalEstimatedValue, 
        calculateRoi, 
        calculateBreakevenMonth,
        DEFAULT_VALUE_REALIZATION_CONFIG 
      } = await import("@shared/valueRealization");
      
      const kpiLibrary = DEFAULT_VALUE_REALIZATION_CONFIG.kpiLibrary;
      const processes = (useCase.processes as string[]) || [];
      const scores = {
        dataReadiness: useCase.dataReadiness,
        technicalComplexity: useCase.technicalComplexity,
        adoptionReadiness: useCase.adoptionReadiness,
        changeImpact: useCase.changeImpact,
        modelRisk: useCase.modelRisk
      };
      
      // Calculate value estimates based on selected KPIs
      const valueEstimates = deriveValueEstimates(processes, scores, kpiLibrary, 1000);
      const selectedEstimates = valueEstimates.filter(e => selectedKpis?.includes(e.kpiId));
      const totalValue = calculateTotalEstimatedValue(selectedEstimates);
      
      // Calculate annual value (use midpoint of range)
      const estimatedAnnualValue = (totalValue.min + totalValue.max) / 2;
      
      // Calculate investment (initial + 12 months ongoing)
      const totalInvestment = (investment?.initialInvestment || 0) + ((investment?.ongoingMonthlyCost || 0) * 12);
      
      // Calculate ROI and breakeven
      const currentRoi = calculateRoi(estimatedAnnualValue, totalInvestment);
      const monthlyValue = estimatedAnnualValue / 12;
      const projectedBreakevenMonth = calculateBreakevenMonth(totalInvestment, monthlyValue);
      
      // Build the value realization object
      const existingValueRealization = (useCase.valueRealization as any) || {};
      const updatedValueRealization = {
        ...existingValueRealization,
        selectedKpis: selectedKpis || [],
        kpiValues: kpiValues || existingValueRealization.kpiValues || {},
        investment: {
          initialInvestment: investment?.initialInvestment || 0,
          ongoingMonthlyCost: investment?.ongoingMonthlyCost || 0,
          currency: investment?.currency || 'GBP'
        },
        tracking: existingValueRealization.tracking || { entries: [] },
        calculatedMetrics: {
          currentRoi,
          projectedBreakevenMonth,
          cumulativeValueGbp: estimatedAnnualValue,
          lastCalculated: new Date().toISOString()
        }
      };
      
      // Update the use case
      const result = await storage.updateUseCase(id, {
        valueRealization: updatedValueRealization
      });
      
      res.json({
        success: true,
        useCase: result,
        calculatedMetrics: updatedValueRealization.calculatedMetrics,
        estimatedValue: { min: totalValue.min, max: totalValue.max }
      });
    } catch (error) {
      console.error("Error updating use case value:", error);
      res.status(500).json({ error: "Failed to update use case value data" });
    }
  });


  // =============================================================================
  // CAPABILITY TRANSITION API ENDPOINTS ("Teach Us to Fish")
  // =============================================================================

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
      
      // Auto-calculate independence if staffing data provided
      if (capabilityTransition.staffing?.current) {
        const calculatedIndependence = calculateIndependenceFromStaffing(capabilityTransition.staffing.current);
        capabilityTransition.independencePercentage = calculatedIndependence;
        
        // Add to history if percentage changed
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
      const useCases = await storage.getAllUseCases();
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
      const useCases = await storage.getAllUseCases();
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

  // Comprehensive bulk derivation for all use cases - TOM, Value, and Capability
  app.post("/api/derive/all", async (req, res) => {
    try {
      const { 
        overwriteValue = false, 
        overwriteCapability = false 
      } = req.body;
      
      const useCases = await storage.getAllUseCases();
      const metadata = await storage.getMetadataConfig();
      const configs = getDefaultConfigs(metadata);
      
      const results = {
        total: useCases.length,
        tomDerived: 0,
        valueDerived: 0,
        capabilityDerived: 0,
        errors: [] as string[]
      };
      
      for (const useCase of useCases) {
        try {
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
            overwriteCapability
          });
          
          // Set phaseEnteredAt if TOM phase derived and not already set
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

  // Bulk derive capability defaults from use case attributes
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

  // Derive capability defaults for a single use case
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

  // Section progress tracking is handled by the blob storage system via questionnaire routes

  // Register questionnaire routes (blob storage based)
  const questionnaireRoutes = (await import('./routes/questionnaireHybrid.routes')).default;
  app.use('/api/questionnaire', questionnaireRoutes);

  // Import questionnaire service for response creation is already done at top

  // GET /api/responses/user-sessions - Get all user sessions across questionnaires with progress
  app.get('/api/responses/user-sessions', async (req, res) => {
    // Disable caching for dynamic session data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const userEmail = 'antonm1@hexaware.com'; // TODO: Get from session/auth
      
      // Get all questionnaire definitions
      const definitions = await questionnaireServiceInstance.getAllDefinitions();
      
      // Get all sessions for this user from database
      const userSessions = await db.select()
        .from(responseSessions)
        .where(eq(responseSessions.respondentEmail, userEmail))
        .orderBy(desc(responseSessions.lastUpdatedAt));
      
      
      if (userSessions.length === 0) {
        // Check what emails are in the database
        const allEmails = await db.select({
          email: responseSessions.respondentEmail
        }).from(responseSessions).limit(10);
      }
      
      // Create a map of the MOST RECENT session by questionnaire ID (first in array = most recent due to ORDER BY)
      const existingSessionsMap = new Map();
      userSessions.forEach(session => {
        // Only set if we haven't seen this questionnaire yet (so we keep the most recent one)
        if (!existingSessionsMap.has(session.questionnaireId)) {
          existingSessionsMap.set(session.questionnaireId, session);
        }
      });
      
      // Build sessions with progress for all available questionnaires
      const sessionsWithProgress = definitions.map(definition => {
        const existingSession = existingSessionsMap.get(definition.id);
        
        let status: string;
        let progressPercent = 0;
        
        if (existingSession?.completedAt) {
          status = 'completed';
          progressPercent = 100;
        } else if (existingSession && existingSession.answeredQuestions > 0) {
          progressPercent = existingSession.progressPercent || 0;
          status = `${progressPercent}%`;
        } else {
          status = 'not started';
          progressPercent = 0;
        }
        
        return {
          id: existingSession?.id || null, // No more fake IDs!
          questionnaireId: definition.id,
          title: definition.title,
          status,
          progressPercent,
          completedAt: existingSession?.completedAt || null,
          updatedAt: existingSession?.lastUpdatedAt || new Date(),
          isCompleted: !!existingSession?.completedAt,
          session: existingSession || null // Explicit session field
        };
      });
      
      res.json(sessionsWithProgress);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ error: 'Failed to fetch user sessions' });
    }
  });

  // GET /api/responses/check-session - Check for existing session
  app.get('/api/responses/check-session', async (req, res) => {
    // Disable caching for dynamic session data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const { questionnaireId } = req.query;
      
      if (!questionnaireId) {
        return res.status(400).json({ error: 'Missing questionnaireId parameter' });
      }

      // Get the most recent response session for this questionnaire
      const session = await questionnaireService.getMostRecentSession(questionnaireId as string);
      
      if (!session) {
        return res.status(404).json({ error: 'No session found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error checking session:', error);
      res.status(500).json({ error: 'Failed to check session' });
    }
  });

  // POST /api/responses/start - Create new response session or return existing
  app.post('/api/responses/start', async (req, res) => {
    try {
      const { questionnaireId, respondentEmail, respondentName, metadata } = req.body;
      
      if (!questionnaireId || !respondentEmail) {
        return res.status(400).json({ 
          error: 'Missing required fields: questionnaireId and respondentEmail are required' 
        });
      }

      // Start new response session or get existing
      const sessionId = await questionnaireServiceInstance.startResponseSession(
        questionnaireId, 
        respondentEmail, 
        respondentName
      );

      res.json({ 
        success: true, 
        responseId: sessionId,
        message: 'Assessment session started successfully'
      });
    } catch (error) {
      console.error('Error starting response session:', error);
      
      // Handle completed session case
      if (error instanceof Error && error.message && error.message.startsWith('COMPLETED_SESSION:')) {
        const completedSessionId = error.message.split(':')[1];
        return res.status(409).json({ 
          error: 'Assessment already completed',
          completedSessionId,
          message: 'You have already completed this assessment. Redirecting to results.'
        });
      }
      
      res.status(500).json({ error: 'Failed to start assessment session' });
    }
  });

  // PUT /api/responses/:id/answers - Save answers to response
  app.put('/api/responses/:id/answers', async (req, res) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      
      if (!answers) {
        return res.status(400).json({ 
          error: 'Missing answers data' 
        });
      }

      // Save answers using questionnaire service (Survey.js format)
      await questionnaireServiceInstance.saveResponseAnswers(id, answers);

      res.json({ 
        success: true, 
        message: 'Answers saved successfully'
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      res.status(500).json({ error: 'Failed to save answers' });
    }
  });

  // GET /api/responses/:id - Get response with answers
  app.get('/api/responses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get response data using questionnaire service
      const response = await questionnaireService.getResponse(id);
      
      if (!response) {
        return res.status(404).json({ error: 'Response not found' });
      }

      res.json(response);
    } catch (error) {
      console.error('Error getting response:', error);
      res.status(500).json({ error: 'Failed to get response' });
    }
  });
  
  // GET /api/survey-config/:id - Get Survey.js configuration (direct from questionnaire service)
  app.get('/api/survey-config/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const config = await questionnaireService.getQuestionnaireDefinition(id);
      
      if (!config) {
        return res.status(404).json({ error: 'Survey configuration not found' });
      }
      
      res.json(config);
    } catch (error) {
      console.error('Error loading survey config:', error);
      res.status(500).json({ error: 'Failed to load survey configuration' });
    }
  });

  // GET /api/responses/:id/scores - Get basic progress information for response
  app.get('/api/responses/:id/scores', async (req, res) => {
    try {
      const { id } = req.params;
      
      const session = await questionnaireService.getSession(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      // Return database values including completion date
      const scores = {
        answerCount: session.answeredQuestions ?? 0,
        completedAt: session.completedAt
      };

      res.json(scores);
    } catch (error) {
      console.error('Error getting response scores:', error);
      res.status(500).json({ error: 'Failed to get response scores' });
    }
  });

  // POST /api/responses/:id/complete - Mark response as completed
  app.post('/api/responses/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      
      const completedResponse = await questionnaireService.completeResponse(id);
      
      if (!completedResponse) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      res.json({ 
        id: completedResponse.id,
        status: completedResponse.status,
        completedAt: completedResponse.completedAt,
        success: true, 
        message: 'Assessment completed successfully'
      });
    } catch (error) {
      console.error('Error completing response:', error);
      res.status(500).json({ error: 'Failed to complete response' });
    }
  });

  // POST /api/responses/:id/reset - Reset response session
  app.post('/api/responses/:id/reset', async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await questionnaireService.resetResponseSession(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Response session not found' });
      }

      res.json({ 
        success: true, 
        message: 'Response session reset successfully'
      });
    } catch (error) {
      console.error('Error resetting response session:', error);
      res.status(500).json({ error: 'Failed to reset response session' });
    }
  });

  // Register export routes
  app.use('/api/export', exportRoutes);
  app.use('/api/import', importRoutes);
  
  // Register recommendation routes
  app.use('/api/recommendations', recommendationRoutes);
  
  // Register presentation routes
  app.use('/api/presentations', presentationRoutes);

  // Presentation file proxy endpoint - handles local file storage and iframe embedding
  app.get('/api/presentations/proxy/:encodedUrl(*)', async (req, res) => {
    try {
      const { encodedUrl } = req.params;
      const url = decodeURIComponent(encodedUrl);
      
      console.log(`📄 Proxying file - encoded: ${encodedUrl}`);
      console.log(`📄 Proxying file - decoded: ${url}`);
      
      // Check if this is a database file URL
      if (url.startsWith('/api/presentations/files/')) {
        // Extract file ID from the database URL
        const fileId = url.replace('/api/presentations/files/', '');
        console.log(`📄 Local file request: ${fileId}`);
        
        // Forward to local file service
        const { localFileService } = await import('./services/localFileService');
        const fileData = await localFileService.getFileFromLocal(fileId);
        
        if (!fileData) {
          console.error(`Local file not found: ${fileId}`);
          return res.status(404).json({ error: 'File not found' });
        }
        
        console.log(`📄 Serving local file via proxy: ${fileData.mimeType}, size: ${fileData.fileSize}`);
        
        // Set headers specifically for iframe embedding with maximum permissiveness
        res.set({
          'Content-Type': fileData.mimeType || 'application/octet-stream',
          'Content-Length': fileData.fileSize.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Content-Disposition': 'inline',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Cross-Origin-Embedder-Policy': 'unsafe-none'
          // No X-Frame-Options or CSP frame-ancestors to allow iframe embedding from any origin
        });
        
        // Send the file buffer
        return res.send(fileData.buffer);
      }
      
      // Only local files are supported now
      return res.status(400).json({ error: 'Invalid file URL - only database file URLs are supported' });
      
    } catch (error) {
      console.error('Error proxying file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve file', details: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });

  // Add saved progress endpoints
  app.get('/api/saved-progress', async (req, res) => {
    try {
      const savedProgress = await storage.getSavedAssessmentProgress();
      res.json(savedProgress);
    } catch (error) {
      console.error('Error getting saved progress:', error);
      res.status(500).json({ error: 'Failed to get saved progress' });
    }
  });

  app.delete('/api/saved-progress/:responseId', async (req, res) => {
    try {
      const { responseId } = req.params;
      await storage.deleteSavedAssessmentProgress(responseId);
      res.json({ success: true, message: 'Saved progress deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved progress:', error);
      res.status(500).json({ error: 'Failed to delete saved progress' });
    }
  });

  // T-shirt Sizing Feedback API endpoint
  app.post('/api/feedback', async (req, res) => {
    try {
      const { 
        useCaseId, 
        useCaseTitle, 
        currentTShirtSize, 
        currentCostRange, 
        currentTimeline, 
        feedback, 
        suggestedSize, 
        userEmail,
        timestamp = new Date().toISOString()
      } = req.body;

      // Validate required fields
      if (!useCaseId || !feedback) {
        return res.status(400).json({ 
          error: 'Use case ID and feedback are required' 
        });
      }

      // Log feedback for analysis (in production, store in database)
      const feedbackData = {
        useCaseId,
        useCaseTitle: useCaseTitle || 'Unknown',
        currentTShirtSize: currentTShirtSize || 'Unknown',
        currentCostRange: currentCostRange || 'Unknown',
        currentTimeline: currentTimeline || 'Unknown',
        feedback: feedback.trim(),
        suggestedSize: suggestedSize || null,
        userEmail: userEmail || 'anonymous',
        timestamp,
        source: 'tshirt_sizing_preview'
      };

      // In production, this would be stored in a database table
      console.log('T-shirt Sizing Feedback Received:', JSON.stringify(feedbackData, null, 2));
      
      // Return success response
      res.status(201).json({ 
        message: 'Feedback received successfully',
        feedbackId: `feedback_${Date.now()}`,
        status: 'recorded'
      });

    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ 
        error: 'Failed to submit feedback',
        message: 'Please try again later'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
