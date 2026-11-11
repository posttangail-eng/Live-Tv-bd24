import React, { useMemo } from 'react';
import { Search, Heart, Tv, Radio, Flame, Check, Sparkles } from 'lucide-react';
import { Channel, ChannelCategory } from '../types/tv';

interface ChannelListProps {
  channels: Channel[];
  activeChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  selectedCategory: ChannelCategory;
  onSelectCategory: (cat: ChannelCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORY_TABS: { id: ChannelCategory; label: string; count?: number }[] = [
  { id: 'all', label: 'সব চ্যানেল' },
  { id: 'news', label: 'সংবাদ' },
  { id: 'entertainment', label: 'বিনোদন ও নাটক' },
  { id: 'sports', label: 'খেলাধুলা' },
  { id: 'kids', label: 'শিশু ও কার্টুন' },
  { id: 'islamic', label: 'ইসলামিক' },
  { id: 'parliament', label: 'সংসদ ও জাতীয়' },
  { id: 'favorites', label: 'পছন্দের তালিকা' },
];

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  // Filter channels based on search and category
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(ch.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (ch.category !== selectedCategory) return false;
      }

      // Search filter (Bangla name, English name, category label, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = ch.name.toLowerCase().includes(query);
        const matchEn = ch.nameEn.toLowerCase().includes(query);
        const matchCategory = ch.categoryLabel.toLowerCase().includes(query);
        const matchDesc = ch.description.toLowerCase().includes(query);
        return matchName || matchEn || matchCategory || matchDesc;
      }

      return true;
    });
  }, [channels, selectedCategory, favorites, searchQuery]);

  return (
    <section className="w-full mt-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        
        {/* Interactive Filter Tabs (functional segmented buttons per §1.A) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            const count =
              tab.id === 'favorites'
                ? favorites.length
                : tab.id === 'all'
                ? channels.length
                : channels.filter((c) => c.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-emerald-700/60 text-white' : 'bg-slate-200 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bilingual Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="চ্যানেলের নাম লিখুন (যেমন: সময়, BTV)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Channel Grid */}
      {filteredChannels.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <Tv className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            কোনো চ্যানেল পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" সম্পর্কিত কোনো টিভি চ্যানেল পাওয়া যায়নি। অন্য বানান দিয়ে খুঁজুন।`
              : 'এই ক্যাটাগরিতে কোনো চ্যানেল যুক্ত করা নেই।'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              সব চ্যানেল দেখুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {filteredChannels.map((channel, idx) => {
            const isActive = activeChannel.id === channel.id;
            const isFav = favorites.includes(channel.id);
            const currentShow = channel.programs?.[0]?.title || 'সরাসরি সম্প্রচার';

            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-emerald-950/20 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Header inside Card: Channel Icon & Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                        channel.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {channel.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                          {channel.name}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {channel.nameEn}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    title={isFav ? 'পছন্দ থেকে সরান' : 'পছন্দে যোগ করুন'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform active:scale-125 ${
                        isFav ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Metadata: Unboxed text with typographic separator per Section 1.A */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {channel.categoryLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    {channel.resolution || '1080p FHD'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    চ্যানেল #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Program teaser */}
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                    চলমান অনুষ্ঠান
                  </span>
                  <p className="font-medium truncate text-slate-800 dark:text-slate-200">
                    {currentShow}
                  </p>
                </div>

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>বর্তমানে সম্প্রচারিত হচ্ছে</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
