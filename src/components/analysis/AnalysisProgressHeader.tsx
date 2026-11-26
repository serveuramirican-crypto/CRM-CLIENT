'use client';

import React from 'react';
import Link from 'next/link';
import {
  X as XIcon,
  AlertTriangle,
  BarChart3,
  Save,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Edit2,
  ClipboardList,
} from 'lucide-react';
import {
  BUSINESS_ANALYSIS_STAGES,
  TOTAL_CHECKLIST_ITEMS,
  getStageProblems,
} from '@/lib/business-analysis-checklist';
import { AnalysisChecklistItem, Business } from '@/lib/types';
import { BusinessStatusBadge } from './VerificationBadge';

interface AnalysisProgressHeaderProps {
  analysisId: string;
  business: Business;
  itemsByProblemId: Record<string, AnalysisChecklistItem>;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error';
  onSaveAll: () => void;
  onViewResults: () => void;
  onEditBusiness: () => void;
  onJumpToStage?: (stageId: string) => void;
}

export function AnalysisProgressHeader({
  analysisId,
  business,
  itemsByProblemId,
  saveState,
  onSaveAll,
  onViewResults,
  onEditBusiness,
  onJumpToStage,
}: AnalysisProgressHeaderProps) {
  const checkedItems = Object.values(itemsByProblemId).filter((item) => item.is_checked);
  const totalMarked = checkedItems.length;
  const overallPercent =
    TOTAL_CHECKLIST_ITEMS > 0
      ? Math.round((totalMarked / TOTAL_CHECKLIST_ITEMS) * 100)
      : 0;

  const stageCounts = BUSINESS_ANALYSIS_STAGES.map((stage) => {
    const stageProblems = getStageProblems(stage);
    const markedCount = stageProblems.filter(
      (p) => itemsByProblemId[p.id]?.is_checked
    ).length;
    return {
      stage,
      markedCount,
      totalCount: stageProblems.length,
    };
  });

  const stagesWithMarksCount = stageCounts.filter((s) => s.markedCount > 0).length;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/analysis"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Back to Business Analysis Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {business.name}
            </h1>
            <BusinessStatusBadge status={business.business_status} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {business.business_type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
              {business.business_category}
            </span>
          </div>
          {business.main_product_or_service && (
            <p className="text-xs text-slate-400 pl-9">
              Main Offer: <span className="text-slate-200">{business.main_product_or_service}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Save State Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {saveState === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span className="text-indigo-300">Saving...</span>
              </>
            ) : saveState === 'error' ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Save failed — retry</span>
              </>
            ) : saveState === 'unsaved' ? (
              <span className="text-amber-300">Unsaved changes</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Saved</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onEditBusiness}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Business
          </button>

          <button
            type="button"
            onClick={onSaveAll}
            disabled={saveState === 'saving'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            Save Analysis
          </button>

          <button
            type="button"
            onClick={onViewResults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View Analysis Results
          </button>
        </div>
      </div>

      {/* Global Metrics & Stage Progress Strip */}
      <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Problems Marked (X)</span>
              <XIcon className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-white tabular-nums">
              {totalMarked}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Checklist Items</span>
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-200 tabular-nums">
              {TOTAL_CHECKLIST_ITEMS}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Marked Ratio</span>
              <span className="text-[11px] font-semibold text-indigo-400 tabular-nums">
                {totalMarked}/{TOTAL_CHECKLIST_ITEMS}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-300 tabular-nums">
                {overallPercent}%
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Stages With Signals</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-amber-300 tabular-nums">
              {stagesWithMarksCount} <span className="text-xs font-normal text-slate-500">/ 7</span>
            </div>
          </div>
        </div>

        {/* 7 Stage Mini-Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stageCounts.map(({ stage, markedCount, totalCount }) => {
            const pct = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;
            const hasSignals = markedCount > 0;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onJumpToStage?.(stage.id)}
                className={`text-left p-2.5 rounded-xl border transition-colors ${
                  hasSignals
                    ? 'bg-rose-950/20 border-rose-500/35 hover:border-rose-400/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    S{stage.stageNumber}
                  </span>
                  {hasSignals && (
                    <span
                      className="w-2 h-2 rounded-full bg-rose-400"
                      title="Has observed warning signs"
                    />
                  )}
                </div>
                <p className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                  {stage.title}
                </p>
                <div className="flex items-center justify-between text-[11px] mt-1.5 tabular-nums">
                  <span className={hasSignals ? 'text-rose-300 font-bold' : 'text-slate-500'}>
                    {markedCount} / {totalCount}
                  </span>
                  <span className="text-slate-500">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      hasSignals ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Each <strong className="text-rose-300">X</strong> marks an observed warning sign for further investigation — a higher count in a stage does not automatically mean it is the primary bottleneck.
          </span>
        </p>
      </div>
    </div>
  );
}
