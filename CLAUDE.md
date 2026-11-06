# CLAUDE.md

## who i am and how to work with me

I'm Kinjal, a self-taught AI/ML student learning 3D web dev with this project. Treat this as mentoring, not just building:

- work ONE PART (or stage) at a time, in order. stop where i say and wait for me
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
2. after each part or stage: `npm run lint`, `npm run build`, fix anything broken, commit locally ("part X: ..." / "stage N: ..."). never push or deploy unless i ask
3. ask before installing any package not listed below, and say why
4. ALL words and links come from CONTENT.md, word for word. never invent facts, links or numbers. a missing value stays a visible TODO
5. proper casing everywhere: acronyms stay uppercase (LLM, LLMs, AI, ML, CS, API, RAG, PR, CLI), names are capitalized (Leash, SentinelAI, AgentSeal, HonmaruAI), otherwise only the first letter of each sentence, label and button is capitalized. exceptions: "HackIndia" as written, "arkor" stays lowercase (the project's own name), KINJAL GOSWAMI stays all caps on the intro
6. no em-dashes anywhere on the site
7. every link must work. external links open in a new tab (rel="noopener noreferrer", hidden "(opens in new tab)" text for screen readers)
8. inspiration is yuusuke.work. recreate the TECHNIQUES only. never copy its assets, images, text, fonts or branding

## stack

- Vite + React + TypeScript (oxlint), three, @react-three/fiber, @react-three/drei, @pixiv/three-vrm (installed in part E)
- ask before adding (in the stage where it's needed): @react-three/postprocessing (stage 5, part F)
- character: a VRM file i make myself in VRoid Studio (free), at `public/models/kinjal.vrm`. animations from Mixamo (free), retargeted onto the VRM
- hosting later: GitHub Pages

## look and feel

realistic and cinematic, not cartoony. dark, rich, a little luxurious. a little magical: things that should glow actually glow.

palette (all in `src/theme.ts`, one place to change):
- near-black #0A0506 (background)
- deep maroon #3B0A12
- cherry red #9E1B32
- glowing cherry #D2042D (floor glow, highlights)
- champagne gold #E8C27A (titles, sparkle, thin frames)
- bright gold highlight (a lighter, luminous gold for the shine on titles, so gold never looks dull brown)
- soft white #F4EDEE (body text)
- muted rose grey #B9A7AB (secondary text)

fonts (all free Google Fonts, set in `src/theme.ts`):
- no calligraphy fonts anywhere
- titles and project names: Anton (bold, straight)
- body text and everything else: Inter
- titles are bright, luminous champagne gold with a subtle shimmer (and subtle drei `<Sparkles>` near them in 3D). no shimmer under prefers-reduced-motion
- project names on the 3D panels must be readable from the default camera

the world should feel real:
- the floor is a glossy dark maroon surface with soft reflections (drei MeshReflectorMaterial), a cherry glow at its center under the character, fading to black at the edges
- panels look like physical objects: thin champagne-gold frame (with a slow shimmer sweeping across it), dark backs, slight emission so screenshots read in the dark, soft reflection in the floor
- subtle fog so the ring fades into darkness
- gold dust (drei Sparkles) floating in the air, around the ring and around her
- bloom so the gold frames, floor glow and sparkles actually glow. subtle film grain + vignette
- always light enough for integrated graphics. cap the pixel ratio

## the character

a warrior girl, my style, from `kinjal.vrm`. keep the placeholder (simple feminine silhouette) for when MODEL_FILE is null.
- she stands at the center of the floor, the ring orbits her
- animations (Mixamo FBX, retargeted to the VRM) in `public/animations/`: idle.fbx (standing idle loop), walk.fbx (walking loop, root motion stripped in code), wave.fbx (a short waving loop)
- on page load: she walks in from the left edge to her spot, blends smoothly into the wave once, then blends into the idle loop forever
- she keeps playing her idle in every view, never frozen
- every 8 to 12 seconds she does a small natural action (look around, small wave or weight shift)
- when a panel is hovered, she turns her head toward it
- automatic blinking with the VRM expression manager (random gaps of 2 to 6 seconds)
- head and eyes softly follow the mouse with vrm.lookAt (small angle, natural, not creepy). paused while she's walking in
- if any fbx fails to load: fall back to the breathing pose and log which file failed
- prefers-reduced-motion: no walk-in, no wave, no random actions, she just stands in her spot with the idle

## the intro (the first screen)

- the site opens with the camera close on her, upper body framed, her spot on the right half of the screen. the ring is hidden
- the left half shows the intro from CONTENT.md: small line (big), name (bright luminous gold), line 1, line 2, facts as small glowing pills that pop in one by one with a little sparkle. no links on the intro screen
- a glowing "Wanna know more?" button at center bottom. clicking it (or pressing Enter on the keyboard, or scrolling down) smoothly pulls the camera back and up to reveal her standing in the ring. the intro fades out, the ring fades in
- a small "Back to intro" link returns to the close-up
- fully keyboard accessible. reduced-motion = instant cut instead of a camera move, no pill pop

## footer bar (every view)

- a slim bar fixed at the bottom of the screen: GitHub · LinkedIn · X · Medium · Email · Resume
- Resume points to /resume/Kinjal_Resume.pdf if that file exists in public/resume/, otherwise it shows a visible TODO
- external links open in a new tab with rel="noopener noreferrer"

## the ring view

- the ring always rotates slowly by itself. scrolling and dragging spin it faster
- the camera drifts gently with the mouse
- panels between the camera and her fade out and sink, so nothing blocks her. panel backs are dark, never blank gold

## interaction

- hover: panel lifts slightly, frame glows brighter, cursor becomes a pointer, she turns her head toward it
- clicking a panel: it flies to the front, flattens, scales up, the rest of the ring dims, gold sparkles burst around it. a detail card opens with everything from CONTENT.md for that project: name, badge, what it is, the demo / try it / honest limit (if any), field notes, stack as pills, team, and big link buttons (Repo, Live, Arena, PR), all opening in a new tab
- close with an X button, Esc, or clicking outside. the panel flies back
- each project has a URL hash (#leash) so a link can open it directly
- no banner at the top of the ring view. the prize lives on the leash card and in the Wins chapter
- keyboard: Tab can reach every project (hidden HTML buttons mirroring the panels), Enter opens

## chapters (below the ring)

- scrolling past the ring reveals the chapters from CONTENT.md one by one: Right Now, Wins, Open Source, Education, Who Am I, Numbers, Writing, Contact
- they slide in over the 3D scene, which stays alive behind them. the camera pulls back and rises as you scroll through them
- Wins items open their project panel. Education is a vertical timeline. Numbers count up when they scroll into view. the contact email sparkles on hover
- reduced motion: no sliding, no counting, no camera move

## roadmap

DONE: part A setup, part B world, part C ring, part C2 world + ring rework, part E the girl, part E2 intro + walk-in + bold fonts

BIG UPDATE (in order, lint + build + commit after each stage):
- STAGE 1: intro screen text and look (see "the intro")
- STAGE 2: footer bar (see "footer bar")
- STAGE 3: ring view fixes + PART D scroll/drag/mouse (see "the ring view" and "the character")
- STAGE 4: PART G click to open (see "interaction")
- STAGE 5: PART F magical look (ask before installing @react-three/postprocessing)
- STAGE 6: PART H chapters (see "chapters")

PART I: ship
- `npm run check-links`: a script that requests every URL in CONTENT.md and reports status. streamlit apps may show an "asleep" page, report those separately, not as broken
- mobile version (lighter scene, fewer particles, panels as a swipe list if needed), touch to enter, reduced-motion support
- compress images and the model, check performance
- GitHub Pages deploy setup (ask before pushing)
