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
import type { BogoProps } from "../bogo-tonight/BogoTonight";
import timeline from "./timeline.json";

/**
 * Buy 1 Get 1 03: "Last Day" (Sunday, Egyptian Arabic).
 * Hypothesis: on the final day, a ticking clock and four fresh pairings
 * (opening on the most valuable free piece in the store) convert the people
 * who meant to buy over the weekend but have not yet.
 */

const S = timeline.scenes;
const C = timeline.cuts;
const BEAT = 60 / timeline.bpm;

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
 * Four new pairings of the same in-stock pieces, largest free piece first.
 * Arabic reads right to left: the piece you buy stands on the right, the
 * gift on the left. offerPair() refuses any pair whose gift costs more.
 */
const PAIRS = [
  {
    paid: card("jardiniere", 4, [50, 62]),
    free: card("sevres-candlestick", 5, [50, 62]),
  },
  {
    paid: card("cobalt-centerpiece", 1, [50, 60]),
    free: card("spelter-dogs", 3, [50, 58]),
  },
  {
    paid: card("elephant-side-table", 2, [58, 50]),
    free: card("chinoiserie-cachepot", 1, [57, 52]),
  },
  {
    paid: card("bleu-blanc-parrot", 1, [50, 40]),
    free: card("canton-cachepot", 3, [50, 48]),
  },
].map((p, k) => ({
  ...p,
  price: offerPair(p.paid.id, p.free.id),
  from: C.pairs[k],
  strike: C.gifts[k],
}));

const PAIR = {
  paid: { x: 560, y: 446, w: 420, h: 500 },
  free: { x: 100, y: 446, w: 420, h: 500 },
};
const PANEL = { gap: 22, h: 248 };
const STRIP = 64;

const GOLD_CARD =
  "linear-gradient(160deg, #F8E3A0 0%, #EFCE6C 45%, #D9B25A 100%)";

/* ------------------------------------------------------------------ */
/* The clock: a few minutes to midnight, ticking on every beat          */
/* ------------------------------------------------------------------ */

/** Seconds shown at `frame`: one mechanical tick per beat. */
const tickSeconds = (frame: number, start: number) => {
  const beats = frame / (BEAT * 30);
  const whole = Math.floor(beats);
  const snap = Math.min(1, ((beats - whole) * BEAT * 30) / 3);
  return start + whole + snap;
};

const Clock: React.FC<{
  size: number;
  minutes: number;
  seconds: number;
  glow?: number;
}> = ({ size, minutes, seconds, glow = 0 }) => {
  const r = size / 2;
  const hand = (
    angle: number,
    length: number,
    width: number,
    color: string,
  ) => (
    <line
      x1={r}
      y1={r + length * 0.16}
      x2={r}
      y2={r - length}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${angle} ${r} ${r})`}
    />
  );
  // 11:mm:ss — the hands are always just short of midnight.
  const minute = minutes + seconds / 60;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${18 + 30 * glow}px rgba(239,206,108,${0.22 + 0.3 * glow}))`,
      }}
    >
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.02}
        fill="rgba(26,17,11,0.9)"
        stroke={COLORS.gold}
        strokeWidth={size * 0.018}
      />
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.06}
        fill="none"
        stroke="rgba(239,206,108,0.35)"
        strokeWidth={size * 0.004}
      />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = r - size * 0.09;
        const r2 = r - size * (i % 15 === 0 ? 0.2 : major ? 0.16 : 0.115);
        return (
          <line
            key={i}
            x1={r + r1 * Math.sin(a)}
            y1={r - r1 * Math.cos(a)}
            x2={r + r2 * Math.sin(a)}
            y2={r - r2 * Math.cos(a)}
            stroke={COLORS.gold}
            strokeWidth={size * (i % 15 === 0 ? 0.024 : major ? 0.014 : 0.006)}
            strokeLinecap="round"
            opacity={major ? 1 : 0.6}
          />
        );
      })}
      {hand(
        ((11 + minute / 60) / 12) * 360,
        r * 0.5,
        size * 0.034,
        COLORS.gold,
      )}
      {hand(minute * 6, r * 0.74, size * 0.022, COLORS.goldSoft)}
      {hand(seconds * 6, r * 0.8, size * 0.009, "#D9573A")}
      <circle cx={r} cy={r} r={size * 0.035} fill={COLORS.gold} />
      <circle cx={r} cy={r} r={size * 0.014} fill="#D9573A" />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Hook: "Last day", the 1+1 ends tonight at midnight                   */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, 66, 78, EASE_IN);
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);
  const line1 = progress(frame, 6, 16, EASE_OUT);
  const line2 = progress(frame, 30, 40, EASE_OUT);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - out,
        transformOrigin: "540px 680px",
        scale: String(1 + 0.04 * progress(frame, 0, 80)),
      }}
    >
      <div
        lang="ar"
        dir="rtl"
        style={{
          position: "absolute",
          top: 318,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: FONTS.arabic,
          fontWeight: 700,
          fontSize: 140,
          lineHeight: 1.12,
          scale: String(1 + 0.14 * punch),
          ...goldText,
        }}
      >
        آخر يوم
      </div>
      <div
        style={{
          position: "absolute",
          top: 500,
          left: 540 - 180,
          scale: String(0.9 + 0.1 * progress(frame, 0, 14, EASE_OUT)),
        }}
      >
        <Clock
          size={360}
          minutes={58}
          seconds={tickSeconds(frame, 30)}
          glow={0.5 + 0.5 * Math.sin((frame / 15) * Math.PI) ** 2}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 890,
          left: 60,
          right: 60,
          opacity: line1,
          translate: `0px ${(1 - line1) * 14}px`,
        }}
      >
        <Arabic size={54} color={COLORS.ivoryText}>
          عرض 1+1 بيخلص النهارده نص الليل
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 978,
          left: 60,
          right: 60,
          opacity: line2,
          translate: `0px ${(1 - line2) * 14}px`,
        }}
      >
        <Arabic size={50} color={COLORS.gold}>
          اشتري قطعة… والتانية هدية
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Pairs (frames 75-327): buy / gift strips, never over a product       */
/* ------------------------------------------------------------------ */

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

