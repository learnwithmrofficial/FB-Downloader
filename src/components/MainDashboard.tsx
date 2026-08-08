import React, { useState } from 'react';
import {
  Video,
  ListVideo,
  History,
  Settings,
  Info,
  ArrowRight,
  Download,
  Zap,
  HardDrive,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActiveView } from '../types';

interface MainDashboardProps {
  onNavigate: (view: ActiveView) => void;
  onQuickAnalyze: (url: string) => void;
  activeDownloadsCount: number;
  totalCompletedCount: number;
  downloadDirectory: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigate,
  onQuickAnalyze,
  activeDownloadsCount,
  totalCompletedCount,
  downloadDirectory,
}) => {
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      onQuickAnalyze(quickUrl.trim());
    }
  };

  const featureCards = [
    {
      id: 'single' as ActiveView,
      title: 'Facebook Single Video Downloader',
      description: 'Analyze and download Facebook videos, Watch links, Reels, and public posts in 1080p HD, 720p HD, SD & MP3 Audio.',
      icon: Video,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Facebook HD & SD',
    },
    {
      id: 'bulk' as ActiveView,
      title: 'Facebook Bulk Link Downloader',
      description: 'Paste multiple Facebook video URLs at once for parallel batch downloading with queue control.',
      icon: ListVideo,
      color: 'from-indigo-600 to-purple-600',
      badge: 'FB Batch Queue',
    },
    {
      id: 'playlist' as ActiveView,
      title: 'FB Watch & Collection Analyzer',
      description: 'Extract Facebook video series, watch collections, and multiple post links with quality estimates.',
      icon: Layers,
      color: 'from-purple-600 to-pink-600',
      badge: 'FB Video Series',
    },
    {
      id: 'history' as ActiveView,
      title: 'Download History',
      description: 'Searchable database of all downloaded Facebook videos with saved file location links and history clear options.',
      icon: History,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Persistent Local DB',
    },
    {
      id: 'settings' as ActiveView,
      title: 'Settings & FB Session Cookies',
      description: 'Configure save folders, speed limits, file naming rules, and Facebook session cookies for private videos.',
      icon: Settings,
      color: 'from-amber-600 to-orange-600',
      badge: 'FB Cookie Config',
    },
    {
      id: 'about' as ActiveView,
      title: 'About Software',
      description: 'Developer info, engine details, support contacts, and official documentation.',
      icon: Info,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Abdul Hadi Digital Hub',
    },
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Top Glowing Search/Input Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <form onSubmit={handleQuickSubmit} className="relative bg-[#0c0c0c] border border-white/10 rounded-xl p-2 flex gap-3 shadow-2xl">
          <input
            type="text"
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            placeholder="Paste Facebook video, Watch link, or Reel URL here (e.g. https://www.facebook.com/watch/?v=...)"
            className="bg-transparent flex-1 px-4 py-3 outline-none text-sm placeholder:opacity-30 text-white font-medium"
          />
          <button
            type="submit"
            disabled={!quickUrl.trim()}
            className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors uppercase disabled:opacity-50 cursor-pointer shrink-0"
          >
            ANALYZE
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
          <div className="text-xs opacity-50 mb-1">Current Speed</div>
          <div className="text-2xl font-bold text-[#3B82F6]">14.2 MB/s</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
          <div className="text-xs opacity-50 mb-1">Active Tasks</div>
          <div className="text-2xl font-bold text-[#8B5CF6]">{activeDownloadsCount} / 8</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
          <div className="text-xs opacity-50 mb-1">Completed Downloads</div>
          <div className="text-2xl font-bold text-white">{totalCompletedCount} <span className="text-sm font-normal opacity-50">files</span></div>
        </div>
      </div>

      {/* Feature Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">
            Downloader Modules & Tools
          </h2>
          <span className="text-[11px] text-white/40 font-mono">
            Save Dir: <span className="text-white/70">{downloadDirectory}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.08] p-5 rounded-2xl backdrop-blur-xl cursor-pointer transition-all duration-300 group flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/60 border border-white/10 font-mono">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#3B82F6] transition-colors mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] group-hover:text-[#8B5CF6] transition-colors pt-2">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
