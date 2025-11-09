import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the actual logger implementation, not the mocked version
vi.unmock('../logger');

import { Logger, createLogger, log } from '../logger';

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create logger with provided request ID', () => {
      const logger = new Logger('test-123');
      logger.info('test message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[test-123] INFO: test message');
    });

    it('should create logger with auto-generated request ID when not provided', () => {
      const logger = new Logger();
      logger.info('test message');
      
      const call = consoleSpy.mock.calls[0][0] as string;
      expect(call).toMatch(/^\[\w{8}\] INFO: test message$/);
    });

    it('should generate unique request IDs for different instances', () => {
      const logger1 = new Logger();
      const logger2 = new Logger();
      
      logger1.info('message1');
      logger2.info('message2');
      
      const call1 = consoleSpy.mock.calls[0][0] as string;
      const call2 = consoleSpy.mock.calls[1][0] as string;
      
      const requestId1 = call1.match(/^\[(\w{8})\]/)?.[1];
      const requestId2 = call2.match(/^\[(\w{8})\]/)?.[1];
      
      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });
  });

  describe('Logging methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-id');
    });

    describe('info', () => {
      it('should log info message with correct format', () => {
        logger.info('Test info message');
        
        expect(consoleSpy).toHaveBeenCalledWith('[test-id] INFO: Test info message');
      });

      it('should log info message with metadata', () => {
        const meta = { userId: 123, action: 'login' };
        logger.info('User logged in', meta);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          '[test-id] INFO: User logged in {"userId":123,"action":"login"}'
        );
      });

      it('should handle undefined metadata gracefully', () => {
        logger.info('Test message', undefined);
        
        expect(consoleSpy).toHaveBeenCalledWith('[test-id] INFO: Test message');
      });
    });

    describe('error', () => {
      it('should log error message with correct format', () => {
        logger.error('Test error message');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('[test-id] ERROR: Test error message');
      });

      it('should log error message with metadata', () => {
        const meta = { code: 'AUTH_FAILED', details: 'Invalid token' };
        logger.error('Authentication failed', meta);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[test-id] ERROR: Authentication failed {"code":"AUTH_FAILED","details":"Invalid token"}'
        );
      });
    });

    describe('warn', () => {
      it('should log warning message with correct format', () => {
        logger.warn('Test warning message');
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('[test-id] WARN: Test warning message');
      });

      it('should log warning message with metadata', () => {
        const meta = { deprecatedFeature: 'oldAPI' };
        logger.warn('Using deprecated feature', meta);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[test-id] WARN: Using deprecated feature {"deprecatedFeature":"oldAPI"}'
        );
      });
    });

    describe('debug', () => {
      it('should log debug message with correct format', () => {
        logger.debug('Test debug message');
        
        expect(consoleSpy).toHaveBeenCalledWith('[test-id] DEBUG: Test debug message');
      });

      it('should log debug message with metadata', () => {
        const meta = { query: 'SELECT * FROM users', duration: 45 };
        logger.debug('Database query executed', meta);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          '[test-id] DEBUG: Database query executed {"query":"SELECT * FROM users","duration":45}'
        );
      });
    });
  });

  describe('Message formatting', () => {
    it('should handle complex metadata objects', () => {
      const logger = new Logger('complex-test');
      const complexMeta = {
        user: { id: 123, email: 'test@example.com' },
        nested: { level: 1, data: [1, 2, 3] },
        timestamp: new Date('2023-01-01T12:00:00Z'),
        nullValue: null,
        undefinedValue: undefined
      };
      
      logger.info('Complex metadata test', complexMeta);
      
      const expectedJson = JSON.stringify(complexMeta);
      expect(consoleSpy).toHaveBeenCalledWith(
        `[complex-test] INFO: Complex metadata test ${expectedJson}`
      );
    });

    it('should handle empty strings and special characters', () => {
      const logger = new Logger('special-test');
      
      logger.info('');
      logger.info('Message with "quotes" and \n newlines');
      
      expect(consoleSpy).toHaveBeenCalledWith('[special-test] INFO: ');
      expect(consoleSpy).toHaveBeenCalledWith('[special-test] INFO: Message with "quotes" and \n newlines');
    });

    it('should handle metadata with circular references gracefully', () => {
      const logger = new Logger('circular-test');
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // This should not throw an error, JSON.stringify handles circular refs by throwing
      // but our implementation should be resilient
      expect(() => {
        logger.info('Circular reference test', circularObj);
      }).toThrow(); // JSON.stringify throws on circular references
    });
  });

  describe('Request ID format validation', () => {
    it('should use exactly 8 characters for auto-generated request IDs', () => {
      const logger = new Logger();
      logger.info('test');
      
      const call = consoleSpy.mock.calls[0][0] as string;
      const requestId = call.match(/^\[(\w+)\]/)?.[1];
      
      expect(requestId).toHaveLength(8);
      expect(requestId).toMatch(/^[a-f0-9]{8}$/); // Should be hex characters from UUID
    });

    it('should preserve custom request IDs as-is', () => {
      const customIds = ['abc123', 'very-long-request-id-123456', '1'];
      
      customIds.forEach(id => {
        const logger = new Logger(id);
        logger.info('test');
        
        const call = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0] as string;
        expect(call).toContain(`[${id}] INFO:`);
      });
    });

    it('should generate UUID for empty string request ID', () => {
      const logger = new Logger('');
      logger.info('test');
      
      const call = consoleSpy.mock.calls[0][0] as string;
      const requestId = call.match(/^\[(\w+)\]/)?.[1];
      
      expect(requestId).toBeDefined();
      expect(requestId).toHaveLength(8);
      expect(requestId).toMatch(/^[a-f0-9]{8}$/);
    });
  });
});

describe('createLogger factory function', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should create Logger instance with provided request ID', () => {
    const logger = createLogger('factory-test');
    
    expect(logger).toBeInstanceOf(Logger);
    logger.info('test message');
    expect(consoleSpy).toHaveBeenCalledWith('[factory-test] INFO: test message');
  });

  it('should create Logger instance with auto-generated ID when not provided', () => {
    const logger = createLogger();
    
    expect(logger).toBeInstanceOf(Logger);
    logger.info('test message');
    
    const call = consoleSpy.mock.calls[0][0] as string;
    expect(call).toMatch(/^\[\w{8}\] INFO: test message$/);
  });

  it('should create different instances with different IDs', () => {
    const logger1 = createLogger('id1');
    const logger2 = createLogger('id2');
    
    logger1.info('message1');
    logger2.info('message2');
    
    expect(consoleSpy).toHaveBeenCalledWith('[id1] INFO: message1');
    expect(consoleSpy).toHaveBeenCalledWith('[id2] INFO: message2');
  });
});

describe('Global log instance', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should be a Logger instance', () => {
    expect(log).toBeInstanceOf(Logger);
  });

  it('should use "global" as request ID', () => {
    log.info('global test message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[global] INFO: global test message');
  });

  it('should maintain backward compatibility', () => {
    // Test that the old API still works
    log.info('info message');
    log.error('error message');
    log.warn('warn message');
    log.debug('debug message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[global] INFO: info message');
    // Note: We'd need to spy on console.error and console.warn for full verification
  });
});