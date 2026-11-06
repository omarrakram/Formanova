# Black Friday 2026

**Friday 6 November, 8 PM → Friday 13 November** · Buy 2 → **20%** · Buy 3 → **30%** · Buy 4+ → **40%**, applied automatically to the whole order at checkout.

Two 15-second vertical films for Instagram and Facebook Reels and Stories, built from the most expensive pieces in stock.

<table>
<tr>
<td align="center" width="50%">
<a href="creative-01-ladder/final/formanova-bf-ladder-15s.mp4"><img src="creative-01-ladder/cover.jpg" width="260" alt="Black Friday film 01: a giant gold 40% over the gold-plated jardinère with the Arabic line up to 40% off every piece"></a>
<br><b>01 · The Ladder</b>
<br><sub>Offer-led · Egyptian Arabic</sub>
<br><a href="creative-01-ladder/final/formanova-bf-ladder-15s.mp4">MP4</a> · <a href="creative-01-ladder/script.md">Script</a> · <a href="creative-01-ladder/storyboard.md">Storyboard</a>
</td>
<td align="center" width="50%">
<a href="creative-02-set/final/formanova-bf-set-15s.mp4"><img src="creative-02-set/cover.jpg" width="260" alt="Black Friday film 02: Choose four. Save 40%. over the four most expensive pieces in gold arches"></a>
<br><b>02 · The 40% Set</b>
<br><sub>Premium set and savings · English</sub>
<br><a href="creative-02-set/final/formanova-bf-set-15s.mp4">MP4</a> · <a href="creative-02-set/script.md">Script</a> · <a href="creative-02-set/storyboard.md">Storyboard</a>
</td>
</tr>
</table>

## In this folder

| File | Contents |
|---|---|
| [strategy.md](strategy.md) | Offer logic, product selection, the two hypotheses, the launch plan for a seven-day sale, risks and metrics |
| [ad-copy.md](ad-copy.md) | Ready-to-paste Meta copy in Arabic and English, UTM URLs, on-screen text, claims and evidence |
| [licensing.md](licensing.md) | Rights and provenance for photography, wordmark, fonts and music |
| [asset-manifest.csv](asset-manifest.csv) | Every asset used, with SHA-256, source, price and availability at the last check |
| [deliverables.json](deliverables.json) | The technical spec CI validates on every push |
| [qa/safe-zone-check.jpg](qa/safe-zone-check.jpg) | Key frames of both films under the Reels interface overlay |

## Before 8 PM on Friday 6 November

1. **Test the discount.** Place test carts with 2, 3 and 4 items (include the Sèvres pair) and confirm 20%, 30% and 40% apply automatically to the whole order. The films promise exactly this.
2. **Re-check stock.** Run `cd Content/Production && npm run check:availability -- 2026-11-black-friday` (behind a proxy, prefix it with `NODE_USE_ENV_PROXY=1`). Repeat every morning during the sale.
3. **Schedule.** Start both ads at **20:00 Cairo time** with the copy and UTM URLs from [ad-copy.md](ad-copy.md), and end them with the Shopify discount.
4. **Pause the October ads.** They show full prices, and three of their pieces are no longer on the store.

## Deliverables

| | 01 · The Ladder | 02 · The 40% Set |
|---|---|---|
| File | `formanova-bf-ladder-15s.mp4` | `formanova-bf-set-15s.mp4` |
| Video | H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps | H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps |
| Length | 450 frames; container, video and audio exactly 15.000 s | 450 frames; container, video and audio exactly 15.000 s |
| Audio | AAC-LC 48 kHz stereo · −14.3 LUFS · −1.5 dBTP | AAC-LC 48 kHz stereo · −14.1 LUFS · −1.5 dBTP |
| Size | 5.0 MB | 5.5 MB |

## Quality assurance

| Check | Result |
|---|---|
| Spec (`npm run verify`) | Both files pass every declared check |
| Black frames · silences · static segments | None in either film (`blackdetect`, `silencedetect` at −50 dB, `freezedetect` at 0.5 s) |
| Safe zones | All copy, prices and products inside y 270–1250 px and x 80–1000 px ([QA sheet](qa/safe-zone-check.jpg)) |
| Nothing covers a product | Prices sit on panels below the photographs |
| Product accuracy | Original listing photographs only; every attribute quoted from its listing ([claims](ad-copy.md#claims-and-evidence)) |
| Prices and stock | Updated to the store's new prices of 6 November; all 7 featured pieces available at those prices at 12:16 UTC |
| Sale maths | Per-item 40% prices exact to the piastre; receipt in whole pounds, correct under per-line or per-order rounding |
| Reproducibility | Re-rendering with `npm run render` reproduces film 02 byte-for-byte. Film 01 re-renders visually identical but not bit-identical: lowest per-frame PSNR 48.3 dB, from sub-pixel anti-aliasing on its rotated cards. Audio is identical in both. |

**SHA-256 of the delivered files**

```
560ebd6310472744a25dea14b608ff98a64294a6750a2f3b67bf21f3bb20daa2  creative-01-ladder/final/formanova-bf-ladder-15s.mp4
97ca8beb22bb52c2128ab4553d97523dcc426396154399fce223abea23f67b3c  creative-02-set/final/formanova-bf-set-15s.mp4
```
