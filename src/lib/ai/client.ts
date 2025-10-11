/**
 * OpenAI Client Configuration
 *
 * Centralized OpenAI client with environment configuration
 */

import 'server-only';

import OpenAI from 'openai';

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    '⚠️  OPENAI_API_KEY not configured - AI schedule generation will not work'
  );
}

export const openai = apiKey
  ? new OpenAI({
      apiKey,
      timeout: 60000, // 60 seconds timeout
      maxRetries: 3,
    })
  : null;

/**
 * Get the configured OpenAI model
 */
export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Using gpt-4o-mini for cost efficiency
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!openai;
}
