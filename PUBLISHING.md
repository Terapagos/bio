# Publishing dat.place

The homepage source stays in this repository. Application source and reviewed
static releases live in their own repositories:

| Public URL | Repository | Published folder |
| --- | --- | --- |
| /wordle/ | Terapagos/Wordle-Solver | site/ |
| /manga/ | Terapagos/manga | site/ |
| /evomon/ | Terapagos/Evomon-Pokedex | site/ |
| /roblox/ | Terapagos/Adurite-Limited-Price-Tracker | releases/roblox/ (built public assets only) |

The Pages workflow checks out those folders, validates their asset paths, and
assembles a deployment artifact. The Roblox release is mirrored as built public assets in releases/roblox/ because its source repository is private; no source credentials are published.
Only each app's site/ directory is published; private source is excluded.

Wordle and manga are private. Configure distinct read-only SSH deploy keys on
those repositories and save their private halves as DAT_PLACE_WORDLE_KEY and
DAT_PLACE_MANGA_KEY in this repository's Actions secrets. Do not enable write
access on the deploy keys. Evomon is public and needs no key.

Set Settings > Pages > Source to GitHub Actions. The current custom domain and
HTTPS configuration stay as configured. Merge only after the app repositories
contain verified site/ releases and the read-only keys are installed. Switching
the Pages source before removing the old folders keeps the previous deployment
available until the new workflow succeeds.

After updating an app's site/ release, run the Publish dat.place from app
repositories workflow in this repository. Homepage commits publish automatically.
App source edits alone require rebuilding and committing that app's site/ first.

Local verification: node --test scripts/assemble-site.test.mjs.

