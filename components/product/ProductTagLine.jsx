// components/product/ProductTagLine.jsx — House of Diams

/**
 * Pill badges row shown above the product title (e.g. "New Arrival", "In Stock").
 * @param {object} props
 * @param {boolean} props.isNew
 * @param {string[]} [props.badges]
 * @param {boolean} [props.readyToShip]
 */
export default function ProductTagLine({ isNew, badges = [], readyToShip = false }) {
  const fallbackBadges = badges.length > 0 ? badges : [isNew ? 'New Arrival' : 'Bespoke'];
  const visibleBadges = readyToShip ? [...fallbackBadges, 'Ready to Ship'] : fallbackBadges;

  return (
    <div className="flex gap-[10px] mb-[14px]">
      {visibleBadges.map((badge, index) => (
        <span
          key={`${badge}-${index}`}
          className={
            badge.toLowerCase().includes('stock')
              ? 'font-sans text-[8px] font-medium tracking-[0.28em] uppercase px-3 py-[5px] border text-[#2d8a4f] bg-[rgba(50,160,80,0.08)] border-[rgba(50,160,80,0.3)]'
              : 'font-sans text-[8px] font-medium tracking-[0.28em] uppercase px-3 py-[5px] bg-[#0A1628] text-[#FFFFFF] border border-[#0A1628]'
          }
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
