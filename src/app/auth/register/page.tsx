'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui';
import { createAccount } from '@/lib/auth/actions';
import {
  accountCreationSchema,
  type AccountCreationInput,
} from '@/lib/validations';

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  const form = useForm<AccountCreationInput>({
    resolver: zodResolver(accountCreationSchema),
    mode: 'onChange',
    defaultValues: {
      company: {
        name: '',
        country: '',
        sector: '',
      },
      user: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'ADMIN',
      },
    },
  });

  const steps = useMemo(
    () => [
      'Définissez votre entreprise',
      'Créez votre compte premium',
      'Invitez votre équipe en un clic',
    ],
    []
  );

  const onSubmit: SubmitHandler<AccountCreationInput> = data => {
    setResult(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set('company.name', data.company.name);
      formData.set('company.country', data.company.country);
      formData.set('company.sector', data.company.sector);
      formData.set('user.email', data.user.email);
      formData.set('user.password', data.user.password);
      formData.set('user.confirmPassword', data.user.confirmPassword);
      formData.set('user.firstName', data.user.firstName);
      formData.set('user.lastName', data.user.lastName);
      formData.set('user.role', data.user.role);

      try {
        const response = await createAccount(formData);
        setResult(response);

        if (response.success) {
          form.reset();
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
      } catch {
        setResult({
          success: false,
          error: 'Une erreur inattendue est survenue',
        });
      }
    });
  };

  return (
    <div className='grid gap-10 text-white lg:grid-cols-[1.05fr_1fr]'>
      <div className='space-y-8'>
        <div className='flex items-center gap-3 text-sm tracking-[0.35em] text-white/60 uppercase'>
          <span className='h-[1px] w-10 bg-white/40' />
          <span>Onboarding Planora</span>
        </div>
        <h1 className='text-4xl leading-tight font-semibold md:text-5xl'>
          Structurez votre organisation en quelques minutes.
        </h1>
        <p className='max-w-xl text-base leading-relaxed text-white/70'>
          Configurez un tenant sécurisé, appliquez automatiquement les règles
          légales par pays et commencez à générer des plannings optimisés par
          IA.
        </p>

        <div className='space-y-4'>
          {steps.map((step, index) => (
            <div
              key={step}
              className='flex items-center gap-4 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 backdrop-blur-xl'
            >
              <span className='bg-secondary text-primary flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold'>
                {index + 1}
              </span>
              <span className='text-sm text-white/70'>{step}</span>
            </div>
          ))}
        </div>

        <p className='text-sm text-white/50'>
          Vous avez déjà un accès ?{' '}
          <Link
            href='/auth/login'
            className='text-secondary hover:text-secondary/80 transition-colors'
          >
            Connectez-vous à Planora
          </Link>
        </p>
      </div>

      <div className='rounded-[28px] border border-white/10 bg-black/18 p-8 backdrop-blur-xl sm:p-10'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-2 text-left'>
              <h2 className='text-2xl font-semibold text-white'>
                Créer mon espace
              </h2>
              <p className='text-sm text-white/60'>
                Ces informations permettent de configurer votre tenant, vos
                règles légales et votre compte administrateur.
              </p>
            </div>

            <div className='space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6'>
              <div className='flex items-center justify-between text-sm text-white/60'>
                <span className='font-semibold text-white/80'>Entreprise</span>
                <span>1 / 2</span>
              </div>
              <Separator className='bg-white/10' />

              <FormField
                control={form.control}
                name='company.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white/70'>
                      Nom de l&apos;entreprise
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nom de votre entreprise'
                        {...field}
                        className='bg-white/6 text-white placeholder:text-white/35'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='company.country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>Pays</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Sélectionnez votre pays' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='France'>France</SelectItem>
                          <SelectItem value='Luxembourg'>Luxembourg</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='company.sector'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>
                        Secteur d&apos;activité
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='ex. Retail, Hospitality, Service...'
                          {...field}
                          className='bg-white/6 text-white placeholder:text-white/35'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6'>
              <div className='flex items-center justify-between text-sm text-white/60'>
                <span className='font-semibold text-white/80'>
                  Compte administrateur
                </span>
                <span>2 / 2</span>
              </div>
              <Separator className='bg-white/10' />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='user.firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Jean'
                          {...field}
                          className='bg-white/6 text-white placeholder:text-white/35'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='user.lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Dupont'
                          {...field}
                          className='bg-white/6 text-white placeholder:text-white/35'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='user.email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white/70'>
                      Adresse e-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='vous@entreprise.com'
                        {...field}
                        className='bg-white/6 text-white placeholder:text-white/35'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='user.password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          {...field}
                          className='bg-white/6 text-white placeholder:text-white/35'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='user.confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/70'>Confirmez</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          {...field}
                          className='bg-white/6 text-white placeholder:text-white/35'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='user.role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white/70'>Votre rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ADMIN'>👑 Admin</SelectItem>
                        <SelectItem value='MANAGER'>📊 Manager</SelectItem>
                        <SelectItem value='EMPLOYEE'>👤 Employé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {result?.error ? (
              <div className='border-destructive/40 bg-destructive/15 text-destructive-foreground rounded-2xl border p-3 text-sm'>
                {result.error}
              </div>
            ) : null}
            {result?.success ? (
              <div className='border-secondary/50 bg-secondary/15 text-primary rounded-2xl border p-3 text-sm'>
                Compte créé avec succès ! Redirection vers la connexion...
              </div>
            ) : null}

            <Button
              type='submit'
              size='lg'
              disabled={isPending || form.formState.isSubmitting}
              className='bg-secondary text-primary hover:bg-secondary/90 w-full rounded-2xl transition-all duration-300 hover:-translate-y-0.5'
            >
              {isPending || form.formState.isSubmitting
                ? 'Création en cours...'
                : 'Créer mon espace'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
