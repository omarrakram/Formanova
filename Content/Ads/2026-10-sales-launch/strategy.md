# Creative strategy — October 2026 sales launch

Two 15-second vertical advertisements for Meta (Instagram and Facebook Reels and Stories) in Egypt, built as **two competing conversion hypotheses** rather than two versions of one idea.

| | Creative 01 — *One Piece With a Past* | Creative 02 — *Not Your Ordinary Decor* |
|---|---|---|
| Role | Emotional desire (heritage, craftsmanship, character) | Direct response (specific pieces, real prices, delivery) |
| Language | English | Egyptian Arabic |
| Visual system | Dark, cinematic "gallery arch" | Light, ivory "display plinth" with price tags |
| Products shown | 6 | 12 |
| Prices on screen | No | Yes, typed price tags on 7 pieces |
| Pace | Rubato, 8 shots | 120 BPM, a new piece roughly every second |

---

## 1. What the research found

All figures were taken from the public storefront feed, the website pages and the public Instagram profile on 30 October 2026. The shared brand audit spreadsheet could not be opened from the production environment (the network policy blocks `docs.google.com`), so every fact was re-derived from primary public sources.

### Brand

- **Positioning.** The site defines Formanova as "a vintage and antiques concept that traces back to 1973 … being reintroduced through a modern and carefully curated experience". It says it offers "rarity", "depth" and "timelessness" against mass production and trends.
- **Signature lines.** On Instagram: "Bringing the past into the Future", "EST.1973", "Your Favorite Go-To when it comes to Antiques", "Order Online Now". On the storefront: "Timeless Treasures", "Curated Collectibles", "Discover the allure of history through exquisite artifacts".
- **Identity.** The wordmark is a gold hand-script "FormaNova", usually shown on black or deep grey. The site uses a dark, warm palette (near-black, walnut brown, copper, cream) with Playfair Display headings and EB Garamond body text. See [Brand guidelines](../../Brand/brand-guidelines.md).
- **Photography.** Each listing pairs about four styled interior images (warm wood tables, window light, classic rooms; some appear digitally styled) with direct photographs of the actual piece, including close-ups and makers' marks.
- **Language.** Product descriptions are bilingual: English, then natural Egyptian-leaning Arabic ("اتنين بوتيش شينواه برسمة العرايس"). The Arabic vocabulary the brand uses itself was reused in Creative 02: بلو بلا، شينواه، كلوازينه، فينتج، أنتيك، حفر يدوي، مياه الذهب.

### Catalogue and commerce

| Metric | Value |
|---|---|
| Products in the public feed | 252 |
| Available now | 74 (29%) |
| Sold out | 178 |
| Price range of available pieces | EGP 364.99 – 32,409.99 |
| Median price of available pieces | **EGP 1,850** |
| Available pieces under EGP 2,000 | **40 of 74** |
| Largest collections | Porcelain 92 · Vase 62 · Bleu Blanc 57 · Chinoiserie 39 · Figurines 32 · Murano 24 · Cloisonné 19 |

**Verified service promises** (from the shipping and FAQ page and the contact page):

- **Delivery.** 3–4 working days in Cairo and 4–5 working days to other governorates. Ships to all governorates.
- **Payment.** Instapay, or cash on delivery "where available".
- **Exchanges and refunds.** Exchanges within 7 days. Refunds for items that arrive defective or damaged, if reported within 48 hours.
- **Contact.** WhatsApp +20 100 658 0682 and Instagram. Enquiries are answered within 24 hours.

**Audience signals.** Instagram shows 8,801 followers and 476 posts. Price points cluster in the EGP 1,000–5,500 range. The bilingual copy and the classic categories (Bleu Blanc, Chinoiserie, crystal, Murano, which are staples of Egyptian vitrines and gifting) point to Egyptian home-makers and gift buyers rather than only ultra-high-net-worth collectors. Follower counts say nothing about purchasing behaviour, so the personas below are **hypotheses to validate** with Meta audience insights and Shopify customer data.

### Friction a paid visitor would meet

These findings shape where the ads send traffic and what they promise.

