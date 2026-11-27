import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { Arabic, CollectionChip, PriceTag } from "../../components/Commerce";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain } from "../../components/Texture";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, progress } from "../../lib/anim";
import { priceLabel as campaignPriceLabel } from "../../lib/pricing";
import { Product, getImage, getProduct } from "../../lib/products";
import timeline from "./timeline.json";

/**
 * Creative 02: "Not Your Ordinary Decor" (direct-response, Egyptian Arabic).
 * Hypothesis: showing specific, currently available pieces with real prices
 * and a clear delivery promise turns curiosity into product-page visits.
 */

const S = timeline.scenes;

/** Prices as recorded for the October campaign (30 October 2026). */
const octoberPrice = (id: string) =>
  campaignPriceLabel("2026-10-sales-launch", id);
const CARD = { x: 110, y: 560, w: 860, h: 860 };
const TALL_CARD = { x: 110, y: 560, w: 860, h: 960 };
const PLINTH_Y = 1262;

type Side = "left" | "right";
type CardSpec = {
  product: Product;
  src: string;
  from: number;
  to: number;
  tagAt: number;
  tagSide: Side;
  focus: [number, number];
  scale: [number, number];
};

const card = (
  id: string,
  position: number,
  from: number,
  to: number,
  tagAt: number,
  tagSide: Side,
  focus: [number, number] = [50, 50],
  scale: [number, number] = [1.0, 1.06],
): CardSpec => ({
  product: getProduct(id),
  src: getImage(id, position).file,
  from,
  to,
  tagAt,
  tagSide,
  focus,
  scale,
});

const FLIPS = [
  getImage("chinoiserie-egg", 1).file,
  getImage("cobalt-centerpiece", 2).file,
  getImage("murano-amber-vase", 1).file,
  getImage("satsuma-bonbonniere", 2).file,
  getImage("bleu-blanc-potiche", 2).file,
  getImage("bohemian-gold-vase", 3).file,
];

const [tag1, tag2, tag3, tag4, tag5, tag6, tag7] = timeline.tags;
const [p1, p2, p3, p4] = timeline.cuts.proof;
const [d1, d2, d3] = timeline.cuts.desire;

/** Proof cards, in absolute frames. */
const PROOF: CardSpec[] = [
  card("bleu-blanc-ginger-jar", 1, p1, p2, tag1, "right", [44, 52]),
  card("italian-murano-vase", 1, p2, p3, tag2, "right", [52, 50]),
  card("chinoiserie-potiches-pair", 2, p3, p4, tag3, "right", [50, 46]),
  card("czech-crystal-vase", 3, p4, d1, tag4, "right", [50, 50]),
];

/** Desire cards: close details with the verified craft claim. */
const DESIRE: (CardSpec & {
  claim: string;
  sub: string;
  priceLabel: string;
})[] = [
  {
    ...card(
      "satsuma-potiche",
      5,
      d1,
      d2,
      tag5,
      "right",
      [46, 58],
      [1.28, 1.38],
    ),
    claim: "مرسومة يدويًا",
    sub: "بوتيش شينواه ساتسوما",
    priceLabel: `From ${octoberPrice("satsuma-potiche")}`,
  },
  {
    ...card("cloisonne-jar", 6, d2, d3, tag6, "right", [50, 48], [1.04, 1.12]),
    claim: "كلوازينه أنتيك",
    sub: "شغل بارز بتفاصيل يدوية",
    priceLabel: octoberPrice("cloisonne-jar"),
  },
  {
    ...card(
      "chinoiserie-egg",
      5,
      d3,
      timeline.cuts.mosaic + 3,
      tag7,
      "right",
      [50, 42],
      [1.04, 1.1],
    ),
    claim: "مشغولة بمياه الذهب",
    sub: "بيضة شينواه برسومات بارزة",
    priceLabel: octoberPrice("chinoiserie-egg"),
  },
];

const MOSAIC = [
  getImage("bleu-blanc-ginger-jar", 1).file,
  getImage("italian-murano-vase", 2).file,
  getImage("chinoiserie-potiches-pair", 4).file,
  getImage("cloisonne-jar", 1).file,
  getImage("czech-crystal-vase", 3).file,
  getImage("chinoiserie-egg", 1).file,
  getImage("bleu-blanc-potiche", 2).file,
  getImage("satsuma-potiche", 2).file,
  getImage("bohemian-gold-vase", 3).file,
];

/* ------------------------------------------------------------------ */
/* Shared layers                                                       */
/* ------------------------------------------------------------------ */

const Stage: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 110% 70% at 50% 28%, #FCF8F4 0%, ${COLORS.cream} 48%, #EFE3D8 100%)`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: PLINTH_Y,
        bottom: 0,
        background: `linear-gradient(to bottom, ${COLORS.espressoLift} 0%, ${COLORS.espresso} 40%, ${COLORS.ink} 100%)`,
        borderTop: `2px solid ${COLORS.goldDeep}`,
      }}
    />
  </AbsoluteFill>
);

