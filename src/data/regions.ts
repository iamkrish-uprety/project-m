/**
 * Where to actually find things, per country.
 *
 * Deliberately no "best vendor" lists. The big wedding directories
 * (WedMeGood, Hitched, Bridebook, The Knot) all run paid-placement models —
 * vendors buy visibility — so a ranking taken from them would be advertising
 * dressed up as a recommendation, in a category where couples spend a lot of
 * money. What's here instead is search: real, always-current queries against
 * platforms that genuinely exist, plus a way for the couple to save the shops
 * and suppliers they find and trust themselves.
 */

export type CountryId = "np" | "in" | "gb" | "us" | "other";

export interface SearchSource {
  name: string;
  /** Builds a live search URL for an item. */
  url: (query: string, place: string) => string;
  note?: string;
}

export interface Directory {
  name: string;
  url: string;
  note?: string;
}

export interface CountryDef {
  id: CountryId;
  name: string;
  currency: string;
  /** Online places to buy things. */
  shops: SearchSource[];
  /** Vendor directories. All paid-placement — see note on each. */
  directories: Directory[];
}

const enc = encodeURIComponent;

/** Google Maps search — the most reliable way to find anything local, anywhere. */
export function mapsSearch(query: string, place: string): string {
  const q = place ? `${query} in ${place}` : query;
  return `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
}

/** Plain web search, for when nothing more specific fits. */
export function webSearch(query: string, place: string): string {
  const q = place ? `${query} ${place}` : query;
  return `https://www.google.com/search?q=${enc(q)}`;
}

const etsy: SearchSource = {
  name: "Etsy",
  url: (q) => `https://www.etsy.com/search?q=${enc(q)}`,
  note: "Handmade and custom pieces, ships internationally",
};

export const COUNTRIES: CountryDef[] = [
  {
    id: "np",
    name: "Nepal",
    currency: "NPR",
    shops: [
      {
        name: "Daraz",
        url: (q) => `https://www.daraz.com.np/catalog/?q=${enc(q)}`,
        note: "Nepal's largest online marketplace",
      },
      etsy,
    ],
    directories: [],
  },
  {
    id: "in",
    name: "India",
    currency: "INR",
    shops: [
      { name: "Amazon India", url: (q) => `https://www.amazon.in/s?k=${enc(q)}` },
      etsy,
    ],
    directories: [
      {
        name: "WedMeGood",
        url: "https://www.wedmegood.com/",
        note: "Large vendor directory — vendors pay to be listed, so treat rankings as ads",
      },
    ],
  },
  {
    id: "gb",
    name: "United Kingdom",
    currency: "GBP",
    shops: [
      { name: "Amazon UK", url: (q) => `https://www.amazon.co.uk/s?k=${enc(q)}` },
      etsy,
    ],
    directories: [
      {
        name: "Hitched",
        url: "https://www.hitched.co.uk/",
        note: "Supplier directory — listings are paid placement",
      },
      {
        name: "Bridebook",
        url: "https://bridebook.com/uk/search",
        note: "Venue and supplier search — listings are paid placement",
      },
    ],
  },
  {
    id: "us",
    name: "United States",
    currency: "USD",
    shops: [
      { name: "Amazon", url: (q) => `https://www.amazon.com/s?k=${enc(q)}` },
      etsy,
    ],
    directories: [
      {
        name: "The Knot",
        url: "https://www.theknot.com/marketplace",
        note: "Vendor marketplace — listings are paid placement",
      },
    ],
  },
  {
    id: "other",
    name: "Somewhere else",
    currency: "",
    shops: [etsy],
    directories: [],
  },
];

export function findCountry(id: string | null | undefined): CountryDef {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[COUNTRIES.length - 1];
}

/** Service categories a couple typically books, rather than buys off a shelf. */
export const SUPPLIER_CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Decor & mandap",
  "Officiant / priest",
  "Music & entertainment",
  "Mehendi / beauty",
  "Transport",
  "Invitations & printing",
  "Other",
] as const;

export type SupplierStatus = "looking" | "shortlisted" | "booked" | "own";

export const SUPPLIER_STATUS_LABEL: Record<SupplierStatus, string> = {
  looking: "Still looking",
  shortlisted: "Shortlisted",
  booked: "Booked",
  own: "Ours already",
};
