import fs from 'fs';
import path from 'path';

export interface PublicApiEntry {
  api: string;
  description: string;
  auth: string;
  https: boolean;
  cors: string;
  link: string;
  category: string;
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

const CACHE_DIR = path.resolve(process.cwd(), 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'public_apis_knowledge_cache.json');
const SOURCES_FILE = path.join(CACHE_DIR, 'knowledge_sources.json');

const DEFAULT_SOURCES: KnowledgeSource[] = [
  {
    id: 'source_public_apis',
    name: 'Public APIs (GitHub)',
    repoUrl: 'https://github.com/public-apis/public-apis',
    rawUrl: 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md',
    description: 'A collective list of free public APIs for use in software and web development categorized by domain.',
    type: 'github_repo',
    itemCount: 2058,
    categoryCount: 52,
    status: 'connected',
    lastSynced: new Date().toISOString(),
    icon: '🌐',
    isDefault: true,
  },
];

// Seed curated starter entries so the engine starts up immediately without waiting for initial network fetch
const SEED_STARTER_APIS: PublicApiEntry[] = [
  {
    api: 'Open-Meteo',
    description: 'Free weather forecast API for non-commercial and commercial use without requiring an API key',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://open-meteo.com/',
    category: 'Weather',
  },
  {
    api: 'WeatherAPI',
    description: 'Real-time weather, forecasts, historical data, air quality and marine weather data',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://www.weatherapi.com/',
    category: 'Weather',
  },
  {
    api: 'CoinGecko',
    description: 'Cryptocurrency data, live prices, market caps, charts, transactions and exchange volumes',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://www.coingecko.com/en/api',
    category: 'Cryptocurrency',
  },
  {
    api: 'Binance',
    description: 'Public spot exchange REST API and WebSocket streams for cryptocurrency trading data',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://binance-docs.github.io/apidocs/spot/en/',
    category: 'Cryptocurrency',
  },
  {
    api: 'REST Countries',
    description: 'Information about world countries including capitals, currencies, languages, flags and borders',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://restcountries.com/',
    category: 'Open Data',
  },
  {
    api: 'Nomorobo / OpenStreetMap Nominatim',
    description: 'Free forward and reverse geocoding using OpenStreetMap data',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://nominatim.openstreetmap.org/',
    category: 'Geocoding',
  },
  {
    api: 'PokeAPI',
    description: 'All the Pokémon data you will ever need in one RESTful API',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://pokeapi.co/',
    category: 'Games & Comics',
  },
  {
    api: 'Jikan (Unofficial MyAnimeList)',
    description: 'Open-source PHP & REST API for MyAnimeList with anime and manga metadata',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://jikan.moe/',
    category: 'Anime',
  },
  {
    api: 'ExchangeRate-API',
    description: 'Free currency conversion and foreign exchange rates for over 160 currencies',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://www.exchangerate-api.com/',
    category: 'Currency Exchange',
  },
  {
    api: 'Free Dictionary API',
    description: 'English word definitions, phonetics, audio pronunciations, examples and synonyms',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://dictionaryapi.dev/',
    category: 'Dictionaries',
  },
  {
    api: 'RandomUser.me',
    description: 'Free user data generator for generating mock user profiles, avatars and names for testing',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://randomuser.me/',
    category: 'Test Data',
  },
  {
    api: 'IPify',
    description: 'A simple, fast and free public IP address API',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://www.ipify.org/',
    category: 'Development',
  },
  {
    api: 'NASA Open APIs',
    description: 'Astronomy picture of the day, Mars rover photos, asteroid neoWs and space imagery',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://api.nasa.gov/',
    category: 'Science & Math',
  },
  {
    api: 'The Dog API / The Cat API',
    description: 'Pictures, breeds, facts and information about dogs and cats',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://thedogapi.com/',
    category: 'Animals',
  },
  {
    api: 'Spotify Web API',
    description: 'Search, stream track metadata, playlists, artists and albums',
    auth: 'OAuth',
    https: true,
    cors: 'Yes',
    link: 'https://developer.spotify.com/documentation/web-api/',
    category: 'Music',
  },
  {
    api: 'Razorpay / Stripe',
    description: 'Online payment gateways, subscriptions, payment links, and payout APIs for developers',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://razorpay.com/docs/api/',
    category: 'Finance',
  },
  {
    api: 'Hugging Face Inference API',
    description: 'Fast serverless machine learning inference for NLP, vision, and speech models',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://huggingface.co/docs/api-inference/',
    category: 'Machine Learning',
  },
  {
    api: 'NewsAPI',
    description: 'Search worldwide news articles and breaking headlines from over 80,000 news sources',
    auth: 'apiKey',
    https: true,
    cors: 'Yes',
    link: 'https://newsapi.org/',
    category: 'News',
  },
  {
    api: 'Gutendex (Project Gutenberg)',
    description: 'Web API for Project Gutenberg public domain e-books library and metadata',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://gutendex.com/',
    category: 'Books',
  },
  {
    api: 'GitHub REST API',
    description: 'Access repositories, user profiles, commits, issues and pull requests',
    auth: 'No',
    https: true,
    cors: 'Yes',
    link: 'https://docs.github.com/en/rest',
    category: 'Development',
  },
];

export class KnowledgeEngine {
  private sources: KnowledgeSource[] = [];
  private publicApisIndex: PublicApiEntry[] = [];
  private isSyncing = false;

