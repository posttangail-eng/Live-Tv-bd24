import React, { useState } from 'react';
import { X, Clock, Play, Radio, Calendar, CheckCircle } from 'lucide-react';
import { Channel } from '../types/tv';

interface ProgramGuideProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  selectedChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
}

export const ProgramGuide: React.FC<ProgramGuideProps> = ({
  isOpen,
  onClose,
  channels,
  selectedChannel,
  onSelectChannel,
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string>(selectedChannel.id);

  if (!isOpen) return null;

  const currentChannel = channels.find((c) => c.id === activeChannelId) || selectedChannel;
  const programs = currentChannel.programs || [];

  // Determine current active program based on time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>আজকের অনুষ্ঠান সূচি (EPG Guide)</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ২৪ ঘণ্টার লাইভ শিডিউল
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বাংলাদেশের সব টিভি চ্যানেলের প্রতিদিনের নিয়মিত সম্প্রচার তালিকা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannelId(ch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                activeChannelId === ch.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Program Schedule Timeline */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentChannel.name} ({currentChannel.nameEn})
              </span>
              <span className="text-xs text-slate-500">· {currentChannel.categoryLabel}</span>
            </div>

            <button
              onClick={() => {
                onSelectChannel(currentChannel);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>এই চ্যানেলে যান</span>
            </button>
          </div>

          {programs.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-500">
              এই চ্যানেলের অনুষ্ঠান সূচি লোড করা সম্ভব হয়নি।
            </p>
          ) : (
            <div className="space-y-2.5">
              {programs.map((prog, index) => {
                const [sh, sm] = prog.startTime.split(':').map(Number);
                const [eh, em] = prog.endTime.split(':').map(Number);
                const startMin = sh * 60 + sm;
                let endMin = eh * 60 + em;
                if (endMin < startMin) endMin += 24 * 60;

                let checkMin = currentMinutes;
                if (checkMin < startMin && endMin > 24 * 60) checkMin += 24 * 60;

                const isCurrentlyAiring = checkMin >= startMin && checkMin < endMin;

                return (
                  <div
                    key={prog.id || index}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentlyAiring
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {prog.title}
                          </span>
                          {isCurrentlyAiring && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              বর্তমানে চলছে
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {prog.titleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {prog.startTime} - {prog.endTime}
                      </div>

                      {isCurrentlyAiring && (
                        <button
                          onClick={() => {
                            onSelectChannel(currentChannel);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>দেখুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>অনুষ্ঠান সূচি বাংলাদেশ স্ট্যান্ডার্ড সময় (BST, UTC+6) অনুযায়ী প্রস্তুত।</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
