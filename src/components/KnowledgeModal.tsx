import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Filter,
  Sparkles,
  Layers,
  Globe,
  Database,
  Shield,
  MessageSquare,
  ChevronRight,
  Code,
  Zap,
} from 'lucide-react';
import { KnowledgeSource, PublicApiEntry } from '../types';
import { knowledgeService } from '../services/knowledgeService';
import { raniTTS } from '../services/ttsService';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskRani?: (query: string) => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  onAskRani,
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'explore' | 'add'>('sources');
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  const [syncFeedback, setSyncFeedback] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);

  // Explorer state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuth, setSelectedAuth] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<PublicApiEntry[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New source form state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceRepoUrl, setNewSourceRepoUrl] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSources();
      loadCategories();
      executeSearch();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'explore') {
      const timer = setTimeout(() => {
        executeSearch();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, selectedAuth, activeTab]);

  const loadSources = async () => {
    const data = await knowledgeService.getSources();
    setSources(data);
  };

  const loadCategories = async () => {
    const cats = await knowledgeService.getCategories();
    setCategories(cats);
  };

  const executeSearch = async () => {
    setIsSearching(true);
    try {
      const res = await knowledgeService.searchKnowledge(searchQuery, {
        category: selectedCategory,
        auth: selectedAuth,
        limit: 24,
      });
      setSearchResults(res.results);
      setTotalFound(res.totalFound);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    setIsSyncing((prev) => ({ ...prev, [sourceId]: true }));
    setSyncFeedback(null);

    const result = await knowledgeService.syncSource(sourceId);
    setIsSyncing((prev) => ({ ...prev, [sourceId]: false }));

    if (result.success) {
      setSyncFeedback({
        id: sourceId,
        message: `Sync successful! ${result.itemCount} APIs indexed across ${result.categories} categories.`,
        type: 'success',
      });
      loadSources();
      loadCategories();
      executeSearch();

      raniTTS.speak(
        'Public APIs Knowledge Source successfully update ho gaya hai! Ab mere paas latest APIs ki jankari hai 💕',
        { emotion: 'excited' }
      );
    } else {
      setSyncFeedback({
        id: sourceId,
        message: result.message || 'Sync failed',
        type: 'error',
      });
    }

    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleAddCustomSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceRepoUrl.trim()) return;

    setIsAddingSource(true);
    const added = await knowledgeService.addSource({
      name: newSourceName.trim(),
      repoUrl: newSourceRepoUrl.trim(),
      description: newSourceDesc.trim() || 'Custom knowledge repository for Rani.',
      type: 'github_repo',
      icon: '📚',
    });

    setIsAddingSource(false);
    if (added) {
      setNewSourceName('');
      setNewSourceRepoUrl('');
      setNewSourceDesc('');
      setActiveTab('sources');
      loadSources();
      raniTTS.speak('Naya Knowledge Source add ho gaya hai dost!', { emotion: 'happy' });
    }
  };

  const handleAskAboutApi = (api: PublicApiEntry) => {
    onClose();
    const query = `Mujhe ${api.api} API (${api.category}) ke baare me batao. Iski description hai: "${api.description}" aur link hai: ${api.link}`;
    onAskRani?.(query);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border-b border-purple-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">
                  Rani Knowledge Hub & Public APIs
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  GitHub Knowledge Source
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Live Retrieval Connected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Rani references 2,000+ indexed public APIs from GitHub to answer developer & service queries instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-5 bg-slate-950/60 border-b border-purple-500/10 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sources'
                ? 'border-pink-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>Knowledge Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Explore Public APIs Index ({totalFound})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Knowledge Source</span>
          </button>
        </div>

        {/* Sync feedback banner */}
        {syncFeedback && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-center gap-2 animate-scale-up ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
        )}

        {/* Tab 1: Knowledge Sources */}
        {activeTab === 'sources' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {sources.map((source) => {
                const syncing = isSyncing[source.id];
                return (
                  <div
                    key={source.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                          {source.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">
                              {source.name}
                            </h4>
                            {source.isDefault && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                                Primary Source
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 border ${
                                source.status === 'connected'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : source.status === 'syncing'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  source.status === 'connected'
                                    ? 'bg-emerald-400'
                                    : source.status === 'syncing'
                                    ? 'bg-amber-400 animate-ping'
                                    : 'bg-rose-400'
                                }`}
                              />
                              {source.status === 'connected'
                                ? 'Connected'
                                : source.status === 'syncing'
                                ? 'Syncing...'
                                : 'Error'}
                            </span>
                          </div>

                          <a
                            href={source.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 mt-1 hover:underline"
                          >
                            <span>{source.repoUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {source.description}
                          </p>
                        </div>
                      </div>

                      {/* Sync Button */}
                      <button
                        onClick={() => handleSyncSource(source.id)}
                        disabled={syncing}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start ${
                          syncing
                            ? 'bg-purple-900/50 text-purple-300 cursor-wait'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md shadow-pink-600/25'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                        <span>{syncing ? 'Syncing Knowledge...' : 'Sync Knowledge'}</span>
                      </button>
                    </div>

                    {/* Metadata strip */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-purple-400" />
                          <strong className="text-white">{source.itemCount.toLocaleString()}</strong> APIs Indexed
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-white">{source.categoryCount}</strong> Categories
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-pink-400" />
                          Indexed Cache Active
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Last Synced: {formatTime(source.lastSynced)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Architecture Explainer Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                How Rani uses this Knowledge Source:
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you ask Rani about any public API (e.g. <em>"Muje free weather forecast API batao"</em> or <em>"Crypto prices ke liye konsi API use karein?"</em>),
                Rani executes a semantic indexed retrieval on this knowledge base to give verified recommendations, links, and authentication requirements in natural Hindi/English.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Explore Public APIs */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search & Filter Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-purple-500/10 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search APIs (e.g. weather, crypto, anime, payment, spotify, geocoding)..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Auth Filter */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Auth:
                  </span>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'no', label: 'Free (No Key)' },
                    { id: 'apikey', label: 'API Key' },
                    { id: 'oauth', label: 'OAuth' },
                  ].map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAuth(a.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        selectedAuth === a.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.slice(0, 15).map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.category
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.category} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {searchResults.map((api, idx) => (
                  <div
                    key={`${api.api}-${idx}`}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Name & Category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                          {api.api}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-mono border border-purple-800/40 whitespace-nowrap">
                          {api.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 mb-3 line-clamp-3 leading-relaxed">
                        {api.description}
                      </p>
                    </div>

                    <div>
                      {/* Badges: Auth, HTTPS, CORS */}
                      <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-slate-800/60">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            api.auth.toLowerCase() === 'no'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          Auth: {api.auth || 'No'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          HTTPS: {api.https ? 'Yes' : 'No'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          CORS: {api.cors}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <a
                          href={api.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Docs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleAskAboutApi(api)}
                          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-pink-600/20 cursor-pointer"
                          title="Ask Rani to explain this API"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Pucho</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {searchResults.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm">Koi bhi API match nahi hui.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedAuth('all');
                    }}
                    className="mt-2 text-xs text-pink-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Add Knowledge Source */}
        {activeTab === 'add' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <form
              onSubmit={handleAddCustomSource}
              className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-4 max-w-2xl mx-auto"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-pink-400" />
                  Add New GitHub / Markdown Knowledge Source
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Connect additional GitHub repositories or API catalogs into Rani's knowledge retrieval index
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Knowledge Source Name
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Awesome Open Source APIs, Medical Datasets"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub Repository / Documentation URL
                </label>
                <input
                  type="url"
                  value={newSourceRepoUrl}
                  onChange={(e) => setNewSourceRepoUrl(e.target.value)}
                  placeholder="https://github.com/organization/repository"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description & Context
                </label>
                <textarea
                  value={newSourceDesc}
                  onChange={(e) => setNewSourceDesc(e.target.value)}
                  placeholder="Briefly describe what information this source provides..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sources')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingSource}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {isAddingSource ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding Source...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Knowledge Source</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Connected Source: <strong className="text-white">Public APIs (2,058 indexed)</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
