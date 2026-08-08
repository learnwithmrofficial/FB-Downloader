import fs from 'fs';
import path from 'path';
import { AppSettings, HistoryItem, AppLog } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const defaultSettings: AppSettings = {
  downloadDirectory: path.join(process.cwd(), 'downloads'),
  maxParallelDownloads: 3,
  speedLimitMBps: 0,
  theme: 'dark',
  autoUpdate: true,
  notificationsEnabled: true,
  proxy: '',
  namingPattern: '{uploader} - {title}',
  duplicateHandling: 'auto_rename',
  downloadSubtitles: false,
  subtitleLanguage: 'en',
  embedSubtitles: true,
  preferredQualityPreset: 'best',
};

// Ensure download directory exists
if (!fs.existsSync(defaultSettings.downloadDirectory)) {
  fs.mkdirSync(defaultSettings.downloadDirectory, { recursive: true });
}

export function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to read settings.json:', err);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Failed to save settings.json:', err);
    return loadSettings();
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read history.json:', err);
  }
  return [];
}

export function saveHistory(history: HistoryItem[]): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save history.json:', err);
  }
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  const current = loadHistory();
  const updated = [item, ...current.filter(h => h.id !== item.id)];
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  saveHistory([]);
}

export function loadLogs(): AppLog[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read logs.json:', err);
  }
  return [];
}

export function addLog(type: AppLog['type'], message: string, details?: string): AppLog[] {
  const logs = loadLogs();
  const newLog: AppLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
  };
  const updated = [newLog, ...logs].slice(0, 500); // keep last 500 logs
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write logs.json:', err);
  }
  return updated;
}

export function clearLogs(): void {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to clear logs:', err);
  }
}
