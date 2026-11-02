'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Columns,
  List,
  Sparkles,
  ArrowUpDown,
  Building2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Client, CustomField, OutreachTemplate, ClientStatus } from '@/lib/types';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ClientModal } from '@/components/ClientModal';
import { QuickMessageModal } from '@/components/QuickMessageModal';
import { ActivityLogModal } from '@/components/ActivityLogModal';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [activeQuickMessageClient, setActiveQuickMessageClient] = useState<Client | null>(null);
  const [activeActivityClient, setActiveActivityClient] = useState<Client | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch clients
      const { data: clientsData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientErr) throw clientErr;
      setClients(clientsData || []);

      // 2. Fetch custom fields
      const { data: fieldsData, error: fieldErr } = await supabase
        .from('custom_fields')
        .select('*')
        .order('order_index', { ascending: true });

      if (fieldErr) throw fieldErr;
      setCustomFields(fieldsData || []);

      // 3. Fetch outreach templates
      const { data: templatesData, error: tmplErr } = await supabase
        .from('outreach_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (tmplErr) throw tmplErr;
      setTemplates(templatesData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save client handler (create or update)
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

  // Change status (e.g. from kanban drag / select)
  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      // Optimistic update
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
      );

      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', clientId);

      if (error) {
        console.error('Status update error:', error);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  // Log activity from quick message modal
  const handleLogQuickActivity = async (content: string, type: any) => {
    if (!activeQuickMessageClient) return;
    try {
      await supabase.from('outreach_activities').insert([
        {
          client_id: activeQuickMessageClient.id,
          type,
          subject: 'Quick Outreach DM / Email',
          content,
          activity_date: new Date().toISOString(),
        },
      ]);
      await supabase
        .from('clients')
        .update({
          last_contact_date: new Date().toISOString(),
          status:
            activeQuickMessageClient.status === 'lead'
              ? 'contacted'
              : activeQuickMessageClient.status,
        })
        .eq('id', activeQuickMessageClient.id);

      fetchData();
    } catch (e) {
      console.error('Failed to log quick activity:', e);
    }
  };

  // Filtered clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.client_name &&
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.niche && client.niche.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesChannel =
      channelFilter === 'all' ||
      client.outreach_channel?.toLowerCase() === channelFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Calculate Metrics
  const totalLeads = clients.length;
  const contactedLeads = clients.filter(
    (c) => c.status === 'contacted' || c.status === 'follow_up'
  ).length;
  const bookedMeetings = clients.filter((c) => c.status === 'meeting_booked').length;
  const totalPipelineValue = clients.reduce(
    (sum, c) => sum + (c.estimated_value || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Outreach & Client Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live CRM
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track leads from initial Instagram / Cold Outreach contact to closed deals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Add Prospect / Lead
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Prospects
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{totalLeads}</div>
          <p className="text-xs text-slate-500 mt-1">Active in CRM database</p>
        </div>

        {/* Contacted */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Outreach / Contacted
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-300 mt-3">{contactedLeads}</div>
          <p className="text-xs text-slate-500 mt-1">DMs or emails sent</p>
        </div>

        {/* Meetings Booked */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Meetings Booked
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3">{bookedMeetings}</div>
          <p className="text-xs text-slate-500 mt-1">High conversion opportunities</p>
        </div>

        {/* Pipeline Value */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pipeline Value ($)
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {formatCurrency(totalPipelineValue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Estimated active deal worth</p>
        </div>
      </div>

      {/* Filter and View Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business name, contact, niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Channels</option>
            <option value="Instagram">Instagram</option>
            <option value="Email">Email</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Phone">Phone</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Stages</option>
            <option value="lead">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="meeting_booked">Meeting Booked</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Closed / Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* View Toggle (Kanban vs Table) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Pipeline Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          Loading your outreach pipeline...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No prospects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || channelFilter !== 'all' || statusFilter !== 'all'
              ? 'Try clearing your search filters to view all prospects.'
              : 'Start your outreach by adding your first business prospect!'}
          </p>
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add First Prospect
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          clients={filteredClients}
          onStatusChange={handleStatusChange}
          onOpenQuickMessage={(client) => setActiveQuickMessageClient(client)}
          onOpenActivityLog={(client) => setActiveActivityClient(client)}
          onEditClient={(client) => {
            setEditingClient(client);
            setIsClientModalOpen(true);
          }}
        />
      ) : (
        /* Table View */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Business & Contact</th>
                  <th className="py-3 px-4">Social / Links</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Next Follow-Up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredClients.map((client) => {
                  const igLink = client.platform_links?.find(
                    (l) => l.platform.toLowerCase() === 'instagram'
                  );
                  const firstLink = igLink || client.platform_links?.[0];

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors block text-sm"
                        >
                          {client.business_name}
                        </Link>
                        {client.client_name && (
                          <span className="text-slate-400 block text-[11px] mt-0.5">
                            {client.client_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {firstLink ? (
                          <a
                            href={
                              firstLink.url.startsWith('http')
                                ? firstLink.url
                                : `https://${firstLink.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            <span>{firstLink.platform}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">No links</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {client.outreach_channel || 'Instagram'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">
                        {client.estimated_value ? formatCurrency(client.estimated_value) : '$0'}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={client.priority} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatDate(client.next_follow_up_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveQuickMessageClient(client)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            title="Quick Outreach Message"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setIsClientModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Modal */}
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

      {/* Quick Outreach Message Modal */}
      {activeQuickMessageClient && (
        <QuickMessageModal
          isOpen={Boolean(activeQuickMessageClient)}
          onClose={() => setActiveQuickMessageClient(null)}
          client={activeQuickMessageClient}
          templates={templates}
          onLogActivity={handleLogQuickActivity}
        />
      )}

      {/* Activity Log Modal */}
      {activeActivityClient && (
        <ActivityLogModal
          isOpen={Boolean(activeActivityClient)}
          onClose={() => setActiveActivityClient(null)}
          client={activeActivityClient}
          onActivityAdded={() => fetchData()}
        />
      )}
    </div>
  );
}

