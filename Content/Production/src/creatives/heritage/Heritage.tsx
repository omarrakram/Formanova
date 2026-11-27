import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import {
  ArchBox,
  ArchOutline,
  FULL_FRAME,
  archClip,
  mixArch,
} from "../../components/Arch";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain, Scrim, Vignette } from "../../components/Texture";
import { EASE_IN_OUT, EASE_OUT, fadeWindow, progress } from "../../lib/anim";
import { getImage, getProduct } from "../../lib/products";
import timeline from "./timeline.json";

/**
 * Creative 01: "One Piece With a Past" (emotional heritage ad, English).
 * Hypothesis: desire for a single characterful piece converts browsers who
 * furnish their homes with intention.
 */

const S = timeline.scenes;

const DETAIL_ARCH: ArchBox = { x: 130, y: 400, w: 820, h: 1120 };
const BRAND_ARCH: ArchBox = { x: 150, y: 575, w: 780, h: 945 };
const CTA_ARCH: ArchBox = { x: 150, y: 380, w: 780, h: 850 };

const IMG = {
  hook: getImage("sevres-candlestick", 8).file,
  detailPainted: getImage("chinoiserie-cachepot", 10).file,
  detailCrystal: getImage("czech-crystal-vase", 5).file,
  detailCloisonne: getImage("cloisonne-jar", 6).file,
  payoffMurano: getImage("murano-amber-vase", 2).file,
  payoffCachepot: getImage("chinoiserie-cachepot", 1).file,
  payoffSevres: getImage("sevres-candlestick", 3).file,
  brandGingerJar: getImage("bleu-blanc-ginger-jar", 1).file,
};

const ivoryShadow = "0 2px 28px rgba(8,5,2,0.55), 0 1px 2px rgba(8,5,2,0.35)";

const rise = (frame: number, start: number, length = 14, distance = 26) => ({
  opacity: progress(frame, start, start + length, EASE_OUT),
  translate: `0px ${(1 - progress(frame, start, start + length, EASE_OUT)) * distance}px`,
});

/* ------------------------------------------------------------------ */
/* Scene 1 - Hook                                                      */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const contract = progress(frame, 72, 90, EASE_IN_OUT);
  const box = mixArch(FULL_FRAME, DETAIL_ARCH, contract);
  const textOut = 1 - progress(frame, 64, 78, EASE_IN_OUT);

  return (
    <AbsoluteFill
      style={{
        clipPath: archClip(box, contract),
        opacity: 1 - progress(frame, 82, 92, EASE_IN_OUT),
      }}
    >
      <Photo
        src={IMG.hook}
        focus={[56, 40]}
        scale={[1.06, 1.15]}
        shift={[
          [0, 40],
          [-10, 14],
        ]}
        t={progress(frame, 0, 92)}
      />
      <Scrim from="top" height={520} opacity={0.55} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,9,5,0) 36%, rgba(14,9,5,0.42) 48%, rgba(14,9,5,0.66) 64%, rgba(14,9,5,0.74) 100%)",
        }}
      />
      <Vignette strength={0.4} />

      <AbsoluteFill style={{ opacity: textOut }}>
        <div
          style={{
            position: "absolute",
            top: 292,
            left: 80,
            right: 80,
            textAlign: "center",
            fontFamily: FONTS.body,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.32em",
            color: COLORS.gold,
            textShadow: ivoryShadow,
            ...rise(frame, 1, 14, 12),
          }}
        >
          FORMANOVA · EST. 1973
        </div>
        <div
          style={{
            position: "absolute",
            top: 836,
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
              fontWeight: 400,
              fontSize: 80,
              lineHeight: 1.05,
              ...rise(frame, 2),
            }}
          >
            Every home needs
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 124,
              lineHeight: 1.02,
              marginTop: 6,
              ...rise(frame, 7),
            }}
          >
            one piece
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 124,
              lineHeight: 1.02,
              ...rise(frame, 12),
            }}
          >
            with a past.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 - Details (hand-painted, hand-cut, raised cloisonné)        */
/* ------------------------------------------------------------------ */

const DETAILS = [
  {
    src: IMG.detailPainted,
    label: "Hand-painted porcelain.",
    caption: getProduct("chinoiserie-cachepot").title,
    focus: [52, 46] as [number, number],
    show: [0, 48],
    labelAt: [14, 46],
  },
  {
    src: IMG.detailCrystal,
    label: "Hand-cut crystal.",
    caption: getProduct("czech-crystal-vase").title,
    focus: [50, 40] as [number, number],
    show: [40, 78],
    labelAt: [46, 76],
  },
  {
    src: IMG.detailCloisonne,
    label: "Raised cloisonné.",
    caption: getProduct("cloisonne-jar").title,
    focus: [50, 45] as [number, number],
    show: [70, 124],
    labelAt: [76, 106],
  },
];

const DetailsScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% 38%, ${COLORS.espressoLift} 0%, ${COLORS.espresso} 55%, ${COLORS.ink} 100%)`,
      }}
    >
      <ArchOutline
        box={DETAIL_ARCH}
        color={COLORS.gold}
        opacity={0.5 * progress(frame, 12, 30, EASE_OUT)}
        draw={progress(frame, 10, 46, EASE_OUT)}
      />
      <AbsoluteFill style={{ clipPath: archClip(DETAIL_ARCH) }}>
        {DETAILS.map((d, i) => (
          <AbsoluteFill
            key={d.label}
            style={{
              opacity:
                i === 0
                  ? 1
                  : progress(frame, d.show[0], d.show[0] + 8, EASE_IN_OUT),
            }}
          >
            <Photo
              src={d.src}
              focus={d.focus}
              scale={[1.04, 1.12]}
              shift={[
                [0, 26],
                [0, -26],
              ]}
              t={progress(frame, d.show[0], d.show[1] + 10)}
            />
          </AbsoluteFill>
        ))}
        <Vignette strength={0.35} />
      </AbsoluteFill>

      {DETAILS.map((d) => (
        <div
          key={d.label}
          style={{
            position: "absolute",
            top: 290,
            left: 80,
            right: 80,
            textAlign: "center",
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontSize: 70,
            lineHeight: 1.1,
            color: COLORS.ivoryText,
            opacity: fadeWindow(frame, d.labelAt[0], d.labelAt[1], 7, 6),
            translate: `0px ${(1 - progress(frame, d.labelAt[0], d.labelAt[0] + 10, EASE_OUT)) * 18}px`,
          }}
        >
          {d.label}
        </div>
      ))}
      {DETAILS.map((d) => (
        <div
          key={d.caption}
          style={{
            position: "absolute",
            top: 1556,
            left: 80,
            right: 80,
            textAlign: "center",
            fontFamily: FONTS.body,
            fontStyle: "italic",
            fontSize: 36,
            color: COLORS.parchment,
            opacity: 0.85 * fadeWindow(frame, d.labelAt[0], d.labelAt[1], 7, 6),
          }}
        >
          {d.caption}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 - Payoff (step through the arch into the rooms)             */
/* ------------------------------------------------------------------ */

const PAYOFF = [
  {
    src: IMG.payoffSevres,
    product: getProduct("sevres-candlestick"),
    headline: "Chosen for character.",
    label: "Sèvres Château Candlestick",
    focus: [46, 52] as [number, number],
    show: [0, 54],
    textAt: [18, 54],
    scale: [1.0, 1.08] as [number, number],
    shift: [
      [-14, 0],
      [14, 0],
    ] as [[number, number], [number, number]],
  },
  {
    src: IMG.payoffCachepot,
    product: getProduct("chinoiserie-cachepot"),
    headline: "Not for trends.",
    label: "Vintage Chinoiserie Cachepot",
    focus: [50, 52] as [number, number],
    show: [46, 102],
    textAt: [58, 100],
    scale: [1.09, 1.12] as [number, number],
    shift: [
      [-12, 82],
      [12, 76],
    ] as [[number, number], [number, number]],
  },
  {
    src: IMG.payoffMurano,
    product: getProduct("murano-amber-vase"),
    headline: null,
    label: null,
    focus: [52, 54] as [number, number],
    show: [94, 166],
    textAt: [0, 0],
    scale: [1.0, 1.06] as [number, number],
    shift: [
      [-14, 0],
      [14, 0],
    ] as [[number, number], [number, number]],
  },
];

const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const open = progress(frame, 6, 26, EASE_IN_OUT);
  const close = progress(frame, 142, 160, EASE_IN_OUT);
  const box =
    close > 0
      ? mixArch(FULL_FRAME, BRAND_ARCH, close)
      : mixArch(DETAIL_ARCH, FULL_FRAME, open);
  const roundness = close > 0 ? close : 1 - open;
  const topScrim = fadeWindow(frame, 14, 104, 12, 12);

  return (
    <AbsoluteFill
      style={{
        clipPath: archClip(box, roundness),
        opacity:
          progress(frame, 0, 8, EASE_IN_OUT) *
          (1 - progress(frame, 152, 164, EASE_IN_OUT)),
      }}
    >
      {PAYOFF.map((p, i) => (
        <AbsoluteFill
          key={p.src}
          style={{
            opacity:
              i === 0
                ? 1
                : progress(frame, p.show[0], p.show[0] + 10, EASE_IN_OUT),
          }}
        >
          <Photo
            src={p.src}
            focus={p.focus}
            scale={p.scale}
            shift={p.shift}
            t={progress(frame, p.show[0], p.show[1])}
          />
        </AbsoluteFill>
      ))}
      <Scrim from="top" height={640} opacity={0.66 * topScrim} />
      <Scrim from="bottom" height={760} opacity={0.5} />
      <Vignette strength={0.4} />

      {PAYOFF.map((p, i) =>
        p.headline && p.label ? (
          <div
            key={p.product.id}
            style={{
              position: "absolute",
              top: 290,
              left: 80,
              right: 80,
              textAlign: "center",
              color: COLORS.ivoryText,
              textShadow: ivoryShadow,
              opacity: fadeWindow(frame, p.textAt[0], p.textAt[1], 12, 8),
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontStyle: "italic",
                fontSize: 84,
                lineHeight: 1.05,
                ...rise(frame, p.textAt[0], 16, 20),
              }}
            >
              {p.headline}
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: FONTS.body,
                fontWeight: 500,
                fontSize: 28,
                letterSpacing: "0.2em",
                color: COLORS.gold,
                ...rise(frame, p.textAt[0] + 6, 14, 10),
              }}
            >
              {`NO. 0${i + 1} — ${p.label.toUpperCase()}`}
            </div>
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4 - Brand (the collection, the promise)                       */
/* ------------------------------------------------------------------ */

const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${COLORS.espressoLift} 0%, ${COLORS.espresso} 55%, ${COLORS.ink} 100%)`,
      }}
    >
      <AbsoluteFill style={{ clipPath: archClip(BRAND_ARCH) }}>
        <Photo
          src={IMG.brandGingerJar}
          box={BRAND_ARCH}
          focus={[49, 52]}
          scale={[1.04, 1.12]}
          shift={[
            [0, 10],
            [0, -10],
          ]}
          t={progress(frame, 0, 90)}
        />
        <Vignette strength={0.3} />
      </AbsoluteFill>
      <ArchOutline
        box={BRAND_ARCH}
        color={COLORS.gold}
        opacity={0.5 * progress(frame, 14, 30, EASE_OUT)}
        draw={progress(frame, 12, 50, EASE_OUT)}
      />

      <div
        style={{
          position: "absolute",
          top: 292,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: "0.26em",
          color: COLORS.gold,
          ...rise(frame, 10, 16, 12),
        }}
      >
        CURATED VINTAGE &amp; ANTIQUES · EST. 1973
      </div>
      <div
        style={{
          position: "absolute",
          top: 352,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontSize: 80,
          lineHeight: 1.08,
          color: COLORS.ivoryText,
        }}
      >
        <div style={rise(frame, 14, 16, 20)}>Bringing the past</div>
        <div style={rise(frame, 22, 16, 20)}>into the future.</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1556,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontStyle: "italic",
          fontSize: 36,
          color: COLORS.parchment,
          opacity: 0.85 * progress(frame, 24, 40, EASE_OUT),
        }}
      >
        {getProduct("bleu-blanc-ginger-jar").title}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 5 - Call to action                                            */
