import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Flame,
  ExternalLink,
  Code,
  Sun,
  Moon,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  onOpenEmbedModal: () => void;
  className?: string;
}

export function Sidebar({ onOpenEmbedModal, className }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/sessions', label: 'Sessions', icon: Users },
    { to: '/heatmaps', label: 'Heatmaps', icon: Flame },
  ];

  return (
    <aside
      className={cn(
        'w-64 flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-surface-dark-card/90 backdrop-blur-xl h-screen sticky top-0 z-30 transition-all select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              TRACE
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              User Analytics
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          Understand every user journey.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Analytics
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Demonstration
        </div>

        {/* Demo Store Link */}
        <a
          href="http://localhost:3001"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Demo Store</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </a>

        {/* Install Tracker Button */}
        <button
          onClick={onOpenEmbedModal}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <Code className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
            <span>Install Tracker</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            &lt;/&gt;
          </span>
        </button>
      </nav>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isDark ? 'Dark Appearance' : 'Light Appearance'}</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Toggle</span>
        </button>

        <div className="px-3 text-[11px] text-slate-500 dark:text-slate-400">
          CausalFunnel Candidate &bull; v1.0
        </div>
      </div>
    </aside>
  );
}
