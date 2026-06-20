# Ancestorii SEO & GEO Growth Playbook

_Last updated: 20 June 2026_

This is the off-site, non-code half of the growth engine. The codebase already
handles the on-site technical layer (sitemap, per-page metadata, rich
Schema.org, `llms.txt`, indexable slug-based story pages, and now topic hubs,
entity schema, and high-intent comparison/guide pages). None of that spins on
its own. The flywheel turns when two things happen off the site:

1. **Content velocity** — real families publishing real stories.
2. **Off-site signal** — third-party corroboration that tells Google _and_ AI
   engines that Ancestorii exists and is a leading memory platform.

The single biggest lever is #1. Everything else amplifies it.

---

## The flywheel, in one picture

```
Real families publish stories  ──►  Stories get indexed (auto)
        ▲                                      │
        │                                      ▼
Branded searches + sign-ups        Long-tail organic + topic authority
        ▲                                      │
        │                                      ▼
AI engines + Google cite us  ◄──  Structured data + off-site mentions
```

Every published story is a permanent, compounding asset. Ten stories do not spin
the wheel. The first goal is volume.

---

## Part 1 — Content velocity (the fuel)

> Target: **50–100 genuinely good published stories** as fast as is honest.
> Below this, the public feed reads as empty and nothing else matters.

### Tactics
- **Seed from the founder's own family first.** Real, specific, first-person.
  These set the tone and quality bar for everyone who arrives later.
- **Personally onboard the first 20–30 users** and help them publish. A story
  half-written in a draft is worth nothing; a published one is an SEO asset.
- **Run themed prompts as mini campaigns**, one per topic hub:
  - "Share your nan's recipe" → `/stories/topics/food-and-recipes`
  - "How did your grandparents meet?" → `/stories/topics/love`
  - "A tradition your family keeps" → `/stories/topics/traditions`
  Each campaign fills a hub, which is now an indexable, authority-building page.
- **Make publishing the default ask** in every email, invite, and onboarding
  step. "Add your first memory" should be the primary call to action everywhere.
- **Quality bar matters for E-E-A-T.** First-person, specific, lived experience
  is the one thing AI cannot synthesise and Google rewards hardest. Protect it.

### Watch
- Keep an eye on the feed empty-states. The moment a topic hub has 3+ real
  stories it stops looking thin and starts working for you.

---

## Part 2 — Entity building (so AI knows who we are)

AI engines decide who is "leading" largely from **third-party corroboration**,
not from your own homepage. The job here is to make "Ancestorii" a recognised
entity that the same name, logo, and links describe everywhere.

### Checklist (do these in order)
1. **Create a Wikidata item** for Ancestorii (organisation, country, founder,
   official website, social profiles). This is the backbone of entity SEO and is
   free. Once it exists, add its URL to the `sameAs` array in
   `app/layout.tsx` (there is a comment marking the spot).
2. **Claim and complete directory profiles**, using an identical name, logo,
   one-line description, and URL on each:
   - Product Hunt (launch)
   - G2 and Capterra (software directories — strong for "best X" queries)
   - AlternativeTo (directly feeds "StoryWorth alternative" intent)
   - Trustpilot (reviews; trust signal)
   - Crunchbase, LinkedIn company page
3. **Add every claimed profile URL to `sameAs`** in `app/layout.tsx`. Each
   verified link strengthens entity consolidation. Keep name/URL/description
   byte-identical across all of them (consistent NAP).
4. **Earn a few real mentions** — a founder interview, a guest post, a podcast
   appearance, a press mention. Even a handful of credible third-party pages
   naming Ancestorii moves the needle for AI recognition far more than on-site
   copy.
5. **Aim for a Wikipedia article eventually** (needs independent coverage first —
   this is a later-stage goal, not a day-one one).

---

## Part 3 — GEO / AEO (getting AI to cite us by name)

Generative Engine Optimisation is distinct from ranking on Google. The goal is
to be the thing ChatGPT, Perplexity, Claude, and Google AI Overviews _quote_.

