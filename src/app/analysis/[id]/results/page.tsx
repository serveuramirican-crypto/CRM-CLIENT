'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Instagram,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  X as XIcon,
  HelpCircle,
  Database,
  FileSearch,
  CircleHelp,
  Flag,
  Layers,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Business,
  BusinessAnalysis,
  AnalysisChecklistItem,
  AnalysisStageReview,
  VerificationStatus,
} from '@/lib/types';
import {
  BUSINESS_ANALYSIS_STAGES,
  TOTAL_CHECKLIST_ITEMS,
  VERIFICATION_STATUS_OPTIONS,
  getStageProblems,
} from '@/lib/business-analysis-checklist';
import {
  BusinessStatusBadge,
  AnalysisStatusBadge,
  VerificationBadge,
} from '@/components/analysis/VerificationBadge';
import { formatDate } from '@/lib/utils';

export default function BusinessAnalysisResultsPage() {
  const params = useParams();
  const analysisId = params?.id as string;

  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [itemsByProblemId, setItemsByProblemId] = useState<
    Record<string, AnalysisChecklistItem>
  >({});
  const [reviewsByStageId, setReviewsByStageId] = useState<
    Record<string, AnalysisStageReview>
  >({});

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [savingResults, setSavingResults] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showAllStagesInBottlenecks, setShowAllStagesInBottlenecks] = useState(false);

  // Next Investigation Steps draft fields
  const [nextQuestions, setNextQuestions] = useState('');
  const [nextDataToCollect, setNextDataToCollect] = useState('');
  const [nextRecordsToInspect, setNextRecordsToInspect] = useState('');
  const [nextUnknownInfo, setNextUnknownInfo] = useState('');

  const loadResults = useCallback(async () => {
    if (!analysisId) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const [analysisRes, itemsRes, reviewsRes] = await Promise.all([
        supabase
          .from('business_analyses')
          .select('*, businesses(*)')
          .eq('id', analysisId)
          .single(),
        supabase
          .from('analysis_checklist_items')
          .select('*')
          .eq('analysis_id', analysisId),
        supabase
          .from('analysis_stage_reviews')
          .select('*')
          .eq('analysis_id', analysisId),
      ]);

      if (analysisRes.error) throw analysisRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      const loadedAnalysis = analysisRes.data as BusinessAnalysis;
      setAnalysis(loadedAnalysis);
      setBusiness((loadedAnalysis.businesses as Business) || null);
      setNextQuestions(loadedAnalysis.next_questions || '');
      setNextDataToCollect(loadedAnalysis.next_data_to_collect || '');
      setNextRecordsToInspect(loadedAnalysis.next_records_to_inspect || '');
      setNextUnknownInfo(loadedAnalysis.next_unknown_info || '');

      const itemsMap: Record<string, AnalysisChecklistItem> = {};
      for (const row of (itemsRes.data || []) as AnalysisChecklistItem[]) {
        itemsMap[row.problem_id] = row;
      }
      setItemsByProblemId(itemsMap);

      const revMap: Record<string, AnalysisStageReview> = {};
      for (const row of (reviewsRes.data || []) as AnalysisStageReview[]) {
        revMap[row.stage_id] = row;
      }
      setReviewsByStageId(revMap);
    } catch (err: any) {
      console.error('Error loading results:', err);
      setErrorMsg(err?.message || 'Unable to load analysis results.');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const stageSummaries = useMemo(() => {
    return BUSINESS_ANALYSIS_STAGES.map((stage) => {
      const problems = getStageProblems(stage);
      const checkedProblems = problems.filter(
        (p) => itemsByProblemId[p.id]?.is_checked
      );
      return {
        stage,
        markedCount: checkedProblems.length,
        totalCount: problems.length,
      };
    });
  }, [itemsByProblemId]);

  const totalMarked = useMemo(
    () => stageSummaries.reduce((sum, s) => sum + s.markedCount, 0),
    [stageSummaries]
  );

  const stagesWithMarks = useMemo(
    () => stageSummaries.filter((s) => s.markedCount > 0),
    [stageSummaries]
  );

  const handleToggleBottleneckStage = async (stageId: string) => {
    const existing = reviewsByStageId[stageId];
    const nextFlag = !(existing?.is_potential_bottleneck ?? false);
    const nextReview: AnalysisStageReview = {
      analysis_id: analysisId,
      stage_id: stageId,
      is_potential_bottleneck: nextFlag,
      investigation_notes: existing?.investigation_notes || '',
    };

    setReviewsByStageId((prev) => ({
      ...prev,
      [stageId]: nextReview,
    }));

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('analysis_stage_reviews')
        .upsert(
          {
            analysis_id: analysisId,
            stage_id: stageId,
            is_potential_bottleneck: nextFlag,
            investigation_notes: nextReview.investigation_notes,
            updated_at: now,
          },
          { onConflict: 'analysis_id,stage_id' }
        );
      if (error) throw error;
      await supabase
        .from('business_analyses')
        .update({ updated_at: now })
        .eq('id', analysisId);
    } catch (err) {
      console.error('Failed to toggle potential bottleneck:', err);
    }
  };

  const handleUpdateStageInvestigationNotes = (stageId: string, notes: string) => {
    const existing = reviewsByStageId[stageId];
    setReviewsByStageId((prev) => ({
      ...prev,
      [stageId]: {
        analysis_id: analysisId,
        stage_id: stageId,
        is_potential_bottleneck: existing?.is_potential_bottleneck ?? false,
        investigation_notes: notes,
      },
    }));
  };

  const handleUpdateProblemVerification = async (
    problemId: string,
    verificationStatus: VerificationStatus
  ) => {
    const existing = itemsByProblemId[problemId];
    if (!existing) return;

    const updated: AnalysisChecklistItem = {
      ...existing,
      verification_status: verificationStatus,
    };
    setItemsByProblemId((prev) => ({ ...prev, [problemId]: updated }));

    try {
      const now = new Date().toISOString();
      await supabase
        .from('analysis_checklist_items')
        .update({ verification_status: verificationStatus, updated_at: now })
        .eq('analysis_id', analysisId)
        .eq('problem_id', problemId);
    } catch (err) {
      console.error('Failed to update verification status:', err);
    }
  };

  const handleSaveResultsAndSteps = async (markCompleted?: boolean) => {
    if (!analysis) return;
    try {
      setSavingResults(true);
      const now = new Date().toISOString();
      const nextStatus =
        markCompleted !== undefined
          ? markCompleted
            ? 'completed'
            : 'in_progress'
          : analysis.analysis_status;

      const { data: updatedAnalysis, error: analysisErr } = await supabase
        .from('business_analyses')
        .update({
          analysis_status: nextStatus,
          next_questions: nextQuestions,
          next_data_to_collect: nextDataToCollect,
          next_records_to_inspect: nextRecordsToInspect,
          next_unknown_info: nextUnknownInfo,
          updated_at: now,
        })
        .eq('id', analysisId)
        .select('*, businesses(*)')
        .single();

      if (analysisErr) throw analysisErr;

      // Also persist all stage review investigation notes
      const reviewPayloads = Object.values(reviewsByStageId).map((rev) => ({
        analysis_id: analysisId,
        stage_id: rev.stage_id,
        is_potential_bottleneck: rev.is_potential_bottleneck,
        investigation_notes: rev.investigation_notes || '',
        updated_at: now,
      }));

      if (reviewPayloads.length > 0) {
        const { error: revErr } = await supabase
          .from('analysis_stage_reviews')
          .upsert(reviewPayloads, { onConflict: 'analysis_id,stage_id' });
        if (revErr) throw revErr;
      }

      setAnalysis(updatedAnalysis as BusinessAnalysis);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err: any) {
      console.error('Failed to save investigation plan:', err);
      setErrorMsg(err?.message || 'Failed to save results.');
    } finally {
      setSavingResults(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (errorMsg || !analysis || !business) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Analysis Results Unavailable</h2>
        <p className="text-sm text-slate-400">{errorMsg}</p>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const bottleneckCandidates = showAllStagesInBottlenecks
    ? stageSummaries
    : stagesWithMarks;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/analysis/${analysis.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Checklist
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Analysis Results: {business.name}
            </h1>
            <AnalysisStatusBadge status={analysis.analysis_status} />
          </div>
          <p className="text-xs text-slate-400">
            {analysis.version_label} · Created {formatDate(analysis.created_at)} · Last updated{' '}
            {formatDate(analysis.updated_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              handleSaveResultsAndSteps(analysis.analysis_status !== 'completed')
            }
            disabled={savingResults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
          >
            {analysis.analysis_status === 'completed'
              ? 'Reopen as In Progress'
              : 'Mark as Reviewed'}
          </button>

          <button
            type="button"
            onClick={() => handleSaveResultsAndSteps()}
            disabled={savingResults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors disabled:opacity-50"
          >
            {savingResults ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Investigation Plan
          </button>
        </div>
      </div>

      {/* SECTION A: Business Information */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            A. Business Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Business Name
            </span>
            <span className="text-white font-semibold mt-1 block">{business.name}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Type & Category
            </span>
            <span className="text-slate-200 mt-1 block">
              {business.business_type} · {business.business_category}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Business Status
            </span>
            <div className="mt-1">
              <BusinessStatusBadge status={business.business_status} />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Customer Contact Channels
            </span>
            <span className="text-slate-200 mt-1 block">
              {(business.contact_channels || []).join(', ') || 'Not specified'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Main Product or Service
            </span>
            <span dir="auto" className="text-slate-200 mt-1 block">
              {business.main_product_or_service || 'Not specified'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Online Presence
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {business.instagram_url ? (
                <a
                  href={business.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 break-all"
                >
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  {business.instagram_url}
                </a>
              ) : (
                <span className="text-slate-500">No Instagram URL</span>
              )}
              {business.website_url && (
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 break-all"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {business.website_url}
                </a>
              )}
            </div>
          </div>
        </div>

        {business.general_notes && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              General Notes
            </span>
            <p dir="auto" className="text-sm text-slate-200 whitespace-pre-wrap">
              {business.general_notes}
            </p>
          </div>
        )}
      </section>

      {/* SECTION B: Stage Overview */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              B. Stage Overview
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            Total Marked: {totalMarked} / {TOTAL_CHECKLIST_ITEMS}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Counts below show how many potential warning signs were checked per stage. A higher count does not automatically indicate the main bottleneck.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stageSummaries.map(({ stage, markedCount, totalCount }) => {
            const pct = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;
            const hasSignals = markedCount > 0;

            return (
              <div
                key={stage.id}
                className={`rounded-xl border p-4 space-y-2 ${
                  hasSignals
                    ? 'bg-rose-950/15 border-rose-500/35'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase">
                    {stage.code}
                  </span>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      hasSignals ? 'text-rose-300' : 'text-slate-500'
                    }`}
                  >
                    {markedCount} / {totalCount}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">{stage.title}</p>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      hasSignals ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p dir="rtl" className="text-xs text-slate-400 text-right">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION C: Selected Problems */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <XIcon className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              C. Selected Problems ({totalMarked})
            </h2>
          </div>
          <Link
            href={`/analysis/${analysis.id}`}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            Modify Checklist →
          </Link>
        </div>

        {totalMarked === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-sm text-slate-400">
            No problems have been marked yet. Go back to the checklist to mark observed warning signs.
          </div>
        ) : (
          <div className="space-y-6">
            {BUSINESS_ANALYSIS_STAGES.map((stage) => {
              const directChecked = (stage.problems || []).filter(
                (p) => itemsByProblemId[p.id]?.is_checked
              );
              const subGroupsChecked = (stage.subcategories || [])
                .map((sub) => ({
                  sub,
                  problems: sub.problems.filter(
                    (p) => itemsByProblemId[p.id]?.is_checked
                  ),
                }))
                .filter((g) => g.problems.length > 0);

              if (directChecked.length === 0 && subGroupsChecked.length === 0) {
                return null;
              }

              return (
                <div
                  key={`res-${stage.id}`}
                  className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50"
                >
                  <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {stage.code}
                      </span>
                      <h3 className="text-sm font-bold text-white">{stage.title}</h3>
                    </div>
                    <span dir="rtl" className="text-xs text-slate-400">
                      {stage.description}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {directChecked.length > 0 && (
                      <div className="space-y-3">
                        {directChecked.map((prob) => {
                          const item = itemsByProblemId[prob.id];
                          return (
                            <div
                              key={prob.id}
                              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <p
                                  dir="rtl"
                                  className="text-sm font-medium text-white text-right flex-1"
                                >
                                  <span
                                    dir="ltr"
                                    className="inline-flex items-center justify-center w-5 h-5 ml-2 rounded bg-rose-600/90 text-white text-[10px] font-bold align-middle"
                                  >
                                    X
                                  </span>
                                  <span
                                    dir="ltr"
                                    className="inline-block ml-2 text-xs font-mono text-slate-400 tabular-nums"
                                  >
                                    #{prob.number}
                                  </span>
                                  {prob.text}
                                </p>

                                <div className="flex items-center gap-2 shrink-0">
                                  <VerificationBadge status={item.verification_status} />
                                  <select
                                    value={item.verification_status}
                                    onChange={(e) =>
                                      handleUpdateProblemVerification(
                                        prob.id,
                                        e.target.value as VerificationStatus
                                      )
                                    }
                                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Verification status"
                                  >
                                    {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                                <div>
                                  <span className="font-semibold text-indigo-400 block mb-0.5">
                                    Evidence
                                  </span>
                                  <p dir="auto" className="text-slate-300">
                                    {item.evidence?.trim() ? (
                                      item.evidence
                                    ) : (
                                      <span className="text-slate-500 italic">
                                        No evidence recorded yet
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-400 block mb-0.5">
                                    Notes
                                  </span>
                                  <p dir="auto" className="text-slate-300 whitespace-pre-wrap">
                                    {item.notes?.trim() ? (
                                      item.notes
                                    ) : (
                                      <span className="text-slate-500 italic">
                                        No notes added
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {subGroupsChecked.map(({ sub, problems }) => (
                      <div key={sub.id} className="space-y-2.5">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider px-1">
                          {sub.title}
                        </h4>
                        <div className="space-y-2.5">
                          {problems.map((prob) => {
                            const item = itemsByProblemId[prob.id];
                            return (
                              <div
                                key={prob.id}
                                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                  <p
                                    dir="rtl"
                                    className="text-sm font-medium text-white text-right flex-1"
                                  >
                                    <span
                                      dir="ltr"
                                      className="inline-flex items-center justify-center w-5 h-5 ml-2 rounded bg-rose-600/90 text-white text-[10px] font-bold align-middle"
                                    >
                                      X
                                    </span>
                                    <span
                                      dir="ltr"
                                      className="inline-block ml-2 text-xs font-mono text-slate-400 tabular-nums"
                                    >
                                      #{prob.number}
                                    </span>
                                    {prob.text}
                                  </p>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <VerificationBadge status={item.verification_status} />
                                    <select
                                      value={item.verification_status}
                                      onChange={(e) =>
                                        handleUpdateProblemVerification(
                                          prob.id,
                                          e.target.value as VerificationStatus
                                        )
                                      }
                                      className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                      aria-label="Verification status"
                                    >
                                      {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                                  <div>
                                    <span className="font-semibold text-indigo-400 block mb-0.5">
                                      Evidence
                                    </span>
                                    <p dir="auto" className="text-slate-300">
                                      {item.evidence?.trim() ? (
                                        item.evidence
                                      ) : (
                                        <span className="text-slate-500 italic">
                                          No evidence recorded yet
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-400 block mb-0.5">
                                      Notes
                                    </span>
                                    <p dir="auto" className="text-slate-300 whitespace-pre-wrap">
                                      {item.notes?.trim() ? (
                                        item.notes
                                      ) : (
                                        <span className="text-slate-500 italic">
                                          No notes added
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION D: Potential Bottlenecks */}
      <section className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Potential Bottlenecks —{' '}
              <span dir="rtl" className="text-amber-300">
                تحتاج إلى مزيد من التحقق
              </span>
            </h2>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAllStagesInBottlenecks}
              onChange={(e) => setShowAllStagesInBottlenecks(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            Show all 7 stages
          </label>
        </div>

        <p className="text-xs text-slate-400">
          Manually select one or more stages to prioritize for deeper investigation based on business impact and evidence (never auto-classified by checkmark volume alone).
        </p>

        {bottleneckCandidates.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
            No stages have marked problems yet. Check &ldquo;Show all 7 stages&rdquo; if you want to flag a stage manually.
          </div>
        ) : (
          <div className="space-y-3">
            {bottleneckCandidates.map(({ stage, markedCount, totalCount }) => {
              const review = reviewsByStageId[stage.id];
              const isSelected = Boolean(review?.is_potential_bottleneck);

              return (
                <div
                  key={`bn-${stage.id}`}
                  className={`rounded-xl border p-4 space-y-3 transition-colors ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        id={`bn-${stage.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleBottleneckStage(stage.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`bn-${stage.id}`}
                        className="cursor-pointer flex flex-wrap items-center gap-2"
                      >
                        <span className="text-xs font-bold text-indigo-300 uppercase">
                          {stage.code}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {stage.title}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          ({markedCount} / {totalCount} observed)
                        </span>
                      </label>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/40 self-start sm:self-center">
                        <Flag className="w-3 h-3" />
                        Selected for Investigation
                      </span>
                    )}
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      dir="auto"
                      value={review?.investigation_notes || ''}
                      onChange={(e) =>
                        handleUpdateStageInvestigationNotes(stage.id, e.target.value)
                      }
                      placeholder="Why does this stage warrant further investigation? (Impact hypothesis, missing evidence...)"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION E: Next Investigation Steps */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Next Investigation Steps
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Document your discovery plan before making any final diagnosis or proposing solutions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSaveResultsAndSteps()}
            disabled={savingResults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            Save Steps
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Questions to ask the business owner
            </label>
            <textarea
              rows={4}
              dir="auto"
              value={nextQuestions}
              onChange={(e) => setNextQuestions(e.target.value)}
              placeholder="e.g. How many DMs per day turn into confirmed orders? Do you have a separate WhatsApp catalog?"
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Database className="w-4 h-4 text-emerald-400" />
              Data I need to collect
            </label>
            <textarea
              rows={4}
              dir="auto"
              value={nextDataToCollect}
              onChange={(e) => setNextDataToCollect(e.target.value)}
              placeholder="e.g. Monthly ad spend, average reply time, COD return/refusal rate, repeat buyer count..."
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <FileSearch className="w-4 h-4 text-amber-400" />
              Examples or records I need to inspect
            </label>
            <textarea
              rows={4}
              dir="auto"
              value={nextRecordsToInspect}
              onChange={(e) => setNextRecordsToInspect(e.target.value)}
              placeholder="e.g. Last 10 Instagram DM conversations, sample order confirmation messages, ad comments..."
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <CircleHelp className="w-4 h-4 text-rose-400" />
              Information that is still unknown
            </label>
            <textarea
              rows={4}
              dir="auto"
              value={nextUnknownInfo}
              onChange={(e) => setNextUnknownInfo(e.target.value)}
              placeholder="e.g. Whether they use a delivery company dashboard or track orders in notebooks..."
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