  constructor() {
    this.ensureCacheDir();
    this.loadState();
  }

  private ensureCacheDir() {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[KnowledgeEngine] Error creating cache directory:', e);
    }
  }

  private loadState() {
    try {
      // Load sources
      if (fs.existsSync(SOURCES_FILE)) {
        const rawSources = fs.readFileSync(SOURCES_FILE, 'utf-8');
        this.sources = JSON.parse(rawSources);
      } else {
        this.sources = [...DEFAULT_SOURCES];
        this.saveSources();
      }

      // Load APIs index
      if (fs.existsSync(CACHE_FILE)) {
        const rawApis = fs.readFileSync(CACHE_FILE, 'utf-8');
        this.publicApisIndex = JSON.parse(rawApis);
        console.log(`[KnowledgeEngine] Loaded ${this.publicApisIndex.length} cached public APIs`);
      } else {
        this.publicApisIndex = [...SEED_STARTER_APIS];
        this.saveApisIndex();
        // Trigger background initial sync to populate full GitHub repository list
        setTimeout(() => this.syncPublicApisSource(), 2000);
      }
    } catch (e) {
      console.warn('[KnowledgeEngine] Load state error:', e);
      this.sources = [...DEFAULT_SOURCES];
      this.publicApisIndex = [...SEED_STARTER_APIS];
    }
  }

