'use client';

import React from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  ChecklistStageConfig,
  AnalysisChecklistItem,
  ChecklistProblemConfig,
} from '@/lib/types';
import { getStageProblems } from '@/lib/business-analysis-checklist';
import { ChecklistProblemRow } from './ChecklistProblemRow';

interface StageChecklistAccordionProps {
  stage: ChecklistStageConfig;
  isExpanded: boolean;
  onToggleExpand: () => void;
  itemsByProblemId: Record<string, AnalysisChecklistItem>;
  onToggleProblem: (
    problemId: string,
    stageId: string,
    subcategoryId: string,
    checked: boolean
  ) => void;
  onUpdateProblemDetails: (
    problemId: string,
    stageId: string,
    subcategoryId: string,
    patch: Partial<Pick<AnalysisChecklistItem, 'verification_status' | 'evidence' | 'notes'>>
  ) => void;
  searchQuery: string;
  checkedFilter: 'all' | 'checked' | 'unchecked';
  verificationFilter: string;
}

export function StageChecklistAccordion({
  stage,
  isExpanded,
  onToggleExpand,
  itemsByProblemId,
  onToggleProblem,
  onUpdateProblemDetails,
  searchQuery,
  checkedFilter,
  verificationFilter,
}: StageChecklistAccordionProps) {
  const allStageProblems = getStageProblems(stage);
  const markedCount = allStageProblems.filter(
    (p) => itemsByProblemId[p.id]?.is_checked
  ).length;
  const totalCount = allStageProblems.length;
  const hasMarks = markedCount > 0;
  const pct = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;

  const matchesFilters = (problem: ChecklistProblemConfig) => {
    const item = itemsByProblemId[problem.id];
    const isChecked = Boolean(item?.is_checked);

    if (checkedFilter === 'checked' && !isChecked) return false;
    if (checkedFilter === 'unchecked' && isChecked) return false;

    if (verificationFilter !== 'all') {
      if (!isChecked) return false;
      const status = item?.verification_status || 'Observed';
      if (status !== verificationFilter) return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const haystack = [problem.text, item?.evidence, item?.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  };

  const visibleDirectProblems = stage.problems
    ? stage.problems.filter(matchesFilters)
    : [];
  const visibleSubcategories = stage.subcategories
    ? stage.subcategories
        .map((sub) => ({
          ...sub,
          problems: sub.problems.filter(matchesFilters),
        }))
        .filter((sub) => sub.problems.length > 0)
    : [];

  const visibleCount = stage.problems
    ? visibleDirectProblems.length
    : visibleSubcategories.reduce((acc, sub) => acc + sub.problems.length, 0);

  return (
    <section
      id={stage.id}
      className={`rounded-2xl border overflow-hidden transition-colors scroll-mt-52 ${
        hasMarks
          ? 'bg-slate-900/80 border-rose-500/35'
          : 'bg-slate-900/70 border-slate-800'
      }`}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-0.5 sm:mt-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                {stage.code}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {stage.title}
              </h2>
              {hasMarks ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3" />
                  {markedCount} marked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3" />
                  0 marked
                </span>
              )}
            </div>
            <p dir="rtl" className="text-xs sm:text-sm text-slate-300 text-right">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Stage Progress Counter */}
        <div className="flex items-center gap-3 shrink-0 pl-9 sm:pl-0">
          <div className="w-28 hidden md:block">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  hasMarks ? 'bg-rose-500' : 'bg-slate-700'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-300 tabular-nums whitespace-nowrap">
            {markedCount} / {totalCount}
          </span>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
          {visibleCount === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No checklist items in this stage match the current search or filters.
            </div>
          ) : stage.problems ? (
            <div className="space-y-2.5">
              {visibleDirectProblems.map((problem) => (
                <ChecklistProblemRow
                  key={problem.id}
                  problem={problem}
                  itemState={itemsByProblemId[problem.id]}
                  onToggle={(problemId, checked) =>
                    onToggleProblem(problemId, stage.id, '', checked)
                  }
                  onUpdateDetails={(problemId, patch) =>
                    onUpdateProblemDetails(problemId, stage.id, '', patch)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {visibleSubcategories.map((sub) => {
                const subOriginal = stage.subcategories?.find((s) => s.id === sub.id);
                const subTotal = subOriginal?.problems.length || sub.problems.length;
                const subMarked = (subOriginal?.problems || sub.problems).filter(
                  (p) => itemsByProblemId[p.id]?.is_checked
                ).length;

                return (
                  <div key={sub.id} className="space-y-2.5">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <h3 className="text-xs sm:text-sm font-bold text-indigo-300 tracking-wide">
                        {sub.title}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400 tabular-nums">
                        {subMarked} / {subTotal} marked
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sub.problems.map((problem) => (
                        <ChecklistProblemRow
                          key={problem.id}
                          problem={problem}
                          itemState={itemsByProblemId[problem.id]}
                          onToggle={(problemId, checked) =>
                            onToggleProblem(problemId, stage.id, sub.id, checked)
                          }
                          onUpdateDetails={(problemId, patch) =>
                            onUpdateProblemDetails(problemId, stage.id, sub.id, patch)
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
