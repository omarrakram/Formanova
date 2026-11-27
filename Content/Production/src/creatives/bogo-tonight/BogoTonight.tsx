import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { Arabic } from "../../components/Commerce";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { ProductName } from "../../components/ProductName";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain } from "../../components/Texture";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, progress } from "../../lib/anim";
import { offerPair } from "../../lib/bogo";
import { getImage, getProduct } from "../../lib/products";
import timeline from "./timeline.json";

/**
 * Buy 1 Get 1 01: "1+1, Tonight" (launch night, Egyptian Arabic).
 * Hypothesis: if "buy one piece, the second is a gift" is understood in the
 * first second and then proven on three real pairs at three budgets, the
 * launch-night audience buys, and buys two pieces rather than one.
 */

const S = timeline.scenes;
const C = timeline.cuts;

const goldText: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FBE7A6 0%, #EFCE6C 38%, #C99A3C 72%, #F3D98C 100%)",
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

/*
 * Arabic reads right to left, so the piece you pay for stands on the right
 * and the gift on the left. offerPair() refuses a pair whose "gift" costs
 * more, so the lower-priced piece is always the one shown as free.
 */
const PAIRS = [
  {
    paid: card("sevres-candlestick", 5, [50, 62]),
    free: card("cobalt-centerpiece", 1, [50, 60]),
  },
  {
    paid: card("elephant-side-table", 2, [58, 50]),
    free: card("bleu-blanc-parrot", 1, [50, 40]),
  },
  {
    paid: card("chinoiserie-cachepot", 1, [57, 52]),
    free: card("canton-cachepot", 3, [50, 48]),
  },
].map((p, k) => ({
  ...p,
  price: offerPair(p.paid.id, p.free.id),
  from: C.pairs[k],
  strike: C.gifts[k],
}));

type Box = { x: number; y: number; w: number; h: number };
const mix = (a: Box, b: Box, t: number): Box => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

/* Hook: cards under the headline. Pairs: larger cards with a price panel. */
const HOOK = {
  paid: { x: 584, y: 770, w: 360, h: 420 },
  free: { x: 136, y: 770, w: 360, h: 420 },
};
const PAIR = {
  paid: { x: 560, y: 446, w: 420, h: 500 },
  free: { x: 100, y: 446, w: 420, h: 500 },
};
const PANEL = { gap: 22, h: 248 };

/** Which pair a column shows at `frame`, and its flip scale (0 = edge-on). */
const flipState = (frame: number, delay: number) => {
  let index = 0;
  let sx = 1;
  PAIRS.forEach((p, k) => {
    if (k === 0) return;
    const centre = p.from + delay;
    if (frame >= centre) index = k;
    const d = Math.abs(frame - centre);
    if (d < 7) sx = Math.sin((Math.PI / 2) * (d / 7));
  });
  return { index, sx: Math.max(sx, 0.001) };
};

const Strike: React.FC<{ p: number }> = ({ p }) => (
  <span
    style={{
      position: "absolute",
      left: -4,
      top: "52%",
      height: 3,
      width: `calc(${p * 100}% + 8px)`,
      background: "rgba(163,52,31,0.9)",
      borderRadius: 2,
    }}
  />
);

const GOLD_CARD =
  "linear-gradient(160deg, #F8E3A0 0%, #EFCE6C 45%, #D9B25A 100%)";

/* ------------------------------------------------------------------ */
/* Cards and prices (frames 0-342). Nothing is ever drawn over a        */
/* product: "buy" and "gift" sit on a label strip above each photo.     */
/* ------------------------------------------------------------------ */

