export type TraditionId = "hindu" | "christian" | "muslim" | "sikh" | "buddhist" | "civil";

export interface ChecklistItem {
  id: string;
  event: string;
  task: string;
}

export interface ShoppingItem {
  id: string;
  event: string;
  item: string;
}

export interface TraditionTemplate {
  id: TraditionId;
  name: string;
  available: boolean;
  // Whether someone from this tradition has reviewed the checklist/shopping
  // content below. None of it has yet — see contentNote.
  verified: boolean;
  contentNote?: string;
  events: string[];
  checklist: ChecklistItem[];
  shopping: ShoppingItem[];
}
