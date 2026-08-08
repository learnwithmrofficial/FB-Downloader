import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BIN_DIR = process.cwd();
export const YTDLP_PATH = path.join(BIN_DIR, 'yt-dlp');

export function ensureYtDlpInstalled(): string {
  if (fs.existsSync(YTDLP_PATH)) {
    return YTDLP_PATH;
  }

  console.log('[yt-dlp] Binary not found, downloading latest release...');
  try {
    execSync(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o "${YTDLP_PATH}"`, { stdio: 'inherit' });
    execSync(`chmod +x "${YTDLP_PATH}"`, { stdio: 'inherit' });
    console.log('[yt-dlp] Installed successfully at:', YTDLP_PATH);
  } catch (err) {
    console.error('[yt-dlp] Download failed:', err);
  }
  return YTDLP_PATH;
}

export function getYtDlpDefaultArgs(): string[] {
  const args = [
    '--no-colors',
    '--no-warnings',
    '--extractor-args',
    'youtube:player_client=android,mweb,web',
  ];
  
  // Node js runtime if node exists
  if (fs.existsSync('/usr/local/bin/node')) {
    args.push('--js-runtimes', 'node:/usr/local/bin/node');
  } else if (fs.existsSync('/usr/bin/node')) {
    args.push('--js-runtimes', 'node:/usr/bin/node');
  }

  // FFmpeg location
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    args.push('--ffmpeg-location', '/usr/bin/ffmpeg');
  }

  return args;
}
