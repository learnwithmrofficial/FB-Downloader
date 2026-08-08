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

export default app;
