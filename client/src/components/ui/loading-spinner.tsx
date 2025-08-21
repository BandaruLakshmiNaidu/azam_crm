// === LOADING SPINNER COMPONENT ===
// Reusable loading spinner with different variants

import { cn } from '@shared/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 'default',
  variant = 'primary',
  className = '',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'border-azam-blue border-t-transparent',
    secondary: 'border-gray-300 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <div
        className={cn(
          'border-2 rounded-full animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && (
        <span className={cn('font-medium', textSizeClasses[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

// Pre-configured loading states
export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" label={message} />
    </div>
  );
}

export function LoadingCard({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="p-8 text-center">
      <LoadingSpinner size="default" label={message} />
    </div>
  );
}

export function LoadingButton() {
  return <LoadingSpinner size="sm" variant="white" />;
}