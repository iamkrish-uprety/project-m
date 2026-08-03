/** Row shapes as they come back from Supabase. */

export interface WeddingRow {
  id: string;
  owner_id: string;
  couple_names: string;
  tradition: string;
  tradition_variant: string | null;
  wedding_date: string | null;
  region: string;
  budget_total: number;
  created_at: string;
}

export interface ChecklistRow {
  id: string;
  wedding_id: string;
  event: string;
  task: string;
  done: boolean;
  due_date: string | null;
  notes: string | null;
  sort_order: number;
}

export interface ShoppingRow {
  id: string;
  wedding_id: string;
  event: string;
  item: string;
  bought: boolean;
  estimated_cost: number;
  notes: string | null;
  sort_order: number;
}

export interface BudgetRow {
  id: string;
  wedding_id: string;
  category: string;
  allocated: number;
  spent: number;
}

export type Rsvp = "pending" | "yes" | "no";

export interface GuestRow {
  id: string;
  wedding_id: string;
  name: string;
  side: string | null;
  invited: boolean;
  rsvp: Rsvp;
  email: string | null;
  phone: string | null;
  plus_ones: number;
}

export interface ProfileRow {
  id: string;
  email: string | null;
}

export interface CollaboratorRow {
  wedding_id: string;
  user_id: string;
  created_at: string;
}

export interface VendorRow {
  id: string;
  name: string;
  category: string;
  traditions: string[];
  region: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  submitted_by: string | null;
  published: boolean;
  created_at: string;
}

export interface VendorReviewRow {
  id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

export const VENDOR_CATEGORIES = [
  "Clothing & attire",
  "Jewellery",
  "Catering",
  "Decor & mandap",
  "Photography & video",
  "Officiant / priest",
  "Venue",
  "Music & entertainment",
  "Mehendi / beauty",
  "Other",
] as const;
