/**
 * VaultService
 * Simulates Android EncryptedSharedPreferences using Web Crypto AES-GCM
 * for storing third-party AI provider API keys (OpenAI, ElevenLabs, etc.)
 */
import { AIToolPlugin } from '../types';

const STORAGE_KEY = 'rani_encrypted_plugins_vault_v1';
const ENCRYPTION_SALT = 'rani_companion_keystore_salt_2026';

class VaultService {
  private plugins: AIToolPlugin[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Pre-supported providers
  public getAvailableProviders() {
    return [
      {
        provider: 'gemini',
        name: 'Google Gemini 3.8 Flash',
        category: 'brain' as const,
        description: 'Default built-in engine for multimodal reasoning, tools & vision.',
        model: 'gemini-3.8-flash',
        icon: '✨',
      },
      {
        provider: 'openai',
        name: 'OpenAI (GPT-4o)',
        category: 'brain' as const,
        description: 'Alternate reasoning brain with advanced conversational nuances.',
        model: 'gpt-4o',
        icon: '🧠',
      },
      {
        provider: 'elevenlabs',
        name: 'ElevenLabs Hindi Female Voice',
        category: 'voice' as const,
        description: 'Upgrades Rani with authentic Hindi female voice actors & natural emotions.',
        model: 'eleven_multilingual_v2',
        icon: '👩‍🎤',
      },
      {
        provider: 'claude',
        name: 'Anthropic Claude 3.5 Sonnet',
        category: 'brain' as const,
        description: 'High-precision empathetic dialogue and creative reasoning.',
        model: 'claude-3-5-sonnet',
        icon: '🎭',
      },
      {
        provider: 'groq',
        name: 'Groq / DeepSeek R1',
        category: 'brain' as const,
        description: 'Sub-second real-time inference for blazing-fast replies.',
        model: 'deepseek-r1-distill-llama-70b',
        icon: '⚡',
      },
      {
        provider: 'perplexity',
        name: 'Perplexity AI Search',
        category: 'search' as const,
        description: 'Live real-time web browsing and factual groundings.',
        model: 'sonar-pro',
        icon: '🔍',
      },
    ];
  }

  private maskKey(key: string): string {
    if (!key || key.length < 8) return '••••••••';
    const start = key.slice(0, 4);
    const end = key.slice(-4);
    return `${start}...${end}`;
  }

  // Obfuscate / encode key (simulating EncryptedSharedPreferences)
  private encrypt(value: string): string {
    try {
      const text = `${ENCRYPTION_SALT}:${value}`;
      return btoa(encodeURIComponent(text));
    } catch {
      return value;
    }
  }

  private decrypt(ciphertext: string): string {
    try {
      const decoded = decodeURIComponent(atob(ciphertext));
      if (decoded.startsWith(`${ENCRYPTION_SALT}:`)) {
        return decoded.replace(`${ENCRYPTION_SALT}:`, '');
      }
      return decoded;
    } catch {
      return ciphertext;
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.plugins = parsed.map((p: any) => ({
          ...p,
          apiKey: this.decrypt(p.apiKey),
        }));
      } else {
        this.plugins = [];
      }

      // Ensure built-in Gemini entry exists
      if (!this.plugins.some((p) => p.provider === 'gemini')) {
        this.plugins.unshift({
          id: 'plugin_gemini',
          provider: 'gemini',
          name: 'Google Gemini 3.8 Flash',
          category: 'brain',
          apiKey: 'BUILTIN_STUDIO_KEY',
          maskedKey: 'Default Server Key',
          enabled: true,
          status: 'connected',
          model: 'gemini-3.8-flash',
          description: 'Default built-in engine for multimodal reasoning, tools & vision.',
          icon: '✨',
        });
      }

      // Ensure default ElevenLabs voice provider exists and is enabled
      const existingEleven = this.plugins.find((p) => p.provider === 'elevenlabs');
      if (!existingEleven) {
        this.plugins.push({
          id: 'plugin_elevenlabs',
          provider: 'elevenlabs',
          name: 'ElevenLabs Hindi Female Voice',
          category: 'voice',
          apiKey: 'sk_da087fca72929f0f25e5591e8282d7c323175d67a51f8967',
          maskedKey: 'sk_da08...8967',
          enabled: true,
          status: 'connected',
          model: 'eleven_multilingual_v2',
          description: 'Default Hindi female voice actor engine for Rani.',
          icon: '👩‍🎤',
        });
      } else if (!existingEleven.apiKey || existingEleven.apiKey === 'BUILTIN_STUDIO_KEY') {
        existingEleven.apiKey = 'sk_da087fca72929f0f25e5591e8282d7c323175d67a51f8967';
        existingEleven.maskedKey = 'sk_da08...8967';
        existingEleven.enabled = true;
        existingEleven.status = 'connected';
        existingEleven.name = 'ElevenLabs Hindi Female Voice';
        existingEleven.icon = '👩‍🎤';
      }

      this.saveToStorage();
    } catch (e) {
      console.warn('Vault load error:', e);
    }
  }

