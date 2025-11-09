import { describe, it, expect, beforeEach } from 'vitest';
import { createJWT, verifyJWT } from '../jwt';

const TEST_SECRET = 'test-secret-key-for-jwt-testing';
const TEST_USER_ID = 123;
const TEST_EMAIL = 'test@example.com';
const TEST_LOCALE = 'sv';

describe('JWT Utilities', () => {
  describe('createJWT', () => {
    it('should create a valid JWT token', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should create tokens with correct payload structure', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );
      const result = await verifyJWT(token, TEST_SECRET);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload!.userId).toBe(TEST_USER_ID);
      expect(result.payload!.email).toBe(TEST_EMAIL);
      expect(result.payload!.iat).toBeDefined();
      expect(result.payload!.exp).toBeDefined();

      // Expiration should be approximately 1 year from now
      const now = Math.floor(Date.now() / 1000);
      const oneYearFromNow = now + 365 * 24 * 60 * 60;
      expect(result.payload!.exp).toBeGreaterThan(now);
      expect(result.payload!.exp).toBeLessThanOrEqual(oneYearFromNow + 10); // Allow 10 second buffer
    });

    it('should create different tokens for different users', async () => {
      const token1 = await createJWT(
        123,
        'user1@example.com',
        TEST_LOCALE,
        TEST_SECRET,
      );
      const token2 = await createJWT(
        456,
        'user2@example.com',
        TEST_LOCALE,
        TEST_SECRET,
      );

      expect(token1).not.toBe(token2);
    });

    it('should create different tokens at different times', async () => {
      const token1 = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );
      // Wait a moment to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const token2 = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyJWT', () => {
    it('should verify valid tokens', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );
      const result = await verifyJWT(token, TEST_SECRET);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
    });

    it('should reject tokens with wrong secret', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );
      const result = await verifyJWT(token, 'wrong-secret');

      expect(result.valid).toBe(false);
      expect(result.payload).toBeUndefined();
    });

    it('should reject malformed tokens', async () => {
      const result = await verifyJWT('malformed.token', TEST_SECRET);
      expect(result.valid).toBe(false);
    });

    it('should reject tokens with wrong number of parts', async () => {
      const result1 = await verifyJWT('only.two.parts.too.many', TEST_SECRET);
      const result2 = await verifyJWT('only.one', TEST_SECRET);

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });

    it('should reject tampered tokens', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );

      // Tamper with the signature
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.TAMPERED`;

      const result = await verifyJWT(tamperedToken, TEST_SECRET);
      expect(result.valid).toBe(false);
    });

    it('should reject expired tokens', async () => {
      // Create a token that's already expired by manipulating the payload
      const header = { alg: 'HS256', typ: 'JWT' };
      const expiredPayload = {
        userId: TEST_USER_ID,
        email: TEST_EMAIL,
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        exp: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago (expired)
      };

      // Manually create expired token for testing
      const encoder = new TextEncoder();
      const base64UrlEncode = (data: string) => {
        const bytes = encoder.encode(data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(expiredPayload));
      const message = `${encodedHeader}.${encodedPayload}`;

      // Create signature for expired token
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(TEST_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message),
      );
      const signatureArray = Array.from(new Uint8Array(signature));
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const expiredToken = `${message}.${signatureBase64}`;

      const result = await verifyJWT(expiredToken, TEST_SECRET);
      expect(result.valid).toBe(false);
    });

    it('should handle invalid JSON in payload', async () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const invalidPayload = '{invalid json}';

      const encoder = new TextEncoder();
      const base64UrlEncode = (data: string) => {
        const bytes = encoder.encode(data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(invalidPayload);
      const fakeToken = `${encodedHeader}.${encodedPayload}.fake-signature`;

      const result = await verifyJWT(fakeToken, TEST_SECRET);
      expect(result.valid).toBe(false);
    });
  });

  describe('Token roundtrip', () => {
    it('should successfully create and verify tokens for multiple users', async () => {
      const users = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
        { id: 999, email: 'admin@example.com' },
      ];

      for (const user of users) {
        const token = await createJWT(
          user.id,
          user.email,
          TEST_LOCALE,
          TEST_SECRET,
        );
        const result = await verifyJWT(token, TEST_SECRET);

        expect(result.valid).toBe(true);
        expect(result.payload!.userId).toBe(user.id);
        expect(result.payload!.email).toBe(user.email);
      }
    });

    it('should maintain token validity over time (but not too long)', async () => {
      const token = await createJWT(
        TEST_USER_ID,
        TEST_EMAIL,
        TEST_LOCALE,
        TEST_SECRET,
      );

      // Should be valid immediately
      const result1 = await verifyJWT(token, TEST_SECRET);
      expect(result1.valid).toBe(true);

      // Should still be valid after a short delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result2 = await verifyJWT(token, TEST_SECRET);
      expect(result2.valid).toBe(true);

      // Payload should remain the same
      expect(result1.payload!.userId).toBe(result2.payload!.userId);
      expect(result1.payload!.email).toBe(result2.payload!.email);
    });
  });
});

