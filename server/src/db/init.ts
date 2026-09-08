import fs from 'fs';
import path from 'path';
import { db } from './connection';

export async function initDatabase(): Promise<void> {
  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await db.exec(sql);
      console.log('Database schema initialized successfully.');
    } else {
      console.warn('Schema file not found at:', schemaPath);
    }

    // Migration for existing database instances
    try {
      await db.exec('ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;');
    } catch (e) {
      // Column likely already exists, ignore duplicate column error
    }
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}
