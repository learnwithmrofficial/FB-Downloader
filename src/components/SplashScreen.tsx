import React, { useEffect, useState } from 'react';
import { Download, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onFinish(), 300);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-8 text-center">
        {/* Animated Icon Box */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-pulse-glow">
            <Download className="w-10 h-10 text-white animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Branding Title */}
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-300 to-white bg-clip-text text-transparent mb-2">
          Abdul Hadi Digital Skills Hub
        </h1>
        <p className="text-sm font-medium text-gray-400 tracking-wide mb-8">
          Next-Gen Glassmorphic Multi-Platform Video Engine
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10 mb-4 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-150 ease-out shadow-lg shadow-blue-500/50"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Status */}
        <div className="w-full flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Initializing yt-dlp Core Engine...
          </span>
          <span>{progress}%</span>
        </div>

        {/* Version Footer */}
        <div className="mt-12 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secure Sandbox
          </span>
          <span>•</span>
          <span>Version 2.5 Pro Edition</span>
        </div>
      </div>
    </div>
  );
};
