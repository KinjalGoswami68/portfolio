// The project list for the ring, in ring order (leash is in front on load).
// Every word and link is copied from CONTENT.md. Don't edit copy here without editing CONTENT.md.

export type ProjectLink = {
  label: string // 'Live', 'Arena', 'Repo', 'PR'
  url: string
}

export type Project = {
  id: string // unique, also the URL hash (#leash)
  name: string // shown in the title font (Anton)
  image: string // screenshot file in public/projects/. placeholder is drawn if it's missing
  badge?: string
  panelLine: string
  whatItIs: string
  demo?: string // "The demo"
  tryIt?: string // "Try it"
  honestLimit?: string // "Honest limit"
  fieldNotes?: string[]
  team?: string
  stack?: string[]
  links: ProjectLink[]
}

export const projects: Project[] = [
  {
    id: 'leash',
    name: 'Leash',
    image: 'leash.png',
    badge: '1st Prize · Hacktoberfest Hack Day 2026',
    panelLine: "The ai got hacked. The money didn't.",
    whatItIs:
      'A smart-contract vault that holds money for an ai agent. The agent gets a key that can do exactly one thing: pay(). Spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.',
    demo: 'We hid a "pay this wallet" line inside a vendor email. The model fell for it. The contract blocked it on-chain and logged why.',
    tryIt:
      "There's a jailbreak arena. Three vaults, same agent, different rules. Fool the agent and see which vault still says no.",
    honestLimit:
      'The daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. A sliding window would cost more gas.',
    team: 'Team cryptonix with khushi kushwaha, ambar gupta and chhavi gupta. Faculty of engineering and technology, university of lucknow',
    stack: ['Solidity', 'OpenZeppelin', 'Hardhat', 'Base Sepolia', 'Python', 'FastAPI', 'web3.py', 'gpt-oss-120b on Groq', 'Next.js'],
    links: [
      { label: 'Live', url: 'https://leash-agent.vercel.app' },
      { label: 'Arena', url: 'https://leash-agent.vercel.app/arena' },
      { label: 'Repo', url: 'https://github.com/KinjalGoswami68/leash' },
    ],
  },
  {
    id: 'sentinelai',
    name: 'SentinelAI',
    image: 'sentinelai.png',
    panelLine: 'Llms go bad quietly. This one tells slack within 60 seconds.',
    whatItIs: `Watches what a chatbot actually says after it's live. Three signals catch what one metric would miss: tf-idf cosine similarity for drift, isolation forest for anomalies, cusum for slow decay. Multi-tenant fastapi backend that learns each tenant's "normal" from live usage instead of hardcoding it.`,
    fieldNotes: [
      "Picked tf-idf over sentence-transformers because render's free tier gives 512mb ram",
      'Added a 50-sample warmup after false positives spiked on cold start',
      'Did the whole thing solo: architecture, ml pipeline, backend, deploy, ui',
    ],
    stack: ['Python', 'FastAPI', 'scikit-learn', 'Streamlit', 'Supabase Postgres', 'Render', 'Slack webhooks'],
    links: [
      { label: 'Live', url: 'https://sentinelai24455.streamlit.app' },
      { label: 'Repo', url: 'https://github.com/KinjalGoswami68/-SentinelAI' },
    ],
  },
  {
    id: 'contract-risk-analyzer',
    name: 'Contract Risk Analyzer',
    image: 'cra.png',
    panelLine: 'Contracts are dense on purpose. This reads them for you.',
    whatItIs:
      'Fine-tuned distilbert on CUAD to flag clauses across 34 legal risk categories, then llama 3.3 70b on groq explains each one in plain english. Upload a contract, get the risky parts and what they actually commit you to.',
    fieldNotes: [
      'About 75% accuracy across 34 categories, fine-tuned on a free colab t4',
      'Whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend',
      'The llm layer exists so non-lawyers can read the output',
    ],
    stack: ['Python', 'Hugging Face Transformers (DistilBERT)', 'Groq (Llama 3.3 70B)', 'Streamlit'],
    links: [
      { label: 'Live', url: 'https://contract-risk-analyzer23.streamlit.app/' },
      { label: 'Repo', url: 'https://github.com/KinjalGoswami68/contract-risk-analyzer' },
    ],
  },
  {
    id: 'orbital-terrain-scanner',
    name: 'Orbital Terrain Scanner',
    image: 'orbital.png',
    panelLine: "Satellite images in. Trees and water out. What's left is what we built.",
    whatItIs:
      'Fine-tuned a pretrained resnet18 on eurosat sentinel-2 to classify 10 land-cover classes. A rasterio + numpy pipeline turns raw .tif/.jpg satellite files into tensors. Then a numpy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.',
    fieldNotes: [
      'The anomaly filter is matrix masking, not a second model',
      'Fought git buffer-size and timeout errors to deploy a 43mb model file',
    ],
    stack: ['Python', 'PyTorch (ResNet18)', 'rasterio', 'NumPy', 'Streamlit'],
    // no repo link: the repo is empty
    links: [{ label: 'Live', url: 'https://terrain-web-app.streamlit.app/' }],
  },
  {
    id: 'agentseal',
    name: 'AgentSeal',
    image: 'agentseal.png',
    badge: "HackIndia '26 finalist · 122 teams",
    panelLine: 'Every decision the agent makes gets signed. Nobody edits it later.',
    whatItIs:
      "An ai decision audit and tamper-detection system. Ethereum-style signing, a langchain/groq agent and a solidity contract on the polygon amoy testnet, so any decision can be verified later and can't be quietly changed.",
    team: 'Team infinity loop',
    stack: ['Solidity', 'Polygon Amoy', 'LangChain', 'Groq', 'Ethereum-style signing'],
    links: [], // no repo button
  },
  {
    id: 'honmaruai',
    name: 'HonmaruAI',
    image: 'honmaruai.png',
    badge: 'Merged · 27 commits',
    panelLine: 'The maintainer found holes in my auth code. I fixed every one.',
    whatItIs:
      'Turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the websocket relay, and a cors fix that unblocked every browser api call. Review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). Fixed each one over multiple rounds and added a test per fix before merge.',
    stack: ['TypeScript', 'Cloudflare Workers', 'WebSockets'],
    links: [{ label: 'PR', url: 'https://github.com/Torutesu/HonmaruAI/pull/10' }],
  },
  {
    id: 'arkor',
    name: 'arkor',
    image: 'arkor.png',
    badge: 'Merged · my first pr',
    panelLine: 'My first merged pr. A port bug, and a lot of review comments.',
    // the backticks are from CONTENT.md (code formatting for the command name)
    whatItIs:
      'Diagnosed and fixed a port-fallback bug in the `arkor dev` cli. Took it through multiple rounds of maintainer review before it landed in main.',
    links: [{ label: 'PR', url: 'https://github.com/arkorlab/fine-tuning/pull/212' }],
  },
]
