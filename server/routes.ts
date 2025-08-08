import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUseCaseSchema } from "@shared/schema";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from "@shared/calculations";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use Case routes
  app.get("/api/use-cases", async (req, res) => {
    try {
      const useCases = await storage.getAllUseCases();
      res.json(useCases);
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
        validatedData.strategicFit
      );
      
      const effortScore = calculateEffortScore(
        validatedData.dataReadiness,
        validatedData.technicalComplexity,
        validatedData.changeImpact,
        validatedData.adoptionReadiness
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore);
      
      const useCaseWithScores = {
        ...validatedData,
        impactScore,
        effortScore,
        quadrant
      };
      
      const newUseCase = await storage.createUseCase(useCaseWithScores);
      res.status(201).json(newUseCase);
    } catch (error) {
      console.error("Error creating use case:", error);
      res.status(400).json({ error: "Failed to create use case" });
    }
  });

  app.put("/api/use-cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertUseCaseSchema.partial().parse(req.body);
      
      const updatedUseCase = await storage.updateUseCase(id, validatedData);
      if (!updatedUseCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      
      res.json(updatedUseCase);
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

  const httpServer = createServer(app);

  return httpServer;
}
