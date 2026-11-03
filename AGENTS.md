# AGENTS.md

Instructions for any AI agent working in this repository.

## What this repo is

A design workspace: **15 agent skills** and **2 animation libraries**, all local. Nothing
loads from a CDN. Read the relevant skill *before* writing UI code.

## Skills

Skills live under `skills/` and are symlinked into `.claude/skills/` so skill-aware
runtimes (Claude Code, Codex, OpenCode, Cursor-style agents) discover them automatically.

| Skill | Path | Load it when |
|---|---|---|
| `taste` | `skills/taste/skills/taste-skill` | Any visual design decision: type scale, spacing, colour, motion. **Default for UI work.** |
| `ui-ux-pro-max` | `skills/ui-ux-pro-max/.claude/skills/ui-ux-pro-max` | Broad UI/UX research: layout systems, component patterns, accessibility. |
| `design` / `design-system` | `skills/ui-ux-pro-max/.claude/skills/*` | Building or extending a design system, tokens, component libraries. |
| `ui-styling` | `skills/ui-ux-pro-max/.claude/skills/ui-styling` | CSS/Tailwind styling passes, responsive behaviour. |
| `brand` | `skills/ui-ux-pro-max/.claude/skills/brand` | Naming, identity, voice, logo direction. |
| `banner-design` / `slides` | `skills/ui-ux-pro-max/.claude/skills/*` | Social banners, decks, slide layouts. |
| `anatomy` | `skills/anatomy` | Isometric SVG/WebGL explanatory figures, technical diagrams, interactive explainers. |
| `ponytail` | `skills/ponytail/skills/ponytail` | Enforce minimalism: smallest change that works, no speculative abstraction. |
| `ponytail-review` / `-audit` / `-debt` / `-gain` | `skills/ponytail/skills/*` | Reviewing an existing diff for over-engineering. |

Rule of thumb: **taste** shapes the design, **ui-ux-pro-max** supplies the system,
**ponytail** cuts the code down, **anatomy** draws the figure.

## Libraries

| Package | Source | Import |
|---|---|---|
| `gsap` 3.15.0 | `vendor/gsap` (dist + esm, prebuilt) | `import { gsap } from 'gsap'` |
| `lenis` 1.3.27 | `vendor/lenis` (TypeScript, built with `tsdown`) | `import Lenis from 'lenis'` |
| `three` 0.187 | npm (`package.json`) | `import * as THREE from 'three'` |

Both are wired as `file:` dependencies in the root `package.json`. GSAP plugins
(`ScrollTrigger`, `SplitText`, `ScrollSmoother`, `Flip`, `Observer`, `Draggable`,
`MotionPathPlugin`, `CustomEase`) are all present under `vendor/gsap/esm/`.

**Never** add a CDN `<script>` for either library — import the bare specifier instead.

### Lenis is source-only

`vendor/lenis` has no committed build output upstream; `dist/` is produced locally:

```bash
npm run build:lenis     # tsdown -> vendor/lenis/dist/lenis.mjs
```

Run this after a fresh clone if `import Lenis from 'lenis'` fails to resolve.

## Commands

```bash
npm install            # links gsap + lenis, installs vite
npm run dev            # vite on 0.0.0.0:5173
npm run build          # static bundle in dist/
npm run smoke          # headless checks on the 3D assembly (no browser needed)
npm run check          # smoke + build
npm run build:lenis    # rebuild smooth scroll from source
```

## The site

`index.html` is a hardware explainer (Indonesian). Its 3D model lives in `src/scene.js` and is
pure Three.js — no DOM, no renderer — so it can be tested in Node. If you change the scene,
run `npm run smoke`; it asserts part travel, ordering and that the cooler clears the CPU.

## Conventions

- Vanilla ES modules + Vite. No framework unless a task explicitly needs one.
- Animation: GSAP timelines driven by ScrollTrigger; smooth scroll via Lenis with
  `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker` as the RAF loop.
- Always honour `prefers-reduced-motion`.
- Keep `archives/` out of commits — those are the original uploads, already in git history
  at commit `a060c5e`.
