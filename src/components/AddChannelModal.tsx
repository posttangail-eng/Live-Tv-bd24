import React, { useState } from 'react';
import { X, Plus, Tv, Link as LinkIcon, AlertCircle, Check } from 'lucide-react';
import { Channel } from '../types/tv';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Channel) => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<'news' | 'entertainment' | 'sports' | 'kids' | 'islamic' | 'parliament'>('news');
  const [streamType, setStreamType] = useState<'youtube' | 'hls'>('youtube');
  const [urlOrId, setUrlOrId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract YouTube ID if full URL is pasted
  const extractYoutubeId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('youtube.com/watch?v=') || trimmed.includes('youtube.com/live/')) {
      const match = trimmed.match(/(?:v=|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : trimmed;
    }
    if (trimmed.includes('youtu.be/')) {
      const match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('দয়া করে চ্যানেলের বাংলা নাম লিখুন।');
      return;
    }

    if (!urlOrId.trim()) {
      setError('দয়া করে স্ট্রিম লিংক বা ভিডিও আইডি প্রদান করুন।');
      return;
    }

    const processedIdOrUrl = streamType === 'youtube' ? extractYoutubeId(urlOrId) : urlOrId.trim();

    const categoryLabels: Record<string, string> = {
      news: 'সংবাদ',
      entertainment: 'বিনোদন ও নাটক',
      sports: 'খেলাধুলা',
      kids: 'শিশু ও কার্টুন',
      islamic: 'ইসলামিক',
      parliament: 'সংসদ ও জাতীয়',
    };

    const newChannel: Channel = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      category,
      categoryLabel: categoryLabels[category] || 'কাস্টম',
      streamType,
      youtubeId: streamType === 'youtube' ? processedIdOrUrl : undefined,
      hlsUrl: streamType === 'hls' ? processedIdOrUrl : undefined,
      badgeColor: 'bg-emerald-700',
      resolution: '1080p FHD',
      description: 'ব্যবহারকারীর যুক্ত করা নিজস্ব সরাসরি সম্প্রচার চ্যানেল।',
      isCustom: true,
      programs: [
        {
          id: 'custom-p1',
          startTime: '00:00',
          endTime: '23:59',
          title: '২৪ ঘণ্টা নিরবচ্ছিন্ন সম্প্রচার',
          titleEn: '24/7 Live Stream',
        },
      ],
    };

    onAddChannel(newChannel);
    setName('');
    setNameEn('');
    setUrlOrId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নতুন টিভি চ্যানেল যুক্ত করুন
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                যেকোনো লাইভ ইউটিউব স্ট্রিম বা HLS (.m3u8) লিংক সরাসরি প্লে করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              চ্যানেলের নাম (বাংলা) *
            </label>
            <input
              type="text"
              placeholder="যেমন: চ্যানেল ৭১ অথবা মাই টিভি"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ইংরেজি নাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="e.g. My TV Live"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="news">সংবাদ</option>
                <option value="entertainment">বিনোদন ও নাটক</option>
                <option value="sports">খেলাধুলা</option>
                <option value="kids">শিশু ও কার্টুন</option>
                <option value="islamic">ইসলামিক</option>
                <option value="parliament">সংসদ ও জাতীয়</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                স্ট্রিম ফরম্যাট
              </label>
              <select
                value={streamType}
                onChange={(e) => setStreamType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="youtube">ইউটিউব লাইভ (YouTube)</option>
                <option value="hls">আইপিটিভি স্ট্রিম (.m3u8 HLS)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {streamType === 'youtube'
                ? 'ইউটিউব লাইভ লিঙ্ক বা ভিডিও আইডি *'
                : 'HLS (.m3u8) স্ট্রিমিং URL *'}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  streamType === 'youtube'
                    ? 'https://youtube.com/watch?v=... অথবা ভিডিও আইডি'
                    : 'https://example.com/live/stream.m3u8'
                }
                value={urlOrId}
                onChange={(e) => setUrlOrId(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {streamType === 'youtube'
                ? 'ইউটিউব লাইভ চ্যানেলের যেকোনো ভিডিও লিংক সরাসরি পেস্ট করতে পারেন।'
                : 'ইন্টারনেট প্রোভাইডারের m3u8 আইপিটিভি লিঙ্ক সমর্থন করে।'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>চ্যানেল যোগ করুন</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
