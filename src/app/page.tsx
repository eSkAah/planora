'use client';

import {
  ChevronRight,
  Check,
  Shield,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth/actions';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email requis');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Format email invalide');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Mot de passe requis');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Minimum 6 caractères');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (formData: FormData) => {
    const emailValue = formData.get('email') as string;
    const passwordValue = formData.get('password') as string;

    const emailValid = validateEmail(emailValue);
    const passwordValid = validatePassword(passwordValue);

    if (!emailValid || !passwordValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(formData);
      if (result.success) {
        // Délai pour montrer l'animation de succès
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch {
      setError('Une erreur inattendue est survenue');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Planning Intelligent',
      description: 'Génération automatique des plannings optimisés par IA',
    },
    {
      icon: Users,
      title: 'Gestion d&apos;Équipe',
      description: 'Suivi complet des employés et de leurs disponibilités',
    },
    {
      icon: BarChart3,
      title: 'Analytics Avancés',
      description: 'Rapports détaillés et insights sur la productivité',
    },
    {
      icon: Shield,
      title: 'Sécurité Premium',
      description:
        'Protection des données avec chiffrement de niveau entreprise',
    },
  ];

  const benefits = [
    'Réduction de 70% du temps de planification',
    'Optimisation automatique des coûts de main-d&apos;œuvre',
    'Conformité légale garantie (France, Luxembourg)',
    'Interface intuitive, formation minimale requise',
  ];

  return (
    <div className='min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800'>
      {/* Animated background elements */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-blue-400/20 blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-purple-400/20 blur-3xl delay-1000'></div>
        <div className='animate-spin-slow absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl'></div>
      </div>

      {/* Navigation */}
      <nav
        className={`absolute top-0 z-50 w-full px-6 py-4 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
      >
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600'>
              <Calendar className='h-5 w-5 text-white' />
            </div>
            <span className='bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-slate-300'>
              Planora
            </span>
          </div>
          <Link
            href='/auth/register'
            className='text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      <div className='flex min-h-screen'>
        {/* Left Side - Product Benefits */}
        <div className='relative hidden overflow-hidden lg:flex lg:w-1/2'>
          {/* Background decoration */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20' />
          <div
            className={`absolute top-20 right-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl transition-all duration-2000 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          />
          <div
            className={`absolute bottom-20 left-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl transition-all delay-300 duration-2000 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          />

          <div
            className={`relative z-10 flex flex-col justify-center px-12 py-20 transition-all delay-500 duration-1000 xl:px-16 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-8 opacity-0'
            }`}
          >
            <div className='space-y-8'>
              {/* Hero Content */}
              <div className='space-y-6'>
                <div className='inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/60 px-3 py-1.5 backdrop-blur-sm dark:bg-slate-800/60'>
                  <Sparkles className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Propulsé par l&apos;IA
                  </span>
                </div>

                <h1 className='text-5xl leading-tight font-bold xl:text-6xl'>
                  <span className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'>
                    Planifiez
                  </span>
                  <br />
                  <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    plus intelligent
                  </span>
                </h1>

                <p className='text-xl leading-relaxed text-slate-600 dark:text-slate-400'>
                  La première solution SaaS qui révolutionne la gestion des
                  plannings avec l&apos;intelligence artificielle. Optimisez vos
                  équipes, respectez la législation, maximisez la productivité.
                </p>
              </div>

              {/* Features Grid */}
              <div className='grid grid-cols-2 gap-4'>
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className='border-white/20 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80'
                  >
                    <CardContent className='p-4'>
                      <feature.icon className='mb-2 h-6 w-6 text-blue-600' />
                      <h3 className='mb-1 text-sm font-semibold text-slate-900 dark:text-white'>
                        {feature.title}
                      </h3>
                      <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits List */}
              <div className='space-y-3'>
                {benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center space-x-3'>
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                      <Check className='h-3 w-3 text-green-600' />
                    </div>
                    <span className='text-sm text-slate-700 dark:text-slate-300'>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className='pt-4'>
                <Link href='/auth/register'>
                  <Button className='group rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'>
                    Essayer gratuitement
                    <ChevronRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className='flex flex-1 items-center justify-center px-6 py-20 lg:w-1/2'>
          <div
            className={`w-full max-w-md transition-all delay-700 duration-1000 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-8 opacity-0'
            }`}
          >
            <Card className='border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80'>
              <CardContent className='p-8'>
                <div className='space-y-6'>
                  {/* Header */}
                  <div className='space-y-2 text-center'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
                      {showForgotPassword ? 'Mot de passe oublié' : 'Connexion'}
                    </h2>
                    <p className='text-slate-600 dark:text-slate-400'>
                      {showForgotPassword
                        ? 'Entrez votre email pour réinitialiser votre mot de passe'
                        : 'Accédez à votre espace Planora'}
                    </p>
                  </div>

                  {/* Login Form */}
                  {!showForgotPassword ? (
                    <form action={handleLogin} className='space-y-4'>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <div className='relative'>
                            <Input
                              type='email'
                              name='email'
                              placeholder='Votre email'
                              value={email}
                              onChange={e => {
                                setEmail(e.target.value);
                                if (emailError && e.target.value) {
                                  validateEmail(e.target.value);
                                }
                              }}
                              onBlur={() => validateEmail(email)}
                              className={`h-12 border-slate-200/50 bg-white/50 pr-10 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/50 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                emailError
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                  : ''
                              } ${
                                email && !emailError ? 'border-green-500' : ''
                              }`}
                            />
                            {email && !emailError && (
                              <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                                <Check className='h-4 w-4 text-green-500' />
                              </div>
                            )}
                          </div>
                          {emailError && (
                            <p className='animate-in slide-in-from-top-2 text-xs text-red-500 duration-300'>
                              {emailError}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <div className='relative'>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              name='password'
                              placeholder='Votre mot de passe'
                              value={password}
                              onChange={e => {
                                setPassword(e.target.value);
                                if (passwordError && e.target.value) {
                                  validatePassword(e.target.value);
                                }
                              }}
                              onBlur={() => validatePassword(password)}
                              className={`h-12 border-slate-200/50 bg-white/50 pr-16 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/50 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                passwordError
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                  : ''
                              } ${
                                password && !passwordError
                                  ? 'border-green-500'
                                  : ''
                              }`}
                            />
                            <div className='absolute top-1/2 right-3 flex -translate-y-1/2 items-center space-x-2'>
                              {password && !passwordError && (
                                <Check className='h-4 w-4 text-green-500' />
                              )}
                              <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:hover:text-slate-300'
                              >
                                {showPassword ? (
                                  <EyeOff className='h-4 w-4' />
                                ) : (
                                  <Eye className='h-4 w-4' />
                                )}
                              </button>
                            </div>
                          </div>
                          {passwordError && (
                            <p className='animate-in slide-in-from-top-2 text-xs text-red-500 duration-300'>
                              {passwordError}
                            </p>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
                          <p className='text-sm text-red-600 dark:text-red-400'>
                            {error}
                          </p>
                        </div>
                      )}

                      <Button
                        type='submit'
                        disabled={
                          isLoading ||
                          !!emailError ||
                          !!passwordError ||
                          !email ||
                          !password
                        }
                        className='h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Connexion...
                          </>
                        ) : (
                          <div className='flex items-center justify-center'>
                            Se connecter
                            <ChevronRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                          </div>
                        )}
                      </Button>
                    </form>
                  ) : (
                    /* Forgot Password Form */
                    <form className='space-y-4'>
                      <Input
                        type='email'
                        placeholder='Votre email'
                        className='h-12 border-slate-200/50 bg-white/50 transition-colors focus:bg-white dark:border-slate-700/50 dark:bg-slate-800/50 dark:focus:bg-slate-800'
                        required
                      />

                      <Button
                        type='submit'
                        className='h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                      >
                        Envoyer le lien de réinitialisation
                      </Button>
                    </form>
                  )}

                  {/* Footer Links */}
                  <div className='space-y-4 text-center'>
                    <button
                      onClick={() => setShowForgotPassword(!showForgotPassword)}
                      className='text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      {showForgotPassword
                        ? 'Retour à la connexion'
                        : 'Mot de passe oublié ?'}
                    </button>

                    {!showForgotPassword && (
                      <>
                        <div className='relative'>
                          <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-slate-200 dark:border-slate-700' />
                          </div>
                          <div className='relative flex justify-center text-sm'>
                            <span className='bg-white/80 px-2 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400'>
                              ou
                            </span>
                          </div>
                        </div>

                        <Link href='/auth/register'>
                          <Button
                            variant='outline'
                            className='h-12 w-full border-slate-200/50 bg-white/50 transition-colors hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                          >
                            Créer un nouveau compte
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Features - Only visible on small screens */}
            <div className='mt-8 space-y-4 lg:hidden'>
              <h3 className='text-center text-lg font-semibold text-slate-900 dark:text-white'>
                Pourquoi choisir Planora ?
              </h3>
              <div className='grid grid-cols-1 gap-3'>
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-3 rounded-lg border border-white/20 bg-white/60 p-3 backdrop-blur-sm dark:bg-slate-800/60'
                  >
                    <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                      <Check className='h-3 w-3 text-green-600' />
                    </div>
                    <span className='text-sm text-slate-700 dark:text-slate-300'>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
