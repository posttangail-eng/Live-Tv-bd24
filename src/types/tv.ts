export type ChannelCategory =
  | 'all'
  | 'news'
  | 'entertainment'
  | 'sports'
  | 'kids'
  | 'islamic'
  | 'parliament'
  | 'favorites';

export interface ProgramItem {
  id: string;
  title: string;
  titleEn: string;
  startTime: string; // "14:00"
  endTime: string;   // "15:00"
  description?: string;
  category?: string;
  progressPercent?: number;
}

export interface Channel {
  id: string;
  name: string;
  nameEn: string;
  category: 'news' | 'entertainment' | 'sports' | 'kids' | 'islamic' | 'parliament';
  categoryLabel: string;
  streamType: 'youtube' | 'hls' | 'web' | 'custom';
  youtubeId?: string; // YouTube Live video ID or embed
  youtubeChannelId?: string;
  youtubeLiveUrl?: string; // Direct link to channel live page (e.g. https://youtube.com/@TSportsbd/live)
  hlsUrl?: string;    // Direct m3u8 link
  alternativeHlsUrl?: string;
  websiteUrl?: string;
  webLiveUrl?: string; // Official web live stream portal (e.g. somoynews.com.bd/live-tv)
  logoUrl?: string;
  badgeColor?: string;
  resolution?: string; // "1080p FHD" | "720p HD"
  description: string;
  programs: ProgramItem[];
  isCustom?: boolean;
}

export interface CustomChannelInput {
  name: string;
  nameEn: string;
  category: 'news' | 'entertainment' | 'sports' | 'kids' | 'islamic' | 'parliament';
  streamType: 'youtube' | 'hls';
  urlOrId: string;
}
