import React, { useState } from 'react';
import {
  X,
  Power,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Radio,
  Tv,
  RotateCw,
  Search
} from 'lucide-react';
import { Channel } from '../types/tv';

interface VirtualRemoteProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  activeChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onOpenEpg: () => void;
}

export const VirtualRemote: React.FC<VirtualRemoteProps> = ({
  isOpen,
  onClose,
  channels,
  activeChannel,
  onSelectChannel,
  onNextChannel,
  onPrevChannel,
  onOpenEpg,
}) => {
  const [digitBuffer, setDigitBuffer] = useState<string>('');

  if (!isOpen) return null;

  const handleDigitPress = (num: number) => {
    const nextBuffer = (digitBuffer + num).slice(-2); // up to 2 digits
    setDigitBuffer(nextBuffer);

    const channelIndex = parseInt(nextBuffer, 10) - 1;
    if (channels[channelIndex]) {
      onSelectChannel(channels[channelIndex]);
      setTimeout(() => setDigitBuffer(''), 1500);
    }
  };

  const currentChannelIndex = channels.findIndex((c) => c.id === activeChannel.id) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-72 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-700/80 text-white flex flex-col items-center select-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Remote Header / Brand */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
            <Tv className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
            স্মার্ট টিভি রিমোট
          </span>
          {/* Channel Display */}
          <div className="mt-2 px-3 py-1 bg-black/80 rounded-lg border border-slate-800 font-mono text-center">
            <span className="text-[11px] text-slate-500">বর্তমান চ্যানেল: </span>
            <span className="text-emerald-400 font-bold text-sm">
              #{String(currentChannelIndex).padStart(2, '0')}
            </span>
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
              {activeChannel.name}
            </p>
          </div>
        </div>

        {/* Top Control Bar: Power, EPG, Fullscreen */}
        <div className="w-full flex items-center justify-around gap-2 mb-4 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              // Quick jump to first channel
              if (channels[0]) onSelectChannel(channels[0]);
            }}
            title="চ্যানেল ১-এ যান"
            className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white shadow-lg transition-transform active:scale-95"
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEpg();
            }}
            title="অনুষ্ঠান সূচি"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-transform active:scale-95"
          >
            <Radio className="w-4 h-4" />
          </button>
        </div>

        {/* D-Pad Navigation */}
        <div className="relative w-36 h-36 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 shadow-inner">
          {/* Up */}
          <button
            onClick={onPrevChannel}
            title="আগের চ্যানেল"
            className="absolute top-1 p-2 text-slate-300 hover:text-emerald-400 transition-transform active:scale-90"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          {/* Down */}
          <button
            onClick={onNextChannel}
            title="পরের চ্যানেল"
            className="absolute bottom-1 p-2 text-slate-300 hover:text-emerald-400 transition-transform active:scale-90"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          {/* Left */}
          <button
            onClick={onPrevChannel}
            title="পূর্ববর্তী"
            className="absolute left-1 p-2 text-slate-300 hover:text-emerald-400 transition-transform active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {/* Right */}
          <button
            onClick={onNextChannel}
            title="পরবর্তী"
            className="absolute right-1 p-2 text-slate-300 hover:text-emerald-400 transition-transform active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          {/* OK Center */}
          <button
            onClick={() => {
              // Flash channel name or re-select
              onSelectChannel(activeChannel);
            }}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md hover:bg-emerald-500 transition-transform active:scale-95"
          >
            OK
          </button>
        </div>

        {/* Rocker: CH +/- and VOL +/- */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col items-center bg-slate-800/50 rounded-2xl p-2 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">চ্যানেল</span>
            <div className="flex flex-col gap-1 w-full">
              <button
                onClick={onNextChannel}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors"
              >
                CH +
              </button>
              <button
                onClick={onPrevChannel}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors"
              >
                CH -
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center bg-slate-800/50 rounded-2xl p-2 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">ক্যাটাগরি জাম্প</span>
            <div className="flex flex-col gap-1 w-full">
              <button
                onClick={() => {
                  const newsCh = channels.find((c) => c.category === 'news');
                  if (newsCh) onSelectChannel(newsCh);
                }}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold text-red-400 transition-colors"
              >
                সংবাদ
              </button>
              <button
                onClick={() => {
                  const sportsCh = channels.find((c) => c.category === 'sports');
                  if (sportsCh) onSelectChannel(sportsCh);
                }}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold text-emerald-400 transition-colors"
              >
                খেলা
              </button>
            </div>
          </div>
        </div>

        {/* Numeric Keypad (1 - 9, 0) */}
        <div className="w-full grid grid-cols-3 gap-2 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigitPress(num)}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-100 transition-transform active:scale-95 border border-slate-700/60"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setDigitBuffer('')}
            className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-400 transition-colors"
          >
            মুছুন
          </button>
          <button
            onClick={() => handleDigitPress(0)}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-100 transition-transform active:scale-95 border border-slate-700/60"
          >
            0
          </button>
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
          >
            সম্পন্ন
          </button>
        </div>

      </div>
    </div>
  );
};