1. **Most catalogue pages are dominated by sold-out stock.** `/collections/all` lists 250 products, of which only 74 are available. Collection pages are similar: Bleu Blanc has 17 of 52 available, Murano 6 of 23, Crystal 4 of 11. **`/collections/all-products` contains exactly the 74 in-stock pieces**, so it is the destination for both ads.
2. **An in-stock piece has no photographs.** "Large Heavy Italian Murano Glass Vase with Multicolored Swirls" (EGP 5,499) cannot sell without images.
3. **37 of 74 in-stock products have non-descriptive URLs** (for example `/products/z`, `/products/untitled-oct23_12-31-00`). These look untrustworthy when shared and give search engines nothing to index.
4. **`product_type` is empty for all 252 products.** This limits storefront filtering and any future Meta catalogue (Advantage+ catalogue) ads.
5. **Standard Shopify policy pages return 404** (`/policies/refund-policy`, `/policies/shipping-policy`, `/policies/terms-of-service`). The information exists on `/pages/shipping-information`, but checkout-stage trust links are missing.
6. **Pricing unit ambiguity.** "Sèvres Château Ornate Candlestick…" is titled in the singular but sold only as the variant "Pair".
7. **Two Bleu Blanc ginger jar listing images carry a visible AI-tool watermark** (listing images 5 and 6). They were excluded from the ads and should be replaced on the site.

These are recommendations for the store team. None of them blocks the campaign.

---

## 2. Who we are talking to (hypotheses)

| Persona | Likely profile | What moves them | Best-fit creative |
|---|---|---|---|
| **The considered home-maker** | 28–50, Greater Cairo and Alexandria, furnishing or refreshing a home | Classic pieces that make a room feel finished; clear prices; delivery and cash-on-delivery reassurance | 02 |
| **The gift giver and collector** | 35–60, buying for housewarmings, weddings, Eid or a personal collection | Craftsmanship, heritage, a piece that feels special | 01, then 02 for the price reveal |
| **The design-led renovator** | 25–40, contemporary interiors | One statement vintage piece to give a modern room character | 01 |

---

## 3. The two hypotheses

### Creative 01 — "One Piece With a Past" (emotional)

> **If** we sell the *idea* that every home needs one characterful piece with history, and show the hand-painted, hand-cut and raised craftsmanship up close, **then** design-led buyers will visit with higher intent and higher basket values, even if fewer people click.

