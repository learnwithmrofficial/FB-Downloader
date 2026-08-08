import React, { useState, useEffect, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Sidebar';
import { MainDashboard } from './components/MainDashboard';
import { SingleDownloader } from './components/SingleDownloader';
import { BulkDownloader } from './components/BulkDownloader';
import { PlaylistModal } from './components/PlaylistModal';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { LogsView } from './components/LogsView';
import { ToastContainer } from './components/ToastContainer';
import { StatusBar } from './components/StatusBar';
import {
  ActiveView,
  AppSettings,
  DownloadItem,
  HistoryItem,
  MediaInfo,
  PlaylistInfo,
  PlaylistItem,
  AppLog,
  ToastMessage,
  ResolutionOption,
  VideoFormatOption,
  AudioFormatOption,
  DownloadMode,
} from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [queue, setQueue] = useState<DownloadItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    downloadDirectory: 'D:\\Downloader\\Downloads',
    maxParallelDownloads: 3,
    speedLimitMBps: 0,
    theme: 'dark',
    autoUpdate: true,
    notificationsEnabled: true,
    proxy: '',
    namingPattern: '{uploader} - {title}',
    duplicateHandling: 'auto_rename',
    downloadSubtitles: false,
  });
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [initialSingleUrl, setInitialSingleUrl] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const showToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch initial state & setup background polling for live queue updates
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [historyRes, settingsRes, logsRes, queueRes] = await Promise.all([
          fetch('/api/history').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/logs').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/download/queue').then((r) => (r.ok ? r.json() : [])),
        ]);

        if (historyRes) setHistory(historyRes);
        if (settingsRes) {
          setSettings(settingsRes);
          setTheme(settingsRes.theme || 'dark');
        }
        if (logsRes) setLogs(logsRes);
        if (queueRes) setQueue(queueRes);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    fetchInitialData();

    // Poll queue status every 800ms
    const queuePoll = setInterval(async () => {
      try {
        const r = await fetch('/api/download/queue');
        if (r.ok) {
          const updatedQueue: DownloadItem[] = await r.json();
          setQueue(updatedQueue);
        }
      } catch (e) {
        // Silent poll fail
      }
    }, 800);

    return () => clearInterval(queuePoll);
  }, []);

  // Handle Theme CSS mode class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveSettings({ theme: nextTheme });
  };

  // API Action Wrappers
  const analyzeUrl = async (url: string): Promise<MediaInfo | null> => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Analysis request failed');
      }
      showToast('info', 'URL Analyzed Successfully', `${data.platform ? data.platform.toUpperCase() : 'FACEBOOK'} media detected.`);
      return data as MediaInfo;
    } catch (err: any) {
      showToast('error', 'Analysis Failed', err.message || 'Unable to parse Facebook URL');
      return null;
    }
  };

  const analyzePlaylist = async (url: string): Promise<PlaylistInfo | null> => {
    try {
      const res = await fetch('/api/playlist/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Playlist analysis request failed');
      }
      showToast('info', 'Playlist Parsed', `Found ${data.totalVideos} videos in collection.`);
      return data as PlaylistInfo;
    } catch (err: any) {
      showToast('error', 'Playlist Error', err.message || 'Unable to parse Facebook collection');
      return null;
    }
  };

  const startDownload = async (
    media: MediaInfo,
    resolution: ResolutionOption,
    format: VideoFormatOption | AudioFormatOption,
    downloadMode: DownloadMode
  ): Promise<DownloadItem> => {
    const estSize = media.fileSizeEstimates[resolution] || 45;
    const res = await fetch('/api/download/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: media.url,
        title: media.title,
        uploader: media.uploader,
        thumbnail: media.thumbnail,
        platform: media.platform,
        resolution,
        format,
        downloadMode,
        estimatedSizeMB: estSize,
      }),
    });

    const item: DownloadItem = await res.json();
    setQueue((prev) => [...prev, item]);
    showToast('success', 'Download Enqueued', `Started downloading ${media.title}`);
    return item;
  };

  const addBulkUrls = async (urls: string[]) => {
    let enqueued = 0;
    for (const u of urls) {
      const media = await analyzeUrl(u);
      if (media) {
        await startDownload(media, '1080p', 'MP4', 'video');
        enqueued++;
      }
    }
    showToast('success', 'Bulk Queue Updated', `Successfully enqueued ${enqueued} videos.`);
  };

  const enqueuePlaylistItems = async (items: PlaylistItem[]) => {
    for (const item of items) {
      await fetch('/api/download/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: item.url,
          title: item.title,
          uploader: item.uploader,
          thumbnail: item.thumbnail,
          platform: 'youtube',
          resolution: '1080p',
          format: 'MP4',
          downloadMode: 'video',
          estimatedSizeMB: item.estimatedSizeMB,
        }),
      });
    }
    setActiveView('bulk');
    showToast('success', 'Playlist Enqueued', `Added ${items.length} videos to batch downloader.`);
  };

  const pauseItem = async (id: string) => {
    await fetch('/api/download/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const resumeItem = async (id: string) => {
    await fetch('/api/download/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const cancelItem = async (id: string) => {
    await fetch('/api/download/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const retryItem = async (id: string) => {
    await fetch('/api/download/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const removeItem = async (id: string) => {
    await fetch(`/api/download/remove/${id}`, { method: 'DELETE' });
    setQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const pauseAll = async () => {
    await fetch('/api/download/batch/pause-all', { method: 'POST' });
    showToast('warning', 'Queue Paused', 'All active downloads paused.');
  };

  const resumeAll = async () => {
    await fetch('/api/download/batch/resume-all', { method: 'POST' });
    showToast('info', 'Queue Resumed', 'Resumed active download threads.');
  };

  const cancelAll = async () => {
    await fetch('/api/download/batch/cancel-all', { method: 'POST' });
    showToast('warning', 'Queue Cancelled', 'Cancelled active queue downloads.');
  };

  const clearHistory = async () => {
    await fetch('/api/history', { method: 'DELETE' });
    setHistory([]);
    showToast('info', 'History Cleared', 'Download history log reset.');
  };

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    const updated = await res.json();
    setSettings(updated);
  };

  const clearLogs = async () => {
    await fetch('/api/logs', { method: 'DELETE' });
    setLogs([]);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + V: Paste clipboard
      if (e.ctrlKey && e.key === 'v') {
        navigator.clipboard.readText().then((text) => {
          if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            setInitialSingleUrl(text);
            setActiveView('single');
            showToast('info', 'Shortcut Activated (Ctrl+V)', 'Pasted URL into Single Downloader');
          }
        }).catch(() => {});
      }

      // Ctrl + D: Trigger Download for active single view
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setActiveView('single');
        showToast('info', 'Shortcut Activated (Ctrl+D)', 'Jumped to Downloader');
      }

      // Ctrl + P: Pause active downloads
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        pauseAll();
      }

      // Ctrl + R: Resume active downloads
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        resumeAll();
      }

      // Ctrl + F: Jump to Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setActiveView('history');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  const activeDownloadsCount = queue.filter((i) => i.status === 'downloading').length;
  const queuedDownloadsCount = queue.filter((i) => i.status === 'queued' || i.status === 'downloading').length;
  const totalCompletedCount = history.filter((i) => i.status === 'Completed').length;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050505] text-white overflow-hidden font-sans select-none">
      {/* Animated Launch Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Electron Frameless TitleBar */}
      <TitleBar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeDownloadsCount={activeDownloadsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#050505]">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          activeDownloadsCount={activeDownloadsCount}
          queuedDownloadsCount={queuedDownloadsCount}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-hidden relative bg-[#050505]">
          {activeView === 'dashboard' && (
            <MainDashboard
              onNavigate={setActiveView}
              onQuickAnalyze={(url) => {
                setInitialSingleUrl(url);
                setActiveView('single');
              }}
              activeDownloadsCount={activeDownloadsCount}
              totalCompletedCount={totalCompletedCount}
              downloadDirectory={settings.downloadDirectory}
            />
          )}

          {activeView === 'single' && (
            <SingleDownloader
              initialUrl={initialSingleUrl}
              onAnalyze={analyzeUrl}
              onStartDownload={startDownload}
              onPauseDownload={pauseItem}
              onResumeDownload={resumeItem}
              onCancelDownload={cancelItem}
              downloadQueue={queue}
              defaultDownloadDir={settings.downloadDirectory}
            />
          )}

          {activeView === 'bulk' && (
            <BulkDownloader
              queue={queue}
              onAddBulkUrls={addBulkUrls}
              onPauseAll={pauseAll}
              onResumeAll={resumeAll}
              onCancelAll={cancelAll}
              onPauseItem={pauseItem}
              onResumeItem={resumeItem}
              onCancelItem={cancelItem}
              onRetryItem={retryItem}
              onRemoveItem={removeItem}
            />
          )}

          {activeView === 'playlist' && (
            <PlaylistModal
              onAnalyzePlaylist={analyzePlaylist}
              onEnqueueItems={enqueuePlaylistItems}
            />
          )}

          {activeView === 'history' && (
            <HistoryView
              history={history}
              onClearHistory={clearHistory}
              globalSearchQuery={globalSearchQuery}
              onRedownloadUrl={(url) => {
                setInitialSingleUrl(url);
                setActiveView('single');
              }}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView settings={settings} onSaveSettings={saveSettings} />
          )}

          {activeView === 'about' && <AboutView />}

          {activeView === 'logs' && (
            <LogsView logs={logs} onClearLogs={clearLogs} />
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        activeDownloadsCount={activeDownloadsCount}
        maxParallelDownloads={settings.maxParallelDownloads}
      />

      {/* Global In-App Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((item) => item.id !== id))} />
    </div>
  );
}
