import { useState } from 'react';
import { X, Copy, Check, Code, ShieldCheck } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedModal({ isOpen, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const trackerScriptUrl = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/tracker.js`
    : typeof window !== 'undefined' && !import.meta.env.DEV
    ? `${window.location.origin}${import.meta.env.BASE_URL}tracker.js`
    : 'http://localhost:5000/tracker.js';

  const trackerApiUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : typeof window !== 'undefined' && !import.meta.env.DEV
    ? window.location.origin
    : 'http://localhost:5000';

  const scriptTag = `<script
  src="${trackerScriptUrl}"
  data-api="${trackerApiUrl}"
  async
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-surface-dark-card border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Install Tracking Script</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Embed on any HTML page to instantly capture sessions, clicks, and heatmaps.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                HTML Snippet (Place inside &lt;head&gt; or before &lt;/body&gt;)
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
              <code>{scriptTag}</code>
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privacy & Zero-Overhead Guarantee:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Batching with <code className="font-mono text-brand-500">navigator.sendBeacon</code> prevents main-thread blocking.</li>
              <li>Canonical URL normalizer automatically excludes sensitive queries & tokens.</li>
              <li>Respects <code className="font-mono text-brand-500">data-dnt="true"</code> (Do Not Track).</li>
              <li>Never tracks password fields, auth tokens, or sensitive inputs.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
