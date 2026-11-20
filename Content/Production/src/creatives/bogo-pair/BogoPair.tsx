import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { ArchBox, ArchOutline, archClip } from "../../components/Arch";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { ProductName } from "../../components/ProductName";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain, Vignette } from "../../components/Texture";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, progress } from "../../lib/anim";
import { offerPair } from "../../lib/bogo";
import { getImage, getProduct } from "../../lib/products";
import type { BogoProps } from "../bogo-tonight/BogoTonight";
import timeline from "./timeline.json";

/**
 * Buy 1 Get 1 02: "Two pieces. One price." (Saturday, premium, English).
 * Hypothesis: on the second day, a gallery-style film that names real pairs,
 * from a statement piece to an everyday one, and closes on the Sunday-midnight
 * deadline turns considered buyers into two-piece orders.
 */

const S = timeline.scenes;
const C = timeline.cuts;

const goldText: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FBE7A6 0%, #EFCE6C 40%, #C99A3C 75%, #F3D98C 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const card = (id: string, image: number, focus: [number, number]) => ({
  id,
  src: getImage(id, image).file,
  name: getProduct(id).shortTitle,
  focus,
});

/* Left reads first in English: the piece you buy, then the free one. */
const PAIRS = [
  {
    paid: card("jardiniere", 4, [50, 62]),
    free: card("spelter-dogs", 3, [50, 58]),
  },
  {
    paid: card("japanese-crackle-platter", 1, [50, 54]),
    free: card("italian-murano-vase", 1, [50, 52]),
  },
].map((p, k) => ({
  ...p,
  price: offerPair(p.paid.id, p.free.id),
  at: C.pairs[k],
  strike: C.free[k],
}));

/* "Every piece qualifies": more real pairs, each checked the same way,
   ending on the opening pair. */
const MONTAGE = [
  {
    paid: card("sevres-candlestick", 5, [50, 62]),
    free: card("cobalt-centerpiece", 1, [50, 60]),
  },
  {
    paid: card("elephant-side-table", 2, [56, 50]),
    free: card("bleu-blanc-parrot", 1, [50, 42]),
  },
  {
    paid: card("chinoiserie-cachepot", 1, [57, 52]),
    free: card("canton-cachepot", 3, [50, 48]),
  },
  {
    paid: card("jardiniere", 4, [50, 62]),
    free: card("spelter-dogs", 3, [50, 58]),
  },
].map((p, k) => ({
  ...p,
  check: offerPair(p.paid.id, p.free.id),
  at: C.montage[k],
}));

const SLIDES = [...PAIRS, ...MONTAGE].map((s) => ({
  paid: s.paid,
  free: s.free,
  at: s.at,
}));

/* Both arches stay inside the Reels safe area (x 80-1000, y 270-1250). */
const ARCH: Record<"paid" | "free", ArchBox> = {
  paid: { x: 96, y: 532, w: 428, h: 444 },
  free: { x: 556, y: 532, w: 428, h: 444 },
};
const LABEL_Y = 994;
const PLUS_Y = 532 + 444 / 2;

const ivoryShadow = "0 2px 24px rgba(8,5,2,0.6)";

/** The slide an arch shows at `frame`, and how far its cross-fade has run. */
const slideAt = (frame: number, delay: number) => {
  let index = 0;
  SLIDES.forEach((s, k) => {
    if (frame >= s.at + delay) index = k;
  });
  const fade =
    index === 0
      ? 1
      : progress(
          frame,
          SLIDES[index].at + delay,
          SLIDES[index].at + delay + 8,
          EASE_IN_OUT,
        );
  return { index, fade };
};

const ArchPhoto: React.FC<{
  piece: { src: string; focus: [number, number] };
  box: ArchBox;
  t: number;
  opacity: number;
}> = ({ piece, box, t, opacity }) => (
  <AbsoluteFill style={{ opacity, clipPath: archClip(box) }}>
    <Photo
      src={piece.src}
      box={box}
      focus={piece.focus}
      scale={[1.0, 1.06]}
      t={t}
    />
    <Vignette strength={0.22} />
  </AbsoluteFill>
);

