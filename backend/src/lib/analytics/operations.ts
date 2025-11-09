import type { Context } from '../../trpc';

export type AnalyticsEventType = 'test';

export type AnalyticsEventStatus = 'success' | 'error';

export interface AnalyticsEventData {
  requestId: string;
  userId?: number;
  eventType: AnalyticsEventType;
  startTime: number; // Unix timestamp in milliseconds
  duration: number; // Duration in milliseconds
  status: AnalyticsEventStatus;
  metadata?: Record<string, any>;
}

/**
 * Save analytics event to Cloudflare Analytics Engine
 * Uses writeDataPoint API - fire and forget, no await needed
 *
 * Data structure:
 * - blob1: eventType
 * - blob2: status
 * - blob3: requestId
 * - blob4: metadata (JSON string, truncated to 100 chars for cardinality)
 * - double1: duration (milliseconds)
 * - double2: startTime (unix timestamp in ms)
 * - double3: userId (or 0 if not present)
 * - index1: requestId (for filtering/sampling)
 */
export function saveAnalyticsEvent(
  data: AnalyticsEventData,
  ctx: Context,
): void {
  try {
    if (ctx.env.ENVIRONMENT !== 'production') return;

    // Truncate metadata to avoid high cardinality issues
    const metadataString = data.metadata
      ? JSON.stringify(data.metadata).slice(0, 100)
      : '';

    ctx.env.ANALYTICS.writeDataPoint({
      blobs: [
        data.eventType, // blob1: event type
        data.status, // blob2: status
        data.requestId, // blob3: request ID
        metadataString, // blob4: metadata (truncated)
      ],
      doubles: [
        data.duration, // double1: duration in ms
        data.startTime, // double2: start time
        data.userId || 0, // double3: user ID (0 if not present)
      ],
      indexes: [data.requestId], // index1: request ID for sampling
    });

    ctx.log.debug('Analytics event written', {
      eventType: data.eventType,
      duration: data.duration,
      requestId: data.requestId,
    });
  } catch (error) {
    // Don't let analytics failures break the main flow
    ctx.log.error('Failed to write analytics event', {
      error,
      eventType: data.eventType,
    });
  }
}
