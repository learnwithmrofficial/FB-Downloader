import React, { useState, useEffect } from 'react';
import {
  Search,
  Clipboard,
  Sparkles,
  Play,
  Download,
  Folder,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle2,
  FileVideo,
  FileAudio,
  Film,
  User,
  Clock,
  HardDrive,
  ExternalLink,
  Subtitles,
  Zap,
} from 'lucide-react';
import {
  MediaInfo,
  ResolutionOption,
  VideoFormatOption,
  AudioFormatOption,
  DownloadMode,
  DownloadItem,
} from '../types';

interface SingleDownloaderProps {
  initialUrl?: string;
  onAnalyze: (url: string) => Promise<MediaInfo | null>;
  onStartDownload: (
    media: MediaInfo,
    resolution: ResolutionOption,
    format: VideoFormatOption | AudioFormatOption,
    downloadMode: DownloadMode
  ) => Promise<DownloadItem>;
  onPauseDownload: (id: string) => void;
  onResumeDownload: (id: string) => void;
  onCancelDownload: (id: string) => void;
  downloadQueue: DownloadItem[];
  defaultDownloadDir: string;
}

export const SingleDownloader: React.FC<SingleDownloaderProps> = ({
  initialUrl = '',
  onAnalyze,
  onStartDownload,
  onPauseDownload,
  onResumeDownload,
  onCancelDownload,
  downloadQueue,
  defaultDownloadDir,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [analyzing, setAnalyzing] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);

  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption>('1080p');
  const [selectedFormat, setSelectedFormat] = useState<VideoFormatOption | AudioFormatOption>('MP4');
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('video');
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [downloadSubs, setDownloadSubs] = useState(false);
  const [selectedSubLang, setSelectedSubLang] = useState('en');

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      handleAnalyzeUrl(initialUrl);
    }
  }, [initialUrl]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        handleAnalyzeUrl(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleAnalyzeUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setAnalyzing(true);
    setMediaInfo(null);
    try {
      const res = await onAnalyze(targetUrl.trim());
      if (res) {
        setMediaInfo(res);
        setSelectedResolution(res.defaultResolution || '1080p');
        if (res.subtitlesAvailable && res.subtitlesAvailable.length > 0) {
          setSelectedSubLang(res.subtitlesAvailable[0]);
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerChromeDownload = (title: string, format: string, url: string, resolution: string = '1080p', id?: string) => {
    const downloadUrl = `/api/file/download?title=${encodeURIComponent(title)}&format=${encodeURIComponent(format)}&resolution=${encodeURIComponent(resolution)}&url=${encodeURIComponent(url)}&id=${id || ''}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${title} [${resolution}].${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStartDownload = async () => {
    if (!mediaInfo) return;
    const item = await onStartDownload(mediaInfo, selectedResolution, selectedFormat, downloadMode);
    setActiveDownloadId(item.id);
  };

  const applyPreset = (res: ResolutionOption, fmt: VideoFormatOption | AudioFormatOption, mode: DownloadMode) => {
    setSelectedResolution(res);
    setSelectedFormat(fmt);
    setDownloadMode(mode);
  };

  // Find active download item in queue
  const currentActiveItem = downloadQueue.find((item) => item.id === activeDownloadId) ||
    downloadQueue.find((item) => mediaInfo && item.url === mediaInfo.url && item.status !== 'completed');

  const getPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase();
    const badges: Record<string, { label: string; bg: string }> = {
      facebook: { label: 'Facebook HD/SD', bg: 'bg-blue-600/20 text-blue-300 border-blue-500/30' },
      reels: { label: 'Facebook Reels', bg: 'bg-blue-500/20 text-cyan-300 border-cyan-500/30' },
      watch: { label: 'Facebook Watch', bg: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' },
    };
    const b = badges[p] || { label: 'Facebook Video', bg: 'bg-blue-600/20 text-blue-300 border-blue-500/30' };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${b.bg}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Search & URL Input Card */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Facebook Video Downloader</h2>
              <p className="text-xs text-gray-400">
                Paste Facebook link (Video, Watch link, Reels, or Public Post) for high quality HD/SD video or MP3 audio download.
              </p>
            </div>
          </div>

          <button
            onClick={handlePasteClipboard}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Clipboard className="w-4 h-4 text-purple-400" />
            <span>Paste Clipboard</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyzeUrl(url);
          }}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.facebook.com/watch/?v=... or https://fb.watch/..."
              className="w-full h-12 pl-4 pr-10 rounded-2xl glass-input text-sm text-white placeholder-gray-400"
            />
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setMediaInfo(null);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={analyzing || !url.trim()}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Analyzing Media...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Link</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analyzed Media Card & Formats Picker */}
      {mediaInfo && (
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Thumbnail Preview */}
            <div className="relative w-full lg:w-80 h-52 rounded-2xl overflow-hidden group shrink-0 border border-white/10">
              <img
                src={mediaInfo.thumbnail}
                alt={mediaInfo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                {getPlatformBadge(mediaInfo.platform)}
              </div>

              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur-md">
                <Clock className="w-3 h-3 text-blue-400" />
                {mediaInfo.durationFormatted}
              </div>
            </div>

            {/* Video Metadata & Format Pickers */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white leading-snug mb-1">
                  {mediaInfo.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>{mediaInfo.uploader}</span>
                </div>
              </div>

              {/* Preset Shortcuts Row */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Quality Presets
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset('2160p', 'MP4', 'video')}
                    disabled={!mediaInfo.availableResolutions.includes('2160p')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedResolution === '2160p' && downloadMode === 'video'
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    } disabled:opacity-30`}
                  >
                    4K UHD
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('1440p', 'MP4', 'video')}
                    disabled={!mediaInfo.availableResolutions.includes('1440p')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedResolution === '1440p' && downloadMode === 'video'
                        ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300 shadow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    } disabled:opacity-30`}
                  >
                    2K QHD
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('1080p', 'MP4', 'video')}
                    disabled={!mediaInfo.availableResolutions.includes('1080p')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedResolution === '1080p' && downloadMode === 'video'
                        ? 'bg-blue-500/30 border-blue-400 text-blue-300 shadow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    } disabled:opacity-30`}
                  >
                    1080p FHD
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('720p', 'MP4', 'video')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedResolution === '720p' && downloadMode === 'video'
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    720p HD
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('Audio', 'MP3', 'audio')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      downloadMode === 'audio'
                        ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Audio MP3 (320k)
                  </button>
                </div>
              </div>

              {/* Mode Toggle: Video vs Audio */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/60 border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setDownloadMode('video');
                    setSelectedFormat('MP4');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    downloadMode === 'video'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>Video Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDownloadMode('audio');
                    setSelectedFormat('MP3');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    downloadMode === 'audio'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>Extract Audio Only</span>
                </button>
              </div>

              {/* Selectors Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {downloadMode === 'video' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Exact Video Resolution
                      </label>
                      <select
                        value={selectedResolution}
                        onChange={(e) => setSelectedResolution(e.target.value as ResolutionOption)}
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-white"
                      >
                        {mediaInfo.availableResolutions.map((res) => {
                          if (res === 'Audio') return null;
                          const est = mediaInfo.fileSizeEstimates[res] || 25;
                          const sizeStr = est > 1024 ? `${(est / 1024).toFixed(2)} GB` : `${est} MB`;
                          return (
                            <option key={res} value={res}>
                              {res} Resolution (~{sizeStr})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Container Format
                      </label>
                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as VideoFormatOption)}
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-white"
                      >
                        <option value="MP4">MP4 (Universal)</option>
                        <option value="MKV">MKV (High Quality)</option>
                        <option value="WEBM">WEBM (Web Standard)</option>
                        <option value="MOV">MOV (QuickTime)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Audio Quality Bitrate
                      </label>
                      <div className="h-10 px-3 rounded-xl glass-input text-xs text-white flex items-center font-mono">
                        320 kbps High Definition Audio
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Audio Format
                      </label>
                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as AudioFormatOption)}
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-white"
                      >
                        <option value="MP3">MP3 (Universal Audio)</option>
                        <option value="M4A">M4A (AAC Audio)</option>
                        <option value="AAC">AAC (High Bitrate)</option>
                        <option value="WAV">WAV (Uncompressed Lossless)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Subtitles Option */}
              {mediaInfo.subtitlesAvailable && mediaInfo.subtitlesAvailable.length > 0 && (
                <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/10">
                  <Subtitles className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex-1 flex items-center gap-2">
                    <label className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={downloadSubs}
                        onChange={(e) => setDownloadSubs(e.target.checked)}
                        className="rounded bg-slate-800 text-purple-500 focus:ring-0"
                      />
                      <span>Captions/Subtitles:</span>
                    </label>
                    <select
                      value={selectedSubLang}
                      onChange={(e) => setSelectedSubLang(e.target.value)}
                      disabled={!downloadSubs}
                      className="h-8 px-2 rounded-lg glass-input text-xs text-white font-mono"
                    >
                      {mediaInfo.subtitlesAvailable.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()} Subtitle
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleStartDownload}
                  className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Start Engine Download</span>
                </button>

                <button
                  onClick={() => triggerChromeDownload(mediaInfo.title, selectedFormat, mediaInfo.url, selectedResolution)}
                  className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Download in Browser ({selectedResolution})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Live Progress Card */}
      {currentActiveItem && (
        <div className="p-6 rounded-3xl glass-panel border border-blue-500/30 space-y-4 shadow-2xl bg-gradient-to-r from-blue-950/30 to-purple-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <img src={currentActiveItem.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{currentActiveItem.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-mono text-blue-300">{currentActiveItem.resolution}</span>
                  <span>•</span>
                  <span className="font-mono text-purple-300">{currentActiveItem.format}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  triggerChromeDownload(
                    currentActiveItem.title,
                    currentActiveItem.format,
                    currentActiveItem.url,
                    currentActiveItem.resolution,
                    currentActiveItem.id
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Save File Directly in Chrome Browser"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Chrome</span>
              </button>

              {currentActiveItem.status === 'downloading' && (
                <button
                  onClick={() => onPauseDownload(currentActiveItem.id)}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer"
                  title="Pause Download"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}

              {currentActiveItem.status === 'paused' && (
                <button
                  onClick={() => onResumeDownload(currentActiveItem.id)}
                  className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                  title="Resume Download"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onCancelDownload(currentActiveItem.id)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 cursor-pointer"
                title="Cancel Download"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-900/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
                style={{ width: `${currentActiveItem.progress}%` }}
              ></div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
              <div className="flex items-center gap-4">
                <span>{currentActiveItem.progress.toFixed(1)}%</span>
                <span className="text-blue-400">{currentActiveItem.speedMBps} MB/s</span>
              </div>
              <div className="flex items-center gap-4">
                <span>ETA: {currentActiveItem.etaSeconds}s</span>
                <span className="text-purple-300">
                  {(currentActiveItem.downloadedBytes / (1024 * 1024)).toFixed(1)} / {(currentActiveItem.totalBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
