import { useState } from 'react';
import { X, Server, Database, Check, Copy, ShieldCheck } from 'lucide-react';
import { getIsDemoMode, setDemoMode } from '../../lib/api';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackendModal({ isOpen, onClose }: BackendModalProps) {
  const [copiedVar, setCopiedVar] = useState(false);
  const isDemo = getIsDemoMode();

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText('VITE_API_BASE_URL=https://your-backend-api.onrender.com');
    setCopiedVar(true);
    setTimeout(() => setCopiedVar(false), 2000);
  };

  const handleToggleMode = (enableDemo: boolean) => {
    setDemoMode(enableDemo);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-surface-dark-card border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Backend Architecture & Deployment Guide
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Understanding live analytics vs standalone demonstration mode on GitHub Pages
            </p>
          </div>
        </div>

        {/* Architecture Notice */}
        <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block font-semibold mb-1">GitHub Pages is a Static Host</strong>
                GitHub Pages hosts client-side HTML, CSS, and JavaScript. The Express.js tracking ingestion and MongoDB aggregations require a live Node.js runtime to persist real-time sessions and compute database queries.
              </div>
            </div>
          </div>

          {/* Section: Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Current Operating Mode
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isDemo
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {isDemo ? 'Standalone Demonstration Mode' : 'Live Backend Mode'}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {isDemo
                    ? 'Displaying 24 realistic visitor journeys, coordinate heatmaps, and stats.'
                    : 'Attempting requests against configured backend API URL.'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isDemo ? (
                  <button
                    onClick={() => handleToggleMode(false)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                  >
                    Switch to Live API Mode
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleMode(true)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs"
                  >
                    Switch to Demo Mode
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Live Deployment Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              How to Connect a Production Backend
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside pl-1">
              <li className="leading-relaxed">
                <strong>Deploy Server to Cloud:</strong> Deploy the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">server/</code> folder to Render, Railway, Fly.io, or AWS EC2 with environment variable <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">MONGODB_URI</code>.
              </li>
              <li className="leading-relaxed">
                <strong>Configure Environment Variable:</strong> Set your backend URL in GitHub Actions Repository Secrets or client build environment:
                <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                  <code>VITE_API_BASE_URL=https://your-backend-api.onrender.com</code>
                  <button
                    onClick={handleCopyEnv}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Copy environment variable"
                  >
                    {copiedVar ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
              <li className="leading-relaxed">
                <strong>Run Locally for Full Stack:</strong> Clone the repository and run <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">npm run dev</code> to launch frontend, server API, and tracking script with hot reload.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Honest telemetry: Real DB & Demo modes clearly separated</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
