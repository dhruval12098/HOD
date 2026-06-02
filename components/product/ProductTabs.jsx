'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SpecSection from './SpecSection';

/**
 * @typedef {{ key: string, value: string }} ProductTabRow
 * @typedef {{ title?: string | null, body?: string | null }} ProductTabPolicy
 * @typedef {{ title: string, rows?: ProductTabRow[], visible?: boolean }} ProductTabDetailSection
 */

/**
 * @param {{
 *  specifications?: ProductTabRow[]
 *  productDetails?: ProductTabRow[]
 *  detailSections?: ProductTabDetailSection[]
 *  shippingContent?: ProductTabPolicy | null
 *  careWarrantyContent?: ProductTabPolicy | null
 *  showSections?: boolean
 *  showPolicies?: boolean
 *  cardGrid?: boolean
 *  detailsAccordion?: boolean
 * }} props
 */
export default function ProductTabs({
  specifications = [],
  productDetails = [],
  detailSections = [],
  shippingContent = null,
  careWarrantyContent = null,
  showSections = true,
  showPolicies = true,
  cardGrid = false,
  detailsAccordion = false,
}) {
  const [openPanels, setOpenPanels] = useState({
    details: true,
    shipping: false,
    care: false,
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

  const detailsRows = useMemo(
    () => visibleSections.flatMap((section) => section.rows.map(([label, value]) => ({ label, value, section: section.title }))),
    [visibleSections]
  );

  const renderPolicyBody = (body, keyPrefix) => (
    <div className="overflow-hidden">
      <div className={`${detailsAccordion ? 'px-1 pb-5 pt-1' : 'border-t border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-6 pb-5 pt-5'} font-sans text-[13px] font-light leading-[1.9] text-[#6A6A6A]`}>
        {body
          .split(/\n+/)
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry, index) => (
            <p key={`${keyPrefix}-${index}`} className="mb-3 last:mb-0">
              {entry}
            </p>
          ))}
      </div>
    </div>
  );

  const policyShellClass = detailsAccordion
    ? 'overflow-hidden border-b border-[rgba(10,22,40,0.10)] bg-transparent'
    : 'mt-8 overflow-hidden border border-[rgba(10,22,40,0.10)] bg-white';
  const policyButtonClass = detailsAccordion
    ? 'flex w-full items-center justify-between bg-transparent px-1 py-4 text-left transition-colors duration-200'
    : 'flex w-full items-center justify-between bg-white px-6 py-5 text-left transition-colors duration-200 hover:bg-[#FAFBFD]';
  const policyTitleClass = detailsAccordion
    ? 'font-sans text-[16px] font-medium normal-case tracking-normal text-[#0A1628]'
    : 'font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[#253246]';
  const chevronClass = detailsAccordion ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="mt-6 overflow-hidden">
      <div className="min-w-0">
        {showSections ? (
          <div className="animate-[fadeUp_0.4s_ease]">
            {detailsAccordion && detailsRows.length > 0 ? (
              <div className="overflow-hidden border-y border-[rgba(10,22,40,0.10)] bg-transparent">
                <button
                  type="button"
                  onClick={() => togglePanel('details')}
                  className="flex w-full items-center justify-between border-b border-[rgba(10,22,40,0.08)] px-1 py-4 text-left"
                >
                  <div className="flex items-center gap-3 font-sans text-[16px] font-medium text-[#0A1628]">
                    <span className="text-[18px] leading-none">+</span>
                    Details
                  </div>
                  <ChevronDown className={`h-5 w-5 text-[#8B94A5] transition-transform duration-300 ${openPanels.details ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openPanels.details ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid transition-all duration-300`}>
                  <div className="overflow-hidden">
                    <div className="px-1 py-5">
                      <div className="mb-5 font-sans text-[13px] font-semibold text-[#0A1628]">Details</div>
                      <div className="space-y-3">
                        {detailsRows.map((row, index) => (
                          <div key={`${row.label}-${index}`} className="grid grid-cols-[minmax(120px,0.9fr)_minmax(0,1.2fr)] gap-5 font-sans text-[13px] leading-[1.35]">
                            <div className="text-[#6A6A6A]">{row.label}</div>
                            <div className="font-medium text-[#0A1628]">{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : cardGrid && detailsRows.length > 0 ? (
              <div className="rounded-[28px] bg-[#F5F6F9] p-5 shadow-[0_18px_45px_rgba(10,22,40,0.04)] sm:p-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {detailsRows.slice(0, 9).map((row, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="min-h-[150px] rounded-[14px] border border-[rgba(10,22,40,0.08)] bg-white p-5 shadow-[0_10px_28px_rgba(10,22,40,0.05)]"
                    >
                      <div className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B94A5]">
                        {row.label}
                      </div>
                      <div className="font-sans text-[22px] font-semibold leading-[1.25] text-[#0A1628]">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : visibleSections.length > 0 ? (
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
          <div className={policyShellClass}>
            {shippingContent?.body ? (
              <div className="border-b border-[rgba(10,22,40,0.10)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => togglePanel('shipping')}
                  className={policyButtonClass}
                >
                  <span className={policyTitleClass}>
                    {shippingContent.title || 'Shipping'}
                  </span>
                  <ChevronDown className={`${chevronClass} text-[#8B94A5] transition-transform duration-300 ${openPanels.shipping ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openPanels.shipping ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid transition-all duration-300`}>
                  {renderPolicyBody(shippingContent.body, 'shipping')}
                </div>
              </div>
            ) : null}

            {careWarrantyContent?.body ? (
              <div className="border-b border-[rgba(10,22,40,0.10)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => togglePanel('care')}
                  className={policyButtonClass}
                >
                  <span className={policyTitleClass}>
                    {careWarrantyContent.title || 'Care & Warranty'}
                  </span>
                  <ChevronDown className={`${chevronClass} text-[#8B94A5] transition-transform duration-300 ${openPanels.care ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openPanels.care ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid transition-all duration-300`}>
                  {renderPolicyBody(careWarrantyContent.body, 'care')}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
