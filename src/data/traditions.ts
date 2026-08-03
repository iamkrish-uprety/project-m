import { TraditionTemplate } from "@/lib/types";

// None of this content has been reviewed by someone from the tradition it
// describes — it's a starting draft assembled from general research, not
// lived or confirmed knowledge. Every template is marked verified: false
// until that review happens. Regional/sect variation is real and this only
// captures one common shape; see each contentNote for specifics.
// Civil/interfaith stays unavailable — blending two traditions' checklists
// is a genuinely different problem (see the roadmap's Phase 0 open
// question), not just missing content.
export const traditions: TraditionTemplate[] = [
  {
    id: "hindu",
    name: "Hindu",
    available: true,
    verified: false,
    contentNote:
      "Reflects a common North Indian/Nepali shape. Regional traditions (South Indian, Bengali, etc.) vary significantly.",
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
    verified: false,
    contentNote: "Reflects a common Western Protestant/Catholic shape. Denomination and country vary the details.",
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
  {
    id: "muslim",
    name: "Muslim",
    available: true,
    verified: false,
    contentNote:
      "Reflects a common South Asian shape (Nikah + Walima). Mahr customs, attire, and additional events (e.g. Mangni, Mehndi) vary widely by culture and school of thought.",
    events: ["Mangni (Engagement)", "Mehndi", "Nikah", "Walima"],
    checklist: [
      { id: "m1", event: "Mangni (Engagement)", task: "Arrange engagement ceremony and ring exchange" },
      { id: "m2", event: "Mehndi", task: "Book mehndi artist" },
      { id: "m3", event: "Nikah", task: "Confirm Qazi/officiant and witnesses" },
      { id: "m4", event: "Nikah", task: "Agree Mahr (dower) terms and prepare Nikahnama" },
      { id: "m5", event: "Nikah", task: "Arrange venue and decor" },
      { id: "m6", event: "Walima", task: "Book Walima venue and catering" },
    ],
    shopping: [
      { id: "ms1", event: "Mehndi", item: "Mehndi-function outfit" },
      { id: "ms2", event: "Nikah", item: "Nikah outfit and jewellery" },
      { id: "ms3", event: "Nikah", item: "Wedding rings" },
      { id: "ms4", event: "Walima", item: "Walima outfit" },
    ],
  },
  {
    id: "sikh",
    name: "Sikh",
    available: true,
    verified: false,
    contentNote:
      "Reflects a common Punjabi shape (Anand Karaj at a Gurdwara). Regional and family customs vary the surrounding events.",
    events: ["Roka", "Mehndi / Sangeet", "Anand Karaj", "Reception"],
    checklist: [
      { id: "sk1", event: "Roka", task: "Exchange gifts and confirm engagement" },
      { id: "sk2", event: "Mehndi / Sangeet", task: "Book mehndi artist and sangeet venue" },
      { id: "sk3", event: "Anand Karaj", task: "Confirm Gurdwara and Granthi (officiant)" },
      { id: "sk4", event: "Anand Karaj", task: "Arrange decor at Gurdwara" },
      { id: "sk5", event: "Anand Karaj", task: "Arrange Langar (community meal)" },
      { id: "sk6", event: "Reception", task: "Book reception venue and catering" },
    ],
    shopping: [
      { id: "sks1", event: "Anand Karaj", item: "Bridal lehenga/suit and chooda" },
      { id: "sks2", event: "Anand Karaj", item: "Groom's sherwani and turban" },
      { id: "sks3", event: "Anand Karaj", item: "Kirpan and kalgi (turban ornament)" },
      { id: "sks4", event: "Reception", item: "Reception outfit" },
    ],
  },
  {
    id: "buddhist",
    name: "Buddhist",
    available: true,
    verified: false,
    contentNote:
      "Buddhist wedding customs vary more than any other tradition here by country and lineage (Theravada, Mahayana, Tibetan, etc.) — this is the thinnest, least-confirmed draft. A monk's blessing plus separate civil registration is common, but treat this as a rough starting point only.",
    events: ["Blessing Ceremony", "Civil Registration", "Reception"],
    checklist: [
      { id: "b1", event: "Blessing Ceremony", task: "Confirm monks/temple for the blessing ceremony" },
      { id: "b2", event: "Blessing Ceremony", task: "Arrange offerings (candles, flowers, incense)" },
      { id: "b3", event: "Civil Registration", task: "Complete legal marriage registration" },
      { id: "b4", event: "Reception", task: "Book reception venue and catering" },
    ],
    shopping: [
      { id: "bs1", event: "Blessing Ceremony", item: "Traditional outfit (varies by country/culture)" },
      { id: "bs2", event: "Blessing Ceremony", item: "Offerings for monks/temple" },
      { id: "bs3", event: "Reception", item: "Reception outfit" },
    ],
  },
  { id: "civil", name: "Civil / Interfaith", available: false, verified: false, events: [], checklist: [], shopping: [] },
];
