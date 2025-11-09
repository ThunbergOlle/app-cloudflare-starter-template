// Extended environment types for Cloudflare Workers
declare global {
  interface Env {
    JWT_SECRET: string;
    IMAGE_BUCKET: R2Bucket;
    PAPERTRAIL_API_KEY: string;
    DB: D1Database;
    RESEND_API_KEY: string;
    ANALYTICS: AnalyticsEngineDataset;
    PASSWORD_RESET_URL: string;
  }
}

export {};
