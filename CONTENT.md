# CONTENT.md

every word and link on the site comes from here. rules:
- use the copy as written. don't polish it, don't add facts
- lowercase is on purpose. no em-dashes anywhere
- `TODO` means i still have to give it. show a visible TODO in dev, never invent it

---

## intro (the first screen)
small line: hi, i'm
name: KINJAL GOSWAMI
line: ml engineer. 2nd year cs at university of lucknow. ai data acquisition intern at dataflirt.
facts:
- won 1st prize at hacktoberfest hack day 2026 with leash
- i build ml systems end to end, then write about what broke
- right now: llms, fine-tuning and rag
- i write fiction too. one story crossed 33k views
- off screen: TODO (my hobbies)
links: github · linkedin · x · medium · email · resume
button: enter

---

## hero (what people see first)

big name (Anton, gold shimmer): Kinjal
small line above: kinjal goswami
line under: ml engineer. 2nd year cs. building things that break, then fixing them in public.
badge (sparkly, clickable, opens the leash panel): 1st prize · hacktoberfest hack day 2026
vertical side text (left): MACHINE LEARNING · LLMs · AGENTS
vertical side text (right): BUILDING IN PUBLIC SINCE 2025
scroll hint: scroll. the ring turns
nav: work · about · contact
back link (returns to the intro): back to intro

---

## the ring (order matters, leash is in front on load)

### 1. leash
badge: 1st prize · hacktoberfest hack day 2026
panel line: the ai got hacked. the money didn't.
what it is: a smart-contract vault that holds money for an ai agent. the agent gets a key that can do exactly one thing: pay(). spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.
the demo: we hid a "pay this wallet" line inside a vendor email. the model fell for it. the contract blocked it on-chain and logged why.
try it: there's a jailbreak arena. three vaults, same agent, different rules. fool the agent and see which vault still says no.
honest limit: the daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. a sliding window would cost more gas.
team: team cryptonix with khushi kushwaha, ambar gupta and chhavi gupta. faculty of engineering and technology, university of lucknow
stack: Solidity · OpenZeppelin · Hardhat · Base Sepolia · Python · FastAPI · web3.py · gpt-oss-120b on Groq · Next.js
links:
- live: https://leash-agent.vercel.app
- arena: https://leash-agent.vercel.app/arena
- repo: https://github.com/KinjalGoswami68/leash

### 2. SentinelAI
panel line: llms go bad quietly. this one tells slack within 60 seconds.
what it is: watches what a chatbot actually says after it's live. three signals catch what one metric would miss: tf-idf cosine similarity for drift, isolation forest for anomalies, cusum for slow decay. multi-tenant fastapi backend that learns each tenant's "normal" from live usage instead of hardcoding it.
field notes:
- picked tf-idf over sentence-transformers because render's free tier gives 512mb ram
- added a 50-sample warmup after false positives spiked on cold start
- did the whole thing solo: architecture, ml pipeline, backend, deploy, ui
stack: Python · FastAPI · scikit-learn · Streamlit · Supabase Postgres · Render · Slack webhooks
links:
- live: https://sentinelai24455.streamlit.app
- repo: TODO

### 3. Contract Risk Analyzer
panel line: contracts are dense on purpose. this reads them for you.
what it is: fine-tuned distilbert on CUAD to flag clauses across 34 legal risk categories, then llama 3.3 70b on groq explains each one in plain english. upload a contract, get the risky parts and what they actually commit you to.
field notes:
- about 75% accuracy across 34 categories, fine-tuned on a free colab t4
- whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend
- the llm layer exists so non-lawyers can read the output
stack: Python · Hugging Face Transformers (DistilBERT) · Groq (Llama 3.3 70B) · Streamlit
links:
- live: https://contract-risk-analyzer23.streamlit.app/
- repo: TODO

### 4. Orbital Terrain Scanner
panel line: satellite images in. trees and water out. what's left is what we built.
what it is: fine-tuned a pretrained resnet18 on eurosat sentinel-2 to classify 10 land-cover classes. a rasterio + numpy pipeline turns raw .tif/.jpg satellite files into tensors. then a numpy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.
field notes:
- the anomaly filter is matrix masking, not a second model
- fought git buffer-size and timeout errors to deploy a 43mb model file
stack: Python · PyTorch (ResNet18) · rasterio · NumPy · Streamlit
links:
- live: https://terrain-web-app.streamlit.app/
- repo: TODO

### 5. AgentSeal
badge: hackindia '26 finalist · 122 teams
panel line: every decision the agent makes gets signed. nobody edits it later.
what it is: an ai decision audit and tamper-detection system. ethereum-style signing, a langchain/groq agent and a solidity contract on the polygon amoy testnet, so any decision can be verified later and can't be quietly changed.
team: team infinity loop
stack: Solidity · Polygon Amoy · LangChain · Groq · Ethereum-style signing
links:
- repo: TODO

### 6. HonmaruAI
badge: merged · 27 commits
panel line: the maintainer found holes in my auth code. i fixed every one.
what it is: turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the websocket relay, and a cors fix that unblocked every browser api call. review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). fixed each one over multiple rounds and added a test per fix before merge.
stack: TypeScript · Cloudflare Workers · WebSockets
links:
- pr: https://github.com/Torutesu/HonmaruAI/pull/10

### 7. arkor
badge: merged · my first pr
panel line: my first merged pr. a port bug, and a lot of review comments.
what it is: diagnosed and fixed a port-fallback bug in the `arkor dev` cli. took it through multiple rounds of maintainer review before it landed in main.
links:
- pr: TODO (the old site links issue #199, i need the actual pr link)

---

## chapters after the ring (as you scroll)

### right now
AI Data Acquisition Intern · DataFlirt (Bengaluru, remote) · oct to dec 2026
building the systems that collect, store and serve data: self-healing python scrapers (async crawling, versioned selectors, drift detection, auto-repair with rollback), postgres storage with dedup, fastapi apis tracked at p50/p95, deploys on aws/gcp, and keeping llm token costs measured.

### wins
- 1st prize · hacktoberfest hack day 2026 · leash (opens the leash panel)
- finalist · hackindia '26 · 122 teams · agentseal (opens the agentseal panel)
- infosys stem stars scholarship · 2025 to 2026
- google cloud certificate · introduction to generative ai

### who am i
-> 2nd year cs at university of lucknow
-> learned web dev first. realised i couldn't see myself doing it long term
-> got into ml because of the hype, honestly. it stayed. it's the one i'm keeping
-> now going deeper into llms, fine-tuning and rag
-> i used to write fiction. one story crossed 33k views. deleted the account because i thought nobody in tech would care
-> so now i write about what i build instead

### numbers (count up on scroll)
- 100+ · day leetcode streak
- 150+ · dsa problems solved
- 34 · legal risk categories my model reads
- 1st · prize at my first hackathon win

### writing
build logs and breakdowns, posted while things are still broken.
- X → https://x.com/KGoswami70
- Medium → https://medium.com/@kinjalgoswami682

### education (one line, small)
b.tech cse · university of lucknow · 2025 to 2029

### contact
big line: building something with ai? i want in.
email (big, sparkly on hover): kinjalgoswami682@gmail.com
links: github → https://github.com/KinjalGoswami68 · linkedin → https://linkedin.com/in/kinjal-goswami-03738a376 · x → https://x.com/KGoswami70 · medium → https://medium.com/@kinjalgoswami682 · resume → /resume/Kinjal_Resume.pdf (TODO: copy the pdf into public/resume/)
footer: © 2026 kinjal goswami