# Secrets Management Guide

## Overview

This project uses Cloudflare Workers secrets for secure API key management across development and production environments.

## Development Environment

### Setup

1. Copy the example environment file:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Fill in your actual API keys in `.dev.vars`:

   ```bash
   JWT_SECRET=your-strong-random-jwt-secret
   ```

3. The `.dev.vars` file is automatically ignored by git and only used locally.

### Development Commands

```bash
# Run with development environment
wrangler dev

# Run tests (uses .dev.vars automatically)
npm test
```

## Production Environment

### Setting up Production Secrets

Use Wrangler CLI to set production secrets:

```bash
# Set each secret for production environment
wrangler secret put JWT_SECRET --env production
```

### Deploy to Production

```bash
# Deploy to production with secrets
wrangler deploy --env production
```

## Security Best Practices

1. **Never commit secrets to git** - `.dev.vars` is gitignored
2. **Use strong, unique JWT secrets** - Generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** - Update both local and production secrets
4. **Use Cloudflare's secret management** - Secrets are encrypted at rest
5. **Limit API key permissions** - Use least-privilege principle

## Environment Verification

Check which environment you're running:

```bash
# Development
curl http://localhost:8787/trpc/hello

# Production
curl https://your-worker.your-subdomain.workers.dev/trpc/hello
```

## Troubleshooting

### Tests failing with "Invalid or expired token"

- Ensure `.dev.vars` has the same `JWT_SECRET` that tests expect
- Check that `.dev.vars` file exists and is readable

### Production deployment failing

- Verify all required secrets are set: `wrangler secret list --env production`
- Check wrangler.json configuration is correct

### Missing environment variables

- Development: Check `.dev.vars` file exists and has all required keys
- Production: Use `wrangler secret put <KEY_NAME> --env production`
