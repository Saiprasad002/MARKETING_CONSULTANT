import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';
import { parse as csvParse } from 'csv-parse/sync';
import { db } from '../db/connection';
import { generateId } from '../utils/id';
import { extractEntitiesWithLLM } from '../ai/groqClient';

export async function processUploadedDocument(documentId: string): Promise<void> {
  const doc = await db.get(`SELECT * FROM documents WHERE id = ?`, [documentId]);
  if (!doc) throw new Error('Document record not found');

  try {
    // 1. Update status to Processing
    await db.run(`UPDATE documents SET status = 'Processing' WHERE id = ?`, [documentId]);

    const filePath = doc.storage_path;
    let extractedText = '';

    const ext = path.extname(doc.filename).toLowerCase();

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = xlsx.readFile(filePath);
      let sheetTexts: string[] = [];
      workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        sheetTexts.push(xlsx.utils.sheet_to_csv(sheet));
      });
      extractedText = sheetTexts.join('\n');
    } else if (ext === '.csv') {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const records = csvParse(fileContent, { skip_empty_lines: true });
      extractedText = records.map((r: any) => r.join(' | ')).join('\n');
    } else {
      // txt or general text file
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No readable text content could be extracted from document.');
    }

    // 2. Status -> Analyzing
    await db.run(`UPDATE documents SET status = 'Analyzing' WHERE id = ?`, [documentId]);

    // Save document chunks
    const chunkSize = 1500;
    let index = 0;
    for (let i = 0; i < extractedText.length; i += chunkSize) {
      const chunk = extractedText.substring(i, i + chunkSize);
      await db.run(
        `INSERT INTO document_chunks (id, document_id, chunk_index, content) VALUES (?, ?, ?, ?)`,
        [generateId(), documentId, index++, chunk]
      );
    }

    // 3. AI Entity Extraction on extracted text
    const extractedEntities = await extractEntitiesWithLLM(extractedText);

    let insightsCount = 0;
    for (const [key, val] of Object.entries(extractedEntities)) {
      if (val !== null && val !== undefined && val !== '') {
        const insightId = generateId();
        await db.run(
          `INSERT INTO document_insights (id, document_id, key_name, value_text, confidence, verified)
           VALUES (?, ?, ?, ?, 0.9, 0)`,
          [insightId, documentId, key, typeof val === 'object' ? JSON.stringify(val) : String(val)]
        );
        insightsCount++;
      }
    }

    // 4. Update status to Processed
    await db.run(
      `UPDATE documents SET status = 'Processed', insights_count = ?, error_message = NULL WHERE id = ?`,
      [insightsCount, documentId]
    );

  } catch (error: any) {
    console.error(`Document processing failed for ${documentId}:`, error);
    await db.run(
      `UPDATE documents SET status = 'Error', error_message = ? WHERE id = ?`,
      [error.message || 'Processing failed', documentId]
    );
  }
}