const Arch: React.FC<{ side: "paid" | "free"; frame: number }> = ({
  side,
  frame,
}) => {
  const delay = side === "paid" ? 0 : 3;
  const { index, fade } = slideAt(frame, delay);
  const box = ARCH[side];
  const settle = progress(frame, 0, 16, EASE_OUT);
  const glow =
    side === "free" ? progress(frame, C.free[0], C.free[0] + 10, EASE_OUT) : 0;
  const motion = (k: number) =>
    progress(frame, SLIDES[k].at, (SLIDES[k + 1]?.at ?? S.gallery.to) + 12);

  return (
    <AbsoluteFill
      style={{
        translate: `0px ${(1 - settle) * (24 + delay * 4)}px`,
      }}
    >
      {index > 0 && fade < 1 ? (
        <ArchPhoto
          piece={SLIDES[index - 1][side]}
          box={box}
          t={motion(index - 1)}
          opacity={1}
        />
      ) : null}
      <ArchPhoto
        piece={SLIDES[index][side]}
        box={box}
        t={motion(index)}
        opacity={fade}
      />
      <ArchOutline
        box={box}
        offset={12}
        color={COLORS.gold}
        opacity={0.55 + 0.45 * glow}
        strokeWidth={1.6 + 1.6 * glow}
        draw={0.3 + 0.7 * progress(frame, 0, 24, EASE_IN_OUT)}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Labels: BUY / FREE pills, prices and names (pairs), the rule (montage) */
/* ------------------------------------------------------------------ */

const Labels: React.FC<{ side: "paid" | "free"; frame: number }> = ({
  side,
  frame,
}) => {
  const free = side === "free";
  const box = ARCH[side];
  const pill = progress(
    frame,
    free ? C.free[0] : C.labels,
    (free ? C.free[0] : C.labels) + 8,
    EASE_OUT,
  );
  const montage = progress(frame, C.montage[0] - 6, C.montage[0] + 2, EASE_IN);
  const details =
    progress(frame, C.labels, C.labels + 10, EASE_OUT) * (1 - montage);
  const { index } = slideAt(frame, free ? 3 : 0);
  const pair = PAIRS[Math.min(index, PAIRS.length - 1)];
  const swap =
    index === 0
      ? 1 - progress(frame, PAIRS[1].at - 8, PAIRS[1].at, EASE_IN)
      : progress(frame, PAIRS[1].at, PAIRS[1].at + 10, EASE_OUT);
  const strike = progress(frame, pair.strike, pair.strike + 8, EASE_OUT);

  return (
    <div
      style={{
        position: "absolute",
        left: box.x - 6,
        width: box.w + 12,
        top: LABEL_Y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          height: 50,
          padding: "0 30px",
          borderRadius: 25,
          display: "flex",
          alignItems: "center",
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: "0.24em",
          paddingLeft: "calc(30px + 0.24em)",
          background: free ? COLORS.gold : "transparent",
          border: `2px solid ${COLORS.gold}`,
          color: free ? COLORS.ink : COLORS.gold,
          opacity: Math.min(1, pill * 1.5),
          scale: String(1 + (free ? 0.35 : 0.1) * (1 - pill)),
          boxShadow: free ? "0 10px 30px rgba(239,206,108,0.25)" : "none",
        }}
      >
        {free ? "FREE" : "BUY"}
      </div>
      <div
        style={{
          opacity: details * swap,
          translate: `0px ${(1 - details) * 14 + (1 - swap) * 10}px`,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 14,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: free ? 38 : 44,
            whiteSpace: "nowrap",
            color: free ? "rgba(246,238,227,0.55)" : COLORS.goldSoft,
          }}
        >
          {free ? pair.price.gift : pair.price.pay}
          {free ? (
            <span
              style={{
                position: "absolute",
                left: -4,
                top: "52%",
                height: 3,
                width: `calc(${strike * 100}% + 8px)`,
                background: "#D9573A",
                borderRadius: 2,
              }}
            />
          ) : null}
        </div>
        <ProductName
          name={pair[side].name}
          style={{
            marginTop: 8,
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontSize: 31,
            lineHeight: 1.12,
            color: COLORS.ivoryText,
            textShadow: ivoryShadow,
          }}
        />
      </div>
    </div>
  );
};

const Headline: React.FC<{
  frame: number;
  from: number;
  to: number;
  lines: [string, string];
  sizes: [number, number];
  stagger?: number;
}> = ({ frame, from, to, lines, sizes, stagger = 0 }) => {
  if (frame > to + 1 || (frame < from - 1 && from >= 0)) return null;
  const a = progress(frame, from, from + 10, EASE_OUT);
  const b = progress(frame, from + stagger, from + stagger + 10, EASE_OUT);
  const out = progress(frame, to - 10, to, EASE_IN);
  return (
    <div
      style={{
        position: "absolute",
        top: 318,
        left: 70,
        right: 70,
        textAlign: "center",
        opacity: 1 - out,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontSize: sizes[0],
          lineHeight: 1.05,
          color: COLORS.ivoryText,
          textShadow: ivoryShadow,
          opacity: a,
          translate: `0px ${(1 - a) * 14}px`,
        }}
      >
        {lines[0]}
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: sizes[1],
          lineHeight: 1.08,
          opacity: b,
          scale: String(1 + 0.1 * (1 - b)),
          ...goldText,
        }}
      >
        {lines[1]}
      </div>
    </div>
  );
};

