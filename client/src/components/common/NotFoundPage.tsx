import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
        404 — Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
        Analytics View Not Found
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The dashboard route you requested does not exist or has moved. Use the navigation links or return to the overview.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
