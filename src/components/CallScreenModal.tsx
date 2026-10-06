import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Grid, Phone } from 'lucide-react';
import { ContactItem } from '../types';

interface CallScreenModalProps {
  contact: ContactItem | null;
  onEndCall: () => void;
}

export const CallScreenModal: React.FC<CallScreenModalProps> = ({ contact, onEndCall }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!contact) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [contact]);

  if (!contact) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-pink-500/30 p-6 flex flex-col items-center justify-between min-h-[480px] shadow-2xl text-white">
        {/* Top Info */}
        <div className="text-center space-y-2 mt-4">
          <span className="text-xs uppercase tracking-widest text-pink-300 font-medium">
            Rani Calling via Phone Intent
          </span>
          <h3 className="text-2xl font-bold">{contact.name}</h3>
          <p className="text-sm font-mono text-slate-400">{contact.phone}</p>
          <div className="inline-block px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono text-pink-300">
            {formatTime(seconds)}
          </div>
        </div>

        {/* Center Avatar with pulse rings */}
        <div className="relative my-6">
          <div className="absolute -inset-4 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-1 flex items-center justify-center shadow-xl shadow-pink-500/30">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl">
              {contact.avatar}
            </div>
          </div>
        </div>

        {/* In-Call Controls */}
        <div className="w-full space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[10px]">Mute</span>
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isSpeaker ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-[10px]">Speaker</span>
            </button>

            <a
              href={`tel:${contact.phone}`}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex flex-col items-center justify-center gap-1 transition-all"
              title="Launch Real Phone Dialer"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px]">Real Tel:</span>
            </a>
          </div>

          {/* End Call Button */}
          <div className="flex justify-center">
            <button
              onClick={onEndCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-600/40 text-white transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
