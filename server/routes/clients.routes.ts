import type { Express } from "express";
import { storage } from "../storage";

export function registerClientRoutes(app: Express): void {
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  app.get("/api/engagements", async (req, res) => {
    try {
      const clientId = req.query.clientId as string;
      const engagements = clientId 
        ? await storage.getEngagementsByClient(clientId)
        : await storage.getAllEngagements();
      res.json(engagements);
    } catch (error) {
      console.error("Error fetching engagements:", error);
      res.status(500).json({ error: "Failed to fetch engagements" });
    }
  });

  app.get("/api/engagements/default", async (req, res) => {
    try {
      const engagement = await storage.getDefaultEngagement();
      res.json(engagement || null);
    } catch (error) {
      console.error("Error fetching default engagement:", error);
      res.status(500).json({ error: "Failed to fetch default engagement" });
    }
  });

  app.get("/api/engagements/:id", async (req, res) => {
    try {
      const engagement = await storage.getEngagement(req.params.id);
      if (!engagement) {
        return res.status(404).json({ error: "Engagement not found" });
      }
      res.json(engagement);
    } catch (error) {
      console.error("Error fetching engagement:", error);
      res.status(500).json({ error: "Failed to fetch engagement" });
    }
  });

  app.post("/api/engagements", async (req, res) => {
    try {
      const engagement = await storage.createEngagement(req.body);
      res.status(201).json(engagement);
    } catch (error) {
      console.error("Error creating engagement:", error);
      res.status(500).json({ error: "Failed to create engagement" });
    }
  });

  app.put("/api/engagements/:id", async (req, res) => {
    try {
      const engagement = await storage.updateEngagement(req.params.id, req.body);
      if (!engagement) {
        return res.status(404).json({ error: "Engagement not found" });
      }
      res.json(engagement);
    } catch (error: any) {
      console.error("Error updating engagement:", error);
      if (error.message?.includes('locked')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update engagement" });
    }
  });

  app.post("/api/engagements/:id/lock-tom", async (req, res) => {
    try {
      const engagement = await storage.lockEngagementTom(req.params.id);
      if (!engagement) {
        return res.status(404).json({ error: "Engagement not found" });
      }
      res.json(engagement);
    } catch (error) {
      console.error("Error locking engagement TOM:", error);
      res.status(500).json({ error: "Failed to lock engagement TOM" });
    }
  });

  app.delete("/api/engagements/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEngagement(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Engagement not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting engagement:", error);
      if (error.message?.includes('use cases')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete engagement" });
    }
  });

  app.get("/api/engagements/:id/use-cases", async (req, res) => {
    try {
      const useCases = await storage.getUseCasesByEngagement(req.params.id);
      res.json(useCases);
    } catch (error) {
      console.error("Error fetching engagement use cases:", error);
      res.status(500).json({ error: "Failed to fetch engagement use cases" });
    }
  });

  app.post("/api/clients/seed-defaults", async (req, res) => {
    try {
      const existingClients = await storage.getAllClients();
      if (existingClients.length > 0) {
        return res.json({ message: "Clients already exist", created: false });
      }

      const defaultClient = await storage.createClient({
        name: "Hexaware",
        description: "Default Hexaware organization",
        industry: "Technology Consulting",
        isActive: 'true'
      });

      const defaultEngagement = await storage.createEngagement({
        clientId: defaultClient.id,
        name: "AI Strategy Initiative",
        description: "Default AI use case portfolio",
        tomPresetId: "hybrid",
        tomPresetLocked: 'false',
        isDefault: 'true',
        status: 'active'
      });

      const allUseCases = await storage.getAllUseCases();
      for (const useCase of allUseCases) {
        if (!useCase.engagementId) {
          await storage.updateUseCase(useCase.id, { engagementId: defaultEngagement.id });
        }
      }

      res.status(201).json({ 
        message: "Defaults created successfully",
        created: true,
        client: defaultClient,
        engagement: defaultEngagement,
        useCasesMigrated: allUseCases.filter(uc => !uc.engagementId).length
      });
    } catch (error) {
      console.error("Error seeding defaults:", error);
      res.status(500).json({ error: "Failed to seed defaults" });
    }
  });
}
