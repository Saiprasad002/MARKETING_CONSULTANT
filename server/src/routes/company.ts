import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db/connection';
import { getCompanyProfile, updateProfileField } from '../services/profileService';

const router = Router();

// GET /api/company
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = await db.get(`SELECT * FROM companies WHERE id = ?`, [req.user!.companyId]);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    return res.json(company);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// PATCH /api/company
router.patch('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { name, logo, website, industry, subIndustry, businessType, startupStage, location, employeesCount } = req.body;

    await db.run(
      `UPDATE companies SET 
        name = COALESCE(?, name),
        logo = COALESCE(?, logo),
        website = COALESCE(?, website),
        industry = COALESCE(?, industry),
        sub_industry = COALESCE(?, sub_industry),
        business_type = COALESCE(?, business_type),
        startup_stage = COALESCE(?, startup_stage),
        location = COALESCE(?, location),
        employees_count = COALESCE(?, employees_count),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, logo, website, industry, subIndustry, businessType, startupStage, location, employeesCount, companyId]
    );

    // Also update structured profile fields
    if (name) await updateProfileField(companyId, 'identity', 'name', name);
    if (industry) await updateProfileField(companyId, 'identity', 'industry', industry);
    if (website) await updateProfileField(companyId, 'identity', 'website', website);
    if (businessType) await updateProfileField(companyId, 'identity', 'businessType', businessType);

    const updated = await db.get(`SELECT * FROM companies WHERE id = ?`, [companyId]);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update company' });
  }
});

export default router;
