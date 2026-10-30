#!/usr/bin/env node
/**
 * Writes the campaign asset manifest (CSV) from the production sources.
 *
 * Image usage is read straight from the creative source files, so the
 * manifest cannot drift from what the videos actually show. Every local
 * file is hashed; product photographs are checked against the SHA-256
 * recorded when they were downloaded from the storefront.
 *
 *   npm run manifest
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(ROOT, "..", "..");
const CAMPAIGN = path.resolve(ROOT, "..", "Ads", "2026-10-sales-launch");
const catalog = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "products.json"), "utf8"),
);

const CREATIVES = {
  "creative-01-heritage": "src/creatives/heritage/Heritage.tsx",
  "creative-02-product": "src/creatives/product/ProductAd.tsx",
};

const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const rel = (file) => path.relative(REPO, file).split(path.sep).join("/");
const csv = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Which product images each creative uses: getImage("id", n) and card("id", n, ...).
const usage = new Map();
for (const [creative, source] of Object.entries(CREATIVES)) {
  const code = fs.readFileSync(path.join(ROOT, source), "utf8");
  for (const m of code.matchAll(
    /(?:getImage|card)\(\s*"([a-z0-9-]+)",\s*(\d+)/g,
  )) {
    const key = `${m[1]}#${m[2]}`;
    if (!usage.has(key)) usage.set(key, new Set());
    usage.get(key).add(creative);
  }
}

const header = [
  "asset_id",
  "type",
  "used_in",
  "local_path",
  "sha256",
  "width",
  "height",
  "product_title",
  "product_url",
  "variant",
  "price_egp",
  "available",
  "availability_checked_at",
  "source_url",
  "listing_position",
  "image_kind",
  "rights",
  "notes",
];
const rows = [];
let errors = 0;

for (const product of catalog.products) {
  for (const image of product.images) {
    const file = path.join(ROOT, "assets", image.file);
    const digest = sha256(file);
    if (digest !== image.sha256) {
      errors++;
      console.error(`Checksum mismatch: ${image.file}`);
    }
    const used = usage.get(`${product.id}#${image.listingPosition}`);
    rows.push([
      `${product.id}-${String(image.listingPosition).padStart(2, "0")}`,
      "product-photograph",
      used ? [...used].sort().join(" ") : "unused",
      rel(file),
      digest,
      image.width,
      image.height,
      product.title,
      product.url,
      product.variant,
      product.price,
      product.available,
      catalog.checkedAt,
      image.source,
      image.listingPosition,
      image.kind,
      "Formanova (published on formanovavintage.com)",
      [
        "Original file, unaltered; framing and motion applied at render time only.",
        image.kind === "styled-interior"
          ? "Brand-published styled interior image; checked for visible watermarks."
          : "Direct product photograph.",
        product.priceNote ?? "",
      ]
        .filter(Boolean)
        .join(" "),
    ]);
  }
}

const brandFiles = [
  [
    "brand-logo-gold",
    "brand-logo",
    "creative-01-heritage creative-02-product",
    path.join(ROOT, "assets", "brand", "formanova-logo-gold.png"),
    "Gold script wordmark (transparent PNG, 1080x1080) from the storefront header. Cropped with CSS at render time.",
  ],
  [
    "brand-logo-gold-master",
    "brand-logo",
    "reference",
    path.join(REPO, "Content", "Brand", "assets", "formanova-logo-gold.png"),
    "Master copy kept with the brand guidelines; identical bytes to the production copy.",
  ],
  [
    "brand-social-card",
    "brand-image",
    "reference",
    path.join(REPO, "Content", "Brand", "assets", "formanova-social-card.png"),
    "Storefront Open Graph image (gold wordmark on black).",
  ],
];
for (const [id, type, used, file, notes] of brandFiles) {
  rows.push([
    id,
    type,
    used,
    rel(file),
    sha256(file),
    "",
    "",
    "",
    "https://www.formanovavintage.com/",
    "",
    "",
    "",
    "",
    "https://www.formanovavintage.com/",
    "",
    "",
    "Formanova",
    notes,
  ]);
}

for (const file of fs
  .readdirSync(path.join(ROOT, "assets", "fonts"))
  .filter((f) => f.endsWith(".ttf"))
  .sort()) {
  rows.push([
    `font-${file.replace(/\.ttf$/, "").toLowerCase()}`,
    "font",
    file.startsWith("ElMessiri") || file.startsWith("Anonymous")
      ? "creative-02-product"
      : "creative-01-heritage creative-02-product",
    rel(path.join(ROOT, "assets", "fonts", file)),
    sha256(path.join(ROOT, "assets", "fonts", file)),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "https://github.com/google/fonts",
    "",
    "",
    "SIL Open Font License 1.1 (licence text in assets/fonts)",
    "Unmodified font file from the Google Fonts repository.",
  ]);
}

const scores = [
  [
    "score-heritage",
    "audio-score",
    "creative-01-heritage",
    "heritage-score.wav",
  ],
  ["score-product", "audio-score", "creative-02-product", "product-score.wav"],
];
for (const [id, type, used, file] of scores) {
  const full = path.join(ROOT, "assets", "audio", file);
  rows.push([
    id,
    type,
    used,
    rel(full),
    sha256(full),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Content/Production/scripts/synth-score.mjs",
    "",
    "",
    "Original work created for Formanova; cleared for paid advertising",
    "48 kHz / 24-bit stereo master, synthesised from code (no samples, loops or third-party recordings), -14 LUFS.",
  ]);
}

fs.writeFileSync(
  path.join(CAMPAIGN, "asset-manifest.csv"),
  [header, ...rows].map((r) => r.map(csv).join(",")).join("\n") + "\n",
);
console.log(
  `Wrote ${rows.length} assets to ${path.relative(process.cwd(), path.join(CAMPAIGN, "asset-manifest.csv"))}`,
);
if (errors > 0) process.exitCode = 1;
