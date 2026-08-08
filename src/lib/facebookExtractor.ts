import { MediaInfo, DownloadOption } from '../types';

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
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

export function createClientFacebookMediaInfo(rawUrl: string): MediaInfo {
  const url = rawUrl.trim();
  const lower = url.toLowerCase();
  const fbId = extractFacebookVideoId(url);
  
  const isReel = lower.includes('/reel/') || lower.includes('/reels/');
  const isWatch = lower.includes('/watch') || lower.includes('fb.watch');
  
  const mediaType = isReel ? 'Reel' : isWatch ? 'Watch Video' : 'Video Post';
  const title = `Facebook ${mediaType} [${fbId}]`;
  const platform: 'facebook' | 'reels' | 'watch' = isReel ? 'reels' : isWatch ? 'watch' : 'facebook';

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
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
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
