'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Client, CustomField, PlatformLink, ClientStatus, Priority, OutreachChannel } from '@/lib/types';
import { CustomFieldRenderer } from './CustomFieldRenderer';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => Promise<void>;
  client?: Client | null;
  customFields: CustomField[];
}

const POPULAR_PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'Website',
  'TikTok',
  'Twitter/X',
  'Facebook',
  'YouTube',
  'WhatsApp',
  'Other',
];

const OUTREACH_CHANNELS: OutreachChannel[] = [
  'Instagram',
  'Email',
  'LinkedIn',
  'WhatsApp',
  'Phone',
  'Twitter/X',
  'TikTok',
  'Other',
];

export function ClientModal({
  isOpen,
  onClose,
  onSave,
  client,
  customFields,
}: ClientModalProps) {
  const [businessName, setBusinessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([
    { platform: 'Instagram', url: '' },
  ]);
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [outreachChannel, setOutreachChannel] = useState<OutreachChannel>('Instagram');
  const [niche, setNiche] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | string>(0);
  const [priority, setPriority] = useState<Priority>('medium');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setBusinessName(client.business_name || '');
      setClientName(client.client_name || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setPlatformLinks(
        client.platform_links && client.platform_links.length > 0
          ? client.platform_links
          : [{ platform: 'Instagram', url: '' }]
      );
      setStatus(client.status || 'lead');
      setOutreachChannel(client.outreach_channel || 'Instagram');
      setNiche(client.niche || '');
      setEstimatedValue(client.estimated_value ?? 0);
      setPriority(client.priority || 'medium');
      setNextFollowUpDate(
        client.next_follow_up_date
          ? new Date(client.next_follow_up_date).toISOString().split('T')[0]
          : ''
      );
      setNotes(client.notes || '');
      setCustomValues(client.custom_field_values || {});
    } else {
      setBusinessName('');
      setClientName('');
      setEmail('');
      setPhone('');
      setPlatformLinks([{ platform: 'Instagram', url: '' }]);
      setStatus('lead');
      setOutreachChannel('Instagram');
      setNiche('');
      setEstimatedValue(0);
      setPriority('medium');
      setNextFollowUpDate('');
      setNotes('');
      setCustomValues({});
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleAddPlatform = () => {
    setPlatformLinks([...platformLinks, { platform: 'Instagram', url: '' }]);
  };

  const handleRemovePlatform = (index: number) => {
    setPlatformLinks(platformLinks.filter((_, i) => i !== index));
  };

  const handlePlatformChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...platformLinks];
    updated[index] = { ...updated[index], [field]: value };
    setPlatformLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsSubmitting(true);
    try {
      const filteredLinks = platformLinks.filter((l) => l.url.trim() !== '');

      await onSave({
        business_name: businessName.trim(),
        client_name: clientName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        platform_links: filteredLinks,
        status,
        outreach_channel: outreachChannel,
        niche: niche.trim(),
        estimated_value: Number(estimatedValue) || 0,
        priority,
        next_follow_up_date: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
        notes: notes.trim(),
        custom_field_values: customValues,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save client:', err);
      alert('Error saving client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {client ? 'Edit Client / Lead' : 'Add New Client / Lead'}
              </h2>
              <p className="text-xs text-slate-400">
                Outreach prospect details & custom properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Aesthetics Agency"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Person Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Social Platforms Links */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Social & Platform Links (IG, LinkedIn, Website...)
              </span>
              <button
                type="button"
                onClick={handleAddPlatform}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>

            <div className="space-y-2.5">
              {platformLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => handlePlatformChange(idx, 'platform', e.target.value)}
                    className="w-36 px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {POPULAR_PLATFORMS.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="https://instagram.com/profile or URL"
                    value={link.url}
                    onChange={(e) => handlePlatformChange(idx, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  {platformLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlatform(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outreach Status & Pipeline Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="lead">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up Needed</option>
                <option value="meeting_booked">Meeting Booked</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed / Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Outreach Channel
              </label>
              <select
                value={outreachChannel}
                onChange={(e) => setOutreachChannel(e.target.value as OutreachChannel)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {OUTREACH_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Deal Value ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  placeholder="2500"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Niche / Category
              </label>
              <input
                type="text"
                placeholder="e.g. E-commerce, Real Estate"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Next Follow-Up Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC CUSTOM FIELDS SECTION */}
          {customFields && customFields.length > 0 && (
            <div className="border border-indigo-900/40 bg-indigo-950/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-indigo-300">
                    Custom Defined Fields ("كيما بغيتي")
                  </h3>
                </div>
                <span className="text-xs text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {customFields.length} custom field{customFields.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {field.field_label}
                      {field.is_required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <CustomFieldRenderer
                      field={field}
                      value={customValues[field.field_key]}
                      onChange={(newVal) =>
                        setCustomValues((prev) => ({ ...prev, [field.field_key]: newVal }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Outreach Notes / Strategy
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Needs higher conversion on Shopify, responded positively to second story reply..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

