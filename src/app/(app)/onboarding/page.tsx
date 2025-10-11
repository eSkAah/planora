'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
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
  Stepper,
  useToast,
} from '@/components/ui';
import {
  completeOnboarding,
  getCompanyForOnboarding,
  updateCompanyDetails,
  updateLegalSettings,
} from '@/lib/actions/onboarding';
import {
  companyDetailsSchema,
  legalSettingsSchema,
  type CompanyDetailsInput,
  type LegalSettingsInput,
} from '@/lib/validations';

const STEPS = [
  { id: 'step-1', title: 'Entreprise', description: 'Détails de votre entreprise' },
  { id: 'step-2', title: 'Paramètres légaux', description: 'Configuration pays' },
  { id: 'step-3', title: 'Finalisation', description: 'Configuration initiale' },
];

const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'CA', label: 'Canada' },
];

const SECTORS = [
  { value: 'retail', label: 'Commerce de détail' },
  { value: 'hospitality', label: 'Hôtellerie / Restauration' },
  { value: 'healthcare', label: 'Santé / Médical' },
  { value: 'manufacturing', label: 'Industrie / Production' },
  { value: 'logistics', label: 'Logistique / Transport' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Autre' },
];

const SIZE_CATEGORIES = [
  { value: 'small', label: 'Petite (1-50 employés)' },
  { value: 'medium', label: 'Moyenne (51-250 employés)' },
  { value: 'large', label: 'Grande (250+ employés)' },
];

const TIMEZONES = [
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/Brussels', label: 'Europe/Brussels (GMT+1)' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich (GMT+1)' },
  { value: 'Europe/Luxembourg', label: 'Europe/Luxembourg (GMT+1)' },
  { value: 'America/Toronto', label: 'America/Toronto (GMT-5)' },
  { value: 'America/Montreal', label: 'America/Montreal (GMT-5)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<{
    id: string;
    name: string;
    country: string;
    sector: string;
    sizeCategory: string;
    legalWorkHoursPerWeek: number;
    timezone: string;
  } | null>(null);

  // Step 1 form
  const step1Form = useForm<CompanyDetailsInput>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      sizeCategory: 'small',
      country: 'FR',
      sector: 'retail',
    },
  });

  // Step 2 form
  const step2Form = useForm<LegalSettingsInput>({
    resolver: zodResolver(legalSettingsSchema),
    defaultValues: {
      legalWorkHoursPerWeek: 35,
      timezone: 'Europe/Paris',
    },
  });

  // Load company data
  useEffect(() => {
    const loadCompanyData = async () => {
      const result = await getCompanyForOnboarding();

      if (!result.success || !result.data) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Impossible de charger vos données',
        });
        return;
      }

      setCompanyData(result.data);

      // Pre-fill forms with existing data
      step1Form.reset({
        sizeCategory: result.data.sizeCategory as 'small' | 'medium' | 'large',
        country: result.data.country || 'FR',
        sector: result.data.sector || 'retail',
      });

      step2Form.reset({
        legalWorkHoursPerWeek: result.data.legalWorkHoursPerWeek,
        timezone: result.data.timezone,
      });

      setIsLoading(false);
    };

    loadCompanyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleStep1Submit = (data: CompanyDetailsInput) => {
    startTransition(async () => {
      const result = await updateCompanyDetails(data);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Une erreur est survenue',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Étape 1 complétée',
        description: 'Passons aux paramètres légaux',
      });

      setCurrentStep(2);
    });
  };

  const handleStep2Submit = (data: LegalSettingsInput) => {
    startTransition(async () => {
      const result = await updateLegalSettings(data);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Une erreur est survenue',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Étape 2 complétée',
        description: 'Configuration finale en cours...',
      });

      setCurrentStep(3);
    });
  };

  const handleFinalStep = () => {
    startTransition(async () => {
      const result = await completeOnboarding();

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Une erreur est survenue',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Onboarding terminé',
        description: 'Bienvenue dans Planora !',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071427]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#F2E94E]" />
          <p className="text-sm text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#071427] text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-70 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,95,255,0.22),rgba(7,14,30,0.95))]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(circle_at_bottom,rgba(52,94,204,0.18),transparent)]" />
      </div>

      <main className="relative z-10 w-full max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 space-y-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Bienvenue dans Planora
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70">
            Configurons votre entreprise <span className="font-semibold text-white">{companyData?.name}</span> pour commencer
          </p>

          {/* Stepper */}
          <div className="pt-4">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
                <CardHeader className="space-y-2 px-8 pt-8">
                  <CardTitle className="text-2xl font-semibold text-white">
                    Informations de l&apos;entreprise
                  </CardTitle>
                  <p className="text-sm text-white/65">
                    Confirmez ou modifiez les détails de votre entreprise
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <Form {...step1Form}>
                    <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                      <FormField
                        control={step1Form.control}
                        name="sizeCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70">Taille de l&apos;entreprise</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                                  <SelectValue placeholder="Sélectionnez une taille" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SIZE_CATEGORIES.map((size) => (
                                  <SelectItem key={size.value} value={size.value}>
                                    {size.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step1Form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70">Pays</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                                  <SelectValue placeholder="Sélectionnez un pays" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step1Form.control}
                        name="sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70">Secteur d&apos;activité</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                                  <SelectValue placeholder="Sélectionnez un secteur" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SECTORS.map((sector) => (
                                  <SelectItem key={sector.value} value={sector.value}>
                                    {sector.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="h-12 min-w-[160px] rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              Continuer
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
                <CardHeader className="space-y-2 px-8 pt-8">
                  <CardTitle className="text-2xl font-semibold text-white">
                    Paramètres légaux
                  </CardTitle>
                  <p className="text-sm text-white/65">
                    Configurez les règles légales de votre pays
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <Form {...step2Form}>
                    <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                      <FormField
                        control={step2Form.control}
                        name="legalWorkHoursPerWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70">
                              Heures légales par semaine
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={20}
                                max={48}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50">
                              Durée légale du travail dans votre pays (généralement 35-40h)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70">Fuseau horaire</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                                  <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TIMEZONES.map((tz) => (
                                  <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setCurrentStep(1)}
                          disabled={isPending}
                          className="h-12 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Button>
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="h-12 min-w-[160px] rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              Continuer
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
                <CardHeader className="space-y-2 px-8 pt-8">
                  <CardTitle className="text-2xl font-semibold text-white">
                    Prêt à démarrer
                  </CardTitle>
                  <p className="text-sm text-white/65">
                    Nous allons créer votre configuration initiale
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h3 className="font-medium text-white">Configuration par défaut</h3>
                    <ul className="space-y-3 text-sm text-white/70">
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F2E94E]" />
                        <span>Création de 3 modèles de shifts : Matin (6h-14h), Après-midi (14h-22h), Nuit (22h-6h)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F2E94E]" />
                        <span>Configuration des paramètres de votre entreprise</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F2E94E]" />
                        <span>Préparation de votre tableau de bord</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep(2)}
                      disabled={isPending}
                      className="h-12 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button
                      onClick={handleFinalStep}
                      disabled={isPending}
                      className="h-12 min-w-[180px] rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalisation...
                        </>
                      ) : (
                        <>
                          Finaliser l&apos;onboarding
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