- **Hook (0–2.5 s).** An extreme close-up of a hand-painted porcelain bird (Sèvres Château candlestick) with the line *"Every home needs one piece with a past."*. Immediately relevant ("home"), curious ("a past") and actionable ("one piece").
- **Desire.** Three gallery-arch details: "Hand-painted porcelain." / "Hand-cut crystal." / "Raised cloisonné." Each label is verified against the product listing.
- **Payoff.** The arch opens and we step into the rooms. The same bird candlestick from the hook appears in its room, then a famille-rose-style cachepot, then amber Murano glass in sunlight: *"Chosen for character. / Not for trends."* (the brand's own positioning).
- **Brand.** The brand's tagline *"Bringing the past into the future."* over a Bleu Blanc ginger jar, with "Curated vintage & antiques · Est. 1973".
- **Conversion.** The gold wordmark, *"Find your piece with a past."*, **SHOP NOW** and formanovavintage.com.
- **Why English.** It matches the brand's own primary voice on the site and Instagram and signals the premium editorial register this concept needs.

### Creative 02 — "Not Your Ordinary Decor" (direct response)

> **If** we answer "what is it, how much is it, can I get it?" within 15 seconds, using real pieces that are in stock now with their real prices and the nationwide delivery promise, **then** broad Egyptian home-décor audiences will click and buy more efficiently.

- **Hook (0–2 s).** *"ليه بيتك يبقى شبه كل البيوت؟"* ("Why should your home look like every other home?") over a flip-book of six distinct pieces. It is a self-check question plus visual proof of variety.
- **Product proof (2–6 s).** *"مش ديكور عادي."* Four pieces arrive one per beat, each with a typed price tag: Bleu Blanc ginger jar **EGP 1,574.99**, Italian Murano vase **EGP 3,499**, pair of Chinoiserie potiches **EGP 1,849**, Czech hand-cut crystal vase **EGP 4,724.99**.
- **Shopping desire (6–10.5 s).** Close-ups with verified craft claims: *مرسومة يدويًا* (Satsuma potiche, **from EGP 949**), *كلوازينه أنتيك* (**EGP 5,459.99**), *مشغولة بمياه الذهب* (Chinoiserie egg, **EGP 1,499**).
- **Differentiation (10.5–12.5 s).** A nine-piece collection mosaic: *"كل قطعة متختارة بعناية"* ("every piece is carefully chosen") and *"فينتج وأنتيك · من ١٩٧٣"*.
- **Conversion (12.5–15 s).** The wordmark, *"قطعة واحدة بتفرق."* ("one piece makes the difference"), **تسوّق الآن**, the URL, and *"توصيل لكل محافظات مصر خلال ٣–٥ أيام عمل"*.
- **Why Egyptian Arabic.** It matches the brand's Arabic product copy, widens reach beyond English-first audiences, and makes the direct-response message instantly clear. Imperatives are avoided in headlines (Egyptian imperatives are gendered). The button uses the standard e-commerce phrase.
- **Why prices.** The median in-stock price is EGP 1,850, which is far below what many people assume "antiques" cost. Showing prices removes the biggest silent objection and pre-qualifies clicks.

### What makes them genuinely different

They differ in emotion vs. proof, implicit vs. explicit price, English vs. Egyptian Arabic, dark vs. light, rubato piano vs. rhythmic marimba, and 6 vs. 12 products. That is a real strategic test. Because concept *and* language both vary, a win tells you which **package** works. Isolate language in round two (see §5).

---

## 4. Claims discipline

Every on-screen claim maps to a product listing, a site page or the brand's own published wording. See the claims table in [ad-copy.md](ad-copy.md). Deliberately avoided:

- Scarcity ("only one left"), urgency or countdowns.
- Discounts, reviews, bestseller status or demand claims.
- Authentication language ("certified", "original Sèvres"). Product names are used exactly as listed.
- "Italian Murano" for the amber vase. Its listing only says "Murano glass style", so it is labelled "Murano Glass Vase" as titled.
- Implying the pieces date from 1973. "Est. 1973" is the brand's heritage, not the age of the objects.

---

## 5. Test plan

**Setup**

- **Objective.** Sales, optimised for Purchase. Confirm the Meta pixel or Conversions API records purchases with value. If the account logs fewer than ~50 purchases a week, start optimising for Add to Cart and move to Purchase as volume allows.
- **Structure.** Meta **A/B test** with the creative as the only variable: same audience, placements, budget, schedule and destination.
- **Audience.** Egypt, ages 25–60, broad (Advantage+ audience), optionally seeded with home décor, interior design, antiques and vintage interests. Exclude recent purchasers if available.
- **Placements.** Instagram Reels, Instagram Stories, Facebook Reels and Facebook Stories (both files are 9:16).
- **Destination.** `/collections/all-products` (in stock only), with UTMs as listed in [ad-copy.md](ad-copy.md).
- **Duration.** At least 7 days to cover a full weekly cycle, and longer until each variant has enough conversions to compare.

**Metrics, in decision order**

1. **Cost per purchase** and **ROAS** (purchase value ÷ spend). This is the decision metric; profitable sales outrank everything else.
2. **Purchase conversion rate** and **average order value**.
3. **Add-to-cart rate** and **checkout initiation rate**. These are leading indicators while purchases are sparse.
4. **Link click-through rate**, **landing-page views** and **cost per landing-page view**. These indicate traffic quality.
5. **Creative diagnostics.** Hook rate (3-second plays ÷ impressions), hold rate (ThruPlays ÷ 3-second plays) and average watch time. Use them to diagnose, never to declare a winner.

**Decision rules**

- **No winner on thin data.** Wait until each variant has at least ~30–50 purchases, or Meta's A/B test reports at least 80% confidence on cost per purchase. Until then, treat add-to-cart and checkout as directional only.
- **Profitability.** A creative "wins" only if its ROAS clears break-even (1 ÷ gross margin) at comparable spend.
- **No vanity metrics.** If one ad has the better CTR and the other the better cost per purchase, the cost per purchase decides.
- **Inventory.** Vintage stock is largely one of a kind. Run `npm run check:availability` before launch and before scaling. If a featured piece sells out, swap it in `src/data/products.json` and re-render (about 3 minutes per ad).

**Round two (after a winner)**

- **Isolate language.** Test an English cut of 02 and an Arabic cut of 01. The copy is data-driven in the Remotion source.
- **Rotate products and price points** inside the winning concept, for example an under-EGP 1,000 edit versus a statement-piece edit.
- **Use the loser as retargeting.** If 02 wins on cold traffic, test 01 on warm audiences (site visitors and Instagram engagers), where brand desire can lift basket value.

---

## 6. Recommendation

**Launch both as an A/B test.** If only one can run first, **prioritise Creative 02 for cold prospecting**:

- It shows 12 specific, in-stock pieces, 7 of them with verified prices.
- It answers the price question that silently filters antique shoppers.
- It promises nationwide delivery.
- It speaks Egyptian Arabic to the broadest audience.

All four are the strongest levers for first purchases from people who do not yet know Formanova.

Creative 01 is the stronger **brand and basket-value** play. It features EGP 3,499–11,999 statement pieces and builds the "one piece with a past" idea that makes Formanova memorable. Expect it to shine with warm audiences and design-led buyers, and use the A/B test to prove or disprove that.

Actual performance can only come from live campaign data. Treat both hypotheses as starting points, not conclusions.