  private saveSources() {
    try {
      fs.writeFileSync(SOURCES_FILE, JSON.stringify(this.sources, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[KnowledgeEngine] Failed to save sources:', e);
    }
  }

  private saveApisIndex() {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.publicApisIndex, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[KnowledgeEngine] Failed to save APIs index:', e);
    }
  }

  /**
   * Sync and parse markdown from https://github.com/public-apis/public-apis
   */
  public async syncPublicApisSource(): Promise<{ success: boolean; itemCount: number; categories: number; message: string }> {
    if (this.isSyncing) {
      return {
        success: true,
        itemCount: this.publicApisIndex.length,
        categories: this.getCategories().length,
        message: 'Sync already in progress',
      };
    }

    this.isSyncing = true;
    const source = this.sources.find((s) => s.id === 'source_public_apis');
    if (source) {
      source.status = 'syncing';
      this.saveSources();
    }

    try {
      console.log('[KnowledgeEngine] Fetching latest public-apis markdown from GitHub...');
      const rawUrl = source?.rawUrl || 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';
      const res = await fetch(rawUrl, {
        headers: {
          'User-Agent': 'Rani-AI-Assistant-KnowledgeEngine',
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub HTTP ${res.status}: ${res.statusText}`);
      }

      const markdown = await res.text();
      const parsedApis = this.parsePublicApisMarkdown(markdown);

      if (parsedApis.length === 0) {
        throw new Error('No API entries could be parsed from markdown');
      }

      this.publicApisIndex = parsedApis;
      const categories = this.getCategories();

      if (source) {
        source.status = 'connected';
        source.itemCount = parsedApis.length;
        source.categoryCount = categories.length;
        source.lastSynced = new Date().toISOString();
        source.categories = categories.map((c) => c.category);
        source.errorDetails = undefined;
      }

      this.saveApisIndex();
      this.saveSources();
      this.isSyncing = false;

      console.log(`[KnowledgeEngine] Successfully indexed ${parsedApis.length} public APIs across ${categories.length} categories.`);
      return {
        success: true,
        itemCount: parsedApis.length,
        categories: categories.length,
        message: `Successfully synchronized ${parsedApis.length} public APIs from GitHub!`,
      };
    } catch (err: any) {
      console.warn('[KnowledgeEngine] Sync error:', err?.message || err);
      if (source) {
        source.status = this.publicApisIndex.length > 0 ? 'connected' : 'error';
        source.errorDetails = err?.message || 'Failed to fetch GitHub repository';
        this.saveSources();
      }
      this.isSyncing = false;
      return {
        success: this.publicApisIndex.length > 0,
        itemCount: this.publicApisIndex.length,
        categories: this.getCategories().length,
        message: `Sync warning: ${err?.message}. Using ${this.publicApisIndex.length} cached API definitions.`,
      };
    }
  }

  /**
   * Parse GitHub Public APIs markdown tables into structured schema
   */
  private parsePublicApisMarkdown(markdown: string): PublicApiEntry[] {
    const lines = markdown.split('\n');
    let currentCategory = 'General';
    const apis: PublicApiEntry[] = [];
    const seenLinks = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Heading 3 indicates a new category section (e.g., ### Animals, ### Weather, ### Cryptocurrency)
      const catMatch = line.match(/^###\s+([^#\n]+)/);
      if (catMatch) {
        const rawCat = catMatch[1]
          .replace(/API.*$/i, '')
          .replace(/\[.*?\]/g, '')
          .trim();
        if (rawCat && !rawCat.toLowerCase().includes('suite')) {
          currentCategory = rawCat;
        }
        continue;
      }

      // Markdown Table Row: | API | Description | Auth | HTTPS | CORS |
      if (line.startsWith('|') && !line.includes('---|---') && !line.toLowerCase().includes('| api |')) {
        const parts = line.split('|').map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
          const apiCell = parts[0];
          const nameMatch = apiCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
          const name = nameMatch ? nameMatch[1].trim() : apiCell.trim();
          let link = nameMatch ? nameMatch[2].trim() : '';

          if (!name || !link) continue;

          // Clean tracking params
          link = link.replace(/[?&]utm_source=.*$/, '');

          const rawDesc = parts[1] || '';
          const description = rawDesc.replace(/\[.*?\]\(.*?\)/g, '').trim();

          let auth = parts[2] || 'No';
          if (auth.includes('img') || auth.includes('postman')) {
            auth = 'apiKey';
          } else {
            auth = auth.replace(/[`*]/g, '').trim();
          }

          const https = parts[3] ? parts[3].toLowerCase().includes('yes') : true;
          const cors = parts[4] ? (parts[4].toLowerCase().includes('yes') ? 'Yes' : parts[4].toLowerCase().includes('no') ? 'No' : 'Unknown') : 'Unknown';

          const uniqueKey = `${name.toLowerCase()}-${link.toLowerCase()}`;
          if (!seenLinks.has(uniqueKey)) {
            seenLinks.add(uniqueKey);
            apis.push({
              api: name,
              description,
              auth,
              https,
              cors,
              link,
              category: currentCategory || 'General',
            });
          }
        }
      }
    }

