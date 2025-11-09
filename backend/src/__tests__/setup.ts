import { vi, beforeAll } from 'vitest';
import { env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';

// Export env for use in test files
export { env };

// Mock the logger to be silent during tests (can be overridden in specific test files)
vi.mock('../lib/logger', () => {
  return {
    Logger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

async function createTablesFromSchema() {
  const db = drizzle(env.DB);

  // All tables based on your schema - single source of truth for tests
  // Keep this synchronized with your schema.ts file
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'sv',
      firstName TEXT,
      provider TEXT NOT NULL DEFAULT 'email',
      externalId TEXT,
      appleIdentityToken TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      userId INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,
  ];

  for (const sql of tables) {
    try {
      await db.run(sql);
    } catch (error) {
      console.warn('Table creation warning:', error.message);
    }
  }

  console.log('✅ Database schema created successfully');
}

// Apply all table creation before running tests
beforeAll(async () => {
  await createTablesFromSchema();
});
