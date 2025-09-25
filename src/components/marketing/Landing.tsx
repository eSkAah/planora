'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useMemo, useState, useTransition } from 'react';

import AuthDialog from '@/components/marketing/AuthDialog';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  useToast,
} from '@/components/ui';
import { signIn } from '@/lib/auth/actions';

export default function Landing() {
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const advantages = useMemo(
    () => [
      {
        title: 'Pilotage harmonisé',
        description:
          'Une cartographie unique pour piloter plusieurs sites, aligner les équipes et respecter chaque convention locale sans tableurs parallèles ni pertes de temps.',
        icon: '/icons/planning.svg',
      },
      {
        title: 'IA adaptative',
        description:
          "Un moteur d'IA qui anticipe l'absentéisme, propose des remplacements en un clic et ajuste vos coûts salariaux en continu pour garder le contrôle.",
        icon: '/icons/ai-adapt.svg',
      },
    ],
    []
  );

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await signIn(formData);
      if (!response.success) {
        toast({
          variant: 'destructive',
          title: 'Connexion impossible',
          description: response.error ?? 'Vérifiez vos identifiants.',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Connexion réussie',
        description: 'Ouverture de votre espace.',
      });

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 350);
    });
  };

  const handleRegistrationSuccess = (registeredEmail: string) => {
    setRegisterOpen(false);
    setShowLoginCard(true);
    setEmail(registeredEmail);
    setPassword('');
  };

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#071427] text-white'>
      <div className='pointer-events-none absolute inset-0 opacity-70 select-none'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,95,255,0.22),rgba(7,14,30,0.95))]' />
        <div className='absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(circle_at_bottom,rgba(52,94,204,0.18),transparent)]' />
      </div>

      <main className='relative z-10 flex w-full flex-col items-center px-6 py-20 text-center'>
        <div className='space-y-5'>
          <Link
            href='/'
            onClick={() => setShowLoginCard(false)}
            className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#F2E94E]/40 bg-[#2753a0]/30 px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-[#F2E94E]/90 backdrop-blur transition hover:bg-[#2753a0]/45'
          >
            <Sparkles className='h-3.5 w-3.5 text-[#F2E94E]' />
            PLANORA
          </Link>
          <Link
            href='/'
            onClick={() => setShowLoginCard(false)}
            className='block cursor-pointer text-5xl font-semibold tracking-tight text-balance transition hover:text-[#F2E94E]/90 md:text-6xl lg:text-7xl'
          >
            Planora
          </Link>
          <p className='mx-auto max-w-xl text-base leading-relaxed text-balance text-white/70 md:text-lg'>
            La plateforme premium qui orchestre vos plannings, sécurise vos
            opérations et magnifie le quotidien de vos équipes.
          </p>
        </div>

        <AnimatePresence mode='wait'>
          {showLoginCard ? (
            <motion.div
              key='login-card'
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.48, ease: [0.18, 0.9, 0.24, 1] },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 16,
                transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
              }}
              className='mt-12 w-full max-w-md'
            >
              <Card className='rounded-[32px] border border-white/15 bg-white/12 p-0 text-[#0A1A2F] shadow-[0_35px_120px_-40px_rgba(3,13,28,0.75)] backdrop-blur-2xl'>
                <CardHeader className='space-y-2 px-8 pt-8 text-left text-white'>
                  <CardTitle className='text-2xl font-semibold'>
                    Connexion Planora
                  </CardTitle>
                  <p className='text-sm text-white/65'>
                    Connectez-vous avec votre identifiant professionnel.
                  </p>
                </CardHeader>
                <CardContent className='space-y-6 px-8 pb-8'>
                  <motion.form
                    onSubmit={handleLoginSubmit}
                    className='space-y-5'
                    initial='hidden'
                    animate='visible'
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          staggerChildren: 0.08,
                          delayChildren: 0.12,
                          ease: [0.18, 0.9, 0.24, 1],
                        },
                      },
                    }}
                  >
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className='space-y-2 text-left'
                    >
                      <Label htmlFor='email' className='text-white/70'>
                        Adresse e-mail
                      </Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        placeholder='vous@entreprise.com'
                        autoComplete='email'
                        required
                        className='h-12 rounded-2xl border-white/20 bg-white/20 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                      />
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className='space-y-2 text-left'
                    >
                      <Label htmlFor='password' className='text-white/70'>
                        Mot de passe
                      </Label>
                      <div className='relative'>
                        <Input
                          id='password'
                          name='password'
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={event => setPassword(event.target.value)}
                          placeholder='Votre mot de passe'
                          autoComplete='current-password'
                          required
                          className='h-12 rounded-2xl border-white/20 bg-white/20 pr-12 text-white placeholder:text-white/35 focus:border-[#F2E94E]/60 focus:ring-[#F2E94E]/40'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(prev => !prev)}
                          className='absolute top-1/2 right-4 -translate-y-1/2 text-white/60 transition hover:text-white'
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
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Button
                        type='submit'
                        disabled={isPending}
                        className='h-12 w-full cursor-pointer rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition hover:bg-[#f6f07a] focus-visible:ring-[#F2E94E]/40'
                      >
                        {isPending ? 'Connexion…' : 'Se connecter'}
                      </Button>
                    </motion.div>
                  </motion.form>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className='border-t border-white/15 pt-4 text-sm text-white/65'
                  >
                    Pas encore de compte ?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setRegisterOpen(true);
                      }}
                      className='cursor-pointer font-medium text-white transition hover:text-white/80'
                    >
                      Créer un compte
                    </button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key='login-cta'
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{
                opacity: 0,
                y: -12,
                scale: 0.98,
                transition: { duration: 0.2 },
              }}
            >
              <Button
                size='lg'
                className='mt-12 flex cursor-pointer items-center gap-2 rounded-full bg-[#F2E94E] px-10 py-6 text-lg font-semibold text-[#0A1A2F] shadow-[0_20px_70px_-30px_rgba(242,233,78,0.65)] transition hover:bg-[#f6f07a]'
                onClick={() => setShowLoginCard(true)}
              >
                Se connecter
                <ArrowRight className='h-5 w-5' />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='mt-20 grid w-full max-w-4xl gap-6 md:grid-cols-2'>
          {advantages.map(({ title, description, icon }) => (
            <div
              key={title}
              className='flex h-full min-h-[240px] flex-col justify-between rounded-[28px] border border-white/14 bg-white/10 p-6 text-left text-white shadow-[0_20px_80px_-40px_rgba(3,13,28,0.55)] backdrop-blur-lg'
            >
              <div className='mb-6 flex items-center justify-center'>
                <Image
                  src={icon}
                  alt={`Illustration ${title}`}
                  width={96}
                  height={96}
                  className='drop-shadow-[0_10px_25px_rgba(0,0,0,0.25)]'
                />
              </div>
              <h3 className='text-xl font-semibold text-white'>{title}</h3>
              <p className='mt-3 text-sm leading-relaxed text-white/70'>
                {description}
              </p>
              <div className='mt-6 h-px w-full bg-white/15' />
              <p className='mt-4 text-xs font-medium tracking-[0.28em] text-white/45 uppercase'>
                Planora Essentials
              </p>
            </div>
          ))}
        </div>
      </main>

      <AuthDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onRegistered={handleRegistrationSuccess}
      />
    </div>
  );
}
