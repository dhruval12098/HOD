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
      <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex min-w-full items-stretch gap-0 border-b border-[rgba(10,22,40,0.12)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                relative flex-shrink-0 cursor-pointer border-b-2 px-4 py-[13px] text-left
                font-sans text-[10px] font-semibold uppercase tracking-[0.2em]
                transition-colors duration-300
                max-sm:min-w-[170px] sm:min-w-[190px]
                ${active === tab.id
                  ? 'border-[#0A1628] text-[#0A1628]'
                  : 'border-transparent text-[#6A6A6A] hover:text-[#0A1628]'}
              `}
            >
              <span className="block whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
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
