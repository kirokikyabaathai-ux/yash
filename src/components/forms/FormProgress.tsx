'use client';

import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function FormProgress({ currentStep, totalSteps, steps }: FormProgressProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 text-center max-w-[80px]">{step}</span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 mt-2">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}
