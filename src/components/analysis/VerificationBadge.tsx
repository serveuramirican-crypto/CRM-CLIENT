'use client';

import React from 'react';
import { VerificationStatus, BusinessStatus, AnalysisStatus } from '@/lib/types';

const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  Observed: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Possible Problem': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Validated Problem': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Not Verified': 'bg-slate-700/60 text-slate-300 border-slate-600',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${
        VERIFICATION_STYLES[status] || VERIFICATION_STYLES.Observed
      }`}
    >
      {status}
    </span>
  );
}

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  const isActive = status === 'Active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-slate-700/50 text-slate-400 border-slate-600'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-400' : 'bg-slate-500'
        }`}
      />
      {status}
    </span>
  );
}

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  const isDone = status === 'completed';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
        isDone
          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      }`}
    >
      {isDone ? 'Reviewed' : 'In Progress'}
    </span>
  );
}
