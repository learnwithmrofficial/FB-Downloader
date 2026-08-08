import React, { useState, useEffect } from 'react';
import {
  Settings,
  Folder,
  Sliders,
  Moon,
  Sun,
  Shield,
  Save,
  Check,
  FileCode,
  Bell,
  Globe,
  HardDrive,
  Key,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Upload,
  Lock,
  Sparkles,
  Subtitles,
  Film,
  Wifi,
} from 'lucide-react';
import { AppSettings, PlatformSessionStatus, PlatformType } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'cookies' | 'quality' | 'network'>('general');

  // General state
  const [downloadDir, setDownloadDir] = useState(settings.downloadDirectory);
  const [maxParallel, setMaxParallel] = useState(settings.maxParallelDownloads);
  const [speedLimit, setSpeedLimit] = useState(settings.speedLimitMBps);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(settings.theme);
  const [namingPattern, setNamingPattern] = useState(settings.namingPattern);
  const [duplicateMode, setDuplicateMode] = useState(settings.duplicateHandling);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);
  const [proxy, setProxy] = useState(settings.proxy || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quality state
  const [downloadSubs, setDownloadSubs] = useState(settings.downloadSubtitles);
  const [subLang, setSubLang] = useState(settings.subtitleLanguage || 'en');
  const [embedSubs, setEmbedSubs] = useState(settings.embedSubtitles ?? true);
  const [qualityPreset, setQualityPreset] = useState(settings.preferredQualityPreset || 'best');

  // Cookies / Platform Session state
  const [cookieStatuses, setCookieStatuses] = useState<PlatformSessionStatus[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('facebook');
  const [rawCookieInput, setRawCookieInput] = useState('');
  const [cookieSaving, setCookieSaving] = useState(false);
  const [cookieMsg, setCookieMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingSession, setTestingSession] = useState(false);

  useEffect(() => {
    fetchCookieStatuses();
  }, []);

  const fetchCookieStatuses = async () => {
    try {
      const res = await fetch('/api/cookies');
      if (res.ok) {
        const data = await res.json();
        setCookieStatuses(data);
      }
    } catch (e) {
      console.error('Failed to load cookies status:', e);
    }
  };

  const handleSaveCookie = async (platform: PlatformType) => {
    if (!rawCookieInput.trim()) {
      setCookieMsg({ type: 'error', text: 'Please paste cookie text in Netscape format or standard cookies' });
      return;
    }
    setCookieSaving(true);
    setCookieMsg(null);
    try {
      const res = await fetch('/api/cookies/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, cookieText: rawCookieInput }),
      });
      if (res.ok) {
        setRawCookieInput('');
        setCookieMsg({ type: 'success', text: `Session cookies saved safely for ${platform.toUpperCase()}` });
        await fetchCookieStatuses();
      } else {
        const data = await res.json();
        setCookieMsg({ type: 'error', text: data.error || 'Failed to save cookies' });
      }
    } catch (e: any) {
      setCookieMsg({ type: 'error', text: e.message });
    } finally {
      setCookieSaving(false);
    }
  };

  const handleClearCookie = async (platform: PlatformType) => {
    try {
      const res = await fetch('/api/cookies/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        setCookieMsg({ type: 'success', text: `Cookies cleared for ${platform.toUpperCase()}` });
        await fetchCookieStatuses();
      }
    } catch (e: any) {
      setCookieMsg({ type: 'error', text: e.message });
    }
  };

  const handleTestSession = async (platform: PlatformType) => {
    setTestingSession(true);
    setCookieMsg(null);
    try {
      const res = await fetch('/api/cookies/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (data.valid) {
        setCookieMsg({ type: 'success', text: data.message });
      } else {
        setCookieMsg({ type: 'error', text: data.message });
      }
    } catch (e: any) {
      setCookieMsg({ type: 'error', text: e.message });
    } finally {
      setTestingSession(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      downloadDirectory: downloadDir,
      maxParallelDownloads: maxParallel,
      speedLimitMBps: speedLimit,
      theme: themeMode,
      namingPattern,
      duplicateHandling: duplicateMode,
      notificationsEnabled: notifications,
      proxy,
      downloadSubtitles: downloadSubs,
      subtitleLanguage: subLang,
      embedSubtitles: embedSubs,
      preferredQualityPreset: qualityPreset,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Header & Tabs */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Downloader Preferences & Settings</h2>
            <p className="text-xs text-gray-400">
              Configure download paths, platform cookies, quality presets & network controls.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>General & Storage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cookies'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Platform Cookies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quality'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Quality & Subtitles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'network'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Network & Proxy</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: General & Storage */}
        {activeTab === 'general' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <HardDrive className="w-4 h-4 text-blue-400" /> Storage, Path & File Template Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Default Download Output Directory
                </label>
                <input
                  type="text"
                  value={downloadDir}
                  onChange={(e) => setDownloadDir(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs font-mono text-white"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Files will be automatically saved in this location on disk.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Max Parallel Queue Engine Threads ({maxParallel})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={maxParallel}
                  onChange={(e) => setMaxParallel(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 my-3"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>1 Single Thread</span>
                  <span>5 Balanced</span>
                  <span>10 Max Parallel</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  File Naming Pattern Template
                </label>
                <input
                  type="text"
                  value={namingPattern}
                  onChange={(e) => setNamingPattern(e.target.value)}
                  placeholder="{uploader} - {title}"
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs font-mono text-white mb-2"
                />
                <div className="flex gap-2 flex-wrap text-[10px] font-mono text-gray-400">
                  <button
                    type="button"
                    onClick={() => setNamingPattern('{title}')}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 cursor-pointer"
                  >
                    &#123;title&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setNamingPattern('{uploader} - {title}')}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 cursor-pointer"
                  >
                    &#123;uploader&#125; - &#123;title&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setNamingPattern('{date} - {title}')}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 cursor-pointer"
                  >
                    &#123;date&#125; - &#123;title&#125;
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Duplicate File Collision Handling
                </label>
                <select
                  value={duplicateMode}
                  onChange={(e) => setDuplicateMode(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs text-white"
                >
                  <option value="auto_rename">Auto-Rename (e.g. video (1).mp4)</option>
                  <option value="overwrite">Overwrite Existing File</option>
                  <option value="skip">Skip Downloading Existing File</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Interface Theme
                </label>
                <div className="flex items-center gap-3 h-11">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex-1 h-full rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-blue-600/80 border-blue-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-300" />
                    <span>Obsidian Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex-1 h-full rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-blue-600/80 border-blue-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Glass Light</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between h-11 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" /> Desktop Notifications
                </span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-800 border-white/20 text-blue-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Platform Specific Cookies & Sessions */}
        {activeTab === 'cookies' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" /> Platform-Specific Session & Cookie Management
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure authorized sessions for YouTube, Facebook, Instagram, TikTok, X, and Vimeo separately.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Isolated Platform Storage
              </span>
            </div>

            {/* Notification alert banner if any */}
            {cookieMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                  cookieMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cookieMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{cookieMsg.text}</span>
                </div>
                <button type="button" onClick={() => setCookieMsg(null)} className="text-gray-400 hover:text-white">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Platform Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {cookieStatuses.map((st) => (
                <button
                  key={st.platform}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(st.platform);
                    setRawCookieInput('');
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedPlatform === st.platform
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold capitalize">{st.platformName}</span>
                    {st.hasCookies ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {st.hasCookies ? 'Configured' : 'Not Set'}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Platform Cookie Editor */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white capitalize flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    {selectedPlatform.toUpperCase()} Session Configuration
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Paste export cookies text in Netscape format (from Get cookies.txt extension) to allow accessing authorized content on {selectedPlatform}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSession(selectedPlatform)}
                    disabled={testingSession}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingSession ? 'animate-spin' : ''}`} />
                    <span>Test Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearCookie(selectedPlatform)}
                    className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div>
                <textarea
                  rows={5}
                  value={rawCookieInput}
                  onChange={(e) => setRawCookieInput(e.target.value)}
                  placeholder={`# Netscape HTTP Cookie File\n.facebook.com\tTRUE\t/\tTRUE\t1780000000\tc_user\t100000...\n.facebook.com\tTRUE\t/\tTRUE\t1780000000\txs\t2%3A...`}
                  className="w-full p-3 rounded-xl glass-input text-xs font-mono text-white placeholder-gray-600 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={cookieSaving || !rawCookieInput.trim()}
                  onClick={() => handleSaveCookie(selectedPlatform)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save {selectedPlatform.toUpperCase()} Cookies</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Quality & Subtitles */}
        {activeTab === 'quality' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Film className="w-4 h-4 text-purple-400" /> Default Quality Presets & Subtitles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Default Quality Preset Selection
                </label>
                <select
                  value={qualityPreset}
                  onChange={(e) => setQualityPreset(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs text-white"
                >
                  <option value="best">Best Quality Available (Auto 8K / 4K / 1080p)</option>
                  <option value="2160p">4K UHD Preferred (2160p)</option>
                  <option value="1080p">Full HD Preferred (1080p)</option>
                  <option value="720p">HD Preferred (720p)</option>
                  <option value="audio_only">Audio Only (MP3 320kbps)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Preferred Subtitle Language Code
                </label>
                <select
                  value={subLang}
                  onChange={(e) => setSubLang(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs text-white"
                >
                  <option value="en">English (en)</option>
                  <option value="ur">Urdu (ur)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="fr">French (fr)</option>
                  <option value="de">German (de)</option>
                  <option value="ar">Arabic (ar)</option>
                  <option value="hi">Hindi (hi)</option>
                </select>
              </div>

              <div className="flex items-center justify-between h-11 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                  <Subtitles className="w-4 h-4 text-purple-400" /> Automatically Download Captions/Subtitles
                </span>
                <input
                  type="checkbox"
                  checked={downloadSubs}
                  onChange={(e) => setDownloadSubs(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-800 border-white/20 text-blue-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between h-11 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Embed Subtitles directly into MP4 Video Container
                </span>
                <input
                  type="checkbox"
                  checked={embedSubs}
                  onChange={(e) => setEmbedSubs(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-800 border-white/20 text-blue-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Network & Proxy */}
        {activeTab === 'network' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <Wifi className="w-4 h-4 text-emerald-400" /> Bandwidth, Proxy & Throttling Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Speed Limit Throttle (MB/s)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(parseFloat(e.target.value) || 0)}
                  placeholder="0 = Maximum Unlimited Bandwidth"
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs text-white"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Set 0 to download at full gigabit connection speed.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  HTTP / SOCKS5 Network Proxy Server
                </label>
                <input
                  type="text"
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  placeholder="http://127.0.0.1:8080 or socks5://127.0.0.1:1080"
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs font-mono text-white"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Optional proxy address for geo-restricted media content.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Preferences Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Application Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
