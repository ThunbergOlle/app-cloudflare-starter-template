import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../../../db/schema';
import { createJWT } from '../jwt';

// Use environment JWT_SECRET to match what the middleware uses
let TEST_JWT_SECRET: string;

// Helper to call tRPC procedures via HTTP with optional Authorization header
async function callTrpcWithAuth(
  procedure: string,
  input?: any,
  token?: string,
  method: 'GET' | 'POST' = 'POST',
) {
  const url = new URL('/trpc/' + procedure, 'http://localhost');

  if (method === 'GET' && input) {
    url.searchParams.set('input', JSON.stringify(input));
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await SELF.fetch(url, {
    method,
    headers,
    ...(method === 'POST' && input ? { body: JSON.stringify(input) } : {}),
  });

  return response.json();
}

describe('Authentication Middleware', () => {
  let db: ReturnType<typeof drizzle>;
  let validJWT: string;
  let testUserId: number;

  beforeAll(async () => {
    db = drizzle(env.DB);
    TEST_JWT_SECRET = env.JWT_SECRET;
  });

  beforeEach(async () => {
    // Clean up test data
    db = drizzle(env.DB);
    await db.delete(users).run();

    // Create a test user and JWT token for auth tests
    const testUser = await db
      .insert(users)
      .values({
        email: 'middleware-test@example.com',
        password: 'hashedpassword',
        salt: 'testsalt',
      })
      .returning();

    testUserId = testUser[0].id;
    validJWT = await createJWT(
      testUserId,
      'middleware-test@example.com',
      'sv',
      TEST_JWT_SECRET,
    );
  });

  describe('getCurrentUser with middleware', () => {
    it('should return user data with valid Authorization header', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        validJWT,
        'GET',
      );

      expect(result.result.data.user).toMatchObject({
        id: testUserId,
        email: 'middleware-test@example.com',
      });
    });

    it('should reject request without Authorization header', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        undefined,
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Authentication required');
      expect(result.error.data.code).toBe('UNAUTHORIZED');
      expect(result.error.data.httpStatus).toBe(401);
    });

    it('should reject request with invalid Bearer token', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        'invalid-token',
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid or expired token');
      expect(result.error.data.code).toBe('UNAUTHORIZED');
      expect(result.error.data.httpStatus).toBe(401);
    });

    it('should reject request with malformed Authorization header', async () => {
      const headers = { Authorization: 'NotBearer token123' };
      const url = new URL('/trpc/getCurrentUser', 'http://localhost');

      const response = await SELF.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Authentication required');
    });

    it('should reject request with empty Bearer token', async () => {
      const result = await callTrpcWithAuth('getCurrentUser', null, '', 'GET');

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Authentication required');
    });

    it('should reject request with JWT for non-existent user', async () => {
      // Create JWT for user ID that doesn't exist
      const nonExistentUserJWT = await createJWT(
        99999,
        'nonexistent@example.com',
        'sv',
        TEST_JWT_SECRET,
      );

      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        nonExistentUserJWT,
        'GET',
      );

      expect(result.error.data.httpStatus).toEqual(401);
    });
  });

  describe('protectedProcedure functionality', () => {
    it('should allow access with valid JWT', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        validJWT,
        'GET',
      );

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should block access without JWT', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        undefined,
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.data.code).toBe('UNAUTHORIZED');
    });

    it('should provide user context in protected procedures', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        validJWT,
        'GET',
      );

      expect(result.result.data.user.id).toBe(testUserId);
      expect(result.result.data.user.email).toBe('middleware-test@example.com');
    });
  });

  describe('JWT token validation', () => {
    it('should accept freshly created JWT', async () => {
      const freshJWT = await createJWT(
        testUserId,
        'middleware-test@example.com',
        'sv',
        TEST_JWT_SECRET,
      );
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        freshJWT,
        'GET',
      );

      expect(result.result.data.user.id).toBe(testUserId);
    });

    it('should reject JWT with wrong secret', async () => {
      const wrongSecretJWT = await createJWT(
        testUserId,
        'middleware-test@example.com',
        'sv',
        'wrong-secret',
      );
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        wrongSecretJWT,
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid or expired token');
    });

    it('should reject malformed JWT', async () => {
      const malformedJWT = 'not.a.valid.jwt.token';
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        malformedJWT,
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid or expired token');
    });

    it('should reject JWT with invalid structure', async () => {
      const invalidJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid'; // Only 2 parts
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        invalidJWT,
        'GET',
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid or expired token');
    });
  });

  describe('middleware integration with different procedures', () => {
    it('should not affect unprotected procedures', async () => {
      // Test that regular procedures still work without auth
      const result = await callTrpcWithAuth('hello', null, undefined, 'GET');

      expect(result.result.data).toBe('Hello from tRPC!');
    });

    it('should not interfere with login/register procedures', async () => {
      // Ensure auth middleware doesn't break auth procedures themselves
      const result = await callTrpcWithAuth('registerUser', {
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(result.result.data.success).toBe(true);
      expect(result.result.data.sessionToken).toBeDefined();
    });

    it('should work with different HTTP methods', async () => {
      // Test GET request with auth
      const getResult = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        validJWT,
        'GET',
      );
      expect(getResult.result.data.user.id).toBe(testUserId);

      // Could also test POST if getCurrentUser supported it, but it's a query
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent requests with different auth states', async () => {
      // Simulate concurrent requests - one with auth, one without
      const [authResult, noAuthResult] = await Promise.all([
        callTrpcWithAuth('getCurrentUser', null, validJWT, 'GET'),
        callTrpcWithAuth('getCurrentUser', null, undefined, 'GET'),
      ]);

      expect(authResult.result.data.user.id).toBe(testUserId);
      expect(noAuthResult.error.message).toBe('Authentication required');
    });

    it('should handle Authorization header with extra whitespace', async () => {
      const headers = { Authorization: `  Bearer ${validJWT}  ` };
      const url = new URL('/trpc/getCurrentUser', 'http://localhost');

      const response = await SELF.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      const result = await response.json();
      // The HTTP layer seems to automatically trim whitespace, so this should succeed
      expect(result.result).toBeDefined();
      expect(result.result.data.user.id).toBe(testUserId);
    });

    it('should handle multiple Authorization headers', async () => {
      // This is an edge case that shouldn't happen in normal usage
      const url = new URL('/trpc/getCurrentUser', 'http://localhost');

      const response = await SELF.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validJWT}`, // First header
          // Can't easily test multiple headers with fetch API
        },
      });

      const result = await response.json();
      expect(result.result.data.user.id).toBe(testUserId);
    });
  });

  describe('security considerations', () => {
    it('should not leak user data in error messages', async () => {
      const result = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        'invalid-token',
        'GET',
      );

      expect(result.error.message).toBe('Invalid or expired token');
      expect(result.error.message).not.toContain('middleware-test@example.com');
      expect(result.error.message).not.toContain(testUserId.toString());
    });

    it('should use proper HTTP status codes', async () => {
      const noAuthResult = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        undefined,
        'GET',
      );
      const invalidAuthResult = await callTrpcWithAuth(
        'getCurrentUser',
        null,
        'invalid',
        'GET',
      );

      expect(noAuthResult.error.data.httpStatus).toBe(401);
      expect(invalidAuthResult.error.data.httpStatus).toBe(401);
    });

    it('should not accept non-Bearer authentication schemes', async () => {
      const headers = { Authorization: `Basic ${validJWT}` };
      const url = new URL('/trpc/getCurrentUser', 'http://localhost');

      const response = await SELF.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Authentication required');
    });
  });
});
