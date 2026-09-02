"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import ShopToolbar from "./ShopToolbar";
import CategoryQuickFilters from "./CategoryQuickFilters";
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
 *   initialPage?: number
 *   filterGroups?: ProductGridFilterGroup[]
 *   masterShapeOptions?: { value: string; label: string; iconUrl?: string | null; displayOrder: number }[]
 *   gridPosters?: CategoryGridPoster[]
 *   onEnquire: (name?: string) => void
 * }} props
 */
export default function ProductGrid({ products, sourceProducts = products, initialFilters = {}, initialPage = 1, filterGroups: externalFilterGroups = [], masterShapeOptions = [], gridPosters = [], onEnquire }) {
  const { wishlist, toggle } = useWishlistStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("featured");

  const pageSize = 24;

  const pageHref = (nextPage) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    window.history.pushState(null, "", pageHref(nextPage));
    document.querySelector(".shop-grid-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    ["metal", "shape"].forEach((key) => {
      const value = nextFilters[key]?.[0];
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    window.history.pushState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const handleQuickFilterChange = (key, value) => {
    const nextFilters = { ...filters };
    if (value) nextFilters[key] = [value];
    else delete nextFilters[key];
    handleFiltersChange(nextFilters);
  };

  const handleWishlist = (product) => {
    toggle(getProductKey(product));
  };

  const handleClear = () => {
    const nextFilters = { ...filters };
    delete nextFilters.metal;
    delete nextFilters.shape;
    handleFiltersChange(nextFilters);
    setSort("featured");
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
    window.history.replaceState(null, "", pageHref(1));
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
  }, [filters, sort, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const resolvedPage = Math.min(page, totalPages);
  const paginatedProducts = filtered.slice((resolvedPage - 1) * pageSize, resolvedPage * pageSize);

  const metalOptions = filterGroups.find((group) => group.id === "metal")?.options.map((option) => {
    const metal = sourceProducts.flatMap((product) => product.metalsFull || []).find((entry) => entry.slug === option.value);
    return { ...option, color: metal?.colorHex || null };
  }) || [];
  const availableShapeSlugs = new Set(sourceProducts.flatMap((product) => product.shapeOptions?.map((shape) => shape.slug) || []));
  const shapeOptions = (masterShapeOptions.length > 0
    ? masterShapeOptions
    : filterGroups.find((group) => group.id === "shape")?.options || [])
    .filter((option) => availableShapeSlugs.has(option.value))
    .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0));

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

      <div className="shop-grid-layout">
        <div>
          <ShopToolbar
            count={filtered.length}
            sort={sort}
            onSortChange={handleSortChange}
            quickFilters={<CategoryQuickFilters metalOptions={metalOptions} shapeOptions={shapeOptions} selectedMetal={filters.metal?.[0] || ""} selectedShape={filters.shape?.[0] || ""} onChange={handleQuickFilterChange} />}
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
              {buildGridItems(paginatedProducts, resolvedPage === 1 ? gridPosters : []).map((item) => item.type === "poster" ? (
                <CategoryGridPosterCard key={`poster-${item.poster.id}`} poster={item.poster} />
              ) : (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  wishlisted={wishlist.includes(getProductKey(item.product))}
                  onWishlist={handleWishlist}
                  onEnquire={onEnquire}
                  selectedMetalSlug={filters.metal?.[0] || ""}
                />
              ))}
            </div>
          )}

          {filtered.length > pageSize ? (
            <nav aria-label="Product pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "0 0 72px" }}>
              {resolvedPage > 1 ? (
                <Link
                  href={pageHref(resolvedPage - 1)}
                  onClick={(event) => { event.preventDefault(); changePage(resolvedPage - 1); }}
                  style={{ border: "1px solid rgba(10,22,40,.2)", borderRadius: "999px", padding: "11px 20px", color: "#0A1628", textDecoration: "none", fontSize: "12px" }}
                >
                  Previous
                </Link>
              ) : null}
              <span style={{ color: "#6A6A6A", fontSize: "12px" }}>Page {resolvedPage} of {totalPages}</span>
              {resolvedPage < totalPages ? (
                <Link
                  href={pageHref(resolvedPage + 1)}
                  onClick={(event) => { event.preventDefault(); changePage(resolvedPage + 1); }}
                  style={{ border: "1px solid rgba(10,22,40,.2)", borderRadius: "999px", padding: "11px 20px", color: "#0A1628", textDecoration: "none", fontSize: "12px" }}
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </>
  );
}
