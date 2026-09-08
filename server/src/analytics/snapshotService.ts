import { db } from '../db/connection';
import { generateId } from '../utils/id';

export async function saveAnalyticsSnapshot(
  companyId: string,
  healthScore: number,
  readinessScore: number,
  growthPotential: string,
  dataCompleteness: number,
  snapshotData: Record<string, any>
): Promise<number> {
  const lastSnapshot = await db.get(
    `SELECT version FROM analytics_snapshots WHERE company_id = ? ORDER BY version DESC LIMIT 1`,
    [companyId]
  );

  const newVersion = (lastSnapshot?.version || 0) + 1;
  const snapshotId = generateId();

  await db.run(
    `INSERT INTO analytics_snapshots (id, company_id, version, health_score, readiness_score, growth_potential, data_completeness, snapshot_data_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snapshotId,
      companyId,
      newVersion,
      healthScore,
      readinessScore,
      growthPotential,
      dataCompleteness,
      JSON.stringify(snapshotData)
    ]
  );

  return newVersion;
}

export async function getSnapshotHistory(companyId: string): Promise<any[]> {
  const rows = await db.all(
    `SELECT id, version, health_score, readiness_score, growth_potential, data_completeness, created_at
     FROM analytics_snapshots
     WHERE company_id = ?
     ORDER BY version DESC`,
    [companyId]
  );

  return rows.map(r => ({
    id: r.id,
    version: r.version,
    healthScore: r.health_score,
    readinessScore: r.readiness_score,
    growthPotential: r.growth_potential,
    dataCompleteness: r.data_completeness,
    createdAt: r.created_at
  }));
}

export async function compareSnapshots(companyId: string, v1: number, v2: number): Promise<any> {
  const snap1 = await db.get(
    `SELECT * FROM analytics_snapshots WHERE company_id = ? AND version = ?`,
    [companyId, v1]
  );
  const snap2 = await db.get(
    `SELECT * FROM analytics_snapshots WHERE company_id = ? AND version = ?`,
    [companyId, v2]
  );

  if (!snap1 || !snap2) {
    throw new Error('One or both specified snapshot versions do not exist.');
  }

  const data1 = JSON.parse(snap1.snapshot_data_json);
  const data2 = JSON.parse(snap2.snapshot_data_json);

  return {
    version1: v1,
    version2: v2,
    healthScoreDiff: snap2.health_score - snap1.health_score,
    readinessScoreDiff: snap2.readiness_score - snap1.readiness_score,
    dataCompletenessDiff: snap2.data_completeness - snap1.data_completeness,
    growthPotentialChange: {
      from: snap1.growth_potential,
      to: snap2.growth_potential
    },
    recommendationCountDiff: (data2.recommendations?.length || 0) - (data1.recommendations?.length || 0)
  };
}
