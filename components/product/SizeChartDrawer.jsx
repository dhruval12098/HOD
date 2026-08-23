'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const subscribeToBrowser = () => () => {};

const SIZE_ROWS = [
  ['14mm', 'F', '3.25', '44', '5'],
  ['14.5mm', 'G', '3.75', '45', '6'],
  ['14.8mm', 'H', '4.25', '46.5', '7'],
  ['15.2mm', 'I', '4.5', '47.5', '8'],
  ['15.6mm', 'J', '5', '48.5', '9'],
  ['16.0mm', 'K', '5.5', '50', '10'],
  ['16.4mm', 'L', '6', '51', '11'],
  ['16.8mm', 'M', '6.5', '52.5', '12'],
  ['17.2mm', 'N', '6.75', '53.5', '13'],
  ['17.4mm', 'O', '7', '55', '14'],
  ['18.0mm', 'P', '7.5', '56', '15'],
  ['18.4mm', 'Q', '8', '57.5', '16'],
  ['19.0mm', 'R', '8.5', '59', '17'],
  ['19.2mm', 'S', '9', '60.25', '18'],
  ['19.5mm', 'T', '9.5', '62.75', '19'],
  ['20.0mm', 'U', '10', '63', '20'],
  ['20.3mm', 'V', '10.5', '64', '21'],
  ['20.7mm', 'W', '11', '65', '22'],
  ['21.1mm', 'X', '11.5', '66.5', '23'],
  ['21.4mm', 'Y', '12', '67.5', '24'],
  ['21.8mm', 'Z', '12.5', '69', '25'],
];

export default function SizeChartDrawer({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('guide');
  const titleId = useId();
  const closeRef = useRef(null);
  const canUseDOM = useSyncExternalStore(subscribeToBrowser, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousHtmlOverflow = htmlStyle.overflow;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousBodyPosition = bodyStyle.position;
    const previousBodyTop = bodyStyle.top;
    const previousBodyWidth = bodyStyle.width;
    const lenis = window.__lenis;

    lenis?.stop?.();
    htmlStyle.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      htmlStyle.overflow = previousHtmlOverflow;
      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.position = previousBodyPosition;
      bodyStyle.top = previousBodyTop;
      bodyStyle.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      lenis?.start?.();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const drawer = (
    <div className={`fixed inset-0 z-[2147483647] isolate transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close size chart"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-[#0A1628]/35 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-[430px] flex-col bg-white shadow-[-24px_0_70px_rgba(10,22,40,0.18)] transition-transform duration-500 ease-[cubic-bezier(.77,0,.18,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#D7DADF] px-6">
          <h2 id={titleId} className="font-sans text-[13px] font-semibold uppercase tracking-[0.02em] text-[#0A1628]">Size Guide</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="flex size-9 items-center justify-center text-[#0A1628] transition-opacity hover:opacity-55" aria-label="Close size guide">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        <div
          data-lenis-prevent
          onWheel={(event) => event.stopPropagation()}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 pb-8 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#AEB4BC]"
        >
          <p className="py-6 font-sans text-[12px] font-semibold leading-[1.45] text-[#0A1628]">Doubts about your ring size? We’re here to help<br />you find the right fit.</p>

          <div className="grid grid-cols-2 border-b border-[#B8BDC5]" role="tablist" aria-label="Size guide information">
            <button type="button" role="tab" aria-selected={activeTab === 'guide'} onClick={() => setActiveTab('guide')} className={`relative pb-4 text-left font-sans text-[12px] font-semibold uppercase text-[#0A1628] ${activeTab === 'guide' ? 'after:absolute after:bottom-[-1px] after:left-0 after:h-px after:w-[74px] after:bg-[#0A1628]' : ''}`}>Size Guide</button>
            <button type="button" role="tab" aria-selected={activeTab === 'measure'} onClick={() => setActiveTab('measure')} className={`relative pb-4 text-left font-sans text-[12px] font-semibold uppercase text-[#0A1628] ${activeTab === 'measure' ? 'after:absolute after:bottom-[-1px] after:left-0 after:h-px after:w-[108px] after:bg-[#0A1628]' : ''}`}>How to Measure</button>
          </div>

          {activeTab === 'guide' ? (
            <table className="mt-4 w-full table-fixed border-collapse font-sans text-[#0A1628]">
              <thead>
                <tr className="border-b border-[#C9CDD3] text-[9px] font-semibold">
                  <th className="w-[38%] px-1 pb-3 text-left">Internal Diameter</th>
                  <th className="px-1 pb-3 text-center">UK</th>
                  <th className="px-1 pb-3 text-center">US</th>
                  <th className="px-1 pb-3 text-center">EU</th>
                  <th className="px-1 pb-3 text-center">China</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row) => (
                  <tr key={row.join('-')} className="h-[42px] border-b border-[#D5D8DD] text-[10px] font-semibold">
                    <td className="px-1 text-center">{row[0]}</td>
                    <td className="px-1 text-center">{row[1]}</td>
                    <td className="px-1 text-center">{row[2]}</td>
                    <td className="px-1 text-center">{row[3]}</td>
                    <td className="px-1 text-center">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-7 font-sans text-[12px] leading-6 text-[#0A1628]">
              <p className="font-semibold">Measure the inside diameter of a ring that already fits you.</p>
              <p className="mt-3">Place the ring on a ruler and measure straight across the widest inside point in millimetres. Match that measurement with the Internal Diameter column in the size guide.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );

  return canUseDOM ? createPortal(drawer, document.body) : null;
}
