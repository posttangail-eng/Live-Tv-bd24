import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { ChannelList } from './components/ChannelList';
import { VirtualRemote } from './components/VirtualRemote';
import { NewsTicker } from './components/NewsTicker';
import { BD_CHANNELS } from './data/channels';
import { Channel, ChannelCategory } from './types/tv';
import {
  Tv,
  Radio,
  Heart,
  History,
  Sparkles,
  Info,
  Sliders,
  Keyboard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Check
} from 'lucide-react';
import { extractYouTubeId } from './utils/youtube';

const STORAGE_FAVORITES_KEY = 'bd_live_tv_favorites_v1';
const STORAGE_CUSTOM_CHANNELS_KEY = 'bd_live_tv_custom_v1';
const STORAGE_THEME_KEY = 'bd_live_tv_theme_v1';
const STORAGE_OVERRIDES_KEY = 'bd_live_tv_overrides_v1';

export default function App() {
  // Theme state: default dark for television cinema viewing
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Channels state (Default + Custom + User Link Overrides)
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const savedOverrides = localStorage.getItem(STORAGE_OVERRIDES_KEY);
      const overrides: Record<string, Partial<Channel>> = savedOverrides ? JSON.parse(savedOverrides) : {};

      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_CHANNELS_KEY);
      const customChannels: Channel[] = savedCustom ? JSON.parse(savedCustom) : [];

      const baseList = [...BD_CHANNELS, ...customChannels];
      return baseList.map((ch) => {
        if (overrides[ch.id]) {
          return { ...ch, ...overrides[ch.id] };
        }
        return ch;
      });
    } catch (e) {
      console.error('Failed to parse channels or overrides', e);
      return BD_CHANNELS;
    }
  });

  // Active channel
  const [activeChannel, setActiveChannel] = useState<Channel>(() => {
    try {
      const savedOverrides = localStorage.getItem(STORAGE_OVERRIDES_KEY);
      const overrides: Record<string, Partial<Channel>> = savedOverrides ? JSON.parse(savedOverrides) : {};
      const first = BD_CHANNELS[0];
      return overrides[first.id] ? { ...first, ...overrides[first.id] } : first;
    } catch {
      return BD_CHANNELS[0];
    }
  });

  // Toast notification for user action
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['btv-national', 'somoy-tv', 'jamuna-tv', 't-sports'];
    } catch {
      return ['btv-national', 'somoy-tv', 'jamuna-tv', 't-sports'];
    }
  });

  // Recently watched history (IDs)
  const [recentChannels, setRecentChannels] = useState<string[]>(['btv-national', 'somoy-tv', 'jamuna-tv']);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & UI States
  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

  // Sync theme with HTML document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_THEME_KEY, String(isDarkMode));
  }, [isDarkMode]);

  // Toggle favorite
  const handleToggleFavorite = (channelId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Change channel & update recent history
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setRecentChannels((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 6);
    });
    // Scroll smoothly to player if on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Channel Next / Prev
  const handleNextChannel = () => {
    const currentIndex = channels.findIndex((c) => c.id === activeChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    handleSelectChannel(channels[nextIndex]);
  };

  const handlePrevChannel = () => {
    const currentIndex = channels.findIndex((c) => c.id === activeChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    handleSelectChannel(channels[prevIndex]);
  };

  // Update stream link for a channel (YouTube URL/code or HLS .m3u8)
  const handleUpdateChannelLink = (channelId: string, newLink: string) => {
    const trimmed = newLink.trim();
    if (!trimmed) return;

    const isHls = trimmed.toLowerCase().includes('.m3u8');
    let channelPatch: Partial<Channel>;

    if (isHls) {
      channelPatch = { streamType: 'hls', hlsUrl: trimmed };
    } else {
      const extractedYtId = extractYouTubeId(trimmed);
      channelPatch = {
        streamType: 'youtube',
        youtubeId: extractedYtId || trimmed,
      };
    }

    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, ...channelPatch } : c))
    );

    setActiveChannel((prev) => {
      if (prev.id === channelId) {
        return { ...prev, ...channelPatch };
      }
      return prev;
    });

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_OVERRIDES_KEY) || '{}');
      existing[channelId] = { ...(existing[channelId] || {}), ...channelPatch };
      localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Error saving channel link override', e);
    }

    setToastMessage(`লিংক সফলভাবে সংরক্ষিত হয়েছে! সম্প্রচার চালু হচ্ছে...`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Channel objects for recently watched
  const recentChannelObjects = useMemo(() => {
    return recentChannels
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is Channel => Boolean(c));
  }, [recentChannels, channels]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header conforming to Section 2 Top Bar Contract */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenRemote={() => setIsRemoteOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        favoriteCount={favorites.length}
      />

      {/* Live Breaking News Ticker */}
      <NewsTicker />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* TV Player Stage & Channel Information */}
        <div className={`mx-auto transition-all duration-300 ${isTheaterMode ? 'w-full' : 'max-w-5xl'}`}>
          <Player
            channel={activeChannel}
            isFavorite={favorites.includes(activeChannel.id)}
            onToggleFavorite={handleToggleFavorite}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode((prev) => !prev)}
            onUpdateChannelLink={handleUpdateChannelLink}
          />

          {/* Sports Broadcast Guidance Notice */}
          {activeChannel.category === 'sports' && (
            <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start sm:items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                <p className="leading-relaxed">
                  <strong className="text-amber-300 font-bold">খেলার লাইভ সম্প্রচার তথ্য:</strong> খেলাধুলার চ্যানেলগুলো শুধুমাত্র লাইভ ম্যাচ চলাকালীন সময়ে সরাসরি সম্প্রচার করে। আপনার কাছে আজকের লাইভ ম্যাচের ইউটিউব লিংক থাকলে উপরে <strong>"লিংক আপডেট"</strong> চাপুন অথবা সরাসরি <strong>"লাইভ হাব"</strong> খুলুন।
                </p>
              </div>
              {activeChannel.youtubeLiveUrl && (
                <a
                  href={activeChannel.youtubeLiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start sm:self-auto shadow-sm transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>লাইভ হাব খুলুন</span>
                </a>
              )}
            </div>
          )}

          {/* Quick Info & Quick Action Strip Below Player */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Channel Headline */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                  activeChannel.badgeColor || 'bg-slate-700'
                }`}
              >
                {activeChannel.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-wide">
                    {activeChannel.name}
                  </h1>
                  <span className="text-xs text-slate-400 font-medium">
                    · {activeChannel.nameEn}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 max-w-xl">
                  {activeChannel.description}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {activeChannel.webLiveUrl && (
                <a
                  href={activeChannel.webLiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>লাইভ টিভি পোর্টাল</span>
                </a>
              )}

              <button
                onClick={() => setIsRemoteOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                <span>টিভি রিমোট</span>
              </button>

              <button
                onClick={() => setShowKeyboardShortcuts((prev) => !prev)}
                title="কীবোর্ড শর্টকাট"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Keyboard Shortcuts Helper Drawer if toggled */}
          {showKeyboardShortcuts && (
            <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-medium">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">কীবোর্ড শর্টকাট:</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">↑ / P</kbd> আগের চ্যানেল</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">↓ / N</kbd> পরের চ্যানেল</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">Space</kbd> প্লে / পজ</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">F</kbd> ফুলস্ক্রিন</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">M</kbd> মিউট</span>
              </div>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-slate-400 hover:text-white text-xs ml-auto"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Recently Watched Channels Quick Shelf */}
        {recentChannelObjects.length > 1 && (
          <section className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>সম্প্রতি দেখা চ্যানেলসমূহ</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {recentChannelObjects.map((ch) => {
                const isActive = ch.id === activeChannel.id;
                return (
                  <button
                    key={`recent-${ch.id}`}
                    onClick={() => handleSelectChannel(ch)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      isActive
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] text-white font-bold ${
                        ch.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {ch.name.slice(0, 1)}
                    </div>
                    <span>{ch.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* All Channels Grid Directory */}
        <ChannelList
          channels={channels}
          activeChannel={activeChannel}
          onSelectChannel={handleSelectChannel}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

      </main>

      {/* Smart TV Remote Control Modal */}
      <VirtualRemote
        isOpen={isRemoteOpen}
        onClose={() => setIsRemoteOpen(false)}
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
        onNextChannel={handleNextChannel}
        onPrevChannel={handlePrevChannel}
      />

      {/* Quiet, Clean Footer */}
      <footer className="mt-12 py-8 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/file_000000006ba88211b87c74e501960b0f_676cae08.png"
              alt="বাংলাদেশ লাইভ টিভি"
              className="w-6 h-6 rounded-lg object-cover"
            />
            <span className="font-bold text-slate-200">বাংলাদেশ লাইভ টিভি (BD Live TV)</span>
            <span>·</span>
            <span>সর্বমোট {channels.length} টি চ্যানেল সম্প্রচারিত</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>নিরবচ্ছিন্ন এইচডি সম্প্রচার</span>
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} সর্বস্বত্ব <span className="text-slate-200 font-semibold">Rasel IT Tech</span> কর্তৃক সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
