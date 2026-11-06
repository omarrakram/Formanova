import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { Arabic } from "../../components/Commerce";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain } from "../../components/Texture";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, progress } from "../../lib/anim";
import { getImage, getProduct } from "../../lib/products";
import { MAX_TIER, SALE, discounted } from "../../lib/sale";
import timeline from "./timeline.json";

/**
 * Black Friday 01: "The Ladder" (offer-led, Egyptian Arabic).
 * Hypothesis: making the quantity ladder (2 → 20%, 3 → 30%, 4+ → 40%)
 * instantly understandable, then proving it on the most expensive pieces,
 * lifts both conversion rate and items per order.
 */

const S = timeline.scenes;
const [t1, t2, t3] = timeline.cuts.tiers;
const TIERS = [t1, t2, t3];

/* Western digits throughout, as Egyptian sale advertising uses them. */
const QTY = ["قطعتين", "3 قطع", "4 قطع أو أكتر"];

const goldText: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FBE7A6 0%, #EFCE6C 38%, #C99A3C 72%, #F3D98C 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const Ribbon: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 276,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONTS.body,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: "0.34em",
      paddingLeft: "0.34em",
      color: COLORS.gold,
      opacity,
    }}
  >
    BLACK FRIDAY · 6–13 NOV
  </div>
);

/* ------------------------------------------------------------------ */
/* Hook: "up to 40% off every piece"                                   */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, 53, 60, EASE_IN);
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", top: 318, left: 60, right: 60 }}>
        <Arabic size={56} weight={600} color={COLORS.ivoryText}>
          خصم لحد
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 352,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: 300,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          scale: String(1 + 0.16 * punch),
          ...goldText,
        }}
      >
        {`${MAX_TIER.percentOff}%`}
      </div>
      <div style={{ position: "absolute", top: 660, left: 60, right: 60 }}>
        <Arabic size={50} weight={600} color={COLORS.ivoryText}>
          على كل القطع في فورمانوفا
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 748,
          width: 860,
          height: 490,
          borderRadius: 36,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
          border: `2px solid rgba(239,206,108,0.55)`,
        }}
      >
        <Photo
          src={getImage("jardiniere", 4).file}
          focus={[50, 58]}
          scale={[1.04, 1.12]}
          t={progress(frame, 0, 68)}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Ladder: the more pieces, the bigger the discount                    */
/* ------------------------------------------------------------------ */

const FAN = [
  getImage("sevres-candlestick", 5).file,
  getImage("cobalt-centerpiece", 1).file,
  getImage("spelter-dogs", 3).file,
  getImage("elephant-side-table", 2).file,
];

/** Frame at which each fan card arrives: two for the first tier, then one per tier. */
const ARRIVALS = [t1, t1 + 5, t2, t3];

/**
 * Fan layout for a continuous card count `c`, so the fan re-spreads smoothly
 * while a new card rises in from the lower right.
 */
const pose = (c: number, i: number) => {
  const f = c <= 1 ? 0.5 : Math.min(i / (c - 1), 1.8);
  const r = -11 + 22 * f;
  return { x: -170 + 340 * f, y: Math.abs(r) * 3, r };
};

const LadderScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.ladder.from;
  const arrived = ARRIVALS.map((f) => progress(frame, f, f + 11, EASE_OUT));
  const count = arrived.reduce((a, b) => a + b, 0);
  const exit = progress(frame, 204, 216, EASE_IN);
  const head = progress(frame, 58, 65, EASE_OUT);
  const burst =
    progress(frame, t3, t3 + 6, EASE_OUT) *
    (1 - progress(frame, t3 + 6, t3 + 30, EASE_IN_OUT));

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <div
        style={{
          position: "absolute",
          top: 318,
          left: 60,
          right: 60,
          opacity: head,
          translate: `0px ${(1 - head) * 18}px`,
        }}
      >
        <Arabic size={58} color={COLORS.ivoryText}>
          كل ما القطع تزيد… الخصم يزيد
        </Arabic>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 418,
          height: 210,
          borderRadius: 30,
          border: `2px solid rgba(239,206,108,0.6)`,
          background: "rgba(42,28,19,0.72)",
          boxShadow: `0 0 ${60 + 80 * burst}px rgba(239,206,108,${0.12 + 0.4 * burst})`,
          overflow: "hidden",
          opacity: head,
        }}
      >
        {SALE.tiers.map((t, k) => {
          const start = TIERS[k];
          const end = k < 2 ? TIERS[k + 1] : 400;
          // Sequenced, never overlapping: the old tier leaves on the beat,
          // the new one lands a few frames later.
          const enter = progress(frame, start + 3, start + 11, EASE_OUT);
          const leave = progress(frame, end, end + 5, EASE_IN);
          return (
            <div
              key={t.minQuantity}
              lang="ar"
              dir="rtl"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 56px",
                opacity: Math.min(enter, 1 - leave),
                translate: `0px ${(1 - enter) * 70 - leave * 70}px`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.arabic,
                  fontWeight: 700,
                  fontSize: k === 2 ? 54 : 66,
                  whiteSpace: "nowrap",
                  color: COLORS.ivoryText,
                }}
              >
                {QTY[k]}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.arabic,
                    fontWeight: 600,
                    fontSize: 44,
                    color: COLORS.goldSoft,
                  }}
                >
                  خصم
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 900,
                    fontSize: 150,
                    lineHeight: 1,
                    ...goldText,
                  }}
                >
                  {`${t.percentOff}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 656,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "center",
          gap: 16,
          opacity: head,
        }}
      >
        {TIERS.map((f) => (
          <div
            key={f}
            style={{
              width: 210,
              height: 10,
              borderRadius: 5,
              background: "rgba(239,206,108,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress(frame, f, f + 10, EASE_OUT) * 100}%`,
                height: "100%",
                background: COLORS.gold,
                borderRadius: 5,
                marginLeft: "auto",
              }}
            />
          </div>
        ))}
      </div>

      <AbsoluteFill
        style={{
          transformOrigin: "540px 930px",
          scale: String(1 + 0.04 * progress(frame, 60, 216)),
          translate: `0px ${-24 * progress(frame, 60, 216)}px`,
        }}
      >
        {FAN.map((src, i) => {
          const a = Math.max(0, Math.min(1, count - i));
          if (a <= 0) return null;
          const pos = pose(count, i);
          return (
            <div
              key={src}
              style={{
                position: "absolute",
                left: 540 - 230 + pos.x,
                top: 700 + pos.y + (1 - a) * 380,
                width: 460,
                height: 460,
                padding: 12,
                borderRadius: 30,
                background: "#FFFBF4",
                boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
                rotate: `${pos.r + (1 - a) * 22}deg`,
                opacity: Math.min(1, a * 2),
                transformOrigin: "50% 100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <Photo
                  src={src}
                  focus={[50, 52]}
                  scale={[1.1, 1.0]}
                  t={progress(frame, ARRIVALS[i], 216)}
                />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Prices: the most prized pieces at 40% with four or more             */
/* ------------------------------------------------------------------ */

const PRICE_CARDS = [
  { id: "jardiniere", image: 4, focus: [50, 58] as [number, number] },
  { id: "murano-swirl-vase", image: 1, focus: [48, 50] as [number, number] },
  { id: "bleu-blanc-parrot", image: 1, focus: [40, 46] as [number, number] },
].map((c, k) => ({
  ...c,
  product: getProduct(c.id),
  src: getImage(c.id, c.image).file,
  from: timeline.cuts.prices[k],
  to: k < 2 ? timeline.cuts.prices[k + 1] : timeline.cuts.cta,
  tagAt: timeline.tags[k],
  price: discounted(c.id, MAX_TIER.percentOff),
}));

/** Photo card and price panel: nothing is ever drawn over the product itself. */
const PHOTO = { x: 190, y: 430, size: 700 };
const PANEL = { x: 150, y: 1084, w: 780, h: 166 };

const PricesScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.prices.from;
  const head =
    progress(frame, 210, 220, EASE_OUT) *
    (1 - progress(frame, 340, 350, EASE_IN));

  return (
    <AbsoluteFill>
      {PRICE_CARDS.map((c, k) => {
        if (frame < c.from - 1 || frame > c.to + 8) return null;
        const enter = progress(frame, c.from, c.from + 8, EASE_OUT);
        const exit = progress(frame, c.to - 1, c.to + 7, EASE_IN);
        const land = progress(frame, c.tagAt, c.tagAt + 9, EASE_OUT);
        const badge = progress(frame, c.from + 4, c.from + 12, EASE_OUT);
        const strike = progress(frame, c.tagAt + 6, c.tagAt + 13, EASE_OUT);
        return (
          <AbsoluteFill
            key={c.id}
            style={{
              opacity: Math.min(enter, 1 - exit),
              translate: `${(1 - enter) * -120 + exit * 120}px 0px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: PHOTO.x,
                top: PHOTO.y,
                width: PHOTO.size,
                height: PHOTO.size,
                borderRadius: 36,
                overflow: "hidden",
                border: `2px solid rgba(239,206,108,0.5)`,
                boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
                scale: String(1 + (k === 0 ? 0.04 * (1 - enter) : 0)),
              }}
            >
              <Photo
                src={c.src}
                focus={c.focus}
                scale={[1.0, 1.05]}
                t={progress(frame, c.from, c.to + 6)}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: PHOTO.x + 22,
                top: PHOTO.y + 22,
                width: 132,
                height: 132,
                borderRadius: 66,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: COLORS.gold,
                color: COLORS.ink,
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 44,
                boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                scale: String(0.6 + 0.4 * badge),
                opacity: badge,
                rotate: "-8deg",
              }}
            >
              {`-${MAX_TIER.percentOff}%`}
            </div>
            <div
              style={{
                position: "absolute",
                left: PANEL.x,
                top: PANEL.y,
                width: PANEL.w,
                height: PANEL.h,
                borderRadius: 26,
                background: "#FFFBF4",
                border: "1.5px solid #E2CFB4",
                boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: Math.min(1, land * 1.6),
                translate: `0px ${(1 - land) * 40}px`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1.1,
                  color: COLORS.ink,
                }}
              >
                {c.product.shortTitle}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 22,
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    fontFamily: FONTS.mono,
                    fontWeight: 700,
                    fontSize: 30,
                    color: "rgba(23,11,2,0.5)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.price.regular}
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
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontWeight: 700,
                    fontSize: 50,
                    color: COLORS.walnut,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.price.sale}
                </span>
              </div>
              <Arabic
                size={27}
                weight={600}
                color={COLORS.walnut}
                style={{ marginTop: 2 }}
              >
                {`بخصم ${MAX_TIER.percentOff}% مع ${MAX_TIER.minQuantity} قطع أو أكتر`}
              </Arabic>
            </div>
          </AbsoluteFill>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 318,
          left: 60,
          right: 60,
          opacity: head,
          translate: `0px ${(1 - progress(frame, 210, 222, EASE_OUT)) * 18}px`,
        }}
      >
        <Arabic size={62} color={COLORS.ivoryText}>
          {`أفخم القطع بخصم ${MAX_TIER.percentOff}%`}
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
          reveal={progress(frame, 2, 18, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 2, 8) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 530,
          left: 60,
          right: 60,
          ...show(10),
        }}
      >
        <Arabic size={62} color={COLORS.gold}>
          العرض لحد الجمعة 13/11
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 616,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "center",
          gap: 22,
          ...show(14),
        }}
      >
        {SALE.tiers.map((t, k) => (
          <div
            key={t.minQuantity}
            style={{
              width: 252,
              height: 128,
              borderRadius: 24,
              border: `2px solid ${COLORS.gold}`,
              background: t.orMore ? "rgba(239,206,108,0.16)" : "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Arabic
              size={30}
              weight={600}
              color={COLORS.ivoryText}
              style={{ lineHeight: 1.1 }}
            >
              {k === 2 ? "4 أو أكتر" : QTY[k]}
            </Arabic>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 54,
                lineHeight: 1.05,
                ...goldText,
              }}
            >
              {`${t.percentOff}%`}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 776,
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
          top: 918,
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
          top: 1006,
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
            الخصم أوتوماتيك عند الدفع · توصيل لكل محافظات مصر
          </Arabic>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1094,
          left: 60,
          right: 60,
          ...show(30),
        }}
      >
        <Arabic size={34} weight={500} color="rgba(246,238,227,0.78)">
          {SALE.label.ar}
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export type BlackFridayProps = {
  /** Include the original score (disable for silent still previews). */
  audio?: boolean;
  /** Draw the Reels safe-zone guide (QA only). */
  showSafeZones?: boolean;
};

export const BlackFridayLadder: React.FC<BlackFridayProps> = ({
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
      <Ribbon opacity={1 - progress(frame, 338, 348, EASE_IN_OUT)} />
      <Sequence
        name="Hook"
        from={S.hook.from}
        durationInFrames={S.hook.to - S.hook.from}
      >
        <HookScene />
      </Sequence>
      <Sequence
        name="Ladder"
        from={S.ladder.from}
        durationInFrames={S.ladder.to - S.ladder.from}
      >
        <LadderScene />
      </Sequence>
      <Sequence
        name="Prices"
        from={S.prices.from}
        durationInFrames={S.prices.to - S.prices.from}
      >
        <PricesScene />
      </Sequence>
      <Sequence
        name="CTA"
        from={S.cta.from}
        durationInFrames={S.cta.to - S.cta.from}
      >
        <CtaScene />
      </Sequence>
      <Grain opacity={0.045} />
      {audio ? <Audio src={staticFile("audio/bf-ladder-score.wav")} /> : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
