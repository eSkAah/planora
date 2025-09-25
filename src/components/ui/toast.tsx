'use client';

import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex max-h-screen w-full max-w-sm flex-col gap-3 p-4 sm:top-6 sm:right-6 sm:left-auto sm:max-w-md sm:items-end',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

type ToastVariants = 'default' | 'success' | 'destructive' | 'warning';

type ToastProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Root
> & {
  variant?: ToastVariants;
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'bg-card text-card-foreground border-border/40 supports-[backdrop-filter]:bg-card/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-top pointer-events-auto relative flex w-full max-w-md min-w-[320px] items-start gap-4 overflow-hidden rounded-3xl border px-5 py-4 shadow-xl shadow-black/10 backdrop-blur transition-all duration-300',
        variant === 'success' &&
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-50',
        variant === 'destructive' &&
          'border-destructive/40 bg-destructive/10 text-destructive-foreground',
        variant === 'warning' &&
          'border-amber-500/40 bg-amber-400/15 text-amber-900 dark:text-amber-50',
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'border-border/60 hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary/30 inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'text-foreground/70 hover:text-foreground hover:bg-foreground/10 focus-visible:ring-primary/30 absolute top-3 right-3 rounded-full p-1.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      className
    )}
    toast-close=''
    {...props}
  >
    <X className='size-4' />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm leading-tight font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm leading-relaxed', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
