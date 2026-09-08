import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '../../', process.env.DATABASE_PATH)
  : path.resolve(__dirname, '../../../database/marketing_consultant.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

sqlite3.verbose();
const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Enable foreign keys
rawDb.run('PRAGMA foreign_keys = ON;');

export const db = {
  get: <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  },

  all: <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve((rows || []) as T[]);
      });
    });
  },

  run: (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec: (sql: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};