const GalleryScene: React.FC = () => {
  const frame = useCurrentFrame() + S.gallery.from;
  const exit = progress(frame, 336, 350, EASE_IN);
  const plus = progress(frame, 12, 24, EASE_OUT);
  const rule = progress(frame, C.montage[0], C.montage[0] + 10, EASE_OUT);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transformOrigin: "540px 760px",
        scale: String(1 + 0.03 * progress(frame, 0, 350)),
      }}
    >
      <Arch side="paid" frame={frame} />
      <Arch side="free" frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 540 - 40,
          top: PLUS_Y - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          border: `2.5px solid ${COLORS.gold}`,
          background: COLORS.espresso,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
          opacity: plus,
          scale: String(0.5 + 0.5 * plus),
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 900,
            fontSize: 64,
            lineHeight: 1,
            marginTop: -6,
            ...goldText,
          }}
        >
          +
        </div>
      </div>
      <Labels side="paid" frame={frame} />
      <Labels side="free" frame={frame} />
      <div
        style={{
          position: "absolute",
          top: LABEL_Y + 84,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontStyle: "italic",
          fontSize: 38,
          lineHeight: 1.25,
          color: COLORS.parchment,
          opacity: rule,
          translate: `0px ${(1 - rule) * 14}px`,
        }}
      >
        The lower-priced piece is free,
        <br />
        applied automatically at checkout.
      </div>
      <Headline
        frame={frame}
        from={C.headline[0] - 6}
        to={C.pairs[1] - 6}
        lines={["Two pieces.", "One price."]}
        sizes={[74, 98]}
        stagger={C.headline[1] - C.headline[0] + 6}
      />
      <Headline
        frame={frame}
        from={C.pairs[1] + 2}
        to={C.montage[0] - 4}
        lines={["Pick any two pieces.", "The lower-priced one is free."]}
        sizes={[58, 60]}
      />
      <Headline
        frame={frame}
        from={C.montage[0] + 2}
        to={344}
        lines={["Every piece qualifies.", "Choose your pair."]}
        sizes={[58, 80]}
      />
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
        scale: String(1 + 0.03 * progress(frame, 16, 110, EASE_IN_OUT)),
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
          top: 526,
          left: 70,
          right: 70,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontSize: 48,
          color: COLORS.ivoryText,
          ...show(8),
        }}
      >
        Ends Sunday 22 November at midnight.
      </div>
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(12),
        }}
      >
        <div
          style={{
            height: 84,
            padding: "0 44px",
            paddingLeft: "calc(44px + 0.16em)",
            borderRadius: 42,
            display: "flex",
            alignItems: "center",
            background: COLORS.gold,
            color: COLORS.ink,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: "0.16em",
          }}
        >
          BUY 1 · GET 1 FREE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 730,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontStyle: "italic",
          fontSize: 36,
          lineHeight: 1.25,
          color: COLORS.parchment,
          ...show(16),
        }}
      >
        The lower-priced piece is free,
        <br />
        applied automatically at checkout.
      </div>
      <div
        style={{
          position: "absolute",
          top: 858,
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
          top: 994,
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
      <div
        style={{
          position: "absolute",
          top: 1074,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontSize: 32,
          letterSpacing: "0.04em",
          color: "rgba(246,238,227,0.75)",
          ...show(28),
        }}
      >
        Every piece in the store · Delivery across Egypt
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const BogoPair: React.FC<BogoProps> = ({
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
          fontSize: 25,
          letterSpacing: "0.28em",
          paddingLeft: "0.28em",
          color: COLORS.gold,
          opacity: 1 - progress(frame, 334, 344, EASE_IN),
        }}
      >
        BUY 1 · GET 1 FREE · ENDS SUNDAY MIDNIGHT
      </div>
      <Sequence
        name="Gallery"
        from={S.gallery.from}
        durationInFrames={S.gallery.to - S.gallery.from}
      >
        <GalleryScene />
      </Sequence>
      <Sequence
        name="CTA"
        from={S.cta.from}
        durationInFrames={S.cta.to - S.cta.from}
      >
        <CtaScene />
      </Sequence>
      <Grain opacity={0.05} />
      {audio ? <Audio src={staticFile("audio/bogo-pair-score.wav")} /> : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
