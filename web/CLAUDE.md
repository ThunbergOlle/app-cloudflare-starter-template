# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the web frontend for Aperto, a Cloudflare Workers-based application that serves as a marketing/landing page for the Aperto mobile app. The web component uses:

- **Hono** as the web framework
- **Handlebars** for HTML templating with precompilation
- **Cloudflare Workers** as the runtime environment
- **TypeScript** for type safety

## Development Commands

```bash
# Development
npm run dev           # Start development server with automatic template watching
npm start             # Same as dev (alias)

# Build and deploy
npm run deploy        # Deploy to production with automatic template compilation

# Manual template compilation (usually not needed)
node build-templates.js
```

## Architecture

### Project Structure
```
src/
├── index.ts              # Main Hono application with routes
├── renderer.ts           # Page rendering utilities with HTML wrapper
├── types.ts              # TypeScript type definitions for templates and bindings
├── templates/            # Handlebars template source files
│   ├── HelloWorld.hbs    # Demo template with HTMX
│   ├── LandingPage.hbs   # Main landing page template
│   ├── PrivacyPolicy.hbs # Privacy policy page
│   ├── Support.hbs       # Support/contact page
│   └── PasswordReset.hbs # Password reset form
└── generated/            # Compiled templates (auto-generated, do not edit)
    ├── HelloWorld.ts
    ├── LandingPage.ts
    ├── PrivacyPolicy.ts
    ├── Support.ts
    └── PasswordReset.ts
```

### Template System
- **Source**: Handlebars templates in `src/templates/*.hbs`
- **Compilation**: `build-templates.js` precompiles templates to TypeScript modules
- **Output**: Generated TypeScript modules in `src/generated/`
- **Usage**: Import and use compiled templates in routes
- **Auto-watching**: Wrangler automatically watches `src/templates/` and rebuilds on changes

### Key Routes
- `/` - Landing page for Aperto app
- `/demo` - Demo page with HTMX interaction
- `/privacy-policy` - Privacy policy page with GDPR compliance details
- `/support` - Support and contact page
- `/user/password-reset?token=...` - Password reset form (GET)
- `/api/password-reset` - Password reset handler that proxies to backend (POST)
- `/api/increment` - Demo API endpoint for counter
- `/api/count` - Demo API endpoint to get counter value
- `/*` - Static asset handling via Cloudflare Assets binding

## Development Workflow

### Adding New Pages
1. Create Handlebars template in `src/templates/[PageName].hbs`
2. Define data types in `src/types.ts`
3. Import compiled template in `src/index.ts` (templates auto-compile on save)
4. Add route handler using the template

### Template Development
Templates are automatically watched and recompiled during development:
- **Development**: Wrangler watches `src/templates/` and auto-rebuilds on `.hbs` file changes
- **Deployment**: Templates are compiled automatically before deploy
- **Build Process**:
  1. Reads all `.hbs` files from `src/templates/`
  2. Precompiles them using Handlebars
  3. Outputs TypeScript modules to `src/generated/`
  4. Generated files should not be manually edited

### File Watching Configuration
The `wrangler.toml` configuration includes:
```toml
[build]
command = "node build-templates.js"
watch_dir = "src/templates"
```
This enables automatic template recompilation whenever `.hbs` files change during development.

### Backend Integration via Service Bindings

The web app communicates with the backend using Cloudflare Workers service bindings:

- **Service Binding**: `API_SERVICE` (configured in `wrangler.toml`)
  - Development: Binds to `aperto` worker (environment: `development`)
  - Production: Binds to `aperto-production` worker when deployed with `--env production`

**Usage Pattern**: The web app proxies requests to the backend's tRPC API:
```typescript
// Example: Password reset endpoint proxies to backend
const tRPCRequest = {
  "0": {
    json: { token, newPassword }
  }
};

const response = await c.env.API_SERVICE.fetch(
  new Request("http://api/trpc/resetPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tRPCRequest)
  })
);
```

The service binding allows direct worker-to-worker communication without internet round-trips.

### Page Rendering Pattern

All pages use the `PageRenderer` utility from `renderer.ts`:
- Wraps Handlebars template output in a full HTML document
- Includes meta tags, favicon links, HTMX, and Tailwind CSS via CDN
- Provides consistent page structure with smooth scroll animations
- Accepts optional title and description parameters for SEO

### Environment Bindings
- `c.env.ASSETS` - Cloudflare Assets binding for static files
- `c.env.API_SERVICE` - Service binding to backend tRPC API

## Related Projects

This web frontend is part of a larger Aperto ecosystem:
- **Mobile App**: React Native/Expo app in `../app/`
- **Backend API**: Cloudflare Workers with tRPC in `../backend/`
- **Database**: Cloudflare D1 managed by backend

## Important Notes

- Templates are precompiled for performance - never edit files in `src/generated/`
- Template compilation happens automatically during development and deployment
- Static assets are served via Cloudflare's asset handling
- The application maintains minimal state (demo counter) for simplicity
- Uses `wrangler.toml` (not JSON) for configuration to support custom build features