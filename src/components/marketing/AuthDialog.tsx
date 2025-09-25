'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
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
import { signIn, createAccount } from '@/lib/auth/actions';
import {
  accountCreationSchema,
  type AccountCreationInput,
} from '@/lib/validations';

type Mode = 'login' | 'register';

export default function AuthDialog({
  open,
  onOpenChange,
  initialMode = 'login',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [direction, setDirection] = useState<1 | -1 | 0>(0);
  const [isPendingLogin, startLogin] = useTransition();
  const [loginError, setLoginError] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);
  const [prefillEmail, setPrefillEmail] = useState<string>('');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setDirection(0);
    }
  }, [initialMode, open]);

  const formTransitions = useMemo(
    () => ({ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }),
    []
  );

  const form = useForm<AccountCreationInput>({
    resolver: zodResolver(accountCreationSchema),
    mode: 'onChange',
    defaultValues: {
      company: { name: '', country: '', sector: '' },
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

  const onRegisterSubmit: SubmitHandler<AccountCreationInput> = async data => {
    setResult(null);

    const fd = new FormData();
    fd.set('company.name', data.company.name);
    fd.set('company.country', data.company.country);
    fd.set('company.sector', data.company.sector);
    fd.set('user.email', data.user.email);
    fd.set('user.password', data.user.password);
    fd.set('user.confirmPassword', data.user.confirmPassword);
    fd.set('user.firstName', data.user.firstName);
    fd.set('user.lastName', data.user.lastName);
    fd.set('user.role', data.user.role);

    try {
      const response = await createAccount(fd);
      setResult(response);

      if (!response.success) {
        return;
      }

      setPrefillEmail(data.user.email);
      form.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
      setDirection(-1);
      setMode('login');
    } catch {
      setResult({
        success: false,
        error: 'Une erreur inattendue est survenue',
      });
    }
  };

  async function handleLogin(formData: FormData) {
    setLoginError('');
    startLogin(async () => {
      const res = await signIn(formData);
      if (!res.success) {
        setLoginError(res.error || 'Erreur de connexion');
      } else {
        window.location.href = '/dashboard';
      }
    });
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </DialogTitle>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className='mb-6 flex'>
          <div className='bg-muted relative w-full rounded-2xl p-1'>
            {/* Animated background slider */}
            <div
              className={`bg-secondary absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-sm transition-transform duration-300 ease-out ${
                mode === 'register' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            <button
              type='button'
              onClick={() => {
                if (mode !== 'login') {
                  setDirection(-1);
                  setMode('login');
                }
              }}
              className={`relative z-10 w-1/2 rounded-xl py-3 text-sm font-medium transition-colors duration-300 ${
                mode === 'login'
                  ? 'text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              type='button'
              onClick={() => {
                if (mode !== 'register') {
                  setDirection(1);
                  setMode('register');
                }
              }}
              className={`relative z-10 w-1/2 rounded-xl py-3 text-sm font-medium transition-colors duration-300 ${
                mode === 'register'
                  ? 'text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
          </div>
        </div>

        {/* Forms Container with smooth transition */}
        <div className='relative min-h-[440px]'>
          <AnimatePresence mode='wait' initial={false} custom={direction}>
            {mode === 'login' ? (
              <motion.div
                key='login'
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction === 0 ? 0 : 24 * direction,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: formTransitions,
                }}
                exit={{
                  opacity: 0,
                  x: direction === 0 ? 0 : -24 * direction,
                  scale: 0.98,
                  transition: formTransitions,
                }}
                className='space-y-4'
              >
                <form action={handleLogin} className='space-y-4'>
                  {loginError && (
                    <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm'>
                      {loginError}
                    </div>
                  )}

                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        name='email'
                        placeholder='votre@email.com'
                        required
                        defaultValue={prefillEmail}
                      />
                    </div>

                    <div>
                      <Label htmlFor='password'>Mot de passe</Label>
                      <div className='relative'>
                        <Input
                          id='password'
                          type={showPassword ? 'text' : 'password'}
                          name='password'
                          placeholder='Votre mot de passe'
                          required
                          className='pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute top-1/2 right-3 -translate-y-1/2'
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type='submit'
                    disabled={isPendingLogin}
                    className='w-full'
                  >
                    {isPendingLogin ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key='register'
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction === 0 ? 0 : 24 * direction,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: formTransitions,
                }}
                exit={{
                  opacity: 0,
                  x: direction === 0 ? 0 : -24 * direction,
                  scale: 0.98,
                  transition: formTransitions,
                }}
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onRegisterSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='company.name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l&apos;entreprise</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex. Acme SAS' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-4'>
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
                                  <SelectValue placeholder='Sélectionner' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='France'>
                                  🇫🇷 France
                                </SelectItem>
                                <SelectItem value='Luxembourg'>
                                  🇱🇺 Luxembourg
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
                            <FormLabel>Secteur</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Ex. Restauration'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='user.firstName'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder='Jean' {...field} />
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
                              <Input placeholder='Dupont' {...field} />
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
                              placeholder='email@exemple.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='user.password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <div className='relative'>
                              <FormControl>
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder='••••••••'
                                  {...field}
                                  className='pr-10'
                                />
                              </FormControl>
                              <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute top-1/2 right-3 -translate-y-1/2'
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
                            <FormLabel>Confirmer</FormLabel>
                            <div className='relative'>
                              <FormControl>
                                <Input
                                  type={
                                    showConfirmPassword ? 'text' : 'password'
                                  }
                                  placeholder='••••••••'
                                  {...field}
                                  className='pr-10'
                                />
                              </FormControl>
                              <button
                                type='button'
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className='absolute top-1/2 right-3 -translate-y-1/2'
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

                    <FormField
                      control={form.control}
                      name='user.role'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre rôle</FormLabel>
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
                              <SelectItem value='MANAGER'>
                                📊 Manager
                              </SelectItem>
                              <SelectItem value='EMPLOYEE'>
                                👤 Employé
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {result?.error && (
                      <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm'>
                        {result.error}
                      </div>
                    )}
                    {result?.success && (
                      <div className='border-accent/50 bg-accent/10 text-accent-foreground rounded-lg border p-3 text-sm'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='h-4 w-4' />
                          Compte créé avec succès ! Connectez-vous pour
                          commencer.
                        </div>
                      </div>
                    )}

                    <Button
                      type='submit'
                      className='w-full'
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? 'Création...'
                        : 'Créer un compte'}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
