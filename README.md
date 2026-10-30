<div align="center">

<img src="Content/Brand/assets/formanova-social-card.png" alt="FormaNova gold script wordmark on black" width="560">

#### CURATED VINTAGE &amp; ANTIQUES · EST. 1973

*Bringing the past into the future.*

[formanovavintage.com](https://www.formanovavintage.com/) &nbsp;·&nbsp; [Instagram @formanova.vintage](https://www.instagram.com/formanova.vintage/)

</div>

---

Formanova is a vintage and antiques house whose story traces back to 1973. It selects pieces one by one for character rather than trend: hand-painted Bleu Blanc and Chinoiserie porcelain, Murano glass, Czech and Bohemian crystal, cloisonné, and the rare objects that give a room its presence. These are pieces made to be kept, reintroduced for modern homes across Egypt.

This repository is the brand's content studio: campaigns, brand standards and the source that produces them.

## Featured work

### October 2026 sales launch: two 15-second Reels advertisements

<table>
<tr>
<td align="center" width="50%" valign="top">
<a href="Content/Ads/2026-10-sales-launch/creative-01-heritage/final/formanova-heritage-15s.mp4"><img src="Content/Ads/2026-10-sales-launch/creative-01-heritage/cover.jpg" width="250" alt="Creative 01: a hand-painted porcelain bird with the line Every home needs one piece with a past"></a>
<h4>01 · One Piece With a Past</h4>
<sub>Emotional heritage film · English</sub>
<br><br>
<a href="Content/Ads/2026-10-sales-launch/creative-01-heritage/final/formanova-heritage-15s.mp4"><b>Watch / download MP4</b></a>
<br>
<a href="Content/Ads/2026-10-sales-launch/creative-01-heritage/script.md">Script</a> · <a href="Content/Ads/2026-10-sales-launch/creative-01-heritage/storyboard.md">Storyboard</a>
</td>
<td align="center" width="50%" valign="top">
<a href="Content/Ads/2026-10-sales-launch/creative-02-product/final/formanova-product-15s.mp4"><img src="Content/Ads/2026-10-sales-launch/creative-02-product/cover.jpg" width="250" alt="Creative 02: a Bleu Blanc ginger jar with a typed EGP 1,574.99 price tag under the Arabic line Not ordinary decor"></a>
<h4>02 · Not Your Ordinary Decor</h4>
<sub>Direct-response product film · Egyptian Arabic</sub>
<br><br>
<a href="Content/Ads/2026-10-sales-launch/creative-02-product/final/formanova-product-15s.mp4"><b>Watch / download MP4</b></a>
<br>
<a href="Content/Ads/2026-10-sales-launch/creative-02-product/script.md">Script</a> · <a href="Content/Ads/2026-10-sales-launch/creative-02-product/storyboard.md">Storyboard</a>
</td>
</tr>
</table>

Both films are 1080 × 1920, 30 fps, exactly 15.000 s (450 frames), H.264 with AAC audio. They feature only pieces that were in stock at their listed prices on 30 October 2026, and use original music composed for the brand. Read the [strategy](Content/Ads/2026-10-sales-launch/strategy.md), the ready-to-use [ad copy](Content/Ads/2026-10-sales-launch/ad-copy.md) and the [campaign overview](Content/Ads/2026-10-sales-launch/README.md).

## Repository

```
Formanova/
├── Content/
│   ├── Brand/                       Brand guidelines and master assets
│   ├── Ads/
│   │   └── 2026-10-sales-launch/    Strategy, ad copy, licensing, manifest, two creatives
│   └── Production/                  Remotion source, score generator, render pipeline
└── .github/                         Content validation (workflow and validator)
```

| Area | Start here |
|---|---|
| Brand identity, colour, type, voice, claims policy | [Content/Brand/brand-guidelines.md](Content/Brand/brand-guidelines.md) |
| Campaigns and deliverables | [Content/Ads](Content/Ads/2026-10-sales-launch/README.md) |
| How content is organised | [Content/README.md](Content/README.md) |
| Rebuilding the videos | [Content/Production/README.md](Content/Production/README.md) |

## Preview and reproduce

```bash
cd Content/Production
npm ci
npm run studio      # interactive preview of both films
```

```bash
npm run build       # regenerate the score, render both MP4s, rebuild the manifest, verify
```

Every push and pull request runs [Validate content](.github/workflows/validate-content.yml). It checks each final video against its declared specification (codec, resolution, frame rate, exact frame count and duration, audio), confirms required documents exist, verifies asset checksums, and builds the production project.

## Adding new content

Each campaign lives in its own `Content/Ads/YYYY-MM-name/` folder with its strategy, copy, licensing record, asset manifest and a `deliverables.json` that CI enforces. New kinds of work, such as photography, website or social, get their own folder under `Content/` when their first real asset arrives. See [Content/README.md](Content/README.md).

---

<sub>Brand marks and product photography © Formanova. The contents of this repository are proprietary and no licence is granted. Typefaces are used under the SIL Open Font License; see <a href="Content/Ads/2026-10-sales-launch/licensing.md">licensing</a> for the full rights record.</sub>
