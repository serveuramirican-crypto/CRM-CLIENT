'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, MessageSquare, Mail, Phone, Video, FileText, CheckCircle2 } from 'lucide-react';
import { Client, OutreachActivity } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onActivityAdded?: () => void;
}

const ACTIVITY_TYPES: { id: OutreachActivity['type']; label: string; icon: any; color: string }[] = [
  { id: 'dm_sent', label: 'DM Sent (IG/LinkedIn)', icon: MessageSquare, color: 'text-pink-400 bg-pink-500/10' },
  { id: 'email_sent', label: 'Email Sent', icon: Mail, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'call', label: 'Phone Call', icon: Phone, color: 'text-amber-400 bg-amber-500/10' },
  { id: 'meeting', label: 'Meeting Held', icon: Video, color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'reply_received', label: 'Reply Received', icon: CheckCircle2, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'note', label: 'General Note', icon: FileText, color: 'text-slate-400 bg-slate-500/10' },
];

export function ActivityLogModal({
  isOpen,
  onClose,
  client,
  onActivityAdded,
}: ActivityLogModalProps) {
  const [activities, setActivities] = useState<OutreachActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New activity form
  const [type, setType] = useState<OutreachActivity['type']>('dm_sent');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('outreach_activities')
        .select('*')
        .eq('client_id', client.id)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && client.id) {
      fetchActivities();
      setShowAddForm(false);
      setContent('');
      setSubject('');
    }
  }, [isOpen, client.id]);

  if (!isOpen) return null;

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('outreach_activities').insert([
        {
          client_id: client.id,
          type,
          subject: subject.trim(),
          content: content.trim(),
          activity_date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Also update client's last_contact_date
      await supabase
        .from('clients')
        .update({ last_contact_date: new Date().toISOString() })
        .eq('id', client.id);

      setContent('');
      setSubject('');
      setShowAddForm(false);
      fetchActivities();
      onActivityAdded && onActivityAdded();
    } catch (err) {
      console.error('Failed to create activity:', err);
      alert('Error creating activity log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Activity & Outreach Log
              <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {client.business_name}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Track all touchpoints, replies, and meetings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add activity toggle */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Touchpoints History ({activities.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'Hide Form' : 'Log New Activity'}
            </button>
          </div>

          {/* New Activity Form */}
          {showAddForm && (
            <form onSubmit={handleCreateActivity} className="p-4 bg-slate-950/60 border border-indigo-500/30 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Activity Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Subject / Topic (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sent IG Pitch V2"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Details / Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What was said, response details, next action..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
                >
                  {saving ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline List */}
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              No outreach touchpoints logged yet. Click "Log New Activity" or use "Quick Outreach" to log one!
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {activities.map((act) => {
                const conf = ACTIVITY_TYPES.find((t) => t.id === act.type) || ACTIVITY_TYPES[0];
                const Icon = conf.icon;

                return (
                  <div key={act.id} className="relative flex items-start gap-3 pl-1">
                    <div className={`p-1.5 rounded-lg border border-slate-700 z-10 bg-slate-900 ${conf.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">
                          {act.subject || conf.label}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(act.activity_date || act.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {act.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

