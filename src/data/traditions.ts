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
    blurb:
      "Hindu weddings usually run as a series of ceremonies over several days rather than a single event, with the rituals, attire, and shopping list differing for each one.",
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
    variants: [
      {
        id: "north-indian",
        name: "North Indian",
        note: "Adds the Sangeet and Baraat, which are central in many North Indian weddings.",
        addEvents: ["Sangeet", "Baraat"],
        addChecklist: [
          { id: "h-ni1", event: "Sangeet", task: "Plan sangeet performances and book venue" },
          { id: "h-ni2", event: "Baraat", task: "Arrange baraat transport (horse/car) and dhol players" },
          { id: "h-ni3", event: "Swayambar / Milap", task: "Plan joota chupai and other rituals with both families" },
        ],
        addShopping: [
          { id: "h-nis1", event: "Sangeet", item: "Sangeet outfit" },
          { id: "h-nis2", event: "Baraat", item: "Groom's sehra and safa (turban)" },
        ],
      },
      {
        id: "south-indian",
        name: "South Indian",
        note: "South Indian ceremonies differ substantially from the North Indian base above — this variant is especially rough and needs review.",
        addEvents: ["Nischayathartham", "Muhurtham"],
        addChecklist: [
          { id: "h-si1", event: "Nischayathartham", task: "Hold formal engagement and fix the muhurtham (auspicious time)" },
          { id: "h-si2", event: "Muhurtham", task: "Arrange the thaali/mangalsutra and confirm priest" },
          { id: "h-si3", event: "Muhurtham", task: "Book nadaswaram musicians" },
        ],
        addShopping: [
          { id: "h-sis1", event: "Muhurtham", item: "Kanjeevaram silk saree" },
          { id: "h-sis2", event: "Muhurtham", item: "Thaali / mangalsutra" },
          { id: "h-sis3", event: "Muhurtham", item: "Groom's veshti (dhoti) and angavastram" },
        ],
      },
      {
        id: "bengali",
        name: "Bengali",
        note: "Adds a few widely-recognised Bengali ceremonies; far from complete.",
        addEvents: ["Aiburobhat", "Gaye Holud", "Bou Bhaat"],
        addChecklist: [
          { id: "h-b1", event: "Aiburobhat", task: "Arrange the last unmarried meal with family" },
          { id: "h-b2", event: "Gaye Holud", task: "Arrange turmeric ceremony essentials" },
          { id: "h-b3", event: "Bou Bhaat", task: "Plan the bride's first meal reception at the groom's home" },
        ],
        addShopping: [
          { id: "h-bs1", event: "Gaye Holud", item: "Yellow/holud saree" },
          { id: "h-bs2", event: "Swayambar / Milap", item: "Benarasi saree and mukut (headpiece)" },
          { id: "h-bs3", event: "Swayambar / Milap", item: "Topor (groom's headwear)" },
        ],
      },
    ],
  },
  {
    id: "christian",
    name: "Christian",
    available: true,
    verified: false,
    contentNote: "Reflects a common Western Protestant/Catholic shape. Denomination and country vary the details.",
    blurb:
      "Christian weddings are typically built around a single ceremony and reception, with the preparation focused on the venue, officiant, and the order of service.",
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
    variants: [
      {
        id: "catholic",
        name: "Catholic",
        note: "Catholic weddings usually involve parish paperwork and preparation well ahead of the date.",
        addChecklist: [
          { id: "c-cat1", event: "Engagement", task: "Meet the parish priest and begin marriage preparation (Pre-Cana)" },
          { id: "c-cat2", event: "Engagement", task: "Gather baptism/confirmation certificates" },
          { id: "c-cat3", event: "Ceremony", task: "Decide between a Nuptial Mass or ceremony without Mass" },
        ],
      },
      {
        id: "protestant",
        name: "Protestant",
        note: "Practice varies widely between denominations and individual churches.",
        addChecklist: [
          { id: "c-pro1", event: "Engagement", task: "Confirm the church's requirements and any premarital counselling" },
          { id: "c-pro2", event: "Ceremony", task: "Choose hymns and music with the church" },
        ],
      },
      {
        id: "orthodox",
        name: "Orthodox",
        note: "Adds the crowning ceremony; details differ across Greek, Russian, and other Orthodox churches.",
        addEvents: ["Betrothal"],
        addChecklist: [
          { id: "c-o1", event: "Betrothal", task: "Arrange the betrothal/ring blessing service" },
          { id: "c-o2", event: "Ceremony", task: "Arrange stefana (wedding crowns) and choose koumbaro/koumbara" },
        ],
        addShopping: [{ id: "c-os1", event: "Ceremony", item: "Stefana (wedding crowns)" }],
      },
    ],
  },
  {
    id: "muslim",
    name: "Muslim",
    available: true,
    verified: false,
    contentNote:
      "Reflects a common South Asian shape (Nikah + Walima). Mahr customs, attire, and additional events (e.g. Mangni, Mehndi) vary widely by culture and school of thought.",
    blurb:
      "The Nikah is the marriage contract itself; the Walima is the celebration that follows. Surrounding events vary a great deal between cultures.",
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
    variants: [
      {
        id: "south-asian",
        name: "South Asian",
        note: "Adds events common in Pakistani, Indian, and Bangladeshi Muslim weddings.",
        addEvents: ["Baraat"],
        addChecklist: [
          { id: "m-sa1", event: "Mehndi", task: "Plan dholki nights and mehndi performances" },
          { id: "m-sa2", event: "Baraat", task: "Arrange the groom's procession and transport" },
        ],
        addShopping: [
          { id: "m-sas1", event: "Baraat", item: "Groom's sherwani and kalgi" },
          { id: "m-sas2", event: "Nikah", item: "Bridal lehenga/gharara and dupatta" },
        ],
      },
      {
        id: "arab",
        name: "Arab",
        note: "Adds the Katb al-Kitab and Zaffa; customs differ widely across Arab countries.",
        addEvents: ["Katb al-Kitab", "Zaffa"],
        addChecklist: [
          { id: "m-ar1", event: "Katb al-Kitab", task: "Arrange the contract signing with the sheikh and witnesses" },
          { id: "m-ar2", event: "Zaffa", task: "Book the zaffa procession (drummers/performers)" },
        ],
      },
    ],
  },
  {
    id: "sikh",
    name: "Sikh",
    available: true,
    verified: false,
    contentNote:
      "Reflects a common Punjabi shape (Anand Karaj at a Gurdwara). Regional and family customs vary the surrounding events.",
    blurb:
      "The Anand Karaj takes place at a Gurdwara in the presence of the Guru Granth Sahib, and is usually followed by Langar for all guests.",
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
    variants: [
      {
        id: "punjabi",
        name: "Punjabi",
        note: "Adds pre-wedding ceremonies common in Punjabi Sikh families.",
        addEvents: ["Maiyan / Vatna", "Milni"],
        addChecklist: [
          { id: "sk-p1", event: "Maiyan / Vatna", task: "Arrange haldi/vatna ceremony essentials" },
          { id: "sk-p2", event: "Milni", task: "Plan the milni (family introductions) before Anand Karaj" },
          { id: "sk-p3", event: "Anand Karaj", task: "Arrange the palki/doli send-off" },
        ],
        addShopping: [{ id: "sk-ps1", event: "Maiyan / Vatna", item: "Vatna/haldi ceremony outfit" }],
      },
    ],
  },
  {
    id: "buddhist",
    name: "Buddhist",
    available: true,
    verified: false,
    contentNote:
      "Buddhist wedding customs vary more than any other tradition here by country and lineage (Theravada, Mahayana, Tibetan, etc.) — this is the thinnest, least-confirmed draft. A monk's blessing plus separate civil registration is common, but treat this as a rough starting point only.",
    blurb:
      "Buddhism has no single prescribed marriage rite. Most Buddhist weddings pair a blessing from monks with a separate civil registration, and the surrounding customs are local rather than religious.",
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
  {
    id: "civil",
    name: "Civil / Interfaith",
    available: false,
    verified: false,
    events: [],
    checklist: [],
    shopping: [],
  },
];

export function findTradition(id: string | null | undefined) {
  return traditions.find((t) => t.id === id);
}
