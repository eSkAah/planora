'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Button,
  Calendar,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { generateSchedule } from '@/lib/actions/schedules';
import { generateScheduleSchema, type GenerateScheduleInput } from '@/lib/validations/schedules';
import { cn } from '@/lib/utils';

interface GenerateScheduleFormProps {
  onSuccess?: () => void;
}

export function GenerateScheduleForm({ onSuccess }: GenerateScheduleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GenerateScheduleInput>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: {
      title: '',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      includeWeekends: false,
      optimizationGoals: ['maximize_coverage', 'respect_preferences'],
      constraints: {
        minRestHoursBetweenShifts: 11,
        maxConsecutiveDays: 6,
        respectAvailability: true,
        respectSkills: true,
      },
    },
  });

  const onSubmit = async (data: GenerateScheduleInput) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());
      formData.append('includeWeekends', data.includeWeekends.toString());
      formData.append('optimizationGoals', JSON.stringify(data.optimizationGoals));
      formData.append('constraints', JSON.stringify(data.constraints));

      const result = await generateSchedule(formData);

      if (result.success) {
        toast.success('Planning généré avec succès');
        form.reset();
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Erreur lors de la génération du planning');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Titre du planning</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Planning Semaine 42"
                  className="rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start rounded-xl border-white/15 bg-white/5 text-left font-normal text-white hover:bg-white/10 hover:text-white',
                          !field.value && 'text-white/40'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto rounded-xl border-white/15 bg-[#071427] p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start rounded-xl border-white/15 bg-white/5 text-left font-normal text-white hover:bg-white/10 hover:text-white',
                          !field.value && 'text-white/40'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto rounded-xl border-white/15 bg-[#071427] p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includeWeekends"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/15 bg-white/5 p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white">Inclure les week-ends</FormLabel>
                <FormDescription className="text-white/60">
                  Générer des shifts pour les samedis et dimanches
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel className="text-white">Objectifs d&apos;optimisation</FormLabel>
          <FormField
            control={form.control}
            name="optimizationGoals"
            render={() => (
              <div className="space-y-2">
                {[
                  {
                    id: 'maximize_coverage',
                    label: 'Maximiser la couverture',
                    description: 'Assurer une couverture optimale des besoins',
                  },
                  {
                    id: 'respect_preferences',
                    label: 'Respecter les préférences',
                    description: 'Tenir compte des préférences des employés',
                  },
                  {
                    id: 'balance_workload',
                    label: 'Équilibrer la charge',
                    description: 'Distribuer équitablement les heures de travail',
                  },
                  {
                    id: 'minimize_costs',
                    label: 'Minimiser les coûts',
                    description: 'Réduire les coûts de main-d'œuvre',
                  },
                  {
                    id: 'minimize_overtime',
                    label: 'Minimiser les heures sup.',
                    description: 'Limiter le recours aux heures supplémentaires',
                  },
                ].map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="optimizationGoals"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/15 bg-white/5 p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id as any)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== item.id)
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="flex-1 space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-white">
                            {item.label}
                          </FormLabel>
                          <FormDescription className="text-xs text-white/60">
                            {item.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel className="text-white">Contraintes</FormLabel>
          <FormField
            control={form.control}
            name="constraints.respectAvailability"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/15 bg-white/5 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-white">
                    Respecter les disponibilités
                  </FormLabel>
                  <FormDescription className="text-xs text-white/60">
                    Tenir compte des disponibilités renseignées par les employés
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="constraints.respectSkills"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/15 bg-white/5 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-white">
                    Respecter les compétences
                  </FormLabel>
                  <FormDescription className="text-xs text-white/60">
                    Assigner uniquement aux shifts correspondant aux compétences
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-[#F2E94E] text-[#071427] hover:bg-[#F2E94E]/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Générer le planning
          </Button>
        </div>
      </form>
    </Form>
  );
}
