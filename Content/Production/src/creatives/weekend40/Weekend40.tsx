import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "../../brand/tokens";
import { Clock, tickSeconds } from "../../components/Clock";
import { Arabic } from "../../components/Commerce";
import { Logo } from "../../components/Logo";
import { Photo } from "../../components/Photo";
import { ProductName } from "../../components/ProductName";
import { SafeZoneGuide } from "../../components/SafeZoneGuide";
import { Grain } from "../../components/Texture";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, progress } from "../../lib/anim";
import { getImage, getProduct } from "../../lib/products";
import { assertSoldOut, fortyOff } from "../../lib/weekend40";
import friday from "./w40-friday.json";
import satA from "./w40-sat-a.json";
import satB from "./w40-sat-b.json";
import satC from "./w40-sat-c.json";
import sunA from "./w40-sun-a.json";
import sunB from "./w40-sun-b.json";
import sunC from "./w40-sun-c.json";
import teaser from "./w40-teaser.json";

/**
 * Weekend 40% (Fri 27 Nov, 8 PM – Sun 29 Nov, 11:59 PM): eight 15-second
 * films from one design. Each variant (a JSON file beside this one) sets the
 * language, the hook (a giant 40%, a clock, a sold-out wall, a saving or the
 * teaser countdown), the pieces and the urgency copy. Prices come from the
 * campaign's recorded check; a piece can only be shown as sold out if that
 * check recorded it as sold out, and never at 40% off if it is.
 */

type Piece = { id: string; image: number; focus: number[] };
type Variant = {
  id: string;
  slug: string;
  lang: "ar" | "en";
  hook: "big40" | "clock" | "sold" | "save" | "teaser";
  hookEnd: number;
  ribbon: string;
  hookLines: string[];
  clock?: number[];
  hero?: Piece;
  sold?: Piece[];
  productsHeadline: string;
  products: Piece[];
  priceNote: string;
  cta: { title: string; deadline: string[]; note: string; button: string };
};

const VARIANTS = {
  W40Teaser: teaser,
  W40Friday: friday,
  W40SatA: satA,
  W40SatB: satB,
  W40SatC: satC,
  W40SunA: sunA,
  W40SunB: sunB,
  W40SunC: sunC,
} as unknown as Record<string, Variant>;

export const WEEKEND40_IDS = Object.keys(VARIANTS);

const CTA = 330;

const goldText: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #FBE7A6 0%, #EFCE6C 38%, #C99A3C 72%, #F3D98C 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const photoOf = (p: Piece) => ({
  src: getImage(p.id, p.image).file,
  focus: [p.focus[0], p.focus[1]] as [number, number],
  name: getProduct(p.id).shortTitle,
});

/** Text in the variant's language: El Messiri right-to-left, or the Latin faces. */
const Line: React.FC<{
  lang: "ar" | "en";
  size: number;
  color?: string;
  weight?: number;
  latin?: "display" | "body" | "caps";
  italic?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  lang,
  size,
  color = COLORS.ivoryText,
  weight,
  latin = "display",
  italic = true,
  style,
  children,
}) =>
  lang === "ar" ? (
    <Arabic size={size} weight={weight ?? 700} color={color} style={style}>
      {children}
    </Arabic>
  ) : (
    <div
      style={{
        textAlign: "center",
        color,
        fontFamily: latin === "display" ? FONTS.display : FONTS.body,
        fontStyle: latin === "caps" ? "normal" : italic ? "italic" : "normal",
        fontWeight: weight ?? (latin === "caps" ? 600 : 500),
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: latin === "caps" ? "0.18em" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );

const At: React.FC<{
  top: number;
  frame: number;
  start: number;
  children: React.ReactNode;
}> = ({ top, frame, start, children }) => {
  const p = progress(frame, start, start + 10, EASE_OUT);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        opacity: p,
        translate: `0px ${(1 - p) * 14}px`,
      }}
    >
      {children}
    </div>
  );
};

