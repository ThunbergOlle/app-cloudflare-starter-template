# Database Table Addition Guide

This guide provides a comprehensive walkthrough for adding new database tables to the Aperto backend. Follow these steps to ensure proper schema design, migration handling, testing, and deployment.

## Table of Contents

1. [Overview](#overview)
2. [Schema Design & Implementation](#schema-design--implementation)
3. [Migration Generation & Management](#migration-generation--management)
4. [Local Development Workflow](#local-development-workflow)
5. [Testing Integration](#testing-integration)
6. [Production Deployment](#production-deployment)
7. [Code Integration Patterns](#code-integration-patterns)
8. [Development Scripts & Tools](#development-scripts--tools)
9. [Complete Walkthrough Example](#complete-walkthrough-example)
10. [Troubleshooting](#troubleshooting)

## Overview

The backend uses:

- **Drizzle ORM** for schema definitions and queries
- **SQLite/D1** as the database (Cloudflare D1 in production, SQLite locally)
- **Drizzle Kit** for migration generation and management
- **Vitest + Miniflare** for testing with an in-memory database

### Architecture

```
src/db/schema.ts          # All table definitions
drizzle/                  # Generated migration files
src/lib/[domain]/         # Domain-specific operations and procedures
src/lib/[domain]/__tests__/ # Domain-specific tests
```

## Schema Design & Implementation

### 1. Define Your Table in `src/db/schema.ts`

All table definitions live in a single schema file. Use Drizzle ORM's SQLite table syntax:

```typescript
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const yourTableName = sqliteTable('your_table_name', {
  id: int().primaryKey({ autoIncrement: true }),
  // Add your columns here
  name: text().notNull(),
  description: text(),
  createdAt: int('created_at').notNull().default(Date.now()),
  updatedAt: int('updated_at').notNull().default(Date.now()),

  // Foreign key example
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
});
```

### 2. Naming Conventions

- **Table names**: Use `snake_case` for database table names
- **Variable names**: Use `camelCase` for TypeScript variable names
- **Column names**: Use `snake_case` for database columns, but map to `camelCase` in TypeScript if needed
- **Foreign keys**: End with `_id` and reference the primary key of the related table

### 3. Column Types and Best Practices

```typescript
// Primary key (required for all tables)
id: int().primaryKey({ autoIncrement: true }),

// Text fields
name: text().notNull(),                    // Required text
description: text(),                       // Optional text
email: text().notNull().unique(),          // Unique constraint

// Numbers
count: int().notNull().default(0),         // Integer with default
price: int().notNull(),                    // Store cents/smallest unit

// Booleans (stored as integers)
isActive: int({ mode: "boolean" }).notNull().default(true),

// Timestamps (store as Unix timestamp integers)
createdAt: int("created_at").notNull().default(Date.now()),

// Foreign keys
userId: int("user_id").notNull().references(() => users.id),
categoryId: int("category_id").references(() => categories.id), // Optional FK
```

### 4. Relationships

Export your table and define relationships:

```typescript
export const categories = sqliteTable('categories', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const products = sqliteTable('products', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  categoryId: int('category_id')
    .notNull()
    .references(() => categories.id),
});

// For many-to-many relationships, create junction tables
export const productTags = sqliteTable('product_tags', {
  productId: int('product_id')
    .notNull()
    .references(() => products.id),
  tagId: int('tag_id')
    .notNull()
    .references(() => tags.id),
});
```

## Migration Generation & Management

### 1. Generate Migrations

After modifying `src/db/schema.ts`, generate a migration:

```bash
# Install drizzle-kit if not already installed
npm install -g drizzle-kit

# Generate migration (run from backend directory)
npx drizzle-kit generate
```

This creates a new file in `drizzle/` with auto-generated names like `0006_rich_wolverine.sql`.

### 2. Migration File Structure

Generated migration files contain SQL statements:

```sql
-- Example migration file: drizzle/0006_rich_wolverine.sql
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);
```

### 3. Migration Best Practices

- **Review generated SQL**: Always inspect the generated migration before applying
- **Test migrations**: Run migrations in development first
- **Backup production**: Always backup before applying migrations to production
- **Rollback plan**: Know how to revert changes if needed

### 4. Custom Migrations

If you need to modify the generated SQL:

1. Edit the migration file directly
2. Add data transformations if needed
3. Include any necessary `INSERT` or `UPDATE` statements for data migration

```sql
-- Custom data migration example
CREATE TABLE `new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
-- Migrate existing data
INSERT INTO `new_products` (`id`, `name`, `slug`)
SELECT `id`, `name`, LOWER(REPLACE(`name`, ' ', '-')) as `slug`
FROM `products`;
--> statement-breakpoint
DROP TABLE `products`;
--> statement-breakpoint
ALTER TABLE `new_products` RENAME TO `products`;
```

## Local Development Workflow

### 1. Apply Migrations Locally

The development setup automatically handles migrations:

```bash
# This runs migrations automatically
npm run dev

# Or run migrations manually
npm run dev:setup
```

### 2. Development Database Location

Your persistent development database is stored in:

```
./.wrangler-persist/state/v3/d1/miniflare-D1DatabaseObject/
```

### 3. Query Your New Table

Test your new table with sample queries:

```bash
# Query your new table
npm run dev:query -- --command="SELECT * FROM your_table_name;"

# Check table structure
npm run dev:query -- --command="PRAGMA table_info(your_table_name);"

# List all tables
npm run dev:query -- --command=".tables"
```

## Testing Integration

### 1. Test Database Setup

Tests use Vitest with Miniflare for an isolated test environment configured in `vitest.config.ts`:

```typescript
export default defineWorkersConfig({
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    poolOptions: {
      workers: {
        miniflare: {
          d1Databases: ['DB'],
          d1Persist: './test-db',
        },
      },
    },
  },
});
```

### 2. Writing Tests for New Tables

Create tests in `src/lib/[domain]/__tests__/`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { yourTableName, users } from '../../../db/schema';

describe('YourTable Operations', () => {
  const db = drizzle(env.DB);

  beforeEach(async () => {
    // Clean up test data
    await db.delete(yourTableName).execute();
    await db.delete(users).execute();
  });

  it('should create a new record', async () => {
    // Setup test user
    const [user] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        password: 'hashedpwd',
        salt: 'salt',
      })
      .returning();

    // Test your table operations
    const [record] = await db
      .insert(yourTableName)
      .values({
        name: 'Test Record',
        userId: user.id,
      })
      .returning();

    expect(record.name).toBe('Test Record');
    expect(record.userId).toBe(user.id);
  });
});
```

### 3. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Test Data Management

For consistent test data, create helper functions:

```typescript
// In your test file
async function createTestUser(db: any) {
  const [user] = await db
    .insert(users)
    .values({
      email: `test-${Date.now()}@example.com`,
      password: 'hashedpwd',
      salt: 'salt',
    })
    .returning();
  return user;
}

async function createTestRecord(db: any, userId: number) {
  const [record] = await db
    .insert(yourTableName)
    .values({
      name: 'Test Record',
      userId: userId,
    })
    .returning();
  return record;
}
```

## Production Deployment

### 1. Pre-deployment Checklist

Before deploying migrations:

- ✅ Test migrations locally
- ✅ Review generated SQL
- ✅ Backup production database
- ✅ Test rollback procedure
- ✅ Verify dependent code is ready

### 2. Apply Migrations to Production

Migrations are automatically applied during deployment:

```bash
# The predeploy script applies migrations
npm run deploy

# Or apply migrations manually to remote database
npx wrangler d1 migrations apply DB --remote
```

### 3. Deployment Process

The `package.json` includes a predeploy hook:

```json
{
  "scripts": {
    "predeploy": "wrangler d1 migrations apply DB --remote",
    "deploy": "wrangler deploy"
  }
}
```

### 4. Rollback Strategy

If you need to rollback:

1. **Code rollback**: Deploy previous version of your Worker
2. **Schema rollback**: Manually create and apply a rollback migration
3. **Data restoration**: Restore from backup if needed

```sql
-- Example rollback migration
DROP TABLE IF EXISTS `your_new_table`;
--> statement-breakpoint
-- Restore previous schema changes if needed
ALTER TABLE `existing_table` DROP COLUMN `new_column`;
```

## Code Integration Patterns

### 1. Operations Layer

Create operations for your table in `src/lib/[domain]/operations.ts`:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { yourTableName } from '../../db/schema';
import type { Context } from '../../trpc';

export interface YourTableData {
  name: string;
  description?: string;
  userId: number;
}

export async function createRecord(
  data: YourTableData,
  ctx: Context,
): Promise<{ id: number }> {
  const db = drizzle(ctx.env.DB);

  const [result] = await db
    .insert(yourTableName)
    .values({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .returning({ id: yourTableName.id });

  return result;
}

export async function getRecordsForUser(
  userId: number,
  ctx: Context,
): Promise<Array<{ id: number; name: string; description: string | null }>> {
  const db = drizzle(ctx.env.DB);

  return await db
    .select({
      id: yourTableName.id,
      name: yourTableName.name,
      description: yourTableName.description,
    })
    .from(yourTableName)
    .where(eq(yourTableName.userId, userId))
    .orderBy(desc(yourTableName.createdAt));
}

export async function updateRecord(
  id: number,
  data: Partial<YourTableData>,
  ctx: Context,
): Promise<boolean> {
  const db = drizzle(ctx.env.DB);

  const result = await db
    .update(yourTableName)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(yourTableName.id, id))
    .execute();

  return result.changes > 0;
}

export async function deleteRecord(id: number, ctx: Context): Promise<boolean> {
  const db = drizzle(ctx.env.DB);

  const result = await db
    .delete(yourTableName)
    .where(eq(yourTableName.id, id))
    .execute();

  return result.changes > 0;
}
```

### 2. tRPC Procedures

Create tRPC procedures in `src/lib/[domain]/procedures.ts`:

```typescript
import { z } from 'zod';
import { protectedProcedure } from '../auth';
import {
  createRecord,
  getRecordsForUser,
  updateRecord,
  deleteRecord,
} from './operations';

export const createRecordProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const result = await createRecord(
      {
        name: input.name,
        description: input.description,
        userId: ctx.user.id,
      },
      ctx,
    );

    ctx.log.info('Record created', {
      recordId: result.id,
      userId: ctx.user.id,
    });

    return result;
  });

export const getMyRecordsProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    return await getRecordsForUser(ctx.user.id, ctx);
  },
);

export const updateRecordProcedure = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...updateData } = input;

    const success = await updateRecord(id, updateData, ctx);

    if (!success) {
      throw new Error('Record not found or update failed');
    }

    ctx.log.info('Record updated', { recordId: id, userId: ctx.user.id });

    return { success: true };
  });

export const deleteRecordProcedure = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const success = await deleteRecord(input.id, ctx);

    if (!success) {
      throw new Error('Record not found or delete failed');
    }

    ctx.log.info('Record deleted', { recordId: input.id, userId: ctx.user.id });

    return { success: true };
  });
```

### 3. Add to Main Router

Update your main tRPC router to include the new procedures:

```typescript
// In src/trpc.ts or your main router file
import {
  createRecordProcedure,
  getMyRecordsProcedure,
  updateRecordProcedure,
  deleteRecordProcedure,
} from './lib/your-domain/procedures';

export const appRouter = router({
  // ... existing procedures
  createRecord: createRecordProcedure,
  getMyRecords: getMyRecordsProcedure,
  updateRecord: updateRecordProcedure,
  deleteRecord: deleteRecordProcedure,
});
```

### 4. Type Safety

Leverage TypeScript for full type safety:

```typescript
// Extract types from your schema
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { yourTableName } from '../../db/schema';

export type YourTable = InferSelectModel<typeof yourTableName>;
export type YourTableInsert = InferInsertModel<typeof yourTableName>;

// Use in your operations
export async function getRecord(
  id: number,
  ctx: Context,
): Promise<YourTable | null> {
  const db = drizzle(ctx.env.DB);

  return await db
    .select()
    .from(yourTableName)
    .where(eq(yourTableName.id, id))
    .get();
}
```

## Development Scripts & Tools

### 1. Query Helpers

Create query scripts for common database operations:

```bash
# Add to package.json scripts
{
  "scripts": {
    "db:tables": "npm run dev:query -- --command='SELECT name FROM sqlite_master WHERE type=\"table\" ORDER BY name;'",
    "db:describe": "npm run dev:query -- --command='PRAGMA table_info($TABLE_NAME);'",
    "db:count": "npm run dev:query -- --command='SELECT COUNT(*) as count FROM $TABLE_NAME;'"
  }
}
```

## Complete Walkthrough Example

Let's add a `categories` table step by step:

### Step 1: Define the Schema

Add to `src/db/schema.ts`:

```typescript
export const categories = sqliteTable('categories', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  createdByUserId: int('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: int('created_at').notNull().default(Date.now()),
  updatedAt: int('updated_at').notNull().default(Date.now()),
});
```

### Step 2: Generate Migration

```bash
npx drizzle-kit generate
```

This creates a file like `drizzle/0006_heavy_daredevil.sql`:

```sql
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by_user_id` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);
```

### Step 3: Apply Migration Locally

```bash
npm run dev:setup
```

### Step 4: Test the New Table

```bash
# Check table was created
npm run dev:query -- --command="PRAGMA table_info(categories);"

# Insert test data
npm run dev:query -- --command="INSERT INTO categories (name, description, created_by_user_id) VALUES ('Technology', 'Tech-related items', 1);"

# Query the data
npm run dev:query -- --command="SELECT * FROM categories;"
```

### Step 5: Create Operations

Create `src/lib/category/operations.ts`:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { categories } from '../../db/schema';
import type { Context } from '../../trpc';

export interface CategoryData {
  name: string;
  description?: string;
}

export async function createCategory(
  data: CategoryData,
  ctx: Context,
): Promise<{ id: number }> {
  const db = drizzle(ctx.env.DB);

  const [result] = await db
    .insert(categories)
    .values({
      ...data,
      createdByUserId: ctx.user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .returning({ id: categories.id });

  return result;
}

export async function getAllCategories(
  ctx: Context,
): Promise<Array<{ id: number; name: string; description: string | null }>> {
  const db = drizzle(ctx.env.DB);

  return await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .orderBy(categories.name);
}
```

### Step 6: Create Procedures

Create `src/lib/category/procedures.ts`:

```typescript
import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../auth';
import { createCategory, getAllCategories } from './operations';

export const createCategoryProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const result = await createCategory(input, ctx);
    ctx.log.info('Category created', { categoryId: result.id });
    return result;
  });

export const getCategoriesProcedure = publicProcedure.query(async ({ ctx }) => {
  return await getAllCategories(ctx);
});
```

### Step 7: Add to Router

Update your main router:

```typescript
import {
  createCategoryProcedure,
  getCategoriesProcedure,
} from './lib/category/procedures';

export const appRouter = router({
  // ... existing procedures
  createCategory: createCategoryProcedure,
  getCategories: getCategoriesProcedure,
});
```

### Step 8: Write Tests

Create `src/lib/category/__tests__/operations.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { categories, users } from '../../../db/schema';
import { createCategory, getAllCategories } from '../operations';
import type { Context } from '../../../trpc';

describe('Category Operations', () => {
  const db = drizzle(env.DB);
  let mockContext: Context;

  beforeEach(async () => {
    await db.delete(categories).execute();
    await db.delete(users).execute();

    const [user] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        password: 'hashedpwd',
        salt: 'salt',
      })
      .returning();

    mockContext = {
      env,
      user: { id: user.id, email: user.email },
      log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    } as any;
  });

  it('should create a new category', async () => {
    const result = await createCategory(
      {
        name: 'Technology',
        description: 'Tech-related items',
      },
      mockContext,
    );

    expect(result.id).toBeDefined();

    const categories = await getAllCategories(mockContext);
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Technology');
  });
});
```

### Step 10: Test Everything

```bash
# Run tests
npm test

