# All for Design

A design toolkit and the site built with it: **15 AI-agent skills**, **GSAP + Lenis** vendored
from source, and **Three.js** driving a scroll-controlled exploded view of a PC motherboard.

```bash
npm install
npm run dev      # http://localhost:5173
```

- **`/`** — *Isi Kotak*: the hardware explainer (the assignment).
- **`/lab.html`** — the GSAP + Lenis motion demo.

## The site: Isi Kotak

An Indonesian-language school assignment about computer hardware, designed as a datasheet on
newsprint (direction dealt by the `taste` skill: *the page is the object*, Besley /
Libre Franklin, newsprint + brass).

| Section | What it does |
|---|---|
| Hero | A sentence at poster scale with a motherboard photograph set **inside** the sentence |
| Bongkar | Pinned WebGL scene: a procedural motherboard that explodes into 8 parts as you scroll, with labels tracking each part in 3D |
| Komponen | All 8 components — CPU, motherboard, RAM, GPU, storage, PSU, cooler, casing — each with function, examples and the specs that matter |
| Perbandingan | RAM vs ROM, HDD vs SSD, CPU vs GPU, plus the input → proses → output → simpan flow |
| Kuis | Five questions, instant scoring, no backend |

The 3D model is **procedural** — every part is built from boxes and cylinders in
`src/scene.js`, so there are no model files to load. `scripts/smoke-scene.mjs` checks the
assembly headlessly (`npm run smoke`): 10 assertions covering travel distance, ordering,
monotonicity and that the cooler clears the CPU.

Photography in `public/img/` is studio-style generated imagery held to one palette (warm paper,
graphite, brass). Swap in real photos of your own hardware when you have them — keep the crops
4:3 and the same lighting.

## The two libraries, vendored

| | version | how it arrives | import |
|---|---|---|---|
| **GSAP** | 3.15.0 | prebuilt `dist/` + `esm/`, linked via `file:vendor/gsap` | `import { gsap } from 'gsap'` |
| **Lenis** | 1.3.27 | compiled here: `npm run build:lenis` → `vendor/lenis/dist/lenis.mjs` | `import Lenis from 'lenis'` |
| **Three.js** | 0.187 | npm | `import * as THREE from 'three'` |

GSAP plugins available: ScrollTrigger, SplitText, ScrollSmoother, Flip, Observer, Draggable,
InertiaPlugin, MotionPathPlugin, CustomEase. No CDN anywhere.

Lenis ships upstream as TypeScript only; `dist/` is generated locally with `tsdown`. Re-run
`npm run build:lenis` after editing `vendor/lenis/packages/core`.

## Structure

```
All-for-design/
├── index.html              # Isi Kotak — the hardware site
├── lab.html                # GSAP + Lenis motion demo
├── src/
│   ├── hardware.js         # scroll choreography, labels, quiz
│   ├── hardware.css
│   ├── scene.js            # procedural exploded motherboard (pure Three.js)
│   ├── main.js             # lab page
│   └── style.css
├── public/img/             # CPU, motherboard, RAM, GPU, SSD, PSU, cooler, casing
├── scripts/smoke-scene.mjs # headless checks for the 3D assembly
├── skills/                 # 4 skill packs (15 skills total)
├── vendor/gsap, vendor/lenis
├── .claude/skills/         # 15 symlinks so agents auto-discover the skills
├── archives/               # original zips (gitignored, in history at a060c5e)
└── AGENTS.md               # guidance for AI agents working here
```

## Commands

```bash
npm run dev          # vite on 0.0.0.0:5173
npm run build        # static bundle
npm run smoke        # headless checks on the 3D scene
npm run check        # smoke + build
npm run build:lenis  # rebuild Lenis from source
```

## Notes

- The JS bundle is ~680 kB because Three.js is included; it is one route, cached, and the
  scene only renders while it is on screen (IntersectionObserver).
- `prefers-reduced-motion` is honoured: the model renders pre-exploded and static, and the
  pin/scrub choreography is skipped.
- `archives/` holds the original six zips; they are gitignored and live in history at
  commit `a060c5e`.
