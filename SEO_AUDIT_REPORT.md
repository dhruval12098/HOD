# House of Diams — Current-Repository SEO Verification Report

**Scope:** current `main` source plus read-only CMS verification on 2026-09-29. No application, CMS, or configuration changes were made.

## Executive summary

The clean catalogue URL and client-side Load More architecture is present and should be retained. The primary confirmed defects are: public taxonomy publication is not derived from product mappings; public test content remains active; unfiltered pagination is neither server-rendered nor indexable; initial non-USD rendering labels USD amounts with the visitor currency before FX data loads; and Education JSON-LD identifies a Blog URL.

The live CMS schema also does **not** contain the `seo_indexable` fields used by `app/sitemap.ts`. Consequently categories default to being included, while subcategories/options are omitted because the code requires `seo_indexable === true`. This is a deployment/schema mismatch, not a safe UI-only correction.

## Verification matrix

| Audit ID | Current status | Evidence | Action |
|---|---|---|---|
| HOD-01 Empty catalogue destinations | **STILL BROKEN** | `app/sitemap.ts:29-89` publishes active categories without checking mappings; routes only require `status = active` in `CategoryCollectionPageContent.tsx:49-59` and `catalog-taxonomy.ts:24-59`. CMS: 2/6 active categories have no products (`collection`, `hiphop`); 4/10 active subcategories and 13/35 options have no primary product mappings. | Add one publication/indexability resolver based on status, intended route type, and live product mappings; use it for routes, nav/tiles, sitemap, and public product queries. Decide whether each empty record is unlaunched, retired, or incorrectly mapped before changing it. |
| HOD-02 Test/preview content | **STILL BROKEN** | Storefront product queries use only `.eq('status', 'active')` (`catalog-products.ts:742`, `1427-1431`, `1342-1345`); Education uses only `is_published` (`education.ts:43-60`); bespoke portfolio API uses active status. CMS has active `fine-jewellery-test-product`, published `education-copy`, and active bespoke item titled `test product`. | Establish/use a public visibility state across every public query and detail route. Immediately unpublish the confirmed records; do not rely on the current sitemap-only `education-copy` exclusion (`sitemap.ts:108-115`). |
| HOD-03 Collection crawlability | **STILL BROKEN** | `CategoryCollectionPageContent.tsx:171-178` always requests `page: 1`; `ProductGrid.jsx:489-511` exposes only a JS button; `catalog-metadata.ts:6-10` classifies `page` as a filter, and `app/[categorySlug]/page.tsx:57-65` applies `noindex`. The API correctly supports page ranges (`route.ts:17-53`; `catalog-products.ts:1445-1460`). | Parse and validate unfiltered `page`, SSR that batch, make page 2+ self-canonical, and add sequential crawlable links with progressive enhancement of the existing button. Preserve the append UX. |
| HOD-04 Price/currency consistency | **STILL BROKEN** | `priceFrom` resolves from default purity/metal variant or `base_price` in `catalog-products.ts:921-1027`; checkout treats prices as USD and applies a live USD FX quote (`exchange-rates.ts:230-252`). `CurrencyProvider` initializes a detected INR selection with `{ USD: 1 }` before rate fetch (`CurrencyContext.tsx:55-89`), so SSR can display `₹` with an unconverted USD amount; JSON-LD is fixed to USD (`structured-data.ts:58-88`). | Keep USD as base/offered schema currency unless the server produces a purchasable local offer. Make initial display currency/amount synchronous and consistent (server quote or USD until rates load); align cards, PDP, cart, checkout, and JSON-LD. |
| HOD-05 Article structured data | **STILL BROKEN** | `createBlogPostingSchema` always uses `/blog/${slug}` and emits display `date_label` verbatim (`structured-data.ts:107-132`). Education invokes it at `education/[slug]/page.tsx:35`. `BlogPost.date` is mapped from `date_label` (`data/blog-posts.ts:187-216`), not a machine date. | Accept canonical path and real ISO publication/modification fields in the schema helper; add/select real timestamps rather than parsing or inventing dates. |
| HOD-06 Legacy `/hiphop` | **PARTIALLY SOLVED** | Primary navbar filters `/hiphop` (`navbar-server.ts:87-93`, `123-136`), but it is still a real active page and is linked by homepage fallbacks and showcase components (`home/Collection.tsx:61-68`, `home-data.ts:876`, `HipHopShowcase.tsx:25,68`, `MobileDrawer.tsx:15`). Sitemap will include an active `hiphop` category because its `seo_indexable` field is absent. | Decide whether `/hiphop` is a current canonical destination or a legacy redirect. If legacy, replace every internal link and configure a direct 301 in `seo_redirects`; if canonical, treat it as a supported non-empty lane and fix its sitemap/publication eligibility. |
| HOD-07 Returns address link | **DATA/CMS ISSUE** | Address/link data comes from `contact_info` (`api/public/contact/info/route.ts:10-18`; `returns/page.tsx:22-46`). Footer safely renders invalid `href` as text (`Footer.tsx:74-79`, `318-328`), but Returns renders any `href` as a link (`ReturnsFaqPage.tsx:98-115`). | Correct the malformed `contact_info.href`; validate supported protocols at the shared data boundary or render invalid/blank address links as text in all consumers. |
| HOD-08 Category H1 | **STILL BROKEN** | Shared hero hard-codes `Explore {title} Collection` (`ShopHero.jsx:215-220`), while category content only provides a banner title/name (`CategoryCollectionPageContent.tsx:339-346`). This can create `Explore Collection Collection`; the CMS category schema has no H1/SEO fields. | Add optional category H1 and intro fields in CMS, with a grammatical shared fallback. Do not encode category copy in React. |
| HOD-09 Category metadata | **STILL BROKEN** | Category metadata only uses name/banner subtitle (`app/[categorySlug]/page.tsx:50-55`); nested metadata is generated genericly (`catalog-metadata.ts:16-24`). Current category CMS fields lack SEO title and description. | Add shared optional SEO title/description/H1/intro fields and a safe template fallback for category, subcategory, and option pages. |
| HOD-10 Shipping/returns policy | **REQUIRES BUSINESS DECISION** | UI claims 15 days in `ProductTrustRow.jsx:15-17`, `Certifications.tsx:142-148`, and `AdditionalSummaryDetails.tsx:91-94`; policy pages load CMS content (`shipping/page.tsx:12-29`, `returns/page.tsx:49-64`). | Obtain approved terms first. Then centralize the approved values/copy and remove placeholders; no return duration should be selected by engineering. |
| HOD-11 Breadcrumb structured data | **WITHDRAWN / NO ACTION** | Existing shared BreadcrumbList uses canonical URLs and positions (`structured-data.ts:45-56`). | Preserve. |
| HOD-12 Product material structured data | **DATA/CMS ISSUE** | Product schema emits every `metalsFull` value (`structured-data.ts:73-81`); those values derive from configured product-metal selections/variants (`catalog-products.ts:879-967`). | Sample public variants to confirm every emitted material is purchasable for that product. If not, emit the default purchasable material or variant-specific offer information. |
| HOD-13 | **REQUIRES BUSINESS DECISION** | No HOD-13 finding text was supplied in the source brief. | Provide the original HOD-13 finding before scoping a change. |
| HOD-14 Duplicate product HTML titles | **PARTIALLY SOLVED** | PDP metadata honors `seo_title` (`shop/[slug]/page.tsx:87-92`). CMS still has five duplicate display-name groups; four have differentiated SEO titles, while the two `round-baguette-three-stone-ring-*` records share the exact same SEO title. | Correct the duplicate metadata title using verified differentiators (e.g., carat/variant), without changing slugs, SKU, or product identity. Review copy-suffixed product records under HOD-02. |
| HOD-15 Product image alt text | **WITHDRAWN / NO ACTION** | No bulk rewrite is warranted. | Preserve. |
| HOD-16 Homepage LCP | **PARTIALLY SOLVED** | First desktop/mobile slide uses `next/image` `priority` and `sizes="100vw"` (`Hero.tsx:242-255`, `268-281`). No LCP field data, lab trace, or image-byte/dimension measurement is stored; the performance script checks only bundle/document size (`scripts/check-performance-budget.mjs:4-47`). | Measure real LCP and image transfer before modifying hero behavior. Do not add duplicate preload tags. |
| HOD-17 Contact page | **WITHDRAWN / NO ACTION** | `/contact` already exists; no standalone page should be created for this finding. | Preserve. |
| HOD-18 Display spelling | **ALREADY SOLVED** | No `BY DESGIN`, `SOLITARE`, or `Anniversay` occurrences exist in source or active taxonomy CMS records in this audit snapshot. | Preserve slugs; handle future label corrections at the CMS/source-field level. |
| HOD-19 Internal discoverability | **ALREADY SOLVED** | Footer includes FAQ, Shipping, Returns, Terms, and Privacy (`Footer.tsx:288-294`), plus About, Blog, Education, and Contact (`270-278`). | Do not duplicate navigation. |

