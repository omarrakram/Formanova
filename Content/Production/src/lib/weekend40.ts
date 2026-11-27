import campaign from "../data/campaigns/2026-11-weekend-40.json";
import { campaignPrice, formatEGP } from "./pricing";

/**
 * 40%-off-everything maths, from the campaign's recorded prices. The sale
 * price is the regular price less 40%, rounded to the piastre per item.
 */
export const SALE40 = campaign.sale;

type Snapshot = Record<string, { price: string; available: boolean }>;
const snapshot = campaign.snapshot as Snapshot;

export const fortyOff = (productId: string) => {
  if (snapshot[productId]?.available === false) {
    throw new Error(
      `"${productId}" is sold out: it cannot be advertised at 40% off.`,
    );
  }
  const regular = campaignPrice(campaign.campaign, productId);
  const saving = Math.round((regular * SALE40.percentOff) / 100);
  return {
    regular: formatEGP(regular),
    sale: formatEGP(regular - saving),
    saving: formatEGP(saving),
  };
};

/** Throws unless the recorded check shows the piece as sold out. */
export const assertSoldOut = (productId: string) => {
  if (snapshot[productId]?.available !== false) {
    throw new Error(
      `"${productId}" is not recorded as sold out: it cannot be shown as "sold out".`,
    );
  }
};
