import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number = 0, currency = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead: { label: 'New Lead', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  follow_up: { label: 'Follow Up', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  meeting_booked: { label: 'Meeting Booked', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  negotiation: { label: 'Negotiation', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  won: { label: 'Closed / Won', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  lost: { label: 'Lost', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
};

export const PRIORITY_LABELS: Record<string, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  medium: { label: 'Medium', badge: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
  high: { label: 'High', badge: 'bg-orange-900/40 text-orange-300 border-orange-700/50' },
  urgent: { label: 'Urgent 🔥', badge: 'bg-red-900/40 text-red-300 border-red-700/50' },
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}


