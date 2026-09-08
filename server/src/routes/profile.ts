import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getCompanyProfile, updateProfileField } from '../services/profileService';
import { detectAndRecordConflicts } from '../analytics/conflictDetector';
import { db } from '../db/connection';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await getCompanyProfile(req.user!.companyId);
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// POST /api/profile/complete-onboarding
router.post('/complete-onboarding', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.run(`UPDATE users SET onboarding_completed = 1 WHERE id = ?`, [req.user!.userId]);
    return res.json({ message: 'Onboarding completed', onboardingCompleted: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// PATCH /api/profile/field
router.patch('/field', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { sectionKey, fieldKey, value, source, confidence, verified } = req.body;

    if (!sectionKey || !fieldKey) {
      return res.status(400).json({ error: 'sectionKey and fieldKey are required' });
    }

    const existingProfile = await getCompanyProfile(companyId);

    // Detect potential conflict
    const conflicts = await detectAndRecordConflicts(
      companyId,
      existingProfile,
      { [fieldKey]: value },
      source || 'Manual User Edit'
    );

    await updateProfileField(companyId, sectionKey, fieldKey, value, source || 'manual_edit', confidence || 1.0, verified ?? true);

    const updatedProfile = await getCompanyProfile(companyId);

    return res.json({
      message: 'Profile field updated successfully',
      profile: updatedProfile,
      conflicts
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile field' });
  }
});

// POST /api/profile/batch
router.post('/batch', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { identity, businessDescription, targetCustomer, competition, marketing, goals } = req.body;

    const existingProfile = await getCompanyProfile(companyId);

    const saveSection = async (sectionName: string, dataObj: Record<string, any>) => {
      if (!dataObj) return;
      for (const [fKey, fVal] of Object.entries(dataObj)) {
        if (fVal !== undefined && fVal !== null) {
          const valToSave = typeof fVal === 'object' && fVal.value !== undefined ? fVal.value : fVal;
          const source = typeof fVal === 'object' && fVal.source ? fVal.source : 'manual_edit';
          await updateProfileField(companyId, sectionName, fKey, valToSave, source);
        }
      }
    };

    await saveSection('identity', identity);
    await saveSection('businessDescription', businessDescription);
    await saveSection('targetCustomer', targetCustomer);
    await saveSection('competition', competition);
    await saveSection('marketing', marketing);
    await saveSection('goals', goals);

    await db.run(`UPDATE users SET onboarding_completed = 1 WHERE id = ?`, [req.user!.userId]);

    const updatedProfile = await getCompanyProfile(companyId);
    return res.json({ message: 'Profile batch updated', profile: updatedProfile });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update batch profile' });
  }
});

export default router;
