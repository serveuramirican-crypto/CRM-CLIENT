'use client';

import React from 'react';
import {
  ExternalLink,
  DollarSign,
  MessageSquare,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Calendar,
  Building2,
  User,
} from 'lucide-react';
import { Client, ClientStatus, Priority } from '@/lib/types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface KanbanBoardProps {
  clients: Client[];
  onStatusChange: (clientId: string, newStatus: ClientStatus) => Promise<void>;
  onOpenQuickMessage: (client: Client) => void;
  onOpenActivityLog: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

const COLUMNS: { id: ClientStatus; label: string; dotColor: string }[] = [
  { id: 'lead', label: 'New Leads', dotColor: 'bg-blue-400' },
  { id: 'contacted', label: 'Contacted', dotColor: 'bg-amber-400' },
  { id: 'follow_up', label: 'Follow Up', dotColor: 'bg-purple-400' },
  { id: 'meeting_booked', label: 'Meeting Booked', dotColor: 'bg-emerald-400' },
  { id: 'negotiation', label: 'Negotiation', dotColor: 'bg-cyan-400' },
  { id: 'won', label: 'Closed / Won', dotColor: 'bg-green-400' },
  { id: 'lost', label: 'Lost', dotColor: 'bg-rose-400' },
];

export function KanbanBoard({
  clients,
  onStatusChange,
  onOpenQuickMessage,
  onOpenActivityLog,
  onEditClient,
}: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {COLUMNS.map((col) => {
        const colClients = clients.filter((c) => c.status === col.id);
        const colTotalValue = colClients.reduce(
          (sum, c) => sum + (c.estimated_value || 0),
          0
        );

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col max-h-[calc(100vh-220px)] shadow-lg"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {colClients.length}
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400">
                {colTotalValue > 0 ? formatCurrency(colTotalValue) : '$0'}
              </span>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colClients.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-xs italic">
                  No prospects in this stage
                </div>
              ) : (
                colClients.map((client) => {
                  const igLink = client.platform_links?.find(
                    (l) => l.platform.toLowerCase() === 'instagram'
                  );
                  const firstLink = igLink || client.platform_links?.[0];

                  return (
                    <div
                      key={client.id}
                      className="group p-3.5 bg-slate-950/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 space-y-2.5"
                    >
                      {/* Top row: Business name + Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            onClick={() => onEditClient(client)}
                            className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {client.business_name}
                          </h4>
                          {client.client_name && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-500" />
                              {client.client_name}
                            </p>
                          )}
                        </div>
                        <PriorityBadge priority={client.priority} />
                      </div>

                      {/* Outreach Channel & Platform Link */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {client.outreach_channel || 'Instagram'}
                        </span>

                        {firstLink && (
                          <a
                            href={
                              firstLink.url.startsWith('http')
                                ? firstLink.url
                                : `https://${firstLink.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-pink-950/40 text-pink-300 border border-pink-800/50 hover:bg-pink-900/40 transition-colors"
                          >
                            <span>{firstLink.platform}: Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        {client.niche && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            {client.niche}
                          </span>
                        )}
                      </div>

                      {/* Deal Value & Next Follow-Up */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900">
                        <span className="font-semibold text-emerald-400 flex items-center">
                          <DollarSign className="w-3 h-3" />
                          {client.estimated_value
                            ? client.estimated_value.toLocaleString()
                            : '0'}
                        </span>

                        {client.next_follow_up_date && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDate(client.next_follow_up_date)}
                          </span>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenQuickMessage(client)}
                            title="Quick Outreach Message"
                            className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            Message
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenActivityLog(client)}
                            title="Touchpoints & Activity"
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            Log
                          </button>
                        </div>

                        {/* Stage Mover Selector */}
                        <select
                          value={client.status}
                          onChange={(e) =>
                            onStatusChange(client.id, e.target.value as ClientStatus)
                          }
                          className="text-[11px] bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-1 focus:ring-1 focus:ring-indigo-500"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              → {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

