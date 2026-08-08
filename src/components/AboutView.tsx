import React from 'react';
import {
  Download,
  ShieldCheck,
  Globe,
  Mail,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Hero Branding */}
      <div className="relative rounded-3xl p-8 glass-panel border border-white/15 overflow-hidden bg-gradient-to-br from-blue-950/60 via-purple-950/40 to-slate-950/80 shadow-2xl text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4 animate-pulse-glow">
          <Download className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Abdul Hadi Digital Skills Hub Downloader
        </h1>
        <p className="text-xs text-blue-300 font-mono mb-4">
          Version 2.5.0 Pro (Build 2026.08.07) • High-Performance Desktop Edition
        </p>

        <p className="text-xs text-gray-300 max-w-xl leading-relaxed mb-6">
          A high-performance Facebook Video Downloader engine crafted with Electron, React, and Node.js.
          Engineered for high-speed single & batch extraction of Facebook Videos, FB Watch streams, FB Reels, and Public Posts in HD quality and MP3 audio format.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center text-xs">
          <a
            href="https://learnwithmr.official"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <a
            href="mailto:learnwithmr.official@gmail.com"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-purple-400" />
            <span>learnwithmr.official@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Tech Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> Engine & Stack Specs
          </h3>

          <div className="space-y-2 text-xs font-mono text-gray-300">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Application Framework:</span>
              <span className="text-blue-300 font-bold">Electron + React 19 (Vite)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Core Downloader Engine:</span>
              <span className="text-purple-300 font-bold">yt-dlp Stream Proxy v2026</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Audio Conversion Engine:</span>
              <span className="text-emerald-300 font-bold">FFmpeg High Bitrate MP3</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Multi-Threading Strategy:</span>
              <span className="text-amber-300 font-bold">Node Worker Queue Dispatcher</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">User Interface Architecture:</span>
              <span className="text-cyan-300 font-bold">Obsidian Glassmorphism CSS</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Developer Credit & Rights
          </h3>

          <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-blue-900/20 border border-blue-500/30">
              <span className="font-bold text-white block mb-0.5">Software Developer</span>
              <span className="text-blue-300 font-semibold">Abdul Hadi Digital Skills Hub</span>
            </div>

            <p className="text-gray-400 text-[11px]">
              Dedicated to empowering creators, students, and digital skills professionals worldwide with high-speed, reliable digital software tools.
            </p>

            <div className="pt-2 text-[10px] text-gray-500 font-mono">
              © 2026 Abdul Hadi Digital Skills Hub. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
