# 40% off everything · 27–29 November 2026

**Friday 27 November, 8 PM → Sunday 29 November, 11:59 PM** · 40% off every piece, no minimum, applied automatically at checkout, no code.

Eight 15-second vertical films: an organic teaser for Friday afternoon, then seven ads focused on urgency (one for Friday night, three for Saturday, three for Sunday), with Meta ads running from 7:30 PM on Friday to 11:59 PM on Sunday.

| # | Film | Language | Hook | Runs |
|---|---|---|---|---|
| 00 | [Teaser](creative-00-teaser/final/formanova-w40-teaser-15s.mp4) | Arabic | «الليلة الساعة 8» over a clock at 7:58 | Organic only, before 8 PM Friday |
| 01 | [Friday](creative-01-friday/final/formanova-w40-friday-15s.mp4) | Arabic | Giant **40%** «على كل القطع» | Fri 7:30 PM → 11:59 PM |
| 02 | [Saturday A](creative-02-sat-a/final/formanova-w40-sat-a-15s.mp4) | Arabic | **40%** «لحد بكرة الأحد 11:59 مساءً بس» | Sat |
| 03 | [Saturday B](creative-03-sat-b/final/formanova-w40-sat-b-15s.mp4) | English | "Already gone." four sold-out pieces | Sat |
| 04 | [Saturday C](creative-04-sat-c/final/formanova-w40-sat-c-15s.mp4) | Arabic | «وفّر لحد» **EGP 18,000** | Sat |
| 05 | [Sunday A](creative-05-sun-a/final/formanova-w40-sun-a-15s.mp4) | Arabic | «آخر يوم» over a clock at 11:58 | Sun |
| 06 | [Sunday B](creative-06-sun-b/final/formanova-w40-sun-b-15s.mp4) | English | "LAST DAY" **40%** "Ends tonight at 11:59 PM." | Sun |
| 07 | [Sunday C](creative-07-sun-c/final/formanova-w40-sun-c-15s.mp4) | Arabic | «القطع دي نفدت» four sold-out pieces | Sun |

## Meta Ads

One Sales campaign, "40% Weekend · 27–29 Nov 2026", optimised for purchases on the "Forma new" pixel, with one ad set per day so each day's films only run on their own day:

| Ad set | Schedule (Cairo) | Lifetime budget | Ads |
|---|---|---|---|
| Fri 27 Nov | 7:30 PM → 11:59 PM | EGP 500 | 01 |
| Sat 28 Nov | 00:00 → 11:59 PM | EGP 1,100 | 02, 03, 04 |
| Sun 29 Nov | 00:00 → 11:59 PM | EGP 1,400 | 05, 06, 07 |

Targeting mirrors the Black Friday campaign: Egypt, 21–65, Advantage+ audience with antiques, collectibles, vases, Bohemian and luxury interests as suggestions; 7-day click and 1-day engaged-view attribution. Copy, headlines and links are in [ad-copy.md](ad-copy.md).

## In this folder

| File | Contents |
|---|---|
| [ad-copy.md](ad-copy.md) | On-screen text, primary text, headlines and captions for all eight films; claims and evidence |
| [licensing.md](licensing.md) | Rights and provenance |
| [asset-manifest.csv](asset-manifest.csv) | Every asset used, with SHA-256, source, price and availability at the check |
| [deliverables.json](deliverables.json) | The technical spec CI validates |
| [qa/safe-zone-check.jpg](qa/safe-zone-check.jpg) | Key frames of all eight films under the Reels interface overlay |

## Deliverables and QA

All eight films are H.264 High, yuv420p, BT.709, 1080 × 1920, 30 fps, 450 frames and exactly 15.000 s, with AAC-LC 48 kHz stereo at about −14 LUFS. None has black frames, silences or static segments; all copy, prices and products sit inside the Reels safe area.

Prices were recorded from the live store at 15:27 UTC on 27 November. A film can only show a piece as sold out if that check recorded it as sold out, and it cannot show a sold-out piece at 40% off (`src/lib/weekend40.ts`).
