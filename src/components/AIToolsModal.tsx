import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Volume2,
  Cpu,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AIToolPlugin } from '../types';
import { vaultService } from '../services/vaultService';
import { raniTTS } from '../services/ttsService';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPluginChange?: () => void;
  onOpenVoiceStudio?: () => void;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  onPluginChange,
  onOpenVoiceStudio,
}) => {
  const [plugins, setPlugins] = useState<AIToolPlugin[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<
    'openai' | 'elevenlabs' | 'claude' | 'groq' | 'perplexity' | 'gemini'
  >('elevenlabs');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const availableProviders = vaultService.getAvailableProviders();

  useEffect(() => {
    if (isOpen) {
      loadPlugins();
    }
  }, [isOpen]);

  const loadPlugins = () => {
    setPlugins(vaultService.getPlugins());
  };

  if (!isOpen) return null;

  const currentProviderInfo = availableProviders.find(
    (p) => p.provider === selectedProvider
  );

  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste a valid API key.' });
      return;
    }

    setIsConnecting(true);
    setStatusMessage(null);

    setTimeout(() => {
      vaultService.connectPlugin(selectedProvider, apiKeyInput.trim());
      setIsConnecting(false);
      setApiKeyInput('');
      setStatusMessage({
        type: 'success',
        text: `Connected ${currentProviderInfo?.name || selectedProvider}! Rani is now automatically configured to use it.`,
      });
      loadPlugins();
      onPluginChange?.();

      if (selectedProvider === 'elevenlabs') {
        raniTTS.speak(
          'Arrey waah! ElevenLabs voice connect ho gaya! Ab meri awaz aur bhi natural lagegi 💕',
          { emotion: 'excited' }
        );
      } else {
        raniTTS.speak(
          `Shukriya! ${currentProviderInfo?.name || selectedProvider} connect ho gaya hai!`,
          { emotion: 'happy' }
        );
      }
    }, 450);
  };

  const handleToggle = (id: string, current: boolean) => {
    vaultService.togglePlugin(id, !current);
    loadPlugins();
    onPluginChange?.();
  };

  const handleRemove = (id: string) => {
    vaultService.removePlugin(id);
    loadPlugins();
    onPluginChange?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/50 via-pink-950/40 to-slate-900 border-b border-pink-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">AI Tools & Plugins</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  EncryptedSharedPreferences
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Connect third-party AI services with zero coding — Rani auto-switches immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Connect New Provider Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Connect New AI Provider
              </h4>
              <span className="text-[11px] text-slate-400">No coding required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Provider Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select AI Service
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                >
                  {availableProviders.map((p) => (
                    <option key={p.provider} value={p.provider}>
                      {p.icon} {p.name} ({p.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[10px] text-slate-400">Stored in encrypted vault</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={`Paste ${selectedProvider} API key...`}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs pl-8 focus:outline-none focus:border-pink-500 font-mono"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Provider detail pill */}
            {currentProviderInfo && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
                <span className="text-xl mt-0.5">{currentProviderInfo.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-white">
                    {currentProviderInfo.name}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {currentProviderInfo.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-pink-300 font-mono">
                    <span>Target: {currentProviderInfo.model}</span>
                    <span>•</span>
                    <span>Role: {currentProviderInfo.category}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-pink-500/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Encrypting & Connecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Connect Service</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connected Services List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Connected Services ({plugins.length})
            </h4>

            <div className="space-y-2.5">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    plugin.enabled
                      ? 'bg-slate-950/90 border-pink-500/30 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg">
                      {plugin.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {plugin.name}
                        </span>
                        {plugin.enabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                            {plugin.category === 'voice'
                              ? 'Active Voice Engine'
                              : plugin.provider === 'gemini'
                              ? 'Multimodal Brain'
                              : 'Active Alternate Brain'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span>Key: {plugin.maskedKey}</span>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                        {plugin.provider === 'elevenlabs' && (
                          <>
                            <span>•</span>
                            <span className="text-pink-300">
                              Voice: {vaultService.getSelectedVoiceName()}
                            </span>
                          </>
                        )}
                      </div>
                      {plugin.provider === 'elevenlabs' && (
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenVoiceStudio?.();
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/30 text-pink-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            Browse Hindi Female Voice Actors (10+ Voices)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* On/Off Switch */}
                    <button
                      onClick={() => handleToggle(plugin.id, plugin.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        plugin.enabled ? 'bg-pink-600' : 'bg-slate-700'
                      }`}
                      title={plugin.enabled ? 'Disable' : 'Enable'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          plugin.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Delete button (except built-in gemini) */}
                    {plugin.provider !== 'gemini' && (
                      <button
                        onClick={() => handleRemove(plugin.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Remove Provider"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
          <span>Zero-code setup: Rani automatically detects the active service capability.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
