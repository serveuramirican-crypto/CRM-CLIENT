'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Plus,
  Search,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Copy,
  Trash2,
  ExternalLink,
  Instagram,
  Globe,
  AlertTriangle,
  Calendar,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Business,
  BusinessAnalysis,
  AnalysisChecklistItem,
  AnalysisStageReview,
  Client,
} from '@/lib/types';
import {
  BUSINESS_ANALYSIS_STAGES,
  TOTAL_CHECKLIST_ITEMS,
} from '@/lib/business-analysis-checklist';
import {
  NewBusinessAnalysisModal,
  BusinessFormValues,
} from '@/components/analysis/NewBusinessAnalysisModal';
import {
  BusinessStatusBadge,
  AnalysisStatusBadge,
} from '@/components/analysis/VerificationBadge';
import { formatDate } from '@/lib/utils';

type DateFilterOption = 'all' | 'today' | '7d' | '30d' | 'custom';

interface AnalysisSummaryMeta {
  markedCount: number;
  stagesWithMarks: { stageId: string; code: string; title: string; count: number }[];
  bottleneckStageIds: string[];
}

export default function BusinessAnalysisDashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<BusinessAnalysis[]>([]);
  const [crmClients, setCrmClients] = useState<Client[]>([]);
  const [summaryByAnalysisId, setSummaryByAnalysisId] = useState<
    Record<string, AnalysisSummaryMeta>
  >({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDate, setCustomDate] = useState('');

  // Modal & Action States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [busyAnalysisId, setBusyAnalysisId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [analysesRes, itemsRes, reviewsRes, clientsRes] = await Promise.all([
        supabase
          .from('business_analyses')
          .select('*, businesses(*)')
          .order('updated_at', { ascending: false }),
        supabase
          .from('analysis_checklist_items')
          .select('analysis_id, stage_id, is_checked')
          .eq('is_checked', true),
        supabase
          .from('analysis_stage_reviews')
          .select('analysis_id, stage_id, is_potential_bottleneck')
          .eq('is_potential_bottleneck', true),
        supabase
          .from('clients')
          .select('id, business_name, niche, outreach_channel, platform_links, notes')
          .order('created_at', { ascending: false }),
      ]);

      if (analysesRes.error) throw analysesRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      const analysesList = (analysesRes.data || []) as BusinessAnalysis[];
      const checkedRows = (itemsRes.data || []) as Pick<
        AnalysisChecklistItem,
        'analysis_id' | 'stage_id' | 'is_checked'
      >[];
      const bottleneckRows = (reviewsRes.data || []) as Pick<
        AnalysisStageReview,
        'analysis_id' | 'stage_id' | 'is_potential_bottleneck'
      >[];

      const summaryMap: Record<string, AnalysisSummaryMeta> = {};
      for (const analysis of analysesList) {
        const analysisItems = checkedRows.filter(
          (row) => row.analysis_id === analysis.id
        );
        const stageCountMap: Record<string, number> = {};
        for (const row of analysisItems) {
          stageCountMap[row.stage_id] = (stageCountMap[row.stage_id] || 0) + 1;
        }

        const stagesWithMarks = BUSINESS_ANALYSIS_STAGES.filter(
          (s) => (stageCountMap[s.id] || 0) > 0
        ).map((s) => ({
          stageId: s.id,
          code: `S${s.stageNumber}`,
          title: s.title,
          count: stageCountMap[s.id] || 0,
        }));

        const bottleneckStageIds = bottleneckRows
          .filter((r) => r.analysis_id === analysis.id)
          .map((r) => r.stage_id);

        summaryMap[analysis.id] = {
          markedCount: analysisItems.length,
          stagesWithMarks,
          bottleneckStageIds,
        };
      }

      setAnalyses(analysesList);
      setSummaryByAnalysisId(summaryMap);
      if (!clientsRes.error) {
        setCrmClients((clientsRes.data || []) as Client[]);
      }
    } catch (err: any) {
      console.error('Error loading Business Analysis dashboard:', err);
      setErrorMsg(err?.message || 'Failed to load business analyses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateNewAnalysis = async (values: BusinessFormValues) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    const { data: businessRow, error: bizErr } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: userId,
          client_id: values.client_id || null,
          name: values.name,
          instagram_url: values.instagram_url,
          website_url: values.website_url,
          business_type: values.business_type,
          business_category: values.business_category,
          business_status: values.business_status,
          main_product_or_service: values.main_product_or_service,
          contact_channels: values.contact_channels,
          general_notes: values.general_notes,
        },
      ])
      .select()
      .single();

    if (bizErr) throw bizErr;

    const { data: analysisRow, error: analysisErr } = await supabase
      .from('business_analyses')
      .insert([
        {
          business_id: businessRow.id,
          user_id: userId,
          version_label: 'Analysis #1',
          analysis_status: 'in_progress',
        },
      ])
      .select()
      .single();

    if (analysisErr) throw analysisErr;

    router.push(`/analysis/${analysisRow.id}`);
  };

  const handleDuplicateAnalysis = async (source: BusinessAnalysis) => {
    if (!source.businesses) return;
    try {
      setBusyAnalysisId(source.id);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // Count existing versions for this business
      const existingCount = analyses.filter(
        (a) => a.business_id === source.business_id
      ).length;

      const { data: newAnalysis, error: createErr } = await supabase
        .from('business_analyses')
        .insert([
          {
            business_id: source.business_id,
            user_id: userId,
            version_label: `Analysis #${existingCount + 1}`,
            analysis_status: 'in_progress',
            next_questions: source.next_questions || '',
            next_data_to_collect: source.next_data_to_collect || '',
            next_records_to_inspect: source.next_records_to_inspect || '',
            next_unknown_info: source.next_unknown_info || '',
          },
        ])
        .select()
        .single();

      if (createErr) throw createErr;

      // Copy checklist items and stage reviews independently
      const [itemsRes, reviewsRes] = await Promise.all([
        supabase
          .from('analysis_checklist_items')
          .select('*')
          .eq('analysis_id', source.id),
        supabase
          .from('analysis_stage_reviews')
          .select('*')
          .eq('analysis_id', source.id),
      ]);

      if (itemsRes.data && itemsRes.data.length > 0) {
        const clonedItems = itemsRes.data.map((item) => ({
          analysis_id: newAnalysis.id,
          stage_id: item.stage_id,
          subcategory_id: item.subcategory_id || '',
          problem_id: item.problem_id,
          is_checked: item.is_checked,
          verification_status: item.verification_status,
          evidence: item.evidence || '',
          notes: item.notes || '',
        }));
        const { error: cloneItemsErr } = await supabase
          .from('analysis_checklist_items')
          .insert(clonedItems);
        if (cloneItemsErr) throw cloneItemsErr;
      }

      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const clonedReviews = reviewsRes.data.map((rev) => ({
          analysis_id: newAnalysis.id,
          stage_id: rev.stage_id,
          is_potential_bottleneck: rev.is_potential_bottleneck,
          investigation_notes: rev.investigation_notes || '',
        }));
        const { error: cloneRevErr } = await supabase
          .from('analysis_stage_reviews')
          .insert(clonedReviews);
        if (cloneRevErr) throw cloneRevErr;
      }

      await fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to duplicate analysis:', err);
      setErrorMsg(err?.message || 'Failed to duplicate analysis.');
    } finally {
      setBusyAnalysisId(null);
    }
  };

  const handleDeleteAnalysis = async (analysis: BusinessAnalysis) => {
    const bizName = analysis.businesses?.name || 'this business';
    if (
      !confirm(
        `Are you sure you want to delete "${bizName}" (${analysis.version_label})? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setBusyAnalysisId(analysis.id);
      const siblingCount = analyses.filter(
        (a) => a.business_id === analysis.business_id
      ).length;

      const { error: delAnalysisErr } = await supabase
        .from('business_analyses')
        .delete()
        .eq('id', analysis.id);

      if (delAnalysisErr) throw delAnalysisErr;

      // Clean up orphaned business record if that was its only analysis
      if (siblingCount <= 1 && analysis.business_id) {
        await supabase.from('businesses').delete().eq('id', analysis.business_id);
      }

      await fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to delete analysis:', err);
      setErrorMsg(err?.message || 'Failed to delete analysis.');
    } finally {
      setBusyAnalysisId(null);
    }
  };

  const filteredAnalyses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    return analyses.filter((analysis) => {
      const biz = analysis.businesses;
      if (!biz) return false;

      if (statusFilter !== 'all' && biz.business_status !== statusFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const updatedDate = new Date(analysis.updated_at);
        if (dateFilter === 'today') {
          if (updatedDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === '7d') {
          const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (updatedDate < cutoff) return false;
        } else if (dateFilter === '30d') {
          const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (updatedDate < cutoff) return false;
        } else if (dateFilter === 'custom' && customDate) {
          const dateOnly = updatedDate.toISOString().split('T')[0];
          if (dateOnly !== customDate) return false;
        }
      }

      if (q) {
        const haystack = [
          biz.name,
          biz.business_category,
          biz.business_type,
          biz.main_product_or_service,
          analysis.version_label,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [analyses, searchQuery, statusFilter, dateFilter, customDate]);

  const activeBusinessesCount = useMemo(() => {
    const uniqueActiveIds = new Set(
      analyses
        .filter((a) => a.businesses?.business_status === 'Active')
        .map((a) => a.business_id)
    );
    return uniqueActiveIds.size;
  }, [analyses]);

  const totalMarkedAcrossAll = useMemo(() => {
    return Object.values(summaryByAnalysisId).reduce(
      (sum, meta) => sum + meta.markedCount,
      0
    );
  }, [summaryByAnalysisId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Business Analysis Checklist
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit businesses across all 7 stages of the Business Growth Machine, log observed warning signs with evidence, and pinpoint stages needing deeper investigation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Business Analysis
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Saved Analyses
          </p>
          <p className="mt-2 text-2xl font-bold text-white tabular-nums">
            {analyses.length}
          </p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Active Businesses Analyzed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-400 tabular-nums">
            {activeBusinessesCount}
          </p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Observations Logged (X)
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-400 tabular-nums">
            {totalMarkedAcrossAll}
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analyzed businesses by name, category, or product..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter:
          </span>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive')
            }
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Business Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Analysis Dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Specific Date</option>
          </select>

          {dateFilter === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>

      {/* Analyses List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {analyses.length === 0
              ? 'No business analyses yet'
              : 'No analyses match your filters'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {analyses.length === 0
              ? 'Click "+ New Business Analysis" to create a business profile and walk through the 7 diagnostic stages.'
              : 'Try clearing the search box or adjusting your status/date filter.'}
          </p>
          {analyses.length === 0 && (
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Business Analysis
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredAnalyses.map((analysis) => {
            const biz = analysis.businesses as Business;
            const meta = summaryByAnalysisId[analysis.id] || {
              markedCount: 0,
              stagesWithMarks: [],
              bottleneckStageIds: [],
            };
            const isBusy = busyAnalysisId === analysis.id;

            return (
              <div
                key={analysis.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className="text-base font-bold text-white hover:text-indigo-300 truncate transition-colors"
                        >
                          {biz.name}
                        </Link>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
                          {analysis.version_label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <BusinessStatusBadge status={biz.business_status} />
                        <AnalysisStatusBadge status={analysis.analysis_status} />
                        <span className="px-2 py-0.5 rounded-md text-xs bg-slate-800/80 text-slate-300 border border-slate-700">
                          {biz.business_type}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                          {biz.business_category}
                        </span>
                      </div>
                    </div>

                    {/* Marked Problems Counter Pill */}
                    <div className="text-right shrink-0 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Marked
                      </span>
                      <span className="text-lg font-bold text-rose-400 tabular-nums">
                        {meta.markedCount}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {' '}
                        / {TOTAL_CHECKLIST_ITEMS}
                      </span>
                    </div>
                  </div>

                  {/* Offer & Links */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {biz.main_product_or_service && (
                      <span>
                        Product/Service:{' '}
                        <strong className="text-slate-200 font-medium">
                          {biz.main_product_or_service}
                        </strong>
                      </span>
                    )}
                    {biz.instagram_url && (
                      <a
                        href={biz.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        Instagram
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {biz.website_url && (
                      <a
                        href={biz.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Stages With Observed Problems */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Stages With Observed Signals ({meta.stagesWithMarks.length}/7)
                    </span>
                    {meta.stagesWithMarks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No problems marked yet — open the checklist to begin analysis.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {meta.stagesWithMarks.map((st) => {
                          const isFlaggedBottleneck =
                            meta.bottleneckStageIds.includes(st.stageId);
                          return (
                            <span
                              key={st.stageId}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                isFlaggedBottleneck
                                  ? 'bg-amber-500/15 text-amber-200 border-amber-500/40'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                              title={
                                isFlaggedBottleneck
                                  ? 'Flagged as potential bottleneck'
                                  : undefined
                              }
                            >
                              <span>
                                {st.code} {st.title}
                              </span>
                              <span className="font-bold tabular-nums">({st.count})</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(analysis.updated_at)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicateAnalysis(analysis)}
                      disabled={isBusy}
                      title="Duplicate analysis as a new version"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnalysis(analysis)}
                      disabled={isBusy}
                      title="Delete analysis"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/analysis/${analysis.id}/results`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                      Results
                    </Link>

                    <Link
                      href={`/analysis/${analysis.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                    >
                      Continue Analysis
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Business Analysis Modal */}
      <NewBusinessAnalysisModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateNewAnalysis}
        crmClients={crmClients}
      />
    </div>
  );
}
