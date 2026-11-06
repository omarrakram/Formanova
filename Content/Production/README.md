# Production

The source for every Formanova video. It is built with [Remotion](https://www.remotion.dev) (React and TypeScript) and includes a zero-dependency score synthesiser and a render pipeline that writes finished, spec-checked MP4s straight into the campaign folders.

```
Production/
├── src/
│   ├── Root.tsx                    Composition registry (1080×1920, 30 fps, 450 frames)
│   ├── brand/                      Design tokens (colour, type, safe zones) and font loading
│   ├── components/                 Photo, Arch, Logo, PriceTag, CollectionChip, grain, safe-zone guide
│   ├── creatives/
│   │   ├── bf-ladder/              Black Friday 01 · The Ladder   (BlackFridayLadder.tsx + timeline.json)
│   │   ├── bf-set/                 Black Friday 02 · The 40% Set  (BlackFridaySet.tsx + timeline.json)
│   │   ├── heritage/               October 01 · One Piece With a Past  (Heritage.tsx + timeline.json)
│   │   └── product/                October 02 · Not Your Ordinary Decor (ProductAd.tsx + timeline.json)
│   ├── data/
│   │   ├── products.json           Product catalogue: titles, URLs, images, verified claims
│   │   └── campaigns/<id>.json     Per campaign: creatives, fonts, scores, sale terms, recorded prices and stock
│   └── lib/                        Animation, product, pricing and sale-maths helpers
├── scripts/
│   ├── synth-score.mjs             Original music and sound design (deterministic)
│   ├── render.mjs                  Render, mux and trim to exactly 15.000 s
│   ├── build-manifest.mjs          Writes each campaign's asset-manifest.csv
│   ├── check-availability.mjs      Checks a campaign's products against the live store
│   └── lib/campaigns.mjs           Shared campaign helpers
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

Remotion Studio lists the films under **Black-Friday-2026-11** and **Sales-Launch-2026-10**. Set the `showSafeZones` prop to `true` to overlay the Reels interface zones.

## Rebuild everything

```bash
npm run build
```

This runs, in order:

| Step | Command | What it does |
|---|---|---|
| 1 | `npm run score` | Synthesises every score in `assets/audio/` from the creative timelines (about 90 s). The same source always produces identical files. Use `npm run score -- bf-ladder` for one. |
| 2 | `npm run render` | Renders each composition muted (H.264 High, CRF 17, x264 preset `slow`, yuv420p, BT.709). The bundled FFmpeg then adds the score as AAC-LC 320 kb/s, trims to exactly 15.000 s and enables `faststart`. The video stream is copied, never re-encoded. |
| 3 | `npm run manifest` | Rewrites each campaign's `asset-manifest.csv` from the creative sources and the campaign's stock snapshot, verifies every checksum and reports unused photographs. |
| 4 | `npm run verify` | Validates every deliverable against its campaign's `deliverables.json`: codec, pixel format, colour tags, resolution, frame rate, exact frame count, exact durations, audio format, size, required files and manifest checksums. |

Render one film by composition id, for example `npm run render -- BlackFridayLadder`.

Remotion normally downloads its own headless Chrome. On offline or locked-down machines, point it at a local build:

```bash
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell npm run render
```

## Stock and prices

Vintage pieces are usually one of a kind. Before launching, and daily while a campaign runs, check every product the campaign features:

```bash
npm run check:availability -- 2026-11-black-friday
```

Prices on screen come from that campaign's recorded snapshot, never from live data, so a store price change never alters a finished film by accident. When prices change, record them and re-render:

```bash
npm run check:availability -- 2026-11-black-friday --record
npm run render -- BlackFridayLadder BlackFridaySet
npm run manifest
```

Behind an HTTP proxy, prefix the check with `NODE_USE_ENV_PROXY=1`.

## Making a variant

- **Swap a product.** Vendor the photograph into `assets/products/<handle>/`, add it to `src/data/products.json` with its SHA-256, reference it in the creative with `getImage("<id>", <listing position>)`, and record its price with `check:availability -- <campaign> --record`. Names and collection chips come from the catalogue; prices come from the campaign snapshot.
- **Change the sale.** Tiers, dates and labels live in `src/data/campaigns/2026-11-black-friday.json`; percentages and savings on screen are computed from it (`src/lib/sale.ts`).
- **Change copy.** Strings live in the creative's `.tsx` file next to the scene that shows them.
- **Change timing.** Edit the creative's `timeline.json`, then re-run `npm run score` so the music still lands on the cuts.

## Checks

```bash
npm run lint        # ESLint (Remotion rules) + TypeScript
npm run typecheck   # TypeScript only
```

## Licensing

Remotion is free for individuals and companies of up to three people; larger companies need a company licence. Each campaign's `licensing.md` holds its complete rights record.
