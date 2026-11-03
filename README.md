# All for Design

A design toolkit, installed and runnable: **15 AI-agent skills** and **2 animation
libraries (GSAP + Lenis)** vendored from source, plus a demo lab that proves both compile
and run from this repo.

```bash
npm install
npm run dev      # http://localhost:5173
```

## What's inside

```
All-for-design/
├── skills/                 # agent skill packs (16.6k lines of guidance)
│   ├── anatomy/            # isometric SVG + WebGL figures (SKILL.md)
│   ├── ponytail/           # 6 skills: lazy-senior-dev, review, audit, debt, gain, help
│   ├── taste/              # taste-skill: type, spacing, colour, motion judgement
│   └── ui-ux-pro-max/      # 7 skills + CLI + component gallery + screenshots
├── vendor/
│   ├── gsap/               # GSAP 3.15.0 — dist + esm, all plugins included
│   └── lenis/              # Lenis 1.3.27 — TypeScript source, built with tsdown
├── .claude/skills/         # 15 symlinks so skill-aware agents auto-discover them
├── src/                    # demo: main.js (GSAP + Lenis), style.css
├── index.html              # demo lab page
├── archives/               # original zips (gitignored, kept out of commits)
└── AGENTS.md               # guidance for AI agents working here
```

## The two libraries

| | version | how it arrives | import |
|---|---|---|---|
| **GSAP** | 3.15.0 | prebuilt `dist/` + `esm/`, linked via `file:vendor/gsap` | `import { gsap } from 'gsap'` |
| **Lenis** | 1.3.27 | compiled here: `npm run build:lenis` → `vendor/lenis/dist/lenis.mjs` | `import Lenis from 'lenis'` |

Available GSAP plugins: ScrollTrigger, SplitText, ScrollSmoother, Flip, Observer,
Draggable, InertiaPlugin, MotionPathPlugin, CustomEase, CustomBounce, CustomWiggle and
more. No CDN, no `unpkg` links anywhere.

Lenis ships upstream as TypeScript only, so `dist/` is generated locally with `tsdown`
(the project's own build). Re-run `npm run build:lenis` after editing
`vendor/lenis/packages/core`.

## The demo page

`index.html` + `src/main.js` exercise the real integration:

- Lenis smooth scroll, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker` as the RAF loop
- SplitText per-word headline reveal inside a masked timeline
- Pinned horizontal gallery (6 cards) driven by ScrollTrigger `scrub`
- Scroll progress bar wired to Lenis' `progress`, `prefers-reduced-motion` respected

## Skills

15 skills are symlinked into `.claude/skills/` so skill-aware runtimes pick them up by
name (`taste`, `anatomy`, `ponytail`, `ui-ux-pro-max`, `brand`, `design`, `design-system`,
`ui-styling`, `banner-design`, `slides`, `ponytail-review`, `ponytail-audit`,
`ponytail-debt`, `ponytail-gain`, `ponytail-help`). Each is a directory with its own
`SKILL.md`; see [AGENTS.md](AGENTS.md) for when to load which.

## Notes

- `archives/` holds the original six zips you uploaded. They are gitignored — the content
  is fully extracted into `skills/` and `vendor/`, and the zips still exist in history at
  commit `a060c5e`.
- `node_modules/` inside `vendor/lenis` is only needed to rebuild Lenis; it is gitignored.
