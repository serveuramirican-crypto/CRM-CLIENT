'use client';

import React from 'react';
import { CustomField } from '@/lib/types';
import { Globe, Link as LinkIcon } from 'lucide-react';

interface CustomFieldRendererProps {
  field: CustomField;
  value: any;
  onChange?: (val: any) => void;
  readOnly?: boolean;
}

export function CustomFieldRenderer({
  field,
  value,
  onChange,
  readOnly = false,
}: CustomFieldRendererProps) {
  const currentValue = value !== undefined && value !== null ? value : '';

  if (readOnly) {
    if (currentValue === '' || currentValue === null) {
      return <span className="text-slate-500 text-sm italic">Not set</span>;
    }

    if (field.field_type === 'boolean') {
      return (
        <span
          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
            currentValue ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {currentValue ? 'Yes' : 'No'}
        </span>
      );
    }

    if (field.field_type === 'url') {
      const url = String(currentValue).startsWith('http') ? currentValue : `https://${currentValue}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 text-sm break-all"
        >
          <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {currentValue}
        </a>
      );
    }

    return <span className="text-slate-200 text-sm break-words">{String(currentValue)}</span>;
  }

  // Editable Form Mode
  switch (field.field_type) {
    case 'textarea':
      return (
        <textarea
          rows={3}
          value={currentValue}
          placeholder={field.placeholder || `Enter ${field.field_label}`}
          onChange={(e) => onChange && onChange(e.target.value)}
          required={field.is_required}
          className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={currentValue}
          placeholder={field.placeholder || '0'}
          onChange={(e) => onChange && onChange(e.target.value === '' ? '' : Number(e.target.value))}
          required={field.is_required}
          className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={currentValue}
          onChange={(e) => onChange && onChange(e.target.value)}
          required={field.is_required}
          className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => onChange && onChange(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-300">{field.field_label}</span>
        </label>
      );

    case 'select':
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <select
          value={currentValue}
          onChange={(e) => onChange && onChange(e.target.value)}
          required={field.is_required}
          className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          <option value="">{field.placeholder || 'Select option...'}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'url':
      return (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Globe className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={currentValue}
            placeholder={field.placeholder || 'https://...'}
            onChange={(e) => onChange && onChange(e.target.value)}
            required={field.is_required}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      );

    case 'text':
    default:
      return (
        <input
          type="text"
          value={currentValue}
          placeholder={field.placeholder || `Enter ${field.field_label}`}
          onChange={(e) => onChange && onChange(e.target.value)}
          required={field.is_required}
          className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      );
  }
}

