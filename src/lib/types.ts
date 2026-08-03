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

/**
 * A regional or denominational variant within a tradition. Variants only ever
 * *add* to the base template — they never remove from it — so a couple who
 * picks one still gets everything the base tradition covers.
 */
export interface TraditionVariant {
  id: string;
  name: string;
  note?: string;
  addEvents?: string[];
  addChecklist?: ChecklistItem[];
  addShopping?: ShoppingItem[];
}

export interface TraditionTemplate {
  id: TraditionId;
  name: string;
  available: boolean;
  // Whether someone from this tradition has reviewed the checklist/shopping
  // content below. None of it has yet — see contentNote.
  verified: boolean;
  contentNote?: string;
  blurb?: string;
  events: string[];
  checklist: ChecklistItem[];
  shopping: ShoppingItem[];
  variants?: TraditionVariant[];
}

/** Base template plus the additions from a variant, if one was chosen. */
export function resolveTemplate(template: TraditionTemplate, variantId?: string | null) {
  const variant = template.variants?.find((v) => v.id === variantId);
  return {
    variant,
    events: [...template.events, ...(variant?.addEvents ?? [])],
    checklist: [...template.checklist, ...(variant?.addChecklist ?? [])],
    shopping: [...template.shopping, ...(variant?.addShopping ?? [])],
  };
}
