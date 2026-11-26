'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ChevronsDownUp,
  ChevronsUpDown,
  AlertTriangle,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Business,
  BusinessAnalysis,
  AnalysisChecklistItem,
  VerificationStatus,
} from '@/lib/types';
import {
  BUSINESS_ANALYSIS_STAGES,
  VERIFICATION_STATUS_OPTIONS,
} from '@/lib/business-analysis-checklist';
import { AnalysisProgressHeader } from '@/components/analysis/AnalysisProgressHeader';
import { StageChecklistAccordion } from '@/components/analysis/StageChecklistAccordion';
import {
  NewBusinessAnalysisModal,
  BusinessFormValues,
} from '@/components/analysis/NewBusinessAnalysisModal';

export default function BusinessAnalysisChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params?.id as string;

  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [itemsByProblemId, setItemsByProblemId] = useState<
    Record<string, AnalysisChecklistItem>
  >({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>(
    'saved'
  );

  // Accordion & Filter state
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    stage_1_traffic: true,
    stage_2_lead_capture: false,
    stage_3_lead_management: false,
    stage_4_sales: false,
    stage_5_customer_experience: false,
    stage_6_retention: false,
    stage_7_operations_intelligence: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedFilter, setCheckedFilter] = useState<'all' | 'checked' | 'unchecked'>(
    'all'
  );
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);

  // Debounce timers per problem_id
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const latestItemsRef = useRef<Record<string, AnalysisChecklistItem>>({});
  latestItemsRef.current = itemsByProblemId;

  const loadAnalysis = useCallback(async () => {
    if (!analysisId) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const [analysisRes, itemsRes] = await Promise.all([
        supabase
          .from('business_analyses')
          .select('*, businesses(*)')
          .eq('id', analysisId)
          .single(),
        supabase
          .from('analysis_checklist_items')
          .select('*')
          .eq('analysis_id', analysisId),
      ]);

      if (analysisRes.error) throw analysisRes.error;
      if (itemsRes.error) throw itemsRes.error;

      const loadedAnalysis = analysisRes.data as BusinessAnalysis;
      setAnalysis(loadedAnalysis);
      setBusiness((loadedAnalysis.businesses as Business) || null);

      const map: Record<string, AnalysisChecklistItem> = {};
      for (const row of (itemsRes.data || []) as AnalysisChecklistItem[]) {
        map[row.problem_id] = row;
      }
      setItemsByProblemId(map);
    } catch (err: any) {
      console.error('Error loading business analysis:', err);
      setErrorMsg(err?.message || 'Unable to load this business analysis.');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    loadAnalysis();
    return () => {
      Object.values(pendingTimersRef.current).forEach(clearTimeout);
    };
  }, [loadAnalysis]);

  const upsertSingleItem = async (item: AnalysisChecklistItem) => {
    try {
      setSaveState('saving');
      const now = new Date().toISOString();

      const { error: itemErr } = await supabase
        .from('analysis_checklist_items')
        .upsert(
          {
            analysis_id: item.analysis_id,
            stage_id: item.stage_id,
            subcategory_id: item.subcategory_id || '',
            problem_id: item.problem_id,
            is_checked: item.is_checked,
            verification_status: item.verification_status,
            evidence: item.evidence || '',
            notes: item.notes || '',
            updated_at: now,
          },
          { onConflict: 'analysis_id,problem_id' }
        );

      if (itemErr) throw itemErr;

      await supabase
        .from('business_analyses')
        .update({ updated_at: now })
        .eq('id', item.analysis_id);

      setSaveState('saved');
    } catch (err) {
      console.error('Error saving checklist item:', err);
      setSaveState('error');
    }
  };

  const handleToggleProblem = (
    problemId: string,
    stageId: string,
    subcategoryId: string,
    checked: boolean
  ) => {
    const existing = latestItemsRef.current[problemId];
    const nextItem: AnalysisChecklistItem = {
      analysis_id: analysisId,
      stage_id: stageId,
      subcategory_id: subcategoryId,
      problem_id: problemId,
      is_checked: checked,
      verification_status: existing?.verification_status || 'Observed',
      evidence: existing?.evidence || '',
      notes: existing?.notes || '',
    };

    if (pendingTimersRef.current[problemId]) {
      clearTimeout(pendingTimersRef.current[problemId]);
      delete pendingTimersRef.current[problemId];
    }

    setItemsByProblemId((prev) => ({
      ...prev,
      [problemId]: nextItem,
    }));

    void upsertSingleItem(nextItem);
  };

  const handleUpdateProblemDetails = (
    problemId: string,
    stageId: string,
    subcategoryId: string,
    patch: Partial<Pick<AnalysisChecklistItem, 'verification_status' | 'evidence' | 'notes'>>
  ) => {
    const existing = latestItemsRef.current[problemId];
    const nextItem: AnalysisChecklistItem = {
      analysis_id: analysisId,
      stage_id: stageId,
      subcategory_id: subcategoryId,
      problem_id: problemId,
      is_checked: existing?.is_checked ?? false,
      verification_status:
        patch.verification_status ??
        existing?.verification_status ??
        ('Observed' as VerificationStatus),
      evidence: patch.evidence ?? existing?.evidence ?? '',
      notes: patch.notes ?? existing?.notes ?? '',
    };

    setItemsByProblemId((prev) => ({
      ...prev,
      [problemId]: nextItem,
    }));
    setSaveState('unsaved');

    if (pendingTimersRef.current[problemId]) {
      clearTimeout(pendingTimersRef.current[problemId]);
    }
    pendingTimersRef.current[problemId] = setTimeout(() => {
      delete pendingTimersRef.current[problemId];
      void upsertSingleItem(nextItem);
    }, 500);
  };

  const handleSaveAll = async () => {
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
    pendingTimersRef.current = {};

    const items = Object.values(latestItemsRef.current);
    try {
      setSaveState('saving');
      const now = new Date().toISOString();

      if (items.length > 0) {
        const payload = items.map((item) => ({
          analysis_id: item.analysis_id,
          stage_id: item.stage_id,
          subcategory_id: item.subcategory_id || '',
          problem_id: item.problem_id,
          is_checked: item.is_checked,
          verification_status: item.verification_status,
          evidence: item.evidence || '',
          notes: item.notes || '',
          updated_at: now,
        }));

        const { error } = await supabase
          .from('analysis_checklist_items')
          .upsert(payload, { onConflict: 'analysis_id,problem_id' });
        if (error) throw error;
      }

      const { error: analysisErr } = await supabase
        .from('business_analyses')
        .update({ updated_at: now })
        .eq('id', analysisId);
      if (analysisErr) throw analysisErr;

      setSaveState('saved');
    } catch (err) {
      console.error('Failed to save all analysis items:', err);
      setSaveState('error');
    }
  };

  const handleUpdateBusiness = async (values: BusinessFormValues) => {
    if (!business) return;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('businesses')
      .update({
        name: values.name,
        instagram_url: values.instagram_url,
        website_url: values.website_url,
        business_type: values.business_type,
        business_category: values.business_category,
        business_status: values.business_status,
        main_product_or_service: values.main_product_or_service,
        contact_channels: values.contact_channels,
        general_notes: values.general_notes,
        updated_at: now,
      })
      .eq('id', business.id)
      .select()
      .single();

    if (error) throw error;
    setBusiness(data as Business);
  };

  const setAllAccordions = (expanded: boolean) => {
    const next: Record<string, boolean> = {};
    for (const stage of BUSINESS_ANALYSIS_STAGES) {
      next[stage.id] = expanded;
    }
    setExpandedStages(next);
  };

  const handleJumpToStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: true }));
    setTimeout(() => {
      const el = document.getElementById(stageId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (errorMsg || !analysis || !business) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Analysis Not Found</h2>
        <p className="text-sm text-slate-400">
          {errorMsg || 'This business analysis could not be loaded.'}
        </p>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Business Analysis Dashboard
        </Link>
      </div>
    );
  }

  const allExpanded = BUSINESS_ANALYSIS_STAGES.every(
    (s) => expandedStages[s.id]
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Progress & Stage Summary Header */}
      <AnalysisProgressHeader
        analysisId={analysis.id}
        business={business}
        itemsByProblemId={itemsByProblemId}
        saveState={saveState}
        onSaveAll={handleSaveAll}
        onViewResults={async () => {
          await handleSaveAll();
          router.push(`/analysis/${analysis.id}/results`);
        }}
        onEditBusiness={() => setIsEditBusinessOpen(true)}
        onJumpToStage={handleJumpToStage}
      />

      {/* Checklist Search, Filter & Accordion Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            dir="auto"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim()) setAllAccordions(true);
            }}
            placeholder="Search problems, evidence, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center bg-slate-950/80 border border-slate-700 rounded-xl p-1">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'checked', label: 'Marked (X)' },
                { key: 'unchecked', label: 'Unchecked' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setCheckedFilter(opt.key);
                  if (opt.key !== 'all') setAllAccordions(true);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  checkedFilter === opt.key
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                if (e.target.value !== 'all') setAllAccordions(true);
              }}
              className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Verification Statuses</option>
              {VERIFICATION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setAllAccordions(!allExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            {allExpanded ? (
              <>
                <ChevronsDownUp className="w-3.5 h-3.5" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronsUpDown className="w-3.5 h-3.5" />
                Expand All
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7 Stage Collapsible Accordions */}
      <div className="space-y-4">
        {BUSINESS_ANALYSIS_STAGES.map((stage) => (
          <StageChecklistAccordion
            key={stage.id}
            stage={stage}
            isExpanded={Boolean(expandedStages[stage.id])}
            onToggleExpand={() =>
              setExpandedStages((prev) => ({
                ...prev,
                [stage.id]: !prev[stage.id],
              }))
            }
            itemsByProblemId={itemsByProblemId}
            onToggleProblem={handleToggleProblem}
            onUpdateProblemDetails={handleUpdateProblemDetails}
            searchQuery={searchQuery}
            checkedFilter={checkedFilter}
            verificationFilter={verificationFilter}
          />
        ))}
      </div>

      {/* Edit Business Details Modal */}
      <NewBusinessAnalysisModal
        isOpen={isEditBusinessOpen}
        onClose={() => setIsEditBusinessOpen(false)}
        onSubmit={handleUpdateBusiness}
        initialBusiness={business}
      />
    </div>
  );
}