const Column: React.FC<{
  side: "paid" | "free";
  frame: number;
}> = ({ side, frame }) => {
  const delay = side === "paid" ? 0 : 4;
  const { index, sx } = flipState(frame, delay);
  const pair = PAIRS[index];
  const piece = pair[side];
  const settle = progress(frame, 58, 76, EASE_IN_OUT);
  const box = mix(HOOK[side], PAIR[side], settle);
  const strip = 56 + 8 * settle;
  const enter = progress(
    frame,
    side === "paid" ? 0 : 3,
    side === "paid" ? 12 : 15,
    EASE_OUT,
  );
  const panel = progress(frame, 76 + delay, 88 + delay, EASE_OUT);
  // The gift turns gold on the beat in the hook, then stays gold.
  const gold =
    side === "free" ? progress(frame, C.badge, C.badge + 8, EASE_OUT) : 0;
  const reveal = progress(frame, pair.strike, pair.strike + 8, EASE_OUT);
  const from = side === "paid" ? 1 : -1;
  const free = side === "free";

  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        opacity: enter,
        translate: `${(1 - enter) * from * 260}px 0px`,
        scale: `${sx} 1`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: box.w,
          height: box.h,
          padding: "0px 12px 12px",
          borderRadius: 30,
          background: "#FFFBF4",
          boxShadow: free
            ? `0 30px 60px rgba(0,0,0,0.55), 0 0 ${50 * gold}px rgba(239,206,108,${0.35 * gold})`
            : "0 30px 60px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {free ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 30,
              background: GOLD_CARD,
              opacity: gold,
            }}
          />
        ) : null}
        <div
          lang="ar"
          dir="rtl"
          style={{
            position: "relative",
            height: strip,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.arabic,
            fontWeight: 700,
            fontSize: 38,
            color: free ? COLORS.ink : COLORS.walnut,
            opacity: free ? gold : 1,
            scale: String(free ? 1 + 0.4 * (1 - gold) : 1),
          }}
        >
          {free ? "هدية" : "اشتري"}
        </div>
        <div
          style={{
            position: "relative",
            flex: 1,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Photo
            src={piece.src}
            focus={piece.focus}
            scale={[1.1, 1.0]}
            t={progress(
              frame,
              index === 0 ? 0 : pair.from - 10,
              pair.from + 110,
            )}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: PANEL.gap,
          height: PANEL.h,
          borderRadius: 26,
          background: free ? "#F9EDC8" : "#FFFBF4",
          border: `1.5px solid ${free ? "#E3C27A" : "#E2CFB4"}`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          padding: "0 18px",
          opacity: panel,
          translate: `0px ${(1 - panel) * 30}px`,
        }}
      >
        <Arabic
          size={32}
          weight={700}
          color={free ? "#A3341F" : COLORS.walnut}
          style={{ opacity: free ? reveal : 1 }}
        >
          {free ? "ببلاش" : "تدفع"}
        </Arabic>
        <div
          style={{
            position: "relative",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: free ? 40 : 46,
            whiteSpace: "nowrap",
            color: free ? "rgba(23,11,2,0.6)" : COLORS.walnut,
          }}
        >
          {free ? pair.price.gift : pair.price.pay}
          {free ? <Strike p={reveal} /> : null}
        </div>
        <ProductName
          name={piece.name}
          style={{
            fontFamily: FONTS.body,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.12,
            textAlign: "center",
            color: COLORS.ink,
          }}
        />
      </div>
    </div>
  );
};

