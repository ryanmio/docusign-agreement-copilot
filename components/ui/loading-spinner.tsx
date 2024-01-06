import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  const id = React.useId();
  
  return (
    <div 
      data-qa="loading_spinner_component" 
      className="inline-flex items-center font-['DS_Indigo',DSIndigo,Helvetica,Arial,sans-serif] text-[rgba(26,29,32,0.9)] text-base leading-6 h-10"
    >
      <progress 
        data-qa="loading_spinner_component-bar" 
        id={id}
        className="absolute w-px h-px"
      />
      <div 
        className="relative h-10 w-10"
      >
        <svg 
          data-qa="loading_spinner_component-indeterminate-svg" 
          height="40px" 
          width="40px"
          className="animate-spin"
          viewBox="0 0 40 40"
        >
          <circle 
            r="17" 
            cx="20" 
            cy="20" 
            strokeWidth="2" 
            className="stroke-[#CBC2FF] fill-none"
          />
          <circle 
            r="17" 
            cx="20" 
            cy="20" 
            strokeWidth="6" 
            className="stroke-[#4C00FF] fill-none"
            strokeLinecap="round"
            strokeDasharray="30 107"
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>
      <label 
        aria-live="polite" 
        data-qa="loading_spinner_component-label" 
        htmlFor={id}
        className="ml-2 text-center antialiased"
      >
        {label}
      </label>
    </div>
  );
} 