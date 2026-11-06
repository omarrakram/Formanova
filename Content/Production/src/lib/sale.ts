import campaign from "../data/campaigns/2026-11-black-friday.json";
import { getProduct } from "./products";

/**
 * Black Friday offer maths. All amounts are handled in integer piastres so
 * the on-screen figures match a whole-order percentage discount exactly.
 */

export const SALE = campaign.sale;

export type Tier = (typeof SALE.tiers)[number];

export const MAX_TIER: Tier = SALE.tiers[SALE.tiers.length - 1];

const toPiastres = (price: string): number =>
  Math.round(parseFloat(price) * 100);

/** "EGP 19,445.99", or "EGP 11,999" for whole pounds (storefront style). */
export const formatEGP = (piastres: number): string => {
  const pounds = Math.floor(piastres / 100);
  const rest = piastres % 100;
  const whole = pounds.toLocaleString("en-US");
  return rest === 0
    ? `EGP ${whole}`
    : `EGP ${whole}.${String(rest).padStart(2, "0")}`;
};

/** Price of one product after a whole-order discount of `percentOff`. */
export const discounted = (productId: string, percentOff: number) => {
  const regular = toPiastres(getProduct(productId).price);
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
  const total = productIds.reduce(
    (sum, id) => sum + toPiastres(getProduct(id).price),
    0,
  );
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
