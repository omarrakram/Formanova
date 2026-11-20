# Buy 1 Get 1 Free weekend · 20–22 November 2026

**Friday 20 November, 7:30 PM → Sunday 22 November at midnight** · Buy any two pieces and **the lower-priced one is free**, applied automatically at checkout, on every piece, with no code.

Three 15-second vertical films for Instagram and Facebook Reels and Stories, one for each day of the offer.

<table>
<tr>
<td align="center" width="33%" valign="top">
<a href="creative-01-tonight/final/formanova-bogo-tonight-15s.mp4"><img src="creative-01-tonight/cover.jpg" width="220" alt="Film 01: a giant gold 1+1 with the Arabic line buy a piece and the second is a gift, over a white buy card and a gold gift card"></a>
<br><b>01 · 1+1, Tonight</b>
<br><sub>Friday launch · Egyptian Arabic</sub>
<br><a href="creative-01-tonight/final/formanova-bogo-tonight-15s.mp4">MP4</a> · <a href="creative-01-tonight/script.md">Script</a> · <a href="creative-01-tonight/storyboard.md">Storyboard</a>
</td>
<td align="center" width="33%" valign="top">
<a href="creative-02-pair/final/formanova-bogo-pair-15s.mp4"><img src="creative-02-pair/cover.jpg" width="220" alt="Film 02: Two pieces. One price. over the gold-plated jardinère and the antique French spelter statue in gold arches, with BUY and FREE labels"></a>
<br><b>02 · Two Pieces, One Price</b>
<br><sub>Saturday · English</sub>
<br><a href="creative-02-pair/final/formanova-bogo-pair-15s.mp4">MP4</a> · <a href="creative-02-pair/script.md">Script</a> · <a href="creative-02-pair/storyboard.md">Storyboard</a>
</td>
<td align="center" width="33%" valign="top">
<a href="creative-03-last-day/final/formanova-bogo-last-day-15s.mp4"><img src="creative-03-last-day/cover.jpg" width="220" alt="Film 03: the jardinère to buy and the Sèvres candlesticks as the gift, under the Arabic rule choose any two pieces, the lower-priced is a gift"></a>
<br><b>03 · Last Day</b>
<br><sub>Sunday · Egyptian Arabic</sub>
<br><a href="creative-03-last-day/final/formanova-bogo-last-day-15s.mp4">MP4</a> · <a href="creative-03-last-day/script.md">Script</a> · <a href="creative-03-last-day/storyboard.md">Storyboard</a>
</td>
</tr>
</table>

## In this folder

| File | Contents |
|---|---|
| [strategy.md](strategy.md) | How the offer works, the nine pairs, three hypotheses, the 52-hour launch plan, risks and metrics |
| [ad-copy.md](ad-copy.md) | Ready-to-paste Meta copy and Instagram captions for each day, UTM URLs, on-screen text, claims and evidence |
| [licensing.md](licensing.md) | Rights and provenance for photography, wordmark, fonts and music |
| [asset-manifest.csv](asset-manifest.csv) | Every asset used, with SHA-256, source, price and availability at the last check |
| [deliverables.json](deliverables.json) | The technical spec CI validates on every push |
| [qa/safe-zone-check.jpg](qa/safe-zone-check.jpg) | Key frames of all three films under the Reels interface overlay |

## Before 7:30 PM on Friday

1. **Create and test the discount.** In Shopify, create an automatic **Buy X get Y** discount: customers buy at least 1 item from all products and get 1 item from all products **free**, active from Fri 20 Nov, 7:30 PM to Sun 22 Nov, 11:59 PM. Test a cart with two pieces of different prices and confirm the **lower-priced** one is free. Decide whether a four-piece order gets two free pieces ("Maximum number of uses per order"); the films promise only one free piece for every two.
2. **Re-check stock.** Run `cd Content/Production && npm run check:availability -- 2026-11-bogo-weekend` (behind a proxy, prefix it with `NODE_USE_ENV_PROXY=1`). Repeat on Saturday and Sunday mornings.
3. **Schedule by day.** Film 01 runs Friday from 7:30 PM until midnight (it says "tonight"). Film 02 runs Saturday and may continue on Sunday. Film 03 runs Sunday only (it says "today"). Every ad stops at midnight on Sunday. Copy and UTM URLs are in [ad-copy.md](ad-copy.md).
4. **Pause other offer ads.** The October films show full prices; the Black Friday sale has ended.

## Deliverables

| | 01 · 1+1, Tonight | 02 · Two Pieces, One Price | 03 · Last Day |
|---|---|---|---|
| File | `formanova-bogo-tonight-15s.mp4` | `formanova-bogo-pair-15s.mp4` | `formanova-bogo-last-day-15s.mp4` |
| Video | H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps | H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps | H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps |
| Length | 450 frames; container, video and audio exactly 15.000 s | 450 frames; container, video and audio exactly 15.000 s | 450 frames; container, video and audio exactly 15.000 s |
| Audio | AAC-LC 48 kHz stereo · −14.3 LUFS · −1.4 dBTP | AAC-LC 48 kHz stereo · −14.1 LUFS · −1.6 dBTP | AAC-LC 48 kHz stereo · −14.1 LUFS · −1.6 dBTP |
| Size | 5.1 MB | 5.1 MB | 5.1 MB |

## Quality assurance

| Check | Result |
|---|---|
| Spec (`npm run verify`) | All three files pass every declared check |
| Black frames · silences · static segments | None in any film (`blackdetect`, `silencedetect` at −50 dB, `freezedetect` at 0.5 s) |
| Safe zones | All copy, prices and products inside y 270–1250 px and x 80–1000 px ([QA sheet](qa/safe-zone-check.jpg)) |
| Nothing covers a product | "Buy" and "gift" labels sit on a strip above each photograph; prices sit on panels below |
| Which piece is free | Computed from the recorded prices; the films refuse to render a pair whose free piece costs more (`src/lib/bogo.ts`) |
| Prices and stock | All 10 featured pieces available at the prices shown, at 12:49 UTC and again at 13:07 UTC on 20 November |
| Reproducibility | Re-rendering with `npm run score` and `npm run render` reproduces all three files byte for byte |

**SHA-256 of the delivered files**

```
11a758a515b03a6a2bf7b2285a0773f06bd0bcabad86a90359d171187dd1175e  creative-01-tonight/final/formanova-bogo-tonight-15s.mp4
abf778671004a29dc7c7039479f56ee7c9a3be5eeaec283069e1399dd2e6a9fd  creative-02-pair/final/formanova-bogo-pair-15s.mp4
61df3739e87e6c3bb555a47f729e4970e14f97bec81c58b6bb5066a2e7f56d69  creative-03-last-day/final/formanova-bogo-last-day-15s.mp4
```