/* ------------------------------------------------------------------ */

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        opacity: progress(frame, 0, 8, EASE_IN_OUT),
        background: `radial-gradient(ellipse 70% 42% at 50% 36%, #3A271A 0%, ${COLORS.espresso} 58%, ${COLORS.ink} 100%)`,
      }}
    >
      <ArchOutline
        box={CTA_ARCH}
        color={COLORS.gold}
        opacity={0.55}
        draw={progress(frame, 6, 40, EASE_OUT)}
        strokeWidth={2}
      />
      <div
        style={{
          position: "absolute",
          top: 548,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          width={660}
          reveal={progress(frame, 3, 25, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 3, 9) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 812,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontStyle: "italic",
          fontSize: 58,
          color: COLORS.ivoryText,
          ...rise(frame, 14, 14, 16),
        }}
      >
        Find your piece with a past.
      </div>
      <div
        style={{
          position: "absolute",
          top: 928,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...rise(frame, 20, 14, 16),
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
            boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          SHOP NOW
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1072,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 42,
          letterSpacing: "0.05em",
          color: COLORS.ivoryText,
          ...rise(frame, 24, 14, 12),
        }}
      >
        formanovavintage.com
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export type HeritageProps = {
  /** Include the original score (disable for silent still previews). */
  audio?: boolean;
  /** Draw the Reels safe-zone guide (QA only). */
  showSafeZones?: boolean;
};

export const Heritage: React.FC<HeritageProps> = ({
  audio = true,
  showSafeZones = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Sequence
        name="Details"
        from={S.details.from}
        durationInFrames={S.details.to - S.details.from}
      >
        <DetailsScene />
      </Sequence>
      <Sequence
        name="Brand"
        from={S.brand.from}
        durationInFrames={S.brand.to - S.brand.from}
      >
        <BrandScene />
      </Sequence>
      <Sequence
        name="Payoff"
        from={S.payoff.from}
        durationInFrames={S.payoff.to - S.payoff.from}
      >
        <PayoffScene />
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
      <Grain opacity={0.055} />
      {audio ? <Audio src={staticFile("audio/heritage-score.wav")} /> : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
