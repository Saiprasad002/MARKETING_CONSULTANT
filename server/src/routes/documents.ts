import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db/connection';
import { generateId } from '../utils/id';
import { processUploadedDocument } from '../documents/extractor';

const router = Router();

const uploadDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.xls', '.csv', '.pptx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type ${ext}. Allowed: PDF, DOCX, XLSX, CSV, PPTX, TXT`));
    }
  }
});

// GET /api/documents
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await db.all(
      `SELECT id, company_id, filename, original_name, file_type, size, status, error_message, insights_count, uploaded_at
       FROM documents
       WHERE company_id = ?
       ORDER BY uploaded_at DESC`,
      [req.user!.companyId]
    );

    const documents = rows.map(r => ({
      id: r.id,
      companyId: r.company_id,
      filename: r.filename,
      originalName: r.original_name,
      fileType: r.file_type,
      size: r.size,
      status: r.status,
      errorMessage: r.error_message,
      insightsCount: r.insights_count,
      uploadedAt: r.uploaded_at
    }));

    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents
router.post('/', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const companyId = req.user!.companyId;
    const docId = generateId();
    const ext = path.extname(req.file.originalname).toLowerCase();

    await db.run(
      `INSERT INTO documents (id, company_id, filename, original_name, file_type, size, storage_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Uploading')`,
      [docId, companyId, req.file.filename, req.file.originalname, ext, req.file.size, req.file.path]
    );

    // Trigger async processing in background
    processUploadedDocument(docId).catch(err => console.error('Background document processing failed:', err));

    return res.status(201).json({
      id: docId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'Uploading'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// POST /api/documents/:id/process
router.post('/:id/process', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docId = req.params.id;
    const doc = await db.get(`SELECT id FROM documents WHERE id = ? AND company_id = ?`, [docId, req.user!.companyId]);

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    processUploadedDocument(docId).catch(err => console.error('Reprocess failed:', err));

    return res.json({ message: 'Document re-processing started', id: docId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process document' });
  }
});

// GET /api/documents/:id/insights
router.get('/:id/insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docId = req.params.id;
    const insights = await db.all(
      `SELECT * FROM document_insights WHERE document_id = ? ORDER BY created_at DESC`,
      [docId]
    );

    return res.json(insights);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch document insights' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docId = req.params.id;
    const doc = await db.get(`SELECT * FROM documents WHERE id = ? AND company_id = ?`, [docId, req.user!.companyId]);

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Delete local file if exists
    if (fs.existsSync(doc.storage_path)) {
      try { fs.unlinkSync(doc.storage_path); } catch (e) {}
    }

    await db.run(`DELETE FROM documents WHERE id = ?`, [docId]);

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
