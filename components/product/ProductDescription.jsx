// components/product/ProductDescription.jsx — House of Diams

/**
 * Product description paragraph.
 * @param {object} props
 * @param {string} props.text
 */
export default function ProductDescription({ text }) {
  return (
    <p className="font-sans text-[13px] font-light leading-[1.9] text-[#3A3628] tracking-[0.02em] mb-8">
      {text}
    </p>
  );
}
