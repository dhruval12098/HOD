'use client';

import { useMemo, useState } from 'react';
import SpecSection from './SpecSection';

/**
 * @typedef {{ key: string; value: string }} ProductKeyValue
 * @typedef {{ id: string; title: string; rows: ProductKeyValue[]; visible: boolean }} ProductDetailSection
 * @typedef {{ title: string; body: string }} ProductPolicyContent
 */

/**
 * @param {{
 *   specifications?: ProductKeyValue[]
 *   productDetails?: ProductKeyValue[]
 *   detailSections?: ProductDetailSection[]
 *   shippingContent?: ProductPolicyContent | null
 *   careWarrantyContent?: ProductPolicyContent | null
 * }} props
 */
export default function ProductTabs({
  specifications = [],
  productDetails = [],
  detailSections = [],
  shippingContent = null,
  careWarrantyContent = null,
}) {
  const [active, setActive] = useState('specs');

  const visibleSections = useMemo(() => {
    const sections = [];

    if (specifications.length > 0) {
      sections.push({
        title: 'Specifications',
        rows: specifications.map((row) => [row.key, row.value]),
        variant: 'piece',
      });
    }

    if (productDetails.length > 0) {
      sections.push({
        title: 'Product Details',
        rows: productDetails.map((row) => [row.key, row.value]),
        variant: 'piece',
      });
    }

    detailSections
      .filter((section) => section.visible !== false && section.rows?.length)
      .forEach((section) => {
        sections.push({
          title: section.title,
          rows: section.rows.map((row) => [row.key, row.value]),
          variant: /diamond|stone|gem/i.test(section.title) ? 'diamond' : 'piece',
        });
      });

    return sections;
  }, [specifications, productDetails, detailSections]);

  const tabs = [
    { id: 'specs', label: 'Specifications' },
    ...(careWarrantyContent?.body ? [{ id: 'care', label: careWarrantyContent.title || 'Care & Warranty' }] : []),
    ...(shippingContent?.body ? [{ id: 'shipping', label: shippingContent.title || 'Shipping' }] : []),
  ];

  return (
    <div className="mt-[30px] overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-[rgba(10,22,40,0.10)] pb-2 max-sm:gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`
              relative cursor-pointer rounded-full border border-[rgba(10,22,40,0.10)] bg-transparent px-4 py-[11px]
              font-sans text-[10px] font-semibold uppercase tracking-[0.18em]
              transition-colors duration-300
              ${active === tab.id ? 'border-[#0A1628] bg-[#0A1628] text-white' : 'text-[#6A6A6A] hover:border-[#0A1628] hover:text-[#0A1628]'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-w-0 pt-6">
        {active === 'specs' ? (
          <div className="animate-[fadeUp_0.4s_ease]">
            {visibleSections.length > 0 ? (
              visibleSections.map((section) => (
                <SpecSection key={section.title} title={section.title} rows={section.rows} variant={section.variant} />
              ))
            ) : (
              <div className="font-sans text-[12px] font-light leading-[1.9] text-[#253246]">
                No specifications have been added for this product yet.
              </div>
            )}
          </div>
        ) : null}

        {active === 'care' && careWarrantyContent?.body ? (
          <SpecSection
            title={careWarrantyContent.title || 'Care & Warranty'}
            rows={careWarrantyContent.body
              .split(/\n+/)
              .map((entry) => entry.trim())
              .filter(Boolean)
              .map((entry, index) => [`Point ${index + 1}`, entry])}
            variant="piece"
          />
        ) : null}

        {active === 'shipping' && shippingContent?.body ? (
          <SpecSection
            title={shippingContent.title || 'Shipping'}
            rows={shippingContent.body
              .split(/\n+/)
              .map((entry) => entry.trim())
              .filter(Boolean)
              .map((entry, index) => [`Point ${index + 1}`, entry])}
            variant="piece"
          />
        ) : null}
      </div>
    </div>
  );
}
