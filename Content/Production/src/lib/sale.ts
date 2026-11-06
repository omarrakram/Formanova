import campaign from "../data/campaigns/2026-11-black-friday.json";
import { campaignPrice, formatEGP } from "./pricing";

/**
 * Black Friday offer maths, from the campaign's recorded prices. All amounts
 * are handled in integer piastres so the on-screen figures match a
 * whole-order percentage discount exactly.
 */

export const SALE = campaign.sale;

export type Tier = (typeof SALE.tiers)[number];

export const MAX_TIER: Tier = SALE.tiers[SALE.tiers.length - 1];

const price = (productId: string) =>
  campaignPrice(campaign.campaign, productId);

/** Regular price of one product, formatted for display. */
export const regularLabel = (productId: string): string =>
  formatEGP(price(productId));

/** Price of one product after a whole-order discount of `percentOff`. */
export const discounted = (productId: string, percentOff: number) => {
  const regular = price(productId);
  const saving = Math.round((regular * percentOff) / 100);
  return {
    regular: formatEGP(regular),
    sale: formatEGP(regular - saving),
    saving: formatEGP(saving),
  };
};

/**
 * Total, saving and amount payable for a basket at a given discount, in
 * whole pounds. Checkout may round the discount per line or per order, which
 * can move the exact figure by a piastre; rounding to whole pounds gives the
 * same, internally consistent numbers either way.
 */
export const basket = (productIds: string[], percentOff: number) => {
  const total = productIds.reduce((sum, id) => sum + price(id), 0);
  const saving = (total * percentOff) / 100;
  const pounds = (piastres: number) => Math.round(piastres / 100) * 100;
  return {
    count: productIds.length,
    total: formatEGP(pounds(total)),
    saving: formatEGP(pounds(saving)),
    pay: formatEGP(pounds(total) - pounds(saving)),
    exact: {
      total: formatEGP(total),
      saving: formatEGP(Math.round(saving)),
      pay: formatEGP(total - Math.round(saving)),
    },
  };
};
