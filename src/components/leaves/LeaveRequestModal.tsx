'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Textarea,
  useToast,
} from '@/components/ui';
import { createLeaveRequest } from '@/lib/actions';
import {
  createLeaveRequestSchema,
  type CreateLeaveRequestInput,
} from '@/lib/validations';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onSubmit: (data: CreateLeaveRequestInput) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<CreateLeaveRequestInput>;
}

export default function LeaveRequestModal({
  open,
  onOpenChange,
  employees,
  onSubmit,
  isSubmitting,
  defaultValues,
}: LeaveRequestModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateLeaveRequestInput>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      employeeId: defaultValues?.employeeId || '',
      leaveType: defaultValues?.leaveType || 'vacation',
      startDate: defaultValues?.startDate || new Date().toISOString().split('T')[0],
      endDate: defaultValues?.endDate || new Date().toISOString().split('T')[0],
      daysCount: defaultValues?.daysCount || 1,
      reason: defaultValues?.reason || '',
    },
  });

  // Auto-calculate days count when dates change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'startDate' || name === 'endDate') {
        const start = value.startDate;
        const end = value.endDate;

        if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);

          if (endDate >= startDate) {
            // Calculate business days (excluding weekends)
            let count = 0;
            const current = new Date(startDate);

            while (current <= endDate) {
              const day = current.getDay();
              // Count if not weekend (0 = Sunday, 6 = Saturday)
              if (day !== 0 && day !== 6) {
                count++;
              }
              current.setDate(current.getDate() + 1);
            }

            form.setValue('daysCount', count);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: CreateLeaveRequestInput) => {
    startTransition(async () => {
      const result = await createLeaveRequest(data);

      if (result.success) {
        toast({
          title: 'Succès',
          description: 'Demande de congé créée avec succès',
        });
        form.reset();
        onOpenChange(false);
        await onSubmit(data);
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white">
            Nouvelle demande de congé
          </DialogTitle>
          <DialogDescription className="text-white/65">
            Créez une demande de congé pour un employé
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Employee Select */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Employé</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                          <SelectValue placeholder="Sélectionnez un employé" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Leave Type */}
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Type de congé</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vacation">Congés payés</SelectItem>
                        <SelectItem value="sick">Maladie</SelectItem>
                        <SelectItem value="rtt">RTT</SelectItem>
                        <SelectItem value="unpaid">Sans solde</SelectItem>
                        <SelectItem value="parental">Parental</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Date de début</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Date de fin</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Days Count */}
              <FormField
                control={form.control}
                name="daysCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Nombre de jours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0.5}
                        step={0.5}
                        max={365}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-white/50">
                      Calculé automatiquement (jours ouvrés)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">
                      Raison (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        maxLength={1000}
                        placeholder="Ajoutez une raison pour cette demande..."
                        className="rounded-2xl border-white/20 bg-white/20 text-white placeholder:text-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-2xl text-white/70 hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer la demande'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
