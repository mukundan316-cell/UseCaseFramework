import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUseCaseSchema } from "@shared/schema";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from "@shared/calculations";
import { mapUseCaseToFrontend } from "@shared/mappers";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use Case routes
  app.get("/api/use-cases", async (req, res) => {
    try {
      const useCases = await storage.getAllUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error fetching use cases:", error);
      res.status(500).json({ error: "Failed to fetch use cases" });
    }
  });

  app.post("/api/use-cases", async (req, res) => {
    try {
      const validatedData = insertUseCaseSchema.parse(req.body);
      
      // Calculate scores
      const impactScore = calculateImpactScore(
        validatedData.revenueImpact,
        validatedData.costSavings,
        validatedData.riskReduction,
        validatedData.brokerPartnerExperience,
        validatedData.strategicFit
      );
      
      const effortScore = calculateEffortScore(
        validatedData.dataReadiness,
        validatedData.technicalComplexity,
        validatedData.changeImpact,
        validatedData.modelRisk,
        validatedData.adoptionReadiness
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore);
      
      const useCaseWithScores = {
        ...validatedData,
        linesOfBusiness: validatedData.linesOfBusiness || [validatedData.lineOfBusiness].filter(Boolean),
        // Handle multi-select arrays with backward compatibility
        processes: validatedData.processes || (validatedData.process ? [validatedData.process] : undefined),
        activities: validatedData.activities || (validatedData.activity ? [validatedData.activity] : undefined),
        businessSegments: validatedData.businessSegments || (validatedData.businessSegment ? [validatedData.businessSegment] : undefined),
        geographies: validatedData.geographies || (validatedData.geography ? [validatedData.geography] : undefined),
        impactScore,
        effortScore,
        quadrant
      };
      
      const newUseCase = await storage.createUseCase(useCaseWithScores);
      res.status(201).json(mapUseCaseToFrontend(newUseCase));
    } catch (error) {
      console.error("Error creating use case:", error);
      res.status(400).json({ error: "Failed to create use case" });
    }
  });

  app.put("/api/use-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertUseCaseSchema.partial().parse(req.body);
      
      // Handle multi-select arrays for updates
      if (validatedData.linesOfBusiness) {
        validatedData.linesOfBusiness = validatedData.linesOfBusiness.length > 0 ? validatedData.linesOfBusiness : [validatedData.lineOfBusiness].filter(Boolean) as string[];
      }
      if (validatedData.processes && validatedData.processes.length === 0) {
        validatedData.processes = validatedData.process ? [validatedData.process] : undefined;
      }
      if (validatedData.activities && validatedData.activities.length === 0) {
        validatedData.activities = validatedData.activity ? [validatedData.activity] : undefined;
      }
      if (validatedData.businessSegments && validatedData.businessSegments.length === 0) {
        validatedData.businessSegments = validatedData.businessSegment ? [validatedData.businessSegment] : undefined;
      }
      if (validatedData.geographies && validatedData.geographies.length === 0) {
        validatedData.geographies = validatedData.geography ? [validatedData.geography] : undefined;
      }

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
          validatedData.adoptionReadiness !== undefined) {
        
        // Get current use case to fill in missing values
        const currentUseCase = await storage.getAllUseCases().then(cases => 
          cases.find(c => c.id === id)
        );
        
        if (!currentUseCase) {
          return res.status(404).json({ error: "Use case not found" });
        }
        
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
          adoptionReadiness: validatedData.adoptionReadiness ?? currentUseCase.adoptionReadiness,
        };
        
        const impactScore = calculateImpactScore(
          completeData.revenueImpact,
          completeData.costSavings,
          completeData.riskReduction,
          completeData.brokerPartnerExperience,
          completeData.strategicFit
        );
        
        const effortScore = calculateEffortScore(
          completeData.dataReadiness,
          completeData.technicalComplexity,
          completeData.changeImpact,
          currentUseCase.modelRisk, // Include modelRisk for effort calculation
          completeData.adoptionReadiness
        );
        
        const quadrant = calculateQuadrant(impactScore, effortScore);
        
        updatesWithScores = {
          ...validatedData,
          linesOfBusiness: validatedData.linesOfBusiness || (validatedData.lineOfBusiness ? [validatedData.lineOfBusiness] : currentUseCase.linesOfBusiness),
          impactScore,
          effortScore,
          quadrant
        } as any; // Type assertion to handle calculated fields
      }
      
      const updatedUseCase = await storage.updateUseCase(id, updatesWithScores);
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
      res.json(updated);
    } catch (error) {
      console.error("Error saving metadata:", error);
      res.status(500).json({ error: "Failed to save metadata" });
    }
  });

  // Individual metadata item endpoints for LEGO component CRUD operations
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

  const httpServer = createServer(app);

  // Register questionnaire routes
  const questionnaireRoutes = (await import('./routes/questionnaire.routes')).default;
  app.use('/api', questionnaireRoutes);
  
  // Register assessment routes
  const assessmentRoutes = (await import('./routes/assessments.routes')).default;
  app.use('/api/assessments', assessmentRoutes);

  return httpServer;
}
