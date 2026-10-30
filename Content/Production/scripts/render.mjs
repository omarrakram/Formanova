#!/usr/bin/env node
/**
 * Renders the final advertisements straight into the campaign folders.
 *
 *   npm run render              # both creatives
 *   npm run render -- Heritage  # one creative by composition id
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
const CAMPAIGN = path.resolve(ROOT, "..", "Ads", "2026-10-sales-launch");

const CREATIVES = [
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
];

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