const PhotoCard: React.FC<{
  piece: Piece;
  box: { x: number; y: number; w: number; h: number };
  t: number;
}> = ({ piece, box, t }) => {
  const p = photoOf(piece);
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        borderRadius: 32,
        overflow: "hidden",
        border: `2px solid rgba(239,206,108,0.55)`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
      }}
    >
      <Photo src={p.src} focus={p.focus} scale={[1.04, 1.12]} t={t} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Hooks                                                                */
/* ------------------------------------------------------------------ */

const Big40: React.FC<{ v: Variant; frame: number }> = ({ v, frame }) => {
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);
  const ar = v.lang === "ar";
  return (
    <>
      <At top={318} frame={frame} start={-10}>
        <Line
          lang={v.lang}
          size={ar ? 56 : 40}
          color={ar ? COLORS.ivoryText : COLORS.gold}
          latin="caps"
        >
          {v.hookLines[0]}
        </Line>
      </At>
      <div
        style={{
          position: "absolute",
          top: 352,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: 290,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          scale: String(
            (1 + 0.16 * punch) * (1 + 0.04 * progress(frame, 12, 66)),
          ),
          ...goldText,
        }}
      >
        40%
      </div>
      <At top={652} frame={frame} start={4}>
        <Line lang={v.lang} size={ar ? 50 : 62}>
          {v.hookLines[1]}
        </Line>
      </At>
      <At top={ar ? 730 : 736} frame={frame} start={12}>
        <Line
          lang={v.lang}
          size={ar ? 38 : 40}
          color={COLORS.gold}
          weight={ar ? 600 : 500}
          latin="body"
        >
          {v.hookLines[2]}
        </Line>
      </At>
      {v.hero ? (
        <PhotoCard
          piece={v.hero}
          box={{ x: 110, y: 806, w: 860, h: 430 }}
          t={progress(frame, 0, 70)}
        />
      ) : null}
    </>
  );
};

const ClockHook: React.FC<{ v: Variant; frame: number }> = ({ v, frame }) => {
  const [h, m, s] = v.clock ?? [11, 58, 30];
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);
  const teaser = v.hook === "teaser";
  return (
    <>
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
          fontSize: teaser ? 116 : 140,
          lineHeight: 1.12,
          scale: String(1 + 0.14 * punch),
          ...goldText,
        }}
      >
        {v.hookLines[0]}
      </div>
      <div
        style={{
          position: "absolute",
          top: teaser ? 486 : 500,
          left: 540 - 175,
          scale: String(0.9 + 0.1 * progress(frame, 0, 14, EASE_OUT)),
        }}
      >
        <Clock
          size={350}
          hours={h}
          minutes={m}
          seconds={tickSeconds(frame, s)}
          glow={0.5 + 0.5 * Math.sin((frame / 15) * Math.PI) ** 2}
        />
      </div>
      <At top={880} frame={frame} start={6}>
        <Line lang={v.lang} size={teaser ? 56 : 46}>
          {v.hookLines[1]}
        </Line>
      </At>
      <At top={teaser ? 968 : 962} frame={frame} start={30}>
        <Line lang={v.lang} size={teaser ? 46 : 50} color={COLORS.gold}>
          {v.hookLines[2]}
        </Line>
      </At>
    </>
  );
};

const SOLD_GRID = [
  { x: 110, y: 444, w: 420, h: 320 },
  { x: 550, y: 444, w: 420, h: 320 },
  { x: 110, y: 784, w: 420, h: 320 },
  { x: 550, y: 784, w: 420, h: 320 },
];

