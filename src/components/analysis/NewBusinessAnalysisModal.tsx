'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Instagram,
  Globe,
  Package,
  MessageCircle,
  FileText,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  Business,
  BusinessType,
  BusinessCategory,
  BusinessStatus,
  ContactChannel,
  Client,
} from '@/lib/types';
import {
  BUSINESS_TYPE_OPTIONS,
  BUSINESS_CATEGORY_OPTIONS,
  BUSINESS_STATUS_OPTIONS,
  CONTACT_CHANNEL_OPTIONS,
} from '@/lib/business-analysis-checklist';

export interface BusinessFormValues {
  client_id?: string | null;
  name: string;
  instagram_url: string;
  website_url: string;
  business_type: BusinessType;
  business_category: BusinessCategory;
  business_status: BusinessStatus;
  main_product_or_service: string;
  contact_channels: ContactChannel[];
  general_notes: string;
}

interface NewBusinessAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BusinessFormValues) => Promise<void>;
  initialBusiness?: Business | null;
  crmClients?: Client[];
}

export function NewBusinessAnalysisModal({
  isOpen,
  onClose,
  onSubmit,
  initialBusiness,
  crmClients = [],
}: NewBusinessAnalysisModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [name, setName] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Local Business');
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>('Clothing');
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus>('Active');
  const [mainProductOrService, setMainProductOrService] = useState('');
  const [contactChannels, setContactChannels] = useState<ContactChannel[]>(['Instagram']);
  const [generalNotes, setGeneralNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');

    if (initialBusiness) {
      setSelectedClientId(initialBusiness.client_id || '');
      setName(initialBusiness.name || '');
      setInstagramUrl(initialBusiness.instagram_url || '');
      setWebsiteUrl(initialBusiness.website_url || '');
      setBusinessType(initialBusiness.business_type || 'Local Business');
      setBusinessCategory(initialBusiness.business_category || 'Other');
      setBusinessStatus(initialBusiness.business_status || 'Active');
      setMainProductOrService(initialBusiness.main_product_or_service || '');
      setContactChannels(
        initialBusiness.contact_channels && initialBusiness.contact_channels.length > 0
          ? initialBusiness.contact_channels
          : ['Instagram']
      );
      setGeneralNotes(initialBusiness.general_notes || '');
    } else {
      setSelectedClientId('');
      setName('');
      setInstagramUrl('');
      setWebsiteUrl('');
      setBusinessType('Local Business');
      setBusinessCategory('Clothing');
      setBusinessStatus('Active');
      setMainProductOrService('');
      setContactChannels(['Instagram']);
      setGeneralNotes('');
    }
  }, [isOpen, initialBusiness]);

  if (!isOpen) return null;

  const handleImportClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;

    const client = crmClients.find((c) => c.id === clientId);
    if (!client) return;

    setName(client.business_name || '');
    const igLink = (client.platform_links || []).find((l) =>
      l.platform.toLowerCase().includes('instagram')
    );
    const webLink = (client.platform_links || []).find((l) =>
      l.platform.toLowerCase().includes('website')
    );
    if (igLink?.url) setInstagramUrl(igLink.url);
    if (webLink?.url) setWebsiteUrl(webLink.url);
    if (client.niche && !mainProductOrService) {
      setMainProductOrService(client.niche);
    }
    if (client.notes && !generalNotes) {
      setGeneralNotes(client.notes);
    }
    if (
      client.outreach_channel &&
      CONTACT_CHANNEL_OPTIONS.includes(client.outreach_channel as ContactChannel)
    ) {
      setContactChannels([client.outreach_channel as ContactChannel]);
    }
  };

  const toggleChannel = (channel: ContactChannel) => {
    setContactChannels((prev) => {
      if (prev.includes(channel)) {
        if (prev.length === 1) return prev; // Keep at least one channel selected
        return prev.filter((ch) => ch !== channel);
      }
      return [...prev, channel];
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Business Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        client_id: selectedClientId || null,
        name: name.trim(),
        instagram_url: instagramUrl.trim(),
        website_url: websiteUrl.trim(),
        business_type: businessType,
        business_category: businessCategory,
        business_status: businessStatus,
        main_product_or_service: mainProductOrService.trim(),
        contact_channels: contactChannels,
        general_notes: generalNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save business analysis:', err);
      setErrorMsg(err?.message || 'Failed to save business analysis. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialBusiness ? 'Edit Business Details' : 'New Business Analysis'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter business context before reviewing the 7-stage diagnostic checklist
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Optional pre-fill from existing CRM clients */}
          {!initialBusiness && crmClients.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <label className="block text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pre-fill from Existing CRM Client (Optional)
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleImportClient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Create standalone business --</option>
                {crmClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name} {c.niche ? `(${c.niche})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Business Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shali Shop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Status
              </label>
              <select
                value={businessStatus}
                onChange={(e) => setBusinessStatus(e.target.value as BusinessStatus)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BUSINESS_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instagram & Website URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Instagram Profile URL
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://instagram.com/username"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Website URL (Optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Business Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BUSINESS_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Category
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value as BusinessCategory)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BUSINESS_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Product or Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Main Product or Service
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Women's casual clothing, Skincare bundles, Fitness coaching"
                value={mainProductOrService}
                onChange={(e) => setMainProductOrService(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Main Customer Contact Channel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
              Main Customer Contact Channel
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_CHANNEL_OPTIONS.map((channel) => {
                const selected = contactChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/50'
                        : 'bg-slate-950/70 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              General Notes
            </label>
            <textarea
              rows={3}
              dir="auto"
              placeholder="Initial observations, posting frequency, brand positioning, or context..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : initialBusiness
                ? 'Save Business Details'
                : 'Save & Start Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
