# CONTENT.md

every word and link on the site comes from here. rules:
- use the copy as written. don't polish it, don't add facts
- proper casing: acronyms uppercase (LLM, LLMs, AI, ML, CS, API, RAG, PR, CLI), names capitalized, otherwise only the first letter of each sentence is capitalized. "HackIndia" as written, "arkor" stays lowercase, KINJAL GOSWAMI stays all caps
- no em-dashes anywhere
- `TODO` means i still have to give it. show a visible TODO in dev, never invent it

---

## intro (the first screen)
small line: Hi, I'm
name: KINJAL GOSWAMI
line 1: ML Engineer.
line 2: 2nd Year CS Student.
facts (small glowing pills):
- Won 1st Prize at Hacktoberfest Hack Day 2026
- I build ML models, AI agents
- Currently: AI Intern at DataFlirt
(the fiction line lives in the Who Am I chapter, not on the intro)
button: Wanna know more?

---

## footer bar (every view)
links: GitHub → https://github.com/KinjalGoswami68 · LinkedIn → https://linkedin.com/in/kinjal-goswami-03738a376 · X → https://x.com/KGoswami70 · Medium → https://medium.com/@kinjalgoswami682 · Email → kinjalgoswami682@gmail.com · Resume → /resume/Kinjal_Resume.pdf
resume missing (shown until the pdf is in public/resume/): TODO: copy the pdf into public/resume/
copyright (right end of the bar): © 2026 Kinjal Goswami

---

## hero (the ring view)

back link (returns to the intro): Back to intro
not shown yet:
- big name: Kinjal
- small line above: Kinjal Goswami
- line under: ML engineer. 2nd year CS. Building things that break, then fixing them in public.
- vertical side text (left): MACHINE LEARNING · LLMs · AGENTS
- vertical side text (right): BUILDING IN PUBLIC SINCE 2025
- scroll hint: Scroll. The ring turns
- nav: Work · About · Contact

---

## labels (buttons and headings in the detail card)
close button: Close
headings: What it is · The demo · What it does · How it works · In my test scenarios · Try it · Honest limit · Field notes · Stack · Tags · Team
link buttons: Live · Live demo · Arena · Repo · GitHub · Website · PR

---

## the ring (order matters, shiftlens is in front on load)

