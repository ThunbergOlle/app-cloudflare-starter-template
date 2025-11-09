# Development Guide

This guide covers local development workflows for the backend.

## Persistent Local Database

The development server now uses a persistent local database that survives restarts.

### Key Features

- 🗄️ **Persistent Storage**: Database data persists between `npm run dev` restarts
- 📁 **Dedicated Directory**: Uses `./.wrangler-persist/` for consistent file locations

### Commands

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Start development server with persistent database (auto-setup) |
| `npm run dev:setup` | Set up development database with all migrations                |
| `npm run dev:query` | Query the persistent development database                      |

### Examples

```bash
# Start development server
npm run dev

# Query your data
npm run dev:query -- --command="SELECT * FROM monument_scans;"

# Query with SQL file
echo "SELECT name, reusedCount FROM monument_scans ORDER BY reusedCount DESC;" > query.sql
npm run dev:query -- --file=query.sql

# Reset everything and start fresh
npm run dev:reset
```

### Database Location

Your persistent development database is stored in:

```
./.wrangler-persist/state/v3/d1/miniflare-D1DatabaseObject/
```

This directory is gitignored and will persist between restarts.

### Connecting with External Tools

You can connect SQLite browsers directly to your persistent database:

```bash
# Find the database file
find .wrangler-persist -name "*.sqlite" -type f

# Open with DB Browser for SQLite or similar tool
```

### Migration Workflow

When you add new migrations:

1. Create your migration file in `drizzle/`
2. Run `npm run dev` (automatically applies migrations)
3. Your existing data will be preserved

### Troubleshooting

**Database not persisting?**

- Ensure you're using `npm run dev` (not `wrangler dev` directly)
- Check that `.wrangler-persist/` directory exists

**Want to start completely fresh?**

```bash
npm run dev:reset
```
