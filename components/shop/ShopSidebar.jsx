"use client";

import { useEffect, useRef, useState } from "react";

function FilterGroup({ group, checked, onChange }) {
  const isVisualGrid = group.id === "metal" || group.id === "shape" || group.id === "style";
  const [mobileOpen, setMobileOpen] = useState(true);

  return (
    <div
      style={{
        padding: "18px 0",
        borderBottom: "1px solid rgba(10,22,40,0.10)",
      }}
    >
      {/* Title */}
      <button
        type="button"
        style={{
          width: "100%",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "16px",
          fontWeight: 500,
          color: "#0A1628",
          marginBottom: "16px",
          letterSpacing: ".04em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
        onClick={() => setMobileOpen((current) => !current)}
      >
        <span>{group.title}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#6A6A6A", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {checked.length ? checked.join(", ") : "-"}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            style={{
              color: "#0A1628",
              transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .25s ease",
              flexShrink: 0,
            }}
          >
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div
        className={`${isVisualGrid ? "shop-filter-grid" : ""}${mobileOpen ? " shop-filter-group-open" : " shop-filter-group-closed"}`}
        style={
          isVisualGrid
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }
            : { display: mobileOpen ? "flex" : "none", flexDirection: "column", gap: "10px" }
        }
      >
        {group.options.map((opt) => (
          <label
            key={opt.value}
            className={isVisualGrid ? `shop-filter-tile${checked.includes(opt.value) ? " selected" : ""}` : undefined}
            style={{
              display: "flex",
              alignItems: isVisualGrid ? "center" : "center",
              justifyContent: isVisualGrid ? "center" : undefined,
              flexDirection: isVisualGrid ? "column" : "row",
              gap: "10px",
              fontSize: "11px",
              fontWeight: 300,
              letterSpacing: ".04em",
              color: "#253246",
              cursor: "pointer",
              padding: isVisualGrid ? "12px 10px" : "6px 0",
              border: isVisualGrid ? "1px solid rgba(10,22,40,0.08)" : "none",
              borderRadius: isVisualGrid ? "16px" : "0",
              background: isVisualGrid ? "#F8F8FB" : "transparent",
              minHeight: isVisualGrid ? "92px" : undefined,
              transition: "color .3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0A1628")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#253246")}
          >
            <input
              type="checkbox"
              value={opt.value}
              checked={checked.includes(opt.value)}
              onChange={() => onChange(group.id, opt.value)}
              style={{
                accentColor: "#0A1628",
                cursor: "pointer",
                position: isVisualGrid ? "absolute" : "static",
                opacity: isVisualGrid ? 0 : 1,
                pointerEvents: isVisualGrid ? "none" : "auto",
              }}
            />
            {opt.iconUrl ? (
              <img
                src={opt.iconUrl}
                alt={opt.label}
                style={{ width: isVisualGrid ? "34px" : "16px", height: isVisualGrid ? "34px" : "16px", objectFit: "contain", flexShrink: 0 }}
              />
            ) : null}
            <span style={{ textAlign: isVisualGrid ? "center" : "left", lineHeight: 1.25 }}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ShopSidebar({ filterGroups, filters, onFiltersChange, priceMin, priceMax, onPriceChange, onClear, isOpen, onClose, topOffset = 146 }) {
  const sidebarRef = useRef(null);
  const selectedCount = Object.values(filters).reduce((sum, values) => sum + (Array.isArray(values) ? values.length : 0), 0);

  const handleCheck = (groupId, value) => {
    const current = filters[groupId] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [groupId]: updated });
  };

  useEffect(() => {
    const node = sidebarRef.current;
    if (!isOpen || !node) return;

    const handleWheel = (event) => {
      const nextScrollTop = node.scrollTop + event.deltaY;
      const maxScrollTop = node.scrollHeight - node.clientHeight;
      if (maxScrollTop <= 0) return;

      if ((event.deltaY < 0 && node.scrollTop > 0) || (event.deltaY > 0 && node.scrollTop < maxScrollTop)) {
        event.preventDefault();
        event.stopPropagation();
        node.scrollTop = Math.max(0, Math.min(maxScrollTop, nextScrollTop));
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  return (
    <>
      <style>{`
        .shop-sidebar {
          position: fixed !important;
          top: var(--shop-sidebar-top, 146px) !important;
          left: 0 !important;
          bottom: 0 !important;
          height: calc(100dvh - var(--shop-sidebar-top, 146px)) !important;
          width: 100% !important;
          max-width: 360px !important;
          z-index: 1100 !important;
          transform: translateX(-100%) !important;
          transition: transform .4s !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
          padding: 24px !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12) !important;
        }
        .shop-sidebar.open { transform: translateX(0) !important; }
        .shop-sidebar-close { display: inline-flex !important; }
        .shop-filter-tile.selected {
          border-color: #111111 !important;
          box-shadow: inset 0 0 0 1px #111111;
          background: #ffffff !important;
          color: #0A1628 !important;
        }

        @media (max-width: 768px) {
          .shop-sidebar {
            top: auto !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: min(78dvh, 720px) !important;
            transform: translateY(100%) !important;
            border-radius: 28px 28px 0 0 !important;
            padding: 16px 18px 22px !important;
            box-shadow: 0 -18px 48px rgba(10,22,40,0.18) !important;
          }
          .shop-sidebar.open { transform: translateY(0) !important; }
          .shop-filter-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .shop-filter-tile {
            min-height: 78px !important;
            padding: 10px 6px !important;
            gap: 8px !important;
            border-radius: 14px !important;
            font-size: 10px !important;
            letter-spacing: .01em !important;
          }
          .shop-filter-tile img {
            width: 24px !important;
            height: 24px !important;
          }
          .shop-filter-group-closed {
            display: none !important;
          }
          .shop-filter-group-open {
            display: grid !important;
          }
          .shop-sidebar-sticky-cta {
            position: sticky;
            bottom: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 16%, #fff 100%);
            padding-top: 16px;
            margin-top: 18px;
          }
        }
      `}</style>

      <aside
        ref={sidebarRef}
        className={`shop-sidebar${isOpen ? " open" : ""}`}
        style={{
          padding: "32px 28px",
          background: "#fff",
          border: "1px solid rgba(10,22,40,0.10)",
          ["--shop-sidebar-top"]: `${topOffset}px`,
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
              color: "#0A1628",
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            Filters
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "8px 14px",
                background: "#F3F4F8",
                borderRadius: "999px",
                fontSize: "11px",
                color: "#6A6A6A",
              }}
            >
              Filters Selected <strong style={{ color: "#0A1628", fontWeight: 500 }}>{selectedCount}</strong>
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
                border: "1px solid rgba(10,22,40,0.10)",
                background: "#fff",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                color: "#0A1628",
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
                border: "1px solid rgba(10,22,40,0.10)",
                fontSize: "9px",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "#6A6A6A",
                cursor: "pointer",
                transition: "all .3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0A1628";
                e.currentTarget.style.color = "#FAFBFD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6A6A6A";
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Filter groups */}
        {filterGroups.map((group) => (
          <FilterGroup
            key={group.id}
            group={group}
            checked={filters[group.id] || []}
            onChange={handleCheck}
          />
        ))}

        {/* Price Range */}
        <div style={{ padding: "18px 0", borderBottom: "1px solid rgba(10,22,40,0.10)" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#0A1628",
              marginBottom: "16px",
              letterSpacing: ".04em",
            }}
          >
            Price Range (USD)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", alignItems: "stretch" }}>
            {["min", "max"].map((key) => (
              <input
                key={key}
                type="number"
                placeholder={key === "min" ? "Min" : "Max"}
                value={key === "min" ? priceMin : priceMax}
                onChange={(e) => onPriceChange(key, e.target.value)}
                aria-label={`${key === "min" ? "Minimum" : "Maximum"} price`}
                style={{
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  fontSize: "11px",
                  color: "#0A1628",
                  background: "#FAFBFD",
                  border: "1px solid rgba(10,22,40,0.10)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0A1628")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(10,22,40,0.10)")}
              />
            ))}
          </div>
        </div>

        {/* Clear All */}
        <div className="shop-sidebar-sticky-cta">
          <button
            onClick={() => onClose?.()}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "16px 18px",
              background: "#0A1628",
              border: "1px solid #0A1628",
              borderRadius: "999px",
              fontSize: "12px",
              letterSpacing: ".04em",
              color: "#FAFBFD",
              cursor: "pointer",
              transition: "all .3s",
              fontWeight: 500,
            }}
          >
            View {selectedCount || ""} Results
          </button>
        </div>
      </aside>
    </>
  );
}
