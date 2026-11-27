# Licensing and provenance

Every element in the eight 40% weekend films, with its origin and the basis for using it in paid advertising. The file-level inventory, with SHA-256 checksums, is in [asset-manifest.csv](asset-manifest.csv).

| Element | Origin | Basis for use |
|---|---|---|
| Product photographs | Formanova's public storefront (Shopify CDN), original files | Formanova's own imagery, advertising Formanova's own products |
| Sold-out photographs | The same storefront listings, now sold out | Formanova's own imagery, shown only as sold out |
| Wordmark | Formanova storefront header (transparent PNG) | Formanova's own brand mark, unaltered |
| Typefaces | Google Fonts repository (unmodified) | SIL Open Font License 1.1 |
| Music and sound design | Created for these films by `Content/Production/scripts/synth-score.mjs` | Original work; no third-party material |
| Clock | Drawn in code (SVG) | Original work |
| Offer terms | Brand owner, 27 November 2026 | Formanova's own promotion |
| Voiceover, stock footage, generated video | None | — |

## Photography

Photographs are stored unaltered in `Content/Production/assets/products/` and are never retouched, recoloured or regenerated. The films crop, scale and move them, place labels on a strip above each photograph and prices on panels below it; the only marks drawn over a photograph are the SOLD OUT stamps on pieces the recorded check shows as sold out. The Canton cachepot photograph is the storefront's own edited listing image and is used as published.

## Music

Eight 120 BPM scores, one per film, generated from each film's variant file: darbuka, marimba and bass in D, A, G or C minor or the Hijaz mode on E, or felt piano and strings in F or D major, each resolving to its major tonic on the end card; the clock films tick on every beat. Every sound is synthesised; **no samples, loops, sample libraries, AI music services or recordings were used**. Masters are `w40-*-score.wav` in `Content/Production/assets/audio/` (48 kHz, 24-bit, −14 LUFS, true peak at or below −1.2 dBTP).

## Typefaces

El Messiri (Arabic), Playfair Display ("40%", headlines), EB Garamond (labels, names, CTA) and Anonymous Pro (prices), all under the SIL Open Font License 1.1; licence texts are in `Content/Production/assets/fonts/`.

## This repository

It contains proprietary brand material. No open-source licence is granted.
