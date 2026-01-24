import type { Express } from "express";
import { storage } from "../storage";

export function registerDerivationRoutes(app: Express): void {
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
          impactScore: { formula: 'Weighted average of Business Value levers' },
          effortScore: { formula: 'Weighted average of Feasibility levers (inverted)' },
          quadrant: { formula: 'Compare Impact vs Effort against threshold' }
        },
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

  app.put("/api/derivation/formulas", async (req, res) => {
    try {
      const formulas = req.body;
      
      const currentMetadata = await storage.getMetadataConfig();
      if (!currentMetadata) {
        res.status(404).json({ error: "Metadata config not found" });
        return;
      }
      
      await storage.updateMetadataConfig({
        ...currentMetadata,
        derivationFormulas: formulas
      } as any);
      
      res.json({ success: true, formulas });
    } catch (error) {
      console.error("Error updating derivation formulas:", error);
      res.status(500).json({ error: "Failed to update derivation formulas" });
    }
  });

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
            thresholdDefault: (metadata as any)?.scoringModel?.quadrantThresholds?.impactMidpoint || 3.0
          }
        },
        valueRealization: {
          kpiMatching: {
            formula: 'Match use case processes to KPI applicableProcesses',
            description: 'For each process in use case, find KPIs where applicableProcesses includes that process'
          },
          maturityLevel: {
            formula: 'Evaluate maturity rules based on scores',
            description: 'Check dataReadiness, technicalComplexity, adoptionReadiness against conditions'
          },
          roi: {
            formula: metadata?.valueRealizationConfig?.calculationConfig?.roiFormula || '((cumulativeValue - totalInvestment) / totalInvestment) × 100',
            description: 'Return on Investment as a percentage'
          },
          valueConfidence: {
            defaultConservativeFactor: 1.0,
            defaultValidationStatus: 'unvalidated',
            adjustedValueFormula: {
              formula: 'Adjusted Value = Raw Value × Conservative Factor',
              description: 'Applies a confidence-based discount (50%-100%) to value estimates. Lower factors indicate more conservative projections pending validation.'
            },
            validationWorkflow: {
              stages: ['unvalidated', 'pending_finance', 'pending_actuarial', 'fully_validated'],
              description: 'Four-stage validation process: Unvalidated → Finance Review → Actuarial Review → Fully Validated. Each stage increases confidence in value estimates.'
            }
          }
        },
        tom: {
          enabled: metadata?.tomConfig?.enabled,
          activePreset: metadata?.tomConfig?.activePreset,
          phases: Object.keys(metadata?.tomConfig?.phases || {})
        },
        seededAt: new Date().toISOString()
      };
      
      await storage.updateMetadataConfig({
        ...metadata,
        derivationFormulas
      } as any);
      
      res.json({ success: true, message: "Derivation formulas seeded with defaults", formulas: derivationFormulas });
    } catch (error) {
      console.error("Error seeding derivation formulas:", error);
      res.status(500).json({ error: "Failed to seed derivation formulas" });
    }
  });
}
