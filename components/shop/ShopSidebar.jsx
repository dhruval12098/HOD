"use client";

function FilterGroup({ group, checked, onChange }) {

  return (
    <div
      style={{
        padding: "18px 0",
        borderBottom: "1px solid rgba(10,22,40,0.10)",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "16px",
          fontWeight: 500,
          color: "#0A1628",
          marginBottom: "16px",
          letterSpacing: ".04em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {group.title}
        <span style={{ fontSize: "18px", color: "#0A1628" }}>-</span>
      </div>

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
              color: "#253246",
              cursor: "pointer",
              padding: "6px 0",
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
              style={{ accentColor: "#0A1628", cursor: "pointer" }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ShopSidebar({ filterGroups, filters, onFiltersChange, priceMin, priceMax, onPriceChange, onClear, isOpen, onClose, topOffset = 146 }) {
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
        .shop-sidebar {
          position: fixed !important;
          top: var(--shop-sidebar-top, 146px) !important;
          left: 0 !important;
          bottom: 0 !important;
          height: calc(100dvh - var(--shop-sidebar-top, 146px)) !important;
          width: 100% !important;
          max-width: 360px !important;
          z-index: 950 !important;
          transform: translateX(-100%) !important;
          transition: transform .4s !important;
          overflow-y: auto !important;
          padding: 24px !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12) !important;
        }
        .shop-sidebar.open { transform: translateX(0) !important; }
        .shop-sidebar-close { display: inline-flex !important; }
      `}</style>

      <aside
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
        <button
          onClick={onClear}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            background: "transparent",
            border: "1px solid rgba(10,22,40,0.10)",
            fontSize: "10px",
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: "#6A6A6A",
            cursor: "pointer",
            transition: "all .3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0A1628";
            e.currentTarget.style.color = "#FAFBFD";
            e.currentTarget.style.borderColor = "#0A1628";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6A6A6A";
            e.currentTarget.style.borderColor = "rgba(10,22,40,0.10)";
          }}
        >
          Clear All Filters
        </button>
      </aside>
    </>
  );
}
