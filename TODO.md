# Project M — what's left

Your running to-do list. Tick things off as they land; the README has the full
roadmap and reasoning behind each phase.

**Live:** https://project-m-ochre.vercel.app
**Repo:** https://github.com/iamkrish-uprety/project-m
**Supabase:** project `project-m` (ref `kevbnkiwkbyjenvvqclz`)

---

## Blocked on you — needs an account or a decision

These can't move until you do something; nobody else can do them for you.

- [ ] **Resend account** → unblocks email reminders as wedding dates approach.
      Sign up at resend.com, create an API key, hand it over.
- [ ] **Save the Supabase DB password somewhere permanent.** It was generated
      into a scratch folder that won't survive the session. Rotate it in the
      Supabase dashboard if it's already gone.
- [ ] **Decide how interfaith / civil weddings work.** Does v1 let a couple pick
      two traditions and merge the checklists, or stay single-tradition? This is
      a product decision, not a coding one — it's why that option is still
      greyed out at onboarding.
- [ ] **Decide the money model** (Phase 4): paid vendor listings, referral fees,
      or a premium tier. Best decided once real couples are using it.

---

## Content — needs real people, not research

The single biggest risk in this product. Every tradition is currently marked
`verified: false` in `src/data/traditions.ts` and shows a "draft" banner.

- [ ] Get a Hindu wedding checked (Nepali + at least one Indian regional variant)
- [ ] Get a Christian wedding checked (Catholic / Protestant / Orthodox differ)
- [ ] Get a Muslim wedding checked (South Asian + Arab variants)
- [ ] Get a Sikh wedding checked
- [ ] Get a Buddhist wedding checked — **thinnest content by far**, varies most
      by country
- [ ] Flip `verified: true` per tradition as each is confirmed; the banners
      disappear on their own

---

## Vendors

- [x] Directory with category / tradition / region filters
- [x] User submissions, held unpublished until reviewed
- [x] 21 real businesses seeded (Kathmandu + London), all marked unverified
- [x] Star ratings from signed-in users
- [x] Links out to Google and Trustpilot reviews per vendor
- [ ] **Moderation UI** — right now approving a submission means flipping
      `published` by hand in the Supabase dashboard
- [ ] Seed more vendors: India, more UK cities, US
- [ ] Verify some listings properly and flip `verified: true` — that badge
      should mean someone actually dealt with them
- [ ] Written reviews, not just stars (`vendor_reviews.body` already exists)
- [ ] Let vendors claim and edit their own listing

---

## Features not built yet

- [ ] Email reminders (blocked on Resend, above)
- [ ] Printed invitations — needs a print-and-mail partner; currently marked
      "coming soon" in the app
- [ ] Reference photos on checklist and shopping items (you're handling images)
- [ ] Export guest list (CSV) — useful for taking addresses to a printer
- [ ] More sub-tradition variants as gaps turn up
- [ ] Mobile app (React Native/Expo, same Supabase backend) — only worth doing
      once the web version has real users

---

## Housekeeping

- [ ] Delete the leftover test plan in your account if it's still there
      (plan settings → Delete plan)
- [ ] Add Vercel preview URLs to Supabase Auth's redirect allow-list if you
      start testing on branch deploys — sign-in won't work there otherwise
- [ ] Custom domain on Vercel, when you want one
