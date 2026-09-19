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
        grid gap-[50px] items-start
        grid-cols-[minmax(0,1.48fr)_minmax(390px,0.82fr)]
        max-[1100px]:grid-cols-1 max-[1100px]:gap-7
      "
    >
      {/* Left: sticky gallery */}
      <div>{gallery}</div>

      {/* Right: product info */}
      <div className="min-[1101px]:sticky min-[1101px]:top-[100px] min-[1101px]:self-start">{info}</div>
    </div>
  );
}

