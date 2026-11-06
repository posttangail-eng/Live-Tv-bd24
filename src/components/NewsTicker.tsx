import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { LIVE_NEWS_TICKER, NewsTickerItem } from '../data/newsTicker';

export const NewsTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update Bengali clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Bengali locale
      try {
        const timeStr = now.toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setCurrentTime(timeStr);
      } catch {
        setCurrentTime(now.toLocaleTimeString());
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto rotate news ticker
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_NEWS_TICKER.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = LIVE_NEWS_TICKER[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + LIVE_NEWS_TICKER.length) % LIVE_NEWS_TICKER.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % LIVE_NEWS_TICKER.length);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-200 border-y border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Badge: Live Ticker Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Bell className="w-3.5 h-3.5" />
            <span>সরাসরি সংবাদ আপডেট</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
        </div>

        {/* Center: Current News Item */}
        <div
          className="flex-1 overflow-hidden flex items-center gap-2.5 cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={handleNext}
        >
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
            {currentItem.category}
          </span>
          <p className="truncate font-medium text-slate-100 hover:text-emerald-400 transition-colors">
            {currentItem.text}
          </p>
          <span className="text-[11px] text-slate-500 hidden md:inline shrink-0">
            ({currentItem.time})
          </span>
        </div>

        {/* Right Controls: Prev, Pause, Next, Clock */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span>সময়:</span>
            <span className="text-emerald-400 font-semibold">{currentTime}</span>
          </div>

          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              onClick={handlePrev}
              title="আগের সংবাদ"
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              title={isPaused ? 'চালু করুন' : 'বিরতি দিন'}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={handleNext}
              title="পরবর্তী সংবাদ"
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
