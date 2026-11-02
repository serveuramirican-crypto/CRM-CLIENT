export type ClientStatus =
  | 'lead'
  | 'contacted'
  | 'follow_up'
  | 'meeting_booked'
  | 'negotiation'
  | 'won'
  | 'lost';

export type OutreachChannel =
  | 'Instagram'
  | 'Email'
  | 'LinkedIn'
  | 'WhatsApp'
  | 'Phone'
  | 'Twitter/X'
  | 'TikTok'
  | 'Other';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface PlatformLink {
  platform: string;
  url: string;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'boolean'
  | 'url'
  | 'textarea';

export interface CustomField {
  id: string;
  field_key: string;
  field_label: string;
  field_type: CustomFieldType;
  options?: string[]; // for select dropdowns
  placeholder?: string;
  is_required?: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  business_name: string;
  client_name?: string;
  email?: string;
  phone?: string;
  platform_links: PlatformLink[];
  status: ClientStatus;
  outreach_channel: OutreachChannel;
  niche?: string;
  estimated_value?: number;
  priority: Priority;
  last_contact_date?: string | null;
  next_follow_up_date?: string | null;
  notes?: string;
  custom_field_values: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OutreachActivity {
  id: string;
  client_id: string;
  type: 'dm_sent' | 'email_sent' | 'call' | 'meeting' | 'reply_received' | 'note';
  subject?: string;
  content: string;
  activity_date: string;
  created_at: string;
}

export interface OutreachTemplate {
  id: string;
  title: string;
  channel: string;
  content: string;
  created_at?: string;
}

