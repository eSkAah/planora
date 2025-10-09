/**
 * Manual Email Test Script
 *
 * Run this script to manually test the email service:
 * npx tsx scripts/test-email.ts your-email@example.com
 */

import * as dotenv from 'dotenv';
import * as React from 'react';
import { Resend } from 'resend';
import { resolve } from 'path';

// Make React globally available for JSX
(global as any).React = React;

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx tsx scripts/test-email.ts your-email@example.com');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }

  // Check API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('📧 Testing email service...');
  console.log(`📮 Sending test email to: ${email}`);
  console.log(`🔑 Using API key: ${apiKey.substring(0, 8)}...`);

  const resend = new Resend(apiKey);

  try {
    // Import email template
    const { WelcomeEmployeeEmail } = await import(
      '../src/emails/WelcomeEmployeeEmail'
    );

    const { data, error } = await resend.emails.send({
      from: 'Planora <onboarding@resend.dev>', // Resend test domain
      to: email,
      subject: 'Test - Bienvenue chez Planora',
      react: WelcomeEmployeeEmail({
        employeeName: 'Test User',
        companyName: 'Planora Test Company',
        magicLink: 'https://planora.app/auth/verify?token=test-magic-link-123',
      }),
    });

    if (error) {
      console.error('❌ Resend API error:');
      console.error(error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('📬 Email ID:', data?.id);
    console.log('\n📝 Check your inbox at:', email);
    console.log('⏱️  It may take a few seconds to arrive');
    console.log('\n💡 Tip: Check spam folder if not received');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);
    process.exit(1);
  }
}

main();
