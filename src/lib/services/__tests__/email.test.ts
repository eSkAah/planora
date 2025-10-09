/**
 * Email Service Tests
 *
 * Tests for the Resend email service to ensure magic link emails
 * are sent correctly.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

import { sendEmail, sendWelcomeEmail } from '../email';

describe('Email Service', () => {
  // Test email - use a real email you control for manual verification
  const TEST_EMAIL = 'test@example.com';

  beforeAll(() => {
    // Ensure RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY must be set in environment variables for email tests');
    }
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with magic link successfully', async () => {
      const result = await sendWelcomeEmail({
        email: TEST_EMAIL,
        employeeName: 'John Doe',
        companyName: 'Planora Test Company',
        magicLink: 'https://planora.app/auth/verify?token=test123',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    }, 30000); // 30s timeout for network request

    it('should fail gracefully with invalid email', async () => {
      await expect(
        sendWelcomeEmail({
          email: 'invalid-email',
          employeeName: 'John Doe',
          companyName: 'Planora Test',
          magicLink: 'https://planora.app/auth/verify?token=test123',
        })
      ).rejects.toThrow();
    });
  });

  describe('sendEmail (generic)', () => {
    it('should send email with custom React component', async () => {
      const { WelcomeEmployeeEmail } = await import(
        '@/emails/WelcomeEmployeeEmail'
      );

      const result = await sendEmail({
        to: TEST_EMAIL,
        subject: 'Test Email from Planora',
        react: WelcomeEmployeeEmail({
          employeeName: 'Test User',
          companyName: 'Test Company',
          magicLink: 'https://example.com/magic-link',
        }),
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    }, 30000);
  });
});
