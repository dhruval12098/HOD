"use client";

import { Select } from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "carat-high", label: "Carat: High to Low" },
  { value: "carat-low", label: "Carat: Low to High" },
  { value: "name", label: "Name: A to Z" },
  { value: "newest", label: "Newest First" },
];

export default function ShopToolbar({ count, sort, onSortChange, onToggleFilters }) {
  return (
    <div
      className="shop-toolbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .shop-toolbar {
            margin-bottom: 18px !important;
            gap: 10px !important;
            align-items: center !important;
          }
          .shop-toolbar .filter-btn {
            padding: 9px 14px !important;
            border-radius: 999px !important;
            letter-spacing: .16em !important;
          }
          .shop-toolbar .shop-toolbar-count {
            order: 3;
            width: 100%;
            font-size: 10px !important;
          }
          .shop-toolbar .shop-toolbar-sort {
            margin-left: auto;
          }
          .shop-toolbar .shop-toolbar-sort .shop-sort-trigger {
            min-height: 38px !important;
            padding: 9px 12px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Filter button */}
      <button
        onClick={onToggleFilters}
        style={{
          display: "inline-flex",
          padding: "10px 20px",
          background: "#0A1628",
          color: "#FAFBFD",
          border: "none",
          cursor: "pointer",
          fontSize: "10px",
          letterSpacing: ".24em",
          textTransform: "uppercase",
          alignItems: "center",
          gap: "10px",
        }}
        className="filter-btn"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 2H11M2 6H10M3 10H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Filters
      </button>

      {/* Result count */}
      <div className="shop-toolbar-count" style={{ fontSize: "11px", letterSpacing: ".08em", color: "#6A6A6A" }}>
        <strong style={{ color: "#0A1628", fontWeight: 500 }}>{count}</strong> pieces
      </div>

      {/* Sort */}
      <div className="shop-toolbar-sort" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <Select
          value={sort}
          onValueChange={onSortChange}
          options={SORT_OPTIONS}
          validationLabel="Sort products"
          triggerClassName="shop-sort-trigger min-w-[210px] border-[rgba(10,22,40,0.10)] bg-white py-[10px] pr-3 text-[11px] font-normal tracking-[0.08em] text-[#0A1628]"
        />
      </div>
    </div>
  );
}
