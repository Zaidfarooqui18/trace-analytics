import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { setDemoMode } from '../../lib/api';

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
  const isBackendMissing =
    message?.toLowerCase().includes('backend api is not deployed') ||
    message?.toLowerCase().includes('vite_api_base_url');

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

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isBackendMissing && (
          <button
            onClick={() => {
              setDemoMode(true);
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to Demo Mode</span>
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-rose-700 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}

