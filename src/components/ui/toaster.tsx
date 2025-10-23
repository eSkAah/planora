'use client';

import * as React from 'react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, duration, variant }) => {
        const resolvedVariant = variant ?? 'default';
        return (
          <Toast
            key={id}
            variant={resolvedVariant}
            {...(typeof duration === 'number' ? { duration } : {})}
            onOpenChange={open => {
              if (!open) {
                dismiss(id);
              }
            }}
          >
            <div className='flex flex-1 flex-col gap-1 pr-6'>
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? (
                <ToastDescription>{description}</ToastDescription>
              ) : null}
              {action}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
