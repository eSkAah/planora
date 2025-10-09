import * as React from 'react';

import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={step.id}
              className={cn('relative flex flex-col items-center', {
                'flex-1': index < steps.length - 1,
              })}
            >
              {/* Step connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-[calc(50%+1.5rem)] right-0 h-0.5 transition-all duration-500 ease-in-out',
                    isCompleted
                      ? 'bg-[#F2E94E]'
                      : 'bg-white/20'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out',
                    {
                      // Completed state
                      'border-[#F2E94E] bg-[#F2E94E] text-[#0A1A2F]':
                        isCompleted,
                      // Current state
                      'border-[#F2E94E] bg-white/10 text-[#F2E94E] ring-4 ring-[#F2E94E]/20':
                        isCurrent,
                      // Upcoming state
                      'border-white/20 bg-white/5 text-white/40': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      {
                        'text-[#F2E94E]': isCompleted || isCurrent,
                        'text-white/50': isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        'mt-0.5 text-xs transition-colors duration-300',
                        {
                          'text-white/70': isCompleted || isCurrent,
                          'text-white/30': isUpcoming,
                        }
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Stepper.displayName = 'Stepper';
