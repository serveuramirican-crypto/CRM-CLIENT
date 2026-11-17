'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  Award,
  Sparkles,
  Flame,
  AlertTriangle,
  Send,
  Save,
  Check,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { OutreachTemplate } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface TemplateAnalyticsModalProps {
  template: OutreachTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function TemplateAnalyticsModal({
  template,
  isOpen,
  onClose,
  onUpdated,
}: TemplateAnalyticsModalProps) {
  if (!isOpen || !template) return null;

  const [sentCount, setSentCount] = useState<number>(template.times_used || 0);
  const [repliesCount, setRepliesCount] = useState<number>(template.replies_count || 0);
  const [meetingsCount, setMeetingsCount] = useState<number>(template.meetings_count || 0);
  const [dealsWonCount, setDealsWonCount] = useState<number>(template.deals_won_count || 0);
  const [revenue, setRevenue] = useState<number>(template.revenue_generated || 0);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if template changes
  React.useEffect(() => {
    if (template) {
      setSentCount(template.times_used || 0);
      setRepliesCount(template.replies_count || 0);
      setMeetingsCount(template.meetings_count || 0);
      setDealsWonCount(template.deals_won_count || 0);
      setRevenue(template.revenue_generated || 0);
    }
  }, [template]);

  const replyRate = sentCount > 0 ? ((repliesCount / sentCount) * 100).toFixed(1) : '0.0';
  const bookingRate = sentCount > 0 ? ((meetingsCount / sentCount) * 100).toFixed(1) : '0.0';

  // Performance Verdict
  const getVerdict = () => {
    const rate = Number(replyRate);
    if (sentCount < 10) {
      return {
        label: 'Gathering Data (Testing)',
        description: 'Send at least 15-20 messages to establish reliable conversion metrics.',
        style: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        icon: TrendingUp,
      };
    }
    if (rate >= 20) {
      return {
        label: 'Winning Pitch (Top Performer)',
        description: 'High engagement! Double down on this script for this niche.',
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: Flame,
      };
    }
    if (rate >= 10) {
      return {
        label: 'Healthy Performance',
        description: 'Good response baseline. Consider testing a stronger CTA hook.',
        style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        icon: Award,
      };
    }
    return {
      label: 'Needs Optimization',
      description: 'Reply rate below 10%. Shorten the copy and verify prospect targeting.',
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertTriangle,
    };
  };

  const verdict = getVerdict();
  const VerdictIcon = verdict.icon;

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('outreach_templates')
        .update({
          times_used: sentCount,
          replies_count: repliesCount,
          meetings_count: meetingsCount,
          deals_won_count: dealsWonCount,
          revenue_generated: revenue,
        })
        .eq('id', template.id);

      if (error) throw error;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      onUpdated();
    } catch (err) {
      console.error('Failed to update metrics:', err);
      alert('Error updating template stats.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{template.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                  {template.channel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {template.cadence_step || 'Cadence Step'} &bull; {template.target_niche || 'All Niches'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Performance Verdict Banner */}
          <div className={`p-4 rounded-2xl border ${verdict.style} flex items-start gap-3`}>
            <VerdictIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Performance Status: {verdict.label}
              </div>
              <p className="text-xs text-slate-300 mt-1">{verdict.description}</p>
            </div>
          </div>

          {/* Core Conversion Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Sent
              </span>
              <div className="text-2xl font-black text-white mt-1">{sentCount}</div>
              <span className="text-[10px] text-slate-500">Messages logged</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Replies
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">{repliesCount}</div>
              <span className="text-[10px] text-slate-500">Responses</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Reply Rate
              </span>
              <div
                className={`text-2xl font-black mt-1 ${
                  Number(replyRate) >= 20
                    ? 'text-emerald-400'
                    : Number(replyRate) >= 10
                    ? 'text-indigo-300'
                    : 'text-rose-400'
                }`}
              >
                {replyRate}%
              </div>
              <span className="text-[10px] text-slate-500">Benchmark: 15-20%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Booked Calls
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{meetingsCount}</div>
              <span className="text-[10px] text-slate-500">{bookingRate}% conversion</span>
            </div>
          </div>

          {/* Conversion Funnel Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Outreach Conversion Funnel</span>
              <span className="text-indigo-400 text-[11px]">
                {sentCount} Dispatched &rarr; {repliesCount} Replied &rarr; {meetingsCount} Booked
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, Number(replyRate))}%` }}
                className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full transition-all"
                title={`Reply Rate: ${replyRate}%`}
              />
              <div
                style={{ width: `${Math.min(100, Number(bookingRate))}%` }}
                className="bg-emerald-400 h-full transition-all"
                title={`Booking Rate: ${bookingRate}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>0%</span>
              <span>15% (Healthy Target)</span>
              <span>30%+ (Top 5% Pitch)</span>
            </div>
          </div>

          {/* Quick Metrics Adjustment Form */}
          <form onSubmit={handleSaveMetrics} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Adjust Tracker Counters
              </span>
              <span className="text-[11px] text-slate-500">
                Update stats anytime after sending campaigns
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Sent Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={sentCount}
                  onChange={(e) => setSentCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Replies Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={repliesCount}
                  onChange={(e) => setRepliesCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Meetings Booked
                </label>
                <input
                  type="number"
                  min="0"
                  value={meetingsCount}
                  onChange={(e) => setMeetingsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Deals Closed / Won
                </label>
                <input
                  type="number"
                  min="0"
                  value={dealsWonCount}
                  onChange={(e) => setDealsWonCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Revenue Generated ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Changes persist instantly to Supabase
              </span>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Updated!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save Updated Stats'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
