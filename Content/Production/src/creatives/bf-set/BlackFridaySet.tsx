import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { ArchBox, ArchOutline, archClip, mixArch } from "../../components/Arch";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain, Vignette } from "../../components/Texture";
import {
  EASE_IN,
  EASE_IN_OUT,
  EASE_OUT,
  fadeWindow,
  progress,
} from "../../lib/anim";
import { getImage, getProduct } from "../../lib/products";
import { MAX_TIER, SALE, basket } from "../../lib/sale";
import type { BlackFridayProps } from "../bf-ladder/BlackFridayLadder";
import timeline from "./timeline.json";

/**
 * Black Friday 02: "The 40% Set" (premium, English).
 * Hypothesis: showing the four most expensive pieces as one curated set and
 * the exact saving at the top tier (Buy 4+ = 40%) drives high-value,
 * multi-piece orders from buyers who respond to craftsmanship and value.
 */

const S = timeline.scenes;
const C = timeline.cuts;

const SET = [
  {
    id: "jardiniere",
    image: 4,
    focus: [50, 60] as [number, number],
    name: "Large Jardinière",
    detail: "STAMPED · 24K GOLD-PLATED · 60 × 40 CM",
  },
  {
    id: "sevres-candlestick",
    image: 5,
    focus: [50, 58] as [number, number],
    name: "Sèvres Château Candlesticks",
    detail: "THE PAIR · HAND-PAINTED PORCELAIN BIRDS",
  },
  {
    id: "cobalt-centerpiece",
    image: 1,
    focus: [50, 52] as [number, number],
    name: "Cobalt Porcelain Centerpiece",
    detail: "STAMPED · SOLID BRONZE FIGURINE",
  },
  {
    id: "spelter-dogs",
    image: 3,
    focus: [50, 54] as [number, number],
    name: "Antique French Spelter Statue",
    detail: "THREE DOGS · HAND-ENGRAVED · WOOD BASE",
  },
].map((p) => ({
  ...p,
  product: getProduct(p.id),
  src: getImage(p.id, p.image).file,
}));

const BASKET = basket(
  SET.map((p) => p.id),
  MAX_TIER.percentOff,
);

/* Every arch stays inside the Reels safe area (y 270-1250). */
const GRID: ArchBox[] = [
  { x: 130, y: 510, w: 390, h: 360 },
  { x: 560, y: 510, w: 390, h: 360 },
  { x: 130, y: 890, w: 390, h: 360 },
  { x: 560, y: 890, w: 390, h: 360 },
];
const BIG: ArchBox = { x: 190, y: 470, w: 700, h: 780 };
const ROW: ArchBox[] = [110, 330, 550, 770].map((x) => ({
  x,
  y: 296,
  w: 200,
  h: 270,
}));

const ivoryShadow = "0 2px 24px rgba(8,5,2,0.6)";

/** Shared motion curve for the first piece, so the hook hands it to the set seamlessly. */
const firstPieceT = (frame: number) => progress(frame, 0, C.pieces[1] + 10);

const goldText: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FBE7A6 0%, #EFCE6C 40%, #C99A3C 75%, #F3D98C 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** A product photograph clipped to an arch, laid out inside the arch box. */
const ArchPhoto: React.FC<{
  src: string;
  box: ArchBox;
  focus: [number, number];
  t: number;
  opacity?: number;
  outline?: number;
}> = ({ src, box, focus, t, opacity = 1, outline = 0.55 }) => (
  <AbsoluteFill style={{ opacity }}>
    <AbsoluteFill style={{ clipPath: archClip(box) }}>
      <Photo src={src} box={box} focus={focus} scale={[1.02, 1.1]} t={t} />
      <Vignette strength={0.3} />
    </AbsoluteFill>
    <ArchOutline
      box={box}
      offset={10}
      color={COLORS.gold}
      opacity={outline}
      strokeWidth={1.6}
    />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Hook: "Choose four. Save 40%."                                       */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, 66, 80, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      {SET.map((p, k) =>
        k === 0 && frame >= 66 ? null : (
          <ArchPhoto
            key={p.id}
            src={p.src}
            box={GRID[k]}
            focus={p.focus}
            t={k === 0 ? firstPieceT(frame) : progress(frame, 0, 86)}
            opacity={k === 0 ? 1 : 1 - out}
          />
        ),
      )}
      <AbsoluteFill style={{ opacity: 1 - progress(frame, 60, 72, EASE_IN) }}>
        <div
          style={{
            position: "absolute",
            top: 312,
            left: 80,
            right: 80,
            textAlign: "center",
            color: COLORS.ivoryText,
            textShadow: ivoryShadow,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontSize: 76,
              lineHeight: 1.02,
              translate: `0px ${(1 - progress(frame, 0, 10, EASE_OUT)) * 14}px`,
            }}
          >
            {`Choose ${["", "", "two", "three", "four"][MAX_TIER.minQuantity]}.`}
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 104,
              lineHeight: 1.04,
              scale: String(1 + 0.12 * (1 - progress(frame, 0, 12, EASE_OUT))),
              ...goldText,
            }}
          >
            {`Save ${MAX_TIER.percentOff}%.`}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* The set: four statement pieces, one by one                          */
