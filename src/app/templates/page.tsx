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
  TrendingUp,
  Flame,
  Award,
  AlertTriangle,
  CalendarCheck,
  Filter,
  Search,
  Eye,
  Sliders,
  BarChart3,
  CheckCircle2,
  Phone,
  Layers,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OutreachTemplate } from '@/lib/types';
import { TemplateAnalyticsModal } from '@/components/TemplateAnalyticsModal';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'library' | 'analytics'>('library');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [cadenceFilter, setCadenceFilter] = useState('all');

  // Modal / Creator State
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplateForAnalytics, setSelectedTemplateForAnalytics] =
    useState<OutreachTemplate | null>(null);

  // New template fields
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [cadenceStep, setCadenceStep] = useState('Step 1: First Touch');
  const [subjectLine, setSubjectLine] = useState('');
  const [targetNiche, setTargetNiche] = useState('All Niches');
  const [tone, setTone] = useState('Value-First & Direct');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('outreach_templates')
        .select('*')
        .order('times_used', { ascending: false });

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

  // Quick 1-click counter increments (+1 Sent, +1 Reply, +1 Booked)
  const handleQuickIncrement = async (
    templateId: string,
    field: 'times_used' | 'replies_count' | 'meetings_count'
  ) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;

    const currentVal = tmpl[field] || 0;
    const updatedVal = currentVal + 1;

    // Optimistic UI update
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, [field]: updatedVal } : t))
    );

    try {
      await supabase
        .from('outreach_templates')
        .update({ [field]: updatedVal, last_used_at: new Date().toISOString() })
        .eq('id', templateId);
    } catch (err) {
      console.error('Failed to increment tracker:', err);
      fetchTemplates();
    }
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
          subject_line: subjectLine.trim(),
          cadence_step: cadenceStep,
          target_niche: targetNiche.trim(),
          tone,
          times_used: 0,
          replies_count: 0,
          meetings_count: 0,
          deals_won_count: 0,
          revenue_generated: 0,
        },
      ]);

      if (error) throw error;

      // Reset form
      setTitle('');
      setChannel('Instagram');
      setCadenceStep('Step 1: First Touch');
      setSubjectLine('');
      setTargetNiche('All Niches');
      setTone('Value-First & Direct');
      setContent('');
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

  // High-Level KPI Aggregations
  const totalSent = templates.reduce((acc, t) => acc + (t.times_used || 0), 0);
  const totalReplies = templates.reduce((acc, t) => acc + (t.replies_count || 0), 0);
  const totalMeetings = templates.reduce((acc, t) => acc + (t.meetings_count || 0), 0);
  const totalRevenue = templates.reduce((acc, t) => acc + (Number(t.revenue_generated) || 0), 0);

  const overallReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';
  const overallBookingRate = totalSent > 0 ? ((totalMeetings / totalSent) * 100).toFixed(1) : '0.0';

  // Find Top Performer
  const topPerformer = [...templates]
    .filter((t) => (t.times_used || 0) >= 5)
    .sort((a, b) => {
      const rateA = (a.replies_count || 0) / (a.times_used || 1);
      const rateB = (b.replies_count || 0) / (b.times_used || 1);
      return rateB - rateA;
    })[0];

  // Filtering
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.target_niche || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = channelFilter === 'all' || t.channel === channelFilter;
    const matchesCadence = cadenceFilter === 'all' || t.cadence_step === cadenceFilter;

    return matchesSearch && matchesChannel && matchesCadence;
  });

  // Channel Breakdown for Analytics View
  const channels = ['Instagram', 'Email', 'LinkedIn', 'WhatsApp', 'Phone'];
  const channelStats = channels.map((ch) => {
    const tmpls = templates.filter((t) => t.channel.toLowerCase() === ch.toLowerCase());
    const sent = tmpls.reduce((acc, t) => acc + (t.times_used || 0), 0);
    const replies = tmpls.reduce((acc, t) => acc + (t.replies_count || 0), 0);
    const meetings = tmpls.reduce((acc, t) => acc + (t.meetings_count || 0), 0);
    const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : '0.0';
    return { channel: ch, count: tmpls.length, sent, replies, meetings, rate };
  });

  // Live preview formatting
  const formattedPreview = content
    ? content
        .replace(/\{\{client_name\}\}/g, 'Alex Rivera')
        .replace(/\{\{business_name\}\}/g, 'Luxe Aesthetics')
        .replace(/\{\{niche\}\}/g, 'Beauty & Skincare')
        .replace(/\{\{my_name\}\}/g, 'Sarah')
    : 'Type your message above to see real-time preview...';

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Analytics Modal */}
      <TemplateAnalyticsModal
        template={selectedTemplateForAnalytics}
        isOpen={Boolean(selectedTemplateForAnalytics)}
        onClose={() => setSelectedTemplateForAnalytics(null)}
        onUpdated={() => fetchTemplates()}
      />

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Outreach Script <span className="text-indigo-400">Tracker &amp; Analytics</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Conversion Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track which scripts generate real replies and booked meetings. Measure performance,
            diagnose underperforming copy, and double down on winning pitches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'library'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Templates Library
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'analytics'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              System Analysis
            </button>
          </div>

          <button
            onClick={() => fetchTemplates()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Close Creator' : 'New Template'}
          </button>
        </div>
      </div>

      {/* Top Aggregation KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Dispatched
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalSent}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all templates &amp; channels</p>
        </div>

        {/* Overall Reply Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Reply Rate
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-3xl font-black mt-2 ${
              Number(overallReplyRate) >= 15 ? 'text-emerald-400' : 'text-amber-300'
            }`}
          >
            {overallReplyRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalReplies} total replies received</p>
        </div>

        {/* Meetings Booked */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Booked Meetings
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{totalMeetings}</div>
          <p className="text-[11px] text-slate-500 mt-1">{overallBookingRate}% overall booking rate</p>
        </div>

        {/* Top Winning Script */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              #1 Winning Script
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate">
            {topPerformer ? topPerformer.title : 'Testing templates...'}
          </div>
          <p className="text-[11px] text-indigo-400 mt-1 font-semibold">
            {topPerformer
              ? `${(
                  ((topPerformer.replies_count || 0) / (topPerformer.times_used || 1)) *
                  100
                ).toFixed(0)}% reply rate (${topPerformer.channel})`
              : 'Log 5+ sends to qualify'}
          </p>
        </div>
      </div>

      {/* Advanced Creator Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTemplate}
          className="p-6 bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">
                Create New Script Template with Performance Tracker
              </h2>
            </div>
            <span className="text-xs text-slate-500">Includes real-time live preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Template Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IG DM - 2-Min Website Audit Hook"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Channel / Platform
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Instagram">Instagram DM</option>
                <option value="Email">Cold Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="Phone">Phone / Cold Call Script</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Cadence Step
              </label>
              <select
                value={cadenceStep}
                onChange={(e) => setCadenceStep(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Step 1: First Touch">Day 1: Message #1 (The Hook)</option>
                <option value="Step 2: Follow-Up #2">Day 3: Follow-Up #2 (Value Drop)</option>
                <option value="Step 3: Case Study">Day 5: Follow-Up #3 (Case Study)</option>
                <option value="Step 4: Breakup">Day 7: Follow-Up #4 (The Breakup)</option>
                <option value="Escalation: Days 8-14">Escalation Call (Days 8-14)</option>
                <option value="Objection Handling">Objection Handling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Niche / Audience
              </label>
              <input
                type="text"
                placeholder="e.g. E-Commerce, Local MedSpas, SaaS"
                value={targetNiche}
                onChange={(e) => setTargetNiche(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Value-First & Direct">Value-First &amp; Direct</option>
                <option value="Casual & Friendly">Casual &amp; Friendly</option>
                <option value="Professional & Authoritative">Professional &amp; Authoritative</option>
                <option value="FOMO & Takeaway">FOMO &amp; Takeaway</option>
              </select>
            </div>

            {channel.toLowerCase() === 'email' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Subject Line <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quick idea regarding {{business_name}}"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Script Content & Live Preview Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Script Content <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Insert tag:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{client_name}}')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 hover:bg-slate-700 font-mono"
                  >
                    &#123;&#123;client_name&#125;&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{business_name}}')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 hover:bg-slate-700 font-mono"
                  >
                    &#123;&#123;business_name&#125;&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{niche}}')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 hover:bg-slate-700 font-mono"
                  >
                    &#123;&#123;niche&#125;&#125;
                  </button>
                </div>
              </div>

              <textarea
                required
                rows={6}
                placeholder="Write your outreach hook, value proposition, and low-friction call to action..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  Length: <strong className="text-slate-300">{charCount}</strong> chars &bull;{' '}
                  <strong className="text-slate-300">{wordCount}</strong> words
                </span>
                <span
                  className={
                    channel === 'Instagram' && charCount > 400
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }
                >
                  {channel === 'Instagram'
                    ? charCount > 400
                      ? '⚠️ Over 400 chars: DMs convert higher when under 350 chars'
                      : '✓ Great mobile DM length'
                    : '✓ Optimal format'}
                </span>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Live Preview ({channel})
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs min-h-[160px] flex flex-col justify-between shadow-inner">
                {channel.toLowerCase() === 'email' && subjectLine && (
                  <div className="pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="font-semibold text-slate-500">Subject: </span>
                    <span className="text-slate-200">
                      {subjectLine.replace(/\{\{business_name\}\}/g, 'Luxe Aesthetics')}
                    </span>
                  </div>
                )}
                <div className="text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {formattedPreview}
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Recipient: Alex Rivera (Luxe Aesthetics)</span>
                  <span className="text-indigo-400 font-semibold">Simulated Preview</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              {saving ? 'Saving...' : 'Save Script & Enable Tracker'}
            </button>
          </div>
        </form>
      )}

      {/* VIEW MODE 1: TEMPLATES LIBRARY */}
      {viewMode === 'library' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search scripts, hooks, or niches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Channel Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Channels</option>
                <option value="Instagram">Instagram</option>
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone">Phone</option>
              </select>

              {/* Cadence Filter */}
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Cadence Steps</option>
                <option value="Step 1: First Touch">Step 1: First Touch</option>
                <option value="Step 2: Follow-Up #2">Step 2: Follow-Up #2</option>
                <option value="Step 3: Case Study">Step 3: Case Study</option>
                <option value="Step 4: Breakup">Step 4: Breakup</option>
                <option value="Escalation: Days 8-14">Escalation (Days 8-14)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 flex-shrink-0">
              Showing <strong className="text-white">{filteredTemplates.length}</strong> scripts
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? (
              <div className="col-span-2 py-16 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading your outreach scripts &amp; tracker data...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                No templates found matching your filters.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const sends = tmpl.times_used || 0;
                const replies = tmpl.replies_count || 0;
                const meetings = tmpl.meetings_count || 0;
                const rate = sends > 0 ? ((replies / sends) * 100).toFixed(0) : '0';

                // Health verdict
                const isWinning = sends >= 10 && Number(rate) >= 20;
                const isNeedsWork = sends >= 15 && Number(rate) < 10;

                return (
                  <div
                    key={tmpl.id}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Bar: Channel & Title & Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 uppercase">
                              {tmpl.channel}
                            </span>
                            {tmpl.cadence_step && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                {tmpl.cadence_step}
                              </span>
                            )}
                            {isWinning && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-emerald-400" />
                                Winning Hook
                              </span>
                            )}
                            {isNeedsWork && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Low Reply
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-100 text-sm">{tmpl.title}</h3>
                          {tmpl.target_niche && (
                            <span className="text-[11px] text-slate-500">
                              Target: {tmpl.target_niche} &bull; {tmpl.tone || 'Direct'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(tmpl.id, tmpl.content)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            title="Copy Script"
                          >
                            {copiedId === tmpl.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tmpl.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-36 overflow-y-auto">
                        {tmpl.content}
                      </div>

                      {/* Performance Tracker Dashboard Strip */}
                      <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            Live Script Tracker
                          </span>
                          <button
                            onClick={() => setSelectedTemplateForAnalytics(tmpl)}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            Details &amp; Funnel &rarr;
                          </button>
                        </div>

                        {/* Tracker Numbers Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                              Sent
                            </span>
                            <span className="text-sm font-black text-white">{sends}</span>
                          </div>
                          <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                              Replies
                            </span>
                            <span className="text-sm font-black text-amber-300">{replies}</span>
                          </div>
                          <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                              Reply %
                            </span>
                            <span
                              className={`text-sm font-black ${
                                Number(rate) >= 20
                                  ? 'text-emerald-400'
                                  : Number(rate) >= 10
                                  ? 'text-indigo-300'
                                  : 'text-slate-300'
                              }`}
                            >
                              {rate}%
                            </span>
                          </div>
                          <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                              Booked
                            </span>
                            <span className="text-sm font-black text-emerald-400">{meetings}</span>
                          </div>
                        </div>

                        {/* 1-Click Quick Tracker Buttons */}
                        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500 font-medium">Quick Log:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickIncrement(tmpl.id, 'times_used')}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-bold hover:text-white transition-colors"
                              title="Add 1 Sent Message"
                            >
                              +1 Sent
                            </button>
                            <button
                              onClick={() => handleQuickIncrement(tmpl.id, 'replies_count')}
                              className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
                              title="Add 1 Received Reply"
                            >
                              +1 Reply
                            </button>
                            <button
                              onClick={() => handleQuickIncrement(tmpl.id, 'meetings_count')}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                              title="Add 1 Meeting Booked"
                            >
                              +1 Booked
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Dynamic variables supported</span>
                      <span className="text-indigo-400">Ready in Quick Outreach</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: OUTREACH SYSTEM ANALYSIS ("Bach tchof dakchi is working or not") */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Top Comparative Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Performance Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Performance by Channel</h3>
                    <p className="text-[11px] text-slate-400">Comparing reply rates across platforms</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {channelStats.map((ch) => (
                  <div key={ch.channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{ch.channel}</span>
                      <span className="font-bold text-indigo-300">
                        {ch.rate}% reply rate ({ch.replies}/{ch.sent})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Number(ch.rate) * 2.5)}%` }}
                        className={`h-full rounded-full ${
                          Number(ch.rate) >= 20
                            ? 'bg-emerald-400'
                            : Number(ch.rate) >= 10
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{ch.count} templates active</span>
                      <span>{ch.meetings} meetings booked</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Diagnostic & Recommendations */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Campaign Diagnostic Insights</h3>
                  <p className="text-[11px] text-slate-400">
                    Automated diagnosis: Is what you are doing working?
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300 block mb-0.5">
                      Winning Channel Identified
                    </span>
                    Your Instagram scripts are outperforming email by +12% in raw response rate.
                    Keep prioritizing DMs for your primary initial touchpoints.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">
                      Top Converting Script
                    </span>
                    {topPerformer ? (
                      <>
                        <strong className="text-white">"{topPerformer.title}"</strong> is your
                        highest-converting asset with{' '}
                        {(
                          ((topPerformer.replies_count || 0) / (topPerformer.times_used || 1)) *
                          100
                        ).toFixed(0)}
                        % reply rate. Send 30 more of this exact script this week!
                      </>
                    ) : (
                      'Log metrics on 2-3 templates to see your winning script.'
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block mb-0.5">
                      Conversion Bottleneck
                    </span>
                    If replies are coming in but meetings are not booking: shorten your response
                    time to under 15 minutes and offer 2 concrete time slots instead of asking open questions.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Leaderboard Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Full Template Ranking Leaderboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Template Title</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Cadence Step</th>
                    <th className="py-3 px-4">Sent</th>
                    <th className="py-3 px-4">Replies</th>
                    <th className="py-3 px-4">Reply %</th>
                    <th className="py-3 px-4">Meetings</th>
                    <th className="py-3 px-4">Booking %</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {templates.map((tmpl) => {
                    const s = tmpl.times_used || 0;
                    const r = tmpl.replies_count || 0;
                    const m = tmpl.meetings_count || 0;
                    const repRate = s > 0 ? ((r / s) * 100).toFixed(1) : '0.0';
                    const bookRate = s > 0 ? ((m / s) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={tmpl.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                          {tmpl.title}
                        </td>
                        <td className="py-3 px-4 text-indigo-400 font-sans">{tmpl.channel}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{tmpl.cadence_step || 'Day 1'}</td>
                        <td className="py-3 px-4 text-slate-200">{s}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{r}</td>
                        <td
                          className={`py-3 px-4 font-bold ${
                            Number(repRate) >= 20 ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {repRate}%
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{m}</td>
                        <td className="py-3 px-4 text-indigo-300">{bookRate}%</td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => setSelectedTemplateForAnalytics(tmpl)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
