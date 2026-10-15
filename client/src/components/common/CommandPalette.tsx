import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Flame, ExternalLink, Sun, Moon, Code } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmbedModal: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenEmbedModal }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      label: 'Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      label: 'Sessions Explorer',
      category: 'Navigation',
      icon: Users,
      action: () => {
        navigate('/sessions');
        onClose();
      },
    },
    {
      label: 'Heatmaps & Click Analytics',
      category: 'Navigation',
      icon: Flame,
      action: () => {
        navigate('/heatmaps');
        onClose();
      },
    },
    {
      label: import.meta.env.DEV ? 'Open Demo Store (localhost:3001)' : 'Open Demo Store',
      category: 'Quick Links',
      icon: ExternalLink,
      action: () => {
        const demoUrl = import.meta.env.DEV
          ? 'http://localhost:3001'
          : `${import.meta.env.BASE_URL}demo/index.html`;
        window.open(demoUrl, '_blank');
        onClose();
      },
    },
    {
      label: 'View Embed Tracking Code',
      category: 'Actions',
      icon: Code,
      action: () => {
        onClose();
        onOpenEmbedModal();
      },
    },
    {
      label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Preferences',
      icon: isDark ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, views, actions..."
            className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
