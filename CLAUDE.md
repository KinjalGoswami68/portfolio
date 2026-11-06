# CLAUDE.md

## who i am and how to work with me

I'm Kinjal, a self-taught AI/ML student learning 3D web dev with this project. Treat this as mentoring, not just building:

- work ONE PART at a time (roadmap below). stop at the end of each part and wait for me
- before writing code for a step, explain the concept in 2 to 4 plain lines. define every new 3D term the first time you use it
- after each step, tell me what i should see on screen
- at the end of each part, give me ONE "break it on purpose" experiment
- keep components small and readable, no clever abstractions
- if something doesn't work or you haven't checked it, say so. never claim it works if you haven't seen it run

## environment

- Windows, PowerShell, VS Code, HP laptop with integrated graphics. keep the scene light (small textures, few lights, cap pixel ratio)
- any command you give me must work in PowerShell
- `npm run dev` (port may be 5174/5175, that's fine)

## hard rules

1. zero budget. only free, open-source packages and free assets
2. after each part: `npm run lint`, `npm run build`, fix anything broken, commit locally ("part X: ..."). never push or deploy unless i ask
3. ask before installing any package not listed below, and say why
4. ALL words and links come from CONTENT.md, word for word. never invent facts, links or numbers. a missing value stays a visible TODO
5. no em-dashes anywhere on the site
6. every link must work. external links open in a new tab (rel="noopener noreferrer", hidden "(opens in new tab)" text for screen readers)
7. inspiration is yuusuke.work. recreate the TECHNIQUES only. never copy its assets, images, text, fonts or branding

## stack

- Vite + React + TypeScript (oxlint), three, @react-three/fiber, @react-three/drei
- ask before adding (in the part where they're needed): @pixiv/three-vrm (part E), @react-three/postprocessing (part F)
- character: a VRM file i make myself in VRoid Studio (free), at `public/models/kinjal.vrm`. animations from Mixamo (free), retargeted onto the VRM
- hosting later: GitHub Pages

## look and feel

realistic and cinematic, not cartoony. dark, rich, a little luxurious.

palette (all in `src/theme.ts`, one place to change):
- near-black #0A0506 (background)
- deep maroon #3B0A12
- cherry red #9E1B32
- glowing cherry #D2042D (floor glow, highlights)
- champagne gold #E8C27A (calligraphy, sparkle, thin frames)
- soft white #F4EDEE (body text)
- muted rose grey #B9A7AB (secondary text)

fonts (all free Google Fonts, set in `src/theme.ts`):
- calligraphy for big titles and project names ONLY (it's unreadable small). make it switchable between: Imperial Script, MonteCarlo, Hurricane, so i can pick by looking
- one clean readable sans for everything else (e.g. Inter)
- calligraphy titles get a gold gradient with a slow sparkle/shimmer (and subtle drei `<Sparkles>` near them in 3D). no shimmer under prefers-reduced-motion

the world should feel real:
- the floor is a glossy dark maroon surface with soft reflections (drei MeshReflectorMaterial or similar), a cherry glow at its center under the character, fading to black at the edges. not a flat neon disc
- panels look like physical objects: thin champagne-gold frame, slight emission so screenshots read in the dark, soft reflection in the floor
- subtle fog so the ring fades into darkness
- slow floating dust particles in the air

## the character

a warrior girl, my style. I'm building her in VRoid Studio and exporting `kinjal.vrm`. until that file exists, keep a placeholder (a simple feminine silhouette shape is fine, not the gray capsule) and make swapping in the VRM a one-line change.
- idle: a confident warrior idle (weight shift, breathing), from Mixamo, retargeted to the VRM
- she stands at the center of the floor, the ring orbits her
- tell me exactly which Mixamo animations to download and how (FBX settings) when we reach part E

## interaction

- clicking a panel: it flies to the front, flattens, scales up, the rest of the ring dims. the detail view opens with all info from CONTENT.md (what it is, field notes, stack, team, links as big buttons)
- close with a close button, Esc, or clicking outside. the panel flies back
- each project has a URL hash (#leash) so a link can open it directly
- hover: panel lifts slightly, frame brightens, cursor becomes a pointer
- keyboard: Tab can reach every project (hidden HTML buttons mirroring the panels), Enter opens

## roadmap

DONE: part A setup, part B world, part C ring (needs the rework below)

PART C2: rework the world + ring
- new palette and fonts from "look and feel"
- realistic glossy floor with center glow, fog, dust particles
- 7 panels in CONTENT.md order (leash in front on load), gold frames, calligraphy name + panel line on placeholder textures until screenshots exist in `public/projects/` (leash.png, sentinelai.png, cra.png, orbital.png, agentseal.png, honmaruai.png, arkor.png)
- images must never stretch (crop to fit, like object-fit cover)

PART D: scroll + mouse
- scroll turns the ring, camera drifts with the mouse

PART E: the girl (ask before installing @pixiv/three-vrm)
- feminine placeholder now, VRM loader ready, Mixamo idle retargeting

PART F: cinematic look (ask before installing postprocessing)
- bloom on the glow, film grain, vignette, tuned fog

PART G: click to open
- everything in "interaction"

PART H: chapters after the ring
- as you scroll past the ring: right now, wins, who am i, numbers, writing, education, contact (from CONTENT.md)
- the 3D scene stays in the background, the camera moves for each chapter (e.g. pulls back, rises), HTML content slides in over it
- wins items open their project panel

PART I: ship
- `npm run check-links`: a script that requests every URL in CONTENT.md and reports status. streamlit apps may show an "asleep" page, report those separately, not as broken
- mobile version (lighter scene, fewer particles, panels as a swipe list if needed), reduced-motion support
- compress images and the model, check performance
- GitHub Pages deploy setup (ask before pushing)