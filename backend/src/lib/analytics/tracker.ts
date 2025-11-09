import type { Context } from '../../trpc';
import {
  saveAnalyticsEvent,
  type AnalyticsEventType,
  type AnalyticsEventStatus,
} from './operations';

/**
 * Timer class for tracking operation duration and automatically saving analytics events.
 * Provides a clean API for timing operations with automatic error handling.
 *
 * @example
 * const timer = AnalyticsTimer.start('image_load', requestId, ctx, userId);
 * try {
 *   await loadImage();
 *   await timer.end('success', { fileSize: 1024 });
 * } catch (error) {
 *   await timer.end('error', { error: error.message });
 * }
 */
export class AnalyticsTimer {
  private startTime: number;
  private eventType: AnalyticsEventType;
  private requestId: string;
  private ctx: Context;
  private userId?: number;

  private constructor(
    eventType: AnalyticsEventType,
    requestId: string,
    ctx: Context,
    userId?: number,
  ) {
    this.startTime = Date.now();
    this.eventType = eventType;
    this.requestId = requestId;
    this.ctx = ctx;
    this.userId = userId;
  }

  /**
   * Start a new timer for an analytics event
   */
  static start(
    eventType: AnalyticsEventType,
    requestId: string,
    ctx: Context,
    userId?: number,
  ): AnalyticsTimer {
    return new AnalyticsTimer(eventType, requestId, ctx, userId);
  }

  /**
   * End the timer and save the analytics event
   * @param status - 'success' or 'error'
   * @param metadata - Additional context to save with the event
   */
  end(status: AnalyticsEventStatus, metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;

    saveAnalyticsEvent(
      {
        requestId: this.requestId,
        userId: this.userId,
        eventType: this.eventType,
        startTime: this.startTime,
        duration,
        status,
        metadata,
      },
      this.ctx,
    );
  }

  /**
   * Get the current duration without ending the timer
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Helper function to track an async operation with automatic error handling
 * @example
 * const result = await trackOperation(
 *   'image_load',
 *   requestId,
 *   ctx,
 *   userId,
 *   async () => {
 *     return await loadImage();
 *   },
 *   { fileSize: 1024 }
 * );
 */
export async function trackOperation<T>(
  eventType: AnalyticsEventType,
  requestId: string,
  ctx: Context,
  userId: number | undefined,
  operation: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> {
  const timer = AnalyticsTimer.start(eventType, requestId, ctx, userId);

  try {
    const result = await operation();
    timer.end('success', metadata);
    return result;
  } catch (error) {
    timer.end('error', {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
