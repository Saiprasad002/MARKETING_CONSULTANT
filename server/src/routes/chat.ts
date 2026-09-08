import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db/connection';
import { generateId } from '../utils/id';
import { getCompanyProfile, updateProfileField } from '../services/profileService';
import { extractEntitiesWithLLM, generateUnifiedConsultantResponse, callLLM } from '../ai/groqClient';
import { detectAndRecordConflicts } from '../analytics/conflictDetector';
import { SYSTEM_PROMPTS } from '../ai/promptTemplates';
import { safeParseJSON } from '../ai/jsonParser';
import { generateExecutiveReport } from '../analytics/analyticsEngine';

const router = Router();

// GET /api/chat/messages
router.get('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultation = await db.get(
      `SELECT id FROM consultations WHERE company_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
      [req.user!.companyId]
    );

    if (!consultation) return res.json({ messages: [] });

    const rows = await db.all(
      `SELECT id, sender, content, extracted_entities_json, auditable_answer_json, created_at
       FROM chat_messages
       WHERE consultation_id = ?
       ORDER BY created_at ASC`,
      [consultation.id]
    );

    const messages = rows.map(r => ({
      id: r.id,
      consultationId: consultation.id,
      sender: r.sender,
      content: r.content,
      extractedEntities: r.extracted_entities_json ? JSON.parse(r.extracted_entities_json) : undefined,
      auditableAnswer: r.auditable_answer_json ? JSON.parse(r.auditable_answer_json) : undefined,
      timestamp: r.created_at
    }));

    return res.json({ consultationId: consultation.id, messages });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat/message (Unified AI Consultant Chat)
router.post('/message', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    let consultation = await db.get(
      `SELECT id FROM consultations WHERE company_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );

    if (!consultation) {
      const cId = generateId();
      await db.run(
        `INSERT INTO consultations (id, company_id, title) VALUES (?, ?, 'Strategy Discovery Consultation')`,
        [cId, companyId]
      );
      consultation = { id: cId };
    }

    // 1. Save User Message
    const userMsgId = generateId();
    await db.run(
      `INSERT INTO chat_messages (id, consultation_id, sender, content) VALUES (?, ?, 'user', ?)`,
      [userMsgId, consultation.id, message]
    );

    // 2. Perform AI Entity Extraction in background
    const extracted = await extractEntitiesWithLLM(message);

    const currentProfile = await getCompanyProfile(companyId);

    // Detect data conflicts before updating
    const conflicts = await detectAndRecordConflicts(companyId, currentProfile, extracted, 'Latest conversation');

    // Update company profile with extracted entities
    if (extracted.companyName) await updateProfileField(companyId, 'identity', 'name', extracted.companyName, 'user_chat');
    if (extracted.industry) await updateProfileField(companyId, 'identity', 'industry', extracted.industry, 'user_chat');
    if (extracted.businessType) await updateProfileField(companyId, 'identity', 'businessType', extracted.businessType, 'user_chat');
    if (extracted.monthlyBudget) await updateProfileField(companyId, 'marketing', 'monthlyBudget', extracted.monthlyBudget, 'user_chat');
    if (extracted.primaryGoal) await updateProfileField(companyId, 'goals', 'primaryGoal', extracted.primaryGoal, 'user_chat');
    if (extracted.idealCustomer) await updateProfileField(companyId, 'targetCustomer', 'idealCustomer', extracted.idealCustomer, 'user_chat');

    // Fetch updated history and company profile
    const historyRows = await db.all(
      `SELECT sender, content FROM chat_messages WHERE consultation_id = ? ORDER BY created_at ASC`,
      [consultation.id]
    );

    const updatedProfile = await getCompanyProfile(companyId);
    const analyticsReport = generateExecutiveReport(updatedProfile);

    // 3. Generate Unified AI Consultant Response (combines strategy & analytics context)
    const aiResult = await generateUnifiedConsultantResponse(
      historyRows.map(r => ({ sender: r.sender, content: r.content })),
      updatedProfile,
      analyticsReport
    );

    if (aiResult.error) {
      return res.status(400).json({ error: aiResult.error });
    }

    const aiMsgId = generateId();
    await db.run(
      `INSERT INTO chat_messages (id, consultation_id, sender, content, extracted_entities_json)
       VALUES (?, ?, 'ai', ?, ?)`,
      [aiMsgId, consultation.id, aiResult.text, JSON.stringify(extracted)]
    );

    return res.json({
      userMessage: { id: userMsgId, sender: 'user', content: message },
      aiMessage: { id: aiMsgId, sender: 'ai', content: aiResult.text, extractedEntities: extracted },
      conflicts,
      extractedEntities: extracted
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

// POST /api/chat/analytics (Forward to unified AI consultant response for backwards compatibility)
router.post('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const profile = await getCompanyProfile(companyId);
    const report = generateExecutiveReport(profile);

    const promptContext = `
VERIFIED COMPANY DATA:
${JSON.stringify(profile, null, 2)}

CALCULATED METRICS & KPIS:
${JSON.stringify(report.kpiAnalysis, null, 2)}

SWOT ANALYSIS:
${JSON.stringify(report.swot, null, 2)}

RECOMMENDATIONS:
${JSON.stringify(report.recommendations, null, 2)}

User Question: "${question}"
`;

    const llmResult = await callLLM(SYSTEM_PROMPTS.UNIFIED_AI_CONSULTANT, promptContext);

    if (llmResult.error) {
      return res.status(400).json({ error: llmResult.error });
    }

    return res.json({
      auditableAnswer: {
        answer: llmResult.text,
        facts: [profile.identity?.name?.value, profile.identity?.industry?.value].filter(Boolean),
        calculations: [],
        recommendations: [],
        missingData: [],
        confidence: 0.95,
        sources: ['verified_company_profile', 'calculated_analytics']
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to answer analytics question' });
  }
});

// POST /api/chat/reset
router.post('/reset', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    await db.run(`UPDATE consultations SET status = 'ARCHIVED' WHERE company_id = ?`, [companyId]);

    const newId = generateId();
    await db.run(
      `INSERT INTO consultations (id, company_id, title) VALUES (?, ?, 'Strategy Discovery Consultation')`,
      [newId, companyId]
    );

    return res.json({ message: 'Conversation reset successfully', consultationId: newId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset chat' });
  }
});

export default router;
