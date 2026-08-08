import React from 'react';
import {
  LayoutDashboard,
  Video,
  ListVideo,
  Layers,
  History,
  Settings,
  Info,
  Terminal,
  Download,
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  activeDownloadsCount: number;
  queuedDownloadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  activeDownloadsCount,
  queuedDownloadsCount,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'single' as ActiveView, label: 'Single Video', icon: Video, badge: null },
    {
      id: 'bulk' as ActiveView,
      label: 'Bulk Downloader',
      icon: ListVideo,
      badge: queuedDownloadsCount > 0 ? `${queuedDownloadsCount}` : null,
    },
    { id: 'playlist' as ActiveView, label: 'Playlist Analyzer', icon: Layers },
    { id: 'history' as ActiveView, label: 'Download History', icon: History },
    { id: 'settings' as ActiveView, label: 'Settings', icon: Settings },
    { id: 'about' as ActiveView, label: 'About Software', icon: Info },
    { id: 'logs' as ActiveView, label: 'System Logs', icon: Terminal },
  ];

  return (
    <aside className="w-64 h-full bg-[#080808] border-r border-white/5 flex flex-col justify-between select-none shrink-0 z-20">
      {/* Upper Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/5 text-[#3B82F6] border border-white/10 shadow-lg shadow-blue-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3B82F6]' : 'text-white/50'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="ml-auto text-[10px] bg-[#8B5CF6] text-white px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Disk Space & System Info Widget */}
      <div className="mt-auto p-4 space-y-3">
        <div className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded-2xl border border-white/10">
          <div className="text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider">Disk Space</div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/80">D:/Downloads</span>
            <span className="font-mono text-white/60">42.8 GB free</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#3B82F6] w-[65%]"></div>
          </div>
        </div>

        {/* Engine Status Line */}
        <div className="px-2 py-1 flex items-center justify-between text-[10px] text-white/40 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Engine Active
          </span>
          <span>{activeDownloadsCount} Streams</span>
        </div>
      </div>
    </aside>
  );
};
