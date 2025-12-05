'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export function FormProgress({ currentStep, totalSteps, steps, className }: FormProgressProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index < currentStep && 'bg-primary text-primary-foreground',
                  index === currentStep && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                  index > currentStep && 'bg-muted text-muted-foreground'
                )}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                {index < currentStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs text-center max-w-[100px] leading-tight',
                  index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 transition-colors',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
