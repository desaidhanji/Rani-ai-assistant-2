import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Apple,
  Monitor,
  Code,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Share,
  MoreVertical,
  PlusSquare,
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNativeCode?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onOpenNativeCode,
}) => {
  const [activeTab, setActiveTab] = useState<'android_pwa' | 'ios' | 'desktop' | 'apk'>('android_pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install, use your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-pink-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-pink-500/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Install Rani AI Assistant
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Phone & Desktop
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install as a full-screen app or build native Android APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Install Banner if browser supports prompt */}
        {deferredPrompt && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-md">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Browser Ready to Install</p>
                <p className="text-xs text-slate-300">Click below for 1-tap installation on your device</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-pink-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('android_pwa')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'android_pwa'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android (Instant App)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ios'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-300" />
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>PC / Mac / Chrome</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'apk'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-purple-400" />
            <span>Build Android APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Android PWA */}
          {activeTab === 'android_pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Install on Android Phone (Chrome, Edge, Samsung Internet)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Installing as a Progressive Web App (PWA) gives you full-screen mode, home screen launcher icon, low latency audio, and zero app-store download limits.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Open the App URL on your Android Phone</p>
                    <p className="text-slate-400 mt-0.5">Open this URL in Google Chrome, Brave, or Samsung Internet.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      Tap the 3 dots menu <MoreVertical className="w-3.5 h-3.5 text-pink-400 inline" />
                    </p>
                    <p className="text-slate-400 mt-0.5">In the top-right corner of Chrome, tap the three dots icon (⋮).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Select "Install app" or "Add to Home screen"</p>
                    <p className="text-slate-400 mt-0.5">
                      Chrome will prompt: <em>"Install Rani - AI Personal Assistant"</em>. Tap <strong>Install</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-300">Ready to Use!</p>
                    <p className="text-slate-400 mt-0.5">
                      Rani now lives on your phone's home screen & app drawer just like any installed Play Store app!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: iOS Safari */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-slate-300" />
                  Install on iPhone / iPad (Safari)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apple Safari allows full-screen web apps to be pinned to your home screen with custom splash screen and offline storage.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Open the App in Safari</p>
                    <p className="text-slate-400 mt-0.5">Make sure to open this page in Apple Safari on your iPhone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      Tap the Share Button <Share className="w-3.5 h-3.5 text-pink-400 inline" />
                    </p>
                    <p className="text-slate-400 mt-0.5">At the bottom of Safari, tap the Share icon (square with upward arrow).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-pink-400 inline" />
                    </p>
                    <p className="text-slate-400 mt-0.5">Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-300">Tap "Add" in Top Right</p>
                    <p className="text-slate-400 mt-0.5">The Rani icon with the glowing lotus will appear on your iPhone home screen!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Desktop PC / Mac */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  Install on Windows PC, Mac, or Chromebook
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enjoy Rani in her own dedicated desktop window with voice shortcuts, microphone access, and high performance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Look at the URL address bar in Chrome or Edge</p>
                    <p className="text-slate-400 mt-0.5">
                      On the far right side of the URL bar, an <strong>Install icon (🖥️ or ⊕)</strong> will appear.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Click "Install"</p>
                    <p className="text-slate-400 mt-0.5">
                      Or click Chrome's 3 dots menu (⋮) → <strong>Save and share</strong> → <strong>Install Rani - AI Personal Assistant</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-300">Desktop Shortcut Created</p>
                    <p className="text-slate-400 mt-0.5">
                      Rani will open in her own borderless window, pinned to your Windows taskbar or Mac Dock!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Native Android APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    Build Native Android APK (.apk file)
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNativeCode?.();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Kotlin Source</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  For full system-level capabilities (reading WhatsApp screen text, low-power background wake words, and direct device clicks), Rani provides complete, production-ready Kotlin source code!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Create New Project in Android Studio</p>
                    <p className="text-slate-400 mt-0.5">
                      Choose <strong>Empty Views Activity</strong> or <strong>Compose</strong>, Package Name: <code className="text-pink-300">com.rani.assistant</code>, Language: <strong>Kotlin</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Copy Kotlin Services from Rani</p>
                    <p className="text-slate-400 mt-0.5">
                      Click <strong>"Kotlin Code"</strong> in Rani's header and copy:
                    </p>
                    <ul className="mt-1.5 space-y-1 text-slate-300 list-disc list-inside">
                      <li><code>AndroidManifest.xml</code> (Permissions & Service declarations)</li>
                      <li><code>RaniAccessibilityService.kt</code> (WhatsApp auto-type & screen reader)</li>
                      <li><code>RaniForegroundService.kt</code> (24/7 low-power wake word listener)</li>
                      <li><code>RaniMediaProjectionService.kt</code> (Screen capture for Vision)</li>
                      <li><code>RaniNotificationListener.kt</code> (Incoming notifications interception)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Build & Install APK</p>
                    <p className="text-slate-400 mt-0.5">
                      In Android Studio menu: <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>.
                      Transfer the generated <code className="text-emerald-400">app-debug.apk</code> to your phone or run via USB debugging!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Rani AI Assistant • Multi-Platform Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
