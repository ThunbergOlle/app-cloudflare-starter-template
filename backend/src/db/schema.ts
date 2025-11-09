import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  email: text(),
  password: text(),
  locale: text().notNull().default('sv'),
  salt: text(),
  firstName: text(),
  provider: text().notNull().default('email'), // 'email' | 'apple'
  externalId: text(), // Apple user identifier
  appleIdentityToken: text(), // For Apple token verification
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int()
    .notNull()
    .references(() => users.id),
  token: text().notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  used: int({ mode: 'boolean' }).notNull().default(false),
});
