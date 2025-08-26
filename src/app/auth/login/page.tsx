// ==============================================
// PLANORA - LOGIN PAGE
// ==============================================

'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { signIn } from '@/lib/auth/actions';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  async function handleSubmit(formData: FormData) {
    setError('');

    startTransition(async () => {
      const result = await signIn(formData);

      if (!result.success) {
        setError(result.error || 'An error occurred');
      } else {
        // Redirect will be handled by the server action
        window.location.href = '/dashboard';
      }
    });
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 text-4xl'>🗓️</div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Connexion à Planora
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
            Ou{' '}
            <Link
              href='/auth/register'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              créer un nouveau compte
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' action={handleSubmit}>
          {error && (
            <div className='rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/20'>
              <p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='sr-only'>
                Adresse email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                placeholder='Adresse email'
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Mot de passe
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                placeholder='Mot de passe'
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-900 dark:text-gray-300'
              >
                Se souvenir de moi
              </label>
            </div>

            <div className='text-sm'>
              <Link
                href='/auth/reset-password'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isPending}
              className='group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900'
            >
              {isPending ? (
                <svg
                  className='h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className='mt-6'>
            <div className='text-center'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Première fois sur Planora ?{' '}
                <Link
                  href='/auth/register'
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Créer un compte
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
