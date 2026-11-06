# CLAUDE.md

## who i am and how to work with me

I'm Kinjal, a self-taught AI/ML student learning 3D web dev for the first time with this project. Treat this as mentoring, not just building:

- work ONE PART at a time (parts are listed in the roadmap below). stop at the end of each part and wait for me
- before writing code for a step, explain the concept in 2 to 4 plain lines, with an analogy if it helps. define every new 3D term the first time you use it (mesh, geometry, material, camera, texture, etc.)
- after each step, tell me what i should see on screen
- at the end of each part, give me ONE small "break it on purpose" experiment (change a value, see what happens)
- keep components small and readable. i want to understand every file, so no clever abstractions
- if something doesn't work or you aren't sure, say so. never say something works if you haven't checked it

## environment

- Windows, PowerShell, VS Code, HP laptop with integrated graphics (keep the scene light)
- any command you give me must work in PowerShell
- dev server runs with `npm run dev` (it may pick port 5174 or 5175 if 5173 is busy, that's fine)

## hard rules

1. zero budget. only free, open-source packages and free assets. no paid APIs, no paid fonts, no paid models
2. after each part: run `npm run lint` and `npm run build`, fix anything broken, then commit locally with a message like "part B: the world". never push, never deploy unless i ask
3. ask before installing any package that isn't listed in the stack below, and say why it's needed
4. never invent facts about me or my projects. if text or a link is missing, put a visible `TODO` and tell me
5. the inspiration is yuusuke.work. recreate the TECHNIQUES (3D scene, ring of curved panels, scroll, overlay text), never copy its assets, images, text, fonts or branding. the result must look like mine

## stack

- Vite + React + TypeScript (already scaffolded, linter is oxlint)
- three, @react-three/fiber (R3F), @react-three/drei (already installed)
- later, ask before adding: @react-three/postprocessing (part F), gsap (only if drei can't do it)
- 3D character: a free CC0 model from Quaternius (glTF/.glb), loaded with drei `useGLTF` + `useAnimations`
- hosting later: GitHub Pages (free)

## the concept

A two-layer website:
1. back layer: a 3D scene. dark space with stars, a glowing floor, a character standing in the middle, and my projects as curved image panels floating in a ring around him. scrolling rotates the ring
2. front layer: normal HTML on top: a big title, vertical text, a nav, a torn-paper frame

colors are NOT final. put every color in one file (e.g. `src/theme.ts`) so i can change the palette in one place. start with: near-black background, a coral-red glowing floor, one cool accent (teal).

## file structure to aim for

```
src/
  App.tsx            canvas + overlay layout only
  theme.ts           all colors and sizes
  scene/             everything inside the 3D canvas
    World.tsx        stars, floor, lights, fog
    Character.tsx    capsule now, real model in part E
    ProjectRing.tsx  the ring of panels
    ProjectPanel.tsx one curved panel
  overlay/           the HTML layer
  data/projects.ts   project list (title, image, one-liner, links)
public/
  projects/          screenshots, about 800px wide
  models/            the .glb character
```

## roadmap

PART A: setup (done: project created, three/fiber/drei installed, index.css cleaned)

PART B: the world
- 4. replace the Vite starter page with a full-screen R3F `<Canvas>` and a star field
- 5. red glowing floor (a flat circle, self-lit material)
- 6. camera looking down from above at an angle, like the reference
- 7. gray capsule standing in the middle as a placeholder character
- keep OrbitControls on for debugging in this part

PART C: projects in a ring
- 8. `data/projects.ts` with my projects (list below). screenshots go in `public/projects/`. until i add them, use a plain colored placeholder texture per project with its title
- 9. one panel floating in 3D
- 10. bend it into a curve (hint: an open-ended slice of a cylinder is already curved)
- 11. all panels in a circle around the character, facing inward
- 12. ring rotates slowly by itself

PART D: scroll
- 13. scrolling rotates the ring (try drei `ScrollControls` first)
- 14. camera drifts slightly with the mouse

PART E: the real character
- 15. tell me exactly what to download from Quaternius and where to put it
- 16. swap the capsule for the model and play an idle animation
- 17. shadow on the floor

PART F: cinematic look (ask before installing postprocessing)
- 18. bloom so the floor glows
- 19. film grain + vignette
- 20. fog so far panels fade into black

PART G: HTML layer on top of the canvas
- 21. overlay layer that doesn't block the canvas
- 22. big title in a free Google font with character
- 23. vertical text columns (CSS writing-mode)
- 24. nav: projects / about / contact
- 25. torn-paper frame around the screen (free asset or SVG/CSS, ask me first)

PART H: interaction
- 26. hover a panel: it grows and glows, cursor becomes a pointer
- 27. click a panel: project detail opens (one-liner, stack, what broke, link)
- 28. about + contact sections

PART I: ship
- 29. simpler mobile version (3D is heavy on phones), plus reduced-motion support
- 30. compress images and the model, check performance
- 31. GitHub Pages deploy setup (ask me before pushing anything)
- 32. final checklist

## my projects (for the ring and detail views, verified facts only)

- **leash**: hacktoberfest winner (team project). a smart-contract vault that holds money for an ai agent. solidity + hardhat on base sepolia, python/fastapi agent running gpt-oss-120b on groq, next.js dashboard. caps, recipient allowlist and kill switch live in the contract, not the prompt. repo: https://github.com/KinjalGoswami68/leash
- **SentinelAI**: watches llm outputs and pings slack when quality drifts. fastapi, supabase postgres, tf-idf, isolation forest + cusum, slack webhooks, render. what broke: render deploy is down, tf-idf too generic. repo: TODO
- **Contract Risk Analyzer**: distilbert fine-tuned on CUAD (free colab t4), about 75% accuracy across 34 clause categories, groq llama 3.3 70b explanations, streamlit. repo: TODO
- **AgentSeal**: HackIndia '26 finalist (122 teams), team infinity loop. ai decision audit + tamper detection: ethereum-style signing, langchain/groq agent, solidity contract on polygon amoy testnet. repo: TODO
- **HonmaruAI PR #10**: merged, 27 commits. session-token auth, browser create/decide flow to the websocket relay, cors fix, fixed authorization gaps found in review. https://github.com/Torutesu/HonmaruAI/pull/10
- **arkor PR**: merged. port-fallback fix in the `arkor dev` cli. link: TODO (verify)

## me (for about/contact)

- Kinjal Goswami, ML engineer, cs student at university of lucknow, AI intern at DataFlirt
- github: https://github.com/KinjalGoswami68
- linkedin: https://linkedin.com/in/kinjal-goswami-03738a376
- x: https://x.com/KGoswami70
- medium: https://medium.com/@kinjalgoswami682
- email: kinjalgoswami682@gmail.com
- no em-dashes in any text on the site
