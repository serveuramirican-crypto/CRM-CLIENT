'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  StickyNote,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Edit2,
  Pin,
  PinOff,
  Columns2,
  LayoutGrid,
  List,
  ExternalLink,
  Building2,
  Tag,
  Save,
  X,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Client, CustomField } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { ClientModal } from '@/components/ClientModal';
import { formatCurrency, formatDate } from '@/lib/utils';

type LayoutMode = 'grid-2' | 'grid-3' | 'list';
type SortOption = 'updated_desc' | 'created_desc' | 'value_desc' | 'name_asc';

export default function OutreachNotesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [showEmptyNotes, setShowEmptyNotes] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid-2');

  // Compare / Pin State (up to 4 clients side-by-side)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Inline Note Editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Full Client Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: clientsData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false });

      if (clientErr) throw clientErr;
      setClients(clientsData || []);

      const { data: fieldsData } = await supabase
        .from('custom_fields')
        .select('*')
        .order('order_index', { ascending: true });
      setCustomFields(fieldsData || []);
    } catch (err) {
      console.error('Error fetching outreach notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clientsWithNotes = useMemo(
    () => clients.filter((c) => Boolean(c.notes && c.notes.trim().length > 0)),
    [clients]
  );

  const uniqueNiches = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.niche && c.niche.trim()) set.add(c.niche.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const uniqueChannels = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.outreach_channel) set.add(c.outreach_channel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = clients.filter((c) => {
      const hasNote = Boolean(c.notes && c.notes.trim().length > 0);
      if (!showEmptyNotes && !hasNote) return false;

      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (channelFilter !== 'all' && c.outreach_channel !== channelFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (nicheFilter !== 'all' && (c.niche || '').trim() !== nicheFilter) return false;

      if (q) {
        const haystack = [
          c.business_name,
          c.client_name,
          c.niche,
          c.notes,
          c.outreach_channel,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'updated_desc') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'value_desc') {
        return (Number(b.estimated_value) || 0) - (Number(a.estimated_value) || 0);
      }
      return (a.business_name || '').localeCompare(b.business_name || '');
    });
  }, [
    clients,
    showEmptyNotes,
    statusFilter,
    channelFilter,
    priorityFilter,
    nicheFilter,
    searchQuery,
    sortBy,
  ]);

  const pinnedClients = useMemo(
    () =>
      pinnedIds
        .map((id) => clients.find((c) => c.id === id))
        .filter((c): c is Client => Boolean(c)),
    [pinnedIds, clients]
  );

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 4) {
        // Keep max 4 pinned for clean side-by-side comparison
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleCopyNote = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Failed to copy note:', err);
    }
  };

  const startInlineEdit = (client: Client) => {
    setEditingNoteId(client.id);
    setDraftNote(client.notes || '');
  };

  const cancelInlineEdit = () => {
    setEditingNoteId(null);
    setDraftNote('');
  };

  const saveInlineNote = async (clientId: string) => {
    try {
      setSavingNote(true);
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('clients')
        .update({ notes: draftNote, updated_at: updatedAt })
        .eq('id', clientId);

      if (error) throw error;

      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, notes: draftNote, updated_at: updatedAt } : c
        )
      );
      setEditingNoteId(null);
      setDraftNote('');
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClient.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('clients').insert([clientData]);
      if (error) throw error;
    }
    fetchData();
  };

  const highPriorityWithNotes = useMemo(
    () =>
      clientsWithNotes.filter(
        (c) => c.priority === 'high' || c.priority === 'urgent'
      ).length,
    [clientsWithNotes]
  );

  const totalNotedPipelineValue = useMemo(
    () =>
      clientsWithNotes.reduce(
        (sum, c) => sum + (Number(c.estimated_value) || 0),
        0
      ),
    [clientsWithNotes]
  );

  const gridClass =
    layoutMode === 'grid-3'
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
      : layoutMode === 'grid-2'
      ? 'grid grid-cols-1 lg:grid-cols-2 gap-5'
      : 'grid grid-cols-1 gap-4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <StickyNote className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Outreach Notes & Strategy
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review, filter, and compare all client outreach notes side-by-side to sharpen your focus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-600/25 transition-colors"
          >
            All Clients
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Clients With Notes
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{clientsWithNotes.length}</span>
            <span className="text-xs text-slate-500">/ {clients.length} total</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Niches Covered
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{uniqueNiches.length}</span>
            <span className="text-xs text-slate-500">categories</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            High / Urgent Priority
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{highPriorityWithNotes}</span>
            <span className="text-xs text-slate-500">noted leads</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Noted Pipeline Value
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">
              {formatCurrency(totalNotedPipelineValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Pinned Side-by-Side Comparison Tray */}
      {pinnedClients.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                Side-by-Side Comparison ({pinnedClients.length}/4)
              </h2>
            </div>
            <button
              onClick={() => setPinnedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Clear Comparison
            </button>
          </div>

          <div
            className={`grid gap-4 ${
              pinnedClients.length === 1
                ? 'grid-cols-1'
                : pinnedClients.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : pinnedClients.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
            }`}
          >
            {pinnedClients.map((client) => (
              <div
                key={`pin-${client.id}`}
                className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-white hover:text-indigo-300 text-sm line-clamp-1"
                    >
                      {client.business_name}
                    </Link>
                    <button
                      onClick={() => togglePin(client.id)}
                      title="Unpin"
                      className="text-indigo-400 hover:text-rose-400 p-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={client.status} />
                    <PriorityBadge priority={client.priority} />
                  </div>
                  {client.niche && (
                    <p className="text-xs text-slate-400 truncate">
                      Niche: <span className="text-slate-200">{client.niche}</span>
                    </p>
                  )}
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {client.notes || 'No notes added yet.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search, Filters & View Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inside notes, business name, niche (e.g. LOCAL BUSINESS, ACTIVE)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Layout & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="updated_desc">Recently Updated</option>
              <option value="created_desc">Newest Created</option>
              <option value="value_desc">Highest Deal Value</option>
              <option value="name_asc">Business Name (A–Z)</option>
            </select>

            <div className="flex items-center bg-slate-950/80 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setLayoutMode('grid-2')}
                title="2-Column Compare"
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'grid-2'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('grid-3')}
                title="3-Column Grid"
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'grid-3'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                title="Focus List"
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-800/80">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="lead">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="meeting_booked">Meeting Booked</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Closed / Won</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Channels</option>
            {uniqueChannels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent 🔥</option>
          </select>

          {uniqueNiches.length > 0 && (
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
            >
              <option value="all">All Niches</option>
              {uniqueNiches.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
          )}

          <label className="inline-flex items-center gap-2 ml-auto text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showEmptyNotes}
              onChange={(e) => setShowEmptyNotes(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            Include clients without notes
          </label>
        </div>
      </div>

      {/* Notes Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-56 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <StickyNote className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No outreach notes found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {clientsWithNotes.length === 0
              ? 'Add Outreach Notes / Strategy to any client in All Clients and they will appear here for easy comparison.'
              : 'No notes match your current search or filter criteria.'}
          </p>
          {(searchQuery ||
            statusFilter !== 'all' ||
            channelFilter !== 'all' ||
            priorityFilter !== 'all' ||
            nicheFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setChannelFilter('all');
                setPriorityFilter('all');
                setNicheFilter('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className={gridClass}>
          {filteredClients.map((client) => {
            const isPinned = pinnedIds.includes(client.id);
            const isEditingThis = editingNoteId === client.id;
            const hasNote = Boolean(client.notes && client.notes.trim().length > 0);
            const firstLink = client.platform_links?.[0];

            return (
              <div
                key={client.id}
                className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                  isPinned
                    ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-base font-bold text-white hover:text-indigo-300 truncate transition-colors"
                        >
                          {client.business_name}
                        </Link>
                      </div>
                      {client.client_name && (
                        <p className="text-xs text-slate-400 mt-0.5 pl-6 truncate">
                          Contact: {client.client_name}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePin(client.id)}
                        title={isPinned ? 'Remove from comparison' : 'Pin to compare side-by-side'}
                        className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                          isPinned
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                            : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                        }`}
                      >
                        {isPinned ? (
                          <>
                            <PinOff className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pinned</span>
                          </>
                        ) : (
                          <>
                            <Pin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Compare</span>
                          </>
                        )}
                      </button>

                      {hasNote && (
                        <button
                          onClick={() => handleCopyNote(client.id, client.notes || '')}
                          title="Copy note"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        >
                          {copiedId === client.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setIsClientModalOpen(true);
                        }}
                        title="Edit full client details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={client.status} />
                    <PriorityBadge priority={client.priority} />
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {client.outreach_channel}
                    </span>
                    {client.niche && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                        <Tag className="w-3 h-3" />
                        {client.niche}
                      </span>
                    )}
                    {Number(client.estimated_value) > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                        {formatCurrency(client.estimated_value)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Outreach Notes / Strategy Body */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Outreach Notes / Strategy
                    </span>
                    {!isEditingThis && (
                      <button
                        onClick={() => startInlineEdit(client)}
                        className="text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        {hasNote ? 'Quick Edit' : '+ Add Note'}
                      </button>
                    )}
                  </div>

                  {isEditingThis ? (
                    <div className="space-y-2">
                      <textarea
                        rows={5}
                        value={draftNote}
                        onChange={(e) => setDraftNote(e.target.value)}
                        placeholder="-STATUE : ACTIVE&#10;-PRODUCT: ...&#10;-THE PROBLEM : ..."
                        className="w-full px-3 py-2.5 bg-slate-950 border border-indigo-500/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelInlineEdit}
                          disabled={savingNote}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveInlineNote(client.id)}
                          disabled={savingNote}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {savingNote ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>
                    </div>
                  ) : hasNote ? (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {client.notes}
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-3.5 text-xs text-slate-500 italic">
                      No outreach notes added for this client yet.
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-500">
                  <span>Updated {formatDate(client.updated_at)}</span>
                  <div className="flex items-center gap-3">
                    {firstLink?.url && (
                      <a
                        href={firstLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        {firstLink.platform}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Edit Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
        customFields={customFields}
      />
    </div>
  );
}
