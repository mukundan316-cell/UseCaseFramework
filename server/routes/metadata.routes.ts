import type { Express } from "express";
import { storage } from "../storage";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from "@shared/calculations";
import { getImpactWeights, getEffortWeights } from "@shared/utils/weightUtils";

async function recalculateAllUseCaseScores(scoringModel: any) {
  const useCases = await storage.getAllUseCases();
  
  let parsedScoringModel = scoringModel;
  if (typeof scoringModel === 'string') {
    try {
      parsedScoringModel = JSON.parse(scoringModel);
    } catch (e) {
      console.error('Error parsing scoring model:', e);
      parsedScoringModel = scoringModel;
    }
  }
  
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

export function registerMetadataRoutes(app: Express): void {
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
      
      try {
        const currentMetadata = await storage.getMetadataConfig();
        await recalculateAllUseCaseScores(currentMetadata?.scoringModel || metadata.scoringModel);
      } catch (recalcError) {
        console.error('⚠️ Error recalculating scores after metadata update:', recalcError);
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error saving metadata:", error);
      res.status(500).json({ error: "Failed to save metadata" });
    }
  });

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

  app.post("/api/metadata/migrate-tshirt-sizing", async (req, res) => {
    try {
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        return res.status(404).json({ error: "Metadata configuration not found" });
      }

      const { getDefaultTShirtSizingConfig } = await import("@shared/calculations");
      const comprehensiveConfig = getDefaultTShirtSizingConfig();

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

  app.put("/api/metadata/:category/reorder", async (req, res) => {
    try {
      const { category } = req.params;
      const { orderedItems } = req.body;
      
      if (!Array.isArray(orderedItems)) {
        return res.status(400).json({ error: "orderedItems must be an array" });
      }

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

  app.put("/api/metadata/process-activities/:processName/reorder", async (req, res) => {
    try {
      const { processName } = req.params;
      const { orderedActivities } = req.body;
      
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
}
