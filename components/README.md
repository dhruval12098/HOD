# Components Directory

This folder contains the reusable UI and page-specific components used across the site.

## Structure Overview

| Folder | Purpose |
| --- | --- |
| `about/` | Components used on the About page |
| `b2b/` | Components used on the B2B page and related shared UI |
| `bespoke/` | Components used on the Bespoke page |
| `common/` | Shared layout components used across multiple pages |
| `contact/` | Components used on the Contact page |
| `hiphop/` | Components used on the Hip Hop page |
| `home/` | Components used on the Home page |
| `pages/` | Client wrapper components for full page sections |
| `product/` | Components and supporting UI used on the Product page |
| `shop/` | Components used on the Shop page |
| `lib/` | Shared data and hooks used across features |

## Component List

### `about`

- `AboutHero.jsx`
- `FoundersSection.jsx`
- `TimelineSection.jsx`
- `ValuesSection.jsx`

### `b2b`

- `B2BBenefitCard.jsx`
- `B2BBenefitsGrid.jsx`
- `B2BCtaBanner.jsx`
- `B2BHero.jsx`
- `B2BPage.jsx`
- `B2BProcessCard.jsx`
- `B2BProcessSteps.jsx`
- `Badge.jsx`
- `Breadcrumb.jsx`
- `ButtonGhostGold.jsx`
- `ButtonGold.jsx`
- `ButtonOutline.jsx`
- `ButtonPrimary.jsx`
- `SectionEyebrow.jsx`

### `bespoke`

- `BespokeForm.tsx`
- `BespokeHero.tsx`
- `BespokePortfolio.tsx`
- `ProcessSteps.tsx`

### `common`

- `Footer.tsx`
- `GemSVG.tsx`
- `Navbar.tsx`

### `contact`

- `ContactBody.tsx`
- `ContactHero.tsx`
- `ContactMap.tsx`

### `hiphop`

- `HipHopCollection.tsx`
- `HipHopHero.tsx`
- `HipHopProductCard.tsx`
- `MobileDrawer.tsx`
- `Overlay.tsx`
- `TypeFilterBar.tsx`
- `hiphop-products.ts`
- `useCountUp.ts`
- `useRevealAnimation.ts`
- `useWishlist.ts`

### `home`

- `AnnouncementBar.tsx`
- `BlogSection.tsx`
- `Certifications.tsx`
- `Collection.tsx`
- `CouplesSection.tsx`
- `DiamondInfo.tsx`
- `EnquireModal.tsx`
- `FAQ.tsx`
- `FloatingGems.tsx`
- `FloatingWidgets.tsx`
- `Hero.tsx`
- `HeroDiamondCanvas.tsx`
- `HipHopShowcase.tsx`
- `InstagramReels.tsx`
- `Loader.tsx`
- `Manufacturing.tsx`
- `MaterialStrip.tsx`
- `Newsletter.tsx`
- `StatsStrip.tsx`
- `TestimonialMarquee.tsx`
- `Testimonials.tsx`
- `Toast.tsx`
- `TrustStrip.tsx`

### `pages`

- `BespokeClient.tsx`
- `ContactClient.tsx`
- `HomeClient.tsx`
- `ShopClient.tsx`

### `product`

- `ConfiguratorEngravingInput.jsx`
- `ConfiguratorMetalSwatches.jsx`
- `ConfiguratorPillGroup.jsx`
- `ConfiguratorSummary.jsx`
- `EnquireModal.jsx`
- `FloatingWidgets.jsx`
- `ProductBreadcrumb.jsx`
- `ProductCategoryPill.jsx`
- `ProductClient.jsx`
- `ProductConfigurator.jsx`
- `ProductCTAs.jsx`
- `ProductDescription.jsx`
- `ProductGallery.jsx`
- `ProductLayout.jsx`
- `ProductPriceBlock.jsx`
- `ProductTabs.jsx`
- `ProductTagLine.jsx`
- `ProductTrustRow.jsx`
- `RelatedProducts.jsx`
- `SpecSection.jsx`
- `Toast.jsx`
- `layout.jsx`
- `page.jsx`

### `shop`

- `ProductCard.jsx`
- `ProductGrid.jsx`
- `ShopHero.jsx`
- `ShopSidebar.jsx`
- `ShopToolbar.jsx`

### `lib`

#### `data`

- `product-config.ts`
- `products.ts`

#### `hooks`

- `useWishlist.ts`

## Notes

- The directory currently contains a mix of `.jsx` and `.tsx` components.
- Page-specific folders are organized by route or feature area to keep related UI together.
- Shared layout elements live in `common/`, while `pages/` contains higher-level page client wrappers.
- Shared data and reusable hooks live under `lib/` so they can be imported by multiple sections cleanly.
- Product-specific shared docs live in `components/product/README.md`.
