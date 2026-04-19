"use client";

import { useState } from "react";

const FILTER_GROUPS = [
  {
    id: "category",
    title: "Category",
    options: [
      { value: "fine", label: "Fine Jewellery" },
      { value: "hiphop", label: "Hip Hop Jewellery" },
    ],
  },
  {
    id: "type",
    title: "Type",
    options: [
      { value: "ring", label: "Rings" },
      { value: "pendant", label: "Pendants" },
      { value: "bracelet", label: "Bracelets" },
      { value: "necklace", label: "Necklaces" },
      { value: "earring", label: "Earrings" },
      { value: "chain", label: "Chains" },
      { value: "grillz", label: "Grillz" },
    ],
  },
  {
    id: "stone",
    title: "Stone",
    options: [
      { value: "natural-colourless", label: "Natural Colourless" },
      { value: "natural-fancy", label: "Natural Fancy Colour" },
      { value: "cvd-colourless", label: "CVD Colourless" },
      { value: "cvd-fancy", label: "CVD Fancy Colour" },
      { value: "ruby", label: "Ruby" },
      { value: "emerald", label: "Emerald" },
      { value: "sapphire", label: "Sapphire" },
    ],
  },
  {
    id: "cut",
    title: "Cut",
    options: [
      { value: "round", label: "Round Brilliant" },
      { value: "oval", label: "Oval" },
      { value: "pear", label: "Pear" },
      { value: "cushion", label: "Cushion" },
      { value: "emerald-cut", label: "Emerald Cut" },
      { value: "princess", label: "Princess" },
      { value: "baguette", label: "Baguette" },
    ],
  },
  {
    id: "metal",
    title: "Metal",
    options: [
      { value: "18k-yellow", label: "18K Yellow Gold" },
      { value: "18k-white", label: "18K White Gold" },
      { value: "18k-rose", label: "18K Rose Gold" },
      { value: "14k", label: "14K Gold" },
      { value: "platinum", label: "Platinum" },
      { value: "silver", label: "925 Silver" },
    ],
  },
];

function FilterGroup({ group, checked, onChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        padding: "18px 0",
        borderBottom: "1px solid rgba(20,18,13,0.10)",
      }}
    >
      {/* Title */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "16px",
          fontWeight: 500,
          color: "#14120D",
          marginBottom: collapsed ? 0 : "16px",
          letterSpacing: ".04em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {group.title}
        <span style={{ fontSize: "18px", color: "#B8922A" }}>{collapsed ? "+" : "−"}</span>
      </div>

      {/* Options */}
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {group.options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "11px",
                fontWeight: 300,
                letterSpacing: ".04em",
                color: "#3A3628",
                cursor: "pointer",
                padding: "6px 0",
                transition: "color .3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#B8922A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3A3628")}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={checked.includes(opt.value)}
                onChange={() => onChange(group.id, opt.value)}
                style={{ accentColor: "#B8922A", cursor: "pointer" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopSidebar({ filters, onFiltersChange, priceMin, priceMax, onPriceChange, onClear, isOpen, onClose }) {
  const handleCheck = (groupId, value) => {
    const current = filters[groupId] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [groupId]: updated });
  };

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .shop-sidebar {
            position: fixed !important;
            top: 111px !important; left: 0 !important; bottom: 0 !important;
            width: 100% !important; max-width: 320px !important;
            z-index: 950 !important;
            transform: translateX(-100%) !important;
            transition: transform .4s !important;
            overflow-y: auto !important;
            padding: 24px !important;
          }
          .shop-sidebar.open { transform: translateX(0) !important; }
          .shop-sidebar-close { display: inline-flex !important; }
        }
      `}</style>

      <aside
        className={`shop-sidebar${isOpen ? " open" : ""}`}
        style={{
          position: "sticky",
          top: "120px",
          padding: "32px 28px",
          background: "#fff",
          border: "1px solid rgba(20,18,13,0.10)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "22px",
              color: "#14120D",
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            Filters
          </div>

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => onClose?.()}
            className="shop-sidebar-close"
            style={{
              display: "none",
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              border: "1px solid rgba(20,18,13,0.10)",
              background: "#fff",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "#14120D",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={onClear}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid rgba(20,18,13,0.10)",
              fontSize: "9px",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "#7A7060",
              cursor: "pointer",
              transition: "all .3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#14120D";
              e.currentTarget.style.color = "#FBF9F5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#7A7060";
            }}
          >
            Reset
          </button>
        </div>

        {/* Filter groups */}
        {FILTER_GROUPS.map((group) => (
          <FilterGroup
            key={group.id}
            group={group}
            checked={filters[group.id] || []}
            onChange={handleCheck}
          />
        ))}

        {/* Price Range */}
        <div style={{ padding: "18px 0", borderBottom: "1px solid rgba(20,18,13,0.10)" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#14120D",
              marginBottom: "16px",
              letterSpacing: ".04em",
            }}
          >
            Price Range (USD)
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {["min", "max"].map((key) => (
              <input
                key={key}
                type="number"
                placeholder={key === "min" ? "Min" : "Max"}
                value={key === "min" ? priceMin : priceMax}
                onChange={(e) => onPriceChange(key, e.target.value)}
                aria-label={`${key === "min" ? "Minimum" : "Maximum"} price`}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: "11px",
                  color: "#14120D",
                  background: "#FBF9F5",
                  border: "1px solid rgba(20,18,13,0.10)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#B8922A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,18,13,0.10)")}
              />
            ))}
          </div>
        </div>

        {/* Clear All */}
        <button
          onClick={onClear}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            background: "transparent",
            border: "1px solid rgba(20,18,13,0.10)",
            fontSize: "10px",
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: "#7A7060",
            cursor: "pointer",
            transition: "all .3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#14120D";
            e.currentTarget.style.color = "#FBF9F5";
            e.currentTarget.style.borderColor = "#14120D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#7A7060";
            e.currentTarget.style.borderColor = "rgba(20,18,13,0.10)";
          }}
        >
          Clear All Filters
        </button>
      </aside>
    </>
  );
}
