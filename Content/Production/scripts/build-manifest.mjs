#!/usr/bin/env node
/**
 * Writes each campaign's asset manifest (CSV) from the production sources.
 *
 * Product images are listed only where a creative of that campaign uses
 * them; price and availability come from the campaign's own snapshot, so a
 * finished campaign keeps an accurate record even after its pieces sell.
 * Every local file is hashed; product photographs are checked against the
 * SHA-256 recorded when they were downloaded from the storefront, and any
 * vendored photograph that no campaign uses is reported.
 *
 *   npm run manifest
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  REPO,
  ROOT,
  campaignIds,
  catalog,
  imageUsage,
  loadCampaign,
} from "./lib/campaigns.mjs";

const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const rel = (file) => path.relative(REPO, file).split(path.sep).join("/");
const csv = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

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

const products = catalog().products;
const usedAnywhere = new Set();
let errors = 0;

for (const id of campaignIds()) {
  const campaign = loadCampaign(id);
  const usage = imageUsage(campaign);
  const creatives = Object.keys(campaign.creatives).sort();
  const rows = [];

  for (const product of products) {
    for (const image of product.images) {
      const key = `${product.id}#${image.listingPosition}`;
      const used = usage.get(key);
      if (!used) continue;
      usedAnywhere.add(key);
      const file = path.join(ROOT, "assets", image.file);
      const digest = sha256(file);
      if (digest !== image.sha256) {
        errors++;
        console.error(`Checksum mismatch: ${image.file}`);
      }
      const snap = campaign.snapshot[product.id];
      if (!snap) {
        errors++;
        console.error(
          `${id}: no availability snapshot for "${product.id}". Run: npm run check:availability -- ${id} --record`,
        );
      }
      rows.push([
        `${product.id}-${String(image.listingPosition).padStart(2, "0")}`,
        "product-photograph",
        [...used].sort().join(" "),
        rel(file),
        digest,
        image.width,
        image.height,
        product.title,
        product.url,
        product.variant,
        snap?.price ?? "",
        snap?.available ?? "",
        campaign.checkedAt ?? "",
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
      creatives.join(" "),
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
      path.join(
        REPO,
        "Content",
        "Brand",
        "assets",
        "formanova-social-card.png",
      ),
      "Storefront Open Graph image (gold wordmark on black).",
    ],
  ];
  for (const [assetId, type, used, file, notes] of brandFiles) {
    rows.push([
      assetId,
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

  for (const [file, used] of Object.entries(campaign.fonts).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const full = path.join(ROOT, "assets", "fonts", file);
    rows.push([
      `font-${file.replace(/\.ttf$/, "").toLowerCase()}`,
      "font",
      [...used].sort().join(" "),
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
      "https://github.com/google/fonts",
      "",
      "",
      "SIL Open Font License 1.1 (licence text in assets/fonts)",
      "Unmodified font file from the Google Fonts repository.",
    ]);
  }

  for (const [creative, file] of Object.entries(campaign.scores)) {
    const full = path.join(ROOT, "assets", "audio", file);
    rows.push([
      `score-${file.replace(/-score\.wav$/, "")}`,
      "audio-score",
      creative,
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

  const out = path.join(REPO, "Content", "Ads", id, "asset-manifest.csv");
  fs.writeFileSync(
    out,
    [header, ...rows].map((r) => r.map(csv).join(",")).join("\n") + "\n",
  );
  console.log(
    `Wrote ${rows.length} assets to ${path.relative(process.cwd(), out)}`,
  );
}

for (const product of products) {
  for (const image of product.images) {
    if (!usedAnywhere.has(`${product.id}#${image.listingPosition}`)) {
      errors++;
      console.error(
        `Unused photograph (remove it or use it): assets/${image.file}`,
      );
    }
  }
}

if (errors > 0) process.exitCode = 1;
