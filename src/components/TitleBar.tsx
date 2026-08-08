import React from 'react';
import { Sun, Moon, Minus, Square, X, Download } from 'lucide-react';

interface TitleBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeDownloadsCount: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  theme,
  onToggleTheme,
  activeDownloadsCount,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  return (
    <header className="drag-region h-10 w-full bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 select-none z-50 text-xs shrink-0">
      {/* App Branding & Logo */}
      <div className="flex items-center gap-2.5 no-drag">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] shadow-md shadow-blue-500/20"></div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">
            Abdul Hadi Digital Skills Hub Downloader
          </span>
          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-white/10 text-white/60 font-mono">
            PRO v2.5
          </span>
        </div>
      </div>

      {/* Center status badge */}
      {activeDownloadsCount > 0 && (
        <div className="no-drag flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span>{activeDownloadsCount} Active Download{activeDownloadsCount > 1 ? 's' : ''} Running</span>
        </div>
      )}

      {/* Window Controls & Theme Switcher */}
      <div className="flex items-center gap-1.5 no-drag">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
        </button>

        <div className="h-4 w-px bg-white/10 mx-1"></div>

        <button
          onClick={() => {}}
          title="Minimize"
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? 'Restore' : 'Maximize'}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {}}
          title="Close"
          className="p-1.5 rounded-md hover:bg-red-500/80 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
