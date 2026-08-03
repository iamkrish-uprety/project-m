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
  events: string[];
  checklist: ChecklistItem[];
  shopping: ShoppingItem[];
}
