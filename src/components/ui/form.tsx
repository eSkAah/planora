'use client';

/**
 * React Hook Form primitives (ShadCN adaptation)
 *
 * Restores the typed helpers used across the app for consistent form styling.
 */

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

import { cn } from '@/lib/utils';

/**
 * Re-export FormProvider so callers can wrap forms with `<Form {...form} />`.
 */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
);

type FormItemContextValue = {
  id: string;
  descriptionId: string;
  messageId: string;
};

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined
);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('Form components must be used within a <FormField>.');
  }

  if (!itemContext) {
    throw new Error('Form components must be used within a <FormItem>.');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    ...fieldState,
    name: fieldContext.name,
    formItemId: itemContext.id,
    formDescriptionId: itemContext.descriptionId,
    formMessageId: itemContext.messageId,
  };
}

const FormField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  const value = React.useMemo<FormItemContextValue>(
    () => ({
      id,
      descriptionId: `${id}-description`,
      messageId: `${id}-message`,
    }),
    [id]
  );

  return (
    <FormItemContext.Provider value={value}>
      <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();

  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={props.htmlFor ?? formItemId}
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId, error } =
    useFormField();

  const describedBy = [
    props['aria-describedby'],
    formDescriptionId,
    error ? formMessageId : undefined,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy || undefined}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { formMessageId, error } = useFormField();

  if (!error && !children) {
    return null;
  }

  const errorMessage = error ? String(error.message ?? error.type) : null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    >
      {errorMessage ?? children}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
};
