export type PlatformType = 
  | 'facebook' 
  | 'reels' 
  | 'watch' 
  | 'youtube'
  | 'instagram' 
  | 'tiktok' 
  | 'twitter' 
  | 'vimeo' 
  | 'dailymotion' 
  | 'pinterest' 
  | 'reddit' 
  | 'shorts' 
  | 'generic';

export type ResolutionOption = 
  | '4320p' // 8K
  | '2160p' // 4K UHD
  | '1440p' // 2K QHD
  | '1080p' // Full HD
  | '720p'  // HD
  | '480p'  // SD
  | '360p' 
  | '240p' 
  | '144p' 
  | 'Audio';

export type VideoFormatOption = 'MP4' | 'MKV' | 'WEBM' | 'MOV';
export type AudioFormatOption = 'MP3' | 'M4A' | 'AAC' | 'WAV';
export type DownloadMode = 'video' | 'audio';

export interface DownloadOption {
  qualityLabel: string;
  resolution: ResolutionOption;
  format: VideoFormatOption | AudioFormatOption;
  sizeMB: number;
  hasAudio: boolean;
  downloadUrl: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  formatId?: string;
  isHdr?: boolean;
  requiresMerge?: boolean;
  bitrateKbps?: number;
}

export interface MediaInfo {
  id: string;
  url: string;
  title: string;
  uploader: string;
  duration: number; // in seconds
  durationFormatted: string;
  thumbnail: string;
  platform: PlatformType;
  availableResolutions: ResolutionOption[];
  fileSizeEstimates: Record<string, number>; // in MB
  defaultResolution: ResolutionOption;
  downloadOptions?: DownloadOption[];
  isPlaylist?: boolean;
  playlistItemCount?: number;
  subtitlesAvailable?: string[]; // e.g. ['en', 'ur', 'es']
}

export type DownloadStatus = 
  | 'idle' 
  | 'analyzing' 
  | 'queued' 
  | 'downloading' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  uploader: string;
  thumbnail: string;
  platform: PlatformType;
  resolution: ResolutionOption;
  format: VideoFormatOption | AudioFormatOption;
  downloadMode: DownloadMode;
  status: DownloadStatus;
  progress: number; // 0 - 100
  downloadedBytes: number;
  totalBytes: number;
  speedMBps: number;
  etaSeconds: number;
  savePath: string;
  fileName: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  downloadSubtitles?: boolean;
  subtitleLang?: string;
  formatId?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  platform: PlatformType;
  resolution: string;
  format: string;
  sizeMB: number;
  status: 'Completed' | 'Failed' | 'Cancelled';
  date: string;
  savePath: string;
  fileName: string;
  url: string;
}

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  uploader: string;
  durationFormatted: string;
  thumbnail: string;
  selected: boolean;
  estimatedSizeMB: number;
}

export interface PlaylistInfo {
  title: string;
  uploader: string;
  platform: PlatformType;
  totalVideos: number;
  estimatedTotalSizeMB: number;
  items: PlaylistItem[];
}

export interface PlatformSessionStatus {
  platform: PlatformType;
  platformName: string;
  enabled: boolean;
  hasCookies: boolean;
  updatedAt?: string;
  cookieSize?: number;
}

export interface AppSettings {
  downloadDirectory: string;
  maxParallelDownloads: number;
  speedLimitMBps: number; // 0 = unlimited
  theme: 'dark' | 'light';
  autoUpdate: boolean;
  notificationsEnabled: boolean;
  proxy: string;
  namingPattern: string; // e.g. "{title}", "{uploader} - {title}", "{date} - {title}"
  duplicateHandling: 'overwrite' | 'auto_rename' | 'skip';
  downloadSubtitles: boolean;
  subtitleLanguage: string; // e.g. 'en'
  embedSubtitles: boolean;
  preferredQualityPreset: 'best' | '2160p' | '1080p' | '720p' | 'audio_only';
}

export interface AppLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: string;
}

export type ActiveView = 
  | 'dashboard' 
  | 'single' 
  | 'bulk' 
  | 'playlist' 
  | 'history' 
  | 'settings' 
  | 'about' 
  | 'logs';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}
