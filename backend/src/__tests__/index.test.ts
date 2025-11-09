import { describe, it, expect, beforeAll, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';

// Mock the external dependencies to avoid LangChain import issues
vi.mock('../lib/external/openai/api', () => ({
  OpenaiAPI: {
    decodeMonumentImage: vi.fn(),
    writeGuideSummary: vi.fn(),
  },
}));

describe('Main router', () => {
  describe('hello endpoint', () => {
    it('should return hello message', async () => {
      const response = await SELF.fetch('http://localhost/trpc/hello');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.data).toBe('Hello from tRPC!');
    });
  });

  describe('getUsers endpoint', () => {
    it('should return empty array when no users exist', async () => {
      const response = await SELF.fetch('http://localhost/trpc/getUsers');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.data).toEqual([]);
    });

    it('should return users after registration', async () => {
      // Register a user first
      await SELF.fetch('http://localhost/trpc/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      // Now get users
      const response = await SELF.fetch('http://localhost/trpc/getUsers');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.data).toHaveLength(1);
      expect(data.result.data[0]).toMatchObject({
        email: 'test@example.com',
      });
      expect(data.result.data[0].id).toBeDefined();
    });
  });

  describe('Full authentication flow', () => {
    it('should complete registration -> login -> getUsers flow', async () => {
      const testEmail = 'flowtest@example.com';
      const testPassword = 'password123';

      // 1. Check email doesn't exist
      const checkResponse = await SELF.fetch(
        `http://localhost/trpc/checkEmail?input=${encodeURIComponent(JSON.stringify({ email: testEmail }))}`,
      );
      const checkData = await checkResponse.json();
      expect(checkData.result.data.exists).toBe(false);

      // 2. Register user
      const registerResponse = await SELF.fetch(
        'http://localhost/trpc/registerUser',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        },
      );
      const registerData = await registerResponse.json();
      expect(registerData.result.data.success).toBe(true);

      // 3. Check email now exists
      const checkResponse2 = await SELF.fetch(
        `http://localhost/trpc/checkEmail?input=${encodeURIComponent(JSON.stringify({ email: testEmail }))}`,
      );
      const checkData2 = await checkResponse2.json();
      expect(checkData2.result.data.exists).toBe(true);

      // 4. Login with registered credentials
      const loginResponse = await SELF.fetch(
        'http://localhost/trpc/loginUser',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        },
      );
      const loginData = await loginResponse.json();
      expect(loginData.result.data.success).toBe(true);
      expect(loginData.result.data.user.email).toBe(testEmail);

      // 5. Verify user appears in getUsers
      const usersResponse = await SELF.fetch('http://localhost/trpc/getUsers');
      const usersData = await usersResponse.json();
      expect(usersData.result.data).toHaveLength(1);
      expect(usersData.result.data[0].email).toBe(testEmail);
    });

    it('should handle registration collision correctly', async () => {
      const testEmail = 'collision@example.com';

      // Register first user
      const response1 = await SELF.fetch('http://localhost/trpc/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'password123',
        }),
      });
      const data1 = await response1.json();
      expect(data1.result.data.success).toBe(true);

      // Try to register second user with same email
      const response2 = await SELF.fetch('http://localhost/trpc/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'differentpassword',
        }),
      });
      const data2 = await response2.json();
      expect(data2.error).toBeDefined();
      expect(data2.error.message).toContain('already exists');

      // Verify only one user exists
      const usersResponse = await SELF.fetch('http://localhost/trpc/getUsers');
      const usersData = await usersResponse.json();
      expect(usersData.result.data).toHaveLength(1);
    });
  });
});
