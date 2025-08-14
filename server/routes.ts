import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUseCaseSchema } from "@shared/schema";
import { calculateImpactScore, calculateEffortScore, calculateQuadrant } from "@shared/calculations";
import { mapUseCaseToFrontend } from "@shared/mappers";
import recommendationRoutes from "./routes/recommendations";
import exportRoutes from "./routes/export.routes";
import { questionnaireServiceInstance } from './services/questionnaireService';

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
  
  const businessValueWeights = parsedScoringModel?.businessValue || {
    revenueImpact: 20,
    costSavings: 20,
    riskReduction: 20,
    brokerPartnerExperience: 20,
    strategicFit: 20
  };
  
  const feasibilityWeights = parsedScoringModel?.feasibility || {
    dataReadiness: 20,
    technicalComplexity: 20,
    changeImpact: 20,
    modelRisk: 20,
    adoptionReadiness: 20
  };
  
  const threshold = parsedScoringModel?.quadrantThreshold || 3.0;
  
  console.log('Recalculation using weights:', { businessValueWeights, feasibilityWeights, threshold });
  
  for (const useCase of useCases) {
    const impactScore = calculateImpactScore(
      useCase.revenueImpact,
      useCase.costSavings,
      useCase.riskReduction,
      useCase.brokerPartnerExperience,
      useCase.strategicFit,
      businessValueWeights
    );
    
    const effortScore = calculateEffortScore(
      useCase.dataReadiness,
      useCase.technicalComplexity,
      useCase.changeImpact,
      useCase.modelRisk,
      useCase.adoptionReadiness,
      feasibilityWeights
    );
    
    const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
    
    console.log(`${useCase.title}: impact=${impactScore.toFixed(1)}, effort=${effortScore.toFixed(1)}, quadrant=${quadrant}`);
    
    await storage.updateUseCase(useCase.id, {
      impactScore,
      effortScore,
      quadrant
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const questionnaireService = questionnaireServiceInstance;
  
  // Use Case routes - RSA Active Portfolio (only RSA-active use cases)
  app.get("/api/use-cases", async (req, res) => {
    try {
      const useCases = await storage.getActiveUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error fetching active use cases:", error);
      res.status(500).json({ error: "Failed to fetch active use cases" });
    }
  });

  // Two-tier library system routes
  app.get("/api/use-cases/dashboard", async (req, res) => {
    try {
      const useCases = await storage.getDashboardUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error fetching dashboard use cases:", error);
      res.status(500).json({ error: "Failed to fetch dashboard use cases" });
    }
  });

  app.get("/api/use-cases/active", async (req, res) => {
    try {
      const useCases = await storage.getActiveUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
    } catch (error) {
      console.error("Error fetching active use cases:", error);
      res.status(500).json({ error: "Failed to fetch active use cases" });
    }
  });

  app.get("/api/use-cases/reference", async (req, res) => {
    try {
      const useCases = await storage.getReferenceLibraryUseCases();
      const mappedUseCases = useCases.map(mapUseCaseToFrontend);
      res.json(mappedUseCases);
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
      const validatedData = insertUseCaseSchema.parse(req.body);
      
      // Get current metadata for weights
      const metadata = await storage.getMetadataConfig();
      const businessValueWeights = metadata?.scoringModel?.businessValue || {
        revenueImpact: 20,
        costSavings: 20,
        riskReduction: 20,
        brokerPartnerExperience: 20,
        strategicFit: 20
      };
      const feasibilityWeights = metadata?.scoringModel?.feasibility || {
        dataReadiness: 20,
        technicalComplexity: 20,
        changeImpact: 20,
        modelRisk: 20,
        adoptionReadiness: 20
      };
      const threshold = metadata?.scoringModel?.quadrantThreshold || 3.0;
      
      // Calculate scores with weights
      const impactScore = calculateImpactScore(
        validatedData.revenueImpact,
        validatedData.costSavings,
        validatedData.riskReduction,
        validatedData.brokerPartnerExperience,
        validatedData.strategicFit,
        businessValueWeights
      );
      
      const effortScore = calculateEffortScore(
        validatedData.dataReadiness,
        validatedData.technicalComplexity,
        validatedData.changeImpact,
        validatedData.modelRisk,
        validatedData.adoptionReadiness,
        feasibilityWeights
      );
      
      const quadrant = calculateQuadrant(impactScore, effortScore, threshold);
      
      const useCaseWithScores = {
        ...validatedData,
        linesOfBusiness: validatedData.linesOfBusiness || [validatedData.lineOfBusiness].filter(Boolean),
        // Handle multi-select arrays with backward compatibility
        processes: validatedData.processes || (validatedData.process ? [validatedData.process] : undefined),
        activities: validatedData.activities || (validatedData.activity ? [validatedData.activity] : undefined),
        businessSegments: validatedData.businessSegments || (validatedData.businessSegment ? [validatedData.businessSegment] : undefined),
        geographies: validatedData.geographies || (validatedData.geography ? [validatedData.geography] : undefined),
        // Ensure new use cases go to reference library by default
        isActiveForRsa: validatedData.isActiveForRsa || 'false',
        isDashboardVisible: validatedData.isDashboardVisible || 'false',
        libraryTier: validatedData.libraryTier || 'reference',
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
      // Create a partial schema for updates by making all fields optional
      const updateSchema = insertUseCaseSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
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
      
      // Always recalculate all use case scores when metadata is updated
      try {
        const currentMetadata = await storage.getMetadataConfig();
        await recalculateAllUseCaseScores(currentMetadata?.scoringModel || metadata.scoringModel);
        console.log('✅ Recalculated all use case scores after metadata update');
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
      console.log('✅ Manual recalculation completed');
      res.json({ success: true, message: "All use case scores recalculated successfully" });
    } catch (error) {
      console.error("Error during manual recalculation:", error);
      res.status(500).json({ error: "Failed to recalculate scores" });
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

  // ==================================================================================
  // SECTION PROGRESS TRACKING ROUTES
  // ==================================================================================

  // GET /api/responses/:id/section-progress - Get all section progress for a response
  app.get("/api/responses/:id/section-progress", async (req, res) => {
    try {
      const { id } = req.params;
      const sectionProgress = await storage.getSectionProgress(id);
      
      // Transform to frontend format
      const progressMap: Record<number, any> = {};
      sectionProgress.forEach(progress => {
        progressMap[progress.sectionNumber] = {
          sectionNumber: progress.sectionNumber,
          started: true,
          completed: progress.isComplete === 'true',
          currentQuestionIndex: 0, // Will be updated from answers
          totalQuestions: 0, // Will be calculated from section
          completionPercentage: progress.completionPercentage,
          lastModified: progress.lastModifiedAt.toISOString(),
          answers: {} // Will be populated from question answers
        };
      });

      res.json(progressMap);
    } catch (error) {
      console.error("Error fetching section progress:", error);
      res.status(500).json({ error: "Failed to fetch section progress" });
    }
  });

  // PUT /api/responses/:id/section/:sectionNum/progress - Update section progress
  app.put("/api/responses/:id/section/:sectionNum/progress", async (req, res) => {
    try {
      const { id, sectionNum } = req.params;
      const { currentQuestionIndex, totalQuestions, completionPercentage, answers } = req.body;

      const sectionNumber = parseInt(sectionNum);
      if (isNaN(sectionNumber) || sectionNumber < 1 || sectionNumber > 6) {
        return res.status(400).json({ error: "Invalid section number" });
      }

      // Update or create section progress
      await storage.updateSectionProgress(id, sectionNumber, {
        completionPercentage: Math.min(100, Math.max(0, completionPercentage || 0)),
        isComplete: completionPercentage >= 100 ? 'true' : 'false'
      });

      // Save individual answers if provided
      if (answers && typeof answers === 'object') {
        for (const [questionId, answer] of Object.entries(answers)) {
          await storage.saveQuestionAnswer(id, questionId, answer);
        }
      }

      res.json({ 
        success: true, 
        message: "Section progress updated successfully",
        sectionNumber,
        completionPercentage: completionPercentage || 0
      });
    } catch (error) {
      console.error("Error updating section progress:", error);
      res.status(500).json({ error: "Failed to update section progress" });
    }
  });

  // POST /api/responses/:id/section/:sectionNum/complete - Mark section as complete
  app.post("/api/responses/:id/section/:sectionNum/complete", async (req, res) => {
    try {
      const { id, sectionNum } = req.params;
      const sectionNumber = parseInt(sectionNum);

      if (isNaN(sectionNumber) || sectionNumber < 1 || sectionNumber > 6) {
        return res.status(400).json({ error: "Invalid section number" });
      }

      // Mark section as complete
      await storage.updateSectionProgress(id, sectionNumber, {
        completionPercentage: 100,
        isComplete: 'true'
      });

      // Check if all sections are complete
      const allProgress = await storage.getSectionProgress(id);
      const completedSections = allProgress.filter(p => p.isComplete === 'true').length;
      const isFullyComplete = completedSections >= 6;

      // Update overall response status if all sections complete
      if (isFullyComplete) {
        await storage.updateQuestionnaireResponse(id, {
          completedAt: new Date()
        });
      }

      res.json({ 
        success: true, 
        message: `Section ${sectionNumber} marked as complete`,
        sectionNumber,
        completedSections,
        totalSections: 6,
        isFullyComplete
      });
    } catch (error) {
      console.error("Error completing section:", error);
      res.status(500).json({ error: "Failed to complete section" });
    }
  });

  // GET /api/responses/:id/resume-point - Get resume point for incomplete response
  app.get("/api/responses/:id/resume-point", async (req, res) => {
    try {
      const { id } = req.params;
      const sectionProgress = await storage.getSectionProgress(id);
      
      // Find first incomplete section
      let resumeSection = 1;
      let resumeQuestionIndex = 0;
      
      for (let sectionNum = 1; sectionNum <= 6; sectionNum++) {
        const progress = sectionProgress.find(p => p.sectionNumber === sectionNum);
        
        if (!progress || progress.isComplete !== 'true') {
          resumeSection = sectionNum;
          resumeQuestionIndex = progress?.completionPercentage ? 
            Math.floor((progress.completionPercentage / 100) * 10) : 0; // Estimate based on completion
          break;
        }
      }

      // Get answers for resume section
      const answers = await storage.getQuestionAnswersByResponse(id);
      const sectionAnswers: Record<string, any> = {};
      
      // Filter answers for the resume section (would need section mapping)
      answers.forEach(answer => {
        sectionAnswers[answer.questionId] = answer.answerValue;
      });

      res.json({
        responseId: id,
        sectionNumber: resumeSection,
        questionIndex: resumeQuestionIndex,
        answers: sectionAnswers,
        totalSections: 6
      });
    } catch (error) {
      console.error("Error getting resume point:", error);
      res.status(500).json({ error: "Failed to get resume point" });
    }
  });

  // Register questionnaire routes (blob storage based)
  const questionnaireRoutes = (await import('./routes/questionnaireHybrid.routes')).default;
  app.use('/api/questionnaire', questionnaireRoutes);

  // Import questionnaire service for response creation is already done at top

  // GET /api/responses/check-session - Check for existing session
  app.get('/api/responses/check-session', async (req, res) => {
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
      const sessionId = await questionnaireService.startResponseSession(
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
      if (error.message && error.message.startsWith('COMPLETED_SESSION:')) {
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
      await questionnaireService.saveResponseAnswers(id, answers);

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

  const httpServer = createServer(app);
  
  // Legacy assessment routes temporarily disabled during blob migration
  
  // Register export routes (re-enabled after blob migration completion)
  app.use('/api/export', exportRoutes);
  
  // Register recommendation routes
  app.use('/api/recommendations', recommendationRoutes);
  
  // Legacy assessment statistics routes temporarily disabled during blob migration

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

  return httpServer;
}
