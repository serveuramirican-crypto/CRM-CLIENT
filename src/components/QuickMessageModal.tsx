'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Send, Sparkles } from 'lucide-react';
import { Client, OutreachTemplate } from '@/lib/types';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  templates: OutreachTemplate[];
  onLogActivity: (content: string, type: any) => Promise<void>;
}

export function QuickMessageModal({
  isOpen,
  onClose,
  client,
  templates,
  onLogActivity,
}: QuickMessageModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [customizedMessage, setCustomizedMessage] = useState('');

  React.useEffect(() => {
    if (templates.length > 0) {
      const initial = templates.find((t) => t.id === selectedTemplateId) || templates[0];
      if (initial) {
        formatTemplate(initial.content);
      }
    }
  }, [templates, selectedTemplateId, client, isOpen]);

  if (!isOpen) return null;

  const formatTemplate = (text: string) => {
    const formatted = text
      .replace(/\{\{client_name\}\}/g, client.client_name || client.business_name)
      .replace(/\{\{business_name\}\}/g, client.business_name);
    setCustomizedMessage(formatted);
  };

  const handleTemplateSelect = (tmpl: OutreachTemplate) => {
    setSelectedTemplateId(tmpl.id);
    formatTemplate(tmpl.content);
  };

  const handleCopyAndLog = async () => {
    try {
      await navigator.clipboard.writeText(customizedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Auto-log activity
      await onLogActivity(
        `Outreach message sent: "${customizedMessage.slice(0, 100)}..."`,
        'dm_sent'
      );
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Find direct link (IG, LinkedIn, etc.)
  const igLink = client.platform_links?.find(
    (l) => l.platform.toLowerCase() === 'instagram'
  );
  const primaryLink = igLink || client.platform_links?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Quick Outreach for <span className="text-indigo-400">{client.business_name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate personalized message & copy to direct messaging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Templates list */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Message Template
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="opacity-70 mr-1.5">[{tmpl.channel}]</span>
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Formatted Message Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Message Preview & Edit
            </label>
            <textarea
              rows={5}
              value={customizedMessage}
              onChange={(e) => setCustomizedMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Direct Platform Button & Copy */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {primaryLink ? (
              <a
                href={primaryLink.url.startsWith('http') ? primaryLink.url : `https://${primaryLink.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open {primaryLink.platform}: {primaryLink.url}
              </a>
            ) : (
              <span className="text-xs text-slate-500">No profile link attached</span>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopyAndLog}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied & Logged!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy & Log Outreach
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

