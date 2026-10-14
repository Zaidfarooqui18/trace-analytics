import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the analytics API.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 dark:text-rose-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-rose-700 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
