'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { type FieldPath, type SubmitHandler, useForm } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  useToast,
} from '@/components/ui';
import { createAccount } from '@/lib/auth/actions';
import {
  accountCreationSchema,
  type AccountCreationInput,
} from '@/lib/validations';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered?: (email: string) => void;
};

const defaultValues: AccountCreationInput = {
  company: { name: '', country: '', sector: '' },
  user: {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'ADMIN',
  },
};

type AccountFieldPath = FieldPath<AccountCreationInput>;

export default function AuthDialog({
  open,
  onOpenChange,
  onRegistered,
}: AuthDialogProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<AccountCreationInput>({
    resolver: zodResolver(accountCreationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const buildFormData = (data: AccountCreationInput) => {
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
    return formData;
  };

  const onSubmit: SubmitHandler<AccountCreationInput> = async data => {
    const formData = buildFormData(data);

    try {
      const response = await createAccount(formData);

      if (!response.success) {
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages[0]) {
              form.setError(field as AccountFieldPath, {
                message: messages[0],
              });
            }
          });
        }

        toast({
          variant: 'destructive',
          title: 'Création impossible',
          description:
            response.error ?? 'Vérifiez les informations saisies et réessayez.',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Compte créé',
        description: (response.data as any)?.autoSignedIn
          ? 'Vous êtes maintenant connecté. Redirection...'
          : 'Vous pouvez maintenant vous connecter.',
      });

      form.reset(defaultValues);
      setShowPassword(false);
      setShowConfirmPassword(false);
      onOpenChange(false);

      // If auto-signed in, redirect to dashboard
      if ((response.data as any)?.autoSignedIn) {
        window.location.href = '/dashboard';
      } else {
        // Fallback to old behavior if auto-signin failed
        onRegistered?.(data.user.email);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur inattendue',
        description: 'Réessayez dans quelques instants.',
      });
    }
  };

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      form.reset(defaultValues);
      form.clearErrors();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0F1F33] p-8 text-white shadow-[0_30px_90px_-40px_rgba(3,13,28,0.85)] backdrop-blur-xl'>
        <DialogHeader className='space-y-1 text-left'>
          <DialogTitle className='text-3xl font-semibold text-white'>
            Créer un compte
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='mt-6 grid gap-6'
          >
            <section className='space-y-4'>
              <p className='text-xs font-semibold tracking-[0.32em] text-white/40 uppercase'>
                Entreprise
              </p>

              <FormField
                control={form.control}
                name='company.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white/75'>
                      Nom de l&apos;entreprise
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex. Planora SAS'
                        className='h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='company.country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/75'>Pays</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='h-11 rounded-2xl border-white/15 bg-white/10 text-white focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'>
                            <SelectValue placeholder='Sélectionner' />
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
                      <FormLabel className='text-white/75'>Secteur</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ex. Conseil'
                          className='h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className='space-y-4'>
              <p className='text-xs font-semibold tracking-[0.32em] text-white/40 uppercase'>
                Administrateur
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='user.firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/75'>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Julie'
                          className='h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                          {...field}
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
                      <FormLabel className='text-white/75'>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Martin'
                          className='h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                          {...field}
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
                    <FormLabel className='text-white/75'>
                      Email professionnel
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='vous@planora.com'
                        autoComplete='email'
                        className='h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
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
                    <FormLabel className='text-white/75'>Rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='h-11 rounded-2xl border-white/15 bg-white/10 text-white focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'>
                          <SelectValue placeholder='Sélectionner un rôle' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ADMIN'>Administrateur</SelectItem>
                        <SelectItem value='MANAGER'>Manager</SelectItem>
                        <SelectItem value='EMPLOYEE'>Employé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className='space-y-4'>
              <p className='text-xs font-semibold tracking-[0.32em] text-white/40 uppercase'>
                Sécurité
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='user.password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/75'>
                        Mot de passe
                      </FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            className='h-11 rounded-2xl border-white/15 bg-white/10 pr-12 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                            {...field}
                          />
                        </FormControl>
                        <button
                          type='button'
                          onClick={() => setShowPassword(previous => !previous)}
                          className='absolute top-1/2 right-3 -translate-y-1/2 text-white/60 transition hover:text-white'
                          aria-label={
                            showPassword
                              ? 'Masquer le mot de passe'
                              : 'Afficher le mot de passe'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='user.confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white/75'>
                        Confirmation
                      </FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            className='h-11 rounded-2xl border-white/15 bg-white/10 pr-12 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                            {...field}
                          />
                        </FormControl>
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(previous => !previous)
                          }
                          className='absolute top-1/2 right-3 -translate-y-1/2 text-white/60 transition hover:text-white'
                          aria-label={
                            showConfirmPassword
                              ? 'Masquer la confirmation'
                              : 'Afficher la confirmation'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Button
              type='submit'
              className='h-12 cursor-pointer rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition hover:bg-[#f6f07a] focus-visible:ring-[#F2E94E]/40'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? 'Création en cours…'
                : 'Créer mon compte'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
