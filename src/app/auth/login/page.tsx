'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { signIn } from '@/lib/auth/actions';
import { type UserLoginInput, userLoginSchema } from '@/lib/validations';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>('');

  const form = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<UserLoginInput> = data => {
    setFormError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', data.email);
      formData.set('password', data.password);

      const result = await signIn(formData);

      if (!result.success) {
        setFormError(result.error || 'Impossible de vous connecter');
        return;
      }

      window.location.href = '/dashboard';
    });
  };

  return (
    <div className='grid gap-10 text-white md:grid-cols-[1.1fr_1fr]'>
      <div className='space-y-6'>
        <div className='flex items-center gap-3 text-sm tracking-[0.35em] text-white/60 uppercase'>
          <span className='h-[1px] w-10 bg-white/40' />
          <span>Connexion sécurisée</span>
        </div>
        <h1 className='text-4xl leading-tight font-semibold md:text-5xl'>
          Retrouvez vos plannings premium en un clin d&apos;œil.
        </h1>
        <p className='max-w-lg text-base leading-relaxed text-white/70'>
          Accédez à votre espace Planora pour piloter vos équipes, vérifier la
          conformité et orchestrer des plannings intelligents en toute sérénité.
        </p>
        <div className='grid gap-3 text-sm text-white/50 sm:grid-cols-2'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg'>
            <p className='font-medium text-white/80'>Connexion rapide</p>
            <p>Synchronisation instantanée des données multi-tenant.</p>
          </div>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg'>
            <p className='font-medium text-white/80'>Sécurité renforcée</p>
            <p>Protection RGPD & MFA pour vos administrateurs.</p>
          </div>
        </div>
      </div>

      <div className='rounded-[28px] border border-white/10 bg-black/20 p-8 backdrop-blur-xl sm:p-10'>
        <div className='mb-6 space-y-2 text-center sm:text-left'>
          <h2 className='text-2xl font-semibold text-white'>Connectez-vous</h2>
          <p className='text-sm text-white/60'>
            Pas encore de compte ?{' '}
            <Link
              href='/auth/register'
              className='text-secondary hover:text-secondary/80 transition-colors'
            >
              Créez votre espace Planora
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {formError ? (
              <div className='border-destructive/40 bg-destructive/15 text-destructive-foreground rounded-2xl border p-3 text-sm'>
                {formError}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white/70'>
                    Adresse e-mail
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='vous@entreprise.com'
                      autoComplete='email'
                      {...field}
                      className='bg-white/5 text-white placeholder:text-white/40'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white/70'>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Mot de passe'
                      autoComplete='current-password'
                      {...field}
                      className='bg-white/5 text-white placeholder:text-white/40'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-between text-sm text-white/60'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  className='text-secondary focus:ring-secondary h-4 w-4 rounded border-white/20 bg-transparent'
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link href='/auth/reset-password' className='hover:text-white'>
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type='submit'
              size='lg'
              disabled={isPending}
              className='bg-secondary text-primary hover:bg-secondary/90 w-full rounded-2xl transition-all duration-300 hover:-translate-y-0.5'
            >
              {isPending ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