### 1. ShiftLens
badge (small, for returning visitors): Formerly SentinelAI
panel line: Your chatbot changed and nobody told you.
what it is: Chatbots don't crash when they get worse. Someone edits a prompt or swaps a model, the answers quietly change, and the team hears about it from users. ShiftLens learns what a bot's normal answers look like, and when they drift it opens one incident and an agent writes up the likely cause with the exact answers that prove it.
the demo: 82 seconds: an incident, a question to the agent, and the try without code page. The live demo needs no login.
demo video: https://shiftlens.pages.dev/demo/shiftlens-demo.mp4 (poster: public/projects/shiftlens-poster.jpg, a local copy of https://shiftlens.pages.dev/demo/poster.jpg)
video alt text: ShiftLens incident page showing an investigation note with cited answers
what it does:
- Learns what normal looks like for each bot from its own answers, and says how sure it is before it starts alerting.
- Catches drift in meaning, slow decline over time, rising refusals, and bad releases when a new prompt or model version ships.
- Groups a bad hour into one incident with at most three Slack messages, instead of one alert per answer.
- Runs an investigation agent: it compares the changed answers with normal ones, checks version changes, and writes a short note with the likely cause, a confidence, and the request ids as evidence. Any claim without evidence is dropped. When it can't tell why, it says "unknown, low confidence".
- Lets you ask the agent questions about an incident. Every claim it makes has to cite real answers.
- Checks answer quality from the first answer (refusals, off-topic or empty replies), and spot-checks a sample of answers against the source documents the bot used.
how it works:
- Each answer is embedded on CPU with bge-small-en-v1.5. For every new answer it measures the distance to its 5th nearest neighbour among the bot's normal answers.
- A bot only goes live when its alert threshold is stable, instead of after a fixed warm-up.
- Two CUSUM trackers catch slow drift and rising refusals. A version check compares answers from a new prompt or model version against the baseline.
- Math decides whether there's a problem. The LLM only writes the explanation, and can lower the confidence but never raise it.
in my test scenarios:
- One round of scripted tests. Every number is on the public scorecard.
- Named the right cause in 7 of 8 test scenarios. The miss (a topic shift it called "unknown") is on the scorecard too.
- 0 of 2 false incidents on normal traffic.
- Caught a bad prompt change after 10 answers.
- Single normal answers wrongly flagged went from 5 in 60 in the first version to 1 in 60.
try it: There's a try without code page. Paste answers from before and after a change and get the same investigation.
honest limit: It doesn't detect hallucinations in general. It catches when a bot's behaviour changes, and flags answers its source documents don't support. It's been tested on scripted scenarios and a demo bot, not yet on real production traffic.
field notes:
- Runs entirely on free tiers. Detection uses no LLM call per answer.
- I designed, built and shipped all of it: backend, detection, the agent, the web app and the landing page.
stack: Python · FastAPI · Supabase Postgres · FastEmbed (bge-small-en-v1.5, ONNX, CPU) · NumPy · Groq (gpt-oss-120b, gpt-oss-20b, qwen3.8-27b) · pydantic · Slack webhooks · Render · GitHub Actions · Cloudflare Pages · Vite · React · TypeScript · Tailwind · GSAP · uPlot · Playwright
tags: LLM monitoring · Agents · Embeddings · Anomaly detection · FastAPI · Postgres · React · TypeScript
links:
- Live demo: https://shiftlens.pages.dev/app/demo/
- GitHub: https://github.com/KinjalGoswami68/ShiftLens
- Website: https://shiftlens.pages.dev
old link: #sentinelai still opens this card

### 2. Leash
badge: 1st Prize · Hacktoberfest Hack Day 2026
panel line: The AI got hacked. The money didn't.
what it is: A smart-contract vault that holds money for an AI agent. The agent gets a key that can do exactly one thing: pay(). Spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.
the demo: We hid a "pay this wallet" line inside a vendor email. The model fell for it. The contract blocked it on-chain and logged why.
try it: There's a jailbreak arena. Three vaults, same agent, different rules. Fool the agent and see which vault still says no.
honest limit: The daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. A sliding window would cost more gas.
stack: Solidity · OpenZeppelin · Hardhat · Base Sepolia · Python · FastAPI · web3.py · gpt-oss-120b on Groq · Next.js
links:
- Live: https://leash-agent.vercel.app
- Arena: https://leash-agent.vercel.app/arena
- Repo: https://github.com/KinjalGoswami68/leash

### 3. Contract Risk Analyzer
panel line: Contracts are dense on purpose. This reads them for you.
what it is: Fine-tuned DistilBERT on CUAD to flag clauses across 34 legal risk categories, then Llama 3.3 70B on Groq explains each one in plain English. Upload a contract, get the risky parts and what they actually commit you to.
field notes:
- About 75% accuracy across 34 categories, fine-tuned on a free Colab T4
- Whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend
- The LLM layer exists so non-lawyers can read the output
stack: Python · Hugging Face Transformers (DistilBERT) · Groq (Llama 3.3 70B) · Streamlit
links:
- Live: https://contract-risk-analyzer23.streamlit.app/
- Repo: https://github.com/KinjalGoswami68/contract-risk-analyzer

