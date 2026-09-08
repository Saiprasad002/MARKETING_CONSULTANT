import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db/connection';
import { getPendingConflicts } from '../analytics/conflictDetector';
import { updateProfileField } from '../services/profileService';

const router = Router();

// GET /api/conflicts
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conflicts = await getPendingConflicts(req.user!.companyId);
    return res.json(conflicts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data conflicts' });
  }
});

// POST /api/conflicts/:id/resolve
router.post('/:id/resolve', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { selectedValue, sectionKey, fieldKey } = req.body;

    const conflict = await db.get(
      `SELECT * FROM data_conflicts WHERE id = ? AND company_id = ?`,
      [id, req.user!.companyId]
    );

    if (!conflict) return res.status(404).json({ error: 'Conflict not found' });

    // Update profile with resolved value
    if (sectionKey && fieldKey) {
      await updateProfileField(req.user!.companyId, sectionKey, fieldKey, selectedValue, 'Conflict Resolution');
    }

    // Mark conflict resolved
    await db.run(
      `UPDATE data_conflicts SET status = 'RESOLVED', resolved_value_json = ? WHERE id = ?`,
      [JSON.stringify(selectedValue), id]
    );

    return res.json({ message: 'Conflict resolved successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve conflict' });
  }
});

export default router;
