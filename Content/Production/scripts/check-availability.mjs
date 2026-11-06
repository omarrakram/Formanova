#!/usr/bin/env node
/**
 * Re-checks every product a campaign features against the live storefront
 * and fails loudly if a piece has sold out or its price changed. Vintage
 * stock is mostly one-of-a-kind, so run this before launching or scaling:
 *
 *   npm run check:availability                          # latest campaign
 *   npm run check:availability -- 2026-11-black-friday
 *   npm run check:availability -- 2026-11-black-friday --record
 *
 * "Advertised" means the campaign's recorded snapshot, which is what its films
 * show. --record replaces the snapshot with the live result; re-render the
 * campaign's films afterwards so they show the new prices. Behind an HTTP
 * proxy, Node 22.21+ needs NODE_USE_ENV_PROXY=1.
 */

import fs from "node:fs";
import {
  campaignFile,
  campaignIds,
  catalog,
  featuredProducts,
  loadCampaign,
} from "./lib/campaigns.mjs";

const args = process.argv.slice(2);
const record = args.includes("--record");
const id = args.find((a) => !a.startsWith("--")) ?? campaignIds().at(-1);
const campaign = loadCampaign(id);
const store = catalog().store;
const products = featuredProducts(campaign);
const checkedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

let problems = 0;
const snapshot = {};
console.log(`${id}: checking ${products.length} products at ${checkedAt}\n`);

for (const product of products) {
  const res = await fetch(`${store}/products/${product.handle}.js`, {
    headers: { "user-agent": "formanova-content-check/1.0" },
  });
  if (!res.ok) {
    problems++;
    console.log(`MISSING  ${product.title} (HTTP ${res.status})`);
    continue;
  }
  const live = await res.json();
  const variant = live.variants.find((v) => v.title === product.variant);
  const price = variant ? (variant.price / 100).toFixed(2) : null;
  const advertised = campaign.snapshot?.[product.id]?.price ?? null;
  const status = !variant
    ? "VARIANT?"
    : !variant.available
      ? "SOLD OUT"
      : advertised === null
        ? "NEW     "
        : price !== Number(advertised).toFixed(2)
          ? "PRICE Δ "
          : "OK      ";
  if (status.trim() !== "OK") problems++;
  if (variant) snapshot[product.id] = { price, available: variant.available };
  console.log(
    `${status} ${product.title} [${product.variant}] advertised ${advertised ? `EGP ${advertised}` : "n/a"}, live ${price ? `EGP ${price}` : "n/a"}`,
  );
}

console.log(
  problems === 0
    ? "\nAll featured products are available at the advertised prices."
    : `\n${problems} product(s) need attention before running these ads.`,
);

if (record) {
  campaign.checkedAt = checkedAt;
  campaign.snapshot = snapshot;
  fs.writeFileSync(campaignFile(id), JSON.stringify(campaign, null, 2) + "\n");
  console.log(`Recorded snapshot in src/data/campaigns/${id}.json`);
  if (problems > 0) {
    console.log(
      `Re-render this campaign's films so they show the recorded prices (npm run render -- <composition>).`,
    );
  }
}

process.exitCode = problems === 0 ? 0 : 1;
