import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getCompanyProfile } from '../services/profileService';
import { generateExecutiveReport, evaluateGrowthPotential } from '../analytics/analyticsEngine';
import { saveAnalyticsSnapshot, getSnapshotHistory, compareSnapshots } from '../analytics/snapshotService';
import { db } from '../db/connection';

const router = Router();

// GET /api/analytics
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const profile = await getCompanyProfile(companyId);
    const report = generateExecutiveReport(profile);
    return res.json(report);
  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to calculate analytics' });
  }
});

// POST /api/analytics/recalculate
router.post('/recalculate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const profile = await getCompanyProfile(companyId);
    const report = generateExecutiveReport(profile);

    const growthEval = evaluateGrowthPotential(profile);
    const newVersion = await saveAnalyticsSnapshot(
      companyId,
      report.businessHealth.score,
      report.marketingReadiness.score,
      growthEval.assessment,
      report.dataConfidence.completenessPercentage,
      report
    );

    return res.json({
      message: 'Analysis updated based on your latest company information.',
      version: newVersion,
      report
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to recalculate analytics' });
  }
});

// GET /api/analytics/history
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await getSnapshotHistory(req.user!.companyId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch snapshot history' });
  }
});

// GET /api/analytics/compare
router.get('/compare', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { v1, v2 } = req.query;
    if (!v1 || !v2) {
      return res.status(400).json({ error: 'v1 and v2 version query params are required' });
    }

    const diff = await compareSnapshots(req.user!.companyId, parseInt(v1 as string), parseInt(v2 as string));
    return res.json(diff);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to compare snapshots' });
  }
});

// GET /api/report
router.get('/report', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await getCompanyProfile(req.user!.companyId);
    const report = generateExecutiveReport(profile);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate executive report' });
  }
});

// PATCH /api/recommendations/:id
router.patch('/recommendations/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Completed', 'Deferred'].includes(status)) {
      return res.status(400).json({ error: 'Invalid recommendation status' });
    }

    await db.run(
      `UPDATE recommendations SET status = ? WHERE id = ? AND company_id = ?`,
      [status, id, req.user!.companyId]
    );

    return res.json({ message: 'Recommendation status updated', id, status });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

export default router;
