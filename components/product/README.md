# House of Diams — Product Detail Components

Next.js (App Router) + Tailwind CSS conversion of the product detail page.  
**Zero custom CSS.** All styles are Tailwind utility classes.  
Fonts, keyframes, and the custom cursor are the only things that live in  
`styles/product-globals.css` (because Tailwind has no API for them).

---

## Directory Structure

```
house-of-diams/
├── app/
│   ├── layout.jsx               ← Root layout (loader, cursor, fonts)
│   └── product/
│       └── page.jsx             ← Server component shell → ProductClient
│
├── components/
│   ├── common/
│   │   └── GemSVG.jsx           ← SVG gem renderer (all 12 styles)
│   │
│   ├── product/
│   │   ├── ProductBreadcrumb.jsx
│   │   ├── ProductGallery.jsx
│   │   ├── ProductTagLine.jsx
│   │   ├── ProductCategoryPill.jsx
│   │   ├── ProductPriceBlock.jsx
│   │   ├── ProductDescription.jsx
│   │   ├── ProductConfigurator.jsx    ← Composes the 4 sub-components below
│   │   ├── ConfiguratorMetalSwatches.jsx
│   │   ├── ConfiguratorPillGroup.jsx
│   │   ├── ConfiguratorEngravingInput.jsx
│   │   ├── ConfiguratorSummary.jsx
│   │   ├── ProductCTAs.jsx
│   │   ├── ProductTrustRow.jsx
│   │   ├── ProductTabs.jsx            ← Composes SpecSection
│   │   ├── SpecSection.jsx
│   │   ├── ProductLayout.jsx
│   │   ├── RelatedProducts.jsx
│   │   ├── EnquireModal.jsx
│   │   ├── Toast.jsx
│   │   └── FloatingWidgets.jsx
│   │
│   └── pages/
│       └── ProductClient.jsx          ← Composes everything; owns all state
│
├── lib/
│   └── productData.js                 ← PRODUCTS[], METAL_META, helpers
│
├── styles/
│   └── product-globals.css            ← Fonts + @keyframes + cursor CSS only
│
└── tailwind.config.js                 ← Font families, colours, animations
```

---

## Component Responsibilities

| Component | What it renders | State |
|---|---|---|
| `GemSVG` | Pure SVG gem illustration | None |
| `ProductBreadcrumb` | Home / Shop / {name} crumb | None |
| `ProductGallery` | Main image + 4 thumbs, hover scale | None |
| `ProductTagLine` | "New Arrival" + "In Stock" pills | None |
| `ProductCategoryPill` | Gold category + carat pill | None |
| `ProductPriceBlock` | "From $X,XXX" price display | None |
| `ProductDescription` | Description paragraph | None |
| `ConfiguratorMetalSwatches` | Colour-circle metal selector | Lifted to `ProductConfigurator` |
| `ConfiguratorPillGroup` | Reusable pill row (purity / diamond type / carat / size) | Lifted |
| `ConfiguratorEngravingInput` | Engraving toggle + text input | Local |
| `ConfiguratorSummary` | "Your Selection" summary bar | None (receives values) |
| `ProductConfigurator` | Assembles all configurator sub-components | Local (metal, purity, diamondType, carat, size) |
| `ProductCTAs` | Request Quote / WhatsApp / Wishlist heart | None (callbacks from parent) |
| `ProductTrustRow` | 3-col IGI / Insured / Conflict Free strip | None |
| `SpecSection` | Single titled spec block with key-value rows | None |
| `ProductTabs` | Specs / Care / Shipping tab switcher | Local (active tab) |
| `ProductLayout` | Two-column grid wrapper | None |
| `RelatedProducts` | "You May Also Love" section + grid | None (wishlist from parent) |
| `EnquireModal` | Quote request modal with WhatsApp submit | None (open/close from parent) |
| `Toast` | Slide-up bottom notification | None (message from parent) |
| `FloatingWidgets` | Back-to-top + WhatsApp FAB | Local (show/hide on scroll) |
| `ProductClient` | Page root — owns wishlist, modal, toast state | Wishlist, modal, toast |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Tailwind is already configured in tailwind.config.js
#    Make sure your globals CSS is imported in app/layout.jsx

# 3. Run dev server
npm run dev
```

### Required packages

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## Notes

- **No `<style>` tags anywhere** — pure Tailwind utility classes throughout.
- The only CSS file (`product-globals.css`) handles: Google Font `@import`, `@keyframes` (`fadeUp`, `rotateDiamond`, `marquee`), and the custom cursor media query.
- Keyframes are also registered in `tailwind.config.js` so `animate-[fadeUp_0.4s_ease]` arbitrary syntax works.
- `ProductClient` is marked `'use client'` and reads `?id=` from `window.location.search` on mount — works with both App Router and Pages Router.
- Wishlist is persisted to `localStorage` under key `hod_wishlist`.
