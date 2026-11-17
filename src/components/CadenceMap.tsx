'use client';

import React, { useState } from 'react';
import {
  Play,
  ArrowDown,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CadenceStepModal, CadenceStepInfo } from './CadenceStepModal';

// Cadence step data repository
const CADENCE_STEPS_DATA: Record<string, CadenceStepInfo> = {
  // Pathway A
  'written_day_1': {
    id: 'written_day_1',
    title: 'DAY 1: MESSAGE #1 (The Hook)',
    day: 'Day 1',
    pathway: 'written',
    type: 'action',
    channel: 'Instagram DM / Cold Email',
    timing: 'Morning (9:00 AM - 11:30 AM local prospect time)',
    objective: 'Spark curiosity with a personalized observation, without selling or sending huge walls of text.',
    description:
      'The initial touchpoint. Never pitch your service directly here. Compliment a specific recent post or business initiative, identify a subtle area of improvement, and ask a low-friction question.',
    tips: [
      'Keep it under 3-4 concise sentences.',
      'Mention a specific post or product on their profile to prove non-automated research.',
      'End with a permission-based question (e.g. "Mind if I send over a 2-min breakdown?").',
    ],
    suggestedScript:
      'Hey {{client_name}}, loved your recent post on {{business_name}} regarding your latest collection! I noticed a quick opportunity to optimize conversion rate on your store. Mind if I shoot over a quick 2-min video showing what I mean?',
  },
  'written_day_3': {
    id: 'written_day_3',
    title: 'DAY 3: FOLLOW-UP #2 (Value Drop)',
    day: 'Day 3',
    pathway: 'written',
    type: 'action',
    channel: 'Instagram DM / Reply in Thread',
    timing: '48 hours after Message #1 (Early Afternoon)',
    objective: 'Provide a tangible asset, mini-audit, or proof point before asking for their time.',
    description:
      'Most decision-makers open message #1 on mobile while busy. Day 3 re-bumps your thread with upfront value instead of "Did you see my previous message?".',
    tips: [
      'Attach a screenshot or short Loom screen recording.',
      'Zero pressure tone — give value freely.',
    ],
    suggestedScript:
      'Hey {{client_name}}! Put together a quick 90-second teardown of 2 quick tweaks that generated +34% replies for another agency in your niche. Let me know if you want me to drop the link here!',
  },
  'written_day_5': {
    id: 'written_day_5',
    title: 'DAY 5: FOLLOW-UP #3 (Social Proof / Case Study)',
    day: 'Day 5',
    pathway: 'written',
    type: 'action',
    channel: 'Instagram DM / Cold Email',
    timing: '4 days after initial message',
    objective: 'Demonstrate outcome certainty through relevant client results in the same niche.',
    description:
      'Share a bite-sized case study showing a metric that directly matters to their bottom line (leads, bookings, or revenue).',
    tips: [
      'Focus on the specific result achieved in a set timeframe.',
      'Keep call to action relaxed: "Open to seeing how we did it?"',
    ],
    suggestedScript:
      'Hey {{client_name}}, quick stat: helped a brand similar to {{business_name}} add 14 booked calls in 3 weeks using this exact outreach pipeline. Happy to share our raw workflow if you are looking to scale this quarter?',
  },
  'written_day_7': {
    id: 'written_day_7',
    title: 'DAY 7: FOLLOW-UP #4 (The Breakup / Urgency)',
    day: 'Day 7',
    pathway: 'written',
    type: 'action',
    channel: 'Instagram DM / Email',
    timing: '7 days from start (Friday or Weekend transition)',
    objective: 'Close the loop gracefully and leverage takeaway selling psychology.',
    description:
      'The "breakup" message triggers FOMO. When you politely assume they are busy or not interested, reply rates often jump significantly.',
    tips: [
      'Politely release them from follow-ups.',
      'Leave the door open without sounding passive-aggressive.',
    ],
    suggestedScript:
      'Hey {{client_name}}, assuming scaling your outreach pipeline is not a priority right now, so I will stop bugging you! If things change down the road, feel free to reach out anytime. Wish you guys continued success!',
  },

  // Pathway B (Calls)
  'calls_day_1': {
    id: 'calls_day_1',
    title: 'DAY 1: CALL #1 + RECAP EMAIL',
    day: 'Day 1',
    pathway: 'calls',
    type: 'action',
    channel: 'Direct Phone / Cold Call + Email',
    timing: 'Tuesday - Thursday (10:00 AM or 4:00 PM)',
    objective: 'Attempt direct phone conversation; immediately send written recap if voicemail or gatekeeper.',
    description:
      'Aim for a 30-second permission-based cold call. If they do not pick up, leave a 20-second voicemail and immediately send an email with the subject: "Called you earlier / [First Name]".',
    tips: [
      'Use pattern interrupts: "Hey John, this is Alex, know I caught you out of the blue, got 30 seconds?".',
      'Follow up via email within 5 minutes of hanging up.',
    ],
    suggestedScript:
      'Hi {{client_name}}, Alex here with Outreach CRM. I know I caught you in the middle of your day, but I noticed {{business_name}} is scaling up marketing. Got 30 seconds to explain why I called, and you can tell me if it makes sense?',
  },
  'calls_day_3': {
    id: 'calls_day_3',
    title: 'DAY 3: CALL #2 (Different Time Window)',
    day: 'Day 3',
    pathway: 'calls',
    type: 'action',
    channel: 'Phone Call',
    timing: 'Switch from Morning to Afternoon (or vice versa)',
    objective: 'Reach the decision maker when they are not in peak operational meetings.',
    description:
      'Vary the calling hour. If you called at 10 AM on Day 1, dial at 4:30 PM on Day 3 when executives wrap up their day.',
    tips: [
      'Do not leave a second voicemail if you already left one on Day 1.',
      'Reference your previous email if they answer.',
    ],
  },
  'calls_day_5': {
    id: 'calls_day_5',
    title: 'DAY 5: CALL #3 (Alternative Number / WhatsApp)',
    day: 'Day 5',
    pathway: 'calls',
    type: 'action',
    channel: 'Phone / WhatsApp Voice Note',
    timing: 'Friday mid-day',
    objective: 'Alternative touchpoint before the close-loop sequence.',
    description:
      'A quick follow-up attempt or a 25-second personalized WhatsApp voice note if a mobile number is available.',
    tips: ['Keep voice notes under 30 seconds.', 'Friendly, low-friction, human tone.'],
  },
  'calls_day_7': {
    id: 'calls_day_7',
    title: 'DAY 7: CLOSE-LOOP EMAIL',
    day: 'Day 7',
    pathway: 'calls',
    type: 'action',
    channel: 'Email',
    timing: 'Day 7 morning',
    objective: 'Clean closing email signifying the end of calling outreach.',
    description:
      'Short 3-line email letting them know you are closing their file for now so you do not clutter their inbox.',
    tips: ['Short subject line: "Closing loop / {{business_name}}".'],
    suggestedScript:
      'Subject: Permission to close file?\n\nHey {{client_name}},\n\nTried reaching you by phone a couple of times this week regarding {{business_name}}\'s client acquisition pipeline. Haven\'t heard back so I will assume the timing is off.\n\nShould I check back next quarter, or take you off my radar entirely?',
  },

  // Pathway C (IRL)
  'irl_day_1': {
    id: 'irl_day_1',
    title: 'DAY 1: VISIT #1 (In-Person Drop-In)',
    day: 'Day 1',
    pathway: 'irl',
    type: 'action',
    channel: 'In-Person Location Drop-In',
    timing: 'Off-peak business hours (e.g. 2:00 PM - 3:30 PM)',
    objective: 'Make memorable human contact with the front desk/manager and identify the key decision maker.',
    description:
      'Dress appropriately, bring a branded one-pager or portfolio piece, and politely inquire for the manager or business owner. Be respectful of their active customers.',
    tips: [
      'Never demand immediate pitch meetings from a busy owner on-site.',
      'Ask for the direct email/card of the decision maker.',
      'Leave your card with a handwritten note on the back.',
    ],
  },
  'irl_day_2': {
    id: 'irl_day_2',
    title: 'DAY 2: FOLLOW-UP (Digital Thank You)',
    day: 'Day 2',
    pathway: 'irl',
    type: 'action',
    channel: 'Email / Instagram DM',
    timing: 'Morning following the in-person visit',
    objective: 'Solidify the in-person impression with immediate digital follow-up.',
    description:
      'Remind them of the visit while their memory is fresh. Mention who you spoke with at the location.',
    tips: [
      'Mention the specific team member you met: "Great meeting Sarah at your front desk yesterday!".',
    ],
    suggestedScript:
      'Hey {{client_name}}, dropped by {{business_name}} yesterday and was great speaking with your team! Left a one-pager with Sarah. Would love to grab a 10-minute coffee or zoom this week to discuss pipeline ideas. How does Thursday look?',
  },
  'irl_day_5': {
    id: 'irl_day_5',
    title: 'DAY 5: CALL (IF DIRECT #)',
    day: 'Day 5',
    pathway: 'irl',
    type: 'action',
    channel: 'Direct Phone',
    timing: 'Mid-morning',
    objective: 'Direct follow-up to coordinate a formal decision meeting.',
    description:
      'Call the direct business number obtained during Visit #1 to finalize a meeting time.',
    tips: ['Keep it direct: "Calling back to follow up on the packet I dropped off on Tuesday."'],
  },

  // YES Outcomes
  'engaged_step': {
    id: 'engaged_step',
    title: 'ENGAGED: RESPOND SAME DAY!',
    day: 'Goal: Book Meeting',
    pathway: 'written',
    type: 'success',
    channel: 'Active Channel of Response',
    timing: 'Within 5 - 15 minutes of receiving their reply',
    objective: 'Capitalize on peak attention to lock in a confirmed calendar booking.',
    description:
      'Prospect responded! Speed to lead is paramount. Reply immediately with 2 specific calendar options or an easy booking link.',
    tips: [
      'Acknowledge what they said specifically.',
      'Provide 2 clear times: "Do you have 15 mins this Thursday at 2 PM or Friday at 11 AM?".',
    ],
  },
  'booked_step': {
    id: 'booked_step',
    title: 'BOOKED: MEETING SCHEDULED',
    day: 'Transition',
    pathway: 'written',
    type: 'success',
    channel: 'Google Meet / Zoom / Phone',
    timing: 'Send calendar invite immediately with SMS/Email reminders',
    objective: 'Lock down attendance and set an agenda for the Decision Call.',
    description:
      'Meeting scheduled! Move the client status in your CRM to "Meeting Booked". Send calendar invite with a 3-bullet agenda to ensure qualification.',
    tips: [
      'Include a quick qualification question in calendar booking.',
      'Send automated reminder 24 hours and 1 hour before the call.',
    ],
  },
  'no_show_step': {
    id: 'no_show_step',
    title: 'IF NO-SHOW: RECOVERY PROTOCOL',
    day: 'Recovery Protocol',
    pathway: 'written',
    type: 'success',
    channel: 'SMS + Email + DM',
    timing: '+10 Min / Same Day / Next Day Final',
    objective: 'Rapidly reschedule leads who missed their scheduled call without alienating them.',
    description:
      'When a prospect does not show: \n1) At +10 mins: Send friendly "Are we still good for today or should we push back 15 mins?".\n2) End of day: Send calendar rescheduling link.\n3) Next morning: Final friendly nudge.',
    tips: [
      'Never sound accusatory: assume a technical glitch or calendar clash.',
      'Over 60% of no-shows reschedule if followed up within 10 minutes.',
    ],
    suggestedScript:
      'Hey {{client_name}}, on the Google Meet now! No worries if you got tied up with a client emergency — should we push our chat back 15 minutes or find a better time tomorrow?',
  },

  // NO Outcomes & Escalation
  'no_reply_step': {
    id: 'no_reply_step',
    title: 'BY DAY #7: NO RESPONSE -> ESCALATE ONCE',
    day: 'Day 7 Check',
    pathway: 'written',
    type: 'escalation',
    channel: 'Channel Transition',
    timing: 'Day 7 decision threshold',
    objective: 'Transition uncommunicative lead into multi-channel escalation.',
    description:
      'If the prospect did not reply to any of the 4 written messages over 7 days, they are not dead — written messages simply did not catch them. Escalate to calling (Days 8-14).',
    tips: [
      'Do not keep sending the same written message — switch to phone calls.',
      'Limit escalation to once (Days 8-14) to maintain brand reputation.',
    ],
  },
  'escalate_8_14': {
    id: 'escalate_8_14',
    title: 'ESCALATE (DAYS 8-14)',
    day: 'Days 8-14',
    pathway: 'written',
    type: 'escalation',
    channel: 'Phone Calls (Day 8: Call #1 | Day 10: Call #2 | Day 12: Call #3)',
    timing: '3 targeted call attempts spread across week 2',
    objective: 'Try reaching them via voice before archiving to long-term nurture.',
    description:
      'A structured 3-call sequence over 6 days. Call at varied hours (morning, lunch, evening).',
    tips: [
      'Day 8: Call #1 (Morning)',
      'Day 10: Call #2 (Afternoon)',
      'Day 12: Call #3 (Final call attempt)',
    ],
  },
  'day_14_end': {
    id: 'day_14_end',
    title: 'DAY #14 END: MOVEMENT OR NURTURE',
    day: 'Day 14 Final',
    pathway: 'written',
    type: 'escalation',
    channel: 'CRM Status Update',
    timing: 'Day 14 conclusion',
    objective: 'Final sorting: If movement occurs -> Book meeting. If zero movement -> Move to 30-Day Nurture.',
    description:
      'The cadence cycle ends here. Either the prospect responded (Book Meeting), or they are routed into the 30-Day Nurture list. Do not cold harass leads past Day 14.',
    tips: [
      'Tag client in CRM as "Follow Up Later" (Nurture).',
      'Set next follow-up date 30-60 days in the future.',
    ],
  },
  'nurture_step': {
    id: 'nurture_step',
    title: 'NURTURE: FOLLOW UP LATER (30 DAYS)',
    day: '30-Day Delay',
    pathway: 'calls',
    type: 'nurture',
    channel: 'CRM Follow-up Scheduler',
    timing: '30 days after initial cadence completed',
    objective: 'Re-engage when business priorities or budgets may have shifted.',
    description:
      'A vast majority of B2B deals close on the 2nd or 3rd cadence. Setting a reminder 30 days later puts you ahead of 95% of competitors who quit after 1 week.',
    tips: [
      'Share a fresh milestone or newly released feature/client result.',
      'Check if their role or team expanded.',
    ],
  },
  'closed_step': {
    id: 'closed_step',
    title: 'CLOSED: NOT INTERESTED = STOP',
    day: 'Terminal',
    pathway: 'calls',
    type: 'escalation',
    channel: 'Archive',
    timing: 'Immediate upon explicit refusal',
    objective: 'Respect explicit prospect boundaries and avoid spam flags.',
    description:
      'If the prospect explicitly says "No thanks" or "Unsubscribe", immediately mark them as "Lost/Closed" in the CRM and remove from active cadences.',
    tips: ['Polite one-sentence acknowledgement: "Understood, thanks for letting me know!".'],
  },
};

