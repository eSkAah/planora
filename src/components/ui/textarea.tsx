import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'bg-background text-foreground focus-visible:ring-primary/30 focus-visible:ring-offset-background placeholder:text-muted-foreground border-border/60 flex min-h-[120px] w-full rounded-2xl border px-4 py-3 text-sm shadow-sm transition-all duration-300 ease-in-out focus-visible:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