/* ------------------------------------------------------------------ */

const SetScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.set.from;
  const grow = progress(frame, 68, 86, EASE_IN_OUT);
  const shrink = progress(frame, 248, 264, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      {SET.map((p, k) => {
        const from = C.pieces[k];
        const to = k < 3 ? C.pieces[k + 1] : C.math;
        if (
          frame < (k === 0 ? 66 : from - 1) ||
          frame > to + 10 + (k === 3 ? 10 : 0)
        )
          return null;
        let box = BIG;
        if (k === 0) box = mixArch(GRID[0], BIG, grow);
        if (k === 3) box = mixArch(BIG, ROW[3], shrink);
        const opacity =
          k === 0 ? 1 : progress(frame, from, from + 8, EASE_IN_OUT);
        return (
          <ArchPhoto
            key={p.id}
            src={p.src}
            box={box}
            focus={p.focus}
            t={k === 0 ? firstPieceT(frame) : progress(frame, from, to + 10)}
            opacity={opacity}
            outline={0.6}
          />
        );
      })}
      {SET.map((p, k) => {
        const from = C.pieces[k];
        const to = k < 3 ? C.pieces[k + 1] : C.math;
        const vis = fadeWindow(frame, from + 2, to + 2, 8, 6);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: 290,
              left: 80,
              right: 80,
              textAlign: "center",
              opacity: vis,
              translate: `0px ${(1 - progress(frame, from + 2, from + 12, EASE_OUT)) * 16}px`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 25,
                letterSpacing: "0.2em",
                color: COLORS.gold,
              }}
            >
              {`${String(k + 1).padStart(2, "0")} / 04 · ${p.detail}`}
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: FONTS.display,
                fontStyle: "italic",
                fontSize: 64,
                lineHeight: 1.05,
                color: COLORS.ivoryText,
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 42,
                color: COLORS.goldSoft,
              }}
            >
              {p.product.priceLabel}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* The maths: four pieces, 40% off the whole order                     */
/* ------------------------------------------------------------------ */

const Row: React.FC<{
  label: string;
  value: string;
  at: number;
  frame: number;
  strong?: boolean;
  strike?: number;
}> = ({ label, value, at, frame, strong = false, strike = 0 }) => {
  const p = progress(frame, at, at + 6, EASE_OUT);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: strong ? 50 : 36,
        color: strong ? COLORS.walnut : COLORS.ink,
        opacity: p,
        translate: `${(1 - p) * -14}px 0px`,
        marginTop: strong ? 6 : 18,
      }}
    >
      <span style={{ fontSize: strong ? 40 : 32 }}>{label}</span>
      <span style={{ position: "relative", whiteSpace: "nowrap" }}>
        {value}
        {strike > 0 ? (
          <span
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
        ) : null}
      </span>
    </div>
  );
};

const MathScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.math.from;
  const rows = C.rows;
  const receipt = progress(frame, C.math, C.math + 12, EASE_OUT);
  const stamp = progress(frame, C.stamp, C.stamp + 8, EASE_OUT);
  const out = progress(frame, 356, 368, EASE_IN);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - out,
        transformOrigin: "540px 900px",
        scale: String(1 + 0.035 * progress(frame, C.math, 368, EASE_IN_OUT)),
      }}
    >
      {SET.slice(0, 3).map((p, k) => (
        <ArchPhoto
          key={p.id}
          src={p.src}
          box={ROW[k]}
          focus={p.focus}
          t={progress(frame, C.math, 368)}
          opacity={progress(frame, 252 + k * 3, 262 + k * 3, EASE_OUT)}
          outline={0.6}
        />
      ))}
      {frame >= 266 ? (
        <ArchPhoto
          src={SET[3].src}
          box={ROW[3]}
          focus={SET[3].focus}
          t={progress(frame, C.math, 368)}
          outline={0.6}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 150,
          width: 780,
          top: 640,
          padding: "40px 48px 44px",
          borderRadius: 26,
          background: "#FFFBF4",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          opacity: receipt,
          translate: `0px ${(1 - receipt) * 60}px`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.24em",
            color: COLORS.walnut,
            textAlign: "center",
          }}
        >
          YOUR BLACK FRIDAY SET
        </div>
        <div
          style={{ height: 1.5, background: "#DCC7A8", margin: "18px 0 6px" }}
        />
        <Row
          label={`${BASKET.count} items`}
          value={BASKET.total}
          at={rows[0]}
          frame={frame}
          strike={progress(frame, rows[2] + 2, rows[2] + 10, EASE_OUT)}
        />
        <Row
          label={`Buy ${MAX_TIER.minQuantity}+ · ${MAX_TIER.percentOff}% off`}
          value={`– ${BASKET.saving}`}
          at={rows[1]}
          frame={frame}
        />
        <div
          style={{
            borderTop: "2px dashed #CDB894",
            margin: "22px 0 4px",
            opacity: progress(frame, rows[2], rows[2] + 6),
          }}
        />
        <Row
          label="You pay"
          value={BASKET.pay}
          at={rows[2]}
          frame={frame}
          strong
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1130,
          display: "flex",
          justifyContent: "center",
          opacity: stamp,
        }}
      >
        <div
          style={{
            padding: "16px 34px 18px",
            borderRadius: 18,
            background: COLORS.gold,
            color: COLORS.ink,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: "0.06em",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            rotate: "-4deg",
            scale: String(1 + 0.3 * (1 - stamp)),
          }}
        >
          {`YOU SAVE ${BASKET.saving}`}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Call to action                                                       */
