import { TRPCError } from '@trpc/server';
import type { Logger } from './logger';

/**
 * Safe error codes that can be returned to clients
 */
export const SafeErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

/**
 * Sanitizes errors to prevent leaking sensitive information.
 * Only allows specific TRPCError instances with safe error codes.
 * All other errors are converted to INTERNAL_SERVER_ERROR.
 *
 * @param error - The error to sanitize
 * @param logger - Optional logger to log the original error
 * @param context - Optional context for logging (e.g., operation name)
 * @returns A safe TRPCError that can be sent to the client
 */
export function sanitizeError(
  error: unknown,
  logger?: Logger,
  context?: string,
): TRPCError {
  const contextPrefix = context ? `[${context}] ` : '';

  // If it's already a TRPCError with a safe code, return it
  if (error instanceof TRPCError) {
    // Log the error for debugging but return it as-is
    logger?.error(`${contextPrefix}TRPCError thrown:`, {
      code: error.code,
      message: error.message,
      cause: error.cause,
    });
    return error;
  }

  // For all other errors, log details but return generic error
  if (error instanceof Error) {
    logger?.error(`${contextPrefix}Unexpected error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Check for specific error patterns that should be handled specially
    // Database errors
    if (
      error.message.includes('UNIQUE constraint failed') ||
      error.message.includes('duplicate key')
    ) {
      return new TRPCError({
        code: 'CONFLICT',
        message: 'A record with this information already exists',
      });
    }

    if (
      error.message.includes('FOREIGN KEY constraint failed') ||
      error.message.includes('violates foreign key')
    ) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid reference to related data',
      });
    }

    if (
      error.message.includes('NOT NULL constraint failed') ||
      error.message.includes('null value')
    ) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Required field is missing',
      });
    }
  } else {
    // Non-Error object thrown
    logger?.error(`${contextPrefix}Non-Error object thrown:`, {
      error: String(error),
      type: typeof error,
    });
  }

  // Default: return generic error
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}

/**
 * Wraps an async function with error sanitization.
 * Useful for wrapping procedure handlers.
 *
 * @param fn - The async function to wrap
 * @param logger - Optional logger for error logging
 * @param context - Optional context for logging
 * @returns A wrapped function that sanitizes errors
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  logger?: Logger,
  context?: string,
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw sanitizeError(error, logger, context);
    }
  }) as T;
}

/**
 * Creates a user-friendly TRPCError for common scenarios.
 * These are pre-sanitized and safe to throw.
 */
export const createSafeError = {
  notFound: (resource: string = 'Resource') =>
    new TRPCError({
      code: 'NOT_FOUND',
      message: `${resource} not found`,
    }),

  unauthorized: (message: string = 'Authentication required') =>
    new TRPCError({
      code: 'UNAUTHORIZED',
      message,
    }),

  forbidden: (message: string = 'You do not have permission to perform this action') =>
    new TRPCError({
      code: 'FORBIDDEN',
      message,
    }),

  badRequest: (message: string) =>
    new TRPCError({
      code: 'BAD_REQUEST',
      message,
    }),

  conflict: (message: string) =>
    new TRPCError({
      code: 'CONFLICT',
      message,
    }),

  tooManyRequests: (message: string = 'Too many requests, please try again later') =>
    new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message,
    }),

  internal: (message: string = 'An unexpected error occurred') =>
    new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    }),
};
