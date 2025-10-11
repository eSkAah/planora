// ==============================================
// PLANORA - EMAIL SERVICE
// ==============================================

import 'server-only';

import { Resend } from 'resend';

import { serverEnv } from '@/lib/env/server';

// Initialize Resend client
const resend = serverEnv.resendApiKey
  ? new Resend(serverEnv.resendApiKey)
  : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = 'Planora <onboarding@resend.dev>',
}: SendEmailOptions) {
  if (!resend) {
    console.error('❌ Resend API key not configured - email not sent');
    console.log('📧 Email details:', { to, subject, from });
    throw new Error(
      'Email service not configured. Please add RESEND_API_KEY to your environment variables.'
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Send welcome email with magic link to employee
 */
export async function sendWelcomeEmail({
  email,
  employeeName,
  companyName,
  magicLink,
}: {
  email: string;
  employeeName: string;
  companyName: string;
  magicLink: string;
}) {
  // Dynamic import to avoid loading React Email components on every import
  const { WelcomeEmployeeEmail } = await import(
    '@/emails/WelcomeEmployeeEmail'
  );

  return sendEmail({
    to: email,
    subject: `Bienvenue chez ${companyName} - Accédez à votre compte Planora`,
    react: WelcomeEmployeeEmail({
      employeeName,
      companyName,
      magicLink,
    }),
  });
}

/**
 * Send magic link login email
 */
export async function sendLoginMagicLink({
  email,
  userName,
  magicLink,
}: {
  email: string;
  userName?: string;
  magicLink: string;
}) {
  // Dynamic import to avoid loading React Email components on every import
  const { LoginMagicLinkEmail } = await import('@/emails/LoginMagicLinkEmail');

  return sendEmail({
    to: email,
    subject: 'Connexion à votre compte Planora',
    react: LoginMagicLinkEmail({
      userName: userName || '',
      magicLink,
    }),
  });
}
