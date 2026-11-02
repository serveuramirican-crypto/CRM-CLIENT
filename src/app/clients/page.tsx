'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Edit2,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Client, CustomField, OutreachTemplate, ClientStatus } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { ClientModal } from '@/components/ClientModal';
import { QuickMessageModal } from '@/components/QuickMessageModal';
import { ActivityLogModal } from '@/components/ActivityLogModal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeQuickMessageClient, setActiveQuickMessageClient] = useState<Client | null>(null);
  const [activeActivityClient, setActiveActivityClient] = useState<Client | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: clientsData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientErr) throw clientErr;
      setClients(clientsData || []);

      const { data: fieldsData } = await supabase
        .from('custom_fields')
        .select('*')
        .order('order_index', { ascending: true });
      setCustomFields(fieldsData || []);

      const { data: tmplData } = await supabase
        .from('outreach_templates')
        .select('*')
        .order('created_at', { ascending: false });
      setTemplates(tmplData || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete prospect "${name}"?`)) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (clients.length === 0) return;

    const headers = [
      'Business Name',
      'Client Name',
      'Email',
      'Phone',
      'Status',
      'Channel',
      'Priority',
      'Estimated Value',
      'Platform Links',
      'Notes',
    ];

    const rows = filteredClients.map((c) => [
      `"${c.business_name || ''}"`,
      `"${c.client_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.status || ''}"`,
      `"${c.outreach_channel || ''}"`,
      `"${c.priority || ''}"`,
      `"${c.estimated_value || 0}"`,
      `"${(c.platform_links || []).map((l) => `${l.platform}: ${l.url}`).join(' | ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.client_name && c.client_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || c.outreach_channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              All Clients & Prospects
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {filteredClients.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete database of prospects with social links, custom fields, and outreach tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search business, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-300 text-xs"
          >
            <option value="all">All Stages</option>
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
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-300 text-xs"
          >
            <option value="all">All Channels</option>
            <option value="Instagram">Instagram</option>
            <option value="Email">Email</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Phone">Phone</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Business & Contact</th>
                <th className="py-3 px-4">Direct Social Links</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Custom Properties</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No clients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const igLink = client.platform_links?.find(
                    (l) => l.platform.toLowerCase() === 'instagram'
                  );
                  const firstLink = igLink || client.platform_links?.[0];

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Business & Contact */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm"
                        >
                          {client.business_name}
                        </Link>
                        {client.client_name && (
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {client.client_name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                          )}
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Social & Platform Links */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {client.platform_links && client.platform_links.length > 0 ? (
                            client.platform_links.map((link, i) => (
                              <a
                                key={i}
                                href={
                                  link.url.startsWith('http')
                                    ? link.url
                                    : `https://${link.url}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
                              >
                                <span>{link.platform}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))
                          ) : (
                            <span className="text-slate-600 italic text-[11px]">No links</span>
                          )}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {client.outreach_channel || 'Instagram'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={client.status} />
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={client.priority} />
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">
                        {client.estimated_value ? formatCurrency(client.estimated_value) : '$0'}
                      </td>

                      {/* Custom Fields Summary */}
                      <td className="py-3.5 px-4">
                        {client.custom_field_values &&
                        Object.keys(client.custom_field_values).length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Object.entries(client.custom_field_values)
                              .slice(0, 2)
                              .map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400"
                                >
                                  {k}: <strong className="text-slate-300">{String(v)}</strong>
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveQuickMessageClient(client)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                            title="Quick Outreach Message"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveActivityClient(client)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            title="Log Activity"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setIsClientModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClient(client.id, client.business_name)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          onLogActivity={async (content, type) => {
            await supabase.from('outreach_activities').insert([
              {
                client_id: activeQuickMessageClient.id,
                type,
                subject: 'Quick Message',
                content,
                activity_date: new Date().toISOString(),
              },
            ]);
            fetchData();
          }}
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