# Test queries
npm run dev:query -- --command="SELECT * FROM categories;"

# Deploy to production
npm run deploy
```

## Troubleshooting

### Common Issues

**Migration not applying**

- Check that the migration file exists in `drizzle/`
- Verify SQL syntax is correct
- Run `npm run dev:reset` to start fresh

**Table not found errors**

- Ensure migrations have been applied: `npm run dev:setup`
- Check table name matches schema definition
- Verify you're using the correct database in tests

**Foreign key constraint errors**

- Ensure referenced tables exist
- Check that referenced columns have correct values
- Consider using cascading deletes or nullifying references

**Type errors**

- Regenerate types: `npm run cf-typegen`
- Ensure schema exports match imports
- Check TypeScript configuration

**Test database issues**

- Clear test database: `rm -rf ./test-db`
- Check Vitest configuration in `vitest.config.ts`
- Ensure test setup files are properly configured

### Debugging Tips

1. **Check table structure**:

   ```bash
   npm run dev:query -- --command="PRAGMA table_info(your_table_name);"
   ```

2. **View all tables**:

   ```bash
   npm run dev:query -- --command=".tables"
   ```

3. **Check foreign key constraints**:

   ```bash
   npm run dev:query -- --command="PRAGMA foreign_key_list(your_table_name);"
   ```

4. **View migration history**:

   ```bash
   npm run dev:query -- --command="SELECT * FROM __drizzle_migrations;"
   ```

5. **Enable SQL logging** in development:
   ```typescript
   const db = drizzle(ctx.env.DB, { logger: true });
   ```

### Getting Help

- Check the [Drizzle ORM documentation](https://orm.drizzle.team/)
- Review [Cloudflare D1 documentation](https://developers.cloudflare.com/d1/)
- Look at existing table implementations in the codebase
- Run tests to see working examples

Remember: When in doubt, test your changes locally first, and always have a rollback plan for production deployments.
