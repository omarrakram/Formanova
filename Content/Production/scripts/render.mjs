#!/usr/bin/env node
/**
 * Renders the final advertisements straight into the campaign folders.
 *
 *   npm run render                       # every creative
 *   npm run render -- BogoTonight        # one creative by composition id
 *
 * Pipeline per creative:
 *   1. Remotion renders the picture (H.264 High, yuv420p, BT.709, CRF 17).
 *   2. Remotion's bundled FFmpeg muxes the master score WAV as AAC-LC
 *      320 kb/s and trims the container to exactly 15.000 s (450 frames).
 *      The video stream is copied, never re-encoded.
 *
 * Remotion normally downloads its own headless Chrome. Where that is not
 * possible (offline or locked-down machines), point it at a local build:
 *
 *   REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell npm run render
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ADS = path.resolve(ROOT, "..", "Ads");
const CAMPAIGN = path.join(ADS, "2026-10-sales-launch");
const BLACK_FRIDAY = path.join(ADS, "2026-11-black-friday");
const BOGO = path.join(ADS, "2026-11-bogo-weekend");

const CREATIVES = [
  {
    id: "BogoTonight",
    title: "Formanova - Buy 1 Get 1: 1+1 Tonight (15s, Arabic)",
    score: path.join(ROOT, "assets", "audio", "bogo-tonight-score.wav"),
    output: path.join(
      BOGO,
      "creative-01-tonight",
      "final",
      "formanova-bogo-tonight-15s.mp4",
    ),
  },
  {
    id: "BogoPair",
    title: "Formanova - Buy 1 Get 1: The Pair (15s)",
    score: path.join(ROOT, "assets", "audio", "bogo-pair-score.wav"),
    output: path.join(
      BOGO,
      "creative-02-pair",
      "final",
      "formanova-bogo-pair-15s.mp4",
    ),
  },
  {
    id: "BogoLastDay",
    title: "Formanova - Buy 1 Get 1: Last Day (15s, Arabic)",
    score: path.join(ROOT, "assets", "audio", "bogo-last-day-score.wav"),
    output: path.join(
      BOGO,
      "creative-03-last-day",
      "final",
      "formanova-bogo-last-day-15s.mp4",
    ),
  },
  {
    id: "Heritage",
    title: "Formanova - One Piece With a Past (15s)",
    score: path.join(ROOT, "assets", "audio", "heritage-score.wav"),
    output: path.join(
      CAMPAIGN,
      "creative-01-heritage",
      "final",
      "formanova-heritage-15s.mp4",
    ),
  },
  {
    id: "ProductAd",
    title: "Formanova - Not Your Ordinary Decor (15s)",
    score: path.join(ROOT, "assets", "audio", "product-score.wav"),
    output: path.join(
      CAMPAIGN,
      "creative-02-product",
      "final",
      "formanova-product-15s.mp4",
    ),
  },
  {
    id: "BlackFridayLadder",
    title: "Formanova - Black Friday: The Ladder (15s, Arabic)",
    score: path.join(ROOT, "assets", "audio", "bf-ladder-score.wav"),
    output: path.join(
      BLACK_FRIDAY,
      "creative-01-ladder",
      "final",
      "formanova-bf-ladder-15s.mp4",
    ),
  },
  {
    id: "BlackFridaySet",
    title: "Formanova - Black Friday: The 40% Set (15s)",
    score: path.join(ROOT, "assets", "audio", "bf-set-score.wav"),
    output: path.join(
      BLACK_FRIDAY,
      "creative-02-set",
      "final",
      "formanova-bf-set-15s.mp4",
    ),
  },
];

/* Weekend 40%: one composition per variant file. */
const W40 = path.join(ADS, "2026-11-weekend-40");
const W40_DIR = path.join(ROOT, "src", "creatives", "weekend40");
for (const file of fs
  .readdirSync(W40_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const v = JSON.parse(fs.readFileSync(path.join(W40_DIR, file), "utf8"));
  CREATIVES.push({
    id: v.id,
    title: `Formanova - 40% Weekend: ${v.slug} (15s)`,
    score: path.join(ROOT, "assets", "audio", `w40-${v.slug}-score.wav`),
    output: path.join(
      W40,
      v.creative,
      "final",
      `formanova-w40-${v.slug}-15s.mp4`,
    ),
  });
}

const requested = process.argv.slice(2);
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
const run = (args) =>
  execFileSync("npx", args, { stdio: "inherit", cwd: ROOT });

for (const creative of CREATIVES) {
  if (requested.length > 0 && !requested.includes(creative.id)) continue;
  if (!fs.existsSync(creative.score)) {
    throw new Error(`Missing ${creative.score}. Run "npm run score" first.`);
  }
  fs.mkdirSync(path.dirname(creative.output), { recursive: true });
  const picture = path.join(
    os.tmpdir(),
    `formanova-${creative.id}-picture.mp4`,
  );

  console.log(`\n[1/2] Rendering ${creative.id} picture`);
  const renderArgs = [
    "remotion",
    "render",
    creative.id,
    picture,
    "--muted",
    "--codec=h264",
    "--crf=17",
    "--x264-preset=slow",
    "--pixel-format=yuv420p",
    "--color-space=bt709",
    "--log=warn",
  ];
  if (browser) renderArgs.push(`--browser-executable=${browser}`);
  run(renderArgs);

  console.log(
    `[2/2] Muxing score -> ${path.relative(process.cwd(), creative.output)}`,
  );
  run([
    "remotion",
    "ffmpeg",
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    picture,
    "-i",
    creative.score,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "320k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-t",
    "15",
    "-movflags",
    "+faststart",
    "-metadata",
    `title=${creative.title}`,
    "-metadata",
    "artist=Formanova",
    creative.output,
  ]);
  fs.rmSync(picture, { force: true });
}
