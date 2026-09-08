import { db } from '../db/connection';

export async function getCompanyProfile(companyId: string): Promise<Record<string, any>> {
  const rows = await db.all(
    `SELECT section_key, field_key, value_json, source, confidence, last_updated, verified
     FROM company_profiles
     WHERE company_id = ?`,
    [companyId]
  );

  const profile: Record<string, any> = {
    identity: {},
    businessDescription: {},
    targetCustomer: {},
    competition: {},
    marketing: {},
    goals: {}
  };

  rows.forEach(r => {
    let val: any;
    try {
      val = JSON.parse(r.value_json || 'null');
    } catch (e) {
      val = r.value_json;
    }

    if (!profile[r.section_key]) profile[r.section_key] = {};

    profile[r.section_key][r.field_key] = {
      field: r.field_key,
      value: val,
      source: r.source,
      confidence: r.confidence,
      lastUpdated: r.last_updated,
      verified: Boolean(r.verified)
    };
  });

  return profile;
}

export async function updateProfileField(
  companyId: string,
  sectionKey: string,
  fieldKey: string,
  value: any,
  source = 'manual_edit',
  confidence = 1.0,
  verified = true
): Promise<void> {
  const valJson = JSON.stringify(value);
  await db.run(
    `INSERT INTO company_profiles (id, company_id, section_key, field_key, value_json, source, confidence, last_updated, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
     ON CONFLICT(company_id, section_key, field_key) DO UPDATE SET
       value_json = excluded.value_json,
       source = excluded.source,
       confidence = excluded.confidence,
       last_updated = CURRENT_TIMESTAMP,
       verified = excluded.verified`,
    [`${companyId}_${sectionKey}_${fieldKey}`, companyId, sectionKey, fieldKey, valJson, source, confidence, verified ? 1 : 0]
  );
}