const Column: React.FC<{ side: "paid" | "free"; frame: number }> = ({
  side,
  frame,
}) => {
  const free = side === "free";
  const delay = free ? 4 : 0;
  const { index, sx } = flipState(frame, delay);
  const pair = PAIRS[index];
  const piece = pair[side];
  const box = PAIR[side];
  const first = C.pairs[0] + delay;
  const enter = progress(frame, first, first + 12, EASE_OUT);
  const panel = progress(frame, first + 6, first + 18, EASE_OUT);
  const reveal = progress(frame, pair.strike, pair.strike + 8, EASE_OUT);
  const from = free ? -1 : 1;

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
          background: free ? GOLD_CARD : "#FFFBF4",
          boxShadow: free
            ? "0 30px 60px rgba(0,0,0,0.55), 0 0 50px rgba(239,206,108,0.35)"
            : "0 30px 60px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          lang="ar"
          dir="rtl"
          style={{
            height: STRIP,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.arabic,
            fontWeight: 700,
            fontSize: 38,
            color: free ? COLORS.ink : COLORS.walnut,
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
            t={progress(frame, pair.from - 10, pair.from + 80)}
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
          {free ? (
            <span
              style={{
                position: "absolute",
                left: -4,
                top: "52%",
                height: 3,
                width: `calc(${reveal * 100}% + 8px)`,
                background: "rgba(163,52,31,0.9)",
                borderRadius: 2,
              }}
            />
          ) : null}
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
  const exit = progress(frame, 312, 326, EASE_IN);
  const plus = progress(frame, C.pairs[0] + 4, C.pairs[0] + 14, EASE_OUT);
  const head =
    progress(frame, C.pairs[0] + 6, C.pairs[0] + 18, EASE_OUT) *
    (1 - progress(frame, 308, 318, EASE_IN));

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transformOrigin: "540px 840px",
        scale: String(1 + 0.03 * progress(frame, C.pairs[0], 330)),
      }}
    >
      <Column side="free" frame={frame} />
      <Column side="paid" frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 540 - 44,
          top: PAIR.paid.y + PAIR.paid.h / 2 - 44,
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
/* Call to action                                                       */
/* ------------------------------------------------------------------ */

const CtaScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.cta.from;
  const show = (start: number) => ({
    opacity: progress(local, start, start + 10, EASE_OUT),
    translate: `0px ${(1 - progress(local, start, start + 10, EASE_OUT)) * 16}px`,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: progress(local, 0, 10, EASE_IN_OUT),
        transformOrigin: "540px 700px",
        scale: String(1 + 0.03 * progress(local, 16, 135, EASE_IN_OUT)),
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
          width={560}
          reveal={progress(local, 2, 18, EASE_IN_OUT)}
          style={{ opacity: progress(local, 2, 8) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 492,
          left: 540 - 72,
          ...show(6),
        }}
      >
        <Clock
          size={144}
          minutes={59}
          seconds={tickSeconds(frame, 20)}
          glow={0.6}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 654,
          left: 60,
          right: 60,
          ...show(10),
        }}
      >
        <Arabic size={58} color={COLORS.gold}>
          العرض بيخلص النهارده نص الليل
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 742,
          left: 60,
          right: 60,
          ...show(14),
        }}
      >
        <Arabic size={44} weight={600} color={COLORS.ivoryText}>
          اشتري قطعة… والتانية هدية
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 836,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(18),
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
          top: 974,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 44,
          letterSpacing: "0.04em",
          color: COLORS.ivoryText,
          ...show(22),
        }}
      >
        formanovavintage.com
      </div>
      <div
        style={{
          position: "absolute",
          top: 1058,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(26),
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
          top: 1144,
          left: 60,
          right: 60,
          ...show(30),
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

export const BogoLastDay: React.FC<BogoProps> = ({
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
          fontSize: 26,
          letterSpacing: "0.3em",
          paddingLeft: "0.3em",
          color: COLORS.gold,
          opacity: 1 - progress(frame, 308, 318, EASE_IN_OUT),
        }}
      >
        LAST DAY · BUY 1 · GET 1 FREE
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
        <Audio src={staticFile("audio/bogo-last-day-score.wav")} />
      ) : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
