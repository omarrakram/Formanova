# Licensing and provenance

Every element in both advertisements is listed below with its origin and the basis for its use in paid advertising. The file-level inventory, with SHA-256 checksums, is in [asset-manifest.csv](asset-manifest.csv).

## Summary

| Element | Origin | Basis for use |
|---|---|---|
| Product photographs | Formanova's public storefront (Shopify CDN), original files | Formanova's own imagery, used only to advertise Formanova's own products |
| Wordmark | Formanova storefront header (transparent PNG) | Formanova's own brand mark, unaltered |
| Typefaces | Google Fonts repository (unmodified) | SIL Open Font License 1.1 |
| Music and sound design | Created for this project by code in `Content/Production/scripts/synth-score.mjs` | Original work; no third-party material |
| Voiceover | None | — |
| Stock footage or generated video | None | — |
| Software | Remotion, FFmpeg, React, Node.js | See the software notes below |

## Product photography and brand marks

- **Ownership.** All product photographs and the "FormaNova" wordmark are Formanova's property. They were downloaded from the brand's own public storefront (`formanovavintage.com`, Shopify CDN) at full original resolution and are stored unaltered in `Content/Production/assets`. The source URL and checksum of each file are in the manifest.
- **Authorisation.** These files are used to advertise the same products on the brand's behalf. Whoever runs the campaign should confirm they are authorised by Formanova to use its imagery and trademarks in paid media.
- **Treatment.** Pixels are never retouched, recoloured or regenerated. The ads only crop, scale, move, mask (the arch and rounded cards) and lay type and price tags over the photographs. Grain and vignette overlays sit above the image and do not change product colours or patterns.
- **Styled interior images.** Many listings open with styled interior shots that appear to be digitally composited room scenes around the real piece. They are used as the brand published them. Every craft claim in the ads relies on the direct product photographs and the listing text.
- **Excluded images.** Bleu Blanc ginger jar listing images 5 and 6 carry a visible AI-tool watermark in the bottom-right corner. They were not used, and every other selected image was checked for marks.

## Typefaces — SIL Open Font License 1.1

| Family | Designers | Used for | Licence file |
|---|---|---|---|
| Playfair Display | Claus Eggers Sørensen | English display lines (storefront heading font) | `Content/Production/assets/fonts/OFL-PlayfairDisplay.txt` |
| EB Garamond | Georg Duffner, Octavio Pardo | Labels, captions, URL, tag names (storefront body font) | `…/OFL-EBGaramond.txt` |
| El Messiri | Mohamed Gaber, Jovanny Lemonad | Arabic text in Creative 02 | `…/OFL-ElMessiri.txt` |
| Anonymous Pro | Mark Simonson | Prices on shop tags (storefront accent font) | `…/OFL-AnonymousPro.txt` |

The OFL permits using these fonts in commercial work, including rendering them into videos for paid advertising. The fonts are kept unmodified, with their licence texts, and are not sold on their own.

## Music and sound design

- **How it was made.** Both scores and all sound effects (felt piano, string pad, bells, marimba, bass, drums, whooshes, the crystal "ting", the typewriter strike, the riser and the reverb) are synthesised from mathematical models in `Content/Production/scripts/synth-score.mjs`. **No samples, loops, presets, sample libraries, AI music services or third-party recordings were used.** The compositions (harmony, melody, rhythm and arrangement) were written for these films.
- **Masters.** `Content/Production/assets/audio/heritage-score.wav` and `product-score.wav`: 48 kHz, 24-bit stereo, loudness-normalised to −14 LUFS with true peak at or below −1.2 dBTP. Regenerate them with `npm run score`. The output is deterministic, so the same source gives the same files.
- **Rights.** The audio contains no third-party material and carries no licence, royalty or attribution obligations. It is safe for paid social advertising and will not trigger content-ID claims based on third-party catalogues. Ownership follows the agreement between Formanova and whoever commissioned this work. Copyright treatment of machine-assisted works varies by jurisdiction, so agree in writing who owns the masters.

## Software

- **Remotion** (rendering framework) is used under the Remotion License. It is free for individuals and for companies of up to three people; larger companies need a paid company licence for commercial use (see remotion.pro/license). **Confirm eligibility before using this project commercially.** The licence governs use of the software, not the finished videos.
- **FFmpeg** (bundled with Remotion) is used as a tool for encoding and muxing. Its licences place no restrictions on the output files.
- **React, TypeScript and Node.js** are open-source tools used under their respective licences.

## This repository

The repository contains proprietary brand material. **No open-source licence is granted**, and all rights are reserved by their respective owners. The repository being publicly visible does not grant any licence to its contents.
