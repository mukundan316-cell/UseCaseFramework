import type { Express } from "express";
import { createServer, type Server } from "http";

import recommendationRoutes from "./routes/recommendations";
import exportRoutes from "./routes/export.routes";
import importRoutes from "./routes/import.routes";
import presentationRoutes from "./routes/presentations";

import { registerUseCaseRoutes } from "./routes/use-cases.routes";
import { registerGovernanceRoutes } from "./routes/governance.routes";
import { registerMetadataRoutes } from "./routes/metadata.routes";
import { registerTomRoutes } from "./routes/tom.routes";
import { registerValueRoutes } from "./routes/value.routes";
import { registerCapabilityRoutes } from "./routes/capability.routes";
import { registerDerivationRoutes } from "./routes/derivation.routes";
import { registerResponseRoutes } from "./routes/responses.routes";
import { registerClientRoutes } from "./routes/clients.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  registerUseCaseRoutes(app);
  registerGovernanceRoutes(app);
  registerMetadataRoutes(app);
  registerTomRoutes(app);
  registerValueRoutes(app);
  registerCapabilityRoutes(app);
  registerDerivationRoutes(app);
  registerResponseRoutes(app);
  registerClientRoutes(app);

  const questionnaireRoutes = (await import('./routes/questionnaireHybrid.routes')).default;
  app.use('/api/questionnaire', questionnaireRoutes);

  app.use('/api/export', exportRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/presentations', presentationRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