### What makes content citable
- **Lead with the answer.** Open pages with a crisp, self-contained definition or
  direct answer, then expand. AI extracts the first clean, quotable statement.
- **Structured, factual, scannable.** Clear headings, short declarative
  sentences, comparison tables, FAQ blocks. (The new comparison and guide pages
  already follow this; keep the pattern.)
- **Comparison and "best X" pages** are disproportionately cited because they map
  directly to what people ask AI. We now have:
  - `/compare` (three-way)
  - `/compare/storyworth-alternative`
  Add as demand shows: `/compare/remento-alternative`,
  "best way to preserve a parent's voice", "best digital legacy platform".
- **Keep `public/llms.txt` current.** It is the file AI crawlers read first.
  Update it whenever positioning, pricing, or features change, and keep the
  strongest one-line positioning near the top.

### Seed the conversations AI learns from
- **Reddit** (we already run a Reddit pixel — lean in). Genuine, non-spammy
  participation in r/genealogy, r/GriefSupport, r/Ancestry, r/family. LLMs weight
  Reddit heavily.
- **Quora** answers to questions like "What is the best alternative to
  StoryWorth?" and "How do I record my parents' stories?"
- **YouTube** — transcripts are crawlable and feed AI engines. Repurposing story
  content into short videos is a strong, low-cost channel.
Be useful first. Self-promotion that reads as spam is worse than silence.

---

## Part 4 — Classic SEO hygiene (mostly done — keep it healthy)

- **Submit `sitemap.xml` in Google Search Console** and verify the property.
  Add Bing Webmaster Tools too (Bing powers ChatGPT search).
- **Monitor coverage** monthly: indexed pages, crawl errors, and which queries
  surface story/guide/topic pages.
- **No dead URLs in the sitemap.** (Fixed: the missing `/moments-worth-keeping`
  route was fully retired — removed from the sitemap and `llms.txt`, and the
  unused `PodcastPreview.tsx` component that linked to it was deleted.)
- **Internal linking** now flows: footer → topics index → topic hubs → stories,
  and each story's category breadcrumb → its topic hub. Keep new content linked
  in from at least one existing page; orphan pages underperform.
- **Per-page OG images** are still partly fallback to the default `/og-image.jpg`.
  Custom OG images per guide/comparison would lift social and AI link previews
  (nice-to-have, not urgent).

---

## Part 5 — 90-day priority order

1. **Weeks 1–4:** Content velocity. Seed 50+ real stories. Verify Search Console
   + Bing. Run the first themed topic campaign.
2. **Weeks 3–6:** Create Wikidata item + claim Product Hunt, AlternativeTo, G2,
   Capterra, Trustpilot. Add each URL to `sameAs` in `app/layout.tsx`.
3. **Weeks 4–8:** Reddit/Quora presence. Publish 1–2 more high-intent comparison
   or guide pages based on what real users ask.
4. **Weeks 6–12:** Pursue 2–3 third-party mentions (interview, guest post,
   podcast). Review which pages AI engines are starting to cite and double down.

---

## Where the code already helps you

| Capability | Status | File |
|---|---|---|
| Dynamic sitemap (incl. stories, topics, guides) | ✅ | `app/sitemap.ts` |
| Per-story metadata + Article schema | ✅ | `app/stories/[slug]/page.tsx` |
| Topic hub pages + ItemList/Breadcrumb schema | ✅ | `app/stories/topics/[category]/page.tsx` |
| Topics index (internal-link hub) | ✅ | `app/stories/topics/page.tsx` |
| Organization + WebSite entity graph (`sameAs`) | ✅ | `app/layout.tsx` |
| High-intent guides (questions, memory book) | ✅ | `app/guides/*` |
| StoryWorth-alternative comparison + FAQ schema | ✅ | `app/compare/storyworth-alternative/page.tsx` |
| `llms.txt` for AI crawlers | ✅ | `public/llms.txt` |

The machine is built. This document is how you give it fuel.
