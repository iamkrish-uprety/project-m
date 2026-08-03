# Project M — One planner, every wedding tradition

A web app where a couple picks their tradition — Hindu, Christian, Muslim, Sikh, Buddhist,
interfaith, or civil — and gets a checklist, shopping list, and (later) vendor directory
built for *that* ceremony, not a generic Western wedding template with a few extra rows
bolted on.

## Vision

Most wedding-planning apps (The Knot, Zola, WithJoy) are built around one Western,
church-and-reception template. Couples planning a Hindu, Muslim, Sikh, or Buddhist wedding
either don't fit the checklist or have to piece things together from WhatsApp groups,
Pinterest boards, and relatives' memories instead. That gap is the opening.

The app's job: ask which tradition (or traditions, for interfaith couples) a couple is
planning for, then generate a checklist, shopping list, budget, and — later — a vendor
directory that matches the actual ceremonies, attire, and rituals of that wedding.

## Who it's for

- **The couple** — planning their own wedding, juggling multiple ceremonies and families.
- **The family coordinator** — often a parent or relative actually running logistics in
  multi-event weddings, needs a checklist they can share and edit with others.
- **The vendor** *(Phase 3+)* — clothing shop, jeweller, decorator, caterer, or officiant
  who wants to be found by couples planning a specific tradition.

## Roadmap

| Phase | Focus | Duration |
|---|---|---|
| **0** | Foundations & research — map each tradition's real events/attire/shopping list, competitive scan, wireframes, lock data model & stack | ~2–3 weeks |
| **1** | MVP — planning & checklist tool (onboarding, tradition-aware checklist, shopping list, budget, guest list, share/co-edit). No vendors yet. | ~6–8 weeks |
| **2** | Content depth — more tradition/sub-tradition variants, richer reference content, reminders, SEO guide pages | ~4–6 weeks |
| **3** | Vendor directory & marketplace — curated seed listings first, then self-onboarding, reviews, admin moderation | ~6–10 weeks |
| **4** | Monetization & growth — pick a model once usage data exists, mobile app (React Native/Expo), optional AI-assisted planning | ongoing |

### Phase 0 — Foundations & research

- Map each tradition: real sequence of events, required attire per event, typical shopping
  list. Talk to people from each community rather than relying on generic web research —
  this content **is** the product.
- Competitive scan to confirm the non-Western-wedding gap is real and specific.
- Wireframe the core loop: onboarding → dashboard → checklist → shopping list.
- Lock the data model and stack (below) before writing more code.

### Phase 1 — MVP: planning & checklist tool

No vendors yet — pure utility, good enough that someone would use it for their own
wedding.

- Onboarding: pick tradition(s), wedding date, region, rough budget.
- Checklist & timeline generated from the tradition template, fully editable.
- Shopping list per ceremony, seeded from the template, editable per couple.
- Budget tracker (allocate vs. spend by category).
- Basic guest list.
- Share/co-edit with a partner or family coordinator.

**Content scope for v1**: going deep on **Hindu + Christian** first rather than shallow
across every tradition (see [Risks](#risks--open-questions)). The onboarding UI still
lists all traditions, with the rest marked "coming soon."

### Phase 2 — Content depth & more traditions

- Sub-tradition variants (North vs. South Indian Hindu, Catholic vs. Protestant Christian,
  Nikah, Sikh Anand Karaj, Buddhist, interfaith blends).
- Richer checklist items: reference photos, short explainer guides.
- Reminders/notifications as key dates approach.
- Public SEO guide pages per tradition double as organic acquisition.

### Phase 3 — Vendor directory & marketplace

- Vendor directory (clothing, jewellery, decor, catering, photography, officiants),
  filterable by tradition and city.
- Seed with a curated, hand-populated list first to avoid the empty-directory cold start.
- Vendor self-onboarding portal once there's directory traffic worth claiming.
- Inquiry/contact forms, basic reviews, admin moderation.

### Phase 4 — Monetization & growth

- Pick a model with real usage data in hand: featured/paid vendor listings, referral fees
  on inquiries, or a premium planning tier. No need to decide before Phase 3 ships.
- Mobile app (React Native/Expo) reusing the same Supabase backend, once the web MVP is
  validated.
- Optional later: AI-assisted planning — a chat assistant that drafts a starting checklist
  from tradition + region + budget.

## Data model (starting point)

| Table | Purpose |
|---|---|
| `users` | Account, auth, profile |
| `weddings` | One per couple: tradition(s), date, region, budget total |
| `tradition_templates` | Seed content per tradition/sub-tradition: default events, checklist items, shopping items |
| `checklist_items` | Per-wedding items, cloned from a template and freely editable |
| `shopping_items` | Per-wedding shopping list, same clone-and-edit pattern |
| `budget_categories` | Allocated vs. spent, per wedding |
| `guests` | Guest list per wedding |
| `vendors` | *Phase 3+.* Name, categories, traditions served, region, contact |
| `vendor_reviews` | *Phase 3+.* Rating and text, tied to a wedding |

## Tech stack

Optimized for one person shipping fast:

- **Next.js** (App Router) on **Vercel** — server components for content pages, client
  components for the checklist/dashboard.
- **Supabase** — Postgres + Auth + Storage.
- **Resend** — transactional email for reminders/invites (Phase 2).

> Current state: the app skeleton (onboarding → dashboard, checklist, shopping list,
> budget) runs entirely on `localStorage` with no backend wired up yet. Supabase auth/DB
> integration is the first real task once a Supabase project exists — see `.env.example`
> and `src/lib/supabase.ts`.

## Risks & open questions

- **Content accuracy is the whole product.** A checklist that gets a ceremony wrong or
  flattens real regional variation will feel alienating, not helpful. Budget real time to
  talk to people from each tradition before writing seed content.
- **Vendor cold start (Phase 3).** A directory with no vendors has no value; vendors won't
  join a directory with no traffic. Hand-seed real public vendor listings before asking
  anyone to self-onboard.
- **Wide vs. deep scope.** Supporting every tradition from day one is a lot of content work
  for one person — go deep on Hindu + Christian for Phase 1, widen in Phase 2.
- **Open question:** interfaith weddings (two traditions blended) are common and genuinely
  hard to template. Decide in Phase 0 whether v1 supports picking two traditions and
  merging checklists, or defers that to Phase 2.

## Development

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL/anon key once a project exists
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
