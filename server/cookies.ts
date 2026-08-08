import fs from 'fs';
import path from 'path';
import { PlatformSessionStatus, PlatformType } from '../src/types.js';

const COOKIES_DIR = path.join(process.cwd(), 'data', 'cookies');

if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
}

export const SUPPORTED_PLATFORMS: Array<{ id: PlatformType; name: string }> = [
  { id: 'facebook', name: 'Facebook Videos' },
  { id: 'reels', name: 'Facebook Reels' },
  { id: 'watch', name: 'Facebook Watch' },
  { id: 'generic', name: 'FB Private / Shared' },
];

export function getPlatformCookieFilePath(platform: PlatformType): string {
  const safeName = platform.replace(/[^\w]/g, '');
  return path.join(COOKIES_DIR, `${safeName}.txt`);
}

export function getPlatformSessionStatus(platform: PlatformType): PlatformSessionStatus {
  const filePath = getPlatformCookieFilePath(platform);
  const platformInfo = SUPPORTED_PLATFORMS.find(p => p.id === platform) || { id: platform, name: platform };

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      return {
        platform,
        platformName: platformInfo.name,
        enabled: true,
        hasCookies: stats.size > 0,
        updatedAt: stats.mtime.toISOString(),
        cookieSize: stats.size,
      };
    } catch (e) {
      // Fallback
    }
  }

  return {
    platform,
    platformName: platformInfo.name,
    enabled: false,
    hasCookies: false,
  };
}

export function getAllPlatformSessionStatuses(): PlatformSessionStatus[] {
  return SUPPORTED_PLATFORMS.map(p => getPlatformSessionStatus(p.id));
}

export function savePlatformCookies(platform: PlatformType, cookieText: string): PlatformSessionStatus {
  const filePath = getPlatformCookieFilePath(platform);
  fs.writeFileSync(filePath, cookieText.trim(), 'utf-8');
  return getPlatformSessionStatus(platform);
}

export function clearPlatformCookies(platform: PlatformType): PlatformSessionStatus {
  const filePath = getPlatformCookieFilePath(platform);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error(`Error deleting cookies for ${platform}:`, e);
    }
  }
  return getPlatformSessionStatus(platform);
}

export function getValidCookiePathForPlatform(platform: PlatformType): string | null {
  const status = getPlatformSessionStatus(platform);
  if (status.enabled && status.hasCookies) {
    const filePath = getPlatformCookieFilePath(platform);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}
