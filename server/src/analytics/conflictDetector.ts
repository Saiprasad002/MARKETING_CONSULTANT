import { db } from '../db/connection';
import { generateId } from '../utils/id';

export async function detectAndRecordConflicts(
  companyId: string,
  existingProfile: Record<string, any>,
  newEntities: Record<string, any>,
  source = 'Latest conversation'
): Promise<any[]> {
  const conflictsFound: any[] = [];

  const checkField = async (fieldKey: string, sectionKey: string, propKey: string, newValue: any) => {
    if (newValue === null || newValue === undefined || newValue === '') return;

    const existingField = existingProfile[sectionKey]?.[propKey];
    const prevVal = existingField?.value;

    if (
      prevVal !== undefined &&
      prevVal !== null &&
      prevVal !== '' &&
      JSON.stringify(prevVal) !== JSON.stringify(newValue)
    ) {
      const conflictId = generateId();
      const conflictRecord = {
        id: conflictId,
        companyId,
        field: fieldKey,
        previousValue: prevVal,
        newValue,
        source,
        timestamp: new Date().toISOString()
      };

      await db.run(
        `INSERT INTO data_conflicts (id, company_id, field_key, previous_value_json, new_value_json, source, status)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
        [conflictId, companyId, fieldKey, JSON.stringify(prevVal), JSON.stringify(newValue), source]
      );

      conflictsFound.push(conflictRecord);
    }
  };

  if (newEntities.monthlyBudget) {
    await checkField('monthlyBudget', 'marketing', 'monthlyBudget', newEntities.monthlyBudget);
  }
  if (newEntities.companyName) {
    await checkField('companyName', 'identity', 'name', newEntities.companyName);
  }
  if (newEntities.industry) {
    await checkField('industry', 'identity', 'industry', newEntities.industry);
  }
  if (newEntities.primaryGoal) {
    await checkField('primaryGoal', 'goals', 'primaryGoal', newEntities.primaryGoal);
  }

  return conflictsFound;
}

export async function getPendingConflicts(companyId: string): Promise<any[]> {
  const rows = await db.all(
    `SELECT * FROM data_conflicts WHERE company_id = ? AND status = 'PENDING' ORDER BY timestamp DESC`,
    [companyId]
  );
  return rows.map(r => ({
    id: r.id,
    companyId: r.company_id,
    field: r.field_key,
    previousValue: JSON.parse(r.previous_value_json || 'null'),
    newValue: JSON.parse(r.new_value_json || 'null'),
    source: r.source,
    timestamp: r.timestamp,
    status: r.status
  }));
}
