# Category Page Visual Rail Refresh

## Objective
Update the existing House of Diams category-page browse rail so it visually matches the homepage Shop by Category cards: large 4:5 cards, edge-to-edge imagery, minimal 3px gutters, and image-led labels. The All tab must display every option from every browse section in one horizontal rail.

## Direction
Preserve the restrained luxury black/white design and existing font tokens. Keep the collection title, tab navigation, leading banner card, client-side navigation, active states, and pending states. Selected tabs show their options; All flattens every section's options in section/option order and deduplicates repeats. Use only existing image URLs. Images fill cards with object-cover. Swatches and missing-image fallbacks fill the card.

## Constraints
- Existing Next.js app at D:\Main Hod\house-of-diams.
- Implement mainly in D:\Main Hod\house-of-diams\components\shop\ShopHero.jsx.
- Match D:\Main Hod\house-of-diams\components\home\ShopByCategory.tsx: aspect-[4/5], about 72vw/300px cards, 3px gaps.
- Keep changes tightly scoped.
- Do not run a production build.

## Output path
D:\Main Hod\house-of-diams
