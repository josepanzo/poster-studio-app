# Poster Studio App

Create stunning social media posters effortlessly — a local, browser-based editor with
customizable templates, live previews across formats (square, story, landscape), and quick
PNG exports.

Built with React 18, TypeScript, Vite 6, Tailwind CSS 4, and Vitest.

## Features

- **4 poster templates** — Hero Title, Announcement, Quote, and Image-led
- **3 output formats** — square, story, and landscape, with per-format safe areas
- **Background presets** — curated solids, gradients, and textures, plus your own uploads
  (stored locally in IndexedDB, with focal-point control and directional scrims)
- **Font pairings** — Playfair Display, Fraunces, Space Grotesk, DM Serif Display,
  Bebas Neue, and Inter
- **PNG export** — one click (or <kbd>Ctrl/Cmd</kbd>+<kbd>E</kbd>) exports every selected format
- **Local-first** — your work is auto-saved to browser storage; no account, no server

## Getting started

Requirements: Node.js `^22.22.2`, `^24.15.0`, or `>=26.0.0` and npm. (Vitest 4
and jsdom 30 no longer support Node 18/20; Node 23/25 are not supported by the
toolchain either. The built app itself runs in any modern browser — these
requirements are only needed for development, tests, and builds.)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open the URL that Vite prints (by default http://localhost:5173).

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Production build (outputs to `dist/`) |
| `npm test`        | Run the Vitest suite once             |
| `npm run test:watch` | Run Vitest in watch mode           |
| `npm run typecheck`  | Type-check with `tsc --noEmit`     |

## Project structure

```
src/
├── main.tsx              # App entry point
├── styles/               # Global CSS (Tailwind, theme, fonts)
└── app/
    ├── App.tsx           # Root layout, state wiring, export flow
    ├── components/       # Panels, renderer, pickers, overlays
    ├── state/            # Poster state model + persistence (localStorage/IndexedDB)
    ├── templates/        # Template definitions & font pairings
    ├── backgrounds/      # Background presets
    ├── hooks/            # Shared React hooks
    └── utils/            # Export, color, and schedule helpers
```

## License

Distributed under the [MIT License](./LICENSE).

Fonts are loaded from [Google Fonts](https://fonts.google.com/) under the
[SIL Open Font License](https://fonts.google.com/knowledge/about_ofl).
