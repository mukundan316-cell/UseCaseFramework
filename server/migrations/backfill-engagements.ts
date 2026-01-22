import { db } from "../db";
import { useCases, clients, engagements } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const BACKUP_PATH = path.join(process.cwd(), "data", "use-cases-backup.json");

async function ensureDefaultClientAndEngagement(): Promise<{ clientId: string; engagementId: string }> {
  let client = await db.select().from(clients).where(eq(clients.name, "Hexaware"));
  
  let clientId: string;
  if (client.length === 0) {
    const [newClient] = await db.insert(clients).values({
      name: "Hexaware",
      description: "Default Hexaware client",
      industry: "Technology",
      isActive: "true"
    }).returning();
    clientId = newClient.id;
    console.log("Created default client: Hexaware");
  } else {
    clientId = client[0].id;
    console.log("Found existing client: Hexaware");
  }

  let engagement = await db.select().from(engagements)
    .where(eq(engagements.isDefault, "true"));
  
  let engagementId: string;
  if (engagement.length === 0) {
    const [newEngagement] = await db.insert(engagements).values({
      clientId,
      name: "AI Strategy Initiative",
      description: "Default engagement for AI use case portfolio",
      tomPresetId: "hybrid",
      tomPresetLocked: "true",
      isDefault: "true",
      status: "active"
    }).returning();
    engagementId = newEngagement.id;
    console.log("Created default engagement: AI Strategy Initiative with hybrid TOM preset (locked)");
  } else {
    engagementId = engagement[0].id;
    if (engagement[0].tomPresetLocked !== "true") {
      await db.update(engagements)
        .set({ tomPresetLocked: "true" })
        .where(eq(engagements.id, engagementId));
      console.log("Locked TOM preset for default engagement");
    }
    console.log("Found existing default engagement: AI Strategy Initiative");
  }

  return { clientId, engagementId };
}

async function backupUseCases(): Promise<any[]> {
  const allUseCases = await db.select().from(useCases);
  
  fs.mkdirSync(path.dirname(BACKUP_PATH), { recursive: true });
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(allUseCases, null, 2));
  
  console.log(`Backed up ${allUseCases.length} use cases to ${BACKUP_PATH}`);
  return allUseCases;
}

async function backfillEngagementIds(engagementId: string): Promise<number> {
  const result = await db.update(useCases)
    .set({ engagementId })
    .where(eq(useCases.engagementId, null as any))
    .returning();
  
  const allWithoutEngagement = await db.select().from(useCases)
    .where(eq(useCases.engagementId, null as any));
  
  if (allWithoutEngagement.length > 0) {
    await db.update(useCases)
      .set({ engagementId })
      .returning();
  }

  const updated = await db.select().from(useCases);
  const withEngagement = updated.filter(uc => uc.engagementId === engagementId);
  
  console.log(`Backfilled ${withEngagement.length} use cases with engagementId: ${engagementId}`);
  return withEngagement.length;
}

export async function runMigration() {
  console.log("=== Engagement Backfill Migration ===\n");

  console.log("Step 1: Backing up use cases...");
  const backup = await backupUseCases();

  console.log("\nStep 2: Ensuring default client and engagement exist...");
  const { clientId, engagementId } = await ensureDefaultClientAndEngagement();

  console.log("\nStep 3: Backfilling engagementId on use cases...");
  const count = await backfillEngagementIds(engagementId);

  console.log("\n=== Migration Complete ===");
  console.log(`- Backup created: ${BACKUP_PATH}`);
  console.log(`- Default client ID: ${clientId}`);
  console.log(`- Default engagement ID: ${engagementId}`);
  console.log(`- Use cases updated: ${count}`);

  return { clientId, engagementId, useCasesUpdated: count };
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
