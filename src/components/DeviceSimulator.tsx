import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Flashlight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Users,
  Calendar,
  Bell,
  MessageSquare,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
  Send,
  Zap,
  ShoppingBag,
  Eye,
  IndianRupee,
  ShieldAlert,
  BatteryCharging,
} from 'lucide-react';
import { DeviceState, AlarmItem, ContactItem, CalendarEventItem, NotificationItem } from '../types';
import { deviceService } from '../services/deviceService';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  rating: string;
  imageIcon: string;
  category: string;
}

interface DeviceSimulatorProps {
  deviceState: DeviceState;
  onUpdateDeviceState: (updated: Partial<DeviceState>) => void;
  onTriggerCall: (contact: ContactItem) => void;
  onTriggerWhatsAppAutomate?: (recipient: string, message: string) => void;
  onRaniSpeak: (text: string) => void;
  onTriggerVisionInspect?: (prompt?: string) => void;
  onTriggerPaymentConfirmation?: (recipient: string, amount: number) => void;
  onOpenBatteryGuide?: () => void;
  lastAccessibilityAction?: {
    app: string;
    action: string;
    details: string;
    recipient?: string;
    timestamp: number;
  } | null;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  deviceState,
  onUpdateDeviceState,
  onTriggerCall,
  onRaniSpeak,
  onTriggerVisionInspect,
  onTriggerPaymentConfirmation,
  onOpenBatteryGuide,
  lastAccessibilityAction,
}) => {
  const [activeTab, setActiveTab] = useState<
    'shopping' | 'whatsapp' | 'settings' | 'alarms' | 'contacts' | 'calendar' | 'notifications'
  >('shopping');
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Shopping / E-Commerce mock items for Screen Vision "sabse sasta wala select karo"
  const [products] = useState<ProductItem[]>([
    {
      id: 'prod_earbuds',
      name: 'True Wireless ANC Earbuds',
      price: 1499,
      rating: '4.8 ★ (1.2k)',
      imageIcon: '🎧',
      category: 'Electronics',
    },
    {
      id: 'prod_case',
      name: 'Ultra-Clear Silicon Phone Case',
      price: 199,
      rating: '4.6 ★ (4.8k)',
      imageIcon: '📱',
      category: 'Accessories',
    },
    {
      id: 'prod_shirt',
      name: 'Organic Cotton Crewneck T-Shirt',
      price: 399,
      rating: '4.5 ★ (920)',
      imageIcon: '👕',
      category: 'Fashion',
    },
    {
      id: 'prod_watch',
      name: 'Smart AMOLED Fitness Watch',
      price: 2499,
      rating: '4.9 ★ (2.1k)',
      imageIcon: '⌚',
      category: 'Wearables',
    },
    {
      id: 'prod_cable',
      name: 'Braided Fast-Charging USB-C Cable',
      price: 249,
      rating: '4.7 ★ (3.4k)',
      imageIcon: '🔌',
      category: 'Cables',
    },
  ]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [visionTapEffectId, setVisionTapEffectId] = useState<string | null>(null);

  // WhatsApp simulation state
  const [selectedChat, setSelectedChat] = useState<string>('Mom');
  const [chatMessages, setChatMessages] = useState<
    Record<string, Array<{ sender: 'them' | 'me'; text: string; time: string }>>
  >({
    Mom: [
      { sender: 'them', text: 'Beta, khana bana diya hai. Kab aaoge?', time: '12:10 PM' },
    ],
    Rahul: [
      { sender: 'them', text: 'Bhai evening coffee ka kya plan hai?', time: '11:45 AM' },
    ],
    Priya: [
      { sender: 'them', text: 'Did you review the slide deck?', time: '10:30 AM' },
    ],
  });
  const [manualInput, setManualInput] = useState('');
  const [accessibilityTypingAnim, setAccessibilityTypingAnim] = useState<string | null>(null);

  // Load initial device records
  useEffect(() => {
    setAlarms(deviceService.getAlarms());
    setContacts(deviceService.getContacts());
    setCalendarEvents(deviceService.getCalendarEvents());
    setNotifications(deviceService.getNotifications());
  }, []);

  // Listen to accessibility automation events from Rani
  useEffect(() => {
    if (!lastAccessibilityAction) return;

    if (lastAccessibilityAction.app === 'WhatsApp') {
      const targetRecipient =
        lastAccessibilityAction.recipient ||
        (lastAccessibilityAction.details.toLowerCase().includes('mom')
          ? 'Mom'
          : lastAccessibilityAction.details.toLowerCase().includes('rahul')
          ? 'Rahul'
          : lastAccessibilityAction.details.toLowerCase().includes('priya')
          ? 'Priya'
          : selectedChat);

      setSelectedChat(targetRecipient);
      setActiveTab('whatsapp');

      const textToType = lastAccessibilityAction.details;
      setAccessibilityTypingAnim(textToType);
      setManualInput('');

      let i = 0;
      const stepMs = Math.max(20, Math.min(60, 500 / Math.max(1, textToType.length)));
      const timer = setInterval(() => {
        i++;
        setManualInput(textToType.slice(0, i));
        if (i >= textToType.length) {
          clearInterval(timer);
          setTimeout(() => {
            setManualInput('');
            setAccessibilityTypingAnim(null);
            setChatMessages((prev) => ({
              ...prev,
              [targetRecipient]: [
                ...(prev[targetRecipient] || []),
                {
                  sender: 'me',
                  text: textToType,
                  time: 'Just now',
                },
              ],
            }));
          }, 350);
        }
      }, stepMs);

      return () => clearInterval(timer);
    } else if (
      lastAccessibilityAction.app === 'ScreenVision' ||
      lastAccessibilityAction.action === 'select_item' ||
      lastAccessibilityAction.details.toLowerCase().includes('phone case') ||
      lastAccessibilityAction.details.toLowerCase().includes('199')
    ) {
      // Rani selected the cheapest product visually!
      setActiveTab('shopping');
      setSelectedProductId('prod_case');
      setVisionTapEffectId('prod_case');
      setTimeout(() => {
        setVisionTapEffectId(null);
      }, 2500);
    }
  }, [lastAccessibilityAction]);

  // Flashlight toggle
  const handleToggleFlashlight = async () => {
    const res = await deviceService.toggleFlashlight(!deviceState.flashlight);
    onUpdateDeviceState({ flashlight: res.state });
  };

  // Music toggle
  const handleToggleMusic = () => {
    const playing = deviceService.toggleMusic(!deviceState.mediaPlaying);
    onUpdateDeviceState({
      mediaPlaying: playing,
      currentTrack: playing
        ? { title: 'Chill Indian Lo-Fi Beats', artist: 'Rani Assistant Music' }
        : undefined,
    });
  };

  // Send WhatsApp message manually
  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [
        ...(prev[selectedChat] || []),
        { sender: 'me', text: manualInput.trim(), time: 'Just now' },
      ],
    }));
    setManualInput('');
  };

  // Add mock notification
  const handleAddMockNotification = () => {
    const mockTitles = ['Mom (WhatsApp)', 'Swiggy', 'Calendar', 'Work Slack'];
    const mockTexts = [
      'Ghar aate waqt dahi le aana beta.',
      'Your order has been delivered at your doorstep!',
      'Upcoming: Team Sync in 15 mins',
      'Vikram: Can you share the latest build APK?',
    ];
    const rand = Math.floor(Math.random() * mockTitles.length);
    const added = deviceService.addMockNotification(
      mockTitles[rand].split(' ')[0],
      mockTitles[rand],
      mockTexts[rand]
    );
    setNotifications([added, ...notifications]);
    onRaniSpeak(`Naya notification aaya hai: ${added.title} se.`);
  };

  return (
    <div
      id="rani-device-phone-screen"
      className="flex flex-col h-full bg-slate-950 rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden text-slate-200"
    >
      {/* Simulated Android Status Bar */}
      <div className="bg-slate-900/90 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-pink-500/15 select-none font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {deviceState.alwaysListening24x7 ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Rani 24/7 Service</span>
            </span>
          ) : deviceState.foregroundServiceActive ? (
            <span className="flex items-center gap-1 text-[10px] text-pink-400 font-medium">
              <span>🌸</span>
              <span className="hidden sm:inline">Rani Foreground Active</span>
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {deviceState.wifi ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          {deviceState.bluetooth && <Bluetooth className="w-3.5 h-3.5 text-blue-400" />}
          <span className="text-[10px] bg-slate-800 px-1 rounded text-emerald-300">5G</span>
          <span className="text-slate-300">92%</span>
        </div>
      </div>

      {/* Device Navigation Tabs */}
      <div className="flex items-center bg-slate-900/70 border-b border-pink-500/10 px-2 overflow-x-auto no-scrollbar">
        {/* Shopping Screen (For Screen Vision See + Act) */}
        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'shopping'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Shopping (Screen Vision)</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp (Accessibility)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-pink-400 text-pink-300 bg-pink-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-pink-400" />
          <span>Device & Smart Friction</span>
        </button>

        <button
          onClick={() => setActiveTab('alarms')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'alarms'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>AlarmManager ({alarms.filter((a) => a.enabled).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'contacts'
              ? 'border-rose-400 text-rose-300 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-rose-400" />
          <span>Contacts ({contacts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>NotificationListener ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Calendar</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/80">
        {/* TAB: SHOPPING (SCREEN VISION SEE + ACT) */}
        {activeTab === 'shopping' && (
          <div className="space-y-3">
            {/* Header info bar */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <Eye className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-semibold block">
                    Screen Vision (MediaProjection + Accessibility)
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Try asking: <em>"isme se sabse sasta wala select karo"</em>
                  </span>
                </div>
              </div>
              <button
                onClick={() => onTriggerVisionInspect?.('isme se sabse sasta wala select karo')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/30 cursor-pointer flex items-center gap-1"
              >
                <span>Trigger Vision</span>
              </button>
            </div>

            {/* Product catalog list */}
            <div className="space-y-2">
              {products.map((p) => {
                const isSelected = selectedProductId === p.id;
                const isTappedNow = visionTapEffectId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`p-3 rounded-2xl border transition-all relative overflow-hidden cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual Tap Wave / Accessibility simulated touch */}
                    {isTappedNow && (
                      <div className="absolute inset-0 bg-cyan-400/20 border-2 border-cyan-400 animate-pulse pointer-events-none flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan-200 bg-slate-950/90 px-3 py-1 rounded-full border border-cyan-400 shadow-xl">
                          👆 Rani Accessibility Auto-Tap!
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                        {p.imageIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{p.name}</h5>
                          {p.price === 199 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Lowest Price 🔥
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{p.category}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-medium">{p.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-bold text-white flex items-center font-mono">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {p.price.toLocaleString()}
                      </span>
                      <button
                        className={`mt-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: WhatsApp (Accessibility Automation) */}
        {activeTab === 'whatsapp' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Smartphone className="w-4 h-4" />
                <span className="font-semibold">
                  RaniAccessibilityService: Automated Screen Interaction
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active & Listening
              </span>
            </div>

            {/* Chat Selection Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['Mom', 'Rahul', 'Priya'].map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedChat(name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedChat === name
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  💬 {name}
                </button>
              ))}
            </div>

            {/* Simulated WhatsApp Chat Screen */}
            <div className="flex-1 min-h-[220px] rounded-xl bg-[#0b141a] p-3 flex flex-col justify-between border border-emerald-900/40">
              <div className="space-y-2 overflow-y-auto max-h-[220px]">
                {(chatMessages[selectedChat] || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'me' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs shadow ${
                        msg.sender === 'me'
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-[#8696a0] block text-right mt-0.5">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Animated typing banner when Rani runs accessibility action */}
                {accessibilityTypingAnim && (
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-900/40 border border-emerald-500/40 text-xs text-emerald-200 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      Rani AccessibilityService typing:{' '}
                      <strong>"{accessibilityTypingAnim}"</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Input & Real WhatsApp launcher */}
              <div className="mt-3 pt-2 border-t border-[#222d34] flex flex-col gap-2">
                <form onSubmit={handleSendWhatsApp} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={`Message ${selectedChat}...`}
                    className="flex-1 bg-[#2a3942] text-xs text-white placeholder-[#8696a0] px-3 py-2 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-[#00a884] text-white hover:opacity-90 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Say: "WhatsApp pe {selectedChat} ko bolo..."</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      chatMessages[selectedChat]?.[chatMessages[selectedChat].length - 1]?.text ||
                        'Hey from Rani Assistant'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <span>Open in Web WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Device Controls & Smart Friction */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Battery & 24/7 Status Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BatteryCharging className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Android Battery Optimization
                  </span>
                  <span className="text-[11px] text-amber-200/80">
                    {deviceState.batteryOptimized
                      ? 'Currently Optimized (May restrict 24/7 background)'
                      : 'Unrestricted (24/7 wake word active)'}
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenBatteryGuide}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium cursor-pointer"
              >
                Configure
              </button>
            </div>

            {/* Smart Friction Test Button */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">
                    Smart Friction: High-Risk Protected Action
                  </span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                  Voice Guard
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Low-risk actions execute instantly. High-risk actions (UPI payment, deleting data, sending messages) require one quick voice confirmation ("Haan" or "Cancel").
              </p>
              <button
                onClick={() => onTriggerPaymentConfirmation?.('Rahul', 500)}
                className="w-full py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Simulate UPI Payment: Send ₹500 to Rahul</span>
              </button>
            </div>

            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Instant Low-Risk Hardware Controls (Zero friction)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Flashlight tile */}
              <button
                onClick={handleToggleFlashlight}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceState.flashlight
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Flashlight
                  className={`w-6 h-6 ${
                    deviceState.flashlight ? 'text-amber-300 animate-bounce' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-semibold">Flashlight</span>
                <span className="text-[10px] uppercase font-mono">
                  {deviceState.flashlight ? 'ON ⚡' : 'OFF'}
                </span>
              </button>

              {/* Wi-Fi tile */}
              <button
                onClick={() => onUpdateDeviceState({ wifi: !deviceState.wifi })}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceState.wifi
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {deviceState.wifi ? (
                  <Wifi className="w-6 h-6 text-emerald-300" />
                ) : (
                  <WifiOff className="w-6 h-6 text-slate-500" />
                )}
                <span className="text-xs font-semibold">Wi-Fi (JioFiber)</span>
                <span className="text-[10px] uppercase font-mono">
                  {deviceState.wifi ? 'Connected' : 'Disconnected'}
                </span>
              </button>

              {/* Bluetooth tile */}
              <button
                onClick={() => onUpdateDeviceState({ bluetooth: !deviceState.bluetooth })}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceState.bluetooth
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-200 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Bluetooth
                  className={`w-6 h-6 ${
                    deviceState.bluetooth ? 'text-blue-300' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-semibold">Bluetooth</span>
                <span className="text-[10px] uppercase font-mono">
                  {deviceState.bluetooth ? 'Paired (AirPods)' : 'OFF'}
                </span>
              </button>

              {/* Media Player tile */}
              <button
                onClick={handleToggleMusic}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  deviceState.mediaPlaying
                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-200 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {deviceState.mediaPlaying ? (
                  <Pause className="w-6 h-6 text-purple-300 animate-pulse" />
                ) : (
                  <Play className="w-6 h-6 text-slate-500" />
                )}
                <span className="text-xs font-semibold">MediaSession</span>
                <span className="text-[10px] uppercase font-mono">
                  {deviceState.mediaPlaying ? 'Playing Lo-Fi 🎵' : 'Paused'}
                </span>
              </button>
            </div>

            {/* Volume slider */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  {deviceState.volume > 0 ? (
                    <Volume2 className="w-4 h-4 text-pink-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  System Media Volume
                </span>
                <span className="font-mono text-pink-400">{deviceState.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deviceState.volume}
                onChange={(e) => onUpdateDeviceState({ volume: parseInt(e.target.value, 10) })}
                className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: AlarmManager */}
        {activeTab === 'alarms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Android AlarmManager Scheduler
              </h4>
              <button
                onClick={() => {
                  const newA = deviceService.addAlarm('07:00', 'Morning Workout');
                  setAlarms(deviceService.getAlarms());
                  onRaniSpeak('Maine subah saat baje ka naya alarm set kar diya hai!');
                }}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Alarm</span>
              </button>
            </div>

            <div className="space-y-2">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => {
                        deviceService.toggleAlarm(alarm.id);
                        setAlarms([...deviceService.getAlarms()]);
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        alarm.enabled
                          ? 'bg-purple-600/30 text-purple-300'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-white">
                          {alarm.time}
                        </span>
                        <span className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          {alarm.days.join(', ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{alarm.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        deviceService.toggleAlarm(alarm.id);
                        setAlarms([...deviceService.getAlarms()]);
                      }}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        alarm.enabled ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          alarm.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        deviceService.deleteAlarm(alarm.id);
                        setAlarms([...deviceService.getAlarms()]);
                      }}
                      className="p-1 hover:text-rose-400 text-slate-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Contacts Provider */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Android Contacts Provider
            </h4>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-pink-500/20 flex items-center justify-center text-base">
                      {contact.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-pink-300 bg-pink-500/10 px-1.5 py-0.2 rounded">
                          {contact.relation}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">{contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTriggerCall(contact)}
                      className="px-2.5 py-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600 text-pink-200 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>📞 Call</span>
                    </button>
                    <a
                      href={`sms:${contact.phone}?body=Hey%20from%20Rani`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                    >
                      SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NotificationListenerService Interceptor */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                NotificationListener Interceptor
              </h4>
              <button
                onClick={handleAddMockNotification}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Incoming</span>
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-all ${
                    n.read
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : 'bg-slate-900/95 border-amber-500/30 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{n.icon}</span>
                      <span className="font-semibold text-amber-300">{n.app}</span>
                      <span className="text-slate-400">• {n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-6">{n.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const unread = notifications.filter((n) => !n.read);
                if (unread.length > 0) {
                  onRaniSpeak(
                    `Aapke paas ${unread.length} naye notifications hain. Sabse pehla message ${unread[0].app} se hai: ${unread[0].title} ne kaha, "${unread[0].text}".`
                  );
                } else {
                  onRaniSpeak('Aapke paas abhi koi naya notification nahi hai ji!');
                }
              }}
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ask Rani to Read Out Notifications</span>
            </button>
          </div>
        )}

        {/* TAB 6: Calendar Provider */}
        {activeTab === 'calendar' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Android Calendar Schedule
            </h4>

            <div className="space-y-2">
              {calendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">{evt.title}</h5>
                      <p className="text-[11px] text-indigo-300">
                        {evt.date} • {evt.time} {evt.location ? `(${evt.location})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
