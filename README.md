# Paperform

A standalone interactive paper and typography studio. Runs entirely in the browser with no accounts, database, or API keys.

## Run

```sh
npm install
npm run dev -- --port 3106
```

## Features

- Four editable card templates and five coordinated palettes
- Pop-up, accordion-inspired, and gatefold-inspired CSS 3D reveals
- Text, fonts, sizes, paper patterns, and embellishments
- Opening slider, animated reveal, and view rotation
- Browser-local autosave, editable JSON backups and imports
- Share links containing the design (no server storage)
- High-resolution flat PNG postcards and center-fold printable cards
- Responsive layout, keyboard controls, reduced-motion-friendly manual playback

Folds are stylized visual previews, not a physical paper simulation. Print export is a simple center-fold card, not a cutting template. Video export, uploaded images, and arbitrary fold construction are not implemented.

## Deploy to Vercel

Use the Vite framework preset, `npm run build`, and output directory `dist`. No environment variables are required. Share links use the deployed origin automatically.

## Check

```sh
npm test
npm run build
```

MIT license.