## Files requiring modification (confirmed, subject to phase ordering)

1. Publication/indexability: a new shared catalogue-publication module; `lib/catalog-products.ts`, `lib/catalog-taxonomy.ts`, `lib/navbar-server.ts`, `app/[categorySlug]/CategoryCollectionPageContent.tsx`, and `app/sitemap.ts`.
2. Crawlability: `app/[categorySlug]/CategoryCollectionPageContent.tsx`, `components/shop/ProductGrid.jsx`, `lib/catalog-metadata.ts`, `app/[categorySlug]/page.tsx`, plus nested category route metadata callers if pagination applies there.
3. Currency: `context/CurrencyContext.tsx`, server price/display boundary, and `lib/structured-data.ts`; audit card/PDP/cart consumers before editing.
4. Article schema: `lib/structured-data.ts`, `lib/data/blog-posts.ts`, `lib/blog.ts`, `lib/education.ts`, `app/blog/[slug]/page.tsx`, and `app/education/[slug]/page.tsx`.
5. Templates/CMS consumption: `components/shop/ShopHero.jsx`, `app/[categorySlug]/page.tsx`, and `lib/catalog-metadata.ts`.
6. Address rendering: the `contact_info` data boundary and `components/docs/ReturnsFaqPage.tsx` (if malformed values must be safely rendered before the CMS cleanup lands).

