"use client";
import { useState } from "react";
import { formatUsdNumber } from "@/lib/money";
import { METAL_META } from "@/lib/data/product-config";

// ── Gem SVG renderer ──────────────────────────────────────────────────────────
export function GemSVG({ style, size = 110, color = "#20304A" }) {
  const c = color;
  const cL = "#0A1628";
  const s = size;

  switch (style) {
    case "pear":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <path d={`M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z`} stroke={cL} strokeWidth="1" fill={`${c}22`} />
          <path d={`M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z`} stroke={cL} strokeWidth=".5" fill={`${c}14`} />
          <circle cx="48" cy="45" r="3" fill="#fff" opacity=".6" />
        </svg>
      );
    case "oval":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <ellipse cx="55" cy="55" rx="22" ry="32" stroke={cL} strokeWidth="1" fill={`${c}22`} />
          <ellipse cx="55" cy="55" rx="14" ry="22" stroke={cL} strokeWidth=".5" fill={`${c}14`} />
          <circle cx="50" cy="42" r="4" fill="#fff" opacity=".6" />
        </svg>
      );
    case "emerald":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <rect x="32" y="25" width="46" height="60" stroke={cL} strokeWidth="1" fill={`${c}22`} />
          <rect x="38" y="33" width="34" height="44" stroke={cL} strokeWidth=".5" fill={`${c}14`} />
          <rect x="44" y="41" width="22" height="28" stroke={cL} strokeWidth=".3" fill="none" />
        </svg>
      );
    case "trilogy":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <polygon points="55,18 73,30 68,90 42,90 37,30" stroke={cL} strokeWidth="1" fill={`${c}33`} />
          <polygon points="28,40 38,48 33,80 18,80 13,48" stroke={cL} strokeWidth="0.8" fill="#20304A33" />
          <polygon points="82,40 92,48 87,80 72,80 67,48" stroke={cL} strokeWidth="0.8" fill="#20304A33" />
        </svg>
      );
    case "row":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <rect x="12" y="45" width="86" height="20" rx="10" stroke={cL} strokeWidth="1" fill={`${c}22`} />
          {[22, 38, 55, 72, 88].map((cx) => (
            <circle key={cx} cx={cx} cy="55" r="5" fill={`${c}55`} stroke={cL} strokeWidth=".5" />
          ))}
        </svg>
      );
    case "eternity":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <circle cx="55" cy="55" r="32" stroke={cL} strokeWidth="1" fill="none" />
          <circle cx="55" cy="55" r="26" stroke={cL} strokeWidth="0.5" fill="none" opacity=".4" />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const x = 55 + Math.cos(a) * 29;
            const y = 55 + Math.sin(a) * 29;
            return <circle key={i} cx={x} cy={y} r="3.4" fill={`${c}66`} stroke={cL} strokeWidth=".4" />;
          })}
        </svg>
      );
    case "chain":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          {[22, 40, 58, 76].map((cy) => (
            <g key={cy}>
              <ellipse cx="55" cy={cy} rx="22" ry="8" stroke={cL} strokeWidth="1" fill={`${c}22`} />
              <rect x="45" y={cy - 2} width="20" height="4" fill={c} />
            </g>
          ))}
        </svg>
      );
    case "tennis":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          {[15, 30, 45, 60, 75, 90].map((cx) => (
            <circle key={cx} cx={cx} cy="55" r="6" fill={`${c}55`} stroke={cL} strokeWidth=".6" />
          ))}
          <path d="M15 55 L90 55" stroke={cL} strokeWidth="0.6" />
        </svg>
      );
    case "grillz":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <path d="M20 40 L90 40 L85 80 L25 80 Z" stroke={cL} strokeWidth="1" fill={`${c}33`} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={25 + i * 11} y="45" width="8" height="28" fill={`${c}55`} stroke={cL} strokeWidth=".4" />
          ))}
        </svg>
      );
    case "cross":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <rect x="48" y="20" width="14" height="70" fill={`${c}33`} stroke={cL} strokeWidth="1" />
          <rect x="30" y="42" width="50" height="14" fill={`${c}33`} stroke={cL} strokeWidth="1" />
          {[26, 42, 58, 74].map((y) => (
            <circle key={y} cx="55" cy={y} r="3" fill={c} opacity=".7" />
          ))}
        </svg>
      );
    case "signet":
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <rect x="22" y="38" width="66" height="34" rx="4" stroke={cL} strokeWidth="1" fill={`${c}22`} />
          <rect x="30" y="44" width="50" height="22" rx="2" stroke={cL} strokeWidth=".6" fill={`${c}33`} />
          {[40, 55, 70].map((x) => (
            <rect key={x} x={x - 4} y="50" width="8" height="10" fill={c} opacity=".7" />
          ))}
        </svg>
      );
    default: // round
      return (
        <svg width={s} height={s} viewBox="0 0 110 110" fill="none">
          <polygon points="55,15 85,35 77,85 33,85 25,35" stroke={cL} strokeWidth="1" fill={`${c}22`} />
          <polygon points="55,25 75,40 69,75 41,75 35,40" stroke={cL} strokeWidth=".5" fill={`${c}14`} />
          <line x1="55" y1="15" x2="33" y2="85" stroke={cL} strokeWidth=".4" opacity=".5" />
          <line x1="55" y1="15" x2="77" y2="85" stroke={cL} strokeWidth=".4" opacity=".5" />
          <line x1="25" y1="35" x2="85" y2="35" stroke={cL} strokeWidth=".4" opacity=".5" />
          <circle cx="48" cy="35" r="3" fill="#fff" opacity=".7" />
        </svg>
      );
  }
}