type PathwayFilter = 'all' | 'written' | 'calls' | 'irl';

export function CadenceMap() {
  const [selectedPathway, setSelectedPathway] = useState<PathwayFilter>('all');
  const [activeStepModal, setActiveStepModal] = useState<CadenceStepInfo | null>(null);

  const openStep = (stepKey: string) => {
    const data = CADENCE_STEPS_DATA[stepKey];
    if (data) {
      setActiveStepModal(data);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Detail Modal */}
      <CadenceStepModal
        step={activeStepModal}
        onClose={() => setActiveStepModal(null)}
      />

      {/* Pathway Selector / Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter View:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedPathway('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPathway === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 3 Pathways
            </button>
            <button
              onClick={() => setSelectedPathway('written')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPathway === 'written'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A) Written-First
            </button>
            <button
              onClick={() => setSelectedPathway('calls')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPathway === 'calls'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              B) Calls-First
            </button>
            <button
              onClick={() => setSelectedPathway('irl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPathway === 'irl'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C) IRL-First
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Click any card below to open detailed script &amp; timing rules</span>
        </div>
      </div>

      {/* Main Flowchart Canvas */}
      <div className="p-6 lg:p-8 bg-slate-900/40 border border-slate-800 rounded-3xl relative overflow-x-auto shadow-2xl">
        {/* Top Header / Start Section */}
        <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-slate-950 border-2 border-slate-700 shadow-xl text-slate-200 font-bold text-sm tracking-wide">
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>START</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center text-slate-600">
            <div className="w-0.5 h-6 bg-slate-700" />
            <ArrowDown className="w-4 h-4 text-slate-500 -mt-1" />
          </div>

          {/* Primary Pathway Selector Bar */}
          <div className="w-full p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-200 mb-2">
              PICK ONE PRIMARY PATHWAY (7 DAYS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-300">
              <div
                onClick={() => setSelectedPathway('written')}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedPathway === 'written' || selectedPathway === 'all'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                A) WRITTEN-FIRST (DAYS 1-7)
              </div>
              <div
                onClick={() => setSelectedPathway('calls')}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedPathway === 'calls' || selectedPathway === 'all'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                B) CALLS-FIRST (DAYS 1-7)
              </div>
              <div
                onClick={() => setSelectedPathway('irl')}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedPathway === 'irl' || selectedPathway === 'all'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                C) IRL-FIRST (DAYS 1-7)
              </div>
            </div>
          </div>
        </div>

        {/* 3 Columns Flow Grid */}
        <div
          className={`grid gap-6 lg:gap-8 ${
            selectedPathway === 'all'
              ? 'grid-cols-1 md:grid-cols-3 min-w-[900px]'
              : 'grid-cols-1 max-w-2xl mx-auto'
          }`}
        >
          {/* ================= COLUMN A: WRITTEN-FIRST ================= */}
          {(selectedPathway === 'all' || selectedPathway === 'written') && (
            <div className="space-y-6 flex flex-col">
              {/* Column Title Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                    A
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">
                    WRITTEN-FIRST (DAYS 1-7)
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => openStep('written_day_1')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 1: MESSAGE #1</span>
                    <span className="text-[10px] text-slate-400">The Hook</span>
                  </div>
                  <div
                    onClick={() => openStep('written_day_3')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 3: FOLLOW-UP #2</span>
                    <span className="text-[10px] text-slate-400">Value Drop</span>
                  </div>
                  <div
                    onClick={() => openStep('written_day_5')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 5: FOLLOW-UP #3</span>
                    <span className="text-[10px] text-slate-400">Case Study</span>
                  </div>
                  <div
                    onClick={() => openStep('written_day_7')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 7: FOLLOW-UP #4</span>
                    <span className="text-[10px] text-slate-400">Breakup</span>
                  </div>
                </div>
              </div>

              {/* Connecting Line to Decision */}
              <div className="flex flex-col items-center text-slate-600">
                <div className="w-0.5 h-5 bg-slate-700" />
                <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-1" />
              </div>

              {/* Decision Node: ANY REPLY? */}
              <div className="relative py-2 flex justify-center">
                <div className="px-5 py-2.5 rounded-xl bg-slate-950 border-2 border-indigo-500/50 shadow-lg text-slate-100 text-xs font-black tracking-widest uppercase">
                  ANY REPLY?
                </div>
              </div>

              {/* Split into YES / NO */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* YES (GREEN BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-emerald-400 pb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>YES</span>
                  </div>

                  <div
                    onClick={() => openStep('engaged_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      ENGAGED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      RESPOND SAME DAY! GOAL: BOOK A MEETING
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('booked_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BOOKED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      MEETING SCHEDULED &rarr; DECISION CALL
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('no_show_step')}
                    className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-300 cursor-pointer hover:bg-emerald-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-emerald-200 mb-1">
                      IF NO-SHOW
                    </span>
                    +10 MIN RESCHEDULE<br />
                    SAME DAY FOLLOW-UP<br />
                    NEXT DAY FINAL ATTEMPT
                  </div>
                </div>

                {/* NO (RED BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-rose-400 pb-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>NO</span>
                  </div>

                  <div
                    onClick={() => openStep('no_reply_step')}
                    className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 cursor-pointer hover:bg-rose-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BY DAY #7
                    </span>
                    <span className="block text-[10px] font-medium text-rose-200 mt-1 leading-tight">
                      NO RESPONSE &rarr; ESCALATE ONCE
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('escalate_8_14')}
                    className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 cursor-pointer hover:bg-rose-900/50 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider text-rose-300">
                      ESCALATE (DAYS 8-14)
                    </span>
                    <span className="block text-[10px] font-medium text-rose-300/90 mt-1 leading-tight">
                      DAY #8: CALL #1<br />
                      DAY #10: CALL #2<br />
                      DAY #12: CALL #3
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('day_14_end')}
                    className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/30 text-rose-300 cursor-pointer hover:bg-rose-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-rose-200 mb-1">
                      DAY #14 END
                    </span>
                    MOVEMENT = BOOK<br />
                    NO MOVEMENT = NURTURE
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= COLUMN B: CALLS-FIRST ================= */}
          {(selectedPathway === 'all' || selectedPathway === 'calls') && (
            <div className="space-y-6 flex flex-col">
              {/* Column Title Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold flex items-center justify-center">
                    B
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">
                    CALLS-FIRST (DAYS 1-7)
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => openStep('calls_day_1')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 1: CALL #1</span>
                    <span className="text-[10px] text-slate-400">+ Recap Email</span>
                  </div>
                  <div
                    onClick={() => openStep('calls_day_3')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 3: CALL #2</span>
                    <span className="text-[10px] text-slate-400">Shift Window</span>
                  </div>
                  <div
                    onClick={() => openStep('calls_day_5')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 5: CALL #3</span>
                    <span className="text-[10px] text-slate-400">Alt Number</span>
                  </div>
                  <div
                    onClick={() => openStep('calls_day_7')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 7: CLOSE-LOOP</span>
                    <span className="text-[10px] text-slate-400">Exit Email</span>
                  </div>
                </div>
              </div>

              {/* Connecting Line to Decision */}
              <div className="flex flex-col items-center text-slate-600">
                <div className="w-0.5 h-5 bg-slate-700" />
                <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-1" />
              </div>

              {/* Decision Node: CONNECTED? */}
              <div className="relative py-2 flex justify-center">
                <div className="px-5 py-2.5 rounded-xl bg-slate-950 border-2 border-indigo-500/50 shadow-lg text-slate-100 text-xs font-black tracking-widest uppercase">
                  CONNECTED?
                </div>
              </div>

              {/* Split into YES / NO */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* YES (GREEN BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-emerald-400 pb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>YES</span>
                  </div>

                  <div
                    onClick={() => openStep('engaged_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      ENGAGED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      RESPOND SAME DAY! GOAL: BOOK A MEETING
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('booked_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BOOKED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      MEETING SCHEDULED &rarr; DECISION CALL
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('no_show_step')}
                    className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-300 cursor-pointer hover:bg-emerald-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-emerald-200 mb-1">
                      IF NO-SHOW
                    </span>
                    +10 MIN RESCHEDULE<br />
                    SAME DAY FOLLOW-UP<br />
                    NEXT DAY FINAL ATTEMPT
                  </div>
                </div>

                {/* NO (RED / NURTURE BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-rose-400 pb-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>NO</span>
                  </div>

                  <div
                    onClick={() => openStep('no_reply_step')}
                    className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 cursor-pointer hover:bg-rose-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BY DAY #7
                    </span>
                    <span className="block text-[10px] font-medium text-rose-200 mt-1 leading-tight">
                      NO CONTACT / MOVEMENT &rarr; NURTURE OR CLOSE
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('nurture_step')}
                    className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 cursor-pointer hover:bg-amber-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      NURTURE
                    </span>
                    <span className="block text-[10px] font-medium text-amber-200 mt-1 leading-tight">
                      FOLLOW UP LATER (30 DAYS)
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('closed_step')}
                    className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/30 text-rose-300 cursor-pointer hover:bg-rose-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-rose-200 mb-1">
                      CLOSED
                    </span>
                    NOT INTERESTED = STOP
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= COLUMN C: IRL-FIRST ================= */}
          {(selectedPathway === 'all' || selectedPathway === 'irl') && (
            <div className="space-y-6 flex flex-col">
              {/* Column Title Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold flex items-center justify-center">
                    C
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">
                    IRL-FIRST (DAYS 1-7)
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => openStep('irl_day_1')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 1: VISIT #1</span>
                    <span className="text-[10px] text-slate-400">On-Site Drop In</span>
                  </div>
                  <div
                    onClick={() => openStep('irl_day_2')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 2: FOLLOW-UP</span>
                    <span className="text-[10px] text-slate-400">Digital Touch</span>
                  </div>
                  <div
                    onClick={() => openStep('irl_day_5')}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200">DAY 5: CALL</span>
                    <span className="text-[10px] text-slate-400">(If Direct #)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40 text-slate-500 flex items-center justify-between text-[11px] italic">
                    <span>DAY 7: FINAL EVALUATION</span>
                    <span>Review</span>
                  </div>
                </div>
              </div>

              {/* Connecting Line to Decision */}
              <div className="flex flex-col items-center text-slate-600">
                <div className="w-0.5 h-5 bg-slate-700" />
                <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-1" />
              </div>

              {/* Decision Node: GOT MEETING? */}
              <div className="relative py-2 flex justify-center">
                <div className="px-5 py-2.5 rounded-xl bg-slate-950 border-2 border-indigo-500/50 shadow-lg text-slate-100 text-xs font-black tracking-widest uppercase">
                  GOT MEETING?
                </div>
              </div>

              {/* Split into YES / NO */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* YES (GREEN BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-emerald-400 pb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>YES</span>
                  </div>

                  <div
                    onClick={() => openStep('engaged_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      ENGAGED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      RESPOND SAME DAY! GOAL: BOOK A MEETING
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('booked_step')}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BOOKED
                    </span>
                    <span className="block text-[10px] font-medium text-emerald-200 mt-1 leading-tight">
                      MEETING SCHEDULED &rarr; DECISION CALL
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('no_show_step')}
                    className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-300 cursor-pointer hover:bg-emerald-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-emerald-200 mb-1">
                      IF NO-SHOW
                    </span>
                    +10 MIN RESCHEDULE<br />
                    SAME DAY FOLLOW-UP<br />
                    NEXT DAY FINAL ATTEMPT
                  </div>
                </div>

                {/* NO (RED / NURTURE BRANCH) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-rose-400 pb-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>NO</span>
                  </div>

                  <div
                    onClick={() => openStep('no_reply_step')}
                    className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 cursor-pointer hover:bg-rose-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      BY DAY #7
                    </span>
                    <span className="block text-[10px] font-medium text-rose-200 mt-1 leading-tight">
                      NO CONTACT / MOVEMENT &rarr; NURTURE OR CLOSE
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('nurture_step')}
                    className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 cursor-pointer hover:bg-amber-900/40 transition-all shadow-sm"
                  >
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                      NURTURE
                    </span>
                    <span className="block text-[10px] font-medium text-amber-200 mt-1 leading-tight">
                      FOLLOW UP LATER (30 DAYS)
                    </span>
                  </div>

                  <div
                    onClick={() => openStep('closed_step')}
                    className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/30 text-rose-300 cursor-pointer hover:bg-rose-900/30 transition-all text-[10px] leading-tight"
                  >
                    <span className="block font-black uppercase text-rose-200 mb-1">
                      CLOSED
                    </span>
                    NOT INTERESTED = STOP
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