## CMS/database cleanup required

- Unpublish or mark non-public: `fine-jewellery-test-product`, `education-copy`, and the active bespoke item titled `test product`.
- Classify empty active taxonomy records before any automated state transition:
  - categories: `collection`, `hiphop`;
  - subcategories: `round-rings`, `test-subcat`, `for-him`, `chains`;
  - options: `eternity-rings`, `personalized-charm`, `solid`, `cigar-band`, `pavee`, `tennis-necklace`, `initials`, `tennis-earrings`, `nature`, `classic`, `cuban-links`, `diamonds`, `designer`.
- Repair the `contact_info` address `href` rather than replacing address text in JSX.
- Differentiate the duplicate SEO title on the two `round-baguette-three-stone-ring-*` products; review copy-suffixed active products as likely cleanup candidates.
- Add schema-backed category SEO/publication fields and real article publish/modified timestamps. The current deployed category table lacks `seo_indexable`, despite sitemap code depending on it.

## Decisions required from the business

1. Approved returns duration and shipping commitments.
2. Whether `/hiphop` is a canonical active destination or a retired legacy URL.
3. Launch/retirement/mapping decision for each empty taxonomy record.
4. Which product material/variant claims are valid for schema output.
5. The omitted HOD-13 finding.

## Regression risks

- Introducing indexability by URL shape alone would re-publish empty/unlaunched routes.
- Treating `page` as a normal filter would retain `noindex` and break crawler discovery; treating actual filters as paginated canonical pages would create duplicate indexable content.
- Replacing Load More with pagination would regress the established browse UX.
- Rendering localized symbols before a rate is available produces a visible/schema/checkout disagreement.
- Hiding `/hiphop` without deciding its canonical role risks breaking current content links and backlinks.

## Recommended implementation order

1. HOD-01/HOD-02: define the shared public-visibility rule and clean confirmed test records.
2. HOD-03: SSR sequential pagination while progressively enhancing the existing Load More control.
3. HOD-04: make initial price currency deterministic, then validate checkout truth.
4. HOD-05, then HOD-12 if variant data supports it.
5. HOD-06/HOD-07 and any remaining HOD-19 work.
6. HOD-08/HOD-09/HOD-14/HOD-18.
7. HOD-10 only after policy approval.
8. HOD-16 only after lab/field measurement.

## Required validation after implementation

- Confirm clean category/subcategory/option routes and filter canonical/noindex behavior.
- Test page 1, 2, and 3 server HTML, sequential crawler links, invalid page handling, and client append behavior with filters and sort.
- Verify sitemap contains only public, non-empty canonical destinations and no test content.
- Compare SSR, hydrated UI, JSON-LD, and Razorpay checkout amount/currency for USD and INR sessions.
- Validate Blog/Education schema URLs and ISO dates.
- Run `npm run typecheck`, `npm run lint`, `npm run build`, relevant tests, and a measured LCP check.
