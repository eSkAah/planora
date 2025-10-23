'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
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
} from '@/components/ui';
import {
  createShiftSchema,
  type CreateShiftInput,
} from '@/lib/validations';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface ShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onSubmit: (data: CreateShiftInput) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<CreateShiftInput>;
  mode?: 'create' | 'edit';
}

const SHIFT_TYPES = [
  { value: 'morning', label: 'Matin (6h-14h)', startTime: '06:00', endTime: '14:00' },
  { value: 'afternoon', label: 'Après-midi (14h-22h)', startTime: '14:00', endTime: '22:00' },
  { value: 'evening', label: 'Soir (18h-2h)', startTime: '18:00', endTime: '02:00' },
  { value: 'night', label: 'Nuit (22h-6h)', startTime: '22:00', endTime: '06:00' },
  { value: 'custom', label: 'Personnalisé', startTime: '09:00', endTime: '17:00' },
];

export default function ShiftModal({
  open,
  onOpenChange,
  employees,
  onSubmit,
  isSubmitting,
  defaultValues,
  mode = 'create',
}: ShiftModalProps) {
  const form = useForm<CreateShiftInput>({
    resolver: zodResolver(createShiftSchema),
    defaultValues: {
      employeeId: defaultValues?.employeeId || '',
      shiftDate: defaultValues?.shiftDate || new Date().toISOString().split('T')[0],
      startTime: defaultValues?.startTime || '09:00',
      endTime: defaultValues?.endTime || '17:00',
      shiftType: defaultValues?.shiftType || 'morning',
      breakDuration: defaultValues?.breakDuration || 0,
      notes: defaultValues?.notes || '',
    },
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        employeeId: defaultValues.employeeId || '',
        shiftDate: defaultValues.shiftDate || new Date().toISOString().split('T')[0],
        startTime: defaultValues.startTime || '09:00',
        endTime: defaultValues.endTime || '17:00',
        shiftType: defaultValues.shiftType || 'morning',
        breakDuration: defaultValues.breakDuration || 0,
        notes: defaultValues.notes || '',
      });
    }
  }, [defaultValues, form]);

  // Auto-fill times when shift type changes
  const handleShiftTypeChange = (value: string) => {
    const shiftType = SHIFT_TYPES.find((t) => t.value === value);
    if (shiftType && value !== 'custom') {
      form.setValue('startTime', shiftType.startTime);
      form.setValue('endTime', shiftType.endTime);
    }
    form.setValue('shiftType', value as any);
  };

  const handleSubmit = async (data: CreateShiftInput) => {
    await onSubmit(data);
    if (!isSubmitting) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white">
            {mode === 'create' ? 'Créer un shift' : 'Modifier le shift'}
          </DialogTitle>
          <DialogDescription className="text-white/65">
            {mode === 'create'
              ? 'Ajoutez un nouveau shift pour un employé'
              : 'Modifiez les détails du shift'}
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

              {/* Date */}
              <FormField
                control={form.control}
                name="shiftDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Date</FormLabel>
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

              {/* Shift Type */}
              <FormField
                control={form.control}
                name="shiftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Type de shift</FormLabel>
                    <Select
                      onValueChange={handleShiftTypeChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-white/20 bg-white/20 text-white">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHIFT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start and End Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Heure de début</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Heure de fin</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Break Duration */}
              <FormField
                control={form.control}
                name="breakDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">
                      Pause (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={480}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="h-12 rounded-2xl border-white/20 bg-white/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">
                      Notes (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        maxLength={500}
                        placeholder="Ajoutez des notes sur ce shift..."
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
                disabled={isSubmitting}
                className="rounded-2xl text-white/70 hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'create' ? 'Création...' : 'Enregistrement...'}
                  </>
                ) : mode === 'create' ? (
                  'Créer le shift'
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
