'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Type,
  Hash,
  ListFilter,
  Calendar,
  ToggleLeft,
  Link as LinkIcon,
  AlignLeft,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CustomField, CustomFieldType } from '@/lib/types';
import { slugify } from '@/lib/utils';

const FIELD_TYPE_OPTIONS: {
  type: CustomFieldType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  { type: 'text', label: 'Short Text', icon: Type, desc: 'Single-line text (e.g. Instagram Handle, Job Title)' },
  { type: 'textarea', label: 'Long Text / Notes', icon: AlignLeft, desc: 'Multi-line text (e.g. Pain Points, Pitch notes)' },
  { type: 'number', label: 'Number', icon: Hash, desc: 'Numeric values (e.g. Follower Count, Team Size)' },
  { type: 'select', label: 'Dropdown / Select', icon: ListFilter, desc: 'Pick from predefined choices (e.g. Budget Tier, Industry)' },
  { type: 'date', label: 'Date', icon: Calendar, desc: 'Date picker (e.g. Founded Date, Contract Start)' },
  { type: 'boolean', label: 'Yes / No (Boolean)', icon: ToggleLeft, desc: 'True/False checkbox (e.g. Has Website, Verified)' },
  { type: 'url', label: 'Website / Link', icon: LinkIcon, desc: 'Clickable URL (e.g. Portfolio, Store URL)' },
];

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New field state
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [optionsString, setOptionsString] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const handleLabelChange = (val: string) => {
    setFieldLabel(val);
    if (autoSlug) {
      setFieldKey(slugify(val));
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim() || !fieldKey.trim()) return;

    setSaving(true);
    try {
      let parsedOptions: string[] = [];
      if (fieldType === 'select') {
        parsedOptions = optionsString
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (parsedOptions.length === 0) {
          alert('Please enter at least one dropdown option separated by commas.');
          setSaving(false);
          return;
        }
      }

      const newOrderIndex = fields.length + 1;

      const { error } = await supabase.from('custom_fields').insert([
        {
          field_label: fieldLabel.trim(),
          field_key: fieldKey.trim(),
          field_type: fieldType,
          placeholder: placeholder.trim(),
          is_required: isRequired,
          options: parsedOptions,
          order_index: newOrderIndex,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          alert(`The field key "${fieldKey}" already exists. Please choose a different key.`);
        } else {
          throw error;
        }
        return;
      }

      // Reset form
      setFieldLabel('');
      setFieldKey('');
      setFieldType('text');
      setPlaceholder('');
      setIsRequired(false);
      setOptionsString('');
      setAutoSlug(true);
      setIsCreating(false);

      fetchCustomFields();
    } catch (err) {
      console.error('Error creating custom field:', err);
      alert('Failed to create custom field. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the custom field "${label}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('custom_fields').delete().eq('id', id);
      if (error) throw error;
      fetchCustomFields();
    } catch (err) {
      console.error('Error deleting custom field:', err);
      alert('Failed to delete custom field.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Dynamic Custom Fields
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              "كيما بغيتي" Builder
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Create custom data fields for your outreach leads (e.g. Instagram follower count, Decision maker, Ad spend, Pain points).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCustomFields()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Close Creator' : 'Create New Field'}
          </button>
        </div>
      </div>

      {/* Creation Form Panel */}
      {isCreating && (
        <div className="p-6 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-indigo-400 pb-2 border-b border-slate-800">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-base font-semibold text-white">Add a New Field</h2>
          </div>

          <form onSubmit={handleCreateField} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Field Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instagram Follower Count"
                  value={fieldLabel}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Database Field Key <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    {autoSlug ? 'Edit Manually' : 'Auto Generate'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. instagram_follower_count"
                  value={fieldKey}
                  disabled={autoSlug}
                  onChange={(e) => setFieldKey(slugify(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            {/* Field Type Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Field Data Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {FIELD_TYPE_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = fieldType === item.type;

                  return (
                    <div
                      key={item.type}
                      onClick={() => setTypeAndPreset(item.type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-100">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Options (shown only if select) */}
            {fieldType === 'select' && (
              <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Dropdown Choices (Separated by comma) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Under $1k, $1k - $3k, $3k - $5k, $5k+"
                  value={optionsString}
                  onChange={(e) => setOptionsString(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Write the options separated by commas. Each item will appear in the dropdown menu.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Placeholder / Help Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enter follower count or @username"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Mandatory field (Required)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Creating Field...' : 'Save Custom Field'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Custom Properties ({fields.length})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            These fields automatically appear in your prospect modal & client details
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Loading custom fields...
          </div>
        ) : fields.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No custom fields created yet. Click "Create New Field" to start customizing your CRM.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {fields.map((f) => {
              const typeConfig =
                FIELD_TYPE_OPTIONS.find((t) => t.type === f.field_type) ||
                FIELD_TYPE_OPTIONS[0];
              const Icon = typeConfig.icon;

              return (
                <div
                  key={f.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">
                          {f.field_label}
                        </span>
                        {f.is_required && (
                          <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-800/40 px-1.5 py-0.2 rounded font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-indigo-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {f.field_key}
                        </code>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{typeConfig.label}</span>
                      </div>
                      {f.field_type === 'select' && f.options && f.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {f.options.map((opt, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteField(f.id, f.field_label)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  function setTypeAndPreset(t: CustomFieldType) {
    setFieldType(t);
  }
}

