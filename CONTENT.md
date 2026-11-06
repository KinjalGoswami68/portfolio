# CONTENT.md

every word and link on the site comes from here. rules:
- use the copy as written. don't polish it, don't add facts
- capitalization: the first letter of every sentence, label and button is capitalized. names like KINJAL GOSWAMI stay all caps
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
- I also wrote fiction story that crossed 33K views
button: Enter

---

## footer bar (every view)
links: GitHub → https://github.com/KinjalGoswami68 · LinkedIn → https://linkedin.com/in/kinjal-goswami-03738a376 · X → https://x.com/KGoswami70 · Medium → https://medium.com/@kinjalgoswami682 · Email → kinjalgoswami682@gmail.com · Resume → /resume/Kinjal_Resume.pdf
resume missing (shown until the pdf is in public/resume/): TODO: copy the pdf into public/resume/

---

## hero (the ring view)

badge (clickable, opens the leash panel): 1st Prize · Hacktoberfest Hack Day 2026
back link (returns to the intro): Back to intro
not shown yet:
- big name: Kinjal
- small line above: Kinjal goswami
- line under: Ml engineer. 2nd year cs. Building things that break, then fixing them in public.
- vertical side text (left): MACHINE LEARNING · LLMs · AGENTS
- vertical side text (right): BUILDING IN PUBLIC SINCE 2025
- scroll hint: Scroll. The ring turns
- nav: Work · About · Contact

---

## labels (buttons and headings in the detail card)
close button: Close
headings: What it is · The demo · Try it · Honest limit · Field notes · Stack · Team
link buttons: Live · Arena · Repo · PR

---

## the ring (order matters, leash is in front on load)

### 1. Leash
badge: 1st Prize · Hacktoberfest Hack Day 2026
panel line: The ai got hacked. The money didn't.
what it is: A smart-contract vault that holds money for an ai agent. The agent gets a key that can do exactly one thing: pay(). Spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.
the demo: We hid a "pay this wallet" line inside a vendor email. The model fell for it. The contract blocked it on-chain and logged why.
try it: There's a jailbreak arena. Three vaults, same agent, different rules. Fool the agent and see which vault still says no.
honest limit: The daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. A sliding window would cost more gas.
team: Team cryptonix with khushi kushwaha, ambar gupta and chhavi gupta. Faculty of engineering and technology, university of lucknow
stack: Solidity · OpenZeppelin · Hardhat · Base Sepolia · Python · FastAPI · web3.py · gpt-oss-120b on Groq · Next.js
links:
- Live: https://leash-agent.vercel.app
- Arena: https://leash-agent.vercel.app/arena
- Repo: https://github.com/KinjalGoswami68/leash

### 2. SentinelAI
panel line: Llms go bad quietly. This one tells slack within 60 seconds.
what it is: Watches what a chatbot actually says after it's live. Three signals catch what one metric would miss: tf-idf cosine similarity for drift, isolation forest for anomalies, cusum for slow decay. Multi-tenant fastapi backend that learns each tenant's "normal" from live usage instead of hardcoding it.
field notes:
- Picked tf-idf over sentence-transformers because render's free tier gives 512mb ram
- Added a 50-sample warmup after false positives spiked on cold start
- Did the whole thing solo: architecture, ml pipeline, backend, deploy, ui
stack: Python · FastAPI · scikit-learn · Streamlit · Supabase Postgres · Render · Slack webhooks
links:
- Live: https://sentinelai24455.streamlit.app
- Repo: https://github.com/KinjalGoswami68/-SentinelAI

### 3. Contract Risk Analyzer
panel line: Contracts are dense on purpose. This reads them for you.
what it is: Fine-tuned distilbert on CUAD to flag clauses across 34 legal risk categories, then llama 3.3 70b on groq explains each one in plain english. Upload a contract, get the risky parts and what they actually commit you to.
field notes:
- About 75% accuracy across 34 categories, fine-tuned on a free colab t4
- Whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend
- The llm layer exists so non-lawyers can read the output
stack: Python · Hugging Face Transformers (DistilBERT) · Groq (Llama 3.3 70B) · Streamlit
links:
- Live: https://contract-risk-analyzer23.streamlit.app/
- Repo: https://github.com/KinjalGoswami68/contract-risk-analyzer

### 4. Orbital Terrain Scanner
panel line: Satellite images in. Trees and water out. What's left is what we built.
what it is: Fine-tuned a pretrained resnet18 on eurosat sentinel-2 to classify 10 land-cover classes. A rasterio + numpy pipeline turns raw .tif/.jpg satellite files into tensors. Then a numpy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.
field notes:
- The anomaly filter is matrix masking, not a second model
- Fought git buffer-size and timeout errors to deploy a 43mb model file
stack: Python · PyTorch (ResNet18) · rasterio · NumPy · Streamlit
links (no repo link, the repo is empty):
- Live: https://terrain-web-app.streamlit.app/

### 5. AgentSeal
badge: HackIndia '26 finalist · 122 teams
panel line: Every decision the agent makes gets signed. Nobody edits it later.
what it is: An ai decision audit and tamper-detection system. Ethereum-style signing, a langchain/groq agent and a solidity contract on the polygon amoy testnet, so any decision can be verified later and can't be quietly changed.
team: Team infinity loop
stack: Solidity · Polygon Amoy · LangChain · Groq · Ethereum-style signing
links: none (no repo button)

### 6. HonmaruAI
badge: Merged · 27 commits
panel line: The maintainer found holes in my auth code. I fixed every one.
what it is: Turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the websocket relay, and a cors fix that unblocked every browser api call. Review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). Fixed each one over multiple rounds and added a test per fix before merge.
stack: TypeScript · Cloudflare Workers · WebSockets
links:
- PR: https://github.com/Torutesu/HonmaruAI/pull/10

### 7. arkor
badge: Merged · my first pr
panel line: My first merged pr. A port bug, and a lot of review comments.
what it is: Diagnosed and fixed a port-fallback bug in the `arkor dev` cli. Took it through multiple rounds of maintainer review before it landed in main.
links:
- PR: https://github.com/arkorlab/fine-tuning/pull/212

---

## chapters (below the ring, as you scroll)

### Right Now
AI Data Acquisition Intern · DataFlirt (Bengaluru, Remote) · Oct to Dec 2026
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
- 2025 to 2029 · B.Tech, Computer Science & Engineering · University of Lucknow · cGPA 7.1/10 (first year)
- 2023 to 2024 · Class XII, CBSE · Dron Public School, Meerut · 90%
- 2021 to 2022 · Class X, CBSE · Dron Public School, Meerut · 94.8%

### Who Am I (keep the arrow style)
-> 2nd year CS student at University of Lucknow
-> Learned web dev first. Realised I couldn't see myself doing it long term
-> Got into ML because of the hype, honestly. It stayed. It's the one I'm keeping
-> Now going deeper into LLMs, fine-tuning and RAG
-> I write fiction. One story crossed 33K views
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

---

## not shown yet
footer line: © 2026 kinjal goswami
