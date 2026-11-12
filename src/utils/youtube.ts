/**
 * Extracts a YouTube Video ID from any input format:
 * - https://www.youtube.com/live/VIDEO_ID?si=...
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - <iframe ... src="...embed/VIDEO_ID" ...>
 * - Raw 11-character video ID
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID like 'V9mlD6ZQCfk' or 'JR1eu1XmU9c'
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check for iframe src
  const iframeMatch = trimmed.match(/src=["'](https?:\/\/[^"']+)["']/i);
  const targetUrl = iframeMatch ? iframeMatch[1] : trimmed;

  // Patterns for youtube live, watch, short links, embed
  const patterns = [
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = targetUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback: look for any 11-char sequence in the URL
  const broadMatch = targetUrl.match(/([a-zA-Z0-9_-]{11})/);
  if (broadMatch && broadMatch[1] && broadMatch[1] !== 'youtube.com') {
    return broadMatch[1];
  }

  return null;
}