// ── ProductCard ───────────────────────────────────────────────────────────────
const LARGE_GEM_STYLES = ["chain", "tennis", "grillz", "cross"];

function getMetalSwatches(product) {
  if (!Array.isArray(product?.metalsFull)) return [];

  return product.metalsFull
    .map((metal) => ({
      id: metal.id || metal.slug,
      metalId: metal.id || null,
      slug: metal.slug || "",
      name: metal.name || metal.slug || "Metal",
      color:
        metal.colorHex ||
        METAL_META[metal.slug]?.color ||
        METAL_META[(metal.name || "").toLowerCase().replace(/\s+/g, "-")]?.color ||
        null,
    }))
    .filter((metal) => metal.color);
}

function getMetalImages(product, metalSwatch) {
  if (!metalSwatch?.metalId || !Array.isArray(product?.metalMediaRows)) return [];

  const match = product.metalMediaRows.find((entry) => entry.metal_id === metalSwatch.metalId);
  const fallback = product.defaultMetalMedia && product.defaultMetalMedia.metal_id === metalSwatch.metalId
    ? product.defaultMetalMedia
    : match;
  const source = match || fallback;
  if (!source) return [];

  return [
    source.image_1_path,
    source.image_2_path,
    source.image_3_path,
    source.image_4_path,
  ].filter(Boolean);
}

