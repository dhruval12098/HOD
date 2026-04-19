// components/product/ProductLayout.jsx — House of Diams

/**
 * Two-column grid: gallery (left) + info (right).
 * Collapses to single column below 1100px.
 * @param {object}      props
 * @param {React.Node}  props.gallery
 * @param {React.Node}  props.info
 */
export default function ProductLayout({ gallery, info }) {
  return (
    <div
      className="
        grid gap-[70px] items-start
        grid-cols-[1.2fr_1fr]
        max-[1100px]:grid-cols-1 max-[1100px]:gap-10
      "
    >
      {/* Left: sticky gallery */}
      <div>{gallery}</div>

      {/* Right: product info */}
      <div>{info}</div>
    </div>
  );
}
