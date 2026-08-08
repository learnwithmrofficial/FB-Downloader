import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, execFile } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { analyzeUrl, analyzePlaylist, detectPlatform } from './server/analyzer.js';
import { downloaderEngine } from './server/downloaderEngine.js';
import { ensureYtDlpInstalled, getYtDlpDefaultArgs } from './server/ytDlp.js';
import {
  getAllPlatformSessionStatuses,
  savePlatformCookies,
  clearPlatformCookies,
  getValidCookiePathForPlatform,
  getPlatformSessionStatus,
} from './server/cookies.js';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  clearHistory,
  loadLogs,
  clearLogs,
  addLog,
} from './server/storage.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize yt-dlp binary at server start
  ensureYtDlpInstalled();

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: '3.0.0',
      software: 'Abdul Hadi Digital Skills Hub Downloader Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // URL Analyzer
  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      const media = await analyzeUrl(url);
      res.json(media);
    } catch (err: any) {
      addLog('error', `Failed to analyze URL: ${req.body?.url}`, err?.message);
      res.status(500).json({ error: 'Analysis failed: ' + (err?.message || 'Unknown error') });
    }
  });

  // Playlist / Channel Analyzer
  app.post('/api/playlist/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Playlist URL is required' });
      }
      const playlist = await analyzePlaylist(url);
      res.json(playlist);
    } catch (err: any) {
      addLog('error', `Failed to analyze playlist URL: ${req.body?.url}`, err?.message);
      res.status(500).json({ error: 'Playlist analysis failed: ' + (err?.message || 'Unknown error') });
    }
  });

  // Queue & Download Management
  app.get('/api/download/queue', (req, res) => {
    res.json(downloaderEngine.getQueue());
  });

  app.post('/api/download/start', (req, res) => {
    try {
      const {
        url,
        title,
        uploader,
        thumbnail,
        platform,
        resolution,
        format,
        downloadMode,
        estimatedSizeMB,
        formatId,
        downloadSubtitles,
        subtitleLang,
      } = req.body;

      if (!url || !title) {
        return res.status(400).json({ error: 'URL and title are required' });
      }

      const item = downloaderEngine.addDownload(
        url,
        title || 'Video Download',
        uploader || 'Unknown Creator',
        thumbnail || '',
        platform || 'generic',
        resolution || '1080p',
        format || 'MP4',
        downloadMode || 'video',
        estimatedSizeMB || 45,
        formatId,
        downloadSubtitles,
        subtitleLang
      );

      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to enqueue download: ' + err.message });
    }
  });

  app.post('/api/download/pause', (req, res) => {
    const { id } = req.body;
    const item = downloaderEngine.pauseDownload(id);
    if (!item) return res.status(404).json({ error: 'Download item not found' });
    res.json(item);
  });

  app.post('/api/download/resume', (req, res) => {
    const { id } = req.body;
    const item = downloaderEngine.resumeDownload(id);
    if (!item) return res.status(404).json({ error: 'Download item not found' });
    res.json(item);
  });

  app.post('/api/download/cancel', (req, res) => {
    const { id } = req.body;
    const item = downloaderEngine.cancelDownload(id);
    if (!item) return res.status(404).json({ error: 'Download item not found' });
    res.json(item);
  });

  app.post('/api/download/retry', (req, res) => {
    const { id } = req.body;
    const item = downloaderEngine.retryDownload(id);
    if (!item) return res.status(404).json({ error: 'Download item not found' });
    res.json(item);
  });

  app.delete('/api/download/remove/:id', (req, res) => {
    const { id } = req.params;
    const removed = downloaderEngine.removeDownload(id);
    res.json({ success: removed });
  });

  app.post('/api/download/batch/pause-all', (req, res) => {
    downloaderEngine.pauseAll();
    res.json({ success: true, queue: downloaderEngine.getQueue() });
  });

  app.post('/api/download/batch/resume-all', (req, res) => {
    downloaderEngine.resumeAll();
    res.json({ success: true, queue: downloaderEngine.getQueue() });
  });

  app.post('/api/download/batch/cancel-all', (req, res) => {
    downloaderEngine.cancelAll();
    res.json({ success: true, queue: downloaderEngine.getQueue() });
  });

  // Platform Cookie / Session Management Endpoints
  app.get('/api/cookies', (req, res) => {
    res.json(getAllPlatformSessionStatuses());
  });

  app.post('/api/cookies/save', (req, res) => {
    try {
      const { platform, cookieText } = req.body;
      if (!platform || typeof cookieText !== 'string') {
        return res.status(400).json({ error: 'platform and cookieText are required' });
      }
      const updated = savePlatformCookies(platform, cookieText);
      addLog('info', `Updated platform session cookies for: ${platform}`);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save cookies: ' + err.message });
    }
  });

  app.post('/api/cookies/clear', (req, res) => {
    try {
      const { platform } = req.body;
      if (!platform) {
        return res.status(400).json({ error: 'platform is required' });
      }
      const updated = clearPlatformCookies(platform);
      addLog('info', `Cleared platform session cookies for: ${platform}`);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to clear cookies: ' + err.message });
    }
  });

  app.post('/api/cookies/test', async (req, res) => {
    try {
      const { platform, url } = req.body;
      if (!platform) {
        return res.status(400).json({ error: 'platform is required' });
      }

      const cookiePath = getValidCookiePathForPlatform(platform);
      if (!cookiePath) {
        return res.status(400).json({ valid: false, message: 'No cookies configured for this platform' });
      }

      const testUrl = url || (platform === 'youtube' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'https://www.google.com');
      const ytDlpBin = ensureYtDlpInstalled();
      const defaultArgs = getYtDlpDefaultArgs();

      execFile(ytDlpBin, [...defaultArgs, '--cookies', cookiePath, '-j', '--no-playlist', testUrl], { timeout: 15000 }, (err, stdout) => {
        if (err) {
          return res.json({ valid: false, message: 'Session test failed or URL not accessible with provided cookies.' });
        }
        res.json({ valid: true, message: 'Platform session validated successfully!' });
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Test failed: ' + err.message });
    }
  });

  // Persistent History Endpoints
  app.get('/api/history', (req, res) => {
    res.json(loadHistory());
  });

  app.delete('/api/history', (req, res) => {
    clearHistory();
    addLog('info', 'Download history cleared by user');
    res.json({ success: true, history: [] });
  });

  // Settings Endpoints
  app.get('/api/settings', (req, res) => {
    res.json(loadSettings());
  });

  app.post('/api/settings', (req, res) => {
    const updated = saveSettings(req.body);
    addLog('info', 'Application settings updated');
    res.json(updated);
  });

  // Logs Endpoints
  app.get('/api/logs', (req, res) => {
    res.json(loadLogs());
  });

  app.delete('/api/logs', (req, res) => {
    clearLogs();
    res.json({ success: true, logs: [] });
  });

  // Direct file download endpoint for Chrome browser downloads
  app.get('/api/file/download', async (req, res) => {
    try {
      const filePath = req.query.path as string;
      const downloadId = req.query.id as string;
      const rawTitle = (req.query.title as string) || 'Video_Download';
      const format = ((req.query.format as string) || 'MP4').toUpperCase();
      const resolution = (req.query.resolution as string) || '1080p';
      const targetUrl = (req.query.url as string) || '';

      // 1. If file already exists on disk, send directly with full headers
      if (filePath && fs.existsSync(filePath)) {
        return res.download(filePath, path.basename(filePath));
      }

      const item = downloadId ? downloaderEngine.getItem(downloadId) : null;
      if (item && item.savePath && fs.existsSync(item.savePath)) {
        return res.download(item.savePath, item.fileName);
      }

      const finalUrl = targetUrl || item?.url;
      if (!finalUrl) {
        return res.status(400).send('No file path or URL provided for download');
      }

      const cleanTitle = (rawTitle || item?.title || 'Downloaded_Media')
        .replace(/[^\w\s\-\._()]/gi, '')
        .trim() || 'Media_File';

      const ext = format === 'MP3' ? 'mp3' : format === 'M4A' ? 'm4a' : format === 'WAV' ? 'wav' : 'mp4';
      const outFilename = `${cleanTitle} [${resolution}].${ext}`;

      // Ensure temp directory exists
      const tempDir = path.join(process.cwd(), 'downloads', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`);

      const ytDlpBin = ensureYtDlpInstalled();
      const defaultArgs = getYtDlpDefaultArgs();

      const platform = detectPlatform(finalUrl);
      const cookiePath = getValidCookiePathForPlatform(platform);

      const args = [...defaultArgs];
      if (cookiePath) {
        args.push('--cookies', cookiePath);
      }

      if (format === 'MP3') {
        args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      } else if (format === 'M4A') {
        args.push('-x', '--audio-format', 'm4a');
      } else if (format === 'WAV') {
        args.push('-x', '--audio-format', 'wav');
      } else {
        if (resolution && resolution !== 'Audio') {
          const resHeight = resolution.replace('p', '');
          args.push('-f', `bestvideo[height<=${resHeight}]+bestaudio/best[height<=${resHeight}]/best`);
        } else {
          args.push('-f', 'bestvideo+bestaudio/best');
        }
        args.push('--recode-video', ext);
      }

      args.push('--no-playlist', '-o', tempFilePath, finalUrl);

      addLog('info', `Processing browser direct download for: ${cleanTitle}`, `Quality: ${resolution}, Format: ${format}`);

      const proc = spawn(ytDlpBin, args);
      let stderrText = '';

      proc.stderr.on('data', (d) => {
        stderrText += d.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(tempFilePath) && fs.statSync(tempFilePath).size > 0) {
          const fileSize = fs.statSync(tempFilePath).size;
          addLog('info', `Direct download ready (${(fileSize / (1024 * 1024)).toFixed(1)} MB): ${outFilename}`);

          res.download(tempFilePath, outFilename, (err) => {
            // Clean up temporary file after response completes
            try {
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            } catch (e) {
              console.error('Failed to cleanup temp download file:', e);
            }
          });
        } else {
          console.error('yt-dlp download failed:', stderrText);
          if (!res.headersSent) {
            res.status(500).send('Download error: Unable to process full quality video file. ' + (stderrText || ''));
          }
        }
      });
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(500).send('Server download error: ' + err.message);
      }
    }
  });

  // Setup Vite or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Abdul Hadi Downloader Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
