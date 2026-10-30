#!/usr/bin/env node
/**
 * Re-checks every product featured in the ads against the live storefront
 * and fails loudly if a piece has sold out or its advertised price changed.
 * Vintage stock is mostly one-of-a-kind, so run this before launching or
 * refreshing a campaign:
 *
 *   npm run check:availability
 *
 * Behind an HTTP proxy, Node 22.21+ needs NODE_USE_ENV_PROXY=1.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "products.json"), "utf8"),
);

let problems = 0;
console.log(
  `Checking ${catalog.products.length} products at ${new Date().toISOString()}\n`,
);

for (const product of catalog.products) {
  const res = await fetch(`${catalog.store}/products/${product.handle}.js`, {
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
  const status = !variant
    ? "VARIANT?"
    : !variant.available
      ? "SOLD OUT"
      : price !== Number(product.price).toFixed(2)
        ? "PRICE Δ "
        : "OK      ";
  if (status.trim() !== "OK") problems++;
  console.log(
    `${status} ${product.title} [${product.variant}] advertised EGP ${product.price}, live ${price ? `EGP ${price}` : "n/a"}`,
  );
}

console.log(
  problems === 0
    ? "\nAll featured products are available at the advertised prices."
    : `\n${problems} product(s) need attention before running the ads.`,
);
process.exitCode = problems === 0 ? 0 : 1;
