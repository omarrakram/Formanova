import campaign from "../data/campaigns/2026-11-bogo-weekend.json";
import { campaignPrice, formatEGP } from "./pricing";

/**
 * Buy 1 Get 1 Free offer maths, from the campaign's recorded prices. Of any
 * two pieces in the cart, the lower-priced one is free, so the customer pays
 * the higher of the two prices. Both amounts are exact: nothing is rounded.
 */

export const OFFER = campaign.sale;

const price = (productId: string) =>
  campaignPrice(campaign.campaign, productId);

/**
 * Price labels for one pair. Throws if `freeId` costs more than `paidId`,
 * so a film can never show the wrong piece as the free one.
 */
export const offerPair = (paidId: string, freeId: string) => {
  const paid = price(paidId);
  const free = price(freeId);
  if (free > paid) {
    throw new Error(
      `"${freeId}" costs more than "${paidId}": the lower-priced piece is the free one.`,
    );
  }
  return {
    pay: formatEGP(paid),
    gift: formatEGP(free),
    value: formatEGP(paid + free),
  };
};
