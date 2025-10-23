import { describe, expect, it } from '@jest/globals';

import {
  userLoginSchema,
  accountCreationSchema,
  employeeListQuerySchema,
} from '@/lib/validations';

describe('Validation schemas', () => {
  describe('userLoginSchema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123',
      };

      const result = userLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123',
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('accountCreationSchema', () => {
    it('should validate correct account creation data', () => {
      const validData = {
        company: {
          name: 'Test Company',
          country: 'France',
          sector: 'Technology',
        },
        user: {
          email: 'admin@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN',
        },
      };

      const result = accountCreationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        company: {
          name: 'Test Company',
          country: 'France',
          sector: 'Technology',
        },
        user: {
          email: 'admin@test.com',
          password: 'Password123',
          confirmPassword: 'DifferentPassword',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN',
        },
      };

      const result = accountCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid country', () => {
      const invalidData = {
        company: {
          name: 'Test Company',
          country: 'Invalid Country',
          sector: 'Technology',
        },
        user: {
          email: 'admin@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN',
        },
      };

      const result = accountCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('employeeListQuerySchema', () => {
    it('should validate correct employee query data', () => {
      const validData = {
        search: 'John',
        department: 'Engineering',
        status: 'active',
        page: 1,
        limit: 10,
      };

      const result = employeeListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should provide default values', () => {
      const minimalData = {};

      const result = employeeListQuerySchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'invalid-status',
      };

      const result = employeeListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative page number', () => {
      const invalidData = {
        page: -1,
      };

      const result = employeeListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject excessive limit', () => {
      const invalidData = {
        limit: 1000,
      };

      const result = employeeListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
