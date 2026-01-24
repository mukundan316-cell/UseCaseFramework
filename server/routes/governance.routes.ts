import type { Express } from "express";
import { storage } from "../storage";
import { mapUseCaseToFrontend } from "@shared/mappers";

export function registerGovernanceRoutes(app: Express): void {
  app.get("/api/governance/queue", async (req, res) => {
    try {
      const useCases = await storage.getGovernancePendingUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error fetching governance queue:", error);
      res.status(500).json({ error: "Failed to fetch governance queue" });
    }
  });

  app.get("/api/governance/summary", async (req, res) => {
    try {
      const summary = await storage.getGovernanceSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching governance summary:", error);
      res.status(500).json({ error: "Failed to fetch governance summary" });
    }
  });

  app.post("/api/governance/submit/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, submittedBy } = req.body;
      const useCase = await storage.submitForGovernance(id, reason, submittedBy || 'system');
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error submitting for governance:", error);
      res.status(500).json({ error: "Failed to submit for governance review" });
    }
  });

  app.post("/api/governance/:id/operating-model", async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, notes, actor } = req.body;
      if (!['approved', 'rejected', 'not_required'].includes(decision)) {
        return res.status(400).json({ error: "Invalid decision. Must be 'approved', 'rejected', or 'not_required'" });
      }
      const useCase = await storage.processOperatingModelGate(id, decision, notes, actor || 'system');
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error) {
      console.error("Error processing operating model gate:", error);
      res.status(500).json({ error: "Failed to process operating model gate" });
    }
  });

  app.post("/api/governance/:id/intake", async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, notes, actor, priorityRank } = req.body;
      if (!['approved', 'rejected', 'deferred'].includes(decision)) {
        return res.status(400).json({ error: "Invalid decision. Must be 'approved', 'rejected', or 'deferred'" });
      }
      const useCase = await storage.processIntakeGate(id, decision, notes, actor || 'system', priorityRank);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error: any) {
      console.error("Error processing intake gate:", error);
      if (error.message?.includes('GATE_SEQUENCE_ERROR')) {
        return res.status(409).json({ error: error.message.replace('GATE_SEQUENCE_ERROR: ', '') });
      }
      res.status(500).json({ error: "Failed to process intake gate" });
    }
  });

  app.post("/api/governance/:id/rai", async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, notes, actor, riskLevel } = req.body;
      if (!['approved', 'conditionally_approved', 'rejected'].includes(decision)) {
        return res.status(400).json({ error: "Invalid decision. Must be 'approved', 'conditionally_approved', or 'rejected'" });
      }
      const useCase = await storage.processRaiGate(id, decision, notes, actor || 'system', riskLevel);
      if (!useCase) {
        return res.status(404).json({ error: "Use case not found" });
      }
      res.json(mapUseCaseToFrontend(useCase));
    } catch (error: any) {
      console.error("Error processing RAI gate:", error);
      if (error.message?.includes('GATE_SEQUENCE_ERROR')) {
        return res.status(409).json({ error: error.message.replace('GATE_SEQUENCE_ERROR: ', '') });
      }
      res.status(500).json({ error: "Failed to process RAI gate" });
    }
  });

  app.get("/api/governance/:id/audit", async (req, res) => {
    try {
      const { id } = req.params;
      const auditLog = await storage.getGovernanceAuditLog(id);
      res.json(auditLog);
    } catch (error) {
      console.error("Error fetching governance audit log:", error);
      res.status(500).json({ error: "Failed to fetch governance audit log" });
    }
  });
}
