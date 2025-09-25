'use client';

import { ChevronRight, Calendar, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import AuthDialog from './AuthDialog';

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const features = [
    {
      title: 'Planning intelligent',
      description:
        'Générez des plannings optimisés par IA en quelques secondes.',
    },
    {
      title: 'Conformité intégrée',
      description:
        'Règles légales France & Luxembourg appliquées automatiquement.',
    },
    {
      title: 'Pilotage clair',
      description: 'Suivi des coûts et productivité avec des insights utiles.',
    },
  ];

  return (
    <div className='bg-background relative min-h-screen overflow-hidden'>
      {/* Subtle radial glow */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute top-[-200px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/15 blur-3xl' />
      </div>

      {/* Navigation */}
      <nav className='bg-background/60 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur-md'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
          <Link href='/' className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600'>
              <Calendar className='h-5 w-5 text-white' />
            </div>
            <span className='text-foreground text-xl font-semibold'>
              Planora
            </span>
          </Link>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthOpen(true);
              }}
              className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
            >
              Se connecter
            </button>
            <Button
              onClick={() => {
                setAuthMode('register');
                setAuthOpen(true);
              }}
              variant='secondary'
            >
              Essayer gratuitement
            </Button>
          </div>
        </div>
        <div className='bg-border h-px w-full' />
      </nav>

      {/* Hero */}
      <section className='mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28'>
        <div className='mx-auto max-w-3xl text-center'>
          <div className='border-border/60 bg-card/70 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur'>
            <Sparkles className='h-4 w-4 text-blue-600' />
            <span className='text-muted-foreground text-xs font-medium'>
              Propulsé par l&apos;IA
            </span>
          </div>

          <h1 className='text-foreground mt-6 text-4xl font-bold tracking-tight text-pretty md:text-5xl lg:text-6xl'>
            Planifiez mieux, sans compromis.
          </h1>
          <p className='text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance'>
            La plateforme premium de planification assistée par IA. Optimisez
            vos équipes, respectez la législation et gagnez en sérénité.
          </p>

          <div className='mt-8 flex items-center justify-center gap-3'>
            <Button
              onClick={() => {
                setAuthMode('register');
                setAuthOpen(true);
              }}
              size='lg'
              className='bg-primary text-primary-foreground'
            >
              Commencer gratuitement
              <ChevronRight className='ml-1 h-5 w-5' />
            </Button>
            <Button
              variant='outline'
              size='lg'
              onClick={() => {
                setAuthMode('login');
                setAuthOpen(true);
              }}
            >
              Se connecter
            </Button>
          </div>
        </div>

        {/* Product preview */}
        <div className='mx-auto mt-16 max-w-6xl'>
          <Card className='bg-card border-border/50 shadow-2xl shadow-black/5'>
            <CardContent className='p-3 md:p-6'>
              <div className='bg-muted/30 border-border/30 relative rounded-2xl border p-2'>
                <div className='from-primary/5 to-accent/5 absolute inset-0 rounded-2xl bg-gradient-to-tr' />
                <div className='bg-background border-border/50 relative overflow-hidden rounded-xl border'>
                  <Image
                    src='/preview.svg'
                    alt="Aperçu de l'application Planora"
                    width={2400}
                    height={1500}
                    className='w-full rounded-xl'
                    priority
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature row */}
      <section className='mx-auto max-w-6xl px-6 pb-24'>
        <div className='grid gap-8 md:grid-cols-3'>
          {features.map((f, i) => (
            <Card
              key={i}
              className='bg-card border-border/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              <h3 className='text-foreground text-lg font-semibold'>
                {f.title}
              </h3>
              <p className='text-muted-foreground mt-3 text-base leading-relaxed'>
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <footer className='mx-auto max-w-6xl px-6 pb-16'>
        <div className='bg-card/60 text-muted-foreground rounded-xl border p-4 text-center text-sm backdrop-blur'>
          Déjà des équipes qui gagnent des heures chaque semaine avec Planora.
        </div>
      </footer>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
      />
    </div>
  );
}
