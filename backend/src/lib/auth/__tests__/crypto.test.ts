import { describe, it, expect } from 'vitest';
import { hashPassword, generateSalt, verifyPassword } from '../crypto';

describe('Crypto utilities', () => {
  describe('generateSalt', () => {
    it('should generate a non-empty salt', async () => {
      const salt = await generateSalt();
      expect(salt).toBeDefined();
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should generate unique salts', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      expect(salt1).not.toBe(salt2);
    });

    it('should generate salts with correct format (hex)', async () => {
      const salt = await generateSalt();
      expect(salt).toMatch(/^[a-f0-9]+$/);
      expect(salt.length).toBe(32); // 16 bytes = 32 hex chars
    });
  });

  describe('hashPassword', () => {
    it('should hash a password with salt', async () => {
      const password = 'testpassword123';
      const salt = 'testsalt';
      const hash = await hashPassword(password, salt);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^[a-f0-9]+$/); // hex format
    });

    it('should produce different hashes for different passwords', async () => {
      const salt = 'testsalt';
      const hash1 = await hashPassword('password1', salt);
      const hash2 = await hashPassword('password2', salt);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for same password with different salts', async () => {
      const password = 'testpassword';
      const hash1 = await hashPassword(password, 'salt1');
      const hash2 = await hashPassword(password, 'salt2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce consistent hashes for same password and salt', async () => {
      const password = 'testpassword';
      const salt = 'testsalt';
      const hash1 = await hashPassword(password, salt);
      const hash2 = await hashPassword(password, salt);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const salt = await generateSalt();
      const hash = await hashPassword(password, salt);
      
      const isValid = await verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const salt = await generateSalt();
      const hash = await hashPassword(password, salt);
      
      const isValid = await verifyPassword(wrongPassword, hash, salt);
      expect(isValid).toBe(false);
    });

    it('should reject password with wrong salt', async () => {
      const password = 'testpassword123';
      const salt = await generateSalt();
      const wrongSalt = await generateSalt();
      const hash = await hashPassword(password, salt);
      
      const isValid = await verifyPassword(password, hash, wrongSalt);
      expect(isValid).toBe(false);
    });

    it('should handle edge cases', async () => {
      const salt = await generateSalt();
      
      // Empty password
      const emptyHash = await hashPassword('', salt);
      expect(await verifyPassword('', emptyHash, salt)).toBe(true);
      
      // Special characters
      const specialPassword = '!@#$%^&*()_+{}[]';
      const specialHash = await hashPassword(specialPassword, salt);
      expect(await verifyPassword(specialPassword, specialHash, salt)).toBe(true);
    });
  });
});