import React from 'react';
import { Tv, Radio, Moon, Sun, Smartphone } from 'lucide-react';
import { ChannelCategory } from '../types/tv';

interface HeaderProps {
  currentCategory: ChannelCategory;
  onSelectCategory: (cat: ChannelCategory) => void;
  onOpenRemote: () => void;
  onOpenEpg: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenRemote,
  onOpenEpg,
  isDarkMode,
  onToggleTheme,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-tight whitespace-nowrap">
              বাংলাদেশ লাইভ টিভি
            </span>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              BD Live TV Stream
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectCategory('all')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentCategory === 'all' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            সব চ্যানেল
          </button>
          <button
            onClick={() => onSelectCategory('news')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentCategory === 'news' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            সংবাদ
          </button>
          <button
            onClick={() => onSelectCategory('entertainment')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentCategory === 'entertainment' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            বিনোদন ও নাটক
          </button>
          <button
            onClick={() => onSelectCategory('sports')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentCategory === 'sports' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            খেলাধুলা
          </button>
          <button
            onClick={onOpenEpg}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            অনুষ্ঠান সূচি
          </button>
          {favoriteCount > 0 && (
            <button
              onClick={() => onSelectCategory('favorites')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                currentCategory === 'favorites' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              পছন্দের ({favoriteCount})
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenRemote}
            title="ভার্চুয়াল টিভি রিমোট কন্ট্রোল"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">টিভি রিমোট</span>
          </button>

          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'লাইট মোড অন করুন' : 'ডার্ক মোড অন করুন'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

      </div>
    </header>
  );
};