export default function ProductCard({ product, wishlisted, onWishlist, onEnquire, forceLight = false }) {
  const isDark = !forceLight && product.category === "hiphop";
  const tag = product.isNew ? "New" : product.featured ? "Featured" : "Signature";
  const gemSize = LARGE_GEM_STYLES.includes(product.gemStyle) ? 140 : 110;
  const metalSwatches = getMetalSwatches(product);
  const [activeMetalId, setActiveMetalId] = useState("");

  const activeMetalSwatch = metalSwatches.find((metal) => metal.id === activeMetalId) || metalSwatches[0] || null;
  const activeImageUrl = getMetalImages(product, activeMetalSwatch)[0] || product.imageUrl;

  const visualBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(10,22,40,0.06)";
  const namColor = isDark ? "#FFFFFF" : "#0A1628";

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .shop-product-card-visual {
          height: 208px !important;
        }
        .shop-product-card-info {
          padding: 12px 12px 16px !important;
          gap: 4px !important;
        }
        .shop-product-card-title {
          font-size: 14px !important;
          line-height: 1.12 !important;
          letter-spacing: .01em !important;
        }
        .shop-product-card-title-wrap {
          min-height: 36px !important;
        }
        .shop-product-card-swatches {
          gap: 8px !important;
        }
        .shop-product-card-bottom {
          padding-top: 8px !important;
        }
        .shop-product-card-price {
          font-size: 14px !important;
        }
      }
    `}</style>
    <a
      className="shop-product-card"
      href={`/shop/${product.slug}`}
      style={{
        cursor: "pointer",
        position: "relative",
        transition: "transform .5s cubic-bezier(.2,.7,.3,1)",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        const glow = e.currentTarget.querySelector(".card-glow");
        if (glow) glow.style.opacity = "1";
        const gem = e.currentTarget.querySelector(".card-gem");
        if (gem) gem.style.transform = "scale(1.08) rotate(-3deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        const glow = e.currentTarget.querySelector(".card-glow");
        if (glow) glow.style.opacity = "0";
        const gem = e.currentTarget.querySelector(".card-gem");
        if (gem) gem.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      {/* Visual */}
      <div
        className="shop-product-card-visual"
        style={{
          height: "300px",
          background: isDark
            ? "linear-gradient(135deg, #0A1628 0%, #111F34 100%)"
            : "linear-gradient(135deg, #FFFFFF 0%, #F8F8FA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          borderRadius: "18px",
          border: `1px solid ${visualBorder}`,
          boxShadow: isDark ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.65)",
        }}
      >
        {/* Glow overlay */}
        <div
          className="card-glow"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(10,22,40,0.08), transparent 70%)",
            opacity: 0,
            transition: "opacity .5s",
          }}
        />

        {/* Tag */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            fontSize: "8px",
            fontWeight: 500,
            letterSpacing: ".26em",
            padding: "5px 12px",
            textTransform: "uppercase",
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.92)",
            color: isDark ? "#FFFFFF" : "#0A1628",
            border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(10,22,40,0.25)",
            backdropFilter: "blur(10px)",
            zIndex: 2,
          }}
        >
          {tag}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlist(product);
          }}
          aria-label="Add to wishlist"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isDark ? "rgba(10,22,40,0.7)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(10,22,40,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all .3s",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "#FFFFFF" : "#0A1628";
            e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#0A1628";
          }}
          onMouseLeave={(e) => {
            if (!wishlisted) {
              e.currentTarget.style.background = isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.92)";
              e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(10,22,40,0.10)";
            }
          }}
        >
          <svg viewBox="0 0 16 16" fill={wishlisted ? "currentColor" : "none"} width="14" height="14"
            style={{ stroke: wishlisted ? (isDark ? "#0A1628" : "#fff") : isDark ? "#fff" : "#253246", color: isDark ? "#0A1628" : "#fff" }}>
            <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z"
              strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </button>

        {activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt={`${product.name} jewellery`}
            className="card-gem"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              padding: "0",
              transform: "scale(1.04)",
              transition: "transform .7s cubic-bezier(.2,.7,.3,1)",
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="card-gem"
            style={{
              transition: "transform .7s cubic-bezier(.2,.7,.3,1)",
              filter: "drop-shadow(0 8px 20px rgba(10,22,40,0.2))",
            }}
          >
            <GemSVG style={product.gemStyle} size={gemSize} color={product.gemColor} />
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="shop-product-card-info"
        style={{
          padding: "14px 12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          background: "transparent",
          minHeight: "118px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: metalSwatches.length > 0 ? "minmax(0,1fr) auto" : "minmax(0,1fr)",
            alignItems: "start",
            gap: "12px",
          }}
        >
          <div
            className="shop-product-card-title-wrap"
          style={{
              minHeight: "40px",
          }}
        >
          <div
            className="shop-product-card-title"
            style={{
              fontFamily: "var(--display-title)",
              fontSize: "18px",
              fontWeight: 400,
              color: namColor,
              letterSpacing: ".01em",
              lineHeight: 1.05,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </div>
          </div>
        {metalSwatches.length > 0 ? (
          <div
            className="shop-product-card-swatches"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingTop: "2px",
            }}
          >
            {metalSwatches.map((metal) => (
              <button
                type="button"
                key={metal.id}
                title={metal.name}
                aria-label={metal.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveMetalId(metal.id);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  border: metal.id === activeMetalId ? "2px solid #0A1628" : "1px solid rgba(10,22,40,0.18)",
                  background: metal.color,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        ) : null}
        </div>
        <div
          className="shop-product-card-bottom"
          style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginTop: "auto", paddingTop: "8px" }}
        >
          <div>
            <span style={{ fontSize: "8px", fontWeight: 400, letterSpacing: ".24em", color: "#7F8898", textTransform: "uppercase", display: "block", marginBottom: "2px", fontFamily: "var(--numeric)" }}>From</span>
            <span className="shop-product-card-price" style={{ fontFamily: "var(--numeric)", fontSize: "18px", fontWeight: 500, color: isDark ? "#FFFFFF" : "#0A1628", letterSpacing: ".02em" }}>
              ${formatUsdNumber(product.priceFrom)}
            </span>
          </div>
        </div>
      </div>
    </a>
    </>
  );
}
