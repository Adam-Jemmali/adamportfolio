# Higgsfield Prompt Pack — @madajbuilds OS Portfolio

Paste these prompts into **Higgsfield** (use the **Nano Banana Pro** image model) to generate
vector-style icons, app tiles, wallpaper, and project covers that match the dark OS-portfolio
theme. **PROMPT 1 is the main one you asked for (the Journey icons).** The rest are optional
extras for anywhere else in the UI.

> **Pro tip for usable assets:** AI generators can't produce true transparent PNGs or real SVGs.
> Generate everything on a **solid `#0b1526` background**, then remove the background (remove.bg,
> Photoroom, or any free keying tool). For real SVGs, run the cut-out PNG through an SVG tracer
> (vectorizer.ai) or redraw over it — the line-art style traces cleanly.

---

## The reusable STYLE PREFIX (prepend to any single-icon prompt)

Use this block whenever you generate icons one at a time for maximum fidelity:

```
Flat vector UI icon for a dark macOS-style developer portfolio. Minimal line art,
consistent thin strokes (2px equivalent), subtle flat gradient fill, premium glassmorphism
feel, macOS Sequoia meets GNOME icon design. Exact palette only: deep midnight navy
background #0b1526, primary cyan #4ad8ed, steel blue #3aa7ce, warm bronze #7b5946,
soft white #ffffff, muted slate #9ca3af. No photorealism, no 3D render, no drop shadows
that obscure the shape, no text, no letters, no numbers. Icon centered on a solid
#0b1526 background.
```

---

## PROMPT 1 (MAIN) — Journey window milestone icons

This replaces the 6 small icons inside the **Journey** timeline window (Education, Founder,
Hackathon ×2, Current focus, and the Journey route app icon). Generate it as one 3×2 sprite
sheet, or paste the style prefix + each individual description below for perfect single icons.

```
A 3-row by 2-column grid of six minimal flat vector icons for a dark software engineer's
career "Journey" timeline, on a solid deep midnight navy background #0b1526. Every icon
is a thin-stroke line icon with a 2px-equivalent stroke weight, a subtle flat gradient,
and a soft rounded-square glass tile behind it; all six tiles are identical in size and
style. Exact palette only: cyan #4ad8ed, steel blue #3aa7ce, warm bronze #7b5946,
soft white #ffffff, muted slate #9ca3af. No photorealism, no 3D, no text, no letters.
Reading order, top-left to bottom-right:
1) Graduation cap with a small tassel, cyan gradient stroke — "computer science degree".
2) A small rocket launching out of an open briefcase, steel blue — "founder".
3) An elegant trophy cup with two handles, warm bronze — "hackathon win".
4) The same trophy concept with a small 4-point star burst above it, bronze body with a
   cyan star — "second hackathon win".
5) An abstract neural network of connected nodes morphing into a human eye, cyan — "agentic
   AI and computer vision focus".
6) A dashed winding path leading to a location pin, cyan path with a bronze pin dot —
   "the journey route itself".
```

**Individual Journey icons** (paste `STYLE PREFIX` + the line): graduation cap / rocket-and-briefcase /
trophy / trophy with star burst / neural-network eye / dashed route with map pin.

---

## PROMPT 2 — Dock & desktop app tiles (7 icons)

Matches the existing gradient app tiles in the dock and on the desktop (Portfolio, Web,
Gallery, Contact, Skills, Journey, Games).

```
A 4-row by 2-column grid of seven rounded-square app tiles for a macOS-style dock, each
tile identical in size with a soft modern flat gradient background, subtle inner top
highlight, and a centered white minimal line glyph. Palette: deep midnight navy #0b1526,
plus these per-tile gradients: (1) deep blue to sky blue folder glyph for "Portfolio";
(2) cyan compass rose in a globe for "Web"; (3) pink to violet photo stack with a
mountain and sun for "Gallery"; (4) amber envelope glyph for "Contact"; (5) emerald
terminal prompt chevron for "Skills"; (6) violet route pin for "Journey"; (7) coral game
controller for "Games". Flat vector, minimal, 2px-equivalent strokes, no text, no letters,
no photorealism, on a solid #0b1526 background.
```

---

## PROMPT 3 — Desktop hero / wallpaper

Background for the desktop and welcome screen (big empty area is intentional — the
"@madajbuilds" title and buttons sit on top).

```
A dark premium desktop wallpaper for a developer portfolio. Deep midnight navy #0b1526
base with a soft aurora: a wide diagonal aurora glow sweeping from the top-left in cyan
#4ad8ed through steel blue #3aa7ce into a warm bronze #7b5946 toward the bottom-right.
Subtle film grain, very faint star dust, smooth long gradients, large areas of empty dark
space in the center for UI text. Minimal, elegant, no text, no logos, no icons, no
photorealism, no people.
```

---

## PROMPT 4 — Project folder covers (3 images)

Used as the visual covers inside the Finder "Work" folder (OmniContext OS, AeroGuard,
NeuroDesk). Generate each one separately with this structure.

```
Flat vector poster art, 16:9, for the portfolio project "OmniContext OS": a thin client
AI operating system that remembers context across Slack, email, and the web. A minimal
neural-network brain on a subtle chat-bubble grid, cyan #4ad8ed and steel blue #3aa7ce on
deep navy #0b1526, one warm bronze #7b5946 accent. Minimal, clean, premium developer
aesthetic, no text, no letters, no photorealism.

— Variant A: "AeroGuard": a real-time SOC decision platform — a shield with a radar
sweep and three rising alert bars, cyan and bronze on deep navy.
— Variant B: "NeuroDesk": a brain-inspired AI command center — a brain made of cubes and
nodes with an approval checkmark, cyan and steel blue on deep navy.
```

---

## Where the assets go in this project

| Asset | Folder | Notes |
|---|---|---|
| Journey milestone icons (cut out) | `public/public/icons/` | name them like the current ones: `grad.svg`, `trophy.svg`, `work.svg`, `journey.svg` — replace those files |
| Dock/desktop app tiles | `public/public/icons/` | wire them into `src/constants/index.js` (`dockApps` / `desktopApps` icon fields) |
| Wallpaper | `public/public/images/` | replace or add to `wallpapers` in `src/constants/index.js` |
| Project covers | `public/public/images/` | referenced by `locations.work.children` in `src/constants/index.js` |

The Journey window renders icons at 16×16 inside gradient dots (`src/window/Journey.jsx` +
`.journey-dot` in `src/index.css`), so keep the glyphs bold enough to read at that size and
prefer **transparent/white-stroked** versions for that spot. The dock icons render dark, so
for the dock use a black-stroked version (or keep the CSS `filter: invert(1)` already in
`.dock-icon img`).
