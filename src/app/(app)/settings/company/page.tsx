'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Check, Copy, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
  useToast,
} from '@/components/ui';
import { getCompany, updateCompany } from '@/lib/actions';
import { updateCompanySchema, type UpdateCompanyInput } from '@/lib/validations';

const sizeCategories = [
  { value: 'small', label: 'Petite (1-50 employés)' },
  { value: 'medium', label: 'Moyenne (51-250 employés)' },
  { value: 'large', label: 'Grande (251-1000 employés)' },
  { value: 'enterprise', label: 'Entreprise (1000+ employés)' },
];

const timezones = [
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
];

export default function CompanySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [isCopiedId, setIsCopiedId] = useState(false);

  const form = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: '',
      country: '',
      sector: '',
      sizeCategory: 'small',
      legalWorkHoursPerWeek: 35,
      timezone: 'Europe/Paris',
    },
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    setIsLoading(true);
    const result = await getCompany();

    if (result.success && result.data) {
      setCompanyId(result.data.id);
      setCreatedAt(
        result.data.createdAt
          ? new Date(result.data.createdAt).toLocaleDateString('fr-FR')
          : ''
      );
      form.reset({
        name: result.data.name,
        country: result.data.country,
        sector: result.data.sector,
        sizeCategory: (result.data.sizeCategory as any) || 'small',
        legalWorkHoursPerWeek: result.data.legalWorkHoursPerWeek || 35,
        timezone: result.data.timezone || 'Europe/Paris',
      });
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(companyId);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const onSubmit = async (data: UpdateCompanyInput) => {
    const result = await updateCompany(data);

    if (result.success) {
      toast({
        title: 'Succès',
        description: 'Les informations de l\'entreprise ont été mises à jour',
      });
      router.refresh();
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Paramètres de l&apos;entreprise</h1>
          <p className="mt-2 text-white/70">Gérez les informations de votre entreprise</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Company Info Card */}
          <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#F2E94E]/20 p-3">
                  <Building2 className="h-6 w-6 text-[#F2E94E]" />
                </div>
                <div>
                  <CardTitle className="text-white">Informations</CardTitle>
                  <CardDescription className="text-white/60">
                    Détails de l&apos;entreprise
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-white/50">ID de l&apos;entreprise</p>
                <div className="relative mt-1">
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 pr-10">
                    <code className="text-xs text-white/80">{companyId}</code>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-1.5 transition-all hover:bg-white/20"
                    type="button"
                  >
                    {isCopiedId ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-white/70" />
                    )}
                  </button>
                  {isCopiedId && (
                    <span className="absolute -top-7 right-0 animate-in fade-in slide-in-from-bottom-2 text-xs font-medium text-green-400">
                      Copié ✓
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/50">Date de création</p>
                <p className="mt-1 text-sm font-medium text-white">{createdAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Paramètres</CardTitle>
              <CardDescription className="text-white/60">
                Modifiez les informations de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Nom de l&apos;entreprise</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-2xl border-white/20 bg-white/5 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Pays</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-2xl border-white/20 bg-white/5 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Secteur</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-2xl border-white/20 bg-white/5 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sizeCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Taille</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl border-white/20 bg-white/5 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sizeCategories.map((size) => (
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
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="legalWorkHoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Heures légales par semaine</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="rounded-2xl border-white/20 bg-white/5 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-white/50">
                            Durée légale du travail dans votre pays
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Fuseau horaire</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl border-white/20 bg-white/5 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timezones.map((tz) => (
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
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || !form.formState.isDirty}
                      className="rounded-2xl bg-[#F2E94E] px-6 py-6 text-[#0A1A2F] transition-all duration-300 hover:bg-[#F2E94E]/90 hover:shadow-lg hover:shadow-[#F2E94E]/20"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
