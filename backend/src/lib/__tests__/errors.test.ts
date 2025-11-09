import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { sanitizeError, createSafeError } from '../errors';
import { createLogger } from '../logger';

describe('Error Sanitization', () => {
  let mockLogger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;
  });

  describe('sanitizeError', () => {
    it('should pass through TRPCError instances unchanged', () => {
      const originalError = new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authorized',
      });

      const result = sanitizeError(originalError, mockLogger, 'test');

      expect(result).toBe(originalError);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.message).toBe('Not authorized');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should convert regular Error to INTERNAL_SERVER_ERROR', () => {
      const originalError = new Error('Database connection failed');

      const result = sanitizeError(originalError, mockLogger, 'test');

      expect(result).toBeInstanceOf(TRPCError);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toBe('An unexpected error occurred');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error'),
        expect.objectContaining({
          message: 'Database connection failed',
        }),
      );
    });

    it('should detect UNIQUE constraint errors and return CONFLICT', () => {
      const dbError = new Error('UNIQUE constraint failed: users.email');

      const result = sanitizeError(dbError, mockLogger, 'test');

      expect(result.code).toBe('CONFLICT');
      expect(result.message).toBe('A record with this information already exists');
    });

    it('should detect duplicate key errors and return CONFLICT', () => {
      const dbError = new Error('duplicate key value violates unique constraint');

      const result = sanitizeError(dbError, mockLogger, 'test');

      expect(result.code).toBe('CONFLICT');
      expect(result.message).toBe('A record with this information already exists');
    });

    it('should detect FOREIGN KEY constraint errors and return BAD_REQUEST', () => {
      const dbError = new Error('FOREIGN KEY constraint failed');

      const result = sanitizeError(dbError, mockLogger, 'test');

      expect(result.code).toBe('BAD_REQUEST');
      expect(result.message).toBe('Invalid reference to related data');
    });

    it('should detect NOT NULL constraint errors and return BAD_REQUEST', () => {
      const dbError = new Error('NOT NULL constraint failed: users.email');

      const result = sanitizeError(dbError, mockLogger, 'test');

      expect(result.code).toBe('BAD_REQUEST');
      expect(result.message).toBe('Required field is missing');
    });

    it('should handle non-Error objects', () => {
      const weirdError = { some: 'object' };

      const result = sanitizeError(weirdError, mockLogger, 'test');

      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toBe('An unexpected error occurred');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Non-Error object thrown'),
        expect.any(Object),
      );
    });

    it('should include context in log messages when provided', () => {
      const error = new Error('Test error');

      sanitizeError(error, mockLogger, 'myProcedure');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('[myProcedure]'),
        expect.any(Object),
      );
    });

    it('should work without a logger', () => {
      const error = new Error('Test error');

      const result = sanitizeError(error);

      expect(result).toBeInstanceOf(TRPCError);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('createSafeError', () => {
    it('should create NOT_FOUND error', () => {
      const error = createSafeError.notFound('User');

      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
    });

    it('should create UNAUTHORIZED error with custom message', () => {
      const error = createSafeError.unauthorized('Invalid credentials');

      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid credentials');
    });

    it('should create FORBIDDEN error', () => {
      const error = createSafeError.forbidden('Admin access required');

      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Admin access required');
    });

    it('should create BAD_REQUEST error', () => {
      const error = createSafeError.badRequest('Invalid input');

      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
    });

    it('should create CONFLICT error', () => {
      const error = createSafeError.conflict('Resource already exists');

      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Resource already exists');
    });

    it('should create TOO_MANY_REQUESTS error', () => {
      const error = createSafeError.tooManyRequests();

      expect(error.code).toBe('TOO_MANY_REQUESTS');
      expect(error.message).toBe('Too many requests, please try again later');
    });

    it('should create INTERNAL_SERVER_ERROR', () => {
      const error = createSafeError.internal('Something went wrong');

      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Something went wrong');
    });
  });

  describe('Security - No Sensitive Data Leakage', () => {
    it('should not leak database schema information', () => {
      const dbError = new Error(
        'Table "secret_internal_table" does not exist at line 42 in database.sql',
      );

      const result = sanitizeError(dbError, mockLogger);

      // Should not contain internal table names or file paths
      expect(result.message).not.toContain('secret_internal_table');
      expect(result.message).not.toContain('database.sql');
      expect(result.message).not.toContain('line 42');
    });

    it('should not leak stack traces in error message', () => {
      const error = new Error('Internal error');
      error.stack = 'Error: Internal error\n    at /path/to/secret/file.ts:123';

      const result = sanitizeError(error, mockLogger);

      expect(result.message).not.toContain('/path/to/secret');
      expect(result.message).not.toContain('file.ts');
    });

    it('should not leak environment variable names', () => {
      const error = new Error('Environment variable DATABASE_SECRET_KEY not found');

      const result = sanitizeError(error, mockLogger);

      expect(result.message).not.toContain('DATABASE_SECRET_KEY');
      expect(result.message).toBe('An unexpected error occurred');
    });
  });
});
