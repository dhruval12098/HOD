'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SpecSection from './SpecSection';

export default function ProductTabs({
  specifications = [],
  productDetails = [],
  detailSections = [],
  shippingContent = null,
  careWarrantyContent = null,
  showSections = true,
  showPolicies = true,
}) {
  const [openPanels, setOpenPanels] = useState({
    care: false,
    shipping: false,
  });

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

  const togglePanel = (key) => {
    setOpenPanels((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="mt-6 overflow-hidden">
      <div className="min-w-0">
        {showSections ? (
          <div className="animate-[fadeUp_0.4s_ease]">
            {visibleSections.length > 0 ? (
              visibleSections.map((section) => (
                <SpecSection
                  key={section.title}
                  title={section.title}
                  rows={section.rows}
                  variant={section.variant}
                  hideTitle={section.title === 'Specifications'}
                />
              ))
            ) : (
              <div className="font-sans text-[12px] font-light leading-[1.9] text-[#253246]">
                No specifications have been added for this product yet.
              </div>
            )}
          </div>
        ) : null}

        {showPolicies ? (
          <div className="mt-8 overflow-hidden border border-[rgba(10,22,40,0.10)] bg-white">
            {careWarrantyContent?.body ? (
              <div className="border-b border-[rgba(10,22,40,0.10)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => togglePanel('care')}
                  className="flex w-full items-center justify-between bg-white px-6 py-5 text-left transition-colors duration-200 hover:bg-[#FAFBFD]"
                >
                  <span className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[#253246]">
                    {careWarrantyContent.title || 'Care & Warranty'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#8B94A5] transition-transform duration-300 ${openPanels.care ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openPanels.care ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid transition-all duration-300`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-6 pb-5 pt-5 font-sans text-[13px] font-light leading-[1.9] text-[#6A6A6A]">
                      {careWarrantyContent.body
                        .split(/\n+/)
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                        .map((entry, index) => (
                          <p key={`care-${index}`} className="mb-3 last:mb-0">
                            {entry}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {shippingContent?.body ? (
              <div className="border-b border-[rgba(10,22,40,0.10)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => togglePanel('shipping')}
                  className="flex w-full items-center justify-between bg-white px-6 py-5 text-left transition-colors duration-200 hover:bg-[#FAFBFD]"
                >
                  <span className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[#253246]">
                    {shippingContent.title || 'Shipping'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#8B94A5] transition-transform duration-300 ${openPanels.shipping ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openPanels.shipping ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid transition-all duration-300`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-6 pb-5 pt-5 font-sans text-[13px] font-light leading-[1.9] text-[#6A6A6A]">
                      {shippingContent.body
                        .split(/\n+/)
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                        .map((entry, index) => (
                          <p key={`shipping-${index}`} className="mb-3 last:mb-0">
                            {entry}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
