"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/data/products";
import ProductCard from "./ProductCard";
import ShopSidebar from "./ShopSidebar";
import ShopToolbar from "./ShopToolbar";

export default function ProductGrid({ onEnquire }) {
  const [filters, setFilters] = useState({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("featured");
  const [wishlist, setWishlist] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClear = () => {
    setFilters({});
    setPriceMin("");
    setPriceMax("");
    setSort("featured");
  };

  const handlePriceChange = (key, value) => {
    if (key === "min") setPriceMin(value);
    else setPriceMax(value);
  };

  const filtered = useMemo(() => {
    const pMin = parseFloat(priceMin) || 0;
    const pMax = parseFloat(priceMax) || Infinity;

    const list = PRODUCTS.filter((product) => {
      if (filters.category?.length && !filters.category.includes(product.category)) return false;
      if (filters.type?.length && !filters.type.includes(product.type)) return false;
      if (filters.stone?.length && !filters.stone.includes(product.stone)) return false;
      if (filters.cut?.length && !filters.cut.includes(product.cut)) return false;
      if (filters.metal?.length && !product.metals.some((metal) => filters.metal.includes(metal))) return false;
      if (product.priceFrom < pMin || product.priceFrom > pMax) return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.priceFrom - b.priceFrom;
        case "price-high":
          return b.priceFrom - a.priceFrom;
        case "carat-high":
          return parseFloat(b.carat) - parseFloat(a.carat);
        case "carat-low":
          return parseFloat(a.carat) - parseFloat(b.carat);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    return list;
  }, [filters, priceMin, priceMax, sort]);

  return (
    <>
      <style>{`
        .shop-grid-layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 52px 100px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 50px;
          align-items: flex-start;
        }
        @media (max-width: 1024px) {
          .shop-grid-layout {
            grid-template-columns: 1fr !important;
            padding: 40px 28px 70px !important;
          }
        }
        @media (max-width: 640px) {
          .shop-grid-layout { padding: 40px 20px 70px !important; }
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            top: "111px",
            background: "rgba(20,18,13,0.45)",
            zIndex: 940,
          }}
        />
      )}

      <div className="shop-grid-layout">
        <ShopSidebar
          filters={filters}
          onFiltersChange={setFilters}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceChange={handlePriceChange}
          onClear={handleClear}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div>
          <ShopToolbar
            count={filtered.length}
            sort={sort}
            onSortChange={setSort}
            onToggleFilters={() => setSidebarOpen((open) => !open)}
          />

          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "#14120D", marginBottom: "14px", fontWeight: 400 }}>
                No pieces match your filters
              </h3>
              <p style={{ color: "#7A7060", fontSize: "13px", marginBottom: "24px" }}>
                Try adjusting or clearing your selections.
              </p>
              <button
                onClick={handleClear}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: ".28em",
                  color: "#14120D",
                  background: "transparent",
                  padding: "15px 32px",
                  border: "1px solid #14120D",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all .4s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#14120D";
                  e.currentTarget.style.color = "#FBF9F5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#14120D";
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={wishlist.includes(product.id)}
                  onWishlist={handleWishlist}
                  onEnquire={onEnquire}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
