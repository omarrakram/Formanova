# Content

Everything Formanova publishes, together with the source and documentation needed to reproduce it.

```
Content/
├── Brand/         Identity: guidelines and master brand assets
├── Ads/           Paid advertising, one folder per campaign
└── Production/    Video source (Remotion), score generator and render pipeline
```

## Conventions

- **Campaign folders** are named `YYYY-MM-short-name`, for example `2026-10-sales-launch`.
- **Creative folders** inside a campaign are named `creative-NN-short-name`. Each contains:
  - `final/`: the deliverable files only, named `formanova-<short-name>-<duration>.mp4`
  - `cover.jpg`: a representative frame taken from the final file
  - `contact-sheet.jpg`: evenly spaced frames taken from the final file
  - `script.md` and `storyboard.md`
- **Every campaign** carries `README.md`, `strategy.md`, `ad-copy.md`, `licensing.md`, `asset-manifest.csv` and `deliverables.json`.
- **File names** are lowercase kebab-case. Original source files (such as storefront photographs) keep their original names after a numeric prefix, for provenance.
- **Originals stay original.** Brand and product files are stored unaltered. Crops, motion and type are applied at render time, never baked into copies.
- **Claims need evidence.** Any product, price, delivery or heritage claim must trace to a listing, a site page or a brand statement, and is recorded in the campaign's `ad-copy.md`.

## Adding a campaign

1. Create `Ads/YYYY-MM-name/`, copying the structure of the most recent campaign.
2. Add the compositions under `Production/src/creatives/<name>/` and register them in `Production/src/Root.tsx`.
3. Declare the deliverables and their technical spec in the campaign's `deliverables.json`.
4. Render with `npm run render`, then write the manifest (`npm run manifest`) and run `npm run verify`.
5. Open a pull request. CI re-validates every deliverable, required document and checksum.

## Adding other kinds of content

Create a new top-level folder only when its first real asset exists, for example `Photography/`, `Website/` or `Social/`. Give it a `README.md` explaining its structure. If it produces checkable deliverables, give it a declaration file that the validator can read.
