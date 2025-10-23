import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-transparent shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground border-transparent shadow-sm',
        outline: 'border-border text-foreground bg-background shadow-sm',
        success:
          'bg-emerald-500/15 text-emerald-600 border-transparent shadow-sm',
        warning: 'bg-amber-400/20 text-amber-700 border-transparent shadow-sm',
        destructive:
          'bg-destructive/15 text-destructive border-transparent shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot='badge'
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
