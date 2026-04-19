"use client";

// ── Gem SVG renderer ──────────────────────────────────────────────────────────
export function GemSVG({ style, size = 110, color = "#D4A840" }) {
  const c = color;
  const cL = "#B8922A";
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
          <polygon points="28,40 38,48 33,80 18,80 13,48" stroke={cL} strokeWidth="0.8" fill="#D4A84033" />
          <polygon points="82,40 92,48 87,80 72,80 67,48" stroke={cL} strokeWidth="0.8" fill="#D4A84033" />
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

export default function ProductCard({ product, wishlisted, onWishlist, onEnquire }) {
  const isDark = product.category === "hiphop";
  const tag = product.isNew ? "New" : product.featured ? "Featured" : "Signature";
  const gemSize = LARGE_GEM_STYLES.includes(product.gemStyle) ? 140 : 110;

  const cardBg = isDark ? "#14120D" : "#fff";
  const cardBorder = isDark ? "rgba(184,146,42,0.18)" : "rgba(20,18,13,0.10)";
  const namColor = isDark ? "#F9F6F1" : "#14120D";
  const metaColor = isDark ? "#8A7E5C" : "#7A7060";

  return (
    <a
      href={`/shop/${product.slug}`}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        transition: "transform .5s cubic-bezier(.2,.7,.3,1), box-shadow .5s, border-color .5s",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(20,18,13,0.12)";
        e.currentTarget.style.borderColor = "rgba(184,146,42,0.25)";
        const glow = e.currentTarget.querySelector(".card-glow");
        if (glow) glow.style.opacity = "1";
        const gem = e.currentTarget.querySelector(".card-gem");
        if (gem) gem.style.transform = "scale(1.08) rotate(-3deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = cardBorder;
        const glow = e.currentTarget.querySelector(".card-glow");
        if (glow) glow.style.opacity = "0";
        const gem = e.currentTarget.querySelector(".card-gem");
        if (gem) gem.style.transform = "scale(1) rotate(0deg)";
      }}
    >
      {/* Visual */}
      <div
        style={{
          height: "300px",
          background: isDark
            ? "linear-gradient(135deg, #14120D 0%, #1C1A14 100%)"
            : "linear-gradient(135deg, #FBF9F5 0%, #F6F2EA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow overlay */}
        <div
          className="card-glow"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(184,146,42,0.08), transparent 70%)",
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
            background: isDark ? "#B8922A" : "rgba(255,255,255,0.92)",
            color: isDark ? "#14120D" : "#8A6A10",
            border: isDark ? "1px solid #B8922A" : "1px solid rgba(184,146,42,0.25)",
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
            onWishlist(product.id);
          }}
          aria-label="Add to wishlist"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isDark ? "rgba(20,18,13,0.7)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: isDark ? "1px solid rgba(184,146,42,0.3)" : "1px solid rgba(20,18,13,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all .3s",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#B8922A";
            e.currentTarget.style.borderColor = "#B8922A";
          }}
          onMouseLeave={(e) => {
            if (!wishlisted) {
              e.currentTarget.style.background = isDark ? "rgba(20,18,13,0.7)" : "rgba(255,255,255,0.92)";
              e.currentTarget.style.borderColor = isDark ? "rgba(184,146,42,0.3)" : "rgba(20,18,13,0.10)";
            }
          }}
        >
          <svg viewBox="0 0 16 16" fill={wishlisted ? "currentColor" : "none"} width="14" height="14"
            style={{ stroke: wishlisted ? "#fff" : isDark ? "#D4A840" : "#3A3628", color: "#fff" }}>
            <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z"
              strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </button>

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} jewellery`}
            className="card-gem"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .7s cubic-bezier(.2,.7,.3,1)",
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="card-gem"
            style={{
              transition: "transform .7s cubic-bezier(.2,.7,.3,1)",
              filter: "drop-shadow(0 8px 20px rgba(184,146,42,0.2))",
            }}
          >
            <GemSVG style={product.gemStyle} size={gemSize} color={product.gemColor} />
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "22px 22px 26px",
          borderTop: isDark ? "1px solid rgba(184,146,42,0.12)" : "1px solid rgba(20,18,13,0.10)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div style={{ fontSize: "9px", fontWeight: 300, letterSpacing: ".22em", color: metaColor, textTransform: "uppercase", marginBottom: "6px", fontFamily: "var(--numeric)" }}>
          {product.shortMeta}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 400, color: namColor, letterSpacing: ".02em", lineHeight: 1.2 }}>
          {product.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px" }}>
          <div>
            <span style={{ fontSize: "8px", fontWeight: 400, letterSpacing: ".24em", color: "#B0A898", textTransform: "uppercase", display: "block", marginBottom: "2px", fontFamily: "var(--numeric)" }}>From</span>
            <span style={{ fontFamily: "var(--numeric)", fontSize: "18px", fontWeight: 500, color: "#B8922A", letterSpacing: ".02em" }}>
              ${product.priceFrom.toLocaleString()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEnquire(product.name);
            }}
            style={{
              fontSize: "8px",
              fontWeight: 400,
              letterSpacing: ".24em",
              padding: "7px 14px",
              border: isDark ? "1px solid rgba(184,146,42,0.3)" : "1px solid rgba(20,18,13,0.10)",
              background: "transparent",
              color: isDark ? "#D4A840" : "#3A3628",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all .3s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#B8922A";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#B8922A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = isDark ? "#D4A840" : "#3A3628";
              e.currentTarget.style.borderColor = isDark ? "rgba(184,146,42,0.3)" : "rgba(20,18,13,0.10)";
            }}
          >
            Enquire
          </button>
        </div>
      </div>
    </a>
  );
}
