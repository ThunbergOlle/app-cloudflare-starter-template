# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Example Cloudflare Workers-based backend

- **Cloudflare Workers** with TypeScript as the runtime
- **Cloudflare D1** (SQLite) as the database with persistent local development
- **Drizzle ORM** for database operations and migrations
- **tRPC** for type-safe API endpoints
- **Vitest + Miniflare** for testing
- **R2 Object Storage** for image storage 

## Development Commands

### Core Development

```bash
npm run dev              # Start development server with persistent DB (auto-setup)
npm run dev:setup        # Set up development database with all migrations
npm run dev:query        # Query the persistent development database
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Database Operations

```bash
npx drizzle-kit generate # Generate new migration after schema changes
npm run generate         # Same as above (alias)
npm run check           # TypeScript check and dry-run deploy
npm run cf-typegen      # Generate Cloudflare types
```

### Deployment

```bash
npm run deploy          # Deploy to production (applies migrations first)
npm run predeploy       # Apply migrations to remote DB
```

### Database Querying Examples

```bash
# Query specific table
npm run dev:query -- --command="SELECT * FROM monument_scans;"

# Query with SQL file
echo "SELECT name, reusedCount FROM monument ORDER BY reusedCount DESC;" > query.sql
npm run dev:query -- --file=query.sql

# Check table structure
npm run dev:query -- --command="PRAGMA table_info(monument);"

# List all tables
npm run dev:query -- --command=".tables"
```

## Architecture

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed monument scanning architecture and optimization strategy.**

### Directory Structure

```
src/
├── db/schema.ts                 # All database table definitions
├── trpc.ts                      # tRPC router setup, auth middleware
├── index.ts                     # Main Worker entry point
├── types.ts                     # Global type definitions
└── lib/
    ├── auth/                    # Authentication & JWT handling
    ├── external/                # External API integrations (OpenAI, Google, etc.)
    ├── logger.ts                # Centralized logging with request IDs
    ├── scanning/                # Monument scanning & image upload
    └── user/                    # User management procedures
```

### Database Schema

- **users**: User accounts with email, locale, salted passwords
- **monument**: Monument data with generated guide text, reuse tracking
- **monument_scan_images**: Images stored in R2 with photographer references

### tRPC Architecture

- **procedure**: Base procedure with error logging
- **protectedProcedure**: Requires authentication (JWT token)
- All procedures in `src/lib/*/procedures.ts` files
- Authentication middleware extracts Bearer tokens and validates JWT

### Database Development

- **Persistent Local DB**: Uses `.wrangler-persist/` directory (never delete this)
- **Migrations**: Generated in `drizzle/` directory, auto-applied on `npm run dev`
- **Testing**: Uses in-memory D1 database via Miniflare in `./test-db`

## Key Patterns

### Adding New Database Tables

1. Define schema in `src/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Apply locally: `npm run dev:setup`
4. Create operations in `src/lib/[domain]/operations.ts`
5. Create procedures in `src/lib/[domain]/procedures.ts`
6. Add procedures to main router in `src/index.ts`
7. Write tests in `src/lib/[domain]/__tests__/`

### Authentication Pattern

```typescript
// Protected procedures automatically have ctx.user available
export const myProcedure = protectedProcedure
  .input(z.object({...}))
  .mutation(async ({ input, ctx }) => {
    // ctx.user.id and ctx.user.email are guaranteed to exist
    // ctx.log is request-scoped logger with user ID
  });
```

### External API Integrations

- APIs are in `src/lib/external/[service]/api.ts`
- Include proper error handling and logging
- Use environment variables for API keys (set via Wrangler secrets)

### Logging

- All operations use context-aware logger: `ctx.log.info/error/warn/debug`
- Request IDs automatically generated and tracked
- User IDs included in logs for protected procedures

## Environment & Secrets

### Required Wrangler Secrets

```bash
wrangler secret put JWT_SECRET          # For token signing
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put RESEND_API_KEY      # For password reset emails
```

### Environment Variables

- `ENVIRONMENT`: "development" or "production" (set in wrangler.json)

## Testing

### Test Structure

- Tests use Vitest with Miniflare for D1 simulation
- Test database persists in `./test-db` directory
- Setup file: `src/__tests__/setup.ts`
- Domain-specific tests: `src/lib/[domain]/__tests__/`

### Test Patterns

```typescript
// Use env.DB for database access in tests
const db = drizzle(env.DB);

// Clean up in beforeEach
beforeEach(async () => {
  await db.delete(tableName).execute();
});

// Create test data helpers
async function createTestUser(db: any) {
  return await db.insert(users).values({...}).returning();
}
```

## Common Operations

### Database Migrations

- Always review generated SQL before applying
- Test migrations locally first
- Production migrations auto-apply during deployment

### Adding New API Endpoints

1. Create operation functions in appropriate domain
2. Create tRPC procedure with input validation
3. Add to main router in `src/index.ts`
4. Write comprehensive tests

### Image Storage

- Uses Cloudflare R2 for monument images
- Bindings: `IMAGE_BUCKET` (env-specific bucket names)
- Images uploaded via `uploadImage` procedure

## Analytics

### Analytics Engine

Monument scanning performance metrics are tracked using Cloudflare Analytics Engine:

- **Binding**: `ANALYTICS`
- **No local development** - writes are fire-and-forget, no-ops in local dev
- **Grafana integration** available for visualization

## Important Notes

- **Never delete `.wrangler-persist/`** - contains persistent local database
- **Always use `npm run dev`** for development (not `wrangler dev` directly)
- **Schema changes require migration generation** via `npx drizzle-kit generate`
- **All API endpoints are tRPC procedures** - no direct REST endpoints
- **Authentication uses JWT tokens** in Authorization header as Bearer tokens
- You can never generate database migration files, aka never run "npx drizzle-kit generate"