    return apis.length > 0 ? apis : SEED_STARTER_APIS;
  }

  /**
   * Search knowledge base with ranked scoring
   */
  public search(
    query: string,
    options?: {
      category?: string;
      auth?: string;
      limit?: number;
    }
  ): { results: PublicApiEntry[]; totalFound: number } {
    const q = (query || '').trim().toLowerCase();
    const targetCategory = options?.category?.toLowerCase();
    const targetAuth = options?.auth?.toLowerCase();
    const limit = options?.limit || 10;

    if (!q && !targetCategory && !targetAuth) {
      return {
        results: this.publicApisIndex.slice(0, limit),
        totalFound: this.publicApisIndex.length,
      };
    }

    const queryTerms = q.split(/\s+/).filter((t) => t.length > 1);

    const scored: Array<{ entry: PublicApiEntry; score: number }> = [];

    for (const item of this.publicApisIndex) {
      // Category filter
      if (targetCategory && targetCategory !== 'all' && item.category.toLowerCase() !== targetCategory) {
        continue;
      }

      // Auth filter
      if (targetAuth && targetAuth !== 'all') {
        if (targetAuth === 'no' && item.auth.toLowerCase() !== 'no') continue;
        if (targetAuth === 'apikey' && !item.auth.toLowerCase().includes('key')) continue;
        if (targetAuth === 'oauth' && !item.auth.toLowerCase().includes('oauth')) continue;
      }

      let score = 0;
      const apiName = item.api.toLowerCase();
      const desc = item.description.toLowerCase();
      const cat = item.category.toLowerCase();

      // If no search text, but category matches
      if (queryTerms.length === 0) {
        score = 1;
      } else {
        // Exact name match
        if (apiName === q) score += 100;
        else if (apiName.startsWith(q)) score += 50;
        else if (apiName.includes(q)) score += 30;

        // Category direct match
        if (cat.includes(q)) score += 40;

        // Term by term match
        for (const term of queryTerms) {
          if (apiName.includes(term)) score += 20;
          if (cat.includes(term)) score += 15;
          if (desc.includes(term)) score += 8;
        }
      }

      if (score > 0) {
        scored.push({ entry: item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    return {
      results: scored.slice(0, limit).map((s) => s.entry),
      totalFound: scored.length,
    };
  }

  /**
   * Get distinct categories with count
   */
  public getCategories(): Array<{ category: string; count: number }> {
    const counts: Record<string, number> = {};
    for (const item of this.publicApisIndex) {
      const cat = item.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  public getSources(): KnowledgeSource[] {
    return [...this.sources];
  }

  public addSource(sourceData: Partial<KnowledgeSource>): KnowledgeSource {
    const newSource: KnowledgeSource = {
      id: `source_${Date.now()}`,
      name: sourceData.name || 'Custom Knowledge Source',
      repoUrl: sourceData.repoUrl || '',
      rawUrl: sourceData.rawUrl,
      description: sourceData.description || 'Custom added knowledge source for Rani.',
      type: sourceData.type || 'github_repo',
      itemCount: 0,
      categoryCount: 0,
      status: 'ready',
      lastSynced: new Date().toISOString(),
      icon: sourceData.icon || '📚',
      isDefault: false,
    };

    this.sources.push(newSource);
    this.saveSources();
    return newSource;
  }

  /**
   * Format relevant knowledge entries for LLM context injection
   */
  public getContextForPrompt(userQuery: string): string {
    const isApiRelated =
      /\b(api|apis|endpoint|endpoints|service|developer|dataset|rest|graphql|sdk|documentation|public-apis|public apis)\b/i.test(userQuery) ||
      /\b(weather|crypto|cryptocurrency|currency|geocoding|anime|pokemon|stock|finance|dictionary|books|movies|spotify|music|translation|animals|dogs|cats|food|jokes)\b/i.test(userQuery);

    if (!isApiRelated) return '';

    const { results } = this.search(userQuery, { limit: 4 });
    if (results.length === 0) return '';

    const lines = [
      `[VERIFIED KNOWLEDGE SOURCE: GitHub Public APIs (https://github.com/public-apis/public-apis)]`,
      `Relevant verified public APIs matching user question:`,
    ];

    results.forEach((api, idx) => {
      lines.push(
        `${idx + 1}. **${api.api}** (${api.category}) — ${api.description}\n   - Auth: ${api.auth || 'No'} | HTTPS: ${api.https ? 'Yes' : 'No'} | CORS: ${api.cors}\n   - Docs Link: ${api.link}`
      );
    });

    lines.push(`Rani, share these exact APIs with the user in your warm, helpful Hindi/Hinglish tone!`);
    return lines.join('\n');
  }
}

export const knowledgeEngine = new KnowledgeEngine();
