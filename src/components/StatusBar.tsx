import React from 'react';

interface StatusBarProps {
  activeDownloadsCount: number;
  maxParallelDownloads: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeDownloadsCount,
  maxParallelDownloads,
}) => {
  return (
    <div className="h-8 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-white/40 select-none shrink-0 z-30">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          yt-dlp: v2024.03.10
        </span>
        <span>FFmpeg: v6.1</span>
        <span>Threads: {activeDownloadsCount}/{maxParallelDownloads}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          Global Speed Limit: <span className="text-white/60">Unlimited</span>
        </span>
        <span className="italic">Developed by Abdul Hadi Digital Skills Hub</span>
        <span className="font-bold text-white/60">v2.5 PRO</span>
      </div>
    </div>
  );
};
