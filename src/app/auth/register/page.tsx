// ==============================================
// PLANORA - REGISTRATION PAGE WITH SHADCN/UI
// ==============================================

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  const onSubmit: SubmitHandler<AccountCreationInput> = data => {
    setResult(null);

    startTransition(async () => {
      const formData = new FormData();

      // Map the form data to FormData format expected by server action
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
          // Reset form only on success
          form.reset();
          // Redirect to login after success message
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
      } catch {
        setResult({
          success: false,
          error: 'An unexpected error occurred',
        });
      }
    });
  };

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center px-4 py-12'>
      <div className='w-full max-w-2xl space-y-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 text-4xl'>🗓️</div>
          <h1 className='text-3xl font-bold'>Créer un compte Planora</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Configurez votre entreprise et créez votre compte administrateur
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de création</CardTitle>
            <CardDescription>
              Remplissez les informations de votre entreprise et votre compte
              administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {/* Company Section */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Entreprise</h3>

                  <FormField
                    control={form.control}
                    name='company.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l&apos;entreprise</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Nom de votre entreprise'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='company.country'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
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
                            <SelectItem value='Luxembourg'>
                              Luxembourg
                            </SelectItem>
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
                        <FormLabel>Secteur d&apos;activité</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='ex: Restaurant, Retail, Healthcare...'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* User Section */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Compte Administrateur</h3>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='user.firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder='Votre prénom' {...field} />
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
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder='Votre nom' {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='votre.email@entreprise.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='user.role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
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
                            <SelectItem value='ADMIN'>Admin</SelectItem>
                            <SelectItem value='MANAGER'>Manager</SelectItem>
                            <SelectItem value='EMPLOYEE'>Employé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='user.password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='Votre mot de passe'
                            {...field}
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
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='Confirmez votre mot de passe'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Display */}
                {result?.error && (
                  <div className='rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/20'>
                    <p className='text-sm text-red-800 dark:text-red-200'>
                      {result.error}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {result?.success && (
                  <div className='rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20'>
                    <p className='text-sm text-green-800 dark:text-green-200'>
                      🎉 Compte créé avec succès ! Redirection vers la
                      connexion...
                    </p>
                  </div>
                )}

                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      Création en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </form>
            </Form>

            <div className='mt-6 text-center text-sm'>
              <p className='text-muted-foreground'>
                Vous avez déjà un compte ?{' '}
                <Link
                  href='/auth/login'
                  className='text-primary font-medium hover:underline'
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
