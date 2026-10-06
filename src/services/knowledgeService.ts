import { KnowledgeSource, KnowledgeSearchResponse, PublicApiEntry } from '../types';

class KnowledgeService {
  public async getSources(): Promise<KnowledgeSource[]> {
    try {
      const res = await fetch('/api/knowledge/sources');
      if (!res.ok) throw new Error('Failed to fetch sources');
      const data = await res.json();
      return data.sources || [];
    } catch (e) {
      console.warn('KnowledgeService getSources error:', e);
      return [];
    }
  }

  public async syncSource(
    sourceId: string = 'source_public_apis'
  ): Promise<{ success: boolean; itemCount: number; categories: number; message: string }> {
    try {
      const res = await fetch(`/api/knowledge/sync/${encodeURIComponent(sourceId)}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Sync HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      console.warn('KnowledgeService sync error:', e);
      return {
        success: false,
        itemCount: 0,
        categories: 0,
        message: e?.message || 'Sync failed',
      };
    }
  }

  public async searchKnowledge(
    query: string,
    options?: {
      category?: string;
      auth?: string;
      limit?: number;
    }
  ): Promise<KnowledgeSearchResponse> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (options?.category && options.category !== 'all') {
        params.append('category', options.category);
      }
      if (options?.auth && options.auth !== 'all') {
        params.append('auth', options.auth);
      }
      if (options?.limit) params.append('limit', options.limit.toString());

      const res = await fetch(`/api/knowledge/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch (e) {
      console.warn('KnowledgeService search error:', e);
      return {
        query,
        totalFound: 0,
        results: [],
        source: {
          id: 'source_public_apis',
          name: 'Public APIs (GitHub)',
          repoUrl: 'https://github.com/public-apis/public-apis',
          lastSynced: new Date().toISOString(),
        },
      };
    }
  }

  public async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const res = await fetch('/api/knowledge/categories');
      if (!res.ok) throw new Error('Categories fetch failed');
      const data = await res.json();
      return data.categories || [];
    } catch (e) {
      console.warn('KnowledgeService getCategories error:', e);
      return [];
    }
  }

  public async addSource(source: Partial<KnowledgeSource>): Promise<KnowledgeSource | null> {
    try {
      const res = await fetch('/api/knowledge/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source),
      });
      if (!res.ok) throw new Error('Add source failed');
      const data = await res.json();
      return data.source || null;
    } catch (e) {
      console.warn('KnowledgeService addSource error:', e);
      return null;
    }
  }
}

export const knowledgeService = new KnowledgeService();