/* ------------------------------------------------------------------ */

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const show = (start: number) => ({
    opacity: progress(frame, start, start + 10, EASE_OUT),
    translate: `0px ${(1 - progress(frame, start, start + 10, EASE_OUT)) * 16}px`,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: progress(frame, 0, 10, EASE_IN_OUT),
        transformOrigin: "540px 700px",
        scale: String(1 + 0.03 * progress(frame, 20, 110, EASE_IN_OUT)),
        background: `radial-gradient(ellipse 80% 45% at 50% 30%, #3A271A 0%, #120B06 62%, #070403 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          width={600}
          reveal={progress(frame, 2, 20, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 2, 8) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 528,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontSize: 50,
          color: COLORS.ivoryText,
          ...show(8),
        }}
      >
        Black Friday ends Friday 13 November.
      </div>
      <div
        style={{
          position: "absolute",
          top: 618,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          ...show(12),
        }}
      >
        {SALE.tiers.map((t) => (
          <div
            key={t.minQuantity}
            style={{
              width: 270,
              height: 76,
              borderRadius: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.12em",
              border: `2px solid ${COLORS.gold}`,
              background: t.orMore ? COLORS.gold : "transparent",
              color: t.orMore ? COLORS.ink : COLORS.gold,
            }}
          >
            {`BUY ${t.minQuantity}${t.orMore ? "+" : ""} · ${t.percentOff}%`}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 722,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontStyle: "italic",
          fontSize: 36,
          color: COLORS.parchment,
          ...show(16),
        }}
      >
        {`Applied automatically at checkout · ${SALE.label.en}`}
      </div>
      <div
        style={{
          position: "absolute",
          top: 820,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(20),
        }}
      >
        <div
          style={{
            width: 400,
            height: 100,
            borderRadius: 50,
            background: COLORS.gold,
            color: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "0.22em",
            paddingLeft: "0.22em",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        >
          SHOP NOW
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 962,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 42,
          letterSpacing: "0.05em",
          color: COLORS.ivoryText,
          ...show(24),
        }}
      >
        formanovavintage.com
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const BlackFridaySet: React.FC<BlackFridayProps> = ({
  audio = true,
  showSafeZones = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 95% 60% at 50% 40%, #24170F 0%, #100A06 60%, #060403 100%)`,
        fontVariantNumeric: "lining-nums",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 278,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.3em",
          paddingLeft: "0.3em",
          color: COLORS.gold,
          opacity: 1 - progress(frame, 66, 76, EASE_IN),
        }}
      >
        BLACK FRIDAY AT FORMANOVA · 6–13 NOV
      </div>
      <Sequence
        name="Set"
        from={S.set.from}
        durationInFrames={S.set.to - S.set.from}
      >
        <SetScene />
      </Sequence>
      <Sequence
        name="Hook"
        from={S.hook.from}
        durationInFrames={S.hook.to - S.hook.from}
      >
        <HookScene />
      </Sequence>
      <Sequence
        name="Math"
        from={S.math.from}
        durationInFrames={S.math.to - S.math.from}
      >
        <MathScene />
      </Sequence>
      <Sequence
        name="CTA"
        from={S.cta.from}
        durationInFrames={S.cta.to - S.cta.from}
      >
        <CtaScene />
      </Sequence>
      <Grain opacity={0.05} />
      {audio ? <Audio src={staticFile("audio/bf-set-score.wav")} /> : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
