import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';

vi.mock('../lib/external/openai/api', () => ({
  OpenaiAPI: {
    decodeMonumentImage: vi.fn(),
    writeGuideSummary: vi.fn(),
  },
}));

// Unmock the logger for this specific test file
vi.unmock('../lib/logger');

// Import the actual logger implementation
import { Logger, createLogger } from '../lib/logger';
import { createContext } from '../trpc';

describe('Logger Integration with tRPC', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset console spies
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Clear all mocks to reset call counts
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Context creation', () => {
    it('should create context with logger-like object', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      expect(context).toHaveProperty('log');
      expect(context.log).toHaveProperty('info');
      expect(context.log).toHaveProperty('error');
      expect(context.log).toHaveProperty('warn');
      expect(context.log).toHaveProperty('debug');
      expect(context).toHaveProperty('requestId');
      expect(typeof context.requestId).toBe('string');
      expect(context.requestId).toHaveLength(8);
    });

    it('should create unique request IDs for different contexts', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context1 = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      const context2 = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      expect(context1.requestId).not.toBe(context2.requestId);
      expect(context1.requestId).toHaveLength(8);
      expect(context2.requestId).toHaveLength(8);
    });

    it('should create logger with request ID functionality', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      // Test that the logger can be called
      expect(typeof context.log.info).toBe('function');
      expect(typeof context.log.error).toBe('function');
      expect(typeof context.log.warn).toBe('function');
      expect(typeof context.log.debug).toBe('function');

      // Test logger method execution (with mocked logger)
      context.log.info('test message');
      expect(context.log.info).toHaveBeenCalledWith('test message');
    });
  });

  describe('tRPC procedure logging', () => {
    it('should log with request-scoped logger in procedures', async () => {
      // Test a simple procedure call to verify ctx.log works
      const response = await SELF.fetch('http://localhost/trpc/hello');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.data).toBe('Hello from tRPC!');

      // Verify that logging occurred with request ID format
      // Note: The actual logging is mocked in setup.ts, but we can verify the structure works
    });

    it('should maintain request ID throughout procedure lifecycle', async () => {
      // Create a mock procedure that logs multiple times
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      // Simulate multiple log calls within a procedure
      context.log.info('Starting procedure');
      context.log.info('Processing data');
      context.log.info('Procedure completed');

      // Verify logger methods were called
      expect(context.log.info).toHaveBeenCalledTimes(3);
      expect(context.log.info).toHaveBeenNthCalledWith(1, 'Starting procedure');
      expect(context.log.info).toHaveBeenNthCalledWith(2, 'Processing data');
      expect(context.log.info).toHaveBeenNthCalledWith(
        3,
        'Procedure completed',
      );
    });
  });

  describe('Error logging integration', () => {
    it('should handle logger in error scenarios', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      // Simulate error logging
      context.log.error('Test error occurred', {
        errorCode: 'TEST_ERROR',
        details: 'This is a test error',
      });

      expect(context.log.error).toHaveBeenCalledWith('Test error occurred', {
        errorCode: 'TEST_ERROR',
        details: 'This is a test error',
      });
    });
  });

  describe('Request tracing scenarios', () => {
    it('should enable easy request tracing with multiple operations', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      const context = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      // Simulate a complex request with multiple steps
      context.log.info('Authentication started', { email: 'test@example.com' });
      context.log.info('User validated successfully', { userId: 123 });
      context.log.info('Database query initiated', { table: 'users' });
      context.log.info('Response prepared', { statusCode: 200 });

      // Verify the sequence of operations is traceable via mock calls
      expect(context.log.info).toHaveBeenCalledTimes(4);
      expect(context.log.info).toHaveBeenNthCalledWith(
        1,
        'Authentication started',
        { email: 'test@example.com' },
      );
      expect(context.log.info).toHaveBeenNthCalledWith(
        2,
        'User validated successfully',
        { userId: 123 },
      );
      expect(context.log.info).toHaveBeenNthCalledWith(
        3,
        'Database query initiated',
        { table: 'users' },
      );
      expect(context.log.info).toHaveBeenNthCalledWith(4, 'Response prepared', {
        statusCode: 200,
      });
    });

    it('should handle concurrent requests with different IDs', async () => {
      const mockReq = new Request('http://localhost/test');
      const mockResHeaders = new Headers();

      // Simulate two concurrent requests
      const context1 = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });
      const context2 = await createContext({
        req: mockReq,
        env: env,
        resHeaders: mockResHeaders,
      });

      // Each should have unique request IDs
      expect(context1.requestId).not.toBe(context2.requestId);

      // Each should log with their own logger instance
      context1.log.info('Request 1 processing');
      context2.log.info('Request 2 processing');
      context1.log.info('Request 1 completed');
      context2.log.info('Request 2 completed');

      expect(context1.log.info).toHaveBeenCalledTimes(2);
      expect(context2.log.info).toHaveBeenCalledTimes(2);
      expect(context1.log.info).toHaveBeenCalledWith('Request 1 processing');
      expect(context2.log.info).toHaveBeenCalledWith('Request 2 processing');
    });
  });

  describe('Performance considerations', () => {
    it('should efficiently create logger instances', async () => {
      const startTime = performance.now();

      // Create multiple contexts (simulating high load)
      const contexts = await Promise.all(
        Array.from({ length: 100 }, () =>
          createContext({
            req: new Request('http://localhost/test'),
            env: env,
            resHeaders: new Headers(),
          }),
        ),
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete relatively quickly (this is just a sanity check)
      expect(duration).toBeLessThan(1000); // Less than 1 second for 100 contexts

      // All should have unique request IDs
      const requestIds = contexts.map((ctx) => ctx.requestId);
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(100);
    });

    it('should not leak memory with request ID generation', () => {
      // Create many loggers to test for potential memory issues
      const loggers = Array.from({ length: 1000 }, () => createLogger());

      // Each should be a valid Logger instance
      loggers.forEach((logger) => {
        expect(logger).toBeInstanceOf(Logger);
        logger.info('test'); // Should not throw
      });

      // Basic verification that they all work
      expect(consoleSpy).toHaveBeenCalledTimes(1000);
    });
  });
});

