"use client";

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
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* Mobile filter button */}
      <button
        onClick={onToggleFilters}
        style={{
          display: "none", // shown via media query override
          padding: "10px 20px",
          background: "#14120D",
          color: "#FBF9F5",
          border: "none",
          cursor: "pointer",
          fontSize: "10px",
          letterSpacing: ".24em",
          textTransform: "uppercase",
          alignItems: "center",
          gap: "10px",
        }}
        className="mobile-filter-btn"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 2H11M2 6H10M3 10H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Filters
      </button>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-filter-btn { display: inline-flex !important; }
        }
      `}</style>

      {/* Result count */}
      <div style={{ fontSize: "11px", letterSpacing: ".08em", color: "#7A7060" }}>
        <strong style={{ color: "#14120D", fontWeight: 500 }}>{count}</strong> pieces
      </div>

      {/* Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: "10px 36px 10px 16px",
            fontFamily: "inherit",
            fontSize: "11px",
            fontWeight: 400,
            color: "#14120D",
            background: "#fff",
            border: "1px solid rgba(20,18,13,0.10)",
            cursor: "pointer",
            letterSpacing: ".08em",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%231C1A14' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#B8922A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(20,18,13,0.10)")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
