import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.json',
        },
        miniflare: {
          compatibilityFlags: ['nodejs_compat'],
          d1Databases: ['DB'],
          d1Persist: './test-db',
          r2Buckets: ['IMAGE_BUCKET'],
        },
      },
    },
  },
  esbuild: {
    target: 'es2022',
  },
});