Add official game icons

Place official high-resolution images for each game in the `public/game-icons/` directory.

Required filenames (used by the app):

- `public/game-icons/bgmi.png`  — Battlegrounds Mobile India official image (recommended 1200×800)
- `public/game-icons/freefire.png` — Free Fire official image (recommended 1200×800)
- `public/game-icons/shadowfight.png` — Shadow Fight 4 official image (recommended 1200×800)

Guidelines:

- Use PNG or JPG files. PNG preferred for transparency.
- Crop/resize to a 3:2 aspect ratio for best fit (object-cover is used).
- Keep file sizes reasonable (≤ 400KB) to speed up PDF generation.

If you prefer to use external image URLs, update `src/types/registration.ts` and set the `image` field to the external URL for each game.
