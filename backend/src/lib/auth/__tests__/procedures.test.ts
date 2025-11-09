import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema';
import { verifyJWT } from '../jwt';

// Helper to call tRPC procedures via HTTP
async function callTrpc(
  procedure: string,
  input?: any,
  method: 'GET' | 'POST' = 'POST',
) {
  const url = new URL('/trpc/' + procedure, 'http://localhost');

  if (method === 'GET' && input) {
    url.searchParams.set('input', JSON.stringify(input));
  }

  const response = await SELF.fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(method === 'POST' && input ? { body: JSON.stringify(input) } : {}),
  });

  return response.json();
}

describe('Auth procedures', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    db = drizzle(env.DB);
    await db.delete(users).run();
  });

  describe('checkEmail', () => {
    it('should return false for non-existent email', async () => {
      const result = await callTrpc(
        'checkEmail',
        {
          email: 'nonexistent@example.com',
        },
        'GET',
      );

      expect(result.result.data.exists).toBe(false);
    });

    it('should return true for existing email', async () => {
      // First create a user
      const db = drizzle(env.DB);
      await db
        .insert(users)
        .values({
          email: 'existing@example.com',
          password: 'hashedpassword',
          salt: 'somesalt',
        })
        .run();

      const result = await callTrpc(
        'checkEmail',
        {
          email: 'existing@example.com',
        },
        'GET',
      );

      expect(result.result.data.exists).toBe(true);
    });

    it('should validate email format', async () => {
      const result = await callTrpc(
        'checkEmail',
        {
          email: 'invalid-email',
        },
        'GET',
      );

      // Should get validation error
      expect(result.error).toBeDefined();
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user and return JWT', async () => {
      const result = await callTrpc('registerUser', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.result.data.success).toBe(true);
      expect(result.result.data.user).toMatchObject({
        email: 'test@example.com',
      });
      expect(result.result.data.user.id).toBeDefined();
      expect(result.result.data.sessionToken).toBeDefined();

      // Verify the JWT token is valid
      const testSecret = env.JWT_SECRET;
      const jwtResult = await verifyJWT(
        result.result.data.sessionToken,
        testSecret,
      );
      expect(jwtResult.valid).toBe(true);
      expect(jwtResult.payload!.userId).toBe(result.result.data.user.id);
      expect(jwtResult.payload!.email).toBe('test@example.com');
    });

    it('should hash password and store salt', async () => {
      await callTrpc('registerUser', {
        email: 'test@example.com',
        password: 'password123',
      });

      // Check database directly
      const db = drizzle(env.DB);
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, 'test@example.com'))
        .get();

      expect(user).toBeDefined();
      expect(user!.password).not.toBe('password123'); // Should be hashed
      expect(user!.salt).toBeDefined();
      expect(user!.salt.length).toBeGreaterThan(0);
    });

    it('should reject duplicate email', async () => {
      // Register first user
      await callTrpc('registerUser', {
        email: 'test@example.com',
        password: 'password123',
      });

      // Try to register with same email
      const result = await callTrpc('registerUser', {
        email: 'test@example.com',
        password: 'differentpassword',
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('already exists');
    });

    it('should validate password length', async () => {
      const result = await callTrpc('registerUser', {
        email: 'test@example.com',
        password: '123', // Too short
      });

      expect(result.error).toBeDefined();
    });

    it('should validate email format', async () => {
      const result = await callTrpc('registerUser', {
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Register a test user for login tests
      await callTrpc('registerUser', {
        email: 'login-test@example.com',
        password: 'password123',
      });
    });

    it('should successfully login with correct credentials and return JWT', async () => {
      const result = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'password123',
      });

      expect(result.result.data.success).toBe(true);
      expect(result.result.data.user).toMatchObject({
        email: 'login-test@example.com',
      });
      expect(result.result.data.user.id).toBeDefined();
      expect(result.result.data.sessionToken).toBeDefined();

      // Verify the JWT token is valid
      const testSecret = env.JWT_SECRET;
      const jwtResult = await verifyJWT(
        result.result.data.sessionToken,
        testSecret,
      );
      expect(jwtResult.valid).toBe(true);
      expect(jwtResult.payload!.userId).toBe(result.result.data.user.id);
      expect(jwtResult.payload!.email).toBe('login-test@example.com');
    });

    it('should reject wrong password', async () => {
      const result = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      const result = await callTrpc('loginUser', {
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Invalid email or password');
    });

    it('should not reveal whether email exists or password is wrong', async () => {
      const wrongEmailResult = await callTrpc('loginUser', {
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      const wrongPasswordResult = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'wrongpassword',
      });

      // Both should return the same error message
      expect(wrongEmailResult.error.message).toBe(
        wrongPasswordResult.error.message,
      );
    });

    it('should create different JWT tokens for each login', async () => {
      const result1 = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'password123',
      });

      // Wait a moment to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result2 = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'password123',
      });

      expect(result1.result.data.sessionToken).not.toBe(
        result2.result.data.sessionToken,
      );

      // Both tokens should be valid and contain same user info
      const testSecret = env.JWT_SECRET;
      const jwt1 = await verifyJWT(
        result1.result.data.sessionToken,
        testSecret,
      );
      const jwt2 = await verifyJWT(
        result2.result.data.sessionToken,
        testSecret,
      );

      expect(jwt1.valid).toBe(true);
      expect(jwt2.valid).toBe(true);
      expect(jwt1.payload!.userId).toBe(jwt2.payload!.userId);
      expect(jwt1.payload!.email).toBe(jwt2.payload!.email);
    });

    it('should have JWT tokens with 1-year expiration', async () => {
      const result = await callTrpc('loginUser', {
        email: 'login-test@example.com',
        password: 'password123',
      });

      const testSecret = env.JWT_SECRET;
      const jwtResult = await verifyJWT(
        result.result.data.sessionToken,
        testSecret,
      );

      const now = Math.floor(Date.now() / 1000);
      const oneYearFromNow = now + 365 * 24 * 60 * 60;

      expect(jwtResult.payload!.exp).toBeGreaterThan(now);
      expect(jwtResult.payload!.exp).toBeLessThanOrEqual(oneYearFromNow + 10); // Allow 10 second buffer
    });
  });
});
