'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Mail,
  Send,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OutreachTemplate } from '@/lib/types';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New template fields
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Copied state indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('outreach_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInsertVariable = (variable: string) => {
    setContent((prev) => `${prev}${variable}`);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('outreach_templates').insert([
        {
          title: title.trim(),
          channel: channel.trim(),
          content: content.trim(),
        },
      ]);

      if (error) throw error;

      setTitle('');
      setContent('');
      setChannel('Instagram');
      setIsCreating(false);
      fetchTemplates();
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Failed to create template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this outreach template?')) return;

    try {
      const { error } = await supabase.from('outreach_templates').delete().eq('id', id);
      if (error) throw error;
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Outreach Message Templates
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              DMs & Cold Pitching
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Pre-saved outreach scripts for Instagram, LinkedIn, and Email with dynamic variables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTemplates()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Close Form' : 'New Template'}
          </button>
        </div>
      </div>

      {/* Creator Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTemplate}
          className="p-6 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-2 text-indigo-400 pb-2 border-b border-slate-800">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-base font-semibold text-white">Create New Script Template</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Template Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IG DM - Free Website Audit Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Platform / Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="Phone">Phone / Cold Call Script</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Script Content <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Insert tag:</span>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{{client_name}}')}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-400 hover:bg-slate-700 font-mono"
                >
                  &#123;&#123;client_name&#125;&#125;
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{{business_name}}')}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-400 hover:bg-slate-700 font-mono"
                >
                  &#123;&#123;business_name&#125;&#125;
                </button>
              </div>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Write your pitch or follow-up here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-all"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-500 text-sm">
            Loading outreach templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
            No templates created yet. Click "New Template" to add one!
          </div>
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                      {tmpl.channel}
                    </span>
                    <h3 className="font-semibold text-slate-100 text-sm">
                      {tmpl.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(tmpl.id, tmpl.content)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Copy Raw Template"
                    >
                      {copiedId === tmpl.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {tmpl.content}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Variables: &#123;&#123;client_name&#125;&#125;, &#123;&#123;business_name&#125;&#125;</span>
                <span className="text-indigo-400">Ready for Quick Outreach</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

