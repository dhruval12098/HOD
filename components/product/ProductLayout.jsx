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
        grid gap-[44px] items-start
        grid-cols-[minmax(0,1.55fr)_minmax(420px,0.85fr)]
        max-[1100px]:grid-cols-1 max-[1100px]:gap-10
      "
    >
      {/* Left: sticky gallery */}
      <div>{gallery}</div>

      {/* Right: product info */}
      <div className="lg:sticky lg:top-[100px]">{info}</div>
    </div>
  );
}
