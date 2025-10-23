// Set required environment variables for tests
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-anon-anon';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
