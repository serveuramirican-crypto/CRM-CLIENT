'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  FileText,
  Flame,
  Clock,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CadenceMap } from '@/components/CadenceMap';

export default function CadencePage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-800"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Workflow className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Outreach <span className="text-amber-400">Cadence</span> Map
              </h1>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Battle-Tested Playbook
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            A high-converting client acquisition execution system. Select a 7-day primary pathway
            for your prospect, navigate response decision gates, and execute proven follow-ups.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            Message Templates
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <TrendingUp className="w-4 h-4" />
            Active Pipeline
          </Link>
        </div>
      </div>

      {/* Cadence Methodology Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Clock className="w-4 h-4 text-indigo-400" />
            Primary Sprint
          </div>
          <div className="text-xl font-black text-white mt-2">7 Days</div>
          <p className="text-[11px] text-slate-500 mt-0.5">4 touchpoints per channel</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-emerald-400" />
            Speed to Lead
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2">&lt; 15 Mins</div>
          <p className="text-[11px] text-slate-500 mt-0.5">For engaged prospect replies</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            Escalation Phase
          </div>
          <div className="text-xl font-black text-rose-300 mt-2">Days 8 - 14</div>
          <p className="text-[11px] text-slate-500 mt-0.5">3 calls if no written reply</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Nurture Horizon
          </div>
          <div className="text-xl font-black text-amber-300 mt-2">30 Days</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Reactivation cooldown</p>
        </div>
      </div>

      {/* The Visual Flowchart Map */}
      <CadenceMap />

      {/* Strategy & Best Practices Guide */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Core Outreach Principles for this Cadence
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="font-bold text-indigo-400 block mb-1">
              1. Never Pitch in Message #1
            </span>
            Message #1 only has one objective: earn permission to send a 2-minute video or start a
            conversation. Pitching your full service upfront causes instant drop-off.
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="font-bold text-emerald-400 block mb-1">
              2. Strict Speed to Lead
            </span>
            When a prospect replies "YES", they are at peak attention. Replying within 15 minutes
            multiplies your booking rate by 4x compared to waiting 2 hours.
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="font-bold text-rose-400 block mb-1">
              3. Channel Switch on Day #7
            </span>
            If written messages get ghosted, switch to calling (Days 8-14). Never send 10 DMs to a
            silent lead; respect boundaries and alternate touchpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