### 4. Orbital Terrain Scanner
panel line: Satellite images in. Trees and water out. What's left is what we built.
what it is: Fine-tuned a pretrained ResNet18 on EuroSAT Sentinel-2 to classify 10 land-cover classes. A rasterio + NumPy pipeline turns raw .tif/.jpg satellite files into tensors. Then a NumPy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.
field notes:
- The anomaly filter is matrix masking, not a second model
- Fought Git buffer-size and timeout errors to deploy a 43MB model file
stack: Python · PyTorch (ResNet18) · rasterio · NumPy · Streamlit
links (no repo link, the repo is empty):
- Live: https://terrain-web-app.streamlit.app/

### 5. AgentSeal
badge: HackIndia '26 finalist · 122 teams
panel line: Every decision the agent makes gets signed. Nobody edits it later.
what it is: An AI decision audit and tamper-detection system. Ethereum-style signing, a LangChain/Groq agent and a Solidity contract on the Polygon Amoy testnet, so any decision can be verified later and can't be quietly changed.
stack: Solidity · Polygon Amoy · LangChain · Groq · Ethereum-style signing
links: none (no repo button)

### 6. HonmaruAI
badge: Merged · 27 commits
panel line: The maintainer found holes in my auth code. I fixed every one.
what it is: Turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the WebSocket relay, and a CORS fix that unblocked every browser API call. Review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). Fixed each one over multiple rounds and added a test per fix before merge.
stack: TypeScript · Cloudflare Workers · WebSockets
links:
- PR: https://github.com/Torutesu/HonmaruAI/pull/10

### 7. arkor
badge: Merged · my first PR
panel line: My first merged PR. A port bug, and a lot of review comments.
what it is: Diagnosed and fixed a port-fallback bug in the `arkor dev` CLI. Took it through multiple rounds of maintainer review before it landed in main.
links:
- PR: https://github.com/arkorlab/fine-tuning/pull/212

---

## chapters (below the ring, as you scroll)

### Right Now
AI Intern · DataFlirt (Bengaluru, Remote) · Oct 2026
Building the systems that collect, store and serve data: self-healing Python scrapers, Postgres storage with dedup, FastAPI APIs tracked at p50/p95, deploys on AWS/GCP, and keeping LLM token costs measured.

### Wins
- 1st Prize · Hacktoberfest Hack Day 2026 · Leash (opens the leash panel)
- Finalist · HackIndia '26 · 122 teams · AgentSeal (opens the agentseal panel)
- Infosys STEM Stars Scholarship · 2025 to 2026
- Google Cloud Certificate · Introduction to Generative AI

### Open Source
- arkor · merged PR · port-fallback fix in the arkor dev CLI → https://github.com/arkorlab/fine-tuning/pull/212
- HonmaruAI · merged PR · 27 commits · auth and real-time sync → https://github.com/Torutesu/HonmaruAI/pull/10

### Education (vertical timeline)
- 2025 to 2029 · B.Tech, Computer Science & Engineering · University of Lucknow · CGPA 7.1/10 (first year)
- 2023 to 2024 · Class XII, CBSE · Dron Public School, Meerut · 90%
- 2021 to 2022 · Class X, CBSE · Dron Public School, Meerut · 94.8%

### Who Am I (keep the arrow style)
-> 2nd year CS student at University of Lucknow
-> Learned web dev first. Realised I couldn't see myself doing it long term
-> Got into ML because of the hype, honestly. It stayed. It's the one I'm keeping
-> Now going deeper into LLMs, fine-tuning and RAG
-> I once wrote fiction. One story crossed 33K views. Deleted it because I thought nobody in tech would care
-> Off screen: skincare. A lot of it

### Numbers (count up when they scroll into view)
- 100+ · day LeetCode streak
- 150+ · DSA problems solved
- 34 · legal risk categories my model reads
- 1st · prize at Hacktoberfest Hack Day 2026

### Writing
Build logs and breakdowns, posted while things are still broken.
- X → https://x.com/KGoswami70
- Medium → https://medium.com/@kinjalgoswami682

### Contact
big line: If this looks like the kind of work you want on your team,
email (big, sparkles on hover): kinjalgoswami682@gmail.com
