export type EmotionType =
  | 'caring'
  | 'happy'
  | 'excited'
  | 'concerned'
  | 'playful'
  | 'calm'
  | 'empathetic';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  detectedLanguage?: 'hi-IN' | 'en-IN' | 'gu-IN' | 'auto';
  emotion?: EmotionType;
  action?: {
    name: string;
    args: any;
    status: 'pending' | 'success' | 'failed';
    details?: string;
  };
  highRiskPending?: PendingActionConfirmation;
}

export interface PendingActionConfirmation {
  id: string;
  type: 'payment' | 'delete' | 'send_message' | 'make_call';
  title: string;
  description: string;
  payload: any;
  verbalPrompt: string;
}

export interface DeviceState {
  flashlight: boolean;
  wifi: boolean;
  bluetooth: boolean;
  volume: number; // 0 - 100
  dnd: boolean;
  mediaPlaying: boolean;
  currentTrack?: {
    title: string;
    artist: string;
  };
  foregroundServiceActive: boolean;
  wakeWordActive: boolean;
  alwaysListening24x7: boolean;
  overlayActive: boolean;
  batteryOptimized: boolean; // false = unrestricted (good for 24/7)
}

export interface AlarmItem {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
  days: string[];
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatar: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

export interface NotificationItem {
  id: string;
  app: string;
  title: string;
  text: string;
  timestamp: string;
  icon: string;
  read: boolean;
}

export interface PermissionItem {
  id: string;
  name: string;
  androidPermission: string;
  description: string;
  raniReason: string;
  granted: boolean;
  category: 'core' | 'accessibility' | 'system' | 'personal' | 'vision';
  icon: string;
}

export interface AIToolPlugin {
  id: string;
  provider: 'gemini' | 'openai' | 'elevenlabs' | 'claude' | 'groq' | 'perplexity';
  name: string;
  category: 'brain' | 'voice' | 'search';
  apiKey: string;
  maskedKey: string;
  enabled: boolean;
  status: 'connected' | 'error' | 'ready';
  model?: string;
  description: string;
  icon: string;
}

export interface ScreenVisionState {
  isWatching: boolean;
  permissionGranted: boolean;
  lastScreenshot?: string;
  analyzing: boolean;
  detectedAction?: {
    target: string;
    reason: string;
    x?: number;
    y?: number;
  };
}

export interface ElevenLabsVoice {
  id: string;
  name: string;
  characterName: string;
  tagline: string;
  gender: 'female' | 'male' | 'neutral';
  age: 'young' | 'middle_aged' | 'old';
  accent: 'american' | 'british' | 'indian' | 'australian' | 'swedish' | 'standard';
  language: string;
  category: 'premade' | 'professional' | 'cloned' | 'expressive';
  useCase: 'conversational' | 'social_media' | 'narrative_story' | 'informative_educational' | 'characters_animation' | 'advertisement';
  descriptive: string;
  description: string;
  previewUrl?: string;
  avatarEmoji: string;
  personality: string;
  isRaniDefault?: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  repoUrl: string;
  rawUrl?: string;
  description: string;
  type: 'github_repo' | 'markdown' | 'api_catalog' | 'document';
  itemCount: number;
  categoryCount: number;
  status: 'connected' | 'syncing' | 'error' | 'ready';
  lastSynced: string;
  icon: string;
  isDefault?: boolean;
  categories?: string[];
  errorDetails?: string;
}

export interface PublicApiEntry {
  api: string;
  description: string;
  auth: string;
  https: boolean;
  cors: string;
  link: string;
  category: string;
}

export interface KnowledgeSearchResponse {
  query: string;
  totalFound: number;
  results: PublicApiEntry[];
  source: {
    id: string;
    name: string;
    repoUrl: string;
    lastSynced: string;
  };
}