const SoldHook: React.FC<{ v: Variant; frame: number }> = ({ v, frame }) => {
  const ar = v.lang === "ar";
  return (
    <>
      <At top={318} frame={frame} start={-10}>
        <Line lang={v.lang} size={ar ? 66 : 80}>
          {v.hookLines[0]}
        </Line>
      </At>
      {(v.sold ?? []).map((piece, k) => {
        assertSoldOut(piece.id);
        const box = SOLD_GRID[k];
        const at = 8 + k * 8;
        const stamp = progress(frame, at, at + 6, EASE_OUT);
        return (
          <React.Fragment key={piece.id}>
            <div style={{ filter: `grayscale(${0.55 * stamp})` }}>
              <PhotoCard piece={piece} box={box} t={progress(frame, 0, 96)} />
            </div>
            <div
              style={{
                position: "absolute",
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                lang={ar ? "ar" : undefined}
                dir={ar ? "rtl" : undefined}
                style={{
                  padding: ar ? "2px 30px 8px" : "10px 26px",
                  border: "5px solid #C4302B",
                  borderRadius: 14,
                  background: "rgba(255,251,244,0.88)",
                  color: "#C4302B",
                  fontFamily: ar ? FONTS.arabic : FONTS.body,
                  fontWeight: 700,
                  fontSize: ar ? 64 : 44,
                  letterSpacing: ar ? undefined : "0.14em",
                  rotate: "-12deg",
                  opacity: stamp,
                  scale: String(1 + 0.5 * (1 - stamp)),
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                {ar ? "نفدت" : "SOLD OUT"}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <At top={1128} frame={frame} start={44}>
        <Line
          lang={v.lang}
          size={ar ? 40 : 38}
          color={COLORS.gold}
          weight={ar ? 600 : 500}
          latin="body"
        >
          {v.hookLines[1]}
        </Line>
      </At>
    </>
  );
};

const SaveHook: React.FC<{ v: Variant; frame: number }> = ({ v, frame }) => {
  const hero = v.hero as Piece;
  const punch = 1 - progress(frame, 0, 12, EASE_OUT);
  return (
    <>
      <At top={318} frame={frame} start={-10}>
        <Line lang={v.lang} size={56}>
          {v.hookLines[0]}
        </Line>
      </At>
      <div
        style={{
          position: "absolute",
          top: 398,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: 150,
          lineHeight: 1,
          whiteSpace: "nowrap",
          scale: String(1 + 0.14 * punch),
          ...goldText,
        }}
      >
        {fortyOff(hero.id).saving}
      </div>
      <At top={572} frame={frame} start={6}>
        <Line lang={v.lang} size={44}>
          {v.hookLines[1]}
        </Line>
      </At>
      <At top={642} frame={frame} start={14}>
        <Line lang={v.lang} size={36} color={COLORS.gold} weight={600}>
          {v.hookLines[2]}
        </Line>
      </At>
      <PhotoCard
        piece={hero}
        box={{ x: 110, y: 716, w: 860, h: 520 }}
        t={progress(frame, 0, 96)}
      />
    </>
  );
};

const HookScene: React.FC<{ v: Variant }> = ({ v }) => {
  const frame = useCurrentFrame();
  const out = progress(frame, v.hookEnd - 10, v.hookEnd, EASE_IN);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {v.hook === "big40" ? <Big40 v={v} frame={frame} /> : null}
      {v.hook === "clock" || v.hook === "teaser" ? (
        <ClockHook v={v} frame={frame} />
      ) : null}
      {v.hook === "sold" ? <SoldHook v={v} frame={frame} /> : null}
      {v.hook === "save" ? <SaveHook v={v} frame={frame} /> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Pieces at 40% off, one card per beat group                            */
/* ------------------------------------------------------------------ */

const CARD = { x: 190, y: 404, w: 700, h: 646 };
const PANEL = { x: 150, y: 1070, w: 780, h: 172 };

const ProductsScene: React.FC<{ v: Variant }> = ({ v }) => {
  const frame = useCurrentFrame() + v.hookEnd - 6;
  const ar = v.lang === "ar";
  const slot = (CTA - v.hookEnd) / v.products.length;
  const head =
    progress(frame, v.hookEnd, v.hookEnd + 10, EASE_OUT) *
    (1 - progress(frame, CTA - 8, CTA + 2, EASE_IN));

  return (
    <AbsoluteFill>
      {v.products.map((piece, k) => {
        const s = v.hookEnd + k * slot;
        const e = s + slot;
        if (frame < s - 2 || frame > e + 8) return null;
        const p = photoOf(piece);
        const price = fortyOff(piece.id);
        const dir = (ar ? -1 : 1) * (k % 2 ? -1 : 1);
        const enter = progress(frame, s, s + 8, EASE_OUT);
        const exit = progress(frame, e - 2, e + 6, EASE_IN);
        const panel = progress(frame, s + 4, s + 12, EASE_OUT);
        const strike = progress(frame, s + 10, s + 16, EASE_OUT);
        const pop = progress(frame, s + 13, s + 19, EASE_OUT);
        const note = v.priceNote === "save" ? null : v.priceNote;
        return (
          <AbsoluteFill
            key={piece.id + k}
            style={{
              opacity: Math.min(enter, 1 - exit),
              translate: `${(1 - enter) * dir * 140 - exit * dir * 140}px 0px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: CARD.x,
                top: CARD.y,
                width: CARD.w,
                height: CARD.h,
                padding: "0px 12px 12px",
                borderRadius: 32,
                background:
                  "linear-gradient(160deg, #F8E3A0 0%, #EFCE6C 45%, #D9B25A 100%)",
                boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                lang={ar ? "ar" : undefined}
                dir={ar ? "rtl" : undefined}
                style={{
                  height: 66,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: ar ? FONTS.arabic : FONTS.body,
                  fontWeight: 700,
                  fontSize: ar ? 40 : 34,
                  letterSpacing: ar ? undefined : "0.2em",
                  color: COLORS.ink,
                }}
              >
                {ar ? "خصم 40%" : "40% OFF"}
              </div>
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  borderRadius: 22,
                  overflow: "hidden",
                }}
              >
                <Photo
                  src={p.src}
                  focus={p.focus}
                  scale={[1.0, 1.07]}
                  t={progress(frame, s - 4, e + 6)}
                />
              </div>
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
                gap: 2,
                opacity: Math.min(1, panel * 1.5),
                translate: `0px ${(1 - panel) * 30}px`,
              }}
            >
              <ProductName
                name={p.name}
                style={{
                  fontFamily: FONTS.body,
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1.1,
                  textAlign: "center",
                  color: COLORS.ink,
                  padding: "0 24px",
                }}
              />
              <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
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
                  {price.regular}
                  <span
                    style={{
                      position: "absolute",
                      left: -4,
                      top: "52%",
                      height: 3,
                      width: `calc(${strike * 100}% + 8px)`,
                      background: "rgba(163,52,31,0.9)",
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
                    display: "inline-block",
                    opacity: 0.35 + 0.65 * pop,
                    translate: `0px ${(1 - pop) * 10}px`,
                  }}
                >
                  {price.sale}
                </span>
              </div>
              {note ? (
                <Line
                  lang={v.lang}
                  size={ar ? 27 : 22}
                  color={COLORS.walnut}
                  weight={600}
                  latin="caps"
                >
                  {note}
                </Line>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: ar ? "row-reverse" : "row",
                    alignItems: "baseline",
                    gap: 12,
                    opacity: pop,
                  }}
                >
                  <span
                    lang={ar ? "ar" : undefined}
                    style={{
                      fontFamily: ar ? FONTS.arabic : FONTS.body,
                      fontWeight: 700,
                      fontSize: ar ? 30 : 24,
                      letterSpacing: ar ? undefined : "0.16em",
                      color: "#A3341F",
                    }}
                  >
                    {ar ? "وفّر" : "SAVE"}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontWeight: 700,
                      fontSize: 30,
                      color: "#A3341F",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {price.saving}
                  </span>
                </div>
              )}
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
          translate: `0px ${(1 - head) * 16}px`,
        }}
      >
        <Line lang={v.lang} size={ar ? 54 : 60}>
          {v.productsHeadline}
        </Line>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Call to action                                                       */
/* ------------------------------------------------------------------ */

const CtaScene: React.FC<{ v: Variant }> = ({ v }) => {
  const frame = useCurrentFrame();
  const ar = v.lang === "ar";
  const show = (start: number) => ({
    opacity: progress(frame, start, start + 10, EASE_OUT),
    translate: `0px ${(1 - progress(frame, start, start + 10, EASE_OUT)) * 16}px`,
  });
  // The teaser runs before the discount is live, so only the ad films
  // promise the automatic discount.
  const auto = v.hook !== "teaser";
  const extra = ar
    ? auto
      ? "أوتوماتيك عند الدفع · توصيل لكل محافظات مصر"
      : "توصيل لكل محافظات مصر"
    : [
        auto ? "Applied automatically at checkout" : null,
        v.cta.note.includes("Delivery") ? null : "Delivery across Egypt",
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <AbsoluteFill
      style={{
        opacity: progress(frame, 0, 10, EASE_IN_OUT),
        transformOrigin: "540px 700px",
        scale: String(1 + 0.03 * progress(frame, 16, 126, EASE_IN_OUT)),
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
          reveal={progress(frame, 2, 18, EASE_IN_OUT)}
          style={{ opacity: progress(frame, 2, 8) }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 506,
          left: 60,
          right: 60,
          ...show(8),
        }}
      >
        <Line
          lang={v.lang}
          size={ar ? 54 : 54}
          color={ar ? COLORS.gold : COLORS.ivoryText}
        >
          {v.cta.title}
        </Line>
      </div>
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(12),
        }}
      >
        <div
          style={{
            width: 880,
            padding: "12px 0 16px",
            borderRadius: 28,
            border: `2px solid ${COLORS.gold}`,
            background: "rgba(239,206,108,0.1)",
          }}
        >
          <Line
            lang={v.lang}
            size={ar ? 40 : 36}
            color={COLORS.gold}
            latin="caps"
          >
            {v.cta.deadline[0]}
          </Line>
          <Line
            lang={v.lang}
            size={ar ? 36 : 34}
            weight={ar ? 600 : 500}
            latin="body"
          >
            {v.cta.deadline[1]}
          </Line>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 776,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...show(16),
        }}
      >
        <div
          lang={ar ? "ar" : undefined}
          dir={ar ? "rtl" : undefined}
          style={{
            minWidth: 440,
            height: 108,
            padding: "0 40px",
            borderRadius: 54,
            background: COLORS.gold,
            color: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: ar ? FONTS.arabic : FONTS.body,
            fontWeight: ar ? 700 : 600,
            fontSize: ar ? 48 : 40,
            letterSpacing: ar ? undefined : "0.22em",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          {v.cta.button}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 916,
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
          top: 1004,
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
          <Line
            lang={v.lang}
            size={ar ? 32 : 30}
            weight={500}
            color={COLORS.goldSoft}
            latin="body"
          >
            {v.cta.note}
          </Line>
        </div>
      </div>
      {extra ? (
        <div
          style={{
            position: "absolute",
            top: 1094,
            left: 60,
            right: 60,
            ...show(28),
          }}
        >
          <Line
            lang={v.lang}
            size={ar ? 33 : 30}
            weight={500}
            color="rgba(246,238,227,0.8)"
            latin="body"
            italic={false}
          >
            {extra}
          </Line>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export type Weekend40Props = {
  variant: string;
  /** Include the original score (disable for silent still previews). */
  audio?: boolean;
  /** Draw the Reels safe-zone guide (QA only). */
  showSafeZones?: boolean;
};

export const Weekend40: React.FC<Weekend40Props> = ({
  variant,
  audio = true,
  showSafeZones = false,
}) => {
  const v = VARIANTS[variant];
  if (!v) throw new Error(`Unknown Weekend40 variant "${variant}"`);
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
          opacity: 1 - progress(frame, CTA - 8, CTA + 2, EASE_IN_OUT),
        }}
      >
        {v.ribbon}
      </div>
      <Sequence
        name="Pieces"
        from={v.hookEnd - 6}
        durationInFrames={CTA - v.hookEnd + 20}
      >
        <ProductsScene v={v} />
      </Sequence>
      <Sequence name="Hook" durationInFrames={v.hookEnd + 8}>
        <HookScene v={v} />
      </Sequence>
      <Sequence name="CTA" from={CTA - 6} durationInFrames={450 - CTA + 6}>
        <CtaScene v={v} />
      </Sequence>
      <Grain opacity={0.045} />
      {audio ? (
        <Audio src={staticFile(`audio/w40-${v.slug}-score.wav`)} />
      ) : null}
      {showSafeZones ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
