# Project M — One planner, every wedding tradition

**Live:** [project-m-ochre.vercel.app](https://project-m-ochre.vercel.app) — deployed on Vercel,
auto-deploys on push to `main`.

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
| **1** | ✅ MVP — planning & checklist tool (onboarding, tradition-aware checklist, shopping list, budget, guest list, share/co-edit). No vendors yet. | ~6–8 weeks |
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

### Phase 1 — MVP: planning & checklist tool ✅ done

No vendors yet — pure utility, good enough that someone would use it for their own
wedding.

- Onboarding: pick a tradition and regional variant, wedding date, region, rough budget.
- Checklist grouped by ceremony, seeded from the template and fully editable — add, rename
  (click a task), delete, and set a due date per item.
- Shopping list per ceremony, same edit model, with a cost estimate per item.
- Budget tracker: per-category allocated vs. spent with a progress bar, rolling up against
  the wedding's total budget and showing what's left to allocate.
- Guest list: contact details, side (Bride/Groom/Both), invited flag, RSVP
  (pending/coming/can't come) with filters, and plus-ones feeding a live headcount.
- Multiple plans per account, listed at `/dashboard` — a family coordinator can be on
  several at once.
- Plan settings (`/plan/<id>/settings`) to edit details or delete the plan.
- Share/co-edit: a copyable invite link (`/join?wedding=<id>`) lets a partner or family
  coordinator self-add as a collaborator; the plan shows everyone who has access, and the
  owner can remove them.

### Phase 2 — Content depth & more traditions 🚧 in progress

- ✅ Muslim (Nikah/Walima), Sikh (Anand Karaj), and Buddhist tradition templates added.
  **None of the tradition content — including Hindu and Christian — has been reviewed by
  someone from that tradition yet.** Every `TraditionTemplate` carries a `verified: false`
  flag and an optional `contentNote` explaining what's uncertain; the plan and the public
  guides both show a draft banner for any unverified tradition. Treat this as a starting
  point, not a source of truth, until real review happens.
- ✅ Sub-tradition variants — Hindu (North Indian, South Indian, Bengali), Christian
  (Catholic, Protestant, Orthodox), Muslim (South Asian, Arab), Sikh (Punjabi). Variants
  only *add* to the base template, so picking one never hides anything. Same caveat: all
  unreviewed.
- ✅ Public SEO guide pages at `/guides` and `/guides/<tradition>`, statically generated
  with per-tradition metadata. They carry the draft disclaimer prominently — unverified
  cultural content shouldn't read as authoritative just because it ranks.
- Richer checklist items: reference photos, explainer copy — not yet done.
- **Reminders/notifications as key dates approach — blocked on a Resend account.** Needs
  someone to sign up at resend.com and provide an API key before this can be built (email
  sending needs a real account; not something that can be set up on someone else's behalf).
  Deferred until that's ready.
- Interfaith/civil weddings still unavailable — merging two traditions' checklists is a
  design question, not just missing content.

### Phase 3 — Vendor directory & marketplace 🚧 in progress

- ✅ Directory at `/vendors`, filterable by category, tradition, and region.
- ✅ User submission flow. Listings insert with `published = false` and are invisible to
  everyone but their submitter until reviewed — enforced in RLS, not just the UI.
- **The directory ships empty on purpose.** Every listing has to be a real business someone
  has actually verified; generating plausible-looking vendor names, phone numbers, and
  websites would put fake businesses in front of couples spending real money. Seed it by
  hand from sources you trust.
- Publishing/moderation UI — not yet done; flip `published` in the Supabase dashboard for
  now.
- Reviews — table and RLS exist (`vendor_reviews`), no UI yet.
- Vendor self-onboarding portal once there's directory traffic worth claiming.

### Phase 4 — Monetization & growth

- Pick a model with real usage data in hand: featured/paid vendor listings, referral fees
  on inquiries, or a premium planning tier. No need to decide before Phase 3 ships.
- Mobile app (React Native/Expo) reusing the same Supabase backend, once the web MVP is
  validated.
- Optional later: AI-assisted planning — a chat assistant that drafts a starting checklist
  from tradition + region + budget.

## Data model

`auth.users` (Supabase-managed) is the account/profile table — no custom `users` table
needed. Tradition templates live in code (`src/data/traditions.ts`) rather than a database
table for now, since they're static seed content, not per-user data.

| Table | Purpose |
|---|---|
| `weddings` | One per couple: owner, tradition + variant, date, region, budget total |
| `wedding_collaborators` | Extra users (partner, family coordinator) with access to a wedding |
| `checklist_items` | Per-wedding items with due date and notes, cloned from a template then freely editable |
| `shopping_items` | Per-wedding shopping list with cost estimates, same clone-and-edit pattern |
| `budget_categories` | Allocated vs. spent, per wedding |
| `guests` | Guest list: contact, side, invited, RSVP, plus-ones |
| `profiles` | Mirrors `auth.users.email` so a plan can show who has access (auth.users isn't client-readable) |
| `vendors` | Directory listings; `published` gates public visibility |
| `vendor_reviews` | Rating and text, one per user per vendor |

Row-level security on every table scopes reads/writes to the wedding's `owner_id` or
anyone listed in `wedding_collaborators` — see `has_wedding_access()` in the migrations.

Two RLS details worth knowing before editing policies:

- **`weddings` policies must not query `weddings`.** A self-referential lookup inside a
  `SECURITY DEFINER` helper breaks `INSERT ... RETURNING`, because the new row isn't
  visible to the nested query during the returning check — it surfaces as a confusing
  "new row violates row-level security policy". Compare `owner_id` directly instead; see
  `20260803010000_fix_weddings_rls.sql`.
- **Child tables are fine using `has_wedding_access()`**, since they look up a `weddings`
  row that already exists.

## Tech stack

Optimized for one person shipping fast:

- **Next.js** (App Router) on **Vercel** — server components for content pages, client
  components for the checklist/dashboard.
- **Supabase** — Postgres + Auth + Storage.
- **Resend** — transactional email for reminders/invites (Phase 2).

> Current state: a live Supabase project (`project-m`, eu-central-1, under the ATTFTOrg
> account) backs auth and data. Sign-in is passwordless (email magic link via
> `supabase.auth.signInWithOtp`); `weddings`, `checklist_items`, `shopping_items`,
> `budget_categories`, and `guests` are real Postgres tables with row-level security
> scoped to the wedding's owner and collaborators (see
> `supabase/migrations/20260803000000_init.sql`). Local dev needs Docker for the
> `supabase` CLI's local stack — not installed here, so this project talks directly to
> the hosted dev project via `.env.local` instead.

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
cp .env.example .env.local   # fill in Supabase URL/anon key — see below
npm run dev -- -p 3010
```

Open [http://localhost:3010](http://localhost:3010). Sign in with any email (passwordless
magic link) to reach onboarding, or [supabase.com/dashboard](https://supabase.com/dashboard)
→ `project-m` project to browse the database directly.

Schema changes go in `supabase/migrations/`, applied with:

```bash
supabase link --project-ref kevbnkiwkbyjenvvqclz
supabase db push
```

## Deployment

Hosted on Vercel (`iamkrish-upretys-projects/project-m`), connected to this GitHub repo — every
push to `main` auto-deploys. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
set in the Vercel project's environment variables (Production + Preview).

Supabase Auth's site URL and redirect allow-list include both the production domain and
`http://localhost:3010/**`, so magic-link sign-in works in local dev and in production. Preview
deployments (per-branch/PR URLs) aren't in the allow-list yet — add them there if preview auth
is needed.