const BrandMark: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 280,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONTS.body,
      fontWeight: 600,
      fontSize: 28,
      letterSpacing: "0.42em",
      paddingLeft: "0.42em",
      color: COLORS.walnut,
      opacity,
    }}
  >
    FORMANOVA
  </div>
);

/** Card entrance/exit as a short horizontal "deck" move (RTL: next comes from the left). */
const deck = (frame: number, from: number, to: number, first = false) => {
  const enter = first ? 1 : progress(frame, from, from + 7, EASE_OUT);
  const exit = progress(frame, to - 1, to + 6, EASE_IN);
  return {
    opacity: Math.min(enter, 1 - exit),
    translate: `${(1 - enter) * -120 + exit * 120}px 0px`,
  };
};

const ProductCard: React.FC<{
  spec: CardSpec;
  box: typeof CARD;
  frame: number;
  first?: boolean;
  priceLabel?: string;
  punch?: number;
}> = ({ spec, box, frame, first = false, priceLabel, punch = 0 }) => {
  if (frame < spec.from - 1 || frame > spec.to + 7) return null;
  const drop = progress(frame, spec.tagAt, spec.tagAt + 9, EASE_OUT);
  const settle = progress(frame, spec.tagAt, spec.tagAt + 16, EASE_OUT);
  const angle = (spec.tagSide === "right" ? 1 : -1) * (-12 + 8 * settle);

  return (
    <AbsoluteFill style={deck(frame, spec.from, spec.to, first)}>
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow:
            "0 30px 60px rgba(34,20,9,0.28), 0 6px 14px rgba(34,20,9,0.14)",
          scale: String(1 + punch * 0.05),
        }}
      >
        <Photo
          src={spec.src}
          focus={spec.focus}
          scale={spec.scale}
          t={progress(frame, spec.from, spec.to + 6)}
        />
      </div>
      <CollectionChip
        en={spec.product.collection.en}
        ar={spec.product.collection.ar}
        style={{
          top: box.y + 30,
          [spec.tagSide === "right" ? "left" : "right"]: box.x + 28,
          opacity: progress(frame, spec.from + 2, spec.from + 9, EASE_OUT),
        }}
      />
      <PriceTag
        name={spec.product.shortTitle}
        price={priceLabel ?? octoberPrice(spec.product.id)}
        drop={drop}
        angle={angle}
        style={{
          top: box.y + 66,
          [spec.tagSide === "right" ? "right" : "left"]:
            1080 - (box.x + box.w) + 26,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flips = timeline.flips;
  const index = flips.reduce((acc, f, i) => (frame >= f ? i : acc), 0);
  const since = frame - flips[index];
  const out = progress(frame, 47, 55, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow:
            "0 30px 60px rgba(34,20,9,0.28), 0 6px 14px rgba(34,20,9,0.14)",
          scale: String(1 + 0.045 * (1 - progress(since, 0, 7, EASE_OUT))),
        }}
      >
        <Photo
          src={FLIPS[index]}
          focus={[50, 50]}
          scale={[1.04, 1.0]}
          t={progress(since, 0, 8)}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 326,
          left: 60,
          right: 60,
          opacity: 1 - out,
          scale: String(1.035 - 0.035 * progress(frame, 0, 8, EASE_OUT)),
        }}
      >
        <Arabic size={80} style={{ lineHeight: 1.2 }}>
          ليه بيتك يبقى
        </Arabic>
        <Arabic size={80} style={{ lineHeight: 1.2 }}>
          شبه كل البيوت؟
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

const ProofScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.proof.from;
  const head = progress(frame, 56, 66, EASE_OUT);
  const headOut = progress(frame, 178, 186, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      {PROOF.map((spec, i) => (
        <ProductCard
          key={spec.product.id}
          spec={spec}
          box={CARD}
          frame={frame}
          first={i === 0}
          punch={i === 0 ? 1 - progress(frame, 45, 53, EASE_OUT) : 0}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 316,
          left: 60,
          right: 60,
          opacity: head * (1 - headOut),
          translate: `0px ${(1 - head) * 18}px`,
        }}
      >
        <Arabic size={92}>مش ديكور عادي.</Arabic>
        <Arabic
          size={38}
          weight={500}
          color={COLORS.walnut}
          style={{ marginTop: 4 }}
        >
          بلو بلا · مورانو · كريستال · شينواه
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

const DesireScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.desire.from;

  return (
    <AbsoluteFill>
      {DESIRE.map((spec) => (
        <ProductCard
          key={spec.product.id}
          spec={spec}
          box={TALL_CARD}
          frame={frame}
          priceLabel={spec.priceLabel}
        />
      ))}
      {DESIRE.map((spec) => {
        const vis =
          progress(frame, spec.from + 2, spec.from + 10, EASE_OUT) *
          (1 - progress(frame, spec.to - 2, spec.to + 4, EASE_IN));
        return (
          <div
            key={spec.claim}
            style={{
              position: "absolute",
              top: 316,
              left: 60,
              right: 60,
              opacity: vis,
              translate: `0px ${(1 - progress(frame, spec.from + 2, spec.from + 12, EASE_OUT)) * 18}px`,
            }}
          >
            <Arabic size={92}>{spec.claim}</Arabic>
            <Arabic
              size={38}
              weight={500}
              color={COLORS.walnut}
              style={{ marginTop: 4 }}
            >
              {spec.sub}
            </Arabic>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const MosaicScene: React.FC = () => {
  const local = useCurrentFrame();
  const frame = local + S.mosaic.from;
  const size = 276;
  const gap = 16;
  const head = progress(frame, 323, 333, EASE_OUT);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: `540px ${CARD.y + CARD.h / 2}px`,
          scale: String(
            1 +
              0.035 * progress(frame, S.mosaic.from, S.mosaic.to, EASE_IN_OUT),
          ),
        }}
      >
        {MOSAIC.map((src, k) => {
          const at = timeline.tiles[k];
          const p = progress(frame, at, at + 8, EASE_OUT);
          const col = k % 3;
          const row = Math.floor(k / 3);
          return (
            <div
              key={src}
              style={{
                position: "absolute",
                left: CARD.x + col * (size + gap),
                top: CARD.y + row * (size + gap),
                width: size,
                height: size,
                borderRadius: 26,
                overflow: "hidden",
                opacity: p,
                scale: String(0.82 + 0.18 * p),
                boxShadow: "0 16px 30px rgba(34,20,9,0.24)",
              }}
            >
              <Photo
                src={src}
                focus={[50, 52]}
                scale={[1.0, 1.1]}
                t={progress(frame, at, S.mosaic.to)}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 322,
          left: 60,
          right: 60,
          opacity: head,
          translate: `0px ${(1 - head) * 18}px`,
        }}
      >
        <Arabic size={80}>كل قطعة متختارة بعناية</Arabic>
        <Arabic
          size={38}
          weight={500}
          color={COLORS.walnut}
          style={{ marginTop: 10 }}
        >
          فينتج وأنتيك · من ١٩٧٣
        </Arabic>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = progress(frame, 0, 14, EASE_IN_OUT);
  const show = (start: number) => ({
    opacity: progress(frame, start, start + 12, EASE_OUT),
    translate: `0px ${(1 - progress(frame, start, start + 12, EASE_OUT)) * 16}px`,
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: PLINTH_Y * (1 - rise),
          bottom: 0,
          background: `radial-gradient(ellipse 80% 45% at 50% 34%, #3A271A 0%, ${COLORS.espresso} 60%, ${COLORS.ink} 100%)`,
          borderTop: `2px solid ${COLORS.goldDeep}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 452,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          width={640}
          reveal={progress(frame, 6, 26, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 6, 12) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 704,
          left: 60,
          right: 60,
          ...show(14),
        }}
      >
        <Arabic size={72} color={COLORS.ivoryText}>
          قطعة واحدة بتفرق.
        </Arabic>
      </div>
      <div
        style={{
          position: "absolute",
          top: 850,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(20),
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
            boxShadow: "0 12px 40px rgba(0,0,0,0.38)",
          }}
        >
          تسوّق الآن
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1000,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 44,
          letterSpacing: "0.04em",
          color: COLORS.ivoryText,
          ...show(24),
        }}
      >
        formanovavintage.com
      </div>
      <div
        style={{
          position: "absolute",
          top: 1094,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(28),
        }}
      >
        <div
          style={{
            padding: "10px 34px 14px",
            borderRadius: 999,
            border: `1.5px solid rgba(239,206,108,0.6)`,
          }}
        >
          <Arabic size={34} weight={500} color={COLORS.goldSoft}>
            توصيل لكل محافظات مصر خلال ٣–٥ أيام عمل
          </Arabic>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export type ProductAdProps = {
  /** Include the original score (disable for silent still previews). */
  audio?: boolean;
  /** Draw the Reels safe-zone guide (QA only). */
  showSafeZones?: boolean;
};

export const ProductAd: React.FC<ProductAdProps> = ({
  audio = true,
  showSafeZones = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <Stage />
      <BrandMark opacity={1 - progress(frame, 372, 382, EASE_IN_OUT)} />
      <Sequence
        name="Hook"
        from={S.hook.from}
        durationInFrames={S.hook.to - S.hook.from}
      >
        <HookScene />
      </Sequence>
      <Sequence
        name="Proof"
        from={S.proof.from}
        durationInFrames={S.proof.to - S.proof.from}
      >
        <ProofScene />
      </Sequence>
      <Sequence
        name="Desire"
        from={S.desire.from}
        durationInFrames={S.desire.to - S.desire.from}
      >
        <DesireScene />
      </Sequence>
      <Sequence
        name="Mosaic"
        from={S.mosaic.from}
        durationInFrames={S.mosaic.to - S.mosaic.from}
      >
        <MosaicScene />
      </Sequence>
      <Sequence
        name="CTA"
        from={S.cta.from}
        durationInFrames={S.cta.to - S.cta.from}
      >
        <CtaScene />
      </Sequence>
      <Grain opacity={0.035} />
      {audio ? <Audio src={staticFile("audio/product-score.wav")} /> : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
