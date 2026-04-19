// components/product/ProductTabs.jsx — House of Diams
'use client';
import { useState } from 'react';
import SpecSection from './SpecSection';
import { DIAMOND_SPEC_KEYS } from '@/lib/data/product-config';

const PIECE_DEFAULTS = {
  'Crafted In': 'Surat, India',
  'Finish': 'High Polish',
  'Complimentary Engraving': 'Up to 20 characters',
};

/**
 * Specifications / Care & Warranty / Shipping tabs.
 * @param {object} props
 * @param {object} props.specs - Raw specs object from the product
 */
export default function ProductTabs({ specs }) {
  const [active, setActive] = useState('specs');

  // Split specs into piece rows + diamond rows
  const pieceRows    = [];
  const diamondRows  = [];

  Object.entries(specs).forEach(([k, v]) => {
    if (DIAMOND_SPEC_KEYS.includes(k)) diamondRows.push([k, v]);
    else pieceRows.push([k, v]);
  });

  // Add piece defaults that aren't already present
  Object.entries(PIECE_DEFAULTS).forEach(([k, v]) => {
    if (!pieceRows.some(r => r[0] === k)) pieceRows.push([k, v]);
  });

  const tabs = [
    { id: 'specs',    label: 'Specifications' },
    { id: 'care',     label: 'Care & Warranty' },
    { id: 'shipping', label: 'Shipping' },
  ];

  return (
    <div className="mt-[30px]">
      {/* Tab headers */}
      <div className="flex border-b border-[rgba(20,18,13,0.10)]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`
              px-5 py-[14px] font-sans text-[10px] font-medium tracking-[0.24em] uppercase
              bg-transparent border-0 cursor-pointer transition-colors duration-300 relative
              ${active === t.id ? 'text-[#B8922A]' : 'text-[#7A7060] hover:text-[#14120D]'}
            `}
          >
            {t.label}
            {/* Active underline */}
            {active === t.id && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#B8922A]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="pt-6">
        {/* Specifications */}
        {active === 'specs' && (
          <div className="animate-[fadeUp_0.4s_ease]">
            <SpecSection title="Piece Details" rows={pieceRows} variant="piece" />
            <SpecSection title="Diamond Details" rows={diamondRows.length ? diamondRows : [['-', 'No diamond specs']]} variant="diamond" />
          </div>
        )}

        {/* Care & Warranty */}
        {active === 'care' && (
          <div className="animate-[fadeUp_0.4s_ease] font-sans text-[12px] font-light leading-[1.9] text-[#3A3628]">
            <p>
              Clean your piece with warm soapy water and a soft brush. Avoid harsh chemicals,
              chlorine and ultrasonic cleaners on gold-plated items. A complimentary polishing
              cloth ships with every order.
            </p>
            <br />
            <p>
              <strong className="font-medium">Warranty:</strong> Every House of Diams piece comes
              with a lifetime craftsmanship warranty. Complimentary annual cleaning and inspection
              at our Surat atelier.
            </p>
          </div>
        )}

        {/* Shipping */}
        {active === 'shipping' && (
          <div className="animate-[fadeUp_0.4s_ease] font-sans text-[12px] font-light leading-[1.9] text-[#3A3628] space-y-4">
            <p>
              <strong className="font-medium">Worldwide insured shipping — complimentary.</strong> We ship via
              FedEx, DHL or Brinks depending on destination. All shipments are fully insured for
              declared value and require signature on delivery.
            </p>
            <p>
              <strong className="font-medium">Lead time:</strong> In-stock pieces ship within 2–3
              business days. Made-to-order: 4–8 weeks depending on complexity.
            </p>
            <p>
              <strong className="font-medium">Duties &amp; taxes:</strong> Buyer is responsible for
              import duties and taxes in their country. We provide all documentation required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
