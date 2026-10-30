# Production

The source for every Formanova video. It is built with [Remotion](https://www.remotion.dev) (React and TypeScript) and includes a zero-dependency score synthesiser and a render pipeline that writes finished, spec-checked MP4s straight into the campaign folders.

```
Production/
├── src/
│   ├── Root.tsx                    Composition registry (1080×1920, 30 fps, 450 frames)
│   ├── brand/                      Design tokens (colour, type, safe zones) and font loading
│   ├── components/                 Photo, Arch, Logo, PriceTag, CollectionChip, grain, safe-zone guide
│   ├── creatives/
│   │   ├── heritage/               01 · One Piece With a Past  (Heritage.tsx + timeline.json)
│   │   └── product/                02 · Not Your Ordinary Decor (ProductAd.tsx + timeline.json)
│   ├── data/products.json          Featured products: titles, prices, URLs, images, verified claims
│   └── lib/                        Animation and product-data helpers
├── scripts/
│   ├── synth-score.mjs             Original music and sound design (deterministic)
│   ├── render.mjs                  Render, mux and trim to exactly 15.000 s
│   ├── build-manifest.mjs          Writes the campaign asset-manifest.csv
│   └── check-availability.mjs      Checks featured products against the live store
└── assets/                         Remotion public directory
    ├── products/<handle>/          Original storefront photographs (unaltered)
    ├── brand/                      Gold wordmark
    ├── fonts/                      OFL typefaces and their licences
    └── audio/                      Score masters (48 kHz / 24-bit WAV)
```

## Requirements

- Node.js 20.19+, 22.13+ or 24+.
- `ffprobe` on your `PATH`, for `npm run verify` only. The render pipeline uses the FFmpeg that ships with Remotion.

## Preview

```bash
npm ci
npm run studio
```

Remotion Studio opens with both compositions under **Sales-Launch-2026-10**. Set the `showSafeZones` prop to `true` to overlay the Reels interface zones.

## Rebuild everything

```bash
npm run build
```

This runs, in order:

| Step | Command | What it does |
|---|---|---|
| 1 | `npm run score` | Synthesises `assets/audio/heritage-score.wav` and `product-score.wav` from the creative timelines (about 45 s). The same source always produces identical files. |
| 2 | `npm run render` | Renders each composition muted (H.264 High, CRF 17, x264 preset `slow`, yuv420p, BT.709). The bundled FFmpeg then adds the score as AAC-LC 320 kb/s, trims to exactly 15.000 s and enables `faststart`. The video stream is copied, never re-encoded. |
| 3 | `npm run manifest` | Rewrites `../Ads/2026-10-sales-launch/asset-manifest.csv`, reading image usage from the creative source and verifying every checksum. |
| 4 | `npm run verify` | Validates each deliverable against `deliverables.json`: codec, pixel format, colour tags, resolution, frame rate, exact frame count, exact durations, audio format, size, required files and manifest checksums. |

Render one creative with `npm run render -- Heritage` or `npm run render -- ProductAd`.

Remotion normally downloads its own headless Chrome. On offline or locked-down machines, point it at a local build:

```bash
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell npm run render
```

## Making a variant

- **Swap a product or price.** Update `src/data/products.json` (vendor the image into `assets/products/<handle>/` and record its SHA-256), then point the creative at it with `getImage("<id>", <listing position>)`. Prices, titles and collection chips flow from the data file.
- **Change copy.** Strings live in the creative's `.tsx` file next to the scene that shows them.
- **Change timing.** Edit the creative's `timeline.json`, then re-run `npm run score` so the music still lands on the cuts.
- **Before launching.** Run `npm run check:availability`. Vintage pieces are often one of a kind, so re-check before every launch or budget increase. Behind an HTTP proxy, prefix it with `NODE_USE_ENV_PROXY=1`.

## Checks

```bash
npm run lint        # ESLint (Remotion rules) + TypeScript
npm run typecheck   # TypeScript only
```

## Licensing

Remotion is free for individuals and companies of up to three people; larger companies need a company licence. See [licensing.md](../Ads/2026-10-sales-launch/licensing.md) for the complete rights record.
