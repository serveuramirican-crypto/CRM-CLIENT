'use client';

import React, { useState } from 'react';
import { X as XIcon, ChevronDown, ChevronUp, FileText, ShieldAlert } from 'lucide-react';
import {
  ChecklistProblemConfig,
  AnalysisChecklistItem,
  VerificationStatus,
} from '@/lib/types';
import { VERIFICATION_STATUS_OPTIONS } from '@/lib/business-analysis-checklist';
import { VerificationBadge } from './VerificationBadge';

interface ChecklistProblemRowProps {
  problem: ChecklistProblemConfig;
  itemState?: AnalysisChecklistItem;
  onToggle: (problemId: string, checked: boolean) => void;
  onUpdateDetails: (
    problemId: string,
    patch: Partial<Pick<AnalysisChecklistItem, 'verification_status' | 'evidence' | 'notes'>>
  ) => void;
}

export function ChecklistProblemRow({
  problem,
  itemState,
  onToggle,
  onUpdateDetails,
}: ChecklistProblemRowProps) {
  const isChecked = Boolean(itemState?.is_checked);
  const verificationStatus: VerificationStatus =
    itemState?.verification_status || 'Observed';
  const evidence = itemState?.evidence || '';
  const notes = itemState?.notes || '';
  const hasMetadata = Boolean(evidence.trim() || notes.trim());

  const [detailsOpen, setDetailsOpen] = useState(false);
  const checkboxId = `problem-${problem.id}`;

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(problem.id, checked);
    if (checked && !detailsOpen) {
      // Keep details collapsed by default so scanning stays compact, user can expand anytime
    }
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isChecked
          ? 'bg-rose-950/15 border-rose-500/40'
          : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
      }`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {/* Accessible real checkbox + X visual mark */}
        <div className="relative shrink-0 pt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="peer sr-only"
          />
          <label
            htmlFor={checkboxId}
            aria-label={`Mark problem ${problem.number}`}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-colors select-none peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 ${
              isChecked
                ? 'bg-rose-600 border-rose-500 text-white shadow-sm shadow-rose-600/30'
                : 'bg-slate-900 border-slate-600 text-transparent hover:border-slate-400'
            }`}
          >
            {isChecked && <XIcon className="w-4 h-4 stroke-[3]" />}
          </label>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <label
              htmlFor={checkboxId}
              dir="rtl"
              className={`text-sm leading-relaxed cursor-pointer flex-1 text-right ${
                isChecked ? 'text-white font-medium' : 'text-slate-200'
              }`}
            >
              <span
                dir="ltr"
                className="inline-block ml-2 px-1.5 py-0.5 rounded bg-slate-800/90 text-[11px] font-mono text-slate-400 tabular-nums align-middle"
              >
                {problem.number}
              </span>
              {problem.text}
            </label>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              {isChecked && <VerificationBadge status={verificationStatus} />}

              <button
                type="button"
                onClick={() => setDetailsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  detailsOpen || hasMetadata
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{hasMetadata ? 'Evidence / Notes' : 'Add Evidence'}</span>
                {detailsOpen ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Quick preview when collapsed and has evidence/notes */}
          {!detailsOpen && hasMetadata && (
            <div className="text-xs text-slate-400 bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 space-y-1">
              {evidence.trim() && (
                <p dir="auto" className="truncate">
                  <span className="text-indigo-400 font-semibold">Evidence: </span>
                  {evidence}
                </p>
              )}
              {notes.trim() && (
                <p dir="auto" className="truncate">
                  <span className="text-slate-300 font-semibold">Notes: </span>
                  {notes}
                </p>
              )}
            </div>
          )}

          {/* Expandable Evidence, Notes & Verification Status Drawer */}
          {detailsOpen && (
            <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    Verification Status
                  </label>
                  <select
                    value={verificationStatus}
                    onChange={(e) =>
                      onUpdateDetails(problem.id, {
                        verification_status: e.target.value as VerificationStatus,
                      })
                    }
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Evidence (Links, observations, post dates, screenshots...)
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={evidence}
                    onChange={(e) =>
                      onUpdateDetails(problem.id, { evidence: e.target.value })
                    }
                    placeholder="e.g. Last post was 19 days ago; no WhatsApp link in bio..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Investigation Notes
                </label>
                <textarea
                  rows={2}
                  dir="auto"
                  value={notes}
                  onChange={(e) =>
                    onUpdateDetails(problem.id, { notes: e.target.value })
                  }
                  placeholder="Context, caveats, or questions to confirm with the owner..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
