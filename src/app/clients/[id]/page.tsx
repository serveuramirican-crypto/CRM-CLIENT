'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
  Layers,
  Save,
  Check,
  Clock,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Client, CustomField, OutreachTemplate, ClientStatus } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { CustomFieldRenderer } from '@/components/CustomFieldRenderer';
import { ClientModal } from '@/components/ClientModal';
import { QuickMessageModal } from '@/components/QuickMessageModal';
import { ActivityLogModal } from '@/components/ActivityLogModal';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // In-place editing custom field values
  const [editingCustomValues, setEditingCustomValues] = useState<Record<string, any>>({});
  const [isEditingCustomFields, setIsEditingCustomFields] = useState(false);
  const [savingCustomFields, setSavingCustomFields] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuickMessageOpen, setIsQuickMessageOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const fetchClientData = async () => {
    if (!clientId) return;
    try {
      setLoading(true);

      // Fetch client
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr) throw clientErr;
      setClient(clientData);
      setEditingCustomValues(clientData.custom_field_values || {});

      // Fetch custom fields
      const { data: fieldsData } = await supabase
        .from('custom_fields')
        .select('*')
        .order('order_index', { ascending: true });
      setCustomFields(fieldsData || []);

      // Fetch templates
      const { data: tmplData } = await supabase
        .from('outreach_templates')
        .select('*')
        .order('created_at', { ascending: false });
      setTemplates(tmplData || []);
    } catch (err) {
      console.error('Error fetching client details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const handleSaveCustomFields = async () => {
    if (!client) return;
    setSavingCustomFields(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          custom_field_values: editingCustomValues,
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (error) throw error;
      setClient({ ...client, custom_field_values: editingCustomValues });
      setIsEditingCustomFields(false);
    } catch (err) {
      console.error('Failed to save custom fields:', err);
      alert('Failed to save custom fields.');
    } finally {
      setSavingCustomFields(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ClientStatus) => {
    if (!client) return;
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', client.id);

      if (error) throw error;
      setClient({ ...client, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    if (!confirm(`Delete "${client.business_name}" permanently?`)) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;
      router.push('/clients');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        Loading client profile...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Client Not Found</h2>
        <Link
          href="/clients"
          className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients List
        </Link>
      </div>
    );
  }

  const igLink = client.platform_links?.find(
    (l) => l.platform.toLowerCase() === 'instagram'
  );
  const primaryLink = igLink || client.platform_links?.[0];

  return (
    <div className="space-y-6">
      {/* Back button & quick bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prospects Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={handleDeleteClient}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            title="Delete Prospect"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Client Profile Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {client.business_name}
              </h1>
              <StatusBadge status={client.status} />
              <PriorityBadge priority={client.priority} />
            </div>

            {client.client_name && (
              <p className="text-slate-300 text-sm flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-slate-500" />
                Contact: <span className="text-indigo-300">{client.client_name}</span>
              </p>
            )}

            {/* Direct contact items */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {client.phone}
                </a>
              )}
              {client.niche && (
                <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-full text-slate-300">
                  Niche: {client.niche}
                </span>
              )}
            </div>

            {/* Platform links */}
            {client.platform_links && client.platform_links.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {client.platform_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
                  >
                    <span>{link.platform}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Outreach CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:min-w-[220px]">
            <button
              onClick={() => setIsQuickMessageOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              Quick Outreach Message
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Log Outreach Touchpoint
            </button>

            {/* Quick Status Stage Dropdown */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Change Pipeline Stage:
              </label>
              <select
                value={client.status}
                onChange={(e) => handleUpdateStatus(e.target.value as ClientStatus)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg font-medium"
              >
                <option value="lead">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="meeting_booked">Meeting Booked</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed / Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pipeline Details bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
              Estimated Deal Value
            </span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
              {client.estimated_value ? formatCurrency(client.estimated_value) : '$0'}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
              Primary Channel
            </span>
            <span className="text-base font-semibold text-slate-200 mt-0.5 block">
              {client.outreach_channel || 'Instagram'}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
              Next Follow-Up
            </span>
            <span className="text-sm font-medium text-slate-300 mt-0.5 block">
              {formatDate(client.next_follow_up_date)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
              Last Contacted
            </span>
            <span className="text-sm font-medium text-slate-300 mt-0.5 block">
              {formatDate(client.last_contact_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Dynamic Custom Fields + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Custom Fields Box */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white">Custom Defined Fields</h2>
                <p className="text-xs text-slate-400">
                  Properties configured via your dynamic custom field builder ("كيما بغيتي")
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditingCustomFields ? (
                <>
                  <button
                    onClick={() => {
                      setEditingCustomValues(client.custom_field_values || {});
                      setIsEditingCustomFields(false);
                    }}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomFields}
                    disabled={savingCustomFields}
                    className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingCustomFields ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingCustomFields(true)}
                  className="px-3 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Values
                </button>
              )}
            </div>
          </div>

          {customFields.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No custom fields defined yet.{' '}
              <Link href="/custom-fields" className="text-indigo-400 hover:underline">
                Go to Custom Fields Builder
              </Link>{' '}
              to add fields like Follower Count, Budget, etc.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {customFields.map((field) => {
                const val = isEditingCustomFields
                  ? editingCustomValues[field.field_key]
                  : client.custom_field_values?.[field.field_key];

                return (
                  <div
                    key={field.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5"
                  >
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {field.field_label}
                    </label>
                    <CustomFieldRenderer
                      field={field}
                      value={val}
                      readOnly={!isEditingCustomFields}
                      onChange={(newVal) =>
                        setEditingCustomValues((prev) => ({
                          ...prev,
                          [field.field_key]: newVal,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Strategy Notes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2">Outreach Strategy & Notes</h2>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[160px]">
              {client.notes ? client.notes : <span className="text-slate-500 italic">No notes recorded yet.</span>}
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Notes & General Info
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (updated) => {
          const { error } = await supabase
            .from('clients')
            .update({ ...updated, updated_at: new Date().toISOString() })
            .eq('id', client.id);

          if (error) throw error;
          fetchClientData();
        }}
        client={client}
        customFields={customFields}
      />

      {/* Quick Message Modal */}
      <QuickMessageModal
        isOpen={isQuickMessageOpen}
        onClose={() => setIsQuickMessageOpen(false)}
        client={client}
        templates={templates}
        onLogActivity={async (content, type) => {
          await supabase.from('outreach_activities').insert([
            {
              client_id: client.id,
              type,
              subject: 'Quick Message',
              content,
              activity_date: new Date().toISOString(),
            },
          ]);
          fetchClientData();
        }}
      />

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        client={client}
        onActivityAdded={() => fetchClientData()}
      />
    </div>
  );
}

