'use client';

import React from 'react';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils';
import { ClientStatus, Priority } from '@/lib/types';

export function StatusBadge({ status }: { status: ClientStatus }) {
  const config = STATUS_LABELS[status] || {
    label: status,
    color: 'text-slate-300',
    bg: 'bg-slate-700/50 border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_LABELS[priority] || {
    label: priority,
    badge: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.badge}`}
    >
      {config.label}
    </span>
  );
}