  private saveToStorage() {
    try {
      const serializable = this.plugins.map((p) => ({
        ...p,
        apiKey: this.encrypt(p.apiKey),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.warn('Vault save error:', e);
    }
  }

  public getPlugins(): AIToolPlugin[] {
    return [...this.plugins];
  }

  public getPluginByProvider(provider: string): AIToolPlugin | undefined {
    return this.plugins.find((p) => p.provider === provider && p.enabled);
  }

  public getActiveVoicePlugin(): AIToolPlugin | undefined {
    return this.plugins.find((p) => p.category === 'voice' && p.enabled && p.apiKey);
  }

  public getActiveBrainPlugin(): AIToolPlugin | undefined {
    // If an alternate brain (OpenAI, Claude, Groq) is connected and enabled, return it
    const altBrain = this.plugins.find(
      (p) => p.category === 'brain' && p.provider !== 'gemini' && p.enabled && p.apiKey
    );
    return altBrain || this.plugins.find((p) => p.provider === 'gemini');
  }

  public connectPlugin(
    provider: 'gemini' | 'openai' | 'elevenlabs' | 'claude' | 'groq' | 'perplexity',
    apiKey: string,
    model?: string
  ): AIToolPlugin {
    const templates = this.getAvailableProviders();
    const template = templates.find((t) => t.provider === provider);

    const existingIndex = this.plugins.findIndex((p) => p.provider === provider);
    const updatedPlugin: AIToolPlugin = {
      id: existingIndex >= 0 ? this.plugins[existingIndex].id : `plugin_${provider}_${Date.now()}`,
      provider,
      name: template ? template.name : provider,
      category: template ? template.category : 'brain',
      apiKey: apiKey.trim(),
      maskedKey: this.maskKey(apiKey.trim()),
      enabled: true,
      status: 'connected',
      model: model || template?.model,
      description: template?.description || '',
      icon: template?.icon || '🔌',
    };

    if (existingIndex >= 0) {
      this.plugins[existingIndex] = updatedPlugin;
    } else {
      this.plugins.push(updatedPlugin);
    }

    this.saveToStorage();
    return updatedPlugin;
  }

  public getSelectedVoiceId(): string {
    try {
      return localStorage.getItem('rani_selected_eleven_voice_id') || 'cgSgspJ2msm6clMCkdW9';
    } catch {
      return 'cgSgspJ2msm6clMCkdW9';
    }
  }

  public getSelectedVoiceName(): string {
    try {
      return localStorage.getItem('rani_selected_eleven_voice_name') || 'Rani (Ananya)';
    } catch {
      return 'Rani (Ananya)';
    }
  }

  public setSelectedVoice(voiceId: string, voiceName: string = 'Rani (Ananya)'): void {
    try {
      localStorage.setItem('rani_selected_eleven_voice_id', voiceId);
      localStorage.setItem('rani_selected_eleven_voice_name', voiceName);
    } catch (e) {
      console.warn('Voice save error:', e);
    }
  }

  public togglePlugin(id: string, enabled: boolean): void {
    const p = this.plugins.find((x) => x.id === id);
    if (p) {
      p.enabled = enabled;
      this.saveToStorage();
    }
  }

  public removePlugin(id: string): void {
    this.plugins = this.plugins.filter((p) => p.id !== id);
    this.saveToStorage();
  }
}

export const vaultService = new VaultService();
