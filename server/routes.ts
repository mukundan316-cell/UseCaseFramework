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
    const tomConfig = metadata?.tomConfig as TomConfig | undefined;
    
    if (!tomConfig || tomConfig.enabled !== 'true') {
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
      
      const updatedUseCase = await storage.updateUseCase(id, cleanUpdates);
      if (!updatedUseCase) {
        return res.status(404).json({ error: "Use case not found" });
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
  app.get("/api/tom/config", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_TOM_CONFIG } = await import("@shared/tom");
      const tomConfig = metadata?.tomConfig || DEFAULT_TOM_CONFIG;
      res.json(tomConfig);
    } catch (error) {
      console.error("Error fetching TOM config:", error);
      res.status(500).json({ error: "Failed to fetch TOM configuration" });
    }
  });

  app.put("/api/tom/config", async (req, res) => {
    try {
      const tomConfig = req.body;
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }
      const updatedMetadata = {
        ...currentMetadata,
        tomConfig
      };
      const result = await storage.updateMetadataConfig(updatedMetadata);
      res.json(result?.tomConfig || tomConfig);
    } catch (error) {
      console.error("Error updating TOM config:", error);
      res.status(500).json({ error: "Failed to update TOM configuration" });
    }
  });

  app.get("/api/tom/phase-summary", async (req, res) => {
    try {
      const metadata = await storage.getMetadataConfig();
      const { DEFAULT_TOM_CONFIG, calculatePhaseSummary } = await import("@shared/tom");
      const tomConfig = metadata?.tomConfig || DEFAULT_TOM_CONFIG;
      
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
