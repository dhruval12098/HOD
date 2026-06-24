"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import ShopSidebar from "./ShopSidebar";
import ShopToolbar from "./ShopToolbar";
import { useWishlistStore } from "@/lib/hooks/useWishlistStore";
import { getProductKey } from "@/lib/product-keys";

/**
 * @typedef {{ id: string; title: string; options: { value: string; label: string, iconUrl?: string | null }[] }} ProductGridFilterGroup
 */

/**
 * @typedef {{ id: string; title?: string | null; imageUrl: string; imageAlt?: string | null; linkUrl?: string | null; insertAfter: number; displayOrder: number }} CategoryGridPoster
 */
function CategoryGridPosterCard({ poster }) {
  const image = (
    <Image
      src={poster.imageUrl}
      alt={poster.imageAlt || poster.title || "Category poster"}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
      style={{
        objectFit: "cover",
        objectPosition: "center center",
        transition: "transform .75s cubic-bezier(.16,1,.3,1)",
      }}
    />
  );

  const content = (
    <div
      className="shop-product-card shop-grid-poster-card"
      style={{
        cursor: poster.linkUrl ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        background: "#FFFFFF",
        border: "1px solid rgba(10,22,40,0.06)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="shop-product-card-visual"
        style={{
          height: "100%",
          minHeight: "418px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8F8FA 100%)",
        }}
      >
        {image}
      </div>
    </div>
  );

  if (!poster.linkUrl) return content;

  return (
    <a href={poster.linkUrl} style={{ textDecoration: "none", color: "inherit" }} aria-label={poster.title || "Open category poster"}>
      {content}
    </a>
  );
}

function buildGridItems(products, posters) {
  const activePosters = (posters || [])
    .filter((poster) => poster?.imageUrl)
    .sort((left, right) => (left.insertAfter - right.insertAfter) || (left.displayOrder - right.displayOrder));

  if (!activePosters.length) return products.map((product) => ({ type: "product", product }));

  const posterBuckets = new Map();
  activePosters.forEach((poster) => {
    const key = Math.max(0, Number(poster.insertAfter) || 0);
    const bucket = posterBuckets.get(key) || [];
    bucket.push(poster);
    posterBuckets.set(key, bucket);
  });

  const items = [];
  const addPosters = (position) => {
    (posterBuckets.get(position) || []).forEach((poster) => items.push({ type: "poster", poster }));
  };

  addPosters(0);
  products.forEach((product, index) => {
    items.push({ type: "product", product });
    addPosters(index + 1);
  });

  return items;
}

/**
 * @param {{
 *   products: any[]
 *   sourceProducts?: any[]
 *   initialFilters?: Record<string, string[]>
 *   filterGroups?: ProductGridFilterGroup[]
 *   gridPosters?: CategoryGridPoster[]
 *   onEnquire: (name?: string) => void
 * }} props
 */
export default function ProductGrid({ products, sourceProducts = products, initialFilters = {}, filterGroups: externalFilterGroups = [], gridPosters = [], onEnquire }) {
  const { wishlist, toggle } = useWishlistStore();
  const [filters, setFilters] = useState(initialFilters);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarTopOffset = 146;

  const handleWishlist = (product) => {
    toggle(getProductKey(product));
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

  const baseFilterGroups = useMemo(() => {
    const unique = (values) => Array.from(new Set(values.filter(Boolean)));
    const titleCase = (value) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

    return [
      {
        id: "category",
        title: "Category",
        options: unique(sourceProducts.map((product) => product.mainCategorySlug || product.category)).map((value) => {
          const match = sourceProducts.find((product) => (product.mainCategorySlug || product.category) === value);
          return { value, label: match?.mainCategoryName || titleCase(value) };
        }),
      },
      {
        id: "type",
        title: "Type",
        options: unique(sourceProducts.map((product) => product.type)).map((value) => ({ value, label: titleCase(value) })),
      },
      {
        id: "shape",
        title: "Shape",
        options: unique(sourceProducts.flatMap((product) => product.shapeOptions?.map((shape) => shape.slug) || [])).map((value) => {
          const match = sourceProducts.flatMap((product) => product.shapeOptions || []).find((shape) => shape.slug === value);
          return { value, label: match?.name || titleCase(value) };
        }),
      },
      {
        id: "metal",
        title: "Metal",
        options: unique(sourceProducts.flatMap((product) => product.metalsFull?.map((metal) => metal.slug) || [])).map((value) => {
          const match = sourceProducts.flatMap((product) => product.metalsFull || []).find((metal) => metal.slug === value);
          return { value, label: match?.displayLabel || match?.name || titleCase(value) };
        }),
      },
      {
        id: "certificate",
        title: "Certificate",
        options: unique(sourceProducts.flatMap((product) => product.certificateNames || [])).map((value) => ({ value, label: value })),
      },
      {
        id: "style",
        title: "Style",
        options: unique(sourceProducts.map((product) => product.styleSlug)).map((value) => {
          const match = sourceProducts.find((product) => product.styleSlug === value);
          return { value, label: match?.styleName || titleCase(value) };
        }),
      },
    ].filter((group) => group.options.length > 0);
  }, [sourceProducts]);

  const filterGroups = useMemo(() => {
    const merged = [...externalFilterGroups, ...baseFilterGroups];
    const seen = new Set();
    return merged.filter((group) => {
      if (!group.options?.length) return false;
      if (seen.has(group.id)) return false;
      seen.add(group.id);
      return true;
    });
  }, [externalFilterGroups, baseFilterGroups]);

  const filtered = useMemo(() => {
    const pMin = parseFloat(priceMin) || 0;
    const pMax = parseFloat(priceMax) || Infinity;

      const list = products.filter((product) => {
      const productCategoryValue = product.mainCategorySlug || product.category;
      if (filters.category?.length && !filters.category.includes(productCategoryValue)) return false;
      if (
        filters.subcategory?.length &&
        !filters.subcategory.includes(product.subcategorySlug) &&
        !(product.linkedSubcategorySlugs || []).some((slug) => filters.subcategory.includes(slug))
      ) return false;
      if (
        filters.option?.length &&
        !filters.option.includes(product.optionSlug) &&
        !(product.linkedOptionSlugs || []).some((slug) => filters.option.includes(slug))
      ) return false;
      if (filters.shape?.length && !(product.shapeOptions || []).some((shape) => filters.shape.includes(shape.slug))) return false;
      if (filters.style?.length && !filters.style.includes(product.styleSlug)) return false;
      if (filters.type?.length && !filters.type.includes(product.type)) return false;
      if (filters.metal?.length && !product.metalsFull.some((metal) => filters.metal.includes(metal.slug))) return false;
      if (filters.certificate?.length && !(product.certificateNames || []).some((certificate) => filters.certificate.includes(certificate))) return false;
      if (filters.size?.length && !(product.ringSizeNames || []).some((size) => filters.size.includes(size))) return false;
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
  }, [filters, priceMin, priceMax, sort, products]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }

    const lenis = typeof window !== "undefined" ? window.__lenis : null;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "pan-y";
    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    };
  }, [sidebarOpen]);

  return (
    <>
      <style>{`
        .shop-grid-layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 52px 100px;
          display: block;
        }
        @media (max-width: 1024px) {
          .shop-grid-layout {
            padding: 40px 28px 70px !important;
          }
        }
        @media (max-width: 768px) {
          .shop-grid-layout { padding: 28px 10px 56px !important; }
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
          align-items: start;
          overflow: visible;
          padding-bottom: 96px;
        }
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
            padding-bottom: 24px !important;
          }
        }
      `}</style>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10,22,40,0.45)",
            zIndex: 1090,
          }}
        />
      )}

      <div className="shop-grid-layout">
        <ShopSidebar
          filterGroups={filterGroups}
          filters={filters}
          onFiltersChange={setFilters}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceChange={handlePriceChange}
          onClear={handleClear}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          topOffset={sidebarOpen ? 0 : sidebarTopOffset}
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
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "#0A1628", marginBottom: "14px", fontWeight: 400 }}>
                No pieces match your filters
              </h3>
              <p style={{ color: "#6A6A6A", fontSize: "13px", marginBottom: "24px" }}>
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
                  color: "#0A1628",
                  background: "transparent",
                  padding: "15px 32px",
                  border: "1px solid #0A1628",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all .4s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0A1628";
                  e.currentTarget.style.color = "#FAFBFD";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#0A1628";
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {buildGridItems(filtered, gridPosters).map((item) => item.type === "poster" ? (
                <CategoryGridPosterCard key={`poster-${item.poster.id}`} poster={item.poster} />
              ) : (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  wishlisted={wishlist.includes(getProductKey(item.product))}
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
