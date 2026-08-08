import express from "express";
import { analyzeUrl, analyzePlaylist } from "../server/analyzer.js";
import { downloaderEngine } from "../server/downloaderEngine.js";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Facebook Video Downloader API running" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const info = await analyzeUrl(url);
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to analyze URL" });
  }
});

app.post("/api/playlist/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const info = await analyzePlaylist(url);
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to analyze playlist" });
  }
});

app.get("/api/downloads", (req, res) => {
  res.json({ items: downloaderEngine.getQueue() });
});

app.get("/api/file/download", async (req, res) => {
  try {
    const rawTitle = (req.query.title as string) || 'Facebook_Video';
    const format = ((req.query.format as string) || 'MP4').toUpperCase();
    const resolution = (req.query.resolution as string) || '1080p';
    const targetUrl = (req.query.url as string) || '';

    const cleanTitle = rawTitle.replace(/[^\w\s\-\._()]/gi, '').trim() || 'Facebook_Video';
    const ext = format === 'MP3' ? 'mp3' : format === 'M4A' ? 'm4a' : 'mp4';
    const outFilename = `${cleanTitle}_${resolution}.${ext}`;

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return res.redirect(targetUrl);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${outFilename}"`);
    res.setHeader('Content-Type', format === 'MP3' ? 'audio/mpeg' : 'video/mp4');
    res.send('Processing direct download...');
  } catch (err: any) {
    res.status(500).send('Download error: ' + err.message);
  }
});

export default app;
