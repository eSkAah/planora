import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border bg-input flex h-10 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-sm transition-all duration-300 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus:border-primary focus:shadow-primary/10 focus:ring-primary/20 focus:shadow-md focus:ring-2',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2',
        className
      )}
      {...props}
    />
  );
}

export { Input };
