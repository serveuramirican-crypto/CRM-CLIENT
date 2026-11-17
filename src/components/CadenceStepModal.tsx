'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  Send,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export interface CadenceStepInfo {
  id: string;
  title: string;
  day: string;
  pathway: 'written' | 'calls' | 'irl';
  type: 'action' | 'decision' | 'success' | 'escalation' | 'nurture';
  objective: string;
  timing: string;
  channel: string;
  description: string;
  tips: string[];
  suggestedScript?: string;
}

interface CadenceStepModalProps {
  step: CadenceStepInfo | null;
  onClose: () => void;
}

export function CadenceStepModal({ step, onClose }: CadenceStepModalProps) {
  const [copied, setCopied] = useState(false);

  if (!step) return null;

  const handleCopyScript = () => {
    if (step.suggestedScript) {
      navigator.clipboard.writeText(step.suggestedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeStyle = () => {
    switch (step.type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'escalation':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'nurture':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'decision':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getBadgeStyle()}`}
            >
              {step.day}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-400">{step.objective}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Primary Channel
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {step.channel}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Recommended Timing
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {step.timing}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Target Outcome
              </span>
              <span className="text-xs font-semibold text-indigo-300 mt-1 block capitalize">
                {step.type === 'success'
                  ? 'Book Decision Call'
                  : step.type === 'escalation'
                  ? 'Re-engage Prospect'
                  : 'Get Qualified Response'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Playbook Overview
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              {step.description}
            </p>
          </div>

          {/* Execution Rules / Tips */}
          {step.tips && step.tips.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Execution Rules & Best Practices
              </h4>
              <ul className="space-y-2">
                {step.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Script / Copy */}
          {step.suggestedScript && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Battle-Tested Script Template
                </h4>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {step.suggestedScript}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Open Message Templates
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
