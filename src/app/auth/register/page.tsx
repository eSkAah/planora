/**
 * Registration Page
 *
 * Account creation form for companies and users.
 */

'use client';

import { useState } from 'react';

import { createAccount } from '@/lib/auth';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await createAccount(formData);
      setResult(response);

      if (response.success) {
        // Handle successful registration - could redirect to dashboard
        // For now, just show success message
      }
    } catch {
      setResult({
        success: false,
        error: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Create Account</h1>

      <form action={handleSubmit} className='space-y-6'>
        {/* Company Information */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Company Information</h2>

          <div>
            <label
              htmlFor='company.name'
              className='mb-1 block text-sm font-medium'
            >
              Company Name
            </label>
            <input
              type='text'
              id='company.name'
              name='company.name'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            {result?.fieldErrors?.['company.name'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['company.name'][0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='company.country'
              className='mb-1 block text-sm font-medium'
            >
              Country
            </label>
            <select
              id='company.country'
              name='company.country'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <option value=''>Select Country</option>
              <option value='France'>France</option>
              <option value='Luxembourg'>Luxembourg</option>
            </select>
            {result?.fieldErrors?.['company.country'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['company.country'][0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='company.sector'
              className='mb-1 block text-sm font-medium'
            >
              Sector
            </label>
            <input
              type='text'
              id='company.sector'
              name='company.sector'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            {result?.fieldErrors?.['company.sector'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['company.sector'][0]}
              </p>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>User Information</h2>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='user.firstName'
                className='mb-1 block text-sm font-medium'
              >
                First Name
              </label>
              <input
                type='text'
                id='user.firstName'
                name='user.firstName'
                required
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
              {result?.fieldErrors?.['user.firstName'] && (
                <p className='mt-1 text-sm text-red-500'>
                  {result.fieldErrors['user.firstName'][0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='user.lastName'
                className='mb-1 block text-sm font-medium'
              >
                Last Name
              </label>
              <input
                type='text'
                id='user.lastName'
                name='user.lastName'
                required
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
              {result?.fieldErrors?.['user.lastName'] && (
                <p className='mt-1 text-sm text-red-500'>
                  {result.fieldErrors['user.lastName'][0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor='user.email'
              className='mb-1 block text-sm font-medium'
            >
              Email
            </label>
            <input
              type='email'
              id='user.email'
              name='user.email'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            {result?.fieldErrors?.['user.email'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['user.email'][0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='user.role'
              className='mb-1 block text-sm font-medium'
            >
              Role
            </label>
            <select
              id='user.role'
              name='user.role'
              defaultValue='admin'
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <option value='admin'>Admin</option>
              <option value='manager'>Manager</option>
              <option value='employee'>Employee</option>
            </select>
            {result?.fieldErrors?.['user.role'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['user.role'][0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='user.password'
              className='mb-1 block text-sm font-medium'
            >
              Password
            </label>
            <input
              type='password'
              id='user.password'
              name='user.password'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            {result?.fieldErrors?.['user.password'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['user.password'][0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='user.confirmPassword'
              className='mb-1 block text-sm font-medium'
            >
              Confirm Password
            </label>
            <input
              type='password'
              id='user.confirmPassword'
              name='user.confirmPassword'
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            {result?.fieldErrors?.['user.confirmPassword'] && (
              <p className='mt-1 text-sm text-red-500'>
                {result.fieldErrors['user.confirmPassword'][0]}
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {result?.error && (
          <div className='rounded-md border border-red-200 bg-red-50 p-4'>
            <p className='text-red-800'>{result.error}</p>
          </div>
        )}

        {/* Success Display */}
        {result?.success && (
          <div className='rounded-md border border-green-200 bg-green-50 p-4'>
            <p className='text-green-800'>Account created successfully!</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