const PairsScene: React.FC = () => {
  const frame = useCurrentFrame() + S.pairs.from;
  const exit = progress(frame, 326, 340, EASE_IN);
  const settle = progress(frame, 58, 76, EASE_IN_OUT);
  const plusY = 770 + 210 + (446 + 250 - 980) * settle;
  const plus = progress(frame, 6, 16, EASE_OUT);
  const head =
    progress(frame, 66, 78, EASE_OUT) *
    (1 - progress(frame, 322, 332, EASE_IN));

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transformOrigin: "540px 840px",
        scale: String(1 + 0.03 * progress(frame, 0, 340)),
      }}
    >
      <Column side="free" frame={frame} />
      <Column side="paid" frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 540 - 44,
          top: plusY - 44,
          width: 88,
          height: 88,
          borderRadius: 44,
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
            fontSize: 70,
            lineHeight: 1,
            marginTop: -6,
            ...goldText,
          }}
        >
          +
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 322,
          left: 60,
          right: 60,
          opacity: head,
          translate: `0px ${(1 - head) * 16}px`,
        }}
      >
        <Arabic size={54} color={COLORS.ivoryText}>
          اختار أي قطعتين…{" "}
          <span style={{ color: COLORS.gold }}>والأقل سعراً هدية</span>
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Hook: "1+1", buy one piece and the second is a gift                  */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, 50, 60, EASE_IN);
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);
  const line = progress(frame, 6, 16, EASE_OUT);

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", top: 322, left: 60, right: 60 }}>
        <Arabic size={46} weight={600} color={COLORS.gold}>
          من الليلة الساعة 7:30
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 372,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: 250,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          scale: String(
            (1 + 0.16 * punch) * (1 + 0.05 * progress(frame, 12, 60)),
          ),
          ...goldText,
        }}
      >
        1+1
      </div>
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 60,
          right: 60,
          opacity: line,
          translate: `0px ${(1 - line) * 14}px`,
        }}
      >
        <Arabic size={62} color={COLORS.ivoryText}>
          اشتري قطعة… والتانية هدية
        </Arabic>
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
        scale: String(1 + 0.03 * progress(frame, 16, 120, EASE_IN_OUT)),
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
          reveal={progress(frame, 2, 18, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 2, 8) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 60,
          right: 60,
          ...show(8),
        }}
      >
        <Arabic size={60} color={COLORS.gold}>
          اشتري قطعة… والتانية هدية
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 618,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(12),
        }}
      >
        <div
          style={{
            width: 820,
            padding: "12px 0 16px",
            borderRadius: 28,
            border: `2px solid ${COLORS.gold}`,
            background: "rgba(239,206,108,0.1)",
          }}
        >
          <Arabic size={40} weight={600} color={COLORS.ivoryText}>
            من الليلة الساعة 7:30 مساءً
          </Arabic>
          <Arabic size={40} weight={600} color={COLORS.ivoryText}>
            لحد الأحد 22/11 نص الليل
          </Arabic>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 786,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(16),
        }}
      >
        <div
          lang="ar"
          dir="rtl"
          style={{
            width: 440,
            height: 108,
            borderRadius: 54,
            background: COLORS.gold,
            color: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.arabic,
            fontWeight: 700,
            fontSize: 48,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          تسوّق الآن
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 926,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 44,
          letterSpacing: "0.04em",
          color: COLORS.ivoryText,
          ...show(20),
        }}
      >
        formanovavintage.com
      </div>
      <div
        style={{
          position: "absolute",
          top: 1012,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(24),
        }}
      >
        <div
          style={{
            padding: "10px 34px 14px",
            borderRadius: 999,
            border: `1.5px solid rgba(239,206,108,0.6)`,
          }}
        >
          <Arabic size={32} weight={500} color={COLORS.goldSoft}>
            أوتوماتيك عند الدفع · من غير كود · على كل القطع
          </Arabic>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1100,
          left: 60,
          right: 60,
          ...show(28),
        }}
      >
        <Arabic size={33} weight={500} color="rgba(246,238,227,0.8)">
          القطعة الأقل سعراً هي الهدية · توصيل لكل محافظات مصر
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export type BogoProps = {
  /** Include the original score (disable for silent still previews). */
  audio?: boolean;
  /** Draw the Reels safe-zone guide (QA only). */
  showSafeZones?: boolean;
};

export const BogoTonight: React.FC<BogoProps> = ({
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
          top: 276,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.32em",
          paddingLeft: "0.32em",
          color: COLORS.gold,
          opacity: 1 - progress(frame, 322, 332, EASE_IN_OUT),
        }}
      >
        BUY 1 · GET 1 FREE · 20–22 NOV
      </div>
      <Sequence
        name="Pairs"
        from={S.pairs.from}
        durationInFrames={S.pairs.to - S.pairs.from}
      >
        <PairsScene />
      </Sequence>
      <Sequence
        name="Hook"
        from={S.hook.from}
        durationInFrames={S.hook.to - S.hook.from}
      >
        <HookScene />
      </Sequence>
      <Sequence
        name="CTA"
        from={S.cta.from}
        durationInFrames={S.cta.to - S.cta.from}
      >
        <CtaScene />
      </Sequence>
      <Grain opacity={0.045} />
      {audio ? (
        <Audio src={staticFile("audio/bogo-tonight-score.wav")} />
      ) : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
