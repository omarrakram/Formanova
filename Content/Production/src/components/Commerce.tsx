import React from "react";
import { COLORS, FONTS } from "../brand/tokens";

/** Right-to-left Arabic text block set in El Messiri. */
export const Arabic: React.FC<{
  children: React.ReactNode;
  size: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size, weight = 700, color = COLORS.ink, style }) => (
  <div
    lang="ar"
    dir="rtl"
    style={{
      fontFamily: FONTS.arabic,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.32,
      color,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * A shop tag "typed" with the verified product name and price, hanging from
 * a thin cord. `drop` (0..1) animates it onto the product. For sales, `was`
 * shows the regular price struck through (`strike` 0..1 draws the line) and
 * `note` adds a short condition line under the price.
 */
export const PriceTag: React.FC<{
  name: string;
  price: string;
  drop: number;
  angle: number;
  was?: string;
  strike?: number;
  note?: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}> = ({
  name,
  price,
  drop,
  angle,
  was,
  strike = 1,
  note,
  width = 372,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width,
      opacity: Math.min(1, drop * 1.6),
      translate: `0px ${(1 - drop) * -46}px`,
      rotate: `${angle}deg`,
      transformOrigin: "50% -54px",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -54,
        width: 2,
        height: 64,
        marginLeft: -1,
        background: "rgba(70,45,25,0.55)",
      }}
    />
    <div
      style={{
        position: "relative",
        background: "#FFFBF4",
        borderRadius: 18,
        border: "1.5px solid #E2CFB4",
        boxShadow:
          "0 16px 34px rgba(34,20,9,0.30), 0 2px 6px rgba(34,20,9,0.12)",
        padding: "34px 26px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 10,
          width: 16,
          height: 16,
          marginLeft: -8,
          borderRadius: 8,
          background: "#D7C2A4",
          boxShadow: "inset 0 2px 3px rgba(60,35,15,0.45)",
        }}
      />
      <div
        style={{
          fontFamily: FONTS.body,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 31,
          lineHeight: 1.12,
          color: COLORS.ink,
        }}
      >
        {name}
      </div>
      <div
        style={{ height: 1.5, background: "#DCC7A8", margin: "13px 18px 11px" }}
      />
      {was ? (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 30,
            whiteSpace: "nowrap",
            color: "rgba(23,11,2,0.5)",
            marginBottom: 2,
          }}
        >
          {was}
          <div
            style={{
              position: "absolute",
              left: -4,
              top: "52%",
              height: 3,
              width: `calc(${strike * 100}% + 8px)`,
              background: "#A3341F",
              borderRadius: 2,
            }}
          />
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 42,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          color: COLORS.walnut,
        }}
      >
        {price}
      </div>
      {note ? <div style={{ marginTop: 8 }}>{note}</div> : null}
    </div>
  </div>
);

/** Bilingual collection label, e.g. "BLEU BLANC · بلو بلا". */
export const CollectionChip: React.FC<{
  en: string;
  ar: string;
  style?: React.CSSProperties;
}> = ({ en, ar, style }) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 24px 12px",
      borderRadius: 999,
      background: "rgba(255,251,244,0.94)",
      boxShadow: "0 8px 22px rgba(34,20,9,0.22)",
      ...style,
    }}
  >
    <span
      style={{
        fontFamily: FONTS.body,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: "0.2em",
        color: COLORS.walnut,
      }}
    >
      {en.toUpperCase()}
    </span>
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        background: COLORS.goldDeep,
      }}
    />
    <span
      lang="ar"
      dir="rtl"
      style={{
        fontFamily: FONTS.arabic,
        fontWeight: 600,
        fontSize: 28,
        color: COLORS.walnut,
      }}
    >
      {ar}
    </span>
  </div>
);
