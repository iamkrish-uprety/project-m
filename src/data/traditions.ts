import { TraditionTemplate } from "@/lib/types";

// Phase 1 goes deep on two traditions first (Hindu, Christian) rather than
// shallow across all of them — see the roadmap's "wide vs. deep" risk note.
// The rest are listed so onboarding can show the full picture, marked
// unavailable until their content is researched in Phase 2.
export const traditions: TraditionTemplate[] = [
  {
    id: "hindu",
    name: "Hindu",
    available: true,
    events: ["Teej", "Sagun", "Mehendi", "Swayambar / Milap", "Reception"],
    checklist: [
      { id: "h1", event: "Teej", task: "Arrange fasting/puja essentials for the bride's family" },
      { id: "h2", event: "Sagun", task: "Exchange of gifts between families" },
      { id: "h3", event: "Mehendi", task: "Book mehendi artist" },
      { id: "h4", event: "Swayambar / Milap", task: "Confirm priest and puja samagri" },
      { id: "h5", event: "Swayambar / Milap", task: "Arrange mandap/decor" },
      { id: "h6", event: "Reception", task: "Finalize venue and catering" },
    ],
    shopping: [
      { id: "hs1", event: "Sagun", item: "Sagun set (fruits, sweets, gifts)" },
      { id: "hs2", event: "Mehendi", item: "Mehendi-function outfit" },
      { id: "hs3", event: "Swayambar / Milap", item: "Wedding saree / lehenga or daura-suruwal" },
      { id: "hs4", event: "Swayambar / Milap", item: "Jewellery set" },
      { id: "hs5", event: "Reception", item: "Reception outfit" },
    ],
  },
  {
    id: "christian",
    name: "Christian",
    available: true,
    events: ["Engagement", "Rehearsal", "Ceremony", "Reception"],
    checklist: [
      { id: "c1", event: "Engagement", task: "Confirm engagement date and venue" },
      { id: "c2", event: "Rehearsal", task: "Schedule rehearsal with officiant" },
      { id: "c3", event: "Ceremony", task: "Book church/venue and officiant" },
      { id: "c4", event: "Ceremony", task: "Arrange vows and readings" },
      { id: "c5", event: "Reception", task: "Book reception venue and catering" },
    ],
    shopping: [
      { id: "cs1", event: "Ceremony", item: "Wedding gown / suit" },
      { id: "cs2", event: "Ceremony", item: "Rings" },
      { id: "cs3", event: "Ceremony", item: "Veil / accessories" },
      { id: "cs4", event: "Reception", item: "Reception outfit" },
    ],
  },
  { id: "muslim", name: "Muslim", available: false, events: [], checklist: [], shopping: [] },
  { id: "sikh", name: "Sikh", available: false, events: [], checklist: [], shopping: [] },
  { id: "buddhist", name: "Buddhist", available: false, events: [], checklist: [], shopping: [] },
  { id: "civil", name: "Civil / Interfaith", available: false, events: [], checklist: [], shopping: [] },
];
