import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // MINIMAL SETUP: Only seed if database is completely empty
  await seedDatabase();
  
  // DISABLED: Comprehensive use cases seeding - user data only
  // const { seedComprehensiveUseCases } = await import('./comprehensive-seed');
  
  // DISABLED: Enhanced framework migration - preserves user data integrity
  // const { migrateToEnhancedFramework } = await import('./enhanced-framework-migration');
  
  // DISABLED: Process-Activity migration - was overwriting user-entered processes/activities
  // const { migrateProcessActivities } = await import('./migrations/updateProcessActivities');
  
  // Load consolidated use cases to reference library - TEMPORARILY DISABLED TO FIX QUADRANT ISSUES
  // try {
  //   const { seedConsolidatedUseCases } = await import('./seeders/consolidated-use-cases');
  //   await seedConsolidatedUseCases();
  // } catch (error) {
  //   console.log('Consolidated use cases seeding skipped - already exists or error:', error instanceof Error ? error.message : 'Unknown error');
  // }
  
  // Seed RSA Assessment if needed - DISABLED to preserve advanced question types
  /* 
  try {
    const { seedRSAQuestionnaire } = await import('./seeders/rsa-questionnaire-seeder');
    const { seedRSASections } = await import('./seeders/rsa-sections-seeder');  
    const { seedRSAQuestions } = await import('./seeders/rsa-questions-seeder');
    
    console.log('🔄 Starting RSA Assessment seeding...');
    const questionnaire = await seedRSAQuestionnaire();
    const sections = await seedRSASections(questionnaire.id);
    await seedRSAQuestions(sections);
    console.log('✅ RSA Assessment seeded successfully');
  } catch (error) {
    console.log('RSA Assessment seeding skipped - already exists or error:', error instanceof Error ? error.message : 'Unknown error');
  }
  */
  console.log('✅ RSA Assessment seeding disabled - using advanced question types');
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
