import XLSX from 'xlsx';
import { db } from "../server/db";
import { useCases } from "../shared/schema";
import { randomUUID } from "crypto";

const HEXAWARE_ENGAGEMENT_ID = "ff9f60ad-18f3-44f6-a2a4-78d22a2201a9";

function parseArrayField(value: string | undefined): string[] | null {
  if (!value || value.trim() === "") return null;
  return value.split(",").map(s => s.trim()).filter(s => s.length > 0);
}

function calculateImpactScore(revenueImpact: number, costSavings: number, riskReduction: number): number {
  const total = revenueImpact + costSavings + riskReduction;
  return Math.round((total / 15) * 100) / 100;
}

function calculateEffortScore(dataReadiness: number, technicalComplexity: number, changeImpact: number): number {
  const total = dataReadiness + technicalComplexity + changeImpact;
  return Math.round((total / 15) * 100) / 100;
}

function calculateQuadrant(impactScore: number, effortScore: number): string {
  const highImpact = impactScore >= 0.5;
  const lowEffort = effortScore < 0.5;
  
  if (highImpact && lowEffort) return "Quick Win";
  if (highImpact && !lowEffort) return "Strategic Bet";
  if (!highImpact && lowEffort) return "Experimental";
  return "Watchlist";
}

async function importMarkelUseCases() {
  console.log("Reading Excel file...");
  const workbook = XLSX.readFile("attached_assets/Markel_US_Claims_AI_UseCases_1770130204218.xlsx");
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];
  
  console.log(`Found ${data.length} use cases to import`);
  
  const useCasesToInsert = data.map((row) => {
    const revenueImpact = parseInt(row.revenueImpact) || 0;
    const costSavings = parseInt(row.costSavings) || 0;
    const riskReduction = parseInt(row.riskReduction) || 0;
    const dataReadiness = parseInt(row.dataReadiness) || 0;
    const technicalComplexity = parseInt(row.technicalComplexity) || 0;
    const changeImpact = parseInt(row.changeImpact) || 0;
    
    const impactScore = calculateImpactScore(revenueImpact, costSavings, riskReduction);
    const effortScore = calculateEffortScore(dataReadiness, technicalComplexity, changeImpact);
    const quadrant = calculateQuadrant(impactScore, effortScore);
    
    return {
      id: randomUUID(),
      meaningfulId: row.meaningfulId,
      engagementId: HEXAWARE_ENGAGEMENT_ID,
      title: row.title,
      description: `Markel US: ${row.description}`,
      problemStatement: row.problemStatement || null,
      useCaseType: row.useCaseType || null,
      processes: parseArrayField(row.processes),
      activities: parseArrayField(row.activities),
      linesOfBusiness: parseArrayField(row.linesOfBusiness),
      businessSegments: parseArrayField(row.businessSegments),
      geographies: parseArrayField(row.geographies),
      revenueImpact,
      costSavings,
      riskReduction,
      brokerPartnerExperience: 0,
      strategicFit: 0,
      dataReadiness,
      technicalComplexity,
      changeImpact,
      modelRisk: 0,
      adoptionReadiness: 0,
      impactScore,
      effortScore,
      quadrant,
      aiMlTechnologies: parseArrayField(row.aiMlTechnologies),
      dataSources: parseArrayField(row.dataSources),
      tShirtSize: row.tShirtSize || null,
      estimatedWeeksMin: parseInt(row.estimatedWeeksMin) || null,
      estimatedWeeksMax: parseInt(row.estimatedWeeksMax) || null,
      implementationTimeline: row.implementationTimeline || null,
      successMetrics: row.successMetrics || null,
      keyDependencies: row.keyDependencies || null,
      integrationRequirements: row.integrationRequirements || null,
      libraryTier: "reference",
      librarySource: "internal",
      isActiveForRsa: "false",
      isDashboardVisible: "false",
      tomPhase: "ideation",
    };
  });
  
  console.log("Inserting use cases into database...");
  
  for (const uc of useCasesToInsert) {
    await db.insert(useCases).values(uc);
    console.log(`Inserted: ${uc.meaningfulId} - ${uc.title}`);
  }
  
  console.log(`\nSuccessfully imported ${useCasesToInsert.length} Markel US use cases!`);
}

importMarkelUseCases()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
