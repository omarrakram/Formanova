/**
 * Campaign helpers shared by the manifest builder and the availability check.
 *
 * Each campaign is described by src/data/campaigns/<campaign>.json: its
 * creatives (source files), the fonts and score each creative uses, and a
 * snapshot of the price and availability of every featured product at the
 * time the campaign was checked. Image usage is read from the creative
 * source, so it cannot drift from what the videos actually show.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const REPO = path.resolve(ROOT, "..", "..");
const CAMPAIGNS = path.join(ROOT, "src", "data", "campaigns");

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

export const catalog = () =>
  readJson(path.join(ROOT, "src", "data", "products.json"));

export const campaignIds = () =>
  fs
    .readdirSync(CAMPAIGNS)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();

export const campaignFile = (id) => path.join(CAMPAIGNS, `${id}.json`);

export const loadCampaign = (id) => {
  const file = campaignFile(id);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Unknown campaign "${id}". Known: ${campaignIds().join(", ")}`,
    );
  }
  return readJson(file);
};

/**
 * Product images used by each creative: getImage("id", n), card("id", n, ...)
 * and data objects of the form { id: "id", image: n }.
 * Returns Map("productId#listingPosition" -> Set(creative)).
 */
export const imageUsage = (campaign) => {
  const usage = new Map();
  const patterns = [
    /(?:getImage|card)\(\s*"([a-z0-9-]+)",\s*(\d+)/g,
    /id:\s*"([a-z0-9-]+)",\s*image:\s*(\d+)/g,
  ];
  for (const [creative, source] of Object.entries(campaign.creatives)) {
    const code = fs.readFileSync(path.join(ROOT, source), "utf8");
    for (const pattern of patterns) {
      for (const m of code.matchAll(pattern)) {
        const key = `${m[1]}#${m[2]}`;
        if (!usage.has(key)) usage.set(key, new Set());
        usage.get(key).add(creative);
      }
    }
  }
  return usage;
};

/** Ids of the products a campaign features, in catalogue order. */
export const featuredProducts = (campaign) => {
  const used = new Set(
    [...imageUsage(campaign).keys()].map((k) => k.split("#")[0]),
  );
  return catalog().products.filter((p) => used.has(p.id));
};
