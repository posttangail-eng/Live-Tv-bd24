import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCw,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tv,
  ExternalLink,
  Info,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Channel } from '../types/tv';

interface PlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
  onNextChannel,
  onPrevChannel,
  isTheaterMode,
  onToggleTheater,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [useAlternativeStream, setUseAlternativeStream] = useState<boolean>(false);
  const [activeStreamType, setActiveStreamType] = useState<'hls' | 'youtube'>(
    channel.streamType === 'hls' ? 'hls' : 'youtube'
  );
  const controlsTimeoutRef = useRef<any>(null);

  // Sync active stream type whenever channel changes
  useEffect(() => {
    setActiveStreamType(channel.streamType === 'hls' ? 'hls' : 'youtube');
    setStreamError(null);
    setUseAlternativeStream(false);
    setIsPlaying(true);
  }, [channel.id]);

  // Handle HLS stream initialization
  useEffect(() => {
    if (activeStreamType !== 'hls') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const streamUrl = useAlternativeStream
      ? channel.alternativeHlsUrl || channel.hlsUrl
      : channel.hlsUrl;

    if (!streamUrl) {
      if (channel.youtubeId) {
        setActiveStreamType('youtube');
      } else {
        setStreamError('এই চ্যানেলের স্ট্রিমিং লিঙ্ক বর্তমানে উপলভ্য নয়।');
      }
      return;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamError(null);
        video.play().catch(() => {
          // Autoplay policy might require mute
          setIsMuted(true);
          video.muted = true;
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network error encountered, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media error encountered, recovering media...');
              hls.recoverMediaError();
              break;
            default:
              console.warn('HLS Fatal error:', data.details);
              hls.destroy();
              // Check if we can fallback to YouTube stream or alternative
              if (channel.youtubeId) {
                setActiveStreamType('youtube');
              } else {
                setStreamError('স্ট্রিম সংযোগে সমস্যা হচ্ছে। বিকল্প সার্ভার ব্যবহার করুন।');
              }
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari iOS / macOS HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        if (channel.youtubeId) {
          setActiveStreamType('youtube');
        } else {
          setStreamError('ভিডিও লোড হতে সমস্যা হচ্ছে।');
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, activeStreamType, useAlternativeStream]);

  // Volume & Mute synchronizer
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts (ArrowUp/Down for channels, Space for pause, F for fullscreen, M for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onPrevChannel();
      } else if (e.key === 'ArrowDown' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNextChannel();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevChannel, onNextChannel]);

  const togglePlayPause = () => {
    if (activeStreamType === 'hls' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  // Calculate current program from channel schedule
  const getCurrentProgram = () => {
    if (!channel.programs || channel.programs.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prog of channel.programs) {
      const [sh, sm] = prog.startTime.split(':').map(Number);
      const [eh, em] = prog.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      let endMin = eh * 60 + em;
      if (endMin < startMin) endMin += 24 * 60; // Crosses midnight

      let checkMin = currentMinutes;
      if (checkMin < startMin && endMin > 24 * 60) checkMin += 24 * 60;

      if (checkMin >= startMin && checkMin < endMin) {
        const total = endMin - startMin;
        const elapsed = checkMin - startMin;
        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
        return {
          ...prog,
          progressPercent,
        };
      }
    }
    return channel.programs[0];
  };

  const currentProgram = getCurrentProgram();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full overflow-hidden bg-black rounded-2xl shadow-2xl transition-all duration-300 border border-slate-800 ${
        isTheaterMode ? 'aspect-[21/9] max-h-[82vh]' : 'aspect-video'
      }`}
    >
      {/* Top Banner Overlay */}
      <div
        className={`absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-red-500 bg-red-950/70 px-2 py-0.5 rounded border border-red-800/60">
              সরাসরি (LIVE)
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {channel.name}
              </h2>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                ({channel.nameEn})
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                {channel.resolution || '1080p FHD'}
              </span>
            </div>
            {currentProgram && (
              <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-amber-400">অনুষ্ঠান: {currentProgram.title}</span>
                <span className="text-slate-400">({currentProgram.startTime} - {currentProgram.endTime})</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {channel.webLiveUrl && (
            <a
              href={channel.webLiveUrl}
              target="_blank"
              rel="noreferrer"
              title="অফিশিয়াল লাইভ টিভি পোর্টাল খুলুন"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লাইভ পোর্টাল</span>
            </a>
          )}

          <button
            onClick={() => onToggleFavorite(channel.id)}
            title={isFavorite ? 'পছন্দ তালিকা থেকে সরান' : 'পছন্দের তালিকায় যুক্ত করুন'}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-transform active:scale-95"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Video Surface: HLS Player or YouTube Iframe */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        {activeStreamType === 'hls' ? (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className="w-full h-full object-contain"
            onClick={togglePlayPause}
          />
        ) : (
          <div className="relative w-full h-full pointer-events-auto">
            {channel.youtubeId ? (
              <iframe
                title={channel.name}
                src={`https://www.youtube-nocookie.com/embed/${channel.youtubeId}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <Tv className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-semibold">কোনো সক্রিয় ভিডিও স্ট্রিম পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500 mt-1">দয়া করে অন্য চ্যানেল বা কাস্টম স্ট্রিম লিংক নির্বাচন করুন।</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error / Fallback Card if Stream encounters problem */}
      {streamError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <Info className="w-10 h-10 text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-white mb-1">সম্প্রচার সংযোগ সমস্যা</h3>
          <p className="text-xs text-slate-300 max-w-md mb-4">{streamError}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {channel.alternativeHlsUrl && (
              <button
                onClick={() => {
                  setUseAlternativeStream(!useAlternativeStream);
                  setStreamError(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>বিকল্প সার্ভার ২ চেষ্টা করুন</span>
              </button>
            )}

            {channel.youtubeId && activeStreamType !== 'youtube' && (
              <button
                onClick={() => {
                  setActiveStreamType('youtube');
                  setStreamError(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>ইউটিউব লাইভ স্ট্রিমে দেখুন</span>
              </button>
            )}

            {channel.websiteUrl && (
              <a
                href={channel.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>অফিশিয়াল ওয়েবসাইট</span>
              </a>
            )}

            <button
              onClick={() => {
                setStreamError(null);
                setActiveStreamType(channel.streamType === 'hls' ? 'hls' : 'youtube');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      )}

      {/* Bottom Control Bar Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Current Program Live Progress Bar */}
        {currentProgram && (
          <div className="w-full mb-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{currentProgram.title}</span>
              </span>
              <span>{currentProgram.startTime} - {currentProgram.endTime} ({currentProgram.progressPercent || 50}%)</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${currentProgram.progressPercent || 50}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Left Controls: Channel Prev/Next, Play/Pause, Volume */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800">
              <button
                onClick={onPrevChannel}
                title="পূর্ববর্তী চ্যানেল (Keyboard: ↑ বা P)"
                className="p-1.5 hover:bg-slate-800 text-slate-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayPause}
                title="প্লে / বিরতি (Keyboard: Space)"
                className="p-1.5 hover:bg-slate-800 text-emerald-400 rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={onNextChannel}
                title="পরবর্তী চ্যানেল (Keyboard: ↓ বা N)"
                className="p-1.5 hover:bg-slate-800 text-slate-200 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Volume & Mute */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                title="শব্দ চালু/বন্ধ (Keyboard: M)"
                className="text-slate-300 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-slate-700 accent-emerald-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Right Controls: Stream Selector, Theater, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Stream source toggle if multiple available */}
            {channel.youtubeId && channel.hlsUrl && (
              <button
                onClick={() =>
                  setActiveStreamType(activeStreamType === 'hls' ? 'youtube' : 'hls')
                }
                title="স্ট্রিমিং সোর্স পরিবর্তন করুন"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">
                  {activeStreamType === 'hls' ? 'HLS সার্ভার' : 'ইউটিউব লাইভ'}
                </span>
              </button>
            )}

            <button
              onClick={onToggleTheater}
              title={isTheaterMode ? 'স্বাভাবিক ভিউ' : 'থিয়েটার / ওয়াইডস্ক্রিন মোড'}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors hidden md:inline-flex"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              title="ফুল স্ক্রিন (Keyboard: F)"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
