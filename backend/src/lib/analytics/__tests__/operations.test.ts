import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from 'cloudflare:test';
import { saveAnalyticsEvent } from '../operations';
import type { AuthenticatedContext } from '../../../trpc';
import { AnalyticsTimer, trackOperation } from '../tracker';

// Create a mock Analytics Engine dataset
const createMockAnalyticsEngine = () => {
  const writeDataPoint = vi.fn();
  return { writeDataPoint };
};

// Mock context
const createMockContext = (): AuthenticatedContext => {
  const mockAnalytics = createMockAnalyticsEngine();

  return {
    token: '',
    requestId: 'test-req-id',
    ip: '127.0.0.1',
    env: {
      ...env,
      ANALYTICS: mockAnalytics as any,
      ENVIRONMENT: 'production', // Set to production so analytics events are saved
    },
    user: { id: 1, email: 'test@example.com' },
    log: {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    } as any,
    req: {} as any,
    resHeaders: {} as any,
  };
};

describe('Analytics operations', () => {
  let ctx: AuthenticatedContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('saveAnalyticsEvent', () => {
    it('should write data point to Analytics Engine with correct structure', () => {
      const eventData = {
        requestId: 'test-request-123',
        userId: 1,
        eventType: 'test' as const,
        startTime: Date.now(),
        duration: 150,
        status: 'success' as const,
        metadata: {
          fileSize: 1024,
          contentType: 'image/jpeg',
        },
      };

      saveAnalyticsEvent(eventData, ctx);

      expect(ctx.env.ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
        blobs: [
          'test',
          'success',
          'test-request-123',
          expect.stringContaining('fileSize'),
        ],
        doubles: [150, eventData.startTime, 1],
        indexes: ['test-request-123'],
      });
    });
  });
});

describe('AnalyticsTimer', () => {
  let ctx: AuthenticatedContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('start and end', () => {
    it('should track operation duration', async () => {
      const timer = AnalyticsTimer.start('test', 'req-123', ctx, 1);

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 50));

      timer.end('success', { test: true });

      expect(ctx.env.ANALYTICS.writeDataPoint).toHaveBeenCalled();
      const call = (ctx.env.ANALYTICS.writeDataPoint as any).mock.calls[0][0];

      expect(call.blobs[0]).toBe('image_load');
      expect(call.blobs[1]).toBe('success');
      expect(call.doubles[0]).toBeGreaterThanOrEqual(50); // duration
    });

    it('should track errors with metadata', () => {
      const timer = AnalyticsTimer.start('test', 'req-456', ctx, 1);

      timer.end('error', {
        error: 'API rate limit exceeded',
      });

      const call = (ctx.env.ANALYTICS.writeDataPoint as any).mock.calls[0][0];
      expect(call.blobs[1]).toBe('error');
      expect(call.blobs[3]).toContain('API rate limit');
    });
  });

  describe('getDuration', () => {
    it('should return current duration without ending timer', async () => {
      const timer = AnalyticsTimer.start('test', 'req-789', ctx, 1);

      await new Promise((resolve) => setTimeout(resolve, 30));

      const duration = timer.getDuration();
      expect(duration).toBeGreaterThanOrEqual(30);

      // Verify no event was written yet
      expect(ctx.env.ANALYTICS.writeDataPoint).not.toHaveBeenCalled();
    });
  });
});

describe('trackOperation', () => {
  let ctx: AuthenticatedContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should track successful operation and return result', async () => {
    const result = await trackOperation(
      'test',
      'req-success',
      ctx,
      1,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 25));
        return { id: 42, name: 'Test Monument' };
      },
      { monumentName: 'Test Monument' },
    );

    expect(result).toEqual({ id: 42, name: 'Test Monument' });

    const call = (ctx.env.ANALYTICS.writeDataPoint as any).mock.calls[0][0];
    expect(call.blobs[0]).toBe('monument_lookup');
    expect(call.blobs[1]).toBe('success');
    expect(call.doubles[0]).toBeGreaterThanOrEqual(25);
  });

  it('should track failed operation and re-throw error', async () => {
    await expect(
      trackOperation(
        'test',
        'req-error',
        ctx,
        1,
        async () => {
          throw new Error('Database error');
        },
        { attemptNumber: 1 },
      ),
    ).rejects.toThrow('Database error');

    const call = (ctx.env.ANALYTICS.writeDataPoint as any).mock.calls[0][0];
    expect(call.blobs[1]).toBe('error');
    expect(call.blobs[3]).toContain('Database error');
  });

  it('should handle operations without metadata', async () => {
    const result = await trackOperation(
      'test',
      'req-no-meta',
      ctx,
      1,
      async () => {
        return ['Place 1', 'Place 2'];
      },
    );

    expect(result).toEqual(['Place 1', 'Place 2']);

    const call = (ctx.env.ANALYTICS.writeDataPoint as any).mock.calls[0][0];
    expect(call.blobs[3]).toBe(''); // No metadata
  });
});
