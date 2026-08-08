import { MediaInfo, DownloadOption, PlatformType } from '../types';

export function extractYouTubeId(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch (e) {
    return null;
  }
}

export function extractFacebookVideoId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get('v')) {
      return parsed.searchParams.get('v')!;
    }
    const match = url.match(/(?:reel|reels|videos|watch|story_fbid|posts)\/([0-9]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    // ignore
  }
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString();
}

export function createClientFacebookMediaInfo(rawUrl: string): MediaInfo {
  const url = rawUrl.trim();
  const lower = url.toLowerCase();
  
  const ytId = extractYouTubeId(url);
  if (ytId) {
    const title = `YouTube Video [${ytId}]`;
    const downloadOptions: DownloadOption[] = [
      {
        qualityLabel: '1080p Full HD (MP4)',
        resolution: '1080p',
        format: 'MP4',
        sizeMB: 48.5,
        hasAudio: true,
        downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=1080p&url=${encodeURIComponent(url)}`
      },
      {
        qualityLabel: '720p HD (MP4)',
        resolution: '720p',
        format: 'MP4',
        sizeMB: 28.2,
        hasAudio: true,
        downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=720p&url=${encodeURIComponent(url)}`
      },
      {
        qualityLabel: '480p Standard SD (MP4)',
        resolution: '480p',
        format: 'MP4',
        sizeMB: 15.4,
        hasAudio: true,
        downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=480p&url=${encodeURIComponent(url)}`
      },
      {
        qualityLabel: 'MP3 Audio (320kbps High Quality)',
        resolution: 'Audio',
        format: 'MP3',
        sizeMB: 8.5,
        hasAudio: true,
        downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP3&resolution=Audio&url=${encodeURIComponent(url)}`
      }
    ];

    return {
      id: ytId,
      url: url,
      title: title,
      uploader: 'YouTube Channel',
      duration: 240,
      durationFormatted: '4:00',
      thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      platform: 'youtube',
      availableResolutions: ['1080p', '720p', '480p', 'Audio'],
      fileSizeEstimates: {
        '1080p': 48.5,
        '720p': 28.2,
        '480p': 15.4,
        'Audio': 8.5
      },
      defaultResolution: '1080p',
      downloadOptions: downloadOptions,
      subtitlesAvailable: [],
      isPlaylist: false
    };
  }

  const fbId = extractFacebookVideoId(url);
  const isReel = lower.includes('/reel/') || lower.includes('/reels/');
  const isWatch = lower.includes('/watch') || lower.includes('fb.watch');
  
  const mediaType = isReel ? 'Reel' : isWatch ? 'Watch Video' : 'Video Post';
  const title = `Facebook ${mediaType} [${fbId}]`;
  const platform: PlatformType = isReel ? 'reels' : isWatch ? 'watch' : 'facebook';

  const downloadOptions: DownloadOption[] = [
    {
      qualityLabel: '1080p Full HD (MP4)',
      resolution: '1080p',
      format: 'MP4',
      sizeMB: 38.5,
      hasAudio: true,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=1080p&url=${encodeURIComponent(url)}`
    },
    {
      qualityLabel: '720p HD (MP4)',
      resolution: '720p',
      format: 'MP4',
      sizeMB: 22.4,
      hasAudio: true,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=720p&url=${encodeURIComponent(url)}`
    },
    {
      qualityLabel: '480p Standard SD (MP4)',
      resolution: '480p',
      format: 'MP4',
      sizeMB: 12.8,
      hasAudio: true,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=480p&url=${encodeURIComponent(url)}`
    },
    {
      qualityLabel: '360p Mobile SD (MP4)',
      resolution: '360p',
      format: 'MP4',
      sizeMB: 7.2,
      hasAudio: true,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP4&resolution=360p&url=${encodeURIComponent(url)}`
    },
    {
      qualityLabel: 'MP3 Audio (320kbps High Quality)',
      resolution: 'Audio',
      format: 'MP3',
      sizeMB: 5.4,
      hasAudio: true,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(title)}&format=MP3&resolution=Audio&url=${encodeURIComponent(url)}`
    }
  ];

  return {
    id: fbId,
    url: url,
    title: title,
    uploader: 'Facebook Video Creator',
    duration: 180,
    durationFormatted: '3:00',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
    platform: platform,
    availableResolutions: ['1080p', '720p', '480p', '360p', 'Audio'],
    fileSizeEstimates: {
      '1080p': 38.5,
      '720p': 22.4,
      '480p': 12.8,
      '360p': 7.2,
      'Audio': 5.4
    },
    defaultResolution: '1080p',
    downloadOptions: downloadOptions,
    subtitlesAvailable: [],
    isPlaylist: false
  };
}

export async function createClientFacebookMediaInfoAsync(rawUrl: string): Promise<MediaInfo> {
  const url = rawUrl.trim();
  const base = createClientFacebookMediaInfo(url);

  // 1. YouTube oEmbed API Integration
  const ytId = extractYouTubeId(url);
  if (ytId) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.title) base.title = data.title;
        if (data.author_name) base.uploader = data.author_name;
        // High quality YouTube thumbnail
        base.thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      }
    } catch (e) {
      // Keep YouTube fallback
    }

    // Update download options with resolved title
    base.downloadOptions = base.downloadOptions.map((opt) => ({
      ...opt,
      downloadUrl: `/api/file/download?title=${encodeURIComponent(base.title)}&format=${opt.format}&resolution=${opt.resolution}&url=${encodeURIComponent(url)}`
    }));

    return base;
  }

  // 2. Facebook / Reels / Watch OpenGraph Scraping via CORS Proxies
  try {
    const targetUrl = encodeURIComponent(
      url
        .replace('web.facebook.com', 'www.facebook.com')
        .replace('m.facebook.com', 'www.facebook.com')
        .replace('fb.watch', 'www.facebook.com/watch')
    );

    // Try allorigins proxy
    let html = '';
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        html = await res.text();
      }
    } catch (e) {
      // proxy 1 failed
    }

    // Fallback proxy: codetabs
    if (!html) {
      try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          html = await res.text();
        }
      } catch (e) {
        // proxy 2 failed
      }
    }

    if (html) {
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);

      if (ogTitleMatch && ogTitleMatch[1]) {
        let rawTitle = ogTitleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
          .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
          .trim();

        if (rawTitle) {
          const parts = rawTitle.split('|').map((p) => p.trim());
          if (parts.length >= 2) {
            if (/views|reactions|likes|comments/i.test(parts[0])) {
              parts.shift();
            }
            if (parts.length > 1) {
              base.uploader = parts.pop()!;
            }
            base.title = parts.join(' - ');
          } else {
            base.title = rawTitle;
          }
        }
      }

      if (ogImageMatch && ogImageMatch[1]) {
        base.thumbnail = ogImageMatch[1].replace(/&amp;/g, '&').trim();
      }
    }
  } catch (e) {
    // Keep deterministic fallback
  }

  // Update download options with resolved title
  base.downloadOptions = base.downloadOptions.map((opt) => ({
    ...opt,
    downloadUrl: `/api/file/download?title=${encodeURIComponent(base.title)}&format=${opt.format}&resolution=${opt.resolution}&url=${encodeURIComponent(url)}`
  }));

  return base;
}


