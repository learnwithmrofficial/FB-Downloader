import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DownloadItem, HistoryItem } from '../src/types.js';
import { getValidCookiePathForPlatform } from './cookies.js';
import { addHistoryItem, addLog, loadSettings } from './storage.js';
import { ensureYtDlpInstalled, getYtDlpDefaultArgs } from './ytDlp.js';

class DownloaderEngine {
  private queue: Map<string, DownloadItem> = new Map();
  private activeProcesses: Map<string, ChildProcess> = new Map();

  public getQueue(): DownloadItem[] {
    return Array.from(this.queue.values());
  }

  public getItem(id: string): DownloadItem | undefined {
    return this.queue.get(id);
  }

  public addDownload(
    url: string,
    title: string,
    uploader: string,
    thumbnail: string,
    platform: any,
    resolution: any,
    format: any,
    downloadMode: any,
    estimatedSizeMB: number,
    formatId?: string,
    downloadSubtitles?: boolean,
    subtitleLang?: string
  ): DownloadItem {
    const settings = loadSettings();
    const id = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Ensure download directory exists
    const downloadDir = settings.downloadDirectory || path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadDir)) {
      try {
        fs.mkdirSync(downloadDir, { recursive: true });
      } catch (e) {
        console.error('Error creating download directory:', e);
      }
    }

    // Format filename based on pattern
    const cleanTitle = title.replace(/[^\w\s\-\._()]/gi, '').trim() || 'Downloaded_Media';
    const cleanUploader = uploader.replace(/[^\w\s\-\._()]/gi, '').trim() || 'Creator';
    
    let fileNamePattern = settings.namingPattern || '{uploader} - {title}';
    let fileName = fileNamePattern
      .replace('{title}', cleanTitle)
      .replace('{uploader}', cleanUploader)
      .replace('{date}', new Date().toISOString().split('T')[0]);

    const ext = downloadMode === 'audio' || format === 'MP3' || format === 'M4A' || format === 'WAV'
      ? format.toLowerCase()
      : 'mp4';

    fileName = `${fileName} [${resolution}].${ext}`;
    const savePath = path.join(downloadDir, fileName);

    const totalBytes = Math.round((estimatedSizeMB || 25) * 1024 * 1024);

    const item: DownloadItem = {
      id,
      url,
      title,
      uploader,
      thumbnail,
      platform,
      resolution,
      format,
      downloadMode,
      status: 'queued',
      progress: 0,
      downloadedBytes: 0,
      totalBytes,
      speedMBps: 0,
      etaSeconds: 30,
      savePath,
      fileName,
      createdAt: new Date().toISOString(),
      formatId,
      downloadSubtitles: downloadSubtitles ?? settings.downloadSubtitles,
      subtitleLang: subtitleLang || settings.subtitleLanguage || 'en',
    };

    this.queue.set(id, item);
    addLog('info', `Queued download: ${title}`, `Format: ${format}, Quality: ${resolution}`);

    this.checkNextInQueue();
    return item;
  }

  public pauseDownload(id: string): DownloadItem | undefined {
    const item = this.queue.get(id);
    if (item && (item.status === 'downloading' || item.status === 'queued')) {
      item.status = 'paused';
      item.speedMBps = 0;

      const proc = this.activeProcesses.get(id);
      if (proc) {
        proc.kill('SIGTERM');
        this.activeProcesses.delete(id);
      }

      this.queue.set(id, item);
      addLog('warn', `Paused download: ${item.title}`);
      this.checkNextInQueue();
    }
    return item;
  }

  public resumeDownload(id: string): DownloadItem | undefined {
    const item = this.queue.get(id);
    if (item && item.status === 'paused') {
      item.status = 'queued';
      this.queue.set(id, item);
      addLog('info', `Resumed download: ${item.title}`);
      this.checkNextInQueue();
    }
    return item;
  }

  public cancelDownload(id: string): DownloadItem | undefined {
    const item = this.queue.get(id);
    if (item) {
      item.status = 'cancelled';
      item.speedMBps = 0;

      const proc = this.activeProcesses.get(id);
      if (proc) {
        proc.kill('SIGKILL');
        this.activeProcesses.delete(id);
      }

      // Cleanup incomplete part file if exists
      if (fs.existsSync(item.savePath + '.part')) {
        try { fs.unlinkSync(item.savePath + '.part'); } catch (e) {}
      }

      this.queue.set(id, item);
      addLog('warn', `Cancelled download: ${item.title}`);
      this.checkNextInQueue();
    }
    return item;
  }

  public retryDownload(id: string): DownloadItem | undefined {
    const item = this.queue.get(id);
    if (item && (item.status === 'failed' || item.status === 'cancelled')) {
      item.status = 'queued';
      item.progress = 0;
      item.downloadedBytes = 0;
      item.errorMessage = undefined;
      this.queue.set(id, item);
      addLog('info', `Retrying download: ${item.title}`);
      this.checkNextInQueue();
    }
    return item;
  }

  public removeDownload(id: string): boolean {
    const proc = this.activeProcesses.get(id);
    if (proc) {
      proc.kill('SIGKILL');
      this.activeProcesses.delete(id);
    }
    const removed = this.queue.delete(id);
    this.checkNextInQueue();
    return removed;
  }

  public pauseAll(): void {
    for (const item of this.queue.values()) {
      if (item.status === 'downloading' || item.status === 'queued') {
        this.pauseDownload(item.id);
      }
    }
  }

  public resumeAll(): void {
    for (const item of this.queue.values()) {
      if (item.status === 'paused') {
        this.resumeDownload(item.id);
      }
    }
  }

  public cancelAll(): void {
    for (const item of this.queue.values()) {
      if (item.status === 'downloading' || item.status === 'queued' || item.status === 'paused') {
        this.cancelDownload(item.id);
      }
    }
  }

  private checkNextInQueue(): void {
    const settings = loadSettings();
    const activeCount = Array.from(this.queue.values()).filter(i => i.status === 'downloading').length;

    if (activeCount >= (settings.maxParallelDownloads || 3)) {
      return;
    }

    const queued = Array.from(this.queue.values()).find(i => i.status === 'queued');
    if (queued) {
      this.startDownloadingItem(queued.id);
    }
  }

  private startDownloadingItem(id: string): void {
    const item = this.queue.get(id);
    if (!item) return;

    item.status = 'downloading';
    item.errorMessage = undefined;
    this.queue.set(id, item);

    const settings = loadSettings();
    const ytDlpBin = ensureYtDlpInstalled();
    const defaultArgs = getYtDlpDefaultArgs();

    // Make sure destination folder exists
    const saveDir = path.dirname(item.savePath);
    if (!fs.existsSync(saveDir)) {
      try {
        fs.mkdirSync(saveDir, { recursive: true });
      } catch (e) {
        console.error('Error creating directory:', e);
      }
    }

    const isAudio = item.downloadMode === 'audio' || item.format === 'MP3' || item.format === 'M4A' || item.format === 'WAV' || item.format === 'AAC';

    let formatArg = 'bestvideo+bestaudio/best';
    if (item.formatId) {
      formatArg = `${item.formatId}+bestaudio/best`;
    } else if (item.resolution && item.resolution !== 'Audio') {
      const resHeight = item.resolution.replace('p', '');
      formatArg = `bestvideo[height<=${resHeight}]+bestaudio/best[height<=${resHeight}]/best`;
    }

    const args = [
      ...defaultArgs,
      '-f', formatArg,
      '--newline',
      '--no-playlist',
      '-o', item.savePath,
    ];

    // Check platform cookies
    const cookiePath = getValidCookiePathForPlatform(item.platform);
    if (cookiePath) {
      args.push('--cookies', cookiePath);
      addLog('info', `Using platform session cookies for ${item.platform}`, cookiePath);
    }

    // Proxy setting
    if (settings.proxy && settings.proxy.trim().length > 0) {
      args.push('--proxy', settings.proxy.trim());
    }

    // Speed limit setting
    if (settings.speedLimitMBps && settings.speedLimitMBps > 0) {
      args.push('--rate-limit', `${settings.speedLimitMBps}M`);
    }

    // Subtitles
    if (item.downloadSubtitles || settings.downloadSubtitles) {
      const lang = item.subtitleLang || settings.subtitleLanguage || 'en';
      args.push('--write-subs', '--sub-lang', lang);
      if (settings.embedSubtitles) {
        args.push('--embed-subs');
      }
    }

    if (isAudio) {
      const audioFormat = item.format.toLowerCase() === 'mp3' ? 'mp3' : item.format.toLowerCase() === 'wav' ? 'wav' : 'm4a';
      args.push('-x', '--audio-format', audioFormat);
    } else {
      args.push('--merge-output-format', 'mp4');
    }

    args.push(item.url);

    addLog('info', `Started real yt-dlp process for: ${item.title}`, `Format: ${formatArg}, Output: ${item.savePath}`);

    try {
      const proc = spawn(ytDlpBin, args);
      this.activeProcesses.set(id, proc);

      proc.stdout.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        this.parseYtDlpStdout(id, text);
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        if (text.includes('ERROR:')) {
          console.error(`[yt-dlp stderr ${id}]:`, text);
        }
      });

      proc.on('close', (code) => {
        this.activeProcesses.delete(id);
        const currentItem = this.queue.get(id);
        if (!currentItem || currentItem.status !== 'downloading') return;

        if (code === 0) {
          currentItem.progress = 100;
          currentItem.status = 'completed';
          currentItem.speedMBps = 0;
          currentItem.etaSeconds = 0;
          currentItem.completedAt = new Date().toISOString();

          // Verify actual output file on disk
          let finalPath = currentItem.savePath;
          if (!fs.existsSync(finalPath)) {
            // Check if yt-dlp added extension like .mp4 or .m4a
            const possibleFiles = fs.readdirSync(saveDir).filter(f => f.startsWith(path.basename(currentItem.savePath, path.extname(currentItem.savePath))));
            if (possibleFiles.length > 0) {
              finalPath = path.join(saveDir, possibleFiles[0]);
              currentItem.savePath = finalPath;
            }
          }

          if (fs.existsSync(finalPath)) {
            const stats = fs.statSync(finalPath);
            currentItem.downloadedBytes = stats.size;
            currentItem.totalBytes = stats.size;
          }

          // Record history
          const historyItem: HistoryItem = {
            id: currentItem.id,
            title: currentItem.title,
            platform: currentItem.platform,
            resolution: currentItem.resolution,
            format: currentItem.format,
            sizeMB: Math.round((currentItem.downloadedBytes / (1024 * 1024)) * 10) / 10,
            status: 'Completed',
            date: new Date().toISOString(),
            savePath: currentItem.savePath,
            fileName: path.basename(currentItem.savePath),
            url: currentItem.url,
          };
          addHistoryItem(historyItem);
          addLog('success', `Download completed successfully: ${currentItem.title}`, `Saved to ${currentItem.savePath}`);
        } else {
          currentItem.status = 'failed';
          currentItem.errorMessage = `Download failed with process exit code ${code}`;
          addLog('error', `Download failed for: ${currentItem.title}`, `Exit code: ${code}`);
        }

        this.queue.set(id, currentItem);
        this.checkNextInQueue();
      });

      proc.on('error', (err) => {
        this.activeProcesses.delete(id);
        const currentItem = this.queue.get(id);
        if (currentItem) {
          currentItem.status = 'failed';
          currentItem.errorMessage = err.message || 'Process error';
          this.queue.set(id, currentItem);
          addLog('error', `Process error for ${currentItem.title}:`, err.message);
        }
        this.checkNextInQueue();
      });

    } catch (e: any) {
      item.status = 'failed';
      item.errorMessage = e?.message || 'Failed to spawn yt-dlp';
      this.queue.set(id, item);
      addLog('error', `Failed to start process for ${item.title}:`, e?.message);
      this.checkNextInQueue();
    }
  }

  private parseYtDlpStdout(id: string, text: string): void {
    const item = this.queue.get(id);
    if (!item || item.status !== 'downloading') return;

    const lines = text.split('\n');
    for (const line of lines) {
      if (!line.includes('[download]')) continue;

      // Extract progress %
      const percentMatch = line.match(/(\d+\.\d+)%/);
      if (percentMatch) {
        const pct = parseFloat(percentMatch[1]);
        if (!isNaN(pct)) {
          item.progress = pct;
        }
      }

      // Extract total size
      const sizeMatch = line.match(/of\s+([\d\.]+)\s*([KMG]iB|B)/i);
      if (sizeMatch) {
        const val = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2].toUpperCase();
        let bytes = val;
        if (unit.includes('K')) bytes *= 1024;
        else if (unit.includes('M')) bytes *= 1024 * 1024;
        else if (unit.includes('G')) bytes *= 1024 * 1024 * 1024;
        item.totalBytes = Math.round(bytes);
        item.downloadedBytes = Math.round((item.progress / 100) * item.totalBytes);
      }

      // Extract speed
      const speedMatch = line.match(/at\s+([\d\.]+)\s*([KMG]iB|B)\/s/i);
      if (speedMatch) {
        const val = parseFloat(speedMatch[1]);
        const unit = speedMatch[2].toUpperCase();
        let mbps = val;
        if (unit.includes('K')) mbps /= 1024;
        else if (unit.includes('G')) mbps *= 1024;
        item.speedMBps = Math.round(mbps * 100) / 100;
      }

      // Extract ETA
      const etaMatch = line.match(/ETA\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (etaMatch) {
        if (etaMatch[3]) {
          const h = parseInt(etaMatch[1], 10);
          const m = parseInt(etaMatch[2], 10);
          const s = parseInt(etaMatch[3], 10);
          item.etaSeconds = h * 3600 + m * 60 + s;
        } else {
          const m = parseInt(etaMatch[1], 10);
          const s = parseInt(etaMatch[2], 10);
          item.etaSeconds = m * 60 + s;
        }
      }
    }

    this.queue.set(id, item);
  }
}

export const downloaderEngine = new DownloaderEngine();
