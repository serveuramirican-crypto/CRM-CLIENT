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
  subject_line?: string;
  cadence_step?: string;
  target_niche?: string;
  tone?: string;
  tags?: string[];
  times_used?: number;
  replies_count?: number;
  meetings_count?: number;
  deals_won_count?: number;
  revenue_generated?: number;
  is_active?: boolean;
  notes?: string;
  last_used_at?: string;
  created_at?: string;
}

// ==========================================
// Business Analysis Checklist Types
// ==========================================

export type BusinessType =
  | 'Local Business'
  | 'Online Business'
  | 'Ecommerce'
  | 'Other';

export type BusinessCategory =
  | 'Clothing'
  | 'Cosmetics'
  | 'Restaurant'
  | 'Fitness'
  | 'Services'
  | 'Other';

export type BusinessStatus = 'Active' | 'Inactive';

export type ContactChannel =
  | 'Instagram'
  | 'WhatsApp'
  | 'Website'
  | 'Phone'
  | 'Physical Store'
  | 'Other';

export type VerificationStatus =
  | 'Observed'
  | 'Possible Problem'
  | 'Validated Problem'
  | 'Not Verified';

export type AnalysisStatus = 'in_progress' | 'completed';

export interface Business {
  id: string;
  user_id?: string | null;
  client_id?: string | null;
  name: string;
  instagram_url: string;
  website_url?: string;
  business_type: BusinessType;
  business_category: BusinessCategory;
  business_status: BusinessStatus;
  main_product_or_service?: string;
  contact_channels: ContactChannel[];
  general_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessAnalysis {
  id: string;
  business_id: string;
  user_id?: string | null;
  version_label: string;
  analysis_status: AnalysisStatus;
  next_questions: string;
  next_data_to_collect: string;
  next_records_to_inspect: string;
  next_unknown_info: string;
  created_at: string;
  updated_at: string;
  businesses?: Business;
}

export interface AnalysisChecklistItem {
  id?: string;
  analysis_id: string;
  stage_id: string;
  subcategory_id: string;
  problem_id: string;
  is_checked: boolean;
  verification_status: VerificationStatus;
  evidence: string;
  notes: string;
  updated_at?: string;
}

export interface AnalysisStageReview {
  id?: string;
  analysis_id: string;
  stage_id: string;
  is_potential_bottleneck: boolean;
  investigation_notes: string;
  updated_at?: string;
}

export interface ChecklistProblemConfig {
  id: string;
  number: number;
  text: string;
}

export interface ChecklistSubcategoryConfig {
  id: string;
  title: string;
  problems: ChecklistProblemConfig[];
}

export interface ChecklistStageConfig {
  id: string;
  stageNumber: number;
  code: string;
  title: string;
  description: string;
  problems?: ChecklistProblemConfig[];
  subcategories?: ChecklistSubcategoryConfig[];
}


