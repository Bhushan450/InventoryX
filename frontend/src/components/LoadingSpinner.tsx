import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px] w-full">
      <div
        className={`${sizeClasses} border-emerald-200 border-t-emerald-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-3 text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
