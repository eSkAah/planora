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
  Mail,
  Lock,
  Building2,
  Globe,
  Briefcase,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { signIn, createAccount } from '@/lib/auth/actions';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [sector, setSector] = useState('');
  const [role] = useState('ADMIN');

  // Register validation errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [sectorError, setSectorError] = useState('');

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
    if (isRegisterMode) {
      if (password.length < 8) {
        setPasswordError('Minimum 8 caractères');
        return false;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        setPasswordError('Doit contenir minuscule, majuscule et chiffre');
        return false;
      }
    } else {
      if (password.length < 6) {
        setPasswordError('Minimum 6 caractères');
        return false;
      }
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPwd: string) => {
    if (!confirmPwd) {
      setConfirmPasswordError('Confirmation requise');
      return false;
    }
    if (confirmPwd !== password) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateFirstName = (name: string) => {
    if (!name) {
      setFirstNameError('Prénom requis');
      return false;
    }
    if (name.length < 2) {
      setFirstNameError('Minimum 2 caractères');
      return false;
    }
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
      setFirstNameError('Caractères invalides');
      return false;
    }
    setFirstNameError('');
    return true;
  };

  const validateLastName = (name: string) => {
    if (!name) {
      setLastNameError('Nom requis');
      return false;
    }
    if (name.length < 2) {
      setLastNameError('Minimum 2 caractères');
      return false;
    }
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
      setLastNameError('Caractères invalides');
      return false;
    }
    setLastNameError('');
    return true;
  };

  const validateCompanyName = (name: string) => {
    if (!name) {
      setCompanyNameError("Nom d'entreprise requis");
      return false;
    }
    if (name.length < 2) {
      setCompanyNameError('Minimum 2 caractères');
      return false;
    }
    setCompanyNameError('');
    return true;
  };

  const validateCountry = (countryValue: string) => {
    if (!countryValue) {
      setCountryError('Pays requis');
      return false;
    }
    setCountryError('');
    return true;
  };

  const validateSector = (sectorValue: string) => {
    if (!sectorValue) {
      setSectorError('Secteur requis');
      return false;
    }
    setSectorError('');
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
    setSuccess(null);

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

  const handleRegister = async (_formData: FormData) => {
    // Validate all fields
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const confirmPasswordValid = validateConfirmPassword(confirmPassword);
    const firstNameValid = validateFirstName(firstName);
    const lastNameValid = validateLastName(lastName);
    const companyNameValid = validateCompanyName(companyName);
    const countryValid = validateCountry(country);
    const sectorValid = validateSector(sector);

    if (
      !emailValid ||
      !passwordValid ||
      !confirmPasswordValid ||
      !firstNameValid ||
      !lastNameValid ||
      !companyNameValid ||
      !countryValid ||
      !sectorValid
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const registerFormData = new FormData();
      registerFormData.set('company.name', companyName);
      registerFormData.set('company.country', country);
      registerFormData.set('company.sector', sector);
      registerFormData.set('user.email', email);
      registerFormData.set('user.password', password);
      registerFormData.set('user.confirmPassword', confirmPassword);
      registerFormData.set('user.firstName', firstName);
      registerFormData.set('user.lastName', lastName);
      registerFormData.set('user.role', role);

      const result = await createAccount(registerFormData);
      if (result.success) {
        setSuccess(
          '🎉 Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
        );
        // Clear form and switch to login mode
        setTimeout(() => {
          setIsRegisterMode(false);
          setFirstName('');
          setLastName('');
          setConfirmPassword('');
          setCompanyName('');
          setCountry('');
          setSector('');
          setPassword('');
          setSuccess(null);
        }, 3000);
      } else {
        setError(result.error || 'Erreur lors de la création du compte');
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
    <div className='h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800'>
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
          <div className='flex items-center space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/25'>
              <Calendar className='h-5 w-5 text-white' />
            </div>
            <div>
              <span className='block bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-slate-300'>
                Planora
              </span>
              <span className='block text-xs text-slate-500 dark:text-slate-400'>
                Planning IA Premium
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className='flex h-screen'>
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
            className={`relative z-10 flex flex-col justify-center px-8 py-12 transition-all delay-500 duration-1000 xl:px-10 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-8 opacity-0'
            }`}
          >
            <div className='space-y-6'>
              {/* Hero Content */}
              <div className='space-y-4'>
                <div className='inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/60 px-4 py-2 backdrop-blur-sm dark:bg-slate-800/60'>
                  <Sparkles className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Propulsé par l&apos;IA
                  </span>
                </div>

                <h1 className='text-4xl leading-tight font-bold xl:text-5xl'>
                  <span className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'>
                    Planifiez
                  </span>
                  <br />
                  <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    plus intelligent
                  </span>
                </h1>

                <p className='text-lg leading-relaxed text-slate-600 dark:text-slate-400'>
                  La première solution SaaS qui révolutionne la gestion des
                  plannings avec l&apos;intelligence artificielle. Optimisez vos
                  équipes, respectez la législation, maximisez la productivité.
                </p>
              </div>

              {/* Features Grid */}
              <div className='grid grid-cols-2 gap-3'>
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className='border-white/20 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80'
                  >
                    <CardContent className='p-3'>
                      <feature.icon className='mb-1 h-5 w-5 text-blue-600' />
                      <h3 className='mb-1 text-xs font-semibold text-slate-900 dark:text-white'>
                        {feature.title}
                      </h3>
                      <p className='text-xs leading-snug text-slate-600 dark:text-slate-400'>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits List */}
              <div className='space-y-2'>
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
                <Button
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className='group rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-blue-500/30'
                >
                  Essayer gratuitement
                  <ChevronRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Premium Authentication Card */}
        <div className='flex h-full flex-1 items-center justify-center px-6 py-4 lg:w-1/2'>
          <div
            className={`w-full max-w-lg transition-all delay-700 duration-1000 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-8 opacity-0'
            }`}
          >
            {/* PREMIUM CARD DESIGN */}
            <Card className='relative flex max-h-[80vh] min-h-[70vh] flex-col overflow-hidden border-0 bg-white/98 shadow-2xl backdrop-blur-3xl dark:bg-slate-900/98'>
              {/* Premium gradient border */}
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 p-[1px]'>
                <div className='h-full w-full rounded-3xl bg-white/98 dark:bg-slate-900/98' />
              </div>

              {/* Premium glow effect */}
              <div className='absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 opacity-75 blur-xl' />

              <CardContent className='relative z-10 flex-1 overflow-y-auto p-4'>
                <div className='flex min-h-full flex-col justify-center space-y-3'>
                  {/* Premium Header */}
                  <div className='space-y-2 text-center'>
                    {/* Logo premium avec glow */}
                    <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30'>
                      <Calendar className='h-6 w-6 text-white' />
                      <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent' />
                    </div>

                    {/* Toggle Premium avec animation fluide */}
                    {!showForgotPassword && (
                      <div className='relative mx-auto w-fit'>
                        <div className='flex rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-1.5 shadow-inner dark:from-slate-800 dark:to-slate-700'>
                          <button
                            type='button'
                            onClick={() => {
                              setIsRegisterMode(false);
                              setError(null);
                              setSuccess(null);
                            }}
                            className={`relative rounded-xl px-8 py-4 text-sm font-semibold transition-all duration-500 ${
                              !isRegisterMode
                                ? 'scale-105 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/30'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className='relative z-10'>Connexion</span>
                            {!isRegisterMode && (
                              <div className='absolute inset-0 animate-pulse rounded-xl bg-white/20' />
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setIsRegisterMode(true);
                              setError(null);
                              setSuccess(null);
                            }}
                            className={`relative rounded-xl px-8 py-4 text-sm font-semibold transition-all duration-500 ${
                              isRegisterMode
                                ? 'scale-105 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-xl shadow-purple-500/30'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className='relative z-10'>
                              S&apos;inscrire
                            </span>
                            {isRegisterMode && (
                              <div className='absolute inset-0 animate-pulse rounded-xl bg-white/20' />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Titre premium */}
                    <div className='space-y-1'>
                      <h2 className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'>
                        {showForgotPassword
                          ? 'Récupération'
                          : isRegisterMode
                            ? 'Créer votre compte'
                            : 'Bienvenue'}
                      </h2>
                      <p className='text-slate-500 dark:text-slate-400'>
                        {showForgotPassword
                          ? "Récupérez l'accès à votre compte"
                          : isRegisterMode
                            ? 'Rejoignez les leaders qui optimisent leurs équipes'
                            : 'Connectez-vous à votre espace premium'}
                      </p>
                    </div>
                  </div>

                  {/* FORMULAIRE PREMIUM */}
                  {!showForgotPassword ? (
                    <form
                      action={isRegisterMode ? handleRegister : handleLogin}
                      className='space-y-3'
                    >
                      {/* Champs d'inscription */}
                      {isRegisterMode && (
                        <div className='space-y-3'>
                          {/* Section Entreprise */}
                          <div className='space-y-2'>
                            <div className='flex items-center space-x-2 pb-1'>
                              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20'>
                                <Building2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                              </div>
                              <h3 className='text-base font-semibold text-slate-800 dark:text-slate-200'>
                                Votre entreprise
                              </h3>
                            </div>

                            {/* Nom entreprise */}
                            <div className='space-y-1'>
                              <div className='group relative'>
                                <div className='absolute inset-y-0 left-4 flex items-center'>
                                  <Building2 className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500' />
                                </div>
                                <Input
                                  type='text'
                                  placeholder='Nom de votre entreprise'
                                  value={companyName}
                                  onChange={e => {
                                    setCompanyName(e.target.value);
                                    if (companyNameError && e.target.value) {
                                      validateCompanyName(e.target.value);
                                    }
                                  }}
                                  onBlur={() =>
                                    validateCompanyName(companyName)
                                  }
                                  className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                    companyNameError
                                      ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                      : companyName && !companyNameError
                                        ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                        : 'focus:ring-blue-500/50'
                                  }`}
                                />
                                {companyName && !companyNameError && (
                                  <div className='absolute inset-y-0 right-4 flex items-center'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                      <Check className='h-3 w-3 text-white' />
                                    </div>
                                  </div>
                                )}
                              </div>
                              {companyNameError && (
                                <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                  {companyNameError}
                                </p>
                              )}
                            </div>

                            {/* Pays et Secteur */}
                            <div className='grid grid-cols-2 gap-4'>
                              {/* Pays */}
                              <div className='space-y-2'>
                                <div className='group relative'>
                                  <div className='absolute inset-y-0 left-4 z-10 flex items-center'>
                                    <Globe className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500' />
                                  </div>
                                  <Select
                                    value={country}
                                    onValueChange={value => {
                                      setCountry(value);
                                      validateCountry(value);
                                    }}
                                  >
                                    <SelectTrigger
                                      className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-4 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                        countryError
                                          ? 'ring-2 ring-red-400/50'
                                          : country && !countryError
                                            ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                            : 'focus:ring-blue-500/50'
                                      }`}
                                    >
                                      <SelectValue placeholder='Pays' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl'>
                                      <SelectItem
                                        value='France'
                                        className='rounded-lg'
                                      >
                                        France
                                      </SelectItem>
                                      <SelectItem
                                        value='Luxembourg'
                                        className='rounded-lg'
                                      >
                                        Luxembourg
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {countryError && (
                                  <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                    {countryError}
                                  </p>
                                )}
                              </div>

                              {/* Secteur */}
                              <div className='space-y-2'>
                                <div className='group relative'>
                                  <div className='absolute inset-y-0 left-4 flex items-center'>
                                    <Briefcase className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500' />
                                  </div>
                                  <Input
                                    type='text'
                                    placeholder='Secteur'
                                    value={sector}
                                    onChange={e => {
                                      setSector(e.target.value);
                                      if (sectorError && e.target.value) {
                                        validateSector(e.target.value);
                                      }
                                    }}
                                    onBlur={() => validateSector(sector)}
                                    className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                      sectorError
                                        ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                        : sector && !sectorError
                                          ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                          : 'focus:ring-blue-500/50'
                                    }`}
                                  />
                                  {sector && !sectorError && (
                                    <div className='absolute inset-y-0 right-4 flex items-center'>
                                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                        <Check className='h-3 w-3 text-white' />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {sectorError && (
                                  <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                    {sectorError}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section Personnelle */}
                          <div className='space-y-1'>
                            <div className='flex items-center space-x-2 pb-1'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20'>
                                <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                              </div>
                              <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-200'>
                                Vos informations
                              </h3>
                            </div>

                            {/* Prénom et Nom */}
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='space-y-2'>
                                <div className='group relative'>
                                  <div className='absolute inset-y-0 left-4 flex items-center'>
                                    <User className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-purple-500' />
                                  </div>
                                  <Input
                                    type='text'
                                    placeholder='Prénom'
                                    value={firstName}
                                    onChange={e => {
                                      setFirstName(e.target.value);
                                      if (firstNameError && e.target.value) {
                                        validateFirstName(e.target.value);
                                      }
                                    }}
                                    onBlur={() => validateFirstName(firstName)}
                                    className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                      firstNameError
                                        ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                        : firstName && !firstNameError
                                          ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                          : 'focus:ring-purple-500/50'
                                    }`}
                                  />
                                  {firstName && !firstNameError && (
                                    <div className='absolute inset-y-0 right-4 flex items-center'>
                                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                        <Check className='h-3 w-3 text-white' />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {firstNameError && (
                                  <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                    {firstNameError}
                                  </p>
                                )}
                              </div>

                              <div className='space-y-2'>
                                <div className='group relative'>
                                  <div className='absolute inset-y-0 left-4 flex items-center'>
                                    <User className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-purple-500' />
                                  </div>
                                  <Input
                                    type='text'
                                    placeholder='Nom'
                                    value={lastName}
                                    onChange={e => {
                                      setLastName(e.target.value);
                                      if (lastNameError && e.target.value) {
                                        validateLastName(e.target.value);
                                      }
                                    }}
                                    onBlur={() => validateLastName(lastName)}
                                    className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                      lastNameError
                                        ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                        : lastName && !lastNameError
                                          ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                          : 'focus:ring-purple-500/50'
                                    }`}
                                  />
                                  {lastName && !lastNameError && (
                                    <div className='absolute inset-y-0 right-4 flex items-center'>
                                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                        <Check className='h-3 w-3 text-white' />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {lastNameError && (
                                  <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                    {lastNameError}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Champs communs - Email et Mot de passe */}
                      <div className='space-y-2'>
                        {/* Email */}
                        <div className='space-y-1'>
                          <div className='group relative'>
                            <div className='absolute inset-y-0 left-4 flex items-center'>
                              <Mail
                                className={`h-5 w-5 text-slate-400 group-focus-within:${isRegisterMode ? 'text-purple-500' : 'text-blue-500'} transition-colors`}
                              />
                            </div>
                            <Input
                              type='email'
                              name='email'
                              placeholder='votre.email@entreprise.com'
                              value={email}
                              onChange={e => {
                                setEmail(e.target.value);
                                if (emailError && e.target.value) {
                                  validateEmail(e.target.value);
                                }
                              }}
                              onBlur={() => validateEmail(email)}
                              className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                emailError
                                  ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                  : email && !emailError
                                    ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                    : isRegisterMode
                                      ? 'focus:ring-purple-500/50'
                                      : 'focus:ring-blue-500/50'
                              }`}
                            />
                            {email && !emailError && (
                              <div className='absolute inset-y-0 right-4 flex items-center'>
                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                  <Check className='h-3 w-3 text-white' />
                                </div>
                              </div>
                            )}
                          </div>
                          {emailError && (
                            <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                              {emailError}
                            </p>
                          )}
                        </div>

                        {/* Mot de passe */}
                        <div className='space-y-1'>
                          <div className='group relative'>
                            <div className='absolute inset-y-0 left-4 flex items-center'>
                              <Lock
                                className={`h-5 w-5 text-slate-400 group-focus-within:${isRegisterMode ? 'text-purple-500' : 'text-blue-500'} transition-colors`}
                              />
                            </div>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              name='password'
                              placeholder={
                                isRegisterMode
                                  ? 'Mot de passe sécurisé (8+ caractères)'
                                  : 'Votre mot de passe'
                              }
                              value={password}
                              onChange={e => {
                                setPassword(e.target.value);
                                if (passwordError && e.target.value) {
                                  validatePassword(e.target.value);
                                }
                                if (isRegisterMode && confirmPassword) {
                                  validateConfirmPassword(confirmPassword);
                                }
                              }}
                              onBlur={() => validatePassword(password)}
                              className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-20 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                passwordError
                                  ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                  : password && !passwordError
                                    ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                    : isRegisterMode
                                      ? 'focus:ring-purple-500/50'
                                      : 'focus:ring-blue-500/50'
                              }`}
                            />
                            <div className='absolute inset-y-0 right-4 flex items-center space-x-2'>
                              {password && !passwordError && (
                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                  <Check className='h-3 w-3 text-white' />
                                </div>
                              )}
                              <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300'
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
                            <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                              {passwordError}
                            </p>
                          )}
                        </div>

                        {/* Confirmation mot de passe pour inscription */}
                        {isRegisterMode && (
                          <div className='space-y-1'>
                            <div className='group relative'>
                              <div className='absolute inset-y-0 left-4 flex items-center'>
                                <Lock className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-purple-500' />
                              </div>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Confirmer le mot de passe'
                                value={confirmPassword}
                                onChange={e => {
                                  setConfirmPassword(e.target.value);
                                  if (confirmPasswordError && e.target.value) {
                                    validateConfirmPassword(e.target.value);
                                  }
                                }}
                                onBlur={() =>
                                  validateConfirmPassword(confirmPassword)
                                }
                                className={`h-12 rounded-2xl border-0 bg-slate-50/80 pr-12 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800 ${
                                  confirmPasswordError
                                    ? 'ring-2 ring-red-400/50 focus:ring-red-500/50'
                                    : confirmPassword && !confirmPasswordError
                                      ? 'bg-green-50/50 ring-2 ring-green-400/50'
                                      : 'focus:ring-purple-500/50'
                                }`}
                              />
                              {confirmPassword && !confirmPasswordError && (
                                <div className='absolute inset-y-0 right-4 flex items-center'>
                                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                                    <Check className='h-3 w-3 text-white' />
                                  </div>
                                </div>
                              )}
                            </div>
                            {confirmPasswordError && (
                              <p className='animate-in slide-in-from-top-2 px-1 text-sm font-medium text-red-500 duration-300'>
                                {confirmPasswordError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Messages d'erreur et succès premium */}
                      {error && (
                        <div className='animate-in slide-in-from-top-2 rounded-xl border-0 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 p-3 ring-1 ring-red-200/50 duration-300 dark:from-red-900/20 dark:via-rose-900/20 dark:to-red-900/20 dark:ring-red-800/30'>
                          <div className='flex items-center space-x-3'>
                            <div className='h-3 w-3 animate-pulse rounded-full bg-red-500' />
                            <p className='text-sm font-semibold text-red-700 dark:text-red-300'>
                              {error}
                            </p>
                          </div>
                        </div>
                      )}

                      {success && (
                        <div className='animate-in slide-in-from-top-2 rounded-xl border-0 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 p-3 ring-1 ring-green-200/50 duration-300 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 dark:ring-green-800/30'>
                          <div className='flex items-center space-x-3'>
                            <div className='h-3 w-3 animate-pulse rounded-full bg-green-500' />
                            <p className='text-sm font-semibold text-green-700 dark:text-green-300'>
                              {success}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bouton Premium */}
                      <Button
                        type='submit'
                        disabled={
                          isLoading ||
                          !!emailError ||
                          !!passwordError ||
                          !email ||
                          !password ||
                          (isRegisterMode &&
                            (!!firstNameError ||
                              !!lastNameError ||
                              !!confirmPasswordError ||
                              !!companyNameError ||
                              !!countryError ||
                              !!sectorError ||
                              !firstName ||
                              !lastName ||
                              !confirmPassword ||
                              !companyName ||
                              !country ||
                              !sector))
                        }
                        className={`group hover:shadow-3xl relative h-12 w-full rounded-2xl font-bold text-white shadow-2xl transition-all duration-500 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                          isRegisterMode
                            ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 shadow-purple-500/30 hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 hover:shadow-purple-500/40'
                            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 shadow-blue-500/30 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 hover:shadow-blue-500/40'
                        }`}
                      >
                        <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
                        <div className='relative z-10 flex items-center justify-center space-x-3'>
                          {isLoading ? (
                            <>
                              <Loader2 className='h-6 w-6 animate-spin' />
                              <span className='text-lg'>
                                {isRegisterMode
                                  ? 'Création en cours...'
                                  : 'Connexion...'}
                              </span>
                            </>
                          ) : (
                            <>
                              {isRegisterMode ? (
                                <>
                                  <Sparkles className='h-6 w-6 transition-transform group-hover:scale-110' />
                                  <span className='text-lg'>
                                    Créer mon compte
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className='text-lg'>Se connecter</span>
                                  <ChevronRight className='h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:scale-110' />
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </Button>
                    </form>
                  ) : (
                    /* Formulaire mot de passe oublié */
                    <form className='space-y-6'>
                      <div className='space-y-2'>
                        <div className='group relative'>
                          <div className='absolute inset-y-0 left-4 flex items-center'>
                            <Mail className='h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500' />
                          </div>
                          <Input
                            type='email'
                            placeholder='Votre email'
                            className='h-12 rounded-2xl border-0 bg-slate-50/80 pr-4 pl-12 text-base font-medium backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 dark:bg-slate-800/50 dark:focus:bg-slate-800'
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type='submit'
                        className='group hover:shadow-3xl relative h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-white shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/40'
                      >
                        <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
                        <span className='relative z-10 text-lg'>
                          Envoyer le lien
                        </span>
                      </Button>
                    </form>
                  )}

                  {/* Footer Premium */}
                  <div className='space-y-2 text-center'>
                    {!isRegisterMode && (
                      <button
                        onClick={() =>
                          setShowForgotPassword(!showForgotPassword)
                        }
                        className='group inline-flex items-center space-x-2 text-sm font-medium text-slate-500 transition-all duration-300 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
                      >
                        <span>
                          {showForgotPassword
                            ? 'Retour à la connexion'
                            : 'Mot de passe oublié ?'}
                        </span>
                        <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </button>
                    )}

                    {/* Séparateur et branding premium */}
                    <div className='space-y-1'>
                      <div className='h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700' />
                      <div className='flex items-center justify-center space-x-2 text-xs text-slate-400 dark:text-slate-500'>
                        <Sparkles className='h-3 w-3' />
                        <span>Planora Premium - Optimisé par l&apos;IA</span>
                        <Sparkles className='h-3 w-3' />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features mobile masquées en mode inscription pour garder le focus */}
            {false && !isRegisterMode && (
              <div className='mt-4 space-y-3 lg:hidden'>
                <h3 className='text-center text-lg font-semibold text-slate-900 dark:text-white'>
                  Pourquoi choisir Planora ?
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-3 rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-800/60'
                    >
                      <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                        <Check className='h-3 w-3 text-green-600' />
                      </div>
                      <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
