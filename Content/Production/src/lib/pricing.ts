import october from "../data/campaigns/2026-10-sales-launch.json";
import blackFriday from "../data/campaigns/2026-11-black-friday.json";

/**
 * Prices shown in a film come from its campaign's recorded price check in
 * src/data/campaigns/<campaign>.json, written by
 * `npm run check:availability -- <campaign> --record`. A store price change
 * therefore never alters a finished film on re-render, and updating the
 * prices in a film is an explicit, dated step.
 */

type Snapshot = Record<string, { price: string; available: boolean }>;

const SNAPSHOTS: Record<string, Snapshot> = {
  [october.campaign]: october.snapshot,
  [blackFriday.campaign]: blackFriday.snapshot,
};

/** A product's recorded price for a campaign, in integer piastres. */
export const campaignPrice = (campaign: string, productId: string): number => {
  const entry = SNAPSHOTS[campaign]?.[productId];
  if (!entry) {
    throw new Error(
      `No recorded price for "${productId}" in ${campaign}. Run: npm run check:availability -- ${campaign} --record`,
    );
  }
  return Math.round(parseFloat(entry.price) * 100);
};

/** "EGP 19,445.99", or "EGP 11,999" for whole pounds (storefront style). */
export const formatEGP = (piastres: number): string => {
  const pounds = Math.floor(piastres / 100);
  const rest = piastres % 100;
  const whole = pounds.toLocaleString("en-US");
  return rest === 0
    ? `EGP ${whole}`
    : `EGP ${whole}.${String(rest).padStart(2, "0")}`;
};

/** A product's recorded price for a campaign, formatted for display. */
export const priceLabel = (campaign: string, productId: string): string =>
  formatEGP(campaignPrice(campaign, productId));
