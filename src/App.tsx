import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { ChannelList } from './components/ChannelList';
import { ProgramGuide } from './components/ProgramGuide';
import { VirtualRemote } from './components/VirtualRemote';
import { AddChannelModal } from './components/AddChannelModal';
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
  ExternalLink
} from 'lucide-react';

const STORAGE_FAVORITES_KEY = 'bd_live_tv_favorites_v1';
const STORAGE_CUSTOM_CHANNELS_KEY = 'bd_live_tv_custom_v1';
const STORAGE_THEME_KEY = 'bd_live_tv_theme_v1';

export default function App() {
  // Theme state: default dark for television cinema viewing
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Channels state (Default + Custom added by user)
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_CHANNELS_KEY);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        return [...BD_CHANNELS, ...parsed];
      }
    } catch (e) {
      console.error('Failed to parse custom channels', e);
    }
    return BD_CHANNELS;
  });

  // Active channel
  const [activeChannel, setActiveChannel] = useState<Channel>(BD_CHANNELS[0]);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['jamuna-tv', 'somoy-tv', 'btv-national', 't-sports'];
    } catch {
      return ['jamuna-tv', 'somoy-tv', 'btv-national', 't-sports'];
    }
  });

  // Recently watched history (IDs)
  const [recentChannels, setRecentChannels] = useState<string[]>(['jamuna-tv', 'somoy-tv', 'btv-national']);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & UI States
  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(false);
  const [isEpgOpen, setIsEpgOpen] = useState<boolean>(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState<boolean>(false);
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

  // Add custom channel
  const handleAddChannel = (newChannel: Channel) => {
    setChannels((prev) => {
      const updated = [newChannel, ...prev];
      const customOnly = updated.filter((c) => c.isCustom);
      localStorage.setItem(STORAGE_CUSTOM_CHANNELS_KEY, JSON.stringify(customOnly));
      return updated;
    });
    handleSelectChannel(newChannel);
  };

  // Channel objects for recently watched
  const recentChannelObjects = useMemo(() => {
    return recentChannels
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is Channel => Boolean(c));
  }, [recentChannels, channels]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header conforming to Section 2 Top Bar Contract */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenRemote={() => setIsRemoteOpen(true)}
        onOpenAddChannel={() => setIsAddChannelOpen(true)}
        onOpenEpg={() => setIsEpgOpen(true)}
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
            onOpenEpg={() => setIsEpgOpen(true)}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode((prev) => !prev)}
          />

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
                onClick={() => setIsEpgOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>অনুষ্ঠান সূচি</span>
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
          onOpenEpgForChannel={(ch) => {
            setActiveChannel(ch);
            setIsEpgOpen(true);
          }}
        />

      </main>

      {/* Program Guide Modal */}
      <ProgramGuide
        isOpen={isEpgOpen}
        onClose={() => setIsEpgOpen(false)}
        channels={channels}
        selectedChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
      />

      {/* Smart TV Remote Control Modal */}
      <VirtualRemote
        isOpen={isRemoteOpen}
        onClose={() => setIsRemoteOpen(false)}
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
        onNextChannel={handleNextChannel}
        onPrevChannel={handlePrevChannel}
        onOpenEpg={() => setIsEpgOpen(true)}
      />

      {/* Add Custom Channel Modal */}
      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        onAddChannel={handleAddChannel}
      />

      {/* Quiet, Clean Footer */}
      <footer className="mt-12 py-8 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">বাংলাদেশ লাইভ টিভি (BD Live TV)</span>
            <span>·</span>
            <span>সর্বমোট {channels.length} টি চ্যানেল সম্প্রচারিত</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>নিরবচ্ছিন্ন এইচডি সম্প্রচার</span>
            </span>
            <span>·</span>
            <button
              onClick={() => setIsAddChannelOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              কাস্টম চ্যানেল যোগ
            </button>
            <span>·</span>
            <button
              onClick={() => setIsEpgOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              অনুষ্ঠান সূচি
            </button>
          </div>

          <div className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} সকল স্যাটেলাইট টিভি চ্যানেলের স্বত্ব নিজ নিজ কর্তৃপক্ষের সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
