import React, { useRef, useEffect } from 'react';
import {
  Volume2,
  Clock,
  MessageSquare,
  PhoneCall,
  Send,
  Zap,
  Calendar,
  Bell,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Eye,
  IndianRupee,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Message, EmotionType } from '../types';

interface ChatViewProps {
  messages: Message[];
  onSpeakAgain: (text: string, lang?: string, emotion?: EmotionType) => void;
  onSendText: (text: string) => void;
  onQuickPrompt: (text: string) => void;
  isProcessing: boolean;
}

const quickPrompts = [
  { label: '👁️ Sabse Sasta Select Karo', text: 'isme se sabse sasta wala select karo' },
  { label: '💬 WhatsApp Mom', text: 'WhatsApp pe Mom ko bolo main late hoon' },
  { label: '💸 Send ₹500 to Rahul', text: 'Rahul ko ₹500 bhejo' },
  { label: '⏰ Subah 6 Baje Alarm', text: 'Subah 6:00 baje ka alarm laga do' },
  { label: '🔦 Flashlight On', text: 'Flashlight on kardo' },
  { label: '🔔 Notifications Padho', text: 'Mere recent notifications padh kar batao' },
  { label: '🌸 Kem cho Rani?', text: 'Kem cho Rani? Gujarati ma bolo tamaru divas kevu che?' },
  { label: '☕ Kaisi ho Rani?', text: 'Rani aap kaisi ho? Aaj thoda thak gaya hoon' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSpeakAgain,
  onSendText,
  onQuickPrompt,
  isProcessing,
}) => {
  const [inputText, setInputText] = React.useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const textToSend = inputText.trim();
    setInputText('');
    onSendText(textToSend);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  };

  const getEmotionBadge = (emotion?: EmotionType) => {
    if (!emotion) return null;
    switch (emotion) {
      case 'excited':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ✨ Excited
          </span>
        );
      case 'happy':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            😊 Happy
          </span>
        );
      case 'concerned':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            🤗 Caring
          </span>
        );
      case 'empathetic':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            💕 Empathetic
          </span>
        );
      case 'playful':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
            🌸 Playful
          </span>
        );
      case 'calm':
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            🕊️ Calm
          </span>
        );
      case 'caring':
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
            💕 Warm & Caring
          </span>
        );
    }
  };

  const renderActionCard = (action: Message['action']) => {
    if (!action) return null;

    switch (action.name) {
      case 'setAlarm':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600/30 text-purple-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Alarm Set: {action.args?.time || 'Scheduled'}
                </p>
                <p className="text-[11px] text-purple-300">
                  Label: {action.args?.label || 'Rani Reminder'} • Instant Low-Risk Execution
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>
        );

      case 'screenAction':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Eye className="w-4 h-4" />
                <span>Screen Vision (See + Act Executed)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/30">
                MediaProjection
              </span>
            </div>
            <p className="text-white font-medium">
              Target Tapped: <strong>{action.args?.targetText || 'Cheapest Item'}</strong>
            </p>
            <p className="text-[11px] text-slate-300">
              Rani visually analyzed screenshot with Gemini 3.8 Flash and tapped via AccessibilityService.
            </p>
          </div>
        );

      case 'sendWhatsAppMessage':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-600/30 text-emerald-300">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    WhatsApp to: {action.args?.recipient}
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    AccessibilityService: Simulated Auto-Typing & Tap
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                Dispatched
              </span>
            </div>
            <p className="mt-2 p-2 rounded-lg bg-slate-900/60 font-mono text-[11px] text-emerald-100 italic border border-emerald-500/20">
              "{action.args?.message}"
            </p>
          </div>
        );

      case 'makePhoneCall':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-between text-xs text-pink-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-pink-600/30 text-pink-300">
                <PhoneCall className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Calling: {action.args?.contactName}
                </p>
                <p className="text-[11px] text-pink-300">
                  {action.args?.phoneNumber || '+91 98765 43210'} • Intent.ACTION_CALL
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px]">
              Dialing...
            </span>
          </div>
        );

      case 'sendPayment':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>UPI Payment: ₹{action.args?.amount} to {action.args?.recipient}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                Smart Friction Confirmed
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Transaction verified and processed securely.
            </p>
          </div>
        );

      case 'deleteData':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Permanent Deletion Confirmed for: {action.args?.targetId}</span>
          </div>
        );

      case 'toggleDeviceSetting':
        return (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-200">
            <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-white capitalize">
                {action.args?.setting}: {action.args?.state ? 'Enabled ⚡' : 'Disabled 🌑'}
              </span>
              <p className="text-[10px] text-slate-400">Instant Execution (Zero Friction)</p>
            </div>
          </div>
        );

      case 'manageCalendar':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white">
                {action.args?.action === 'create' ? 'Calendar Event Scheduled' : 'Calendar Readout'}
              </span>
            </div>
            {action.args?.title && (
              <p className="mt-1 text-[11px] text-purple-200">
                📌 {action.args?.title} {action.args?.time ? `at ${action.args.time}` : ''}
              </p>
            )}
          </div>
        );

      case 'readNotifications':
        return (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-pink-500/30 text-xs">
            <div className="flex items-center gap-2 text-pink-300 font-semibold mb-1">
              <Bell className="w-4 h-4" />
              <span>NotificationListenerService Active</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Summarized recent device notifications via natural voice intonation.
            </p>
          </div>
        );

      case 'openApp':
        return (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-pink-500/20 flex items-center gap-2 text-xs text-pink-200">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span>
              Opening Android Application: <strong>{action.args?.appName}</strong>
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-pink-500/20 shadow-2xl overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-inner">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-medium text-base">Rani is Ready to Help!</h3>
              <p className="text-xs text-pink-200/80 max-w-xs mt-1">
                "Hey! Rani here, kaam bata do 💕"<br />
                Try Screen Vision: <em>"isme se sabse sasta wala select karo"</em>
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Bubble */}
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-lg transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 text-slate-100 border border-pink-500/25 rounded-tl-none'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'model' && (
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-pink-500/15">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🌸</span>
                    <span className="text-xs font-semibold text-pink-300">Rani</span>
                    {getEmotionBadge(msg.emotion)}
                    {msg.detectedLanguage && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-200 uppercase font-mono">
                        {msg.detectedLanguage.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onSpeakAgain(msg.content, msg.detectedLanguage, msg.emotion)}
                    className="p-1 hover:bg-pink-500/20 rounded-full text-pink-400 hover:text-pink-200 transition-colors cursor-pointer"
                    title="Speak again"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message content text */}
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* Action Result Card */}
              {renderActionCard(msg.action)}

              {/* Timestamp */}
              <span
                className={`text-[9px] mt-1.5 block opacity-70 ${
                  msg.role === 'user' ? 'text-pink-100 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs">
              🌸
            </div>
            <div className="bg-slate-900/90 border border-pink-500/20 rounded-2xl rounded-tl-none p-3 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span className="text-xs text-pink-200">Rani is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="shrink-0 px-3 py-2 bg-slate-900/80 border-t border-pink-500/15 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] text-pink-400/80 font-medium uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            Quick:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickPrompt(p.text)}
              className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-pink-600/30 border border-pink-500/20 hover:border-pink-500/50 text-[11px] text-slate-200 hover:text-white transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-3 bg-slate-950 border-t border-pink-500/20 flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type in Hindi, English, Gujarati... (e.g. 'sabse sasta select karo')"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck="false"
            enterKeyHint="send"
            className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 pr-8 rounded-xl border border-pink-500/25 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200 text-xs p-1"
              title="Clear text"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-pink-500/20 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
