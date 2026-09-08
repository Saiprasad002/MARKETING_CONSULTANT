import { Router, Request, Response } from 'express';
import { db } from '../db/connection';
import { hashPassword, comparePassword } from '../auth/hash';
import { generateToken } from '../auth/jwt';
import { generateId } from '../utils/id';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userId = generateId();
    const companyId = generateId();
    const workspaceId = generateId();
    const hashedPassword = await hashPassword(password);

    const cName = companyName?.trim() || `${name}'s Company`;

    // 1. Create User
    await db.run(
      `INSERT INTO users (id, email, password_hash, name, company_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email.toLowerCase().trim(), hashedPassword, name, companyId, workspaceId]
    );

    // 2. Create Company
    await db.run(
      `INSERT INTO companies (id, owner_id, name) VALUES (?, ?, ?)`,
      [companyId, userId, cName]
    );

    // 3. Create Workspace
    await db.run(
      `INSERT INTO workspaces (id, company_id, name) VALUES (?, ?, ?)`,
      [workspaceId, companyId, 'Main Workspace']
    );

    // Create Initial Consultation session
    const consultationId = generateId();
    await db.run(
      `INSERT INTO consultations (id, company_id, title) VALUES (?, ?, ?)`,
      [consultationId, companyId, 'Strategy Discovery Consultation']
    );

    // Initial AI welcome message
    await db.run(
      `INSERT INTO chat_messages (id, consultation_id, sender, content) VALUES (?, ?, 'ai', ?)`,
      [
        generateId(),
        consultationId,
        `Welcome to AI Marketing Consultant. I am your Senior AI Marketing Partner. Let's build your data-driven growth strategy. Tell me what your company does, who you serve, and what business goals you want to achieve!`
      ]
    );

    const token = generateToken({
      userId,
      companyId,
      workspaceId,
      email: email.toLowerCase().trim()
    });

    return res.status(201).json({
      token,
      user: { id: userId, email, name, companyId, workspaceId, onboardingCompleted: false },
      company: { id: companyId, name: cName }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const company = await db.get(`SELECT * FROM companies WHERE id = ?`, [user.company_id]);

    const token = generateToken({
      userId: user.id,
      companyId: user.company_id,
      workspaceId: user.workspace_id,
      email: user.email
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.company_id,
        workspaceId: user.workspace_id,
        onboardingCompleted: Boolean(user.onboarding_completed)
      },
      company: company ? { id: company.id, name: company.name } : null
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await db.get(`SELECT id, email, name, company_id, workspace_id, onboarding_completed FROM users WHERE id = ?`, [req.user!.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const company = await db.get(`SELECT * FROM companies WHERE id = ?`, [user.company_id]);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.company_id,
        workspaceId: user.workspace_id,
        onboardingCompleted: Boolean(user.onboarding_completed)
      },
      company: company ? { id: company.id, name: company.name } : null
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router;
